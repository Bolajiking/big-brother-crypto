// Verify Payment API - Verify and credit user after Paystack payment
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPayment } from '@/lib/paystack';
import { addStakes } from '@/lib/wallet';

// POST /api/payments/verify - Verify a completed payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Check if this reference was already processed
    const existingTransaction = await prisma.transaction.findUnique({
      where: { paystackRef: reference },
    });

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        data: {
          alreadyProcessed: true,
          stakesAmount: existingTransaction.stakesAmount,
        },
      });
    }

    // Verify with Paystack
    const result = await verifyPayment(reference);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    if (!result.verified) {
      return NextResponse.json(
        { success: false, error: result.error || 'Payment not verified' },
        { status: 400 }
      );
    }

    // Get user ID and stakes amount from metadata
    const userId = result.metadata?.userId;
    const stakesAmount = result.metadata?.stakesAmount;

    if (!userId || !stakesAmount) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment metadata' },
        { status: 400 }
      );
    }

    // Credit user's wallet
    const walletResult = await addStakes(
      userId,
      stakesAmount,
      'DEPOSIT',
      `Deposit of ₦${result.amount?.toLocaleString()}`,
      result.amount ? result.amount * 100 : undefined, // Store in kobo
      reference
    );

    if (!walletResult.success) {
      return NextResponse.json(
        { success: false, error: walletResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and credited',
      data: {
        stakesAmount,
        newBalance: walletResult.newBalance,
        transaction: walletResult.transaction,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

// Withdraw Stakes to Naira API
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { deductStakes } from '@/lib/wallet';
import { createTransferRecipient, initiateTransfer } from '@/lib/paystack';

// Minimum withdrawal: 100 Stakes = ₦1,000
const MIN_WITHDRAWAL_STAKES = 100;
const STAKES_TO_NAIRA_RATE = 10; // 1 Stake = ₦10

// POST /api/payments/withdraw - Request a withdrawal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, stakesAmount, bankCode, accountNumber, accountName } = body;

    // Validate required fields
    if (!userId || !stakesAmount || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate minimum withdrawal
    if (stakesAmount < MIN_WITHDRAWAL_STAKES) {
      return NextResponse.json(
        { success: false, error: `Minimum withdrawal is ${MIN_WITHDRAWAL_STAKES} Stakes` },
        { status: 400 }
      );
    }

    // Check user's balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stakesBalance: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.stakesBalance < stakesAmount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient Stakes balance' },
        { status: 400 }
      );
    }

    // Calculate Naira amount
    const nairaAmount = stakesAmount * STAKES_TO_NAIRA_RATE;

    // Create transfer recipient with Paystack
    const recipientResult = await createTransferRecipient(
      accountName,
      accountNumber,
      bankCode
    );

    if (!recipientResult.success || !recipientResult.recipientCode) {
      return NextResponse.json(
        { success: false, error: recipientResult.error || 'Failed to verify bank account' },
        { status: 400 }
      );
    }

    // Deduct stakes from user's balance first
    const deductResult = await deductStakes(
      userId,
      stakesAmount,
      'WITHDRAWAL',
      `Withdrawal of ${stakesAmount} Stakes to ${accountName}`
    );

    if (!deductResult.success) {
      return NextResponse.json(
        { success: false, error: deductResult.message },
        { status: 400 }
      );
    }

    // Initiate the transfer
    const transferResult = await initiateTransfer(
      nairaAmount,
      recipientResult.recipientCode,
      `Star Factor withdrawal - ${stakesAmount} Stakes`
    );

    if (!transferResult.success) {
      // Refund the stakes if transfer fails
      // Note: In production, you'd want more robust error handling
      await prisma.user.update({
        where: { id: userId },
        data: { stakesBalance: { increment: stakesAmount } },
      });

      // Record the failed transaction
      await prisma.transaction.create({
        data: {
          userId,
          type: 'WITHDRAWAL',
          stakesAmount: stakesAmount, // Refund
          nairaAmount: nairaAmount * 100, // In kobo
          description: `Refund: Withdrawal failed - ${transferResult.error}`,
        },
      });

      return NextResponse.json(
        { success: false, error: transferResult.error || 'Transfer failed' },
        { status: 500 }
      );
    }

    // Update the transaction with transfer reference
    if (deductResult.transaction) {
      await prisma.transaction.update({
        where: { id: deductResult.transaction.id },
        data: {
          paystackRef: transferResult.reference,
          nairaAmount: nairaAmount * 100, // Store in kobo
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Withdrawal initiated successfully',
      data: {
        stakesAmount,
        nairaAmount,
        transferCode: transferResult.transferCode,
        reference: transferResult.reference,
        newBalance: deductResult.newBalance,
      },
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}

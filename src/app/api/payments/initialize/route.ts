// Initialize Payment API - Start a Paystack transaction
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { initializePayment } from '@/lib/paystack';
import { calculateStakesForDeposit } from '@/lib/wallet';

// POST /api/payments/initialize - Start a payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amountInNaira } = body;

    if (!userId || !amountInNaira) {
      return NextResponse.json(
        { success: false, error: 'User ID and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount (minimum ₦2,000)
    if (amountInNaira < 2000) {
      return NextResponse.json(
        { success: false, error: 'Minimum deposit is ₦2,000' },
        { status: 400 }
      );
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Use email or generate one from username
    const email = user.email || `${user.username}@starfactor.ng`;

    // Calculate stakes to receive
    const { stakes, bonus, total } = calculateStakesForDeposit(amountInNaira);

    // Build callback URL
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback`;

    // Initialize Paystack payment
    const result = await initializePayment(
      email,
      amountInNaira,
      { userId, stakesAmount: total },
      callbackUrl
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: result.authorizationUrl,
        reference: result.reference,
        amountInNaira,
        stakesReceived: {
          base: stakes,
          bonus: Math.round(stakes * (bonus / 100)),
          total,
        },
      },
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}

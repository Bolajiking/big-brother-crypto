// Claim Daily Login Bonus API
import { NextRequest, NextResponse } from 'next/server';
import { claimDailyLogin } from '@/lib/wallet';

// POST /api/wallet/claim-daily - Claim daily login bonus
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await claimDailyLogin(userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        transaction: result.transaction,
        newBalance: result.newBalance,
      },
    });
  } catch (error) {
    console.error('Claim daily error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to claim daily bonus' },
      { status: 500 }
    );
  }
}

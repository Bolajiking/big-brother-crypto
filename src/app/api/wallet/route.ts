// Wallet API - Get balance and transaction history
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getWalletBalance, getTransactionHistory } from '@/lib/wallet';

// GET /api/wallet - Get user's wallet balance and recent transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get balance
    const balance = await getWalletBalance(userId);
    if (!balance) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get recent transactions
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const { transactions, total } = await getTransactionHistory(userId, limit, offset);

    // Get user tier info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tier: true,
        lastCloutClaim: true,
        totalWatchTime: true,
        totalMessages: true,
      },
    });

    // Check if daily bonus is available
    let canClaimDaily = true;
    if (user?.lastCloutClaim) {
      const lastClaim = new Date(user.lastCloutClaim);
      const now = new Date();
      canClaimDaily = !(
        lastClaim.getDate() === now.getDate() &&
        lastClaim.getMonth() === now.getMonth() &&
        lastClaim.getFullYear() === now.getFullYear()
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        balance,
        tier: user?.tier || 'FREE',
        stats: {
          totalWatchTime: user?.totalWatchTime || 0,
          totalMessages: user?.totalMessages || 0,
        },
        canClaimDaily,
        transactions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + transactions.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Wallet API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet data' },
      { status: 500 }
    );
  }
}

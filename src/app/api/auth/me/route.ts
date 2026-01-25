import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

// GET /api/auth/me - Get current user profile
export async function GET(request: NextRequest) {
  try {
    // Get privyId from header (set by middleware or client)
    const privyId = request.headers.get('x-privy-id');

    if (!privyId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { privyId },
      include: {
        _count: {
          select: {
            predictions: true,
            votes: true,
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check and award daily login bonus
    const now = new Date();
    const lastClaim = user.lastCloutClaim;
    const canClaimDaily =
      !lastClaim ||
      now.getTime() - lastClaim.getTime() > 24 * 60 * 60 * 1000;

    let dailyBonus = 0;
    if (canClaimDaily) {
      dailyBonus = 50; // Daily login bonus
      await prisma.user.update({
        where: { id: user.id },
        data: {
          cloutBalance: user.cloutBalance + dailyBonus,
          lastCloutClaim: now,
        },
      });

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'DAILY_LOGIN',
          cloutAmount: dailyBonus,
          description: 'Daily login bonus',
          cloutBalanceAfter: user.cloutBalance + dailyBonus,
          stakesBalanceAfter: user.stakesBalance,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        privyId: user.privyId,
        username: user.username,
        walletAddress: user.walletAddress,
        email: user.email,
        avatarUrl: user.avatarUrl,
        cloutBalance: user.cloutBalance + dailyBonus,
        stakesBalance: user.stakesBalance,
        tier: user.tier,
        totalWatchTime: user.totalWatchTime,
        totalMessages: user.totalMessages,
        stats: {
          predictions: user._count.predictions,
          votes: user._count.votes,
          transactions: user._count.transactions,
        },
        createdAt: user.createdAt,
      },
      dailyBonusClaimed: canClaimDaily,
      dailyBonusAmount: dailyBonus,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
}

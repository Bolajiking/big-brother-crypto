// Upgrade User Tier API
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { deductStakes } from '@/lib/wallet';
import type { UserTier } from '@prisma/client';

// Tier upgrade costs in Stakes
const TIER_COSTS: Record<UserTier, number> = {
  FREE: 0,
  BRONZE: 100,
  SILVER: 500,
  GOLD: 2000,
  PLATINUM: 10000,
};

// Tier order for upgrades
const TIER_ORDER: UserTier[] = ['FREE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

// POST /api/user/upgrade-tier - Upgrade user's tier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, targetTier } = body;

    if (!userId || !targetTier) {
      return NextResponse.json(
        { success: false, error: 'User ID and target tier are required' },
        { status: 400 }
      );
    }

    // Validate target tier
    if (!TIER_ORDER.includes(targetTier)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tier' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true, stakesBalance: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if upgrade is valid (can't downgrade or upgrade to same tier)
    const currentTierIndex = TIER_ORDER.indexOf(user.tier);
    const targetTierIndex = TIER_ORDER.indexOf(targetTier);

    if (targetTierIndex <= currentTierIndex) {
      return NextResponse.json(
        { success: false, error: 'Cannot downgrade or stay at same tier' },
        { status: 400 }
      );
    }

    // Calculate upgrade cost (difference between tiers)
    const currentTierCost = TIER_COSTS[user.tier];
    const targetTierCost = TIER_COSTS[targetTier as UserTier];
    const upgradeCost = targetTierCost - currentTierCost;

    // Check if user can afford
    if (user.stakesBalance < upgradeCost) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient Stakes. Need ${upgradeCost} Stakes to upgrade to ${targetTier}`,
          requiredStakes: upgradeCost,
          currentBalance: user.stakesBalance,
        },
        { status: 400 }
      );
    }

    // Deduct stakes
    const deductResult = await deductStakes(
      userId,
      upgradeCost,
      'REWARD', // Using REWARD type for tier upgrades
      `Tier upgrade: ${user.tier} -> ${targetTier}`
    );

    if (!deductResult.success) {
      return NextResponse.json(
        { success: false, error: deductResult.message },
        { status: 400 }
      );
    }

    // Upgrade the tier
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { tier: targetTier as UserTier },
      select: {
        id: true,
        tier: true,
        stakesBalance: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${targetTier}!`,
      data: {
        previousTier: user.tier,
        newTier: updatedUser.tier,
        stakesCost: upgradeCost,
        newBalance: deductResult.newBalance,
        voteMultiplier:
          targetTier === 'PLATINUM' ? 3 :
          targetTier === 'GOLD' ? 2.5 :
          targetTier === 'SILVER' ? 2 :
          targetTier === 'BRONZE' ? 1.5 : 1,
      },
    });
  } catch (error) {
    console.error('Tier upgrade error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upgrade tier' },
      { status: 500 }
    );
  }
}

// GET /api/user/upgrade-tier - Get tier upgrade options
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true, stakesBalance: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const currentTierIndex = TIER_ORDER.indexOf(user.tier);
    const currentTierCost = TIER_COSTS[user.tier];

    // Calculate available upgrades
    const availableUpgrades = TIER_ORDER
      .slice(currentTierIndex + 1)
      .map((tier) => ({
        tier,
        cost: TIER_COSTS[tier] - currentTierCost,
        voteMultiplier:
          tier === 'PLATINUM' ? 3 :
          tier === 'GOLD' ? 2.5 :
          tier === 'SILVER' ? 2 :
          tier === 'BRONZE' ? 1.5 : 1,
        canAfford: user.stakesBalance >= TIER_COSTS[tier] - currentTierCost,
      }));

    return NextResponse.json({
      success: true,
      data: {
        currentTier: user.tier,
        currentBalance: user.stakesBalance,
        currentVoteMultiplier:
          user.tier === 'PLATINUM' ? 3 :
          user.tier === 'GOLD' ? 2.5 :
          user.tier === 'SILVER' ? 2 :
          user.tier === 'BRONZE' ? 1.5 : 1,
        availableUpgrades,
      },
    });
  } catch (error) {
    console.error('Get tier options error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tier options' },
      { status: 500 }
    );
  }
}

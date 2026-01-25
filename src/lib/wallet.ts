// Big Brother Crypto - Wallet Service
// Handles all Clout/Stakes balance operations

import { prisma } from './db';
import type { TransactionType } from '@prisma/client';
import { CLOUT_RATES, PAYMENT_TIERS, TIER_VOTE_MULTIPLIERS } from '@/types';

export interface WalletOperationResult {
  success: boolean;
  message: string;
  transaction?: {
    id: string;
    type: TransactionType;
    cloutAmount: number;
    stakesAmount: number;
    cloutBalanceAfter: number;
    stakesBalanceAfter: number;
  };
  newBalance?: {
    clout: number;
    stakes: number;
  };
}

// ============================================
// CORE WALLET OPERATIONS
// ============================================

/**
 * Add Clout to user's balance (for rewards, bonuses, etc.)
 */
export async function addClout(
  userId: string,
  amount: number,
  type: TransactionType,
  description?: string
): Promise<WalletOperationResult> {
  if (amount <= 0) {
    return { success: false, message: 'Amount must be positive' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get current user balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { cloutBalance: true, stakesBalance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newCloutBalance = user.cloutBalance + amount;

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { cloutBalance: newCloutBalance },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type,
          cloutAmount: amount,
          stakesAmount: 0,
          description,
          cloutBalanceAfter: newCloutBalance,
          stakesBalanceAfter: user.stakesBalance,
        },
      });

      return {
        transaction,
        newBalance: { clout: newCloutBalance, stakes: user.stakesBalance },
      };
    });

    return {
      success: true,
      message: `Added ${amount} Clout`,
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        cloutAmount: result.transaction.cloutAmount,
        stakesAmount: result.transaction.stakesAmount,
        cloutBalanceAfter: result.transaction.cloutBalanceAfter!,
        stakesBalanceAfter: result.transaction.stakesBalanceAfter!,
      },
      newBalance: result.newBalance,
    };
  } catch (error) {
    console.error('Failed to add Clout:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add Clout',
    };
  }
}

/**
 * Deduct Clout from user's balance (for votes, purchases, etc.)
 */
export async function deductClout(
  userId: string,
  amount: number,
  type: TransactionType,
  description?: string
): Promise<WalletOperationResult> {
  if (amount <= 0) {
    return { success: false, message: 'Amount must be positive' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get current user balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { cloutBalance: true, stakesBalance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.cloutBalance < amount) {
        throw new Error('Insufficient Clout balance');
      }

      const newCloutBalance = user.cloutBalance - amount;

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { cloutBalance: newCloutBalance },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type,
          cloutAmount: -amount,
          stakesAmount: 0,
          description,
          cloutBalanceAfter: newCloutBalance,
          stakesBalanceAfter: user.stakesBalance,
        },
      });

      return {
        transaction,
        newBalance: { clout: newCloutBalance, stakes: user.stakesBalance },
      };
    });

    return {
      success: true,
      message: `Deducted ${amount} Clout`,
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        cloutAmount: result.transaction.cloutAmount,
        stakesAmount: result.transaction.stakesAmount,
        cloutBalanceAfter: result.transaction.cloutBalanceAfter!,
        stakesBalanceAfter: result.transaction.stakesBalanceAfter!,
      },
      newBalance: result.newBalance,
    };
  } catch (error) {
    console.error('Failed to deduct Clout:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to deduct Clout',
    };
  }
}

/**
 * Add Stakes to user's balance (from deposits, wins, etc.)
 */
export async function addStakes(
  userId: string,
  amount: number,
  type: TransactionType,
  description?: string,
  nairaAmount?: number,
  paystackRef?: string
): Promise<WalletOperationResult> {
  if (amount <= 0) {
    return { success: false, message: 'Amount must be positive' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get current user balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { cloutBalance: true, stakesBalance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newStakesBalance = user.stakesBalance + amount;

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { stakesBalance: newStakesBalance },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type,
          cloutAmount: 0,
          stakesAmount: amount,
          nairaAmount,
          paystackRef,
          description,
          cloutBalanceAfter: user.cloutBalance,
          stakesBalanceAfter: newStakesBalance,
        },
      });

      return {
        transaction,
        newBalance: { clout: user.cloutBalance, stakes: newStakesBalance },
      };
    });

    return {
      success: true,
      message: `Added ${amount} Stakes`,
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        cloutAmount: result.transaction.cloutAmount,
        stakesAmount: result.transaction.stakesAmount,
        cloutBalanceAfter: result.transaction.cloutBalanceAfter!,
        stakesBalanceAfter: result.transaction.stakesBalanceAfter!,
      },
      newBalance: result.newBalance,
    };
  } catch (error) {
    console.error('Failed to add Stakes:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add Stakes',
    };
  }
}

/**
 * Deduct Stakes from user's balance (for bets, votes, etc.)
 */
export async function deductStakes(
  userId: string,
  amount: number,
  type: TransactionType,
  description?: string
): Promise<WalletOperationResult> {
  if (amount <= 0) {
    return { success: false, message: 'Amount must be positive' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get current user balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { cloutBalance: true, stakesBalance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.stakesBalance < amount) {
        throw new Error('Insufficient Stakes balance');
      }

      const newStakesBalance = user.stakesBalance - amount;

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { stakesBalance: newStakesBalance },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type,
          cloutAmount: 0,
          stakesAmount: -amount,
          description,
          cloutBalanceAfter: user.cloutBalance,
          stakesBalanceAfter: newStakesBalance,
        },
      });

      return {
        transaction,
        newBalance: { clout: user.cloutBalance, stakes: newStakesBalance },
      };
    });

    return {
      success: true,
      message: `Deducted ${amount} Stakes`,
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        cloutAmount: result.transaction.cloutAmount,
        stakesAmount: result.transaction.stakesAmount,
        cloutBalanceAfter: result.transaction.cloutBalanceAfter!,
        stakesBalanceAfter: result.transaction.stakesBalanceAfter!,
      },
      newBalance: result.newBalance,
    };
  } catch (error) {
    console.error('Failed to deduct Stakes:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to deduct Stakes',
    };
  }
}

// ============================================
// CLOUT EARNING SYSTEM
// ============================================

/**
 * Award daily login bonus (50 Clout)
 */
export async function claimDailyLogin(userId: string): Promise<WalletOperationResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastCloutClaim: true },
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Check if already claimed today
    if (user.lastCloutClaim) {
      const lastClaim = new Date(user.lastCloutClaim);
      const now = new Date();
      if (
        lastClaim.getDate() === now.getDate() &&
        lastClaim.getMonth() === now.getMonth() &&
        lastClaim.getFullYear() === now.getFullYear()
      ) {
        return { success: false, message: 'Daily bonus already claimed' };
      }
    }

    // Update last claim timestamp
    await prisma.user.update({
      where: { id: userId },
      data: { lastCloutClaim: new Date() },
    });

    // Add the daily bonus
    return addClout(userId, CLOUT_RATES.DAILY_LOGIN, 'DAILY_LOGIN', 'Daily login bonus');
  } catch (error) {
    console.error('Failed to claim daily login:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to claim daily login',
    };
  }
}

/**
 * Award watch time bonus (10 Clout per hour)
 */
export async function awardWatchTimeBonus(
  userId: string,
  minutesWatched: number
): Promise<WalletOperationResult> {
  if (minutesWatched < 60) {
    return { success: false, message: 'Need at least 60 minutes to earn bonus' };
  }

  const hoursWatched = Math.floor(minutesWatched / 60);
  const cloutEarned = hoursWatched * CLOUT_RATES.WATCH_TIME_PER_HOUR;

  // Update total watch time
  await prisma.user.update({
    where: { id: userId },
    data: { totalWatchTime: { increment: minutesWatched } },
  });

  return addClout(
    userId,
    cloutEarned,
    'WATCH_TIME',
    `Watch time bonus: ${hoursWatched} hour(s)`
  );
}

/**
 * Award chat message bonus (1 Clout per message, max 50/day)
 */
export async function awardChatBonus(userId: string): Promise<WalletOperationResult> {
  try {
    // Check how many chat bonuses earned today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayBonuses = await prisma.transaction.count({
      where: {
        userId,
        type: 'CHAT_BONUS',
        createdAt: { gte: todayStart },
      },
    });

    if (todayBonuses >= 50) {
      return { success: false, message: 'Daily chat bonus limit reached (50)' };
    }

    // Update total messages
    await prisma.user.update({
      where: { id: userId },
      data: { totalMessages: { increment: 1 } },
    });

    return addClout(userId, CLOUT_RATES.CHAT_MESSAGE, 'CHAT_BONUS', 'Chat message bonus');
  } catch (error) {
    console.error('Failed to award chat bonus:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to award chat bonus',
    };
  }
}

/**
 * Award referral bonus (500 Clout)
 */
export async function awardReferralBonus(
  referrerId: string,
  newUserId: string
): Promise<WalletOperationResult> {
  try {
    // Link the referral
    await prisma.user.update({
      where: { id: newUserId },
      data: { referredById: referrerId },
    });

    return addClout(
      referrerId,
      CLOUT_RATES.REFERRAL,
      'REFERRAL',
      `Referral bonus for new user`
    );
  } catch (error) {
    console.error('Failed to award referral bonus:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to award referral bonus',
    };
  }
}

// ============================================
// PAYMENT HELPERS
// ============================================

/**
 * Calculate Stakes received for a Naira deposit
 */
export function calculateStakesForDeposit(nairaAmount: number): {
  stakes: number;
  bonus: number;
  total: number;
} {
  // Find the matching tier
  const tier = PAYMENT_TIERS.find((t) => t.amount === nairaAmount);
  if (tier) {
    return { stakes: tier.stakes, bonus: tier.bonus, total: tier.total };
  }

  // Default: 1 Stakes per ₦10 Naira, no bonus
  const stakes = Math.floor(nairaAmount / 10);
  return { stakes, bonus: 0, total: stakes };
}

/**
 * Get user's current wallet balance
 */
export async function getWalletBalance(
  userId: string
): Promise<{ clout: number; stakes: number } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cloutBalance: true, stakesBalance: true },
  });

  if (!user) return null;

  return { clout: user.cloutBalance, stakes: user.stakesBalance };
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit = 50,
  offset = 0
): Promise<{
  transactions: Array<{
    id: string;
    type: TransactionType;
    cloutAmount: number;
    stakesAmount: number;
    nairaAmount: number | null;
    description: string | null;
    createdAt: Date;
  }>;
  total: number;
}> {
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        cloutAmount: true,
        stakesAmount: true,
        nairaAmount: true,
        description: true,
        createdAt: true,
      },
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);

  return { transactions, total };
}

/**
 * Get vote multiplier based on user tier
 */
export function getVoteMultiplier(tier: keyof typeof TIER_VOTE_MULTIPLIERS): number {
  return TIER_VOTE_MULTIPLIERS[tier];
}

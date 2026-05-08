import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import { oddsMultiplierFromOption, toPredictionMarket, toUserBet } from '@/lib/watch-data';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;
    const body = await request.json();
    const { userId, optionId } = body;
    const amount = Number(body.amount);

    if (!marketId || !userId || !optionId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Market, option, user, and stake amount are required' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const market = await tx.market.findUnique({
        where: { id: marketId },
        include: {
          creator: { select: { username: true } },
          options: true,
        },
      });

      if (!market) throw new Error('Market not found');
      if (market.status !== 'OPEN') throw new Error('Market is not open');
      if (market.closesAt.getTime() <= Date.now()) throw new Error('Market is closed');

      const option = market.options.find((item) => item.id === optionId);
      if (!option) throw new Error('Option not found');

      const existingPrediction = await tx.prediction.findUnique({
        where: {
          userId_marketId: {
            userId,
            marketId,
          },
        },
      });

      if (existingPrediction) throw new Error('You already backed this market');

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { cloutBalance: true, stakesBalance: true, username: true },
      });

      if (!user) throw new Error('User not found');
      if (user.stakesBalance < amount) throw new Error('Insufficient Stakes balance');

      const oddsAtPurchase = oddsMultiplierFromOption(option);
      const potentialWin = Math.floor(amount * oddsAtPurchase);
      const stakesBalanceAfter = user.stakesBalance - amount;

      await tx.user.update({
        where: { id: userId },
        data: { stakesBalance: stakesBalanceAfter },
      });

      const prediction = await tx.prediction.create({
        data: {
          userId,
          marketId,
          optionId,
          amount,
          oddsAtPurchase,
          potentialWin,
        },
        include: {
          user: { select: { username: true } },
          option: { select: { label: true } },
        },
      });

      await tx.marketOption.update({
        where: { id: optionId },
        data: { totalStaked: { increment: amount } },
      });

      await tx.market.update({
        where: { id: marketId },
        data: { totalVolume: { increment: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: 'BET',
          stakesAmount: -amount,
          description: `Backed "${option.label}" on "${market.title}"`,
          metadata: {
            marketId,
            optionId,
            oddsAtPurchase,
            potentialWin,
          },
          cloutBalanceAfter: user.cloutBalance,
          stakesBalanceAfter,
        },
      });

      const updatedMarket = await tx.market.findUniqueOrThrow({
        where: { id: marketId },
        include: {
          creator: { select: { username: true } },
          options: true,
        },
      });

      return {
        market: updatedMarket,
        prediction,
        transaction,
        balance: {
          clout: user.cloutBalance,
          stakes: stakesBalanceAfter,
        },
      };
    });

    return NextResponse.json({
      success: true,
      market: toPredictionMarket(result.market),
      bet: toUserBet(result.prediction),
      balance: result.balance,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Place bet error:', error);
    const message = error instanceof Error ? error.message : 'Failed to place bet';
    const status = ['Insufficient Stakes balance', 'You already backed this market', 'Market is closed', 'Market is not open'].includes(message)
      ? 400
      : message === 'Market not found' || message === 'Option not found' || message === 'User not found'
        ? 404
        : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

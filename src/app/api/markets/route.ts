import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import { marketTypeFromCategory, toPredictionMarket, toUserBet } from '@/lib/watch-data';
import type { PredictionMarket } from '@/types/prediction';

// GET /api/markets - Get all markets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const seasonId = searchParams.get('seasonId');
    const format = searchParams.get('format');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (seasonId) {
      where.seasonId = seasonId;
    }

    const markets = await prisma.market.findMany({
      where,
      include: {
        creator: {
          select: {
            username: true,
          },
        },
        options: {
          include: {
            contestant: {
              select: {
                id: true,
                name: true,
                nickname: true,
                photoUrl: true,
              },
            },
          },
          orderBy: { currentOdds: 'desc' },
        },
        _count: {
          select: { predictions: true },
        },
      },
      orderBy: [
        { status: 'asc' },
        { closesAt: 'asc' },
      ],
    });

    if (format === 'watch') {
      const userBets = userId
        ? await prisma.prediction.findMany({
            where: { userId },
            include: {
              user: { select: { username: true } },
              option: { select: { label: true } },
            },
            orderBy: { createdAt: 'desc' },
          })
        : [];

      return NextResponse.json({
        success: true,
        markets: markets.map(toPredictionMarket),
        userBets: userBets.map(toUserBet),
      });
    }

    return NextResponse.json({
      success: true,
      markets: markets.map((market) => ({
        ...market,
        predictionCount: market._count.predictions,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error('Get markets error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}

// POST /api/markets - Create a new market (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      question,
      description,
      type,
      category,
      closesAt,
      duration,
      seasonId,
      creatorId,
      options,
      status,
      format,
    } = body;

    const marketTitle = title || question;
    const marketType = type || marketTypeFromCategory((category || 'event') as PredictionMarket['category']);
    const closeDate = closesAt
      ? new Date(closesAt)
      : new Date(Date.now() + Number(duration || 24) * 60 * 60 * 1000);

    if (!marketTitle || !marketType || Number.isNaN(closeDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const optionLabels = Array.isArray(options)
      ? options
          .map((option: { label?: string } | string) => (typeof option === 'string' ? option : option.label))
          .filter((label): label is string => typeof label === 'string' && label.trim().length > 0)
      : [];

    if (optionLabels.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least two options are required' },
        { status: 400 }
      );
    }

    const market = await prisma.market.create({
      data: {
        title: marketTitle,
        description,
        type: marketType,
        status: status || 'OPEN',
        closesAt: closeDate,
        seasonId,
        creatorId,
        options: {
          create: optionLabels.map((label) => ({
            label: label.trim(),
            currentOdds: 2,
          })),
        },
      },
      include: {
        creator: {
          select: {
            username: true,
          },
        },
        options: true,
      },
    });

    if (format === 'watch' || question || category) {
      return NextResponse.json({
        success: true,
        market: toPredictionMarket(market),
      });
    }

    return NextResponse.json({
      success: true,
      market,
    });
  } catch (error) {
    console.error('Create market error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create market' },
      { status: 500 }
    );
  }
}

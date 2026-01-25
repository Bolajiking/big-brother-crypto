import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

// GET /api/markets - Get all markets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const seasonId = searchParams.get('seasonId');

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
    const { title, description, type, closesAt, seasonId, options } = body;

    if (!title || !type || !closesAt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const market = await prisma.market.create({
      data: {
        title,
        description,
        type,
        status: 'DRAFT',
        closesAt: new Date(closesAt),
        seasonId,
        options: {
          create: options?.map((opt: { label: string; contestantId?: string }) => ({
            label: opt.label,
            contestantId: opt.contestantId,
            currentOdds: 100 / (options.length || 1), // Equal odds initially
          })) || [],
        },
      },
      include: {
        options: true,
      },
    });

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

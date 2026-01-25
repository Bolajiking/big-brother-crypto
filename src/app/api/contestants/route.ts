import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

// GET /api/contestants - Get all contestants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const nominated = searchParams.get('nominated');
    const seasonId = searchParams.get('seasonId');

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (nominated === 'true') {
      where.isNominated = true;
      where.status = 'ACTIVE';
    }

    if (seasonId) {
      where.seasonId = seasonId;
    } else {
      // Default to active season
      const activeSeason = await prisma.season.findFirst({
        where: { isActive: true },
      });
      if (activeSeason) {
        where.seasonId = activeSeason.id;
      }
    }

    const contestants = await prisma.contestant.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { isHoH: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      contestants,
    });
  } catch (error) {
    console.error('Get contestants error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contestants' },
      { status: 500 }
    );
  }
}

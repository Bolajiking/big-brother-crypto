import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

const normalizeWalletAddress = (address?: string | null) => (
  typeof address === 'string' && address.trim().length > 0
    ? address.trim().toLowerCase()
    : null
);

const baseUsernameFrom = (walletAddress?: string | null, email?: string | null) => {
  if (walletAddress) return `user_${walletAddress.slice(2, 10) || walletAddress.slice(0, 8)}`;
  if (email) return email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 22) || 'viewer';
  return `viewer_${Date.now().toString(36)}`;
};

async function createAvailableUsername(walletAddress?: string | null, email?: string | null) {
  const base = baseUsernameFrom(walletAddress, email).toLowerCase();
  let candidate = base;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const existing = await prisma.user.findUnique({ where: { username: candidate } });
    if (!existing) return candidate;
    candidate = `${base}_${Math.random().toString(36).slice(2, 6)}`;
  }

  return `${base}_${Date.now().toString(36)}`;
}

// POST /api/auth/verify - Verify Privy token and create/update user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyId, email } = body;
    const walletAddress = normalizeWalletAddress(body.walletAddress);

    if (!privyId) {
      return NextResponse.json(
        { success: false, error: 'Privy ID is required' },
        { status: 400 }
      );
    }

    // Try to find existing user or create new one
    let user = await prisma.user.findUnique({
      where: { privyId },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { privyId },
        data: {
          walletAddress: walletAddress || user.walletAddress,
          email: email || user.email,
          lastLoginAt: new Date(),
        },
      });
    } else {
      if (walletAddress) {
        const existingWalletUser = await prisma.user.findUnique({
          where: { walletAddress },
        });

        if (existingWalletUser) {
          return NextResponse.json(
            { success: false, error: 'This app wallet is already linked to another account' },
            { status: 409 }
          );
        }
      }

      // Create new user with initial Clout balance
      const username = await createAvailableUsername(walletAddress, email);

      user = await prisma.user.create({
        data: {
          privyId,
          walletAddress,
          email,
          username,
          cloutBalance: 500, // Starting bonus
          lastLoginAt: new Date(),
        },
      });

      // Create welcome transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'REWARD',
          cloutAmount: 500,
          description: 'Welcome bonus',
          cloutBalanceAfter: 500,
          stakesBalanceAfter: 0,
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
        cloutBalance: user.cloutBalance,
        stakesBalance: user.stakesBalance,
        tier: user.tier,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Auth verify error:', error);

    // Handle unique constraint violations
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Username or wallet already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

// POST /api/auth/verify - Verify Privy token and create/update user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyId, walletAddress, email } = body;

    if (!privyId) {
      return NextResponse.json(
        { success: false, error: 'Privy ID is required' },
        { status: 400 }
      );
    }

    // Generate a username from wallet or email
    const generateUsername = () => {
      if (walletAddress) {
        return `user_${walletAddress.slice(0, 8)}`;
      }
      if (email) {
        return email.split('@')[0];
      }
      return `user_${Date.now().toString(36)}`;
    };

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
      // Create new user with initial Clout balance
      const username = generateUsername();

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

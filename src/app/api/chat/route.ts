import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import { awardChatBonus } from '@/lib/wallet';

const colorForUser = (userId: string) => {
  const colors = ['#FF4E2B', '#6B3FE5', '#1FD17A', '#F2B544', '#5ACDFF', '#FF1F3D'];
  const total = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[total % colors.length];
};

const toChatLine = (message: {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; username: string };
}) => ({
  id: message.id,
  name: message.user.username,
  color: colorForUser(message.user.id),
  msg: message.content,
  time: 'now',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') || 50), 100);

    const messages = await prisma.chatMessage.findMany({
      where: { isDeleted: false },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      messages: messages.reverse().map(toChatLine),
    });
  } catch (error) {
    console.error('Get chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: 'User and message are required' },
        { status: 400 }
      );
    }

    if (content.length > 240) {
      return NextResponse.json(
        { success: false, error: 'Message is too long' },
        { status: 400 }
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    const bonus = await awardChatBonus(userId);

    return NextResponse.json({
      success: true,
      message: toChatLine(message),
      balance: bonus.newBalance,
      bonus: bonus.success ? bonus.transaction : null,
    });
  } catch (error) {
    console.error('Create chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send chat message' },
      { status: 500 }
    );
  }
}

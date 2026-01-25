// Get Nigerian Banks API
import { NextResponse } from 'next/server';
import { getBanks } from '@/lib/paystack';

// GET /api/payments/banks - Get list of Nigerian banks
export async function GET() {
  try {
    const result = await getBanks();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { banks: result.banks },
    });
  } catch (error) {
    console.error('Get banks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banks' },
      { status: 500 }
    );
  }
}

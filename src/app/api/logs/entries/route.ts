import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Stub endpoint - returns empty entries list
    const data: Array<{
      id: number;
      timestamp?: string;
      server?: string;
      severity?: string;
      category?: string;
      website?: string;
      operation?: string;
      message: string;
      errorsCount: number;
      country?: string;
      environment?: string;
    }> = [];

    const total = 0;

    return NextResponse.json({ success: true, data, total });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

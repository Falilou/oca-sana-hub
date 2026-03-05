import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Stub endpoint - returns empty country stats
    const data: Array<{
      country: string;
      environment: string;
      fileCount: number;
      processingTime: number;
    }> = [];

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

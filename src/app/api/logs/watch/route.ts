import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Stub endpoint - returns empty watch list
    const data: Array<{
      id: number;
      folderPath: string;
      intervalMinutes: number;
      enabled: number;
      lastRunAt?: string;
    }> = [];

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderPath, intervalMinutes, enabled } = body;

    // Stub endpoint - simulate saving watch configuration
    return NextResponse.json({
      success: true,
      message: 'Watch configuration saved (stub)',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

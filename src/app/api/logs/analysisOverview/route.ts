import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Stub endpoint - returns empty analysis overview
    const data: Array<{
      folder_path: string;
      country: string;
      environment: string;
      file_count: number;
      line_count: number;
      started_at: string;
      finished_at: string;
    }> = [];

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

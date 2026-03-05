import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Stub endpoint - simulate running watcher
    const data = {
      runs: [] as Array<{ folderPath: string; status: string }>,
    };

    return NextResponse.json({
      success: true,
      data,
      message: 'Watcher executed (stub)',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}

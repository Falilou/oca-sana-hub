import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderPath } = body;

    // Stub endpoint - simulate streaming ingest
    // In a real implementation, this would use Server-Sent Events (SSE)
    // For now, return a simple response
    return NextResponse.json({
      success: true,
      message: 'Ingest stream endpoint (stub) - use /api/logs/ingestFromPath instead',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

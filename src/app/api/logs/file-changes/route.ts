import { NextRequest, NextResponse } from 'next/server';
import { getFileWatcher } from '@/services/fileWatcherService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/logs/file-changes?basePath=...
 * Get detected file changes since last check
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const basePath = searchParams.get('basePath');

    if (!basePath) {
      return NextResponse.json(
        { error: 'Base path is required' },
        { status: 400 }
      );
    }

    const watcher = getFileWatcher();
    const changes = watcher.getChanges(basePath);
    const notification = watcher.getNotificationState(basePath);

    return NextResponse.json(
      {
        success: true,
        basePath,
        notification,
        changes: {
          newFiles: changes.newFiles.slice(0, 50), // Return first 50
          modifiedFiles: changes.modifiedFiles.slice(0, 50),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: { 'Cache-Control': 'no-cache' } }
    );
  } catch (error: any) {
    console.error('[FileChanges] Error fetching file changes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch file changes',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/logs/file-changes/clear
 * Clear detected file changes (mark as read)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { basePath } = body;

    if (!basePath) {
      return NextResponse.json(
        { error: 'Base path is required' },
        { status: 400 }
      );
    }

    const watcher = getFileWatcher();
    watcher.clearChanges(basePath);

    return NextResponse.json(
      {
        success: true,
        message: 'File changes cleared',
        basePath,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[FileChanges] Error clearing file changes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to clear file changes',
      },
      { status: 500 }
    );
  }
}

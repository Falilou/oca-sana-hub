import { NextResponse } from 'next/server';
import { logAnalysisService } from '@/services/logAnalysisService';

export const dynamic = 'force-dynamic';

/**
 * POST /api/logs/clear
 * Clear all loaded logs from memory
 */
export async function POST() {
  try {
    logAnalysisService.clearLogs();

    return NextResponse.json({
      success: true,
      message: 'All logs cleared successfully',
    });
  } catch (error: any) {
    console.error('Error clearing logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear logs' },
      { status: 500 }
    );
  }
}

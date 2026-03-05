import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/services/indexedDatabaseService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/logs/database-status
 * Get current indexed database status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const stats = db.getStats();
    const index = db.getIndex();

    return NextResponse.json(
      {
        success: true,
        database: {
          status: 'active',
          stats,
          index: {
            countries: db.getCountries(),
            environments: db.getEnvironments(),
            recordTimestamp: index?.lastUpdated,
          },
          performance: {
            isRecentlyIndexed: db.isRecentlyIndexed(300),
            lastIndexedSeconds: Math.round((Date.now() - (index?.indexedAt || 0)) / 1000),
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: { 'Cache-Control': 'no-cache' } }
    );
  } catch (error: any) {
    console.error('[DBStatus] Error fetching database status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch database status',
      },
      { status: 500 }
    );
  }
}

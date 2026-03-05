/**
 * API Endpoint: Deduplicate Database
 * POST /api/logs/deduplicate
 * 
 * Removes duplicate log entries from the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/services/indexedDatabaseService';

export async function POST(request: NextRequest) {
  try {
    console.log('[Deduplicate] Starting database deduplication...');
    
    const db = getDatabase();
    const result = await db.deduplicateDatabase();
    
    return NextResponse.json({
      success: true,
      result: {
        originalCount: result.originalCount,
        duplicatesRemoved: result.duplicatesRemoved,
        finalCount: result.finalCount,
      },
      message: result.duplicatesRemoved > 0
        ? `✓ Removed ${result.duplicatesRemoved} duplicate logs (${result.originalCount} → ${result.finalCount})`
        : '✓ No duplicates found',
    });
  } catch (error) {
    console.error('[Deduplicate] Error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Deduplication failed: ${errorMsg}`,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to deduplicate database',
    method: 'POST',
    endpoint: '/api/logs/deduplicate',
  });
}

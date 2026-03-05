import { NextResponse } from 'next/server';
import { logAnalysisService } from '@/services/logAnalysisService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/logs/analysis?country=australia&environment=PROD
 * Get comprehensive error analysis of loaded logs, optionally filtered by country and environment
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;
    const environment = searchParams.get('environment') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const startTime = performance.now();
    const analysis = logAnalysisService.analyzeErrors(country, environment, startDate, endDate);
    const endTime = performance.now();
    const processingTimeMs = Math.round(endTime - startTime);

    const logs = logAnalysisService.getLogs();
    const availableCountries = logAnalysisService.getAvailableCountries();
    const availableEnvironments = logAnalysisService.getAvailableEnvironments();

    return NextResponse.json({
      success: true,
      analysis,
      totalLogs: logs.length,
      filteredBy: {
        country: country || 'all',
        environment: environment || 'all',
        startDate: startDate || 'none',
        endDate: endDate || 'none',
      },
      availableCountries,
      availableEnvironments,
      processingTimeMs,
      processingTimeSeconds: (processingTimeMs / 1000).toFixed(2),
    });
  } catch (error: any) {
    console.error('Error analyzing logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze logs' },
      { status: 500 }
    );
  }
}

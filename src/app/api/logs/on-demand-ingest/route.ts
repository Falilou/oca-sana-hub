import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { logAnalysisService } from '@/services/logAnalysisService';
import { getDatabase } from '@/services/indexedDatabaseService';

export const dynamic = 'force-dynamic';

/**
 * POST /api/logs/on-demand-ingest
 * On-demand batch ingestion of log files
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { basePath, filePaths, maxFiles = 500 } = body;

    if (!basePath) {
      return NextResponse.json(
        { error: 'Base path is required' },
        { status: 400 }
      );
    }

    if (!fs.existsSync(basePath)) {
      return NextResponse.json(
        { error: `Path does not exist: ${basePath}` },
        { status: 404 }
      );
    }

    console.log(`[OnDemand] Starting on-demand ingestion from: ${basePath}`);

    // Get files to ingest
    let filesToProcess: string[];

    if (filePaths && Array.isArray(filePaths) && filePaths.length > 0) {
      // Specific files requested
      filesToProcess = filePaths.slice(0, maxFiles);
      console.log(`[OnDemand] Processing ${filesToProcess.length} specified files`);
    } else {
      // Auto-discover all log files
      const files = fs.readdirSync(basePath, { recursive: true });
      filesToProcess = files
        .filter(
          (file) =>
            (file as string).endsWith('.log') ||
            (file as string).endsWith('.txt') ||
            (file as string).endsWith('.xml') ||
            !(file as string).includes('.')
        )
        .slice(0, maxFiles)
        .map((f) => f as string);

      console.log(`[OnDemand] Auto-discovered ${filesToProcess.length} log files`);
    }

    const db = getDatabase();
    let filesProcessed = 0;
    let entriesProcessed = 0;
    let entriesIngested = 0;
    const errors: string[] = [];
    const processedFiles: string[] = [];

    // Clear logs before ingestion
    logAnalysisService.clearLogs();

    // Process each file
    for (const file of filesToProcess) {
      try {
        const filePath = path.join(basePath, file);

        if (!fs.existsSync(filePath)) {
          errors.push(`File not found: ${filePath}`);
          continue;
        }

        const stats = fs.statSync(filePath);

        if (!stats.isFile() || stats.size === 0) {
          continue;
        }

        console.log(`[OnDemand] Processing: ${path.basename(filePath)}`);

        const content = fs.readFileSync(filePath, 'utf-8');
        const logBlocks = content
          .split('----------------------------------------')
          .filter((block) => block.trim().length > 0);

        let blockCount = 0;
        for (const block of logBlocks) {
          if (block.includes('Timestamp:')) {
            const entry = logAnalysisService.parseSanaLogEntry(
              block,
              path.dirname(file).split('\\').pop() || 'unknown',
              'PROD'
            );
            if (entry) {
              blockCount++;
              entriesProcessed++;
            }
          }
        }

        console.log(
          `[OnDemand] Extracted ${blockCount} entries from ${path.basename(filePath)}`
        );

        filesProcessed++;
        processedFiles.push(path.basename(filePath));

        // Batch ingest every 100 files or at the end
        if (filesProcessed % 100 === 0 || filesProcessed === filesToProcess.length) {
          const allLogs = logAnalysisService.getLogs();
          if (allLogs.length > 0) {
            const result = await db.ingestLogs(allLogs);
            entriesIngested += result.ingested;

            if (result.errors.length > 0) {
              errors.push(...result.errors.slice(0, 5));
            }

            logAnalysisService.clearLogs();
          }
        }
      } catch (fileError: any) {
        const errorMsg = `Error processing ${file}: ${fileError.message}`;
        console.error(`[OnDemand] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Final ingest if any remaining logs
    const remainingLogs = logAnalysisService.getLogs();
    if (remainingLogs.length > 0) {
      const result = await db.ingestLogs(remainingLogs);
      entriesIngested += result.ingested;
      logAnalysisService.clearLogs();
    }

    const stats = db.getStats();

    return NextResponse.json(
      {
        success: true,
        message: `On-demand ingestion complete`,
        ingestion: {
          filesProcessed,
          entriesProcessed,
          entriesIngested,
          processedFiles: processedFiles.slice(0, 50), // Return first 50 file names
          totalFilesRequested: filesToProcess.length,
        },
        databaseStats: stats,
        errors: errors.slice(0, 20), // Return first 20 errors
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[OnDemand] Error during on-demand ingestion:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'On-demand ingestion failed',
      },
      { status: 500 }
    );
  }
}

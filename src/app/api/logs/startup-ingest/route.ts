import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { spawn } from 'child_process';
import { logAnalysisService, type LogEntry } from '@/services/logAnalysisService';
import { getDatabase } from '@/services/indexedDatabaseService';
import { getFileWatcher } from '@/services/fileWatcherService';

export const dynamic = 'force-dynamic';

type IngestProgress = {
  inProgress: boolean;
  processedFiles: number;
  totalFiles: number;
  parsedEntries: number;
  percent: number;
  startedAt: string | null;
  updatedAt: string | null;
};

const ingestProgressByPath = new Map<string, IngestProgress>();

function getProgress(basePath: string): IngestProgress {
  const existing = ingestProgressByPath.get(basePath);
  if (existing) {
    return existing;
  }

  const initial: IngestProgress = {
    inProgress: false,
    processedFiles: 0,
    totalFiles: 0,
    parsedEntries: 0,
    percent: 0,
    startedAt: null,
    updatedAt: null,
  };
  ingestProgressByPath.set(basePath, initial);
  return initial;
}

function updateProgress(basePath: string, updates: Partial<IngestProgress>): void {
  const current = getProgress(basePath);
  const updated: IngestProgress = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  ingestProgressByPath.set(basePath, updated);
}

function normalizeEntries(entries: any[]): LogEntry[] {
  const normalizedEntries: LogEntry[] = [];

  for (const entry of entries) {
    const date = new Date(entry.date || entry.timestamp || Date.now());
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const environment: LogEntry['environment'] = entry.environment === 'INDUS' ? 'INDUS' : 'PROD';
    const severity: LogEntry['severity'] = entry.severity || 'Info';
    const category: LogEntry['category'] = entry.category || 'unknown';

    normalizedEntries.push({
      timestamp: entry.timestamp || date.toISOString(),
      date,
      severity,
      category,
      operation: entry.operation || 'Unknown',
      errorType: entry.errorType || 'N/A',
      message: entry.message || '',
      customerId: entry.customerId || undefined,
      country: entry.country || 'unknown',
      environment,
      hour: typeof entry.hour === 'number' ? entry.hour : date.getHours(),
      dayOfWeek: entry.dayOfWeek || date.toLocaleDateString('en-US', { weekday: 'long' }),
      weekNumber: typeof entry.weekNumber === 'number' ? entry.weekNumber : 0,
    });
  }

  return normalizedEntries;
}

/**
 * GET /api/logs/startup-ingest
 * Get status of startup ingestion
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const stats = db.getStats();
    const basePath = request.nextUrl.searchParams.get('basePath') || '';
    const progress = basePath ? getProgress(basePath) : null;
    return NextResponse.json({
      success: true,
      database: stats,
      progress,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get database status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/logs/startup-ingest
 * Automatically ingest logs from default directory at application startup
 * Uses Python script for memory-efficient processing of large file sets
 */
export async function POST(request: NextRequest) {
  let basePath = '';
  try {
    const body = await request.json();
    basePath = body.basePath;

    if (!basePath || !basePath.trim()) {
      return NextResponse.json(
        { success: false, error: 'Base path is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (!fs.existsSync(basePath)) {
      return NextResponse.json(
        { success: false, error: `Path does not exist: ${basePath}` },
        { status: 404 }
      );
    }

    updateProgress(basePath, {
      inProgress: true,
      processedFiles: 0,
      totalFiles: 0,
      parsedEntries: 0,
      percent: 0,
      startedAt: new Date().toISOString(),
    });

    console.log('[Startup] Starting ingestion via Python script for:', basePath);

    // Call Python script with streaming ingestion
    const result = await runPythonIngestionStreaming(basePath);

    if (!result.success) {
      console.error('[Startup] Python ingestion failed:', result.error);
      return NextResponse.json(result, { status: 500 });
    }

    console.log(`[Startup] Streaming ingestion completed: ${result.stats.filesProcessed} files, ${result.stats.parsedEntries} entries, ${result.ingestedCount} ingested`);

    // Get database stats
    const db = getDatabase();
    const databaseStats = db.getStats();
    const indexedCountries = db.getCountries();
    const indexedEnvironments = db.getEnvironments();

    updateProgress(basePath, {
      inProgress: false,
      processedFiles: result.stats.filesProcessed || 0,
      totalFiles: result.stats.filesProcessed || 0,
      parsedEntries: result.stats.parsedEntries || 0,
      percent: 100,
    });

    // Start file watcher
    try {
      const fileWatcher = getFileWatcher();
      fileWatcher.startWatching(basePath);
      console.log('[Startup] File watcher started');
    } catch (error) {
      console.warn('[Startup] Could not start file watcher:', error);
    }

    return NextResponse.json({
      success: true,
      stats: {
        filesProcessed: result.stats.filesProcessed,
        parsedEntries: result.stats.parsedEntries,
        totalIngested: result.ingestedCount,
        databaseStats: {
          totalLogs: databaseStats.totalLogs,
          countries: indexedCountries,
          environments: indexedEnvironments,
          fileCount: result.stats.filesProcessed || 0,
        },
      },
    });
  } catch (error) {
    console.error('[Startup] Error during startup ingestion:', error);
    if (basePath) {
      updateProgress(basePath, { inProgress: false });
    }
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `Ingestion failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}

/**
 * Run Python ingestion script with real-time streaming
 * Reads entries from stdout line-by-line and ingests directly to database
 * No temp files = no memory/disk bottlenecks
 */
function runPythonIngestionStreaming(basePath: string): Promise<any> {
  return new Promise((resolve) => {
    try {
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const scriptPath = path.join(process.cwd(), 'scripts', 'ingest_logs.py');
      
      console.log(`[Startup] Launching streaming Python process: ${pythonCmd} ${scriptPath}`);
      
      const pythonProcess = spawn(pythonCmd, [scriptPath, basePath], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const rawBatch: any[] = [];
      const batchSize = 10000;
      let ingested = 0;
      let batchCount = 0;
      let stderr = '';
      let finalStats: any = null;
      
      const db = getDatabase();

      // Process stdout line-by-line using readline
      if (pythonProcess.stdout) {
        const rl = readline.createInterface({
          input: pythonProcess.stdout,
          crlfDelay: Infinity,
        });

        rl.on('line', async (line) => {
          if (!line.trim()) return;

          // Check if this is the final stats line
          if (line.startsWith('STATS:')) {
            try {
              finalStats = JSON.parse(line.substring(6)); // Remove "STATS:" prefix
              console.log('[Startup] Received final stats:', finalStats);
            } catch (e) {
              console.error('[Startup] Failed to parse stats:', e);
            }
            return;
          }

          // Parse as log entry
          try {
            const entry = JSON.parse(line);
            rawBatch.push(entry);

            // Batch processing
            if (rawBatch.length >= batchSize) {
              const normalized = normalizeEntries(rawBatch);
              if (normalized.length > 0) {
                const result = await db.ingestLogs(normalized, true);
                ingested += result.ingested;
                batchCount++;
                
                if (batchCount % 5 === 0) {
                  console.log(`[Startup] Progress: ${ingested} logs ingested (${batchCount} batches)...`);
                }
              }
              rawBatch.length = 0; // Clear batch
            }
          } catch (e) {
            // Skip malformed lines
          }
        });
      }

      // Capture stderr
      if (pythonProcess.stderr) {
        pythonProcess.stderr.on('data', (data) => {
          const message = String(data);
          console.log(`[Startup/Python] ${message}`);
          stderr += message;

          const lines = message.split(/\r?\n/).filter((line: string) => line.trim().length > 0);
          lines.forEach((line: string) => {
            const foundMatch = line.match(/Found\s+(\d+)\s+files/i);
            if (foundMatch) {
              const totalFiles = Number(foundMatch[1]);
              updateProgress(basePath, {
                totalFiles,
                percent: totalFiles > 0 ? 1 : 0,
              });
            }

            const progressMatch = line.match(/(\d+)\/(\d+):\s+(\d+)\s+entries/i);
            if (progressMatch) {
              const processedFiles = Number(progressMatch[1]);
              const totalFiles = Number(progressMatch[2]);
              const parsedEntries = Number(progressMatch[3]);
              const percent = totalFiles > 0 ? Math.round((processedFiles / totalFiles) * 100) : 0;
              updateProgress(basePath, {
                processedFiles,
                totalFiles,
                parsedEntries,
                percent,
              });
            }

            const doneMatch = line.match(/Done:\s+(\d+)\s+files,\s+(\d+)\s+entries/i);
            if (doneMatch) {
              const processedFiles = Number(doneMatch[1]);
              const parsedEntries = Number(doneMatch[2]);
              updateProgress(basePath, {
                processedFiles,
                totalFiles: processedFiles,
                parsedEntries,
                percent: 100,
                inProgress: false,
              });
            }
          });
        });
      }

      // Handle process completion
      pythonProcess.on('close', async (code) => {
        // Process any remaining batch
        if (rawBatch.length > 0) {
          const normalized = normalizeEntries(rawBatch);
          if (normalized.length > 0) {
            const result = await db.ingestLogs(normalized, true);
            ingested += result.ingested;
          }
        }
        
        console.log(`[Startup] ✓ Total ingested: ${ingested} logs in ${batchCount + 1} batches`);
        
        // Deduplicate database to remove any duplicate entries
        console.log('[Startup] Deduplicating database...');
        const dedupResult = await db.deduplicateDatabase();
        if (dedupResult.duplicatesRemoved > 0) {
          console.log(`[Startup] ✓ Removed ${dedupResult.duplicatesRemoved} duplicate logs (${dedupResult.originalCount} → ${dedupResult.finalCount})`);
        }
        
        // Rebuild analytics cache
        const allLogs = await db.queryLogs({ limit: 100000 });
        if (allLogs && allLogs.length > 0) {
          logAnalysisService.addLogs(allLogs as any);
          console.log(`[Startup] ✓ Rebuilt analytics cache with ${allLogs.length} logs`);
        }

        if (code !== 0) {
          console.error(`[Startup] Python script failed with code ${code}:`, stderr);
          updateProgress(basePath, { inProgress: false });
          resolve({
            success: false,
            error: `Python script failed: ${stderr || 'Unknown error'}`,
            stats: {
              filesProcessed: 0,
              parsedEntries: 0,
              countries: [],
              environments: [],
              errors: [stderr || 'Python process failed'],
            },
            ingestedCount: ingested,
          });
          return;
        }

        if (!finalStats) {
          console.error('[Startup] No stats received from Python');
          updateProgress(basePath, { inProgress: false });
          resolve({
            success: false,
            error: 'No stats received from Python',
            stats: {
              filesProcessed: 0,
              parsedEntries: 0,
              countries: [],
              environments: [],
              errors: ['No stats line found'],
            },
            ingestedCount: ingested,
          });
          return;
        }

        console.log('[Startup] ✓ Streaming ingestion completed successfully');
        updateProgress(basePath, { inProgress: false });
        
        resolve({
          success: true,
          error: null,
          stats: {
            filesProcessed: finalStats.filesProcessed || 0,
            parsedEntries: finalStats.parsedEntries || 0,
            countries: finalStats.countries || [],
            environments: finalStats.environments || [],
            errors: finalStats.errors || [],
          },
          ingestedCount: ingested,
        });
      });

      // Handle process errors
      pythonProcess.on('error', (error: Error) => {
        console.error('[Startup] Python process error:', error);
        updateProgress(basePath, { inProgress: false });
        resolve({
          success: false,
          error: `Python process error: ${error.message}`,
          stats: {
            filesProcessed: 0,
            parsedEntries: 0,
            countries: [],
            environments: [],
            errors: [error.message],
          },
          ingestedCount: 0,
        });
      });

    } catch (error) {
      console.error('[Startup] Error launching Python process:', error);
      updateProgress(basePath, { inProgress: false });
      resolve({
        success: false,
        error: `Failed to launch Python process: ${error}`,
        stats: {
          filesProcessed: 0,
          parsedEntries: 0,
          countries: [],
          environments: [],
          errors: [String(error)],
        },
        ingestedCount: 0,
      });
    }
  });
}

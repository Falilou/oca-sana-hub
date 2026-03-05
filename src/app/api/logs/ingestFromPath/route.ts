import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { logAnalysisService, LogEntry } from '@/services/logAnalysisService';

export const dynamic = 'force-dynamic';

/**
 * POST /api/logs/ingestFromPath
 * Ingest log files from a specified directory path
 */
export async function POST(request: NextRequest) {
  try {
    const { folderPath, country, environment } = await request.json();

    if (!folderPath || !country || !environment) {
      return NextResponse.json(
        { error: 'Missing required parameters: folderPath, country, environment' },
        { status: 400 }
      );
    }

    // Validate path exists
    if (!fs.existsSync(folderPath)) {
      return NextResponse.json(
        { error: `Path does not exist: ${folderPath}` },
        { status: 404 }
      );
    }

    const results = {
      filesProcessed: 0,
      entriesFound: 0,
      errors: [] as string[],
    };

    // Read all files in directory
    const files = fs.readdirSync(folderPath);
    const logFiles = files.filter(file => 
      file.endsWith('.log') || 
      file.endsWith('.txt') ||
      file.endsWith('.xml') ||
      !file.includes('.')
    );

    const allEntries: LogEntry[] = [];

    for (const file of logFiles) {
      try {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Sana Commerce logs are separated by "----------------------------------------"
          const logBlocks = content.split('----------------------------------------').filter(block => block.trim().length > 0);
          
          for (const block of logBlocks) {
            if (block.includes('Timestamp:')) {
              const entry = logAnalysisService.parseSanaLogEntry(block, country, environment);
              if (entry) {
                allEntries.push(entry);
              }
            }
          }
          
          results.filesProcessed++;
        }
      } catch (fileError: any) {
        results.errors.push(`Error processing ${file}: ${fileError.message}`);
      }
    }

    results.entriesFound = allEntries.length;

    // Load logs into analysis service
    logAnalysisService.addLogs(allEntries);

    return NextResponse.json({
      success: true,
      ...results,
      message: `Successfully processed ${results.filesProcessed} files with ${results.entriesFound} log entries`,
    });

  } catch (error: any) {
    console.error('Error ingesting logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to ingest logs' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logFolder, startDate, endDate, country, environment } = body;

    if (!logFolder) {
      return NextResponse.json(
        { error: 'Log folder path is required' },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (startDate && !isValidDate(startDate)) {
      return NextResponse.json(
        { error: 'Invalid start date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (endDate && !isValidDate(endDate)) {
      return NextResponse.json(
        { error: 'Invalid end date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Build Python command
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_visualizations.py');
    // Dedicated dashboard visualizations directory
    const dashboardVizDir = path.join(process.cwd(), 'public', 'dashboard-visualizations');
    const outputDir = dashboardVizDir;

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create metadata for this generation session
    const sessionMetadata = {
      timestamp: new Date().toISOString(),
      filters: {
        logFolder,
        startDate: startDate || 'all',
        endDate: endDate || 'all',
        country: country || 'all',
        environment: environment || 'all',
      },
      source: 'dashboard',
    };

    let command = `python "${scriptPath}" --log-folder "${logFolder}" --output-dir "${outputDir}"`;

    if (startDate) {
      command += ` --start-date "${startDate}"`;
    }

    if (endDate) {
      command += ` --end-date "${endDate}"`;
    }

    if (country) {
      command += ` --country "${country}"`;
    }

    if (environment) {
      command += ` --environment "${environment}"`;
    }

    console.log('[INFO] Executing Python visualization script...');
    console.log('[COMMAND]', command);

    const startTime = Date.now();

    // Execute Python script
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
      timeout: 300000, // 5 minute timeout
    });

    const executionTime = Date.now() - startTime;

    console.log('[STDOUT]', stdout);
    if (stderr) {
      console.warn('[STDERR]', stderr);
    }

    // Parse the output to find the summary JSON file
    const summaryMatch = stdout.match(/Results saved to: (.+)/);
    if (!summaryMatch) {
      return NextResponse.json(
        { error: 'Failed to locate output directory from Python script' },
        { status: 500 }
      );
    }

    const resultDir = summaryMatch[1].trim();
    const summaryFile = path.join(resultDir, 'analysis_summary.json');

    // Read summary JSON
    if (!fs.existsSync(summaryFile)) {
      return NextResponse.json(
        { error: 'Summary file not found' },
        { status: 500 }
      );
    }

    const summaryData = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));

    // Convert absolute paths to public URLs
    const visualizations = summaryData.visualizations.map((filePath: string) => {
      const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);
      return '/' + relativePath.replace(/\\/g, '/');
    });

    // Save session metadata
    const metadataPath = path.join(resultDir, 'session_metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify({
      ...sessionMetadata,
      generatedAt: new Date().toISOString(),
      executionTimeMs: executionTime,
      results: {
        totalErrors: summaryData.totalErrors,
        dateRange: summaryData.dateRange,
        visualizationCount: visualizations.length,
      },
    }, null, 2));

    return NextResponse.json({
      success: true,
      executionTimeMs: executionTime,
      executionTimeSeconds: (executionTime / 1000).toFixed(2),
      summary: {
        ...summaryData,
        visualizations,
      },
      outputDirectory: '/dashboard-visualizations/' + path.basename(resultDir),
      message: 'Visualizations generated successfully and stored in dashboard-visualizations directory',
    });

  } catch (error: any) {
    console.error('[ERROR] Visualization generation failed:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate visualizations',
        details: error.message,
        stderr: error.stderr || '',
      },
      { status: 500 }
    );
  }
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

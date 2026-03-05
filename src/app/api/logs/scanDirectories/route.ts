import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * POST /api/logs/scanDirectories
 * Scan a base directory to find all country/environment log folders
 */
export async function POST(request: NextRequest) {
  try {
    const { basePath } = await request.json();

    if (!basePath) {
      return NextResponse.json(
        { error: 'Missing required parameter: basePath' },
        { status: 400 }
      );
    }

    if (!fs.existsSync(basePath)) {
      return NextResponse.json(
        { error: `Base path does not exist: ${basePath}` },
        { status: 404 }
      );
    }

    const discoveries: Array<{
      country: string;
      environment: string;
      path: string;
      fileCount: number;
    }> = [];

    // Read directory structure
    // Expected format: basePath/country/environment/logs
    const countries = fs.readdirSync(basePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const country of countries) {
      const countryPath = path.join(basePath, country);
      
      try {
        const environments = fs.readdirSync(countryPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

        for (const env of environments) {
          const envPath = path.join(countryPath, env);
          
          // Count log files
          try {
            const files = fs.readdirSync(envPath);
            const logFiles = files.filter(file => 
              file.endsWith('.log') || 
              file.endsWith('.txt') ||
              file.endsWith('.xml') ||
              !file.includes('.')
            );

            if (logFiles.length > 0) {
              discoveries.push({
                country,
                environment: env.toUpperCase(),
                path: envPath,
                fileCount: logFiles.length,
              });
            }
          } catch (error) {
            // Skip if can't read directory
          }
        }
      } catch (error) {
        // Skip if can't read country directory
      }
    }

    return NextResponse.json({
      success: true,
      basePath,
      discoveries,
      totalDiscovered: discoveries.length,
    });

  } catch (error: any) {
    console.error('Error scanning directories:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scan directories' },
      { status: 500 }
    );
  }
}

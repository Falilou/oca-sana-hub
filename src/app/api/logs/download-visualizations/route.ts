import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all' or 'individual'
    const timestamp = searchParams.get('timestamp');
    const filename = searchParams.get('filename');

    if (!timestamp) {
      return NextResponse.json(
        { error: 'Timestamp parameter required' },
        { status: 400 }
      );
    }

    const vizDir = path.join(process.cwd(), 'public', 'dashboard-visualizations', timestamp);

    // Verify directory exists
    if (!fs.existsSync(vizDir)) {
      return NextResponse.json(
        { error: 'Visualization directory not found' },
        { status: 404 }
      );
    }

    // Download individual file
    if (type === 'individual' && filename) {
      const filePath = path.join(vizDir, filename);

      // Security check: ensure file is within viz directory
      if (!filePath.startsWith(vizDir)) {
        return NextResponse.json(
          { error: 'Invalid file path' },
          { status: 400 }
        );
      }

      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }

      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // Download all visualizations as ZIP
    if (type === 'all') {
      const files = fs.readdirSync(vizDir);
      const pngFiles = files.filter(f => f.endsWith('.png'));
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      if (pngFiles.length === 0 && jsonFiles.length === 0) {
        return NextResponse.json(
          { error: 'No files to download' },
          { status: 404 }
        );
      }

      // Create ZIP archive with stream buffering
      return await new Promise<Response>((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const zipFilename = `log-visualizations-${timestamp}.zip`;
        const chunks: Uint8Array[] = [];

        // Collect archive data into chunks
        archive.on('data', (chunk: Buffer) => {
          chunks.push(new Uint8Array(chunk));
        });

        archive.on('end', () => {
          // Combine chunks into single buffer
          const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
          const buffer = new Uint8Array(totalSize);
          let offset = 0;
          for (const chunk of chunks) {
            buffer.set(chunk, offset);
            offset += chunk.length;
          }

          const response = new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/zip',
              'Content-Disposition': `attachment; filename="${zipFilename}"`,
              'Cache-Control': 'no-store',
            },
          });
          resolve(response);
        });

        archive.on('error', (err: Error) => {
          reject(err);
        });

        // Add files to archive
        for (const file of pngFiles) {
          archive.file(path.join(vizDir, file), { name: file });
        }
        for (const file of jsonFiles) {
          archive.file(path.join(vizDir, file), { name: file });
        }

        // Finalize archive
        archive.finalize();
      });
    }

    return NextResponse.json(
      { error: 'Invalid download type' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[ERROR] Download failed:', error);
    return NextResponse.json(
      { error: 'Download failed', details: error.message },
      { status: 500 }
    );
  }
}

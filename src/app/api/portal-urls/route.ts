import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'portal-urls.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// GET - Fetch portal URLs
export async function GET() {
  try {
    await ensureDataDirectory();
    
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      const urls = JSON.parse(data);
      return NextResponse.json({ success: true, data: urls });
    } catch (error) {
      // If file doesn't exist, return empty object
      return NextResponse.json({ success: true, data: {} });
    }
  } catch (error) {
    console.error('Error reading portal URLs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read portal URLs' },
      { status: 500 }
    );
  }
}

// POST - Save portal URLs
export async function POST(request: NextRequest) {
  try {
    await ensureDataDirectory();
    
    const urls = await request.json();
    
    // Validate the data structure
    if (!urls || typeof urls !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    // Write to file
    await fs.writeFile(DATA_FILE, JSON.stringify(urls, null, 2), 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Portal URLs saved successfully',
      data: urls 
    });
  } catch (error) {
    console.error('Error saving portal URLs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save portal URLs' },
      { status: 500 }
    );
  }
}

// PUT - Update specific portal URL (supports both public and admin URLs)
export async function PUT(request: NextRequest) {
  try {
    await ensureDataDirectory();
    
    const { country, environment, publicUrl, adminUrl } = await request.json();
    
    if (!country || !environment || (publicUrl === undefined && adminUrl === undefined)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Read existing data
    let urls: any = {};
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      urls = JSON.parse(data);
    } catch {
      // File doesn't exist, start with empty object
    }
    
    // Initialize country and environment if they don't exist
    if (!urls[country]) {
      urls[country] = {};
    }
    if (!urls[country][environment]) {
      urls[country][environment] = { public: '', admin: '' };
    }
    
    // Update URLs (preserve existing values if not provided)
    if (publicUrl !== undefined) {
      urls[country][environment].public = publicUrl;
    }
    if (adminUrl !== undefined) {
      urls[country][environment].admin = adminUrl;
    }
    
    // Save back to file
    await fs.writeFile(DATA_FILE, JSON.stringify(urls, null, 2), 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Portal URLs updated successfully',
      data: urls 
    });
  } catch (error) {
    console.error('Error updating portal URL:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update portal URL' },
      { status: 500 }
    );
  }
}

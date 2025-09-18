import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Camera {
  id: string;
  name: string;
  playbackId: string;
  streamId: string;
  isActive: boolean;
  description: string;
}

interface Database {
  users: any[];
  cameras: Camera[];
  chatMessages: any[];
}

export async function GET(request: NextRequest) {
  try {
    // Read database
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf8');
    const db: Database = JSON.parse(dbData);

    // Return only active cameras
    const activeCameras = db.cameras.filter(camera => camera.isActive);

    return NextResponse.json(
      { 
        success: true,
        cameras: activeCameras 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cameras API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch cameras',
        cameras: [] 
      },
      { status: 500 }
    );
  }
}

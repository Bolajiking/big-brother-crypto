import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

interface Database {
  users: User[];
  cameras: unknown[];
  chatMessages: unknown[];
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Read database
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf8');
    const db: Database = JSON.parse(dbData);

    // Find user
    const user = db.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Login successful',
          user: { id: user.id, username: user.username }
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Camera {
  id: string;
  name: string;
  playbackId: string;
  streamId: string;
  streamKey?: string | null;
  isActive: boolean;
  isLive?: boolean;
  viewerCount?: number;
  description: string;
}

interface Database {
  users: unknown[];
  cameras: Camera[];
  chatMessages: unknown[];
}

const DIRECTOR_CAMERA_NAME = "director's view";
const DIRECTOR_CAMERA_DESCRIPTION = 'The main show feed. We follow the action across the house.';

type LivepeerStream = {
  id?: string;
  name?: string;
  playbackId?: string;
  streamKey?: string;
  isActive?: boolean;
  suspended?: boolean;
  lastSeen?: number;
  playback?: {
    id?: string;
  };
};

const normalizeLivepeerStreams = (payload: unknown): LivepeerStream[] => {
  if (Array.isArray(payload)) return payload as LivepeerStream[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: LivepeerStream[] }).data;
  }
  return [];
};

const getLivepeerStreams = async (): Promise<LivepeerStream[]> => {
  const apiKey = process.env.LIVEPEER_API_KEY;
  if (!apiKey) return [];

  const response = await fetch('https://livepeer.studio/api/stream', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    console.warn('Livepeer streams request failed:', response.status);
    return [];
  }

  return normalizeLivepeerStreams(await response.json());
};

const isDirectorCamera = (camera: Pick<Camera, 'name'>) => (
  camera.name.trim().toLowerCase() === DIRECTOR_CAMERA_NAME
);

const getCameraDescription = (name: string, currentDescription?: string | null) => {
  if (name.trim().toLowerCase() === DIRECTOR_CAMERA_NAME) {
    return DIRECTOR_CAMERA_DESCRIPTION;
  }

  return currentDescription || `${name} Livepeer stream`;
};

const prioritizeDirectorCamera = (cameras: Camera[]) => (
  cameras
    .map((camera, index) => ({ camera, index }))
    .sort((a, b) => {
      if (isDirectorCamera(a.camera)) return -1;
      if (isDirectorCamera(b.camera)) return 1;
      return a.index - b.index;
    })
    .map(({ camera }) => camera)
);

const serializeCameras = (cameras: Camera[]) => (
  cameras.map(camera => ({
    id: camera.id,
    name: camera.name,
    playbackId: camera.playbackId,
    streamId: camera.streamId,
    isActive: camera.isActive,
    isLive: camera.isLive,
    viewerCount: camera.viewerCount,
    description: camera.description,
  }))
);

const jsonNoStore = (body: unknown, status = 200) => (
  NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  })
);

const mergeLivepeerStatus = async (cameras: Camera[]): Promise<Camera[]> => {
  const streams = await getLivepeerStreams();
  if (streams.length === 0) return cameras;

  const byId = new Map(streams.map(stream => [stream.id, stream]));

  return Promise.all(cameras.map(async (camera) => {
    const stream = byId.get(camera.streamId) || byId.get(camera.id);
    if (!stream) return camera;

    const isLive = Boolean(stream.isActive);
    const isActive = !stream.suspended;
    const playbackId = stream.playbackId || stream.playback?.id || camera.playbackId;
    const description = getCameraDescription(stream.name || camera.name, camera.description);
    const streamKeyChanged = Boolean(stream.streamKey && camera.streamKey !== stream.streamKey);

    if (
      camera.isLive !== isLive ||
      camera.isActive !== isActive ||
      camera.playbackId !== playbackId ||
      camera.description !== description ||
      streamKeyChanged
    ) {
      await prisma.camera.update({
        where: { id: camera.id },
        data: {
          playbackId,
          isActive,
          isLive,
          description,
          ...(stream.streamKey ? { streamKey: stream.streamKey } : {}),
        },
      });
    }

    return {
      ...camera,
      playbackId,
      isActive,
      isLive,
      description,
      streamKey: stream.streamKey || camera.streamKey,
    };
  }));
};

const loadLivepeerCameras = async (): Promise<Camera[]> => {
  const streams = (await getLivepeerStreams())
    .filter(stream => stream.id && (stream.playbackId || stream.playback?.id));

  const cameras = await Promise.all(streams.map((stream, index) => {
    const playbackId = stream.playbackId || stream.playback?.id || '';
    const streamId = stream.id || playbackId;
    const name = stream.name || `Camera ${index + 1}`;
    const isLive = Boolean(stream.isActive);

    return prisma.camera.upsert({
      where: { id: streamId },
      update: {
        name,
        playbackId,
        streamId,
        isActive: !stream.suspended,
        isLive,
        description: getCameraDescription(name),
        ...(stream.streamKey ? { streamKey: stream.streamKey } : {}),
      },
      create: {
        id: streamId,
        name,
        playbackId,
        streamId,
        isActive: !stream.suspended,
        isLive,
        description: getCameraDescription(name),
        ...(stream.streamKey ? { streamKey: stream.streamKey } : {}),
      },
      select: {
        id: true,
        name: true,
        playbackId: true,
        streamId: true,
        streamKey: true,
        isActive: true,
        isLive: true,
        viewerCount: true,
        description: true,
      },
    });
  }));

  return cameras
    .filter(camera => camera.isActive)
    .map(camera => ({
      ...camera,
      description: camera.description || '',
    }));
};

export async function GET() {
  try {
    let cameras: Camera[] = [];

    try {
      cameras = (await prisma.camera.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          playbackId: true,
          streamId: true,
          streamKey: true,
          isActive: true,
          isLive: true,
          viewerCount: true,
          description: true,
        },
      })).map(camera => ({
        ...camera,
        description: camera.description || '',
      }));

      cameras = await mergeLivepeerStatus(cameras);
    } catch (databaseError) {
      console.warn('Cameras database read failed, using fixture fallback:', databaseError);
    }

    if (cameras.length > 0) {
      return jsonNoStore(
        {
          success: true,
          source: 'database',
          cameras: serializeCameras(prioritizeDirectorCamera(cameras)),
        },
        200
      );
    }

    try {
      cameras = await loadLivepeerCameras();
    } catch (livepeerError) {
      console.warn('Livepeer camera sync failed, using fixture fallback:', livepeerError);
    }

    if (cameras.length > 0) {
      return jsonNoStore(
        {
          success: true,
          source: 'livepeer',
          cameras: serializeCameras(prioritizeDirectorCamera(cameras)),
        },
        200
      );
    }

    // Fall back to the legacy local fixture so demo/dev still has cameras
    // before the Neon database is seeded.
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf8');
    const db: Database = JSON.parse(dbData);

    // Return only active cameras
    const activeCameras = db.cameras.filter(camera => camera.isActive);

    return jsonNoStore(
      { 
        success: true,
        source: 'fixture',
        cameras: serializeCameras(prioritizeDirectorCamera(activeCameras))
      },
      200
    );
  } catch (error) {
    console.error('Cameras API error:', error);
    return jsonNoStore(
      { 
        success: false, 
        message: 'Failed to fetch cameras',
        cameras: [] 
      },
      500
    );
  }
}

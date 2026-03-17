'use client';

import React from 'react';

interface Camera {
  id: string;
  name: string;
  playbackId: string;
  streamId: string;
  isActive: boolean;
  description: string;
}

interface MultiCamGridProps {
  cameras: Camera[];
  onStreamClick: (playbackId: string, cameraName: string) => void;
  selectedPlaybackId?: string;
}

const MultiCamGrid: React.FC<MultiCamGridProps> = ({
  cameras,
  onStreamClick,
  selectedPlaybackId
}) => {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-black uppercase tracking-tight">Camera Feeds</h2>
        <div className="text-xs font-bold uppercase tracking-[0.15em] text-sf-text-secondary bg-sf-bg-tertiary px-2 py-1 rounded-3xl">
          {cameras.filter(c => c.isActive).length} cameras ready
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full overflow-y-auto">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            onClick={() => {
              onStreamClick(camera.playbackId, camera.name);
            }}
            className={`border-2 rounded-3xl cursor-pointer hover:border-sf-glass-border-hover transition-colors ${
              selectedPlaybackId === camera.playbackId
                ? 'border-sf-status-success'
                : 'border-sf-glass-border'
            }`}
          >
            {/* Stream Thumbnail */}
            <div className="relative h-48 md:h-64 w-full bg-black rounded-t-3xl overflow-hidden">
              {/* Static Background - Always visible */}
              <div className="absolute inset-0 bg-black">
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `
                      repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 1px,
                        rgba(255,255,255,0.1) 1px,
                        rgba(255,255,255,0.1) 2px
                      ),
                      repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 1px,
                        rgba(255,255,255,0.1) 1px,
                        rgba(255,255,255,0.1) 2px
                      )
                    `,
                    animation: 'static 0.1s infinite linear'
                  }}
                />
              </div>

              {/* Live Video Overlay - Only when stream is active */}
              <video
                src={`https://playback.livepeer.studio/hls/${camera.playbackId}/index.m3u8`}
                className={`w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
                  camera.isActive ? 'opacity-100' : 'opacity-0'
                }`}
                muted
                playsInline
                loop
                autoPlay
                preload="metadata"
                onLoadStart={() => {
                  console.log(`Video load started for ${camera.name}`);
                }}
                onCanPlay={() => {
                  console.log(`Video can play for ${camera.name}`);
                }}
                onPlaying={() => {
                  console.log(`Video playing for ${camera.name}`);
                }}
                onError={(e) => {
                  console.log(`Video error for ${camera.name}:`, e);
                  // Silently handle video errors - just hide the video
                  const target = e.target as HTMLVideoElement;
                  if (target) {
                    target.style.display = 'none';
                  }
                }}
              />
              
              {/* Status Indicator */}
              <div className="absolute top-2 right-2">
                <div className={`w-4 h-4 rounded-full border-2 border-white ${
                  camera.isActive ? 'bg-sf-status-success animate-pulse' : 'bg-sf-status-error'
                }`}></div>
              </div>
              
              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="w-16 h-16 bg-sf-accent-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Camera name displayed underneath */}
            <div className="bg-sf-bg-tertiary px-3 py-2 text-center rounded-b-3xl">
              <h3 className="text-white text-sm font-medium">{camera.name}</h3>
            </div>
            
          </div>
        ))}
      </div>
      
      {cameras.length === 0 && (
        <div className="text-center text-sf-text-secondary py-8">
          <p>No cameras available</p>
        </div>
      )}

      {cameras.length > 0 && cameras.every(c => !c.isActive) && (
        <div className="text-center text-sf-text-secondary py-8">
          <div className="bg-sf-bg-tertiary border-2 border-sf-glass-border p-4 rounded-3xl">
            <p className="text-sm mb-2">📹 All cameras are ready for streaming</p>
            <p className="text-xs text-sf-text-muted">
              Start streaming to RTMP endpoints to see live feeds
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiCamGrid;

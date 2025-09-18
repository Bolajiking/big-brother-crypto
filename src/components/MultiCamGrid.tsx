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
    <div className="h-full bg-gray-800 p-4 rounded">
      <h2 className="text-gray-200 text-xl font-bold mb-4">Camera Feeds</h2>
      <div className="grid grid-cols-4 gap-4 h-full overflow-y-auto">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            onClick={() => {
              onStreamClick(camera.playbackId, camera.name);
            }}
            className={`border-2 rounded cursor-pointer hover:border-gray-400 transition-colors ${
              selectedPlaybackId === camera.playbackId 
                ? 'border-green-500' 
                : 'border-gray-600'
            }`}
          >
            {/* Stream Thumbnail */}
            <div className="relative h-64 w-full bg-black rounded-t overflow-hidden">
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
                src={`https://livepeercdn.com/hls/${camera.playbackId}/index.m3u8`}
                className={`w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
                  camera.isActive ? 'opacity-100' : 'opacity-0'
                }`}
                muted
                playsInline
                loop
                autoPlay
                onError={(e) => {
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
                  camera.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
              </div>
              
              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Camera name displayed underneath */}
            <div className="bg-gray-700 px-3 py-2 text-center">
              <h3 className="text-gray-200 text-sm font-medium">{camera.name}</h3>
            </div>
            
          </div>
        ))}
      </div>
      
      {cameras.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>No cameras available</p>
        </div>
      )}
    </div>
  );
};

export default MultiCamGrid;

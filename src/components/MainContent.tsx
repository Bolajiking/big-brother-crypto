'use client';

import React from 'react';
import MainPlayer from './MainPlayer';
import MultiCamGrid from './MultiCamGrid';

interface Camera {
  id: string;
  name: string;
  playbackId: string;
  streamId: string;
  isActive: boolean;
  description: string;
}

interface MainContentProps {
  selectedPlaybackId: string;
  cameras: Camera[];
  onThumbnailClick: (playbackId: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  selectedPlaybackId,
  cameras,
  onThumbnailClick
}) => {
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Main Player */}
      <div className="flex-1 min-h-0">
        <MainPlayer playbackId={selectedPlaybackId} />
      </div>

      {/* Multi-Cam Grid */}
      <div className="h-64">
        <MultiCamGrid 
          cameras={cameras}
          onThumbnailClick={onThumbnailClick}
          selectedPlaybackId={selectedPlaybackId}
        />
      </div>
    </div>
  );
};

export default MainContent;

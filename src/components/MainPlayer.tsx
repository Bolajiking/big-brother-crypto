'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface MainPlayerProps {
  playbackId: string;
  className?: string;
}

const MainPlayer: React.FC<MainPlayerProps> = ({ playbackId, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playbackId || !videoRef.current) return;

    const video = videoRef.current;
    const videoSrc = `https://livepeer.studio/api/playback/${playbackId}`;

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    const initializePlayer = () => {
      cleanup();

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsRef.current = hls;

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('HLS media attached');
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed');
          setIsLoading(false);
          setError(null);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            setError(`Stream error: ${data.details}`);
            setIsLoading(false);
          }
        });

        hls.loadSource(videoSrc);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = videoSrc;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          setError(null);
        });
        video.addEventListener('error', () => {
          setError('Failed to load stream');
          setIsLoading(false);
        });
      } else {
        setError('HLS not supported in this browser');
        setIsLoading(false);
      }
    };

    initializePlayer();

    return cleanup;
  }, [playbackId]);

  return (
    <div className={`relative bg-gray-800 border border-gray-600 overflow-hidden rounded ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Loading stream...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
          <div className="text-center text-red-400">
            <p className="text-lg font-bold mb-2">Stream Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls
        playsInline
        muted
        autoPlay
      />
    </div>
  );
};

export default MainPlayer;

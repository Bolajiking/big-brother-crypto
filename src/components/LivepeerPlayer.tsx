'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface LivepeerPlayerProps {
  playbackId: string;
  isMainPlayer?: boolean;
  className?: string;
  onClick?: () => void;
}

const LivepeerPlayer: React.FC<LivepeerPlayerProps> = ({
  playbackId,
  isMainPlayer = false,
  className = '',
  onClick
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLive, setIsLive] = useState(false);
  useEffect(() => {
    if (!playbackId) return;

    const video = videoRef.current;
    if (!video) return;

    // Validate playback ID format
    if (!playbackId || playbackId.length < 10) {
      setHasError(true);
      setErrorMessage('Invalid playback ID');
      setIsLoading(false);
      return;
    }

    const initializeHls = () => {
      // Clean up existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Use the correct Livepeer API endpoint
      const url = `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`;
      
      // Set a timeout to prevent hanging
      timeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setHasError(true);
          setErrorMessage('Stream timeout');
          setIsLoading(false);
        }
      }, 10000); // 10 second timeout

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 5
        });

        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          console.log('HLS manifest parsed successfully');
          setIsLoading(false);
          setHasError(false);
          setIsLive(true);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          // Only log non-fatal errors to reduce console spam
          if (data.fatal) {
            console.log('Stream not available for playback ID:', playbackId, 'Error details:', data);
            setHasError(true);
            setErrorMessage('Stream not available');
            setIsLoading(false);
            setIsLive(false);
          } else {
            // Non-fatal errors - stream might still work
            console.log('Non-fatal HLS error:', data);
          }
        });

        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setIsLoading(false);
          setHasError(false);
          setIsLive(true);
        });
        video.addEventListener('error', () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setHasError(true);
          setErrorMessage('Stream not available');
          setIsLoading(false);
          setIsLive(false);
        });
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setHasError(true);
        setErrorMessage('HLS not supported');
        setIsLoading(false);
        setIsLive(false);
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      setIsLive(false);
    };

    const handleError = (e: any) => {
      console.error('Video error:', e);
      setHasError(true);
      setErrorMessage('Video playback error');
      setIsLoading(false);
      setIsLive(false);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('error', handleError);

    initializeHls();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('error', handleError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playbackId]);

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Static Background - Always visible with high contrast */}
      <div className="absolute inset-0 bg-black">
        {/* High contrast static pattern */}
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
        {/* Dots pattern */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 1px, transparent 1px),
              radial-gradient(circle at 40% 60%, rgba(255,255,255,0.15) 1px, transparent 1px),
              radial-gradient(circle at 60% 40%, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '4px 4px, 6px 6px, 8px 8px, 10px 10px',
            animation: 'static 0.05s infinite linear'
          }}
        />
        {/* Additional noise overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              repeating-conic-gradient(
                from 0deg at 50% 50%,
                transparent 0deg,
                rgba(255,255,255,0.05) 1deg,
                transparent 2deg
              )
            `,
            animation: 'static 0.08s infinite linear'
          }}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-pulse">
              <p className="text-gray-300 text-sm">Connecting...</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-2 right-2 z-20">
        <div className={`w-4 h-4 rounded-full border-2 border-white ${
          isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}></div>
      </div>


      {/* Video Player */}
      <video
        ref={videoRef}
        autoPlay={isMainPlayer}
        controls={isMainPlayer}
        muted={!isMainPlayer}
        playsInline
        loop
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLive ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          aspectRatio: isMainPlayer ? '16/9' : '4/3',
          backgroundColor: '#000000'
        }}
      />
    </div>
  );
};

export default LivepeerPlayer;

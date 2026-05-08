'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Hls from 'hls.js';

export interface LivepeerPlayerState {
  isPaused: boolean;
  isMuted: boolean;
  isLive: boolean;
  isBuffering: boolean;
  hasVideoFrame: boolean;
  isPictureInPicture: boolean;
  volume: number;
}

export interface LivepeerPlayerHandle {
  togglePlay: () => Promise<boolean>;
  toggleMuted: () => boolean;
  setVolume: (volume: number) => number;
  syncToLive: () => Promise<void>;
  togglePictureInPicture: () => Promise<boolean>;
  fullscreen: () => Promise<void>;
}

interface LivepeerPlayerProps {
  playbackId: string;
  isMainPlayer?: boolean;
  autoPlay?: boolean;
  showControls?: boolean;
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
  onStateChange?: (state: LivepeerPlayerState) => void;
}

const LivepeerPlayer = forwardRef<LivepeerPlayerHandle, LivepeerPlayerProps>(({
  playbackId,
  isMainPlayer = false,
  autoPlay,
  showControls,
  showStatus = true,
  className = '',
  onClick,
  onStateChange
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const shouldAutoPlay = autoPlay ?? isMainPlayer;
  const shouldShowControls = showControls ?? false;
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(shouldAutoPlay);
  const [hasVideoFrame, setHasVideoFrame] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [volume, setVolumeState] = useState(1);

  useEffect(() => {
    onStateChange?.({
      isPaused,
      isMuted,
      isLive,
      isBuffering: isLoading,
      hasVideoFrame,
      isPictureInPicture,
      volume,
    });
  }, [hasVideoFrame, isLive, isLoading, isMuted, isPaused, isPictureInPicture, onStateChange, volume]);

  useImperativeHandle(ref, () => ({
    togglePlay: async () => {
      const video = videoRef.current;
      if (!video) return isPaused;

      if (video.paused) {
        await video.play();
        setIsPaused(false);
        setIsLive(true);
        return false;
      }

      video.pause();
      setIsPaused(true);
      return true;
    },
    toggleMuted: () => {
      const video = videoRef.current;
      const nextMuted = !isMuted;
      if (video) {
        video.muted = nextMuted;
        if (!nextMuted && video.volume === 0) {
          video.volume = 1;
          setVolumeState(1);
        }
      }
      setIsMuted(nextMuted);
      return nextMuted;
    },
    setVolume: (nextVolume: number) => {
      const video = videoRef.current;
      const clampedVolume = Math.min(Math.max(nextVolume, 0), 1);
      if (video) {
        video.volume = clampedVolume;
        video.muted = clampedVolume === 0;
      }
      setVolumeState(clampedVolume);
      setIsMuted(clampedVolume === 0);
      return clampedVolume;
    },
    syncToLive: async () => {
      const video = videoRef.current;
      if (!video) return;

      const seekableRangeCount = video.seekable.length;
      if (seekableRangeCount > 0) {
        const liveEdge = video.seekable.end(seekableRangeCount - 1);
        if (Number.isFinite(liveEdge)) {
          video.currentTime = Math.max(liveEdge - 0.75, 0);
        }
      }

      hlsRef.current?.startLoad(-1);
      if (video.paused) {
        await video.play();
      }
    },
    togglePictureInPicture: async () => {
      const video = videoRef.current;
      if (!video || !document.pictureInPictureEnabled) return false;

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPictureInPicture(false);
        return false;
      }

      await video.requestPictureInPicture();
      setIsPictureInPicture(true);
      return true;
    },
    fullscreen: async () => {
      const target = containerRef.current || videoRef.current;
      if (!target?.requestFullscreen) return;
      await target.requestFullscreen();
    },
  }), [isMuted, isPaused]);

  const markVideoFrameReady = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    retryCountRef.current = 0;
    setIsLoading(false);
    setIsLive(true);
    setHasVideoFrame(true);
  };

  useEffect(() => {
    if (!playbackId) return;

    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setIsLive(false);
    setIsPaused(true);
    setIsMuted(shouldAutoPlay);
    setHasVideoFrame(false);
    retryCountRef.current = 0;

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Validate playback ID format
    if (!playbackId || playbackId.length < 10) {
      setIsLoading(false);
      return;
    }

    const attemptAutoplay = async () => {
      if (!shouldAutoPlay || !video.paused) return;

      video.muted = true;
      setIsMuted(true);

      try {
        await video.play();
      } catch (error) {
        console.warn('Livepeer autoplay blocked until user interaction:', error);
        setIsPaused(true);
      }
    };

    const markReady = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      retryCountRef.current = 0;
      setIsLive(true);
      void attemptAutoplay();
    };

    const scheduleRetry = (hls: Hls) => {
      retryCountRef.current += 1;
      const delay = Math.min(1000 * retryCountRef.current, 5000);

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      setIsLoading(true);
      retryTimeoutRef.current = setTimeout(() => {
        hls.startLoad(-1);
      }, delay);
    };

    const initializeHls = () => {
      // Clean up existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Livepeer documents HLS playback through the Studio CDN host.
      const url = `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`;
      
      // Set a timeout to prevent hanging
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 10000); // 10 second timeout

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 5,
          xhrSetup: (xhr) => {
            // Handle CORS and redirects properly for Livepeer
            xhr.withCredentials = false;
            xhr.setRequestHeader('Accept', 'application/vnd.apple.mpegurl, application/x-mpegurl, application/octet-stream');
          }
        });

        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed successfully');
          markReady();
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          console.log('HLS Error:', JSON.stringify({
            type: data.type,
            details: data.details,
            fatal: data.fatal,
            url: url,
            playbackId: playbackId
          }));
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Fatal network error, trying to recover...');
                scheduleRetry(hls);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Fatal media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.log('Fatal error, cannot recover');
                setIsLoading(false);
                setIsLive(false);
                break;
            }
          } else {
            // Non-fatal errors - stream might still work
            console.log('Non-fatal HLS error, continuing...');
          }
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          markReady();
        });
        video.addEventListener('error', () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setIsLoading(false);
          setIsLive(false);
        });
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsLoading(false);
        setIsLive(false);
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setIsLive(false);
      setHasVideoFrame(false);
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setIsLoading(false);
      setIsLive(false);
      setHasVideoFrame(false);
    };
    const handleEnterPictureInPicture = () => setIsPictureInPicture(true);
    const handleLeavePictureInPicture = () => setIsPictureInPicture(false);

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('error', handleError);
    video.addEventListener('enterpictureinpicture', handleEnterPictureInPicture);
    video.addEventListener('leavepictureinpicture', handleLeavePictureInPicture);

    initializeHls();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('error', handleError);
      video.removeEventListener('enterpictureinpicture', handleEnterPictureInPicture);
      video.removeEventListener('leavepictureinpicture', handleLeavePictureInPicture);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playbackId, shouldAutoPlay]);

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Static Background - Always visible with high contrast */}
      <div className="absolute inset-0 z-0 bg-black pointer-events-none">
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
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-white text-center">
            <div className="animate-pulse">
              <p className="text-gray-300 text-sm">Connecting...</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {showStatus && (
        <div className="absolute top-2 right-2 z-30">
          <div className={`w-4 h-4 rounded-full border-2 border-white ${
            isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
        </div>
      )}


      {/* Video Player */}
      <video
        ref={videoRef}
        autoPlay={shouldAutoPlay}
        controls={shouldShowControls}
        muted={isMuted}
        preload="auto"
        crossOrigin="anonymous"
        playsInline
        loop
        onCanPlay={(event) => {
          markVideoFrameReady();
          if (shouldAutoPlay && event.currentTarget.paused) {
            event.currentTarget.muted = true;
            setIsMuted(true);
            event.currentTarget.play().catch((error) => {
              console.warn('Livepeer autoplay blocked until user interaction:', error);
              setIsPaused(true);
            });
          }
        }}
        onLoadedData={() => {
          markVideoFrameReady();
        }}
        onPlaying={() => {
          setIsPaused(false);
          markVideoFrameReady();
        }}
        onPause={() => setIsPaused(true)}
        onVolumeChange={(event) => {
          setIsMuted(event.currentTarget.muted);
          setVolumeState(event.currentTarget.volume);
        }}
        onWaiting={() => {
          if (!hasVideoFrame) setIsLoading(true);
        }}
        className={`relative z-10 block w-full h-full object-cover transition-opacity duration-300 ${
          hasVideoFrame ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          aspectRatio: isMainPlayer ? '16/9' : '4/3',
          backgroundColor: '#000000'
        }}
      />
    </div>
  );
});

LivepeerPlayer.displayName = 'LivepeerPlayer';

export default LivepeerPlayer;

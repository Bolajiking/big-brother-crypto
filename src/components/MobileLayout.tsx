'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import MultiCamGrid from './MultiCamGrid';
import Chat from './Chat';
import InteractiveWidgets from './InteractiveWidgets';
import LivepeerPlayer from './LivepeerPlayer';
import { MarketCreationData } from '@/types/prediction';

interface Camera {
  id: string;
  name: string;
  playbackId: string;
  streamId: string;
  isActive: boolean;
  description: string;
}

interface MobileLayoutProps {
  cameras: Camera[];
  selectedPlaybackId: string | null;
  onStreamClick: (playbackId: string, cameraName: string) => void;
  onRequireLogin?: () => void;
  isAuthenticated?: boolean;
  userEmail?: string;
  onCreateMarket?: (data: MarketCreationData) => void;
}

type OverlayHeight = 'collapsed' | 'half' | 'full';

const MobileLayout: React.FC<MobileLayoutProps> = ({
  cameras,
  selectedPlaybackId,
  onRequireLogin,
  isAuthenticated = false,
  userEmail,
  onCreateMarket
}) => {
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'chat' | 'interact'>('none');
  const [overlayHeight, setOverlayHeight] = useState<OverlayHeight>('half');
  const [fullScreenStream, setFullScreenStream] = useState<{playbackId: string, cameraName: string} | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get overlay height in pixels based on state
  const getOverlayHeightClass = useCallback(() => {
    switch (overlayHeight) {
      case 'collapsed':
        return 'h-[120px]';
      case 'half':
        return 'h-[55vh]';
      case 'full':
        return 'h-[85vh]';
      default:
        return 'h-[55vh]';
    }
  }, [overlayHeight]);

  // Handle drag start
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
    setCurrentTranslateY(0);
  };

  // Handle drag move
  const handleDragMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartY;
    setCurrentTranslateY(deltaY);
  }, [isDragging, dragStartY]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // Determine new height based on drag distance
    const threshold = 50;

    if (currentTranslateY > threshold) {
      // Dragged down - collapse or close
      if (overlayHeight === 'full') {
        setOverlayHeight('half');
      } else if (overlayHeight === 'half') {
        setOverlayHeight('collapsed');
      } else {
        setActiveOverlay('none');
      }
    } else if (currentTranslateY < -threshold) {
      // Dragged up - expand
      if (overlayHeight === 'collapsed') {
        setOverlayHeight('half');
      } else if (overlayHeight === 'half') {
        setOverlayHeight('full');
      }
    }

    setCurrentTranslateY(0);
  }, [isDragging, currentTranslateY, overlayHeight]);

  // Add/remove global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleStreamClick = (playbackId: string, cameraName: string) => {
    setFullScreenStream({ playbackId, cameraName });
  };

  const handleCloseFullScreen = () => {
    setFullScreenStream(null);
  };

  const toggleOverlay = (overlay: 'chat' | 'interact') => {
    if (activeOverlay === overlay) {
      // Toggle through states: half -> full -> collapsed -> close
      if (overlayHeight === 'half') {
        setOverlayHeight('full');
      } else if (overlayHeight === 'full') {
        setOverlayHeight('collapsed');
      } else {
        setActiveOverlay('none');
        setOverlayHeight('half');
      }
    } else {
      setActiveOverlay(overlay);
      setOverlayHeight('half');
    }
  };

  const closeOverlay = () => {
    setActiveOverlay('none');
    setOverlayHeight('half');
  };

  if (!isMounted) {
    return (
      <div className="h-screen bg-sf-bg-primary flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center text-sf-text-secondary">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sf-accent-primary mx-auto mb-2"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Overlay Content Component
  const OverlayContent = ({ type }: { type: 'chat' | 'interact' }) => (
    <div
      ref={overlayRef}
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${getOverlayHeightClass()}`}
      style={{
        transform: isDragging ? `translateY(${currentTranslateY}px)` : 'translateY(0)',
      }}
    >
      {/* Glass morphism backdrop */}
      <div className="absolute inset-0 bg-sf-bg-secondary/95 backdrop-blur-xl border-t border-sf-glass-border rounded-t-3xl shadow-2xl" />

      {/* Content container */}
      <div className="relative h-full flex flex-col">
        {/* Drag Handle Bar */}
        <div
          className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="w-10 h-1 bg-sf-text-muted/50 rounded-full mx-auto" />
        </div>

        {/* Header with title and controls */}
        <div className="flex-shrink-0 px-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              type === 'chat'
                ? 'bg-sf-accent-primary/20'
                : 'bg-sf-accent-secondary/20'
            }`}>
              {type === 'chat' ? (
                <svg className="w-4 h-4 text-sf-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-sf-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">
                {type === 'chat' ? 'Live Chat' : 'Interact'}
              </h3>
              <p className="text-sf-text-muted text-xs">
                {overlayHeight === 'collapsed' ? 'Tap to expand' :
                 overlayHeight === 'half' ? 'Swipe up to expand' :
                 'Full screen'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Height toggle buttons */}
            <div className="flex items-center gap-1 bg-sf-bg-tertiary rounded-lg p-1">
              <button
                onClick={() => setOverlayHeight('collapsed')}
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                  overlayHeight === 'collapsed'
                    ? 'bg-sf-accent-primary text-white'
                    : 'text-sf-text-muted hover:text-white'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={() => setOverlayHeight('half')}
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                  overlayHeight === 'half'
                    ? 'bg-sf-accent-primary text-white'
                    : 'text-sf-text-muted hover:text-white'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </button>
              <button
                onClick={() => setOverlayHeight('full')}
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                  overlayHeight === 'full'
                    ? 'bg-sf-accent-primary text-white'
                    : 'text-sf-text-muted hover:text-white'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={closeOverlay}
              className="w-8 h-8 rounded-xl bg-sf-bg-tertiary flex items-center justify-center text-sf-text-muted hover:text-white hover:bg-sf-status-error/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className={`flex-1 overflow-hidden ${overlayHeight === 'collapsed' ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-200`}>
          {type === 'chat' ? (
            <Chat
              onRequireLogin={() => onRequireLogin?.()}
              isAuthenticated={isAuthenticated}
              onCreateMarket={onCreateMarket}
            />
          ) : (
            <InteractiveWidgets onRequireLogin={onRequireLogin} />
          )}
        </div>
      </div>
    </div>
  );

  // Full screen video view
  if (fullScreenStream) {
    return (
      <div className="h-screen bg-black flex flex-col" suppressHydrationWarning>
        {/* Header */}
        <div className="flex-shrink-0 bg-sf-bg-secondary/90 backdrop-blur-sm border-b border-sf-glass-border p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCloseFullScreen}
              className="flex items-center gap-2 text-sf-text-secondary hover:text-white px-3 py-2 rounded-xl bg-sf-bg-tertiary hover:bg-sf-bg-hover transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-sf-status-live rounded-full animate-pulse" />
              <h2 className="text-white text-sm font-semibold">{fullScreenStream.cameraName}</h2>
            </div>
            <div className="w-16" />
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative">
          <LivepeerPlayer playbackId={fullScreenStream.playbackId} />
        </div>

        {/* Bottom Sheet Overlay */}
        {activeOverlay !== 'none' && (
          <OverlayContent type={activeOverlay} />
        )}

        {/* Footer Navigation */}
        <footer className="flex-shrink-0 bg-sf-bg-secondary/95 backdrop-blur-xl border-t border-sf-glass-border safe-area-bottom">
          <div className="flex justify-around py-3 px-4">
            <button
              onClick={() => toggleOverlay('chat')}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
                activeOverlay === 'chat'
                  ? 'bg-sf-accent-primary/20 text-sf-accent-primary scale-105'
                  : 'text-sf-text-tertiary hover:text-white'
              }`}
            >
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {activeOverlay === 'chat' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-sf-status-live rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-xs font-medium">Chat</span>
            </button>

            <button
              onClick={handleCloseFullScreen}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-2xl text-sf-text-tertiary hover:text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="text-xs font-medium">Grid</span>
            </button>

            <button
              onClick={() => toggleOverlay('interact')}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
                activeOverlay === 'interact'
                  ? 'bg-sf-accent-secondary/20 text-sf-accent-secondary scale-105'
                  : 'text-sf-text-tertiary hover:text-white'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-medium">Interact</span>
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // Main grid view
  return (
    <div className="h-screen bg-sf-bg-primary flex flex-col" suppressHydrationWarning>
      {/* Header */}
      <header className="flex-shrink-0 bg-sf-bg-secondary/95 backdrop-blur-xl border-b border-sf-glass-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSideNavOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sf-text-secondary hover:text-white hover:bg-sf-bg-tertiary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sf-accent-primary to-sf-accent-secondary flex items-center justify-center">
              <span className="text-white font-bold text-xs">SF</span>
            </div>
            <h1 className="text-white font-bold">Star Factor</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-sf-status-live rounded-full animate-pulse" />
            <span className="text-sf-status-live text-xs font-medium">LIVE</span>
          </div>
        </div>
      </header>

      {/* Main Content - Camera Grid */}
      <div className="flex-1 overflow-hidden p-3">
        <MultiCamGrid
          cameras={cameras}
          onStreamClick={handleStreamClick}
          selectedPlaybackId={selectedPlaybackId || undefined}
        />
      </div>

      {/* Bottom Sheet Overlay */}
      {activeOverlay !== 'none' && (
        <OverlayContent type={activeOverlay} />
      )}

      {/* Side Navigation Overlay */}
      {isSideNavOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSideNavOpen(false)}
          />

          {/* Side Navigation Panel */}
          <div className="absolute left-0 top-0 h-full w-72 bg-sf-bg-secondary border-r border-sf-glass-border shadow-2xl animate-slide-in-left">
            <div className="p-5 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sf-accent-primary to-sf-accent-secondary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SF</span>
                  </div>
                  <span className="text-white font-bold">Menu</span>
                </div>
                <button
                  onClick={() => setIsSideNavOpen(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sf-text-muted hover:text-white hover:bg-sf-bg-tertiary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 space-y-2">
                {[
                  { icon: 'home', label: 'Home', color: 'sf-accent-primary' },
                  { icon: 'video', label: 'Watch', color: 'sf-status-success' },
                  { icon: 'chart', label: 'Predictions', color: 'sf-accent-secondary' },
                  { icon: 'trophy', label: 'Leaderboard', color: 'yellow-400' },
                  { icon: 'user', label: 'Profile', color: 'pink-400' },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sf-text-secondary hover:text-white hover:bg-sf-bg-tertiary transition-colors text-left"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-${item.color}/10 flex items-center justify-center`}>
                      {item.icon === 'home' && (
                        <svg className={`w-5 h-5 text-${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      )}
                      {item.icon === 'video' && (
                        <svg className={`w-5 h-5 text-${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                      {item.icon === 'chart' && (
                        <svg className={`w-5 h-5 text-${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                      {item.icon === 'trophy' && (
                        <svg className={`w-5 h-5 text-${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      )}
                      {item.icon === 'user' && (
                        <svg className={`w-5 h-5 text-${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* User Profile Section */}
              <div className="pt-4 border-t border-sf-glass-border">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-sf-bg-tertiary">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-sf-bg-hover">
                    <Image
                      src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=100&bold=true"
                      alt="User Profile"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zy9cIj4KPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM2MzY2ZjEiLz4KPC9zdmc+";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {userEmail || 'Guest User'}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-sf-status-success rounded-full" />
                      <span className="text-sf-text-muted text-xs">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <footer className="flex-shrink-0 bg-sf-bg-secondary/95 backdrop-blur-xl border-t border-sf-glass-border safe-area-bottom">
        <div className="flex justify-around py-3 px-4">
          <button
            onClick={() => toggleOverlay('chat')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
              activeOverlay === 'chat'
                ? 'bg-sf-accent-primary/20 text-sf-accent-primary scale-105'
                : 'text-sf-text-tertiary hover:text-white'
            }`}
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {activeOverlay === 'chat' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-sf-status-live rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-xs font-medium">Chat</span>
          </button>

          <button
            onClick={() => {
              setActiveOverlay('none');
              setOverlayHeight('half');
            }}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
              activeOverlay === 'none'
                ? 'bg-sf-bg-tertiary text-white scale-105'
                : 'text-sf-text-tertiary hover:text-white'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Cameras</span>
          </button>

          <button
            onClick={() => toggleOverlay('interact')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
              activeOverlay === 'interact'
                ? 'bg-sf-accent-secondary/20 text-sf-accent-secondary scale-105'
                : 'text-sf-text-tertiary hover:text-white'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">Interact</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default MobileLayout;

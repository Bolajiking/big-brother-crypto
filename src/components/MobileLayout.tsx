'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import MultiCamGrid from './MultiCamGrid';
import Chat from './Chat';
import InteractiveWidgets from './InteractiveWidgets';
import LivepeerPlayer from './LivepeerPlayer';

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
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  cameras,
  selectedPlaybackId
}) => {
  const [activeView, setActiveView] = useState<'cameras' | 'chat' | 'interact'>('cameras');
  const [fullScreenStream, setFullScreenStream] = useState<{playbackId: string, cameraName: string} | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStreamClick = (playbackId: string, cameraName: string) => {
    setFullScreenStream({ playbackId, cameraName });
  };

  const handleCloseFullScreen = () => {
    setFullScreenStream(null);
  };


  if (!isMounted) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Full screen video view
  if (fullScreenStream) {
    return (
      <div className="h-screen bg-black flex flex-col" suppressHydrationWarning>
        {/* Header */}
        <div className="flex-shrink-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCloseFullScreen}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-gray-200 text-lg font-bold">{fullScreenStream.cameraName}</h2>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative">
          <LivepeerPlayer
            playbackId={fullScreenStream.playbackId}
          />
        </div>

        {/* Overlay for Chat */}
        {activeView === 'chat' && (
          <div className="h-1/2 bg-gray-800 border-t border-gray-700 relative">
            <button
              onClick={() => setActiveView('cameras')}
              className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-200 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Chat />
          </div>
        )}

        {/* Overlay for Interact */}
        {activeView === 'interact' && (
          <div className="h-1/2 bg-gray-800 border-t border-gray-700 relative">
            <button
              onClick={() => setActiveView('cameras')}
              className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-200 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <InteractiveWidgets />
          </div>
        )}

        {/* Persistent Footer Navigation */}
        <footer className="bg-gray-800 border-t border-gray-700 p-4 flex-shrink-0">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveView('chat')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'chat'
                  ? 'text-blue-400 bg-blue-900/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs">Chat</span>
            </button>

            <button
              onClick={() => setActiveView('cameras')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'cameras'
                  ? 'text-blue-400 bg-blue-900/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">Cameras</span>
            </button>

            <button
              onClick={() => setActiveView('interact')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'interact'
                  ? 'text-blue-400 bg-blue-900/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs">Interact</span>
            </button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col" suppressHydrationWarning>
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSideNavOpen(true)}
            className="text-gray-300 hover:text-white transition-colors p-2 -ml-2"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-gray-200 text-lg font-bold">BigBrotherCrypto</h1>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'cameras' && (
          <div className="h-full p-4">
            <MultiCamGrid
              cameras={cameras}
              onStreamClick={handleStreamClick}
              selectedPlaybackId={selectedPlaybackId}
            />
          </div>
        )}

        {/* Overlay for Chat */}
        {activeView === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-4">
              <MultiCamGrid
                cameras={cameras}
                onStreamClick={handleStreamClick}
                selectedPlaybackId={selectedPlaybackId}
              />
            </div>
            <div className="h-1/2 bg-gray-800 border-t border-gray-700 relative">
              <button
                onClick={() => setActiveView('cameras')}
                className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-200 transition-colors p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <Chat />
            </div>
          </div>
        )}

        {/* Overlay for Interact */}
        {activeView === 'interact' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-4">
              <MultiCamGrid
                cameras={cameras}
                onStreamClick={handleStreamClick}
                selectedPlaybackId={selectedPlaybackId}
              />
            </div>
            <div className="h-1/2 bg-gray-800 border-t border-gray-700 relative">
              <button
                onClick={() => setActiveView('cameras')}
                className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-200 transition-colors p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <InteractiveWidgets />
            </div>
          </div>
        )}
      </div>

      {/* Side Navigation Overlay */}
      {isSideNavOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSideNavOpen(false)}
          />
          
          {/* Side Navigation Panel */}
          <div className="absolute left-0 top-0 h-full w-80 bg-gray-800 border-r border-gray-700 shadow-xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-200">Menu</h2>
                <button
                  onClick={() => setIsSideNavOpen(false)}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-4">
                <button 
                  className="w-full flex items-center gap-3 text-white px-4 py-3 rounded-lg transition-colors text-left"
                  style={{ backgroundColor: '#2563eb' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="font-medium">INFO</span>
                </button>
                
                <button 
                  className="w-full flex items-center gap-3 text-white px-4 py-3 rounded-lg transition-colors text-left"
                  style={{ backgroundColor: '#16a34a' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#15803d'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>
                  </svg>
                  <span className="font-medium">WATCH</span>
                </button>
                
                <button 
                  className="w-full flex items-center gap-3 text-white px-4 py-3 rounded-lg transition-colors text-left"
                  style={{ backgroundColor: '#9333ea' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7c3aed'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#9333ea'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="font-medium">PLAY</span>
                </button>
                
                <button 
                  className="w-full flex items-center gap-3 text-white px-4 py-3 rounded-lg transition-colors text-left"
                  style={{ backgroundColor: '#dc2626' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2h-1v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 110-2h3zM9 4h6V3H9v1z"/>
                  </svg>
                  <span className="font-medium">MERCH</span>
                </button>
                
                <button 
                  className="w-full flex items-center gap-3 text-white px-4 py-3 rounded-lg transition-colors text-left"
                  style={{ backgroundColor: '#ea580c' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#c2410c'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#ea580c'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="font-medium">HELP</span>
                </button>
              </div>

              {/* User Profile Section */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src="https://ui-avatars.com/api/?name=User&background=6b7280&color=fff&size=100&bold=true"
                      alt="User Profile"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zz4KPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM2YjcyODAiLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSIzNSIgcj0iMTUiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0iTTIwIDc1QzIwIDY1LjMzNTkgMjcuMzM1OSA1OCAzNyA1OEg2M0M3Mi42NjQxIDU4IDgwIDY1LjMzNTkgODAgNzVWMTBIMjBWNzVaIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==";
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium">User</p>
                    <p className="text-gray-400 text-sm">Online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Footer Navigation */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4 flex-shrink-0">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveView('chat')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'chat'
                ? 'text-blue-400 bg-blue-900/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs">Chat</span>
          </button>

          <button
            onClick={() => setActiveView('cameras')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'cameras'
                ? 'text-blue-400 bg-blue-900/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Cameras</span>
          </button>

          <button
            onClick={() => setActiveView('interact')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'interact'
                ? 'text-blue-400 bg-blue-900/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">Interact</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default MobileLayout;

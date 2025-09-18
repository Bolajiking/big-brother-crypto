'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LivepeerPlayer from '@/components/LivepeerPlayer';
import MultiCamGrid from '@/components/MultiCamGrid';
import Chat from '@/components/Chat';
import InteractiveWidgets from '@/components/InteractiveWidgets';
import ClientOnly from '@/components/ClientOnly';

interface Camera {
  id: string;
  name: string;
  playbackId: string;
  streamId: string;
  isActive: boolean;
  description: string;
}

const HomePage: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedPlaybackId, setSelectedPlaybackId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullViewStream, setFullViewStream] = useState<{playbackId: string, name: string} | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await fetch('/api/cameras');
        const data = await response.json();
        
        if (data.success) {
          setCameras(data.cameras);
          if (data.cameras.length > 0) {
            setSelectedPlaybackId(data.cameras[0].playbackId);
          }
        } else {
          setError('Failed to load cameras');
        }
      } catch (error) {
        console.error('Error fetching cameras:', error);
        setError('Failed to load cameras');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCameras();
    }
  }, [user]);


  const handleStreamClick = (playbackId: string, cameraName: string) => {
    setFullViewStream({ playbackId, name: cameraName });
  };

  const handleCloseFullView = () => {
    setFullViewStream(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };


  if (authLoading || isLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-900" suppressHydrationWarning>
      {/* Header with Navigation */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 relative" suppressHydrationWarning>
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-gray-200">BigBrotherCrypto</h1>
          
          {/* Navigation Buttons - Center */}
          <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
            <button 
              className="flex items-center gap-1 text-white px-3 py-1.5 rounded transition-colors text-sm"
              style={{ backgroundColor: '#2563eb' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              INFO
            </button>
            
            <button 
              className="flex items-center gap-1 text-white px-3 py-1.5 rounded transition-colors text-sm"
              style={{ backgroundColor: '#16a34a' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#15803d'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>
              </svg>
              WATCH
            </button>
            
            <button 
              className="flex items-center gap-1 text-white px-3 py-1.5 rounded transition-colors text-sm"
              style={{ backgroundColor: '#9333ea' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7c3aed'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#9333ea'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              PLAY
            </button>
            
            <button 
              className="flex items-center gap-1 text-white px-3 py-1.5 rounded transition-colors text-sm"
              style={{ backgroundColor: '#ea580c' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#c2410c'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#ea580c'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 4V2c0-.55-.45-1-1-1s-1 .45-1 1v2H3c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V6h2c.55 0 1-.45 1-1s-.45-1-1-1H7zm10 0h-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V6h2c.55 0 1-.45 1-1s-.45-1-1-1zM7 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              MERCH
            </button>
            
            <button 
              className="flex items-center gap-1 text-white px-3 py-1.5 rounded transition-colors text-sm"
              style={{ backgroundColor: '#ca8a04' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#a16207'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#ca8a04'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
              HELP
            </button>
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative mr-8" ref={profileRef}>
            <button
              onClick={toggleProfile}
              onMouseEnter={() => setIsProfileOpen(true)}
              className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <img
                src="https://ui-avatars.com/api/?name=User&background=6b7280&color=fff&size=100&bold=true"
                alt="User Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a simple generic avatar if image fails to load
                  e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNmI3MjgwIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0yMCA3NUMyMCA2NS4zMzU5IDI3LjMzNTkgNTggMzcgNThINjNDNzIuNjY0MSA1OCA4MCA2NS4zMzU5IDgwIDc1VjEwMEgyMFY3NVoiIGZpbGw9IiNmZmYiLz4KPC9zdmc+";
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div 
                className="absolute right-0 mt-3 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-600 py-2 z-50"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <div className="px-4 py-2 border-b border-gray-600">
                  <div className="text-gray-200 text-sm font-medium">{user.username}</div>
                  <div className="text-gray-400 text-xs">Online</div>
                </div>
                
                <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                  Profile Settings
                </button>
                
                <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                  Preferences
                </button>
                
                <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                  Help & Support
                </button>
                
                <div className="border-t border-gray-600 my-2"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500 text-white p-4 m-4 rounded">
          {error}
        </div>
      )}




      {/* 3 Column Layout */}
      <div className="flex" style={{ height: 'calc(100vh - 80px)' }} suppressHydrationWarning>
        {/* Left Column - Interactive Polls */}
        <div className="w-1/6 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto" suppressHydrationWarning>
          <ClientOnly>
            <InteractiveWidgets />
          </ClientOnly>
        </div>

        {/* Middle Column - Stream Grid or Full View */}
        <div className="w-2/3 bg-gray-900 p-4 overflow-y-auto relative" suppressHydrationWarning>
          {fullViewStream ? (
            /* Full View Stream */
            <div className="h-full flex flex-col">
              {/* Header with close button */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-200 text-xl font-bold">{fullViewStream.name} - Live Stream</h2>
                <button
                  onClick={handleCloseFullView}
                  className="bg-gray-600 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded"
                >
                  ← Back to Grid
                </button>
              </div>
              
              {/* Full size video player */}
              <div className="flex-1 bg-black rounded-lg overflow-hidden">
                <LivepeerPlayer
                  playbackId={fullViewStream.playbackId}
                  isMainPlayer={true}
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            /* Camera Grid */
            <ClientOnly>
              <MultiCamGrid
                cameras={cameras}
                onStreamClick={handleStreamClick}
                selectedPlaybackId={selectedPlaybackId}
              />
            </ClientOnly>
          )}
        </div>

        {/* Right Column - Chat */}
        <div className="w-1/6 bg-gray-800 border-l border-gray-700" suppressHydrationWarning>
          <ClientOnly>
            <Chat />
          </ClientOnly>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

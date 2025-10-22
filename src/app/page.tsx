'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import LivepeerPlayer from '@/components/LivepeerPlayer';
import MultiCamGrid from '@/components/MultiCamGrid';
import Chat from '@/components/Chat';
import InteractiveWidgets from '@/components/InteractiveWidgets';
import ClientOnly from '@/components/ClientOnly';
import MobileLayout from '@/components/MobileLayout';

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
  const [isMobile, setIsMobile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { ready, authenticated, user, logout: privyLogout } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

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

  const handleLogout = async () => {
    await privyLogout();
    router.push('/login');
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };


  if (!ready || isLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || !user) {
    return null; // Will redirect to login
  }

  // Render mobile layout for mobile devices
  if (isMobile) {
    return (
      <div suppressHydrationWarning>
        <MobileLayout
          cameras={cameras}
          selectedPlaybackId={selectedPlaybackId}
          onStreamClick={handleStreamClick}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" suppressHydrationWarning>
      {/* Header with Navigation */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 relative" suppressHydrationWarning>
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-gray-200 self-start">BigBrotherCrypto</h1>
          
          {/* Navigation Buttons - Center */}
          <div className="flex items-center gap-4 justify-center">
            <button 
              className="flex items-center gap-1 text-white px-3 py-1.5 rounded transition-colors text-sm bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              INFO
            </button>
            
            <button 
              className="flex items-center gap-1 text-white px-3 py-1.5 rounded transition-colors text-sm bg-green-600 hover:bg-green-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>
              </svg>
              WATCH
            </button>
            
            <button 
              className="flex items-center gap-1 text-white px-3 py-1.5 rounded transition-colors text-sm bg-purple-600 hover:bg-purple-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              PLAY
            </button>
            
            <button 
              className="flex items-center gap-1 text-white px-3 py-1.5 rounded transition-colors text-sm bg-orange-600 hover:bg-orange-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 4V2c0-.55-.45-1-1-1s-1 .45-1 1v2H3c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V6h2c.55 0 1-.45 1-1s-.45-1-1-1H7zm10 0h-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V6h2c.55 0 1-.45 1-1s-.45-1-1-1zM7 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              MERCH
            </button>
            
            <button 
              className="flex items-center gap-1 text-white px-3 py-1.5 rounded transition-colors text-sm bg-yellow-600 hover:bg-yellow-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
              HELP
            </button>
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative mr-4" ref={profileRef}>
            <button
              onClick={toggleProfile}
              onMouseEnter={() => setIsProfileOpen(true)}
              className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div 
                className="absolute right-0 mt-3 bg-gray-800 rounded-lg shadow-xl border border-gray-600 py-2 z-50"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <div className="px-4 py-2 border-b border-gray-600">
                  <div className="text-gray-200 text-sm font-medium">
                    {user.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'Wallet User'}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {user.email?.address ? user.email.address : 'Web3 User'}
                  </div>
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

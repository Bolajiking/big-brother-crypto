'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import LivepeerPlayer from '@/components/LivepeerPlayer';
import MultiCamGrid from '@/components/MultiCamGrid';
import Chat from '@/components/Chat';
import InteractiveWidgets from '@/components/InteractiveWidgets';
import PredictionMarkets from '@/components/PredictionMarkets';
import ClientOnly from '@/components/ClientOnly';
import MobileLayout from '@/components/MobileLayout';
import WalletDisplay from '@/components/WalletDisplay';
import { useUserStore } from '@/stores/userStore';
import { usePredictionStore } from '@/stores/predictionStore';
import { MarketCreationData } from '@/types/prediction';

interface Camera {
  id: string;
  name: string;
  playbackId: string;
  streamId: string;
  isActive: boolean;
  description: string;
}

// Login Prompt Modal Component - Premium Design
const LoginPromptModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  action?: string;
}> = ({ isOpen, onClose, onLogin, action = 'perform this action' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card p-8 max-w-md w-full mx-4 shadow-sf-xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-sf-bg-tertiary hover:bg-sf-bg-hover flex items-center justify-center text-sf-text-tertiary hover:text-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sf-glow">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">Sign In Required</h3>
          <p className="text-sf-text-secondary mb-8">
            Please sign in to {action}. Create a free account to unlock all features.
          </p>

          <div className="space-y-3">
            <button
              onClick={onLogin}
              className="w-full btn-primary py-4 rounded-xl font-semibold text-lg"
            >
              Sign In
            </button>
            <button
              onClick={onClose}
              className="w-full btn-secondary py-3 rounded-xl font-medium"
            >
              Continue Watching
            </button>
          </div>

          <p className="text-sf-text-muted text-sm mt-6">
            Free viewers can watch all streams. Sign in to chat, vote, and place predictions.
          </p>
        </div>
      </div>
    </div>
  );
};

const WatchPage: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedPlaybackId, setSelectedPlaybackId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullViewStream, setFullViewStream] = useState<{playbackId: string, name: string} | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState('');
  const [leftPanelTab, setLeftPanelTab] = useState<'predictions' | 'polls'>('predictions');
  const profileRef = useRef<HTMLDivElement>(null);
  const { ready, authenticated, user, logout: privyLogout, login: privyLogin } = usePrivy();
  const { setUser: setStoreUser, updateBalance, logout: storeLogout, balance, deductStakes } = useUserStore();
  const { markets, userBets, addMarket, placeBet, initializeDemoData } = usePredictionStore();

  useEffect(() => {
    setIsMounted(true);
    initializeDemoData();

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [initializeDemoData]);

  // Verify user with database and sync state (only if authenticated)
  useEffect(() => {
    const verifyUser = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            privyId: user.id,
            walletAddress: user.wallet?.address,
            email: user.email?.address,
          }),
        });

        const data = await response.json();
        if (data.success && data.user) {
          setDbUserId(data.user.id);
          setStoreUser(data.user);
          updateBalance({
            clout: data.user.cloutBalance,
            stakes: data.user.stakesBalance,
          });
        }
      } catch (error) {
        console.error('Failed to verify user:', error);
      }
    };

    if (authenticated && user) {
      verifyUser();
    }
  }, [authenticated, user, setStoreUser, updateBalance]);

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

  // Fetch cameras for all users (authenticated or not)
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

    if (ready) {
      fetchCameras();
    }
  }, [ready]);

  // Require login for certain actions
  const requireLogin = (action: string, callback?: () => void) => {
    if (!authenticated) {
      setLoginAction(action);
      setShowLoginModal(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  const handleLogin = async () => {
    setShowLoginModal(false);
    try {
      await privyLogin();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleStreamClick = (playbackId: string, cameraName: string) => {
    requireLogin('expand camera view', () => {
      setFullViewStream({ playbackId, name: cameraName });
    });
  };

  const handleCloseFullView = () => {
    setFullViewStream(null);
  };

  const handleLogout = async () => {
    storeLogout();
    setDbUserId(null);
    await privyLogout();
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  if (!ready || isLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-sf-bg-primary flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-xl animate-pulse opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-sf-accent-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <p className="text-sf-text-secondary font-medium">Loading Star Factor...</p>
        </div>
      </div>
    );
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
        <LoginPromptModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          action={loginAction}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sf-bg-primary" suppressHydrationWarning>
      {/* Login Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        action={loginAction}
      />

      {/* Header */}
      <header className="bg-sf-bg-secondary/80 backdrop-blur-glass border-b border-sf-glass-border px-6 py-3 sticky top-0 z-40" suppressHydrationWarning>
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center font-bold text-sm shadow-sf-glow-button group-hover:shadow-sf-glow-button-hover transition-all">
              SF
            </div>
            <span className="text-xl font-bold gradient-text">
              Star Factor
            </span>
          </Link>

          {/* Navigation Buttons - Center */}
          <nav className="flex items-center gap-2">
            {[
              { label: 'INFO', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'sf-accent-primary', active: false },
              { label: 'WATCH', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: 'sf-status-success', active: true },
              { label: 'PLAY', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'sf-accent-secondary', onClick: () => requireLogin('place predictions') },
              { label: 'MERCH', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'sf-status-warning', active: false },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  item.active
                    ? `bg-${item.color}/20 text-${item.color} ring-1 ring-${item.color}/30`
                    : 'text-sf-text-tertiary hover:text-white hover:bg-sf-glass-bg'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side - Wallet/Profile OR Login Button */}
          <div className="flex items-center gap-3">
            {authenticated && user ? (
              <>
                {/* Wallet Display */}
                {dbUserId && (
                  <ClientOnly>
                    <WalletDisplay userId={dbUserId} />
                  </ClientOnly>
                )}

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfile}
                    onMouseEnter={() => setIsProfileOpen(true)}
                    className="w-10 h-10 rounded-xl glass hover:bg-sf-glass-bg-hover flex items-center justify-center transition-all group"
                  >
                    <svg className="w-5 h-5 text-sf-text-tertiary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div
                      className="absolute right-0 mt-2 dropdown min-w-[220px] animate-scale-in"
                      onMouseEnter={() => setIsProfileOpen(true)}
                      onMouseLeave={() => setIsProfileOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-sf-glass-border">
                        <div className="text-white text-sm font-medium">
                          {user.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'User'}
                        </div>
                        <div className="text-sf-text-tertiary text-xs mt-0.5">
                          {user.email?.address || 'Viewer'}
                        </div>
                      </div>

                      <div className="py-1">
                        <button className="dropdown-item w-full text-left flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile Settings
                        </button>
                        <button className="dropdown-item w-full text-left flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Preferences
                        </button>
                        <button className="dropdown-item w-full text-left flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Help & Support
                        </button>
                      </div>

                      <div className="border-t border-sf-glass-border py-1">
                        <button
                          onClick={handleLogout}
                          className="dropdown-item w-full text-left flex items-center gap-3 text-sf-status-error hover:text-sf-status-error"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Login Button for unauthenticated users */
              <button
                onClick={handleLogin}
                className="btn-primary px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4">
          <div className="glass-card p-4 border-sf-status-error/30 bg-sf-status-error/10">
            <div className="flex items-center gap-3 text-sf-status-error">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* 3 Column Layout */}
      <div className="flex" style={{ height: 'calc(100vh - 64px)' }} suppressHydrationWarning>
        {/* Left Column - Predictions & Polls */}
        <div className="w-80 bg-sf-bg-secondary border-r border-sf-glass-border overflow-hidden flex flex-col" suppressHydrationWarning>
          {/* Tab Header */}
          <div className="p-3 border-b border-sf-glass-border">
            <div className="flex items-center bg-sf-bg-tertiary rounded-xl p-1">
              <button
                onClick={() => setLeftPanelTab('predictions')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  leftPanelTab === 'predictions'
                    ? 'bg-sf-accent-primary text-white shadow-sf-glow-button'
                    : 'text-sf-text-tertiary hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Predictions
                {markets.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">{markets.filter(m => m.status === 'active').length}</span>
                )}
              </button>
              <button
                onClick={() => setLeftPanelTab('polls')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  leftPanelTab === 'polls'
                    ? 'bg-sf-accent-secondary text-white shadow-sf-glow-button'
                    : 'text-sf-text-tertiary hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Polls
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
            <ClientOnly>
              {leftPanelTab === 'predictions' ? (
                <PredictionMarkets
                  markets={markets}
                  userBets={userBets}
                  onPlaceBet={(marketId, optionId, amount) => {
                    if (deductStakes(amount)) {
                      placeBet(marketId, optionId, amount, user?.email?.address?.split('@')[0] || 'You');
                    }
                  }}
                  onRequireLogin={() => requireLogin('place predictions')}
                  isAuthenticated={authenticated}
                  userBalance={balance.stakes}
                />
              ) : (
                <InteractiveWidgets onRequireLogin={() => requireLogin('vote in polls')} />
              )}
            </ClientOnly>
          </div>
        </div>

        {/* Middle Column - Stream Grid or Full View */}
        <div className="flex-1 bg-sf-bg-primary overflow-hidden flex flex-col" suppressHydrationWarning>
          {fullViewStream ? (
            /* Full View Stream */
            <div className="h-full flex flex-col p-4">
              {/* Header with close button */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="live-dot" />
                  <h2 className="text-xl font-bold text-white">{fullViewStream.name}</h2>
                  <span className="badge badge-live">LIVE</span>
                </div>
                <button
                  onClick={handleCloseFullView}
                  className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Back to Grid
                </button>
              </div>

              {/* Full size video player */}
              <div className="flex-1 bg-sf-bg-secondary rounded-2xl overflow-hidden border border-sf-glass-border shadow-sf-lg">
                <LivepeerPlayer
                  playbackId={fullViewStream.playbackId}
                  isMainPlayer={true}
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            /* Camera Grid */
            <div className="h-full p-4 overflow-y-auto hide-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">Live Cameras</h2>
                  <span className="badge badge-live flex items-center gap-1.5">
                    <span className="live-dot !w-2 !h-2" />
                    {cameras.length} Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button className="btn-ghost p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <ClientOnly>
                <MultiCamGrid
                  cameras={cameras}
                  onStreamClick={handleStreamClick}
                  selectedPlaybackId={selectedPlaybackId}
                />
              </ClientOnly>
            </div>
          )}
        </div>

        {/* Right Column - Chat */}
        <div className="w-80 bg-sf-bg-secondary border-l border-sf-glass-border overflow-hidden flex flex-col" suppressHydrationWarning>
          <div className="p-4 border-b border-sf-glass-border">
            <h2 className="text-sm font-semibold text-sf-text-secondary uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-sf-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Live Chat
            </h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <ClientOnly>
              <Chat
                onRequireLogin={() => requireLogin('send messages')}
                isAuthenticated={authenticated}
                onCreateMarket={(data: MarketCreationData) => {
                  addMarket(data, user?.email?.address?.split('@')[0] || 'Anonymous');
                  setLeftPanelTab('predictions');
                }}
              />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;

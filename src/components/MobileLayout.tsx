'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import LivepeerPlayer, { type LivepeerPlayerHandle, type LivepeerPlayerState } from './LivepeerPlayer';
import ClientOnly from './ClientOnly';
import SunArcIndicator from './SunArcIndicator';
import StreamControlBar from './StreamControlBar';
import { useDaylight } from '@/lib/daylight';
import { usePredictionStore } from '@/stores/predictionStore';
import { useUserStore } from '@/stores/userStore';
import { MarketCreationData, PredictionMarket } from '@/types/prediction';

interface Camera {
  id: string;
  name: string;
  playbackId: string;
  streamId: string;
  isActive: boolean;
  isLive?: boolean;
  viewerCount?: number;
  description: string;
}

interface MobileChatLine {
  id: string;
  name: string;
  color: string;
  msg: string;
  time: string;
  tier?: 'hot' | 'system' | 'normal';
  coin?: number;
}

interface MobileLayoutProps {
  cameras: Camera[];
  selectedPlaybackId: string | null;
  onStreamClick: (playbackId: string, cameraName: string) => void;
  onRequireLogin?: () => void;
  isAuthenticated?: boolean;
  userEmail?: string;
  userName?: string;
  walletAddress?: string | null;
  userId?: string | null;
  onLogout?: () => void | Promise<void>;
  chatMessages?: MobileChatLine[];
  onSendChat?: (message: string) => Promise<MobileChatLine | null> | MobileChatLine | null;
  onPlaceBet?: (marketId: string, optionId: string, amount: number) => Promise<boolean> | boolean;
  onCreateMarket?: (data: MarketCreationData) => void | Promise<void>;
  dataMode?: 'demo' | 'real';
  onDataModeChange?: (mode: 'demo' | 'real') => void;
}

type SheetState = 'closed' | 'half' | 'full';
type SheetTab = 'predict' | 'chat';
type MobileViewMode = 'single' | 'director';

const PALETTES = ['coral', 'violet', 'gold', 'mint', 'sky', 'rose'];

const PaletteFill: React.FC<{ palette: string; children?: React.ReactNode }> = ({ palette, children }) => {
  const map: Record<string, { a: string; b: string; c: string }> = {
    coral:  { a: '#FF4E2B', b: '#F2B544', c: '#0A0814' },
    violet: { a: '#6B3FE5', b: '#8DAAFF', c: '#0A0814' },
    mint:   { a: '#1FD17A', b: '#C8EB6D', c: '#0A0814' },
    gold:   { a: '#F2B544', b: '#FF4E2B', c: '#0A0814' },
    sky:    { a: '#5ACDFF', b: '#8DAAFF', c: '#0A0814' },
    rose:   { a: '#FF1F3D', b: '#FF4E2B', c: '#1A0410' },
  };
  const p = map[palette] || map.coral;
  return (
    <div className="sf-photo" style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: `radial-gradient(120% 120% at 80% 20%, ${p.b} 0%, ${p.a} 50%, ${p.c} 120%)`,
    }}>
      <div className="sf-photo-grain" />
      {children}
    </div>
  );
};

const fmt = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + 'K';
  return n.toString();
};
const ngn = (n: number) => '₦' + fmt(n);
const shortAddress = (address?: string | null) => (
  address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Provisioning wallet'
);
const DIRECTOR_CAMERA_NAME = "director's view";
const isDirectorCameraName = (name?: string | null) => (
  name?.trim().toLowerCase() === DIRECTOR_CAMERA_NAME
);
const DEFAULT_PLAYER_STATE: LivepeerPlayerState = {
  isPaused: true,
  isMuted: true,
  isLive: false,
  isBuffering: false,
  hasVideoFrame: false,
  isPictureInPicture: false,
  volume: 1,
};
const optionDot = (idx: number) => ['var(--sf-mint)', 'var(--sf-coral)', 'var(--sf-violet)', 'var(--sf-cyan-warm)'][idx % 4];
const optionFill = (idx: number, picked = false) => {
  if (picked) return 'rgba(255,78,43,0.18)';
  return ['rgba(31,209,122,0.12)', 'rgba(255,78,43,0.12)', 'rgba(107,63,229,0.12)', 'rgba(90,205,255,0.12)'][idx % 4];
};

const SEED_CHAT = [
  { id: 'm1', name: 'Tola_LG',    color: '#6B3FE5', msg: 'WAHALA Kemi about to flip the table 🔥', time: 'now' },
  { id: 'm2', name: '9JaKid',     color: '#1FD17A', msg: 'Bayo dey scheme for diary again',         time: 'now' },
  { id: 'm3', name: 'Ife_M',      color: '#FF4E2B', msg: 'My ₦5K on Femi for eviction.',            time: '10s' },
  { id: 'm4', name: 'AbujaQueen', color: '#5ACDFF', msg: 'Tunde acting fake for camera',            time: '22s' },
  { id: 'm5', name: 'Sage',       color: '#1FD17A', msg: 'Watch Ngozi, she playing 4D chess',       time: '1m' },
];

const MobileLayout: React.FC<MobileLayoutProps> = ({
  cameras,
  selectedPlaybackId,
  onStreamClick,
  onRequireLogin,
  isAuthenticated = false,
  userEmail,
  userName,
  walletAddress,
  userId,
  onLogout,
  chatMessages: externalChatMessages,
  onSendChat,
  onPlaceBet,
  onCreateMarket,
  dataMode = 'demo',
  onDataModeChange,
}) => {
  const day = useDaylight({ mode: 'auto' });
  const [activeChannel, setActiveChannel] = useState(0);
  const [sheetTab, setSheetTab] = useState<SheetTab>('predict');
  const [sheetState, setSheetState] = useState<SheetState>('half');
  const [viewMode, setViewMode] = useState<MobileViewMode>('single');
  const [showMobileWidgets, setShowMobileWidgets] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [showChannelDrawer, setShowChannelDrawer] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);

  // Drag handle
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);

  // Predict + chat state
  const { markets, userBets, addMarket, placeBet, initializeDemoData } = usePredictionStore();
  const { balance, deductStakes } = useUserStore();
  const [pickedBet, setPickedBet] = useState<{ marketId: string; optionId: string } | null>(null);
  const [stake, setStake] = useState(500);

  const [chatMessages, setChatMessages] = useState<MobileChatLine[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<LivepeerPlayerHandle>(null);
  const [playerState, setPlayerState] = useState<LivepeerPlayerState>(DEFAULT_PLAYER_STATE);

  const [showMarketComposer, setShowMarketComposer] = useState(false);
  const [predictQuestion, setPredictQuestion] = useState('');
  const [predictOptions, setPredictOptions] = useState(['', '']);
  const [predictCategory, setPredictCategory] = useState<MarketCreationData['category']>('event');
  const [predictDuration, setPredictDuration] = useState(24);

  const [winH, setWinH] = useState(800);

  const profileName = userName || userEmail?.split('@')[0] || 'Viewer';
  const profileInitial = profileName.charAt(0).toUpperCase();

  useEffect(() => {
    setIsMounted(true);
    const update = () => setWinH(window.innerHeight);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (dataMode === 'demo') {
      initializeDemoData();
      setChatMessages(SEED_CHAT);
      return;
    }

    setChatMessages(externalChatMessages || []);
  }, [dataMode, externalChatMessages, initializeDemoData]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  useEffect(() => {
    if (!selectedPlaybackId || cameras.length === 0) return;
    const idx = cameras.findIndex(c => c.playbackId === selectedPlaybackId);
    if (idx >= 0 && idx !== activeChannel) setActiveChannel(idx);
  }, [activeChannel, cameras, selectedPlaybackId]);

  useEffect(() => {
    if (cameras.length > 0 && activeChannel >= cameras.length) setActiveChannel(0);
  }, [activeChannel, cameras.length]);

  const sheetHeight = sheetState === 'closed' ? 80 : sheetState === 'half' ? Math.round(winH * 0.55) : Math.round(winH * 0.88);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(y);
    setDragDelta(0);
  };
  const handleDragMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragDelta(y - dragStartY);
  }, [isDragging, dragStartY]);
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const t = 60;
    if (dragDelta > t) {
      setSheetState(s => (s === 'full' ? 'half' : s === 'half' ? 'closed' : 'closed'));
    } else if (dragDelta < -t) {
      setSheetState(s => (s === 'closed' ? 'half' : s === 'half' ? 'full' : 'full'));
    }
    setDragDelta(0);
  }, [isDragging, dragDelta]);

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

  const activeCam = cameras[activeChannel];
  const otherCameras = cameras.map((cam, idx) => ({ cam, idx })).filter(({ idx }) => idx !== activeChannel);
  const isDemoMode = dataMode === 'demo';
  const isDirectorCamera = isDirectorCameraName(activeCam?.name);
  const shouldPlayCameraSignal = Boolean(activeCam?.isLive) || (isDemoMode && !isDirectorCamera);
  const isCameraIdle = !isDemoMode && !activeCam?.isLive;
  const liveHasStream = cameras.some(camera => camera.isLive);
  const effectiveMarkets = markets;
  const activeMarkets = effectiveMarkets.filter(m => m.status === 'active');
  const activeMarket = activeMarkets[0] || null;
  const displayChat = chatMessages;
  const isIdle = !isDemoMode && !liveHasStream && activeMarkets.length === 0 && displayChat.length === 0;

  const handlePickOption = (marketId: string, optionId: string) => {
    if (!isAuthenticated) { onRequireLogin?.(); return; }
    setPickedBet({ marketId, optionId });
    setSheetState('full');
  };
  const handlePlaceBet = async () => {
    if (!pickedBet) return;
    if (onPlaceBet) {
      const placed = await onPlaceBet(pickedBet.marketId, pickedBet.optionId, stake);
      if (placed) setPickedBet(null);
      return;
    }

    if (deductStakes(stake)) {
      placeBet(pickedBet.marketId, pickedBet.optionId, stake, userEmail?.split('@')[0] || 'You');
      setPickedBet(null);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!isAuthenticated) { onRequireLogin?.(); return; }
    const text = chatInput.trim();
    if (text.toLowerCase().startsWith('/predict')) {
      setShowMarketComposer(true);
      setSheetTab('predict');
      setSheetState('full');
      setChatInput('');
      return;
    }
    if (onSendChat) {
      const sentMessage = await onSendChat(text);
      if (sentMessage) setChatMessages(prev => [...prev, sentMessage]);
    } else {
      setChatMessages(prev => [...prev, {
        id: `m_${Date.now()}`,
        name: userEmail?.split('@')[0] || 'You',
        color: '#FF4E2B',
        msg: text,
        time: 'now',
      }]);
    }
    setChatInput('');
  };

  const handleCreateMarket = async () => {
    const opts = predictOptions.filter(o => o.trim());
    if (!predictQuestion.trim() || opts.length < 2) return;
    const data: MarketCreationData = {
      question: predictQuestion.trim(),
      options: opts,
      duration: predictDuration,
      category: predictCategory,
    };
    if (onCreateMarket) {
      await onCreateMarket(data);
    } else {
      addMarket(data, userEmail?.split('@')[0] || 'Anonymous');
    }
    setChatMessages(prev => [...prev, {
      id: `m_${Date.now()}`,
      name: userEmail?.split('@')[0] || 'You',
      color: '#1FD17A',
      msg: `Created prediction: "${data.question}"`,
      time: 'now',
    }]);
    setShowMarketComposer(false);
    setPredictQuestion('');
    setPredictOptions(['', '']);
    setPredictCategory('event');
    setPredictDuration(24);
    setSheetTab('predict');
    setSheetState('half');
  };

  if (!isMounted) {
    return (
      <div className="sf-watch-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#F8F4EC', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading…</div>
      </div>
    );
  }

  return (
    <div
      className="sf-watch-root sf-daylight-root"
      style={{
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        ['--sf-coral' as string]: day.accent,
        ['--sf-coral-deep' as string]: day.accentSoft,
        ['--sf-paper' as string]: day.paper,
        ['--sf-paper-warm' as string]: day.paper2,
      } as React.CSSProperties}
    >
      {/* HEADER — paper */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        minHeight: 64, padding: '8px 10px',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--sf-paper)',
        color: 'var(--sf-stage)',
        borderBottom: '2px solid var(--sf-stage)',
        overflow: 'visible',
      }}>
        <button onClick={() => setShowChannelDrawer(true)} style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'var(--sf-stage)', color: '#fff',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }} aria-label="Cameras">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: '100%' }}>
            <span className="sf-display" style={{
              fontSize: 18,
              fontWeight: 900,
              color: 'var(--sf-stage)',
              fontStyle: 'italic',
              letterSpacing: '-0.04em',
              whiteSpace: 'nowrap',
            }}>
              starfactor<span style={{ color: 'var(--sf-coral)' }}>.</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1, minWidth: 0 }}>
            <span className="sf-eyebrow" style={{ color: 'rgba(10,8,20,0.56)', fontSize: 8, whiteSpace: 'nowrap' }}>
              DAY <span style={{ color: 'var(--sf-coral)' }}>47</span>
            </span>
            {onDataModeChange && (
              <button
                onClick={() => onDataModeChange(dataMode === 'demo' ? 'real' : 'demo')}
                title={dataMode === 'demo' ? 'Showing demo · tap for live' : 'Showing live · tap for demo'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  minHeight: 19,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: dataMode === 'demo' ? 'rgba(255,78,43,0.12)' : 'rgba(31,209,122,0.14)',
                  border: `1px solid ${dataMode === 'demo' ? 'rgba(255,78,43,0.32)' : 'rgba(31,209,122,0.35)'}`,
                  color: dataMode === 'demo' ? 'var(--sf-coral)' : '#138D52',
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{
                  width: 5, height: 5, borderRadius: 999,
                  background: dataMode === 'demo' ? 'var(--sf-coral)' : '#1FD17A',
                }} />
                {dataMode === 'demo' ? 'Demo' : 'Live'}
              </button>
            )}
          </div>
        </div>

        <div style={{ marginRight: 2, flexShrink: 0 }}>
          <SunArcIndicator state={day} dark={false} compact />
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) { onRequireLogin?.(); return; }
            setShowProfileSheet(true);
          }}
          aria-label={isAuthenticated ? 'Open profile wallet' : 'Sign in'}
          style={{
            flexShrink: 0,
            minWidth: isAuthenticated ? 112 : 74,
            maxWidth: 128,
            height: 42,
            borderRadius: 999,
            border: '1px solid rgba(10,8,20,0.12)',
            background: 'var(--sf-stage)',
            color: '#fff',
            padding: isAuthenticated ? '5px 9px 5px 5px' : '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 14px 34px -20px rgba(10,8,20,0.75)',
          }}
        >
          {isAuthenticated ? (
            <ClientOnly fallback={
              <>
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.12)',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, fontWeight: 900 }}>...</span>
              </>
            }>
              <span style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: 'linear-gradient(135deg,#FFB020,#FF4E2B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1A0F00',
                fontWeight: 900,
                fontSize: 11,
                flexShrink: 0,
              }}>{profileInitial}</span>
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.05, textAlign: 'left' }}>
                <span style={{ fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}>{fmt(balance.stakes)} STK</span>
                <span style={{ fontSize: 8, fontWeight: 800, color: 'var(--sf-mint)', whiteSpace: 'nowrap' }}>{fmt(balance.clout)} CL</span>
              </span>
            </ClientOnly>
          ) : (
            <span className="sf-eyebrow" style={{ color: '#fff', fontSize: 9 }}>SIGN IN</span>
          )}
        </button>
      </header>

      {showProfileSheet && (
        <div className="fixed inset-0 z-[72] sf-fade-in">
          <div
            onClick={() => setShowProfileSheet(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10,8,20,0.66)',
              backdropFilter: 'blur(10px)',
            }}
          />
          <section className="sf-slide-up" style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            maxWidth: 520,
            margin: '0 auto',
            maxHeight: 'min(74vh, 560px)',
            overflow: 'auto',
            background: 'var(--sf-stage-2)',
            color: '#fff',
            border: '1.5px solid var(--sf-line-strong)',
            borderRadius: 20,
            boxShadow: '0 26px 76px -22px rgba(0,0,0,0.82)',
          }}>
            <div style={{
              padding: '11px 12px',
              borderBottom: '1px solid var(--sf-line)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                background: 'linear-gradient(135deg,#FFB020,#FF4E2B)',
                color: '#1A0F00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 14,
                boxShadow: '0 14px 34px -18px rgba(255,78,43,0.8)',
                flexShrink: 0,
              }}>{profileInitial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 2, fontSize: 8 }}>PROFILE</div>
                <div style={{ fontSize: 14, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profileName}
                </div>
                <div style={{ fontSize: 10, color: 'var(--sf-fg-3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userEmail || 'Signed in viewer'}
                </div>
              </div>
              <button
                onClick={() => setShowProfileSheet(false)}
                className="sf-btn-icon"
                aria-label="Close profile"
                style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.05)', borderColor: 'var(--sf-line)' }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: 12, display: 'grid', gap: 8 }}>
              <div style={{
                padding: 11,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(255,176,32,0.13), rgba(255,78,43,0.10))',
                border: '1px solid rgba(255,176,32,0.26)',
              }}>
                <div className="sf-eyebrow" style={{ color: 'var(--sf-amber)', marginBottom: 8, fontSize: 8 }}>APP WALLET</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                  <div style={{
                    padding: 10,
                    borderRadius: 13,
                    background: 'rgba(10,8,20,0.36)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <div style={{ fontSize: 8, color: 'var(--sf-fg-3)', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Stakes</div>
                    <div style={{ fontSize: 20, lineHeight: 1, fontWeight: 900, marginTop: 5 }}>{balance.stakes.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: 'var(--sf-amber)', marginTop: 3 }}>{ngn(Math.floor(balance.stakes / 10))}</div>
                  </div>
                  <div style={{
                    padding: 10,
                    borderRadius: 13,
                    background: 'rgba(10,8,20,0.36)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <div style={{ fontSize: 8, color: 'var(--sf-fg-3)', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Clout</div>
                    <div style={{ fontSize: 20, lineHeight: 1, fontWeight: 900, marginTop: 5 }}>{balance.clout.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: 'var(--sf-mint)', marginTop: 3 }}>daily rewards</div>
                  </div>
                </div>
                <div style={{
                  marginTop: 8,
                  padding: '8px 10px',
                  borderRadius: 13,
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 8, color: 'var(--sf-fg-3)', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Privy wallet</div>
                    <div style={{ fontSize: 11, fontWeight: 900, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {shortAddress(walletAddress)}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 7px',
                    borderRadius: 999,
                    background: walletAddress ? 'rgba(31,209,122,0.13)' : 'rgba(242,181,68,0.13)',
                    color: walletAddress ? 'var(--sf-mint)' : 'var(--sf-amber)',
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    {walletAddress ? 'Ready' : 'Creating'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button onClick={() => onRequireLogin?.()} className="sf-btn sf-btn-coral" style={{ height: 34, fontSize: 10 }}>TOP UP</button>
                <button onClick={() => onRequireLogin?.()} className="sf-btn sf-btn-ghost" style={{ height: 34, fontSize: 10 }}>CASH OUT</button>
              </div>

              <div style={{
                border: '1px solid var(--sf-line)',
                borderRadius: 14,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)',
              }}>
                {[
                  ['Tier', 'FREE'],
                  ['Viewer ID', userId ? userId.slice(0, 8) : 'syncing'],
                  ['Experience', dataMode === 'demo' ? 'Demo preview' : 'Live state'],
                ].map(([label, value]) => (
                  <div key={label} style={{
                    minHeight: 35,
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    borderBottom: label === 'Experience' ? 'none' : '1px solid var(--sf-line)',
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--sf-fg-3)', fontWeight: 800 }}>{label}</span>
                    <span style={{ fontSize: 11, fontWeight: 900, textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: onDataModeChange ? '1fr 1fr' : '1fr', gap: 8 }}>
                {onDataModeChange && (
                  <button
                    onClick={() => onDataModeChange(dataMode === 'demo' ? 'real' : 'demo')}
                    className="sf-btn sf-btn-stage"
                    style={{ height: 33, fontSize: 9 }}
                  >
                    {dataMode === 'demo' ? 'SHOW LIVE STATE' : 'PREVIEW DEMO'}
                  </button>
                )}
                <button
                  onClick={async () => {
                    await onLogout?.();
                    setShowProfileSheet(false);
                  }}
                  className="sf-btn sf-btn-ghost"
                  style={{ height: 33, fontSize: 9 }}
                >
                  SIGN OUT
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* PLAYER */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
        {activeCam && shouldPlayCameraSignal ? (
          <LivepeerPlayer
            ref={playerRef}
            playbackId={activeCam.playbackId}
            isMainPlayer={true}
            showControls={false}
            showStatus={false}
            className="w-full h-full"
            onStateChange={setPlayerState}
          />
        ) : (
          <PaletteFill palette="coral">
            {isCameraIdle && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(10,8,20,0.7)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: 16, textAlign: 'center',
              }}>
                <span style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 9, fontWeight: 900, letterSpacing: '0.18em',
                }}>● OFFLINE · STREAM RESUMES SOON</span>
                <h2 className="sf-display" style={{ fontSize: 18, color: '#fff', maxWidth: 280, lineHeight: 1.15 }}>
                  House goes live shortly. Be the first one in.
                </h2>
                <button onClick={() => onDataModeChange?.('demo')} className="sf-btn sf-btn-coral" style={{ height: 32, fontSize: 10, padding: '0 14px' }}>
                  SEE IT IN DEMO
                </button>
              </div>
            )}
          </PaletteFill>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          {!isCameraIdle && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 9px', borderRadius: 999,
              background: 'var(--sf-live)', color: '#fff',
              fontSize: 9, fontWeight: 900, letterSpacing: '0.16em',
            }}>
              <span className="sf-pulse" style={{ background: '#fff', boxShadow: '0 0 0 3px rgba(255,255,255,0.3)' }}></span>
              LIVE
            </span>
          )}
          {showMobileWidgets && !isCameraIdle && (
            <span style={{
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
              padding: '4px 9px', borderRadius: 999,
              fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#fff',
            }}>👁 {(38400 + activeChannel * 1200).toLocaleString()}</span>
          )}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, zIndex: 30 }}>
          <button
            onClick={() => {
              setViewMode(v => v === 'director' ? 'single' : 'director');
              setSheetState('closed');
            }}
            style={{
              padding: '5px 9px',
              borderRadius: 999,
              background: viewMode === 'director' ? 'var(--sf-coral)' : 'rgba(0,0,0,0.62)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.14)',
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.12em',
            }}
          >{viewMode === 'director' ? 'SINGLE' : 'GRID'}</button>
          <button
            onClick={() => {
              setShowMobileWidgets(v => !v);
              setSheetState('closed');
            }}
            style={{
              padding: '5px 9px',
              borderRadius: 999,
              background: !showMobileWidgets ? 'var(--sf-paper)' : 'rgba(0,0,0,0.62)',
              color: !showMobileWidgets ? 'var(--sf-stage)' : '#fff',
              border: '1px solid rgba(255,255,255,0.14)',
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.12em',
            }}
          >FOCUS</button>
        </div>
        {activeCam && shouldPlayCameraSignal && (
          <StreamControlBar
            variant="mobile"
            state={playerState}
            onTogglePlay={() => { playerRef.current?.togglePlay().catch(console.error); }}
            onToggleMuted={() => playerRef.current?.toggleMuted()}
            onVolumeChange={(volume) => playerRef.current?.setVolume(volume)}
            onSyncLive={() => { playerRef.current?.syncToLive().catch(console.error); }}
            onTogglePictureInPicture={() => { playerRef.current?.togglePictureInPicture().catch(console.error); }}
            onFullscreen={() => { playerRef.current?.fullscreen().catch(console.error); }}
          />
        )}
        {showMobileWidgets && activeMarket && (
          <div style={{
            position: 'absolute', bottom: activeCam && shouldPlayCameraSignal ? 58 : 12, left: 8, right: 8,
            background: 'linear-gradient(90deg, rgba(255,78,43,0.92), rgba(255,176,32,0.92))',
            borderRadius: 10, padding: '8px 10px',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 12px 40px -10px rgba(255,78,43,0.5)',
          }}>
            <span style={{
              padding: '2px 6px', borderRadius: 4,
              background: 'rgba(0,0,0,0.85)', color: '#fff',
              fontSize: 8, fontWeight: 900, letterSpacing: '0.14em', flexShrink: 0,
            }}>🔥 LIVE</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeMarket.question}
            </span>
            <button
              onClick={() => { setSheetTab('predict'); setSheetState('half'); }}
              style={{
                padding: '4px 10px', borderRadius: 999,
                background: '#0A0814', color: '#fff', border: 'none',
                fontSize: 10, fontWeight: 800,
                cursor: 'pointer', flexShrink: 0,
              }}
            >BET</button>
          </div>
        )}
      </div>

      {viewMode === 'director' && (
        <div className="sf-fade-in" style={{ padding: '12px 14px 14px', background: 'var(--sf-stage)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div>
              <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', fontSize: 9 }}>DIRECTOR VIEW</div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 900, marginTop: 2 }}>{cameras.length} rooms open</div>
            </div>
            <button
              onClick={() => setSheetState(s => s === 'closed' ? 'half' : 'closed')}
              className="sf-btn sf-btn-ghost"
              style={{ height: 30, fontSize: 10, padding: '0 12px' }}
            >
              {sheetState === 'closed' ? 'OPEN PANEL' : 'HIDE PANEL'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
            {isCameraIdle && (cameras.length > 0 ? cameras.slice(0, 6) : Array.from({ length: 6 }).map((_, i) => ({
              id: `cam-${i}`,
              name: `CAM ${String(i + 1).padStart(2, '0')}`,
            }))).map((cam, i) => (
              <button
                key={cam.id}
                onClick={() => cameras.length > 0 && setActiveChannel(i)}
                style={{
                aspectRatio: '4/3', borderRadius: 10,
                border: '1px dashed var(--sf-line-strong)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isDirectorCameraName(cam.name) ? 'var(--sf-amber)' : 'var(--sf-fg-3)',
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: cameras.length > 0 ? 'pointer' : 'default',
              }}
              >
                {cam.name}
              </button>
            ))}
            {!isCameraIdle && otherCameras.map(({ cam, idx }) => (
              <button
                key={cam.id}
                onClick={() => {
                  setActiveChannel(idx);
                  onStreamClick(cam.playbackId, cam.name);
                }}
                className="sf-tile"
                style={{
                  aspectRatio: '4/3',
                  padding: 0,
                  background: 'transparent',
                  borderColor: 'var(--sf-line-strong)',
                }}
              >
                <PaletteFill palette={PALETTES[idx % PALETTES.length]}>
                  <div style={{ position: 'absolute', top: 6, left: 6, display: 'flex', gap: 4 }}>
                    <span style={{
                      background: cam.isLive ? 'var(--sf-live)' : 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      fontSize: 8,
                      fontWeight: 900,
                      padding: '2px 5px',
                      borderRadius: 4,
                      letterSpacing: '0.1em',
                    }}>{cam.isLive ? 'LIVE' : 'IDLE'}</span>
                  </div>
                  <div style={{
                    position: 'absolute',
                    left: 7,
                    right: 7,
                    bottom: 7,
                    textAlign: 'left',
                  }}>
                    <div style={{ color: '#fff', fontSize: 12, fontWeight: 900, textShadow: '0 1px 4px rgba(0,0,0,0.75)' }}>{cam.name}</div>
                    <div className="sf-mono" style={{ color: 'rgba(255,255,255,0.82)', fontSize: 9, marginTop: 2 }}>
                      CAM {String(idx + 1).padStart(2, '0')}
                    </div>
                  </div>
                </PaletteFill>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SHOW META + QUICK ACTIONS */}
      <div style={{ padding: '14px 14px 10px' }}>
        <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 6, fontSize: 10 }}>
          STARFACTOR · S01 · DAY 47 · {(activeCam?.name || 'MAIN').toUpperCase()}
        </div>
        <h1 className="sf-display" style={{ fontSize: 18, color: '#fff', marginBottom: 10, lineHeight: 1.1 }}>
          {isCameraIdle
            ? 'Cameras wake at 19:00 WAT. Stay in the room.'
            : activeCam?.description || 'Pick a room. Read the crowd. Back the moment.'}
        </h1>
        {/* Quick-action icon row */}
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <button title="Follow show" aria-label="Follow show"
            onClick={() => onRequireLogin?.()}
            className="sf-btn-icon" style={{ background: 'var(--sf-stage-2)', borderColor: 'var(--sf-line)', color: '#fff', height: 32, width: 32 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          </button>
          <button title="Tip the cast" aria-label="Tip the cast"
            onClick={() => onRequireLogin?.()}
            className="sf-btn-icon" style={{ background: 'var(--sf-stage-2)', borderColor: 'var(--sf-line)', color: '#fff', height: 32, width: 32 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </button>
          <button title="Send gift" aria-label="Send gift"
            onClick={() => onRequireLogin?.()}
            className="sf-btn-icon" style={{ background: 'var(--sf-stage-2)', borderColor: 'var(--sf-line)', color: '#fff', height: 32, width: 32 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7"/></svg>
          </button>
          <button title="Clip 30s" aria-label="Clip last 30s"
            onClick={() => onRequireLogin?.()}
            className="sf-btn-icon" style={{ background: 'var(--sf-stage-2)', borderColor: 'var(--sf-line)', color: '#fff', height: 32, width: 32 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/></svg>
          </button>
          <button title="Share" aria-label="Share"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            className="sf-btn-icon" style={{ background: 'var(--sf-stage-2)', borderColor: 'var(--sf-line)', color: '#fff', height: 32, width: 32 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
          </button>
        </div>
      </div>

      {/* HORIZONTAL CHANNEL RAIL */}
      {viewMode === 'single' && isCameraIdle && (
        <div style={{
          padding: '0 14px 16px',
          display: 'flex', gap: 8, overflowX: 'auto',
        }} className="sf-no-scrollbar">
          {(cameras.length > 0 ? cameras : Array.from({ length: 6 }).map((_, i) => ({
            id: `cam-${i}`,
            name: `CAM ${String(i + 1).padStart(2, '0')}`,
          }))).map((cam, i) => (
            <button
              key={cam.id}
              onClick={() => cameras.length > 0 && setActiveChannel(i)}
              style={{
              flex: '0 0 140px', aspectRatio: '16/9',
              borderRadius: 10,
              border: '1px dashed var(--sf-line-strong)',
              background: 'rgba(255,255,255,0.02)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isDirectorCameraName(cam.name) ? 'var(--sf-amber)' : 'var(--sf-fg-3)',
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: cameras.length > 0 ? 'pointer' : 'default',
            }}
            >
              {cam.name}
            </button>
          ))}
        </div>
      )}
      {viewMode === 'single' && !isCameraIdle && (
        <div style={{
          padding: '0 14px 16px',
          display: 'flex', gap: 8, overflowX: 'auto',
        }} className="sf-no-scrollbar">
          {cameras.map((cam, i) => (
            <button
              key={cam.id}
              onClick={() => {
                setActiveChannel(i);
                onStreamClick(cam.playbackId, cam.name);
              }}
              className={`sf-tile ${i === activeChannel ? 'active' : ''}`}
              style={{ flex: '0 0 140px', aspectRatio: '16/9', padding: 0, background: 'transparent' }}
            >
              <PaletteFill palette={PALETTES[i % PALETTES.length]}>
                <div style={{ position: 'absolute', top: 4, left: 4 }}>
                  <span style={{
                    background: 'rgba(0,0,0,0.7)', color: '#fff',
                    fontSize: 8, fontWeight: 900, padding: '2px 5px',
                    borderRadius: 3, letterSpacing: '0.12em',
                  }}>{cam.isLive ? '● LIVE' : '○ IDLE'}</span>
                </div>
                <div style={{
                  position: 'absolute', bottom: 4, left: 4, right: 4,
                  fontSize: 10, fontWeight: 900, color: '#fff',
                  textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                }}>{cam.name}</div>
              </PaletteFill>
            </button>
          ))}
        </div>
      )}

      {/* BOTTOM SHEET */}
      <div style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        height: sheetHeight,
        background: 'var(--sf-stage)',
        borderTop: '1.5px solid var(--sf-line-strong)',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -20px 50px rgba(0,0,0,0.5)',
        zIndex: 50,
        transition: isDragging ? 'none' : 'height 280ms cubic-bezier(.22,1,.36,1), transform 280ms cubic-bezier(.22,1,.36,1)',
        transform: isDragging ? `translateY(${Math.max(0, dragDelta)}px)` : 'translateY(0)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Drag handle */}
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{ padding: '8px 0 4px', cursor: 'grab', touchAction: 'none' }}
        >
          <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 999, margin: '0 auto' }} />
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--sf-line)', padding: '0 14px' }}>
          {([
            { id: 'predict', label: 'Predict', count: activeMarkets.length },
            { id: 'chat',    label: 'Chat',    count: displayChat.length },
          ] as { id: SheetTab; label: string; count: number }[]).map(t => (
            <button key={t.id} onClick={() => { setSheetTab(t.id); if (sheetState === 'closed') setSheetState('half'); }} className={`sf-tab ${sheetTab === t.id ? 'on' : ''}`}>
              {t.label}
              <span style={{
                fontSize: 9, fontWeight: 800,
                padding: '2px 6px', borderRadius: 999,
                background: sheetTab === t.id ? 'var(--sf-coral)' : 'rgba(255,255,255,0.08)',
                color: sheetTab === t.id ? '#fff' : 'var(--sf-fg-3)',
              }}>{t.count}</span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setSheetState('closed')} style={{
            background: 'transparent', border: 'none', color: 'var(--sf-fg-3)',
            padding: '0 8px', cursor: 'pointer', fontSize: 16,
            display: sheetState === 'closed' ? 'none' : 'block',
          }} aria-label="Minimize panel">−</button>
          <button onClick={() => setSheetState(s => s === 'full' ? 'half' : 'full')} style={{
            background: 'transparent', border: 'none', color: 'var(--sf-fg-3)',
            padding: '0 10px', cursor: 'pointer', fontSize: 18,
          }} aria-label="Toggle size">{sheetState === 'full' ? '⌄' : '⌃'}</button>
        </div>

        {/* Sheet content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 14, display: sheetState === 'closed' ? 'none' : 'flex', flexDirection: 'column', gap: 10 }} className="sf-no-scrollbar">
          {sheetTab === 'predict' && (
            <div className="sf-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ClientOnly>
                <div style={{
                  padding: 12, borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(255,176,32,0.10) 0%, rgba(255,78,43,0.10) 100%)',
                  border: '1px solid rgba(255,176,32,0.25)',
                  display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                }}>
                  <div className="sf-spin-slow" style={{
                    width: 32, height: 32, borderRadius: 999,
                    background: 'radial-gradient(circle at 30% 30%, #FFE68A 0%, #FFB020 60%, #C97A00 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1A0F00', fontWeight: 900, fontSize: 13,
                  }}>★</div>
                    <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                      <div style={{ fontSize: 9, color: 'var(--sf-fg-3)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Stake balance</div>
                    <div style={{ fontSize: 16, color: '#fff', fontWeight: 900, whiteSpace: 'normal' }}>{balance.stakes.toLocaleString()} <span style={{ color: 'var(--sf-amber)', fontSize: 10 }}>{ngn(Math.floor(balance.stakes / 10))}</span></div>
                  </div>
                  {!isAuthenticated && <button onClick={() => onRequireLogin?.()} className="sf-btn sf-btn-coral" style={{ height: 28, fontSize: 10, marginLeft: 'auto' }}>SIGN IN</button>}
                </div>
              </ClientOnly>

              <button
                onClick={() => {
                  if (!isAuthenticated) { onRequireLogin?.(); return; }
                  setShowMarketComposer(true);
                  setSheetState('full');
                }}
                style={{
                  padding: 12,
                  background: 'var(--sf-paper)',
                  color: 'var(--sf-stage)',
                  border: '2px solid var(--sf-stage)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  cursor: 'pointer',
                }}
              >
                <span style={{ textAlign: 'left' }}>
                  <span className="sf-eyebrow" style={{ color: 'var(--sf-coral)', display: 'block', marginBottom: 4 }}>MAKE A MARKET</span>
                  <span style={{ fontSize: 13, fontWeight: 900 }}>Turn a hot take into odds</span>
                </span>
                <span style={{
                  width: 30, height: 30, borderRadius: 999,
                  background: 'var(--sf-coral)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 900,
                }}>+</span>
              </button>

              <ClientOnly>
                {activeMarkets.length === 0 ? (
                  <div style={{ padding: 18, textAlign: 'center', borderRadius: 14, border: '1px dashed var(--sf-line-strong)', color: 'var(--sf-fg-3)' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>🎯</div>
                    <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: 4 }}>
                      {isIdle ? 'Markets open with the show' : 'No active markets'}
                    </p>
                    <p style={{ fontSize: 11, lineHeight: 1.4, marginBottom: 10 }}>
                      {isIdle ? 'Live cams trigger live odds. Be first.' : 'Type /predict in chat to make one.'}
                    </p>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) { onRequireLogin?.(); return; }
                        setShowMarketComposer(true);
                        setSheetState('full');
                      }}
                      className="sf-btn sf-btn-coral"
                      style={{ height: 30, fontSize: 10, padding: '0 12px' }}
                    >OPEN FIRST MARKET</button>
                  </div>
                ) : (
                  activeMarkets.map(m => (
                    <MarketCard key={m.id} market={m} onPick={(opt) => handlePickOption(m.id, opt)}
                      pickedOptionId={pickedBet?.marketId === m.id ? pickedBet.optionId : null}
                      userBetOptionId={userBets.find(b => b.marketId === m.id)?.optionId} />
                  ))
                )}
              </ClientOnly>
            </div>
          )}

          {sheetTab === 'chat' && (
            <div className="sf-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {isIdle && (
                <div style={{
                  padding: 14, marginBottom: 8, textAlign: 'center',
                  borderRadius: 12, border: '1px dashed var(--sf-line-strong)',
                  color: 'var(--sf-fg-3)',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: 4 }}>Chat opens with the show</p>
                  <p style={{ fontSize: 11, lineHeight: 1.4 }}>First takes drop the moment cameras go live.</p>
                </div>
              )}
              <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }} className="sf-no-scrollbar">
                {displayChat.map(m => (
                  <div key={m.id} style={{
                    padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 999, background: m.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 9, fontWeight: 900, flexShrink: 0,
                    }}>{m.name.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: m.color }}>{m.name}</span>
                        <span style={{ fontSize: 9, color: 'var(--sf-fg-4)' }}>{m.time}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--sf-fg-2)', lineHeight: 1.35, marginTop: 1, wordBreak: 'break-word' }}>{m.msg}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendChat} style={{ paddingTop: 8, borderTop: '1px solid var(--sf-line)', display: 'flex', gap: 6 }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onFocus={() => !isAuthenticated && onRequireLogin?.()}
                  placeholder={isAuthenticated ? 'Talk to the house… try /predict' : 'Sign in to chat'}
                  readOnly={!isAuthenticated}
                  style={{
                    flex: 1, padding: '9px 12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--sf-line)',
                    borderRadius: 999, color: '#fff', fontSize: 12, outline: 'none',
                  }}
                />
                <button type="submit" className="sf-btn-icon" style={{ background: 'var(--sf-coral)', borderColor: 'var(--sf-coral)', color: '#fff' }} aria-label="Send">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sticky bet bar (predict tab only) */}
        {sheetTab === 'predict' && pickedBet && sheetState !== 'closed' && (() => {
          const m = markets.find(x => x.id === pickedBet.marketId);
          const opt = m?.options.find(o => o.id === pickedBet.optionId);
          if (!m || !opt) return null;
          const potential = Math.floor(stake * opt.odds);
          const insufficient = stake > balance.stakes;
          return (
            <div className="sf-slide-up" style={{
              padding: 12, borderTop: '1px solid var(--sf-line-strong)',
              background: 'var(--sf-stage-2)',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: 'var(--sf-fg-2)', fontWeight: 700 }}>
                  Backing <span style={{ color: '#fff', fontWeight: 900 }}>{opt.label}</span>
                </span>
                <span style={{ color: 'var(--sf-fg-3)' }}>To win: <span style={{ color: 'var(--sf-mint)', fontWeight: 800 }}>{potential.toLocaleString()}</span></span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[100, 500, 1000, 5000].map(v => (
                  <button key={v} onClick={() => setStake(v)} style={{
                    flex: 1, height: 30,
                    background: stake === v ? 'var(--sf-coral)' : 'transparent',
                    color: stake === v ? '#fff' : 'var(--sf-fg-2)',
                    border: stake === v ? 'none' : '1px solid var(--sf-line)',
                    borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer',
                  }}>{v >= 1000 ? `${v / 1000}K` : v}</button>
                ))}
              </div>
              <button
                onClick={handlePlaceBet}
                disabled={insufficient}
                className={`sf-btn ${insufficient ? 'sf-btn-ghost' : 'sf-btn-coral'}`}
                style={{ height: 40, fontSize: 12, opacity: insufficient ? 0.5 : 1 }}
              >
                {insufficient ? 'INSUFFICIENT' : `PLACE BET · ${stake.toLocaleString()}`}
              </button>
            </div>
          );
        })()}
      </div>

      {/* Create market composer */}
      {showMarketComposer && (
        <div className="fixed inset-0 z-[70] sf-fade-in">
          <div onClick={() => setShowMarketComposer(false)} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(10,8,20,0.78)', backdropFilter: 'blur(8px)',
          }} />
          <div className="sf-slide-up" style={{
            position: 'absolute', left: 10, right: 10, bottom: 10,
            maxHeight: 'calc(100vh - 28px)',
            overflow: 'auto',
            background: 'var(--sf-stage-2)',
            color: '#fff',
            border: '1.5px solid var(--sf-line-strong)',
            borderRadius: 18,
            padding: 16,
            boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: 'var(--sf-grad-coral)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 18,
              }}>+</div>
              <div style={{ flex: 1 }}>
                <div className="sf-display" style={{ fontSize: 20 }}>CREATE MARKET</div>
                <div style={{ fontSize: 10, color: 'var(--sf-fg-3)', marginTop: 2 }}>Let chat bet on the next beat</div>
              </div>
              <button onClick={() => setShowMarketComposer(false)} aria-label="Close" style={{
                width: 32, height: 32, borderRadius: 999,
                border: '1px solid var(--sf-line)', background: 'rgba(255,255,255,0.04)',
                color: '#fff', fontSize: 18,
              }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sf-fg-3)', display: 'block', marginBottom: 6 }}>Question</label>
                <input
                  value={predictQuestion}
                  onChange={e => setPredictQuestion(e.target.value)}
                  placeholder="Will Ada win the pool task?"
                  style={{
                    width: '100%', padding: '11px 12px',
                    borderRadius: 10, border: '1px solid var(--sf-line)',
                    background: 'rgba(255,255,255,0.04)', color: '#fff',
                    outline: 'none', fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sf-fg-3)', display: 'block', marginBottom: 6 }}>Category</label>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="sf-no-scrollbar">
                  {(['contestant', 'event', 'challenge', 'drama', 'other'] as const).map(cat => (
                    <button key={cat} onClick={() => setPredictCategory(cat)} style={{
                      flex: '0 0 auto',
                      padding: '7px 11px', borderRadius: 999,
                      background: predictCategory === cat ? 'var(--sf-coral)' : 'transparent',
                      color: predictCategory === cat ? '#fff' : 'var(--sf-fg-2)',
                      border: '1px solid var(--sf-line)',
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>{cat}</button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sf-fg-3)' }}>Options</label>
                  {predictOptions.length < 4 && (
                    <button onClick={() => setPredictOptions([...predictOptions, ''])} style={{
                      border: 'none', background: 'none', color: 'var(--sf-coral)',
                      fontSize: 11, fontWeight: 800,
                    }}>+ Add</button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {predictOptions.map((o, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6 }}>
                      <input
                        value={o}
                        onChange={e => {
                          const next = [...predictOptions];
                          next[idx] = e.target.value;
                          setPredictOptions(next);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        style={{
                          flex: 1, padding: '10px 11px',
                          borderRadius: 10, border: '1px solid var(--sf-line)',
                          background: 'rgba(255,255,255,0.04)', color: '#fff',
                          outline: 'none', fontSize: 12,
                        }}
                      />
                      {predictOptions.length > 2 && (
                        <button onClick={() => setPredictOptions(predictOptions.filter((_, i) => i !== idx))} style={{
                          width: 36, borderRadius: 10,
                          border: '1px solid rgba(255,107,107,0.3)',
                          background: 'rgba(255,107,107,0.12)',
                          color: '#FF6B6B',
                          fontSize: 16,
                        }}>×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sf-fg-3)', display: 'block', marginBottom: 6 }}>Duration</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                  {[1, 6, 12, 24, 48].map(h => (
                    <button key={h} onClick={() => setPredictDuration(h)} style={{
                      padding: '8px 0', borderRadius: 8,
                      background: predictDuration === h ? 'var(--sf-coral)' : 'transparent',
                      color: predictDuration === h ? '#fff' : 'var(--sf-fg-2)',
                      border: '1px solid var(--sf-line)',
                      fontSize: 11, fontWeight: 800,
                    }}>{h}h</button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateMarket}
                disabled={!predictQuestion.trim() || predictOptions.filter(o => o.trim()).length < 2}
                className="sf-btn sf-btn-coral"
                style={{ height: 44, width: '100%', fontSize: 12, opacity: (!predictQuestion.trim() || predictOptions.filter(o => o.trim()).length < 2) ? 0.5 : 1 }}
              >
                CREATE MARKET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channel drawer (left) */}
      {showChannelDrawer && (
        <div className="fixed inset-0 z-[60]">
          <div onClick={() => setShowChannelDrawer(false)} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(10,8,20,0.7)', backdropFilter: 'blur(4px)',
          }} />
          <div className="sf-drawer-in" style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 280,
            background: 'var(--sf-stage-2)', borderRight: '1px solid var(--sf-line-strong)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--sf-line)' }}>
              <div className="sf-eyebrow" style={{ color: 'var(--sf-fg-3)' }}>STARFACTOR</div>
              <div style={{ fontSize: 16, color: '#fff', fontWeight: 900, marginTop: 2 }}>Cameras</div>
            </div>
            <nav style={{ flex: 1, padding: 10, display: 'flex', flexDirection: 'column', gap: 6, overflow: 'auto' }} className="sf-no-scrollbar">
              {cameras.map((cam, i) => (
                <button
                  key={cam.id}
                  onClick={() => {
                    setActiveChannel(i);
                    onStreamClick(cam.playbackId, cam.name);
                    setShowChannelDrawer(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 10, borderRadius: 12,
                    background: i === activeChannel ? 'rgba(255,78,43,0.10)' : 'transparent',
                    border: i === activeChannel ? '1px solid var(--sf-coral)' : '1px solid var(--sf-line)',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ width: 56, height: 36, borderRadius: 8, overflow: 'hidden' }}>
                    <PaletteFill palette={PALETTES[i % PALETTES.length]} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{cam.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--sf-fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {cam.isLive ? '● LIVE' : '○ Idle'} · {((i + 1) * 4321).toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
            <div style={{ padding: 14, borderTop: '1px solid var(--sf-line)' }}>
              <Link href="/" className="sf-btn sf-btn-ghost" style={{ width: '100%', height: 36, fontSize: 11 }}>← BACK TO HOME</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Mini market card for sheet ──
const MarketCard: React.FC<{
  market: PredictionMarket;
  onPick: (optionId: string) => void;
  pickedOptionId: string | null;
  userBetOptionId?: string;
}> = ({ market, onPick, pickedOptionId, userBetOptionId }) => {
  return (
    <div className="sf-fade-in" style={{
      padding: 12,
      background: 'var(--sf-stage-2)',
      border: '1px solid var(--sf-line)',
      borderRadius: 14,
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 4 }}>{market.question}</div>
      <div style={{ fontSize: 10, color: 'var(--sf-fg-3)', marginBottom: 8 }}>
        Pool <span style={{ color: 'var(--sf-amber)', fontWeight: 800 }}>{market.totalPool.toLocaleString()}</span> · {market.category}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {market.options.map((o, i) => {
          const isPicked = pickedOptionId === o.id;
          const isBet = userBetOptionId === o.id;
          const dot = optionDot(i);
          return (
            <button key={o.id} onClick={() => onPick(o.id)} className={`sf-pred-row ${isPicked ? 'on' : ''}`} style={{ borderColor: isPicked ? 'var(--sf-coral)' : isBet ? 'var(--sf-mint)' : undefined }}>
              <div className="sf-pred-fill" style={{ width: `${o.percentage}%`, background: optionFill(i, isPicked) }} />
              <div style={{ position: 'relative', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: dot, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', flex: 1 }}>{o.label}</span>
                {isBet && <span style={{ fontSize: 8, color: 'var(--sf-mint)', fontWeight: 800 }}>BACKED</span>}
                <span style={{ fontSize: 9, color: 'var(--sf-fg-2)' }}>{o.percentage}%</span>
                <span style={{ fontSize: 10, fontWeight: 900, color: dot, minWidth: 32, textAlign: 'right' }}>{o.odds.toFixed(1)}x</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileLayout;

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import LivepeerPlayer from '@/components/LivepeerPlayer';
import ClientOnly from '@/components/ClientOnly';
import MobileLayout from '@/components/MobileLayout';
import SunArcIndicator from '@/components/SunArcIndicator';
import { useDaylight } from '@/lib/daylight';
import { useUserStore } from '@/stores/userStore';
import { usePredictionStore } from '@/stores/predictionStore';
import { MarketCreationData, PredictionMarket } from '@/types/prediction';

// ── Types ────────────────────────────────────────────────────
interface Camera {
  id: string;
  name: string;
  playbackId: string;
  streamId: string;
  isActive: boolean;
  description: string;
}

interface CastMember {
  name: string;
  handle: string;
  city: string;
  age: number;
  color: string;
  odds: number;
  status: string;
  palette: string;
}

interface ScheduleSlot {
  time: string;
  title: string;
  tag: string;
  color: string;
  live?: boolean;
  big?: boolean;
}

interface LeaderEntry {
  rank: number;
  name: string;
  won: number;
  streak: number;
  color: string;
}

interface ChatLineData {
  id: string;
  name: string;
  color: string;
  msg: string;
  time: string;
  tier?: 'hot' | 'system' | 'normal';
  coin?: number;
}

// ── Demo data (cast / schedule / leaderboard / chat / hot strip) ──
const CAST: CastMember[] = [
  { name: 'Ada',     handle: 'ada_lg',    city: 'Lagos',   age: 24, color: '#FF4E2B', odds: 2.4, status: 'In task',        palette: 'coral' },
  { name: 'Tunde',   handle: 'tunds_xx',  city: 'Ibadan',  age: 27, color: '#6B3FE5', odds: 3.1, status: 'In task',        palette: 'violet' },
  { name: 'Kemi',    handle: 'kemi_okay', city: 'Abuja',   age: 22, color: '#F2B544', odds: 4.6, status: 'Eviction risk',  palette: 'gold' },
  { name: 'Bayo',    handle: 'bayo_b',    city: 'Lagos',   age: 26, color: '#1FD17A', odds: 5.0, status: 'Diary',          palette: 'mint' },
  { name: 'Ngozi',   handle: 'ngzz',      city: 'Enugu',   age: 23, color: '#4D7AFF', odds: 6.2, status: 'In task',        palette: 'sky' },
  { name: 'Femi',    handle: 'femi.t',    city: 'Lagos',   age: 28, color: '#FF1F3D', odds: 8.4, status: 'Eviction risk',  palette: 'rose' },
  { name: 'Zainab',  handle: 'z_b',       city: 'Kaduna',  age: 25, color: '#5ACDFF', odds: 11,  status: 'Sleeping',       palette: 'sky' },
  { name: 'Chuka',   handle: 'chux',      city: 'Port H.', age: 29, color: '#FFB020', odds: 14,  status: 'Cooking',        palette: 'gold' },
  { name: 'Sade',    handle: 'sade.live', city: 'Akure',   age: 24, color: '#C8EB6D', odds: 16,  status: 'In garden',      palette: 'mint' },
  { name: 'Musa',    handle: 'musa.ng',   city: 'Kano',    age: 30, color: '#8DAAFF', odds: 18,  status: 'Strategy',       palette: 'violet' },
  { name: 'Ife',     handle: 'ife_m',     city: 'Benin',   age: 23, color: '#FF7A59', odds: 20,  status: 'Cooking',        palette: 'coral' },
  { name: 'Dara',    handle: 'dara.wav',  city: 'Lagos',   age: 26, color: '#C4A5FF', odds: 22,  status: 'Chilling',       palette: 'night' },
  { name: 'Efe',     handle: 'efe.delta', city: 'Warri',   age: 27, color: '#7EE0FF', odds: 24,  status: 'Gym',            palette: 'sky' },
  { name: 'Lola',    handle: 'lola_lit',  city: 'Ogun',    age: 22, color: '#FF6B8A', odds: 26,  status: 'In task',        palette: 'rose' },
  { name: 'Korede',  handle: 'korede.k',  city: 'Ilorin',  age: 28, color: '#FFD166', odds: 28,  status: 'Diary queue',    palette: 'gold' },
  { name: 'Nneka',   handle: 'nneka_n',   city: 'Owerri',  age: 25, color: '#44D7A8', odds: 30,  status: 'Pool deck',      palette: 'mint' },
];

const SCHEDULE: ScheduleSlot[] = [
  { time: '20:00',     title: 'Poolside Task Finale', tag: 'TASK',  color: '#1FD17A', live: true },
  { time: '21:30',     title: 'House Dinner',         tag: 'CHILL', color: '#F2B544' },
  { time: '22:00',     title: 'Truth or Dare Round',  tag: 'DRAMA', color: '#6B3FE5' },
  { time: '23:00',     title: 'Diary Room — Kemi',    tag: 'SOLO',  color: '#4D7AFF' },
  { time: 'SUN 19:00', title: 'LIVE EVICTION',        tag: 'PRIME', color: '#FF1F3D', big: true },
];

const LEADERBOARD: LeaderEntry[] = [
  { rank: 1, name: 'NaijaSage',  won: 412300, streak: 9, color: '#FF4E2B' },
  { rank: 2, name: '9JaKid',     won: 318420, streak: 4, color: '#1FD17A' },
  { rank: 3, name: 'AbujaQueen', won: 240120, streak: 3, color: '#6B3FE5' },
  { rank: 4, name: 'PHCity',     won: 188090, streak: 2, color: '#F2B544' },
  { rank: 5, name: 'Dami_O',     won: 152300, streak: 0, color: '#5ACDFF' },
];

const SEED_CHAT: ChatLineData[] = [
  { id: 'c1', name: 'Tola_LG',     color: '#6B3FE5', msg: 'WAHALA Kemi about to flip the table 🔥', time: 'now',  tier: 'hot' },
  { id: 'c2', name: '9JaKid',      color: '#1FD17A', msg: 'Bayo dey scheme for diary again',         time: 'now' },
  { id: 'c3', name: 'Ife_M',       color: '#FF4E2B', msg: 'My ₦5K on Femi for eviction. Lock it.',   time: '10s', coin: 5000 },
  { id: 'c4', name: 'DJBolu',      color: '#F2B544', msg: 'cooking she said COOKING 👨‍🍳',          time: '14s' },
  { id: 'c5', name: 'AbujaQueen',  color: '#5ACDFF', msg: 'Tunde acting fake for camera',            time: '22s' },
  { id: 'c6', name: 'PHCity',      color: '#FF1F3D', msg: 'KISS market just shifted to YES heavy',   time: '30s', tier: 'system' },
  { id: 'c7', name: 'Dami_O',      color: '#4D7AFF', msg: 'someone post the clip from earlier',      time: '40s' },
  { id: 'c8', name: 'NguMoney',    color: '#FFB020', msg: 'I cashed out ₦12K from yesterday market 💰', time: '52s', coin: 12000 },
  { id: 'c9', name: 'Sage',        color: '#1FD17A', msg: 'Watch Ngozi carefully, she playing 4D chess', time: '1m' },
];

const HOT_STRIP = [
  { tag: 'NOW',   color: '#FF4E2B', label: 'Tunde explains pick' },
  { tag: '01:22', color: '#FF1F3D', label: 'Pool task closes' },
  { tag: '12h',   color: '#F2B544', label: 'Kiss prediction lock' },
  { tag: 'SUN',   color: '#6B3FE5', label: 'Live eviction · ₦902K pool' },
  { tag: 'HOT',   color: '#1FD17A', label: 'Bayo → Diary Room' },
];

// House Map rooms (Director's Booth D). camIdx = which camera index this room maps to.
// rect coords inside 800x280 viewbox.
interface HouseRoom {
  x: number; y: number; w: number; h: number;
  label: string;
  camIdx: number;
  tag: 'PRIME' | 'HOT' | 'TASK' | 'CHILL' | 'SOLO' | 'IDLE' | 'NSFW' | 'B-ROLL';
  watchers: number;
  hot?: boolean;
}
const HOUSE_ROOMS: HouseRoom[] = [
  { x: 40,  y: 40,  w: 220, h: 110, label: 'Living Room',  camIdx: 0, tag: 'PRIME',  watchers: 18420, hot: true },
  { x: 270, y: 40,  w: 140, h: 110, label: 'Kitchen',      camIdx: 1, tag: 'CHILL',  watchers: 4210 },
  { x: 420, y: 40,  w: 160, h: 70,  label: 'Diary',        camIdx: 6, tag: 'SOLO',   watchers: 4120 },
  { x: 420, y: 120, w: 160, h: 30,  label: 'Hallway',      camIdx: 7, tag: 'IDLE',   watchers: 640 },
  { x: 590, y: 40,  w: 170, h: 110, label: 'Bedroom 1',    camIdx: 4, tag: 'NSFW',   watchers: 2410 },
  { x: 40,  y: 160, w: 170, h: 80,  label: 'Bedroom 2',    camIdx: 5, tag: 'HOT',    watchers: 8410, hot: true },
  { x: 220, y: 160, w: 130, h: 80,  label: 'Gym',          camIdx: 0, tag: 'IDLE',   watchers: 1280 },
  { x: 360, y: 160, w: 120, h: 80,  label: 'Bathroom',     camIdx: 1, tag: 'IDLE',   watchers: 120 },
  { x: 490, y: 160, w: 130, h: 80,  label: 'Pool',         camIdx: 2, tag: 'TASK',   watchers: 9120 },
  { x: 630, y: 160, w: 130, h: 80,  label: 'Garden',       camIdx: 3, tag: 'IDLE',   watchers: 1820 },
];

const TAG_COLOR: Record<HouseRoom['tag'], string> = {
  PRIME: '#FF4E2B', HOT: '#FF1F3D', TASK: '#1FD17A', CHILL: '#F2B544',
  SOLO: '#4D7AFF', IDLE: 'rgba(255,255,255,0.22)', NSFW: '#6B3FE5', 'B-ROLL': '#5ACDFF',
};

// Cast positions on the floor plan (viewBox 800x280)
const CAST_POSITIONS: { name: string; color: string; x: number; y: number }[] = [
  { name: 'Tunde',  color: '#6B3FE5', x: 130, y: 90 },
  { name: 'Ada',    color: '#FF4E2B', x: 165, y: 95 },
  { name: 'Kemi',   color: '#F2B544', x: 340, y: 90 },
  { name: 'Bayo',   color: '#1FD17A', x: 555, y: 200 },
  { name: 'Ngozi',  color: '#4D7AFF', x: 110, y: 200 },
  { name: 'Femi',   color: '#FF1F3D', x: 90,  y: 200 },
  { name: 'Zainab', color: '#5ACDFF', x: 670, y: 80 },
  { name: 'Chuka',  color: '#FFB020', x: 480, y: 70 },
  { name: 'Sade',   color: '#C8EB6D', x: 250, y: 205 },
  { name: 'Musa',   color: '#8DAAFF', x: 315, y: 205 },
  { name: 'Ife',    color: '#FF7A59', x: 455, y: 205 },
  { name: 'Dara',   color: '#C4A5FF', x: 535, y: 205 },
  { name: 'Efe',    color: '#7EE0FF', x: 705, y: 205 },
  { name: 'Lola',   color: '#FF6B8A', x: 700, y: 115 },
  { name: 'Korede', color: '#FFD166', x: 520, y: 96 },
  { name: 'Nneka',  color: '#44D7A8', x: 600, y: 205 },
];

const TICKER_MESSAGES = [
  '🔥 Kemi & Tunde argument · The Mansion',
  '💰 ₦902K eviction pool open all week',
  '⚡ Pool task in 1h 22m · Team Sun 1.9x · Team Moon 2.0x',
  '👀 Bayo heading to Diary Room',
  '🎯 NaijaSage ₦412K won this week',
];

const REACTION_KEYS = ['fire', 'wahala', 'hard', 'noway', 'cook', 'heart'] as const;
type ReactionKey = typeof REACTION_KEYS[number];

const REACTION_SVG: Record<ReactionKey, React.ReactNode> = {
  fire: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none">
      <path d="M16 4c2 4 6 6 6 11a6 6 0 0 1-12 0c0-2 1-3 2-4-1 4 2 6 4 5-3-2-2-7 0-12z" fill="#fff" stroke="#0E0A1F" strokeWidth="1.6"/>
      <path d="M14 22a3 3 0 0 0 5 0c0-2-2-2-2-4-1 1-3 2-3 4z" fill="#FFD23F" stroke="#0E0A1F" strokeWidth="1.4"/>
    </svg>
  ),
  wahala: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none">
      <path d="M16 4l13 22H3L16 4z" fill="#fff" stroke="#0E0A1F" strokeWidth="1.6"/>
      <path d="M16 12v7" stroke="#0E0A1F" strokeWidth="2.4" strokeLinecap="round"/>
      <circle cx="16" cy="22.5" r="1.4" fill="#0E0A1F"/>
    </svg>
  ),
  hard: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none">
      <path d="M16 3l4 6 7 1-5 5 1 7-7-3-7 3 1-7-5-5 7-1z" fill="#fff" stroke="#0E0A1F" strokeWidth="1.6"/>
      <path d="M14 13l2 2 4-4" stroke="#0E0A1F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  noway: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none">
      <circle cx="16" cy="16" r="12" fill="#fff" stroke="#0E0A1F" strokeWidth="1.6"/>
      <circle cx="11" cy="14" r="2.2" fill="#0E0A1F"/>
      <circle cx="21" cy="14" r="2.2" fill="#0E0A1F"/>
      <path d="M10 23c2-3 4-3 6-3s4 0 6 3" stroke="#0E0A1F" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  cook: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none">
      <path d="M6 14c0-3 3-6 10-6s10 3 10 6v3H6v-3z" fill="#fff" stroke="#0E0A1F" strokeWidth="1.6"/>
      <rect x="6" y="17" width="20" height="10" rx="2" fill="#fff" stroke="#0E0A1F" strokeWidth="1.6"/>
      <path d="M11 8c0-2 1-3 2-2M16 8c0-3 1-3 2-2M21 8c0-2 1-3 2-2" stroke="#0E0A1F" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none">
      <path d="M16 27S5 19.5 5 13a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 6.5-11 14-11 14z" fill="#fff" stroke="#0E0A1F" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
};

// ── Helpers ──────────────────────────────────────────────────
const fmt = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + 'K';
  return n.toString();
};
const ngn = (n: number) => '₦' + fmt(n);

const optionDot = (idx: number) => ['var(--sf-mint)', 'var(--sf-coral)', 'var(--sf-violet)', 'var(--sf-cyan-warm)'][idx % 4];
const optionFill = (idx: number, picked = false) => {
  if (picked) return 'rgba(255,78,43,0.18)';
  return ['rgba(31,209,122,0.12)', 'rgba(255,78,43,0.12)', 'rgba(107,63,229,0.12)', 'rgba(90,205,255,0.12)'][idx % 4];
};

const PRODUCT_STACK = [
  { kicker: 'Watch', title: 'Switch any room. Never lose stage.', copy: 'Mansion, Pool, Kitchen, Diary — all live, one tap.', stat: '8 cams', color: '#FF4E2B' },
  { kicker: 'Predict', title: 'Back the moment. Stay in stream.', copy: 'Markets ride the side rail. No tabs.', stat: '₦902K', color: '#1FD17A' },
  { kicker: 'Vote', title: 'Save your fav. Watch the pool move.', copy: 'Weekly eviction. Fan stakes show real-time.', stat: 'Weekly', color: '#FF1F3D' },
  { kicker: 'Earn', title: 'Cash out without leaving.', copy: 'Stake, clout, and cash-out one tap from chat.', stat: '+12K', color: '#F2B544' },
];

const FLOW_STACK = [
  { step: '01', label: 'Pick a room', detail: 'Multicam grid + camera rail. Tap to switch.' },
  { step: '02', label: 'Read the crowd', detail: 'Chat, hot strip, ticker. Crowd pulse live.' },
  { step: '03', label: 'Back the call', detail: 'Stake on the side panel. Stream keeps playing.' },
  { step: '04', label: 'Cash out · keep watching', detail: 'Win, claim, ride the night to the next beat.' },
];

const palettes: Record<string, { a: string; b: string; c: string }> = {
  coral:  { a: '#FF4E2B', b: '#F2B544', c: '#0A0814' },
  violet: { a: '#6B3FE5', b: '#8DAAFF', c: '#0A0814' },
  mint:   { a: '#1FD17A', b: '#C8EB6D', c: '#0A0814' },
  gold:   { a: '#F2B544', b: '#FF4E2B', c: '#0A0814' },
  night:  { a: '#1A1247', b: '#6B3FE5', c: '#FF4E2B' },
  sky:    { a: '#5ACDFF', b: '#8DAAFF', c: '#0A0814' },
  rose:   { a: '#FF1F3D', b: '#FF4E2B', c: '#1A0410' },
};

// Derive a palette key from index for fallback gradient
const paletteForIdx = (idx: number): string => {
  const keys = ['coral', 'violet', 'gold', 'mint', 'sky', 'rose', 'night', 'violet'];
  return keys[idx % keys.length];
};

// ── Small UI primitives ──────────────────────────────────────
const SFWordmark: React.FC<{ size?: number; color?: string; dot?: string }> = ({ size = 22, color = 'currentColor', dot = '#FF4E2B' }) => (
  <span className="sf-display" style={{
    fontSize: size, fontWeight: 900, color,
    letterSpacing: '-0.05em', lineHeight: 1,
    display: 'inline-flex', alignItems: 'center', gap: 1,
  }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        width: size * 0.78, height: size * 0.78,
        borderRadius: 6,
        background: 'var(--sf-stage)',
        border: '1.5px solid ' + color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55}>
          <path d="M12 2l2.6 6.4L21 9l-5 4.7L17.5 21 12 17.6 6.5 21 8 13.7 3 9l6.4-.6L12 2z"
            fill={dot} stroke={color} strokeWidth="0.8" strokeLinejoin="round" />
        </svg>
      </span>
      <span style={{ fontStyle: 'italic' }}>starfactor</span>
    </span>
    <span style={{ color: dot, marginLeft: 1 }}>.</span>
  </span>
);

const Avatar: React.FC<{ name: string; color: string; size?: number; ring?: boolean }> = ({ name, color, size = 32, ring = false }) => (
  <div style={{
    width: size, height: size, borderRadius: 999,
    background: color,
    border: ring ? `2px solid var(--sf-coral)` : '1.5px solid rgba(255,255,255,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 900, fontSize: size * 0.4,
    flexShrink: 0,
    fontFamily: 'Inter Display,Inter,sans-serif',
    letterSpacing: '-0.02em',
  }}>
    {name.charAt(0).toUpperCase()}
  </div>
);

const LiveDot: React.FC<{ label?: string; color?: string }> = ({ label = 'LIVE', color = 'var(--sf-live)' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: 999, background: color,
    color: '#fff', fontSize: 10, fontWeight: 900, letterSpacing: '0.16em',
  }}>
    <span className="sf-pulse" style={{ background: '#fff', boxShadow: '0 0 0 3px rgba(255,255,255,0.3)' }}></span>
    {label}
  </span>
);

const PaletteFill: React.FC<{ palette: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({ palette, children, style }) => {
  const p = palettes[palette] || palettes.coral;
  return (
    <div className="sf-photo" style={{
      width: '100%', height: '100%',
      background: `radial-gradient(120% 120% at 80% 20%, ${p.b} 0%, ${p.a} 50%, ${p.c} 120%)`,
      ...style,
    }}>
      <div className="sf-photo-grain"></div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.45 }}>
        <circle cx="78" cy="22" r="14" fill={p.b} fillOpacity="0.55" />
        <circle cx="20" cy="78" r="26" fill={p.c} fillOpacity="0.30" />
        <path d="M 0 60 Q 30 50 50 60 T 100 55" stroke={p.c} strokeWidth="0.5" fill="none" opacity="0.7" />
        <path d="M 0 75 Q 30 65 55 70 T 100 68" stroke={p.b} strokeWidth="0.4" fill="none" opacity="0.5" />
      </svg>
      {children}
    </div>
  );
};

// Floating reactions (decorative)
const FloatingReactions: React.FC = () => {
  const keys: ReactionKey[] = ['fire', 'heart', 'cook', 'wahala', 'fire', 'heart'];
  return (
    <div style={{ position: 'absolute', left: 16, bottom: 80, width: 60, height: 220, pointerEvents: 'none' }}>
      {keys.map((k, i) => (
        <div key={i} className="sf-react-float" style={{
          left: (i * 13) % 30, bottom: 0,
          animationDelay: `${i * 0.7}s`,
          width: 30, height: 30,
        }}>
          <div style={{ width: 30, height: 30, borderRadius: 999, background: '#fff', border: '1.5px solid #0E0A1F', padding: 4 }}>
            {REACTION_SVG[k]}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Login Modal (kept from original) ─────────────────────────
const LoginPromptModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  action?: string;
}> = ({ isOpen, onClose, onLogin, action = 'continue' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sf-fade-in">
      <div className="absolute inset-0" style={{ background: 'rgba(10,8,20,0.78)', backdropFilter: 'blur(10px)' }} onClick={onClose} />
      <div className="relative sf-paper sf-fade-in" style={{
        maxWidth: 440, width: 'calc(100% - 32px)',
        padding: 32, borderRadius: 24,
        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
        border: '2px solid var(--sf-stage)',
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 14, right: 14,
          width: 32, height: 32, borderRadius: 999,
          background: 'var(--sf-stage)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>×</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, margin: '0 auto 18px',
            borderRadius: 20,
            background: 'var(--sf-grad-coral)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 32,
          }}>★</div>
          <h3 className="sf-display" style={{ fontSize: 28, color: 'var(--sf-stage)', marginBottom: 8 }}>SIGN IN TO CONTINUE</h3>
          <p style={{ color: 'rgba(10,8,20,0.65)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
            Sign in to {action}. Free viewers can still watch every camera.
          </p>
          <button onClick={onLogin} className="sf-btn sf-btn-coral" style={{ width: '100%', height: 48, fontSize: 13 }}>
            SIGN IN
          </button>
          <button onClick={onClose} className="sf-btn sf-btn-stage" style={{ width: '100%', height: 40, marginTop: 10, fontSize: 11 }}>
            KEEP WATCHING
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Prediction Card (in side dock) ───────────────────────────
const PredictionCard: React.FC<{
  market: PredictionMarket;
  onPick: (optionId: string) => void;
  pickedOptionId: string | null;
  userBetOptionId?: string;
}> = ({ market, onPick, pickedOptionId, userBetOptionId }) => {
  const closing = useMemo(() => {
    const ms = new Date(market.expiresAt).getTime() - Date.now();
    return ms > 0 && ms < 1000 * 60 * 60 * 2;
  }, [market.expiresAt]);
  const closesIn = useMemo(() => {
    const ms = new Date(market.expiresAt).getTime() - Date.now();
    if (ms <= 0) return 'ended';
    const h = Math.floor(ms / 3.6e6);
    const m = Math.floor((ms % 3.6e6) / 6e4);
    if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }, [market.expiresAt]);

  return (
    <div className="sf-fade-in" style={{
      padding: 14,
      background: 'var(--sf-stage-2)',
      border: `1px solid ${closing ? 'rgba(255,31,61,0.4)' : 'var(--sf-line)'}`,
      borderRadius: 14, position: 'relative',
    }}>
      {closing && (
        <div style={{
          position: 'absolute', top: -8, right: 12,
          background: 'var(--sf-live)', color: '#fff',
          fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
          padding: '2px 8px', borderRadius: 4,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span className="sf-pulse" style={{ background: '#fff', width: 5, height: 5, boxShadow: '0 0 0 2px rgba(255,255,255,0.3)' }}></span>
          CLOSING
        </div>
      )}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.01em' }}>{market.question}</div>
        <div style={{ fontSize: 11, color: 'var(--sf-fg-3)', marginTop: 2 }}>by {market.creatorUsername} · {market.category}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, color: 'var(--sf-fg-3)', marginBottom: 10 }}>
        <span><span style={{ color: 'var(--sf-amber)', fontWeight: 800 }}>{market.totalPool.toLocaleString()} stakes</span> pool</span>
        <span>·</span>
        <span>Closes in <span className="sf-mono" style={{ color: '#fff' }}>{closesIn}</span></span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {market.options.map((opt, i) => {
          const isPicked = pickedOptionId === opt.id;
          const isBet = userBetOptionId === opt.id;
          const dotColor = optionDot(i);
          return (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              className={`sf-pred-row ${isPicked ? 'on' : ''}`}
              style={{ borderColor: isPicked ? 'var(--sf-coral)' : isBet ? 'var(--sf-mint)' : undefined }}
            >
              <div className="sf-pred-fill" style={{
                width: `${opt.percentage}%`,
                background: optionFill(i, isPicked),
              }} />
              <div style={{ position: 'relative', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="sf-house-dot" style={{ background: dotColor, width: 7, height: 7 }}></span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', flex: 1 }}>{opt.label}</span>
                {isBet && <span style={{ fontSize: 9, color: 'var(--sf-mint)', fontWeight: 800 }}>● BACKED</span>}
                <span style={{ fontSize: 10, color: 'var(--sf-fg-2)', fontWeight: 700 }}>{opt.percentage}%</span>
                <span style={{ fontSize: 11, fontWeight: 900, color: dotColor, minWidth: 38, textAlign: 'right' }}>
                  {opt.odds.toFixed(2)}x
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DirectorTile: React.FC<{
  cam: Camera;
  index: number;
  active: boolean;
  onSelect: () => void;
}> = ({ cam, index, active, onSelect }) => (
  <button
    onClick={onSelect}
    className={`sf-tile ${active ? 'active' : ''}`}
    style={{
      aspectRatio: '16/10',
      padding: 0,
      background: 'var(--sf-stage)',
      borderColor: active ? 'var(--sf-coral)' : 'var(--sf-line)',
      minHeight: 128,
    }}
  >
    <div style={{ position: 'absolute', inset: 0 }}>
      <ClientOnly>
        <LivepeerPlayer playbackId={cam.playbackId} autoPlay={true} showControls={false} showStatus={false} className="w-full h-full" />
      </ClientOnly>
    </div>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, rgba(10,8,20,0.02) 35%, rgba(10,8,20,0.82) 100%)',
      pointerEvents: 'none',
    }} />
    <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{
        padding: '3px 7px',
        borderRadius: 5,
        background: cam.isActive ? 'var(--sf-live)' : 'rgba(255,255,255,0.15)',
        color: '#fff',
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: '0.12em',
      }}>{cam.isActive ? 'LIVE' : 'IDLE'}</span>
      {active && (
        <span style={{
          padding: '3px 7px',
          borderRadius: 5,
          background: 'var(--sf-paper)',
          color: 'var(--sf-stage)',
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: '0.12em',
        }}>MAIN</span>
      )}
    </div>
    <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, textAlign: 'left' }}>
      <div className="sf-display" style={{ color: '#fff', fontSize: 18, marginBottom: 3 }}>{cam.name}</div>
      <div className="sf-mono" style={{ color: 'rgba(255,255,255,0.74)', fontSize: 10, fontWeight: 800 }}>
        CAM {String(index + 1).padStart(2, '0')} · {((index + 1) * 4321).toLocaleString()} watching
      </div>
    </div>
  </button>
);

const DirectorGrid: React.FC<{
  cameras: Camera[];
  activeChannel: number;
  onSelect: (idx: number) => void;
  onExit: () => void;
  compactWidgets: boolean;
}> = ({ cameras, activeChannel, onSelect, onExit, compactWidgets }) => {
  const mainCam = cameras[activeChannel] || cameras[0] || null;
  const otherCams = cameras
    .map((cam, idx) => ({ cam, idx }))
    .filter(({ idx }) => idx !== activeChannel);

  return (
    <div className="sf-fade-in" style={{
      position: 'relative',
      borderRadius: 18,
      overflow: 'hidden',
      border: '2px solid var(--sf-paper)',
      background: 'var(--sf-stage-2)',
      boxShadow: '0 30px 90px -28px rgba(255,78,43,0.38)',
    }}>
      <div style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        borderBottom: '1px solid var(--sf-line)',
        background: 'linear-gradient(90deg, rgba(255,78,43,0.14), rgba(255,176,32,0.04))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{
            padding: '5px 10px',
            borderRadius: 999,
            background: 'var(--sf-coral)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.16em',
            whiteSpace: 'nowrap',
          }}>DIRECTOR VIEW</span>
          <span style={{ color: 'var(--sf-fg-2)', fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            One main feed, every room within reach
          </span>
        </div>
        <button onClick={onExit} className="sf-btn sf-btn-paper" style={{ height: 32, fontSize: 10, flexShrink: 0 }}>
          SINGLE VIEW
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: compactWidgets ? 'minmax(0, 1fr)' : 'minmax(0, 1.55fr) minmax(280px, 0.85fr)',
        gap: 14,
        padding: 14,
      }}>
        <div style={{
          position: 'relative',
          aspectRatio: '16/9',
          borderRadius: 14,
          overflow: 'hidden',
          border: '1.5px solid rgba(245,239,230,0.8)',
          background: '#000',
        }}>
          {mainCam ? (
            <LivepeerPlayer playbackId={mainCam.playbackId} isMainPlayer={true} autoPlay={true} showControls={true} showStatus={false} className="w-full h-full" />
          ) : (
            <PaletteFill palette="coral" />
          )}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <LiveDot label="MAIN LIVE" />
            <span style={{
              padding: '5px 10px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.58)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.12em',
            }}>{mainCam?.name || 'Live room'}</span>
          </div>
          <div style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            padding: '8px 11px',
            borderRadius: 10,
            background: 'rgba(10,8,20,0.72)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
            fontSize: 11,
            fontWeight: 800,
          }}>
            {cameras.length} rooms open
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: compactWidgets ? 'repeat(4, minmax(150px, 1fr))' : 'repeat(2, minmax(0, 1fr))',
          gap: 10,
          overflowX: compactWidgets ? 'auto' : 'visible',
          maxHeight: compactWidgets ? undefined : 430,
          overflowY: compactWidgets ? undefined : 'auto',
          paddingBottom: compactWidgets ? 2 : 0,
        }} className="sf-no-scrollbar">
          {otherCams.map(({ cam, idx }) => (
            <DirectorTile
              key={cam.id}
              cam={cam}
              index={idx}
              active={idx === activeChannel}
              onSelect={() => onSelect(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Floating Demo / Live toggle ───────────────────────────────
const DemoToggle: React.FC<{
  mode: 'demo' | 'real';
  onChange: (m: 'demo' | 'real') => void;
  position?: 'fixed' | 'absolute';
}> = ({ mode, onChange, position = 'fixed' }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position,
        bottom: 18,
        left: 18,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: 4,
        borderRadius: 999,
        background: 'rgba(10,8,20,0.7)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: hover ? '0 12px 30px -10px rgba(0,0,0,0.55)' : '0 6px 18px -8px rgba(0,0,0,0.45)',
        opacity: hover ? 1 : 0.78,
        transition: 'opacity 220ms, box-shadow 220ms',
      }}
      title={mode === 'demo' ? "You're previewing how Star Factor plays during a live show. Tap for live." : 'This is the live state. Tap to preview the experience.'}
    >
      {(['demo', 'real'] as const).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-label={m === 'demo' ? 'Demo data' : 'Live data'}
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            border: 'none',
            background: mode === m ? (m === 'demo' ? 'var(--sf-coral)' : 'var(--sf-mint)') : 'transparent',
            color: mode === m ? '#0A0814' : 'rgba(255,255,255,0.78)',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {m === 'demo'
            ? <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: mode === m ? '#0A0814' : 'var(--sf-coral)' }} />
            : <span className="sf-pulse" style={{ background: mode === m ? '#0A0814' : 'var(--sf-mint)' }} />}
          {m === 'demo' ? 'Demo' : 'Live'}
        </button>
      ))}
    </div>
  );
};

// ── House Heatmap (Director's Booth · variation D) ───────────
// Click a room to switch primary cam. Heat shade encodes live attention.
const HouseHeatMap: React.FC<{
  cameras: Camera[];
  activeChannel: number;
  followCast: string | null;
  onSelectCam: (camIdx: number) => void;
  onFollowCast: (name: string | null) => void;
  isIdle: boolean;
}> = ({ cameras, activeChannel, followCast, onSelectCam, onFollowCast, isIdle }) => {
  const [hoverRoom, setHoverRoom] = useState<string | null>(null);
  const liveRooms = HOUSE_ROOMS.filter(r => r.tag !== 'IDLE').length;
  const idleRooms = HOUSE_ROOMS.length - liveRooms;
  const totalWatchers = HOUSE_ROOMS.reduce((a, r) => a + r.watchers, 0);

  return (
    <section style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 4 }}>HOUSE MAP · DIRECTOR&apos;S BOOTH</div>
          <h2 className="sf-display" style={{ fontSize: 26, color: '#fff' }}>
            Tap a room. Jump the cam.
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--sf-fg-3)' }}>
          <span><span style={{ color: '#fff', fontWeight: 800 }}>{liveRooms}</span> live</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>{idleRooms} idle</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span><span style={{ color: 'var(--sf-amber)', fontWeight: 800 }}>{fmt(totalWatchers)}</span> watching</span>
        </div>
      </div>

      <div style={{
        position: 'relative',
        background: 'var(--sf-stage-2)',
        border: '1px solid var(--sf-line)',
        borderRadius: 18,
        padding: 18,
        overflow: 'hidden',
      }}>
        {/* Heat backdrop glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(120% 90% at 30% 30%, rgba(255,78,43,0.08), transparent 60%), radial-gradient(60% 60% at 75% 70%, rgba(31,209,122,0.06), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <svg viewBox="0 0 800 280" style={{ width: '100%', height: 'auto', display: 'block', position: 'relative' }}>
          {/* House outline */}
          <rect x="20" y="20" width="760" height="240" rx="10"
            fill="rgba(255,255,255,0.02)"
            stroke="var(--sf-line-strong)" strokeWidth="1" strokeDasharray="2 4"/>

          {/* Rooms */}
          {HOUSE_ROOMS.map(r => {
            const cam = cameras[r.camIdx];
            const heat = isIdle ? 0 : Math.min(1, r.watchers / 20000);
            const isPrimary = r.camIdx === activeChannel;
            const isHovered = hoverRoom === r.label;
            const tagFill = TAG_COLOR[r.tag];
            return (
              <g key={r.label}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverRoom(r.label)}
                onMouseLeave={() => setHoverRoom(null)}
                onClick={() => cam && onSelectCam(r.camIdx)}>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="8"
                  fill={isPrimary ? `var(--sf-coral)` : `rgba(255,78,43,${heat * 0.32})`}
                  fillOpacity={isPrimary ? 0.32 : 1}
                  stroke={isPrimary ? 'var(--sf-coral)' : isHovered ? 'rgba(255,255,255,0.45)' : 'var(--sf-line-strong)'}
                  strokeWidth={isPrimary ? 2 : 1}/>
                {/* Camera dot */}
                <circle cx={r.x + 12} cy={r.y + 12} r="5"
                  fill={r.tag === 'IDLE' || isIdle ? 'rgba(255,255,255,0.22)' : tagFill}/>
                {r.hot && !isIdle && (
                  <circle cx={r.x + 12} cy={r.y + 12} r="9" fill="none"
                    stroke={tagFill} strokeWidth="1" opacity="0.65">
                    <animate attributeName="r" values="5;14;5" dur="1.6s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.65;0;0.65" dur="1.6s" repeatCount="indefinite"/>
                  </circle>
                )}
                <text x={r.x + 8} y={r.y + r.h - 10} fill="#fff"
                  fontSize="11" fontWeight="800"
                  fontFamily="Inter Display, Inter, sans-serif">{r.label}</text>
                <text x={r.x + r.w - 8} y={r.y + r.h - 10}
                  fill="rgba(255,255,255,0.55)" fontSize="9" fontWeight="700"
                  textAnchor="end" fontFamily="ui-monospace, monospace">
                  {isIdle ? '—' : fmt(r.watchers)}
                </text>
                <text x={r.x + r.w - 8} y={r.y + 16}
                  fill="rgba(255,255,255,0.7)" fontSize="9" fontWeight="800"
                  textAnchor="end" fontFamily="ui-monospace, monospace" letterSpacing="0.1em">
                  CAM {String(r.camIdx + 1).padStart(2, '0')}
                </text>
              </g>
            );
          })}

          {/* Cast position dots — followable */}
          {!isIdle && CAST_POSITIONS.map(p => {
            const followed = followCast === p.name;
            return (
              <g key={p.name} style={{ cursor: 'pointer' }} onClick={() => onFollowCast(followed ? null : p.name)}>
                {followed && (
                  <circle cx={p.x} cy={p.y} r="14" fill="none"
                    stroke="var(--sf-amber)" strokeWidth="1.5" strokeDasharray="2 3"/>
                )}
                <circle cx={p.x} cy={p.y} r="7" fill={p.color}
                  stroke="var(--sf-stage)" strokeWidth="2"/>
                <text x={p.x} y={p.y + 22} fill="#fff" fontSize="9" fontWeight="800"
                  textAnchor="middle" fontFamily="Inter Display, Inter, sans-serif">{p.name}</text>
              </g>
            );
          })}
        </svg>

        {/* Legend + actions */}
        <div style={{
          position: 'relative',
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--sf-line)',
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        }}>
          {[
            { label: 'Hot', color: '#FF1F3D' },
            { label: 'Task', color: '#1FD17A' },
            { label: 'Solo', color: '#4D7AFF' },
            { label: 'Idle', color: 'rgba(255,255,255,0.22)' },
          ].map(l => (
            <span key={l.label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 10, color: 'var(--sf-fg-3)',
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: l.color }} />
              {l.label}
            </span>
          ))}
          <span style={{ flex: 1 }} />
          {followCast && (
            <button onClick={() => onFollowCast(null)} title="Stop following" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 4px 4px 10px', borderRadius: 999,
              background: 'var(--sf-amber)', color: '#1A0F00',
              border: 'none', fontSize: 11, fontWeight: 900,
              cursor: 'pointer',
            }}>
              ⌖ {followCast}
              <span style={{
                width: 18, height: 18, borderRadius: 999,
                background: '#0A0814', color: '#FFB020',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11,
              }}>×</span>
            </button>
          )}
          <span style={{ fontSize: 11, color: 'var(--sf-fg-2)' }}>
            {isIdle
              ? 'The house is dark. Heat shows where the room is hottest. Right now: nowhere.'
              : 'Tap a room → primary cam · Tap a name → follow'}
          </span>
        </div>
      </div>
    </section>
  );
};

// ── Page ─────────────────────────────────────────────────────
const WatchPage: React.FC = () => {
  // Daylight engine — auto-tunes accent + paper to Lagos time-of-day
  const day = useDaylight({ mode: 'auto' });

  // Auth + stores
  const { authenticated, user, logout: privyLogout, login: privyLogin } = usePrivy();
  const { setUser: setStoreUser, updateBalance, logout: storeLogout, balance, deductStakes } = useUserStore();
  const { markets, userBets, addMarket, placeBet, initializeDemoData } = usePredictionStore();

  // Page state
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [activeChannel, setActiveChannel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState('continue');
  const [showProfile, setShowProfile] = useState(false);
  const [stageMode, setStageMode] = useState<'single' | 'multicam'>('single');
  const [showExperiencePanel, setShowExperiencePanel] = useState(false);
  const [isDockMinimized, setIsDockMinimized] = useState(false);
  const [showStageWidgets, setShowStageWidgets] = useState(true);
  const [showEventStrip, setShowEventStrip] = useState(true);
  // Demo vs Real (live) data mode. Demo always uses mocked content.
  // Real shows idle states until the host opens markets / cast goes live.
  // Default = real (idle). Demo is opt-in via the floating toggle.
  const [dataMode, setDataMode] = useState<'demo' | 'real'>('real');
  const [followCast, setFollowCast] = useState<string | null>(null);
  const [pinnedCamIdx, setPinnedCamIdx] = useState<number | null>(null);

  // Right dock
  const [dockTab, setDockTab] = useState<'predict' | 'chat' | 'leader'>('predict');
  const [pickedBet, setPickedBet] = useState<{ marketId: string; optionId: string } | null>(null);
  const [stake, setStake] = useState(500);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatLineData[]>(SEED_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [showPredictModal, setShowPredictModal] = useState(false);
  const [predictQuestion, setPredictQuestion] = useState('');
  const [predictOptions, setPredictOptions] = useState(['', '']);
  const [predictCategory, setPredictCategory] = useState<MarketCreationData['category']>('event');
  const [predictDuration, setPredictDuration] = useState(24);

  const profileRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Mount / mobile detection / demo data ──
  useEffect(() => {
    setIsMounted(true);
    initializeDemoData();
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [initializeDemoData]);

  useEffect(() => {
    if (cameras.length > 0 && activeChannel >= cameras.length) {
      setActiveChannel(0);
    }
  }, [activeChannel, cameras.length]);

  // ── Verify user ──
  useEffect(() => {
    const verify = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            privyId: user.id,
            walletAddress: user.wallet?.address,
            email: user.email?.address,
          }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setDbUserId(data.user.id);
          setStoreUser(data.user);
          updateBalance({ clout: data.user.cloutBalance, stakes: data.user.stakesBalance });
        }
      } catch (e) {
        console.error('verify failed', e);
      }
    };
    if (authenticated && user) verify();
  }, [authenticated, user, setStoreUser, updateBalance]);

  // ── Cameras fetch ──
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/cameras');
        const data = await res.json();
        if (data.success) {
          setCameras(data.cameras);
        } else {
          setError('Failed to load cameras');
        }
      } catch (e) {
        console.error('cameras', e);
        setError('Failed to load cameras');
      } finally {
        setIsLoading(false);
      }
    };
    if (isMounted) load();
  }, [isMounted]);

  // ── Profile dropdown outside-click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    if (showProfile) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfile]);

  // ── Chat auto-scroll ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Helpers ──
  const requireLogin = (action: string, cb?: () => void) => {
    if (!authenticated) {
      setLoginAction(action);
      setShowLoginModal(true);
      return false;
    }
    cb?.();
    return true;
  };

  const handleLogin = async () => {
    setShowLoginModal(false);
    try { await privyLogin(); } catch (e) { console.error(e); }
  };
  const handleLogout = async () => {
    storeLogout();
    setDbUserId(null);
    await privyLogout();
    setShowProfile(false);
  };

  // Active camera (single mode)
  const activeCam = cameras[activeChannel] || null;

  // Real mode = idle. No live show running yet; suppress all demo activity.
  // Demo mode = full populated experience.
  const isIdle = dataMode === 'real';

  // Demo-only data sources. In real-idle every demo seed is suppressed and
  // the UI surfaces communicate "what goes here" rather than fake activity.
  const effectiveMarkets = isIdle ? [] : markets;
  const activeMarkets = effectiveMarkets.filter(m => m.status === 'active');
  const featuredMarket = activeMarkets[0] || null;
  const displayChat = isIdle
    ? chatMessages.filter(m => !SEED_CHAT.find(s => s.id === m.id))
    : chatMessages;
  const displayLeaderboard = isIdle ? [] : LEADERBOARD;
  const displayCast = isIdle ? [] : CAST;
  const displaySchedule = isIdle ? [] : SCHEDULE;
  const displayHotStrip = isIdle ? [] : HOT_STRIP;
  const displayTicker = isIdle
    ? ['👋 Stream goes live · 19:00 WAT · markets open with the show']
    : TICKER_MESSAGES;

  // ── Bet placement ──
  const handlePickOption = (marketId: string, optionId: string) => {
    if (!authenticated) {
      requireLogin('place a bet');
      return;
    }
    setPickedBet({ marketId, optionId });
  };
  const handlePlaceBet = () => {
    if (!pickedBet) return;
    if (!authenticated) {
      requireLogin('place a bet');
      return;
    }
    if (deductStakes(stake)) {
      placeBet(pickedBet.marketId, pickedBet.optionId, stake, user?.email?.address?.split('@')[0] || 'You');
      setPickedBet(null);
    }
  };

  // ── Chat ──
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!authenticated) {
      requireLogin('send messages');
      return;
    }
    const text = chatInput.trim();
    if (text.toLowerCase().startsWith('/predict')) {
      setShowPredictModal(true);
      setChatInput('');
      return;
    }
    setChatMessages(prev => [...prev, {
      id: `m_${Date.now()}`,
      name: user?.email?.address?.split('@')[0] || 'You',
      color: '#FF4E2B',
      msg: text,
      time: 'now',
    }]);
    setChatInput('');
  };

  const handleCreateMarket = () => {
    const opts = predictOptions.filter(o => o.trim());
    if (!predictQuestion.trim() || opts.length < 2) return;
    const data: MarketCreationData = {
      question: predictQuestion.trim(),
      options: opts,
      duration: predictDuration,
      category: predictCategory,
    };
    addMarket(data, user?.email?.address?.split('@')[0] || 'Anonymous');
    setChatMessages(prev => [...prev, {
      id: `m_${Date.now()}`,
      name: user?.email?.address?.split('@')[0] || 'You',
      color: '#1FD17A',
      msg: `Created prediction: "${data.question}"`,
      time: 'now',
      tier: 'system',
    }]);
    setShowPredictModal(false);
    setPredictQuestion('');
    setPredictOptions(['', '']);
    setPredictCategory('event');
    setPredictDuration(24);
    setDockTab('predict');
  };

  const enterFocusMode = () => {
    setIsDockMinimized(true);
    setShowStageWidgets(false);
    setShowEventStrip(false);
    setShowExperiencePanel(false);
  };

  // ── Loading state ──
  if (isLoading || !isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0814' }} suppressHydrationWarning>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full" style={{
              background: 'linear-gradient(135deg,#FF4E2B,#FFB020)',
              animation: 'pulse-live 1.4s ease-in-out infinite',
            }} />
          </div>
          <p style={{ color: '#F8F4EC', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading Star Factor…</p>
        </div>
      </div>
    );
  }

  // ── Mobile route ──
  if (isMobile) {
    return (
      <div suppressHydrationWarning>
        <MobileLayout
          cameras={cameras}
          selectedPlaybackId={activeCam?.playbackId || ''}
          onStreamClick={(playbackId) => {
            const idx = cameras.findIndex(c => c.playbackId === playbackId);
            if (idx >= 0) setActiveChannel(idx);
          }}
          onRequireLogin={() => requireLogin('interact with the platform')}
          isAuthenticated={authenticated}
          userEmail={user?.email?.address}
          onCreateMarket={(d: MarketCreationData) => addMarket(d, user?.email?.address?.split('@')[0] || 'Anonymous')}
          dataMode={dataMode}
          onDataModeChange={setDataMode}
        />
        <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} action={loginAction} />
      </div>
    );
  }

  const dockTop = showEventStrip ? 164 : 64;

  // ── Desktop magazine layout ──
  return (
    <div
      className="sf-watch-root sf-daylight-root"
      style={{
        minHeight: '100vh',
        // Drive the brand accent + paper tints from Lagos time-of-day.
        // CSS vars cascade through every existing var(--sf-coral) /
        // var(--sf-paper) usage so the whole product drifts together.
        ['--sf-coral' as string]: day.accent,
        ['--sf-coral-deep' as string]: day.accentSoft,
        ['--sf-paper' as string]: day.paper,
        ['--sf-paper-warm' as string]: day.paper2,
      } as React.CSSProperties}
      suppressHydrationWarning
    >
      <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} action={loginAction} />

      {/* HEADER — paper cream */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        height: 64, padding: '0 28px',
        display: 'flex', alignItems: 'center', gap: 24,
        background: 'var(--sf-paper)',
        color: 'var(--sf-stage)',
        borderBottom: '2px solid var(--sf-stage)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <SFWordmark size={20} color="#0A0814" dot="#FF4E2B" />
        </Link>

        <nav style={{ display: 'flex', gap: 2, marginLeft: 12, overflowX: 'auto', maxWidth: '44vw' }} className="sf-no-scrollbar">
          {[
            { label: 'Watch',    active: true,  href: '/watch' },
            { label: 'Cameras',  active: false, href: '/watch' },
            { label: 'Predict',  active: false, href: '/watch' },
            { label: 'Cast',     active: false, href: '/watch' },
            { label: 'Schedule', active: false, href: '/watch' },
            { label: 'Apply',    active: false, href: '/apply' },
          ].map(n => (
            <Link key={n.label} href={n.href} className="sf-eyebrow" style={{
              padding: '8px 16px',
              color: n.active ? '#fff' : 'var(--sf-stage)',
              background: n.active ? 'var(--sf-stage)' : 'transparent',
              borderRadius: 999, fontSize: 11,
              transition: 'background 200ms, color 200ms',
              whiteSpace: 'nowrap',
            }}>{n.label}</Link>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowExperiencePanel(s => !s)}
            className="sf-btn sf-btn-stage"
            style={{ height: 34, fontSize: 10, padding: '0 13px' }}
          >
            CUSTOMIZE
          </button>
          {showExperiencePanel && (
            <div className="sf-fade-in" style={{
              position: 'absolute',
              top: 44,
              right: 0,
              width: 270,
              padding: 12,
              background: 'var(--sf-paper)',
              color: 'var(--sf-stage)',
              border: '2px solid var(--sf-stage)',
              borderRadius: 14,
              boxShadow: '0 26px 70px -24px rgba(0,0,0,0.55)',
              zIndex: 70,
            }}>
              <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 10 }}>VIEW CONTROL</div>
              {[
                { label: 'Side panel', active: !isDockMinimized, onClick: () => setIsDockMinimized(v => !v) },
                { label: 'Stream widgets', active: showStageWidgets, onClick: () => setShowStageWidgets(v => !v) },
                { label: 'Event strip', active: showEventStrip, onClick: () => setShowEventStrip(v => !v) },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: 8,
                    border: '1px solid rgba(10,8,20,0.15)',
                    background: item.active ? 'rgba(255,78,43,0.12)' : 'rgba(10,8,20,0.05)',
                    color: 'var(--sf-stage)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 10px',
                    cursor: 'pointer',
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {item.label}
                  <span style={{
                    width: 30,
                    height: 18,
                    borderRadius: 999,
                    background: item.active ? 'var(--sf-coral)' : 'rgba(10,8,20,0.18)',
                    color: '#fff',
                    fontSize: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    letterSpacing: '0.08em',
                  }}>{item.active ? 'ON' : 'OFF'}</span>
                </button>
              ))}
              <button onClick={enterFocusMode} className="sf-btn sf-btn-coral" style={{ width: '100%', height: 36, marginTop: 10, fontSize: 10 }}>
                FOCUS MODE
              </button>
            </div>
          )}
        </div>

        {authenticated && user ? (
          <>
            {dbUserId && (
              <ClientOnly>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px 6px 6px',
                  background: 'var(--sf-stage)', color: '#fff', borderRadius: 999,
                }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: 999,
                    background: 'linear-gradient(135deg,#FFB020,#FF4E2B)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1A0F00', fontWeight: 900, fontSize: 12,
                  }}>★</span>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{balance.stakes.toLocaleString()} <span style={{ opacity: 0.55 }}>STK</span></span>
                  <span style={{ fontSize: 10, color: 'var(--sf-mint)', fontWeight: 700, marginLeft: 4 }}>+{balance.clout} CL</span>
                </div>
              </ClientOnly>
            )}
            <button className="sf-btn sf-btn-stage">CASH OUT</button>
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfile(s => !s)}
                style={{
                  width: 38, height: 38, borderRadius: 999,
                  border: '2px solid var(--sf-stage)',
                  background: 'var(--sf-coral)',
                  color: '#fff', fontWeight: 900, fontSize: 14,
                  cursor: 'pointer',
                }}
                aria-label="Profile"
              >
                {(user.email?.address || 'U').charAt(0).toUpperCase()}
              </button>
              {showProfile && (
                <div className="sf-fade-in" style={{
                  position: 'absolute', top: 48, right: 0,
                  width: 240, padding: 8,
                  background: 'var(--sf-stage-2)', color: '#fff',
                  border: '1px solid var(--sf-line-strong)',
                  borderRadius: 14,
                  boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
                  zIndex: 50,
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--sf-line)', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{user.email?.address || 'Viewer'}</div>
                    <div style={{ fontSize: 10, color: 'var(--sf-fg-3)', marginTop: 2 }}>
                      {user.wallet?.address ? `${user.wallet.address.slice(0, 6)}…${user.wallet.address.slice(-4)}` : 'Email login'}
                    </div>
                  </div>
                  <button onClick={handleLogout} className="sf-btn sf-btn-ghost" style={{ width: '100%', height: 34, fontSize: 11 }}>SIGN OUT</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button onClick={handleLogin} className="sf-btn sf-btn-coral">SIGN IN</button>
        )}
      </header>

      {showEventStrip && (
        <>
          {/* HOT STRIP — paper cream */}
          <div className="sf-fade-in" style={{
            background: 'var(--sf-paper)',
            color: 'var(--sf-stage)',
            padding: '14px 28px',
            borderBottom: '2px solid var(--sf-stage)',
            display: 'flex', alignItems: 'center', gap: 28,
          }}>
            <span className="sf-display-italic" style={{ fontSize: 28, fontWeight: 900, color: 'var(--sf-stage)' }}>
              DAY <span className="sf-grad-text" style={{ fontStyle: 'italic' }}>47</span>
            </span>
            <SunArcIndicator state={day} dark={false} />
            <div className="sf-hide-mobile" style={{ width: 1, height: 36, background: 'rgba(10,8,20,0.2)' }}></div>
            <div style={{ flex: 1, display: 'flex', gap: 24, overflowX: 'auto' }} className="sf-no-scrollbar">
              {displayHotStrip.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(10,8,20,0.55)', fontSize: 12, fontWeight: 700 }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: 4,
                    background: 'rgba(10,8,20,0.08)', color: 'var(--sf-stage)',
                    fontSize: 10, fontWeight: 900, letterSpacing: '0.14em',
                  }}>SOON</span>
                  Tonight&apos;s hot beats appear here once the house wakes up.
                </div>
              ) : displayHotStrip.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: 4,
                    background: s.color, color: s.tag === 'HOT' || s.tag === 'NOW' ? '#fff' : '#0A0814',
                    fontSize: 10, fontWeight: 900, letterSpacing: '0.14em',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{s.tag}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sf-stage)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MARQUEE TICKER */}
          <div className="sf-fade-in" style={{
            height: 36, background: 'var(--sf-stage-2)',
            borderBottom: '1px solid var(--sf-line)',
            display: 'flex', alignItems: 'center',
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              paddingLeft: 16, paddingRight: 16, flexShrink: 0,
              background: 'var(--sf-stage)', borderRight: '1px solid var(--sf-line)',
              height: '100%', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span className="sf-pulse"></span>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '0.16em' }}>LIVE NOW</span>
            </div>
            <div className="sf-marquee" style={{ paddingLeft: 24 }}>
              {[...displayTicker, ...displayTicker].map((t, i) => (
                <span key={i} style={{ fontSize: 11, color: 'var(--sf-fg-2)', fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {error && (
        <div style={{ margin: '12px 28px 0', padding: 14, borderRadius: 14, background: 'rgba(255,107,107,0.10)', border: '1px solid rgba(255,107,107,0.4)', color: '#FF6B6B', fontSize: 13, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {/* MAIN GRID — left column + right dock */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isDockMinimized ? 'minmax(0, 1fr) 76px' : 'minmax(0, 1fr) clamp(340px, 26vw, 390px)',
        gap: 0,
        transition: 'grid-template-columns 260ms cubic-bezier(.22,1,.36,1)',
      }}>
        {/* Left main column */}
        <div style={{ padding: '24px 28px 80px', minWidth: 0 }}>
          {/* PLAYER + side meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
            <div>
              {stageMode === 'multicam' ? (
                <DirectorGrid
                  cameras={cameras}
                  activeChannel={activeChannel}
                  compactWidgets={isDockMinimized}
                  onSelect={(idx) => setActiveChannel(idx)}
                  onExit={() => setStageMode('single')}
                />
              ) : (
                <div className="sf-fade-in" style={{
                  position: 'relative', aspectRatio: '16/9',
                  borderRadius: 18, overflow: 'hidden',
                  border: '2px solid var(--sf-paper)',
                  boxShadow: `0 0 0 1px rgba(255,78,43,0.55), 0 30px 90px -20px rgba(255,78,43,0.44)`,
                  background: '#000',
                }}>
                  {activeCam && !isIdle ? (
                    <LivepeerPlayer playbackId={activeCam.playbackId} isMainPlayer={true} showStatus={false} className="w-full h-full" />
                  ) : (
                    <PaletteFill palette="coral">
                      {isIdle && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(10,8,20,0.65)',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          gap: 14, padding: 24, textAlign: 'center',
                        }}>
                          <div style={{
                            padding: '6px 14px', borderRadius: 999,
                            background: 'rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: 10, fontWeight: 900, letterSpacing: '0.18em',
                          }}>● OFFLINE · STREAM RESUMES SOON</div>
                          <h2 className="sf-display" style={{ fontSize: 32, color: '#fff', maxWidth: 520, lineHeight: 1.1 }}>
                            House wakes at lights-on. Stay in the room.
                          </h2>
                          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, maxWidth: 460, lineHeight: 1.5 }}>
                            Cameras. Cast. Markets. Everything fires when the show fires.
                          </p>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <button onClick={() => requireLogin('get notified when the show goes live')} className="sf-btn sf-btn-coral" style={{ height: 38, fontSize: 11, padding: '0 16px' }}>
                              NOTIFY ME
                            </button>
                            <button onClick={() => setDataMode('demo')} className="sf-btn sf-btn-paper" style={{ height: 38, fontSize: 11, padding: '0 16px' }}>
                              PREVIEW THE EXPERIENCE
                            </button>
                          </div>
                        </div>
                      )}
                    </PaletteFill>
                  )}

                  {/* Top overlays */}
                  <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, pointerEvents: 'none' }}>
                    {!isIdle && <LiveDot label="LIVE NOW" />}
                    {!isIdle && <span style={{
                      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                      padding: '5px 11px', borderRadius: 999,
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: '#fff',
                    }}>👁 {(38400 + activeChannel * 1200).toLocaleString()}</span>}
                  </div>

                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                    padding: '8px 14px', borderRadius: 12,
                    display: 'flex', alignItems: 'center', gap: 10, color: '#fff',
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--sf-fg-3)', fontWeight: 700, letterSpacing: '0.1em' }}>CAM</span>
                    <span style={{ fontSize: 13, fontWeight: 900 }}>{String(activeChannel + 1).padStart(2, '0')}</span>
                    <span style={{ fontSize: 10, color: 'var(--sf-fg-3)' }}>· {activeCam?.name || 'Live Room'}</span>
                  </div>

                  {showStageWidgets && <FloatingReactions />}

                  {/* In-stream prediction CTA */}
                  {showStageWidgets && featuredMarket && (
                    <div style={{
                      position: 'absolute', bottom: 56, left: 16, right: 16,
                      background: 'linear-gradient(90deg, rgba(255,78,43,0.92), rgba(255,176,32,0.92))',
                      borderRadius: 12, padding: '10px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      boxShadow: '0 12px 40px -10px rgba(255,78,43,0.5)',
                    }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4,
                        background: 'rgba(0,0,0,0.85)', color: '#fff',
                        fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
                      }}>🔥 LIVE MARKET</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {featuredMarket.question}
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {featuredMarket.options.slice(0, 2).map(o => (
                          <button
                            key={o.id}
                            onClick={() => { setDockTab('predict'); handlePickOption(featuredMarket.id, o.id); }}
                            style={{
                              padding: '5px 12px', borderRadius: 999,
                              background: '#0A0814', color: '#fff', border: 'none',
                              fontSize: 11, fontWeight: 800, letterSpacing: '0.04em',
                              cursor: 'pointer',
                            }}
                          >
                            {o.label} <span style={{ color: 'var(--sf-amber)', marginLeft: 4 }}>{o.odds.toFixed(1)}x</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom controls — icon CTAs w/ hover tooltips */}
                  <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', gap: 8, alignItems: 'center', zIndex: 30 }}>
                    <button title="Pause stream" aria-label="Pause stream" className="sf-btn-icon" style={{ background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
                    </button>
                    <button title="Mute audio" aria-label="Mute audio" className="sf-btn-icon" style={{ background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
                    </button>
                    <button title="Pin this cam" aria-label="Pin this cam"
                      onClick={() => setPinnedCamIdx(pinnedCamIdx === activeChannel ? null : activeChannel)}
                      className="sf-btn-icon" style={{
                        background: pinnedCamIdx === activeChannel ? 'var(--sf-coral)' : 'rgba(0,0,0,0.55)',
                        borderColor: 'rgba(255,255,255,0.1)', color: '#fff',
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 17v5M5 11h14l-2-7H7zM12 11v6"/>
                      </svg>
                    </button>
                    <button title="Clip last 30s" aria-label="Clip last 30s" onClick={() => requireLogin('clip')} className="sf-btn-icon" style={{ background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>
                      </svg>
                    </button>
                    <button title="Share clip" aria-label="Share clip" onClick={() => requireLogin('share')} className="sf-btn-icon" style={{ background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
                      </svg>
                    </button>
                    <span style={{ flex: 1 }}></span>
                    <button onClick={() => setStageMode('multicam')} title="Watch every room at once" className="sf-btn sf-btn-paper" style={{ height: 30, fontSize: 10 }}>
                      WATCH ALL ROOMS · {cameras.length}
                    </button>
                    <button onClick={enterFocusMode} title="Hide widgets, full focus" className="sf-btn sf-btn-stage" style={{ height: 30, fontSize: 10 }}>
                      FOCUS
                    </button>
                    <button title="Fullscreen" aria-label="Fullscreen" className="sf-btn-icon" style={{ background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                    </button>
                  </div>
                </div>
              )}

              {/* CAMERA RAIL — live tiles in demo, neutral placeholders in idle */}
              {isIdle ? (
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gap: 8 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{
                      aspectRatio: '16/9',
                      borderRadius: 10,
                      border: '1px dashed var(--sf-line-strong)',
                      background: 'rgba(255,255,255,0.02)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--sf-fg-3)',
                      fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
                    }}>CAM {String(i + 1).padStart(2, '0')}</div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: `repeat(${Math.min(cameras.length || 6, 8)}, minmax(96px, 1fr))`, gap: 8, overflowX: 'auto', paddingBottom: 2 }} className="sf-no-scrollbar">
                  {cameras.map((cam, i) => (
                    <button
                      key={cam.id}
                      onClick={() => { setActiveChannel(i); setStageMode('single'); }}
                      className={`sf-tile ${i === activeChannel && stageMode === 'single' ? 'active' : ''}`}
                      style={{ aspectRatio: '16/9', padding: 0, background: 'transparent' }}
                      aria-label={cam.name}
                    >
                      <PaletteFill palette={paletteForIdx(i)} style={{ height: '100%' }}>
                        <div style={{ position: 'absolute', top: 4, left: 4 }}>
                          <span style={{
                            background: 'rgba(0,0,0,0.7)', color: '#fff',
                            fontSize: 8, fontWeight: 900, padding: '2px 5px',
                            borderRadius: 3, letterSpacing: '0.14em',
                          }}>{cam.isActive ? '● LIVE' : '○ IDLE'}</span>
                        </div>
                        <div style={{
                          position: 'absolute', bottom: 4, left: 4, right: 4,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{cam.name}</span>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                            {((i + 1) * 4321).toLocaleString()}
                          </span>
                        </div>
                      </PaletteFill>
                    </button>
                  ))}
                </div>
              )}

              {/* SHOW META */}
              <div style={{ marginTop: 22 }}>
                <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 8 }}>
                  STARFACTOR · S01 · DAY 47 · {(activeCam?.name || 'MAIN').toUpperCase()}
                </div>
                <h1 className="sf-display" style={{ fontSize: 36, color: '#fff', marginBottom: 12, maxWidth: 720 }}>
                  {isIdle
                    ? 'House wakes at lights-on. Stay in the room.'
                    : activeCam?.description || 'Pick a room. Read the crowd. Back the moment.'}
                </h1>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                  {isIdle ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, border: '1px dashed var(--sf-line-strong)', color: 'var(--sf-fg-2)', fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--sf-fg-3)' }} />
                      Cast revealed at lights-on
                    </span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex' }}>
                        {CAST.slice(0, 3).map((c, i) => (
                          <div key={c.handle} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                            <Avatar name={c.name} color={c.color} size={28} />
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--sf-fg-2)' }}>
                        <span style={{ color: '#fff', fontWeight: 800 }}>{CAST.slice(0, 3).map(c => c.name).join(', ')}</span> + {CAST.length - 3} in house
                      </span>
                    </div>
                  )}
                  <div style={{ width: 1, height: 24, background: 'var(--sf-line)' }}></div>
                  <span style={{ fontSize: 12, color: 'var(--sf-fg-2)' }}>{isIdle ? 'Goes live · ' : 'Started 23 min ago · '}<span className="sf-mono" style={{ color: '#fff' }}>{isIdle ? '19:00 WAT' : '02:14:08'}</span></span>
                  {/* Quick-action icon row w/ tooltips */}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    <button title="Follow show — alerts before live" aria-label="Follow show"
                      onClick={() => requireLogin('follow the show')}
                      className="sf-btn-icon" style={{ background: 'var(--sf-stage-2)', borderColor: 'var(--sf-line)', color: '#fff', height: 34, width: 34 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>
                    </button>
                    <button title="Tip the cast" aria-label="Tip the cast"
                      onClick={() => requireLogin('tip the cast')}
                      className="sf-btn-icon" style={{ background: 'var(--sf-stage-2)', borderColor: 'var(--sf-line)', color: '#fff', height: 34, width: 34 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </button>
                    <button title="Send gift to cast" aria-label="Send gift"
                      onClick={() => requireLogin('send a gift')}
                      className="sf-btn-icon" style={{ background: 'var(--sf-stage-2)', borderColor: 'var(--sf-line)', color: '#fff', height: 34, width: 34 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/></svg>
                    </button>
                    <button title="Copy share link" aria-label="Share"
                      onClick={() => navigator.clipboard?.writeText(window.location.href)}
                      className="sf-btn-icon" style={{ background: 'var(--sf-stage-2)', borderColor: 'var(--sf-line)', color: '#fff', height: 34, width: 34 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
                    </button>
                  </div>
                </div>

                {showStageWidgets && !isIdle && (
                  <div className="sf-fade-in" style={{
                    padding: '10px 14px', borderRadius: 999,
                    background: 'var(--sf-stage-2)',
                    border: '1px solid var(--sf-line)',
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    flexWrap: 'wrap',
                  }}>
                    <span className="sf-eyebrow" style={{ color: 'var(--sf-fg-3)' }}>REACT</span>
                    {REACTION_KEYS.map(k => (
                      <button key={k} onClick={() => requireLogin('react')} style={{
                        width: 32, height: 32, borderRadius: 999,
                        background: '#fff', border: '1.5px solid #0E0A1F', padding: 4,
                        cursor: 'pointer', transition: 'transform 200ms',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      >{REACTION_SVG[k]}</button>
                    ))}
                    <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--sf-fg-2)' }}>
                      <b style={{ color: '#fff' }}>2,481</b> reactions / min
                    </span>
                  </div>
                )}
                {showStageWidgets && isIdle && (
                  <div className="sf-fade-in" style={{
                    padding: '10px 14px', borderRadius: 999,
                    background: 'var(--sf-stage-2)',
                    border: '1px dashed var(--sf-line-strong)',
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    color: 'var(--sf-fg-3)', fontSize: 11,
                  }}>
                    <span className="sf-eyebrow" style={{ color: 'var(--sf-fg-3)' }}>REACT</span>
                    Reactions unlock when cameras go live.
                    <button onClick={() => requireLogin('get notified')} className="sf-btn sf-btn-coral" style={{ height: 28, fontSize: 10, padding: '0 12px' }}>NOTIFY ME</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CAST SECTION — magazine paper warmth */}
          <section style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="sf-display" style={{ fontSize: 28, color: '#fff' }}>
                The Cast <span style={{ color: 'var(--sf-fg-3)', fontSize: 16, fontWeight: 600 }}>{isIdle ? '· Roster locked until launch' : '· Day 47 · 8 standing'}</span>
              </h2>
              <a className="sf-eyebrow" style={{ color: 'var(--sf-fg-3)', cursor: 'pointer' }}>FULL ROSTER →</a>
            </div>
            {isIdle ? (
              <div style={{
                padding: 28,
                borderRadius: 18,
                border: '1px dashed var(--sf-line-strong)',
                background: 'linear-gradient(135deg, rgba(255,78,43,0.04), rgba(107,63,229,0.04))',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 18,
                    background: 'rgba(255,78,43,0.12)', border: '1px solid rgba(255,78,43,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  }}>👥</div>
                  <div>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>Cast revealed at lights-on</div>
                    <div style={{ fontSize: 12, color: 'var(--sf-fg-3)', marginTop: 2 }}>Names. Odds. Stories. The lot. Everything drops the moment cameras flip live.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => requireLogin('get cast alert')} className="sf-btn sf-btn-coral" style={{ height: 36, fontSize: 11 }}>NOTIFY ME</button>
                  <Link href="/apply" className="sf-btn sf-btn-stage" style={{ height: 36, fontSize: 11 }}>APPLY TO BE CAST</Link>
                </div>
              </div>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {displayCast.slice(0, 4).map((c, i) => (
                <div key={c.handle} style={{
                  background: i === 0 ? 'var(--sf-paper)' : 'var(--sf-stage-2)',
                  color: i === 0 ? 'var(--sf-stage)' : '#fff',
                  border: i === 0 ? '2px solid var(--sf-stage)' : '1px solid var(--sf-line)',
                  borderRadius: 18, overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  transition: 'transform 240ms cubic-bezier(.22,1,.36,1), box-shadow 240ms',
                }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
                    <PaletteFill palette={c.palette}>
                      <div style={{
                        position: 'absolute', top: 8, left: 8,
                        padding: '2px 7px', borderRadius: 4,
                        background: c.color, color: '#0A0814',
                        fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
                      }}>{c.status.toUpperCase()}</div>
                    </PaletteFill>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <span className="sf-display" style={{ fontSize: 22, color: i === 0 ? 'var(--sf-stage)' : '#fff' }}>{c.name}</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: c.color }}>{c.odds}x</span>
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                      {c.city} · Age {c.age}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => requireLogin('back this cast member')} className="sf-btn sf-btn-coral" style={{ height: 30, fontSize: 10, flex: 1 }}>
                        BACK · {c.odds}x
                      </button>
                      <button className="sf-btn-icon" style={{
                        background: i === 0 ? 'var(--sf-stage)' : 'rgba(255,255,255,0.06)',
                        borderColor: i === 0 ? 'var(--sf-stage)' : 'var(--sf-line)',
                        color: '#fff', height: 30, width: 30,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </section>

          {/* SCHEDULE */}
          <section style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 className="sf-display" style={{ fontSize: 22, color: '#fff' }}>{isIdle ? 'Show schedule' : 'Tonight’s schedule'}</h2>
              <a className="sf-eyebrow" style={{ color: 'var(--sf-fg-3)', cursor: 'pointer' }}>FULL SCHEDULE →</a>
            </div>
            {isIdle ? (
              <div style={{
                padding: 22,
                borderRadius: 16,
                border: '1px dashed var(--sf-line-strong)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
              }}>
                <div>
                  <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 4 }}>NEXT UP · LIGHTS-ON</div>
                  <div style={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>Tonight&apos;s slate posts at 19:00 WAT</div>
                  <div style={{ fontSize: 12, color: 'var(--sf-fg-3)', marginTop: 2 }}>Tasks · diary rotations · eviction window will fill in here.</div>
                </div>
                <button onClick={() => requireLogin('add to calendar')} className="sf-btn sf-btn-paper" style={{ height: 34, fontSize: 11 }}>ADD TO CALENDAR</button>
              </div>
            ) : (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }} className="sf-no-scrollbar">
              {displaySchedule.map((s, i) => (
                <div key={i} style={{
                  flex: '0 0 240px',
                  padding: 16,
                  background: s.big ? `linear-gradient(135deg, ${s.color}30, transparent)` : 'var(--sf-stage-2)',
                  border: `1px solid ${s.big ? s.color : 'var(--sf-line)'}`,
                  borderRadius: 14,
                  transition: 'transform 240ms',
                }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 900, letterSpacing: '0.12em',
                      padding: '3px 8px', borderRadius: 4,
                      background: s.color, color: '#0A0814',
                    }}>{s.tag}</span>
                    {s.live && <><span className="sf-pulse"></span><span style={{ fontSize: 10, color: 'var(--sf-live)', fontWeight: 800, letterSpacing: '0.1em' }}>NOW</span></>}
                  </div>
                  <div className="sf-mono" style={{ fontSize: 11, color: 'var(--sf-fg-3)', marginBottom: 4 }}>{s.time} WAT</div>
                  <div className="sf-display" style={{ fontSize: 18, color: '#fff', lineHeight: 1.1 }}>{s.title}</div>
                  {s.big && <div style={{ marginTop: 12, fontSize: 11, color: 'var(--sf-amber)', fontWeight: 800 }}>₦902K MARKET · OPEN</div>}
                </div>
              ))}
            </div>
            )}
          </section>

          {/* HOUSE MAP / HEATMAP — Director's Booth D */}
          <HouseHeatMap
            cameras={cameras}
            activeChannel={activeChannel}
            followCast={followCast}
            onSelectCam={(idx) => { setActiveChannel(idx); setStageMode('single'); }}
            onFollowCast={(name) => setFollowCast(name)}
            isIdle={isIdle}
          />

          {/* PREDICT GRID — full-version horizontal markets */}
          {effectiveMarkets.length > 0 ? (
            <section style={{
              marginTop: 32, padding: '24px 0',
              borderTop: '1px solid var(--sf-line)',
              background: 'linear-gradient(180deg, transparent, rgba(255,176,32,0.04))',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 className="sf-display" style={{ fontSize: 28, color: '#fff' }}>
                    Predict & Earn <span style={{ color: 'var(--sf-coral)' }}>•</span>
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--sf-fg-3)', marginTop: 4 }}>
                    {activeMarkets.length} open markets · pool <span style={{ color: 'var(--sf-amber)', fontWeight: 800 }}>{effectiveMarkets.reduce((a, m) => a + m.totalPool, 0).toLocaleString()} stakes</span>
                  </div>
                </div>
                <button onClick={() => requireLogin('create a market', () => setShowPredictModal(true))} className="sf-btn sf-btn-ghost">
                  + CREATE MARKET
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {activeMarkets.slice(0, 6).map(m => {
                  const userBet = userBets.find(b => b.marketId === m.id);
                  return (
                    <PredictionCard
                      key={m.id}
                      market={m}
                      onPick={(opt) => {
                        setDockTab('predict');
                        handlePickOption(m.id, opt);
                      }}
                      pickedOptionId={pickedBet?.marketId === m.id ? pickedBet.optionId : null}
                      userBetOptionId={userBet?.optionId}
                    />
                  );
                })}
              </div>
            </section>
          ) : isIdle && (
            <section style={{ marginTop: 32 }}>
              <div style={{
                padding: 24,
                borderRadius: 18,
                border: '1px dashed var(--sf-line-strong)',
                background: 'linear-gradient(135deg, rgba(255,176,32,0.04), rgba(31,209,122,0.04))',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 18,
                    background: 'rgba(255,176,32,0.14)', border: '1px solid rgba(255,176,32,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  }}>🎯</div>
                  <div>
                    <div className="sf-eyebrow" style={{ color: 'var(--sf-amber)', marginBottom: 4 }}>PREDICT &amp; EARN</div>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>Markets open with the show</div>
                    <div style={{ fontSize: 12, color: 'var(--sf-fg-3)', marginTop: 2 }}>Cameras flip on, odds flip on. You can be the first market on the books.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => requireLogin('open the first market', () => setShowPredictModal(true))} className="sf-btn sf-btn-coral" style={{ height: 36, fontSize: 11 }}>OPEN FIRST MARKET</button>
                  <button onClick={() => requireLogin('get notified')} className="sf-btn sf-btn-ghost" style={{ height: 36, fontSize: 11 }}>NOTIFY ME</button>
                </div>
              </div>
            </section>
          )}

          {/* FULL PRODUCT SURFACE */}
          <section style={{ marginTop: 34 }}>
            <div style={{
              background: 'var(--sf-paper)',
              color: 'var(--sf-stage)',
              border: '2px solid var(--sf-stage)',
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 28px 80px -34px rgba(245,239,230,0.45)',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(260px, 0.9fr) minmax(0, 1.1fr)',
                borderBottom: '2px solid var(--sf-stage)',
              }} className="sf-product-intro">
                <div style={{ padding: 22, borderRight: '2px solid var(--sf-stage)' }}>
                  <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 10 }}>WHAT YOU GET</div>
                  <h2 className="sf-display" style={{ fontSize: 34, color: 'var(--sf-stage)', maxWidth: 390 }}>
                    The whole house, in play.
                  </h2>
                  <p style={{ color: 'rgba(10,8,20,0.68)', fontSize: 14, lineHeight: 1.55, marginTop: 12, maxWidth: 430 }}>
                    Watch live · predict · vote · cash out — all without leaving the stream.
                  </p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
                    <button onClick={() => requireLogin('start watching')} className="sf-btn sf-btn-coral" style={{ height: 34, fontSize: 11 }}>
                      START WATCHING
                    </button>
                    <button onClick={() => setDataMode(dataMode === 'demo' ? 'real' : 'demo')} className="sf-btn sf-btn-stage" style={{ height: 34, fontSize: 11 }}>
                      {dataMode === 'demo' ? 'SEE LIVE' : 'SEE DEMO'}
                    </button>
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                }} className="sf-product-stats">
                  {PRODUCT_STACK.map((item, i) => (
                    <div key={item.title} style={{
                      padding: 18,
                      minHeight: 168,
                      borderRight: i % 2 === 0 ? '2px solid var(--sf-stage)' : 'none',
                      borderBottom: i < 2 ? '2px solid var(--sf-stage)' : 'none',
                      background: i === 1 ? 'var(--sf-paper-warm)' : 'transparent',
                    }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 8px', borderRadius: 6,
                        background: item.color, color: item.kicker === 'Predict' ? 'var(--sf-stage)' : '#fff',
                        fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
                        marginBottom: 14,
                      }}>
                        {item.kicker}
                      </div>
                      <div className="sf-display" style={{ fontSize: 22, color: 'var(--sf-stage)', marginBottom: 8 }}>
                        {item.title}
                      </div>
                      <p style={{ color: 'rgba(10,8,20,0.64)', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                        {item.copy}
                      </p>
                      <div className="sf-mono" style={{ marginTop: 14, fontSize: 12, color: item.color, fontWeight: 900 }}>{item.stat}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              }} className="sf-flow-stack">
                {FLOW_STACK.map((item, i) => (
                  <div key={item.step} style={{
                    padding: 18,
                    minHeight: 150,
                    borderRight: i < FLOW_STACK.length - 1 ? '2px solid var(--sf-stage)' : 'none',
                    background: i === 2 ? 'var(--sf-stage)' : 'transparent',
                    color: i === 2 ? '#fff' : 'var(--sf-stage)',
                  }}>
                    <div className="sf-mono" style={{
                      fontSize: 11,
                      fontWeight: 900,
                      color: i === 2 ? 'var(--sf-amber)' : 'var(--sf-coral)',
                      marginBottom: 18,
                    }}>{item.step}</div>
                    <div className="sf-display" style={{ fontSize: 20, marginBottom: 8 }}>{item.label}</div>
                    <p style={{
                      color: i === 2 ? 'rgba(248,244,236,0.68)' : 'rgba(10,8,20,0.64)',
                      fontSize: 12,
                      lineHeight: 1.5,
                      margin: 0,
                    }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ marginTop: 26, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 14 }} className="sf-evening-grid">
            <div className="sf-surface-raised" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
              <div className="sf-ring" style={{ width: 260, height: 260, right: -80, top: -80 }} />
              <div className="sf-eyebrow" style={{ color: 'var(--sf-live)', marginBottom: 12 }}>EVICTION NIGHT · SUN 19:00</div>
              <h2 className="sf-display" style={{ fontSize: 30, color: '#fff', maxWidth: 460 }}>
                Stake before the gavel drops.
              </h2>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
                {['Fan vote', 'Cast risk', 'Pool movement', 'Cash-out window'].map((label, i) => (
                  <span key={label} style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid var(--sf-line)',
                    background: i === 0 ? 'rgba(255,31,61,0.14)' : 'rgba(255,255,255,0.04)',
                    color: i === 0 ? '#fff' : 'var(--sf-fg-2)',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>{label}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <button onClick={() => requireLogin('back the eviction pool', () => setDockTab('predict'))} className="sf-btn sf-btn-coral" style={{ height: 36, fontSize: 11 }}>
                  BACK A CAST
                </button>
                <button onClick={() => requireLogin('save fav', () => setDockTab('predict'))} className="sf-btn sf-btn-ghost" style={{ height: 36, fontSize: 11 }}>
                  SAVE A FAV
                </button>
              </div>
            </div>
            <div className="sf-paper-warm" style={{
              padding: 20,
              border: '2px solid var(--sf-stage)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 240,
            }}>
              <div>
                <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 12 }}>YOUR BALANCE</div>
                <h3 className="sf-display" style={{ fontSize: 26, color: 'var(--sf-stage)' }}>Stake. Win. Cash out.</h3>
                <p style={{ color: 'rgba(10,8,20,0.66)', fontSize: 13, lineHeight: 1.55, marginTop: 8 }}>
                  Balance, bet bar, leaderboard — never out of reach.
                </p>
                <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                  <button onClick={() => requireLogin('cash out')} className="sf-btn sf-btn-stage" style={{ height: 32, fontSize: 10 }}>CASH OUT</button>
                  <button onClick={() => requireLogin('top up')} className="sf-btn sf-btn-coral" style={{ height: 32, fontSize: 10 }}>+ TOP UP</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 18 }}>
                {[
                  { label: 'Stake', value: balance.stakes.toLocaleString() },
                  { label: 'Clout', value: balance.clout.toLocaleString() },
                  { label: 'Open', value: activeMarkets.length.toString() },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: 10,
                    borderRadius: 8,
                    background: 'rgba(10,8,20,0.08)',
                    border: '1px solid rgba(10,8,20,0.16)',
                  }}>
                    <div className="sf-mono" style={{ fontSize: 14, color: 'var(--sf-stage)', fontWeight: 900 }}>{item.value}</div>
                    <div style={{ fontSize: 9, color: 'rgba(10,8,20,0.52)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT DOCK — Predict / Chat / Top Earners */}
        <aside style={{
          flexShrink: 0,
          background: 'var(--sf-stage)',
          borderLeft: '1px solid var(--sf-line)',
          display: 'flex', flexDirection: 'column',
          height: `calc(100vh - ${dockTop}px)`,
          position: 'sticky', top: dockTop,
        }}>
          {isDockMinimized ? (
            <div className="sf-fade-in" style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              padding: '12px 8px',
              background: 'linear-gradient(180deg, var(--sf-stage), var(--sf-stage-2))',
            }}>
              <button
                onClick={() => setIsDockMinimized(false)}
                aria-label="Expand side panel"
                className="sf-btn-icon"
                style={{ width: 42, height: 42, background: 'var(--sf-paper)', color: 'var(--sf-stage)', borderColor: 'var(--sf-paper)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>
              </button>
              {[
                { id: 'predict' as const, label: 'P', full: 'Predict', count: activeMarkets.length },
                { id: 'chat' as const, label: 'C', full: 'Chat', count: displayChat.length },
                { id: 'leader' as const, label: 'L', full: 'Top', count: null },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setDockTab(t.id); setIsDockMinimized(false); }}
                  title={t.full}
                  style={{
                    width: 48,
                    minHeight: 58,
                    borderRadius: 12,
                    border: dockTab === t.id ? '1px solid var(--sf-coral)' : '1px solid var(--sf-line)',
                    background: dockTab === t.id ? 'rgba(255,78,43,0.16)' : 'rgba(255,255,255,0.04)',
                    color: dockTab === t.id ? '#fff' : 'var(--sf-fg-2)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    fontWeight: 900,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{t.label}</span>
                  {t.count !== null && <span style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 999,
                    background: 'var(--sf-coral)',
                    color: '#fff',
                    fontSize: 9,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>{t.count}</span>}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <button
                onClick={() => { setShowStageWidgets(true); setShowEventStrip(true); setIsDockMinimized(false); }}
                title="Restore full view"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--sf-fg-3)',
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: '0.14em',
                  cursor: 'pointer',
                }}
              >
                RESTORE
              </button>
            </div>
          ) : (
            <>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--sf-line)', padding: '0 14px' }}>
            {[
              { id: 'predict' as const, label: 'Predict', count: activeMarkets.length || null },
              { id: 'chat'    as const, label: 'Chat',    count: displayChat.length },
              { id: 'leader'  as const, label: 'Top Earners', count: null },
            ].map(t => (
              <button key={t.id} onClick={() => setDockTab(t.id)} className={`sf-tab ${dockTab === t.id ? 'on' : ''}`}>
                {t.label}
                {t.count !== null && (
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    padding: '2px 6px', borderRadius: 999,
                    background: dockTab === t.id ? 'var(--sf-coral)' : 'rgba(255,255,255,0.08)',
                    color: dockTab === t.id ? '#fff' : 'var(--sf-fg-3)',
                    letterSpacing: '0.04em',
                  }}>{t.count}</span>
                )}
              </button>
            ))}
            <button
              onClick={() => setIsDockMinimized(true)}
              aria-label="Minimize side panel"
              style={{
                width: 34,
                border: 'none',
                background: 'transparent',
                color: 'var(--sf-fg-3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 14 }} className="sf-no-scrollbar">
            {dockTab === 'predict' && (
              <div className="sf-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Wallet stake bar */}
                <ClientOnly>
                  <div style={{
                    padding: 12, borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(255,176,32,0.10) 0%, rgba(255,78,43,0.10) 100%)',
                    border: '1px solid rgba(255,176,32,0.25)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div className="sf-spin-slow" style={{
                      width: 36, height: 36, borderRadius: 999,
                      background: 'radial-gradient(circle at 30% 30%, #FFE68A 0%, #FFB020 60%, #C97A00 100%)',
                      boxShadow: 'inset 0 -2px 2px rgba(0,0,0,0.25), 0 4px 12px rgba(255,176,32,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#1A0F00', fontWeight: 900, fontSize: 14,
                    }}>★</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: 'var(--sf-fg-3)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Stake balance</div>
                      <div style={{ fontSize: 18, color: '#fff', fontWeight: 900, letterSpacing: '-0.02em' }}>
                        {balance.stakes.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--sf-mint)', fontWeight: 700 }}>+{balance.clout} CLOUT</span>
                      </div>
                    </div>
                    {authenticated ? (
                      <button className="sf-btn sf-btn-mint" style={{ height: 30, fontSize: 10, padding: '0 12px' }}>CASH OUT</button>
                    ) : (
                      <button onClick={handleLogin} className="sf-btn sf-btn-coral" style={{ height: 30, fontSize: 10, padding: '0 12px' }}>SIGN IN</button>
                    )}
                  </div>
                </ClientOnly>

                {/* Closing soon banner */}
                {effectiveMarkets.find(m => {
                  const ms = new Date(m.expiresAt).getTime() - Date.now();
                  return ms > 0 && ms < 1000 * 60 * 60 * 2;
                }) && (
                  <div style={{
                    padding: '10px 12px',
                    background: 'rgba(255,31,61,0.10)',
                    border: '1px solid rgba(255,31,61,0.4)',
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span className="sf-pulse" style={{ background: '#FF1F3D' }}></span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>Markets closing soon</span>
                  </div>
                )}

                <ClientOnly>
                  {activeMarkets.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', borderRadius: 14, border: '1px dashed var(--sf-line-strong)', color: 'var(--sf-fg-3)' }}>
                      <div style={{ fontSize: 26, marginBottom: 8 }}>🎯</div>
                      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, color: '#fff' }}>
                        {isIdle ? 'Markets open with the show' : 'No active markets'}
                      </p>
                      <p style={{ fontSize: 11, marginBottom: 12 }}>
                        {isIdle ? 'Live cams trigger live odds. First market drops at lights-on.' : 'Type /predict in chat or use the button below.'}
                      </p>
                      <button
                        onClick={() => requireLogin('open the first market', () => setShowPredictModal(true))}
                        className="sf-btn sf-btn-coral"
                        style={{ height: 32, fontSize: 10, padding: '0 14px' }}
                      >
                        OPEN FIRST MARKET
                      </button>
                    </div>
                  ) : (
                    activeMarkets.map(m => {
                      const userBet = userBets.find(b => b.marketId === m.id);
                      return (
                        <PredictionCard
                          key={m.id}
                          market={m}
                          onPick={(opt) => handlePickOption(m.id, opt)}
                          pickedOptionId={pickedBet?.marketId === m.id ? pickedBet.optionId : null}
                          userBetOptionId={userBet?.optionId}
                        />
                      );
                    })
                  )}
                </ClientOnly>

                <button
                  onClick={() => requireLogin('create a market', () => setShowPredictModal(true))}
                  style={{
                    padding: 14,
                    background: 'transparent',
                    border: '1.5px dashed var(--sf-line-strong)',
                    borderRadius: 14,
                    color: 'var(--sf-fg-2)',
                    fontSize: 12, fontWeight: 800,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1, color: 'var(--sf-coral)' }}>+</span>
                  Create your own market
                </button>
              </div>
            )}

            {dockTab === 'chat' && (
              <div className="sf-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span className="sf-pulse" style={isIdle ? { background: 'var(--sf-fg-3)', boxShadow: 'none' } : undefined}></span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>
                    {isIdle ? 'Chat warming up' : `${(displayChat.length * 215).toLocaleString()} in chat`}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--sf-fg-3)' }}>{isIdle ? 'SHOW SOON' : 'SLOW MODE OFF'}</span>
                </div>
                {isIdle && displayChat.length === 0 && (
                  <div style={{
                    padding: 16, marginBottom: 8, textAlign: 'center',
                    borderRadius: 12, border: '1px dashed var(--sf-line-strong)',
                    color: 'var(--sf-fg-3)',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: 4 }}>Be the first take</p>
                    <p style={{ fontSize: 11, lineHeight: 1.4 }}>Drop a hot take. Lock the floor before lights-on.</p>
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }} className="sf-no-scrollbar">
                  {displayChat.map(m => (
                    <div key={m.id} style={{
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      display: 'flex', gap: 8, alignItems: 'flex-start',
                    }}>
                      {m.tier === 'system' ? (
                        <div style={{
                          padding: '6px 10px', borderRadius: 8,
                          background: 'rgba(242,181,68,0.1)',
                          border: '1px solid rgba(242,181,68,0.3)',
                          fontSize: 11, color: 'var(--sf-amber)', fontWeight: 700,
                          flex: 1,
                        }}>📊 {m.msg}</div>
                      ) : (
                        <>
                          <div style={{
                            width: 22, height: 22, borderRadius: 999,
                            background: m.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 9, fontWeight: 900, flexShrink: 0,
                          }}>{m.name.charAt(0).toUpperCase()}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: m.color }}>{m.name}</span>
                              <span style={{ fontSize: 9, color: 'var(--sf-fg-4)' }}>{m.time}</span>
                              {m.coin && <span className="sf-coin" style={{ fontSize: 9, padding: '2px 7px 2px 4px' }}>{ngn(m.coin)}</span>}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--sf-fg-2)', lineHeight: 1.35, marginTop: 1, wordBreak: 'break-word' }}>{m.msg}</div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendChat} style={{ paddingTop: 10, borderTop: '1px solid var(--sf-line)', display: 'flex', gap: 6 }}>
                  <input
                    placeholder={authenticated ? 'Talk to the house… try /predict' : 'Sign in to chat'}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onFocus={() => !authenticated && requireLogin('send messages')}
                    readOnly={!authenticated}
                    style={{
                      flex: 1, padding: '10px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--sf-line)',
                      borderRadius: 999,
                      color: '#fff', fontSize: 13, outline: 'none',
                    }}
                  />
                  <button type="submit" className="sf-btn-icon" style={{ background: 'var(--sf-coral)', borderColor: 'var(--sf-coral)', color: '#fff' }} aria-label="Send">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
                  </button>
                </form>
              </div>
            )}

            {dockTab === 'leader' && (
              <div className="sf-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--sf-fg-3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {isIdle ? 'Last week · top earners' : 'This week · weekly reset'}
                </div>
                {isIdle ? (
                  <div style={{
                    padding: 18,
                    borderRadius: 12, background: 'rgba(255,176,32,0.06)',
                    border: '1px dashed rgba(255,176,32,0.35)',
                    color: 'var(--sf-fg-2)',
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>🏆</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Leaderboard resets weekly</div>
                    <div style={{ fontSize: 11, lineHeight: 1.4, marginBottom: 12 }}>Win the first market tonight, claim the first slot.</div>
                    <button onClick={() => requireLogin('claim a spot', () => setShowPredictModal(true))} className="sf-btn sf-btn-coral" style={{ height: 30, fontSize: 10, padding: '0 12px' }}>OPEN FIRST MARKET</button>
                  </div>
                ) : displayLeaderboard.map(l => (
                  <div key={l.rank} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 10,
                    background: l.rank === 1 ? 'linear-gradient(90deg, rgba(255,176,32,0.10), transparent)' : 'transparent',
                    border: '1px solid var(--sf-line)',
                    borderRadius: 12,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 999,
                      background: l.rank === 1 ? 'var(--sf-amber)' : l.rank === 2 ? '#C0C0C0' : l.rank === 3 ? '#CD7F32' : 'rgba(255,255,255,0.06)',
                      color: l.rank <= 3 ? '#1A0F00' : 'var(--sf-fg-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 12,
                    }}>{l.rank}</div>
                    <Avatar name={l.name} color={l.color} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{l.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--sf-fg-3)' }}>
                        {l.streak > 0 ? <span style={{ color: 'var(--sf-amber)' }}>🔥 {l.streak} streak</span> : 'No streak'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{ngn(l.won)}</div>
                      <div style={{ fontSize: 9, color: 'var(--sf-fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Won this wk</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Persistent stake bar (predict tab only) */}
          {dockTab === 'predict' && pickedBet && (() => {
            const m = markets.find(x => x.id === pickedBet.marketId);
            const opt = m?.options.find(o => o.id === pickedBet.optionId);
            if (!m || !opt) return null;
            const potential = Math.floor(stake * opt.odds);
            const insufficient = stake > balance.stakes;
            return (
              <div className="sf-slide-up" style={{
                padding: 14,
                borderTop: '1px solid var(--sf-line-strong)',
                background: 'var(--sf-stage-2)',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--sf-fg-2)', fontWeight: 700 }}>
                    Backing <span style={{ color: '#fff', fontWeight: 900 }}>{opt.label}</span>
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--sf-fg-3)' }}>
                    To win: <span style={{ color: 'var(--sf-mint)', fontWeight: 800 }}>{potential.toLocaleString()} STK</span>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[100, 500, 1000, 5000].map(v => (
                    <button key={v} onClick={() => setStake(v)} style={{
                      flex: 1, height: 32,
                      background: stake === v ? 'var(--sf-coral)' : 'transparent',
                      color: stake === v ? '#fff' : 'var(--sf-fg-2)',
                      border: stake === v ? 'none' : '1px solid var(--sf-line)',
                      borderRadius: 8,
                      fontSize: 11, fontWeight: 800, cursor: 'pointer',
                    }}>{v >= 1000 ? `${v / 1000}K` : v}</button>
                  ))}
                </div>
                <button
                  onClick={handlePlaceBet}
                  disabled={insufficient}
                  className={`sf-btn ${insufficient ? 'sf-btn-ghost' : 'sf-btn-coral'}`}
                  style={{ height: 44, width: '100%', fontSize: 13, opacity: insufficient ? 0.5 : 1, cursor: insufficient ? 'not-allowed' : 'pointer' }}
                >
                  {insufficient ? 'INSUFFICIENT BALANCE' : `PLACE BET · ${stake.toLocaleString()} STK`}
                </button>
                <button onClick={() => setPickedBet(null)} style={{
                  background: 'none', border: 'none', color: 'var(--sf-fg-3)',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}>cancel</button>
              </div>
            );
          })()}
            </>
          )}
        </aside>
      </div>

      {/* Create Market modal */}
      {showPredictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sf-fade-in">
          <div className="absolute inset-0" style={{ background: 'rgba(10,8,20,0.78)', backdropFilter: 'blur(10px)' }} onClick={() => setShowPredictModal(false)} />
          <div className="relative sf-fade-in" style={{
            maxWidth: 480, width: 'calc(100% - 32px)',
            padding: 28, borderRadius: 24,
            background: 'var(--sf-stage-2)', color: '#fff',
            border: '1.5px solid var(--sf-line-strong)',
            boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
          }}>
            <button onClick={() => setShowPredictModal(false)} aria-label="Close" style={{
              position: 'absolute', top: 14, right: 14,
              width: 32, height: 32, borderRadius: 999,
              background: 'rgba(255,255,255,0.08)', color: '#fff',
              border: 'none', cursor: 'pointer',
            }}>×</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'var(--sf-grad-coral)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 22, fontWeight: 900,
              }}>+</div>
              <div>
                <h3 className="sf-display" style={{ fontSize: 22 }}>CREATE MARKET</h3>
                <div style={{ fontSize: 11, color: 'var(--sf-fg-3)', marginTop: 2 }}>Let the house bet on your prediction</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sf-fg-3)', display: 'block', marginBottom: 6 }}>Question</label>
                <input
                  value={predictQuestion}
                  onChange={e => setPredictQuestion(e.target.value)}
                  placeholder="Will Ada win the pool task?"
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: 'rgba(255,255,255,0.04)', color: '#fff',
                    border: '1px solid var(--sf-line)', borderRadius: 10,
                    fontSize: 13, outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sf-fg-3)', display: 'block', marginBottom: 6 }}>Category</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(['contestant', 'event', 'challenge', 'drama', 'other'] as const).map(cat => (
                    <button key={cat} onClick={() => setPredictCategory(cat)} style={{
                      padding: '6px 12px', borderRadius: 999,
                      background: predictCategory === cat ? 'var(--sf-coral)' : 'transparent',
                      color: predictCategory === cat ? '#fff' : 'var(--sf-fg-2)',
                      border: '1px solid var(--sf-line)',
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sf-fg-3)' }}>Options</label>
                  {predictOptions.length < 4 && (
                    <button onClick={() => setPredictOptions([...predictOptions, ''])} style={{
                      background: 'none', border: 'none', color: 'var(--sf-coral)',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}>+ Add option</button>
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
                          flex: 1, padding: '10px 12px',
                          background: 'rgba(255,255,255,0.04)', color: '#fff',
                          border: '1px solid var(--sf-line)', borderRadius: 10,
                          fontSize: 12, outline: 'none',
                        }}
                      />
                      {predictOptions.length > 2 && (
                        <button onClick={() => setPredictOptions(predictOptions.filter((_, i) => i !== idx))} style={{
                          width: 36, borderRadius: 10,
                          background: 'rgba(255,107,107,0.12)', color: '#FF6B6B',
                          border: '1px solid rgba(255,107,107,0.3)',
                          cursor: 'pointer', fontSize: 16,
                        }}>×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sf-fg-3)', display: 'block', marginBottom: 6 }}>Duration</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 6, 12, 24, 48].map(h => (
                    <button key={h} onClick={() => setPredictDuration(h)} style={{
                      flex: 1, padding: '8px 0', borderRadius: 8,
                      background: predictDuration === h ? 'var(--sf-coral)' : 'transparent',
                      color: predictDuration === h ? '#fff' : 'var(--sf-fg-2)',
                      border: '1px solid var(--sf-line)',
                      fontSize: 11, fontWeight: 800, cursor: 'pointer',
                    }}>{h}h</button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreateMarket}
                disabled={!predictQuestion.trim() || predictOptions.filter(o => o.trim()).length < 2}
                className="sf-btn sf-btn-coral"
                style={{ height: 46, fontSize: 13, marginTop: 6, opacity: (!predictQuestion.trim() || predictOptions.filter(o => o.trim()).length < 2) ? 0.5 : 1 }}
              >
                CREATE MARKET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Demo / Live toggle — subtle, persistent */}
      <DemoToggle mode={dataMode} onChange={setDataMode} />
    </div>
  );
};

export default WatchPage;

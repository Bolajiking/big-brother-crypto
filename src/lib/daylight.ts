'use client';

import { useEffect, useRef, useState } from 'react';

// ──────────────────────────────────────────────────────────────
// SF DAYLIGHT — Time-of-day accent + paper-tint system (Lagos / WAT, UTC+1)
//
// 11 keyframes around a Lagos day, interpolated in OKLCH for perceptually
// smooth transitions. Each frame carries:
//   accent — the hot punch color (DAY 47, ribbons, pills, primary CTA)
//   paper  — a gentle wash to lay over the cream base (5–12% in daytime,
//            full at night so the page goes lamp-lit umber/violet)
//   ink    — body-text mix; warmed slightly at golden hour
//   mood   — one-word feeling, surfaced in the indicator caption
// ──────────────────────────────────────────────────────────────

export interface DaylightState {
  hours: number;
  phase: string;
  label: string;
  mood: string;
  accent: string;
  accentSoft: string;
  paper: string;       // primary cream, kissed with the hour
  paper2: string;      // deeper cream, in lockstep
  ink: string;         // body text, warmed at golden hour
  glow: string;        // soft accent for ambient shadows
  strength: number;    // 0..1 wash intensity
  isNight: boolean;
  sunX: number;        // 0..1 across daytime arc, -1 if night
  moonX: number;       // 0..1 across nighttime arc, -1 if day
}

interface Frame {
  h: number;
  name: string;
  label: string;
  mood: string;
  accent: string;
  paper: string;
  ink: string;
}

const FRAMES: Frame[] = [
  { h:  0.0, name: 'late-night',  label: 'LATE NIGHT',  mood: 'hushed',     accent: '#5B3FE5', paper: '#231B3A', ink: '#0A0814' },
  { h:  4.5, name: 'pre-dawn',    label: 'PRE-DAWN',    mood: 'still',      accent: '#8C4DD8', paper: '#2E2748', ink: '#0A0814' },
  { h:  6.5, name: 'sunrise',     label: 'SUNRISE',     mood: 'awakening',  accent: '#FF6E3A', paper: '#FFC8A0', ink: '#1F1410' },
  { h:  9.0, name: 'morning',     label: 'MORNING',     mood: 'fresh',      accent: '#FF8A1F', paper: '#FFE6BE', ink: '#1A140A' },
  { h: 12.0, name: 'midday',      label: 'MIDDAY',      mood: 'bright',     accent: '#FFB020', paper: '#FFF1C8', ink: '#1A1408' },
  { h: 15.0, name: 'afternoon',   label: 'AFTERNOON',   mood: 'warm',       accent: '#FF9020', paper: '#FFE0B0', ink: '#1A140A' },
  { h: 17.5, name: 'golden-hour', label: 'GOLDEN HOUR', mood: 'glowing',    accent: '#FF5A24', paper: '#FFC892', ink: '#1F1410' },
  { h: 19.0, name: 'sunset',      label: 'SUNSET',      mood: 'cinematic',  accent: '#E13A6B', paper: '#FFB098', ink: '#1F1410' },
  { h: 20.5, name: 'dusk',        label: 'DUSK',        mood: 'reflective', accent: '#9333EA', paper: '#7A5A88', ink: '#15101F' },
  { h: 22.5, name: 'night',       label: 'NIGHT',       mood: 'intimate',   accent: '#6B3FE5', paper: '#322852', ink: '#0A0814' },
  { h: 24.0, name: 'late-night',  label: 'LATE NIGHT',  mood: 'hushed',     accent: '#5B3FE5', paper: '#231B3A', ink: '#0A0814' },
];

// ── Color math: hex ↔ OKLCH (interpolate in OKLab for smooth perceptual blend) ──
const hexToRgb = (hex: string): [number, number, number] => {
  const m = hex.replace('#', '').match(/.{2}/g)!;
  return [parseInt(m[0], 16) / 255, parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255];
};
const rgbToHex = ([r, g, b]: [number, number, number]) =>
  '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, '0'))
    .join('');

const lin  = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const srgb = (c: number) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

const rgbToOklab = ([r, g, b]: [number, number, number]): [number, number, number] => {
  const lr = lin(r), lg = lin(g), lb = lin(b);
  const L = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const M = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const S = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(L), m_ = Math.cbrt(M), s_ = Math.cbrt(S);
  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
};
const oklabToRgb = ([L, a, b]: [number, number, number]): [number, number, number] => {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  return [
    srgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    srgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    srgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ];
};

const lerpHex = (a: string, b: string, t: number) => {
  const A = rgbToOklab(hexToRgb(a));
  const B = rgbToOklab(hexToRgb(b));
  return rgbToHex(oklabToRgb([
    A[0] + (B[0] - A[0]) * t,
    A[1] + (B[1] - A[1]) * t,
    A[2] + (B[2] - A[2]) * t,
  ]));
};

const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const sampleDaylight = (hours: number): DaylightState => {
  const h = ((hours % 24) + 24) % 24;
  let i = 0;
  while (i < FRAMES.length - 1 && FRAMES[i + 1].h <= h) i++;
  const a = FRAMES[i];
  const b = FRAMES[i + 1] || FRAMES[FRAMES.length - 1];
  const span = b.h - a.h || 1;
  const t = ease(Math.max(0, Math.min(1, (h - a.h) / span)));
  const accent    = lerpHex(a.accent, b.accent, t);
  const paperTint = lerpHex(a.paper,  b.paper,  t);
  const inkTone   = lerpHex(a.ink,    b.ink,    t);

  const phase = t < 0.5 ? a : b;

  const SUNRISE = 6.3;
  const SUNSET  = 19.2;
  const inDay = h >= SUNRISE && h <= SUNSET;
  const sunX = inDay ? (h - SUNRISE) / (SUNSET - SUNRISE) : -1;
  const NIGHT_START = SUNSET;
  const NIGHT_END   = 24 + SUNRISE;
  const hLin = h < SUNRISE ? h + 24 : h;
  const moonX = !inDay ? (hLin - NIGHT_START) / (NIGHT_END - NIGHT_START) : -1;

  // ── Wash strengths ─────────────────────────────────────────
  // Kept deliberately low across all phases so the cream paper stays
  // readable. Even at night the tint is a whisper, not a stain.
  // Black text on paper must remain crisp at every hour.
  const dayStrength    = 0.08;   // bright daytime — visible kiss
  const goldenStrength = 0.15;   // sunrise / sunset — warm glow reads clearly
  const nightStrength  = 0.24;   // night — cool wash present, paper still legible

  let strength: number;
  if (h < 5.5)        strength = nightStrength;
  else if (h < 6.3)   strength = lerp(nightStrength, goldenStrength, ease((h - 5.5) / 0.8));
  else if (h < 9)     strength = lerp(goldenStrength, dayStrength,   ease((h - 6.3) / 2.7));
  else if (h < 16)    strength = dayStrength;
  else if (h < 19)    strength = lerp(dayStrength, goldenStrength, ease((h - 16) / 3));
  else if (h < 20.5)  strength = lerp(goldenStrength, nightStrength, ease((h - 19) / 1.5));
  else                strength = nightStrength;

  const PAPER_BASE   = '#F6F1E8';
  const PAPER_2_BASE = '#EDE5D6';
  const paper  = lerpHex(PAPER_BASE,   paperTint, strength);
  const paper2 = lerpHex(PAPER_2_BASE, paperTint, strength);

  const glow = lerpHex('#FFFFFF', accent, 0.45);

  return {
    hours: h,
    accent,
    accentSoft: lerpHex(accent, '#FFFFFF', 0.35),
    paper,
    paper2,
    ink: inkTone,
    glow,
    strength,
    phase: phase.name,
    label: phase.label,
    mood: phase.mood,
    isNight: !inDay,
    sunX,
    moonX,
  };
};

// Lagos clock (WAT = UTC+1, no DST)
export const lagosHours = (): number => {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const lagos = new Date(utcMs + 60 * 60000);
  return lagos.getHours() + lagos.getMinutes() / 60 + lagos.getSeconds() / 3600;
};

export type DaylightMode = 'off' | 'auto' | 'demo';

interface UseDaylightOptions {
  mode?: DaylightMode;
  /** demo mode: seconds per simulated 24h cycle */
  demoSpeed?: number;
  /** auto mode: poll interval in ms (default 60s — light enough for ambient drift) */
  autoIntervalMs?: number;
}

const FALLBACK: DaylightState = {
  hours: 18, phase: 'sunset', label: 'SUNSET', mood: 'cinematic',
  accent: '#FF4E2B', accentSoft: '#FFB89E',
  paper: '#F6F1E8', paper2: '#EDE5D6', ink: '#0A0814',
  glow: '#FFB89E', strength: 0,
  sunX: 0.95, moonX: -1, isNight: false,
};

export function useDaylight({
  mode = 'auto',
  demoSpeed = 60,
  autoIntervalMs = 60_000,
}: UseDaylightOptions = {}): DaylightState {
  const [hours, setHours] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (mode === 'off') {
      setHours(null);
      return;
    }
    if (mode === 'auto') {
      setHours(lagosHours());
      const id = window.setInterval(() => setHours(lagosHours()), autoIntervalMs);
      return () => window.clearInterval(id);
    }
    // demo
    let h = lagosHours();
    setHours(h);
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      h = (h + (24 / demoSpeed) * dt) % 24;
      setHours(h);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [mode, demoSpeed, autoIntervalMs]);

  if (mode === 'off' || hours == null) return FALLBACK;
  return sampleDaylight(hours);
}

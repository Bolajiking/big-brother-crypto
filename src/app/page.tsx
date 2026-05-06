'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SunArcIndicator from '@/components/SunArcIndicator';
import { useDaylight } from '@/lib/daylight';

// ─────────────────────────────────────────────────────────────
// PRIMITIVES — scoped to .sf-watch-root tokens (globals.css)
// Same theme system as /watch for seamless cross-page UX.
// ─────────────────────────────────────────────────────────────
const SFWordmark: React.FC<{ size?: number; color?: string; dot?: string }> = ({
  size = 22, color = '#fff', dot = '#FF4E2B',
}) => (
  <span className="sf-display" style={{
    fontSize: size, fontWeight: 900, color,
    letterSpacing: '-0.05em', lineHeight: 1,
    display: 'inline-flex', alignItems: 'center', gap: 1,
  }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        width: size * 0.78, height: size * 0.78, borderRadius: 6,
        background: 'var(--sf-stage)', border: '1.5px solid ' + color,
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

const PALETTES: Record<string, { a: string; b: string; c: string }> = {
  coral:  { a: '#FF4E2B', b: '#F2B544', c: '#0A0814' },
  violet: { a: '#6B3FE5', b: '#8DAAFF', c: '#0A0814' },
  mint:   { a: '#1FD17A', b: '#C8EB6D', c: '#0A0814' },
  gold:   { a: '#F2B544', b: '#FF4E2B', c: '#0A0814' },
  night:  { a: '#1A1247', b: '#6B3FE5', c: '#FF4E2B' },
  sky:    { a: '#5ACDFF', b: '#8DAAFF', c: '#0A0814' },
  rose:   { a: '#FF1F3D', b: '#FF4E2B', c: '#1A0410' },
  ink:    { a: '#0E0A1F', b: '#1A1247', c: '#FF4E2B' },
};

const Photo: React.FC<{ palette?: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({
  palette = 'coral', children, style,
}) => {
  const p = PALETTES[palette] || PALETTES.coral;
  return (
    <div className="sf-photo" style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: `radial-gradient(120% 120% at 80% 20%, ${p.b} 0%, ${p.a} 50%, ${p.c} 120%)`,
      ...style,
    }}>
      <div className="sf-photo-grain" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.45 }}>
        <circle cx="78" cy="22" r="14" fill={p.b} fillOpacity="0.55" />
        <circle cx="20" cy="78" r="26" fill={p.c} fillOpacity="0.30" />
        <path d="M 0 60 Q 30 50 50 60 T 100 55" stroke={p.c} strokeWidth="0.5" fill="none" opacity="0.7" />
        <path d="M 0 75 Q 30 65 55 70 T 100 68" stroke={p.b} strokeWidth="0.4" fill="none" opacity="0.5" />
      </svg>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.32 }}>
        <ellipse cx="50" cy="42" rx="11" ry="13" fill={p.c} />
        <path d="M 22 105 Q 30 70 50 70 Q 70 70 78 105 Z" fill={p.c} />
      </svg>
      {children}
    </div>
  );
};

type CamKind = 'wide' | 'corner' | 'tripod' | 'lens' | 'ptz';
const CamGlyph: React.FC<{ kind?: CamKind; color?: string }> = ({ kind = 'wide', color = '#FF4E2B' }) => {
  const stroke = '#0E0A1F';
  if (kind === 'wide') return (
    <svg viewBox="0 0 64 40" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
      <rect x="6" y="10" width="38" height="20" rx="3" fill="#fff" stroke={stroke} strokeWidth="1.6" />
      <circle cx="44" cy="20" r="9" fill={color} stroke={stroke} strokeWidth="1.6" />
      <circle cx="44" cy="20" r="4" fill="#0E0A1F" />
      <circle cx="46" cy="18" r="1.4" fill="#fff" />
      <path d="M22 10 L22 4 L26 4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="26" cy="4" r="1.6" fill={stroke} />
      <circle cx="11" cy="15" r="1.6" fill="#FF1F3D" />
    </svg>
  );
  if (kind === 'corner') return (
    <svg viewBox="0 0 64 40" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
      <path d="M2 2 L18 2 L2 18 Z" fill={color} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 14 L24 22" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <rect x="22" y="18" width="32" height="10" rx="5" fill="#fff" stroke={stroke} strokeWidth="1.6" />
      <circle cx="50" cy="23" r="3.6" fill="#0E0A1F" />
      <circle cx="51" cy="22" r="1.2" fill={color} />
      <circle cx="26" cy="23" r="1.4" fill="#FF1F3D" />
    </svg>
  );
  if (kind === 'tripod') return (
    <svg viewBox="0 0 64 40" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
      <rect x="14" y="6" width="28" height="16" rx="2" fill="#fff" stroke={stroke} strokeWidth="1.6" />
      <rect x="40" y="9" width="14" height="10" rx="1.5" fill={color} stroke={stroke} strokeWidth="1.6" />
      <circle cx="49" cy="14" r="2.6" fill="#0E0A1F" />
      <rect x="16" y="2" width="9" height="6" rx="1" fill={color} stroke={stroke} strokeWidth="1.4" />
      <path d="M28 22 L18 38 M28 22 L28 38 M28 22 L38 38" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="11" r="1.4" fill="#FF1F3D" />
    </svg>
  );
  if (kind === 'lens') return (
    <svg viewBox="0 0 64 40" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
      <circle cx="32" cy="20" r="16" fill="#fff" stroke={stroke} strokeWidth="1.6" />
      <circle cx="32" cy="20" r="11" fill={color} stroke={stroke} strokeWidth="1.4" />
      <circle cx="32" cy="20" r="6" fill="#0E0A1F" />
      <circle cx="34" cy="18" r="1.8" fill="#fff" />
      {[0, 60, 120, 180, 240, 300].map(a => (
        <line key={a} x1="32" y1="20" x2={32 + Math.cos(a * Math.PI / 180) * 11} y2={20 + Math.sin(a * Math.PI / 180) * 11} stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      ))}
      <rect x="48" y="6" width="8" height="4" rx="1" fill="#FF1F3D" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
  return (
    <svg viewBox="0 0 64 40" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
      <path d="M14 22 A18 18 0 0 1 50 22 Z" fill={color} stroke={stroke} strokeWidth="1.6" />
      <circle cx="32" cy="22" r="6" fill="#0E0A1F" />
      <circle cx="34" cy="20" r="1.6" fill="#fff" />
      <rect x="10" y="22" width="44" height="6" rx="1" fill="#fff" stroke={stroke} strokeWidth="1.6" />
      <path d="M6 32 Q 32 38 58 32" stroke={stroke} strokeWidth="1.4" strokeDasharray="2 2" fill="none" />
      <path d="M6 32 l3 -2 M6 32 l3 2" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M58 32 l-3 -2 M58 32 l-3 2" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="22" cy="25" r="1.4" fill="#FF1F3D" />
    </svg>
  );
};

const Reticle: React.FC<{ color?: string }> = ({ color = '#fff' }) => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
    <path d="M4 4 L4 14 M4 4 L14 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
    <path d="M96 4 L96 14 M96 4 L86 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
    <path d="M4 96 L4 86 M4 96 L14 96" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
    <path d="M96 96 L96 86 M96 96 L86 96" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
  </svg>
);

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; y?: number }> = ({ children, delay = 0, y = 24 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); obs.disconnect(); }
    }, { threshold: 0.12, rootMargin: '-40px' });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 700ms cubic-bezier(.22,1,.36,1) ${delay}ms, transform 700ms cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SECTIONS  (copy follows the homepage design spec verbatim
//  where it landed; tightened only for product accuracy.)
// ─────────────────────────────────────────────────────────────
const Nav: React.FC = () => {
  const day = useDaylight({ mode: 'auto' });
  const links = [
    { label: 'CAMERAS',   href: '#cameras' },
    { label: 'HOW IT WORKS', href: '#how' },
    { label: 'WHO IT’S FOR', href: '#built-for' },
    { label: 'CASTING',   href: '#casting' },
    { label: 'TIMELINE',  href: '#timeline' },
  ];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,8,20,0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--sf-line)',
    }}>
      <div className="sf-nav-pad" style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <Link href="/" style={{ display: 'inline-flex' }}><SFWordmark size={22} /></Link>
        <nav className="sf-hide-mobile" style={{ display: 'flex', gap: 4, marginLeft: 24 }}>
          {links.map(l => (
            <a key={l.label} href={l.href} className="sf-eyebrow" style={{
              padding: '10px 16px', borderRadius: 999,
              color: 'var(--sf-fg-2)', fontSize: 11, cursor: 'pointer',
              transition: 'color 200ms, background 200ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--sf-fg-2)'; e.currentTarget.style.background = 'transparent'; }}
            >{l.label}</a>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <div className="sf-hide-mobile">
          <SunArcIndicator state={day} dark compact={false} />
        </div>
        <span className="sf-hide-xs" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 12px', borderRadius: 999,
          background: 'rgba(255,78,43,0.12)', border: '1px solid rgba(255,78,43,0.4)',
          fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', color: '#fff',
        }}>
          <span className="sf-pulse"></span>
          CASTING SOON
        </span>
        <Link href="/watch" className="sf-btn sf-btn-ghost sf-hide-mobile" style={{ height: 38, padding: '0 18px' }}>SEE PREVIEW</Link>
        <a href="#cta" className="sf-btn sf-btn-coral" style={{ height: 38, padding: '0 14px', fontSize: 11 }}>JOIN WAITLIST</a>
      </div>
    </header>
  );
};

const Hero: React.FC = () => {
  const SilhouetteTile: React.FC<{ palette: string; label: string; sublabel: string; rotate?: number; top?: number; right?: number; width: number; zIndex?: number; opacity?: number }> = ({
    palette, label, sublabel, rotate = 0, top, right, width, zIndex = 1, opacity = 1,
  }) => (
    <div style={{ position: 'absolute', top, right, width, zIndex, opacity, transform: `rotate(${rotate}deg)`, transition: 'transform 600ms cubic-bezier(.22,1,.36,1)' }}>
      <div className="sf-tile" style={{ aspectRatio: '9/13', borderRadius: 16, borderColor: 'var(--sf-line-strong)' }}>
        <Photo palette={palette}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,20,0.4)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="sf-display" style={{
              fontSize: width > 300 ? 200 : 140, color: 'rgba(255,255,255,0.18)',
              fontStyle: 'italic', letterSpacing: '-0.06em',
            }}>?</div>
          </div>
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span style={{
              background: 'rgba(10,8,20,0.7)', backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: 9, fontWeight: 900,
              letterSpacing: '0.16em', padding: '4px 9px',
              borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)',
            }}>● CASTING</span>
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '40px 16px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.92), transparent)',
          }}>
            <div className="sf-eyebrow" style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>{sublabel}</div>
            <div className="sf-display" style={{ fontSize: width > 300 ? 22 : 14, color: '#fff', marginTop: 6, lineHeight: 1.05, fontStyle: 'italic' }}>{label}</div>
          </div>
        </Photo>
      </div>
    </div>
  );

  const STATS = [
    { v: '16',   l: 'Housemates Season 01' },
    { v: '24/7', l: 'Multi-cam streaming', accent: 'var(--sf-amber)' },
    { v: '0%',   l: 'Platform cut on payouts', accent: 'var(--sf-mint)' },
    { v: 'Q4',   l: 'Season 01 launch window' },
  ];

  return (
    <section style={{
      position: 'relative', minHeight: 820,
      background: 'var(--sf-stage)', overflow: 'hidden',
      borderBottom: '1px solid var(--sf-line)',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="sf-ring sf-ring-decor" style={{ width: 1100, height: 1100, top: -380, right: -260, borderColor: 'rgba(255,78,43,0.10)' }} />
        <div className="sf-ring sf-ring-decor" style={{ width: 800, height: 800, top: -200, right: -100, borderColor: 'rgba(255,78,43,0.18)' }} />
        <div className="sf-ring sf-ring-decor" style={{ width: 540, height: 540, top: -50, right: 60, borderColor: 'rgba(242,181,68,0.20)' }} />
        <div style={{ position: 'absolute', top: 200, right: 220, width: 1, height: 1, boxShadow: '0 0 200px 120px rgba(107,63,229,0.35)' }} />
        <div style={{ position: 'absolute', top: 500, left: 200, width: 1, height: 1, boxShadow: '0 0 220px 140px rgba(255,78,43,0.18)' }} />
      </div>

      <div className="sf-hero-silhouettes">
        <SilhouetteTile palette="coral"  rotate={3}  top={140} right={64}  width={380} zIndex={2} label="Could be you." sublabel="MAIN HOUSE · OPEN CASTING" />
        <SilhouetteTile palette="mint"   rotate={-5} top={320} right={460} width={220} zIndex={1} label="Apply now." sublabel="POOL DECK" />
        <SilhouetteTile palette="gold"   rotate={8}  top={80}  right={380} width={160} zIndex={0} opacity={0.7} label="The Garden" sublabel="" />
      </div>

      <div className="sf-hero-pad" style={{ position: 'relative', zIndex: 5, maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px',
              background: 'rgba(255,78,43,0.10)',
              border: '1px solid rgba(255,78,43,0.4)',
              borderRadius: 999,
            }}>
              <span className="sf-pulse"></span>
              <span className="sf-eyebrow" style={{ color: 'var(--sf-coral)', fontSize: 11 }}>SEASON 01 · ONE HOUSE · MULTI-CAM · CASTING SOON</span>
            </span>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="sf-display" style={{
            fontSize: 'clamp(56px, 9vw, 124px)', color: '#fff',
            maxWidth: 920, letterSpacing: '-0.05em',
            lineHeight: 0.86, marginBottom: 28,
          }}>
            One house. Every room.<br />
            <span style={{ fontStyle: 'italic', color: 'var(--sf-coral)' }}>Always-on cameras.</span><br />
            Twenty-four seven.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p style={{
            maxWidth: 600, fontSize: 18, lineHeight: 1.55,
            color: 'var(--sf-fg-2)', marginBottom: 40,
          }}>
            Africa&apos;s first reality show that pays the audience. Sixteen housemates, multi-camera coverage, 24/7 — watch from any angle, predict
            what happens next, and cash out your wins straight to your wallet. No SMS taxes. No platform cut. Just receipts.
          </p>
        </Reveal>

        <Reveal delay={220}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56, flexWrap: 'wrap' }}>
            <a href="#cta" className="sf-btn sf-btn-coral" style={{ height: 56, padding: '0 28px', fontSize: 13 }}>
              JOIN THE WAITLIST
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </a>
            <Link href="/apply" className="sf-btn sf-btn-paper" style={{ height: 56, padding: '0 28px', fontSize: 13 }}>
              APPLY TO BE CAST
            </Link>
            <Link href="/watch" className="sf-btn sf-btn-ghost" style={{ height: 56, padding: '0 24px', fontSize: 12 }}>
              SEE THE PREVIEW →
            </Link>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1,
            background: 'var(--sf-line)',
            border: '1px solid var(--sf-line)',
            borderRadius: 18, overflow: 'hidden',
            maxWidth: 760,
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ padding: '22px 20px', background: 'var(--sf-stage-2)' }}>
                <div className="sf-display" style={{ fontSize: 32, color: s.accent || '#fff', letterSpacing: '-0.04em' }}>{s.v}</div>
                <div style={{ fontSize: 10, color: 'var(--sf-fg-3)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Ticker: React.FC = () => {
  const items = [
    '★ Season 01 waitlist now open',
    '🎬 Casting applications open in 3 weeks',
    '💰 First 10,000 signups get a ₦500 starter pot at launch',
    '📺 Watch the platform preview — see how the markets work',
    '🏠 Multi-camera coverage across every key room — no edits, no cuts',
    '⚡ Zero platform cut on payouts — wallet to wallet',
  ];
  return (
    <div style={{
      background: 'var(--sf-stage-2)',
      borderTop: '1px solid var(--sf-line)',
      borderBottom: '1px solid var(--sf-line)',
      height: 56, display: 'flex', alignItems: 'center',
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center',
        gap: 10, padding: '0 22px',
        background: 'var(--sf-stage)', borderRight: '1px solid var(--sf-line)',
      }}>
        <span className="sf-pulse"></span>
        <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: '0.16em' }}>ANNOUNCEMENTS</span>
      </div>
      <div className="sf-marquee" style={{ paddingLeft: 32 }}>
        {[...items, ...items].map((t, i) => (
          <span key={i} style={{ fontSize: 13, color: 'var(--sf-fg-2)', fontWeight: 600 }}>{t}</span>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// RECEIPTS — pain-anchored proof that the gap is real
// ─────────────────────────────────────────────────────────────
const Receipts: React.FC = () => {
  const stats = [
    { v: '1.53B', l: 'Votes cast last BBNaija season', sub: 'Each one paid to vote. Zero paid back.' },
    { v: '₦115B', l: 'In SMS revenue captured by telcos', sub: '~$72M from fans like you. Pure extraction.' },
    { v: '60M',   l: 'Nigerians already predicting outcomes', sub: 'On Bet9ja, Sportybet, BetKing. Daily.' },
    { v: '$3.6B', l: 'Spent on those predictions every year', sub: 'Same demographic. Same phones. Different rails.' },
  ];
  return (
    <section
      style={{
        padding: 'clamp(56px, 8vw, 120px) clamp(14px, 4vw, 64px)',
        background: 'var(--sf-stage)',
        borderBottom: '1px solid var(--sf-line)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 14 }}>
            ● THE RECEIPTS
          </div>
          <h2 className="sf-display" style={{
            fontSize: 'clamp(40px, 7vw, 88px)', color: '#fff',
            letterSpacing: '-0.045em', lineHeight: 0.92,
            maxWidth: 980, marginBottom: 24,
          }}>
            You voted. You watched. You posted.<br />
            <span style={{ fontStyle: 'italic', color: 'var(--sf-coral)' }}>Then they cashed your check.</span>
          </h2>
          <p style={{
            maxWidth: 640, fontSize: 17, lineHeight: 1.6,
            color: 'var(--sf-fg-2)', marginBottom: 48,
          }}>
            Reality TV in Africa is a one-way street. Audiences make the show go, then watch a network and a few telcos
            walk away with the money. We pulled the receipts. The gap between two of Nigeria&apos;s biggest cultural
            behaviors is structural, not accidental — and it&apos;s exactly where Star Factor sits.
          </p>
        </Reveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}>
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 70}>
              <div style={{
                padding: 26, borderRadius: 18,
                background: 'var(--sf-stage-2)',
                border: '1px solid var(--sf-line)',
                minHeight: 200,
                display: 'flex', flexDirection: 'column',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -30, right: -30, width: 140, height: 140,
                  borderRadius: 999, background: 'radial-gradient(circle, rgba(255,78,43,0.16) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <div className="sf-display" style={{
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  color: i % 2 === 0 ? '#fff' : 'var(--sf-amber)',
                  letterSpacing: '-0.04em', marginBottom: 14, position: 'relative',
                }}>{s.v}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 6, position: 'relative' }}>{s.l}</div>
                <div style={{ fontSize: 12, color: 'var(--sf-fg-3)', lineHeight: 1.5, position: 'relative' }}>{s.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div style={{
            marginTop: 24, padding: '24px 28px',
            borderRadius: 18,
            background: 'linear-gradient(120deg, rgba(255,78,43,0.10), rgba(107,63,229,0.08))',
            border: '1px solid rgba(255,78,43,0.35)',
            display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
          }}>
            <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', flexShrink: 0 }}>★ THE WEDGE</div>
            <p style={{ flex: 1, minWidth: 280, fontSize: 14, lineHeight: 1.55, color: 'var(--sf-fg-2)', margin: 0 }}>
              50 million reality TV obsessives. 60 million active predictors. Same phones, same demographic, completely
              separate apps. We built the bridge.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Channels: React.FC = () => {
  const cams = [
    { name: 'Living Room', code: 'LR-01', short: 'CAM 01', color: '#FF4E2B', palette: 'coral',  desc: 'Wide shot. Where alliances form.',          icon: 'wide'   as CamKind },
    { name: 'Kitchen',     code: 'KT-02', short: 'CAM 02', color: '#F2B544', palette: 'gold',   desc: 'Counter cam. Where things slip out.',       icon: 'corner' as CamKind },
    { name: 'Bedroom 1',   code: 'BD-03', short: 'CAM 03', color: '#6B3FE5', palette: 'violet', desc: 'Wall-mount. Where strategy is whispered.',  icon: 'corner' as CamKind },
    { name: 'Bedroom 2',   code: 'BD-04', short: 'CAM 04', color: '#5ACDFF', palette: 'sky',    desc: 'Pillow talk. Late-night plotting.',         icon: 'corner' as CamKind },
    { name: 'Pool Deck',   code: 'PL-05', short: 'CAM 05', color: '#1FD17A', palette: 'mint',   desc: 'Outdoor. Tasks settle here.',               icon: 'tripod' as CamKind },
    { name: 'Diary Room',  code: 'DR-06', short: 'CAM 06', color: '#4D7AFF', palette: 'night',  desc: 'Confessional. One-shot, locked-off.',       icon: 'lens'   as CamKind },
    { name: 'Garden',      code: 'GD-07', short: 'CAM 07', color: '#FF1F3D', palette: 'rose',   desc: 'Rooftop PTZ. Sweeps the whole grounds.',    icon: 'ptz'    as CamKind },
    { name: 'Front Door',  code: 'FD-08', short: 'CAM 08', color: '#FFB020', palette: 'gold',   desc: 'Entry cam. Arrivals & exits.',              icon: 'corner' as CamKind },
  ];
  const [hovered, setHovered] = useState(0);

  return (
    <section id="cameras" style={{
      padding: 'clamp(56px, 8vw, 110px) clamp(14px, 4vw, 64px)',
      background: 'var(--sf-stage)',
      borderBottom: '1px solid var(--sf-line)',
      position: 'relative',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, gap: 32, flexWrap: 'wrap' }}>
            <div>
              <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 24, height: 16 }}><CamGlyph kind="wide" color="var(--sf-coral)" /></span>
                ONE HOUSE · MULTI-CAMERA · SCALING UP EVERY SEASON
              </div>
              <h2 className="sf-display" style={{
                fontSize: 'clamp(40px, 6vw, 76px)', color: '#fff',
                letterSpacing: '-0.045em', lineHeight: 0.92, maxWidth: 760,
              }}>
                Pick your<br />
                <span style={{ fontStyle: 'italic', color: 'var(--sf-coral)' }}>angle.</span> Switch anytime.
              </h2>
            </div>
            <div style={{ maxWidth: 360, paddingBottom: 12 }}>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--sf-fg-2)' }}>
                Multiple HD feeds rolling in parallel from every key room. Living room to diary room, kitchen to garden, garden to front door — switch like you&apos;re flipping seats in the same room. No edit. No cut. No spin.
              </p>
              <Link href="/watch" className="sf-eyebrow" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: '#fff', marginTop: 16,
              }}>
                SEE THE WATCH PREVIEW
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {cams.map((h, i) => (
            <Reveal key={h.code} delay={i * 40}>
              <div
                className={`sf-tile ${hovered === i ? 'active' : ''}`}
                onMouseEnter={() => setHovered(i)}
                style={{
                  aspectRatio: '4/3', borderRadius: 18,
                  borderColor: hovered === i ? h.color : 'var(--sf-line)',
                  boxShadow: hovered === i ? `0 0 0 1px ${h.color}, 0 24px 60px -16px ${h.color}55` : 'none',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3,
                  height: 56, padding: '0 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)',
                }}>
                  <div style={{
                    width: 44, height: 28,
                    background: 'rgba(10,8,20,0.78)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 6, padding: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <CamGlyph kind={h.icon} color={h.color} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span className="sf-mono" style={{ fontSize: 9, fontWeight: 900, color: '#fff', letterSpacing: '0.16em' }}>{h.code}</span>
                    <span className="sf-mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.1em' }}>REC ●</span>
                  </div>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
                    padding: '4px 8px', borderRadius: 4,
                    background: h.color, color: '#0A0814',
                  }}>SOON</span>
                </div>

                <Photo palette={h.palette} style={{ height: '100%' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,20,0.34)' }} />
                  <Reticle color="#fff" />

                  <div className="sf-mono" style={{
                    position: 'absolute', bottom: 70, right: 12, zIndex: 3,
                    padding: '3px 7px',
                    background: 'rgba(10,8,20,0.7)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 3,
                    fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
                    letterSpacing: '0.08em',
                  }}>--:--:--</div>

                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '60px 20px 18px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.92) 30%, transparent)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span className="sf-house-dot" style={{ background: h.color }}></span>
                      <span className="sf-eyebrow" style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{h.short}</span>
                    </div>
                    <div className="sf-display" style={{ fontSize: 26, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                      {h.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: 500 }}>{h.desc}</div>
                  </div>
                </Photo>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Director's booth callout */}
        <Reveal delay={120}>
          <div style={{
            marginTop: 14,
            padding: 28,
            borderRadius: 20,
            background: 'linear-gradient(120deg, rgba(107,63,229,0.18) 0%, rgba(255,78,43,0.10) 100%)',
            border: '1px solid var(--sf-violet)',
            display: 'flex', alignItems: 'center', gap: 28,
            position: 'relative', overflow: 'hidden', flexWrap: 'wrap',
          }}>
            <div style={{
              position: 'absolute', right: -50, top: -50, width: 240, height: 240,
              borderRadius: 999,
              background: 'radial-gradient(circle, rgba(107,63,229,0.4) 0%, transparent 70%)',
            }} />
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
              width: 200, height: 96, flexShrink: 0,
              border: '1.5px solid var(--sf-violet)', padding: 4, borderRadius: 8,
              background: 'rgba(10,8,20,0.5)',
            }}>
              {cams.map((c, i) => (
                <div key={i} style={{
                  background: i === 0 ? c.color : `${c.color}33`,
                  border: i === 0 ? '1px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3, position: 'relative', overflow: 'hidden',
                  aspectRatio: '4/3',
                }}>
                  <div className="sf-mono" style={{ position: 'absolute', top: 1, left: 2, fontSize: 6, color: '#fff', fontWeight: 900, letterSpacing: '0.05em' }}>{i + 1}</div>
                  {i === 0 && <div style={{ position: 'absolute', top: 2, right: 2, width: 4, height: 4, borderRadius: 999, background: '#fff' }} />}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, position: 'relative', minWidth: 280 }}>
              <div className="sf-eyebrow" style={{ color: 'var(--sf-violet)' }}>★ DIRECTOR&apos;S BOOTH</div>
              <div className="sf-display" style={{ fontSize: 32, color: '#fff', marginTop: 6, marginBottom: 6, letterSpacing: '-0.03em' }}>
                Every camera, <span style={{ fontStyle: 'italic' }}>one screen.</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--sf-fg-2)', maxWidth: 520 }}>
                Run multicam with picture-in-picture, follow a cast member across rooms, see the whole house at once. Pro tier — preview at launch.
              </div>
            </div>
            <Link href="/watch" className="sf-btn sf-btn-paper" style={{ height: 44, padding: '0 22px', fontSize: 12 }}>LEARN MORE →</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const HowItWorks: React.FC = () => {
  const steps = [
    { n: '01', eyebrow: 'WATCH',   palette: 'coral', color: '#FF4E2B',
      title: 'Pick a room. Pick your angle.',
      body: 'Multi-cam coverage across every key room, streaming 24/7. Hop from the Living Room to the Pool Deck to the Diary Room — anywhere the cast goes, a camera is already there.' },
    { n: '02', eyebrow: 'PREDICT', palette: 'gold',  color: '#F2B544',
      title: 'Markets open every minute.',
      body: 'Will a kiss happen tonight? Who wins the task? Who gets evicted? Stake from ₦100. Markets settle the moment it happens.' },
    { n: '03', eyebrow: 'EARN',    palette: 'mint',  color: '#1FD17A',
      title: 'Cash out, wallet to wallet.',
      body: 'Win, hold, withdraw. No platform cut on payouts. Your prediction history, your wallet, your money — yours.' },
  ];

  return (
    <section id="how" style={{
      padding: 'clamp(56px, 8vw, 120px) clamp(14px, 4vw, 64px)',
      background: 'var(--sf-paper)',
      color: 'var(--sf-stage)',
      borderBottom: '1px solid var(--sf-line)',
      position: 'relative',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 64, gap: 40, flexWrap: 'wrap' }}>
            <div>
              <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 12 }}>● HOW IT WORKS</div>
              <h2 className="sf-display" style={{ fontSize: 'clamp(48px, 7vw, 84px)', color: 'var(--sf-stage)', letterSpacing: '-0.05em', lineHeight: 0.9, maxWidth: 800 }}>
                Watch. <span style={{ fontStyle: 'italic', color: 'var(--sf-coral)' }}>Predict.</span> Earn.
              </h2>
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: 'rgba(10,8,20,0.7)', maxWidth: 380, paddingBottom: 20 }}>
              We opened every camera. We opened every market. Then we handed over the remote — and the wallet. Three taps to the wins.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div style={{
                padding: 32, background: '#fff',
                border: '2px solid var(--sf-stage)',
                borderRadius: 28,
                position: 'relative', overflow: 'hidden',
                minHeight: 480,
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 200,
                  background: s.color, borderBottom: '2px solid var(--sf-stage)',
                }}>
                  <Photo palette={s.palette}>
                    <div style={{
                      position: 'absolute', top: 18, left: 22,
                      fontSize: 64, fontWeight: 900, color: '#fff',
                      letterSpacing: '-0.05em', lineHeight: 1,
                      textShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    }}>{s.n}</div>
                    <div style={{
                      position: 'absolute', top: 22, right: 22,
                      padding: '5px 12px', borderRadius: 999,
                      background: 'rgba(10,8,20,0.85)', backdropFilter: 'blur(6px)',
                      fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '0.16em',
                    }}>{s.eyebrow}</div>
                  </Photo>
                </div>

                <div style={{ marginTop: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 className="sf-display" style={{
                    fontSize: 28, color: 'var(--sf-stage)', lineHeight: 1.05, marginBottom: 12,
                    letterSpacing: '-0.03em',
                  }}>{s.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(10,8,20,0.7)', flex: 1 }}>{s.body}</p>
                  <div style={{
                    marginTop: 20, paddingTop: 16,
                    borderTop: '1px dashed rgba(10,8,20,0.18)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span className="sf-eyebrow" style={{ color: s.color }}>{s.eyebrow}</span>
                    <span style={{ marginLeft: 'auto', color: 'rgba(10,8,20,0.4)', fontSize: 12, fontWeight: 700 }}>STEP {s.n}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const MarketsPreview: React.FC = () => {
  const samples = [
    {
      title: 'Will a kiss happen today?',
      sub: 'Daily binary market · any camera, any room',
      type: 'BINARY',
      options: [
        { label: 'Yes', odds: '1.8x', pct: 64, color: 'var(--sf-mint)' },
        { label: 'No',  odds: '2.4x', pct: 36, color: '#aaa' },
      ],
    },
    {
      title: 'Who gets evicted Sunday?',
      sub: 'Weekly official market · 4 nominees',
      type: 'OFFICIAL',
      options: [
        { label: 'Nominee A', odds: '2.3x', pct: 42, color: '#F2B544' },
        { label: 'Nominee B', odds: '3.1x', pct: 28, color: '#FF1F3D' },
        { label: 'Nominee C', odds: '4.4x', pct: 18, color: '#1FD17A' },
        { label: 'Nominee D', odds: '5.6x', pct: 12, color: '#5ACDFF' },
      ],
    },
    {
      title: "Who wins tonight's task?",
      sub: 'Live during challenges · two teams',
      type: 'TASK',
      options: [
        { label: 'Team Sun',  odds: '1.9x', pct: 56, color: '#FFB020' },
        { label: 'Team Moon', odds: '2.0x', pct: 44, color: '#6B3FE5' },
      ],
    },
  ];

  return (
    <section style={{
      padding: 'clamp(56px, 8vw, 120px) clamp(14px, 4vw, 64px)',
      background: 'var(--sf-stage)',
      borderBottom: '1px solid var(--sf-line)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 80, right: -120,
        width: 420, height: 420, borderRadius: 999,
        background: 'radial-gradient(circle at 30% 30%, #FFE68A 0%, #FFB020 50%, #C97A00 100%)',
        opacity: 0.06, filter: 'blur(2px)',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, gap: 40, flexWrap: 'wrap' }}>
            <div>
              <div className="sf-eyebrow" style={{ color: 'var(--sf-amber)', marginBottom: 12 }}>● MARKET PREVIEW · SAMPLES</div>
              <h2 className="sf-display" style={{
                fontSize: 'clamp(48px, 7vw, 84px)', color: '#fff',
                letterSpacing: '-0.05em', lineHeight: 0.9, maxWidth: 920,
              }}>
                Every moment is<br />
                <span style={{ fontStyle: 'italic', color: 'var(--sf-amber)' }}>a market.</span>
              </h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--sf-fg-3)', lineHeight: 1.55, maxWidth: 360, paddingBottom: 18 }}>
              Sample markets to show the format. From day one, every pool is real, every odd is on-chain, and every settlement clears the second it&apos;s called.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          {samples.map((p, idx) => (
            <Reveal key={p.title} delay={idx * 80}>
              <div style={{
                padding: 24,
                background: idx === 1 ? 'linear-gradient(180deg, rgba(255,176,32,0.10), var(--sf-stage-2))' : 'var(--sf-stage-2)',
                border: `1px solid ${idx === 1 ? 'var(--sf-amber)' : 'var(--sf-line)'}`,
                borderRadius: 18,
                position: 'relative',
                minHeight: 320,
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{
                  position: 'absolute', top: -10, left: 16,
                  background: idx === 1 ? 'var(--sf-amber)' : idx === 0 ? 'var(--sf-coral)' : 'var(--sf-mint)',
                  color: idx === 1 || idx === 2 ? '#1A0F00' : '#fff',
                  fontSize: 9, fontWeight: 900, letterSpacing: '0.16em',
                  padding: '4px 10px', borderRadius: 4,
                }}>{p.type}</div>

                <div style={{ marginBottom: 14 }}>
                  <h3 className="sf-display" style={{ fontSize: 24, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 6 }}>
                    {p.title}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--sf-fg-3)' }}>{p.sub}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  {p.options.map((o) => (
                    <div key={o.label} className="sf-pred-row" style={{ borderColor: 'var(--sf-line)', cursor: 'default' }}>
                      <div className="sf-pred-fill" style={{ width: `${o.pct}%`, background: `${o.color}24` }} />
                      <div style={{ position: 'relative', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="sf-house-dot" style={{ background: o.color, width: 8, height: 8 }}></span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', flex: 1 }}>{o.label}</span>
                        <span style={{ fontSize: 11, color: 'var(--sf-fg-2)', fontWeight: 700 }}>{o.pct}%</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: o.color, minWidth: 42, textAlign: 'right' }}>{o.odds}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: 16, padding: '8px 12px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px dashed var(--sf-line-strong)',
                  fontSize: 10, color: 'var(--sf-fg-3)', fontWeight: 700,
                  letterSpacing: '0.1em', textAlign: 'center',
                }}>
                  SAMPLE · PREDICTIONS LOCK ON LAUNCH
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div style={{
            padding: '20px 28px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed var(--sf-line-strong)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 22, color: 'var(--sf-violet)' }}>＋</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>User-created markets are coming.</div>
              <div style={{ fontSize: 12, color: 'var(--sf-fg-3)', marginTop: 2 }}>Set the question, set the odds, settle on chain. Available from launch.</div>
            </div>
            <button className="sf-btn sf-btn-ghost" style={{ height: 38, padding: '0 18px' }}>READ THE WHITEPAPER</button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// BUILT FOR — three-audience positioning (viewers / cast / brands)
// ─────────────────────────────────────────────────────────────
const BuiltFor: React.FC = () => {
  const audiences = [
    {
      tag: 'FOR VIEWERS',
      headline: 'Get paid for paying attention.',
      palette: 'coral',
      accent: '#FF4E2B',
      body: 'You already watched 100+ hours last season. You already had the right read on every eviction. Now your read is worth money. Predict from ₦100. Win, hold, or cash out — straight to your bank, no platform cut.',
      bullets: [
        { k: 'Predict from ₦100', v: 'Bet small. Win in real time.' },
        { k: 'Cash out wallet-to-bank', v: 'Paystack. Instant. Naira out.' },
        { k: 'Free Clout daily', v: 'Earn just by showing up.' },
      ],
      cta: { label: 'JOIN THE WAITLIST', href: '#cta' },
    },
    {
      tag: 'FOR THE CAST',
      headline: 'Get paid while the cameras roll.',
      palette: 'violet',
      accent: '#6B3FE5',
      body: 'Traditional reality TV pays you in fame after the fact — and only if you make it to the end. Star Factor pays you while you&apos;re in the house. Tips, fan support, and a $30,000 grand prize. The audience picks who they&apos;re backing in real time.',
      bullets: [
        { k: '$30K grand prize', v: 'Plus weekly challenge cash.' },
        { k: 'Direct fan tips', v: '70% to you, in-show, every day.' },
        { k: '42 days, multi-cam', v: 'Build your audience while you live.' },
      ],
      cta: { label: 'APPLY TO BE CAST', href: '/apply' },
    },
    {
      tag: 'FOR BRANDS',
      headline: 'Sponsor the room. Own the moment.',
      palette: 'gold',
      accent: '#F2B544',
      body: 'BetNaija got a 35% brand-awareness lift from a single BBNaija sponsorship. We offer the same audience — younger, mobile-first, and already transacting — at a fraction of broadcast pricing. Title sponsor, named rooms, branded challenges, prediction-market sponsors.',
      bullets: [
        { k: 'Name a room', v: 'Your brand on every camera.' },
        { k: 'Sponsor a market', v: 'Be the brand that pays the winners.' },
        { k: 'Real-time engagement data', v: 'Per minute, per cast member.' },
      ],
      cta: { label: 'PARTNER WITH US', href: 'mailto:bolaji@chainfren.com?subject=Star%20Factor%20%E2%80%94%20Sponsor%20Inquiry' },
    },
  ];

  return (
    <section
      id="built-for"
      style={{
        padding: 'clamp(56px, 8vw, 120px) clamp(14px, 4vw, 64px)',
        background: 'var(--sf-stage)',
        borderBottom: '1px solid var(--sf-line)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <div style={{ marginBottom: 56 }}>
            <div className="sf-eyebrow" style={{ color: 'var(--sf-amber)', marginBottom: 12 }}>● BUILT FOR EVERY SEAT IN THE ROOM</div>
            <h2 className="sf-display" style={{
              fontSize: 'clamp(44px, 7vw, 84px)', color: '#fff',
              letterSpacing: '-0.05em', lineHeight: 0.92, maxWidth: 980,
            }}>
              The audience earns. The cast earns.<br />
              <span style={{ fontStyle: 'italic', color: 'var(--sf-amber)' }}>The brands get a front-row seat.</span>
            </h2>
            <p style={{ maxWidth: 620, fontSize: 16, lineHeight: 1.55, color: 'var(--sf-fg-2)', marginTop: 18 }}>
              Reality TV has always been a one-sided economy. We rebuilt it so everyone with skin in the game has skin in the upside.
            </p>
          </div>
        </Reveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {audiences.map((a, i) => (
            <Reveal key={a.tag} delay={i * 80}>
              <div style={{
                position: 'relative', overflow: 'hidden',
                padding: 28, borderRadius: 22,
                background: 'var(--sf-stage-2)',
                border: `1px solid ${a.accent}55`,
                minHeight: 480,
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <div style={{
                  position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                  borderRadius: 999,
                  background: `radial-gradient(circle, ${a.accent}30 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
                <div className="sf-eyebrow" style={{ color: a.accent }}>{a.tag}</div>
                <h3 className="sf-display" style={{
                  fontSize: 28, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em',
                }}>{a.headline}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--sf-fg-2)' }}>{a.body}</p>

                <ul style={{
                  listStyle: 'none', padding: 0, margin: '4px 0 0',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  borderTop: '1px dashed var(--sf-line)', paddingTop: 14,
                }}>
                  {a.bullets.map(b => (
                    <li key={b.k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '-0.005em' }}>{b.k}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--sf-fg-3)', lineHeight: 1.45 }}>{b.v}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 'auto', paddingTop: 14 }}>
                  {a.cta.href.startsWith('mailto:') ? (
                    <a href={a.cta.href} className="sf-btn sf-btn-coral" style={{ height: 42, padding: '0 18px', fontSize: 11, background: a.accent, borderColor: a.accent }}>
                      {a.cta.label}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                    </a>
                  ) : a.cta.href.startsWith('/') ? (
                    <Link href={a.cta.href} className="sf-btn sf-btn-coral" style={{ height: 42, padding: '0 18px', fontSize: 11, background: a.accent, borderColor: a.accent }}>
                      {a.cta.label}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                    </Link>
                  ) : (
                    <a href={a.cta.href} className="sf-btn sf-btn-coral" style={{ height: 42, padding: '0 18px', fontSize: 11, background: a.accent, borderColor: a.accent }}>
                      {a.cta.label}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Casting: React.FC = () => {
  const slots = [
    { palette: 'coral',  tag: 'CHARM',    line: 'The flirt who reads the room.' },
    { palette: 'violet', tag: 'STRATEGY', line: 'Plays the long game from day one.' },
    { palette: 'gold',   tag: 'DRAMA',    line: 'Magnet. Always near the chaos.' },
    { palette: 'mint',   tag: 'TASK',     line: 'Wins the challenges. Quiet wins.' },
    { palette: 'sky',    tag: 'COMIC',    line: 'Keeps the house from turning sour.' },
    { palette: 'rose',   tag: 'WILDCARD', line: 'Nobody knows what they’ll do next.' },
    { palette: 'night',  tag: 'HEART',    line: 'The one the audience falls for.' },
    { palette: 'ink',    tag: 'CHAOS',    line: 'Burns it down on day forty.' },
  ];

  return (
    <section id="casting" style={{
      padding: 'clamp(56px, 8vw, 120px) clamp(14px, 4vw, 64px)',
      background: 'var(--sf-stage)',
      borderBottom: '1px solid var(--sf-line)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, gap: 32, flexWrap: 'wrap' }}>
            <div>
              <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 12 }}>● CASTING SOON · 16 HOUSEMATES</div>
              <h2 className="sf-display" style={{ fontSize: 'clamp(48px, 7vw, 84px)', color: '#fff', letterSpacing: '-0.05em', lineHeight: 0.9, maxWidth: 880 }}>
                Sixteen housemates. <span style={{ fontStyle: 'italic', color: 'var(--sf-coral)' }}>One winner.</span>
              </h2>
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--sf-fg-2)', maxWidth: 380, paddingBottom: 18 }}>
              Sixteen people. Multi-cam coverage. Forty-two days. One $30,000 grand prize, plus weekly challenge cash and direct fan tips while you&apos;re still in the house. Apply yourself, or nominate the friend you know is built for it.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
          {slots.map((s, i) => (
            <Reveal key={s.tag} delay={i * 40}>
              <div className="sf-tile" style={{ aspectRatio: '3/4', borderRadius: 18 }}>
                <Photo palette={s.palette}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,20,0.45)' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="sf-display" style={{
                      fontSize: 'clamp(80px, 18vw, 140px)', color: 'rgba(255,255,255,0.15)',
                      fontStyle: 'italic', letterSpacing: '-0.05em',
                    }}>0{i + 1}</div>
                  </div>
                  <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <span style={{
                      background: 'rgba(10,8,20,0.7)', backdropFilter: 'blur(8px)',
                      color: '#fff', fontSize: 9, fontWeight: 900,
                      letterSpacing: '0.16em', padding: '4px 9px',
                      borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)',
                    }}>SLOT 0{i + 1}</span>
                  </div>
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
                      padding: '4px 8px', borderRadius: 4,
                      background: 'rgba(255,255,255,0.92)', color: '#0A0814',
                    }}>{s.tag}</span>
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '40px 16px 16px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.94) 30%, transparent)',
                  }}>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>{s.line}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>OPEN APPLICATION</div>
                  </div>
                </Photo>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div style={{
            padding: 28,
            background: 'linear-gradient(120deg, rgba(255,78,43,0.12), rgba(107,63,229,0.10))',
            border: '1px solid rgba(255,78,43,0.35)',
            borderRadius: 22,
            display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)' }}>★ APPLICATIONS OPEN SOON</div>
              <div className="sf-display" style={{ fontSize: 32, color: '#fff', marginTop: 8, marginBottom: 6, letterSpacing: '-0.03em' }}>
                Think you&apos;ve got it? <span style={{ fontStyle: 'italic' }}>Get on the list.</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--sf-fg-2)' }}>
                18+, residents of any African country. Drop your handle and we&apos;ll send the application the day it opens.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/apply" className="sf-btn sf-btn-coral" style={{ height: 48, padding: '0 22px', fontSize: 12 }}>APPLY TO BE CAST</Link>
              <button className="sf-btn sf-btn-ghost" style={{ height: 48, padding: '0 22px', fontSize: 12 }}>NOMINATE A FRIEND</button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Mechanics: React.FC = () => {
  const ms = [
    { tag: 'OFFICIAL', icon: '★',  color: 'var(--sf-amber)',  q: 'Who gets evicted Sunday?',     body: 'Big-pool markets every Sunday. House nominees. Open all week.' },
    { tag: 'LIVE',     icon: '🔥', color: '#FF4E2B',           q: 'Will a kiss happen tonight?',  body: 'Daily binary markets. Settle as soon as it happens.' },
    { tag: 'TASK',     icon: '⚡', color: 'var(--sf-mint)',    q: "Who wins tonight's task?",     body: 'Open during challenges. Closes when the buzzer goes.' },
    { tag: 'USER',     icon: '👤', color: 'var(--sf-violet)',  q: 'Argument before dinner?',      body: 'You set the question. You set the odds. We settle it.' },
  ];

  return (
    <section style={{
      padding: 'clamp(56px, 8vw, 120px) clamp(14px, 4vw, 64px)',
      background: 'var(--sf-stage-2)',
      borderTop: '1px solid var(--sf-line)',
      borderBottom: '1px solid var(--sf-line)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 64, alignItems: 'flex-start' }}>
        <Reveal>
          <div>
            <div className="sf-eyebrow" style={{ color: 'var(--sf-amber)', marginBottom: 12 }}>● WHAT&apos;S ON THE LINE</div>
            <h2 className="sf-display" style={{ fontSize: 'clamp(44px, 6vw, 76px)', color: '#fff', letterSpacing: '-0.05em', lineHeight: 0.9, marginBottom: 24 }}>
              Real money,<br />
              <span style={{ fontStyle: 'italic', color: 'var(--sf-amber)' }}>real stakes.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--sf-fg-2)', lineHeight: 1.6, marginBottom: 28, maxWidth: 460 }}>
              Cash payouts settled in seconds. Wallet to wallet. Zero platform cut on payouts — the markets fund themselves from the pool. Stablecoin rails under the hood, Naira on the surface. Buy in like you&apos;re buying airtime; cash out to your bank in seconds.
            </p>

            <div style={{
              padding: 28,
              background: 'linear-gradient(120deg, rgba(255,176,32,0.14), rgba(255,78,43,0.10))',
              border: '1px solid rgba(255,176,32,0.4)',
              borderRadius: 18,
              display: 'flex', alignItems: 'center', gap: 24,
            }}>
              <div className="sf-spin-slow" style={{
                width: 64, height: 64, borderRadius: 999,
                background: 'radial-gradient(circle at 30% 30%, #FFE68A 0%, #FFB020 60%, #C97A00 100%)',
                boxShadow: 'inset 0 -3px 4px rgba(0,0,0,0.25), 0 8px 24px rgba(255,176,32,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1A0F00', fontWeight: 900, fontSize: 28, flexShrink: 0,
              }}>★</div>
              <div>
                <div className="sf-display" style={{ fontSize: 44, color: '#fff', letterSpacing: '-0.04em' }}>0%</div>
                <div className="sf-eyebrow" style={{ color: 'var(--sf-fg-3)', marginTop: 4 }}>PLATFORM CUT ON PAYOUTS · EVER</div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div style={{
            background: 'var(--sf-stage)',
            border: '1px solid var(--sf-line)',
            borderRadius: 22, padding: 8,
          }}>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--sf-line)' }}>
              <span className="sf-pulse"></span>
              <span className="sf-eyebrow" style={{ color: '#fff' }}>WHAT YOU CAN PREDICT</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--sf-fg-3)', fontWeight: 700 }}>SAMPLE MARKETS</span>
            </div>
            {ms.map((m, i, arr) => (
              <div key={m.tag} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: 18,
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: m.color + '22', border: `1px solid ${m.color}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
                      padding: '2px 7px', borderRadius: 4,
                      background: m.color, color: '#0A0814',
                    }}>{m.tag}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>{m.q}</div>
                  <div style={{ fontSize: 12, color: 'var(--sf-fg-2)', lineHeight: 1.5 }}>{m.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Timeline: React.FC = () => {
  const steps = [
    { phase: 'NOW',         title: 'Waitlist open',                body: 'Get on the list — first 10,000 signups get a starter pot when we go live.', color: '#FF4E2B', live: true },
    { phase: 'NEXT',        title: 'Casting opens',                body: 'Open applications for 16 housemate slots. Rolling shortlist published weekly.', color: '#F2B544' },
    { phase: 'PRE-LAUNCH',  title: 'Cast reveal & house build',    body: 'Final 8 announced. Cameras installed. Markets primed. Director’s booth opens to early backers.', color: '#6B3FE5' },
    { phase: 'LAUNCH',      title: 'Season 01 goes live',          body: '42 days. Multi-cam coverage. 24/7 streaming. Eviction every Sunday at 19:00 WAT.', color: '#1FD17A', big: true },
  ];

  return (
    <section id="timeline" style={{
      padding: 'clamp(56px, 8vw, 120px) clamp(14px, 4vw, 64px)',
      background: 'var(--sf-stage)',
      borderBottom: '1px solid var(--sf-line)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap' }}>
            <div>
              <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 12 }}>● THE ROAD TO SEASON 01</div>
              <h2 className="sf-display" style={{
                fontSize: 'clamp(44px, 6vw, 76px)', color: '#fff',
                letterSpacing: '-0.05em', lineHeight: 0.9, maxWidth: 800,
              }}>
                Four phases.<br />
                <span style={{ fontStyle: 'italic' }}>One season.</span>
              </h2>
            </div>
          </div>
        </Reveal>

        <div style={{ position: 'relative' }}>
          <div className="sf-hide-mobile" style={{
            position: 'absolute', top: 28, left: '6%', right: '6%', height: 2,
            background: 'linear-gradient(to right, #FF4E2B 0%, #F2B544 33%, #6B3FE5 66%, #1FD17A 100%)',
            opacity: 0.4,
          }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {steps.map((s, i) => (
              <Reveal key={s.phase} delay={i * 100}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 999,
                    background: 'var(--sf-stage)',
                    border: `2px solid ${s.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 22, position: 'relative', zIndex: 2,
                    boxShadow: s.live ? `0 0 0 6px ${s.color}22, 0 0 24px ${s.color}55` : 'none',
                  }}>
                    {s.live
                      ? <span className="sf-pulse" style={{ background: s.color, boxShadow: `0 0 0 4px ${s.color}33`, width: 12, height: 12 }} />
                      : <span style={{ width: 12, height: 12, borderRadius: 999, background: s.color, opacity: 0.5 }} />}
                  </div>
                  <div style={{
                    padding: 22,
                    background: s.big ? `linear-gradient(160deg, ${s.color}26, var(--sf-stage-2))` : 'var(--sf-stage-2)',
                    border: `1px solid ${s.big || s.live ? s.color : 'var(--sf-line)'}`,
                    borderRadius: 18,
                    minHeight: 200,
                    display: 'flex', flexDirection: 'column',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {s.big && (
                      <div style={{
                        position: 'absolute', right: -40, top: -40, width: 160, height: 160,
                        borderRadius: 999,
                        background: `radial-gradient(circle, ${s.color}50 0%, transparent 70%)`,
                      }} />
                    )}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
                        padding: '4px 9px', borderRadius: 4,
                        background: s.color, color: '#0A0814',
                      }}>{s.phase}</span>
                      {s.live && (
                        <>
                          <span className="sf-pulse"></span>
                          <span style={{ fontSize: 10, color: s.color, fontWeight: 800, letterSpacing: '0.1em' }}>NOW</span>
                        </>
                      )}
                    </div>
                    <div className="sf-display" style={{ fontSize: 22, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 8 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--sf-fg-2)', lineHeight: 1.5, flex: 1 }}>{s.body}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FinalCTA: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/.+@.+\..+/.test(email)) return;
    setSubmitted(true);
  };
  return (
    <section id="cta" style={{
      padding: 'clamp(64px, 9vw, 140px) clamp(14px, 4vw, 64px)',
      background: 'var(--sf-stage)',
      borderBottom: '1px solid var(--sf-line)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="sf-ring sf-ring-decor" style={{ width: 1400, height: 1400, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', borderColor: 'rgba(255,78,43,0.10)' }} />
      <div className="sf-ring sf-ring-decor" style={{ width: 1000, height: 1000, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', borderColor: 'rgba(255,78,43,0.18)' }} />
      <div className="sf-ring sf-ring-decor" style={{ width: 640, height: 640, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', borderColor: 'rgba(242,181,68,0.22)' }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: 1, height: 1,
        boxShadow: '0 0 220px 160px rgba(255,78,43,0.14), 0 0 400px 280px rgba(107,63,229,0.12)',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        <Reveal>
          <div className="sf-eyebrow" style={{ color: 'var(--sf-coral)', marginBottom: 24 }}>● SEASON 01 · WAITLIST OPEN</div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="sf-display" style={{
            fontSize: 'clamp(72px, 14vw, 168px)', color: '#fff',
            letterSpacing: '-0.06em', lineHeight: 0.85,
            marginBottom: 40,
          }}>
            Don&apos;t watch.<br />
            <span style={{ fontStyle: 'italic', color: 'var(--sf-coral)' }}>Play.</span>
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p style={{
            fontSize: 19, lineHeight: 1.5, color: 'var(--sf-fg-2)',
            maxWidth: 600, margin: '0 auto 48px',
          }}>
            The cast hears the chat. The markets clear in real time. The evictions are decided by you. Get on the list — first 10,000 walk in with a ₦500 starter pot already in the wallet.
          </p>
        </Reveal>

        <Reveal delay={220}>
          {submitted ? (
            <div style={{
              maxWidth: 540, margin: '0 auto',
              padding: '20px 28px',
              background: 'rgba(31,209,122,0.08)',
              border: '1px solid var(--sf-mint)',
              borderRadius: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--sf-mint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0A0814', fontWeight: 900 }}>✓</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>You&apos;re on the list. We&apos;ll be in touch the moment Season 01 lights up.</span>
            </div>
          ) : (
            <form onSubmit={submit} style={{
              maxWidth: 540, margin: '0 auto',
              display: 'flex', gap: 8,
              padding: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--sf-line-strong)',
              borderRadius: 999,
              backdropFilter: 'blur(8px)',
            }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: 1, height: 52, padding: '0 22px',
                  background: 'transparent', border: 'none', outline: 'none',
                  color: '#fff', fontSize: 15,
                  letterSpacing: '-0.01em',
                  fontFamily: 'inherit',
                }}
              />
              <button type="submit" className="sf-btn sf-btn-coral" style={{ height: 52, padding: '0 28px', fontSize: 13 }}>
                JOIN WAITLIST
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </button>
            </form>
          )}
        </Reveal>

        <Reveal delay={280}>
          <div style={{ marginTop: 24, fontSize: 12, color: 'var(--sf-fg-3)', fontWeight: 600 }}>
            First 10,000 get a ₦500 starter pot · No platform fees on payouts · 18+
          </div>
        </Reveal>

        <Reveal delay={340}>
          <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/apply" className="sf-btn sf-btn-paper" style={{ height: 44, padding: '0 22px', fontSize: 12 }}>APPLY TO BE CAST</Link>
            <Link href="/watch" className="sf-btn sf-btn-ghost" style={{ height: 44, padding: '0 22px', fontSize: 12 }}>
              SEE THE WATCH PREVIEW →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  const cols = [
    { title: 'PRODUCT', items: ['Cameras', 'How it works', 'Markets preview', 'Watch the demo'] },
    { title: 'JOIN',    items: ['Waitlist', 'Apply to be cast', 'Nominate someone', 'Partner with us'] },
    { title: 'LEARN',   items: ['FAQ', 'Whitepaper', 'How payouts work', 'Responsible play'] },
    { title: 'COMPANY', items: ['About', 'Press kit', 'Careers', 'Contact'] },
  ];
  return (
    <footer style={{
      background: 'var(--sf-stage-2)',
      padding: 'clamp(40px, 5vw, 80px) clamp(14px, 4vw, 64px) clamp(24px, 3vw, 40px)',
      borderTop: '1px solid var(--sf-line)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 48,
          marginBottom: 64,
        }}>
          <div style={{ minWidth: 240 }}>
            <SFWordmark size={28} />
            <p style={{ fontSize: 14, color: 'var(--sf-fg-2)', lineHeight: 1.55, marginTop: 18, maxWidth: 320 }}>
              Africa&apos;s first reality show that pays its audience. One house, multi-camera coverage, real-money prediction markets,
              and zero platform cut on payouts. Built in Lagos for the room watching.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              {['X', 'IG', 'TT', 'YT'].map(s => (
                <button key={s} className="sf-btn-icon" style={{ width: 40, height: 40, fontSize: 11, fontWeight: 900 }}>{s}</button>
              ))}
            </div>
          </div>
          {cols.map(c => (
            <div key={c.title}>
              <div className="sf-eyebrow" style={{ color: '#fff', marginBottom: 18 }}>{c.title}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, padding: 0, margin: 0 }}>
                {c.items.map(it => (
                  <li key={it} style={{ fontSize: 13, color: 'var(--sf-fg-2)', cursor: 'pointer' }}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          paddingTop: 28,
          borderTop: '1px solid var(--sf-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 12, color: 'var(--sf-fg-3)' }}>
            © {new Date().getFullYear()} Starfactor TV · Lagos, Nigeria · A Chainfren product · All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Responsible play', 'Cookies'].map(s => (
              <span key={s} style={{ fontSize: 12, color: 'var(--sf-fg-3)', cursor: 'pointer' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
const HomePage: React.FC = () => {
  const day = useDaylight({ mode: 'auto' });
  return (
    <div
      className="sf-watch-root sf-daylight-root"
      style={{
        minHeight: '100vh',
        background: 'var(--sf-stage)',
        ['--sf-coral' as string]: day.accent,
        ['--sf-coral-deep' as string]: day.accentSoft,
        ['--sf-paper' as string]: day.paper,
        ['--sf-paper-warm' as string]: day.paper2,
      } as React.CSSProperties}
    >
      <Nav />
      <Hero />
      <Ticker />
      <Receipts />
      <Channels />
      <HowItWorks />
      <MarketsPreview />
      <BuiltFor />
      <Casting />
      <Mechanics />
      <Timeline />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default HomePage;

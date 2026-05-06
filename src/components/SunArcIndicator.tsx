'use client';

import React from 'react';
import type { DaylightState } from '@/lib/daylight';

interface Props {
  state: DaylightState;
  /** flip contrast when sitting on a dark surface */
  dark?: boolean;
  /** compact: drops the caption text, keeps only the arc */
  compact?: boolean;
}

/**
 * Cockpit-style strip showing Lagos time-of-day:
 *   - Half-circle horizon arc
 *   - Sun (day) or moon (night) dot tracking the arc
 *   - Phase label + mood + Lagos clock
 *
 * Sits naturally beside DAY 47 in the magazine HotStrip.
 */
const SunArcIndicator: React.FC<Props> = ({ state, dark = false, compact = false }) => {
  const fg          = dark ? '#fff' : 'var(--sf-stage)';
  const muted       = dark ? 'rgba(255,255,255,0.55)' : 'rgba(10,8,20,0.5)';
  const trackColor  = dark ? 'rgba(255,255,255,0.16)' : 'rgba(10,8,20,0.18)';

  const showSun = state.sunX >= 0;
  const t = showSun ? state.sunX : Math.max(0, Math.min(1, state.moonX));

  // Arc geometry — half-circle 64×32
  const W = 64, H = 32, R = 28, CX = 32, CY = 30;
  const angle = Math.PI * (1 - t);
  const px = CX + R * Math.cos(angle);
  const py = CY - R * Math.sin(angle);

  const hh = Math.floor(state.hours);
  const mm = Math.floor((state.hours - hh) * 60);
  const clock = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: compact ? '6px 8px' : '6px 14px 6px 8px',
        borderRadius: 999,
        background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(10,8,20,0.05)',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(10,8,20,0.1)'}`,
        color: fg,
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
      }}
      aria-label={`Lagos ${clock} · ${state.label}`}
    >
      <svg
        width={W} height={H + 4}
        viewBox={`0 0 ${W} ${H + 4}`}
        style={{ display: 'block', flexShrink: 0 }}
      >
        <line x1="2" y1={CY} x2={W - 2} y2={CY} stroke={trackColor} strokeWidth="1" strokeDasharray="2 3" />
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none" stroke={trackColor} strokeWidth="1"
        />
        <circle cx={px} cy={py} r="9" fill={state.accent} opacity="0.18" />
        {showSun ? (
          <circle cx={px} cy={py} r="4.5" fill={state.accent} stroke="#fff" strokeWidth="0.5" />
        ) : (
          <g>
            <circle cx={px} cy={py} r="4.5" fill={state.accent} />
            <circle cx={px + 2} cy={py - 0.5} r="3.6" fill={dark ? '#0A0814' : 'var(--sf-paper)'} />
          </g>
        )}
      </svg>

      {!compact && (
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: fg, letterSpacing: '0.04em',
          lineHeight: 1,
        }}>
          {clock}
        </span>
      )}
    </div>
  );
};

export default SunArcIndicator;

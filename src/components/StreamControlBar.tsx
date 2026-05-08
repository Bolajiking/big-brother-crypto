'use client';

import React from 'react';
import type { LivepeerPlayerState } from './LivepeerPlayer';

type StreamControlBarProps = {
  state: LivepeerPlayerState;
  variant?: 'desktop' | 'mobile';
  cameraCount?: number;
  isPinned?: boolean;
  onTogglePlay: () => void;
  onToggleMuted: () => void;
  onVolumeChange: (volume: number) => void;
  onSyncLive: () => void;
  onTogglePictureInPicture: () => void;
  onFullscreen: () => void;
  onTogglePin?: () => void;
  onClip?: () => void;
  onShare?: () => void;
  onWatchAll?: () => void;
  onFocus?: () => void;
};

const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const IconPause = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
  </svg>
);

const IconVolume = ({ muted }: { muted: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    {muted ? (
      <path d="M22 9l-6 6M16 9l6 6" />
    ) : (
      <path d="M15 9.5c1 .7 1.5 1.5 1.5 2.5S16 13.8 15 14.5M18 7c1.8 1.3 3 3 3 5s-1.2 3.7-3 5" />
    )}
  </svg>
);

const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 17v5M5 11h14l-2-7H7zM12 11v6" />
  </svg>
);

const IconScissors = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
  </svg>
);

const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
  </svg>
);

const IconPictureInPicture = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <rect x="12" y="11" width="6" height="4" rx="1" fill="currentColor" stroke="none" />
  </svg>
);

const IconFullscreen = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
  </svg>
);

const ControlButton = ({
  title,
  children,
  active,
  disabled,
  onClick,
}: {
  title: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <button
    title={title}
    aria-label={title}
    disabled={disabled}
    onClick={onClick}
    className="sf-btn-icon sf-stream-control-button"
    style={{
      background: active ? 'var(--sf-coral)' : 'rgba(0,0,0,0.56)',
      borderColor: active ? 'rgba(255,78,43,0.7)' : 'rgba(255,255,255,0.12)',
      color: '#fff',
    }}
  >
    {children}
  </button>
);

const StreamControlBar: React.FC<StreamControlBarProps> = ({
  state,
  variant = 'desktop',
  cameraCount = 0,
  isPinned = false,
  onTogglePlay,
  onToggleMuted,
  onVolumeChange,
  onSyncLive,
  onTogglePictureInPicture,
  onFullscreen,
  onTogglePin,
  onClip,
  onShare,
  onWatchAll,
  onFocus,
}) => {
  const isMobile = variant === 'mobile';
  const disabledUntilFrame = !state.hasVideoFrame;

  return (
    <div
      className={`sf-stream-control-bar ${isMobile ? 'sf-stream-control-bar-mobile' : ''}`}
      aria-label="Stream controls"
    >
      <div className="sf-stream-control-group">
        <ControlButton
          title={state.isPaused ? 'Play stream' : 'Pause stream'}
          onClick={onTogglePlay}
          disabled={disabledUntilFrame}
        >
          {state.isPaused ? <IconPlay /> : <IconPause />}
        </ControlButton>
        <ControlButton
          title={state.isMuted ? 'Unmute audio' : 'Mute audio'}
          onClick={onToggleMuted}
          disabled={disabledUntilFrame}
        >
          <IconVolume muted={state.isMuted} />
        </ControlButton>
        {!isMobile && (
          <label className="sf-stream-volume" title="Volume">
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.isMuted ? 0 : state.volume}
              onChange={(event) => onVolumeChange(Number(event.currentTarget.value))}
              disabled={disabledUntilFrame}
            />
          </label>
        )}
        <button
          type="button"
          title="Jump to live"
          aria-label="Jump to live"
          onClick={onSyncLive}
          disabled={!state.isLive}
          className="sf-stream-live-pill"
        >
          <span className="sf-pulse" />
          LIVE
        </button>
      </div>

      {!isMobile && <span className="sf-stream-control-spacer" />}

      <div className="sf-stream-control-group">
        {!isMobile && onTogglePin && (
          <ControlButton title={isPinned ? 'Unpin this cam' : 'Pin this cam'} active={isPinned} onClick={onTogglePin}>
            <IconPin />
          </ControlButton>
        )}
        {!isMobile && onClip && (
          <ControlButton title="Clip last 30 seconds" onClick={onClip}>
            <IconScissors />
          </ControlButton>
        )}
        {!isMobile && onShare && (
          <ControlButton title="Share stream" onClick={onShare}>
            <IconShare />
          </ControlButton>
        )}
        {!isMobile && onWatchAll && (
          <button onClick={onWatchAll} title="Watch every room at once" className="sf-btn sf-btn-paper sf-stream-text-button">
            WATCH ALL ROOMS{cameraCount > 0 ? ` · ${cameraCount}` : ''}
          </button>
        )}
        {!isMobile && onFocus && (
          <button onClick={onFocus} title="Hide widgets, full focus" className="sf-btn sf-btn-stage sf-stream-text-button">
            FOCUS
          </button>
        )}
        <ControlButton
          title={state.isPictureInPicture ? 'Close picture in picture' : 'Picture in picture'}
          active={state.isPictureInPicture}
          disabled={disabledUntilFrame}
          onClick={onTogglePictureInPicture}
        >
          <IconPictureInPicture />
        </ControlButton>
        <ControlButton title="Fullscreen" disabled={disabledUntilFrame} onClick={onFullscreen}>
          <IconFullscreen />
        </ControlButton>
      </div>
    </div>
  );
};

export default StreamControlBar;

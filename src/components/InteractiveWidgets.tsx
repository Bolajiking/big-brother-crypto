'use client';

import React, { useState } from 'react';

interface InteractiveWidgetsProps {
  onRequireLogin?: () => void;
}

const InteractiveWidgets: React.FC<InteractiveWidgetsProps> = ({ onRequireLogin }) => {
  const [selectedContestant, setSelectedContestant] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [voted, setVoted] = useState(false);

  const handleVote = () => {
    if (onRequireLogin) {
      onRequireLogin();
      return;
    }
    if (selectedContestant || selectedEvent) {
      setVoted(true);
      setTimeout(() => setVoted(false), 3000);
    }
  };

  const leaderboardData = [
    { rank: 1, name: 'CryptoKing', points: 2847, badge: 'crown' },
    { rank: 2, name: 'BitcoinBoss', points: 2156, badge: 'medal' },
    { rank: 3, name: 'EthMaster', points: 1923, badge: 'medal' },
    { rank: 4, name: 'BaseBro', points: 1654, badge: null },
  ];

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 2: return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
      case 3: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-sf-bg-tertiary text-sf-text-secondary border-sf-glass-border';
    }
  };

  return (
    <div className="h-full bg-sf-bg-secondary flex flex-col">
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">
        {/* Live Polls Section */}
        <div className="glass-card p-4">
          <h2 className="text-white text-base font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-sf-status-live rounded-full animate-pulse"></span>
            Live Polls
          </h2>

          {/* Contestant Poll */}
          <div className="mb-5">
            <h3 className="text-sf-accent-primary font-medium mb-3 text-sm">Who&apos;s your favorite contestant?</h3>
            <div className="space-y-2">
              {[
                { id: 'amara', label: 'Amara', color: 'pink', percent: 45 },
                { id: 'kwame', label: 'Kwame', color: 'blue', percent: 32 },
                { id: 'zainab', label: 'Zainab', color: 'purple', percent: 23 },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                    selectedContestant === option.id
                      ? 'bg-sf-accent-primary/10 border border-sf-accent-primary/30'
                      : 'bg-sf-bg-tertiary hover:bg-sf-bg-hover border border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="contestant"
                    value={option.id}
                    checked={selectedContestant === option.id}
                    onChange={(e) => setSelectedContestant(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                    selectedContestant === option.id
                      ? 'border-sf-accent-primary bg-sf-accent-primary'
                      : 'border-sf-text-muted'
                  }`}>
                    {selectedContestant === option.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`text-${option.color}-400 font-medium text-sm flex-1`}>
                    {option.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-sf-bg-primary rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${option.color}-500 rounded-full transition-all`}
                        style={{ width: `${option.percent}%` }}
                      />
                    </div>
                    <span className="text-sf-text-muted text-xs w-8">{option.percent}%</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Event Poll */}
          <div className="mb-4">
            <h3 className="text-sf-accent-secondary font-medium mb-3 text-sm">Which event interests you most?</h3>
            <div className="space-y-2">
              {[
                { id: 'trading', label: 'Live Trading', color: 'green', percent: 38 },
                { id: 'analysis', label: 'Market Analysis', color: 'yellow', percent: 29 },
                { id: 'news', label: 'Breaking News', color: 'red', percent: 33 },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                    selectedEvent === option.id
                      ? 'bg-sf-accent-secondary/10 border border-sf-accent-secondary/30'
                      : 'bg-sf-bg-tertiary hover:bg-sf-bg-hover border border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="event"
                    value={option.id}
                    checked={selectedEvent === option.id}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                    selectedEvent === option.id
                      ? 'border-sf-accent-secondary bg-sf-accent-secondary'
                      : 'border-sf-text-muted'
                  }`}>
                    {selectedEvent === option.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`text-${option.color}-400 font-medium text-sm flex-1`}>
                    {option.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-sf-bg-primary rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${option.color}-500 rounded-full transition-all`}
                        style={{ width: `${option.percent}%` }}
                      />
                    </div>
                    <span className="text-sf-text-muted text-xs w-8">{option.percent}%</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleVote}
            disabled={!selectedContestant && !selectedEvent}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              voted
                ? 'bg-sf-status-success text-white'
                : (selectedContestant || selectedEvent)
                  ? 'btn-primary'
                  : 'bg-sf-bg-tertiary text-sf-text-muted cursor-not-allowed'
            }`}
          >
            {voted ? 'Vote Submitted!' : 'Submit Vote'}
          </button>
        </div>

        {/* Leaderboards */}
        <div className="glass-card p-4">
          <h2 className="text-white text-base font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z" clipRule="evenodd" />
            </svg>
            Leaderboard
          </h2>
          <div className="space-y-2">
            {leaderboardData.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02] ${getRankStyle(user.rank)}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    user.rank === 1 ? 'bg-yellow-500 text-black' :
                    user.rank === 2 ? 'bg-gray-400 text-black' :
                    user.rank === 3 ? 'bg-orange-500 text-black' :
                    'bg-sf-bg-elevated text-sf-text-secondary'
                  }`}>
                    {user.rank}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <span className="text-sm font-semibold">{user.points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="glass-card p-4">
          <h2 className="text-white text-base font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-sf-status-success rounded-full"></div>
            System Status
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-sf-bg-tertiary rounded-xl p-3">
              <div className="text-sf-text-muted text-xs mb-1">Cameras</div>
              <div className="text-sf-status-success font-semibold">8/8 Online</div>
            </div>
            <div className="bg-sf-bg-tertiary rounded-xl p-3">
              <div className="text-sf-text-muted text-xs mb-1">Quality</div>
              <div className="text-sf-status-success font-semibold">HD</div>
            </div>
            <div className="bg-sf-bg-tertiary rounded-xl p-3">
              <div className="text-sf-text-muted text-xs mb-1">Viewers</div>
              <div className="text-white font-semibold">247</div>
            </div>
            <div className="bg-sf-bg-tertiary rounded-xl p-3">
              <div className="text-sf-text-muted text-xs mb-1">Uptime</div>
              <div className="text-white font-semibold">99.9%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links Footer */}
      <div className="border-t border-sf-glass-border p-4 bg-sf-bg-tertiary/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          {[
            { href: 'https://twitter.com', icon: 'X', hoverColor: 'hover:text-blue-400 hover:bg-blue-400/10' },
            { href: 'https://discord.com', icon: 'D', hoverColor: 'hover:text-indigo-400 hover:bg-indigo-400/10' },
            { href: 'https://youtube.com', icon: 'Y', hoverColor: 'hover:text-red-400 hover:bg-red-400/10' },
            { href: 'https://twitch.tv', icon: 'T', hoverColor: 'hover:text-purple-400 hover:bg-purple-400/10' },
            { href: 'https://tiktok.com', icon: 'TT', hoverColor: 'hover:text-pink-400 hover:bg-pink-400/10' },
          ].map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sf-text-tertiary transition-all text-xs font-bold ${social.hoverColor}`}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveWidgets;

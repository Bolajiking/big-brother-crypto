'use client';

import React, { useState } from 'react';
import { PredictionMarket, UserBet } from '@/types/prediction';

interface PredictionMarketsProps {
  markets: PredictionMarket[];
  userBets: UserBet[];
  onPlaceBet: (marketId: string, optionId: string, amount: number) => void;
  onRequireLogin?: () => void;
  isAuthenticated?: boolean;
  userBalance?: number;
}

const PredictionMarkets: React.FC<PredictionMarketsProps> = ({
  markets,
  userBets,
  onPlaceBet,
  onRequireLogin,
  isAuthenticated = false,
  userBalance = 0,
}) => {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [filter, setFilter] = useState<'trending' | 'new' | 'ending'>('trending');

  const getCategoryColor = (category: PredictionMarket['category']) => {
    switch (category) {
      case 'contestant': return 'text-pink-400 bg-pink-400/10 border-pink-400/30';
      case 'event': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'challenge': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'drama': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handlePlaceBet = (marketId: string) => {
    if (!isAuthenticated && onRequireLogin) {
      onRequireLogin();
      return;
    }

    if (selectedOption && betAmount > 0) {
      onPlaceBet(marketId, selectedOption, betAmount);
      setSelectedMarket(null);
      setSelectedOption(null);
      setBetAmount(10);
    }
  };

  const filteredMarkets = [...markets].sort((a, b) => {
    switch (filter) {
      case 'trending':
        return b.totalPool - a.totalPool;
      case 'new':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'ending':
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      default:
        return 0;
    }
  });

  const activeMarkets = filteredMarkets.filter(m => m.status === 'active');

  return (
    <div className="h-full flex flex-col">
      {/* Header with filters */}
      <div className="flex items-center gap-2 mb-4">
        {(['trending', 'new', 'ending'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-sf-accent-primary/20 text-sf-accent-primary ring-1 ring-sf-accent-primary/30'
                : 'bg-sf-bg-tertiary text-sf-text-tertiary hover:text-white'
            }`}
          >
            {f === 'trending' && '🔥'} {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Markets List */}
      <div className="flex-1 space-y-3 overflow-y-auto hide-scrollbar">
        {activeMarkets.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-sf-bg-tertiary rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-sf-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sf-text-secondary text-sm mb-2">No active markets</p>
            <p className="text-sf-text-muted text-xs">Create one in chat with /predict</p>
          </div>
        ) : (
          activeMarkets.map((market) => {
            const isExpanded = selectedMarket === market.id;
            const userBet = userBets.find(b => b.marketId === market.id);

            return (
              <div
                key={market.id}
                className={`glass-card p-3 transition-all cursor-pointer ${
                  isExpanded ? 'ring-1 ring-sf-accent-primary/50' : 'hover:bg-sf-glass-bg-hover'
                }`}
                onClick={() => setSelectedMarket(isExpanded ? null : market.id)}
              >
                {/* Market Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(market.category)}`}>
                        {market.category}
                      </span>
                      <span className="text-xs text-sf-text-muted">
                        by {market.creatorUsername}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white leading-tight line-clamp-2">
                      {market.question}
                    </p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sf-accent-secondary font-semibold">
                      {market.totalPool.toLocaleString()} Stakes
                    </span>
                    <span className="text-sf-text-muted">
                      {market.options.reduce((acc, o) => acc + o.totalBets, 0)} bets
                    </span>
                  </div>
                  <span className={`font-medium ${
                    getTimeRemaining(market.expiresAt) === 'Ended'
                      ? 'text-sf-status-error'
                      : 'text-sf-text-secondary'
                  }`}>
                    {getTimeRemaining(market.expiresAt)}
                  </span>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {market.options.map((option) => {
                    const isSelected = selectedOption === option.id && isExpanded;
                    const hasUserBet = userBet?.optionId === option.id;

                    return (
                      <div
                        key={option.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isExpanded) {
                            setSelectedOption(isSelected ? null : option.id);
                          }
                        }}
                        className={`relative overflow-hidden rounded-xl transition-all ${
                          isExpanded
                            ? isSelected
                              ? 'ring-2 ring-sf-accent-primary bg-sf-accent-primary/10'
                              : 'bg-sf-bg-tertiary hover:bg-sf-bg-hover cursor-pointer'
                            : 'bg-sf-bg-tertiary'
                        }`}
                      >
                        {/* Progress bar background */}
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-sf-accent-primary/20 to-sf-accent-secondary/10 transition-all"
                          style={{ width: `${option.percentage}%` }}
                        />

                        <div className="relative flex items-center justify-between p-2.5">
                          <div className="flex items-center gap-2">
                            {hasUserBet && (
                              <div className="w-5 h-5 rounded-full bg-sf-status-success flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                            <span className="text-sm font-medium text-white">{option.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-sf-text-muted">
                              {option.odds.toFixed(2)}x
                            </span>
                            <span className="text-sm font-semibold text-sf-accent-primary">
                              {option.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Betting UI (expanded) */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-sf-glass-border animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    {userBet ? (
                      <div className="bg-sf-status-success/10 rounded-xl p-3 border border-sf-status-success/30">
                        <div className="flex items-center gap-2 text-sf-status-success text-sm font-medium mb-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          You placed a bet!
                        </div>
                        <p className="text-xs text-sf-text-secondary">
                          {userBet.amount} Stakes on &quot;{market.options.find(o => o.id === userBet.optionId)?.label}&quot;
                        </p>
                        <p className="text-xs text-sf-accent-secondary mt-1">
                          Potential winnings: {userBet.potentialWinnings.toFixed(0)} Stakes
                        </p>
                      </div>
                    ) : selectedOption ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-sf-text-secondary">Bet amount:</span>
                          <div className="flex-1 flex items-center gap-2">
                            {[10, 25, 50, 100].map((amount) => (
                              <button
                                key={amount}
                                onClick={() => setBetAmount(amount)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  betAmount === amount
                                    ? 'bg-sf-accent-primary text-white'
                                    : 'bg-sf-bg-tertiary text-sf-text-tertiary hover:text-white'
                                }`}
                              >
                                {amount}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-sf-text-muted">Your balance:</span>
                          <span className="text-sf-accent-secondary font-medium">{userBalance} Stakes</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-sf-text-muted">Potential winnings:</span>
                          <span className="text-sf-status-success font-medium">
                            {(betAmount * (market.options.find(o => o.id === selectedOption)?.odds || 1)).toFixed(0)} Stakes
                          </span>
                        </div>

                        <button
                          onClick={() => handlePlaceBet(market.id)}
                          disabled={betAmount > userBalance}
                          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            betAmount > userBalance
                              ? 'bg-sf-bg-tertiary text-sf-text-muted cursor-not-allowed'
                              : 'btn-primary'
                          }`}
                        >
                          {betAmount > userBalance ? 'Insufficient Balance' : `Place Bet (${betAmount} Stakes)`}
                        </button>
                      </div>
                    ) : (
                      <p className="text-center text-sf-text-muted text-xs">
                        Select an option above to place your bet
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Market CTA */}
      <div className="mt-4 pt-4 border-t border-sf-glass-border">
        <div className="glass-card p-3 bg-gradient-to-r from-sf-accent-primary/5 to-sf-accent-secondary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Create a Market</p>
              <p className="text-xs text-sf-text-muted">Type <code className="text-sf-accent-primary">/predict</code> in chat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionMarkets;

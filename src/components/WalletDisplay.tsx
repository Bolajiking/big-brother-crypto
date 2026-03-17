'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { PAYMENT_TIERS } from '@/types';

interface Transaction {
  id: string;
  type: string;
  cloutAmount: number;
  stakesAmount: number;
  nairaAmount: number | null;
  description: string | null;
  createdAt: string;
}

interface WalletData {
  balance: { clout: number; stakes: number };
  tier: string;
  canClaimDaily: boolean;
  transactions: Transaction[];
  stats: {
    totalWatchTime: number;
    totalMessages: number;
  };
}

interface WalletDisplayProps {
  userId: string;
}

const WalletDisplay: React.FC<WalletDisplayProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'history'>('overview');
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { balance, updateBalance } = useUserStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/wallet?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
          setWalletData(data.data);
          updateBalance(data.data.balance);
        }
      } catch (err) {
        console.error('Failed to fetch wallet data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && userId) {
      fetchData();
    }
  }, [isOpen, userId, updateBalance]);

  const handleClaimDaily = async () => {
    setIsClaiming(true);
    setMessage(null);

    try {
      const response = await fetch('/api/wallet/claim-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: '+50 Clout claimed!' });
        updateBalance(data.data.newBalance);
        setWalletData(prev => prev ? {
          ...prev,
          balance: data.data.newBalance,
          canClaimDaily: false,
        } : null);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to claim bonus' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setIsClaiming(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeposit = async (amountInNaira: number) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amountInNaira }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.data.authorizationUrl;
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to start payment' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DAILY_LOGIN': return { icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707', color: 'text-yellow-400' };
      case 'WATCH_TIME': return { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-blue-400' };
      case 'CHAT_BONUS': return { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'text-green-400' };
      case 'REFERRAL': return { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-purple-400' };
      case 'DEPOSIT': return { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'text-sf-status-success' };
      case 'WITHDRAWAL': return { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'text-orange-400' };
      case 'BET': return { icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-sf-accent-secondary' };
      case 'WIN': return { icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', color: 'text-yellow-400' };
      case 'VOTE': return { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', color: 'text-sf-accent-primary' };
      default: return { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-sf-text-tertiary' };
    }
  };

  const getTierStyle = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' };
      case 'GOLD': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' };
      case 'SILVER': return { bg: 'bg-gray-400/10', text: 'text-gray-300', border: 'border-gray-400/30' };
      case 'BRONZE': return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' };
      default: return { bg: 'bg-sf-bg-tertiary', text: 'text-sf-text-secondary', border: 'border-sf-glass-border' };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Wallet Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-sf-bg-tertiary hover:bg-sf-bg-hover px-4 py-2 rounded-full transition-all border-2 border-sf-glass-border hover:border-sf-glass-border-hover"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-sf-accent-primary/20 flex items-center justify-center">
            <span className="text-sf-accent-primary text-xs font-bold">C</span>
          </div>
          <span className="text-sf-accent-primary text-sm font-semibold">{balance.clout.toLocaleString()}</span>
        </div>
        <div className="w-px h-4 bg-sf-glass-border"></div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-sf-status-success/20 flex items-center justify-center">
            <span className="text-sf-status-success text-xs font-bold">S</span>
          </div>
          <span className="text-sf-status-success text-sm font-semibold">{balance.stakes.toLocaleString()}</span>
        </div>
        <svg className={`w-4 h-4 text-sf-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-sf-bg-secondary border-2 border-sf-glass-border rounded-3xl overflow-hidden z-50 animate-scale-in shadow-sf-xl">
          {/* Header Tabs */}
          <div className="flex bg-sf-bg-tertiary/50">
            {[
              { id: 'overview', label: 'Overview', color: 'sf-accent-primary' },
              { id: 'deposit', label: 'Add Funds', color: 'sf-status-success' },
              { id: 'history', label: 'History', color: 'sf-accent-secondary' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-sf-text-tertiary hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}`} />
                )}
              </button>
            ))}
          </div>

          {/* Message Banner */}
          {message && (
            <div
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-sf-status-success/20 text-sf-status-success'
                  : 'bg-sf-status-error/20 text-sf-status-error'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {message.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              {message.text}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-2 border-sf-accent-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Content */}
          {!isLoading && (
            <div className="p-4">
              {/* Overview Tab */}
              {activeTab === 'overview' && walletData && (
                <div className="space-y-4">
                  {/* Balance Display */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-sf-bg-tertiary rounded-2xl p-3 border-2 border-sf-accent-primary/20">
                      <div className="text-sf-text-muted text-[0.625rem] font-bold uppercase tracking-[0.15em] mb-1 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-sf-accent-primary"></div>
                        Clout (Free)
                      </div>
                      <div className="text-sf-accent-primary text-xl font-black">
                        {walletData.balance.clout.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-sf-bg-tertiary rounded-2xl p-3 border-2 border-sf-status-success/20">
                      <div className="text-sf-text-muted text-[0.625rem] font-bold uppercase tracking-[0.15em] mb-1 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-sf-status-success"></div>
                        Stakes (Paid)
                      </div>
                      <div className="text-sf-status-success text-xl font-black">
                        {walletData.balance.stakes.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* User Tier */}
                  {(() => {
                    const tierStyle = getTierStyle(walletData.tier);
                    return (
                      <div className={`rounded-2xl p-3 flex items-center justify-between border-2 ${tierStyle.bg} ${tierStyle.border}`}>
                        <div>
                          <div className="text-sf-text-muted text-xs">Your Tier</div>
                          <div className={`font-bold ${tierStyle.text}`}>
                            {walletData.tier}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sf-text-muted text-xs">Vote Power</div>
                          <div className="text-white font-bold">
                            {walletData.tier === 'FREE' ? '1x' :
                             walletData.tier === 'BRONZE' ? '1.5x' :
                             walletData.tier === 'SILVER' ? '2x' :
                             walletData.tier === 'GOLD' ? '2.5x' : '3x'}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Daily Bonus Button */}
                  <button
                    onClick={handleClaimDaily}
                    disabled={!walletData.canClaimDaily || isClaiming}
                    className={`w-full py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 ${
                      walletData.canClaimDaily
                        ? 'btn-primary'
                        : 'bg-sf-bg-tertiary text-sf-text-muted cursor-not-allowed border-2 border-sf-glass-border'
                    }`}
                  >
                    {isClaiming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Claiming...
                      </>
                    ) : walletData.canClaimDaily ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        Claim Daily Bonus (+50 Clout)
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Daily Bonus Claimed
                      </>
                    )}
                  </button>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-sf-text-muted bg-sf-bg-tertiary rounded-xl p-3">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Watch: {Math.floor(walletData.stats.totalWatchTime / 60)}h
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Messages: {walletData.stats.totalMessages}
                    </span>
                  </div>
                </div>
              )}

              {/* Deposit Tab */}
              {activeTab === 'deposit' && (
                <div className="space-y-3">
                  <div className="text-sf-text-secondary text-sm mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-sf-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Buy Stakes with Naira
                  </div>

                  {PAYMENT_TIERS.map((tier) => (
                    <button
                      key={tier.amount}
                      onClick={() => handleDeposit(tier.amount)}
                      className="w-full bg-sf-bg-tertiary hover:bg-sf-bg-hover rounded-2xl p-4 flex items-center justify-between transition-all border-2 border-sf-glass-border hover:border-sf-status-success/30 group"
                    >
                      <div className="text-left">
                        <div className="text-white font-semibold group-hover:text-sf-status-success transition-colors">
                          N{tier.amount.toLocaleString()}
                        </div>
                        {tier.bonus > 0 && (
                          <div className="text-sf-status-success text-xs font-medium">
                            +{tier.bonus}% bonus
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sf-status-success font-bold">
                          {tier.total} Stakes
                        </div>
                        {tier.bonus > 0 && (
                          <div className="text-sf-text-muted text-xs line-through">
                            {tier.stakes} Stakes
                          </div>
                        )}
                      </div>
                    </button>
                  ))}

                  <div className="text-sf-text-muted text-xs text-center mt-3 flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure payment via Paystack
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && walletData && (
                <div className="space-y-2 max-h-64 overflow-y-auto hide-scrollbar">
                  {walletData.transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-sf-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="text-sf-text-muted text-sm">No transactions yet</div>
                    </div>
                  ) : (
                    walletData.transactions.map((tx) => {
                      const txIcon = getTransactionIcon(tx.type);
                      return (
                        <div
                          key={tx.id}
                          className="bg-sf-bg-tertiary rounded-xl p-3 flex items-center gap-3 hover:bg-sf-bg-hover transition-colors"
                        >
                          <div className={`w-9 h-9 rounded-lg bg-sf-bg-elevated flex items-center justify-center ${txIcon.color}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={txIcon.icon} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">
                              {tx.description || tx.type.replace(/_/g, ' ')}
                            </div>
                            <div className="text-sf-text-muted text-xs">
                              {formatDate(tx.createdAt)}
                            </div>
                          </div>
                          <div className="text-right">
                            {tx.cloutAmount !== 0 && (
                              <div className={`text-sm font-medium ${tx.cloutAmount > 0 ? 'text-sf-accent-primary' : 'text-sf-status-error'}`}>
                                {tx.cloutAmount > 0 ? '+' : ''}{tx.cloutAmount} C
                              </div>
                            )}
                            {tx.stakesAmount !== 0 && (
                              <div className={`text-sm font-medium ${tx.stakesAmount > 0 ? 'text-sf-status-success' : 'text-sf-status-error'}`}>
                                {tx.stakesAmount > 0 ? '+' : ''}{tx.stakesAmount} S
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletDisplay;

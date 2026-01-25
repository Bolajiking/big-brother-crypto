'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MarketCreationData } from '@/types/prediction';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'text' | 'emoji' | 'sfx' | 'tts' | 'market';
  emoji?: string;
  sfxName?: string;
  marketData?: {
    question: string;
    options: string[];
  };
}

interface ChatProps {
  onRequireLogin?: () => void;
  isAuthenticated?: boolean;
  onCreateMarket?: (data: MarketCreationData) => void;
}

const Chat: React.FC<ChatProps> = ({ onRequireLogin, isAuthenticated = true, onCreateMarket }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [, setIsConnected] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSFXMenu, setShowSFXMenu] = useState(false);
  const [showTTSMenu, setShowTTSMenu] = useState(false);
  const [showPredictModal, setShowPredictModal] = useState(false);
  const [predictQuestion, setPredictQuestion] = useState('');
  const [predictOptions, setPredictOptions] = useState(['', '']);
  const [predictCategory, setPredictCategory] = useState<'contestant' | 'event' | 'challenge' | 'drama' | 'other'>('event');
  const [predictDuration, setPredictDuration] = useState(24);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setMessages([
        {
          id: '1',
          username: 'CryptoKing',
          message: 'Amara is definitely winning this week!',
          timestamp: new Date(Date.now() - 360000).toISOString(),
          type: 'text'
        },
        {
          id: '2',
          username: 'BitcoinBoss',
          message: 'No way, Kwame has this in the bag',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          type: 'text'
        },
        {
          id: '3',
          username: 'EthMaster',
          message: 'You guys want to bet on it? Let me create a market...',
          timestamp: new Date(Date.now() - 240000).toISOString(),
          type: 'text'
        },
        {
          id: '4',
          username: 'EthMaster',
          message: '/predict',
          timestamp: new Date(Date.now() - 230000).toISOString(),
          type: 'text'
        },
        {
          id: '5',
          username: 'EthMaster',
          message: 'Created prediction: "Who will win the Head of House competition?"',
          timestamp: new Date(Date.now() - 180000).toISOString(),
          type: 'market',
          marketData: {
            question: 'Who will win the Head of House competition?',
            options: ['Amara', 'Kwame', 'Zainab', 'Tunde'],
          },
        },
        {
          id: '6',
          username: 'CryptoKing',
          message: 'Nice! Just placed 50 Stakes on Amara',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          type: 'text'
        },
        {
          id: '7',
          username: 'BitcoinBoss',
          message: '100 on Kwame, easy money',
          timestamp: new Date(Date.now() - 90000).toISOString(),
          type: 'text'
        },
        {
          id: '8',
          username: 'DiamondHands',
          message: 'The odds are looking good on Zainab right now',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          type: 'text'
        },
        {
          id: '9',
          username: 'BaseBro',
          message: 'This is why I love this app!',
          timestamp: new Date(Date.now() - 30000).toISOString(),
          type: 'emoji',
          emoji: '🔥'
        },
      ]);
      setIsConnected(true);
    }
  }, [isMounted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!isAuthenticated && onRequireLogin) {
      onRequireLogin();
      return;
    }

    // Check for /predict command
    if (newMessage.trim().toLowerCase().startsWith('/predict')) {
      setShowPredictModal(true);
      setNewMessage('');
      return;
    }

    const message: ChatMessage = {
      id: `msg_${messages.length + 1}`,
      username: 'You',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setShowEmojiPicker(false);
    setShowSFXMenu(false);
    setShowTTSMenu(false);
  };

  const handleAddPredictOption = () => {
    if (predictOptions.length < 4) {
      setPredictOptions([...predictOptions, '']);
    }
  };

  const handleRemovePredictOption = (index: number) => {
    if (predictOptions.length > 2) {
      setPredictOptions(predictOptions.filter((_, i) => i !== index));
    }
  };

  const handlePredictOptionChange = (index: number, value: string) => {
    const newOptions = [...predictOptions];
    newOptions[index] = value;
    setPredictOptions(newOptions);
  };

  const handleCreateMarket = () => {
    if (!predictQuestion.trim() || predictOptions.filter(o => o.trim()).length < 2) return;

    const marketData: MarketCreationData = {
      question: predictQuestion.trim(),
      options: predictOptions.filter(o => o.trim()),
      duration: predictDuration,
      category: predictCategory,
    };

    if (onCreateMarket) {
      onCreateMarket(marketData);
    }

    // Add market creation message to chat
    const message: ChatMessage = {
      id: `msg_${messages.length + 1}`,
      username: 'You',
      message: `Created prediction: "${predictQuestion.trim()}"`,
      timestamp: new Date().toISOString(),
      type: 'market',
      marketData: {
        question: predictQuestion.trim(),
        options: predictOptions.filter(o => o.trim()),
      },
    };

    setMessages(prev => [...prev, message]);

    // Reset modal state
    setShowPredictModal(false);
    setPredictQuestion('');
    setPredictOptions(['', '']);
    setPredictCategory('event');
    setPredictDuration(24);
  };

  const handleEmojiClick = (emoji: string) => {
    if (!isAuthenticated && onRequireLogin) {
      onRequireLogin();
      return;
    }

    const message: ChatMessage = {
      id: `msg_${messages.length + 1}`,
      username: 'You',
      message: emoji,
      timestamp: new Date().toISOString(),
      type: 'emoji',
      emoji: emoji
    };

    setMessages(prev => [...prev, message]);
    setShowEmojiPicker(false);
  };

  const handleSFXClick = (sfxName: string) => {
    if (!isAuthenticated && onRequireLogin) {
      onRequireLogin();
      return;
    }

    const message: ChatMessage = {
      id: `msg_${messages.length + 1}`,
      username: 'You',
      message: `${sfxName}`,
      timestamp: new Date().toISOString(),
      type: 'sfx',
      sfxName: sfxName
    };

    setMessages(prev => [...prev, message]);
    setShowSFXMenu(false);
  };

  const handleTTSClick = () => {
    if (!newMessage.trim()) return;

    if (!isAuthenticated && onRequireLogin) {
      onRequireLogin();
      return;
    }

    const message: ChatMessage = {
      id: `msg_${messages.length + 1}`,
      username: 'You',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'tts'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setShowTTSMenu(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const emojis = ['😀', '😂', '😍', '🤔', '😎', '🔥', '💯', '👍', '👎', '❤️', '🎉', '🚀', '💎', '🎯', '⚡', '🌟'];
  const sfxOptions = ['Applause', 'Laugh', 'Cheer', 'Boo', 'Drumroll', 'Bell', 'Chime', 'Pop'];

  const getUsernameColor = (username: string) => {
    const colors = [
      '#6366f1', '#a855f7', '#ec4899', '#ef4444',
      '#f97316', '#eab308', '#22c55e', '#06b6d4',
      '#3b82f6', '#8b5cf6', '#d946ef', '#14b8a6'
    ];

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      const char = username.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    hash = Math.abs(hash) + username.length * 7;

    return colors[hash % colors.length];
  };

  const renderMessage = (msg: ChatMessage) => {
    const usernameColor = getUsernameColor(msg.username);

    return (
      <div key={msg.id} className="group px-4 py-2 hover:bg-sf-glass-bg transition-colors">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: usernameColor + '30', color: usernameColor }}
          >
            {msg.username.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-sm font-semibold"
                style={{ color: usernameColor }}
              >
                {msg.username}
              </span>
              <span className="text-xs text-sf-text-muted">
                {formatTime(msg.timestamp)}
              </span>
              {msg.type !== 'text' && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  msg.type === 'emoji' ? 'bg-yellow-500/10 text-yellow-400' :
                  msg.type === 'sfx' ? 'bg-purple-500/10 text-purple-400' :
                  msg.type === 'market' ? 'bg-green-500/10 text-green-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {msg.type === 'emoji' ? 'EMOJI' : msg.type === 'sfx' ? 'SFX' : msg.type === 'market' ? 'MARKET' : 'TTS'}
                </span>
              )}
            </div>
            {msg.type === 'market' && msg.marketData ? (
              <div className="mt-2 p-3 bg-gradient-to-r from-sf-accent-primary/10 to-sf-accent-secondary/10 rounded-xl border border-sf-accent-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-sf-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium text-white">New Prediction Market</span>
                </div>
                <p className="text-sm text-sf-text-secondary mb-2">{msg.marketData.question}</p>
                <div className="flex flex-wrap gap-1">
                  {msg.marketData.options.map((opt, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-sf-bg-tertiary rounded-lg text-sf-text-tertiary">
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`text-sm ${
                msg.type === 'emoji'
                  ? 'text-2xl'
                  : msg.type === 'sfx'
                  ? 'text-sf-accent-secondary italic'
                  : msg.type === 'tts'
                  ? 'text-sf-accent-primary italic'
                  : 'text-sf-text-secondary'
              }`}>
                {msg.type === 'emoji' ? msg.emoji : msg.type === 'sfx' ? `🔊 ${msg.message}` : msg.type === 'tts' ? `🎤 ${msg.message}` : msg.message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col h-full bg-sf-bg-secondary p-4" suppressHydrationWarning>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-sf-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sf-text-tertiary text-sm">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-sf-bg-secondary" suppressHydrationWarning>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar py-2">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-sf-glass-border flex-shrink-0">
        {/* Sign in prompt for unauthenticated users */}
        {!isAuthenticated && (
          <div className="mb-4 p-4 glass-card text-center">
            <p className="text-sf-text-secondary text-sm mb-3">Sign in to join the conversation</p>
            <button
              onClick={onRequireLogin}
              className="btn-primary px-5 py-2 rounded-xl text-sm font-medium"
            >
              Sign In to Chat
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => isAuthenticated ? setShowEmojiPicker(!showEmojiPicker) : onRequireLogin?.()}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isAuthenticated
                ? showEmojiPicker
                  ? 'bg-sf-accent-primary/20 text-sf-accent-primary'
                  : 'bg-sf-bg-tertiary hover:bg-sf-bg-hover text-sf-text-tertiary hover:text-white'
                : 'bg-sf-bg-tertiary/50 text-sf-text-muted cursor-not-allowed'
            }`}
            title="Emoji"
          >
            <span className="text-base">😀</span>
          </button>
          <button
            onClick={() => isAuthenticated ? setShowSFXMenu(!showSFXMenu) : onRequireLogin?.()}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isAuthenticated
                ? showSFXMenu
                  ? 'bg-sf-accent-secondary/20 text-sf-accent-secondary'
                  : 'bg-sf-bg-tertiary hover:bg-sf-bg-hover text-sf-text-tertiary hover:text-white'
                : 'bg-sf-bg-tertiary/50 text-sf-text-muted cursor-not-allowed'
            }`}
            title="Sound Effects"
          >
            <span className="text-base">🔊</span>
          </button>
          <button
            onClick={() => isAuthenticated ? setShowTTSMenu(!showTTSMenu) : onRequireLogin?.()}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isAuthenticated
                ? showTTSMenu
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-sf-bg-tertiary hover:bg-sf-bg-hover text-sf-text-tertiary hover:text-white'
                : 'bg-sf-bg-tertiary/50 text-sf-text-muted cursor-not-allowed'
            }`}
            title="Text to Speech"
          >
            <span className="text-base">🎤</span>
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && isAuthenticated && (
          <div className="mb-3 p-3 glass-card animate-scale-in">
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-sf-bg-hover rounded-lg transition-colors text-xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SFX Menu */}
        {showSFXMenu && isAuthenticated && (
          <div className="mb-3 p-3 glass-card animate-scale-in">
            <div className="grid grid-cols-2 gap-2">
              {sfxOptions.map((sfx, index) => (
                <button
                  key={index}
                  onClick={() => handleSFXClick(sfx)}
                  className="px-3 py-2 text-sm bg-sf-accent-secondary/10 hover:bg-sf-accent-secondary/20 border border-sf-accent-secondary/20 rounded-xl transition-all text-sf-accent-secondary font-medium"
                >
                  🔊 {sfx}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TTS Menu */}
        {showTTSMenu && isAuthenticated && (
          <div className="mb-3 p-3 glass-card animate-scale-in">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type message for TTS..."
                className="input-primary flex-1 py-2 text-sm"
              />
              <button
                onClick={handleTTSClick}
                disabled={!newMessage.trim()}
                className="btn-primary px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎤 Send
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => !isAuthenticated && onRequireLogin?.()}
            placeholder={isAuthenticated ? "Type /predict or a message..." : "Sign in to chat..."}
            className={`input-primary flex-1 py-3 ${!isAuthenticated ? 'cursor-pointer' : ''}`}
            readOnly={!isAuthenticated}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isAuthenticated}
            className="btn-primary px-5 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      {/* Prediction Market Creation Modal */}
      {showPredictModal && isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowPredictModal(false)}
          />
          <div className="relative glass-card p-6 max-w-md w-full mx-4 shadow-sf-xl animate-scale-in">
            <button
              onClick={() => setShowPredictModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-sf-bg-tertiary hover:bg-sf-bg-hover flex items-center justify-center text-sf-text-tertiary hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Create Prediction Market</h3>
                <p className="text-sf-text-muted text-sm">Let others bet on your prediction</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Question */}
              <div>
                <label className="text-sm font-medium text-sf-text-secondary mb-2 block">Question</label>
                <input
                  type="text"
                  value={predictQuestion}
                  onChange={(e) => setPredictQuestion(e.target.value)}
                  placeholder="Will Amara win the next challenge?"
                  className="input-primary w-full py-3"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-sf-text-secondary mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {(['contestant', 'event', 'challenge', 'drama', 'other'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setPredictCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                        predictCategory === cat
                          ? 'bg-sf-accent-primary text-white'
                          : 'bg-sf-bg-tertiary text-sf-text-tertiary hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-sf-text-secondary">Options</label>
                  {predictOptions.length < 4 && (
                    <button
                      onClick={handleAddPredictOption}
                      className="text-xs text-sf-accent-primary hover:text-sf-accent-primary/80 font-medium"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {predictOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handlePredictOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="input-primary flex-1 py-2 text-sm"
                      />
                      {predictOptions.length > 2 && (
                        <button
                          onClick={() => handleRemovePredictOption(index)}
                          className="w-8 h-8 rounded-lg bg-sf-status-error/10 hover:bg-sf-status-error/20 flex items-center justify-center text-sf-status-error transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-sf-text-secondary mb-2 block">Duration</label>
                <div className="flex gap-2">
                  {[1, 6, 12, 24, 48].map((hours) => (
                    <button
                      key={hours}
                      onClick={() => setPredictDuration(hours)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        predictDuration === hours
                          ? 'bg-sf-accent-primary text-white'
                          : 'bg-sf-bg-tertiary text-sf-text-tertiary hover:text-white'
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleCreateMarket}
                disabled={!predictQuestion.trim() || predictOptions.filter(o => o.trim()).length < 2}
                className="w-full btn-primary py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Create Market
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;

'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'text' | 'emoji' | 'sfx' | 'tts';
  emoji?: string;
  sfxName?: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSFXMenu, setShowSFXMenu] = useState(false);
  const [showTTSMenu, setShowTTSMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Simulate some initial messages
      setMessages([
        {
          id: '1',
          username: 'System',
          message: 'Welcome to BigBrotherCrypto chat!',
          timestamp: '2024-01-01T00:00:00.000Z',
          type: 'text'
        }
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

  const handleEmojiClick = (emoji: string) => {
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
    const message: ChatMessage = {
      id: `msg_${messages.length + 1}`,
      username: 'You',
      message: `🔊 ${sfxName}`,
      timestamp: new Date().toISOString(),
      type: 'sfx',
      sfxName: sfxName
    };

    setMessages(prev => [...prev, message]);
    setShowSFXMenu(false);
  };

  const handleTTSClick = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: `msg_${messages.length + 1}`,
      username: 'You',
      message: `🎤 ${newMessage.trim()}`,
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
      'text-red-400', 'text-blue-400', 'text-green-400', 'text-yellow-400',
      'text-purple-400', 'text-pink-400', 'text-indigo-400', 'text-cyan-400',
      'text-orange-400', 'text-teal-400', 'text-lime-400', 'text-rose-400'
    ];
    const hash = username.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const renderMessage = (msg: ChatMessage) => {
    const usernameColor = getUsernameColor(msg.username);
    
    return (
      <div key={msg.id} className="border-b border-gray-700 py-2 px-3 hover:bg-gray-750 transition-colors">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold ${usernameColor}`}>
              {msg.username}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(msg.timestamp)}
            </span>
          </div>
          {msg.type !== 'text' && (
            <div className="flex items-center space-x-1">
              {msg.type === 'emoji' && <span className="text-xs text-gray-400">😀</span>}
              {msg.type === 'sfx' && <span className="text-xs text-purple-400">🔊</span>}
              {msg.type === 'tts' && <span className="text-xs text-blue-400">🎤</span>}
            </div>
          )}
        </div>
        <div className={`text-xs ${
          msg.type === 'emoji' 
            ? 'text-2xl text-center py-2' 
            : msg.type === 'sfx'
            ? 'text-purple-300'
            : msg.type === 'tts'
            ? 'text-blue-300'
            : 'text-gray-200'
        }`}>
          {msg.type === 'emoji' ? (
            <div>{msg.emoji}</div>
          ) : (
            <div>{msg.message}</div>
          )}
        </div>
      </div>
    );
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col h-full bg-gray-800 p-4">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
          <p className="text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-200 text-lg font-bold">Live Chat</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0 bg-gray-900">
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Emoji"
          >
            <span className="text-lg">😀</span>
          </button>
          <button
            onClick={() => setShowSFXMenu(!showSFXMenu)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Sound Effects"
          >
            <span className="text-lg">🔊</span>
          </button>
          <button
            onClick={() => setShowTTSMenu(!showTTSMenu)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Text to Speech"
          >
            <span className="text-lg">🎤</span>
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-3 p-3 bg-gray-700 rounded-lg">
            <div className="grid grid-cols-8 gap-2">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="p-2 hover:bg-gray-600 rounded-lg transition-colors text-xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SFX Menu */}
        {showSFXMenu && (
          <div className="mb-3 p-3 bg-gray-700 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              {sfxOptions.map((sfx, index) => (
                <button
                  key={index}
                  onClick={() => handleSFXClick(sfx)}
                  className="p-2 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors text-white"
                >
                  🔊 {sfx}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TTS Menu */}
        {showTTSMenu && (
          <div className="mb-3 p-3 bg-gray-700 rounded-lg">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type message for TTS..."
                className="flex-1 bg-gray-600 text-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
              <button
                onClick={handleTTSClick}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm"
              >
                🎤 Send TTS
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

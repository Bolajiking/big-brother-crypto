'use client';

import React, { useState } from 'react';

const InteractiveWidgets: React.FC = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [voted, setVoted] = useState(false);

  const handleVote = () => {
    if (selectedCrypto || selectedEvent) {
      setVoted(true);
      setTimeout(() => setVoted(false), 3000);
    }
  };

  return (
    <div className="h-full bg-gray-700 rounded overflow-y-auto flex flex-col">
      <div className="flex-1 p-4 space-y-4">
        {/* Live Polls */}
        <div className="bg-gray-600 p-4 rounded-lg border border-gray-500">
          <h2 className="text-gray-200 text-lg font-bold mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Live Polls
          </h2>
          
          {/* Crypto Poll */}
          <div className="mb-6">
            <h3 className="text-blue-400 font-semibold mb-3 text-sm">What&apos;s your favorite crypto?</h3>
            <div className="space-y-2">
              <div className="flex items-center p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                <input 
                  type="radio" 
                  id="bitcoin" 
                  name="crypto" 
                  value="bitcoin"
                  checked={selectedCrypto === 'bitcoin'}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="mr-3 text-orange-500" 
                />
                <label htmlFor="bitcoin" className="text-gray-200 text-sm cursor-pointer flex-1">
                  <span className="text-orange-500 font-semibold">Bitcoin</span>
                  <span className="text-gray-400 ml-2">(45%)</span>
                </label>
              </div>
              <div className="flex items-center p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                <input 
                  type="radio" 
                  id="ethereum" 
                  name="crypto" 
                  value="ethereum"
                  checked={selectedCrypto === 'ethereum'}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="mr-3 text-blue-500" 
                />
                <label htmlFor="ethereum" className="text-gray-200 text-sm cursor-pointer flex-1">
                  <span className="text-blue-500 font-semibold">Ethereum</span>
                  <span className="text-gray-400 ml-2">(32%)</span>
                </label>
              </div>
              <div className="flex items-center p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                <input 
                  type="radio" 
                  id="base" 
                  name="crypto" 
                  value="base"
                  checked={selectedCrypto === 'base'}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="mr-3 text-purple-500" 
                />
                <label htmlFor="base" className="text-gray-200 text-sm cursor-pointer flex-1">
                  <span className="text-purple-500 font-semibold">Base</span>
                  <span className="text-gray-400 ml-2">(23%)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Event Poll */}
          <div className="mb-4">
            <h3 className="text-green-400 font-semibold mb-3 text-sm">Which event interests you most?</h3>
            <div className="space-y-2">
              <div className="flex items-center p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                <input 
                  type="radio" 
                  id="trading" 
                  name="event" 
                  value="trading"
                  checked={selectedEvent === 'trading'}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="mr-3 text-green-500" 
                />
                <label htmlFor="trading" className="text-gray-200 text-sm cursor-pointer flex-1">
                  <span className="text-green-500 font-semibold">Live Trading</span>
                  <span className="text-gray-400 ml-2">(38%)</span>
                </label>
              </div>
              <div className="flex items-center p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                <input 
                  type="radio" 
                  id="analysis" 
                  name="event" 
                  value="analysis"
                  checked={selectedEvent === 'analysis'}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="mr-3 text-yellow-500" 
                />
                <label htmlFor="analysis" className="text-gray-200 text-sm cursor-pointer flex-1">
                  <span className="text-yellow-500 font-semibold">Market Analysis</span>
                  <span className="text-gray-400 ml-2">(29%)</span>
                </label>
              </div>
              <div className="flex items-center p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                <input 
                  type="radio" 
                  id="news" 
                  name="event" 
                  value="news"
                  checked={selectedEvent === 'news'}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="mr-3 text-red-500" 
                />
                <label htmlFor="news" className="text-gray-200 text-sm cursor-pointer flex-1">
                  <span className="text-red-500 font-semibold">Breaking News</span>
                  <span className="text-gray-400 ml-2">(33%)</span>
                </label>
              </div>
            </div>
          </div>

          <button 
            onClick={handleVote}
            disabled={!selectedCrypto && !selectedEvent}
            className={`w-full font-bold py-2 px-4 rounded transition-all ${
              voted 
                ? 'bg-green-600 text-white' 
                : (selectedCrypto || selectedEvent)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-500 text-gray-400 cursor-not-allowed'
            }`}
          >
            {voted ? '✓ Vote Submitted!' : 'Submit Vote'}
          </button>
        </div>

        {/* Leaderboards */}
        <div className="bg-gray-600 p-3 rounded">
          <h2 className="text-gray-200 text-lg font-bold mb-2">Leaderboards</h2>
          <div className="space-y-1 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>1. CryptoKing</span>
              <span className="text-gray-400">2,847 pts</span>
            </div>
            <div className="flex justify-between">
              <span>2. BitcoinBoss</span>
              <span className="text-gray-400">2,156 pts</span>
            </div>
            <div className="flex justify-between">
              <span>3. EthMaster</span>
              <span className="text-gray-400">1,923 pts</span>
            </div>
            <div className="flex justify-between">
              <span>4. BaseBro</span>
              <span className="text-gray-400">1,654 pts</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-600 p-3 rounded">
          <h2 className="text-gray-200 text-lg font-bold mb-2">System Status</h2>
          <div className="space-y-1 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Cameras Online:</span>
              <span className="text-green-500">8/8</span>
            </div>
            <div className="flex justify-between">
              <span>Stream Quality:</span>
              <span className="text-green-500">HD</span>
            </div>
            <div className="flex justify-between">
              <span>Viewers:</span>
              <span className="text-gray-400">247</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="text-gray-400">99.9%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Social Links Footer */}
      <div className="border-t border-gray-600 p-3 bg-gray-800 mt-auto">
        <div className="flex items-center justify-center space-x-3">
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-blue-400 transition-colors text-lg"
            title="Twitter"
          >
            𝕏
          </a>
          
          <a 
            href="https://discord.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-indigo-400 transition-colors text-lg"
            title="Discord"
          >
            💬
          </a>
          
          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-red-400 transition-colors text-lg"
            title="YouTube"
          >
            📺
          </a>
          
          <a 
            href="https://twitch.tv" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-purple-400 transition-colors text-lg"
            title="Twitch"
          >
            🎮
          </a>
          
          <a 
            href="https://tiktok.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-pink-400 transition-colors text-lg"
            title="TikTok"
          >
            🎵
          </a>
        </div>
      </div>
    </div>
  );
};

export default InteractiveWidgets;

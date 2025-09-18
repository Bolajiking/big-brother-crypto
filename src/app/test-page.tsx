'use client';

import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-600 p-4">
        <h1 className="text-2xl font-bold text-white">BigBrotherCrypto - Test</h1>
      </header>
      
      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="w-1/4 bg-gray-800 border-r border-gray-600 p-4">
          <h2 className="text-white text-lg font-bold mb-4">Left Column</h2>
          <p className="text-gray-300">Interactive Polls</p>
        </div>
        
        <div className="w-1/2 bg-gray-900 p-4">
          <h2 className="text-white text-lg font-bold mb-4">Middle Column</h2>
          <p className="text-gray-300">Camera Grid</p>
        </div>
        
        <div className="w-1/4 bg-gray-800 border-l border-gray-600 p-4">
          <h2 className="text-white text-lg font-bold mb-4">Right Column</h2>
          <p className="text-gray-300">Live Chat</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;

'use client';

import React, { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const { ready, authenticated, login: privyLogin } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const handleLogin = async () => {
    try {
      await privyLogin();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-[80%] border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-[80%] border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">BigBrotherCrypto</h1>
          <p className="text-blue-200">Live Streaming Platform</p>
        </div>

        <div className="flex flex-col items-center w-full space-y-6">
          <div className="w-full flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300 text-center mb-6">
              Connect your wallet to access the live streaming platform. You can use MetaMask, WalletConnect, or other supported wallets.
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-[80%] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.076 13.308-5.076 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05c-3.124-3.124-8.19-3.124-11.314 0a1 1 0 01-1.414-1.414c4.01-4.01 10.51-4.01 14.52 0a1 1 0 01-1.414 1.414zM12.12 13.88c-1.171-1.171-3.073-1.171-4.244 0a1 1 0 01-1.415-1.415c2.051-2.051 5.378-2.051 7.429 0a1 1 0 01-1.415 1.415zM9 16a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
            </svg>
            <span>Connect Wallet</span>
          </button>

          <div className="mt-6 text-center w-full">
            <p className="text-gray-300 text-sm">
              Supported wallets: MetaMask, WalletConnect, Coinbase Wallet, and more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

'use client';

import React, { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const { ready, authenticated, login: privyLogin } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/watch');
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
      <div className="min-h-screen bg-sf-bg-primary flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-xl animate-pulse opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-sf-accent-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <p className="text-sf-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sf-bg-primary flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-sf-accent-primary/15 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-sf-accent-secondary/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Noise Overlay */}
      <div className="noise-overlay" />

      <div className="relative z-10 glass-card p-8 max-w-md w-full animate-fade-in-up">
        {/* Back to Watch Link */}
        <Link
          href="/watch"
          className="inline-flex items-center gap-2 text-sf-text-tertiary hover:text-white transition-colors mb-8 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Watch
        </Link>

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center font-bold text-2xl text-white mx-auto mb-6 shadow-sf-glow">
            SF
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to Star Factor</h1>
          <p className="text-sf-text-secondary">Sign in to unlock all features</p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-10">
          {[
            {
              icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
              text: 'Chat with other viewers',
              color: 'sf-accent-primary'
            },
            {
              icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
              text: 'Place predictions & win Stakes',
              color: 'sf-accent-secondary'
            },
            {
              icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
              text: 'Vote to save your favorites',
              color: 'pink-400'
            },
            {
              icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
              text: 'Earn Clout & cash out winnings',
              color: 'sf-status-success'
            }
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-4 text-sf-text-secondary group">
              <div className={`w-10 h-10 bg-${benefit.color}/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-${benefit.color}/20 transition-colors`}>
                <svg className={`w-5 h-5 text-${benefit.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={benefit.icon} />
                </svg>
              </div>
              <span className="text-sm group-hover:text-white transition-colors">{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          className="w-full btn-primary py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign In
        </button>

        <p className="text-sf-text-muted text-sm text-center">
          Sign in with Email or Google
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

'use client';

import React, { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
        <div className="border-2 border-sf-glass-border rounded-3xl bg-sf-bg-secondary p-10 max-w-sm w-full text-center shadow-sf-xl">
          <div className="w-14 h-14 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-sf-accent-primary/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-sf-accent-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <p className="text-sf-text-secondary text-sm font-bold uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sf-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow accents */}
      <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-sf-accent-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] bg-sf-accent-secondary/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-sf-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Login card */}
      <div className="relative z-10 border-2 border-sf-glass-border rounded-3xl bg-sf-bg-secondary p-10 max-w-sm w-full shadow-sf-xl animate-scale-in">
        {/* Logo and headline */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-6 shadow-sf-glow rounded-full">
            <Image
              src="/starfff.png"
              alt="Star Factor"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full"
            />
          </div>

          <p className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-sf-accent-secondary mb-3">
            Welcome to Chainfren
          </p>

          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            Sign In
          </h1>

          <p className="text-sf-text-secondary text-sm leading-relaxed max-w-[260px]">
            Connect your account to unlock predictions, chat, and earn rewards.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-sf-glass-border mb-8" />

        {/* Sign in button */}
        <button
          onClick={handleLogin}
          className="w-full btn-primary py-4 rounded-full font-bold uppercase tracking-wider text-base flex items-center justify-center gap-2.5 shadow-sf-glow mb-5 transition-transform active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Get Started
        </button>

        <p className="text-sf-text-muted text-xs text-center tracking-wide">
          Sign in with Email or Google
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

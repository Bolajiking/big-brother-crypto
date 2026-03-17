'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// FAQ Data
const faqData = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is Star Factor?',
        a: 'Star Factor is Africa\'s first live interactive reality game show. It\'s a 24/7 live-streamed competition where contestants live together in a house for 60 days, competing for a $30,000 grand prize. Your engagement directly shapes the outcome of the show through prediction markets and voting.'
      },
      {
        q: 'When does Season 1 start?',
        a: 'Season 1 is scheduled to launch in Q2 2026. Join our waitlist to be the first to know the exact premiere date and get early access to the platform.'
      },
      {
        q: 'Is the platform easy to use?',
        a: 'Absolutely. We\'ve designed Star Factor to feel as simple as any regular app. Watch, vote, and participate using your local currency. Instant payouts, transparent transactions, zero friction.'
      },
      {
        q: 'Is this legal?',
        a: 'Yes. Star Factor operates as an entertainment platform with skill-based prediction markets. We comply with local regulations in all territories we operate in and work with licensed payment providers for all transactions.'
      },
    ]
  },
  {
    category: 'For Viewers',
    questions: [
      {
        q: 'How do I watch the show?',
        a: 'Create a free account and you\'ll get instant access to 8 live camera feeds streaming 24/7. Watch on any device — phone, tablet, laptop, or smart TV through our web app.'
      },
      {
        q: 'What are Clout and Stakes?',
        a: 'Clout is our free currency — earn it by watching, chatting, and logging in daily. Stakes is our premium currency — buy it with Naira to unlock bigger bets and premium features. Both currencies let you interact with the show.'
      },
      {
        q: 'How do prediction markets work?',
        a: 'Prediction markets let you bet on show outcomes — who wins challenges, who gets evicted, who starts drama. Create your own markets or bet on existing ones. Win Stakes when your predictions are correct.'
      },
      {
        q: 'Can I really earn money?',
        a: 'Yes. Win prediction markets, accumulate Stakes, and cash out to your bank account via Paystack. Top predictors on our leaderboard also earn weekly prizes.'
      },
    ]
  },
  {
    category: 'For Contestants',
    questions: [
      {
        q: 'How do I apply?',
        a: 'Click "Apply Now" and complete our multi-step application. You\'ll need to provide personal details, answer personality questions, and submit a 1-2 minute video showing us why you\'d be an unforgettable housemate.'
      },
      {
        q: 'What are the requirements?',
        a: 'You must be at least 21 years old, a Nigerian citizen or resident, available for 60 days of filming, and comfortable being filmed 24/7. No serious health conditions that would prevent participation.'
      },
      {
        q: 'What\'s the prize?',
        a: 'The Season 1 grand prize is $30,000, plus brand partnership opportunities and the exposure of being on Africa\'s most-watched interactive show.'
      },
    ]
  },
  {
    category: 'About Star Factor',
    questions: [
      {
        q: 'Who built this?',
        a: 'Star Factor is a Chainfren product. Chainfren unlocks digital wealth for creators and brands by equipping them with tools, strategy, and platforms to thrive in the global onchain economy.'
      },
      {
        q: 'What makes Star Factor different from Big Brother?',
        a: 'Star Factor puts real power in the viewers\' hands through prediction markets, skill-based betting, and transparent onchain voting. You don\'t just watch — you play, predict, and earn.'
      },
      {
        q: 'Is my money safe?',
        a: 'All payments are processed through Paystack, Nigeria\'s most trusted payment provider. Your funds are protected and withdrawals are instant to your bank account.'
      },
    ]
  },
];

// Scroll-triggered animation hook
function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '-60px', ...options }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

// FadeUp component for scroll animations
const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(40px)',
        transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

// Token distribution data
const tokenomics = [
  { label: 'Community & Rewards', pct: 35, color: '#5ACDFF', bg: 'bg-[#5ACDFF]' },
  { label: 'Ecosystem Growth', pct: 25, color: '#CBF0B8', bg: 'bg-[#CBF0B8]' },
  { label: 'Team & Advisors', pct: 20, color: '#8DAAFF', bg: 'bg-[#8DAAFF]' },
  { label: 'Investors', pct: 15, color: '#E6D9FF', bg: 'bg-[#E6D9FF]' },
  { label: 'Reserve', pct: 5, color: '#A6D234', bg: 'bg-[#A6D234]' },
];

const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('General');
  const [email, setEmail] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  if (!isMounted) return null;

  const currentFaq = faqData.find(c => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-sf-bg-primary overflow-hidden">
      {/* ============ NAVIGATION ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sf-bg-primary/90 backdrop-blur-xl border-b-2 border-sf-glass-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 transition-transform group-hover:scale-110">
                <Image src="/starfff.png" alt="Star Factor" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-black text-white uppercase tracking-tight">
                Star Factor
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: 'WATCH', href: '/watch' },
                { label: 'PREDICT', href: '/watch' },
                { label: 'APPLY', href: '/apply' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-bold text-sf-text-tertiary hover:text-white uppercase tracking-wider transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm font-bold text-sf-text-secondary hover:text-white uppercase tracking-wider transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/watch"
                className="btn-primary px-6 py-2.5 text-sm"
              >
                Watch Live
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background Effects — full spectrum orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-[700px] h-[700px] bg-[#4357F6]/10 rounded-full blur-[160px]" />
          <div className="absolute top-40 right-1/5 w-[400px] h-[400px] bg-[#5ACDFF]/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-[#CBF0B8]/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#E6D9FF]/6 rounded-full blur-[100px]" />
          <div className="absolute inset-0 dot-grid" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 border-[#5ACDFF]/30 bg-[#5ACDFF]/8 mb-8">
                <span className="w-2 h-2 bg-[#5ACDFF] rounded-full animate-pulse" />
                <span className="text-[#5ACDFF] text-xs font-bold uppercase tracking-[0.15em]">Season 1 Coming Q2 2026</span>
              </div>
            </FadeUp>

            {/* Logo */}
            <FadeUp delay={0.08}>
              <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-8 rounded-full overflow-hidden shadow-sf-glow-lg ring-2 ring-sf-accent-primary/30">
                <Image src="/starfff.png" alt="Star Factor" width={144} height={144} className="w-full h-full object-cover" priority />
              </div>
            </FadeUp>

            {/* Headline */}
            <FadeUp delay={0.16}>
              <h1 className="text-hero text-white mb-6 leading-[1.05]">
                WATCH. PREDICT.{' '}
                <span className="gradient-text-cyan">EARN.</span>
              </h1>
            </FadeUp>

            {/* Subheadline */}
            <FadeUp delay={0.24}>
              <p className="text-lg sm:text-xl text-sf-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
                Africa&apos;s first interactive reality TV platform. Cameras streaming 24/7.
                Prediction markets where your knowledge pays. Real money. Real drama. Real rewards.
              </p>
            </FadeUp>

            {/* CTA Buttons */}
            <FadeUp delay={0.32}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/watch"
                  className="btn-primary px-10 py-4 text-base shadow-sf-glow-button hover:shadow-sf-glow-button-hover"
                >
                  Start Watching
                </Link>
                <Link
                  href="/apply"
                  className="btn-secondary px-10 py-4 text-base"
                >
                  Apply as Contestant
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="relative py-2 px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="max-w-5xl mx-auto rounded-3xl border-2 p-8 sm:p-12 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0C1D4D 0%, #112758 100%)', borderColor: 'rgba(141,170,255,0.15)' }}
          >
            {/* colorful corner accents */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#5ACDFF]/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#CBF0B8]/10 rounded-full blur-[60px]" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {[
                { value: '8', label: 'Live Cameras', color: 'text-[#5ACDFF]', border: 'border-[#5ACDFF]/20', bg: 'bg-[#5ACDFF]/8' },
                { value: '$30K', label: 'Grand Prize', color: 'text-[#CBF0B8]', border: 'border-[#CBF0B8]/20', bg: 'bg-[#CBF0B8]/8' },
                { value: '60', label: 'Days Live', color: 'text-[#E6D9FF]', border: 'border-[#E6D9FF]/20', bg: 'bg-[#E6D9FF]/8' },
                { value: '24/7', label: 'Non-Stop', color: 'text-[#8DAAFF]', border: 'border-[#8DAAFF]/20', bg: 'bg-[#8DAAFF]/8' },
              ].map((stat, i) => (
                <div key={i} className={`text-center rounded-2xl border-2 ${stat.border} ${stat.bg} py-5 px-4`}>
                  <div className={`text-3xl sm:text-4xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs font-bold uppercase tracking-[0.15em] text-sf-text-tertiary mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <span className="overline mb-4 block">How It Works</span>
              <h2 className="text-display text-white">
                YOUR SHOW.{' '}
                <span className="gradient-text">YOUR RULES.</span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: '01',
                title: 'WATCH LIVE',
                desc: 'Tune into 8 camera feeds streaming 24/7. Follow your favorite contestants from the kitchen to the garden, the lounge to the bedroom.',
                accentText: 'text-[#5ACDFF]',
                accentBg: 'bg-[#5ACDFF]/12',
                accentBorder: 'border-[#5ACDFF]/25',
                stepBg: 'bg-[#5ACDFF]',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'PREDICT & BET',
                desc: 'Create prediction markets or bet on existing ones. Who wins the next challenge? Who gets evicted? Put your knowledge to work.',
                accentText: 'text-[#8DAAFF]',
                accentBg: 'bg-[#8DAAFF]/12',
                accentBorder: 'border-[#8DAAFF]/25',
                stepBg: 'bg-[#8DAAFF]',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'EARN REWARDS',
                desc: 'Win prediction markets and cash out to your bank account. Top predictors earn weekly prizes. Your engagement pays — literally.',
                accentText: 'text-[#CBF0B8]',
                accentBg: 'bg-[#CBF0B8]/12',
                accentBorder: 'border-[#CBF0B8]/25',
                stepBg: 'bg-[#CBF0B8]',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className={`rounded-3xl border-2 ${item.accentBorder} ${item.accentBg} p-7 sm:p-8 h-full group hover:scale-[1.02] transition-all duration-300`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-sf-bg-primary/50 border-2 ${item.accentBorder} flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform`}>
                      <span className={item.accentText}>{item.icon}</span>
                    </div>
                    <div className={`w-9 h-9 rounded-full ${item.stepBg} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xs font-black text-sf-bg-primary">{item.step}</span>
                    </div>
                  </div>
                  <h3 className={`text-lg font-black uppercase tracking-tight mb-3 ${item.accentText}`}>{item.title}</h3>
                  <p className="text-sf-text-tertiary text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES GRID ============ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <span className="overline mb-4 block">Platform Features</span>
              <h2 className="text-display text-white">
                BUILT FOR{' '}
                <span className="gradient-text-cyan">THE CULTURE.</span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: '8 Live Cameras',
                desc: 'Full coverage of the house. Kitchen, garden, lounge, pool, garage, bedroom, office, and entrance. Never miss a moment.',
                bg: 'bg-[#5ACDFF]/12',
                borderColor: 'border-[#5ACDFF]/25',
                iconColor: 'text-[#5ACDFF]',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
              },
              {
                title: 'Prediction Markets',
                desc: 'Create and bet on markets for any show event. Odds update in real-time. Win big with the right calls.',
                bg: 'bg-[#4357F6]/12',
                borderColor: 'border-[#4357F6]/25',
                iconColor: 'text-[#8DAAFF]',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
              },
              {
                title: 'Live Chat',
                desc: 'Talk with other viewers in real-time. React with emoji, trigger sound effects, and create prediction markets from chat.',
                bg: 'bg-[#E6D9FF]/10',
                borderColor: 'border-[#E6D9FF]/25',
                iconColor: 'text-[#E6D9FF]',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
              },
              {
                title: 'Instant Payouts',
                desc: 'Cash out winnings directly to your bank account via Paystack. No delays, no hidden fees, no middlemen.',
                bg: 'bg-[#CBF0B8]/10',
                borderColor: 'border-[#CBF0B8]/25',
                iconColor: 'text-[#CBF0B8]',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
              },
              {
                title: 'Voting Power',
                desc: 'Vote to save your favorite contestants from eviction. Tier up for multiplied vote power — from 1x to 3x.',
                bg: 'bg-[#8DAAFF]/12',
                borderColor: 'border-[#8DAAFF]/25',
                iconColor: 'text-[#8DAAFF]',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
              },
              {
                title: 'Dual Currency',
                desc: 'Earn free Clout by watching and chatting. Buy Stakes with Naira for premium bets. Both currencies unlock the full experience.',
                bg: 'bg-[#A6D234]/10',
                borderColor: 'border-[#A6D234]/25',
                iconColor: 'text-[#A6D234]',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
              },
            ].map((feature, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <div className={`rounded-3xl border-2 ${feature.borderColor} ${feature.bg} p-7 h-full group hover:scale-[1.02] transition-all duration-300`}>
                  <div className="w-12 h-12 rounded-2xl bg-sf-bg-primary/60 border-2 border-sf-glass-border flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">
                    <svg className={`w-6 h-6 ${feature.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className={`text-base font-black uppercase tracking-tight mb-2 ${feature.iconColor}`}>{feature.title}</h3>
                  <p className="text-sf-text-tertiary text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MARKET OPPORTUNITY ============ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#5ACDFF]/6 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] bg-[#CBF0B8]/6 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <FadeUp>
            <div className="text-center mb-16">
              <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-[#5ACDFF] block mb-4">Market Opportunity</span>
              <h2 className="text-display text-white">
                THE NUMBERS{' '}
                <span style={{ background: 'linear-gradient(to right, #5ACDFF, #CBF0B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  DON&apos;T LIE.
                </span>
              </h2>
              <p className="text-sf-text-secondary mt-4 max-w-2xl mx-auto">
                Africa&apos;s entertainment economy is exploding. Star Factor sits at the intersection of three massive, untapped markets.
              </p>
            </div>
          </FadeUp>

          {/* Big market stat cards */}
          <div className="grid gap-2 sm:grid-cols-3 mb-8">
            {[
              {
                value: '$17B',
                label: 'African Streaming Market by 2027',
                sub: 'Growing at 18% CAGR',
                color: '#5ACDFF',
                bg: 'bg-[#5ACDFF]/10',
                border: 'border-[#5ACDFF]/25',
              },
              {
                value: '600M+',
                label: 'African Mobile Users',
                sub: 'World\'s fastest-growing internet population',
                color: '#CBF0B8',
                bg: 'bg-[#CBF0B8]/10',
                border: 'border-[#CBF0B8]/25',
              },
              {
                value: '$3B+',
                label: 'Africa Prediction Market TAM',
                sub: 'Largely unaddressed by existing platforms',
                color: '#E6D9FF',
                bg: 'bg-[#E6D9FF]/10',
                border: 'border-[#E6D9FF]/25',
              },
            ].map((m, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className={`rounded-3xl border-2 ${m.border} ${m.bg} p-8 text-center group hover:scale-[1.02] transition-all`}>
                  <div className="text-4xl sm:text-5xl font-black mb-3" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-sm font-bold text-white uppercase tracking-wide mb-2">{m.label}</div>
                  <div className="text-xs text-sf-text-muted">{m.sub}</div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Why now section */}
          <FadeUp delay={0.2}>
            <div className="rounded-3xl border-2 border-[#8DAAFF]/20 bg-[#8DAAFF]/6 p-8 sm:p-10">
              <div className="grid sm:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-[#8DAAFF] block mb-3">Why Now</span>
                  <h3 className="text-2xl font-black uppercase text-white mb-4 leading-tight">
                    THE PERFECT STORM
                  </h3>
                  <p className="text-sf-text-secondary text-sm leading-relaxed mb-6">
                    Reality TV is Africa&apos;s most-watched content format. Mobile penetration is at an all-time high. Crypto rails make instant micropayments possible. Star Factor is the first product built to capture all three tailwinds simultaneously.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Nigeria 🇳🇬', 'Ghana 🇬🇭', 'Kenya 🇰🇪', 'South Africa 🇿🇦'].map(c => (
                      <span key={c} className="px-3 py-1.5 rounded-full border-2 border-[#8DAAFF]/25 bg-[#8DAAFF]/10 text-[#8DAAFF] text-xs font-bold">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Season 1 Contestants', value: '20', color: '#5ACDFF' },
                    { label: 'Launch Markets', value: '4', color: '#CBF0B8' },
                    { label: 'Prize Pool S1', value: '$30K', color: '#E6D9FF' },
                    { label: 'Camera Feeds', value: '8 HD', color: '#8DAAFF' },
                  ].map((item, i) => (
                    <div key={i} className="bg-sf-bg-tertiary/60 border-2 border-sf-glass-border rounded-2xl p-4 text-center">
                      <div className="text-2xl font-black mb-1" style={{ color: item.color }}>{item.value}</div>
                      <div className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-sf-text-muted">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ============ TOKENOMICS ============ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-[#CBF0B8] block mb-4">Token Economics</span>
              <h2 className="text-display text-white">
                CLOUT &amp;{' '}
                <span style={{ background: 'linear-gradient(to right, #CBF0B8, #5ACDFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  STAKES.
                </span>
              </h2>
              <p className="text-sf-text-secondary mt-4 max-w-2xl mx-auto">
                Two currencies power the Star Factor economy. Clout fuels free participation. Stakes powers real-money prediction markets.
              </p>
            </div>
          </FadeUp>

          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            {/* Clout Card */}
            <FadeUp>
              <div className="rounded-3xl border-2 border-[#8DAAFF]/25 bg-[#8DAAFF]/8 p-8 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#8DAAFF]/20 border-2 border-[#8DAAFF]/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#8DAAFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-black uppercase text-[#8DAAFF]">CLOUT</div>
                    <div className="text-xs text-sf-text-muted font-bold uppercase tracking-wider">Free Currency</div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {[
                    { action: 'Daily Login', reward: '+50 Clout' },
                    { action: 'Watch 1 hour', reward: '+25 Clout' },
                    { action: 'Send a chat message', reward: '+2 Clout' },
                    { action: 'Prediction market win', reward: '+100–500 Clout' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#8DAAFF]/10 last:border-0">
                      <span className="text-sm text-sf-text-secondary">{row.action}</span>
                      <span className="text-sm font-bold text-[#8DAAFF]">{row.reward}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-sf-bg-primary/40 rounded-2xl border border-[#8DAAFF]/15 p-4">
                  <p className="text-xs text-sf-text-muted leading-relaxed">Clout is earned, never bought. Use it to vote, tip contestants, react in chat, and unlock platform features.</p>
                </div>
              </div>
            </FadeUp>

            {/* Stakes Card */}
            <FadeUp delay={0.1}>
              <div className="rounded-3xl border-2 border-[#CBF0B8]/25 bg-[#CBF0B8]/8 p-8 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#CBF0B8]/20 border-2 border-[#CBF0B8]/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#CBF0B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-black uppercase text-[#CBF0B8]">STAKES</div>
                    <div className="text-xs text-sf-text-muted font-bold uppercase tracking-wider">Premium Currency</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: '100 Stakes', price: '₦500', badge: 'Starter' },
                    { label: '500 Stakes', price: '₦2,000', badge: 'Popular' },
                    { label: '1,500 Stakes', price: '₦5,000', badge: 'Value' },
                    { label: '5,000 Stakes', price: '₦15,000', badge: 'Pro' },
                  ].map((tier, i) => (
                    <div key={i} className={`rounded-2xl border-2 p-3 text-center ${i === 1 ? 'border-[#CBF0B8]/50 bg-[#CBF0B8]/15' : 'border-[#CBF0B8]/15 bg-sf-bg-tertiary/40'}`}>
                      <div className={`text-[0.625rem] font-bold uppercase tracking-wider mb-1.5 ${i === 1 ? 'text-[#CBF0B8]' : 'text-sf-text-muted'}`}>{tier.badge}</div>
                      <div className="text-sm font-black text-white">{tier.label}</div>
                      <div className={`text-xs font-bold mt-1 ${i === 1 ? 'text-[#CBF0B8]' : 'text-sf-text-tertiary'}`}>{tier.price}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-sf-bg-primary/40 rounded-2xl border border-[#CBF0B8]/15 p-4">
                  <p className="text-xs text-sf-text-muted leading-relaxed">Stakes = real money. Buy with Naira via Paystack. Win prediction markets and cash out instantly to your bank.</p>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* Distribution Bar */}
          <FadeUp delay={0.2}>
            <div className="rounded-3xl border-2 border-[#5ACDFF]/20 bg-[#5ACDFF]/6 p-8">
              <div className="mb-6">
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-[#5ACDFF]">Stakes Allocation</span>
                <h3 className="text-xl font-black text-white uppercase mt-1">TOKEN DISTRIBUTION</h3>
              </div>
              {/* Stacked bar */}
              <div className="flex rounded-full overflow-hidden h-5 mb-6 gap-0.5">
                {tokenomics.map((t, i) => (
                  <div
                    key={i}
                    className="h-full transition-all"
                    style={{ width: `${t.pct}%`, backgroundColor: t.color, opacity: 0.85 }}
                    title={`${t.label}: ${t.pct}%`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {tokenomics.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                    <div>
                      <div className="text-[0.625rem] font-bold uppercase tracking-wider text-sf-text-muted">{t.pct}%</div>
                      <div className="text-xs text-sf-text-secondary leading-tight">{t.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ============ INVESTOR SECTION ============ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#E6D9FF]/6 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#5ACDFF]/6 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <FadeUp>
            <div className="text-center mb-16">
              <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-[#E6D9FF] block mb-4">For Investors</span>
              <h2 className="text-display text-white">
                BACK THE{' '}
                <span style={{ background: 'linear-gradient(to right, #E6D9FF, #8DAAFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  FUTURE.
                </span>
              </h2>
              <p className="text-sf-text-secondary mt-4 max-w-2xl mx-auto">
                Star Factor is raising its seed round to fund Season 1 production, platform development, and market expansion across West Africa.
              </p>
            </div>
          </FadeUp>

          {/* Investment highlights */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            {[
              { label: 'Revenue Model', value: '3x', sub: 'Revenue streams', color: '#E6D9FF', border: 'border-[#E6D9FF]/25', bg: 'bg-[#E6D9FF]/8' },
              { label: 'Launch Markets', value: '4', sub: 'African countries', color: '#5ACDFF', border: 'border-[#5ACDFF]/25', bg: 'bg-[#5ACDFF]/8' },
              { label: 'Prize Pool S1', value: '$30K', sub: 'Grand prize', color: '#CBF0B8', border: 'border-[#CBF0B8]/25', bg: 'bg-[#CBF0B8]/8' },
              { label: 'Break-even', value: 'S2', sub: 'Season 2 target', color: '#8DAAFF', border: 'border-[#8DAAFF]/25', bg: 'bg-[#8DAAFF]/8' },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className={`rounded-3xl border-2 ${item.border} ${item.bg} p-7 text-center group hover:scale-[1.02] transition-all`}>
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-sf-text-muted mb-2">{item.label}</div>
                  <div className="text-3xl font-black mb-2" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs text-sf-text-secondary font-medium">{item.sub}</div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Revenue + Use of Funds */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Revenue Streams */}
            <FadeUp>
              <div className="rounded-3xl border-2 border-[#E6D9FF]/20 bg-[#E6D9FF]/6 p-8 h-full">
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-[#E6D9FF] block mb-3">Revenue Streams</span>
                <h3 className="text-xl font-black uppercase text-white mb-6">HOW WE EARN</h3>
                <div className="space-y-4">
                  {[
                    {
                      source: 'Stakes Sales',
                      desc: 'Platform takes 10% of all Stakes purchases. Primary revenue driver.',
                      share: '60%',
                      color: '#E6D9FF',
                    },
                    {
                      source: 'Prediction Market Fees',
                      desc: '5% rake on all resolved prediction market pools.',
                      share: '25%',
                      color: '#8DAAFF',
                    },
                    {
                      source: 'Brand Sponsorships',
                      desc: 'In-show product placements and branded challenges.',
                      share: '15%',
                      color: '#5ACDFF',
                    },
                  ].map((rev, i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-[#E6D9FF]/10 last:border-0 last:pb-0">
                      <div className="w-12 h-12 rounded-2xl bg-sf-bg-primary/50 border-2 border-sf-glass-border flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-black" style={{ color: rev.color }}>{rev.share}</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white mb-1">{rev.source}</div>
                        <div className="text-xs text-sf-text-muted leading-relaxed">{rev.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Use of Funds */}
            <FadeUp delay={0.1}>
              <div className="rounded-3xl border-2 border-[#5ACDFF]/20 bg-[#5ACDFF]/6 p-8 h-full">
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-[#5ACDFF] block mb-3">Use of Funds</span>
                <h3 className="text-xl font-black uppercase text-white mb-6">WHERE IT GOES</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Production & House Setup', pct: 45, color: '#5ACDFF' },
                    { label: 'Platform & Tech', pct: 25, color: '#8DAAFF' },
                    { label: 'Marketing & Growth', pct: 20, color: '#CBF0B8' },
                    { label: 'Operations & Legal', pct: 10, color: '#E6D9FF' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-sf-text-secondary">{item.label}</span>
                        <span className="text-xs font-black" style={{ color: item.color }}>{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-sf-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.pct}%`, backgroundColor: item.color, opacity: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-[#5ACDFF]/15">
                  <p className="text-xs text-sf-text-muted leading-relaxed mb-4">
                    Interested in backing Africa&apos;s most ambitious entertainment platform? We&apos;re building for the long term.
                  </p>
                  <a
                    href="mailto:invest@chainfren.com"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#5ACDFF]/40 bg-[#5ACDFF]/10 text-[#5ACDFF] text-xs font-bold uppercase tracking-wider hover:bg-[#5ACDFF]/20 transition-all"
                  >
                    Contact Investor Relations
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ============ FAQ SECTION ============ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <span className="overline mb-4 block">Got Questions?</span>
              <h2 className="text-display text-white">
                EVERYTHING YOU{' '}
                <span className="gradient-text">NEED TO KNOW.</span>
              </h2>
            </div>
          </FadeUp>

          {/* Category Tabs */}
          <FadeUp delay={0.08}>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {faqData.map((cat, i) => {
                const tabColors = ['border-[#4357F6]', 'border-[#5ACDFF]', 'border-[#CBF0B8]', 'border-[#E6D9FF]'];
                const tabActiveBgs = ['bg-[#4357F6]', 'bg-[#5ACDFF]', 'bg-[#CBF0B8]', 'bg-[#E6D9FF]'];
                const tabActiveTexts = ['text-white', 'text-sf-bg-primary', 'text-sf-bg-primary', 'text-sf-bg-primary'];
                return (
                  <button
                    key={cat.category}
                    onClick={() => {
                      setActiveCategory(cat.category);
                      setOpenFaq(null);
                    }}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] transition-all border-2 ${
                      activeCategory === cat.category
                        ? `${tabActiveBgs[i]} ${tabActiveTexts[i]} ${tabColors[i]}`
                        : 'bg-transparent text-sf-text-tertiary border-sf-glass-border hover:border-sf-glass-border-hover hover:text-white'
                    }`}
                  >
                    {cat.category}
                  </button>
                );
              })}
            </div>
          </FadeUp>

          {/* FAQ Accordion */}
          <div className="space-y-2">
            {currentFaq?.questions.map((faq, index) => {
              const faqId = `${activeCategory}-${index}`;
              const isOpen = openFaq === faqId;

              return (
                <FadeUp key={faqId} delay={index * 0.06}>
                  <div
                    className={`rounded-3xl border-2 transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'bg-[#8DAAFF]/10 border-[#8DAAFF]/35'
                        : 'bg-sf-bg-secondary border-sf-glass-border hover:border-sf-glass-border-hover'
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(faqId)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left"
                    >
                      <span className={`text-sm font-bold pr-4 ${isOpen ? 'text-white' : 'text-sf-text-secondary'}`}>
                        {faq.q}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          isOpen
                            ? 'bg-[#8DAAFF] border-[#8DAAFF] rotate-180'
                            : 'bg-[#8DAAFF]/15 border-[#8DAAFF]/25'
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 ${isOpen ? 'text-sf-bg-primary' : 'text-[#8DAAFF]'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        maxHeight: isOpen ? '200px' : '0',
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <p className="px-6 pb-5 text-sm text-sf-text-tertiary leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="max-w-4xl mx-auto rounded-3xl border-2 border-[#5ACDFF]/25 p-8 sm:p-14 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(90,205,255,0.06) 0%, rgba(203,240,184,0.04) 50%, rgba(230,217,255,0.06) 100%)' }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5ACDFF]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#CBF0B8]/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-[#5ACDFF] block mb-4">Join the Waitlist</span>
              <h2 className="text-display text-white mb-4">
                DON&apos;T MISS SEASON 1.
              </h2>
              <p className="text-sf-text-secondary text-base mb-8 max-w-lg mx-auto">
                Be the first to know when Star Factor goes live. Early access members get <span className="text-[#CBF0B8] font-bold">500 bonus Clout</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-primary flex-1 py-3.5 px-5 rounded-full text-sm"
                />
                <button className="btn-primary px-8 py-3.5 text-sm whitespace-nowrap">
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t-2 border-sf-glass-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image src="/starfff.png" alt="Star Factor" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-tight">Star Factor</span>
              </div>
              <span className="text-xs text-sf-text-muted font-medium">
                Built by <span className="text-[#8DAAFF] font-bold">Chainfren</span>
              </span>
            </div>

            <div className="flex items-center gap-6">
              {[
                { label: 'Watch', href: '/watch' },
                { label: 'Apply', href: '/apply' },
                { label: 'Invest', href: 'mailto:invest@chainfren.com' },
                { label: 'FAQ', href: '#faq' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs font-bold text-sf-text-tertiary hover:text-white uppercase tracking-wider transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {[
                { label: 'X', href: 'https://x.com/starfactortv', color: 'hover:text-[#5ACDFF] hover:border-[#5ACDFF]/40' },
                { label: 'IG', href: 'https://instagram.com/starfactorlive', color: 'hover:text-[#E6D9FF] hover:border-[#E6D9FF]/40' },
                { label: 'YT', href: 'https://youtube.com', color: 'hover:text-[#FF6B6B] hover:border-[#FF6B6B]/40' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full border-2 border-sf-glass-border flex items-center justify-center text-sf-text-muted text-xs font-bold transition-all ${social.color}`}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-sf-glass-border text-center">
            <p className="text-xs text-sf-text-muted">
              &copy; {new Date().getFullYear()} Star Factor. A Chainfren Product. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

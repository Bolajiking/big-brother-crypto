'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// FAQ Data
const faqData = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is Star Factor?',
        a: 'Star Factor is Africa\'s first live interactive reality game show. It\'s a 24/7 live-streamed competition where contestants live together in a house for 60 days, competing for a $30,000 grand prize. What makes us unique is the deep viewer interaction through prediction markets and voting — your engagement directly shapes the outcome of the show.'
      },
      {
        q: 'When does Season 1 start?',
        a: 'Season 1 is scheduled to launch in Q2 2026. Join our waitlist to be the first to know the exact premiere date and get early access to the platform.'
      },
      {
        q: 'Is the platform easy to use?',
        a: 'Absolutely! We\'ve designed the platform to be as simple as using any regular app. You can watch, vote, and participate using your local currency. Everything works seamlessly with instant payouts and transparent transactions.'
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
        a: 'Simply create a free account on our platform. You\'ll get access to 8 live camera feeds streaming 24/7. You can watch on any device - phone, tablet, laptop, or smart TV through our web app.'
      },
      {
        q: 'What is Clout and how do I earn it?',
        a: 'Clout is our free currency that you earn just by engaging with the platform. You get 500 Clout when you sign up, 50 Clout daily for logging in, 10 Clout per hour of watching, and 1 Clout per chat message (max 50/day). Use Clout to vote and participate in polls.'
      },
      {
        q: 'What are Stakes and why would I buy them?',
        a: 'Stakes are our premium currency that you purchase with your local currency. Use Stakes to place predictions on show outcomes (who gets evicted, who wins challenges, etc.). If your prediction is correct, you win more Stakes that can be cashed out to your bank account. Stakes also give you more powerful votes.'
      },
      {
        q: 'How do predictions work?',
        a: 'Every week, we open prediction markets on various outcomes - who will be evicted, who will win Head of House, will certain events happen, etc. You place Stakes on the outcome you believe will happen. The odds determine your potential payout. If you\'re right, you win!'
      },
      {
        q: 'How does voting work?',
        a: 'When contestants are nominated for eviction, you can vote to save your favorites using Clout or Stakes. Higher-tier members get vote multipliers (up to 3x for Platinum tier). The contestant with the fewest votes gets evicted.'
      },
      {
        q: 'Can I cash out my winnings?',
        a: 'Yes! Any Stakes you win from correct predictions can be withdrawn directly to your bank account. Withdrawals are processed within 24 hours. Minimum withdrawal is 100 Stakes.'
      },
    ]
  },
  {
    category: 'For Contestants',
    questions: [
      {
        q: 'How do I apply to be a contestant?',
        a: 'Applications will open 3 months before Season 1. Join our waitlist and select "Contestant" to be notified when applications open. You\'ll need to submit a video audition, complete an application form, and go through our selection process.'
      },
      {
        q: 'What are the requirements to apply?',
        a: 'You must be a Nigerian citizen between 21-40 years old, available for 60 consecutive days, have no criminal record, pass a medical and psychological evaluation, and be ready to live in the house with no contact with the outside world.'
      },
      {
        q: 'Do contestants get paid?',
        a: 'All contestants receive a weekly stipend during their time in the house. The winner takes home the $30,000 grand prize. Additionally, popular contestants often receive brand deals and sponsorships after the show.'
      },
      {
        q: 'What happens in the house?',
        a: 'Contestants live together, compete in weekly challenges, form alliances, and try to avoid eviction. Every week, contestants nominate each other for eviction, and viewers vote to save their favorites. The last person standing wins the grand prize.'
      },
    ]
  },
  {
    category: 'Payments & Security',
    questions: [
      {
        q: 'How do I add funds to my account?',
        a: 'You can add funds using any debit card, bank transfer, or mobile money through our secure payment partners. We offer packages starting from as low as $5 with bonus Stakes for larger purchases.'
      },
      {
        q: 'Is my money safe?',
        a: 'Absolutely. All payments are processed through trusted and secure payment providers. Your funds are held securely and you can withdraw at any time. All transactions are transparent and verifiable.'
      },
      {
        q: 'What are the membership tiers?',
        a: 'We have 5 tiers: Free (1x vote power), Bronze (1.5x), Silver (2x), Gold (2.5x), and Platinum (3x). Higher tiers give you more voting power. You upgrade by spending Stakes on the platform - the more you engage, the higher your tier.'
      },
      {
        q: 'Are there any hidden fees?',
        a: 'No hidden fees. You see exactly what you\'re paying and what you\'re getting. A small processing fee applies for deposits (typically 1-2%), and there\'s no fee for withdrawals.'
      },
    ]
  },
  {
    category: 'Technical',
    questions: [
      {
        q: 'What devices can I use to watch?',
        a: 'Star Factor works on any device with a modern web browser - smartphones, tablets, laptops, and desktop computers. We recommend Chrome, Safari, or Firefox for the best experience. A dedicated mobile app is coming soon.'
      },
      {
        q: 'How much data does streaming use?',
        a: 'Our adaptive streaming technology adjusts quality based on your connection. On average, expect about 500MB-1GB per hour of HD viewing. You can also choose lower quality settings to save data.'
      },
      {
        q: 'Can I watch offline or download clips?',
        a: 'The live streams require an internet connection. However, we\'ll have a highlights section where you can watch key moments. Download features may be added in future updates.'
      },
    ]
  },
];

const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'viewer' | 'contestant' | 'investor' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('General');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !userType) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-sf-bg-primary text-white overflow-x-hidden">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-sf-bg-primary/80 backdrop-blur-glass border-b border-sf-glass-border' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center font-bold text-lg shadow-sf-glow-button">
              SF
            </div>
            <span className="text-xl font-bold gradient-text">
              Star Factor
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sf-text-tertiary hover:text-white transition-colors text-sm font-medium">How It Works</a>
            <Link href="/apply" className="text-sf-text-tertiary hover:text-white transition-colors text-sm font-medium">Apply</Link>
            <a href="#investors" className="text-sf-text-tertiary hover:text-white transition-colors text-sm font-medium">Partners</a>
            <a href="#faq" className="text-sf-text-tertiary hover:text-white transition-colors text-sm font-medium">FAQ</a>
            <Link
              href="/watch"
              className="bg-gradient-primary hover:shadow-sf-glow-button-hover px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:-translate-y-0.5"
            >
              Launch App
            </Link>
          </div>
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 glass rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-sf-accent-primary/20 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-sf-accent-secondary/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-sf-accent-primary/5 via-transparent to-transparent rounded-full" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8 animate-fade-in-down">
            <span className="live-dot" />
            <span className="text-sf-status-live text-sm font-medium">Coming Soon - Season 1</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-hero font-bold mb-8 leading-[1.1] tracking-tight animate-fade-in-up">
            Africa&apos;s First
            <br />
            <span className="gradient-text">
              Interactive Reality Show
            </span>
          </h1>

          <p className="text-lg md:text-xl text-sf-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            24/7 live streaming. Predict outcomes. Vote for your favorites.
            Win real money. Your engagement shapes the show.
          </p>

          {/* Prize Pool - Glass Card */}
          <div className="glass-card inline-flex items-center gap-6 px-10 py-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-left">
              <span className="text-sf-text-tertiary text-sm font-medium uppercase tracking-wider">Season 1 Grand Prize</span>
              <div className="text-4xl md:text-5xl font-bold gradient-text mt-1">$30,000</div>
            </div>
            <div className="w-px h-16 bg-sf-glass-border" />
            <div className="text-left">
              <span className="text-sf-text-tertiary text-sm font-medium uppercase tracking-wider">Duration</span>
              <div className="text-4xl md:text-5xl font-bold text-white mt-1">60 Days</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <a
              href="#waitlist"
              className="w-full sm:w-auto btn-primary px-10 py-4 rounded-2xl font-semibold text-lg shadow-sf-glow-button hover:shadow-sf-glow-button-hover hover:-translate-y-1 transition-all"
            >
              Join the Waitlist
            </a>
            <Link
              href="/watch"
              className="w-full sm:w-auto btn-secondary px-10 py-4 rounded-2xl font-semibold text-lg"
            >
              Preview App
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '8', label: 'Live Cameras', color: 'text-sf-accent-primary' },
              { value: '24/7', label: 'Live Streaming', color: 'text-sf-accent-secondary' },
              { value: '12', label: 'Contestants', color: 'text-pink-400' },
              { value: '60', label: 'Days of Drama', color: 'text-sf-status-success' },
            ].map((stat, i) => (
              <div key={i} className="glass-card glass-card-hover p-6 group cursor-default transition-all">
                <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-1 group-hover:scale-110 transition-transform`}>
                  {stat.value}
                </div>
                <div className="text-sf-text-tertiary text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <div className="w-6 h-10 border-2 border-sf-text-muted rounded-full p-1">
            <div className="w-1.5 h-2.5 bg-sf-text-tertiary rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sf-bg-secondary/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="badge badge-live mb-4 inline-block">How It Works</span>
            <h2 className="text-4xl md:text-display font-bold mb-6">
              Watch. Predict. <span className="gradient-text">Win.</span>
            </h2>
            <p className="text-sf-text-secondary text-lg max-w-2xl mx-auto">
              Experience reality TV like never before. Your engagement directly impacts the show.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Watch 24/7',
                description: '8 live cameras streaming around the clock. Never miss a moment of the action, drama, and unexpected twists.',
                gradient: 'from-sf-accent-primary/20 to-sf-accent-primary/5',
                borderColor: 'hover:border-sf-accent-primary/50',
                iconBg: 'bg-sf-accent-primary/10',
                iconColor: 'text-sf-accent-primary'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Predict & Win',
                description: 'Place predictions on weekly evictions, challenges, and showmances. Get it right and win real Stakes you can cash out.',
                gradient: 'from-sf-accent-secondary/20 to-sf-accent-secondary/5',
                borderColor: 'hover:border-sf-accent-secondary/50',
                iconBg: 'bg-sf-accent-secondary/10',
                iconColor: 'text-sf-accent-secondary'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Vote to Save',
                description: 'Your vote decides who stays and who goes. Use Clout or Stakes to vote with multipliers based on your tier.',
                gradient: 'from-pink-500/20 to-pink-500/5',
                borderColor: 'hover:border-pink-500/50',
                iconBg: 'bg-pink-500/10',
                iconColor: 'text-pink-400'
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`relative group p-8 rounded-2xl border border-sf-glass-border ${card.borderColor} transition-all duration-300 hover:-translate-y-2 overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className={`w-16 h-16 ${card.iconBg} rounded-2xl flex items-center justify-center mb-6 ${card.iconColor} group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                  <p className="text-sf-text-secondary leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Two Currency System */}
          <div className="gradient-border p-px rounded-3xl overflow-hidden">
            <div className="bg-sf-bg-secondary rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="badge badge-success mb-4 inline-block">Dual Currency</span>
                  <h3 className="text-3xl md:text-title font-bold mb-6">Two Ways to Play</h3>
                  <p className="text-sf-text-secondary mb-8 leading-relaxed">
                    Our unique dual-currency system lets you engage for free or go premium for bigger rewards.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 group">
                      <div className="w-14 h-14 bg-sf-accent-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-sf-accent-primary/20 transition-colors">
                        <span className="text-sf-accent-primary font-bold text-xl">C</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sf-accent-primary mb-1">Clout (Free)</h4>
                        <p className="text-sf-text-tertiary text-sm">Earn by watching, chatting, and logging in daily. Use to vote and participate.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group">
                      <div className="w-14 h-14 bg-sf-status-success/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-sf-status-success/20 transition-colors">
                        <span className="text-sf-status-success font-bold text-xl">S</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sf-status-success mb-1">Stakes (Premium)</h4>
                        <p className="text-sf-text-tertiary text-sm">Purchase with your local currency. Use for predictions and premium votes. Cash out your winnings.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet Preview */}
                <div className="relative">
                  <div className="glass-card p-6 shadow-sf-xl">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sf-text-tertiary text-sm font-medium">Your Wallet</span>
                      <span className="badge badge-warning">GOLD TIER</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-sf-bg-tertiary rounded-xl p-4">
                        <div className="text-sf-text-muted text-xs mb-1 uppercase tracking-wider">Clout</div>
                        <div className="text-2xl font-bold text-sf-accent-primary">2,450</div>
                      </div>
                      <div className="bg-sf-bg-tertiary rounded-xl p-4">
                        <div className="text-sf-text-muted text-xs mb-1 uppercase tracking-wider">Stakes</div>
                        <div className="text-2xl font-bold text-sf-status-success">850</div>
                      </div>
                    </div>
                    <button className="w-full btn-primary py-3 rounded-xl font-medium">
                      Add Funds
                    </button>
                  </div>
                  {/* Decorative glow */}
                  <div className="absolute -inset-4 bg-gradient-primary opacity-10 blur-2xl -z-10 rounded-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Contestants Section */}
      <section id="contestants" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="badge inline-flex items-center gap-2 bg-pink-500/10 text-pink-400 mb-6">
                <span className="live-dot !bg-pink-400" />
                Applications Open
              </span>
              <h2 className="text-4xl md:text-display font-bold mb-6 leading-tight">
                Ready to Be
                <br />
                <span className="text-pink-400">Africa&apos;s Next Star?</span>
              </h2>
              <p className="text-sf-text-secondary text-lg mb-10 leading-relaxed">
                We&apos;re looking for bold, entertaining, and authentic personalities to compete for the grand prize.
                Do you have what it takes to survive 60 days in the house?
              </p>

              <div className="space-y-4 mb-10">
                {[
                  'Nigerian citizen, 21-40 years old',
                  'Available for 60 consecutive days',
                  'Big personality, camera-ready',
                  'Ready to entertain millions'
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-6 h-6 bg-sf-status-success/10 rounded-full flex items-center justify-center group-hover:bg-sf-status-success/20 transition-colors">
                      <svg className="w-3.5 h-3.5 text-sf-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sf-text-secondary group-hover:text-white transition-colors">{req}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/apply"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:-translate-y-1 shadow-lg shadow-pink-500/25"
              >
                Apply Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Contestant Grid Preview */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-2xl bg-gradient-to-br ${
                    i === 1 ? 'from-pink-500/20 to-purple-500/10 col-span-2 row-span-2' :
                    i === 2 ? 'from-sf-accent-primary/20 to-cyan-500/10' :
                    i === 3 ? 'from-sf-status-success/20 to-emerald-500/10' :
                    i === 4 ? 'from-sf-status-warning/20 to-orange-500/10' :
                    i === 5 ? 'from-sf-status-error/20 to-pink-500/10' :
                    'from-sf-accent-secondary/20 to-indigo-500/10'
                  } border border-sf-glass-border hover:border-sf-glass-border-hover flex items-center justify-center transition-all hover:scale-105 cursor-pointer group`}
                >
                  <span className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">?</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Investors Section */}
      <section id="investors" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sf-bg-secondary/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="badge badge-success mb-4 inline-block">Partnership Opportunities</span>
            <h2 className="text-4xl md:text-display font-bold mb-6">
              Partner With <span className="text-sf-status-success">Us</span>
            </h2>
            <p className="text-sf-text-secondary text-lg max-w-2xl mx-auto">
              Join the future of entertainment in Africa. We&apos;re building the next generation of interactive media.
            </p>
          </div>

          {/* Entertainment & Creator Economy */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { value: '500M+', label: 'Target African Youth', color: 'text-sf-accent-primary' },
              { value: '$2.1B', label: 'African Creator Economy (28.5% CAGR)', color: 'text-sf-accent-secondary' },
              { value: '85%', label: 'Mobile-First Audience', color: 'text-sf-status-success' },
            ].map((stat, i) => (
              <div key={i} className="glass-card text-center p-8">
                <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-sf-text-tertiary">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Prediction & Betting Markets */}
          <div className="mb-16">
            <div className="text-center mb-6">
              <span className="text-sf-text-muted text-sm uppercase tracking-wider">Prediction Markets Opportunity</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '$11.3B', label: 'Africa Gambling TAM by 2032', color: 'text-pink-400' },
                { value: '27.5M', label: 'Users by 2029', color: 'text-cyan-400' },
                { value: '12.5%', label: 'Annual Growth', color: 'text-emerald-400' },
              ].map((stat, i) => (
                <div key={i} className="glass-card text-center p-5">
                  <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-sf-text-muted text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sponsors */}
            <div className="relative group p-8 rounded-2xl border border-sf-accent-primary/20 hover:border-sf-accent-primary/40 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sf-accent-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <h3 className="text-xl font-bold mb-4 text-sf-accent-primary">Brand Sponsors</h3>
                <p className="text-sf-text-secondary mb-6">
                  Reach millions of engaged viewers through native integrations, challenges, and product placements.
                </p>
                <ul className="space-y-3 text-sf-text-tertiary">
                  <li className="flex items-center gap-2">
                    <span className="text-sf-accent-primary">-</span> In-show brand challenges
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sf-accent-primary">-</span> Sponsored prediction markets
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sf-accent-primary">-</span> Exclusive viewer rewards
                  </li>
                </ul>
              </div>
            </div>

            {/* Investors */}
            <div className="relative group p-8 rounded-2xl border border-sf-status-success/20 hover:border-sf-status-success/40 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sf-status-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <h3 className="text-xl font-bold mb-4 text-sf-status-success">Investors</h3>
                <p className="text-sf-text-secondary mb-6">
                  We&apos;re raising our seed round to scale production and expand across Africa.
                </p>
                <ul className="space-y-3 text-sf-text-tertiary">
                  <li className="flex items-center gap-2">
                    <span className="text-sf-status-success">-</span> Interactive entertainment pioneer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sf-status-success">-</span> Massive African youth market
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sf-status-success">-</span> Proven entertainment format
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="mailto:partners@starfactor.ng"
              className="inline-flex items-center gap-3 btn-secondary px-8 py-4 rounded-2xl font-semibold text-lg"
            >
              Get in Touch
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-32">
        <div className="max-w-3xl mx-auto px-6">
          <div className="gradient-border p-px rounded-3xl overflow-hidden">
            <div className="bg-sf-bg-secondary rounded-3xl p-8 md:p-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-title font-bold mb-4">
                  Join the Waitlist
                </h2>
                <p className="text-sf-text-secondary">
                  Be the first to know when Season 1 launches. Early supporters get exclusive perks.
                </p>
              </div>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-sf-status-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-sf-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-sf-status-success mb-2">You&apos;re on the list!</h3>
                  <p className="text-sf-text-tertiary">We&apos;ll notify you when applications open.</p>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-6">
                  {/* User Type Selection */}
                  <div>
                    <label className="block text-sm text-sf-text-tertiary mb-3 font-medium">I&apos;m interested as a...</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { type: 'viewer', emoji: '👀', label: 'Viewer', color: 'blue' },
                        { type: 'contestant', emoji: '🌟', label: 'Contestant', color: 'pink' },
                        { type: 'investor', emoji: '💼', label: 'Partner', color: 'green' },
                      ].map((option) => (
                        <button
                          key={option.type}
                          type="button"
                          onClick={() => setUserType(option.type as 'viewer' | 'contestant' | 'investor')}
                          className={`p-4 rounded-xl border transition-all ${
                            userType === option.type
                              ? option.color === 'blue'
                                ? 'bg-sf-accent-primary/10 border-sf-accent-primary text-sf-accent-primary'
                                : option.color === 'pink'
                                ? 'bg-pink-500/10 border-pink-500 text-pink-400'
                                : 'bg-sf-status-success/10 border-sf-status-success text-sf-status-success'
                              : 'bg-sf-bg-tertiary border-sf-glass-border text-sf-text-tertiary hover:border-sf-glass-border-hover'
                          }`}
                        >
                          <div className="text-2xl mb-1">{option.emoji}</div>
                          <div className="text-sm font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm text-sf-text-tertiary mb-2 font-medium">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="input-primary w-full py-4 text-base"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!email || !userType || isSubmitting}
                    className="w-full btn-primary py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Joining...
                      </span>
                    ) : 'Join Waitlist'}
                  </button>
                </form>
              )}

              {/* Early Perks */}
              <div className="mt-10 pt-8 border-t border-sf-glass-border">
                <div className="text-center text-sm text-sf-text-muted mb-4">Early supporters get:</div>
                <div className="flex flex-wrap justify-center gap-3">
                  {['500 Free Clout', 'Early Access', 'Exclusive Merch'].map((perk) => (
                    <span key={perk} className="badge bg-sf-bg-tertiary text-sf-text-tertiary">{perk}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sf-bg-secondary/50 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-display font-bold mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-sf-text-secondary text-lg">
              Everything you need to know about Star Factor
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {faqData.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.category
                    ? 'bg-gradient-primary text-white shadow-sf-glow-button'
                    : 'bg-sf-bg-tertiary text-sf-text-tertiary hover:bg-sf-bg-hover hover:text-white'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {faqData
              .find((cat) => cat.category === activeCategory)
              ?.questions.map((faq, index) => {
                const faqId = `${activeCategory}-${index}`;
                const isOpen = openFaq === faqId;

                return (
                  <div
                    key={faqId}
                    className={`glass-card overflow-hidden transition-all ${
                      isOpen ? 'ring-1 ring-sf-accent-primary/50' : ''
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faqId)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-sf-glass-bg transition-colors"
                    >
                      <span className="font-medium pr-4">{faq.q}</span>
                      <div className={`w-8 h-8 rounded-lg bg-sf-bg-tertiary flex items-center justify-center flex-shrink-0 transition-all ${isOpen ? 'bg-sf-accent-primary/10 rotate-180' : ''}`}>
                        <svg
                          className={`w-4 h-4 ${isOpen ? 'text-sf-accent-primary' : 'text-sf-text-tertiary'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                      <div className="px-5 pb-5 text-sf-text-secondary leading-relaxed">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Still have questions? */}
          <div className="mt-16 text-center">
            <p className="text-sf-text-tertiary mb-4">Still have questions?</p>
            <a
              href="mailto:support@starfactor.ng"
              className="inline-flex items-center gap-3 btn-secondary px-6 py-3 rounded-xl font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-sf-glass-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center font-bold text-xl shadow-sf-glow-button">
                  SF
                </div>
                <span className="text-2xl font-bold">Star Factor</span>
              </div>
              <p className="text-sf-text-tertiary max-w-md leading-relaxed">
                Africa&apos;s first live interactive reality game show. Watch, predict, vote, and win.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-sf-text-secondary">Links</h4>
              <ul className="space-y-4 text-sf-text-tertiary">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><Link href="/apply" className="hover:text-white transition-colors">Apply as Contestant</Link></li>
                <li><a href="#investors" className="hover:text-white transition-colors">Partners</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#waitlist" className="hover:text-white transition-colors">Join Waitlist</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-sf-text-secondary">Connect</h4>
              <div className="flex gap-3">
                {[
                  { label: 'X', url: 'https://x.com/starfactortv' },
                  { label: 'IG', url: 'https://instagram.com/starfactorlive' },
                  { label: 'TT', url: '#' },
                  { label: 'DC', url: '#' }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 glass rounded-xl flex items-center justify-center text-sf-text-tertiary hover:text-white hover:bg-sf-glass-bg-hover transition-all"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="divider mb-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sf-text-muted text-sm">
              <p>&copy; 2026 Star Factor. All rights reserved.</p>
              <span className="hidden md:inline">•</span>
              <p>Built by <a href="https://x.com/chainfren" target="_blank" rel="noopener noreferrer" className="text-sf-accent-primary hover:text-sf-accent-secondary transition-colors">chainfren</a></p>
            </div>
            <div className="flex gap-6 text-sm text-sf-text-muted">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

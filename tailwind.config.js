/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Chainfren Dark Navy System
        'sf-bg': {
          primary: '#08153C',
          secondary: '#0C1D4D',
          tertiary: '#112758',
          elevated: '#163065',
          hover: '#1C3A75',
        },
        // Chainfren Accent Palette
        'sf-accent': {
          primary: '#4357F6',       // Chainfren Blue (Brand)
          'primary-hover': '#5A6BF8',
          secondary: '#8DAAFF',     // Periwinkle (TiVi signature)
          'secondary-hover': '#A3BBFF',
        },
        // Extended Accent Colors
        'sf-cyan': '#5ACDFF',
        'sf-mint': '#CBF0B8',
        'sf-lime': '#A6D234',
        'sf-lavender': '#E6D9FF',
        'sf-coral': '#FF6B6B',
        'sf-teal': '#1DA6E2',
        'sf-lightblue': '#A6E1FA',
        // Status Colors
        'sf-status': {
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#FF6B6B',
          live: '#FF6B6B',
        },
        // Text Colors (on dark backgrounds)
        'sf-text': {
          primary: '#FFFFFF',
          secondary: '#8DAAFF',     // Periwinkle for secondary text
          tertiary: '#6B82B8',
          muted: '#4A5F8C',
        },
        // Glass Effects (dark navy variant)
        'sf-glass': {
          bg: 'rgba(141, 170, 255, 0.04)',
          'bg-hover': 'rgba(141, 170, 255, 0.08)',
          border: 'rgba(141, 170, 255, 0.12)',
          'border-hover': 'rgba(141, 170, 255, 0.22)',
        },
        // Chainfren Core
        'dark-blue': '#08153C',
      },
      fontFamily: {
        'display': ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(to right, #4357F6, #665DE9)',
        'gradient-primary-hover': 'linear-gradient(to right, #5A6BF8, #7B71EF)',
        'gradient-subtle': 'linear-gradient(135deg, rgba(67, 87, 246, 0.1) 0%, rgba(141, 170, 255, 0.1) 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(141, 170, 255, 0.06) 0%, rgba(141, 170, 255, 0.02) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #4357F6, #8DAAFF)',
        'gradient-cyan': 'linear-gradient(135deg, #5ACDFF, #8DAAFF)',
        'gradient-mint': 'linear-gradient(135deg, #CBF0B8, #A6D234)',
      },
      boxShadow: {
        'sf-sm': '0 1px 3px rgba(8, 21, 60, 0.4)',
        'sf-md': '0 4px 12px rgba(8, 21, 60, 0.5)',
        'sf-lg': '0 10px 25px rgba(8, 21, 60, 0.6)',
        'sf-xl': '0 20px 40px rgba(8, 21, 60, 0.7)',
        'sf-glow': '0 0 40px rgba(67, 87, 246, 0.2)',
        'sf-glow-lg': '0 0 60px rgba(67, 87, 246, 0.3)',
        'sf-glow-cyan': '0 0 40px rgba(90, 205, 255, 0.2)',
        'sf-glow-button': '0 4px 20px rgba(67, 87, 246, 0.3)',
        'sf-glow-button-hover': '0 6px 30px rgba(67, 87, 246, 0.45)',
        'sf-card': '0 2px 16px rgba(8, 21, 60, 0.3), 0 0 1px rgba(141, 170, 255, 0.1)',
      },
      borderRadius: {
        'sf-sm': '0.375rem',
        'sf-md': '0.5rem',
        'sf-lg': '0.75rem',
        'sf-xl': '1rem',
        'sf-2xl': '1.5rem',
        'sf-card': '24px',
      },
      fontSize: {
        'hero': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '900' }],
        'display': ['clamp(1.75rem, 4vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'subtitle': ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        'label': ['0.625rem', { lineHeight: '1', letterSpacing: '0.15em', fontWeight: '700' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'underline-draw': 'underlineDraw 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.6s forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(67, 87, 246, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(67, 87, 246, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        underlineDraw: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'brand': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
        'glass-heavy': '20px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}

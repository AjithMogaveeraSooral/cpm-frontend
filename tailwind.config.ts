import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cypress: {
          50: '#eefdf3',
          100: '#d6f9e1',
          200: '#aff1c6',
          300: '#79e3a4',
          400: '#3fcd7c',
          500: '#1ab35f',
          600: '#0f904c',
          700: '#0e7240',
          800: '#105a35',
          900: '#0e4a2d',
        },
        gold: {
          50: '#fbf8ef',
          100: '#f5edd2',
          200: '#ebd9a3',
          300: '#dfbf6c',
          400: '#d4a544',
          500: '#c68f30',
          600: '#a87225',
          700: '#875620',
          800: '#714621',
          900: '#613b20',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        card: '0 1px 3px rgba(15, 23, 42, 0.05), 0 8px 24px -8px rgba(15, 23, 42, 0.10)',
        elevated: '0 4px 12px rgba(15, 23, 42, 0.06), 0 18px 40px -12px rgba(15, 23, 42, 0.18)',
        glow: '0 8px 24px -6px rgba(15, 144, 76, 0.45)',
        'glow-sm': '0 4px 14px -4px rgba(15, 144, 76, 0.40)',
        'inner-top': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
      },
      backgroundImage: {
        'cypress-gradient': 'linear-gradient(135deg, #0f904c 0%, #0e7240 50%, #105a35 100%)',
        'cypress-radial':
          'radial-gradient(1200px circle at 0% 0%, rgba(26,179,95,0.18), transparent 45%), radial-gradient(1000px circle at 100% 100%, rgba(14,114,64,0.16), transparent 40%)',
        sheen: 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.45) 50%, transparent 75%)',
        'grid-faint':
          'linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'shimmer-bg': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-down': 'fade-in-down 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
        skeleton: 'shimmer-bg 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;

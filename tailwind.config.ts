import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette is driven by CSS variables (see globals.css) so the whole
        // site can be re-themed at runtime via a `data-theme` attribute on <html>.
        cypress: {
          50: 'rgb(var(--cypress-50) / <alpha-value>)',
          100: 'rgb(var(--cypress-100) / <alpha-value>)',
          200: 'rgb(var(--cypress-200) / <alpha-value>)',
          300: 'rgb(var(--cypress-300) / <alpha-value>)',
          400: 'rgb(var(--cypress-400) / <alpha-value>)',
          500: 'rgb(var(--cypress-500) / <alpha-value>)',
          600: 'rgb(var(--cypress-600) / <alpha-value>)',
          700: 'rgb(var(--cypress-700) / <alpha-value>)',
          800: 'rgb(var(--cypress-800) / <alpha-value>)',
          900: 'rgb(var(--cypress-900) / <alpha-value>)',
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
        glow: '0 8px 24px -6px rgb(var(--cypress-600) / 0.45)',
        'glow-sm': '0 4px 14px -4px rgb(var(--cypress-600) / 0.40)',
        'inner-top': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
      },
      backgroundImage: {
        'cypress-gradient':
          'linear-gradient(135deg, rgb(var(--cypress-600)) 0%, rgb(var(--cypress-700)) 50%, rgb(var(--cypress-800)) 100%)',
        'cypress-radial':
          'radial-gradient(1200px circle at 0% 0%, rgb(var(--cypress-500) / 0.18), transparent 45%), radial-gradient(1000px circle at 100% 100%, rgb(var(--cypress-700) / 0.16), transparent 40%)',
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

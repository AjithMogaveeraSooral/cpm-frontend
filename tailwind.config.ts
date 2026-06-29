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
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

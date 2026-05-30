/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0eeff', 100: '#e3ddff', 200: '#c9beff',
          300: '#a895ff', 400: '#8b6aff', 500: '#7c5cfc',
          600: '#6c3cec', 700: '#5a2dd4', 800: '#4a26b0', 900: '#3d228e',
        },
        ocean: { 400: '#5c9cfc', 500: '#4c8cec', 600: '#3a7ae0' },
        emerald: { 400: '#5cfcd8', 500: '#3ce8c0' },
        surface: {
          DEFAULT: '#0d0d14', 2: '#12121c', 3: '#181826', 4: '#1e1e2e', 5: '#252538',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      boxShadow: {
        'glow-brand': '0 0 30px rgba(124,92,252,0.3)',
        'glow-sm':    '0 0 15px rgba(124,92,252,0.2)',
        'card':       '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
        },
        hamster: {
          bg: '#0F172A',
          board: '#1E293B',
          felt: '#14251D',
          wood: '#2E1A0F',
          gold: '#FFD700',
          acorn: '#D97706',
        }
      },
      fontFamily: {
        thai: ['Prompt', 'Sarabun', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px rgba(234, 179, 8, 0.45)',
        'glow-gold-lg': '0 0 40px rgba(245, 158, 11, 0.55)',
        'glow-red': '0 0 25px rgba(239, 68, 68, 0.45)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.45)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.45)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(6px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.04)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite',
        float: 'float 3.5s ease-in-out infinite',
        'float-reverse': 'float-reverse 4s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
      }
    },
  },
  plugins: [],
}

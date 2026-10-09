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
        'glow-red': '0 0 25px rgba(239, 68, 68, 0.45)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.45)',
      }
    },
  },
  plugins: [],
}

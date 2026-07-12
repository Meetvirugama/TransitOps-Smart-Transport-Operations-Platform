/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#B25E13',
          hover: '#924C0D',
          glow: 'rgba(178, 94, 19, 0.35)',
        },
        dark: {
          bg: '#020617',
          card: '#0B0F19',
          sidebar: '#070A12',
          border: '#1E293B',
          text: '#F8FAFC',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}

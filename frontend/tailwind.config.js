/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Turso Tokens
        'deep-space': '#0d1318',
        'obsidian': '#121b1f',
        'carbon-teal': '#162129',
        'slate-drift': '#283945',
        'bone-white': '#ffffff',
        'ash-gray': '#c5cace',
        'fog-gray': '#b6b8ba',
        'smoke-gray': '#86898c',
        'pewter': '#9ea1a3',
        'mint-signal': '#4ff7d1',
        'deep-teal': '#0e342d',
        'electric-magenta': '#d946ef',
        'plum-edge': '#a21caf',

        // Compatibility Mappings
        brand: {
          DEFAULT: '#4ff7d1', // Mint Signal
          hover: '#3ee0be',
        },
        dark: {
          bg: '#0d1318',      // Deep Space
          card: '#162129',    // Carbon Teal
          sidebar: '#121b1f', // Obsidian
          border: '#283945',  // Slate Drift
          text: '#ffffff',    // Bone White
          muted: '#86898c',   // Smoke Gray
        },
        accent: {
          cyan: '#b6b8ba',    // Fog Gray
          green: '#4ff7d1',   // Mint Signal
          blue: '#c5cace',    // Ash Gray
          orange: '#a21caf',  // Plum Edge
          red: '#d946ef',     // Electric Magenta
          grey: '#9ea1a3',    // Pewter
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter', 'sans-serif'], // Turso uses Inter globally
        mono: ['Fira Code', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.025em',
      }
    },
  },
  plugins: [],
}

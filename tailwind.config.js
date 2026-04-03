/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line is CRITICAL
  ],
  theme: {
    extend: {
      colors: {
        base: "#020617",      // Midnight Blue
        surface: "#1e1b4b",   // Deep Purple / Navy
        accent: "#FACC15",    // Royal Gold (from your logo)
        highlight: "#DB2777", // Magenta Accent
        muted: "#94a3b8",     // Slate for non-important text
      },
      backgroundImage: {
        'royal-gradient': "linear-gradient(to bottom right, #020617, #2E1065)",
      },
      keyframes: {
        'pulse-grow': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        }
      },
      animation: {
        'pulse-grow': 'pulse-grow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
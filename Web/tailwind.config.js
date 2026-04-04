/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🌑 Base System
        bg: '#301B66',
        surface: '#1E1B4B',

        // 🎨 Brand System (Core Identity)
        primary: '#9D01E9',     // Main purple
        secondary: '#C53099',   // Magenta
        accent: '#E4BD8D',      // Soft peach (highlight)

        // ✨ Interaction States
        primaryHover: '#9D43C9',
        glow: '#E31E6E',

        // 📝 Text System
        text: '#F8FAFC',
        textMuted: '#AF94D2',
      },

      backgroundImage: {
        // Primary CTA gradient
        'gradient-main': 'linear-gradient(135deg, #9D01E9, #C53099)',

        // Soft ambient glow
        'gradient-glow': 'radial-gradient(circle, rgba(157,1,233,0.2), transparent)',
        
        // Keep previous animations if needed, but the user provided a full file-like block
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
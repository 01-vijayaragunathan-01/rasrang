import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Compass } from 'lucide-react';

export default function NotFound() {
  const { theme } = useTheme();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden bg-transparent">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9D01E9]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#22D3EE]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">
        {/* Funny SVG Compass Asset */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="relative w-full max-w-[300px] aspect-square flex items-center justify-center">
            {/* Radar / Shockwave Rings */}
            <motion.div 
              animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full border-2 border-[#22D3EE]/30"
            />
            <motion.div 
              animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 4, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full border border-[#E31E6E]/20"
            />
            
            {/* Wildly Spinning Compass */}
            <motion.div
              animate={{ 
                rotate: [0, 180, 10, -180, 45, 270, 0],
                scale: [1, 1.05, 0.95, 1.1, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 text-[#C53099]"
              style={{ filter: `drop-shadow(0 0 30px ${theme.colors.secondary}90)` }}
            >
              <Compass size={200} strokeWidth={0.5} />
            </motion.div>
            
            {/* Floating Confusion Marks */}
            <motion.div
              animate={{ y: [0, -40, 0], x: [0, 20, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
              className="absolute top-10 right-4 text-4xl font-bold font-massive text-[#E4BD8D] drop-shadow-[0_0_15px_#E4BD8D]"
            >
              ?
            </motion.div>
            <motion.div
              animate={{ y: [0, -50, 0], x: [0, -15, 0], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 3.5, delay: 1.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute bottom-12 left-2 text-5xl font-bold font-massive text-[#22D3EE] drop-shadow-[0_0_15px_#22D3EE]"
            >
              ?
            </motion.div>
            <motion.div
              animate={{ y: [-20, -60, -20], x: [0, -10, 0], opacity: [0, 0.8, 0], rotate: [0, 45, 0] }}
              transition={{ duration: 2.8, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute top-2 left-10 text-2xl font-bold font-massive text-[#E31E6E] drop-shadow-[0_0_15px_#E31E6E]"
            >
              !
            </motion.div>
          </div>
        </div>

        {/* 404 Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start"
        >
          <h1 className="text-8xl md:text-9xl font-black mb-2 font-massive text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.secondary})` }}>
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-cultural tracking-wide">
            Lost the Cosmic Rhythm?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-md mx-auto md:mx-0 leading-relaxed">
            It looks like this path drifted off into deep space. The coordinates you provided lead to a dimension without culture or art. Let's guide you back to the main stage.
          </p>
          
          <Link to="/">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all cursor-pointer border border-transparent hover:border-white/20"
              style={{ backgroundColor: theme.colors.accent, color: "#13072E", boxShadow: `0 0 20px ${theme.colors.accent}40` }}
            >
              <Compass size={18} />
              Return to Nexus
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

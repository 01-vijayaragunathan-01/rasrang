import React, { useMemo } from 'react';
import multiavatar from '@multiavatar/multiavatar/esm';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function AvatarPicker({ seed, setSeed, size = 120 }) {
  const svg = useMemo(() => multiavatar(seed || 'default'), [seed]);

  const randomize = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setSeed(newSeed);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative group">
        {/* Animated Rings from Profile Layout theme */}
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border-2 border-dashed border-[#9D01E9]/30 rounded-full pointer-events-none"
        />
        <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-6 border border-dotted border-[#E31E6E]/20 rounded-full pointer-events-none"
        />

        {/* Avatar Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={seed}
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
            className="relative z-10 p-1 rounded-full bg-gradient-to-tr from-[#9D01E9] to-[#E31E6E] shadow-[0_0_40px_rgba(157,1,233,0.3)]"
            style={{ width: size + 8, height: size + 8 }}
          >
            <div 
              className="w-full h-full rounded-full bg-[#0D0620] overflow-hidden flex items-center justify-center pointer-events-none"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Randomize Button Overlay */}
        <button
          onClick={randomize}
          className="absolute -bottom-2 -right-2 z-20 w-10 h-10 bg-white text-black rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group/btn"
          title="Generate Random Identity"
        >
          <RefreshCw size={18} className="group-hover/btn:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      <div className="w-full max-w-xs relative group text-center">
        <label className="text-[10px] uppercase tracking-[0.3em] text-[#AF94D2]/60 font-black mb-3 block">
          Identity Seed
        </label>
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="Type to generate..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-sm font-bold outline-none focus:border-[#9D01E9] focus:bg-white/10 transition-all placeholder:text-white/20"
        />
        <p className="mt-3 text-[9px] text-white/30 uppercase tracking-widest leading-relaxed">
          Your unique visual signature is generated<br/>from this biometric seed string.
        </p>
      </div>
    </div>
  );
}

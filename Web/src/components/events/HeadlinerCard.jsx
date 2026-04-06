import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Ticket } from "lucide-react";
import DOMPurify from "dompurify";
import { useCountdown } from "../../hooks/useCountdown";

/**
 * HeadlinerCard component for high-priority festival events.
 * Features a reveal countdown and thematic animations.
 */
export function HeadlinerCard({ headliner }) {
  const { timeLeft, isUnlocked } = useCountdown(headliner.unlockDate);

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden group shadow-2xl border border-[#C53099]/20 hover:border-[#E4BD8D]/50 transition-all duration-700 bg-[#1A0B2E]" style={{ height: "460px" }}>
      <motion.div
        className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
        animate={{ filter: isUnlocked ? "blur(0px) brightness(0.9)" : "blur(20px) brightness(0.4)" }}
        transition={{ duration: 1.5 }}
        style={{ backgroundImage: `url(${headliner.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-4 border border-white/10 rounded-[1.5rem] pointer-events-none z-10" />

      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-t from-[#13072E] to-transparent"
          >
            <Sparkles className="w-12 h-12 text-[#E4BD8D] mb-6 animate-pulse" />
            <h3 className="text-3xl font-bold uppercase tracking-widest mb-4 text-white drop-shadow-md" style={{ fontFamily: "'Playfair Display', serif" }}>Grand Reveal</h3>
            <p className="text-sm uppercase tracking-[0.3em] mb-8 text-[#C53099] font-medium">The stage opens in</p>
            <div className="flex gap-4 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-5 rounded-2xl shadow-xl">
              {Object.entries(timeLeft).map(([unit, val]) => (
                <div key={unit} className="flex flex-col items-center w-12 sm:w-14">
                  <span className="text-3xl sm:text-4xl font-light text-white">{val}</span>
                  <span className="text-[10px] uppercase font-bold mt-1 text-[#E4BD8D] tracking-widest">{unit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="absolute inset-0 flex flex-col justify-end p-10 sm:p-12 bg-gradient-to-t from-[#13072E] via-[#13072E]/60 to-transparent"
          >
            <span className="text-xs font-bold uppercase tracking-[0.3em] mb-3 text-[#E4BD8D]">✦ {headliner.category} ✦</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              {headliner.title}
            </h2>
            <div
              className="text-sm text-white/80 max-w-lg mb-8 leading-relaxed quill-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(headliner.description) }}
            />
            <button
              className="w-fit flex items-center gap-3 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[0_0_30px_rgba(227,30,110,0.4)]"
              style={{ background: `linear-gradient(135deg, #C53099, #9D01E9)` }}
            >
              <Ticket className="w-4 h-4" />
              Reserve VIP Pass
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

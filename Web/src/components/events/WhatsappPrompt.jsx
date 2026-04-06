import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * WhatsappPrompt component for post-registration communication.
 * Encourages users to join official event groups for updates.
 */
export function WhatsappPrompt({ link, onClose }) {
  if (!link) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-[#13072E] border-2 border-[#25D366]/40 rounded-3xl p-8 shadow-[0_0_50px_rgba(37,211,102,0.2)] text-center"
        >
          <div className="w-16 h-16 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#25D366]/50 shadow-[0_0_20px_rgba(37,211,102,0.4)]">
            <Sparkles className="w-8 h-8 text-[#25D366]" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-widest text-[#25D366] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Mission Success
          </h3>
          <p className="text-white/70 text-sm font-medium mb-8">
            Your pass has been secured. Join the official comms channel to stay updated on critical intelligence for this event.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={link} target="_blank" rel="noreferrer"
              onClick={onClose}
              className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all bg-[#25D366] text-[#13072E] hover:bg-white hover:text-black shadow-xl flex items-center justify-center gap-2"
            >
              Join WhatsApp Comms
            </a>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 border border-white/10"
            >
              Dismiss / Join Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "SURE ABOUT THIS?", 
    message = "THIS ACTION IS IRREVERSIBLE. SYSTEM INTEL WILL BE PURGED.",
    confirmText = "TERMINATE",
    cancelText = "ABORT"
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1005] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-[#0A0A0A] border-4 border-[#E31E6E] p-1 shadow-[20px_20px_0px_#22D3EE] overflow-hidden"
                    >
                        {/* Hazard Stripes Header */}
                        <div className="bg-[#E31E6E] p-4 flex items-center gap-3 relative">
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }} />
                            <AlertCircle className="w-6 h-6 text-black relative z-10" />
                            <h3 className="text-xl font-black uppercase italic text-black tracking-[0.2em] relative z-10">{title}</h3>
                            <button onClick={onClose} className="ml-auto text-black hover:scale-110 transition-transform relative z-10">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <p className="text-white/80 font-bold uppercase tracking-widest text-sm leading-relaxed italic border-l-4 border-[#E31E6E] pl-4">
                                {message}
                            </p>

                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => { onConfirm(); onClose(); }}
                                    className="w-full py-4 bg-[#E31E6E] text-white font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> {confirmText}
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="w-full py-3 bg-white/5 text-white/40 font-black uppercase tracking-[0.3em] hover:bg-white/10 hover:text-white transition-all"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>

                        {/* Scanline Effect */}
                        <motion.div 
                            className="absolute inset-0 pointer-events-none opacity-5"
                            animate={{ y: ['-100%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            style={{ background: 'linear-gradient(transparent, #22D3EE, transparent)' }}
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

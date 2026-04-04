import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FestivalModal({ isOpen, onClose, children }) {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
                    
                    {/* The Blur Backdrop (Clicking it closes the modal) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl cursor-pointer"
                    />

                    {/* The Brutalist Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30, rotate: -2 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30, rotate: 2 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-3xl bg-[#1E1B4B] border-2 border-[#22D3EE] p-1 shadow-[12px_12px_0px_#9D01E9] max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Gritty Texture Overlay */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                        {/* Close Button (Neon X) */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 text-white/50 hover:text-[#E31E6E] hover:rotate-90 transition-all duration-300 bg-[#020617]/50 p-2 backdrop-blur-md"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Scrollable Inner Content Area */}
                        <div className="relative z-10 p-6 md:p-10 overflow-y-auto hide-scrollbar flex-grow">
                            {children}
                        </div>
                    </motion.div>

                </div>
            )}
        </AnimatePresence>
    );
}

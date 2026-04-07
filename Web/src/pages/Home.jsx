import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import About from "./home/About";
import Hero from "./home/Hero";
import PastEvents from "./home/PastEvents";
import HeadlineDJ from "../components/home/HeadlineDJ";
import { X, Sparkles, Search, Eye, Terminal, MapPin } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Home = () => {
    const { theme } = useTheme();
    const [showPopup, setShowPopup] = useState(false);
    const [hint, setHint] = useState("");

    const LOGO_PATH = "/Assets/rasrang.png";

    // 1. Initial Popup Trigger Logic
    useEffect(() => {
        const isDevMode = import.meta.env.VITE_DEV_MODE === "true";
        const expirationDate = new Date("April 10, 2026 23:59:59").getTime();
        const now = new Date().getTime();
        const hasSeenPopup = localStorage.getItem("rasrang_reveal_seen");

        if (now < expirationDate) {
            if (isDevMode || !hasSeenPopup) {
                const timer = setTimeout(() => setShowPopup(true), 1200);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    // 2. Lock the body scroll natively when popup is open so the background doesn't move
    useEffect(() => {
        if (showPopup) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showPopup]);

    const closePopup = () => {
        localStorage.setItem("rasrang_reveal_seen", "true");
        setShowPopup(false);
    };

    const handleRevealHint = (type) => {
        if (type === 'benny') {
            setHint("MISSION: Locate the Legend in the 'Pro Shows Revealed' section. 🎤");
        } else {
            setHint("MISSION: Head to 'Sonic Takeover' to intercept Beat Empress: The Vibe Setter. 🎧");
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="relative w-full bg-transparent">
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        // The overlay wrapper securely centers the card and does NOT scroll
                        className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-2xl font-massive flex items-center justify-center p-4"
                    >
                        {/* 🎞️ HUD Scanline & Grid Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-[0] opacity-[0.05]">
                            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                        </div>

                        {/* --- THE CARD ITSELF --- 
                          * Limited to 90% of screen height (max-h-[90dvh]) and hides overflow 
                          */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 1.1, opacity: 0, filter: "blur(20px)" }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="relative w-full max-w-xl bg-[#070707] border border-white/10 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,1)] max-h-[90dvh] flex flex-col z-10 overflow-hidden"
                        >
                            {/* Close Button - Stays fixed at the top right of the popup box */}
                            <button
                                onClick={closePopup}
                                className="absolute top-6 right-6 z-50 p-2 text-white/20 hover:text-white transition-all hover:bg-white/5 rounded-full group bg-[#070707]/80 backdrop-blur-md"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform" />
                            </button>

                            {/* --- THE INNER SCROLL AREA --- 
                              * This area handles the scrolling if content gets too tall 
                              */}
                            <div className="w-full overflow-y-auto p-6 sm:p-10 pt-16 custom-scroll-area">
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="relative z-10 text-center space-y-8"
                                >
                                    {/* Header Branding */}
                                    <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
                                        <img src={LOGO_PATH} alt="RasRang" className="h-10 w-auto opacity-80" />
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                                            <Terminal size={12} /> System Overload
                                        </div>
                                    </motion.div>

                                    <motion.h2
                                        variants={itemVariants}
                                        className="text-6xl sm:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.8]"
                                    >
                                        ARTISTS <br />
                                        <span
                                            className="text-transparent bg-clip-text"
                                            style={{
                                                backgroundImage: `linear-gradient(to right, ${theme.colors.highlight}, ${theme.colors.primary})`,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent'
                                            }}
                                        >
                                            REVEALED
                                        </span>
                                    </motion.h2>

                                    {/* Intel Display Area */}
                                    <motion.div variants={itemVariants} className="min-h-[70px] flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            {hint ? (
                                                <motion.div
                                                    key={hint}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-white/[0.03] border-l-4 p-4 text-[11px] md:text-xs tracking-tight italic text-[#E4BD8D] w-full flex items-center gap-4 text-left"
                                                    style={{ borderColor: theme.colors.highlight }}
                                                >
                                                    <div className="p-2 bg-white/5 rounded-full text-cyan-400">
                                                        <MapPin size={14} className="animate-bounce" />
                                                    </div>
                                                    {hint}
                                                </motion.div>
                                            ) : (
                                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 animate-pulse">
                                                    [ Select Target to Locate ]
                                                </p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    {/* Artist Cards */}
                                    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 w-full">

                                        {/* Benny Dayal Card */}
                                        <motion.button
                                            whileHover={{ y: -4 }}
                                            onClick={() => handleRevealHint('benny')}
                                            className="relative group h-32 overflow-hidden flex-shrink-0"
                                        >
                                            <div
                                                className="absolute inset-0 bg-white/[0.03] border border-white/10 group-hover:border-[#E31E6E]/50 transition-colors"
                                                style={{ clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)' }}
                                            />
                                            <motion.div
                                                animate={{ top: ["-100%", "200%"] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-transparent via-[#E31E6E]/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100"
                                            />
                                            <div className="absolute inset-0 p-5 flex flex-col justify-between items-start text-left">
                                                <div className="flex justify-between w-full items-start">
                                                    <span className="text-[8px] font-black text-[#E31E6E] uppercase tracking-widest bg-[#E31E6E]/10 px-2 py-0.5">
                                                        SEC_FILE // B.D.
                                                    </span>
                                                    <Search size={14} className="text-white/20 group-hover:text-[#E31E6E] transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black text-white italic tracking-tighter leading-none group-hover:scale-105 transition-transform origin-left uppercase">
                                                        Benny D.
                                                    </p>
                                                    <p className="text-[7px] text-white/30 font-bold uppercase mt-1">Status: Revealed</p>
                                                </div>
                                            </div>
                                        </motion.button>

                                        {/* DJ Deepika Card */}
                                        <motion.button
                                            whileHover={{ y: -4 }}
                                            onClick={() => handleRevealHint('deepika')}
                                            className="relative group h-32 overflow-hidden flex-shrink-0"
                                        >
                                            <div
                                                className="absolute inset-0 bg-white/[0.03] border border-white/10 group-hover:border-cyan-400/50 transition-colors"
                                                style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}
                                            />
                                            <motion.div
                                                animate={{ top: ["-100%", "200%"] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                                                className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100"
                                            />
                                            <div className="absolute inset-0 p-5 flex flex-col justify-between items-start text-left">
                                                <div className="flex justify-between w-full items-start">
                                                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-0.5">
                                                        FRQ_LOCK // DPKA
                                                    </span>
                                                    <Eye size={14} className="text-white/20 group-hover:text-cyan-400 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black text-white italic tracking-tighter leading-none group-hover:scale-105 transition-transform origin-left uppercase">
                                                        Deepika
                                                    </p>
                                                    <p className="text-[7px] text-white/30 font-bold uppercase mt-1">Status: Revealed</p>
                                                </div>
                                            </div>
                                        </motion.button>
                                    </motion.div>

                                    {/* CTA Button */}
                                    <motion.div variants={itemVariants} className="pt-4 pb-2">
                                        <motion.button
                                            onClick={closePopup}
                                            whileHover={{ scale: 0.98, backgroundColor: "#fff", color: "#000" }}
                                            className="group flex flex-col items-center justify-center gap-1 w-full py-4 border border-white/10 text-white/60 font-black uppercase italic tracking-[0.2em] transition-all text-[10px] rounded-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                        >
                                            <span className="flex items-center gap-2">
                                                COMMENCE SITE ENTRY <Sparkles size={12} />
                                            </span>
                                        </motion.button>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Custom scrollbar styling so it looks good on the dark card */}
                        <style dangerouslySetInnerHTML={{ __html: `
                            .custom-scroll-area::-webkit-scrollbar { width: 6px; }
                            .custom-scroll-area::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
                            .custom-scroll-area::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
                            .custom-scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
                        `}} />
                    </motion.div>
                )}
            </AnimatePresence>

            <Hero />
            <div className="relative z-10 bg-transparent">
                <About />
                <div id="headline-dj">
                    <HeadlineDJ />
                </div>
                <PastEvents />
            </div>
        </div>
    );
};

export default Home;
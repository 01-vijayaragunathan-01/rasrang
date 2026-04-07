import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import About from "./home/About";
import Hero from "./home/Hero";
import PastEvents from "./home/PastEvents";
import HeadlineDJ from "../components/home/HeadlineDJ";
import { X, Sparkles, Search, Eye, Radio, Info, Terminal } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Home = () => {
    const { theme } = useTheme();
    const [showPopup, setShowPopup] = useState(false);
    const [hint, setHint] = useState("");

    const LOGO_PATH = "/Assets/rasrang.png";

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

    useEffect(() => {
        if (showPopup) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
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

    return (
        <div className="relative w-full bg-transparent">
            <AnimatePresence>
                {showPopup && (
                    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/98 backdrop-blur-2xl font-massive overflow-hidden">
                        
                        {/* 🎞️ HUD Scanline & Grid Overlay */}
                        <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.05] overflow-hidden">
                            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                        </div>

                        <div className="flex-1 flex items-center justify-center px-4 pt-28 pb-12 overflow-hidden w-full relative z-10">
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 1.05, opacity: 0, filter: "blur(20px)" }}
                                className="relative w-full max-w-xl max-h-full flex flex-col"
                            >
                                <div className="relative bg-[#070707] border border-white/10 rounded-[2rem] overflow-y-auto shadow-[0_0_100px_rgba(0,0,0,1)] custom-scroll-area p-6 sm:p-10 pt-12">
                                    
                                    <button onClick={closePopup} className="absolute top-6 right-6 z-50 p-2 text-white/20 hover:text-white transition-all hover:bg-white/5 rounded-full group">
                                        <X size={20} className="group-hover:rotate-90 transition-transform" />
                                    </button>

                                    <div className="relative z-10 text-center space-y-8">
                                        {/* Header Branding */}
                                        <div className="flex flex-col items-center gap-4">
                                            <img src={LOGO_PATH} alt="RasRang" className="h-10 w-auto opacity-80" />
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                                                <Terminal size={12} /> System Overload
                                            </div>
                                        </div>

                                        <h2 className="text-6xl sm:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.8]">
                                            ARTISTS <br /> 
                                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${theme.colors.highlight}, ${theme.colors.primary})` }}>
                                                REVEALED
                                            </span>
                                        </h2>

                                        {/* Intel Display Area */}
                                        <div className="min-h-[70px] flex items-center justify-center">
                                            <AnimatePresence mode="wait">
                                                {hint ? (
                                                    <motion.div 
                                                        key={hint}
                                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                                        className="bg-white/[0.03] border-l-4 p-4 text-[11px] md:text-xs tracking-tight italic text-white/80 w-full flex items-center gap-4 text-left"
                                                        style={{ borderColor: theme.colors.highlight }}
                                                    >
                                                        <div className="p-2 bg-white/5 rounded-full text-cyan-400">
                                                            <Radio size={14} className="animate-pulse" />
                                                        </div>
                                                        {hint}
                                                    </motion.div>
                                                ) : (
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 animate-pulse">
                                                        [ Awaiting Selection ]
                                                    </p>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* --- IMPROVED ARTIST LIST BOX DESIGN --- */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 w-full">
                                            
                                            {/* Benny Dayal Card */}
                                            <motion.button 
                                                whileHover={{ y: -4 }}
                                                onClick={() => handleRevealHint('benny')}
                                                className="relative group h-32 overflow-hidden"
                                            >
                                                {/* Cyber-Clip Background Design */}
                                                <div className="absolute inset-0 bg-white/[0.03] border border-white/10 group-hover:border-[#E31E6E]/50 transition-colors" 
                                                     style={{ clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)' }} />
                                                
                                                {/* Scanning Light Effect */}
                                                <motion.div 
                                                    animate={{ top: ["-100%", "200%"] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                    className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-transparent via-[#E31E6E]/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100" 
                                                />

                                                <div className="absolute inset-0 p-5 flex flex-col justify-between items-start text-left">
                                                    <div className="flex justify-between w-full items-start">
                                                        <span className="text-[8px] font-black text-[#E31E6E] uppercase tracking-widest bg-[#E31E6E]/10 px-2 py-0.5">SEC_FILE // B.D.</span>
                                                        <Search size={14} className="text-white/20 group-hover:text-[#E31E6E] transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-black text-white italic tracking-tighter leading-none group-hover:scale-110 transition-transform origin-left uppercase">The Legend</p>
                                                        <div className="flex gap-1 mt-2 h-1 w-12">
                                                            <div className="flex-1 bg-[#E31E6E]/40" />
                                                            <div className="flex-1 bg-[#E31E6E]/40" />
                                                            <div className="flex-1 bg-white/20" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.button>

                                            {/* DJ Deepika Card */}
                                            <motion.button 
                                                whileHover={{ y: -4 }}
                                                onClick={() => handleRevealHint('deepika')}
                                                className="relative group h-32 overflow-hidden"
                                            >
                                                {/* Cyber-Clip Background Design */}
                                                <div className="absolute inset-0 bg-white/[0.03] border border-white/10 group-hover:border-cyan-400/50 transition-colors" 
                                                     style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }} />
                                                
                                                {/* Scanning Light Effect */}
                                                <motion.div 
                                                    animate={{ top: ["-100%", "200%"] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                                                    className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100" 
                                                />

                                                <div className="absolute inset-0 p-5 flex flex-col justify-between items-start text-left">
                                                    <div className="flex justify-between w-full items-start">
                                                        <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-0.5">FRQ_LOCK // DPKA</span>
                                                        <Eye size={14} className="text-white/20 group-hover:text-cyan-400 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-black text-white italic tracking-tighter leading-none group-hover:scale-110 transition-transform origin-left uppercase">Vibe Setter</p>
                                                        <div className="flex gap-1 mt-2 h-1 w-12">
                                                            <div className="flex-1 bg-cyan-400/40" />
                                                            <div className="flex-1 bg-cyan-400/40" />
                                                            <div className="flex-1 bg-white/20" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        </div>

                                        <div className="pt-4 pb-2">
                                            <motion.button 
                                                onClick={closePopup}
                                                whileHover={{ scale: 0.98, backgroundColor: "#fff", color: "#000" }}
                                                className="group flex flex-col items-center justify-center gap-1 w-full py-4 border border-white/10 text-white/60 font-black uppercase italic tracking-[0.2em] transition-all text-[10px] rounded-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                            >
                                                <span className="flex items-center gap-2">INITIATE SITE ENTRY <Sparkles size={12} /></span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <style dangerouslySetInnerHTML={{ __html: `
                            .custom-scroll-area::-webkit-scrollbar { width: 4px; }
                            .custom-scroll-area::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                        `}} />
                    </div>
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
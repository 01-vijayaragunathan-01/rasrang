import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Flame, Headphones, Globe } from 'lucide-react';

const HeadlineDJ = () => {
    const { theme } = useTheme();
    const containerRef = useRef(null);

    // 1. Desktop Parallax for DJ Gowtham Background
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);

    // 2. Interactive State for DJ Deepika Images
    const [isPortraitFront, setIsPortraitFront] = useState(true);

    // 3. Staggered Animation Variants
    const textContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
        }
    };

    const textItemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    // 4. Mouse Parallax Logic (Deepika Section)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const dx = useSpring(mouseX, springConfig);
    const dy = useSpring(mouseY, springConfig);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x * 30);
        mouseY.set(y * 30);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <div className="w-full flex flex-col bg-transparent overflow-hidden py-24">
            {/* =========================================
                SECTION HEADER (Consistent with Home)
            ========================================== */}
            <div className="text-center mb-20 max-w-7xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <p className="text-xs tracking-[0.5em] uppercase mb-4 font-bold font-accent drop-shadow-md" style={{ color: theme.colors.accent }}>
                        ✦ The Night Shift ✦
                    </p>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-wider font-massive" style={{ color: theme.colors.textTitle }}>
                        Sonic <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${theme.colors.highlight}, ${theme.colors.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Takeover</span>
                    </h2>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${theme.colors.primary}60)` }} />
                        <div className="w-2 h-2 rotate-45" style={{ backgroundColor: `${theme.colors.accent}60` }} />
                        <div className="h-px w-20" style={{ background: `linear-gradient(to left, transparent, ${theme.colors.primary}60)` }} />
                    </div>
                </motion.div>
            </div>
            {/* =========================================
                PART 1: DJ GOWTHAM (PARALLAX HEADER)
            ========================================== */}
            <section
                ref={containerRef}
                className="relative w-full h-[80vh] md:h-screen overflow-hidden flex items-center justify-center bg-black"
            >
                <motion.div
                    style={{ y, scale }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="/Assets/hero/djgoutham.jpeg"
                        alt="DJ Gowtham Headliner"
                        className="w-full h-[120%] object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
                </motion.div>

                <div className="absolute inset-0 z-10 opacity-30 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-20 container mx-auto px-6 flex flex-col items-center text-center space-y-8"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="px-4 py-1.5 rounded-md border border-cyan-500/50 bg-cyan-500/10 backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    >
                        <span className="text-[10px] md:text-xs font-black tracking-[0.4em] uppercase text-cyan-400">
                            Main Stage Intel Unlocked
                        </span>
                    </motion.div>

                    <div className="space-y-2">
                        <h2 className="text-6xl md:text-8xl lg:text-9xl font-black font-massive italic uppercase text-white tracking-tighter leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            DJ GOWTHAM
                        </h2>
                        <p className="text-xl md:text-3xl font-light tracking-[0.2em] uppercase text-cyan-300/80 font-massive">
                            Audio Dominance • April 09
                        </p>
                    </div>

                    <div className="max-w-2xl pt-8 border-t border-white/10 flex flex-col items-center">
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm md:text-lg text-gray-400 font-medium italic leading-relaxed font-body mb-6"
                        >
                            "Prepare for the frequency shift. When the sun sets on day one, the rhythm takes command. Feel the pulse, embrace the energy, and witness the main stage takeover."
                        </motion.p>

                        <motion.a
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            href="https://www.instagram.com/djgowthamofficial/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-white/60 hover:text-cyan-400 transition-colors text-xs font-bold uppercase tracking-widest group"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="group-hover:scale-110 transition-transform"
                            >
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                            @djgowthamofficial
                        </motion.a>
                    </div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="pt-12 text-[10px] tracking-[0.6em] uppercase text-white/30"
                    >
                        Experience The Drop
                    </motion.div>
                </motion.div>

                <div className="absolute top-12 left-12 w-8 h-8 border-t-2 border-l-2 border-white/20" />
                <div className="absolute top-12 right-12 w-8 h-8 border-t-2 border-r-2 border-white/20" />
                <div className="absolute bottom-12 left-12 w-8 h-8 border-b-2 border-l-2 border-white/20" />
                <div className="absolute bottom-12 right-12 w-8 h-8 border-b-2 border-r-2 border-white/20" />
            </section>

            {/* =========================================
                PART 2: SCROLLING HYPE TICKER TAPE (GOWTHAM)
                DIRECTION: LEFT TO RIGHT (x: [-1000, 0])
            ========================================== */}
            <div className="w-full bg-cyan-900/20 backdrop-blur-lg py-4 overflow-hidden flex whitespace-nowrap rotate-2 scale-105 origin-center my-12 shadow-[0_0_40px_rgba(34,211,238,0.15)] relative z-10 border-y border-cyan-500/30">
                <motion.div
                    animate={{ x: [-1000, 0] }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    className="flex items-center gap-12 text-[#e0f2fe] font-black uppercase text-xl md:text-2xl tracking-widest drop-shadow-lg"
                >
                    {[...Array(8)].map((_, i) => (
                        <span key={i} className="flex items-center gap-12">
                            <span>AUDIO DOMINANCE</span>
                            <span className="text-cyan-400">✦</span>
                            <span>MAIN STAGE TAKEOVER</span>
                            <span className="text-cyan-400">✦</span>
                            <span>EXPERIENCE THE DROP</span>
                            <span className="text-cyan-400">✦</span>
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* =========================================
                PART 3: DAY 2 DEEPIKA BANNER (ENHANCED)
            ========================================== */}
            <section
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full z-20 overflow-hidden py-16 md:py-24 border-y border-[#E4BD8D]/20 bg-black/5 backdrop-blur-md shadow-[0_0_50px_rgba(197,48,153,0.1)] group/main"
            >
                {/* 🎞️ Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] overflow-hidden">
                    <div className="absolute inset-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] sm:w-[600px] sm:h-[600px] bg-gradient-to-tr from-[#C53099]/30 to-[#E4BD8D]/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Side: Staggered Hype Typography */}
                    <motion.div
                        style={{ x: dx, y: dy }}
                        variants={textContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="relative z-10 transform-gpu antialiased py-8 lg:pr-12 group/text"
                    >
                        <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C53099]/30 to-transparent hidden lg:block" />
                        <div className="absolute -left-8 top-1/4 w-4 h-px bg-[#C53099]/40 hidden lg:block" />

                        <motion.div variants={textItemVariants} className="flex items-center gap-4 mb-6">
                            <div className="h-[2px] w-12 bg-[#E4BD8D]" />
                            <p className="text-[#E4BD8D] text-xs font-black uppercase tracking-[0.5em] animate-pulse drop-shadow-md">The Grand Finale • Apr 10</p>
                        </motion.div>

                        <motion.h2 variants={textItemVariants} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase leading-[1.0] mb-4 font-massive tracking-tighter">
                            The Ultimate <br />
                            <span className="text-[#C53099] inline-block pb-2 transform-gpu hover:translate-x-3 transition-transform duration-500">
                                Vibe Setter
                            </span>
                        </motion.h2>

                        <motion.div variants={textItemVariants} className="relative group/name mb-8">
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#E4BD8D] font-massive tracking-[0.1em] transform-gpu">
                                DJ DEEPIKA
                            </h3>
                            <h3 className="absolute inset-0 text-3xl sm:text-4xl md:text-5xl font-black text-cyan-400/40 font-massive tracking-[0.11em] transform-gpu translate-x-1 translate-y-[-1px] opacity-0 group-hover/name:opacity-50 transition-opacity duration-300 pointer-events-none mix-blend-screen glitch-effect" style={{ filter: 'blur(1px)' }}>
                                DJ DEEPIKA
                            </h3>
                        </motion.div>

                        <motion.div variants={textItemVariants} className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full mb-8 backdrop-blur-md">
                            <div className="w-2 h-2 rounded-full bg-[#E4BD8D] animate-ping" />
                            <p className="text-[#E4BD8D] font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs">Official CSK DJ</p>
                        </motion.div>

                        <motion.p variants={textItemVariants} className="text-white/80 text-base sm:text-lg leading-relaxed max-w-lg mb-10 font-body border-l-2 border-[#C53099]/40 pl-6 transform-gpu italic">
                            Prepare for absolute cultural domination. Blending massive international EDM anthems with hardcore Kollywood mass, DJ Deepika is bringing an unprecedented, electrifying audio-visual experience.
                        </motion.p>

                        <motion.div variants={textItemVariants} className="flex flex-wrap gap-3 mb-10">
                            <span className="bg-black/50 backdrop-blur-xl border border-[#C53099]/30 px-5 py-2.5 rounded-xl text-[10px] font-black text-white tracking-widest uppercase flex items-center gap-2 shadow-lg hover:border-[#C53099]/60 hover:shadow-[0_0_20px_rgba(197,48,153,0.3)] transition-all">
                                <Flame className="w-4 h-4 text-[#C53099]" /> High-Octane
                            </span>
                            <span className="bg-black/50 backdrop-blur-xl border border-cyan-400/30 px-5 py-2.5 rounded-xl text-[10px] font-black text-white tracking-widest uppercase flex items-center gap-2 shadow-lg hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all">
                                <Headphones className="w-4 h-4 text-cyan-400" /> EDM x Kollywood
                            </span>
                        </motion.div>

                        <motion.div variants={textItemVariants} className="flex flex-wrap items-center gap-6 border-t border-white/5 pt-8 transform-gpu">
                            <a href="https://djdeepika.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/40 hover:text-[#E4BD8D] transition-colors text-[11px] font-black uppercase tracking-widest group/link">
                                <Globe className="w-4 h-4 group-hover/link:animate-spin-slow" /> Official Site
                            </a>
                            <a href="https://www.instagram.com/djdeepikanavz/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/40 hover:text-[#C53099] transition-colors text-[11px] font-black uppercase tracking-widest group/link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/link:scale-110 transition-transform">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                                @djdeepikanavz
                            </a>
                        </motion.div>
                        <div className="absolute -right-20 top-0 w-40 h-40 bg-[#C53099]/10 blur-[60px] pointer-events-none -z-10" />
                    </motion.div>

                    {/* Right Side: Interactive 3D Posters */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="relative h-[480px] sm:h-[580px] md:h-[650px] flex justify-center items-center mt-12 lg:mt-0 lg:-ml-24 group perspective-1000 z-20"
                    >
                        <div className="absolute -left-20 top-1/2 w-40 h-px bg-gradient-to-r from-transparent via-[#E4BD8D]/40 to-transparent hidden xl:block -rotate-12 translate-y-[-100px]" />
                        <div className="absolute -left-20 top-1/2 w-40 h-px bg-gradient-to-r from-transparent via-[#C53099]/40 to-transparent hidden xl:block rotate-12 translate-y-[100px]" />
                        {/* LIVE CARD */}
                        <motion.div
                            animate={!isPortraitFront ? { y: [10, -10, 10], scale: 1.05 } : { y: [-10, 10, -10], scale: 1 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            onClick={() => setIsPortraitFront(false)}
                            className={`absolute aspect-square rounded-[2rem] overflow-hidden border-2 cursor-pointer transition-all duration-700 ease-out 
                                ${!isPortraitFront
                                    ? 'z-40 w-[90%] sm:w-[85%] border-cyan-400 shadow-[0_0_80px_rgba(34,211,238,0.4)] rotate-0 -translate-x-6 sm:-translate-x-12 translate-y-6'
                                    : 'z-10 w-[65%] sm:w-[60%] border-white/10 rotate-12 -top-12 sm:top-0 -right-6 sm:-right-12 opacity-80 group-hover:opacity-100 hover:scale-[1.02]'
                                }`}
                        >
                            <div className={`absolute inset-0 z-10 transition-colors duration-500 ${!isPortraitFront ? 'bg-transparent' : 'bg-[#C53099]/30 mix-blend-overlay'}`} />
                            <img src="/Assets/dj/476791203_1092228746249888_4266235184123349982_n.jpg" alt="DJ Deepika Live" className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-[2000ms]" />
                            <div className={`absolute bottom-8 left-8 right-8 z-20 transition-all duration-700 ${!isPortraitFront ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <h4 className="text-white font-black tracking-tight text-4xl sm:text-5xl uppercase drop-shadow-2xl mb-4 italic">Deepika</h4>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-[#E4BD8D]/20 border border-[#E4BD8D]/40 rounded-full text-[9px] font-black tracking-widest text-[#E4BD8D] uppercase">Day 2</span>
                                    <span className="text-white/70 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">Main Stage</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* PORTRAIT CARD */}
                        <motion.div
                            animate={isPortraitFront ? { y: [10, -10, 10], scale: 1.05 } : { y: [5, -5, 5], scale: 1 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            onClick={() => setIsPortraitFront(true)}
                            className={`absolute aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 cursor-pointer transition-all duration-700 ease-out 
                                ${isPortraitFront
                                    ? 'z-30 w-[85%] sm:w-[80%] md:w-[75%] border-black -rotate-3 group-hover:rotate-0 translate-x-4 sm:translate-x-8'
                                    : 'z-10 w-[70%] sm:w-[65%] border-white/10 -rotate-12 opacity-80 hover:opacity-100 -bottom-12 left-[-15px] sm:-left-12 translate-y-12'
                                }`}
                        >
                            <div className={`absolute inset-0 z-10 transition-all duration-500 ${isPortraitFront ? 'bg-gradient-to-t from-black via-black/20 to-transparent opacity-100' : 'bg-black/60'}`} />
                            <img src="/Assets/dj/UBK5734-1-scaled.jpg" alt="DJ Deepika Portrait" className="w-full h-full object-cover object-top transition-transform duration-[3000ms] group-hover:scale-110" />
                            <div className={`absolute bottom-8 left-8 right-8 z-20 transition-all duration-700 ${isPortraitFront ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <h4 className="text-white font-black tracking-tight text-4xl sm:text-5xl uppercase drop-shadow-2xl mb-4 italic">Deepika</h4>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-[#E4BD8D]/20 border border-[#E4BD8D]/40 rounded-full text-[9px] font-black tracking-widest text-[#E4BD8D] uppercase">Day 2</span>
                                    <span className="text-white/70 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">Main Stage</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes glitch {
                        0% { transform: translate(0); }
                        20% { transform: translate(-2px, 2px); }
                        40% { transform: translate(-2px, -2px); }
                        60% { transform: translate(2px, 2px); }
                        80% { transform: translate(2px, -2px); }
                        100% { transform: translate(0); }
                    }
                    .glitch-effect { animation: glitch 0.3s cubic-bezier(.25,.46,.45,.94) both infinite; }
                    .animate-spin-slow { animation: spin 8s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}} />
            </section>

            {/* =========================================
                PART 4: SCROLLING HYPE TICKER TAPE (DEEPIKA)
                DIRECTION: RIGHT TO LEFT (x: [0, -1000])
            ========================================== */}
            <div className="w-full bg-[#C53099]/10 backdrop-blur-lg py-4 overflow-hidden flex whitespace-nowrap -rotate-2 scale-105 origin-center my-12 shadow-[0_0_40px_rgba(197,48,153,0.2)] relative z-10 border-y border-[#C53099]/30">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    className="flex items-center gap-12 text-[#ffccf2] font-black uppercase text-xl md:text-2xl tracking-widest drop-shadow-lg"
                >
                    {[...Array(8)].map((_, i) => (
                        <span key={i} className="flex items-center gap-12">
                            <span>THE ULTIMATE VIBE SETTER</span>
                            <span className="text-[#E4BD8D]">✦</span>
                            <span>THE QUEEN OF DECKS</span>
                            <span className="text-[#E4BD8D]">✦</span>
                            <span>OFFICIAL CSK DJ</span>
                            <span className="text-[#E4BD8D]">✦</span>
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default HeadlineDJ;
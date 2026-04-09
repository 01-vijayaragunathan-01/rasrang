import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { Star, Clapperboard, Sparkles, Music, MapPin, Play, Terminal, Zap, Info, Target, Activity } from "lucide-react";

// --- IMPORT GSAP & SCROLLTRIGGER ---
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export default function MoviePromo() {
    const { theme } = useTheme();
    const sectionRef = useRef(null);
    const [hasSnapped, setHasSnapped] = useState(false);

    // GSAP Refs
    const bgTextRef = useRef(null);
    const introTextRef = useRef(null);
    const detailsTextRef = useRef(null);
    const cardsContainerRef = useRef(null);
    const cardsRef = useRef([]);

    // Add to refs array
    const addToCardsRef = (el) => {
        if (el && !cardsRef.current.includes(el)) {
            cardsRef.current.push(el);
        }
    };

    // --- AUTO-SCROLL / SNAP LOGIC ---
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.4 && !hasSnapped) {
                    const scrollDirection = window.scrollY > (sectionRef.current?.offsetTop || 0) ? 'up' : 'down';

                    if (scrollDirection === 'down') {
                        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        setHasSnapped(true);
                    }
                }

                if (!entry.isIntersecting) {
                    setHasSnapped(false);
                }
            },
            { threshold: [0, 0.4, 0.8] }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, [hasSnapped]);

    // --- GSAP SCROLL ANIMATIONS ---
    useEffect(() => {
        let ctx = gsap.context(() => {
            // 1. Background Text Parallax
            gsap.to(bgTextRef.current, {
                x: "-30%",
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                }
            });

            // 2. Intro Text Sequence (Left Side)
            const tlLeft = gsap.timeline({
                scrollTrigger: {
                    trigger: introTextRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });

            tlLeft.fromTo(introTextRef.current.children,
                { y: 50, opacity: 0, filter: "blur(10px)" },
                { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.15, ease: "power3.out" }
            );

            // 3. Details Text Sequence (Right Side - Mission Briefing)
            const tlRight = gsap.timeline({
                scrollTrigger: {
                    trigger: detailsTextRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });

            tlRight.fromTo(detailsTextRef.current.children,
                { y: 50, opacity: 0, filter: "blur(10px)" },
                { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.2 }
            );

            // 4. Staggered Cards Reveal
            gsap.fromTo(cardsRef.current,
                { y: 100, opacity: 0, rotateX: 15 },
                {
                    y: 0,
                    opacity: 1,
                    rotateX: 0,
                    duration: 1,
                    stagger: 0.2,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: cardsContainerRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // --- LIK MOVIE CAST DATA ---
    const castMembers = [
        {
            id: "pradeep",
            name: "Pradeep",
            role: "The Modern Lover",
            dossier: "DOSSIER // LIK_P_01",
            quote: ``,
            image: "/Assets/hero/pradeep.png",
            glow: theme.colors.accent,
            delay: 0.2
        },
        {
            id: "krithi",
            name: "Krithi",
            role: "The Algorithmic Match",
            dossier: "DOSSIER // LIK_K_02",
            quote: ``,
            image: "/Assets/hero/krithi.jpg",
            glow: theme.colors.highlight,
            delay: 0.4
        },
        {
            id: "sjsuryah",
            name: "S.J. Suryah",
            role: "The Tech Tycoon",
            dossier: "DOSSIER // LIK_SJS_03",
            quote: ``,
            image: "/Assets/hero/sjsuryah.jpeg",
            glow: theme.colors.primary,
            delay: 0.6
        }
    ];

    // --- SEPARATE DIRECTOR DATA ---
    const directorData = {
        name: "Vignesh Shivan",
        role: "The Mastermind",
        dossier: "DOSSIER // LIK_VS_04",
        quote: `"A world where romance meets the algorithm."`,
        image: "/Assets/hero/Vignesh-Shivan.jpg",
        glow: "#a855f7", // Deep Purple
        delay: 0.8
    };

    return (
        <section
            ref={sectionRef}
            className="relative w-full pb-32 pt-24 overflow-hidden bg-black/40 backdrop-blur-3xl border-y border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
        >
            {/* 🎞️ HUD Scanline & Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.05]">
                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(${theme.colors.primary}20 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            </div>

            {/* Tactical HUD Framing Brackets */}
            <div className="absolute top-10 left-10 w-24 h-24 border-l border-t border-white/10 pointer-events-none z-10" />
            <div className="absolute top-10 right-10 w-24 h-24 border-r border-t border-white/10 pointer-events-none z-10" />
            <div className="absolute bottom-10 left-10 w-24 h-24 border-l border-b border-white/10 pointer-events-none z-10" />
            <div className="absolute bottom-10 right-10 w-24 h-24 border-r border-b border-white/10 pointer-events-none z-10" />

            {/* GIANT KINETIC BACKGROUND TYPOGRAPHY */}
            <div className="absolute top-[10%] left-0 w-full overflow-hidden opacity-[0.04] z-0 pointer-events-none select-none mix-blend-overlay">
                <div
                    ref={bgTextRef}
                    className="flex whitespace-nowrap font-massive text-[15rem] md:text-[25rem] leading-none uppercase italic text-white w-max"
                >
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className="pr-8">
                            LOVE INSURANCE KOMPANY • ACT 02 • IN CINEMAS APRIL 10 • DIRECTED BY VIGNESH SHIVAN •
                        </span>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* --- HYPE INTRO SECTION --- */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center justify-between mb-20">

                    {/* Left: The Grand Titles */}
                    <div ref={introTextRef} className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">
                        {/* Cinematic Date Tag */}
                        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border bg-black/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-8" style={{ borderColor: `${theme.colors.highlight}40` }}>
                            <div className="flex items-center gap-1.5 border-r border-white/10 pr-3 mr-1">
                                <Terminal size={14} style={{ color: theme.colors.highlight }} />
                                <span className="text-[8px] font-black uppercase text-white/40">Status</span>
                            </div>
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/90">
                                ACT 02 • Campus Appearance
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-2 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        </div>

                        <p className="text-xs md:text-sm tracking-[0.5em] uppercase font-bold mb-4 flex items-center gap-3" style={{ color: theme.colors.accent }}>
                            <Target size={14} /> ✦ The Silver Screen Spotlight ✦
                        </p>

                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter font-massive text-white drop-shadow-2xl leading-[0.9] flex flex-col items-center lg:items-start gap-2">
                            <span>The Stars</span>
                            <span className="flex items-center gap-4">
                                <span>of</span>
                                <img
                                    src="/Assets/hero/lik_logo.png"
                                    alt="LIK"
                                    className="h-[0.8em] md:h-[0.9em] w-auto inline-block drop-shadow-[0_0_15px_rgba(227,30,110,0.4)]"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </span>
                        </h2>

                        <div className="flex items-center justify-center lg:justify-start mt-6">
                            <div className="px-5 py-2 border rounded-lg bg-black/50 backdrop-blur-md shadow-[0_0_20px_rgba(227,30,110,0.2)]" style={{ borderColor: `${theme.colors.highlight}60` }}>
                                <p className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: theme.colors.highlight }}>
                                    LIVE ON <span className="text-white">APRIL 09</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-8 lg:justify-start justify-center w-full">
                            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${theme.colors.highlight}80)` }} />
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                                <Sparkles size={12} className="text-white/50" />
                            </motion.div>
                            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${theme.colors.highlight}80)` }} />
                        </div>
                    </div>

                    {/* Right: The Details & Vibe Check */}
                    <div ref={detailsTextRef} className="flex-1 max-w-lg text-center lg:text-left">
                        <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                            <Zap size={14} style={{ color: theme.colors.accent }} />
                            <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Mission Briefing</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black italic uppercase text-white mb-4 leading-tight">
                            Kollywood's Biggest Heartthrobs Drop Into SRM.
                        </h3>
                        <p className="text-white/60 font-body leading-relaxed mb-10">
                            Right before they hit the big screens worldwide, the star-studded cast of the year’s most anticipated sci-fi rom-com is crashing RasRang 2K26 as our official <span style={{ color: theme.colors.highlight }} className="font-bold">Act 02</span>. Get ready for an unfiltered, massive live session. No scripts, no algorithms—just pure campus hype.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                            <a
                                href="https://www.youtube.com/watch?v=wMiCXl8ZybQ"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: theme.colors.highlight }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group flex items-center gap-4 px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-[0_10px_30px_rgba(227,30,110,0.2)]"
                                    style={{ backgroundColor: `${theme.colors.highlight}1A`, border: `1px solid ${theme.colors.highlight}`, color: theme.colors.highlight }}
                                >
                                    <Play size={16} className="fill-current group-hover:scale-110 transition-transform" />
                                    WATCH TEASER
                                </motion.button>
                            </a>

                            <div className="flex items-center gap-3 px-4 py-2 border border-white/10 bg-white/5 rounded-xl backdrop-blur-md">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.primary, boxShadow: `0 0 10px ${theme.colors.primary}` }} />
                                <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em]">Day 01 // Act 02 // Apr 09</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CINEMATIC CAST CARDS CONTAINER --- */}
            <div ref={cardsContainerRef} className="relative w-full px-6 pb-20 flex flex-col items-center">

                {/* Background Spotlights */}
                <div className="absolute top-1/2 left-[15%] -translate-y-1/2 w-80 h-80 blur-[150px] opacity-20 rounded-full pointer-events-none hidden md:block" style={{ backgroundColor: theme.colors.accent }} />
                <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-80 h-80 blur-[150px] opacity-20 rounded-full pointer-events-none hidden md:block" style={{ backgroundColor: theme.colors.primary }} />

                {/* 1. THE MAIN CAST (3 Cards) */}
                <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-8 md:gap-10 w-full mb-10 z-10">
                    {castMembers.map((cast) => (
                        <motion.div
                            key={cast.id}
                            ref={addToCardsRef}
                            whileHover={{ y: -15, scale: 1.02 }}
                            className="relative group w-full max-w-[360px] aspect-[4/5.5] rounded-[3rem] border border-white/10 bg-black/60 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-end p-10 cursor-pointer perspective-1000"
                        >
                            {/* HUD Overlays */}
                            <div className="absolute top-8 left-8 p-1.5 bg-black/40 border border-white/10 rounded-lg text-[7px] font-black text-white/30 uppercase tracking-[0.2em] z-20">
                                {cast.dossier}
                            </div>
                            <div className="absolute top-8 right-8 z-20">
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/5">
                                    <CustomActivity size={8} style={{ color: cast.glow }} className="animate-pulse" />
                                    <span className="text-[7px] font-black tracking-widest text-white/40 uppercase">LIVE_SCAN</span>
                                </div>
                            </div>

                            {/* Inner glowing core */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-screen z-10" style={{ background: `radial-gradient(circle at 50% 30%, ${cast.glow}30 0%, transparent 60%)` }} />

                            {/* Image & Gradient */}
                            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#020202] via-[#020202]/90 to-transparent" />
                            <img
                                src={cast.image}
                                alt={cast.name}
                                className="absolute inset-0 w-full h-full object-cover object-center mix-blend-luminosity opacity-40 group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700 group-hover:scale-105"
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1516280440502-8c10508cb5f3?q=80&w=1000"; }}
                            />

                            {/* Lens Flare */}
                            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-[100%] transition-transform duration-[1.5s] ease-in-out skew-x-12 pointer-events-none z-10" />

                            {/* Text Content */}
                            <div className="relative z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex flex-col gap-1.5 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 flex justify-center shrink-0">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cast.glow, boxShadow: `0 0 10px ${cast.glow}` }} />
                                        </div>
                                        <p className="text-[10px] font-black tracking-[0.4em] uppercase" style={{ color: cast.glow }}>{cast.role}</p>
                                    </div>
                                </div>
                                <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-2xl font-massive leading-none mb-1">
                                    {cast.name}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 2. THE DIRECTOR'S GRAND BANNER (OPTIMIZED MOBILE & DESKTOP SPLIT) */}
                <motion.div
                    ref={addToCardsRef}
                    whileHover={{ scale: 1.01 }}
                    className="relative group w-full max-w-[1160px] min-h-[500px] md:min-h-[450px] lg:min-h-[500px] rounded-[3rem] border border-purple-500/20 bg-[#05020a] shadow-[0_30px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row z-10 cursor-pointer"
                >
                    {/* Background Ambient Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none mix-blend-screen z-0" style={{ background: `radial-gradient(circle at center, ${directorData.glow}20 0%, transparent 70%)` }} />

                    {/* Image Layer: 
                        Mobile -> Absolute Background spanning full card 
                        Desktop -> Relative block placed organically on the right
                    */}
                    <div className="absolute inset-0 md:relative md:w-[45%] lg:w-[50%] md:ml-auto h-full z-0 overflow-hidden order-1 md:order-2">
                        
                        {/* Gradient Mask: 
                            Mobile -> Bottom-to-Top to fade image under text 
                            Desktop -> Left-to-Right to fade image into black 
                        */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#05020a] via-[#05020a]/80 to-transparent md:bg-gradient-to-r md:from-[#05020a] md:via-[#05020a]/60 md:to-transparent z-10" />

                        {/* Lens Flare Sweep (Desktop Only) */}
                        <div className="hidden md:block absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-purple-400/10 to-transparent -translate-x-full group-hover:translate-x-[100%] transition-transform duration-[2s] ease-in-out skew-x-12 pointer-events-none z-10" />

                        <img
                            src={directorData.image}
                            alt={directorData.name}
                            // Mobile: Fully visible, no blur. Desktop: Blurred & grayscale initially, colored on hover.
                            className="w-full h-full object-cover object-top opacity-70 md:opacity-50 md:blur-[3px] md:grayscale transition-all duration-[1s] ease-out group-hover:opacity-100 group-hover:blur-none group-hover:grayscale-0 group-hover:scale-105"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1516280440502-8c10508cb5f3?q=80&w=1000"; }}
                        />
                    </div>

                    {/* Content Layer: 
                        Mobile -> Overlays on top of the image at the bottom
                        Desktop -> Stays perfectly framed on the left 
                    */}
                    <div className="absolute inset-0 md:relative z-20 w-full md:w-[55%] lg:w-[50%] p-8 md:p-12 lg:p-16 flex flex-col justify-end md:justify-center items-center md:items-start pointer-events-none order-2 md:order-1">
                        
                        {/* Director's Cut Badge */}
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 w-fit mb-4 md:mb-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md pointer-events-auto">
                            <Clapperboard size={14} className="text-purple-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-200">
                                Director's Cut
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-2 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                        </div>

                        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left pointer-events-auto">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={10} className="text-purple-400 animate-pulse" />
                                <div className="relative h-4 overflow-hidden w-40">
                                    <div className="absolute flex flex-col transition-transform duration-500 group-hover:-translate-y-4">
                                        <span className="h-4 text-[8px] font-black tracking-[0.3em] uppercase text-purple-400/60">
                                            ANALYZING MASTERMIND...
                                        </span>
                                        <span className="h-4 text-[8px] font-black tracking-[0.3em] uppercase text-purple-400">
                                            MASTERMIND ACCESSED
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-[10px] md:text-xs font-black tracking-[0.4em] uppercase text-purple-400 mb-1">
                                {directorData.role}
                            </p>

                            {/* Controlled 2-row Name */}
                            <h3 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter font-massive text-white drop-shadow-2xl leading-none">
                                <span className="flex flex-col items-center md:items-start gap-0 md:gap-2 whitespace-nowrap">
                                    <span>VIGNESH</span>
                                    <span>SHIVAN</span>
                                </span >
                            </h3>
                        </div>
                    </div>
                </motion.div>

                {/* DIRECTOR'S QUOTE: Separated beautifully below */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 flex flex-col items-center gap-4 px-6 z-10 relative"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-px w-8 bg-purple-500/30" />
                        <Sparkles size={12} className="text-purple-400/50" />
                        <div className="h-px w-8 bg-purple-500/30" />
                    </div>
                    <p className="text-lg md:text-2xl font-serif italic text-white/80 leading-relaxed text-center max-w-3xl px-4 relative">
                        <span className="absolute -left-2 -top-2 text-4xl text-purple-500/30 italic">"</span>
                        {directorData.quote}
                        <span className="absolute -right-2 -bottom-4 text-4xl text-purple-500/30 italic">"</span>
                    </p>
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mt-2" />
                </motion.div>

            </div>

            {/* --- PASSIVE PROMOTION: MOVIE PREMIERE TAG --- */}
            <motion.div 
                initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl mx-auto mt-4 px-6 text-center relative z-10"
            >
                <div className="inline-flex flex-col items-center pt-8 w-full">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="h-px w-20 bg-white/10" />
                        <div className="w-2 h-2 rotate-45 border border-white/20" />
                        <div className="h-px w-20 bg-white/10" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.5em] font-black text-white/30 mb-3">System Online • Theatrical Release</p>
                    <p className="text-2xl sm:text-4xl font-black italic uppercase tracking-[0.2em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        APRIL 10, 2026
                    </p>
                </div>
            </motion.div>

        </section>
    );
}

const CustomActivity = ({ size, style, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        className={className}
    >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);
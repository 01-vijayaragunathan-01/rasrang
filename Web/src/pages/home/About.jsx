import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import PixelCard from "../../components/home/PixelCard"; 
import MoviePromo from "./MoviePromo"; // <-- Imported the new component
import { Mic2, Zap, Heart, MessageCircle, Share2, Flame, Pointer } from "lucide-react"; 

export default function About() {
    const { theme } = useTheme();

    // --- 0. NATIVE SMOOTH SCROLLING ---
    useEffect(() => {
        document.documentElement.style.scrollBehavior = "smooth";
        return () => {
            document.documentElement.style.scrollBehavior = "auto";
        };
    }, []);

    // --- 1. COUNTDOWN LOGIC ---
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const targetDate = new Date("April 9, 2026 09:00:00").getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000),
                });
            } else {
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // --- 2. 3D TICKET PHYSICS ---
    const ticketX = useMotionValue(0);
    const ticketY = useMotionValue(0);
    const rotateX = useTransform(ticketY, [-200, 200], [20, -20]);
    const rotateY = useTransform(ticketX, [-200, 200], [-20, 20]);

    const glareX = useTransform(ticketX, [-200, 200], ["-100%", "200%"]);
    const glareY = useTransform(ticketY, [-200, 200], ["-100%", "200%"]);

    function handleTicketMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        ticketX.set(event.clientX - rect.left - rect.width / 2);
        ticketY.set(event.clientY - rect.top - rect.height / 2);
    }
    function handleTicketLeave() {
        ticketX.set(0);
        ticketY.set(0);
    }

    // --- 3. INTERACTIVE STATES ---
    const [activeCard, setActiveCard] = useState(null);
    const [bennyIndex, setBennyIndex] = useState(0);
    
    const bennyImages = [
        "/Assets/benny/benny1.jpg",
        "/Assets/benny/benny2.jpg",
        "/Assets/benny/benny3.jpg",
        "/Assets/benny/benny4.jpg",
        "/Assets/benny/benny5.jpg"
    ];

    const handleNextBennyImage = () => {
        setBennyIndex((prevIndex) => (prevIndex + 1) % bennyImages.length);
    };

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

    // --- 4. PARALLAX SCROLL FOR BENNY SECTION ---
    const bennyRef = useRef(null);
    const { scrollYProgress: bennyScroll } = useScroll({
        target: bennyRef,
        offset: ["start end", "end start"]
    });
    
    const textY = useTransform(bennyScroll, [0, 1], [80, -80]); 
    const imgY = useTransform(bennyScroll, [0, 1], [-40, 40]);  
    const bgRotate = useTransform(bennyScroll, [0, 1], [-3, 3]); 

    return (
        <section id="about" className="relative w-full py-24 overflow-hidden" style={{ backgroundColor: "transparent" }}>

            {/* Animated Cultural Background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center overflow-hidden">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    className="w-[150vw] h-[150vw] sm:w-[100vw] sm:h-[100vw] absolute opacity-30"
                    style={{
                        background: `radial-gradient(circle, transparent 30%, ${theme.colors.primary}40 60%, transparent 70%)`,
                        backgroundImage: `repeating-conic-gradient(from 0deg, transparent 0deg 15deg, ${theme.colors.accent}10 15deg 30deg)`
                    }}
                />
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 blur-[150px]" style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${theme.colors.highlight}, transparent)` }} />
                <div className="absolute bottom-0 left-0 w-1/2 h-full opacity-10 blur-[150px]" style={{ backgroundImage: `linear-gradient(to top, transparent, ${theme.colors.accent}, transparent)` }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-32">

                {/* =========================================
                    PART 1: INTRO & 3D FESTIVAL TICKET
                ========================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col gap-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border bg-white/5 w-fit font-accent" style={{ borderColor: `${theme.colors.primary}50` }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.glow }} />
                            <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold" style={{ color: theme.colors.textMuted }}>
                                SRM Trichy Campus Exclusive
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight tracking-wide font-massive" style={{ color: theme.colors.textTitle }}>
                            The Ultimate <br />
                            <span style={{ color: "transparent", WebkitTextStroke: `1px ${theme.colors.accent}` }}>Convergence</span>
                        </h2>

                        <p className="text-base leading-relaxed max-w-lg font-body" style={{ color: theme.colors.textDescription }}>
                            RasRang is the heartbeat of the entire SRM Trichy Campus. Secure your festival pass to access 30+ events, electrifying pro-shows, and a cultural phenomenon spanning two unforgettable nights.
                        </p>
                    </motion.div>

                    <div className="flex justify-center perspective-1000" onMouseMove={handleTicketMove} onMouseLeave={handleTicketLeave}>
                        <motion.div
                            style={{ rotateX, rotateY, z: 50 }}
                            className="relative w-[320px] h-[180px] md:w-[400px] md:h-[220px] rounded-2xl overflow-hidden group cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] to-[#0A0520] border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />

                            <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-3xl font-normal tracking-widest text-white uppercase font-massive" style={{ color: theme.colors.accent }}>RasRang '26</h4>
                                        <p className="text-[10px] tracking-[0.3em] uppercase mt-1 opacity-80" style={{ color: theme.colors.textTitle }}>Official Festival Entry</p>
                                    </div>
                                    <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center transform rotate-12" style={{ borderColor: theme.colors.accent }}>
                                        <svg className="w-4 h-4" style={{ color: theme.colors.accent }} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-2">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[6px] tracking-[0.3em] font-black text-cyan-400 opacity-60 uppercase mb-1" style={{ color: theme.colors.primary }}>Auth Clearance: Lvl 4</p>
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-[8px] uppercase tracking-widest text-white/50 mb-1">Dates</p>
                                                <p className="text-sm text-white font-mono">APR 09-10</p>
                                            </div>
                                            <div className="hidden xs:block">
                                                <p className="text-[8px] uppercase tracking-widest text-white/50 mb-1">ID</p>
                                                <p className="text-sm text-white font-mono">#RSR-21</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] uppercase tracking-widest text-white/50 mb-1">Admit</p>
                                        <p className="text-sm font-black text-white">ONE (1) STUDENT</p>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                className="absolute inset-0 z-20 pointer-events-none mix-blend-color-dodge opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background: `linear-gradient(105deg, transparent 20%, ${theme.colors.primary}80 25%, ${theme.colors.secondary}80 50%, transparent 55%)`,
                                    backgroundSize: "200% 200%",
                                    x: glareX, y: glareY,
                                }}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* =========================================
                    PART 2: COUNTDOWN 
                ========================================== */}
                <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">

                    <h3 className="text-2xl font-black uppercase tracking-[0.3em] mb-8 font-massive" style={{ color: theme.colors.accent }}>
                        The Curtains Open In
                    </h3>

                    <div className="flex justify-center gap-4 md:gap-8 mb-12">
                        {Object.entries(timeLeft).map(([label, value]) => (
                            <div key={label} className="flex flex-col items-center">
                                <div className="w-16 h-16 md:w-24 md:h-24 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center" style={{ boxShadow: `0 0 30px ${theme.colors.primary}1A` }}>
                                    <span className="text-2xl md:text-4xl font-black font-massive" style={{ color: theme.colors.textTitle }}>{value.toString().padStart(2, '0')}</span>
                                </div>
                                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] mt-3 font-accent" style={{ color: theme.colors.accent }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* =========================================
                    PART 3: SILVER SCREEN SPOTLIGHT (LIK MOVIE)
                ========================================== */}
                {/* MOUNTING THE NEWLY SEPARATED COMPONENT HERE */}
                <MoviePromo />

                {/* =========================================
                    PART 4: CLASSIFIED INTEL (APR 10 SURPRISE)
                ========================================== */}
                <div className="relative w-full z-10 pt-16 pb-16">
                    <div className="text-center mb-12 max-w-7xl mx-auto px-6">
                        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <p className="text-xs tracking-[0.5em] uppercase mb-4 font-bold font-accent drop-shadow-md" style={{ color: theme.colors.accent }}>
                                ✦ More to Come ✦
                            </p>
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-wider font-massive" style={{ color: theme.colors.textTitle }}>
                                Classified <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${theme.colors.highlight}, ${theme.colors.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intel</span>
                            </h2>
                            <div className="flex items-center justify-center gap-4 mt-6">
                                <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${theme.colors.primary}60)` }} />
                                <div className="w-2 h-2 rotate-45" style={{ backgroundColor: `${theme.colors.accent}60` }} />
                                <div className="h-px w-20" style={{ background: `linear-gradient(to left, transparent, ${theme.colors.primary}60)` }} />
                            </div>
                        </motion.div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto px-6"
                    >
                        <PixelCard
                            variant="pink"
                            className={`w-full sm:w-[320px] aspect-[10/14] rounded-2xl cursor-pointer group transition-all duration-500 ${activeCard === 'day2-surprise' ? 'ring-2 scale-[1.02]' : ''}`}
                            style={{ 
                                borderColor: activeCard === 'day2-surprise' ? `${theme.colors.primary}80` : 'transparent',
                                boxShadow: activeCard === 'day2-surprise' ? `0 0 30px ${theme.colors.primary}33` : 'none' 
                            }}
                            onClick={() => setActiveCard(activeCard === 'day2-surprise' ? null : 'day2-surprise')}
                        >
                            <div className={`absolute inset-0 z-10 bg-[#0a0a0a]/85 backdrop-blur-md transition-all duration-700 overflow-hidden pointer-events-none ${activeCard === 'day2-surprise' ? 'opacity-0' : 'group-hover:opacity-0'}`}>
                                {[...Array(6)].map((_, i) => (
                                    <motion.div 
                                        key={i}
                                        animate={{ y: [-20, 20, -20], x: [-20, 20, -20], opacity: [0.2, 0.5, 0.2] }}
                                        transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                                        style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                                    />
                                ))}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.span className="text-4xl font-black text-white/5 tracking-tighter italic select-none">
                                        SURPRISE
                                    </motion.span>
                                </div>
                            </div>

                            <div className={`absolute inset-0 z-20 p-6 flex flex-col justify-between border border-white/5 rounded-2xl transition-all duration-500 pointer-events-none ${activeCard === 'day2-surprise' ? 'bg-[#000000]/10' : ''}`} style={{ borderColor: activeCard === 'day2-surprise' ? `${theme.colors.primary}80` : 'rgba(255,255,255,0.05)' }}>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md" style={{ color: theme.colors.primary, backgroundColor: `${theme.colors.primary}1A` }}>
                                        APR 10 • MEGA EVENT
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.highlight, boxShadow: `0 0 10px ${theme.colors.highlight}` }} />
                                </div>

                                <div className="space-y-3 text-center sm:text-left">
                                    <div className="space-y-1">
                                        <h4 className={`text-2xl font-black italic uppercase transition-colors duration-500 ${activeCard === 'day2-surprise' ? '' : 'text-white'}`} style={{ color: activeCard === 'day2-surprise' ? theme.colors.primary : 'white' }}>
                                            CLASSIFIED
                                        </h4>
                                        <p className="text-[10px] leading-relaxed font-bold uppercase tracking-widest" style={{ color: theme.colors.textMuted }}>
                                            Day 2 Main Event is heavily encrypted. Brace for impact.
                                        </p>
                                    </div>
                                    <div className="w-full h-[2px] bg-white/5 relative overflow-hidden">
                                        <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 w-1/3" style={{ backgroundImage: `linear-gradient(to right, transparent, ${theme.colors.primary}, transparent)` }} />
                                    </div>
                                </div>
                            </div>
                        </PixelCard>
                    </motion.div>
                </div>
            </div>

            {/* =========================================
                PART 5: PRO SHOWS REVEALED (BENNY DAYAL)
            ========================================== */}
            <div className="relative w-full z-10 pb-24">
                
                {/* Header */}
                <div className="text-center mb-10 max-w-7xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <p className="text-xs tracking-[0.5em] uppercase mb-4 font-bold font-accent drop-shadow-md" style={{ color: theme.colors.accent }}>
                            ✦ The Main Event ✦
                        </p>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-wider font-massive" style={{ color: theme.colors.textTitle }}>
                            Pro Shows <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${theme.colors.highlight}, ${theme.colors.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Revealed</span>
                        </h2>
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${theme.colors.primary}60)` }} />
                            <div className="w-2 h-2 rotate-45" style={{ backgroundColor: `${theme.colors.accent}60` }} />
                            <div className="h-px w-20" style={{ background: `linear-gradient(to left, transparent, ${theme.colors.primary}60)` }} />
                        </div>
                    </motion.div>
                </div>

                {/* --- DAY 1: BENNY DAYAL MEGA BANNER --- */}
                <div ref={bennyRef} className="w-full relative z-20 overflow-hidden py-16 md:py-24 border-y bg-black/5 backdrop-blur-md" style={{ borderColor: `${theme.colors.primary}33`, boxShadow: `0 0 50px ${theme.colors.primary}1A` }}>
                    
                    {/* 🎞️ Scanline Overlay - UNIFIED HUD VIBE */}
                    <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] overflow-hidden">
                        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                    </div>

                    {/* Cinematic Radial Core Glow - Adapted to App Theme */}
                    <motion.div 
                        style={{ rotate: bgRotate }}
                        className="absolute inset-0 z-0 opacity-10 mix-blend-screen pointer-events-none"
                    >
                        <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2000" className="w-full h-full object-cover filter contrast-125 saturate-200" alt="Concert Crowd" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-[#000000]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-transparent to-[#000000]" />
                    </motion.div>

                    {/* HUD CORNER BRACKETS */}
                    <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 opacity-20" style={{ borderColor: theme.colors.accent }} />
                    <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 opacity-20" style={{ borderColor: theme.colors.accent }} />
                    <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 opacity-20" style={{ borderColor: theme.colors.accent }} />
                    <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 opacity-20" style={{ borderColor: theme.colors.accent }} />

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] sm:w-[600px] sm:h-[600px] rounded-full blur-[120px] pointer-events-none z-0" style={{ background: `linear-gradient(to top right, ${theme.colors.highlight}26, ${theme.colors.primary}1A)` }} />

                    <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        
                        {/* Left Side: Staggered Hype Typography */}
                        <motion.div 
                            style={{ y: textY }}
                            variants={textContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            className="transform-gpu antialiased z-20 relative" 
                        >
                            {/* HUD Connector Graphic */}
                            <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />

                            <motion.div variants={textItemVariants} className="flex items-center gap-4 mb-6">
                                <div className="h-[2px] w-12" style={{ backgroundColor: theme.colors.accent }} />
                                <p className="text-xs font-black uppercase tracking-[0.4em] animate-pulse drop-shadow-md" style={{ color: theme.colors.accent }}>
                                    <Flame className="inline-block w-3 h-3 mr-1" /> Day 1 Kickoff • Apr 09
                                </p>
                            </motion.div>
                            
                            <motion.h2 variants={textItemVariants} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[1.0] mb-2 font-massive transform-gpu tracking-tighter italic drop-shadow-2xl" style={{ color: theme.colors.textTitle }}>
                                The Badtameez <br/>
                                <span className="inline-block pb-2 transform-gpu hover:translate-x-3 transition-transform duration-500" style={{ color: theme.colors.highlight, filter: `drop-shadow(0 0 15px ${theme.colors.highlight}40)` }}>
                                    Night
                                </span>
                            </motion.h2>
                            
                            <motion.div variants={textItemVariants} className="flex flex-wrap items-center gap-4 mb-6">
                                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-massive tracking-widest transform-gpu" style={{ color: theme.colors.textTitle, textShadow: `0 5px 15px ${theme.colors.primary}40` }}>
                                    BENNY DAYAL
                                </h3>
                                {/* AUDIO PULSE UI (Music Vibe) */}
                                <div className="flex gap-1 items-end h-6 sm:h-8">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: ["20%", "100%", "20%"] }}
                                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: "easeInOut" }}
                                            className="w-1.5 sm:w-2 rounded-t-sm"
                                            style={{ backgroundImage: `linear-gradient(to top, ${theme.colors.highlight}, ${theme.colors.secondary})` }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                            
                            <motion.div variants={textItemVariants} className="inline-flex items-center gap-3 border px-4 py-2 rounded-lg mb-6 backdrop-blur-md shadow-lg" style={{ backgroundColor: `${theme.colors.primary}1A`, borderColor: `${theme.colors.primary}4D` }}>
                                <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: theme.colors.highlight }} />
                                <p className="font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs" style={{ color: theme.colors.accent }}>Campus Legend to Global Pop Icon</p>
                            </motion.div>

                            <motion.p variants={textItemVariants} className="text-base sm:text-lg leading-relaxed max-w-lg mb-6 font-body border-l-2 pl-6 transform-gpu italic" style={{ color: theme.colors.textDescription, borderColor: `${theme.colors.primary}4D` }}>
                                From tearing up the inter-college circuit as MCC's Cultural Convenor to being discovered by A.R. Rahman, Benny Dayal is the ultimate musical phenomenon. He's bringing his powerhouse live band, <strong style={{ color: theme.colors.highlight }}>FunktuaTion</strong>, to turn the arena into Tamil Nadu's biggest dance floor.
                            </motion.p>

                            {/* Instagram Link */}
                            <motion.a 
                                variants={textItemVariants}
                                href="https://www.instagram.com/bennydayalofficial/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest group transition-colors"
                                style={{ color: theme.colors.textMuted }}
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
                                    style={{ color: theme.colors.primary }}
                                >
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                                <span className="group-hover:text-white transition-colors">@bennydayalofficial</span>
                            </motion.a>

                            {/* Feature Tags */}
                            <motion.div variants={textItemVariants} className="flex flex-wrap gap-3 mb-8">
                                <span className="bg-black/40 backdrop-blur-xl border px-5 py-2.5 rounded-xl text-[10px] font-black text-white tracking-widest uppercase flex items-center gap-2 hover:border-white/20 transition-all shadow-lg" style={{ borderColor: `${theme.colors.primary}4D` }}>
                                    <Mic2 className="w-4 h-4" style={{ color: theme.colors.primary }} /> Multilingual Maestro
                                </span>
                                <span className="bg-black/40 backdrop-blur-xl border px-5 py-2.5 rounded-xl text-[10px] font-black text-white tracking-widest uppercase flex items-center gap-2 hover:border-white/20 transition-all shadow-lg" style={{ borderColor: `${theme.colors.highlight}4D` }}>
                                    <Zap className="w-4 h-4" style={{ color: theme.colors.highlight }} /> FunktuaTion Live
                                </span>
                            </motion.div>

                        </motion.div>

                        {/* Right Side: Interactive 3D Image Fan */}
                        <motion.div 
                            style={{ y: imgY }}
                            initial={{ opacity: 0, scale: 0.95 }} 
                            whileInView={{ opacity: 1, scale: 1 }} 
                            viewport={{ once: true }} 
                            transition={{ duration: 1 }} 
                            className="relative h-[450px] sm:h-[550px] md:h-[650px] flex justify-center items-center mt-10 lg:mt-0 perspective-1000 z-20"
                        >
                            {/* Instruction Tag */}
                            <div className="absolute -top-6 sm:-top-10 z-50 bg-black/60 border px-3 py-1 rounded-full tracking-widest font-bold flex items-center gap-2 animate-bounce shadow-xl" style={{ borderColor: `${theme.colors.highlight}4D`, color: theme.colors.highlight }}>
                                <Pointer className="w-3 h-3" /> TAP TO EXPLORE
                            </div>

                            {/* Map through the 5 images to create a 3D Card Stack */}
                            {bennyImages.map((src, i) => {
                                const relativeIndex = (i - bennyIndex + bennyImages.length) % bennyImages.length;
                                
                                let styles = {};
                                if (relativeIndex === 0) {
                                    styles = { zIndex: 50, scale: 1, x: 0, y: 0, rotate: 0, opacity: 1 };
                                } else if (relativeIndex === 1) {
                                    styles = { zIndex: 40, scale: 0.9, x: 30, y: -20, rotate: 5, opacity: 0.8 };
                                } else if (relativeIndex === 2) {
                                    styles = { zIndex: 30, scale: 0.8, x: 60, y: -40, rotate: 10, opacity: 0.6 };
                                } else if (relativeIndex === 3) {
                                    styles = { zIndex: 20, scale: 0.8, x: -60, y: -40, rotate: -10, opacity: 0.6 };
                                } else if (relativeIndex === 4) {
                                    styles = { zIndex: 40, scale: 0.9, x: -30, y: -20, rotate: -5, opacity: 0.8 };
                                }

                                return (
                                    <motion.div
                                        key={i}
                                        animate={{ 
                                            scale: styles.scale, 
                                            x: styles.x, 
                                            y: styles.y, 
                                            rotate: styles.rotate, 
                                            opacity: styles.opacity 
                                        }}
                                        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                                        onClick={handleNextBennyImage}
                                        className={`absolute aspect-[3/4] w-[70%] sm:w-[65%] rounded-3xl overflow-hidden border-4 cursor-pointer shadow-2xl transition-colors duration-300`}
                                        style={{ 
                                            zIndex: styles.zIndex,
                                            borderColor: relativeIndex === 0 ? theme.colors.highlight : 'rgba(255,255,255,0.1)',
                                            boxShadow: relativeIndex === 0 ? `0 0 80px ${theme.colors.highlight}33` : 'none'
                                        }}
                                    >
                                        <div className={`absolute inset-0 z-10 transition-all duration-500 ${relativeIndex === 0 ? 'bg-gradient-to-t from-black via-black/20 to-transparent opacity-90' : 'bg-black/60'}`} />
                                        <img 
                                            src={src} 
                                            alt={`Benny Dayal ${i + 1}`} 
                                            className="w-full h-full object-cover object-center bg-gray-900 pointer-events-none" 
                                        />
                                        
                                        {/* Show overlay only on the active front card */}
                                        {relativeIndex === 0 && (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end pointer-events-none"
                                            >
                                                <div>
                                                    <p className="font-black tracking-[0.2em] text-3xl italic drop-shadow-[0_2px_10px_rgba(0,0,0,1)] mb-1" style={{ color: theme.colors.highlight }}>LIVE</p>
                                                    <p className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: theme.colors.textTitle }}>
                                                        <span className="w-4 h-px bg-white/50" /> With FunktuaTion
                                                    </p>
                                                </div>

                                                {/* Social Interaction Icons */}
                                                <div className="flex flex-col gap-3 pb-2 pointer-events-auto">
                                                    <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white drop-shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                                        <Heart className="w-4 h-4" style={{ fill: theme.colors.highlight, color: theme.colors.highlight }} />
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white drop-shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                                        <MessageCircle className="w-4 h-4" />
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white drop-shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                                        <Share2 className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>

                {/* --- SCROLLING HYPE TICKER TAPE (BENNY'S HIT LIST) --- */}
                <div className="w-full relative z-30 backdrop-blur-lg py-5 overflow-hidden flex whitespace-nowrap -rotate-2 scale-105 origin-center mt-12 mb-16 border-y" style={{ backgroundColor: `${theme.colors.primary}1A`, borderColor: `${theme.colors.primary}4D`, boxShadow: `0 0 40px ${theme.colors.primary}26` }}>
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                        className="flex items-center gap-12 font-black uppercase text-xl md:text-2xl tracking-widest drop-shadow-lg"
                        style={{ color: theme.colors.textTitle }}
                    >
                        {[...Array(6)].map((_, i) => (
                            <span key={i} className="flex items-center gap-12">
                                <span>BADTAMEEZ DIL</span>
                                <span style={{ color: theme.colors.highlight }}>✦</span>
                                <span>TAMIL FEVER</span>
                                <span style={{ color: theme.colors.highlight }}>✦</span>
                                <span>LET'S NACHO</span>
                                <span style={{ color: theme.colors.highlight }}>✦</span>
                                <span>KAISE MUJHE</span>
                                <span style={{ color: theme.colors.highlight }}>✦</span>
                                <span>THE DISCO SONG</span>
                                <span style={{ color: theme.colors.highlight }}>✦</span>
                                <span>BANG BANG</span>
                                <span style={{ color: theme.colors.highlight }}>✦</span>
                                <span>TAXI TAXI</span>
                                <span style={{ color: theme.colors.highlight }}>✦</span>
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
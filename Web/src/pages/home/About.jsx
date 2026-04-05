import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import PixelCard from "../../components/home/PixelCard";

export default function About() {
    const { theme } = useTheme();

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

    // Holographic glare effect for the ticket
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

    // --- 3. CONSTELLATION MAP DATA ---
    const colleges = [
        { name: "Engineering & Tech", x: "15%", y: "40%" },
        { name: "Medical & Health", x: "35%", y: "70%" },
        { name: "Arts & Science", x: "50%", y: "20%" },
        { name: "Management", x: "70%", y: "60%" },
        { name: "Hotel Management", x: "85%", y: "35%" },
    ];

    // --- 4. MOBILE INTERACTION STATE ---
    const [activeCard, setActiveCard] = useState(null);

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
                {/* Flowing Silk Glows */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-transparent via-[#E31E6E] to-transparent opacity-10 blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-t from-transparent via-[#E4BD8D] to-transparent opacity-10 blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-32">

                {/* =========================================
                    PART 1: INTRO & 3D FESTIVAL TICKET
                ========================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Text Context */}
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

                    {/* Right: 3D Holographic Festival Ticket */}
                    <div className="flex justify-center perspective-1000" onMouseMove={handleTicketMove} onMouseLeave={handleTicketLeave}>
                        <motion.div
                            style={{ rotateX, rotateY, z: 50 }}
                            className="relative w-[320px] h-[180px] md:w-[400px] md:h-[220px] rounded-2xl overflow-hidden group cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {/* Ticket Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] to-[#0A0520] border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />

                            {/* Ticket Content */}
                            <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-3xl font-normal tracking-widest text-white uppercase font-massive" style={{ color: theme.colors.accent }}>RasRang '26</h4>
                                        <p className="text-[10px] tracking-[0.3em] uppercase mt-1 opacity-80" style={{ color: theme.colors.textTitle }}>Official Festival Entry</p>
                                    </div>
                                    <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center transform rotate-12" style={{ borderColor: theme.colors.accent }}>
                                        {/* Music Note Icon */}
                                        <svg className="w-4 h-4" style={{ color: theme.colors.accent }} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-2">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[6px] tracking-[0.3em] font-black text-cyan-400 opacity-60 uppercase mb-1">Auth Clearance: Lvl 4</p>
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

                            {/* Holographic Shimmer Effect */}
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
                    PART 2: COUNTDOWN & MYSTERY LINEUP
                ========================================== */}
                <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">

                    <h3 className="text-2xl font-black uppercase tracking-[0.3em] mb-8 font-massive" style={{ color: theme.colors.accent }}>
                        The Curtains Open In
                    </h3>

                    {/* Timer */}
                    <div className="flex justify-center gap-4 md:gap-8 mb-12">
                        {Object.entries(timeLeft).map(([label, value]) => (
                            <div key={label} className="flex flex-col items-center">
                                <div className="w-16 h-16 md:w-24 md:h-24 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(157,1,233,0.1)]">
                                    <span className="text-2xl md:text-4xl font-black text-white font-massive">{value.toString().padStart(2, '0')}</span>
                                </div>
                                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] mt-3 font-accent" style={{ color: theme.colors.accent }}>{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Mystery Lineup Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-40 bg-[#0A0A0A]/40 border border-white/5 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 backdrop-blur-xl z-10" />
                                {/* Fake blurred content behind */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500" />

                                <div className="relative z-20 flex flex-col items-center">
                                    {/* Star / Stage Icon */}
                                    <svg className="w-8 h-8 opacity-80 mb-2" style={{ color: theme.colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    <p className="text-xs uppercase tracking-widest text-white/90 font-bold font-massive" style={{ color: theme.colors.textTitle }}>Main Stage Act</p>
                                    <p className="text-[9px] uppercase tracking-widest text-white/50 mt-1">Unlocks in {item * 5} Days</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

  
                <div className="relative w-full py-16">
                    <div className="text-center mb-12">

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-24"
                        >
                            <p className="text-xs tracking-[0.5em] uppercase mb-4 font-bold font-accent" style={{ color: theme.colors.accent }}>
                                ✦ Soon ✦
                            </p>
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-wider font-massive" style={{ color: theme.colors.textTitle }}>
                                Incomming{' '}
                                <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, #00B2FF, ${theme.colors.secondary})` }}>
                                    Stars
                                </span>
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
                        {[
                            {
                                id: 1,
                                code: "ACT-01",
                                role: "CLASSIFIED",
                                intel: "Identity withheld for tactical suspense.",
                                img: "https://images.unsplash.com/photo-1525362081669-2b476bb628c3?q=80&w=600"
                            },
                            {
                                id: 2,
                                code: "ACT-02",
                                role: "CLASSIFIED",
                                intel: "Signal encrypted. Reveal imminent.",
                                img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600"
                            }
                        ].map((celeb) => (
                            <PixelCard
                                key={celeb.id}
                                variant="pink"
                                className={`w-full sm:w-[280px] aspect-[10/14] rounded-2xl cursor-pointer group transition-all duration-500 ${activeCard === celeb.id ? 'ring-2 ring-cyan-500/50 scale-[1.02] shadow-[0_0_30px_rgba(34,211,238,0.2)]' : ''}`}
                                onClick={() => setActiveCard(activeCard === celeb.id ? null : celeb.id)}
                            >
                                {/* 1. THE DARK MYSTERY OVERLAY WITH DIGITAL NOISE */}
                                <div className={`absolute inset-0 z-10 bg-[#0a0a0a]/85 backdrop-blur-md transition-all duration-700 overflow-hidden pointer-events-none ${activeCard === celeb.id ? 'opacity-0' : 'group-hover:opacity-0'}`}>
                                    {/* Suspense Particles */}
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div 
                                            key={i}
                                            animate={{ 
                                                y: [-20, 20, -20], 
                                                x: [-20, 20, -20],
                                                opacity: [0.2, 0.5, 0.2]
                                            }}
                                            transition={{ 
                                                duration: 3 + i, 
                                                repeat: Infinity, 
                                                delay: i * 0.5 
                                            }}
                                            className="absolute w-1 h-1 bg-white/20 rounded-full"
                                            style={{ 
                                                top: `${Math.random() * 100}%`, 
                                                left: `${Math.random() * 100}%` 
                                            }}
                                        />
                                    ))}

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.span 
                                            className="text-4xl font-black text-white/5 tracking-tighter italic select-none"
                                        >
                                            SURPRISE
                                        </motion.span>
                                    </div>
                                </div>

                                {/* 2. PREMIUM CONTENT STYLING */}
                                <div className={`absolute inset-0 z-20 p-6 flex flex-col justify-between border border-white/5 rounded-2xl transition-all duration-500 pointer-events-none ${activeCard === celeb.id ? 'border-cyan-500/50 bg-cyan-500/[0.03]' : 'group-hover:border-cyan-500/50'}`}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded-md">
                                            {celeb.code}
                                        </span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
                                    </div>

                                    <div className="space-y-3 text-center sm:text-left">
                                        <div className="space-y-1">
                                            <h4 className={`text-xl font-black italic uppercase transition-colors duration-500 ${activeCard === celeb.id ? 'text-cyan-300' : 'text-white group-hover:text-cyan-300'}`}>
                                                {celeb.role}
                                            </h4>
                                            <p className="text-[9px] leading-relaxed text-gray-500 font-bold uppercase tracking-widest">
                                                {celeb.intel}
                                            </p>
                                        </div>

                                        {/* Interactive Status Bar */}
                                        <div className="w-full h-[2px] bg-white/5 relative overflow-hidden">
                                            <motion.div
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. CUSTOM "SIGHT" CURSOR (Visible on hover or active) */}
                                <div className={`absolute inset-0 z-30 transition-all duration-500 pointer-events-none ${activeCard === celeb.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-cyan-400/50 rounded-full animate-ping" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_15px_cyan]" />
                                </div>
                            </PixelCard>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

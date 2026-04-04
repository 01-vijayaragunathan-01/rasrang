import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

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

    return (
        <section id="about" className="relative w-full py-24 overflow-hidden bg-transparent">

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
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-transparent via-[#9D01E9] to-transparent opacity-10 blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-t from-transparent via-[#E31E6E] to-transparent opacity-10 blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-32">

                {/* =========================================
                    PART 1: INTRO & 3D FESTIVAL TICKET
                ========================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Text Context */}
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col gap-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border bg-white/5 w-fit font-accent" style={{ borderColor: `${theme.colors.primary}50` }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.highlight }} />
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
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] to-[#0A0520] border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
                            <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-3xl font-normal tracking-widest text-white uppercase font-massive" style={{ color: theme.colors.accent }}>RasRang '26</h4>
                                        <p className="text-[10px] tracking-[0.3em] uppercase mt-1 opacity-80" style={{ color: theme.colors.textTitle }}>VIP Festival Pass</p>
                                    </div>
                                    <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center transform rotate-12" style={{ borderColor: theme.colors.accent }}>
                                        <svg className="w-4 h-4" style={{ color: theme.colors.accent }} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-4">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-white/50 mb-1">Dates</p>
                                        <p className="text-sm text-white font-mono">APR 09-10</p>
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
                    PART 2: COUNTDOWN & SUSPENSE CARDS
                ========================================== */}
                <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center w-full">

                    <h3 className="text-2xl font-black uppercase tracking-[0.3em] mb-8 font-massive" style={{ color: theme.colors.accent }}>
                        The Curtains Open In
                    </h3>

                    {/* Timer */}
                    <div className="flex justify-center gap-4 md:gap-8 mb-24">
                        {Object.entries(timeLeft).map(([label, value]) => (
                            <div key={label} className="flex flex-col items-center">
                                <div className="w-16 h-16 md:w-24 md:h-24 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(157,1,233,0.1)]">
                                    <span className="text-2xl md:text-4xl font-black text-white font-massive">{value.toString().padStart(2, '0')}</span>
                                </div>
                                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] mt-3 font-accent" style={{ color: theme.colors.accent }}>{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* ── SUSPENSE / CLASSIFIED CARDS ── */}
                    <div className="relative w-full pb-16">
                        <div className="text-center mb-16">
                            <p className="text-xs tracking-[0.5em] uppercase mb-4 font-bold font-accent animate-pulse" style={{ color: theme.colors.highlight }}>
                                ✦ Restricted Protocol ✦
                            </p>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-wider font-massive text-white">
                                Impending{' '}
                                <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${theme.colors.highlight}, ${theme.colors.secondary})` }}>
                                    Phenomena
                                </span>
                            </h2>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-8 md:gap-12 max-w-4xl mx-auto px-6">
                            
                            {[
                                { date: "APRIL 09", code: "PROJECT: IGNITION", delay: 0 },
                                { date: "APRIL 10", code: "PROJECT: ZENITH", delay: 0.2 }
                            ].map((mission, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: mission.delay, duration: 0.8 }}
                                    className="relative w-full sm:w-[320px] aspect-[3/4] bg-[#020202] rounded-2xl border border-white/10 overflow-hidden group shadow-2xl"
                                >
                                    {/* Background Grid Pattern */}
                                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                                    {/* Scanning Laser Line (Suspense effect) */}
                                    <motion.div 
                                        animate={{ y: ['-10%', '110%'] }}
                                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                        className="absolute top-0 left-0 w-full h-[2px] z-20"
                                        style={{ backgroundColor: theme.colors.highlight, boxShadow: `0 0 15px ${theme.colors.highlight}` }}
                                    />

                                    {/* The Content */}
                                    <div className="relative z-30 h-full p-8 flex flex-col justify-between">
                                        
                                        {/* Header */}
                                        <div className="flex justify-between items-start border-b border-white/10 pb-4">
                                            <span className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.colors.highlight }}>
                                                {mission.date}
                                            </span>
                                            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.highlight, boxShadow: `0 0 10px ${theme.colors.highlight}` }} />
                                        </div>

                                        {/* Center "Locked" Graphic */}
                                        <div className="flex-1 flex flex-col items-center justify-center">
                                            <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                                                {/* Rotating dashes */}
                                                <motion.div 
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                    className="absolute inset-0 rounded-full border border-dashed border-white/20"
                                                />
                                                <motion.div 
                                                    animate={{ rotate: -360 }}
                                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                                    className="absolute inset-2 rounded-full border border-dashed"
                                                    style={{ borderColor: `${theme.colors.highlight}50` }}
                                                />
                                                {/* Lock Icon */}
                                                <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            
                                            <h3 className="text-white text-2xl font-black uppercase tracking-widest font-massive mb-2">
                                                {mission.code}
                                            </h3>
                                            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-mono text-center">
                                                Intel Encrypted.<br/>Awaiting Clearance.
                                            </p>
                                        </div>

                                        {/* Footer Bar */}
                                        <div className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-center transition-colors group-hover:bg-white/10">
                                            <span className="text-[9px] uppercase tracking-widest font-bold font-accent" style={{ color: theme.colors.highlight }}>
                                                Data Corrupted / Access Denied
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
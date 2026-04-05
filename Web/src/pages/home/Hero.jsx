import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function Hero() {
    const [loaded, setLoaded] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 200);
        return () => clearTimeout(t);
    }, []);

    // 1. The 3D Tilt & Breathing Physics
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Continuous Breathing Animation
    const [pulse, setPulse] = useState(1);
    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(prev => prev === 1 ? 1.03 : 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const rotateX = useTransform(y, [-1, 1], [15, -15]);
    const rotateY = useTransform(x, [-1, 1], [-15, 15]);

    // 2. The Glow Effect
    const glowIntensity = useTransform(x, [-1, 1], [0.8, 1.2]);
    const logoGlow = useMotionTemplate`drop-shadow(0 0 ${useTransform(glowIntensity, [0.8, 1.2], [15, 25])}px rgba(157,1,233,0.5))`;

    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
        y.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <section
            id="home"
            className="relative w-full min-h-screen flex items-center justify-center pt-20 pb-20 lg:py-0"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* --- CINEMATIC OVERLAYS --- */}
            {/* 1. Moving Film Grain */}
            <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.15]" 
                 style={{ 
                    backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
                    backgroundSize: '200px 200px',
                    animation: 'noise 0.2s infinite'
                 }} 
            />

            {/* 2. Drifting Light Leak */}
            <motion.div 
                animate={{ 
                    x: ["-20%", "20%", "-20%"],
                    y: ["-10%", "10%", "-10%"],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 z-[1] pointer-events-none blur-[120px]"
                style={{ 
                    background: 'radial-gradient(circle at 50% 50%, rgba(224, 94, 49, 0.15) 0%, transparent 70%)'
                }}
            />

            <style>{`
                @keyframes noise {
                    0% { transform: translate(0,0) }
                    10% { transform: translate(-5%,-5%) }
                    20% { transform: translate(-10%,5%) }
                    30% { transform: translate(5%,-10%) }
                    40% { transform: translate(-5%,15%) }
                    50% { transform: translate(-10%,5%) }
                    60% { transform: translate(15%,0) }
                    70% { transform: translate(0,10%) }
                    80% { transform: translate(-15%,0) }
                    90% { transform: translate(10%,5%) }
                    100% { transform: translate(5%,0) }
                }
            `}</style>
            {/* --- BACKGROUND VIDEO --- */}
            <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-40"
                src="/Assets/hero.MOV" // Ensure this path is correct (relative to the public folder)
            />
            <div className={`relative z-30 w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-6 lg:px-12 xl:px-16 transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                    {/* LEFT WING */}
                    <div className="order-2 lg:order-1 lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
                        <div className="group/date cursor-default">
                            <p className="text-[10px] tracking-[0.6em] uppercase mb-3 opacity-40 font-accent transition-all group-hover:opacity-70 group-hover:tracking-[0.8em]" style={{ color: theme.colors.textSubtitle }}>
                                Save The Date
                            </p>
                            <span
                                className="text-4xl md:text-4xl xl:text-5xl tracking-widest uppercase font-black font-massive flex flex-col gap-1"
                                style={{
                                    background: 'linear-gradient(135deg, #e05e31 0%, #FFBD8B 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    filter: 'drop-shadow(0 0 15px rgba(224, 94, 49, 0.3))'
                                }}
                            >
                                <span className="block mb-[-0.2em]">APR 09</span>
                                <span className="text-2xl opacity-60 ml-1">&</span>
                                <span className="mt-[-0.2em]">APR 10</span>
                            </span>
                        </div>

                        <div className="h-px w-16 opacity-40" style={{ background: 'linear-gradient(135deg, #e05e31 0%, #FFBD8B 100%)' }} />

                        <p className="text-sm leading-relaxed tracking-wide opacity-60 max-w-[280px] font-body" style={{ color: theme.colors.textDescription }}>
                            A grand celebration of art, music, dance & theatre — where every performance tells a story etched in light.
                        </p>
                    </div>

                    {/* CENTER: Logo */}
                    <div className="order-1 lg:order-2 lg:col-span-6 flex justify-center items-center relative perspective-1000">
                        {/* Powerful Pulse Glow */}
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] blur-[100px] rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(224, 94, 49, 0.25), transparent)' }} 
                        />

                        <motion.div
                            style={{ rotateX, rotateY, z: 50 }}
                            animate={{ scale: pulse }}
                            className="relative inline-flex justify-center items-center group cursor-pointer p-4 xs:p-8 pointer-events-auto max-w-full"
                            whileHover={{ scale: 1.08 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <motion.img
                                src="/Assets/rasrang.png"
                                alt="RasRang Logo"
                                style={{ filter: logoGlow }}
                                className="h-[14rem] xs:h-[18rem] sm:h-[22rem] md:h-[24rem] lg:h-[26rem] w-auto max-w-[85vw] object-contain relative z-10 transition-all duration-100"
                            />
                        </motion.div>
                    </div>

                    {/* RIGHT WING */}
                    <div className="order-3 lg:order-3 lg:col-span-3 flex flex-col items-center lg:items-end text-center lg:text-right gap-6">
                        <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-70 font-cultural" style={{ color: theme.colors.textSubtitle }}>
                            Where Culture Meets the Stars <br /> Edition 2026
                        </p>

                        <div className="flex flex-col gap-4 w-full max-w-[200px] items-end px-1.5 lg:px-0">
                            {/* Explore Events - Light Honey Gradient */}
                            <a
                                href="/events"
                                className="w-full py-4 text-xs font-black tracking-[0.25em] uppercase text-center transition-all duration-300 hover:-translate-y-1 rounded-sm font-massive text-black"
                                style={{
                                    // Light Honey/Champagne Gradient
                                    background: `linear-gradient(135deg, #e05e31 0%, #FFBD8B 100%)`,
                                    boxShadow: `0 8px 20px rgba(255, 204, 51, 0.2)`
                                }}
                            >
                                Explore Events
                            </a>

                            {/* Past Memories - Redirects to Gallery */}
                            <a
                                href="/gallery"
                                className="w-full py-4 text-xs font-black tracking-[0.25em] uppercase text-center transition-all duration-300 hover:-translate-y-1 hover:bg-orange-300/10 rounded-sm border font-massive"
                                style={{
                                    color: '#FFB347',
                                    borderColor: 'rgba(255, 179, 71, 0.5)',
                                }}
                            >
                                Past Memories
                            </a>
                        </div>

                        <div className="mt-4 opacity-30 flex flex-col items-center lg:items-end hidden sm:flex">
                            <div className="flex gap-1 h-8">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className={`bg-white ${i % 3 === 0 ? 'w-1' : 'w-0.5'} h-full opacity-40`} />
                                ))}
                            </div>
                            <span className="text-[8px] tracking-[0.5em] mt-2 text-white">RSRNG-26</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Cue - Hidden on Mobile, Enhanced for Desktop */}
            {/* Scroll Cue - Minimalist & Cinematic */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
                <span className="text-[7px] tracking-[1em] uppercase opacity-40 mb-1" style={{ color: theme.colors.textMuted }}>S C R O L L</span>
                <div className="flex flex-col items-center">
                    <motion.div 
                        animate={{ y: [0, 15, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[1.5px] h-12 rounded-full" 
                        style={{ background: `linear-gradient(to bottom, ${theme.colors.accent}, transparent)` }} 
                    />
                </div>
            </div>
        </section>
    );
}
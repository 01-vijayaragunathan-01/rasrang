import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const HeadlineDJ = () => {
    const { theme } = useTheme();
    const containerRef = React.useRef(null);
    
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);

    return (
        <section 
            ref={containerRef}
            className="relative w-full h-[80vh] md:h-screen overflow-hidden flex items-center justify-center bg-black"
        >
            {/* Parallax Background Image */}
            <motion.div 
                style={{ y, scale }}
                className="absolute inset-0 z-0"
            >
                <img 
                    src="/Assets/hero/djgoutham.jpeg" 
                    alt="DJ Gowtham Headliner" 
                    className="w-full h-[120%] object-cover opacity-60"
                />
                {/* Tactical Vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
            </motion.div>

            {/* Neon Pulse Overlay */}
            <div className="absolute inset-0 z-10 opacity-30 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
            </div>

            {/* Content Container */}
            <motion.div 
                style={{ opacity }}
                className="relative z-20 container mx-auto px-6 flex flex-col items-center text-center space-y-8"
            >
                {/* Tactical Badge */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="px-4 py-1.5 rounded-md border border-cyan-500/50 bg-cyan-500/10 backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                    <span className="text-[10px] md:text-xs font-black tracking-[0.4em] uppercase text-cyan-400">
                        Main Stage Intel Unlocked
                    </span>
                </motion.div>

                {/* Massive Artist Name */}
                <div className="space-y-2">
                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-black font-massive italic uppercase text-white tracking-tighter leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        DJ GOWTHAM
                    </h2>
                    <p className="text-xl md:text-3xl font-light tracking-[0.2em] uppercase text-cyan-300/80 font-massive">
                        Audio Dominance • April 09
                    </p>
                </div>

                {/* Vibe Dialogue (The Hype Copy) */}
                <div className="max-w-2xl pt-8 border-t border-white/10">
                    <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm md:text-lg text-gray-400 font-medium italic leading-relaxed font-body"
                    >
                        "Prepare for the frequency shift. When the sun sets on day one, the rhythm takes command. Feel the pulse, embrace the energy, and witness the main stage takeover."
                    </motion.p>
                </div>

                {/* Action Indicator */}
                <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="pt-12 text-[10px] tracking-[0.6em] uppercase text-white/30"
                >
                    Experience The Drop
                </motion.div>
            </motion.div>

            {/* Corner Markers */}
            <div className="absolute top-12 left-12 w-8 h-8 border-t-2 border-l-2 border-white/20" />
            <div className="absolute top-12 right-12 w-8 h-8 border-t-2 border-r-2 border-white/20" />
            <div className="absolute bottom-12 left-12 w-8 h-8 border-b-2 border-l-2 border-white/20" />
            <div className="absolute bottom-12 right-12 w-8 h-8 border-b-2 border-r-2 border-white/20" />
        </section>
    );
};

export default HeadlineDJ;

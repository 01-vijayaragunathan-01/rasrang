import { useEffect, useRef, useState } from "react";
import Particles from "./Particles";
import { useTheme } from "../../context/ThemeContext";

export default function Hero() {
    const [loaded, setLoaded] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 200);
        return () => clearTimeout(t);
    }, []);

    return (
        <section id="home" className="relative w-full h-screen overflow-hidden flex items-center justify-center">
            {/* Particles Background */}
            <div className="absolute inset-0 z-0 bg-transparent">
              <Particles
                particleColors={["#ffffff"]}
                particleCount={500}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={150}
                moveParticlesOnHover
                alphaParticles={false}
                disableRotation={false}
                pixelRatio={7}
              />
            </div>



            {/* Main Content */}
            <div className={`relative z-30 text-center px-6 transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>



                {/* Main Title */}
                <div className="flex justify-center mb-2">
                    <img
                        src="/Assets/rasrang.png" // Replace with the actual path to your logo asset (e.g., logo.png in the public folder)
                        alt="RasRang Logo"
                        // Scale height using clamp to match visual weight of original font title
                        className="h-[clamp(10rem,40vw,25rem)] w-auto object-contain animate-pulse-grow"
                    />
                </div>

                {/* Event Dates moved below logo */}
                <div className="mb-8">
                    <span 
                        className="text-xl md:text-3xl tracking-[0.1em] uppercase"
                        style={{ 
                            fontFamily: "'round_8four', sans-serif",
                            color: theme.colors.primary,
                            textShadow: `0 0 15px ${theme.colors.primaryGlow}`
                        }}
                    >
                        April 9 & 10
                    </span>
                </div>

                {/* Subtitle */}
                <p
                    className="text-sm md:text-base tracking-[0.35em] uppercase mb-3"
                    style={{ fontFamily: "'Courier New', monospace", color: theme.colors.textMuted }}
                >
                    Where Culture Meets the Stars
                </p>

                {/* Decorative line */}
                <div className="flex items-center justify-center gap-3 my-8">
                    <div className="h-px w-24" style={{ background: `linear-gradient(to right, transparent, ${theme.colors.highlight}, ${theme.colors.accent})` }} />
                    <svg className="w-4 h-4" style={{ color: theme.colors.primary }} viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2Z" />
                    </svg>
                    <div className="h-px w-24" style={{ background: `linear-gradient(to left, transparent, ${theme.colors.highlight}, ${theme.colors.accent})` }} />
                </div>

                {/* Body Copy */}
                <p
                    className="max-w-xl mx-auto text-sm leading-relaxed tracking-wide mb-12"
                    style={{ fontFamily: "'Georgia', serif", color: theme.colors.textMuted }}
                >
                    A grand celebration of art, music, dance & theatre — where every performance
                    tells a story etched in light and memory.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    {/* Explore Events - Vibrant Gradient Button */}
                    <a
                        href="#events"
                        className="group relative px-10 py-4 text-xs font-black italic tracking-[0.25em] uppercase overflow-hidden transition-all duration-300"
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            color: theme.colors.textMain,
                            background: `linear-gradient(45deg, ${theme.colors.accent}, ${theme.colors.surface}, ${theme.colors.highlight})`
                        }}
                    >
                        <span className="relative z-10 group-hover:scale-110 transition-transform block">
                            Explore Events
                        </span>
                        {/* Hover Overlay for brightness */}
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>

                    {/* Past Memories - Gradient Border Button */}
                    <a
                        href="#past-events"
                        className="relative px-10 py-4 text-xs font-black italic tracking-[0.25em] uppercase group overflow-hidden"
                        style={{ fontFamily: "'Inter', sans-serif", color: theme.colors.textMain }}
                    >
                        {/* Animated Gradient Border */}
                        <div className="absolute inset-0 p-[2px]" style={{ background: `linear-gradient(to right, ${theme.colors.accent}, ${theme.colors.surface}, ${theme.colors.highlight})` }}>
                            <div className="w-full h-full group-hover:bg-transparent transition-colors duration-300" style={{ backgroundColor: theme.colors.background }} />
                        </div>

                        <span className="relative z-10 transition-colors duration-300" style={{ color: theme.colors.textMain }}>
                            Past Memories
                        </span>
                    </a>
                </div>
            </div>

            {/* Scroll Cue */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-[9px] tracking-[0.4em] uppercase" style={{ fontFamily: "'Courier New', monospace", color: theme.colors.textMuted }}>Scroll</span>
                <div className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${theme.colors.primaryGlow}, transparent)` }} />
            </div>
        </section>
    );
}
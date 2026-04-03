import { useEffect, useState } from "react";
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
        <section id="home" className="relative w-full min-h-screen overflow-hidden flex items-center justify-center pt-20 pb-12 lg:py-0">
            {/* Particles Background */}
            <div className="absolute inset-0 z-0 bg-transparent">
              <Particles
                particleColors={["#ffffff", theme.colors.primary, theme.colors.secondary]}
                particleCount={400}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={120}
                moveParticlesOnHover
                alphaParticles={true}
                disableRotation={false}
              />
            </div>

            {/* Main Content - Modern Poster Grid */}
            <div className={`relative z-30 w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-6 lg:px-12 xl:px-16 transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    
                    {/* LEFT WING: Context (Takes up 3 columns on desktop) */}
                    <div className="order-2 lg:order-1 lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
                        
                        {/* Event Date Block */}
                        <div>
                            <p className="text-[10px] tracking-[0.4em] uppercase mb-2 opacity-70" style={{ color: theme.colors.textSubtitle }}>
                                Save The Date
                            </p>
                            <span 
                                className="text-3xl md:text-4xl xl:text-5xl tracking-widest uppercase font-black leading-tight"
                                style={{ color: theme.colors.accent, textShadow: `0 0 20px ${theme.colors.primary}40` }}
                            >
                                APR 09
                                <br />& 10
                            </span>
                        </div>

                        {/* Divider Line (Left Aligned) */}
                        <div className="h-px w-16" style={{ background: theme.colors.primary }} />

                        {/* Body Copy */}
                        <p className="text-sm leading-relaxed tracking-wide opacity-80 max-w-[280px]" style={{ color: theme.colors.textDescription }}>
                            A grand celebration of art, music, dance & theatre — where every performance tells a story etched in light.
                        </p>
                    </div>

                    {/* CENTER: The Main Visual / Logo (Takes up 6 columns on desktop) */}
                    <div className="order-1 lg:order-2 lg:col-span-6 flex justify-center group relative perspective-1000">
                        {/* Soft Glow Behind Logo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] blur-[100px] rounded-full" 
                             style={{ background: theme.colors.primaryGlow, opacity: 0.5 }} />
                        
                        <img
                            src="/Assets/rasrang.png" 
                            alt="RasRang Logo"
                            // Upscaled the logo to be heroic again
                            className="h-[clamp(16rem,36vw,28rem)] w-auto object-contain relative z-10 transition-all duration-700 hover:scale-105 hover:drop-shadow-[0_0_30px_rgba(157,1,233,0.5)]"
                        />
                    </div>

                    {/* RIGHT WING: Action & Details (Takes up 3 columns on desktop) */}
                    <div className="order-3 lg:order-3 lg:col-span-3 flex flex-col items-center lg:items-end text-center lg:text-right gap-6">
                        
                        {/* Poster Detail: Coordinates/Location or Subtitle */}
                        <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-70" style={{ color: theme.colors.textSubtitle }}>
                            Where Culture Meets the Stars <br/> Edition 2026
                        </p>

                        <div className="flex flex-col gap-4 w-full max-w-[200px] items-end px-1.5 lg:px-0">
                            {/* Explore Events - Primary Button */}
                            <a
                                href="#events"
                                className="w-full py-4 text-xs font-black tracking-[0.25em] uppercase text-center transition-all duration-300 hover:-translate-y-1 rounded-sm"
                                style={{
                                    color: theme.colors.textTitle,
                                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                    boxShadow: `0 0 20px ${theme.colors.primary}30`
                                }}
                            >
                                Explore Events
                            </a>

                            {/* Past Memories - Secondary Border Button */}
                            <a
                                href="#past-events"
                                className="w-full py-4 text-xs font-black tracking-[0.25em] uppercase text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white/5 rounded-sm border"
                                style={{ 
                                    color: theme.colors.textTitle,
                                    borderColor: theme.colors.primary,
                                }}
                            >
                                Past Memories
                            </a>
                        </div>

                        {/* Modern Poster Detail: Fake Barcode or Ticket ID */}
                        <div className="mt-4 opacity-50 flex flex-col items-center lg:items-end hidden sm:flex">
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

            {/* Scroll Cue (kept at absolute bottom) */}
            <div className="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: theme.colors.textMuted }}>Scroll</span>
                <div className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${theme.colors.primary}, transparent)` }} />
            </div>
        </section>
    );
}
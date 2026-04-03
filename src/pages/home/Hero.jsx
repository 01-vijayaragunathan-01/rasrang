import { useEffect, useRef, useState } from "react";

export default function Hero() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 200);
        return () => clearTimeout(t);
    }, []);

    return (
        <section id="home" className="relative w-full h-screen overflow-hidden flex items-center justify-center">
            {/* Video Background */}
            <video
                className="absolute inset-0 w-full h-full object-cover scale-105"
                src="https://www.w3schools.com/html/mov_bbb.mp"
                /* ↑ Replace with your actual past event video URL */
                autoPlay
                muted
                loop
                playsInline
            />

            {/* Retro Film Grain Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    background: `
            radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%),
            linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%)
          `,
                }}
            />

            {/* Film Scanlines */}
            <div
                className="absolute inset-0 z-10 pointer-events-none opacity-20"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                }}
            />

            {/* Amber Vignette Tint */}
            <div className="absolute inset-0 z-10 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(251,191,36,0.06) 0%, transparent 70%)" }} />

            {/* Film Reel Corner Decorations */}
            {["top-6 left-6", "top-6 right-6", "bottom-6 left-6", "bottom-6 right-6"].map((pos, i) => (
                <div key={i} className={`absolute ${pos} z-20 w-8 h-8 border border-amber-500/30`}>
                    <div className="absolute inset-1 border border-amber-500/20" />
                </div>
            ))}

            {/* Film Strip Top */}
            <div className="absolute top-0 left-0 w-full h-6 z-20 flex"
                style={{ background: "rgba(0,0,0,0.6)" }}>
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="flex-1 border-r border-amber-500/10 flex items-center justify-center">
                        <div className="w-2 h-3 border border-amber-500/20 rounded-sm" />
                    </div>
                ))}
            </div>
            {/* Film Strip Bottom */}
            <div className="absolute bottom-0 left-0 w-full h-6 z-20 flex"
                style={{ background: "rgba(0,0,0,0.6)" }}>
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="flex-1 border-r border-amber-500/10 flex items-center justify-center">
                        <div className="w-2 h-3 border border-amber-500/20 rounded-sm" />
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className={`relative z-30 text-center px-6 transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

           
                {/* Main Title */}
                <div className="flex justify-center mb-2">
                    <img
                        src="/Assets/rasrang.png" // Replace with the actual path to your logo asset (e.g., logo.png in the public folder)
                        alt="RasRang Logo"
                        // Scale height using clamp to match visual weight of original font title
                        className="h-[clamp(6rem,25vw,20rem)] w-auto object-contain"
                    />
                </div>

                {/* Subtitle */}
                <p
                    className="text-stone-300 text-sm md:text-base tracking-[0.35em] uppercase mb-3"
                    style={{ fontFamily: "'Courier New', monospace" }}
                >
                    Where Culture Meets the Stars
                </p>

                {/* Decorative line */}
                <div className="flex items-center justify-center gap-3 my-8">
                    <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-500/70" />
                    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2Z" />
                    </svg>
                    <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-500/70" />
                </div>

                {/* Body Copy */}
                <p
                    className="text-stone-400 max-w-xl mx-auto text-sm leading-relaxed tracking-wide mb-12"
                    style={{ fontFamily: "'Georgia', serif" }}
                >
                    A grand celebration of art, music, dance & theatre — where every performance
                    tells a story etched in light and memory.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                        href="#events"
                        className="group relative px-10 py-4 bg-amber-500 text-black text-xs font-bold tracking-[0.25em] uppercase overflow-hidden hover:bg-amber-400 transition-colors duration-300"
                        style={{ fontFamily: "'Courier New', monospace" }}
                    >
                        <span className="relative z-10">Explore Events</span>
                    </a>
                    <a
                        href="#past-events"
                        className="px-10 py-4 border border-stone-500/50 text-stone-300 text-xs tracking-[0.25em] uppercase hover:border-amber-500/60 hover:text-amber-400 transition-all duration-300"
                        style={{ fontFamily: "'Courier New', monospace" }}
                    >
                        Past Memories
                    </a>
                </div>
            </div>

            {/* Scroll Cue */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-stone-500 text-[9px] tracking-[0.4em] uppercase" style={{ fontFamily: "'Courier New', monospace" }}>Scroll</span>
                <div className="w-px h-8 bg-gradient-to-b from-amber-500/50 to-transparent" />
            </div>
        </section>
    );
}
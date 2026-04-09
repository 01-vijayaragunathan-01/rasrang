import { useLayoutEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const preShowEvents = [
    {
        date: "MAR 26",
        title: "The Midnight Pulse: DJ Akram Live",
        description: "A high-octane takeover of the campus. Experience the raw energy of laser shows and confetti blasts at the official Pre-Show countdown.",
        tags: ["Rave", "Laser", "Hype"],
        image: "/Assets/hero/DSC03609.webp",
        highlight: "Campus Square",
        position: "object-center",
    },
    {
        date: "MAR 26",
        title: "Staccato: Crimson Harmonies",
        description: "An intimate evening of powerful vocals and melodic acoustic sets, setting the soulful rhythm for the festival weekend.",
        tags: ["Staccato", "Acoustic", "Soul"],
        image: "/Assets/hero/DSC_2248.webp",
        highlight: "Open Air Theatre",
        position: "object-top",
    },
    {
        date: "MAR 26",
        title: "Staccato: Vocal Intensity",
        description: "A raw, energetic vocal session bringing the spirit of international stages and pop-culture intensity to SRM Trichy.",
        tags: ["Staccato", "Pop", "Energy"],
        image: "/Assets/hero/DSC_2221.webp",
        highlight: "Main Arena",
        position: "object-top",
    },
    {
        date: "MAR 26",
        title: "Staccato: The Stage Takeover",
        description: "The climactic fusion of the band on the main stage, a visual and sonic spectacle that defines the true spirit of RasRang unity.",
        tags: ["Staccato", "Showcase", "Unity"],
        image: "/Assets/hero/IMG_20260326_193101.jpg.webp",
        highlight: "Main Arena",
        position: "object-top",
    },
];

export default function PastEvents() {
    const { theme } = useTheme();
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const gridRef = useRef(null);
    const ctaRef = useRef(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // --- MOBILE FIRST ENTRY ---
            mm.add("(max-width: 767px)", () => {
                gsap.from(headerRef.current, {
                    y: 60,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: "top 90%",
                    }
                });

                gsap.from(".event-card", {
                    y: 100,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.25, 
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: gridRef.current,
                        start: "top 95%",
                    }
                });
            });

            // --- DESKTOP REFINEMENTS ---
            mm.add("(min-width: 768px)", () => {
                gsap.from(headerRef.current, {
                    y: 120,
                    opacity: 0,
                    duration: 1.5,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: "top 85%",
                    }
                });

                gsap.from(".event-card", {
                    y: 150,
                    opacity: 0,
                    scale: 0.9,
                    duration: 1.5,
                    stagger: 0.2,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: gridRef.current,
                        start: "top 80%",
                    }
                });
            });

            gsap.from(ctaRef.current, {
                y: 40,
                opacity: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: ctaRef.current,
                    start: "top 95%",
                }
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    const onHover = (e, isEnter) => {
        if (window.innerWidth < 1024) return;
        gsap.to(e.currentTarget, {
            y: isEnter ? -10 : 0,
            scale: isEnter ? 1.03 : 1,
            boxShadow: isEnter ? `0 25px 50px rgba(157,1,233,0.2)` : "0 0 0 rgba(0,0,0,0)",
            borderColor: isEnter ? `${theme.colors.secondary}60` : `${theme.colors.primary}20`,
            duration: 0.4,
            ease: "power2.out"
        });
        const glowLine = e.currentTarget.querySelector(".glow-line");
        gsap.to(glowLine, {
            width: isEnter ? "100%" : "0%",
            duration: 0.5,
            ease: "sine.inOut"
        });
    };

    return (
        <section ref={containerRef} id="pre-show-events" className="relative py-32 overflow-hidden bg-transparent">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-[130px] hardware-accelerated"
                 style={{ background: theme.colors.primary }} />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-10 blur-[120px] hardware-accelerated"
                 style={{ background: theme.colors.secondary }} />

            <div className="relative max-w-7xl mx-auto px-6 font-primary z-10">
                {/* Header Container */}
                <div ref={headerRef} className="text-center mb-24">
                    <p className="text-[10px] sm:text-xs tracking-[0.6em] uppercase mb-4 font-bold font-accent" style={{ color: theme.colors.accent }}>
                        ✦ THE BUILD UP ✦
                    </p>
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-wider font-massive leading-none" style={{ color: theme.colors.textTitle }}>
                        Pre-Show{' '}
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.highlight})` }}>
                            Madness
                        </span>
                    </h2>
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <div className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(to right, transparent, ${theme.colors.primary}60)` }} />
                        <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: `${theme.colors.accent}60` }} />
                        <div className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(to left, transparent, ${theme.colors.primary}60)` }} />
                    </div>
                </div>

                {/* Cards Grid */}
                <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32 items-stretch">
                    {preShowEvents.map((event, i) => (
                        <div
                            key={i}
                            className="event-card group relative overflow-hidden rounded-2xl border transition-colors duration-500 cursor-pointer flex flex-col hardware-accelerated"
                            style={{ 
                                background: "rgba(10, 10, 10, 0.4)", 
                                borderColor: `${theme.colors.primary}20`,
                                backdropFilter: "blur(10px)"
                            }}
                            onMouseEnter={(e) => onHover(e, true)}
                            onMouseLeave={(e) => onHover(e, false)}
                        >
                            {/* Image Wrapper */}
                            <div className="relative aspect-[4/5] sm:aspect-auto sm:h-64 overflow-hidden">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className={`w-full h-full object-cover ${event.position} group-hover:scale-110 transition-transform duration-1000`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
                                
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full backdrop-blur-md border border-white/10" 
                                     style={{ background: `${theme.colors.primary}40` }}>
                                    <span className="text-[10px] tracking-widest font-black font-massive text-white">
                                        {event.date}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 right-4 z-10">
                                    <span className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: theme.colors.accent }}>
                                        {event.highlight}
                                    </span>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="p-6 flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-black mb-3 font-massive leading-tight text-white uppercase tracking-wide">
                                        {event.title}
                                    </h3>
                                    <p className="text-[11px] leading-relaxed mb-6 opacity-60 text-white/80">
                                        {event.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {event.tags.map((tag) => (
                                        <span key={tag}
                                            className="px-2.5 py-1 rounded-full text-[8px] tracking-[0.2em] uppercase font-black border border-white/5"
                                            style={{ 
                                                color: theme.colors.textMuted,
                                                background: "rgba(255, 255, 255, 0.03)"
                                            }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="glow-line absolute bottom-0 left-0 w-0 h-[2px]" 
                                 style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` }} />
                        </div>
                    ))}
                </div>

                {/* Legacy Archive CTA */}
                <div 
                    ref={ctaRef}
                    className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border p-12 text-center"
                    style={{ 
                        background: `${theme.colors.surface}90`, 
                        borderColor: "rgba(157, 1, 233, 0.15)",
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-[9px] tracking-[0.4em] uppercase font-bold mb-4 font-accent" style={{ color: theme.colors.accent }}>
                            Witness The Legacy
                        </span>
                        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-wide font-massive mb-6 text-white">
                            Relive Past <span style={{ color: "transparent", WebkitTextStroke: `1px ${theme.colors.accent}` }}>Editions</span>
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed max-w-xl mb-10 text-white/60">
                            Dive into our visual archives and experience the magic, the chaos, and the unforgettable moments of RasRang history.
                        </p>

                        <a 
                            href="/gallery" 
                            className="group relative inline-flex items-center justify-center gap-3 px-12 py-4 rounded-full text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, boxShadow: `0 15px 35px ${theme.colors.primary}40` }}
                        >
                            <span className="relative z-10">Enter The Gallery</span>
                            <svg className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>
                </div>

            </div>
        </section>
    );
}
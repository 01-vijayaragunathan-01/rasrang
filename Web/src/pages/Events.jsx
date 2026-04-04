import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import gsap from "gsap";
import FestivalModal from "../common/FestivalModal";

// --- MOCK DATA ---
const HEADLINERS = [
    {
        id: "hl1",
        name: "Musical Night: The Crescendo",
        description: "A mesmerizing fusion of classical rhythms and modern bass drops.",
        image: "https://images.unsplash.com/photo-1540039155732-d69282f9fb71?q=80&w=1200&auto=format&fit=crop",
        unlockDate: new Date("March 1, 2026 00:00:00").getTime(), 
    },
    {
        id: "hl2",
        name: "Mystery Artist",
        description: "The Grand Finale Act. A chart-topping sensation waiting in the wings.",
        image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92e?q=80&w=1200&auto=format&fit=crop",
        unlockDate: new Date("April 8, 2026 21:00:00").getTime(), 
    }
];

const EVENTS = [
    { id: 1, title: "Rhythm & Roots", category: "Dance", tags: ["Group Battle", "₹20K Prize"], date: "Apr 09", image: "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=500&auto=format&fit=crop" },
    { id: 2, title: "Canvas of Stars", category: "Arts", tags: ["Live Painting", "Outdoor"], date: "Apr 09", image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=500&auto=format&fit=crop" },
    { id: 3, title: "The Midnight Jam", category: "Music", tags: ["Battle of Bands"], date: "Apr 10", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500&auto=format&fit=crop" },
    { id: 4, title: "Couture & Culture", category: "Fashion", tags: ["Ramp Walk", "Theme: Fusion"], date: "Apr 10", image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=500&auto=format&fit=crop" },
    { id: 5, title: "Tech-Tales", category: "Technical", tags: ["Innovation", "₹30K Prize"], date: "Apr 09", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=500&auto=format&fit=crop" },
    { id: 6, title: "Carnival Games", category: "Informals", tags: ["Fun Zone", "Open All Day"], date: "Apr 09", image: "https://images.unsplash.com/photo-1542840410-3092f99611a3?q=80&w=500&auto=format&fit=crop" },
];

const CATEGORIES = ["All", "Dance", "Music", "Arts", "Fashion", "Technical", "Informals"];

// === SUB-COMPONENTS ===

function HeadlinerCard({ headliner, theme }) {
    const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' });
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            const diff = headliner.unlockDate - now;

            if (diff <= 0) {
                setIsUnlocked(true);
            } else {
                setTimeLeft({
                    d: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
                    h: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
                    m: String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0'),
                    s: String(Math.floor((diff / 1000) % 60)).padStart(2, '0')
                });
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [headliner.unlockDate]);

    return (
        <div className="relative w-full h-[350px] md:h-[450px] rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
            {/* Background Image */}
            <motion.div 
                className="absolute inset-0 w-full h-full"
                animate={{
                    filter: isUnlocked ? "blur(0px) brightness(0.9)" : "blur(25px) brightness(0.4)",
                    scale: isUnlocked ? 1.05 : 1
                }}
                transition={{ duration: 1.5 }}
                style={{
                    backgroundImage: `url(${headliner.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            <AnimatePresence>
                {!isUnlocked ? (
                    /* LOCKED STATE: The Waiting Stage */
                    <motion.div 
                        key="locked"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.8 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-[#0A0A0A] to-transparent"
                    >
                        {/* Spotlight Icon */}
                        <div className="relative mb-6 text-white">
                            <div className="absolute inset-0 blur-2xl rounded-full" style={{ background: theme.colors.secondary, opacity: 0.8 }} />
                            <svg className="w-16 h-16 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        
                        <h3 className="text-xl md:text-3xl font-black uppercase tracking-[0.2em] mb-4 text-white font-massive">Headline Act Sealed</h3>
                        <p className="text-sm uppercase tracking-widest mb-6 font-accent" style={{ color: theme.colors.accent }}>The curtain rises in</p>
                        
                        {/* Countdown Glass Box */}
                        <div className="flex gap-3 md:gap-6 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(197,48,153,0.3)]">
                            {Object.entries(timeLeft).map(([unit, val]) => (
                                <div key={unit} className="flex flex-col items-center w-12 md:w-16">
                                    <span className="text-2xl md:text-4xl font-black text-white font-massive">{val}</span>
                                    <span className="text-[10px] uppercase font-bold mt-1 text-white/60 font-accent">{unit}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    /* UNLOCKED STATE: The Reveal */
                    <motion.div 
                        key="unlocked"
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}
                        className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"
                    >
                        <span className="text-sm font-bold uppercase tracking-[0.3em] mb-2 font-accent" style={{ color: theme.colors.accent }}>Main Stage</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-3 tracking-wide drop-shadow-lg font-massive">
                            {headliner.name}
                        </h2>
                        <p className="text-sm md:text-lg text-white/80 max-w-2xl mb-8 leading-relaxed font-body">
                            {headliner.description}
                        </p>
                        <button 
                            className="w-fit px-10 py-4 rounded-full text-sm font-black uppercase tracking-[0.2em] text-[#020617] transition-all duration-300 hover:scale-105 font-massive"
                            style={{ 
                                background: `linear-gradient(135deg, #22D3EE, #C53099)`, // Vibrant Cyan to Pink
                                boxShadow: `0 10px 30px rgba(197, 48, 153, 0.4)`
                            }}
                        >
                            Get VIP Pass
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function EventCard({ event, theme, index, onClick }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-1, 1], [10, -10]);
    const rotateY = useTransform(x, [-1, 1], [-10, 10]);

    function handleMouseMove(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
        y.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }
    
    // Create the staggered effect (every second card gets pushed down on desktop)
    const staggerClass = index % 2 !== 0 ? "lg:mt-16" : "";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`perspective-1000 w-full h-[450px] ${staggerClass}`}
            onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}
            onClick={onClick}
        >
            <motion.div 
                style={{ rotateX, rotateY }}
                className="relative w-full h-full rounded-3xl overflow-hidden cursor-pointer group border-2 border-white/5 hover:border-[#E31E6E]/50 transition-colors duration-500 shadow-2xl hover:shadow-[0_0_40px_rgba(227,30,110,0.4)]"
            >
                {/* Full Background Image */}
                <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 group-hover:rotate-3" />
                
                {/* Heavy Festival Gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/20 via-transparent to-[#020617] opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#9D01E9]/80 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                
                {/* Floating Date Badge (Looks like a ticket stub) */}
                <div className="absolute top-4 right-4 bg-[#FACC15] text-black px-4 py-2 rounded-full transform rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-[0_0_15px_rgba(250,204,21,0.6)] font-massive">
                    <span className="text-xs font-black uppercase tracking-widest">{event.date}</span>
                </div>

                {/* Content Section (Pushed to the bottom) */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-10 flex flex-col justify-end">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#22D3EE] mb-2 drop-shadow-md transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300 font-accent">
                        ✦ {event.category} ✦
                    </span>
                    <h3 className="text-3xl font-black text-white mb-4 leading-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] font-massive">
                        {event.title}
                    </h3>

                    {/* Neon Pill Tags */}
                    <div className="flex gap-2 flex-wrap transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        {event.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-black uppercase tracking-wide bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// === MAIN PAGE COMPONENT ===

export default function Events() {
    const { theme } = useTheme();
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".events-header", {
                y: -50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out"
            });
            gsap.from(".headliner-card-wrapper", {
                y: 100,
                opacity: 0,
                duration: 1.2,
                stagger: 0.3,
                ease: "back.out(1.7)",
                delay: 0.3
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const filteredEvents = EVENTS.filter(event => activeCategory === "All" || event.category === activeCategory);

    return (
        <section ref={containerRef} id="events" className="relative w-full min-h-screen py-24 md:py-32 overflow-hidden" style={{ backgroundColor: "transparent" }}>
            
            {/* Vibrant Stage Light Ambient Backgrounds */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#C53099]/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#22D3EE]/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-20 md:space-y-32">
                
                {/* SECTION A: The Grand Stages (Headliners) */}
                <div className="space-y-10">
                    <div className="text-center">
                        <h2 className="events-header text-4xl md:text-6xl font-black uppercase tracking-widest text-white mb-4 drop-shadow-[0_0_20px_rgba(157,1,233,0.5)] font-massive">
                            The Grand Stages
                        </h2>
                        <p className="events-header text-sm md:text-base uppercase tracking-[0.4em] font-bold font-accent" style={{ color: theme.colors.accent }}>
                            Experience the Magic
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {HEADLINERS.map(hl => (
                            <div key={hl.id} className="headliner-card-wrapper">
                                <HeadlinerCard headliner={hl} theme={theme} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION B: Festival Explorer (Filters) */}
                <div className="space-y-8">
                    <div className="flex justify-start md:justify-center overflow-x-auto hide-scrollbar gap-4 pb-4">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`relative px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 border font-massive
                                    ${activeCategory === cat 
                                        ? 'bg-white text-[#020617] border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                                        : 'bg-transparent text-white/70 border-white/20 hover:border-white/50 hover:text-white'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* The Hype Tape (Scrolling Marquee) */}
                    <div 
                        className="relative w-[150vw] left-1/2 -translate-x-1/2 py-4 bg-[#E31E6E] transform -rotate-2 shadow-[0_0_30px_rgba(227,30,110,0.4)] z-0 overflow-hidden flex whitespace-nowrap mb-12"
                    >
                        <motion.div 
                            animate={{ x: [0, -1000] }} 
                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                            className="flex gap-8 items-center text-white"
                        >
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex gap-8 items-center">
                                    <span className="text-xl md:text-3xl font-black uppercase tracking-widest italic font-massive">Feel The Rhythm</span>
                                    <span className="text-yellow-300 text-2xl">✦</span>
                                    <span className="text-xl md:text-3xl font-black uppercase tracking-widest italic font-cultural">Where Culture Meets The Stars</span>
                                    <span className="text-[#22D3EE] text-2xl">✦</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* SECTION C: Event Grid */}
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 relative z-10">
                        <AnimatePresence mode="popLayout">
                            {filteredEvents.map((event, index) => (
                                <EventCard 
                                    key={event.id} 
                                    event={event} 
                                    theme={theme} 
                                    index={index} 
                                    onClick={() => setSelectedEvent(event)}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Empty State */}
                    {filteredEvents.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center w-full py-20" 
                        >
                            <span className="text-4xl block mb-4">🎭</span>
                            <p className="uppercase tracking-widest text-sm font-bold text-white/60">
                                Stages are being prepped for this category.
                            </p>
                        </motion.div>
                    )}
                </div>

            </div>

            {/* THE GENERIC MODAL RENDERED FOR EVENTS */}
            <FestivalModal 
                isOpen={!!selectedEvent} 
                onClose={() => setSelectedEvent(null)}
            >
                {selectedEvent && (
                    <div className="flex flex-col gap-6 text-white text-left">
                        {/* Event Image Banner */}
                        <div className="w-full h-48 md:h-64 border border-white/20 relative overflow-hidden -mt-4">
                            <img 
                                src={selectedEvent.image} 
                                alt={selectedEvent.title} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B4B] to-transparent" />
                            <div className="absolute bottom-4 left-4 bg-[#FACC15] text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                {selectedEvent.category}
                            </div>
                        </div>

                        {/* Event Details */}
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-wide text-white mb-2 font-massive">
                                {selectedEvent.title}
                            </h2>
                            <p className="text-[#22D3EE] font-mono text-sm uppercase tracking-widest mb-6 font-accent">
                                📅 Date: {selectedEvent.date} | 📍 Main Stage
                            </p>

                            <p className="text-white/70 leading-relaxed mb-8 font-body">
                                {selectedEvent.description || "Get ready for the most explosive event of the festival. Bring your A-game, gather your crew, and prepare to leave your mark on the RasRang legacy."}
                            </p>

                            {/* Tags/Rules */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {selectedEvent.tags?.map(tag => (
                                    <span key={tag} className="border border-[#C53099]/50 bg-[#C53099]/10 text-white text-[10px] px-3 py-1 font-bold uppercase tracking-wider font-massive">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Call to Action */}
                        <button className="w-full py-4 bg-[#9D01E9] text-white font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[#020617] transition-all border border-[#9D01E9] hover:border-white shadow-[0_0_20px_rgba(157,1,233,0.4)] font-massive">
                            Register Now
                        </button>
                    </div>
                )}
            </FestivalModal>
        </section>
    );
}

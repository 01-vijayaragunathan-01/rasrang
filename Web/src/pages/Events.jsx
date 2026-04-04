import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import FestivalModal from "../common/FestivalModal";
import { Loader2, Sparkles, MapPin, Calendar, Zap, AlertCircle } from "lucide-react";

// --- MOCK DATA (KEEPING HEADLINERS AS MARKETING ITEMS) ---
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
                    <motion.div 
                        key="locked"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.8 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-[#0A0A0A] to-transparent"
                    >
                        <div className="relative mb-6 text-white text-4xl">🔒</div>
                        <h3 className="text-xl md:text-3xl font-black uppercase tracking-[0.2em] mb-4 text-white font-massive">Headline Act Sealed</h3>
                        <p className="text-sm uppercase tracking-widest mb-6 font-accent" style={{ color: theme.colors.accent }}>The curtain rises in</p>
                        <div className="flex gap-3 md:gap-6 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl">
                            {Object.entries(timeLeft).map(([unit, val]) => (
                                <div key={unit} className="flex flex-col items-center w-12 md:w-16">
                                    <span className="text-2xl md:text-4xl font-black text-white font-massive">{val}</span>
                                    <span className="text-[10px] uppercase font-bold mt-1 text-white/60 font-accent">{unit}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="unlocked"
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}
                        className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"
                    >
                        <span className="text-sm font-bold uppercase tracking-[0.3em] mb-2 font-accent" style={{ color: theme.colors.accent }}>Main Stage</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-3 tracking-wide font-massive">{headliner.name}</h2>
                        <p className="text-sm md:text-lg text-white/80 max-w-2xl mb-8 leading-relaxed font-body">{headliner.description}</p>
                        <button className="w-fit px-10 py-4 rounded-full text-sm font-black uppercase tracking-[0.2em] text-[#020617] transition-all bg-[#22D3EE] shadow-[0_10px_30px_rgba(34,211,238,0.4)]">Get VIP Pass</button>
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
    
    const staggerClass = index % 2 !== 0 ? "lg:mt-16" : "";

    return (
        <motion.div
            layout initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`perspective-1000 w-full h-[450px] ${staggerClass}`}
            onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }} onClick={onClick}
        >
            <motion.div 
                style={{ rotateX, rotateY }}
                className="relative w-full h-full rounded-3xl overflow-hidden cursor-pointer group border-2 border-white/5 hover:border-[#E31E6E]/50 transition-colors shadow-2xl"
            >
                <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617] opacity-90" />
                
                <div className="absolute top-4 right-4 bg-[#FACC15] text-black px-4 py-2 rounded-full font-massive text-xs font-black uppercase">{event.date}</div>

                <div className="absolute bottom-0 left-0 w-full p-6 z-10 flex flex-col justify-end">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#22D3EE] mb-2 font-accent">✦ {event.category} ✦</span>
                    <h3 className="text-3xl font-black text-white mb-4 leading-tight font-massive">{event.title}</h3>
                </div>
            </motion.div>
        </motion.div>
    );
}

// === MAIN PAGE COMPONENT ===

export default function Events() {
    const { theme } = useTheme();
    const { csrfToken, isAuthenticated } = useAuth();
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const containerRef = useRef(null);

    // 1. Fetch Real Intel
    const fetchEvents = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/events");
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            console.error("Communications Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        const ctx = gsap.context(() => {
            gsap.from(".events-header", { y: -50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out" });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // 2. Register Logic
    const handleRegister = async (eventId) => {
        if (!isAuthenticated) return alert("CLEARANCE ERROR: Login Required for Registration.");
        setRegistering(true);
        try {
            const response = await fetch("http://localhost:5000/api/events/register", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
                body: JSON.stringify({ eventId }),
                credentials: "include"
            });
            const data = await response.json();
            if (response.ok) {
                alert("FORGE CONFIRMATION: MISSION SECURED. Check your Passport for the Ticket.");
                setSelectedEvent(null);
            } else {
                alert(`FORGE REJECTION: ${data.error}`);
            }
        } catch (err) {
            alert("NETWORK COLLAPSE: Failed to transmit registration intel.");
        } finally {
            setRegistering(false);
        }
    };

    // 3. Dynamic Categories
    const dynamicCategories = ["All", ...new Set(events.map(e => e.category))];
    const filteredEvents = events.filter(event => activeCategory === "All" || event.category === activeCategory);

    return (
        <section ref={containerRef} id="events" className="relative w-full min-h-screen py-24 md:py-32 overflow-hidden bg-black font-massive">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#C53099]/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-20 md:space-y-32">
                
                {/* SECTION A: Headliners */}
                <div className="space-y-10">
                    <div className="text-center">
                        <h2 className="events-header text-4xl md:text-6xl font-black uppercase tracking-widest text-white mb-4">The Grand Stages</h2>
                        <p className="events-header text-sm md:text-base uppercase tracking-[0.4em] font-bold font-accent text-[#C53099]">Experience the Magic</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {HEADLINERS.map(hl => (
                            <div key={hl.id} className="headliner-card-wrapper"><HeadlinerCard headliner={hl} theme={theme} /></div>
                        ))}
                    </div>
                </div>

                {/* SECTION B: Filters & Grid */}
                <div className="space-y-8">
                    <div className="flex justify-start md:justify-center overflow-x-auto hide-scrollbar gap-4 pb-4">
                        {dynamicCategories.map(cat => (
                            <button
                                key={cat} onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all border
                                    ${activeCategory === cat ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6 text-[#22D3EE]">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                <Loader2 className="w-16 h-16" />
                            </motion.div>
                            <p className="uppercase font-black tracking-[0.5em] text-xs animate-pulse">Syncing Event Registry...</p>
                        </div>
                    ) : (
                        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 relative z-10">
                            <AnimatePresence mode="popLayout">
                                {filteredEvents.map((event, index) => (
                                    <EventCard key={event.id} event={event} theme={theme} index={index} onClick={() => setSelectedEvent(event)} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {!loading && filteredEvents.length === 0 && (
                        <div className="text-center w-full py-20 opacity-40">
                            <Zap className="w-12 h-12 mx-auto mb-4 animate-bounce" />
                            <p className="uppercase tracking-widest text-sm font-bold">No active intel found for this sector.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* EVENT MODAL */}
            <FestivalModal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
                {selectedEvent && (
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 text-white text-left relative min-h-0 h-full">
                        <div className="lg:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2" />
                        <div className="w-full lg:w-[42%] flex-shrink-0 relative">
                            <div className="aspect-[1/1.42] w-full border-2 border-white/10 overflow-hidden">
                                <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-full object-cover" />
                                <div className="absolute top-4 left-4 bg-[#E31E6E] text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">{selectedEvent.category}</div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-2">
                            <div className="space-y-6">
                                <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-none font-massive">{selectedEvent.title}</h2>
                                <div className="flex items-center gap-6 py-4 border-y border-white/5">
                                    <div className="flex flex-col"><span className="text-[8px] uppercase font-bold text-white/30 tracking-widest mb-1">Time</span><span className="text-sm font-black uppercase text-[#22D3EE]">{selectedEvent.date}</span></div>
                                    <div className="flex flex-col"><span className="text-[8px] uppercase font-bold text-white/30 tracking-widest mb-1">Sector</span><span className="text-sm font-black uppercase text-white">MAIN STAGE</span></div>
                                </div>
                                <p className="text-white/70 leading-relaxed font-body italic">{selectedEvent.description}</p>
                            </div>
                            <div className="mt-10 lg:mt-0">
                                <button 
                                    onClick={() => handleRegister(selectedEvent.id)}
                                    disabled={registering}
                                    className={`w-full py-5 font-black uppercase text-xl tracking-[0.2em] font-massive transition-all
                                    ${registering ? 'bg-gray-600' : 'bg-[#E31E6E] hover:bg-white hover:text-black shadow-[0_10px_30px_rgba(227,30,110,0.4)]'}`}
                                >
                                    {registering ? "TRANSMITTING..." : "FORGE REGISTRATION"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </FestivalModal>
        </section>
    );
}

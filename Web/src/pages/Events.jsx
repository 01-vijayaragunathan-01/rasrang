import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loader2, Zap, Clock, ArrowRight, X, Sparkles, MapPin, Hammer } from "lucide-react";
import gsap from "gsap";

// ─── FALLBACK DATA ────────────────────────────────────────────────────────
const FALLBACK_HEADLINERS = [
  { 
    id: "h1", 
    title: "Musical Night: The Crescendo", 
    category: "Pro Show", 
    description: "A mesmerizing fusion of classical rhythms and modern bass drops.", 
    imageUrl: "https://images.unsplash.com/photo-1540039155732-d69282f9fb71?q=80&w=1200&auto=format&fit=crop", 
    isHeadliner: true, 
    unlockDate: null 
  },
  { 
    id: "h2", 
    title: "Mystery Artist", 
    category: "Grand Finale", 
    description: "The chart-topping sensation waiting in the wings. A sensory overload of lasers and pure adrenaline.", 
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92e?q=80&w=1200&auto=format&fit=crop", 
    isHeadliner: true, 
    unlockDate: new Date(Date.now() + 86400000 * 3).toISOString() 
  },
];

const FALLBACK_EVENTS = [
  { id: "e1", title: "Rhythm & Roots", category: "Dance", date: "Apr 09", time: "6:00 PM", tags: ["Group Battle", "₹20K Prize"], description: "Classical, folk, and contemporary fusion showcasing India's vibrant heritage.", imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=500&auto=format&fit=crop", venue: "Main Stage" },
  { id: "e2", title: "Canvas of Stars", category: "Arts", date: "Apr 09", time: "4:00 PM", tags: ["Live Painting", "Outdoor"], description: "Soul-stirring unplugged sessions under the twilight.", imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=500&auto=format&fit=crop", venue: "Open Air Theatre" },
  { id: "e3", title: "The Midnight Jam", category: "Music", date: "Apr 10", time: "10:30 PM", tags: ["Battle of Bands"], description: "Live painting battles and abstract expressionism.", imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500&auto=format&fit=crop", venue: "Art Gallery" },
  { id: "e4", title: "Couture & Culture", category: "Fashion", date: "Apr 10", time: "8:00 PM", tags: ["Ramp Walk", "Theme: Fusion"], description: "High fashion meets avant-garde on the illuminated runway.", imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=500&auto=format&fit=crop", venue: "Grand Hall" },
  { id: "e5", title: "Tech-Tales", category: "Technical", date: "Apr 09", time: "10:00 AM", tags: ["Innovation", "₹30K Prize"], description: "Metal crunches metal in the ultimate clash of automated gladiators.", imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=500&auto=format&fit=crop", venue: "Arena" },
  { id: "e6", title: "Carnival Games", category: "Informals", date: "Apr 09", time: "11:00 AM", tags: ["Fun Zone", "Open All Day"], description: "Unhinged comedy and spontaneous chaos.", imageUrl: "https://images.unsplash.com/photo-1542840410-3092f99611a3?q=80&w=500&auto=format&fit=crop", venue: "Auditorium" },
];

// ─── HOOKS ─────────────────────────────────────────────────────────────
function useCountdown(unlockDate) {
  const [timeLeft, setTimeLeft] = useState({ d: "00", h: "00", m: "00", s: "00" });
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (!unlockDate) { setIsUnlocked(true); return; }
    const tick = () => {
      const diff = new Date(unlockDate).getTime() - Date.now();
      if (diff <= 0) { setIsUnlocked(true); return; }
      setTimeLeft({
        d: String(Math.floor(diff / 86400000)).padStart(2, "0"),
        h: String(Math.floor((diff / 3600000) % 24)).padStart(2, "0"),
        m: String(Math.floor((diff / 60000) % 60)).padStart(2, "0"),
        s: String(Math.floor((diff / 1000) % 60)).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [unlockDate]);

  return { timeLeft, isUnlocked };
}

// ─── HEADLINER CARD (Refined) ───────────────────────────────────────────────
function HeadlinerCard({ headliner }) {
  const { timeLeft, isUnlocked } = useCountdown(headliner.unlockDate);

  return (
    <div className="relative w-full rounded-[2.5rem] overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 hover:border-[#9D01E9]/50 transition-all duration-700 headliner-item" style={{ height: "480px" }}>
      {/* Background Image & Effects */}
      <motion.div
        className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110"
        animate={{ filter: isUnlocked ? "blur(0px) brightness(0.85)" : "blur(25px) brightness(0.4)" }}
        transition={{ duration: 1.5 }}
        style={{ backgroundImage: `url(${headliner.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-t from-[#0A0A0A] to-transparent"
          >
            {/* Spotlight Icon (Reference pattern) */}
            <div className="relative mb-8 group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 blur-2xl rounded-full bg-[#C53099] opacity-80" />
                <svg className="w-20 h-20 relative z-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-massive uppercase tracking-[0.2em] mb-4 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Headline Act Sealed</h3>
            <p className="text-sm uppercase tracking-[0.4em] mb-8 font-accent text-[#22D3EE]">The curtain rises in</p>
            
            {/* Countdown Glass Box (Reference pattern) */}
            <div className="flex gap-4 sm:gap-6 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-5 rounded-[2rem] shadow-[0_0_40px_rgba(197,48,153,0.3)] group-hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] transition-all">
                {Object.entries(timeLeft).map(([unit, val]) => (
                    <div key={unit} className="flex flex-col items-center w-14 sm:w-16">
                        <span className="text-3xl sm:text-4xl font-massive text-white">{val}</span>
                        <span className="text-[10px] uppercase font-bold mt-1 text-[#9D01E9] tracking-widest">{unit}</span>
                    </div>
                ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}
            className="absolute inset-0 flex flex-col justify-end p-10 sm:p-12 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"
          >
            <span className="text-sm font-bold uppercase tracking-[0.4em] mb-3 font-accent text-[#22D3EE]">✦ Main Stage ✦</span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-massive uppercase italic text-white mb-4 leading-[0.85] tracking-tighter drop-shadow-2xl">
                {headliner.title}
            </h2>
            <p className="text-sm sm:text-lg text-white/80 max-w-xl mb-10 leading-relaxed font-body">
                {headliner.description}
            </p>
            <button 
                className="w-fit px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_15px_30px_rgba(197,48,153,0.4)] hover:shadow-[0_20px_40px_rgba(34,211,238,0.6)]"
                style={{ background: `linear-gradient(135deg, #22D3EE, #C53099)` }}
            >
                Secure VIP Pass
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── EVENT CARD (Ticket Stub + Neon Tags) ───────────────────────────
function EventCard({ event, index, onClick }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-1, 1], [10, -10]);
  const rotateY = useTransform(x, [-1, 1], [-10, 10]);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    y.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  // Create staggered layout on large screens (Reference pattern)
  const staggerClass = index % 2 !== 0 ? "lg:mt-24" : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`perspective-1000 h-[480px] w-full ${staggerClass}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="group relative w-full h-full bg-[#050510] border-2 border-white/5 hover:border-[#E31E6E]/50 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl hover:shadow-[0_0_60px_rgba(227,30,110,0.3)] transition-all duration-500"
      >
        {/* Cover Image & Heavy Gradients */}
        <div className="absolute inset-0">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 group-hover:rotate-2 opacity-80 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#9D01E9]/40 via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
            
            {/* Ticket Stub Date Badge (Reference pattern) */}
            <div className="absolute top-6 right-6 bg-[#FACC15] text-black px-5 py-2 rounded-xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-[0_5px_15px_rgba(250,204,21,0.5)] font-massive">
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{event.date}</span>
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-black rounded-full" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-black rounded-full" />
            </div>
        </div>

        {/* Content Section */}
        <div className="absolute bottom-0 w-full p-8 z-10 flex flex-col justify-end">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22D3EE] font-accent mb-2 transform -translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
               {event.category} ✦ MISSION
          </span>
          <h3 className="text-3xl sm:text-4xl font-massive uppercase italic text-white mb-6 leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {event.title}
          </h3>
          
          {/* Neon Pill Tags (Reference pattern) */}
          <div className="flex gap-2 flex-wrap transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
              {(event.tags || []).map(tag => (
                  <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full hover:bg-[#E31E6E]/20 hover:border-[#E31E6E]/50 transition-colors">
                      {tag}
                  </span>
              ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MODAL (Refined Premium) ──────────────────────────────────────────────
function EventModal({ event, onClose, onRegister, registering }) {
  if (!event) return null;
  return (
    <AnimatePresence mode="wait">
      {event && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020617]/95 backdrop-blur-2xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }} 
            animate={{ scale: 1, y: 0, opacity: 1 }} 
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative w-full max-w-5xl bg-[#090A1A] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Visual Side */}
            <div className="relative w-full md:w-[45%] h-64 md:h-auto overflow-hidden">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover animate-pulse-slow" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#090A1A]/20 to-[#090A1A]" />
              <div className="absolute top-8 left-8 flex flex-col gap-2">
                   <div className="bg-[#E31E6E] text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg skew-x-[-10deg]">AUTHORIZED ACCESS</div>
              </div>
            </div>

            {/* Content Side */}
            <div className="flex-1 p-8 sm:p-12 overflow-y-auto hide-scrollbar flex flex-col justify-between">
              <button
                onClick={onClose}
                className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-red-500 transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C53099] mb-4 block">SECTOR: {event.category}</span>
                  <h2 className="text-4xl sm:text-6xl font-massive uppercase italic text-white mb-8 leading-[0.9] tracking-tight">
                    {event.title}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 group hover:border-[#22D3EE]/30 transition-colors">
                        <Clock className="w-5 h-5 text-[#22D3EE] mb-3" />
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Time & Launch</p>
                        <p className="text-lg font-massive text-white tracking-wide">{event.date} ✦ {event.time || "TBA"}</p>
                    </div>
                    <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 group hover:border-[#C53099]/30 transition-colors">
                        <MapPin className="w-5 h-5 text-[#C53099] mb-3" />
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Combat Zone</p>
                        <p className="text-lg font-massive text-white tracking-wide">{event.venue || "Main Campus"}</p>
                    </div>
                  </div>

                  <div className="mb-12">
                    <h4 className="font-accent text-3xl text-white mb-4 italic">Mission Objective</h4>
                    <p className="text-white/60 text-base leading-relaxed font-body">{event.description}</p>
                  </div>
              </div>

              <button
                onClick={() => onRegister(event.id)}
                disabled={registering}
                className="w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all duration-500 flex items-center justify-center gap-4 relative overflow-hidden group shadow-2xl"
              >
                 <div className="absolute inset-0 bg-gradient-to-r from-[#22D3EE] via-[#9D01E9] to-[#C53099] group-hover:scale-105 transition-transform duration-700" />
                 <span className="relative z-10 text-white flex items-center gap-3">
                     {registering ? (
                      <><Loader2 size={18} className="animate-spin" /> SYNCHRONIZING SECURE TUNNEL...</>
                    ) : (
                      <>Initialize Clearance Sequence <Zap size={20} className="group-hover:rotate-12 transition-transform" /></>
                    )}
                 </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── MAIN PAGE (Retry) ──────────────────────────────────────────────────────
export default function Events() {
  const { csrfToken, isAuthenticated } = useAuth?.() ?? { csrfToken: null, isAuthenticated: false };
  const toast = useToast?.() ?? { success: console.log, error: console.error };
  const containerRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDate, setActiveDate] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [headliners, setHeadliners] = useState(FALLBACK_HEADLINERS);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events");
        const data = await res.json();
        if (data && Array.isArray(data)) {
            setHeadliners(data.filter(e => e.isHeadliner));
            const nonHeadliners = data.filter(e => !e.isHeadliner).map(e => ({
                ...e,
                tags: e.tags || ["Mission Live", e.category]
            }));
            setEvents(nonHeadliners);
        }
      } catch (err) {
        console.error("API link severed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // GSAP Entrance Sequence
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
        gsap.from(".events-header-node", {
            y: -100, opacity: 0, scale: 0.9, duration: 1.5, stagger: 0.3, ease: "power4.out"
        });
        gsap.from(".headliner-item", {
            y: 50, opacity: 0, duration: 1.2, stagger: 0.4, ease: "back.out(1.2)", delay: 0.5
        });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const handleRegister = async (eventId) => {
    if (!isAuthenticated) return toast.error("ACCESS DENIED: Unauthorized biometric profile.");
    setRegistering(true);
    try {
      const res = await fetch("http://localhost:5000/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ eventId }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("CORE ACCESS GRANTED: Mission token recorded.");
        setSelectedEvent(null);
      } else {
        toast.error(data.error || "Vault verification failure.");
      }
    } catch {
      toast.error("Subspace interference. Retry sequence.");
    } finally {
      setRegistering(false);
    }
  };

  const categories = ["All", "Dance", "Music", "Arts", "Fashion", "Technical", "Informals"];
  const uniqueDates = ["All", ...new Set(events.map(e => e.date.split(" ")[0] || e.date))];
  
  const filtered = events.filter(e => {
    const categoryMatch = activeCategory === "All" || e.category === activeCategory;
    const dateMatch = activeDate === "All" || e.date.includes(activeDate);
    return categoryMatch && dateMatch;
  });

  return (
    <section ref={containerRef} className="relative min-h-screen pb-40 bg-[#020617] overflow-hidden selection:bg-[#22D3EE]/30 selection:text-white">
      
      {/* ── CINEMATIC AMBIENT RIG ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[100vw] h-[100vh] bg-gradient-radial from-[#9D01E9]/20 via-transparent to-transparent pointer-events-none mix-blend-screen opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[120vw] h-[120vh] bg-gradient-radial from-[#22D3EE]/15 via-transparent to-transparent pointer-events-none mix-blend-screen opacity-40 ml-[-50vw]" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[150vw] h-[50vh] bg-[#C53099]/5 blur-[200px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-48 md:pt-60">
        
        {/* ── THE CORE HEADER (Screenshot Fidelity) ── */}
        <div className="mb-32 text-center">
            <h1 className="events-header-node text-8xl sm:text-[10rem] md:text-[14rem] font-massive uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 leading-[0.8] mb-8 filter drop-shadow-[0_0_50px_rgba(157,1,233,0.3)]">
                The Core
            </h1>
            <p className="events-header-node font-accent text-4xl md:text-5xl text-[#22D3EE] mb-10 drop-shadow-lg">Where brilliance converges...</p>
            <div className="events-header-node h-[1px] w-40 mx-auto bg-gradient-to-r from-transparent via-[#9D01E9] to-transparent mb-10" />
            <p className="events-header-node text-white/40 text-xs sm:text-sm max-w-2xl mx-auto font-body uppercase tracking-[0.3em] font-medium leading-loose">
                DIVE INTO THE NEXUS OF CULTURE, TECHNOLOGY, AND ART.<br/> 
                SECURE YOUR CLEARANCE FOR THE DEFINITIVE FESTIVAL EXPERIENCE.
            </p>
        </div>

        {/* ── THE GRAND STAGES (Headliners) ── */}
        <div className="mb-48 relative">
            <div className="text-center mb-16">
                 <h2 className="events-header-node text-4xl md:text-6xl font-massive uppercase italic text-white mb-4 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                    The Grand Stages
                </h2>
                <div className="events-header-node flex items-center justify-center gap-4 text-[#AF94D2] font-accent text-2xl">
                    <Sparkles size={18} className="animate-pulse" />
                    Experience The Magic
                    <Sparkles size={18} className="animate-pulse" />
                </div>
            </div>
            
            {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {[1, 2].map(i => <div key={i} className="rounded-[3rem] bg-white/5 animate-pulse border border-white/5" style={{ height: 480 }} />)}
            </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
                {headliners.map(hl => <HeadlinerCard key={hl.id} headliner={hl} />)}
            </div>
            )}
        </div>

        {/* ── REGISTRY SYSTEM & HYPER FILTERS ── */}
        <div className="mb-20 pb-12 border-b border-white/10 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-12">
                <div>
                    <h3 className="text-4xl lg:text-7xl font-massive uppercase italic text-white mb-2 leading-none">Event Registry</h3>
                    <p className="font-accent text-2xl text-[#E31E6E]">Browse all upcoming missions</p>
                </div>
                
                {/* Sector Filters (Glass Pills) */}
                <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2 -mx-6 px-6 md:px-0 md:mx-0">
                    {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`shrink-0 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border-2
                        ${activeCategory === cat 
                            ? "bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.4)] scale-105" 
                            : "bg-white/[0.03] text-white/40 border-white/5 hover:border-white/20 hover:text-white"
                        }`}
                    >
                        {cat}
                    </button>
                    ))}
                </div>
            </div>

            {/* Date Filters Grid */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#22D3EE] animate-ping" />
                    <span className="text-[10px] uppercase text-white/50 tracking-[0.4em] font-black italic">Filter By Date Line:</span>
                </div>
                <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
                    {uniqueDates.map(date => (
                    <button
                        key={date}
                        onClick={() => setActiveDate(date)}
                        className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border-2
                        ${activeDate === date 
                            ? "bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]" 
                            : "bg-black/40 text-white/30 border-white/5 hover:border-white/10 hover:text-white"
                        }`}
                    >
                        {date}
                    </button>
                    ))}
                </div>
            </div>
        </div>

        {/* ── THE EVENT CONCOURSE ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => <div key={i} className="rounded-[3rem] bg-white/5 animate-pulse border border-white/5 h-[480px]" />)}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 pb-20">
            <AnimatePresence mode="popLayout">
              {filtered.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} onClick={() => setSelectedEvent(event)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-48 bg-white/[0.01] rounded-[4rem] border border-white/5 mt-10 group">
            <div className="text-7xl mb-8 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500">🌌</div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[1em] mb-4">No Missions Detected In This Linear Path</p>
            <button onClick={() => {setActiveCategory("All"); setActiveDate("All");}} className="text-[#22D3EE] text-[10px] uppercase font-bold tracking-widest border-b border-[#22D3EE]/30 pb-1 hover:border-[#22D3EE] transition-all">REINITIALIZE FILTERS</button>
          </motion.div>
        )}

      </div>

      {/* ── THE HYPE TAPE (Ultimate Marquee) ── */}
      <div className="relative mt-40 -mx-[10vw] w-[120vw] overflow-hidden py-14 bg-gradient-to-r from-[#E31E6E] via-[#C53099] to-[#9D01E9] transform -rotate-2 border-y-4 border-black/20 shadow-[0_0_100px_rgba(227,30,110,0.5)] z-[50]">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex gap-20 whitespace-nowrap items-center"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-20 items-center">
              <span className="text-3xl md:text-5xl font-massive uppercase italic text-white drop-shadow-2xl">Feel The Rhythm</span>
              <span className="text-yellow-300 text-5xl drop-shadow-lg">✦</span>
              <span className="text-3xl md:text-5xl font-cultural uppercase text-black font-black">Where Culture Meets The Stars</span>
              <span className="text-3xl md:text-5xl font-massive uppercase italic text-white drop-shadow-2xl">Embrace The Chaos</span>
              <span className="text-[#22D3EE] text-5xl drop-shadow-lg">✦</span>
            </div>
          ))}
        </motion.div>
        
        {/* Anti-Rotate Tape for depth */}
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      </div>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
        registering={registering}
      />
    </section>
  );
}

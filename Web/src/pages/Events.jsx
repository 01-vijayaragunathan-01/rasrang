import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { Loader2, Calendar, MapPin, Clock, Ticket, Sparkles, ArrowRight, X, AlertTriangle, RefreshCcw, Share2 } from "lucide-react";
import gsap from "gsap";
import FestivalModal from "../common/FestivalModal";
import Particles from "../pages/home/Particles";
import { useTheme } from "../context/ThemeContext";
import { HeadlinerSkeleton, EventSkeleton } from "../common/Skeleton";

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

// ─── HEADLINER CARD (Grand Cultural Reveal) ─────────────────────────────
function HeadlinerCard({ headliner }) {
  const { timeLeft, isUnlocked } = useCountdown(headliner.unlockDate);

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden group shadow-2xl border border-[#C53099]/20 hover:border-[#E4BD8D]/50 transition-all duration-700 headliner-item bg-[#1A0B2E]" style={{ height: "460px" }}>
      <motion.div
        className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
        animate={{ filter: isUnlocked ? "blur(0px) brightness(0.9)" : "blur(20px) brightness(0.4)" }}
        transition={{ duration: 1.5 }}
        style={{ backgroundImage: `url(${headliner.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      
      {/* Decorative Cultural Frame */}
      <div className="absolute inset-4 border border-white/10 rounded-[1.5rem] pointer-events-none z-10" />
      
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-t from-[#13072E] to-transparent"
          >
            <Sparkles className="w-12 h-12 text-[#E4BD8D] mb-6 animate-pulse" />
            <h3 className="text-3xl font-bold uppercase tracking-widest mb-4 text-white drop-shadow-md" style={{ fontFamily: "'Playfair Display', serif" }}>Grand Reveal</h3>
            <p className="text-sm uppercase tracking-[0.3em] mb-8 text-[#C53099] font-medium">The stage opens in</p>
            
            <div className="flex gap-4 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-5 rounded-2xl shadow-xl">
                {Object.entries(timeLeft).map(([unit, val]) => (
                    <div key={unit} className="flex flex-col items-center w-12 sm:w-14">
                        <span className="text-3xl sm:text-4xl font-light text-white">{val}</span>
                        <span className="text-[10px] uppercase font-bold mt-1 text-[#E4BD8D] tracking-widest">{unit}</span>
                    </div>
                ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="absolute inset-0 flex flex-col justify-end p-10 sm:p-12 bg-gradient-to-t from-[#13072E] via-[#13072E]/60 to-transparent"
          >
            <span className="text-xs font-bold uppercase tracking-[0.3em] mb-3 text-[#E4BD8D]">✦ {headliner.category} ✦</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                {headliner.title}
            </h2>
            <p className="text-sm text-white/80 max-w-lg mb-8 leading-relaxed">
                {headliner.description}
            </p>
            <button 
                className="w-fit flex items-center gap-3 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[0_0_30px_rgba(227,30,110,0.4)]"
                style={{ background: `linear-gradient(135deg, #C53099, #9D01E9)` }}
            >
                <Ticket className="w-4 h-4" />
                Reserve VIP Pass
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── EVENT CARD (Cultural Arch Design) ───────────────────────────
function EventCard({ event, index, onClick }) {
  // Staggered layout for masonry feel
  const staggerClass = index % 2 !== 0 ? "lg:mt-16" : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative w-full h-[460px] ${staggerClass}`}
      onClick={onClick}
    >
      <div className="group relative w-full h-full bg-[#1A0B2E] border border-white/10 hover:border-[#E4BD8D]/40 rounded-[2.5rem] rounded-tl-[8rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-[0_20px_40px_rgba(157,1,233,0.2)] transition-all duration-500 flex flex-col">
        
        {/* Arch Cover Image */}
        <div className="relative h-[55%] w-full overflow-hidden rounded-tl-[8rem]">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B2E] to-transparent" />
            
            {/* Elegant Date Ribbon */}
            <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-2xl flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-[#E4BD8D]">{event.date.split(" ")[0]}</span>
                <span className="text-lg font-bold">{event.date.split(" ")[1]}</span>
            </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col justify-between flex-1 p-6 sm:p-8 pt-0">
          <div>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C53099] bg-[#C53099]/10 px-3 py-1 rounded-full">
                    {event.category}
                </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-[#E4BD8D] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                {event.title}
            </h3>
            <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">
                {event.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-white/60 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>{event.venue}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#9D01E9]/20 flex items-center justify-center group-hover:bg-[#9D01E9] transition-colors">
                  <ArrowRight className="w-4 h-4 text-white" />
              </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MODAL (Elegant Frosted Panel) ──────────────────────────────────────────────
function EventModal({ event, onClose, onRegister, registering, onShare }) {
  if (!event) return null;
  return (
    <AnimatePresence mode="wait">
      {event && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#080314]/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, y: 30, opacity: 0 }} 
            animate={{ scale: 1, y: 0, opacity: 1 }} 
            exit={{ scale: 0.95, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-4xl bg-[#1A0B2E] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Visual Side */}
            <div className="relative w-full md:w-[45%] h-64 md:h-auto">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#1A0B2E] hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B2E] to-transparent md:hidden" />
            </div>

            {/* Content Side */}
            <div className="flex-1 p-8 sm:p-10 overflow-y-auto hide-scrollbar flex flex-col justify-between">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#E31E6E] transition-all z-10"
              >
                <X size={18} />
              </button>

              <button
                onClick={() => onShare(event.id)}
                className="absolute top-6 right-20 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#22D3EE] transition-all z-10"
                title="Share Event"
              >
                <Share2 size={16} />
              </button>

              <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-[#E4BD8D]/20 text-[#E4BD8D] text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                      {event.category}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {event.title}
                  </h2>

                  <div className="flex flex-col gap-4 mb-8 pb-8 border-b border-white/10">
                    <div className="flex items-center gap-4 text-white/80">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Calendar className="w-4 h-4 text-[#C53099]" /></div>
                        <div>
                            <p className="text-[10px] uppercase text-white/40 tracking-wider">Date & Time</p>
                            <p className="text-sm font-semibold">{event.date} at {event.time || "10:00 AM"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-white/80">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><MapPin className="w-4 h-4 text-[#22D3EE]" /></div>
                        <div>
                            <p className="text-[10px] uppercase text-white/40 tracking-wider">Venue</p>
                            <p className="text-sm font-semibold">{event.venue || "Main Campus"}</p>
                        </div>
                    </div>
                  </div>

                  <div className="mb-10">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-3">About the Event</h4>
                    <p className="text-white/60 text-sm leading-relaxed">{event.description}</p>
                    
                    {event.rulebookUrl && (
                        <a href={event.rulebookUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-[#E4BD8D]/20 text-[#E4BD8D] rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-[#E4BD8D]/50 transition-all w-full sm:w-auto">
                            View Rulebook Protocol
                        </a>
                    )}
                  </div>
              </div>

              <button
                onClick={() => onRegister(event.id)}
                disabled={registering}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3
                ${registering ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white text-[#13072E] hover:bg-[#E4BD8D] shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
              >
                  {registering ? (
                      <><Loader2 size={18} className="animate-spin" /> Securing Pass...</>
                  ) : (
                      <><Ticket size={18} /> Reserve Your Pass</>
                  )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────
export default function Events() {
  const { theme } = useTheme();
  const { user, csrfToken, isAuthenticated } = useAuth?.() ?? { user: null, csrfToken: null, isAuthenticated: false };
  const toast = useToast?.() ?? { success: console.log, error: console.error };
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [headliners, setHeadliners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [registering, setRegistering] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events`);
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      if (data && Array.isArray(data)) {
          setHeadliners(data.filter(e => e.isHeadliner));
          setEvents(data.filter(e => !e.isHeadliner));
      }
    } catch (err) {
      console.error("API error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle Deep Linking / Auto-open Event Popup
  useEffect(() => {
      if (loading) return;
      const queryParams = new URLSearchParams(location.search);
      const eventId = queryParams.get('id');
      if (eventId) {
          const found = headliners.find(e => e.id === eventId) || events.find(e => e.id === eventId);
          if (found && !selectedEvent) {
              setSelectedEvent(found);
          }
      }
  }, [loading, headliners, events, location.search]);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
        gsap.from(".events-header-fade", { y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const handleRegister = async (eventId) => {
    if (!isAuthenticated) return toast.error("Please log in to reserve your pass.");
    
    // Enforce Onboarding
    if (user && !user.isOnboarded) {
         toast.error("Please complete your Bio-Metric Vault initialization to register.");
         navigate("/onboarding");
         return;
    }

    setRegistering(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ eventId }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Pass reserved successfully! Check your profile.");
        setSelectedEvent(null);
      } else {
        toast.error(data.error || "Registration failed.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = (eventId) => {
      const url = `${window.location.origin}/events?id=${eventId}`;
      navigator.clipboard.writeText(url);
      toast.success("Event link copied to clipboard!");
  };

  const categories = ["All", "Dance", "Music", "Arts", "Fashion", "Technical", "Informals"];
  const filtered = events.filter(e => activeCategory === "All" || e.category === activeCategory);

  return (
    <section ref={containerRef} className="relative min-h-screen pb-32 overflow-hidden bg-black/20">
      
      {/* ── RICH CULTURAL BACKGROUND & PARTICLES ── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <Particles
            particleColors={["#ffffff", theme.colors.primary, theme.colors.secondary]}
            particleCount={300}
            particleSpread={12}
            speed={0.15}
            particleBaseSize={100}
            moveParticlesOnHover
            alphaParticles={true}
            disableRotation={false}
        />
      </div>

      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#E4BD8D]/10 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-40 md:pt-48">
        
        {/* ── ELEGANT HEADER ── */}
        <div className="mb-24 text-center max-w-3xl mx-auto">
            <span className="events-header-fade text-[#E4BD8D] font-bold uppercase tracking-[0.3em] text-sm mb-4 block">
                RasRang 2026
            </span>
            <h1 className="events-header-fade text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                A Symphony of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E4BD8D] via-[#C53099] to-[#22D3EE]">Art & Culture</span>
            </h1>
            <p className="events-header-fade text-white/60 text-base md:text-lg leading-relaxed">
                Immerse yourself in the vibrant heartbeat of our festival. Discover mesmerizing performances, showcase your talent, and be part of the legacy.
            </p>
        </div>

        {/* ── ERROR RECOVERY ── */}
        {error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Signal Lost</h2>
                <p className="text-red-400 text-sm uppercase tracking-widest mb-8 max-w-md mx-auto">
                    The uplink to the event registry has been severed. Check your connection to the mainframe.
                </p>
                <button 
                    onClick={fetchEvents}
                    className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                >
                    <RefreshCcw className="w-4 h-4" /> Re-establish Link
                </button>
            </div>
        ) : (
            <>
                {/* ── THE MANIFESTO / FIERY DIALOGUE ── */}
                {/* ── THE CULTURAL MANIFESTO ── */}
                <div className="mb-32 relative w-full rounded-[3rem] overflow-hidden bg-[#1A0B2E] border border-[#E4BD8D]/20 shadow-[0_20px_60px_rgba(197,48,153,0.15)]">
                    
                    {/* Subtle Background Textures & Glows */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#C53099]/20 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#E4BD8D]/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center p-8 sm:p-12 md:p-16 gap-12 lg:gap-20">
                        
                        {/* Left Side: The Narrative */}
                        <div className="flex-1 space-y-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px w-12 bg-[#E4BD8D]" />
                                <span className="text-[#E4BD8D] text-[10px] font-bold uppercase tracking-[0.4em]">The RasRang Manifesto</span>
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                The Stage Is Yours.<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E4BD8D] to-[#C53099] italic">The Legacy Awaits.</span>
                            </h2>
                            
                            <div className="space-y-6 text-white/70 text-base md:text-lg font-light leading-relaxed max-w-2xl">
                                <p>
                                    <span className="font-semibold text-white">Forget the ordinary.</span> We are not here to merely exist; we are here to ignite the sky. RasRang isn't just an event—it is the beating heart of our campus, a spectacular collision of untamed creativity, raw talent, and relentless passion.
                                </p>
                                <p>
                                    Whether you take the floor to dance like the world is ending, strike chords that send shivers down spines, or innovate the future in real-time—this is your battleground. There are no isolated grand stages reserved for the elite; <span className="text-[#22D3EE] font-medium">every corner of this festival becomes a grand stage if you have the fire to claim it.</span>
                                </p>
                            </div>
                        </div>

                        {/* Right Side: The Floating Quote Card */}
                        <div className="w-full lg:w-[400px] shrink-0">
                            <div className="relative p-8 md:p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500 group">
                                {/* Decorative Quotes */}
                                <span className="absolute -top-6 -left-2 text-8xl text-[#E4BD8D]/20 font-serif leading-none select-none group-hover:text-[#E4BD8D]/40 transition-colors">"</span>
                                <span className="absolute -bottom-16 -right-2 text-8xl text-[#E4BD8D]/20 font-serif leading-none select-none group-hover:text-[#E4BD8D]/40 transition-colors">"</span>
                                
                                <p className="relative z-10 text-2xl md:text-3xl text-white font-medium italic text-center leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Bring your frenzy.<br/>
                                    Bring your soul.<br/>
                                    <span className="text-[#E4BD8D] mt-4 block">Leave your mark.</span>
                                </p>
                                
                                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </div>
                        </div>

                    </div>
                </div>

        {/* ── EVENT EXPLORER ── */}
        <div className="mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Festival Lineup
                </h2>
                
                {/* Elegant Pill Filters */}
                <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
                    {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300
                        ${activeCategory === cat 
                            ? "bg-[#E4BD8D] text-[#13072E] shadow-[0_0_20px_rgba(228,189,141,0.3)]" 
                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        {cat}
                    </button>
                    ))}
                </div>
            </div>

            {/* EVENT GRID */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                {[1, 2, 3].map(i => <EventSkeleton key={i} index={i-1} />)}
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                <AnimatePresence mode="popLayout">
                  {filtered.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i} onClick={() => setSelectedEvent(event)} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {!loading && filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 mt-8">
                <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-sm font-medium">No events scheduled for this category yet.</p>
              </motion.div>
            )}
        </div>
      </>
      )}
      </div>

      {/* ── ELEGANT MARQUEE ── */}
      <div className="relative mt-20 w-full overflow-hidden py-10 bg-[#C53099]/10 border-y border-[#C53099]/20 backdrop-blur-md">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="flex gap-16 whitespace-nowrap items-center"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-16 items-center">
              <span className="text-2xl font-medium tracking-widest uppercase text-white/80">Celebrate Heritage</span>
              <span className="text-[#E4BD8D]">✦</span>
              <span className="text-2xl font-medium tracking-widest uppercase text-[#22D3EE]/80">Embrace Creativity</span>
              <span className="text-[#E4BD8D]">✦</span>
              <span className="text-2xl font-bold tracking-widest uppercase text-white" style={{ fontFamily: "'Playfair Display', serif" }}>RASRANG 2026</span>
              <span className="text-[#E4BD8D]">✦</span>
            </div>
          ))}
        </motion.div>
      </div>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
        registering={registering}
        onShare={handleShare}
      />
    </section>
  );
}
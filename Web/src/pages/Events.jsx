import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Calendar, Sparkles, AlertTriangle, RefreshCcw, SlidersHorizontal 
} from "lucide-react";
import gsap from "gsap";

// ─── CONTEXT & UTILS ──────────────────────────────────────────────────
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { formatEventDate } from "../utils/dateUtils";

// ─── COMPONENTS ───────────────────────────────────────────────────────
import { HeadlinerCard } from "../components/events/HeadlinerCard";
import { EventCard } from "../components/events/EventCard";
import { DateGroupDivider } from "../components/events/DateGroupDivider";
import { EventModal } from "../components/events/EventModal";
import { FilterPanel } from "../components/events/FilterPanel";
import { WhatsappPrompt } from "../components/events/WhatsappPrompt";
import { EventSkeleton } from "../common/Skeleton";
import Particles from "../pages/home/Particles";

/**
 * Events Page - Main Orchestrator
 * Manages event fetching, filtering, and cross-component state.
 */
export default function Events() {
  const { theme } = useTheme();
  const { user, csrfToken, isAuthenticated } = useAuth?.() ?? { user: null, csrfToken: null, isAuthenticated: false };
  const toast = useToast?.() ?? { success: console.log, error: console.error };
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [headliners, setHeadliners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [whatsappPrompt, setWhatsappPrompt] = useState(null);
  const [userRegistrations, setUserRegistrations] = useState([]);

  const fetchUserRegistrations = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/my-registrations`, {
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      });
      const data = await res.json();
      if (data && data.individualTickets) {
        setUserRegistrations(data.individualTickets.map(reg => reg.eventId));
      }
    } catch (err) {
      console.error("Failed to fetch user registrations:", err);
    }
  };

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

  useEffect(() => { fetchEvents(); }, []);
  useEffect(() => { if (isAuthenticated) fetchUserRegistrations(); }, [isAuthenticated]);

  // 📝 SCROLL LOCK: Freeze background when modal is open
  useEffect(() => {
    if (selectedEvent) {
      document.documentElement.classList.add('lenis-stopped');
    } else {
      document.documentElement.classList.remove('lenis-stopped');
    }
    return () => document.documentElement.classList.remove('lenis-stopped');
  }, [selectedEvent]);

  // ── Deep linking & State Restoration
  useEffect(() => {
    if (loading) return;
    const queryParams = new URLSearchParams(location.search);
    const eventId = queryParams.get("id");
    if (eventId) {
      const found = headliners.find(e => e.id === eventId) || events.find(e => e.id === eventId);
      if (found && !selectedEvent) setSelectedEvent(found);
    }
  }, [loading, headliners, events, location.search]);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from(".events-header-fade", {
        y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events?id=${eventId}`);
      return;
    }
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
        fetchUserRegistrations();
        const eventInfo = headliners.find(e => e.id === eventId) || events.find(e => e.id === eventId);
        if (eventInfo && eventInfo.whatsappLink) setWhatsappPrompt(eventInfo.whatsappLink);
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

  const filtered = useMemo(() => events.filter(e => {
    const catMatch = activeCategory === "All" || e.category === activeCategory;
    const dateMatch = !selectedDate || e.date === selectedDate;
    const timeMatch = !selectedTime || e.time === selectedTime;
    return catMatch && dateMatch && timeMatch;
  }), [events, activeCategory, selectedDate, selectedTime]);

  const groupedByDate = useMemo(() => filtered.reduce((acc, event) => {
    const key = event.date || "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {}), [filtered]);

  const sortedDateKeys = useMemo(() => Object.keys(groupedByDate).sort((a, b) => {
    if (a === "unknown") return 1;
    if (b === "unknown") return -1;
    return new Date(a) - new Date(b);
  }), [groupedByDate]);

  const hasActiveFilters = selectedDate || selectedTime;

  return (
    <section ref={containerRef} className="relative min-h-screen pb-32 overflow-hidden bg-black/20">
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
        {/* ── HEADER ── */}
        <div className="mb-24 text-center max-w-3xl mx-auto">
          <span className="events-header-fade text-[#E4BD8D] font-bold uppercase tracking-[0.3em] text-sm mb-4 block">RasRang 2026</span>
          <h1 className="events-header-fade text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            A Symphony of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E4BD8D] via-[#C53099] to-[#22D3EE]">
              Art &amp; Culture
            </span>
          </h1>
          <p className="events-header-fade text-white/60 text-base md:text-lg leading-relaxed">
            Immerse yourself in the vibrant heartbeat of our festival. Discover mesmerizing performances,
            showcase your talent, and be part of the legacy.
          </p>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Signal Lost</h2>
            <p className="text-red-400 text-sm uppercase tracking-widest mb-8 max-w-md mx-auto">The uplink to the event registry has been severed.</p>
            <button onClick={fetchEvents} className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
              <RefreshCcw className="w-4 h-4" /> Re-establish Link
            </button>
          </div>
        ) : (
          <>
            {/* ── HEADLINERS ── */}
            {headliners.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                    {headliners.map(h => <HeadlinerCard key={h.id} headliner={h} />)}
                </div>
            )}

            {/* ── MANIFESTO ── */}
            <div className="mb-32 relative w-full rounded-[3rem] overflow-hidden bg-[#1A0B2E] border border-[#E4BD8D]/20 shadow-[0_20px_60px_rgba(197,48,153,0.15)]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center p-8 sm:p-12 md:p-16 gap-12 lg:gap-20">
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px w-12 bg-[#E4BD8D]" /><span className="text-[#E4BD8D] text-[10px] font-bold uppercase tracking-[0.4em]">The RasRang Manifesto</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    The Stage Is Yours.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E4BD8D] to-[#C53099] italic">The Legacy Awaits.</span>
                  </h2>
                  <p className="text-white/70 text-base md:text-lg font-light leading-relaxed max-w-2xl">
                    <span className="font-semibold text-white">Forget the ordinary.</span> We are not here to merely exist; we are here to ignite the sky. RasRang isn't just an event—it is the beating heart of our campus.
                  </p>
                </div>
                <div className="w-full lg:w-[400px] shrink-0">
                  <div className="relative p-8 md:p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500 text-center">
                    <p className="text-2xl md:text-3xl text-white font-medium italic leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>Bring your frenzy.<br />Bring your soul.<br /><span className="text-[#E4BD8D] mt-4 block">Leave your mark.</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── EXPLORER ── */}
            <div className="mb-16">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Festival Lineup</h2>
                <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeCategory === cat ? "bg-[#E4BD8D] text-[#13072E]" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest font-bold"><SlidersHorizontal className="w-3.5 h-3.5" /><span>Filter:</span></div>
                <FilterPanel
                  events={events}
                  selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime} setSelectedTime={setSelectedTime}
                  onClear={() => { setSelectedDate(""); setSelectedTime(""); }}
                />
              </div>
            </div>

            {/* ── GRID ── */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                {[1, 2, 3].map(i => <EventSkeleton key={i} index={i - 1} />)}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 mt-8">
                <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-sm font-medium">No events found for this filter.</p>
              </motion.div>
            ) : (
              <motion.div layout className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 pb-10">
                <AnimatePresence mode="popLayout">
                  {sortedDateKeys.map(dateKey => (
                    <div key={dateKey} className="contents">
                      <DateGroupDivider dateStr={dateKey} />
                      {groupedByDate[dateKey].map((event, i) => (
                        <EventCard key={event.id} event={event} index={i} onClick={() => setSelectedEvent(event)} />
                      ))}
                    </div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ── MODALS ── */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
        registering={registering}
        onShare={handleShare}
        userRegistrations={userRegistrations}
      />
      <WhatsappPrompt link={whatsappPrompt} onClose={() => setWhatsappPrompt(null)} />
    </section>
  );
}
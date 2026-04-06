import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import {
  Loader2, Calendar, MapPin, Clock, Ticket, Sparkles,
  ArrowRight, X, AlertTriangle, RefreshCcw, Share2,
  ExternalLink, ChevronDown, Filter, SlidersHorizontal
} from "lucide-react";
import gsap from "gsap";
import Particles from "../pages/home/Particles";
import { useTheme } from "../context/ThemeContext";
import { HeadlinerSkeleton, EventSkeleton } from "../common/Skeleton";
import DOMPurify from "dompurify";

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

// ─── DATE FORMATTER ────────────────────────────────────────────────────
function formatEventDate(dateStr) {
  if (!dateStr) return { day: "--", month: "--", year: "----", formatted: "--/--/----", label: "--", monthName: "--", weekday: "--" };
  try {
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return { day: dateStr, month: "", year: "", formatted: dateStr, label: dateStr, monthName: "", weekday: "" };
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear());
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return {
      day,
      month,
      year,
      formatted: `${day}/${month}/${year}`,
      label: `${day} ${monthNames[d.getMonth()]} ${year}`,
      monthName: monthNames[d.getMonth()],
      weekday: weekdays[d.getDay()],
    };
  } catch {
    return { day: dateStr, month: "", year: "", formatted: dateStr, label: dateStr, monthName: "", weekday: "" };
  }
}

// ─── HEADLINER CARD ─────────────────────────────────────────────────────
function HeadlinerCard({ headliner }) {
  const { timeLeft, isUnlocked } = useCountdown(headliner.unlockDate);

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden group shadow-2xl border border-[#C53099]/20 hover:border-[#E4BD8D]/50 transition-all duration-700 bg-[#1A0B2E]" style={{ height: "460px" }}>
      <motion.div
        className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
        animate={{ filter: isUnlocked ? "blur(0px) brightness(0.9)" : "blur(20px) brightness(0.4)" }}
        transition={{ duration: 1.5 }}
        style={{ backgroundImage: `url(${headliner.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
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
            <div
              className="text-sm text-white/80 max-w-lg mb-8 leading-relaxed quill-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(headliner.description) }}
            />
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

// ─── EVENT CARD (with Date Badge outside, full poster on mobile, poster link) ───
function EventCard({ event, index, onClick }) {
  const staggerClass = index % 2 !== 0 ? "lg:mt-16" : "";
  const { day, month, year, formatted, weekday, monthName } = formatEventDate(event.date);

  const handleOpenPoster = (e) => {
    e.stopPropagation();
    if (event.imageUrl) {
      window.open(event.imageUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className={`relative w-full ${staggerClass}`}
    >
      {/* ── DATE BADGE (outside the card, above it) ── */}
      <div className="flex items-center gap-3 mb-3 px-1">
        <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
          <Calendar className="w-3.5 h-3.5 text-[#E4BD8D]" />
          <span className="text-xs font-bold text-white/80 tracking-wider">{weekday}, {day} {monthName} {year}</span>
        </div>
        {event.time && event.time !== "TBA" && (
          <div className="flex items-center gap-2 bg-[#C53099]/10 border border-[#C53099]/20 rounded-xl px-3 py-2">
            <Clock className="w-3.5 h-3.5 text-[#C53099]" />
            <span className="text-xs font-semibold text-[#C53099]">{event.time}</span>
          </div>
        )}
        {event.time === "TBA" && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Clock className="w-3.5 h-3.5 text-white/30" />
            <span className="text-xs font-semibold text-white/30">Time TBA</span>
          </div>
        )}
      </div>

      {/* ── CARD ── */}
      <div className="group relative w-full bg-[#1A0B2E] border border-white/10 hover:border-[#E4BD8D]/40 rounded-[2.5rem] sm:rounded-tl-[8rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-[0_20px_40px_rgba(157,1,233,0.2)] transition-all duration-500 flex flex-col"
        onClick={onClick}
      >
        {/* ── POSTER ── */}
        <div className="relative w-full overflow-hidden sm:rounded-tl-[8rem]">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-auto block object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            style={{ maxHeight: "420px", objectFit: "cover", objectPosition: "top" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B2E] via-[#1A0B2E]/10 to-transparent" />

          {/* Open Poster button (top-left) */}
          <button
            onClick={handleOpenPoster}
            title="View full poster"
            className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-[#9D01E9]/80 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300"
          >
            <ExternalLink className="w-3 h-3" />
            Full Poster
          </button>

          {/* Date ribbon (top-right, small) */}
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-xl flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-[#E4BD8D] font-bold">{day}/{month}</span>
            <span className="text-sm font-bold leading-tight">{year}</span>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="flex flex-col justify-between flex-1 p-6 sm:p-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C53099] bg-[#C53099]/10 px-3 py-1 rounded-full">
                {event.category}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-[#E4BD8D] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
              {event.title}
            </h3>
            <div
              className="text-sm text-white/50 line-clamp-2 leading-relaxed quill-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
            <div className="flex flex-col gap-1 text-[10px] text-white/60 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#22D3EE]" />
                <span>{event.venue || "Main Campus"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#C53099]" />
                <span>{event.time === "TBA" ? "Announced Later" : event.time}</span>
              </div>
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

// ─── DATE GROUP DIVIDER ──────────────────────────────────────────────────
function DateGroupDivider({ dateStr }) {
  const { day, monthName, year, weekday } = formatEventDate(dateStr);
  return (
    <div className="col-span-full flex items-center gap-6 mt-8 mb-2">
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl border border-[#E4BD8D]/40 bg-[#E4BD8D]/5">
          <span className="text-xl font-black text-[#E4BD8D] leading-none">{day}</span>
          <span className="text-[9px] uppercase tracking-widest text-[#E4BD8D]/70 font-bold">{monthName}</span>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">{weekday}</p>
          <p className="text-lg font-bold text-white">{day} {monthName} {year}</p>
        </div>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-[#E4BD8D]/30 via-[#C53099]/20 to-transparent" />
      <Sparkles className="w-4 h-4 text-[#E4BD8D]/30 shrink-0" />
    </div>
  );
}

// ─── MODAL (Elegant Frosted Panel - No Fade) ──────────────────────────────────────────────
function EventModal({ event, onClose, onRegister, registering, onShare, userRegistrations }) {
  if (!event) return null;
  return (
    <AnimatePresence mode="wait">
      {event && (
        <div className="fixed inset-0 z-[900] flex items-end sm:items-center justify-center sm:p-6 px-0 pt-[80px] sm:pt-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#080314]/90 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="relative w-full max-w-4xl bg-[#1A0B2E] border-t sm:border border-white/10 rounded-t-[3rem] sm:rounded-3xl shadow-2xl overflow-y-auto hide-scrollbar flex flex-col md:flex-row max-h-[95vh] sm:max-h-[85vh] z-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Visual Side */}
            <div className="relative w-full md:w-[45%] shrink-0 flex flex-col bg-black overflow-hidden">
              <img src={event.imageUrl} alt={event.title} className="w-full h-auto object-contain" />
              <button 
                  onClick={() => window.open(event.imageUrl, '_blank')}
                  className="absolute bottom-4 right-4 bg-black/50 hover:bg-[#E4BD8D] hover:text-[#13072E] text-white p-3 rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center justify-center shadow-lg z-20 group"
                  title="Open Poster Fullscreen"
              >
                  <ExternalLink size={18} className="group-hover:scale-110 transition-transform"/>
              </button>
            </div>

            {/* Content Side */}
            <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between pb-12">
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

              <div className="flex-1 mt-10 md:mt-0">
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
                            <p className="text-[10px] uppercase text-white/40 tracking-wider">Event Date</p>
                            <p className="text-sm font-semibold">{formatEventDate(event.date).formatted}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 text-white/80">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Clock className="w-4 h-4 text-[#C53099]" /></div>
                        <div>
                            <p className="text-[10px] uppercase text-white/40 tracking-wider">Reporting Time</p>
                            <p className="text-sm font-semibold">{event.time === "TBA" ? "To be announced later" : event.time}</p>
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
                    <div 
                        className="text-white/60 text-sm leading-relaxed quill-content"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}
                    />
                    
                  </div>
              </div>

               {userRegistrations.includes(event.id) && event.whatsappLink ? (
                <a 
                  href={event.whatsappLink} target="_blank" rel="noreferrer"
                  className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 bg-[#25D366] text-[#13072E] hover:bg-white hover:text-black shadow-[0_0_20px_rgba(37,211,102,0.3)]"
                >
                  <Share2 size={18} /> Join WhatsApp Group
                </a>
              ) : (
                <button
                  onClick={() => onRegister(event.id)}
                  disabled={registering || userRegistrations.includes(event.id)}
                  className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3
                  ${(registering || userRegistrations.includes(event.id)) ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white text-[#13072E] hover:bg-[#E4BD8D] shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
                >
                    {userRegistrations.includes(event.id) ? (
                        <>Mission Secured</>
                    ) : registering ? (
                        <><Loader2 size={18} className="animate-spin" /> Securing Pass...</>
                    ) : (
                        <><Ticket size={18} /> Reserve Your Pass</>
                    )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
// ─── DATE / TIME FILTER PANEL ───────────────────────────────────────────
function FilterPanel({ events, selectedDate, setSelectedDate, selectedTime, setSelectedTime, onClear }) {
  const uniqueDates = [...new Set(events.map(e => e.date).filter(Boolean))].sort();
  const uniqueTimes = [...new Set(events.map(e => e.time).filter(t => t && t !== "TBA"))].sort();

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Date filter */}
      <div className="relative">
        <select
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="appearance-none bg-white/5 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider rounded-full px-5 py-2.5 pr-8 cursor-pointer focus:outline-none focus:border-[#E4BD8D]/50 transition-all hover:bg-white/10"
        >
          <option value="">All Dates</option>
          {uniqueDates.map(d => {
            const { label } = formatEventDate(d);
            return <option key={d} value={d} className="bg-[#1A0B2E] text-white">{label}</option>;
          })}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
      </div>

      {/* Time filter */}
      <div className="relative">
        <select
          value={selectedTime}
          onChange={e => setSelectedTime(e.target.value)}
          className="appearance-none bg-white/5 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider rounded-full px-5 py-2.5 pr-8 cursor-pointer focus:outline-none focus:border-[#C53099]/50 transition-all hover:bg-white/10"
        >
          <option value="">All Times</option>
          {uniqueTimes.map(t => (
            <option key={t} value={t} className="bg-[#1A0B2E] text-white">{t}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
      </div>

      {/* Clear */}
      {(selectedDate || selectedTime) && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#E31E6E]/10 border border-[#E31E6E]/30 text-[#E31E6E] text-xs font-bold uppercase tracking-wider hover:bg-[#E31E6E]/20 transition-all"
        >
          <X className="w-3 h-3" /> Clear Filters
        </button>
      )}
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────
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

  // ── Deep link: store pending event id for post-login redirect
  const pendingEventRef = useRef(null);

  const fetchUserRegistrations = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/my-registrations`, {
        headers: { "x-csrf-token": csrfToken },
        credentials: "include"
      });
      const data = await res.json();
      if (data && data.individualTickets) {
        setUserRegistrations(data.individualTickets.map(reg => reg.eventId));
      }
    } catch (err) { console.error("Failed to fetch user registrations:", err); }
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

  // ── Deep linking: auto-open event popup
  useEffect(() => {
    if (loading) return;
    const queryParams = new URLSearchParams(location.search);
    const eventId = queryParams.get("id");
    if (eventId) {
      const found = headliners.find(e => e.id === eventId) || events.find(e => e.id === eventId);
      if (found && !selectedEvent) setSelectedEvent(found);
    }
  }, [loading, headliners, events, location.search]);

  // ── After login: re-open pending event
  useEffect(() => {
    if (!isAuthenticated || loading) return;
    const queryParams = new URLSearchParams(location.search);
    const eventId = queryParams.get("id");
    if (eventId) {
      const found = headliners.find(e => e.id === eventId) || events.find(e => e.id === eventId);
      if (found && !selectedEvent) setSelectedEvent(found);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from(".events-header-fade", { y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  // ── Register: redirect to login if not authenticated, preserve event id in URL
  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      // Store intent and redirect to login with return URL
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

  // ── Filter events
  const filtered = events.filter(e => {
    const catMatch = activeCategory === "All" || e.category === activeCategory;
    const dateMatch = !selectedDate || e.date === selectedDate;
    const timeMatch = !selectedTime || e.time === selectedTime;
    return catMatch && dateMatch && timeMatch;
  });

  // ── Group filtered events by date
  const groupedByDate = filtered.reduce((acc, event) => {
    const key = event.date || "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  const sortedDateKeys = Object.keys(groupedByDate).sort((a, b) => {
    if (a === "unknown") return 1;
    if (b === "unknown") return -1;
    return new Date(a) - new Date(b);
  });

  const hasActiveFilters = selectedDate || selectedTime;

  return (
    <section ref={containerRef} className="relative min-h-screen pb-32 overflow-hidden bg-black/20">

      {/* ── BACKGROUND ── */}
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

        {/* ── ERROR ── */}
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
            {/* ── MANIFESTO ── */}
            <div className="mb-32 relative w-full rounded-[3rem] overflow-hidden bg-[#1A0B2E] border border-[#E4BD8D]/20 shadow-[0_20px_60px_rgba(197,48,153,0.15)]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#C53099]/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#E4BD8D]/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center p-8 sm:p-12 md:p-16 gap-12 lg:gap-20">
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px w-12 bg-[#E4BD8D]" />
                    <span className="text-[#E4BD8D] text-[10px] font-bold uppercase tracking-[0.4em]">The RasRang Manifesto</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    The Stage Is Yours.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E4BD8D] to-[#C53099] italic">The Legacy Awaits.</span>
                  </h2>
                  <div className="space-y-6 text-white/70 text-base md:text-lg font-light leading-relaxed max-w-2xl">
                    <p>
                      <span className="font-semibold text-white">Forget the ordinary.</span> We are not here to merely exist; we are here to ignite the sky. RasRang isn't just an event—it is the beating heart of our campus, a spectacular collision of untamed creativity, raw talent, and relentless passion.
                    </p>
                    <p>
                      Whether you take the floor to dance like the world is ending, strike chords that send shivers down spines, or innovate the future in real-time—this is your battleground. <span className="text-[#22D3EE] font-medium">Every corner of this festival becomes a grand stage if you have the fire to claim it.</span>
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-[400px] shrink-0">
                  <div className="relative p-8 md:p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500 group">
                    <span className="absolute -top-6 -left-2 text-8xl text-[#E4BD8D]/20 font-serif leading-none select-none group-hover:text-[#E4BD8D]/40 transition-colors">"</span>
                    <span className="absolute -bottom-16 -right-2 text-8xl text-[#E4BD8D]/20 font-serif leading-none select-none group-hover:text-[#E4BD8D]/40 transition-colors">"</span>
                    <p className="relative z-10 text-2xl md:text-3xl text-white font-medium italic text-center leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Bring your frenzy.<br />
                      Bring your soul.<br />
                      <span className="text-[#E4BD8D] mt-4 block">Leave your mark.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── FESTIVAL LINEUP ── */}
            <div className="mb-16">
              {/* Header + Filters */}
              <div className="flex flex-col gap-6 mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Festival Lineup
                  </h2>

                  {/* Category Pills */}
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

                {/* Date + Time filters */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest font-bold">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filter:</span>
                  </div>
                  <FilterPanel
                    events={events}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                    onClear={() => { setSelectedDate(""); setSelectedTime(""); }}
                  />
                </div>

                {/* Active filter summary */}
                {hasActiveFilters && (
                  <p className="text-xs text-white/40 font-medium">
                    Showing {filtered.length} event{filtered.length !== 1 ? "s" : ""}
                    {selectedDate && ` on ${formatEventDate(selectedDate).label}`}
                    {selectedTime && ` at ${selectedTime}`}
                  </p>
                )}
              </div>

              {/* EVENT GRID — Grouped by Date */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                  {[1, 2, 3].map(i => <EventSkeleton key={i} index={i - 1} />)}
                </div>
              ) : filtered.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 mt-8">
                  <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 text-sm font-medium">No events found for this filter.</p>
                  {hasActiveFilters && (
                    <button onClick={() => { setSelectedDate(""); setSelectedTime(""); }} className="mt-4 text-[#E4BD8D] text-xs font-bold uppercase tracking-widest hover:underline">
                      Clear filters
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div layout className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 pb-10">
                  <AnimatePresence mode="popLayout">
                    {sortedDateKeys.map(dateKey => (
                      <div key={dateKey} className="contents">
                        <DateGroupDivider dateStr={dateKey} />
                        {groupedByDate[dateKey].map((event, i) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            index={i}
                            onClick={() => setSelectedEvent(event)}
                          />
                        ))}
                      </div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── MARQUEE ── */}
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
        userRegistrations={userRegistrations}
      />

      {/* ── WHATSAPP PROMPT ── */}
      <AnimatePresence>
        {whatsappPrompt && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#13072E] border-2 border-[#25D366]/40 rounded-3xl p-8 shadow-[0_0_50px_rgba(37,211,102,0.2)] text-center"
            >
              <div className="w-16 h-16 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#25D366]/50 shadow-[0_0_20px_rgba(37,211,102,0.4)]">
                <Sparkles className="w-8 h-8 text-[#25D366]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-[#25D366] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Mission Success
              </h3>
              <p className="text-white/70 text-sm font-medium mb-8">
                Your pass has been secured. Join the official comms channel to stay updated on critical intelligence for this event.
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href={whatsappPrompt} target="_blank" rel="noreferrer"
                  onClick={() => setWhatsappPrompt(null)}
                  className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all bg-[#25D366] text-[#13072E] hover:bg-white hover:text-black shadow-xl flex items-center justify-center gap-2"
                >
                  Join WhatsApp Comms
                </a>
                <button
                  onClick={() => setWhatsappPrompt(null)}
                  className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  Dismiss / Join Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
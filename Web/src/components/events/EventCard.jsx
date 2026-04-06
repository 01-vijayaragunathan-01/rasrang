import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ExternalLink, ArrowRight } from "lucide-react";
import DOMPurify from "dompurify";
import { formatEventDate } from "../../utils/dateUtils";

/**
 * Standard Event Card for the main festival lineup.
 * Features a poster preview and detailed metadata.
 */
export function EventCard({ event, index, onClick }) {
  const staggerClass = index % 2 !== 0 ? "lg:mt-16" : "";
  const { day, month, year, weekday, monthName } = formatEventDate(event.date);

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

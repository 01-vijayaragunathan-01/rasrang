import { ChevronDown, X } from "lucide-react";
import { formatEventDate } from "../../utils/dateUtils";

/**
 * FilterPanel component for narrowing down the festival lineup.
 * Allows filtering by category, date, and time.
 */
export function FilterPanel({ events, selectedDate, setSelectedDate, selectedTime, setSelectedTime, onClear }) {
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

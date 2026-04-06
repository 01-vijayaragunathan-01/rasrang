import { Sparkles } from "lucide-react";
import { formatEventDate } from "../../utils/dateUtils";

/**
 * Divider component to group events by their dates.
 * Enhances timeline readability in the main grid.
 */
export function DateGroupDivider({ dateStr }) {
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

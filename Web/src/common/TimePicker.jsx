import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown } from "lucide-react";
import { APP_THEME } from "../constants/theme";

export default function TimePicker({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const { colors } = APP_THEME;

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = ["00", "15", "30", "45"];
    const periods = ["AM", "PM"];

    // Parse existing "HH:MM AM/PM" or set default
    const [h, m, p] = value ? value.split(/[:\s]/) : ["10", "00", "AM"];

    const handleSelect = (newH, newM, newP) => {
        onChange(`${newH}:${newM} ${newP}`);
    };

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white/5 border border-white/10 hover:border-[#22D3EE]/50 px-4 py-3 rounded-xl transition-all group"
            >
                <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#22D3EE] group-hover:scale-110 transition-transform" />
                    <span className="font-bold uppercase text-sm tracking-widest text-white">
                        {value || "SELECT TIME"}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-50 left-0 right-0 p-1 bg-[#050510] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-2xl backdrop-blur-3xl overflow-hidden"
                    >
                        <div className="flex divide-x divide-white/5 max-h-[220px]">
                            {/* Hours */}
                            <div className="flex-1 overflow-y-auto hide-scrollbar py-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 text-center mb-2">Hour</p>
                                {hours.map(hour => (
                                    <button
                                        key={hour} type="button"
                                        onClick={() => handleSelect(hour, m, p)}
                                        className={`w-full py-2 text-center text-xs font-black transition-all ${h === hour ? 'text-[#22D3EE] bg-[#22D3EE]/10 scale-110' : 'text-white/40 hover:text-white'}`}
                                    >
                                        {hour}
                                    </button>
                                ))}
                            </div>

                            {/* Minutes */}
                            <div className="flex-1 overflow-y-auto hide-scrollbar py-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 text-center mb-2">Min</p>
                                {minutes.map(min => (
                                    <button
                                        key={min} type="button"
                                        onClick={() => handleSelect(h, min, p)}
                                        className={`w-full py-2 text-center text-xs font-black transition-all ${m === min ? 'text-[#C53099] bg-[#C53099]/10 scale-110' : 'text-white/40 hover:text-white'}`}
                                    >
                                        {min}
                                    </button>
                                ))}
                            </div>

                            {/* AM/PM */}
                            <div className="flex-1 py-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 text-center mb-2">Period</p>
                                {periods.map(period => (
                                    <button
                                        key={period} type="button"
                                        onClick={() => handleSelect(h, m, period)}
                                        className={`w-full py-4 text-center text-[10px] font-black transition-all ${p === period ? 'text-[#E31E6E] bg-[#E31E6E]/10 scale-110' : 'text-white/40 hover:text-white'}`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="button" onClick={() => setIsOpen(false)}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest border-t border-white/5 transition-all text-[#22D3EE]"
                        >
                            Confirm Selection
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

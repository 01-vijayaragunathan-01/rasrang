import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APP_THEME } from "../../constants/theme";
import { X, Filter, Download, CalendarDays, Ticket, Shield, ChevronRight } from "lucide-react";

function MasterPassModal({ master, onClose }) {
    const { colors } = APP_THEME;
    const [filter, setFilter] = useState("");

    const filteredEvents = master.events.filter(ev =>
        ev.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative w-full max-w-md rounded-3xl border overflow-hidden"
                    style={{ backgroundColor: colors.surface, borderColor: `${colors.primary}44` }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Glow */}
                    <div className="absolute top-0 left-0 w-full h-32 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${colors.primary}22, transparent)` }} />

                    {/* Header */}
                    <div className="relative p-6 pb-4 border-b border-white/10">
                        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#E31E6E] transition-all">
                            <X size={14} />
                        </button>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.highlight})` }}>
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">Master Pass</h3>
                                <p className="text-xs font-mono" style={{ color: colors.accent }}>{master.date}</p>
                            </div>
                        </div>

                        {/* QR */}
                        <div className="flex justify-center my-4">
                            <div className="bg-white p-3 rounded-2xl" style={{ boxShadow: `0 0 30px ${colors.primaryGlow}` }}>
                                <img src={master.qrImage} alt="Master QR" className="w-36 h-36 object-contain" />
                            </div>
                        </div>
                    </div>

                    {/* Events List */}
                    <div className="p-6 pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-white/40">
                                Events Covered ({filteredEvents.length})
                            </p>
                        </div>

                        {/* Filter */}
                        {master.events.length > 3 && (
                            <div className="relative mb-4">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                <input
                                    type="text"
                                    placeholder="Filter events..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white outline-none focus:border-[#22D3EE]/50 transition-colors placeholder:text-white/20"
                                />
                            </div>
                        )}

                        <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
                            {filteredEvents.map((ev, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/15 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#22D3EE]/10">
                                        <Ticket className="w-3.5 h-3.5 text-[#22D3EE]" />
                                    </div>
                                    <span className="text-sm font-bold text-white/80 flex-1 truncate">{ev}</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                                </motion.div>
                            ))}
                            {filteredEvents.length === 0 && (
                                <p className="text-center text-white/20 text-xs py-4">No events match your filter.</p>
                            )}
                        </div>

                        {/* Download */}
                        <a
                            href={`${import.meta.env.VITE_API_BASE_URL}/api/events/download-master-ticket/${encodeURIComponent(master.date)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-6 w-full py-3 bg-white/5 border border-white/20 hover:bg-white/10 text-center text-xs font-bold uppercase tracking-widest transition-colors rounded-xl flex items-center justify-center gap-2 text-white/70 hover:text-white"
                        >
                            <Download className="w-4 h-4" />
                            Download Master Pass
                        </a>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default function TicketSlider({ tickets }) {
    const { masterTickets, individualTickets } = tickets;
    const { colors } = APP_THEME;
    const [selectedMaster, setSelectedMaster] = useState(null);

    if (!masterTickets || (!masterTickets.length && !individualTickets.length)) {
        return <div className="italic p-8 rounded-xl border" style={{ backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.05)', color: colors.textMuted }}>No tickets found in the vault. Register for events to generate passes!</div>;
    }

    return (
        <>
            {/* ── MASTER PASSES SECTION ── */}
            {masterTickets.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/30 mb-4 flex items-center gap-3">
                        <Shield className="w-3.5 h-3.5 text-[#9D01E9]" />
                        Master Day Passes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {masterTickets.map((master, idx) => (
                            <motion.div
                                key={`master-${idx}`}
                                whileHover={{ scale: 1.02, y: -8 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                onClick={() => setSelectedMaster(master)}
                                className="rounded-[2.5rem] p-0.5 relative group cursor-pointer overflow-hidden"
                                style={{ background: `linear-gradient(135deg, ${colors.primary}44, ${colors.highlight}44)` }}
                            >
                                {/* ── Holographic Glint ── */}
                                <motion.div 
                                    animate={{ 
                                        left: ["-100%", "200%"],
                                        top: ["-100%", "200%"]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                                    className="absolute w-1/2 h-[200%] bg-white/20 blur-[60px] -rotate-45 pointer-events-none z-20"
                                />

                                <div className="backdrop-blur-3xl rounded-[2.4rem] flex flex-col items-center p-8 relative z-10 h-full" style={{ backgroundColor: 'rgba(13,6,32,0.7)' }}>
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-4xl font-black italic select-none">
                                        MASTER
                                    </div>

                                    <div className="w-full text-center border-b border-white/10 pb-6 mb-6">
                                        <span className="font-black text-2xl uppercase tracking-tighter" 
                                            style={{ background: `linear-gradient(to right, ${colors.highlight}, ${colors.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Cinzel', serif" }}>
                                            Master Pass
                                        </span>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" />
                                            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">
                                                {master.date}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative mb-6">
                                        <div className="absolute -inset-4 bg-[#9D01E9]/10 rounded-full blur-2xl group-hover:bg-[#9D01E9]/20 transition-all" />
                                        <div className="bg-white p-3 rounded-2xl relative z-10 shadow-[0_0_40px_rgba(157,1,233,0.2)]">
                                            <img src={master.qrImage} alt="Master QR" className="w-32 h-32 object-contain" />
                                        </div>
                                    </div>

                                    <div className="w-full space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[9px] text-white/30 uppercase tracking-[0.25em] font-black">
                                                Active Privileges
                                            </p>
                                            <span className="text-[10px] font-bold text-[#E4BD8D]">{master.events.length} EVENTS</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {master.events.slice(0, 2).map((ev, i) => (
                                                <span key={i} className="text-[9px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 font-bold text-white/60 truncate max-w-[120px]">{ev}</span>
                                            ))}
                                            {master.events.length > 2 && (
                                                <span className="text-[9px] px-3 py-1.5 rounded-lg bg-[#9D01E9]/10 border border-[#9D01E9]/20 font-black text-[#AF94D2]">+{master.events.length - 2}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full mt-8 py-4 bg-white/5 border border-white/10 text-center text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl text-white/30 group-hover:text-white group-hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                        Initialize Protocol
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── INDIVIDUAL TICKETS SECTION ── */}
            {individualTickets.length > 0 && (
                <div>
                    <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/30 mb-4 flex items-center gap-3">
                        <Ticket className="w-3.5 h-3.5 text-[#22D3EE]" />
                        Individual Event Passes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {individualTickets.map((ticket, idx) => (
                            <motion.div
                                key={`indiv-${idx}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                                style={{ backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.08)' }}
                                className="rounded-2xl p-6 border flex flex-col justify-between hover:border-white/20 transition-all"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h4 className="text-base font-black uppercase tracking-tight mb-1" style={{ color: colors.textTitle }}>{ticket.event.title}</h4>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] font-black uppercase text-[#22D3EE] flex items-center gap-1">
                                                    <CalendarDays className="w-3 h-3" /> {ticket.event.date}
                                                </p>
                                                {ticket.event.time && (
                                                    <p className="text-[10px] font-bold uppercase text-white/30 border-l border-white/10 pl-3">{ticket.event.time}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/10 flex items-center justify-center flex-shrink-0">
                                            <Ticket className="w-4 h-4 text-[#22D3EE]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center my-4">
                                    <img src={ticket.qrImage} alt="Ticket QR" className="w-28 h-28 rounded-lg" />
                                </div>

                                <a
                                    href={`${import.meta.env.VITE_API_BASE_URL}/api/events/download-ticket/${ticket.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-2.5 text-center text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10 hover:border-[#22D3EE] hover:bg-[#22D3EE]/10 hover:text-[#22D3EE] transition-all flex items-center justify-center gap-2"
                                    style={{ color: colors.textMuted }}
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download Ticket
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── MASTER PASS DETAIL POPUP ── */}
            {selectedMaster && (
                <MasterPassModal master={selectedMaster} onClose={() => setSelectedMaster(null)} />
            )}
        </>
    );
}

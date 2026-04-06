import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { APP_THEME } from "../../constants/theme";
import { X, Download, CalendarDays, Ticket, Shield, ChevronRight, Loader2 } from "lucide-react";

// ─── OFFLINE PRINTABLE ID CARD TEMPLATE (Hidden from view) ───
function PrintableBadge({ data, user }) {
    if (!data) return null;

    const isMaster = data.type === 'master';
    const title = isMaster ? "Master VIP Pass" : data.ticket.event.title;
    const date = isMaster ? data.ticket.date : data.ticket.event.date;
    const time = !isMaster && data.ticket.event.time ? data.ticket.event.time : "";

    return (
        <div 
            id="printable-id-card" 
            className="fixed top-0 left-0 w-[900px] h-[320px] flex overflow-hidden -z-50 opacity-0 pointer-events-none"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
            {/* ── LEFT SIDE: MAIN TICKET STUB (Dark Theme) ── */}
            <div className="w-[70%] h-full bg-[#0A0A0A] text-white p-8 relative flex flex-col justify-between border-r-2 border-dashed border-white/20">
                
                {/* 1. Rotated Edge Text */}
                <div className="absolute left-4 bottom-10 origin-bottom-left -rotate-90 text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase whitespace-nowrap">
                    ENTRADA "H" • RASRANG 2K26
                </div>

                {/* 2. Main Event Details */}
                <div className="ml-10 z-10 relative">
                    <p className="text-[#E4BD8D] text-xs font-black tracking-[0.3em] mb-2 uppercase">
                        {isMaster ? "ALL-ACCESS DAY PASS" : "OFFICIAL EVENT TICKET"}
                    </p>
                    <h1 className="text-4xl font-black uppercase tracking-tight mb-8 leading-none w-[90%] truncate">
                        {title}
                    </h1>

                    <div className="space-y-1">
                        <p className="text-2xl font-bold uppercase tracking-widest">{user?.name || "GUEST ATTENDEE"}</p>
                        <p className="text-sm font-mono text-white/70 tracking-widest">{user?.regNo || "NO REG NO"}</p>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">{user?.clgName || "SRM TRICHY"}</p>
                    </div>
                </div>

                {/* 3. Central Background Logo (Watermark) */}
                <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none mix-blend-overlay">
                    {/* Place your logo in the public folder as logo.png */}
                    <img 
                        src="/rasrang.png" 
                        alt="Background Logo" 
                        className="w-48 h-48 object-contain grayscale"
                        onError={(e) => e.target.style.display = 'none'} // Hides if logo.png is missing
                    />
                </div>

                {/* 4. Footer Fine Print */}
                <div className="ml-10 text-[8px] font-mono text-white/30 uppercase tracking-[0.2em]">
                    NOS RESERVAMOS EL DERECHO DE ADMISIÓN / RIGHT OF ADMISSION RESERVED
                </div>
            </div>

            {/* ── RIGHT SIDE: TEAR-OFF QR STUB (Light Theme) ── */}
            <div className="w-[30%] h-full bg-white text-black flex flex-col items-center justify-between p-6 relative">
                
                {/* Top Date & Time */}
                <div className="w-full text-right">
                    <p className="text-sm font-black uppercase tracking-widest">{date}</p>
                    {time && <p className="text-xs font-bold tracking-widest text-black/60">{time}</p>}
                </div>
                
                {/* Center QR Code with Embedded Logo */}
                <div className="relative flex items-center justify-center -mt-4">
                    <img 
                        src={data.ticket.qrImage} 
                        alt="QR Code" 
                        crossOrigin="anonymous" 
                        className="w-44 h-44 object-contain mix-blend-multiply" 
                    />
                    
                    {/* Mini Logo inside QR (Similar to the reference image) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.2)] border-2 border-black">
                        <img 
                            src="/rasrang.png" 
                            alt="Logo" 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                // Fallback icon if logo.png is missing
                                e.target.onerror = null; 
                                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 22h20L12 2z"/></svg>';
                            }}
                        />
                    </div>
                </div>

                {/* Bottom Ticket ID */}
                <div className="w-full flex justify-between items-end">
                    <div className="origin-bottom-left -rotate-90 text-[8px] font-black tracking-widest text-black/40 uppercase absolute bottom-6 left-4 whitespace-nowrap">
                        CLUB DE LEONES
                    </div>
                    <div className="text-[10px] font-mono text-black/60 tracking-[0.2em] uppercase ml-auto">
                        ID: {(user?.id || "N/A").substring(0, 8)}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── MASTER PASS MODAL (On Screen) ───
function MasterPassModal({ master, onClose, onDownload, isDownloading }) {
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
                    className="relative w-full max-w-md rounded-3xl border overflow-hidden bg-[#13072E] border-[#E4BD8D]/40 shadow-[0_0_50px_rgba(228,189,141,0.2)]"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="relative p-6 pb-4 border-b border-white/10">
                        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#E31E6E] transition-all">
                            <X size={14} />
                        </button>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#E4BD8D] to-[#C53099]">
                                <Shield className="w-5 h-5 text-[#13072E]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>Master VIP Pass</h3>
                                <p className="text-xs font-mono text-[#E4BD8D]">{master.date}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 pt-4">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-4">
                            Events Covered ({filteredEvents.length})
                        </p>

                        <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar mb-6">
                            {filteredEvents.map((ev, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <Ticket className="w-3.5 h-3.5 text-[#E4BD8D]" />
                                    <span className="text-sm font-bold text-white/80 flex-1 truncate">{ev}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => onDownload({ ticket: master, type: 'master' })}
                            disabled={isDownloading}
                            className="w-full py-4 bg-gradient-to-r from-[#E4BD8D] to-[#C53099] hover:from-[#C53099] hover:to-[#E4BD8D] text-center text-xs font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 text-white disabled:opacity-50"
                        >
                            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4" /> Download Official Badge</>}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// ─── MAIN SLIDER COMPONENT ───
export default function TicketSlider({ tickets, user }) {
    const { masterTickets, individualTickets } = tickets;
    const [selectedMaster, setSelectedMaster] = useState(null);
    
    // Download State
    const [printData, setPrintData] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // ── IMAGE GENERATOR LOGIC ──
    const handleDownload = async (ticketData) => {
        setIsDownloading(true);
        setPrintData(ticketData); 

        // Wait a tiny bit for the React DOM to render the hidden component
        setTimeout(async () => {
            const printElement = document.getElementById('printable-id-card');
            if (printElement) {
                try {
                    const canvas = await html2canvas(printElement, {
                        scale: 3, // Very high resolution for perfect printing
                        useCORS: true,
                        backgroundColor: '#0A0A0A',
                        logging: false
                    });
                    
                    const dataUrl = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    const safeName = user?.name ? user.name.replace(/\s+/g, '_') : 'Guest';
                    
                    // Name file dynamically based on ticket type
                    const ticketName = ticketData.type === 'master' ? 'VIP_Pass' : ticketData.ticket.event.title.replace(/\s+/g, '_');
                    link.download = `${safeName}_${ticketName}.png`;
                    
                    link.href = dataUrl;
                    link.click();
                } catch (error) {
                    console.error("Error generating badge:", error);
                    alert("Failed to generate High-Res Badge. Please try again.");
                }
            }
            setIsDownloading(false);
            setPrintData(null); // Unmount hidden component
        }, 500);
    };

    if (!masterTickets || (!masterTickets.length && !individualTickets.length)) {
        return <div className="italic p-8 rounded-xl border border-white/5 bg-white/5 text-white/40 text-center">No tickets found in the vault. Register for events to generate passes!</div>;
    }

    return (
        <>
            {/* HIDDEN PRINT TEMPLATE */}
            <PrintableBadge data={printData} user={user} />

            {/* ── ON-SCREEN MASTER PASSES ── */}
            {masterTickets.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#E4BD8D] mb-4 flex items-center gap-3">
                        <Shield className="w-3.5 h-3.5" /> Day Passes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {masterTickets.map((master, idx) => (
                            <motion.div
                                key={`master-${idx}`}
                                whileHover={{ scale: 1.02, y: -8 }}
                                onClick={() => setSelectedMaster(master)}
                                className="rounded-3xl p-1 relative group cursor-pointer overflow-hidden bg-gradient-to-br from-[#E4BD8D] to-[#C53099] shadow-xl hover:shadow-[0_15px_40px_rgba(228,189,141,0.3)] transition-all"
                            >
                                <div className="rounded-[1.4rem] flex flex-col items-center p-8 relative z-10 h-full bg-[#13072E] border-2 border-dashed border-[#E4BD8D]/30">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 text-5xl font-black italic select-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        VIP
                                    </div>

                                    <div className="w-full text-center border-b border-[#E4BD8D]/20 pb-6 mb-6">
                                        <span className="font-black text-2xl uppercase tracking-widest text-[#E4BD8D]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            Master Pass
                                        </span>
                                        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/50 mt-2">
                                            {master.date}
                                        </p>
                                    </div>

                                    <div className="relative mb-6 bg-white p-2 rounded-xl">
                                        <img src={master.qrImage} alt="Master QR" className="w-32 h-32 object-contain" />
                                    </div>

                                    <div className="w-full mt-auto py-3 border border-[#E4BD8D]/30 text-center text-[10px] font-black uppercase tracking-[0.2em] rounded-xl text-[#E4BD8D] group-hover:bg-[#E4BD8D] group-hover:text-[#13072E] transition-all flex items-center justify-center gap-2">
                                        Open Details <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── ON-SCREEN INDIVIDUAL TICKETS ── */}
            {individualTickets.length > 0 && (
                <div>
                    <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#22D3EE] mb-4 flex items-center gap-3">
                        <Ticket className="w-3.5 h-3.5" /> Event Passes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {individualTickets.map((ticket, idx) => (
                            <motion.div
                                key={`indiv-${idx}`}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                                className="rounded-2xl p-6 bg-[#13072E] border-2 border-[#22D3EE]/20 hover:border-[#22D3EE]/50 flex flex-col justify-between transition-all shadow-lg relative overflow-hidden group"
                            >
                                {/* Cultural pattern overlay */}
                                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22D3EE 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-4 border-b border-[#22D3EE]/10 pb-4">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold uppercase tracking-wide text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{ticket.event.title}</h4>
                                            <p className="text-[10px] font-black uppercase text-[#22D3EE] flex items-center gap-1">
                                                <CalendarDays className="w-3 h-3" /> {ticket.event.date} {ticket.event.time && `| ${ticket.event.time}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center my-6">
                                        <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                                            <img src={ticket.qrImage} alt="Ticket QR" className="w-28 h-28 object-contain" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDownload({ ticket, type: 'individual' })}
                                        disabled={isDownloading}
                                        className="w-full py-3 text-center text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#22D3EE]/10 text-[#22D3EE] hover:bg-[#22D3EE] hover:text-[#13072E] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Download className="w-3.5 h-3.5" /> Save Ticket</>}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {selectedMaster && (
                <MasterPassModal 
                    master={selectedMaster} 
                    onClose={() => setSelectedMaster(null)} 
                    onDownload={handleDownload}
                    isDownloading={isDownloading}
                />
            )}
        </>
    );
}
// --- Inside Web/src/components/profile/TicketSlider.jsx ---
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as htmlToImage from 'html-to-image'; // NEW: Replaced html2canvas
import { QRCodeCanvas } from "qrcode.react"; 
import { Download, CalendarDays, Shield, ChevronRight, Loader2, Ticket } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; 
import { api } from "../../utils/api"; 

// Import the separated components
import PrintableBadge from "./PrintableBadge";
import MasterPassModal from "./MasterPassModal";

export default function TicketSlider({ tickets }) {
    const { user } = useAuth(); 
    const { masterTickets, individualTickets } = tickets;
    const [selectedMaster, setSelectedMaster] = useState(null);
    
    // Dynamic Token State
    const [liveTokens, setLiveTokens] = useState({ individual: {}, master: {} });
    
    // Download State
    const [printData, setPrintData] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // ── LIVE TOKEN POLLING (Anti-Screenshot) ──
    useEffect(() => {
        const fetchLiveTokens = async () => {
            try {
                const res = await api("/api/events/live-tokens");
                if (res.ok) {
                    const data = await res.json();
                    setLiveTokens({ individual: data.individualTokens, master: data.masterTokens });
                }
            } catch (err) {
                console.error("Failed to fetch live tokens", err);
            }
        };

        fetchLiveTokens(); // Fetch immediately
        const interval = setInterval(fetchLiveTokens, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // ── IMAGE GENERATOR LOGIC (Using html-to-image) ──
    const handleDownload = async (ticketData) => {
        setIsDownloading(true);
        setPrintData(ticketData); 

        setTimeout(async () => {
            const printElement = document.getElementById('printable-id-card');
            if (printElement) {
                try {
                    // html-to-image takes a perfect DOM snapshot preserving all CSS/Flexbox rules
                    const dataUrl = await htmlToImage.toPng(printElement, {
                        pixelRatio: 3, // High resolution (equivalent to scale: 3)
                        cacheBust: true, // Ensures logos are loaded freshly
                        backgroundColor: null // Keeps rounded corners transparent
                    });
                    
                    const link = document.createElement('a');
                    const safeName = user?.name ? user.name.replace(/\s+/g, '_') : 'Guest';
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
            setPrintData(null);
        }, 800); 
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
                        {masterTickets.map((master, idx) => {
                            const activeToken = liveTokens.master[master.date] || master.token;

                            return (
                                <motion.div
                                    key={`master-${idx}`}
                                    whileHover={{ scale: 1.02, y: -8 }}
                                    onClick={() => setSelectedMaster(master)}
                                    className="rounded-3xl p-1 relative group cursor-pointer overflow-hidden bg-gradient-to-br from-[#E4BD8D] to-[#C53099] shadow-xl hover:shadow-[0_15px_40px_rgba(228,189,141,0.3)] transition-all"
                                >
                                    <div className="rounded-[1.4rem] flex flex-col items-center p-8 relative z-10 h-full bg-[#13072E] border-2 border-dashed border-[#E4BD8D]/30">
                                        <div className="w-full text-center border-b border-[#E4BD8D]/20 pb-6 mb-6">
                                            <span className="font-black text-2xl uppercase tracking-widest text-[#E4BD8D]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                Master Pass
                                            </span>
                                            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/50 mt-2">
                                                {master.date}
                                            </p>
                                        </div>

                                        <div className="relative mb-6 bg-white p-2 rounded-xl shadow-inner">
                                            <QRCodeCanvas 
                                                value={activeToken} 
                                                size={130} 
                                                level="H"
                                                imageSettings={{ src: "/Assets/SRM_Logo.jpeg", height: 30, width: 30, excavate: true }}
                                            />
                                        </div>

                                        <div className="w-full mt-auto py-3 border border-[#E4BD8D]/30 text-center text-[10px] font-black uppercase tracking-[0.2em] rounded-xl text-[#E4BD8D] group-hover:bg-[#E4BD8D] group-hover:text-[#13072E] transition-all flex items-center justify-center gap-2">
                                            Open Details <ChevronRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
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
                        {individualTickets.map((ticket, idx) => {
                            const activeToken = liveTokens.individual[ticket.id] || ticket.token;

                            return (
                                <motion.div
                                    key={`indiv-${idx}`}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    className="rounded-2xl p-6 bg-[#13072E] border-2 border-[#22D3EE]/20 hover:border-[#22D3EE]/50 flex flex-col justify-between transition-all shadow-lg relative overflow-hidden group"
                                >
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4 border-b border-[#22D3EE]/10 pb-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold uppercase tracking-wide text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{ticket.event.title}</h4>
                                                <p className="text-[10px] font-black uppercase text-[#22D3EE] flex items-center gap-1">
                                                    <CalendarDays className="w-3 h-3" /> {ticket.event.date}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-center my-6">
                                            <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                                                <QRCodeCanvas 
                                                    value={activeToken} 
                                                    size={120} 
                                                    level="H"
                                                    imageSettings={{ src: "/Assets/SRM_Logo.jpeg", height: 28, width: 28, excavate: true }}
                                                />
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
                            );
                        })}
                    </div>
                </div>
            )}

            {selectedMaster && (
                <MasterPassModal 
                    master={selectedMaster} 
                    activeToken={liveTokens.master[selectedMaster.date] || selectedMaster.token}
                    onClose={() => setSelectedMaster(null)} 
                    onDownload={handleDownload}
                    isDownloading={isDownloading}
                />
            )}
        </>
    );
}
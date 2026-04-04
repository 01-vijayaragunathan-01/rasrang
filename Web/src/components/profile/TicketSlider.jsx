import { motion } from "framer-motion";
import { APP_THEME } from "../../constants/theme";

export default function TicketSlider({ tickets }) {
    const { masterTickets, individualTickets } = tickets;
    const { colors } = APP_THEME;

    if (!masterTickets || (!masterTickets.length && !individualTickets.length)) {
        return <div className="italic p-8 rounded-xl border" style={{ backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.05)', color: colors.textMuted }}>No tickets found in the vault. Register for events to generate passes!</div>;
    }

    return (
        <div className="flex gap-8 overflow-x-auto pb-12 pt-4 px-4 snap-x hide-scroll" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {/* Standard CSS config above hides internal scrollbar but keeps mouse wheel active */}
            
            {/* Master Day Passes First */}
            {masterTickets.map((master, idx) => (
                <motion.div 
                    key={`master-${idx}`} 
                    whileHover={{ scale: 1.02, y: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{ background: `linear-gradient(to bottom right, ${colors.surface}, ${colors.primary}66)`, borderColor: `${colors.primary}88`, boxShadow: `0 10px 30px ${colors.primaryGlow}` }}
                    className="min-w-[320px] snap-center shrink-0 rounded-3xl p-1 relative border overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 blur-[50px]" style={{ backgroundColor: `${colors.highlight}33` }}></div>
                    <div className="backdrop-blur-xl h-full rounded-[23px] flex flex-col items-center justify-between p-6 relative z-10" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <div className="w-full text-center border-b border-white/10 pb-4 mb-4">
                            <span className="font-black text-xl uppercase tracking-widest" style={{ background: `linear-gradient(to right, ${colors.highlight}, ${colors.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Master Pass
                            </span>
                            <p className="text-sm font-mono mt-1" style={{ color: colors.accent }}>{master.date}</p>
                        </div>
                        
                        <div className="bg-white p-2 rounded-xl mb-4" style={{ boxShadow: `0 0 20px ${colors.primaryGlow}` }}>
                            <img src={master.qrImage} alt="Master QR" className="w-40 h-40 object-contain" />
                        </div>
                        
                        <div className="w-full">
                            <p className="text-[10px] text-white/50 uppercase tracking-widest mb-2">Valid For Entry:</p>
                            <div className="flex flex-wrap gap-2">
                                {master.events.map((ev, i) => (
                                    <span key={i} className="text-[10px] bg-white/5 px-2 py-1 rounded-sm border border-white/5" style={{ color: colors.textMuted }}>{ev}</span>
                                ))}
                            </div>
                        </div>

                        <a 
                            href={`http://localhost:5000/api/events/download-master-ticket/${encodeURIComponent(master.date)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full mt-6 py-3 bg-white/5 border border-white/20 hover:bg-white/10 text-center text-xs font-bold uppercase tracking-widest transition-colors rounded-lg flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download Pass
                        </a>
                    </div>
                </motion.div>
            ))}

            {/* Individual Event Passes */}
            {individualTickets.map((ticket, idx) => (
                <motion.div 
                    key={`indiv-${idx}`} 
                    whileHover={{ scale: 1.02 }}
                    style={{ backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.05)' }}
                    className="min-w-[260px] snap-center shrink-0 rounded-xl p-6 border opacity-80 hover:opacity-100 flex flex-col justify-between"
                >
                    <div>
                        <h4 className="text-lg font-bold uppercase" style={{ color: colors.textTitle }}>{ticket.event.title}</h4>
                        <p className="text-xs font-mono mt-1" style={{ color: colors.primary }}>{ticket.event.category}</p>
                    </div>
                    
                    <div className="my-6">
                        <img src={ticket.qrImage} alt="Ticket QR" className="w-32 h-32 mx-auto rounded-lg mix-blend-screen opacity-80 filter grayscale hover:grayscale-0 transition-all" />
                    </div>

                    <a
                        href={`http://localhost:5000/api/events/download-ticket/${ticket.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ borderColor: 'rgba(255,255,255,0.1)', color: colors.textMuted }}
                        className="text-[10px] text-center w-full block py-2 border rounded hover:border-[#9D01E9] hover:bg-[#9D01E9] hover:text-white transition-all uppercase tracking-widest"
                    >
                        Download Ticket
                    </a>
                </motion.div>
            ))}
        </div>
    );
}

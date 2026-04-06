import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Calendar, Clock, MapPin, ExternalLink, Ticket, ShieldAlert, Loader2 } from "lucide-react";
import DOMPurify from "dompurify";
import { formatEventDate } from "../../utils/dateUtils";

/**
 * EventModal component for viewing detailed event information and registration.
 * Includes scroll-locking via data-lenis-prevent.
 */
export function EventModal({ event, onClose, onRegister, registering, onShare, userRegistrations }) {
  if (!event) return null;

  return (
    <AnimatePresence mode="wait">
      {event && (
        <div className="fixed inset-0 z-[900] flex items-end sm:items-center justify-center px-0 pb-0 pt-[80px] sm:px-6 sm:pb-6 sm:pt-[120px] overflow-hidden">
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
            className="relative w-full max-w-4xl bg-[#1A0B2E] border-t sm:border border-white/10 rounded-t-[3rem] sm:rounded-3xl shadow-2xl overflow-y-auto hide-scrollbar flex flex-col md:flex-row max-h-[calc(100vh-80px)] sm:max-h-[calc(100vh-140px)] z-10"
            onClick={e => e.stopPropagation()}
            data-lenis-prevent
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
            <div className="flex-1 min-w-0 p-8 sm:p-10 flex flex-col justify-between pb-12">
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
                  disabled={registering || userRegistrations.includes(event.id) || event.isRegistrationClosed}
                  className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3
                  ${(registering || userRegistrations.includes(event.id) || event.isRegistrationClosed) 
                    ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                    : 'bg-white text-[#13072E] hover:bg-[#E4BD8D] shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
                >
                    {userRegistrations.includes(event.id) ? (
                        <>Mission Secured</>
                    ) : event.isRegistrationClosed ? (
                        <><ShieldAlert size={18} /> Registrations Closed</>
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

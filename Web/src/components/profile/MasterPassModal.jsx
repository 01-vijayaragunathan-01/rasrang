// --- Inside Web/src/components/profile/MasterPassModal.jsx ---
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { X, Shield, Ticket, Download, Loader2 } from "lucide-react";

export default function MasterPassModal({ master, activeToken, onClose, onDownload, isDownloading }) {
    const [filter, setFilter] = useState("");

    const filteredEvents = master.events.filter(ev =>
        ev.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md rounded-3xl border overflow-hidden bg-[#13072E] border-[#E4BD8D]/40 shadow-[0_0_50px_rgba(228,189,141,0.2)]"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="relative p-6 pb-4 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#E4BD8D] to-[#C53099]">
                                <Shield className="w-5 h-5 text-[#13072E]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>Master VIP Pass</h3>
                                <p className="text-xs font-mono text-[#E4BD8D]">{master.date}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#E31E6E] transition-all">
                            <X size={14} />
                        </button>
                    </div>

                    <div className="p-6 pt-4 flex flex-col items-center">
                        {/* Dynamic Master QR Code */}
                        <div className="bg-white p-3 rounded-2xl mb-6 shadow-[0_0_30px_rgba(228,189,141,0.2)]">
                            <QRCodeCanvas 
                                value={activeToken} 
                                size={180} 
                                level="H"
                                imageSettings={{ src: "/Assets/SRM_Logo.jpeg", height: 40, width: 40, excavate: true }}
                            />
                        </div>

                        <div className="w-full space-y-2 max-h-32 overflow-y-auto hide-scrollbar mb-6">
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
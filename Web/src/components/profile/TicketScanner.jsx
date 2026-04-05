import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Keyboard, CheckCircle2, AlertTriangle, AlertCircle, Loader2, ScanLine, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// ──────────────────────────────────────────────────────────────
// Audio Feedback (crucial for high-volume scanning)
// ──────────────────────────────────────────────────────────────
const playTone = (type) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (type === 'success') {
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(); osc.stop(ctx.currentTime + 0.4);
        } else if (type === 'duplicate') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start(); osc.stop(ctx.currentTime + 0.5);
        } else {
            osc.type = 'square';
            osc.frequency.setValueAtTime(180, ctx.currentTime);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start(); osc.stop(ctx.currentTime + 0.3);
        }
    } catch (_) { /* AudioContext not available */ }
};

// ──────────────────────────────────────────────────────────────
// Result Banner
// ──────────────────────────────────────────────────────────────
function ResultBanner({ result, onDismiss }) {
    if (!result) return null;
    const isSuccess = result.type === 'success';
    const isDuplicate = result.type === 'duplicate';

    return (
        <AnimatePresence>
            <motion.div
                key={result.type + result.message}
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.3, type: "spring" }}
                className={`relative p-5 rounded-2xl mb-6 flex items-start gap-4 border ${
                    isSuccess
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : isDuplicate
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                }`}
            >
                <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isSuccess ? 'bg-emerald-500/20' : isDuplicate ? 'bg-amber-500/20' : 'bg-red-500/20'
                }`}>
                    {isSuccess
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        : isDuplicate
                        ? <AlertCircle className="w-5 h-5 text-amber-400" />
                        : <AlertTriangle className="w-5 h-5 text-red-400" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`text-lg font-black uppercase tracking-widest ${
                        isSuccess ? 'text-emerald-400' : isDuplicate ? 'text-amber-400' : 'text-red-400'
                    }`}>{result.title}</h4>
                    {result.attendee && (
                        <div className="mt-2 space-y-0.5">
                            <p className="text-white font-bold text-sm">{result.attendee.name}</p>
                            {result.attendee.regNo && (
                                <p className="text-white/50 text-xs font-mono">{result.attendee.regNo}</p>
                            )}
                            <p className="text-white/40 text-xs uppercase tracking-wider">{result.attendee.event}</p>
                        </div>
                    )}
                    {result.message && !result.attendee && (
                        <p className="text-white/60 text-sm mt-1">{result.message}</p>
                    )}
                </div>
                <button onClick={onDismiss} className="text-white/30 hover:text-white/60 transition-colors shrink-0 text-lg leading-none">✕</button>
            </motion.div>
        </AnimatePresence>
    );
}

// ──────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────
export default function TicketScanner() {
    const { csrfToken } = useAuth();
    const toast = useToast();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [mode, setMode] = useState("scan"); // "scan" | "manual"
    const [manualId, setManualId] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const [scannerActive, setScannerActive] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const qrRef = useRef(null);         // Html5Qrcode instance
    const scanPaused = useRef(false);   // Debounce lock ref
    const readerDivId = "qr-reader-container";

    // ── Fetch only events this volunteer is authorized for ──
    useEffect(() => {
        setLoadingEvents(true);
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/my-managed-events`, {
            credentials: "include"
        })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setEvents(data);
                    if (data.length > 0) setSelectedEventId(data[0].id);
                }
            })
            .catch(() => toast.error("Failed to load event list."))
            .finally(() => setLoadingEvents(false));
    }, []);

    // ── Verification core function ──
    const verifyIdentifier = useCallback(async (identifier) => {
        if (!selectedEventId) { toast.error("Select an event first."); return; }
        if (!identifier?.trim()) return;
        if (isVerifying || scanPaused.current) return;

        setIsVerifying(true);
        scanPaused.current = true;
        setResult(null);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/verify-entry`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
                credentials: "include",
                body: JSON.stringify({ eventId: selectedEventId, identifier: identifier.trim() })
            });
            const data = await res.json();

            if (res.status === 200 && data.valid) {
                playTone('success');
                setResult({ type: 'success', title: '✓ Access Granted', attendee: data.attendee });
            } else if (res.status === 409 && data.alreadyScanned) {
                playTone('duplicate');
                setResult({ type: 'duplicate', title: '⚠ Already Scanned', attendee: data.attendee });
            } else {
                playTone('error');
                setResult({ type: 'error', title: '✗ Access Denied', message: data.error || "Verification failed." });
            }
            setManualId("");
        } catch {
            playTone('error');
            setResult({ type: 'error', title: 'System Error', message: "Could not reach the verification server." });
        } finally {
            setIsVerifying(false);
            // Resume the scanner after 3.5 seconds
            setTimeout(() => { scanPaused.current = false; }, 3500);
        }
    }, [selectedEventId, csrfToken, isVerifying]);

    // ── QR Scanner lifecycle ──
    useEffect(() => {
        if (mode !== "scan") return;

        let html5Qrcode = null;

        const startScanner = async () => {
            // Wait for DOM element
            await new Promise(r => setTimeout(r, 100));

            html5Qrcode = new Html5Qrcode(readerDivId);
            qrRef.current = html5Qrcode;

            try {
                await html5Qrcode.start(
                    { facingMode: "environment" },
                    { fps: 8, qrbox: { width: 260, height: 260 }, aspectRatio: 1.0 },
                    (decodedText) => {
                        if (!scanPaused.current) {
                            verifyIdentifier(decodedText);
                        }
                    },
                    () => { /* Ignore read errors */ }
                );
                setScannerActive(true);
            } catch (err) {
                toast.error("Camera access denied. Use Manual Entry instead.");
                setMode("manual");
            }
        };

        startScanner();

        return () => {
            if (qrRef.current && qrRef.current.isScanning) {
                qrRef.current.stop().catch(() => {});
                qrRef.current = null;
                setScannerActive(false);
            }
        };
    }, [mode, verifyIdentifier]);

    const handleEventChange = (id) => {
        setSelectedEventId(id);
        setResult(null);
    };

    const selectedEvent = events.find(e => e.id === selectedEventId);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-56 h-56 bg-[#22D3EE]/5 blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#9D01E9] flex items-center justify-center shrink-0">
                        <ScanLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Entry Portal</h2>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-0.5">QR Verification System</p>
                    </div>
                </div>

                {/* Event Selector */}
                <div className="mb-6">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-[#22D3EE] mb-2">
                        Active Event
                    </label>
                    {loadingEvents ? (
                        <div className="flex items-center gap-2 text-white/40 text-sm py-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading your assigned events...</span>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-amber-400 text-sm font-bold">
                            ⚠ No events assigned to you. Contact your coordinator.
                        </div>
                    ) : (
                        <select
                            value={selectedEventId}
                            onChange={e => handleEventChange(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30 outline-none transition-colors appearance-none"
                        >
                            {events.map(ev => (
                                <option key={ev.id} value={ev.id} className="bg-[#13072E]">
                                    [{ev.date}] {ev.title}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-black/30 border border-white/5 rounded-xl p-1 mb-6">
                    {[
                        { id: "scan", label: "QR Scanner", icon: <QrCode className="w-4 h-4" /> },
                        { id: "manual", label: "Manual Entry", icon: <Keyboard className="w-4 h-4" /> }
                    ].map(m => (
                        <button
                            key={m.id}
                            onClick={() => { setMode(m.id); setResult(null); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                                mode === m.id
                                    ? 'bg-[#22D3EE] text-[#13072E] shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                                    : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                            {m.icon} {m.label}
                        </button>
                    ))}
                </div>

                {/* Result Banner */}
                <ResultBanner result={result} onDismiss={() => setResult(null)} />

                {/* Scanner Area */}
                {mode === "scan" ? (
                    <div className="relative">
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black min-h-[300px] flex items-center justify-center relative">
                            {/* The QR reader mounts here */}
                            <div id={readerDivId} className="w-full" />

                            {/* Overlay scanner frame */}
                            {scannerActive && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="w-[260px] h-[260px] relative">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#22D3EE] rounded-tl-lg" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#22D3EE] rounded-tr-lg" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#22D3EE] rounded-bl-lg" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#22D3EE] rounded-br-lg" />
                                        {/* Scan line animation */}
                                        <motion.div
                                            className="absolute left-2 right-2 h-0.5 bg-[#22D3EE]/60"
                                            animate={{ top: ["10%", "90%", "10%"] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                    </div>
                                </div>
                            )}

                            {!scannerActive && (
                                <div className="flex flex-col items-center gap-3 text-white/30 p-12">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Initializing Camera...</p>
                                </div>
                            )}
                        </div>
                        {isVerifying && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <div className="flex items-center gap-3 text-white font-bold text-sm">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#22D3EE]" />
                                    Verifying...
                                </div>
                            </div>
                        )}
                        <p className="text-center text-white/30 text-xs mt-3 font-bold uppercase tracking-widest">
                            Point camera at attendee's QR code
                        </p>
                    </div>
                ) : (
                    <form onSubmit={e => { e.preventDefault(); verifyIdentifier(manualId); }} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">
                                Reg No / Email / User ID
                            </label>
                            <input
                                type="text"
                                value={manualId}
                                onChange={e => setManualId(e.target.value)}
                                placeholder="e.g. RA23110..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-mono focus:border-[#C53099] focus:ring-1 focus:ring-[#C53099]/30 outline-none transition-colors placeholder:text-white/20"
                                autoFocus
                                autoComplete="off"
                            />
                            <p className="text-white/30 text-xs mt-2">Accepts Registration Number, Email, or system User ID</p>
                        </div>
                        <button
                            type="submit"
                            disabled={isVerifying || !manualId.trim() || !selectedEventId}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#C53099] to-[#9D01E9] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(197,48,153,0.4)] active:scale-[0.98]"
                        >
                            {isVerifying ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Scanning Identity...</>
                            ) : (
                                <><RefreshCw className="w-5 h-5" /> Verify Entry</>
                            )}
                        </button>
                    </form>
                )}

                {/* Footer stats */}
                {selectedEvent && (
                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Event</span>
                        <span className="text-white/60 text-xs font-bold">{selectedEvent.title} · {selectedEvent.date}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

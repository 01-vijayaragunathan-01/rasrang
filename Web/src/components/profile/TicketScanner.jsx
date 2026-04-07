import { useState, useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode"; 
import { QrCode, Keyboard, CheckCircle, AlertTriangle, Loader2, Camera as CameraIcon, ScanLine, XCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../context/ToastContext";
import { api } from "../../utils/api";

export default function TicketScanner() {
    const toast = useToast();
    
    // Core State
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [mode, setMode] = useState("scan"); 
    const [manualId, setManualId] = useState("");
    
    // Camera State
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState("");
    const [cameraStatus, setCameraStatus] = useState("checking"); // 'checking', 'granted', 'denied', 'insecure'
    
    // Feedback State
    const [isVerifying, setIsVerifying] = useState(false);
    const [scanResult, setScanResult] = useState(null); 

    // 1. Fetch Managed Events
    useEffect(() => {
        api("/api/admin/my-managed-events")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setEvents(data);
                    if (data.length > 0) setSelectedEvent(data[0].id);
                }
            })
            .catch(err => console.error("Failed to fetch assigned events:", err));
    }, []);

    // 2. Explicitly Request Camera Permissions
    const requestCameraAccess = async () => {
        // SECURITY CHECK: Mobile browsers block camera on standard HTTP connections
        if (window.isSecureContext === false) {
            setCameraStatus("insecure");
            return;
        }

        try {
            setCameraStatus("checking");
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
                setCameras(devices);
                // Try to find the rear camera automatically
                const rearCamera = devices.find(d => 
                    d.label.toLowerCase().includes('back') || 
                    d.label.toLowerCase().includes('environment')
                );
                setSelectedCamera(rearCamera ? rearCamera.id : devices[0].id);
                setCameraStatus("granted");
            } else {
                setCameraStatus("denied");
                toast.error("No cameras detected on this device.");
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setCameraStatus("denied");
        }
    };

    useEffect(() => {
        requestCameraAccess();
    }, []);

    // 3. Initialize & Manage QR Scanner
    useEffect(() => {
        let html5QrCode;
        let isScanning = true;

        if (mode === "scan" && cameraStatus === "granted" && selectedCamera && selectedEvent) {
            html5QrCode = new Html5Qrcode("qr-reader");

            html5QrCode.start(
                selectedCamera,
                { 
                    fps: 10, 
                    qrbox: 250, 
                    formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ] 
                },
                (decodedText) => {
                    if (isScanning) {
                        isScanning = false;
                        html5QrCode.pause();
                        
                        verifyTicket(decodedText).finally(() => {
                            setTimeout(() => {
                                if (html5QrCode.getState() === 3) { 
                                    isScanning = true;
                                    setScanResult(null); 
                                    html5QrCode.resume();
                                }
                            }, 2500);
                        });
                    }
                },
                (error) => { /* Ignore background read errors */ }
            ).catch(err => {
                console.error("Scanner start error:", err);
                setCameraStatus("denied");
            });
        }

        return () => {
            isScanning = false;
            if (html5QrCode) {
                try {
                    if (html5QrCode.getState() !== 1) { 
                        html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
                    }
                } catch (e) {
                    console.error("Cleanup error:", e);
                }
            }
        };
    }, [mode, cameraStatus, selectedCamera, selectedEvent]);

    // 4. Smart Verification Logic
    const verifyTicket = async (identifier) => {
        if (!selectedEvent) return toast.error("Please select an event first.");
        if (!identifier) return;

        setIsVerifying(true);
        setScanResult(null);

        const isJWT = identifier.startsWith("eyJ");
        let endpoint = isJWT ? "/api/events/verify-ticket" : "/api/admin/verify-entry";
        let bodyData = isJWT ? { selectedEventId: selectedEvent, ticketData: identifier } : { eventId: selectedEvent, identifier };

        try {
            const res = await api(endpoint, { method: "POST", body: JSON.stringify(bodyData) });
            const data = await res.json();

            if (res.ok && data.valid) {
                try { new Audio('/success-beep.mp3').play(); } catch(e){}
                const userName = data.attendee ? data.attendee.name : data.user;
                const regDetails = data.attendee ? data.attendee.regNo : "Verified";
                setScanResult({ type: 'success', message: "ENTRY GRANTED", details: `${userName} - ${regDetails}` });
                setManualId(""); 
            } else {
                try { new Audio('/error-buzz.mp3').play(); } catch(e){}
                setScanResult({ type: 'error', message: data.alreadyScanned ? "ALREADY SCANNED" : "ACCESS DENIED", details: data.error });
            }
        } catch (err) {
            setScanResult({ type: 'error', message: "SYSTEM ERROR", details: "Server timeout. Check connection." });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        verifyTicket(manualId);
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-[#13072E] border border-[#E4BD8D]/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(157,1,233,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C53099] rounded-full blur-[100px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#22D3EE] rounded-full blur-[100px] opacity-10 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                    <div className="p-3 bg-[#E4BD8D]/20 rounded-xl text-[#E4BD8D]"><ScanLine size={24} /></div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>Entry Portal</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">QR Access Node</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#E4BD8D] mb-2 pl-1">Target Event</label>
                        <select 
                            value={selectedEvent}
                            onChange={(e) => { setSelectedEvent(e.target.value); setScanResult(null); }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:border-[#E4BD8D] outline-none appearance-none transition-colors"
                        >
                            {events.length === 0 && <option value="">No Events Assigned</option>}
                            {events.map(ev => <option key={ev.id} value={ev.id} className="bg-[#13072E]">{ev.title}</option>)}
                        </select>
                    </div>

                    {mode === "scan" && cameraStatus === "granted" && (
                        <AnimatePresence>
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#22D3EE] mb-2 pl-1 flex items-center gap-1.5">
                                    <CameraIcon className="w-3 h-3" /> Camera Source
                                </label>
                                <select 
                                    value={selectedCamera}
                                    onChange={(e) => { setSelectedCamera(e.target.value); setScanResult(null); }}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#22D3EE] outline-none appearance-none transition-colors"
                                >
                                    {cameras.map(cam => <option key={cam.id} value={cam.id} className="bg-[#13072E]">{cam.label || `Camera ${cam.id.substring(0,5)}`}</option>)}
                                </select>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                <div className="flex bg-black/40 rounded-xl p-1.5 mb-8 border border-white/5">
                    <button 
                        onClick={() => { setMode("scan"); setScanResult(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === "scan" ? 'bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-white/40 hover:text-white/80 border border-transparent'}`}
                    >
                        <QrCode className="w-4 h-4" /> QR Scan
                    </button>
                    <button 
                        onClick={() => { setMode("manual"); setScanResult(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === "manual" ? 'bg-[#C53099]/20 text-[#C53099] border border-[#C53099]/30 shadow-[0_0_15px_rgba(197,48,153,0.2)]' : 'text-white/40 hover:text-white/80 border border-transparent'}`}
                    >
                        <Keyboard className="w-4 h-4" /> Manual
                    </button>
                </div>

                <div className="relative min-h-[320px]">
                    <AnimatePresence>
                        {scanResult && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className={`absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm rounded-2xl ${scanResult.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                            >
                                <div className={`w-full p-6 rounded-2xl text-center shadow-2xl border ${scanResult.type === 'success' ? 'bg-[#0A1A10] border-green-500/50 shadow-green-500/20' : 'bg-[#1A0A0A] border-red-500/50 shadow-red-500/20'}`}>
                                    <div className="flex justify-center mb-4">
                                        {scanResult.type === 'success' ? (
                                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 border-2 border-green-400"><CheckCircle size={32} /></div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 border-2 border-red-400">
                                                {scanResult.message === "ALREADY SCANNED" ? <AlertTriangle size={32} /> : <XCircle size={32} />}
                                            </div>
                                        )}
                                    </div>
                                    <h4 className={`text-2xl font-black uppercase tracking-widest mb-2 ${scanResult.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{scanResult.message}</h4>
                                    <p className="text-white/80 font-mono text-sm">{scanResult.details}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {mode === "scan" ? (
                        <div className="overflow-hidden rounded-2xl border-2 border-[#22D3EE]/30 bg-black relative shadow-[0_0_30px_rgba(34,211,238,0.1)] flex flex-col justify-center min-h-[320px]">
                            
                            {/* ERROR STATES: Handle missing permissions or insecure network */}
                            {cameraStatus === "insecure" && (
                                <div className="text-center p-6">
                                    <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                    <p className="text-yellow-500 font-bold mb-2">Connection Not Secure</p>
                                    <p className="text-white/60 text-xs mb-4">Mobile browsers block the camera on `http://` IP addresses. Use localhost or HTTPS.</p>
                                    <button onClick={() => setMode('manual')} className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/20">Use Manual Mode</button>
                                </div>
                            )}

                            {cameraStatus === "denied" && (
                                <div className="text-center p-6 z-20">
                                    <CameraIcon className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
                                    <p className="text-red-400 font-bold mb-2">Camera Access Denied</p>
                                    <p className="text-white/60 text-xs mb-6">Please allow camera permissions in your browser settings to scan QR codes.</p>
                                    <button onClick={requestCameraAccess} className="px-6 py-3 bg-[#22D3EE] text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white transition-colors">
                                        Request Permission
                                    </button>
                                </div>
                            )}

                            {/* SUCCESS STATE: Render Camera */}
                            {cameraStatus === "granted" && (
                                <>
                                    <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#22D3EE] z-10 pointer-events-none rounded-tl-lg" />
                                    <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#22D3EE] z-10 pointer-events-none rounded-tr-lg" />
                                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#22D3EE] z-10 pointer-events-none rounded-bl-lg" />
                                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#22D3EE] z-10 pointer-events-none rounded-br-lg" />
                                    
                                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-20">
                                        <div className="w-[250px] h-[250px] border border-[#22D3EE] rounded-3xl" />
                                        <div className="absolute w-[250px] h-[1px] bg-[#22D3EE]" />
                                        <div className="absolute h-[250px] w-[1px] bg-[#22D3EE]" />
                                    </div>

                                    <div id="qr-reader" className="w-full h-full flex items-center justify-center text-white/30 font-mono text-sm" />
                                </>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleManualSubmit} className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5 h-[320px] flex flex-col justify-center">
                            <div className="text-center mb-4">
                                <Keyboard className="w-12 h-12 text-[#C53099]/40 mx-auto mb-2" />
                                <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Direct Database Query</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#C53099] mb-2 pl-1">Identifier (Reg No / Email)</label>
                                <input 
                                    type="text" 
                                    value={manualId}
                                    onChange={(e) => setManualId(e.target.value)}
                                    placeholder="e.g. RA26110..." 
                                    className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white font-mono focus:border-[#C53099] outline-none transition-colors"
                                    autoFocus
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isVerifying || !manualId}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C53099] to-[#9D01E9] text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] disabled:opacity-50 hover:shadow-[0_0_20px_rgba(197,48,153,0.4)] transition-all"
                            >
                                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, Keyboard, CheckCircle, AlertTriangle, Loader2, Camera as CameraIcon } from "lucide-react";
import { useToast } from "../../context/ToastContext"; // Adjust path if needed

export default function TicketScanner() {
    const toast = useToast();
    
    // Core State
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [mode, setMode] = useState("scan"); // "scan" or "manual"
    const [manualId, setManualId] = useState("");
    
    // Camera State
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState("");
    
    // Feedback State
    const [isVerifying, setIsVerifying] = useState(false);
    const [scanResult, setScanResult] = useState(null); 

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    // 1. Fetch Events for the dropdown
    useEffect(() => {
        fetch(`${API_BASE}/api/events`)
            .then(res => res.json())
            .then(data => {
                setEvents(data);
                if (data.length > 0) setSelectedEvent(data[0].id);
            })
            .catch(err => console.error("Failed to fetch events:", err));
    }, []);

    // 2. Fetch Available Cameras & Auto-Select Front Camera
    useEffect(() => {
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length > 0) {
                setCameras(devices);
                
                // Smart auto-selection: Look for "front", "user", "webcam", or "facetime"
                const frontCamera = devices.find(d => 
                    d.label.toLowerCase().includes('front') || 
                    d.label.toLowerCase().includes('user') ||
                    d.label.toLowerCase().includes('facetime') ||
                    d.label.toLowerCase().includes('webcam')
                );
                
                // Default to front camera if found, otherwise just use the first available
                setSelectedCamera(frontCamera ? frontCamera.id : devices[0].id);
            }
        }).catch(err => {
            console.error("Error getting cameras:", err);
            toast.error("Please grant camera permissions to scan passes.");
        });
    }, []);

    // 3. Initialize & Manage QR Scanner
    useEffect(() => {
        let html5QrCode;
        let isComponentMounted = true;

        if (mode === "scan" && selectedCamera && selectedEvent) {
            html5QrCode = new Html5Qrcode("qr-reader");

            html5QrCode.start(
                selectedCamera,
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0 // Keeps the scanner square and clean
                },
                (decodedText) => {
                    // Safely pause the scanner to prevent spamming the backend
                    try {
                        if (html5QrCode.getState() === 2) { // 2 = SCANNING
                            html5QrCode.pause();
                            verifyTicket(decodedText).finally(() => {
                                setTimeout(() => {
                                    // Resume scanning after 3 seconds
                                    if (isComponentMounted && html5QrCode.getState() === 3) { // 3 = PAUSED
                                        html5QrCode.resume();
                                    }
                                }, 3000);
                            });
                        }
                    } catch (e) {
                        console.error("Scanner pause error:", e);
                    }
                },
                (error) => { /* Ignore constant background read errors */ }
            ).catch(err => console.error("Scanner start error:", err));
        }

        // Cleanup: Stop the camera when switching modes, changing cameras, or unmounting
        return () => {
            isComponentMounted = false;
            if (html5QrCode) {
                try {
                    html5QrCode.stop()
                        .then(() => html5QrCode.clear())
                        .catch(err => console.error("Failed to clear scanner:", err));
                } catch (e) {
                    console.error("Cleanup error:", e);
                }
            }
        };
    }, [mode, selectedCamera, selectedEvent]);

    // 4. The Verification Logic
    const verifyTicket = async (identifier) => {
        if (!selectedEvent) return toast.error("Please select an event first.");
        if (!identifier) return;

        setIsVerifying(true);
        setScanResult(null);

        try {
            const res = await fetch(`${API_BASE}/api/admin/verify-entry`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ eventId: selectedEvent, identifier })
            });
            
            const data = await res.json();

            if (res.ok) {
                // Play Success Sound (Optional but highly recommended)
                try { new Audio('/success-beep.mp3').play(); } catch(e){}
                setScanResult({ type: 'success', message: data.message, details: `${data.attendee.name} (${data.attendee.regNo || 'No Reg No'})` });
                setManualId(""); 
            } else {
                // Play Error Sound
                try { new Audio('/error-buzz.mp3').play(); } catch(e){}
                setScanResult({ type: 'error', message: "Access Denied", details: data.error });
            }
        } catch (err) {
            setScanResult({ type: 'error', message: "System Error", details: "Could not reach verification servers." });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        verifyTicket(manualId);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-[#1A0B2E] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
            
            <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Entry Portal
            </h2>

            {/* Context Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Event Dropdown */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#E4BD8D] mb-2">Active Event</label>
                    <select 
                        value={selectedEvent}
                        onChange={(e) => { setSelectedEvent(e.target.value); setScanResult(null); }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#22D3EE] outline-none appearance-none"
                    >
                        {events.map(ev => (
                            <option key={ev.id} value={ev.id} className="bg-[#1A0B2E]">{ev.title}</option>
                        ))}
                    </select>
                </div>

                {/* Camera Dropdown (Only show if in scan mode) */}
                {mode === "scan" && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#22D3EE] mb-2 flex items-center gap-2">
                            <CameraIcon className="w-3.5 h-3.5" /> Camera Source
                        </label>
                        <select 
                            value={selectedCamera}
                            onChange={(e) => { setSelectedCamera(e.target.value); setScanResult(null); }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#22D3EE] outline-none appearance-none"
                            disabled={cameras.length === 0}
                        >
                            {cameras.length === 0 ? (
                                <option value="">Detecting Cameras...</option>
                            ) : (
                                cameras.map(cam => (
                                    <option key={cam.id} value={cam.id} className="bg-[#1A0B2E]">{cam.label || `Camera ${cam.id.substring(0,5)}`}</option>
                                ))
                            )}
                        </select>
                    </div>
                )}
            </div>

            {/* Mode Toggles */}
            <div className="flex bg-white/5 rounded-lg p-1 mb-8">
                <button 
                    onClick={() => { setMode("scan"); setScanResult(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all ${mode === "scan" ? 'bg-[#22D3EE] text-[#13072E]' : 'text-white/50 hover:text-white'}`}
                >
                    <QrCode className="w-4 h-4" /> Scanner
                </button>
                <button 
                    onClick={() => { setMode("manual"); setScanResult(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all ${mode === "manual" ? 'bg-[#22D3EE] text-[#13072E]' : 'text-white/50 hover:text-white'}`}
                >
                    <Keyboard className="w-4 h-4" /> Manual Entry
                </button>
            </div>

            {/* Scan Result Feedback Banner */}
            {scanResult && (
                <div className={`p-4 rounded-xl mb-8 flex items-start gap-4 ${scanResult.type === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    {scanResult.type === 'success' ? <CheckCircle className="w-6 h-6 text-green-500 shrink-0" /> : <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />}
                    <div>
                        <h4 className={`text-lg font-bold ${scanResult.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{scanResult.message}</h4>
                        <p className="text-white/70 text-sm mt-1">{scanResult.details}</p>
                    </div>
                </div>
            )}

            {/* The Active Interface */}
            {mode === "scan" ? (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black relative">
                    {/* The div where html5-qrcode injects the video stream */}
                    <div id="qr-reader" className="w-full min-h-[300px] flex items-center justify-center text-white/30" />
                </div>
            ) : (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">User ID or Register Number</label>
                        <input 
                            type="text" 
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            placeholder="e.g. RA26110..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#C53099] outline-none"
                            autoFocus
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isVerifying || !manualId}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C53099] to-[#9D01E9] text-white py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                        {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
                    </button>
                </form>
            )}

        </div>
    );
}

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Hammer, Zap, ShieldAlert, Image as ImageIcon, Flame, Trash2, Edit3, Plus, List, Star, Clock, Sparkles } from "lucide-react";
import { APP_THEME } from "../../constants/theme";
import ConfirmModal from "../../common/ConfirmModal";
import { DatePicker } from "../application/date-picker/date-picker";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import TimePicker from "../../common/TimePicker";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
export default function EventForge() {
    const { csrfToken } = useAuth();
    const toast = useToast();
    const { colors } = APP_THEME;
    const [activeMode, setActiveMode] = useState("manage"); // 'manage' or 'add'
    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [editingEventId, setEditingEventId] = useState(null);
    
    // Form State
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [whatsappLink, setWhatsappLink] = useState("");
    const fileInputRef = useRef(null);
    const [eventData, setEventData] = useState({
        title: "",
        category: "Main Stage",
        date: "",
        time: "",
        timeTBA: false,
        description: "",
        venue: "",
        isHeadliner: false
    });

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // 1. Fetch Events for Registry
    const fetchEvents = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events`);
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            console.error("Failed to load registry:", err);
        }
    };

    useEffect(() => {
        if (activeMode === "manage") fetchEvents();
    }, [activeMode]);

    const [isDragging, setIsDragging] = useState(false);

    // CLIPBOARD INFILTRATION: Paste listener
    useEffect(() => {
        if (activeMode !== "add") return;

        const handlePaste = (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (const item of items) {
                if (item.type.indexOf("image") === 0) {
                    const blob = item.getAsFile();
                    setImageFile(blob);
                    setImagePreview(URL.createObjectURL(blob));
                    break;
                }
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [activeMode]);

    // DRAG & DROP PROTOCOLS
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // 2. Delete Logic
    const handleDelete = (id) => {
        setConfirmAction(() => () => triggerDelete(id));
        setShowConfirm(true);
    };

    const triggerDelete = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${id}`, {
                method: "DELETE",
                headers: { "x-csrf-token": csrfToken },
                credentials: "include"
            });
            if (res.ok) {
                setEvents(events.filter(e => e.id !== id));
                toast.success("EVENT INTEL TERMINATED.");
            }
        } catch (err) { toast.error("TERMINATION FAILED."); }
    };

    // 3. Edit Logic (Transition to Add mode with data)
    const startEdit = (event) => {
        setEditingEventId(event.id);
        setEventData({
            title: event.title,
            category: event.category,
            date: event.date,
            time: event.time === "TBA" ? "" : (event.time || ""),
            timeTBA: event.time === "TBA",
            description: event.description,
            venue: event.venue || "",
            isHeadliner: event.isHeadliner
        });
        setImagePreview(event.imageUrl);
        setWhatsappLink(event.whatsappLink || "");
        setActiveMode("add");
    };

    // 4. Chunked Upload Helper
    const uploadFileInChunks = async (file) => {
        const chunkSize = 2 * 1024 * 1024; // 2MB
        const totalChunks = Math.ceil(file.size / chunkSize);
        const uploadId = `upl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let minioUrl = null;

        for (let idx = 0; idx < totalChunks; idx++) {
            const chunk = file.slice(idx * chunkSize, (idx + 1) * chunkSize);
            const chunkForm = new FormData();
            chunkForm.append("chunk", chunk);
            chunkForm.append("uploadId", uploadId);
            chunkForm.append("chunkIndex", idx);
            chunkForm.append("totalChunks", totalChunks);
            chunkForm.append("fileName", file.name);
            chunkForm.append("mimetype", file.type);

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/upload-chunk`, {
                method: "POST",
                headers: { "x-csrf-token": csrfToken },
                body: chunkForm,
                credentials: "include"
            });
            if (!res.ok) throw new Error("Chunk upload failed");
            const data = await res.json();
            if (data.complete) minioUrl = data.url;
        }
        return minioUrl;
    };

    // 5. Submit Logic (Forge or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let finalImageUrl = undefined;

            if (imageFile) {
                finalImageUrl = await uploadFileInChunks(imageFile);
            }

            const payload = {
                title: eventData.title,
                category: eventData.category,
                date: eventData.date,
                time: eventData.timeTBA ? "TBA" : eventData.time,
                description: eventData.description,
                venue: eventData.venue,
                isHeadliner: eventData.isHeadliner,
            };

            if (finalImageUrl) payload.imageUrl = finalImageUrl;
            if (whatsappLink) payload.whatsappLink = whatsappLink;

            const url = editingEventId 
                ? `${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${editingEventId}`
                : `${import.meta.env.VITE_API_BASE_URL}/api/admin/events`;
            
            const method = editingEventId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { 
                    "x-csrf-token": csrfToken,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                credentials: "include"
            });

            if (response.ok) {
                toast.success(editingEventId ? "INTEL UPDATED!" : "EVENT SUCCESSFULLY FORGED!");
                resetForm();
                setActiveMode("manage");
            } else {
                const err = await response.json();
                toast.error(`ERROR: ${err.error || 'FORGE FAILURE'}`);
            }
        } catch (error) {
            toast.error("NETWORK COLLAPSE.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEventData({ title: "", category: "Main Stage", date: "", time: "", timeTBA: false, description: "", venue: "", isHeadliner: false });
        setImageFile(null);
        setImagePreview(null);
        setWhatsappLink("");
        setEditingEventId(null);
    };

    return (
        <div className="w-full space-y-8">
            {/* --- MODE SWITCHER --- */}
            <div className="flex gap-4">
                <button 
                    onClick={() => { setActiveMode("manage"); resetForm(); }}
                    className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-3
                    ${activeMode === "manage" ? "bg-[#E31E6E] text-white shadow-[0_0_20px_rgba(227,30,110,0.4)]" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                >
                    <List className="w-4 h-4" /> REGISTRY
                </button>
                <button 
                    onClick={() => setActiveMode("add")}
                    className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-3
                    ${activeMode === "add" ? "bg-gradient-to-r from-[#22D3EE] to-[#9D01E9] text-white shadow-[0_0_30px_rgba(34,211,238,0.4)]" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                >
                    <Plus className="w-4 h-4" /> {editingEventId ? "SYNCHRONIZING" : "GENERATE MISSION"}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeMode === "manage" ? (
                    <motion.div 
                        key="manage" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                    >
                        <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#AF94D2]">Operational Registry</h4>
                            <span className="text-[9px] font-medium text-[#22D3EE]/60 uppercase tracking-widest">{events.length} ACTIVE RECORDS</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] font-black uppercase text-white/40 tracking-widest">
                                        <th className="p-6">Intel Designation</th>
                                        <th className="p-6">Sector</th>
                                        <th className="p-6 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event) => (
                                        <tr key={event.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-black border border-white/10 rounded-md overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${event.imageUrl})` }} />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-black uppercase text-sm">{event.title}</p>
                                                            {event.isHeadliner && (
                                                                <Star className="w-3 h-3 text-[#FACC15] fill-[#FACC15]" />
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] font-mono text-white/30 uppercase tracking-tighter">{event.date}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#9D01E9]/10 text-[#22D3EE] uppercase border border-[#9D01E9]/30">
                                                    {event.category}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex justify-center gap-3">
                                                    <button onClick={() => startEdit(event)} className="p-2 hover:bg-[#22D3EE]/20 text-[#22D3EE] rounded-lg transition-all" title="Modify Intel">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-all" title="Terminate record">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="add" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-black/40 backdrop-blur-3xl border border-white/10 p-1 rounded-[2rem] relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        {/* Premium Header */}
                        <div className="p-6 flex items-center justify-between relative border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#E31E6E]/10 rounded-2xl border border-[#E31E6E]/20">
                                    <Hammer className="w-6 h-6 text-[#E31E6E]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {editingEventId ? "Intel Resynchronization" : "The Event Forge"}
                                        <Sparkles className="w-4 h-4 text-[#FACC15] animate-pulse" />
                                    </h3>
                                    <p className="text-[10px] font-medium text-white/50 uppercase tracking-[0.3em]">Authorized Clearance: System Admin</p>
                                </div>
                            </div>
                            <button onClick={() => { setActiveMode("manage"); resetForm(); }} className="bg-white/5 text-white/40 px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all border border-white/10">
                                ABORT MISSION
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 md:p-12 flex flex-col lg:flex-row gap-12">
                            {/* LEFT COL: Text Details */}
                            <div className="flex-1 space-y-8 text-white">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-[#E31E6E] font-bold flex items-center gap-2 mb-3">
                                        <Zap className="w-3 h-3" /> Mission Designation
                                    </label>
                                    <input 
                                        required type="text" placeholder="e.g. BATTLE OF BANDS"
                                        value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xl font-bold text-white outline-none focus:border-[#22D3EE]/50 focus:bg-white/[0.06] transition-all placeholder:text-white/5"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#AF94D2] font-bold mb-3 block">Operational Sector</label>
                                    <select 
                                        value={eventData.category} onChange={e => setEventData({...eventData, category: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#22D3EE]/50 focus:bg-white/[0.06] transition-all appearance-none"
                                    >
                                        <option value="Main Stage" className="bg-black text-white">Main Stage</option>
                                        <option value="Technical" className="bg-black text-white">Technical</option>
                                        <option value="Cultural" className="bg-black text-white">Cultural</option>
                                        <option value="Workshop" className="bg-black text-white">Workshop</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.3em] text-[#AF94D2] font-bold flex items-center gap-2 mb-3">
                                            <Sparkles className="w-3 h-3 text-[#FACC15]" /> Mission Date
                                        </label>
                                        <DatePicker 
                                            value={eventData.date ? parseDate(eventData.date) : null}
                                            onChange={(val) => setEventData({ ...eventData, date: val ? val.toString() : "" })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => setEventData({ ...eventData, timeTBA: !eventData.timeTBA })}>
                                                <label className="text-[10px] uppercase tracking-[0.3em] text-[#AF94D2] font-bold flex items-center gap-2 cursor-pointer">
                                                    <Clock className="w-3 h-3 text-[#22D3EE]" /> Reporting Time
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${eventData.timeTBA ? 'text-[#22D3EE]' : 'text-white/20'}`}>
                                                        {eventData.timeTBA ? "Announced Later" : "Set Specific"}
                                                    </span>
                                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 p-1 border ${eventData.timeTBA ? 'bg-[#22D3EE]/20 border-[#22D3EE]/50' : 'bg-white/5 border-white/10'}`}>
                                                        <motion.div 
                                                            animate={{ x: eventData.timeTBA ? 24 : 0 }}
                                                            className={`w-4 h-4 rounded-full shadow-lg transition-colors ${eventData.timeTBA ? 'bg-[#22D3EE]' : 'bg-white/20'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {eventData.timeTBA ? (
                                            <div 
                                                onClick={() => setEventData({ ...eventData, timeTBA: false })}
                                                className="h-14 w-full bg-[#22D3EE]/5 border border-dashed border-[#22D3EE]/20 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-[#22D3EE]/10 transition-all group"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#22D3EE] group-hover:scale-105 transition-transform">Announced later</span>
                                            </div>
                                        ) : (
                                            <TimePicker 
                                                value={eventData.time}
                                                onChange={(val) => setEventData({ ...eventData, time: val })}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#AF94D2] font-black mb-3 block">Mission Location (Venue)</label>
                                    <input 
                                        type="text" placeholder="e.g. SRM AUDITORIUM"
                                        value={eventData.venue} onChange={e => setEventData({...eventData, venue: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-[#22D3EE] focus:bg-white/10 transition-all placeholder:text-white/5"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#AF94D2] font-black mb-3 block">Mission Briefing</label>
                                    <div className="custom-quill-wrapper">
                                        <ReactQuill 
                                            theme="snow"
                                            placeholder="Detail the tactical chaos here..."
                                            value={eventData.description} 
                                            onChange={(val) => setEventData({...eventData, description: val})}
                                        />
                                    </div>
                                    <style>{`
                                        .custom-quill-wrapper .ql-container.ql-snow {
                                            border: 1px solid rgba(255, 255, 255, 0.1);
                                            border-bottom-left-radius: 1rem;
                                            border-bottom-right-radius: 1rem;
                                            background: rgba(255, 255, 255, 0.05);
                                            min-height: 150px;
                                            color: rgba(255, 255, 255, 0.8);
                                            font-size: 0.875rem;
                                            font-family: inherit;
                                        }
                                        .custom-quill-wrapper .ql-toolbar.ql-snow {
                                            border: 1px solid rgba(255, 255, 255, 0.1);
                                            border-top-left-radius: 1rem;
                                            border-top-right-radius: 1rem;
                                            background: rgba(255, 255, 255, 0.1);
                                        }
                                        .custom-quill-wrapper .ql-snow .ql-stroke {
                                            stroke: rgba(255, 255, 255, 0.7);
                                        }
                                        .custom-quill-wrapper .ql-snow .ql-fill, .custom-quill-wrapper .ql-snow .ql-stroke.ql-fill {
                                            fill: rgba(255, 255, 255, 0.7);
                                        }
                                        .custom-quill-wrapper .ql-snow .ql-picker {
                                            color: rgba(255, 255, 255, 0.7);
                                        }
                                        .custom-quill-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke,
                                        .custom-quill-wrapper .ql-snow .ql-toolbar button:hover .ql-stroke {
                                            stroke: #22D3EE;
                                        }
                                        .custom-quill-wrapper .ql-editor.ql-blank::before {
                                            color: rgba(255, 255, 255, 0.2);
                                            font-style: italic;
                                        }
                                        .custom-quill-wrapper .ql-editor {
                                            padding: 1.5rem;
                                        }
                                    `}</style>
                                </div>
                            </div>

                            {/* RIGHT COL: Image Upload & Submit */}
                            <div className="flex-1 flex flex-col gap-8">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-[#AF94D2] font-black flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3" /> Visual Intel (Poster)
                                </label>
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all cursor-pointer overflow-hidden
                                    ${isDragging ? 'border-[#E31E6E] bg-[#E31E6E]/10 scale-[0.98]' : (imagePreview ? 'border-[#22D3EE] bg-black' : 'border-white/10 hover:border-[#E31E6E] bg-white/5')}`}
                                >
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="text-center p-8">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                                <ImageIcon className="w-6 h-6 text-white/20" />
                                            </div>
                                            <p className="font-black uppercase tracking-widest text-xs text-white/40">{isDragging ? "DROP INTEL" : "Inject Visual"}</p>
                                            <p className="text-[8px] mt-2 text-white/20 uppercase tracking-[0.2em]">Drag, Drop or Paste</p>
                                        </div>
                                    )}
                                </div>

                                {/* WhatsApp Link Section */}
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] uppercase font-black text-[#25D366] tracking-widest mb-1 flex items-center gap-2">
                                            Community Access (WhatsApp)
                                        </label>
                                        <p className="text-[8px] text-white/40 uppercase tracking-widest">Optional invite link for event attendees.</p>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <input 
                                            type="url"
                                            value={whatsappLink}
                                            onChange={(e) => setWhatsappLink(e.target.value)}
                                            placeholder="https://chat.whatsapp.com/..."
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#25D366]/50 placeholder:text-white/20 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" disabled={isLoading}
                                    className={`w-full py-6 rounded-2xl text-lg font-bold uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 group
                                    ${isLoading ? 'bg-white/5 text-white/20' : 'bg-[#E31E6E] text-white hover:bg-white hover:text-black shadow-[0_15px_30px_rgba(227,30,110,0.3)]'}`}
                                >
                                    {isLoading ? "SYNCING VAULT..." : (editingEventId ? "Update Intel" : "Forge Mission")}
                                    {!isLoading && <Zap className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />}
                                </button>

                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] uppercase font-black text-[#FACC15] tracking-[0.2em] mb-1 flex items-center gap-2">
                                            <Star className="w-3 h-3 fill-[#FACC15]" /> Headliner Status
                                        </label>
                                        <p className="text-[8px] text-white/30 uppercase tracking-widest">Mark as Main Stage attraction.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setEventData({ ...eventData, isHeadliner: !eventData.isHeadliner })}
                                        className={`w-14 h-7 rounded-full relative transition-all duration-500 p-1 ${eventData.isHeadliner ? 'bg-[#FACC15]/20 border-[#FACC15]/50' : 'bg-white/5 border-white/10'} border`}
                                    >
                                        <motion.div 
                                            animate={{ x: eventData.isHeadliner ? 28 : 0 }}
                                            className={`w-5 h-5 rounded-full shadow-lg ${eventData.isHeadliner ? 'bg-[#FACC15]' : 'bg-white/20'}`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal 
                isOpen={showConfirm} 
                onClose={() => setShowConfirm(false)} 
                onConfirm={confirmAction}
            />
        </div>
    );
}

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Hammer, Zap, ShieldAlert, Image as ImageIcon, Flame, Trash2, Edit3, Plus, List, Star } from "lucide-react";
import { APP_THEME } from "../../constants/theme";
import ConfirmModal from "../../common/ConfirmModal";

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
    const fileInputRef = useRef(null);
    const [eventData, setEventData] = useState({
        title: "",
        category: "Main Stage",
        date: "",
        capacity: "",
        date: "",
        capacity: "",
        description: "",
        isHeadliner: false
    });

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // 1. Fetch Events for Registry
    const fetchEvents = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/events");
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
            const res = await fetch(`http://localhost:5000/api/admin/events/${id}`, {
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
            capacity: event.capacity,
            description: event.description,
            isHeadliner: event.isHeadliner
        });
        setImagePreview(event.imageUrl);
        setActiveMode("add");
    };

    // 4. Submit Logic (Forge or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append("title", eventData.title);
        formData.append("category", eventData.category);
        formData.append("date", eventData.date);
        formData.append("capacity", eventData.capacity);
        formData.append("description", eventData.description);
        formData.append("isHeadliner", eventData.isHeadliner);
        
        if (imageFile) formData.append("posterImage", imageFile); 

        try {
            const url = editingEventId 
                ? `http://localhost:5000/api/admin/events/${editingEventId}`
                : "http://localhost:5000/api/admin/events";
            
            const method = editingEventId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "x-csrf-token": csrfToken },
                body: formData,
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
        setEventData({ title: "", category: "Main Stage", date: "", capacity: "", description: "", isHeadliner: false });
        setImageFile(null);
        setImagePreview(null);
        setEditingEventId(null);
    };

    return (
        <div className="w-full space-y-8">
            {/* --- MODE SWITCHER --- */}
            <div className="flex gap-4">
                <button 
                    onClick={() => { setActiveMode("manage"); resetForm(); }}
                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3
                    ${activeMode === "manage" ? "bg-[#E31E6E] text-white shadow-[0_0_20px_rgba(227,30,110,0.4)]" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                >
                    <List className="w-4 h-4" /> REGISTRY
                </button>
                <button 
                    onClick={() => setActiveMode("add")}
                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3
                    ${activeMode === "add" ? "bg-[#22D3EE] text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                >
                    <Plus className="w-4 h-4" /> {editingEventId ? "UPDATING" : "INITIALIZE"}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeMode === "manage" ? (
                    <motion.div 
                        key="manage" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                    >
                        <div className="bg-white/10 p-4 border-b border-white/10 flex justify-between items-center">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#AF94D2]">Operational Registry</h4>
                            <span className="text-[10px] font-mono opacity-40">{events.length} ACTIVE RECORDS</span>
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
                                                <span className="text-[10px] font-black px-2 py-1 rounded bg-[#9D01E9]/20 text-[#9D01E9] uppercase border border-[#9D01E9]/30">
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
                        key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="bg-[#020617] border-4 border-[#E31E6E] p-1 shadow-[12px_12px_0px_#22D3EE] relative"
                    >
                        {/* Brutalist Hazard Header */}
                        <div className="bg-[#E31E6E] p-4 flex items-center justify-between overflow-hidden relative">
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }} />
                            <h3 className="text-3xl font-black uppercase italic text-black tracking-widest relative z-10 flex items-center gap-3">
                                <Hammer className="w-8 h-8" />
                                {editingEventId ? "INTEL UPDATE" : "THE FORGE"}
                            </h3>
                            <button onClick={() => { setActiveMode("manage"); resetForm(); }} className="bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest z-10 hover:bg-white hover:text-black transition-colors">
                                ABORT
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 md:p-12 flex flex-col lg:flex-row gap-12">
                            {/* LEFT COL: Text Details */}
                            <div className="flex-1 space-y-8 text-white">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#E31E6E] font-black flex items-center gap-2 mb-2">
                                        <Zap className="w-3 h-3" /> Event Designation
                                    </label>
                                    <input 
                                        required type="text" placeholder="e.g. BATTLE OF BANDS"
                                        value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})}
                                        className="w-full bg-transparent border-b-4 border-white/20 py-3 text-2xl font-black uppercase text-white outline-none focus:border-[#22D3EE] placeholder:text-white/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.2em] text-[#E31E6E] font-black">Category</label>
                                        <select 
                                            value={eventData.category} onChange={e => setEventData({...eventData, category: e.target.value})}
                                            className="w-full bg-[#1E1B4B] border-2 border-white/20 p-4 font-bold text-white outline-none focus:border-[#22D3EE] mt-2 appearance-none"
                                        >
                                            <option>Main Stage</option><option>Cultural</option><option>Technical</option><option>Informals</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.2em] text-[#E31E6E] font-black">Max Capacity</label>
                                        <input 
                                            required type="number" placeholder="500"
                                            value={eventData.capacity} onChange={e => setEventData({...eventData, capacity: e.target.value})}
                                            className="w-full bg-transparent border-b-4 border-white/20 py-3 mt-1 text-2xl font-black text-white outline-none focus:border-[#22D3EE]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#E31E6E] font-black">Date / Time</label>
                                    <input 
                                        required type="text" placeholder="e.g. APR 09 | 10:00 PM"
                                        value={eventData.date} onChange={e => setEventData({...eventData, date: e.target.value})}
                                        className="w-full bg-transparent border-b-4 border-white/20 py-3 text-xl font-bold uppercase text-white outline-none focus:border-[#22D3EE]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#E31E6E] font-black">Briefing (Description)</label>
                                    <textarea 
                                        required rows="4" placeholder="Detail the chaos here..."
                                        value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})}
                                        className="w-full bg-[#1E1B4B]/50 border-2 border-white/20 p-4 mt-2 font-mono text-sm text-white outline-none focus:border-[#22D3EE] resize-none"
                                    />
                                </div>
                            </div>

                            {/* RIGHT COL: Image Upload & Submit */}
                            <div className="flex-1 flex flex-col gap-8">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-[#E31E6E] font-black flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3" /> Official Poster Injector
                                </label>
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative w-full aspect-square flex flex-col items-center justify-center border-4 border-dashed cursor-pointer transition-all 
                                    ${isDragging ? 'border-[#E31E6E] bg-[#E31E6E]/10 scale-95 shadow-[0_0_30px_#E31E6E]' : (imagePreview ? 'border-[#22D3EE] bg-black' : 'border-white/20 hover:border-[#E31E6E]')}`}
                                >
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                                    ) : (
                                        <div className="text-center p-6 text-white/40">
                                            <p className="font-black uppercase tracking-widest text-lg">{isDragging ? "DROP INTEL NOW" : "Inject Intel"}</p>
                                            <p className="text-[8px] mt-2 opacity-50 uppercase tracking-widest">DRAG, DROP OR CTRL+V</p>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    type="submit" disabled={isLoading}
                                    className={`w-full py-6 text-2xl font-black uppercase tracking-widest transition-all border-4 flex items-center justify-center gap-4 ${isLoading ? 'bg-gray-600 border-gray-600' : 'bg-[#22D3EE] text-black border-[#22D3EE] hover:bg-transparent hover:text-[#22D3EE] shadow-[0_0_30px_rgba(34,211,238,0.5)]'}`}
                                >
                                    {isLoading ? "SYNCING..." : (editingEventId ? "COMMIT CHANGES" : "INITIALIZE EVENT")}
                                </button>

                                <div className="p-6 border-4 border-dashed border-white/10 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] uppercase font-black text-[#E31E6E] tracking-widest">Headliner Status</label>
                                        <p className="text-[8px] opacity-40 uppercase tracking-widest leading-tight">Elevate this intelligence to the Grand Stages section.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setEventData({ ...eventData, isHeadliner: !eventData.isHeadliner })}
                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${eventData.isHeadliner ? 'bg-[#FACC15]' : 'bg-white/10'}`}
                                    >
                                        <motion.div 
                                            animate={{ x: eventData.isHeadliner ? 24 : 0 }}
                                            className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-xl"
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

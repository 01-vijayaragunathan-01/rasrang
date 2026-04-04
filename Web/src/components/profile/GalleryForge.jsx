import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Camera, Image as ImageIcon, Trash2, Plus, List, Zap, AlertCircle, Sparkles, Archive } from "lucide-react";
import { APP_THEME } from "../../constants/theme";
import ConfirmModal from "../../common/ConfirmModal";

export default function GalleryForge() {
    const { csrfToken } = useAuth();
    const toast = useToast();
    const [activeMode, setActiveMode] = useState("manage"); // 'manage' or 'add'
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState([]);
    
    // Form State
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        caption: "",
        category: "Festival"
    });

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // 1. Fetch Gallery for Registry
    const fetchGallery = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gallery`);
            const data = await res.json();
            if (res.ok) {
                setItems(data);
            } else {
                toast.error(`ARCHIVE ERROR: ${data.error || "Registry unreachable"}`);
            }
        } catch (err) {
            toast.error("CONNECTION FAILURE: Global archives offline.");
        }
    };

    useEffect(() => {
        if (activeMode === "manage") fetchGallery();
    }, [activeMode]);

    const [isDragging, setIsDragging] = useState(false);

    // CLIPBOARD INFILTRATION
    useEffect(() => {
        if (activeMode !== "add") return;
        const handlePaste = (e) => {
            const clipboardItems = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (const item of clipboardItems) {
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

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
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
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/gallery/${id}`, {
                method: "DELETE",
                headers: { "x-csrf-token": csrfToken },
                credentials: "include"
            });
            if (res.ok) {
                setItems(items.filter(item => item.id !== id));
                toast.success("VISUAL ARCHIVE TERMINATED.");
            }
        } catch (err) { toast.error("TERMINATION REJECTED."); }
    };

    // 3. Submit Logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) return toast.error("IMAGE INJECTION REQUIRED.");
        setIsLoading(true);

        const data = new FormData();
        data.append("caption", formData.caption);
        data.append("category", formData.category);
        data.append("galleryImage", imageFile);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/gallery`, {
                method: "POST",
                headers: { "x-csrf-token": csrfToken },
                body: data,
                credentials: "include"
            });

            if (response.ok) {
                toast.success("VISUAL INTEL SECURED IN ARCHIVES.");
                resetForm();
                setActiveMode("manage");
            } else {
                const err = await response.json();
                toast.error(`FORGE ERROR: ${err.error}`);
            }
        } catch (error) {
            toast.error("CONNECTION COLLAPSE.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ caption: "", category: "Festival" });
        setImageFile(null);
        setImagePreview(null);
    };

    return (
        <div className="w-full space-y-8">
            {/* --- MODE SWITCHER --- */}
            <div className="flex gap-4">
                <button 
                    onClick={() => { setActiveMode("manage"); resetForm(); }}
                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3
                    ${activeMode === "manage" ? "bg-[#9D01E9] text-white shadow-[0_0_20px_rgba(157,1,233,0.4)]" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                >
                    <List className="w-4 h-4" /> VISUAL ARCHIVES
                </button>
                <button 
                    onClick={() => setActiveMode("add")}
                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3
                    ${activeMode === "add" ? "bg-[#22D3EE] text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                >
                    <Plus className="w-4 h-4" /> INGEST INTEL
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeMode === "manage" ? (
                    <motion.div 
                        key="manage" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
                    >
                        {items.map((item) => (
                            <div key={item.id} className="group relative aspect-square bg-[#050510] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl transition-all hover:border-[#9D01E9]/50">
                                <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-black/60 backdrop-blur-md">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white mb-3 truncate">{item.caption || "SECURED INTEL"}</p>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="w-full py-2 bg-red-500/80 hover:bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                                    >
                                        TERMINATE
                                    </button>
                                </div>
                                <div className="absolute top-4 right-4 px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[7px] font-black uppercase text-[#22D3EE] tracking-widest">{item.category}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="add" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-4xl mx-auto bg-black/40 backdrop-blur-3xl border border-white/10 p-1 rounded-[2rem] relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        {/* Premium Header */}
                        <div className="p-6 flex items-center justify-between relative border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#9D01E9]/10 rounded-2xl border border-[#9D01E9]/20">
                                    <Camera className="w-6 h-6 text-[#9D01E9]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-2">
                                        Visual Intelligence Ingestion
                                        <Sparkles className="w-4 h-4 text-[#FACC15] animate-pulse" />
                                    </h3>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Secure Archive Protocol: Activated</p>
                                </div>
                            </div>
                            <button onClick={() => { setActiveMode("manage"); resetForm(); }} className="bg-white/5 text-white/40 px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all border border-white/10">
                                ABORT INGESTION
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 flex flex-col md:flex-row gap-10">
                            <div className="flex-1 space-y-8">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#9D01E9] font-black flex items-center gap-2 mb-3">
                                        <Zap className="w-3 h-3" /> Visual Caption
                                    </label>
                                    <input 
                                        type="text" placeholder="e.g. SUR SANGRAM NIGHT VIBES"
                                        value={formData.caption} onChange={e => setFormData({...formData, caption: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold uppercase text-white outline-none focus:border-[#22D3EE] focus:bg-white/10 transition-all placeholder:text-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#9D01E9] font-black flex items-center gap-2 mb-3">
                                        <AlertCircle className="w-3 h-3" /> Asset Category
                                    </label>
                                    <select 
                                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#22D3EE] focus:bg-white/10 transition-all appearance-none"
                                    >
                                        <option className="bg-[#050510]">Main Stage</option><option className="bg-[#050510]">Cultural</option><option className="bg-[#050510]">Technical</option><option className="bg-[#050510]">Informals</option><option className="bg-[#050510]">Festival</option>
                                    </select>
                                </div>
                                <button 
                                    type="submit" disabled={isLoading || !imageFile}
                                    className={`w-full py-6 rounded-2xl text-xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 group
                                    ${isLoading || !imageFile ? 'bg-white/5 text-white/20 border border-white/5' : 'bg-[#22D3EE] text-black hover:bg-white shadow-[0_20px_40px_rgba(34,211,238,0.3)] hover:scale-[1.02]'}`}
                                >
                                    {isLoading ? "UPLOADING TO VAULT..." : "COMMIT TO ARCHIVE"}
                                    {!isLoading && <Archive className="w-5 h-5 group-hover:animate-bounce" />}
                                </button>
                            </div>

                            <div className="w-full md:w-80">
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] transition-all cursor-pointer overflow-hidden
                                    ${isDragging ? 'border-[#9D01E9] bg-[#9D01E9]/10 scale-[0.98]' : (imagePreview ? 'border-[#22D3EE] bg-black' : 'border-white/10 hover:border-[#9D01E9] bg-white/5')}`}
                                >
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-700" />
                                    ) : (
                                        <div className="text-center p-8">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                                <ImageIcon className="w-6 h-6 text-white/20" />
                                            </div>
                                            <p className="font-black uppercase tracking-widest text-xs text-white/40">{isDragging ? "DROP IMAGE" : "Inject Visual"}</p>
                                            <p className="text-[8px] mt-2 text-white/20 uppercase tracking-[0.2em]">Drag, Drop or Paste</p>
                                        </div>
                                    )}
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

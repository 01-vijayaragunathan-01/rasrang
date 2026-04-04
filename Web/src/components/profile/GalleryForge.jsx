import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Camera, Image as ImageIcon, Trash2, Plus, List, Zap, AlertCircle } from "lucide-react";
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
            const res = await fetch("http://localhost:5000/api/gallery");
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
            const res = await fetch(`http://localhost:5000/api/admin/gallery/${id}`, {
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
            const response = await fetch("http://localhost:5000/api/admin/gallery", {
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
                    <List className="w-4 h-4" /> ARCHIVE REGISTRY
                </button>
                <button 
                    onClick={() => setActiveMode("add")}
                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3
                    ${activeMode === "add" ? "bg-[#22D3EE] text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                >
                    <Plus className="w-4 h-4" /> INGEST IMAGE
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeMode === "manage" ? (
                    <motion.div 
                        key="manage" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                    >
                        {items.map((item) => (
                            <div key={item.id} className="group relative aspect-square bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2 opacity-60 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white mb-2 truncate">{item.caption || "NO CAPTION"}</p>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="w-full py-1.5 bg-red-600/90 text-white text-[8px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
                                    >
                                        TERMINATE
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="add" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="max-w-4xl mx-auto bg-[#0A0A0A] border-4 border-[#9D01E9] p-1 shadow-[15px_15px_0px_#22D3EE] overflow-hidden"
                    >
                        {/* Hazard Header */}
                        <div className="bg-[#9D01E9] p-4 flex items-center justify-between relative">
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }} />
                            <h3 className="text-2xl font-black uppercase italic text-white tracking-[0.2em] relative z-10 flex items-center gap-3">
                                <Camera className="w-6 h-6" /> VISUAL ARCHIVE INGESTION
                            </h3>
                            <button onClick={() => { setActiveMode("manage"); resetForm(); }} className="bg-black text-white px-4 py-1 text-[9px] font-black uppercase tracking-widest z-10 hover:bg-white hover:text-black transition-colors">
                                ABORT
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#9D01E9] font-black flex items-center gap-2 mb-2">
                                        <Zap className="w-3 h-3" /> Visual Caption
                                    </label>
                                    <input 
                                        type="text" placeholder="e.g. SUR SANGRAM NIGHT VIBES"
                                        value={formData.caption} onChange={e => setFormData({...formData, caption: e.target.value})}
                                        className="w-full bg-[#1E1B4B]/30 border-b-2 border-white/20 py-3 text-lg font-black uppercase text-white outline-none focus:border-[#22D3EE] placeholder:text-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#9D01E9] font-black flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-3 h-3" /> Asset Category
                                    </label>
                                    <select 
                                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                                        className="w-full bg-[#1E1B4B] border-2 border-white/20 p-4 font-bold text-white outline-none focus:border-[#22D3EE] appearance-none"
                                    >
                                        <option>Main Stage</option><option>Cultural</option><option>Technical</option><option>Informals</option><option>Festival</option>
                                    </select>
                                </div>
                                <button 
                                    type="submit" disabled={isLoading || !imageFile}
                                    className={`w-full py-5 text-xl font-black uppercase tracking-widest transition-all border-4 flex items-center justify-center gap-4 
                                    ${isLoading || !imageFile ? 'bg-white/5 border-white/10 text-white/20' : 'bg-[#22D3EE] text-black border-[#22D3EE] hover:bg-transparent hover:text-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.4)]'}`}
                                >
                                    {isLoading ? "UPLOADING..." : "COMMIT TO ARCHIVE"}
                                </button>
                            </div>

                            <div className="w-full md:w-80">
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative w-full aspect-square flex flex-col items-center justify-center border-4 border-dashed transition-all cursor-pointer
                                    ${isDragging ? 'border-[#9D01E9] bg-[#9D01E9]/10' : (imagePreview ? 'border-[#22D3EE]' : 'border-white/20 hover:border-[#9D01E9]')}`}
                                >
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                                    ) : (
                                        <div className="text-center p-6 text-white/30">
                                            <ImageIcon className="w-10 h-10 mx-auto mb-4 opacity-20" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">Inject Visual Intel</p>
                                            <p className="text-[7px] mt-2 opacity-50 uppercase font-mono">DRAG & DROP OR CTRL+V</p>
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

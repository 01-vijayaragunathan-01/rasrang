import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { Play, X, Maximize2, ChevronRight, ChevronLeft, RefreshCcw, AlertTriangle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GalleryItemSkeleton } from "../common/Skeleton";

gsap.registerPlugin(ScrollTrigger);

export default function Gallery() {
    const { theme } = useTheme();
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [columns, setColumns] = useState(3);
    const [lightbox, setLightbox] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const containerRef = useRef(null);
    const gridRef = useRef(null);

    // ─── DATA FETCHING ───
    const fetchGallery = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gallery`);
            const data = await res.json();
            if (res.ok) {
                // Static Chairman Image (Prioritized)
                const chairmanItem = {
                    id: 'chairman-static-01',
                    imageUrl: '/Assets/gallery/DSC_2169.webp',
                    caption: 'Chairman Message',
                    category: 'Core'
                };

                // Add chairman first, then other images from backend
                const galleryData = [...data];

                // Enrich existing items with dynamic ratios
                const enriched = galleryData.map((item, i) => ({
                    ...item,
                    type: "image", // Default to image
                    ratio: i % 4 === 0 ? "aspect-[3/4]" : i % 3 === 0 ? "aspect-video" : "aspect-square"
                }));
                setItems(enriched);
            } else {
                throw new Error("Failed to fetch");
            }
        } catch (err) {
            toast.error("Global archives unreachable.");
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    // Apply Premium Scroll Snapping during mount
    useEffect(() => {
        document.documentElement.classList.add("snap-y", "snap-proximity");
        return () => {
            document.documentElement.classList.remove("snap-y", "snap-proximity");
        };
    }, []);

    // ─── RESPONSIVE MASONRY LOGIC ───
    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth < 640) setColumns(1);
            else if (window.innerWidth < 1024) setColumns(2);
            else setColumns(3);
        };
        updateColumns();
        window.addEventListener("resize", updateColumns);
        return () => window.removeEventListener("resize", updateColumns);
    }, []);

    const chunkedMedia = Array.from({ length: columns }, () => []);
    items.forEach((item, index) => {
        chunkedMedia[index % columns].push(item);
    });

    // ─── GSAP ENTRANCE ANIMATION ───
    useLayoutEffect(() => {
        if (items.length === 0) return;

        let ctx = gsap.context(() => {
            gsap.from(".gallery-header", {
                y: 30,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        }, containerRef);
        
        return () => ctx.revert();
    }, [items, columns]);

    return (
        <section ref={containerRef} className="relative min-h-screen pt-36 pb-24 overflow-hidden" style={{ backgroundColor: "transparent" }}>
            
            <div className="relative max-w-[1400px] mx-auto px-6 z-10">
                
                {/* ── HEADER ── */}
                <div className="gallery-header text-center mb-24">
                    <p className="text-[10px] tracking-[0.6em] uppercase mb-4 font-bold font-accent" style={{ color: theme.colors.accent }}>
                        ✦ THE TEMPLE MOSAIC ✦
                    </p>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-wider font-massive" style={{ color: theme.colors.textTitle }}>
                        Visual <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${theme.colors.accent}, ${theme.colors.secondary})` }}>Archives</span>
                    </h1>
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${theme.colors.accent}60)` }} />
                        <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: `${theme.colors.accent}60` }} />
                        <div className="h-px w-20" style={{ background: `linear-gradient(to left, transparent, ${theme.colors.accent}60)` }} />
                    </div>
                </div>

                {/* ── MASONRY GRID ── */}
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="w-12 h-12 border-4 border-[#22D3EE]/20 border-t-[#22D3EE] rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-3xl border border-white/10">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4 font-massive">Connection Severed</h2>
                        <p className="text-white/60 max-w-md mx-auto mb-8">
                            Unable to retrieve visual archives from the mainframe. Check your uplink and try again.
                        </p>
                        <button
                            onClick={fetchGallery}
                            className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-widest border border-white/20 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] mx-auto"
                        >
                            <RefreshCcw className="w-4 h-4" /> Retry Uplink
                        </button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-3xl border border-white/10">
                        <h2 className="text-3xl font-bold text-white mb-4 font-massive">Archives Empty</h2>
                        <p className="text-white/60 max-w-md mx-auto">No images have been uploaded to the registry yet.</p>
                    </div>
                ) : (
                    <div ref={gridRef} className="flex gap-6 md:gap-8 items-start">
                        {chunkedMedia.map((column, colIndex) => (
                            <div key={colIndex} className="flex flex-col gap-6 md:gap-8 w-full">
                                {column.map((item) => (
                                    <GalleryItem 
                                        key={item.id} 
                                        item={item} 
                                        theme={theme} 
                                        onExpand={() => setLightbox(item)} 
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── CINEMATIC LIGHTBOX ── */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#000000]/98 backdrop-blur-3xl p-4 md:p-12 overflow-hidden"
                        onClick={() => setLightbox(null)}
                    >
                        {/* Ambient Glow in Lightbox */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full opacity-10 blur-[150px] pointer-events-none"
                             style={{ background: theme.colors.primary }} />

                        {/* Top Navigation */}
                        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50">
                            <div className="flex flex-col">
                                <span className="text-[10px] tracking-[0.5em] uppercase font-bold" style={{ color: theme.colors.accent }}>✦ Frame Registry ✦</span>
                                <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight font-massive">
                                    {lightbox.caption}
                                </h2>
                            </div>
                            <button 
                                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-95"
                                onClick={() => setLightbox(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Main Media Frame */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-7xl max-h-[75vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img 
                                src={lightbox.imageUrl} 
                                alt={lightbox.caption} 
                                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-[0_0_60px_rgba(157,1,233,0.1)] border border-white/5"
                            />
                        </motion.div>

                        {/* Bottom Hint */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center opacity-40">
                            <p className="text-[9px] tracking-[0.4em] uppercase text-white font-bold">
                                Esc to return to archives
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </section>
    );
}

/**
 * 🖼️ SELF-MANAGING GALLERY ITEM
 * Handles its own loading state to provide shimmering placeholders
 * and smooth cinematic reveals.
 */
function GalleryItem({ item, theme, onExpand }) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onClick={onExpand}
            className="mosaic-item group relative w-full rounded-2xl overflow-hidden cursor-pointer border border-white/10 transition-all duration-700 hover:shadow-[0_0_40px_rgba(228,189,141,0.1)] snap-start scroll-mt-32"
        >
            <div className={`relative w-full ${item.ratio} overflow-hidden bg-[#0D0620]`}>
                {/* ── LOADING SKELETON ── */}
                {!isLoaded && <GalleryItemSkeleton ratio={item.ratio} />}

                {/* ── ACTUAL IMAGE ── */}
                <motion.img 
                    src={item.imageUrl} 
                    alt={item.caption} 
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ 
                        opacity: isLoaded ? 1 : 0, 
                        scale: isLoaded ? 1 : 1.1 
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    onLoad={() => setIsLoaded(true)}
                    className="w-full h-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
                
                {/* ── GOLDEN HOVER OVERLAY FRAME ── */}
                <div className="absolute inset-4 border border-[#E4BD8D]/10 group-hover:border-[#E4BD8D]/30 rounded-xl transition-all duration-700 pointer-events-none z-10" />

                {/* ── INFO OVERLAY ── */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px] flex flex-col justify-end p-8">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-lg font-black text-white font-massive leading-tight mb-2">
                            {item.caption}
                        </h3>
                        <div className="flex items-center gap-2">
                            <Maximize2 size={12} style={{ color: theme.colors.accent }} />
                            <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-white/60">Expand Frame</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* ── SUBTLE GRADIENT LINE ── */}
            <div className="absolute bottom-0 left-0 w-0 h-[2px] group-hover:w-full transition-all duration-700"
                 style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.accent}, transparent)` }} />
        </motion.div>
    );
}
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { Play, X, Maximize2, ChevronRight, ChevronLeft } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── VISUAL SEEDER ✦ (Fallback Data for Cinematic Preview) ───
const MOCK_GALLERY = [
    { id: "m1", type: "image", imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800", caption: "Midnight Jam: Strings of the Night", ratio: "aspect-[4/3]" },
    { id: "m2", type: "image", imageUrl: "https://images.unsplash.com/photo-1540039155732-d69282f9fb71?q=80&w=800", caption: "Main Stage Energy", ratio: "aspect-video" },
    { id: "m3", type: "image", imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=600", caption: "Classical Fusion", ratio: "aspect-[3/4]" },
    { id: "m4", type: "image", imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800", caption: "Artistic Canvas Live", ratio: "aspect-square" },
    { id: "m5", type: "image", imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600", caption: "Tech Wars: Cyber Ritual", ratio: "aspect-[9/16]" },
    { id: "m6", type: "image", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800", caption: "Celestial Vocals", ratio: "aspect-[4/3]" },
    { id: "m7", type: "image", imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800", caption: "Fashion Walk: Threads of Light", ratio: "aspect-[3/4]" },
    { id: "m8", type: "image", imageUrl: "https://images.unsplash.com/photo-1542840410-3092f99611a3?q=80&w=1000", caption: "Strings & Poetry: Silent Verse", ratio: "aspect-[16/9]" },
    { id: "m9", type: "image", imageUrl: "https://images.unsplash.com/photo-1525362081669-2b476bb628c3?q=80&w=600", caption: "Neon Nights Showcase", ratio: "aspect-square" },
    { id: "m10", type: "image", imageUrl: "/Assets/hero/DSC03609.webp", caption: "The Midnight Pulse", ratio: "aspect-square" },
    { id: "m11", type: "image", imageUrl: "/Assets/hero/DSC_2248.webp", caption: "Ataccato: Crimson Harmonies", ratio: "aspect-[3/4]" },
    { id: "m12", type: "image", imageUrl: "/Assets/hero/DSC_2221.webp", caption: "Ataccato: Vocal Intensity", ratio: "aspect-[3/4]" },
];

export default function Gallery() {
    const { theme } = useTheme();
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [columns, setColumns] = useState(3);
    const [lightbox, setLightbox] = useState(null);
    const containerRef = useRef(null);
    const gridRef = useRef(null);

    // ─── DATA FETCHING & SEEDING ───
    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/gallery");
                const data = await res.json();
                if (res.ok && data.length > 0) {
                    // Enrich existing items with dynamic ratios
                    const enriched = data.map((item, i) => ({
                        ...item,
                        type: "image", // Default to image
                        ratio: i % 4 === 0 ? "aspect-[3/4]" : i % 3 === 0 ? "aspect-video" : "aspect-square"
                    }));
                    setItems(enriched);
                } else {
                    setItems(MOCK_GALLERY); // Fallback to seeder if empty
                }
            } catch (err) {
                toast.error("Global archives unreachable. Displaying cached seeder.");
                setItems(MOCK_GALLERY);
            }
        };
        fetchGallery();
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
                <div ref={gridRef} className="flex gap-6 md:gap-8 items-start">
                    {chunkedMedia.map((column, colIndex) => (
                        <div key={colIndex} className="flex flex-col gap-6 md:gap-8 w-full">
                            {column.map((item, itemIndex) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    onClick={() => setLightbox(item)}
                                    className="mosaic-item group relative w-full rounded-2xl overflow-hidden cursor-pointer border border-white/10 transition-all duration-700 hover:shadow-[0_0_40px_rgba(228,189,141,0.1)]"
                                >
                                    {/* Media Asset container */}
                                    <div className={`relative w-full ${item.ratio} overflow-hidden`}>
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.caption} 
                                            className="w-full h-full object-cover object-center opacity-100 transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                                        />
                                        
                                        {/* Golden Hover Overlay Frame */}
                                        <div className="absolute inset-4 border border-[#E4BD8D]/10 group-hover:border-[#E4BD8D]/30 rounded-xl transition-all duration-700 pointer-events-none z-10" />

                                        {/* Info Overlay */}
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
                                    
                                    {/* Subtle Gradient Line */}
                                    <div className="absolute bottom-0 left-0 w-0 h-[2px] group-hover:w-full transition-all duration-700"
                                         style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.accent}, transparent)` }} />
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
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
import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const galleryItems = [
  { id: 1, src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", caption: "Sur Sangram 2024", span: "md:col-span-2 md:row-span-2" },
  { id: 2, src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80", caption: "Natyam Finals", span: "" },
  { id: 3, src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80", caption: "Opening Ceremony", span: "" },
  { id: 4, src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80", caption: "Rang Bhoomi Art", span: "" },
  { id: 5, src: "https://images.unsplash.com/photo-1429514513361-8a632ff5a71d?w=800&q=80", caption: "Crowd & Lights", span: "md:col-span-2" },
  { id: 6, src: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80", caption: "Abhivyakti Theatre", span: "" },
  { id: 7, src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80", caption: "DJ Night", span: "" },
];

function GalleryCard({ item, theme, onClick }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-1, 1], [6, -6]);
    const rotateY = useTransform(x, [-1, 1], [-6, 6]);

    function handleMouseMove(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
        y.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }

    return (
        <motion.div
            layoutId={`img-${item.id}`}
            className={`perspective-1000 group relative overflow-hidden cursor-pointer rounded-2xl ${item.span}`}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <motion.div style={{ rotateX, rotateY }} className="w-full h-full">
                <img 
                    src={item.src} 
                    alt={item.caption} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                
                {/* Purple/Pink Gradient Overlay */}
                <div className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-500"
                     style={{ background: `linear-gradient(to top, ${theme.colors.surface}, transparent)` }} />
                
                {/* Hover Glow Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#E31E6E]/50 transition-colors duration-500" />
                
                {/* Caption */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-white text-sm tracking-[0.2em] uppercase font-black px-4 py-2 rounded-full backdrop-blur-md border border-white/20 font-massive"
                          style={{ background: `${theme.colors.primary}40` }}>
                        {item.caption}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function Gallery() {
    const [lightbox, setLightbox] = useState(null);
    const { theme } = useTheme();

    return (
        <section id="gallery" className="relative py-32 min-h-screen overflow-hidden" style={{ backgroundColor: "transparent" }}>
            
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-[150px]"
                 style={{ background: theme.colors.secondary }} />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-10 blur-[150px]"
                 style={{ background: theme.colors.primary }} />

            <div className="relative max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <p className="text-xs tracking-[0.5em] uppercase mb-4 font-bold font-accent" style={{ color: theme.colors.accent }}>
                        ✦ Visual Archives ✦
                    </p>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-wider font-massive" style={{ color: theme.colors.textTitle }}>
                        The{' '}
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
                            Gallery
                        </span>
                    </h2>
                    <p className="mt-5 text-lg italic opacity-80 font-accent" style={{ color: theme.colors.textMuted }}>
                        Moments frozen in celestial light.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[240px]">
                    {galleryItems.map((item) => (
                        <GalleryCard key={item.id} item={item} theme={theme} onClick={() => setLightbox(item)} />
                    ))}
                </div>
            </div>

            {/* LIGHTBOX */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12"
                        style={{ backgroundColor: `${theme.colors.base}F0` }}
                        onClick={() => setLightbox(null)}
                    >
                        <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                            
                            {/* Glassmorphism frame (replaces film strips) */}
                            <div className="w-full rounded-2xl overflow-hidden border backdrop-blur-xl shadow-2xl"
                                 style={{ borderColor: `${theme.colors.primary}30`, background: `${theme.colors.surface}80` }}>
                                <motion.img 
                                    layoutId={`img-${lightbox.id}`}
                                    src={lightbox.src} 
                                    className="w-full max-h-[70vh] object-contain" 
                                />
                            </div>

                            <div className="mt-6 text-center">
                                <h4 className="tracking-[0.2em] uppercase text-lg font-black font-massive" style={{ color: theme.colors.accent }}>
                                    {lightbox.caption}
                                </h4>
                                <button 
                                    onClick={() => setLightbox(null)} 
                                    className="mt-4 text-[10px] tracking-widest uppercase transition-colors duration-300 px-6 py-2 rounded-full border"
                                    style={{ color: theme.colors.textMuted, borderColor: `${theme.colors.primary}40` }}
                                    onMouseEnter={(e) => {
                                        e.target.style.color = theme.colors.textTitle;
                                        e.target.style.borderColor = theme.colors.secondary;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.color = theme.colors.textMuted;
                                        e.target.style.borderColor = `${theme.colors.primary}40`;
                                    }}
                                >
                                    ✕ Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
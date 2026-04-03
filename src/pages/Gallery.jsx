import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const galleryItems = [
  { id: 1, src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", caption: "Sur Sangram 2024", span: "md:col-span-2 md:row-span-2" },
  { id: 2, src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80", caption: "Natyam Finals", span: "" },
  { id: 3, src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80", caption: "Opening Ceremony", span: "" },
  { id: 4, src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80", caption: "Rang Bhoomi Art", span: "" },
  { id: 5, src: "https://images.unsplash.com/photo-1429514513361-8a632ff5a71d?w=800&q=80", caption: "Crowd & Lights", span: "md:col-span-2" },
  { id: 6, src: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80", caption: "Abhivyakti Theatre", span: "" },
  { id: 7, src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80", caption: "DJ Night", span: "" },
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <section id="gallery" className="relative py-32 bg-black min-h-screen">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <p style={{ fontFamily: "'Cinzel', serif" }} className="text-[#8B6914] text-xs tracking-[0.5em] uppercase mb-4">✦ Visual Archives ✦</p>
          <h2 style={{ fontFamily: "'Cinzel', serif" }} className="text-5xl md:text-7xl font-black text-white uppercase">The <span className="text-[#C9A84C]">Gallery</span></h2>
          <p style={{ fontFamily: "'IM Fell English', serif" }} className="text-stone-500 mt-5 text-xl italic">Moments frozen in celestial light.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[240px]">
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              layoutId={`img-${item.id}`}
              onClick={() => setLightbox(item)}
              className={`group relative overflow-hidden cursor-pointer border border-white/5 transition-all duration-500 ${item.span}`}
            >
              <img src={item.src} alt={item.caption} className="w-full h-full object-cover sepia-[0.3] group-hover:sepia-0 group-hover:scale-105 transition-all duration-700" />
              
              {/* Gold Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-90" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <span style={{ fontFamily: "'Cinzel', serif" }} className="text-white text-xs tracking-widest uppercase border-b border-[#E8C97A] pb-1">{item.caption}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX COMPONENT */}
      <AnimatePresence>
        {lightbox && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12"
            onClick={() => setLightbox(null)}
          >
            <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
              
              {/* Top Film Strip */}
              <div className="w-full h-8 bg-black flex justify-around items-center border-b border-white/10 mb-4">
                {[...Array(12)].map((_, i) => <div key={i} className="w-4 h-5 bg-stone-900 rounded-sm border border-white/5" />)}
              </div>

              <motion.img 
                layoutId={`img-${lightbox.id}`}
                src={lightbox.src} 
                className="max-h-[70vh] object-contain shadow-[0_0_50px_rgba(201,168,76,0.2)]" 
              />

              {/* Bottom Film Strip */}
              <div className="w-full h-8 bg-black flex justify-around items-center border-t border-white/10 mt-4">
                {[...Array(12)].map((_, i) => <div key={i} className="w-4 h-5 bg-stone-900 rounded-sm border border-white/5" />)}
              </div>

              <div className="mt-6 text-center">
                <h4 style={{ fontFamily: "'Cinzel', serif" }} className="text-[#E8C97A] tracking-widest uppercase">{lightbox.caption}</h4>
                <button onClick={() => setLightbox(null)} className="mt-4 text-stone-500 text-[10px] tracking-widest hover:text-white uppercase">✕ Close Escape</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
const pastEvents = [
    {
        year: "2024",
        title: "Echoes of Eternity",
        description: "A spectacular night of classical music, folk dances, and theatrical performances that left the audience spellbound.",
        tags: ["Music", "Dance", "Theatre"],
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
        highlight: "3,200+ Attendees",
    },
    {
        year: "2023",
        title: "Rang Mahotsav",
        description: "An explosion of colours, rhythms and creativity celebrating the vibrant tapestry of Indian culture across all arts.",
        tags: ["Folk Arts", "Painting", "Drama"],
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
        highlight: "2,800+ Attendees",
    },
    {
        year: "2022",
        title: "Swar Sangam",
        description: "A melodious confluence of classical ragas and modern fusion, blurring the boundary between tradition and contemporary art.",
        tags: ["Classical", "Fusion", "Poetry"],
        image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80",
        highlight: "2,500+ Attendees",
    },
];

export default function PastEvents() {
    return (
        <section id="past-events" className="relative py-32 bg-black overflow-hidden">
            {/* Subtle galaxy texture */}
            <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(251,191,36,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(120,100,255,0.06) 0%, transparent 50%)`,
                }}
            />

            {/* Film grain static overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                    backgroundSize: "150px 150px",
                }}
            />

            <div className="relative max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-24">
                    <p className="text-amber-500/60 text-xs tracking-[0.5em] uppercase mb-4"
                        style={{ fontFamily: "'Courier New', monospace" }}>
                        ✦ The Archives ✦
                    </p>
                    <h2
                        className="text-5xl md:text-7xl font-black text-white"
                        style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 0 60px rgba(251,191,36,0.15)" }}
                    >
                        Past <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                            Editions
                        </span>
                    </h2>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-500/40" />
                        <div className="w-1.5 h-1.5 bg-amber-500/40 rotate-45" />
                        <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-500/40" />
                    </div>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pastEvents.map((event, i) => (
                        <div
                            key={i}
                            className="group relative overflow-hidden border border-stone-800 hover:border-amber-500/40 transition-all duration-500 cursor-pointer"
                            style={{ background: "rgba(10,10,10,0.8)" }}
                        >
                            {/* Image */}
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter grayscale group-hover:grayscale-0"
                                    style={{ filter: "sepia(0.4) grayscale(0.3)" }}
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                                {/* Scanlines on image */}
                                <div className="absolute inset-0 opacity-30 pointer-events-none"
                                    style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 4px)" }} />

                                {/* Year Badge */}
                                <div className="absolute top-4 left-4 px-3 py-1 border border-amber-500/50 bg-black/60">
                                    <span className="text-amber-400 text-xs tracking-[0.3em]"
                                        style={{ fontFamily: "'Courier New', monospace" }}>
                                        {event.year}
                                    </span>
                                </div>

                                {/* Highlight */}
                                <div className="absolute bottom-4 right-4">
                                    <span className="text-stone-400 text-[10px] tracking-widest"
                                        style={{ fontFamily: "'Courier New', monospace" }}>
                                        {event.highlight}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3
                                    className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    {event.title}
                                </h3>
                                <p className="text-stone-500 text-sm leading-relaxed mb-5"
                                    style={{ fontFamily: "'Georgia', serif" }}>
                                    {event.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map((tag) => (
                                        <span key={tag}
                                            className="px-2 py-0.5 border border-stone-700 text-stone-500 text-[9px] tracking-[0.25em] uppercase"
                                            style={{ fontFamily: "'Courier New', monospace" }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom accent line */}
                            <div className="absolute bottom-0 left-0 w-0 h-px bg-amber-400 group-hover:w-full transition-all duration-700" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
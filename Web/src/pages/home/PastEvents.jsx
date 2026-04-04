import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

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
    const { theme } = useTheme();

    return (
        <section id="past-events" className="relative py-32 overflow-hidden" style={{ backgroundColor: "transparent" }}>
            
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-20 blur-[120px]"
                 style={{ background: theme.colors.primary }} />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-10 blur-[150px]"
                 style={{ background: theme.colors.secondary }} />

            {/* Subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                    backgroundSize: "150px 150px",
                }}
            />

            <div className="relative max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24"
                >
                    <p className="text-xs tracking-[0.5em] uppercase mb-4 font-bold font-accent" style={{ color: theme.colors.accent }}>
                        ✦ The Archives ✦
                    </p>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-wider font-massive" style={{ color: theme.colors.textTitle }}>
                        Past{' '}
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
                            Editions
                        </span>
                    </h2>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${theme.colors.primary}60)` }} />
                        <div className="w-2 h-2 rotate-45" style={{ backgroundColor: `${theme.colors.accent}60` }} />
                        <div className="h-px w-20" style={{ background: `linear-gradient(to left, transparent, ${theme.colors.primary}60)` }} />
                    </div>
                </motion.div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pastEvents.map((event, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.6 }}
                            className="group relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer"
                            style={{ 
                                background: theme.colors.surface, 
                                borderColor: `${theme.colors.primary}20`,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = `${theme.colors.secondary}60`}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = `${theme.colors.primary}20`}
                        >
                            {/* Image */}
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0" 
                                     style={{ background: `linear-gradient(to top, ${theme.colors.surface}, ${theme.colors.surface}30, transparent)` }} />

                                {/* Year Badge */}
                                <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full backdrop-blur-md border" 
                                     style={{ background: `${theme.colors.primary}30`, borderColor: `${theme.colors.primary}50` }}>
                                    <span className="text-xs tracking-[0.3em] font-black font-massive" style={{ color: theme.colors.accent }}>
                                        {event.year}
                                    </span>
                                </div>

                                {/* Highlight */}
                                <div className="absolute bottom-4 right-4">
                                    <span className="text-[10px] tracking-widest font-bold font-accent" style={{ color: theme.colors.textMuted }}>
                                        {event.highlight}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-black mb-3 transition-colors duration-300 font-massive"
                                    style={{ color: theme.colors.textTitle }}
                                    onMouseEnter={(e) => e.target.style.color = theme.colors.accent}
                                    onMouseLeave={(e) => e.target.style.color = theme.colors.textTitle}
                                >
                                    {event.title}
                                </h3>
                                <p className="text-sm leading-relaxed mb-5" style={{ color: theme.colors.textMuted }}>
                                    {event.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map((tag) => (
                                        <span key={tag}
                                            className="px-3 py-1 rounded-full text-[9px] tracking-[0.2em] uppercase font-bold border"
                                            style={{ 
                                                borderColor: `${theme.colors.secondary}30`, 
                                                color: theme.colors.textMuted,
                                                background: `${theme.colors.secondary}10`
                                            }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom accent glow line */}
                            <div className="absolute bottom-0 left-0 w-0 h-[2px] group-hover:w-full transition-all duration-700" 
                                 style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` }} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
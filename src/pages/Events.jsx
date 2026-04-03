const events = [
  {
    id: "01",
    category: "Performing Arts",
    title: "Natyam",
    subtitle: "Classical Dance Competition",
    description: "Showcase the grace of Bharatanatyam, Kathak, Kuchipudi, and more on the grand stage. Open to solo and group performances.",
    date: "Day 1 — Evening",
    prize: "₹15,000",
    icon: "🎭",
  },
  {
    id: "02",
    category: "Music",
    title: "Sur Sangram",
    subtitle: "Vocal & Instrumental Battle",
    description: "From soulful classical vocals to electrifying instrumental fusion — let your notes echo through the cosmos.",
    date: "Day 1 — Night",
    prize: "₹12,000",
    icon: "🎵",
  },
  {
    id: "03",
    category: "Visual Arts",
    title: "Rang Bhoomi",
    subtitle: "Live Painting & Street Art",
    description: "A canvas as vast as imagination. Create, express, and astound with colours, strokes, and stories untold.",
    date: "Day 2 — Afternoon",
    prize: "₹8,000",
    icon: "🎨",
  },
  {
    id: "04",
    category: "Literature",
    title: "Kavya Sandhya",
    subtitle: "Poetry & Spoken Word",
    description: "Words that wound, words that heal. An intimate evening of original poetry, storytelling, and spoken word.",
    date: "Day 2 — Evening",
    prize: "₹6,000",
    icon: "📜",
  },
  {
    id: "05",
    category: "Fashion",
    title: "Vogue Vastra",
    subtitle: "Cultural Fashion Show",
    description: "Walk the ramp in ensembles that blend heritage craft with contemporary fashion — a dazzling tribute to Indian textiles.",
    date: "Day 3 — Evening",
    prize: "₹10,000",
    icon: "👘",
  },
  {
    id: "06",
    category: "Theatre",
    title: "Abhivyakti",
    subtitle: "One-Act Play Festival",
    description: "The stage is yours. Craft a world in under 30 minutes — drama, comedy, tragedy, or absurd. All stories welcome.",
    date: "Day 3 — Night",
    prize: "₹20,000",
    icon: "🎬",
  },
];

export default function Events() {
  return (
    <section id="events" className="relative py-32 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #000 0%, #0a0800 50%, #000 100%)" }}>

      {/* Background decorative orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-24">
          <p className="text-amber-500/60 text-xs tracking-[0.5em] uppercase mb-4"
            style={{ fontFamily: "'Courier New', monospace" }}>
            ✦ Programme ✦
          </p>
          <h2 className="text-5xl md:text-7xl font-black text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Events <span className="text-amber-400">&</span> Competitions
          </h2>
          <p className="text-stone-500 mt-6 max-w-xl mx-auto text-sm leading-relaxed"
            style={{ fontFamily: "'Georgia', serif" }}>
            Three days. Six grand stages. Infinite possibilities. Join us and let your talent illuminate the night.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-500/40" />
            <div className="w-1.5 h-1.5 bg-amber-500/40 rotate-45" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-500/40" />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <div
              key={i}
              className="group relative p-8 border border-stone-800/80 hover:border-amber-500/30 transition-all duration-500 overflow-hidden cursor-pointer"
              style={{ background: "rgba(8,8,6,0.9)" }}
            >
              {/* Number Watermark */}
              <span
                className="absolute top-4 right-6 text-6xl font-black text-stone-900 group-hover:text-stone-800 transition-colors select-none"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {event.id}
              </span>

              {/* Icon */}
              <div className="text-4xl mb-5">{event.icon}</div>

              {/* Category */}
              <span className="text-amber-500/60 text-[9px] tracking-[0.4em] uppercase"
                style={{ fontFamily: "'Courier New', monospace" }}>
                {event.category}
              </span>

              {/* Title */}
              <h3
                className="text-2xl font-bold text-white mt-2 mb-1 group-hover:text-amber-300 transition-colors"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {event.title}
              </h3>
              <p className="text-amber-500/50 text-xs tracking-widest uppercase mb-4"
                style={{ fontFamily: "'Courier New', monospace" }}>
                {event.subtitle}
              </p>

              {/* Description */}
              <p className="text-stone-500 text-sm leading-relaxed mb-6"
                style={{ fontFamily: "'Georgia', serif" }}>
                {event.description}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-800">
                <span className="text-stone-600 text-[10px] tracking-widest"
                  style={{ fontFamily: "'Courier New', monospace" }}>
                  {event.date}
                </span>
                <span className="text-amber-400 text-sm font-bold"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {event.prize}
                </span>
              </div>

              {/* Hover accent */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 group-hover:w-full transition-all duration-700" />
              <div className="absolute top-0 right-0 w-0 h-0.5 bg-gradient-to-l from-amber-500/30 to-transparent group-hover:w-full transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
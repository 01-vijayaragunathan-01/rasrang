import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";

/* ── Colour tokens — matches APP_THEME (PastEvents palette) ───── */
const T = {
    purple: "#9D01E9",   // primary
    magenta: "#C53099",   // secondary
    pink: "#E31E6E",   // highlight
    violet: "#7C3AED",   // deep violet
    cyan: "#22D3EE",   // cyan accent
    rose: "#FB7185",   // soft rose
    peach: "#E4BD8D",   // accent/gold
    border: "rgba(157,1,233,0.18)",
    // ── aliases used throughout the file ──
    gold: "#E4BD8D",   // = peach
    amber: "#C084FC",   // light violet accent
    saffron: "#9D01E9",
    white: "#FFFFFF",   // = purple (used for bars / glow-line)
};

/* ── Celebrity / special-guest images for the gallery ────────────
   Replace these with your actual /Assets/celeb(N).jpeg paths.
   The `text` field shows below each card in the gallery.         */
const CELEB_ITEMS = [
    { image: "/Assets/celib/img (1).jpg", text: "DJ Gowtham" },
    { image: "/Assets/celib/img (2).jpg", text: "Benny Dayal" },
    { image: "/Assets/celib/img (3).webp", text: "Kriti Shetty" },
    { image: "/Assets/celib/img (4).png", text: "Pradeep Ranganathan" },
    { image: "/Assets/celib/img (5).jpg", text: "Shweta Mohan" },
    { image: "/Assets/celib/img (6).jpg", text: "SJ surya" },
    { image: "/Assets/celib/img (7).jpg", text: "DJ Deepika" },
];


/* ── Ornament divider ─────────────────────────────────────────── */
function OrnamentLine({ color = T.gold }) {
    return (
        <div className="flex items-center gap-3 w-full max-w-xs mx-auto">
            <div className="flex-1 h-px"
                style={{ background: `linear-gradient(to right, transparent, ${color}60)` }} />
            <svg width="18" height="18" viewBox="0 0 18 18">
                <polygon points="9,1 17,9 9,17 1,9"
                    fill="none" stroke={color} strokeWidth="1" opacity="0.8" />
                <circle cx="9" cy="9" r="2.5" fill={color} opacity="0.9" />
            </svg>
            <div className="flex-1 h-px"
                style={{ background: `linear-gradient(to left, transparent, ${color}60)` }} />
        </div>
    );
}

/* ── Audio pulse bars ─────────────────────────────────────────── */
function AudioBars({ color = T.saffron, count = 7, height = "h-10" }) {
    return (
        <div className={`flex gap-1 items-end ${height}`}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ height: ["20%", "100%", "30%", "80%", "20%"] }}
                    transition={{ repeat: Infinity, duration: 0.9 + i * 0.13, delay: i * 0.11, ease: "easeInOut" }}
                    className="w-1.5 rounded-t-sm"
                    style={{ background: `linear-gradient(to top, ${color}, ${T.gold})` }}
                />
            ))}
        </div>
    );
}

/* ── HUD corners ──────────────────────────────────────────────── */
function HudCorners({ color = T.gold, size = "w-8 h-8", opacity = "opacity-20" }) {
    const cls = `absolute ${size} ${opacity}`;
    const s = { borderColor: color };
    return (<>
        <div className={`${cls} top-6 left-6 border-t-2 border-l-2`} style={s} />
        <div className={`${cls} top-6 right-6 border-t-2 border-r-2`} style={s} />
        <div className={`${cls} bottom-6 left-6 border-b-2 border-l-2`} style={s} />
        <div className={`${cls} bottom-6 right-6 border-b-2 border-r-2`} style={s} />
    </>);
}

/* ── Ticker tape ──────────────────────────────────────────────── */
function TickerTape({ items, speed = 30, reverse = false, color = T.gold, accent = T.magenta }) {
    const doubled = [...items, ...items];
    return (
        <div className="w-full overflow-hidden flex whitespace-nowrap py-4 border-y"
            style={{
                borderColor: `${color}25`,
                background: `linear-gradient(to right, ${T.saffron}08, ${T.magenta}05, ${T.violet}08)`,
                backdropFilter: "blur(8px)",
            }}>
            <motion.div
                animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
                transition={{ repeat: Infinity, duration: speed, ease: "linear" }}
                className="flex items-center gap-10 font-black uppercase tracking-widest text-sm"
                style={{ color, whiteSpace: "nowrap" }}
            >
                {doubled.map((item, i) => (
                    <span key={i} className="flex items-center gap-10">
                        <span>{item}</span>
                        <span style={{ color: accent, fontSize: "10px" }}>✦</span>
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

/* ── Horizontal auto-scroll gallery (PastEvents style) ────────── */
function HorizontalGallery({ items }) {
    const [active, setActive] = useState(null);
    const trackRef = useRef(null);
    const animRef = useRef(null);
    const posRef = useRef(0);
    const pausedRef = useRef(false);
    const totalWRef = useRef(0);

    useEffect(() => {
        // Wait one frame so images start loading and scrollWidth is non-zero
        const raf = requestAnimationFrame(() => {
            const track = trackRef.current;
            if (!track) return;
            // Recalculate on every frame in case images load late
            const step = () => {
                if (trackRef.current) {
                    const half = trackRef.current.scrollWidth / 2;
                    if (half > 0) totalWRef.current = half;
                }
                if (!pausedRef.current && totalWRef.current > 0) {
                    posRef.current += 0.7;
                    if (posRef.current >= totalWRef.current) posRef.current = 0;
                    if (trackRef.current) {
                        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
                    }
                }
                animRef.current = requestAnimationFrame(step);
            };
            animRef.current = requestAnimationFrame(step);
        });
        return () => {
            cancelAnimationFrame(raf);
            cancelAnimationFrame(animRef.current);
        };
    }, []);

    const onEnter = useCallback((el) => {
        pausedRef.current = true;
        el.style.transform = "translateY(-10px) scale(1.03)";
        el.style.boxShadow = `0 25px 50px rgba(227,30,110,0.25)`;
        el.style.borderColor = `rgba(227,30,110,0.5)`;
        const gl = el.querySelector(".glow-line");
        if (gl) gl.style.width = "100%";
    }, []);

    const onLeave = useCallback((el) => {
        pausedRef.current = false;
        el.style.transform = "";
        el.style.boxShadow = "";
        el.style.borderColor = "rgba(228,189,141,0.15)";
        const gl = el.querySelector(".glow-line");
        if (gl) gl.style.width = "0%";
    }, []);

    const doubled = [...items, ...items];

    return (
        <>
            <div className="w-full overflow-hidden py-2">
                <div
                    ref={trackRef}
                    className="flex gap-5"
                    style={{ width: "max-content", willChange: "transform" }}
                >
                    {doubled.map((item, i) => (
                        <div
                            key={i}
                            className="relative flex-shrink-0 overflow-hidden rounded-2xl border cursor-pointer"
                            style={{
                                width: "clamp(220px, 22vw, 300px)",
                                height: "clamp(300px, 36vw, 400px)",
                                background: "rgba(10,10,10,0.5)",
                                borderColor: "rgba(228,189,141,0.15)",
                                backdropFilter: "blur(10px)",
                                transition: "transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
                            }}
                            onMouseEnter={e => onEnter(e.currentTarget)}
                            onMouseLeave={e => onLeave(e.currentTarget)}
                            onClick={() => setActive(item)}
                        >
                            <img
                                src={item.image}
                                alt={item.text || ""}
                                className="w-full h-full object-cover object-center"
                                style={{ transition: "transform 1s ease" }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0" style={{
                                background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)"
                            }} />
                            {/* Label */}
                            {item.text && (
                                <div className="absolute bottom-4 left-4 right-4">
                                    <p style={{
                                        fontFamily: "Rajdhani, sans-serif",
                                        fontSize: "0.72rem",
                                        letterSpacing: "0.22em",
                                        textTransform: "uppercase",
                                        color: T.gold,
                                        fontWeight: 700,
                                    }}>{item.text}</p>
                                </div>
                            )}
                            {/* PastEvents glow-line */}
                            <div className="glow-line absolute bottom-0 left-0 h-[2px]" style={{
                                width: "0%",
                                background: `linear-gradient(90deg, ${T.saffron}, ${T.magenta})`,
                                transition: "width 0.5s ease",
                            }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {active && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-[200] px-4"
                        style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActive(null)}
                    >
                        <motion.div
                            className="relative rounded-2xl overflow-hidden"
                            style={{
                                width: "clamp(240px, 45vw, 400px)",
                                aspectRatio: "9 / 16",
                                maxHeight: "88vh",
                            }}
                            initial={{ scale: 0.88, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.88, opacity: 0, y: 40 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            onClick={e => e.stopPropagation()}
                        >
                            <img src={active.image} alt={active.text || ""}
                                className="w-full h-full object-cover object-center" />
                            <div className="absolute inset-0" style={{
                                background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)"
                            }} />
                            {active.text && (
                                <div className="absolute bottom-6 left-6">
                                    <p style={{
                                        fontFamily: "Cinzel, serif", fontWeight: 700,
                                        fontSize: "1rem", letterSpacing: "0.15em",
                                        background: `linear-gradient(90deg, ${T.gold}, ${T.saffron})`,
                                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                                    }}>{active.text}</p>
                                </div>
                            )}
                            <button
                                onClick={() => setActive(null)}
                                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-lg"
                                style={{ background: "rgba(0,0,0,0.6)", border: `1px solid ${T.gold}40`, color: T.gold }}
                            >×</button>
                            <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                                style={{ background: `linear-gradient(90deg, ${T.saffron}, ${T.magenta}, ${T.cyan})` }} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/* ── CharSplit ────────────────────────────────────────────────── */
function CharSplit({ text, style, gradientStyle, splitType = "chars", delay = 0, staggerMs = 50 }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const spanStyle = { ...style, ...(gradientStyle || {}), display: "inline-block" };

    if (splitType === "words") {
        return (
            <span ref={ref} style={{ display: "block" }}>
                {text.split(" ").map((word, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 44, filter: "blur(10px)" }}
                        animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.9, delay: delay + i * (staggerMs / 1000), ease: [0.22, 1, 0.36, 1] }}
                        style={{ ...spanStyle, marginRight: "0.28em" }}
                    >
                        {word}
                    </motion.span>
                ))}
            </span>
        );
    }

    return (
        <span ref={ref} style={{ display: "block" }}>
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 52, filter: "blur(14px)" }}
                    animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                    transition={{ duration: 0.8, delay: delay + i * (staggerMs / 1000), ease: [0.22, 1, 0.36, 1] }}
                    style={{ ...spanStyle, whiteSpace: char === " " ? "pre" : "normal" }}
                >
                    {char === " " ? "\u00a0" : char}
                </motion.span>
            ))}
        </span>
    );
}

/* ── Scan lines ───────────────────────────────────────────────── */
function ScanLines() {
    return (
        <div className="fixed inset-0 pointer-events-none opacity-[0.025]" style={{ zIndex: 4 }}>
            <div className="absolute inset-0 w-full h-full"
                style={{
                    backgroundImage: "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%)",
                    backgroundSize: "100% 2px",
                }} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function ThankYou() {
    const [phase, setPhase] = useState(0);
    const heroRef = useRef(null);

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
    const heroOpa = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    useEffect(() => {
        const t = setTimeout(() => setPhase(1), 700);
        return () => clearTimeout(t);
    }, []);

    const tickerItems = ["Rasrang 2026", "THANK YOU", "SRM Trichy", "Apr 9 & 10", "Cultural Fest", "The Stage Remembers", "Open to All"];
    const tickerItems2 = ["Every Applause", "A Blessing", "Every Performance", "A Prayer", "The Light Never Fades", "Until We Meet Again"];

    return (
        <div className="relative w-full min-h-screen overflow-x-hidden" style={{ background: "transparent" }}>

            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.24, 0.12] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute"
                    style={{ top: "10%", left: "50%", transform: "translateX(-50%)", width: "700px", height: "400px", background: `radial-gradient(ellipse, rgba(255,107,0,0.22) 0%, transparent 70%)`, filter: "blur(60px)" }}
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08] }}
                    transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute"
                    style={{ bottom: "15%", left: "10%", width: "500px", height: "300px", background: `radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)`, filter: "blur(70px)" }}
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.14, 0.06] }}
                    transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    className="absolute"
                    style={{ bottom: "25%", right: "8%", width: "400px", height: "250px", background: `radial-gradient(ellipse, rgba(227,30,110,0.12) 0%, transparent 70%)`, filter: "blur(55px)" }}
                />
                <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.04, 0.10, 0.04] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 7 }}
                    className="absolute"
                    style={{ top: "5%", right: "5%", width: "300px", height: "200px", background: `radial-gradient(ellipse, rgba(34,211,238,0.10) 0%, transparent 70%)`, filter: "blur(45px)" }}
                />
            </div>

            {/* Film grain */}
            <div className="fixed inset-0 pointer-events-none"
                style={{ zIndex: 2, backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`, backgroundSize: "200px 200px", opacity: 0.04 }} />

            <ScanLines />

            <div className="relative" style={{ zIndex: 5 }}>

                {/* ══ HERO ══════════════════════════════════════════ */}
                <section ref={heroRef} className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 min-h-screen">
                    <HudCorners color={T.gold} opacity="opacity-15" />

                    <AnimatePresence>
                        {phase === 1 && (
                            <motion.div
                                className="flex flex-col items-center gap-6 max-w-4xl mx-auto"
                                style={{ y: heroY, opacity: heroOpa }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Edition badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: -24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full"
                                    style={{ background: `${T.gold}10`, border: `1px solid ${T.gold}35`, backdropFilter: "blur(14px)" }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                                        style={{ background: T.saffron, boxShadow: `0 0 8px ${T.saffron}` }} />
                                    <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.62rem", letterSpacing: "0.5em", textTransform: "uppercase", color: T.gold }}>
                                        Rasrang 2026 &nbsp;·&nbsp; Apr 9 &amp; 10 &nbsp;·&nbsp; SRM Trichy
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                                        style={{ background: T.magenta, boxShadow: `0 0 8px ${T.magenta}` }} />
                                </motion.div>

                                {/* Logo */}
                                <motion.img
                                    src="/Assets/rasrang.png"
                                    alt="Rasrang"
                                    initial={{ opacity: 0, scale: 0.72 }}
                                    animate={{
                                        opacity: 1, scale: 1,
                                        filter: [
                                            `drop-shadow(0 0 18px rgba(228,189,141,0.4)) drop-shadow(0 0 50px rgba(255,107,0,0.15))`,
                                            `drop-shadow(0 0 36px rgba(228,189,141,0.7)) drop-shadow(0 0 80px rgba(227,30,110,0.25))`,
                                            `drop-shadow(0 0 18px rgba(228,189,141,0.4)) drop-shadow(0 0 50px rgba(255,107,0,0.15))`,
                                        ]
                                    }}
                                    transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1], filter: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                                    style={{ height: "clamp(72px, 13vw, 110px)", objectFit: "contain" }}
                                />

                                {/* Divider */}
                                <motion.div
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="w-full"
                                >
                                    <OrnamentLine color={T.gold} />
                                </motion.div>

                                {/* ── THANK YOU heading — Great Vibes script + purple→pink gradient ── */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 52, filter: "blur(14px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    transition={{ duration: 1.1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                    style={{
                                        fontFamily: "'Great Vibes', cursive",
                                        fontSize: "clamp(4rem, 14vw, 10rem)",
                                        fontWeight: 400,
                                        lineHeight: 1.1,
                                        letterSpacing: "0.02em",
                                        background: `linear-gradient(90deg,
                                            ${T.purple} 0%,
                                            ${T.magenta} 50%,
                                            ${T.pink} 100%)`,
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        filter: "drop-shadow(0 0 60px rgba(157,1,233,0.45))",
                                    }}
                                >
                                    Thank You
                                </motion.h1>

                                {/* Audio bars + subtitle */}
                                <motion.div
                                    className="flex items-center justify-center gap-5"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.9, delay: 0.9 }}
                                >
                                    <AudioBars color={T.saffron} count={6} height="h-8" />
                                    <p style={{
                                        fontFamily: "Cormorant Garamond, serif",
                                        fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                                        fontStyle: "italic",
                                        background: `linear-gradient(90deg, ${T.amber}, ${T.rose}, ${T.cyan})`,
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        letterSpacing: "0.05em",
                                    }}>
                                        for making Rasrang 2026 unforgettable
                                    </p>
                                    <AudioBars color={T.magenta} count={6} height="h-8" />
                                </motion.div>

                                {/* Sub-line */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1, delay: 1.1 }}
                                    style={{
                                        fontFamily: "Cormorant Garamond, serif",
                                        fontStyle: "italic",
                                        fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                                        background: `linear-gradient(90deg, ${T.cyan}, ${T.gold})`,
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        letterSpacing: "0.04em",
                                    }}
                                >
                                    in the story of SRM Trichy
                                </motion.p>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1, delay: 1.3 }}
                                    style={{
                                        fontFamily: "Cormorant Garamond, serif",
                                        fontStyle: "italic",
                                        fontSize: "clamp(0.99rem, 2.1vw, 1.25rem)",
                                        background: `linear-gradient(90deg, ${T.white}88)`, WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        letterSpacing: "0.03em",
                                        lineHeight: 1.8,
                                    }}
                                >
                                    April 9 &amp; 10 will forever be etched in our memory —
                                    two days of raw talent, electric energy, and cultural brilliance that proved
                                    art needs no price tag, only an open heart.
                                </motion.p>

                                {/* Scroll cue */}
                                <motion.div
                                    className="flex flex-col items-center gap-2 mt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.9 }}
                                >
                                    <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "7px", letterSpacing: "1em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
                                        scroll
                                    </span>
                                    <motion.div
                                        animate={{ y: [0, 10, 0], opacity: [0.2, 0.7, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-px h-10 rounded-full"
                                        style={{ background: `linear-gradient(to bottom, ${T.saffron}, ${T.magenta}, transparent)` }}
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* ══ PHOTO GALLERY ══════════════════════════════════ */}
                <section className="relative py-16 overflow-hidden">

                    {/* Background glow */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse 70% 50% at 50% 50%, rgba(157,1,233,0.06) 0%, transparent 70%)` }} />

                    {/* Section header */}
                    <motion.div
                        className="text-center mb-12 px-6"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <p className="text-xs tracking-[0.5em] uppercase mb-3"
                            style={{ fontFamily: "Rajdhani, sans-serif", color: `${T.purple}90` }}>
                            ✦ On The Stage ✦
                        </p>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            background: `linear-gradient(90deg, ${T.purple} 0%, ${T.magenta} 50%, ${T.pink} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            letterSpacing: "0.08em",
                        }}>
                            Faces of Rasrang 2026
                        </h2>
                        <p className="mt-3 text-xs tracking-widest uppercase"
                            style={{ fontFamily: "Rajdhani, sans-serif", color: "rgba(255,255,255,0.25)" }}>
                            Hover to preview · Click to enlarge
                        </p>
                        <div className="mt-5">
                            <OrnamentLine color={T.purple} />
                        </div>
                    </motion.div>

                    {/* ── Ticker Tape above gallery ── */}
                    <div className="-rotate-1 scale-105 origin-center mb-4">
                        <TickerTape items={tickerItems} speed={28} color={T.gold} accent={T.magenta} />
                    </div>

                    {/* Auto-scroll horizontal gallery */}
                    <HorizontalGallery items={CELEB_ITEMS} />

                    {/* ── Ticker Tape below gallery ── */}
                    <div className="rotate-1 scale-105 origin-center mt-4">
                        <TickerTape items={tickerItems2} speed={22} reverse color={T.magenta} accent={T.purple} />
                    </div>
                </section>


                {/* ══ CLOSING SECTION ═══════════════════════════════ */}
                <section className="relative py-24 px-6">
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,107,0,0.06) 0%, rgba(124,58,237,0.04) 60%, transparent 100%)` }} />

                    <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-10">

                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="w-full"
                        >
                            <OrnamentLine color={T.magenta} />
                        </motion.div>

                        {/* ── UNTIL WE MEET AGAIN — PastEvents purple→pink gradient ── */}
                        <h2 style={{ lineHeight: 1.1, filter: `drop-shadow(0 0 40px rgba(157,1,233,0.35))` }}>
                            <CharSplit
                                text="UNTIL WE MEET AGAIN"
                                splitType="words"
                                delay={0.2}
                                staggerMs={110}
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: "clamp(1.8rem, 5.5vw, 3.8rem)",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    lineHeight: 1.1,
                                    letterSpacing: "0.05em",
                                }}
                                gradientStyle={{
                                    background: `linear-gradient(90deg,
                                        ${T.purple} 0%,
                                        ${T.magenta} 50%,
                                        ${T.pink} 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            />
                        </h2>

                        {/* Closing quote */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <p style={{
                                fontFamily: "Cormorant Garamond, serif",
                                fontStyle: "italic",
                                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                                background: `linear-gradient(90deg, ${T.white}88)`, WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                lineHeight: 1.8,
                                letterSpacing: "0.04em",
                            }}>
                                Every performance was a prayer. Every applause, a blessing.
                                The stage may be dark now — but the light you brought to it will never fade.
                            </p>
                        </motion.div>

                        {/* Copyright */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1 }}
                            style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.58rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}
                        >
                            © Rasrang 2026 &nbsp;·&nbsp; SRM Institute of Science and Technology, Trichy &nbsp;·&nbsp; All Rights Reserved
                        </motion.p>
                    </div>
                </section>



            </div>

            {/* Curtain intro */}
            <AnimatePresence>
                {phase === 0 && (
                    <motion.div
                        className="fixed inset-0"
                        style={{ zIndex: 100, background: "#000010" }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.1, ease: "easeInOut" }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
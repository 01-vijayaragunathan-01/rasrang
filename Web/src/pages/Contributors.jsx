import { useState, useMemo, useRef } from "react";
import {
    motion, AnimatePresence,
    useMotionValue, useTransform,
    useScroll, useTransform as useScrollTransform
} from "framer-motion";
import DomeGallery from "../common/Dome";

// ── Design tokens ─────────────────────────────────────────────
const T = {
    gold: "#E4BD8D",
    saffron: "#FF6B00",
    magenta: "#E31E6E",
    cyan: "#22D3EE",
    violet: "#7C3AED",
    border: "rgba(228,189,141,0.15)",
};

const TEAM_META = {
    // developers  : { color: T.gold,    icon: "✦", label: "backend"     },
    developers: { color: T.saffron, icon: "⚡", label: "Developers" },
};

// ── Dome images — all 39 local photos (/Assets/(1).jpeg … (39).jpeg)
// const DOME_IMAGES = Array.from({ length: 39 }, (_, i) => ({
//     src: '/Assets/(1).jpeg',
//     alt: `Member ${i + 1}`,
// }));

const DOME_IMAGES = [
    { src: '/Assets/(1).jpeg', alt: 'Member 1' },
    { src: '/Assets/(2).jpeg', alt: 'Member 2' },
    { src: '/Assets/(3).jpeg', alt: 'Member 3' },
    { src: '/Assets/(4).jpeg', alt: 'Member 4' },
    { src: '/Assets/(5).jpeg', alt: 'Member 5' },
    { src: '/Assets/(6).jpeg', alt: 'Member 6' },
    { src: '/Assets/(7).jpeg', alt: 'Member 7' },
    { src: '/Assets/(8).jpeg', alt: 'Member 8' },
    { src: '/Assets/(9).jpeg', alt: 'Member 9' },
    { src: '/Assets/(10).jpeg', alt: 'Member 10' },
    { src: '/Assets/(11).jpeg', alt: 'Member 11' },
    { src: '/Assets/(12).jpeg', alt: 'Member 12' },
    { src: '/Assets/(13).jpeg', alt: 'Member 13' },
    { src: '/Assets/(14).jpeg', alt: 'Member 14' },
    { src: '/Assets/(15).jpeg', alt: 'Member 30' },
    { src: '/Assets/(16).jpeg', alt: 'Member 16' },
    { src: '/Assets/(17).jpeg', alt: 'Member 17' },
    { src: '/Assets/(18).jpeg', alt: 'Member 18' },
    { src: '/Assets/(19).jpeg', alt: 'Member 19' },
    { src: '/Assets/(30).jpeg', alt: 'Member 20' },
    { src: '/Assets/(21).jpeg', alt: 'Member 21' },
    { src: '/Assets/(22).jpeg', alt: 'Member 22' },
    { src: '/Assets/(23).jpeg', alt: 'Member 23' },
    { src: '/Assets/(24).jpeg', alt: 'Member 24' },
    { src: '/Assets/(25).jpeg', alt: 'Member 25' },
    { src: '/Assets/(26).jpeg', alt: 'Member 26' },
    { src: '/Assets/(27).jpeg', alt: 'Member 27' },
    { src: '/Assets/(28).jpeg', alt: 'Member 28' },
    { src: '/Assets/(29).jpeg', alt: 'Member 29' },
    { src: '/Assets/(20).jpeg', alt: 'Member 15' },
    { src: '/Assets/(31).jpeg', alt: 'Member 31' },
    { src: '/Assets/(32).jpeg', alt: 'Member 32' },
    { src: '/Assets/(33).jpeg', alt: 'Member 33' },
    { src: '/Assets/(34).jpeg', alt: 'Member 34' },
    { src: '/Assets/(35).jpeg', alt: 'Member 35' },
    { src: '/Assets/(36).jpeg', alt: 'Member 36' },
    { src: '/Assets/(37).jpeg', alt: 'Member 37' },
    { src: '/Assets/(38).jpeg', alt: 'Member 38' },
    { src: '/Assets/(39).jpeg', alt: 'Member 39' },
];


// ── "Meet the Collective" — only 4 featured cards ─────────────
// Replace name/role/team/image with your actual featured members.
// image points to /Assets/(N).jpeg  OR  any URL you prefer.
const FEATURED = [
    {
        id: 1,
        name: "Vijayaragunathan",
        role: "RA2311003050321",
        team: "developers",
        image: "/Assets/vijay.jpeg",
    },
    {
        id: 2,
        name: "Jafrin sam",
        role: "RA2311030050016",
        team: "developers",
        image: "/Assets/jafrin.jpeg",
    },

];

// ── Ornament divider ──────────────────────────────────────────
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

// ── Stat chip ─────────────────────────────────────────────────
function StatChip({ value, label, color, delay = 0, last = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-1 px-5 py-4"
            style={{ borderRight: last ? "none" : `1px solid ${T.border}` }}
        >
            <span className="text-2xl md:text-3xl font-black"
                style={{
                    color, fontFamily: "Cinzel, serif",
                    textShadow: `0 0 20px ${color}60`
                }}>
                {value}
            </span>
            <span className="text-[9px] tracking-[0.3em] uppercase"
                style={{
                    color: "rgba(255,255,255,0.35)",
                    fontFamily: "Rajdhani, sans-serif"
                }}>
                {label}
            </span>
        </motion.div>
    );
}

// ── Featured member card (used in "Meet the Collective") ───────
function FeaturedCard({ person, index }) {
    const meta = TEAM_META[person.team];
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rotateX = useTransform(my, [-80, 80], [12, -12]);
    const rotateY = useTransform(mx, [-80, 80], [-12, 12]);
    const glareX = useTransform(mx, [-80, 80], ["-60%", "160%"]);
    const glareY = useTransform(my, [-80, 80], ["-60%", "160%"]);

    function onMove(e) {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left - r.width / 2);
        my.set(e.clientY - r.top - r.height / 2);
    }
    function onLeave() { mx.set(0); my.set(0); }

    const cardStyle = {
        rotateX,
        rotateY,
        background: "rgba(15,8,30,0.4)", // Transparency without shadow depth
        border: `1px solid ${meta.color}20`,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
                duration: 0.6, delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1]
            }}
            className="perspective-[900px]"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
        >
            <motion.div
                style={cardStyle}
                className="relative rounded-2xl overflow-hidden group cursor-pointer"
            // REMOVED: whileHover shadow block was here
            >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: "280px" }}>
                    <img
                        src={person.image}
                        alt={person.name}
                        draggable={false}
                        className="w-full h-full object-cover object-top
                                   transition-all duration-700
                                   group-hover:scale-110
                                   saturate-75 brightness-90
                                   group-hover:saturate-100 group-hover:brightness-100"
                    />

                    {/* REMOVED: The absolute inset-0 gradient div was here */}

                    {/* Team badge */}
                    <div className="absolute top-4 left-4 flex items-center
                                    gap-1.5 px-3 py-1 rounded-full backdrop-blur-md"
                        style={{
                            background: `${meta.color}18`,
                            border: `1px solid ${meta.color}45`
                        }}>
                        <span style={{ color: meta.color, fontSize: "10px" }}>
                            {meta.icon}
                        </span>
                        <span className="text-[9px] tracking-[0.25em]
                                          uppercase font-bold"
                            style={{
                                color: meta.color,
                                fontFamily: "Rajdhani, sans-serif"
                            }}>
                            {meta.label}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="px-6 py-5">
                    <h3 className="text-lg font-bold text-white tracking-wide mb-1"
                        style={{ fontFamily: "Cinzel, serif" }}>
                        {person.name}
                    </h3>
                    <p className="text-[11px] tracking-[0.25em] uppercase"
                        style={{
                            color: `${meta.color}90`,
                            fontFamily: "Rajdhani, sans-serif"
                        }}>
                        {person.role}
                    </p>
                </div>

                {/* Holographic glare - kept this as it is a light effect, not a shadow */}
                <motion.div
                    className="absolute inset-0 pointer-events-none
                               opacity-0 group-hover:opacity-100
                               transition-opacity duration-300"
                    style={{
                        background: `linear-gradient(105deg,
                            transparent 20%, ${meta.color}28 40%, transparent 60%)`,
                        x: glareX,
                        y: glareY,
                        mixBlendMode: "screen",
                    }}
                />

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0
                                group-hover:w-full rounded-full"
                    style={{
                        background:
                            `linear-gradient(90deg, ${meta.color}, ${T.magenta})`,
                        transition: "width 600ms ease",
                    }} />
            </motion.div>
        </motion.div>
    );
}

// ── Main page ─────────────────────────────────────────────────
export default function Contributors() {
    const heroRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const heroY = useScrollTransform(scrollYProgress, [0, 1], [0, 80]);
    const heroOpa = useScrollTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <div className="relative w-full bg-transparent overflow-x-hidden">

            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px]
                                rounded-full blur-[180px]"
                    style={{ background: `${T.violet}14` }} />
                <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px]
                                rounded-full blur-[160px]"
                    style={{ background: `${T.magenta}0d` }} />
                <div className="absolute top-2/3 left-1/4 w-[400px] h-[400px]
                                rounded-full blur-[140px]"
                    style={{ background: `${T.cyan}0a` }} />
            </div>

            {/* ═══ SECTION 1 — HERO ════════════════════════════════ */}
            <section ref={heroRef}
                className="relative z-10 pt-32 pb-16 text-center px-6">
                <motion.div style={{ y: heroY, opacity: heroOpa }}>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-3 mb-8
                                   px-5 py-2.5 rounded-full"
                        style={{
                            background: `${T.gold}12`,
                            border: `1px solid ${T.gold}35`,
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{
                                background: T.saffron,
                                boxShadow: `0 0 8px ${T.saffron}`
                            }} />
                        <span className="text-[10px] tracking-[0.45em]
                                         uppercase font-bold"
                            style={{
                                color: T.gold,
                                fontFamily: "Rajdhani, sans-serif"
                            }}>
                            Rasrang 2026 · The Makers
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.15 }}
                        className="font-black uppercase leading-[0.9]
                                   tracking-tight mb-6"
                        style={{
                            fontFamily: "Cinzel, serif",
                            fontSize: "clamp(2.8rem, 9vw, 7.5rem)",
                            color: "rgba(255,255,255,0.95)",
                        }}
                    >
                        The Hall{" "}
                        <span style={{
                            backgroundImage:
                                `linear-gradient(135deg,
                                    ${T.gold} 0%, ${T.saffron} 40%, ${T.magenta} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}>
                            of Stars
                        </span>
                    </motion.h1>


                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.45 }}
                        className="text-lg max-w-xl mx-auto leading-relaxed mb-10"
                        style={{
                            color: "rgba(255,255,255,0.4)",
                            fontFamily: "Rajdhani, sans-serif",
                            letterSpacing: "0.1em"
                        }}
                    >
                        The stars have aligned over SRM Trichy. The only question remains: Are you brave enough to step into the light?                    </motion.p>

                    <OrnamentLine color={T.gold} />
                </motion.div>
            </section>

            {/* ═══ SECTION 2 — DOME (all 39 photos) ═══════════════ */}
            <section className="relative z-10 w-full">

                <div className="text-center mb-4 px-6">
                    <p className="text-[10px] tracking-[0.5em] uppercase mb-1"
                        style={{
                            color: `${T.gold}65`,
                            fontFamily: "Rajdhani, sans-serif"
                        }}>
                        ✦ Our Entire Team ✦
                    </p>
                    <p className="text-[9px] tracking-[0.3em] uppercase"
                        style={{
                            color: "rgba(255,255,255,0.25)",
                            fontFamily: "Rajdhani, sans-serif"
                        }}>
                        Drag to rotate · Click any face to enlarge
                    </p>
                </div>

                {/* Dome container */}
                <div className="relative w-full"
                    style={{ height: "clamp(520px, 72vh, 820px)" }}>

                    <div className="absolute inset-x-0 top-0 h-20 z-20
                                    pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(to bottom, #000, transparent)"
                        }} />
                    <div className="absolute inset-x-0 bottom-0 h-28 z-20
                                    pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(to top, #000, transparent)"
                        }} />

                    <DomeGallery
                        images={DOME_IMAGES}
                        fit={0.75}
                        grayscale={false}
                        overlayBlurColor="rgba(0,0,0,0)"
                        imageBorderRadius="14px"
                        openedImageBorderRadius="20px"
                        openedImageWidth="460px"
                        openedImageHeight="640px"
                        dragSensitivity={18}
                        dragDampening={1.8}
                        segments={22}
                    />
                </div>
            </section>

            {/* ═══ SECTION 3 — MEET THE COLLECTIVE (4 featured) ═══ */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-6xl mx-auto">

                    <div className="text-center mb-16">
                        <OrnamentLine color={T.gold} />
                        <h2 className="mt-8 text-3xl md:text-5xl font-black
                                       uppercase tracking-widest"
                            style={{
                                fontFamily: "Cinzel, serif",
                                color: "rgba(255,255,255,0.9)"
                            }}>
                            Meet the{" "}
                            <span style={{
                                backgroundImage:
                                    `linear-gradient(90deg, ${T.cyan}, ${T.magenta})`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>
                                Collective
                            </span>
                        </h2>
                        <p className="mt-4 text-sm tracking-widest uppercase"
                            style={{
                                color: "rgba(255,255,255,0.28)",
                                fontFamily: "Rajdhani, sans-serif"
                            }}>
                            The faces behind the festival · Rasrang 2026
                        </p>
                    </div>

                    {/* 4 featured cards — 2-col on mobile, 4-col on desktop */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
                        {FEATURED.map((person, i) => (
                            <FeaturedCard key={person.id} person={person} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 4 — QUOTE ════════════════════════════════ */}
            <section className="relative z-10 py-24 text-center px-6">
                <div className="max-w-3xl mx-auto">
                    <OrnamentLine color={T.magenta} />
                    <motion.blockquote
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="mt-12 text-2xl md:text-3xl leading-relaxed
                                   font-light italic"
                        style={{
                            fontFamily: "Cormorant Garamond, serif",
                            color: "rgba(255,255,255,0.6)"
                        }}
                    >
                        "Behind every light on stage, there is someone who stayed
                        up all night making sure it shone."
                    </motion.blockquote>
                    <p className="mt-6 text-[10px] tracking-[0.4em] uppercase"
                        style={{
                            color: `${T.gold}45`,
                            fontFamily: "Rajdhani, sans-serif"
                        }}>
                        — The Rasrang Spirit
                    </p>
                </div>
            </section>

        </div>
    );
}
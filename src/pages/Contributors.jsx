import { useState, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import ProfileCard from "../common/ProfileCard"; // <-- IMPORT YOUR NEW CARD HERE

// --- ORGANIC SCATTER MOCK DATA ---
const CONTRIBUTORS = [
    // CORE TEAM (Peach - #E4BD8D)
    { id: 1, name: "Aarav Sharma", role: "Festival Director", team: "Core", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop", top: "20%", left: "50%" },
    { id: 2, name: "Priya Patel", role: "Head of Operations", team: "Core", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop", top: "35%", left: "45%" },
    { id: 3, name: "Rohan Gupta", role: "Finance Lead", team: "Core", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=300&auto=format&fit=crop", top: "25%", left: "60%" },

    // CULTURAL TEAM (Cyan - #22D3EE)
    { id: 8, name: "Arjun Iyer", role: "Dance Coordinator", team: "Cultural", image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300&auto=format&fit=crop", top: "25%", left: "15%" },
    { id: 9, name: "Sanya Kapoor", role: "Music Lead", team: "Cultural", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop", top: "40%", left: "25%" },
    { id: 10, name: "Rahul Nair", role: "Stage Manager", team: "Cultural", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop", top: "15%", left: "30%" },

    // DESIGN TEAM (Pink - #C53099)
    { id: 11, name: "Tara Menon", role: "Creative Director", team: "Design", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop", top: "60%", left: "80%" },
    { id: 12, name: "Karan Johar", role: "3D Artist", team: "Design", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop", top: "75%", left: "70%" },
    { id: 13, name: "Meera Das", role: "Visual Effects", team: "Design", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=300&auto=format&fit=crop", top: "85%", left: "85%" },
    { id: 14, name: "Dev Patel", role: "Motion Graphics", team: "Design", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop", top: "50%", left: "65%" },
];

// DEDICATED TECH TEAM DATA
const TECH_TEAM = [
    { id: 4, name: "Kabir Singh", role: "Lead Full-Stack Developer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop", github: "#", linkedin: "#" },
    { id: 5, name: "Ananya Desai", role: "UI/UX & Frontend Design", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop", github: "#", linkedin: "#" },
    { id: 6, name: "Vikram Reddy", role: "Cloud & Backend Architect", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop", github: "#", linkedin: "#" },
    { id: 7, name: "Neha Verma", role: "Security & DevOps", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop", github: "#", linkedin: "#" },
];

const TEAMS = ["All", "Core", "Cultural", "Design"];

const TEAM_COLORS = {
    "Core": "#E4BD8D",
    "Cultural": "#22D3EE",
    "Design": "#C53099",
    "Tech": "#9D01E9"
};

// === SUB-COMPONENTS ===

// 1. The Floating Avatar Node (Replaces the tiny dot)
function AvatarNode({ data, isActive, onSelect }) {
    const floatDelay = useMemo(() => Math.random() * 2, []);
    const color = TEAM_COLORS[data.team];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: isActive ? 1 : 0.15,
                scale: isActive ? 1 : 0.7,
                y: [0, -15, 0]
            }}
            transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: floatDelay }
            }}
            className="absolute z-10 group"
            style={{ top: data.top, left: data.left }}
        >
            <div
                onClick={() => onSelect(data)}
                className="w-16 h-16 md:w-20 md:h-20 -ml-8 -mt-8 cursor-pointer relative flex items-center justify-center"
            >
                {/* Glowing Avatar Border */}
                <div
                    className="absolute inset-0 rounded-full border-2 transition-transform duration-300 group-hover:scale-110"
                    style={{ borderColor: color, boxShadow: `0 0 20px ${color}80` }}
                >
                    {/* The Image */}
                    <img
                        src={data.image}
                        alt={data.name}
                        className="w-full h-full object-cover rounded-full p-1"
                    />
                </div>

                {/* The Tooltip (Glassmorphism Nameplate) */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:translate-y-1 z-20">
                    <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg whitespace-nowrap shadow-xl flex flex-col items-center">
                        <p className="text-xs font-black uppercase tracking-widest text-[#F8FAFC]">{data.name}</p>
                        <p className="text-[9px] uppercase tracking-widest" style={{ color }}>{data.role}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// 2. The Holographic VIP Pass Popup
function ProfilePopup({ data, onClose }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-200, 200], [15, -15]);
    const rotateY = useTransform(x, [-200, 200], [-15, 15]);
    const glareX = useTransform(x, [-200, 200], ["-100%", "200%"]);
    const glareY = useTransform(y, [-200, 200], ["-100%", "200%"]);
    const color = TEAM_COLORS[data.team] || TEAM_COLORS["Tech"];

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

            <motion.div
                initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
                className="relative perspective-1000 z-10 w-full max-w-[350px]"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    x.set(e.clientX - rect.left - rect.width / 2);
                    y.set(e.clientY - rect.top - rect.height / 2);
                }}
                onMouseLeave={() => { x.set(0); y.set(0); }}
            >
                <motion.div
                    style={{ rotateX, rotateY }}
                    className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/20 shadow-2xl"
                >
                    <div className="absolute inset-0 w-full h-full">
                        <img src={data.image} alt={data.name} className="w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
                    </div>

                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <span className="text-[10px] uppercase font-black tracking-[0.3em] px-3 py-1 rounded-full border border-white/20 w-fit mb-3" style={{ color, backgroundColor: `${color}20` }}>
                            {data.team || "Tech Core"}
                        </span>
                        <h3 className="text-3xl font-black text-white uppercase tracking-wide leading-none mb-1">
                            {data.name}
                        </h3>
                        <p className="text-xs uppercase tracking-widest text-[#F8FAFC]/60 mb-6">
                            {data.role}
                        </p>

                        <div className="flex gap-4">
                            <button className="flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-105" style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}50` }}>
                                Connect
                            </button>
                            <button onClick={onClose} className="px-4 py-3 rounded-lg border border-white/20 text-[#F8FAFC] hover:bg-white/10 transition-colors">
                                ✕
                            </button>
                        </div>
                    </div>

                    <motion.div
                        className="absolute inset-0 z-20 pointer-events-none mix-blend-color-dodge opacity-60"
                        style={{ background: `linear-gradient(105deg, transparent 20%, ${color} 25%, #22D3EE 50%, transparent 55%)`, backgroundSize: "200% 200%", x: glareX, y: glareY }}
                    />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// === MAIN PAGE COMPONENT ===

export default function Contributors() {
    const { theme } = useTheme();
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedUser, setSelectedUser] = useState(null);

    return (
        <section className="relative w-full min-h-screen bg-transparent flex flex-col">

            {/* Background Ambient Glows */}
            <div className="fixed top-1/4 left-1/4 w-[600px] h-[600px] bg-[#9D01E9]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#22D3EE]/10 blur-[150px] rounded-full pointer-events-none -z-10" />

            {/* --- PART 1: THE FESTIVAL CONSTELLATIONS --- */}
            <div className="pt-24 md:pt-32 pb-12 w-full max-w-[1600px] mx-auto flex flex-col">
                <div className="relative z-20 text-center px-6 mb-8 md:mb-16">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-widest text-white mb-4 drop-shadow-[0_0_30px_rgba(157,1,233,0.3)]">
                        The Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9D01E9] to-[#C53099]">Stars</span>
                    </h1>
                    <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-[#AF94D2]">
                        Hover or click a star to reveal the talent behind the festival.
                    </p>
                </div>

                <div className="relative z-30 flex justify-start md:justify-center overflow-x-auto hide-scrollbar gap-2 md:gap-4 px-6 mb-8">
                    {TEAMS.map(team => (
                        <button
                            key={team}
                            onClick={() => setActiveFilter(team)}
                            className={`relative px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 border
                                ${activeFilter === team
                                    ? 'bg-[#F8FAFC] text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                                    : 'bg-[#0A0A0A]/50 backdrop-blur-md text-[#F8FAFC]/70 border-white/10 hover:border-white/30 hover:text-white'}`}
                        >
                            {team}
                        </button>
                    ))}
                </div>

                {/* Interactive Canvas Area */}
                <div className="relative flex-grow w-full min-h-[500px] md:min-h-[600px]">
                    <AnimatePresence>
                        {activeFilter !== "All" && (
                            <motion.svg
                                initial={{ opacity: 0, pathLength: 0 }}
                                animate={{ opacity: 0.5, pathLength: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute inset-0 w-full h-full pointer-events-none z-0 drop-shadow-[0_0_15px_currentColor]"
                                style={{ color: TEAM_COLORS[activeFilter] }}
                            >
                                <path d="M 100 200 C 300 100, 600 500, 1000 300 S 1400 100, 1600 400" fill="transparent" stroke="currentColor" strokeWidth="2" strokeDasharray="5 10" />
                            </motion.svg>
                        )}
                    </AnimatePresence>

                    {CONTRIBUTORS.map(contributor => {
                        const isActive = activeFilter === "All" || activeFilter === contributor.team;
                        return (
                            <AvatarNode key={contributor.id} data={contributor} isActive={isActive} onSelect={setSelectedUser} />
                        );
                    })}
                </div>
            </div>

            {/* --- PART 2: THE TECH CORE (Upgraded with React Bits ProfileCard) --- */}
            <div className="w-full bg-[#000000]/80 backdrop-blur-xl border-t border-white/10 py-24 relative z-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-[10px] uppercase font-black tracking-[0.4em] text-[#9D01E9] mb-4 block">System Architecture</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white">
                            The Tech Core
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#9D01E9] to-[#22D3EE] mx-auto mt-6" />
                    </div>

                    {/* UPGRADED GRID FOR THE 3D PROFILE CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 place-items-center">
                        {TECH_TEAM.map((member, index) => (
                            <div key={member.id} className="w-full max-w-[320px]">
                                <ProfileCard
                                    name={member.name}
                                    title={member.role}
                                    handle={`rasrang_tech_${index + 1}`}
                                    status="System Online"
                                    contactText="View GitHub"
                                    avatarUrl={member.image}
                                    showUserInfo={true}
                                    enableTilt={true}
                                    enableMobileTilt={true}
                                    onContactClick={() => window.open(member.github, '_blank')}
                                    // Customizing the glow based on the RasRang Theme
                                    behindGlowColor={index % 2 === 0 ? "rgba(157, 1, 233, 0.5)" : "rgba(34, 211, 238, 0.5)"}
                                    behindGlowEnabled={true}
                                    innerGradient="linear-gradient(145deg, rgba(30,27,75,0.8) 0%, rgba(157,1,233,0.2) 100%)"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* POPUP OVERLAY */}
            <AnimatePresence>
                {selectedUser && (
                    <ProfilePopup data={selectedUser} onClose={() => setSelectedUser(null)} />
                )}
            </AnimatePresence>

        </section>
    );
}

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import ProfileCard from "../common/ProfileCard";

// ==========================================
// 1. DYNAMIC CLUSTERING & DATA GENERATION
// ==========================================

const TEAMS = ["All", "Core", "Tech", "Cultural", "Design"];

const TEAM_COLORS = {
    "Core": "#E4BD8D",     // Peach (Main Team)
    "Tech": "#9D01E9",     // Purple
    "Cultural": "#22D3EE", // Cyan
    "Design": "#C53099"    // Pink
};

// Adjusted Anchors to give them plenty of room to grow downwards
const TEAM_ANCHORS = {
    "Core": { top: 25, left: 50 },      // Top Center (Main Team)
    "Cultural": { top: 55, left: 25 },  // Middle Left
    "Tech": { top: 55, left: 75 },      // Middle Right
    "Design": { top: 85, left: 50 }     // Bottom Center
};

// Helper lists
const firstNames = ["Aarav", "Priya", "Rohan", "Sanya", "Kabir", "Neha", "Vikram", "Tara", "Arjun", "Meera", "Dev", "Karan", "Aditi", "Ishaan", "Riya"];
const lastNames = ["Sharma", "Patel", "Gupta", "Kapoor", "Singh", "Verma", "Reddy", "Menon", "Iyer", "Das", "Johar", "Nair", "Desai", "Bose"];
const roles = {
    "Core": ["Festival Director", "Operations", "Finance Lead", "Logistics", "Sponsor Rep"],
    "Tech": ["Lead Full-Stack", "Backend Eng", "UI/UX Designer", "DevOps", "SysAdmin"],
    "Cultural": ["Dance Coordinator", "Music Lead", "Stage Manager", "Emcee", "Talent Scout"],
    "Design": ["Creative Director", "Motion Gfx", "3D Artist", "VFX Artist", "Illustrator"]
};

// The Upgraded Generator (Using Fermat's Spiral for ZERO Overlaps)
const generateDynamicContributors = () => {
    const contributors = [];
    const teamsList = ["Core", "Tech", "Cultural", "Design"];
    let idCounter = 1;

    teamsList.forEach(team => {
        const anchor = TEAM_ANCHORS[team];
        const isMainTeam = team === "Core";
        const teamSize = isMainTeam ? 10 : 13; // Generate ~50 total

        for (let i = 0; i < teamSize; i++) {
            const isLeader = i === 0;
            
            // SPIRAL ALGORITHM: Perfectly spaces avatars outward so they never overlap
            let leftOffset = 0;
            let topOffset = 0;

            if (!isLeader) {
                // Base distance of 5% from leader, expands by 2.5% per node
                const radius = 5 + Math.sqrt(i) * 2.5; 
                // Golden angle (137.5 degrees) in radians to create a sunflower spiral
                const angle = i * 2.39996; 
                
                leftOffset = Math.cos(angle) * radius;
                topOffset = Math.sin(angle) * (radius * 1.5); // Multiply by 1.5 to account for widescreen aspect ratios
            }

            // Clamp values so they don't fly off the screen
            const left = Math.max(5, Math.min(95, anchor.left + leftOffset));
            const top = Math.max(5, Math.min(95, anchor.top + topOffset));

            // Force the leader to always get the primary Lead Role
            const roleName = isLeader ? roles[team][0] : roles[team][Math.floor(Math.random() * (roles[team].length - 1)) + 1];

            contributors.push({
                id: idCounter++,
                name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
                role: roleName,
                team: team,
                image: `https://i.pravatar.cc/300?img=${(idCounter % 70) + 1}`,
                isLeader: isLeader,
                isMainTeam: isMainTeam,
                top: `${top}%`,
                left: `${left}%`,
                rawTop: top,   
                rawLeft: left  
            });
        }
    });
    return contributors;
};

const CONTRIBUTORS = generateDynamicContributors();

const TECH_TEAM = CONTRIBUTORS.filter(c => c.team === "Tech").slice(0, 4).map((t, index) => ({
    ...t, github: "#", linkedin: "#", handle: `rasrang_tech_${index}`
}));


// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

function AvatarNode({ data, isActive, onSelect }) {
    const floatDelay = useMemo(() => Math.random() * 2, []);
    const color = TEAM_COLORS[data.team];

    // Determine size based on leadership
    const sizeClass = data.isLeader ? "w-20 h-20 md:w-24 md:h-24" : "w-12 h-12 md:w-16 md:h-16";
    const offsetClass = data.isLeader ? "-ml-10 -mt-10 md:-ml-12 md:-mt-12" : "-ml-6 -mt-6 md:-ml-8 md:-mt-8";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
                opacity: isActive ? 1 : 0.05, 
                scale: isActive ? 1 : 0.5,
                y: [0, -10, 0] 
            }}
            transition={{ 
                opacity: { duration: 0.8 }, scale: { duration: 0.5 },
                y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: floatDelay }
            }}
            className={`absolute z-10 group ${data.isLeader ? 'z-20' : ''}`}
            style={{ top: data.top, left: data.left }}
        >
            <div onClick={() => onSelect(data)} className={`${sizeClass} ${offsetClass} cursor-pointer relative flex items-center justify-center`}>
                
                {/* Leader Crown Badge */}
                {data.isLeader && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl drop-shadow-[0_0_10px_currentColor] z-30 transform group-hover:scale-125 transition-transform duration-300" style={{ color }}>
                        ✦
                    </div>
                )}

                {/* Avatar Image */}
                <div className="absolute inset-0 rounded-full border-2 bg-[#020617] transition-all duration-300 group-hover:scale-110 group-hover:z-50" style={{ borderColor: color, boxShadow: isActive ? `0 0 ${data.isLeader ? '30px' : '15px'} ${color}80` : 'none' }}>
                    <img src={data.image} alt={data.name} className={`w-full h-full object-cover rounded-full p-0.5 ${data.isLeader ? '' : 'grayscale mix-blend-luminosity'} group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-500`} />
                </div>
                
                {/* Main Team Label (For Core Leader) */}
                {data.isLeader && data.isMainTeam && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest bg-[#E4BD8D]/20 backdrop-blur-md border border-[#E4BD8D]/50 px-3 py-1 rounded-full whitespace-nowrap z-30 text-[#E4BD8D] shadow-[0_0_15px_rgba(228,189,141,0.5)] font-accent">
                        Festival Core
                    </div>
                )}

                {/* Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:translate-y-1 z-50">
                    <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg whitespace-nowrap shadow-xl flex flex-col items-center">
                        <p className="text-xs font-black uppercase tracking-widest text-[#F8FAFC] font-massive">{data.name}</p>
                        <p className="text-[9px] uppercase tracking-widest font-accent" style={{ color }}>{data.role}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ProfilePopup({ data, onClose }) {
    const x = useMotionValue(0); const y = useMotionValue(0);
    const rotateX = useTransform(y, [-200, 200], [15, -15]); const rotateY = useTransform(x, [-200, 200], [-15, 15]);
    const glareX = useTransform(x, [-200, 200], ["-100%", "200%"]); const glareY = useTransform(y, [-200, 200], ["-100%", "200%"]);
    const color = TEAM_COLORS[data.team];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} className="relative perspective-1000 z-10 w-full max-w-[350px]" onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - rect.left - rect.width / 2); y.set(e.clientY - rect.top - rect.height / 2); }} onMouseLeave={() => { x.set(0); y.set(0); }}>
                <motion.div style={{ rotateX, rotateY }} className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/20 shadow-2xl">
                    <div className="absolute inset-0 w-full h-full">
                        <img src={data.image} alt={data.name} className="w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
                    </div>
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <span className="text-[10px] uppercase font-black tracking-[0.3em] px-3 py-1 rounded-full border border-white/20 w-fit mb-3 font-accent" style={{ color, backgroundColor: `${color}20` }}>
                            {data.isLeader ? "★ Team Lead" : `${data.team} Constellation`}
                        </span>
                        <h3 className="text-3xl font-black text-white uppercase tracking-wide leading-none mb-1 font-massive">{data.name}</h3>
                        <p className="text-xs uppercase tracking-widest text-[#F8FAFC]/60 mb-6">{data.role}</p>
                        <div className="flex gap-4">
                            <button className="flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-105 font-massive" style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}50` }}>Connect</button>
                            <button onClick={onClose} className="px-4 py-3 rounded-lg border border-white/20 text-[#F8FAFC] hover:bg-white/10 transition-colors">✕</button>
                        </div>
                    </div>
                    <motion.div className="absolute inset-0 z-20 pointer-events-none mix-blend-color-dodge opacity-60" style={{ background: `linear-gradient(105deg, transparent 20%, ${color} 25%, #22D3EE 50%, transparent 55%)`, backgroundSize: "200% 200%", x: glareX, y: glareY }} />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// ==========================================
// 3. MAIN PAGE COMPONENT
// ==========================================

export default function Contributors() {
    const { theme } = useTheme();
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedUser, setSelectedUser] = useState(null);

    const activeNodes = useMemo(() => {
        if (activeFilter === "All") return [];
        return CONTRIBUTORS.filter(c => c.team === activeFilter);
    }, [activeFilter]);

    const svgPath = useMemo(() => {
        if (activeNodes.length === 0) return "";
        return activeNodes.map((node, i) => `${i === 0 ? 'M' : 'L'} ${node.rawLeft} ${node.rawTop}`).join(" ");
    }, [activeNodes]);

    // Check env vars (supporting both correct spelling and user typo)
    const showContributorsRaw = import.meta.env.VITE_SHOW_CONTRIBUTOR ?? import.meta.env.VITE_SHOE_CONTRIBUTOR ?? "true";
    const showContributors = showContributorsRaw === "true" || showContributorsRaw === "null";

    if (!showContributors) {
        return (
            <section className="relative w-full min-h-screen bg-transparent flex flex-col items-center justify-center overflow-hidden">
                {/* Background ambient lighting */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#9D01E9]/10 rounded-full blur-[120px]" />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 text-center px-6 max-w-4xl mx-auto"
                >
                    <span className="inline-block px-4 py-2 border border-[#E4BD8D]/30 rounded-full text-[#E4BD8D] text-xs font-black uppercase tracking-[0.5em] mb-6 font-accent backdrop-blur-md bg-[#E4BD8D]/5">
                        The Roundtable is Gathering
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-widest text-white mb-8 drop-shadow-[0_0_30px_rgba(227,30,110,0.4)] font-massive leading-tight">
                        Heroes In <br className="hidden md:block" /> The Shadows
                    </h1>
                    <div className="flex justify-center mb-8">
                        <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#E31E6E] to-transparent" />
                    </div>
                    <p className="text-sm md:text-lg text-white/60 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
                        The cosmic knights are currently polishing their armor and forging the ultimate crusade to bring unparalleled happiness to the people of SRM Trichy. 
                        The full vanguard of cultural champions will reveal their identities very soon. Hold the line!
                    </p>
                </motion.div>
            </section>
        );
    }

    return (
        <section className="relative w-full min-h-screen bg-transparent flex flex-col">
            
            <div className="fixed top-1/4 left-1/4 w-[600px] h-[600px] bg-[#9D01E9]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#22D3EE]/10 blur-[150px] rounded-full pointer-events-none -z-10" />

            {/* --- PART 1: THE FESTIVAL CONSTELLATIONS --- */}
            <div className="pt-24 md:pt-32 pb-12 w-full max-w-[1600px] mx-auto flex flex-col">
                <div className="relative z-20 text-center px-6 mb-8 md:mb-16">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-widest text-white mb-4 drop-shadow-[0_0_30px_rgba(157,1,233,0.3)] font-massive">
                        The Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9D01E9] to-[#C53099]">Stars</span>
                    </h1>
                    <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-[#AF94D2] font-accent">
                        Hover or click a star to reveal the talent behind the festival.
                    </p>
                </div>

                <div className="relative z-30 flex justify-start md:justify-center overflow-x-auto hide-scrollbar gap-2 md:gap-4 px-6 mb-8">
                    {TEAMS.map(team => (
                        <button
                            key={team}
                            onClick={() => setActiveFilter(team)}
                            className={`relative px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 border font-massive
                                ${activeFilter === team 
                                    ? 'bg-[#F8FAFC] text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                                    : 'bg-[#0A0A0A]/50 backdrop-blur-md text-[#F8FAFC]/70 border-white/10 hover:border-white/30 hover:text-white'}`}
                        >
                            {team}
                        </button>
                    ))}
                </div>

                {/* THE DYNAMIC STAR MAP: Increased min-height to give clusters room to breathe */}
                <div className="relative flex-grow w-full min-h-[900px] md:min-h-[1100px] my-10 overflow-hidden">
                    
                    <AnimatePresence>
                        {activeFilter !== "All" && activeNodes.length > 0 && (
                            <motion.svg 
                                initial={{ opacity: 0, pathLength: 0 }}
                                animate={{ opacity: 0.4, pathLength: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                                style={{ color: TEAM_COLORS[activeFilter] }}
                                preserveAspectRatio="none"
                            >
                                <path 
                                    d={svgPath} 
                                    fill="transparent" 
                                    stroke="currentColor" 
                                    strokeWidth="1.5" 
                                    strokeDasharray="4 8"
                                    style={{ filter: `drop-shadow(0 0 10px ${TEAM_COLORS[activeFilter]})` }}
                                />
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

            {/* --- PART 2: THE TECH CORE (ProfileCard Setup) --- */}
            <div className="w-full bg-[#000000]/80 backdrop-blur-xl border-t border-white/10 py-24 relative z-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-[10px] uppercase font-black tracking-[0.4em] text-[#9D01E9] mb-4 block font-accent">System Architecture</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white font-massive">
                            The Tech Core
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#9D01E9] to-[#22D3EE] mx-auto mt-6" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 place-items-center">
                        {TECH_TEAM.map((member, index) => (
                            <div key={member.id} className="w-full max-w-[320px]">
                                <ProfileCard
                                    name={member.name}
                                    title={member.role}
                                    handle={member.handle}
                                    status="System Online"
                                    contactText="View GitHub"
                                    avatarUrl={member.image}
                                    showUserInfo={true}
                                    enableTilt={true}
                                    enableMobileTilt={true}
                                    onContactClick={() => window.open(member.github, '_blank')}
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

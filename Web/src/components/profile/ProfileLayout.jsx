import { useState, useMemo } from "react";
import multiavatar from '@multiavatar/multiavatar/esm';
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { APP_THEME } from "../../constants/theme";

export default function ProfileLayout({ children, activeTab, setActiveTab }) {
    const { user, logout } = useAuth();
    const { colors } = APP_THEME;

    const avatarSvg = useMemo(() => {
        return multiavatar(user?.avatarSeed || user?.email || user?.name || "rasrang-guest");
    }, [user?.avatarSeed, user?.email, user?.name]);

    const navItems = [
        { id: "passport", icon: "🆔", label: "Passport", show: true },
        { id: "vault", icon: "🎟️", label: "Vault", show: true },
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen text-white md:pt-20 overflow-hidden relative" style={{ backgroundColor: colors.base }}>
            
            {/* ── BACKGROUND ATMOSPHERE (Orbs) ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div 
                    animate={{ 
                        x: [0, 100, 0], 
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1] 
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-20"
                    style={{ backgroundColor: colors.primary }}
                />
                <motion.div 
                    animate={{ 
                        x: [0, -120, 0], 
                        y: [0, 80, 0],
                        scale: [1, 1.3, 1] 
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
                    className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.15]"
                    style={{ backgroundColor: colors.highlight }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[160px] opacity-[0.08]"
                     style={{ backgroundColor: colors.secondary }} />
            </div>

            {/* --- DESKTOP SIDEBAR --- */}
            <motion.aside 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden md:flex w-72 backdrop-blur-3xl border-r flex-col p-8 z-20 relative"
                style={{ backgroundColor: `${colors.surface}CC`, borderColor: `${colors.primary}26` }}
            >
                {/* ── Biometric Scan Avatar ── */}
                <div className="mb-12 text-center group cursor-pointer relative">
                    <div className="relative w-28 h-28 mx-auto mb-6">
                        {/* Rotating Rings */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-2 border-2 border-dashed border-[#9D01E9]/40 rounded-full"
                        />
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-4 border border-dotted border-[#E31E6E]/30 rounded-full"
                        />
                        
                        {/* Actual Avatar */}
                        <div className="w-full h-full rounded-full relative z-10 p-[3px]" 
                             style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.highlight})` }}>
                            <div 
                                className="w-full h-full bg-[#0D0620] rounded-full flex items-center justify-center overflow-hidden"
                                dangerouslySetInnerHTML={{ __html: avatarSvg }}
                            />
                        </div>

                        {/* Scan Line Animation */}
                        <motion.div 
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute left-0 right-0 h-0.5 bg-[#22D3EE] z-20 opacity-40 blur-[1px]"
                        />
                    </div>

                    <div className="space-y-1">
                        <h3 className="font-black uppercase tracking-[-0.02em] text-lg leading-tight" style={{ color: colors.textTitle }}>{user?.name}</h3>
                        <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-[#E4BD8D]">{user?.role || "PARTICIPANT"}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 font-black uppercase tracking-wider text-[10px] relative group overflow-hidden ${
                                activeTab === item.id ? "text-white" : "text-white/40 hover:text-white/80"
                            }`}
                        >
                            {activeTab === item.id && (
                                <motion.div 
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-gradient-to-r"
                                    style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 text-lg transition-transform group-hover:scale-125 duration-300">{item.icon}</span>
                            <span className="relative z-10 tracking-[0.2em]">{item.label}</span>
                            
                            {/* Subtle hover glow */}
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
                        </button>
                    ))}
                </nav>

                <div className="pt-6 border-t border-white/5 mt-auto">
                    <button 
                        onClick={logout}
                        style={{ color: `${colors.highlight}88` }}
                        className="group w-full flex items-center gap-4 px-4 py-4 hover:bg-[#E31E6E]/10 rounded-xl transition-all duration-500 font-black uppercase tracking-[0.2em] text-[10px] relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#E31E6E]/0 to-[#E31E6E]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-lg group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">⏻</span>
                        <span className="group-hover:text-white transition-colors">Terminate Session</span>
                    </button>
                </div>
            </motion.aside>

            {/* --- MOBILE NEON SEGMENTED HUB --- */}
            <div className="md:hidden fixed top-24 left-1/2 -translate-x-1/2 z-[50] w-[90%] max-w-sm">
                <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-1.5 rounded-2xl flex relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                    
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="flex-1 relative z-10 py-3 rounded-xl transition-all duration-500 overflow-hidden group"
                        >
                            {activeTab === item.id && (
                                <motion.div 
                                    layoutId="tab-highlight"
                                    className="absolute inset-0 z-0 bg-gradient-to-r"
                                    style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div className="flex items-center justify-center gap-3 relative z-10">
                                <span className={`text-sm transition-transform duration-500 ${activeTab === item.id ? 'scale-125' : 'opacity-40 group-hover:opacity-100'}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === item.id ? 'text-white' : 'text-white/40'}`}>
                                    {item.label}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Container */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative md:pt-0 pt-40 mb-20 md:mb-0">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: `${colors.primary}0D` }} />
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-5xl mx-auto"
                    >
                        {children}
                    </motion.div>
                 </AnimatePresence>
            </main>
        </div>
    );
}

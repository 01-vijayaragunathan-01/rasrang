import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { APP_THEME } from "../../constants/theme";

export default function ProfileLayout({ children, activeTab, setActiveTab }) {
    const { user, logout } = useAuth();
    const { colors } = APP_THEME;

    const navItems = [
        { id: "passport", icon: "🆔", label: "Passport", show: true },
        { id: "vault", icon: "🎟️", label: "Vault", show: true },
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen text-white md:pt-20 overflow-hidden" style={{ backgroundColor: colors.base }}>
            
            {/* --- DESKTOP SIDEBAR --- */}
            <motion.aside 
                initial={{ x: -70 }}
                animate={{ x: 0 }}
                className="hidden md:flex w-72 backdrop-blur-xl border-r flex-col p-6 z-20"
                style={{ backgroundColor: colors.surface, borderColor: `${colors.primary}33` }}
            >
                <div className="mb-10 text-center">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 p-0.5" style={{ background: `linear-gradient(to top right, ${colors.primary}, ${colors.highlight})` }}>
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-2xl font-black">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                    <h3 className="font-black uppercase tracking-tighter text-sm truncate" style={{ color: colors.textTitle }}>{user?.name}</h3>
                    <p className="text-[10px] font-mono tracking-widest mt-1 uppercase" style={{ color: colors.textSubtitle }}>{user?.role}</p>
                </div>

                <nav className="flex-1 space-y-3">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={activeTab === item.id ? { 
                                backgroundColor: colors.primary, 
                                color: colors.textTitle,
                                boxShadow: `0 0 20px ${colors.primaryGlow}` 
                            } : { 
                                color: colors.textMuted 
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 font-black uppercase tracking-wider text-[11px] ${
                                activeTab === item.id ? "" : "hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
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

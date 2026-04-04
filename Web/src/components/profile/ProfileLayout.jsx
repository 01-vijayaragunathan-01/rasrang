import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { APP_THEME } from "../../constants/theme";

export default function ProfileLayout({ children, activeTab, setActiveTab }) {
    const { user, logout } = useAuth();
    const { colors } = APP_THEME;

    const navItems = [
        { id: "vault", icon: "🎟️", label: "Vault", show: true },
        { id: "command", icon: "⚡", label: "Command", show: user?.role === "COORDINATOR" || user?.role === "SUPER_ADMIN" },
        { id: "passport", icon: "🆔", label: "Passport", show: true, isProfile: true },
        { 
            id: "platform", 
            icon: "🌐", 
            label: "Control", 
            show: user?.role === "SUPER_ADMIN" || (user?.role === "COORDINATOR" && user?.canManagePrivileges)
        }
    ];

    const filteredNav = navItems.filter(item => item.show);

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
                    {/* Consistent Desktop Nav */}
                    {[
                        { id: "passport", label: "Passport", icon: "🆔", show: true },
                        { id: "vault", label: "Ticket Vault", icon: "🎟️", show: true },
                        { id: "command", label: "Command Center", icon: "⚡", show: user?.role === "COORDINATOR" || user?.role === "SUPER_ADMIN" },
                        { id: "platform", label: user?.role === 'SUPER_ADMIN' ? "Platform Control" : "Overlord Protocol", icon: "🌐", show: user?.role === "SUPER_ADMIN" || (user?.role === "COORDINATOR" && user?.canManagePrivileges) }
                    ].filter(item => item.show).map((item) => (
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
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 font-bold uppercase tracking-wider text-[11px] ${
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

            {/* --- MOBILE DOCK --- */}
            <nav 
                className="md:hidden fixed bottom-0 left-0 right-0 h-20 z-50 flex items-center justify-around px-2 backdrop-blur-3xl border-t"
                style={{ backgroundColor: `${colors.surface}DD`, borderColor: `${colors.primary}33` }}
            >
                {/* Left side navs before Profile */}
                {filteredNav.filter(item => !item.isProfile).map((item, idx) => (
                   idx < 2 && (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="flex flex-col items-center gap-1 min-w-[60px]"
                    >
                        <span className="text-xl" style={{ opacity: activeTab === item.id ? 1 : 0.4 }}>{item.icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-tighter" style={{ color: activeTab === item.id ? colors.primary : colors.textMuted }}>{item.label}</span>
                        {activeTab === item.id && <motion.div layoutId="dock-glow" className="absolute w-2 h-2 rounded-full blur-[4px] mt-8" style={{ backgroundColor: colors.primary }} />}
                    </button>
                   )
                ))}

                {/* Center Profile */}
                <button 
                    onClick={() => setActiveTab("passport")}
                    className="relative -top-8 w-16 h-16 rounded-full p-0.5 shadow-2xl transition-transform active:scale-90"
                    style={{ background: `linear-gradient(to top right, ${colors.primary}, ${colors.highlight})` }}
                >
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden border border-white/5">
                        <span className="text-xl font-black">{user?.name?.charAt(0)}</span>
                    </div>
                    {activeTab === "passport" && (
                        <div className="absolute -inset-2 rounded-full border border-white/20 animate-pulse" />
                    )}
                </button>

                {/* Right side navs & Logout */}
                {filteredNav.filter(item => !item.isProfile).map((item, idx) => (
                   idx >= 2 && (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="flex flex-col items-center gap-1 min-w-[60px]"
                    >
                        <span className="text-xl" style={{ opacity: activeTab === item.id ? 1 : 0.4 }}>{item.icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-tighter" style={{ color: activeTab === item.id ? colors.primary : colors.textMuted }}>{item.label}</span>
                    </button>
                   )
                ))}

                {/* Logout at the end */}
                <button 
                    onClick={logout}
                    className="flex flex-col items-center gap-1 min-w-[60px]"
                    style={{ color: colors.highlight }}
                >
                    <span className="text-xl opacity-60 hover:opacity-100 transition-opacity">⏻</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">EXIT</span>
                </button>
            </nav>

            {/* Main Content Container */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative md:pt-0 pt-20 mb-20 md:mb-0">
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

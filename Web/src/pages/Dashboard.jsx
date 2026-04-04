import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import UserManagement from "../components/profile/UserManagement";
import EventForge from "../components/profile/EventForge";
import { APP_THEME } from "../constants/theme";
import { LayoutDashboard, ShieldCheck, Hammer, Zap } from "lucide-react";

export default function Dashboard() {
    const { user } = useAuth();
    const { colors } = APP_THEME;
    const [activeSection, setActiveSection] = useState("overview");

    // Staff/Admin Permissions
    const isPlatformAdmin = user?.role === "SUPER_ADMIN" || (user?.role === "COORDINATOR" && user?.canManagePrivileges);
    const isContributor = user?.role === "VOLUNTEER" || user?.role === "COORDINATOR" || user?.role === "SUPER_ADMIN";

    if (!isContributor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center p-8 border-2 border-red-500/50 bg-red-500/10 rounded-2xl backdrop-blur-xl">
                    <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Access Denied</h1>
                    <p className="text-red-400 font-bold">Your clearance level is insufficient for this sector.</p>
                </div>
            </div>
        );
    }

    const sections = [
        { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" />, show: true },
        { id: "management", label: isPlatformAdmin ? "Platform Control" : "Overlord Protocol", icon: <ShieldCheck className="w-4 h-4" />, show: isPlatformAdmin },
        { id: "forge", label: "The Event Forge", icon: <Hammer className="w-4 h-4" />, show: isPlatformAdmin },
        { id: "command", label: "Command Center", icon: <Zap className="w-4 h-4" />, show: true },
    ];

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 md:px-12 bg-black overflow-hidden relative">
            {/* Background Ambient Glows */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#9D01E9]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[#22D3EE]/10 blur-[150px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-1 md:w-16 bg-gradient-to-r from-[#9D01E9] to-transparent" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-[#AF94D2] font-accent">System Dashboard</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight font-massive">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9D01E9] via-[#C53099] to-[#E31E6E]">Command Tower</span>
                    </h1>
                </header>

                {/* Section Switcher */}
                <div className="flex gap-4 mb-12 overflow-x-auto hide-scrollbar pb-4">
                    {sections.filter(s => s.show).map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center gap-3 whitespace-nowrap
                            ${activeSection === section.id 
                                ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105" 
                                : "bg-white/5 text-white/50 border border-white/10 hover:border-white/30 hover:bg-white/10"}`}
                        >
                            <span>{section.icon}</span>
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#9D01E9]/10 blur-[80px] pointer-events-none" />

                        {activeSection === "overview" && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="p-8 bg-black/40 border border-white/5 rounded-2xl">
                                    <p className="text-[10px] uppercase font-bold text-white/40 mb-2 tracking-widest">Clearance Level</p>
                                    <h3 className="text-2xl font-black text-white">{user?.role}</h3>
                                </div>
                                <div className="p-8 bg-black/40 border border-white/5 rounded-2xl">
                                    <p className="text-[10px] uppercase font-bold text-white/40 mb-2 tracking-widest">Active Tickets</p>
                                    <h3 className="text-2xl font-black text-[#22D3EE]">Live System</h3>
                                </div>
                                <div className="p-8 bg-black/40 border border-white/5 rounded-2xl">
                                    <p className="text-[10px] uppercase font-bold text-white/40 mb-2 tracking-widest">Platform Status</p>
                                    <h3 className="text-2xl font-black text-[#9D01E9]">Nominal</h3>
                                </div>
                                <div className="md:col-span-3 py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
                                    <p className="text-white/30 font-bold uppercase tracking-widest italic font-accent">Advanced Analytics Coming Soon</p>
                                </div>
                            </div>
                        )}

                        {activeSection === "forge" && isPlatformAdmin && <EventForge />}

                        {(activeSection === "management" || activeSection === "command") && (
                            <div className="text-left">
                                <h2 className="text-2xl font-black uppercase tracking-widest text-[#AF94D2] mb-8 flex items-center gap-4">
                                    <span className="w-1.5 h-6 bg-[#9D01E9]" />
                                    {sections.find(s => s.id === activeSection)?.label}
                                </h2>
                                <UserManagement isSuper={activeSection === "management"} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

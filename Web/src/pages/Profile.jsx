import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import ProfileLayout from "../components/profile/ProfileLayout";
import TicketSlider from "../components/profile/TicketSlider";
import UserManagement from "../components/profile/UserManagement";
import { APP_THEME } from "../constants/theme";

export default function Profile() {
    const { user, setUser, csrfToken } = useAuth();
    const { colors } = APP_THEME;
    const [activeTab, setActiveTab ] = useState("passport");
    const [isEditing, setIsEditing] = useState(false);
    const [tickets, setTickets] = useState({ individualTickets: [], masterTickets: [] });

    useEffect(() => {
        if (!user) return;

        // Fetch Tickets
        fetch("http://localhost:5000/api/events/my-registrations", {credentials: "include"})
            .then(res => {
                if (res.status === 401) throw new Error("Unauthorized");
                return res.json();
            })
            .then(data => {
               if(data.masterTickets) setTickets(data);
            })
            .catch(err => {
                if (err.message !== "Unauthorized") console.error(err);
            });
    }, [user]);

    const handleSave = () => {
        setIsEditing(false);
        fetch("http://localhost:5000/api/auth/profile", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "x-csrf-token": csrfToken 
            },
            body: JSON.stringify(user),
            credentials: "include"
        }).then(res => res.json())
          .then(data => {
              if (data.user) setUser(data.user);
          });
    };

    if (!user) return <div className="min-h-screen text-white flex items-center justify-center font-black uppercase text-2xl tracking-[0.4em] animate-pulse" style={{ backgroundColor: colors.base }}>Scanning Bio-Metrics...</div>;

    return (
        <ProfileLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            
            {/* 1. PASSPORT TAB (IDENTITY) */}
            {activeTab === "passport" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-center lg:items-start"
                    >
                        <div className="relative w-32 h-32 mb-6 flex justify-center items-center">
                            <div className="absolute inset-0 rounded-full border-[3px] animate-spin" style={{ borderColor: `${colors.highlight} transparent ${colors.primary} transparent`, animationDuration: '3s' }}></div>
                            <div className="w-28 h-28 bg-black/40 rounded-full flex items-center justify-center text-3xl font-black border border-white/5">
                                {user.name ? user.name.charAt(0) : '?'}
                            </div>
                            <div className="absolute -bottom-2 -right-2 text-[10px] px-3 py-1 font-black uppercase rounded-full shadow-[0_0_10px_rgba(157,1,233,0.3)]" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}>
                                {user.role}
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2" style={{ color: colors.textTitle }}>{user.name}</h1>
                        <div className="flex gap-2">
                             <span className="bg-white/5 px-3 py-1 rounded-md font-mono text-[9px] border border-white/10" style={{ color: colors.textSubtitle }}>ID: {user.regNo}</span>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.05)' }}
                        className="lg:col-span-2 border p-6 md:p-8 rounded-3xl backdrop-blur-md relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ backgroundColor: `${colors.primary}1A` }} />
                        <h3 className="text-xl font-bold uppercase mb-6 tracking-widest" style={{ color: colors.highlight }}>Bio-Metric Vault</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {['clgName', 'dept', 'year', 'branch', 'section'].map((field) => (
                                <div key={field} className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest" style={{ color: colors.textMuted }}>
                                        {field === 'clgName' ? 'College' : field}
                                    </label>
                                    <input 
                                        disabled={!isEditing}
                                        value={user[field] || ""}
                                        onChange={(e) => setUser({...user, [field]: e.target.value})}
                                        style={{ 
                                            borderColor: isEditing ? colors.primary : 'rgba(255,255,255,0.1)',
                                            color: isEditing ? colors.textTitle : colors.textMuted
                                        }}
                                        className={`w-full bg-black/20 border-b-2 p-3 text-sm outline-none transition-all font-bold`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-end relative z-10">
                            <button 
                                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.highlight})`, boxShadow: `0 0 20px ${colors.primaryGlow}` }}
                                className="px-8 py-3 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all rounded-sm"
                            >
                                {isEditing ? "Sign & Save" : "Modify Credentials"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 2. VAULT TAB (TICKETS) */}
            {activeTab === "vault" && (
                <div className="max-w-7xl mx-auto px-2 md:px-0">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-8 flex items-center gap-4">
                        <span className="w-2 h-8 inline-block" style={{ backgroundColor: colors.highlight }}></span>
                        Encrypted Access Vault
                    </h2>
                    <TicketSlider tickets={tickets} />
                </div>
            )}

            {/* 3. COMMAND CENTER TAB (ADMIN) */}
            {activeTab === "command" && (
                <UserManagement isSuper={false} />
            )}

            {/* 4. OVERLORD PROTOCOL TAB (COORD ADMIN) */}
            {activeTab === "overlord" && (
                <UserManagement isSuper={true} />
            )}

            {/* 5. PLATFORM CONTROL TAB (SUPER ADMIN) */}
            {activeTab === "platform" && (
                <UserManagement isSuper={true} />
            )}

        </ProfileLayout>
    );
}

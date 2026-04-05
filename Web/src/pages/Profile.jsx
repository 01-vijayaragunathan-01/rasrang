import { useState, useEffect, useMemo } from "react";
import multiavatar from '@multiavatar/multiavatar/esm';
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileLayout from "../components/profile/ProfileLayout";
import TicketSlider from "../components/profile/TicketSlider";
import { useToast } from "../context/ToastContext";
import { APP_THEME } from "../constants/theme";
import AvatarPicker from "../components/profile/AvatarPicker";
import { X, Fingerprint, ShieldCheck } from "lucide-react";

export default function Profile() {
    const { user, setUser, csrfToken } = useAuth();

    const avatarSvg = useMemo(() => {
        return multiavatar(user?.avatarSeed || user?.email || user?.name || "rasrang-guest");
    }, [user?.avatarSeed, user?.email, user?.name]);
    const location = useLocation();
    const toast = useToast();
    const { colors } = APP_THEME;
    const [activeTab, setActiveTab ] = useState("passport");
    
    // Automatically open edit mode if they just arrived from Events requiring onboarding, or if they aren't onboarded yet.
    const [isEditing, setIsEditing] = useState(location.state?.requireOnboarding || (user && !user.isOnboarded) ? true : false);
    const [tickets, setTickets] = useState({ individualTickets: [], masterTickets: [] });
    
    // Identity Hub Modal State
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [tempSeed, setTempSeed] = useState(user?.avatarSeed || user?.email || "rasrang-guest");

    // Password Management State
    const [passwordData, setPasswordData] = useState({ current: "", next: "", confirm: "" });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Fetch Tickets
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/my-registrations`, {credentials: "include"})
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

    const handleSave = async () => {
        // Validation for Onboarding
        if (!user.isOnboarded) {
            if (!user.regNo || !user.phoneNo || !user.clgName || !user.dept || !user.year) {
                toast.error("Please fill all required fields (RegNo, Phone, College, Dept, Year).");
                return;
            }
        }

        setIsEditing(false);
        try {
            const endpoint = user.isOnboarded ? `${import.meta.env.VITE_API_BASE_URL}/api/auth/profile` : `${import.meta.env.VITE_API_BASE_URL}/api/auth/onboard`;
            const method = user.isOnboarded ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken 
                },
                body: JSON.stringify(user),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                if (data.user) setUser(data.user);
                toast.success(user.isOnboarded ? "BIOMETRIC VAULT SYNCHRONIZED." : "ONBOARDING COMPLETE! You can now register for events.");
            } else {
                setIsEditing(true); // Re-open editing if it failed (e.g., duplicated RegNo)
                toast.error(`ERROR: ${data.error || "INVALID DATA"}`);
            }
        } catch (err) {
            setIsEditing(true);
            toast.error("CONNECTION COLLAPSE: Identity update severed.");
        }
    };

    const handleSaveAvatar = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken 
                },
                body: JSON.stringify({ ...user, avatarSeed: tempSeed }),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                if (data.user) setUser(data.user);
                toast.success("IDENTITY PATTERN REWRITTEN: New visuals synchronized.");
                setShowAvatarModal(false);
            } else {
                toast.error(`ERROR: ${data.error || "SYNC FAILED"}`);
            }
        } catch (err) {
            toast.error("CONNECTION LOSS: Identity hub unreachable.");
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.current || !passwordData.next) {
            toast.error("Please fill in the password fields.");
            return;
        }
        if (passwordData.next !== passwordData.confirm) {
            toast.error("New passwords do not match.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/change-password`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken 
                },
                body: JSON.stringify({ 
                    currentPassword: passwordData.current, 
                    newPassword: passwordData.next 
                }),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("PASSWORD REGENERATED: Security protocols updated.");
                setPasswordData({ current: "", next: "", confirm: "" });
            } else {
                toast.error(`ERROR: ${data.error || "UPDATE FAILED"}`);
            }
        } catch (err) {
            toast.error("CONNECTION ERROR: Security hub unreachable.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    // ── 3D TILT LOGIC ──
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;
        setMousePos({ x, y });
    };

    if (!user) return <div className="min-h-screen text-white flex items-center justify-center font-black uppercase text-2xl tracking-[0.4em] animate-pulse" style={{ backgroundColor: colors.base }}>Scanning Bio-Metrics...</div>;

    // Determine fields (Removed avatarSeed from editable grid)
    const editFields = user.isOnboarded 
        ? ['clgName', 'dept', 'year', 'branch', 'section']
        : ['regNo', 'phoneNo', 'clgName', 'dept', 'year', 'branch', 'section'];

    const getFieldLabel = (field) => {
        const labels = {
            avatarSeed: "Biometric Identity Seed",
            regNo: "Registration No.",
            phoneNo: "Mobile Protocol",
            clgName: "Institute / College",
            dept: "Major Department",
            year: "Academic Orbit",
            branch: "Specialization",
            section: "Sector / Section"
        };
        return labels[field] || field;
    };

    return (
        <ProfileLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === "passport" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start py-4">
                    
                    {/* ── LEFT: 3D DIGITAL IDENTITY CARD ── */}
                    <motion.div 
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
                        style={{ 
                            rotateX: mousePos.y * -15, 
                            rotateY: mousePos.x * 15,
                            transformStyle: "preserve-3d" 
                        }}
                        className="lg:col-span-2 relative group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#9D01E9] to-[#E31E6E] rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-[#0D0620]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 overflow-hidden min-h-[400px] flex flex-col justify-between">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none select-none uppercase font-black text-6xl leading-none">
                                PASSPORT<br/>RASRANG
                            </div>
                            
                            <div className="relative z-10" style={{ transform: "translateZ(50px)" }}>
                                <div className="w-16 h-1 bg-gradient-to-r from-[#9D01E9] to-transparent mb-8" />
                                <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-tight" 
                                    style={{ color: colors.textTitle, fontFamily: "'Cinzel', serif" }}>
                                    {user.name.split(' ')[0]}<br/>
                                    <span className="text-[#AF94D2]/40">{user.name.split(' ').slice(1).join(' ')}</span>
                                </h1>
                                <div className="flex items-center gap-3">
                                     <span className="bg-[#9D01E9]/20 text-[#9D01E9] px-4 py-1.5 rounded-full font-black text-[10px] tracking-[0.2em] border border-[#9D01E9]/30">
                                        ID: {user.regNo || "UNLINKED"}
                                     </span>
                                     <span className="text-white/20 font-black text-[10px] tracking-widest uppercase">AUTHENTICATED</span>
                                </div>
                            </div>

                            <div className="mt-12 relative z-10 flex items-end justify-between" style={{ transform: "translateZ(30px)" }}>
                                <div className="space-y-4">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest">Access Role</p>
                                        <p className="text-sm font-black uppercase tracking-wider text-[#E4BD8D]">{user.role}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest">Member Since</p>
                                        <p className="text-sm font-black uppercase tracking-wider text-white">2026.IV.01</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <button 
                                        onClick={() => {
                                            setTempSeed(user?.avatarSeed || user?.email || "rasrang-guest");
                                            setShowAvatarModal(true);
                                        }}
                                        className={`relative p-1 bg-gradient-to-tr from-[#9D01E9] to-[#E31E6E] rounded-full w-24 h-24 shadow-[0_0_30px_rgba(157,1,233,0.3)] transition-all duration-300 group/avatar hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-[#9D01E9]/10 hover:ring-[#9D01E9]/30 hover:shadow-[0_0_50px_rgba(157,1,233,0.4)]`}
                                    >
                                        <div 
                                            className="w-full h-full bg-[#0D0620] rounded-full flex items-center justify-center overflow-hidden relative"
                                            dangerouslySetInnerHTML={{ __html: avatarSvg }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                            <span className="text-xl font-black">🔄</span>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setTempSeed(user?.avatarSeed || user?.email || "rasrang-guest");
                                            setShowAvatarModal(true);
                                        }}
                                        className="text-[9px] uppercase tracking-[0.3em] font-black text-[#AF94D2]/60 hover:text-[#9D01E9] transition-colors"
                                    >
                                        [ Change Identity ]
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── RIGHT: NEON BIO-METRIC VAULT FORM ── */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 bg-[#0D0620]/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm relative"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black uppercase tracking-widest flex items-center gap-4 text-white">
                                    <span className="w-12 h-px bg-white/20"></span>
                                    Credential Vault
                                </h3>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[#AF94D2]/60 font-bold ml-16 italic">Security Synchronizer v3.0</p>
                            </div>
                            
                            {!user.isOnboarded && (
                                <div className="flex items-center gap-3 px-4 py-2 bg-[#E31E6E]/10 border border-[#E31E6E]/30 rounded-full animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-[#E31E6E] shadow-[0_0_10px_#E31E6E]" />
                                    <span className="text-[10px] font-black uppercase text-[#E31E6E] tracking-widest">Incomplete Profile</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                            {editFields.map((field) => (
                                <div key={field} className="relative group">
                                    <label className={`absolute left-0 -top-6 text-[9px] uppercase tracking-[0.2em] font-black transition-all duration-300 ${isEditing ? 'text-[#9D01E9]' : 'text-white/20 group-hover:text-white/40'}`}>
                                        {getFieldLabel(field)}
                                    </label>
                                    <input 
                                        disabled={!isEditing}
                                        value={user[field] || ""}
                                        onChange={(e) => setUser({...user, [field]: e.target.value})}
                                        placeholder={isEditing ? `ENTER ${field.toUpperCase()}` : "NOT SET"}
                                        className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 font-bold
                                            ${isEditing ? 'focus:border-[#9D01E9] focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(157,1,233,0.15)] pr-12' : 'border-dashed opacity-80'}
                                            ${!isEditing && !user[field] ? 'text-red-400 border-red-500/30' : 'text-white'}
                                        `}
                                    />
                                    {isEditing && (
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (field === 'avatarSeed') {
                                                    const newSeed = Math.random().toString(36).substring(7);
                                                    setUser({...user, avatarSeed: newSeed});
                                                }
                                            }}
                                            className={`absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors ${field !== 'avatarSeed' ? 'pointer-events-none' : ''}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full bg-[#9D01E9]/40 ${field === 'avatarSeed' ? 'animate-pulse' : 'animate-ping'}`} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-end">
                            <button 
                                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                className={`relative group px-10 py-5 overflow-hidden rounded-2xl transition-all duration-500 active:scale-95 ${isEditing ? 'bg-white text-black shadow-[0_10px_40px_rgba(255,255,255,0.2)]' : 'bg-transparent text-white'}`}
                            >
                                {!isEditing && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#9D01E9] to-[#E31E6E] group-hover:opacity-100 opacity-90 transition-opacity" />
                                )}
                                <span className={`relative z-10 font-black uppercase tracking-[0.3em] text-[10px]`}>
                                    {isEditing ? "Finalize Sync" : "Edit Profile"}
                                </span>
                            </button>
                        </div>

                        {/* ── SECURITY SECTOR: PASSWORD CHANGE ── */}
                        <div className="mt-16 pt-12 border-t border-white/5 space-y-10">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-4 text-white">
                                    <span className="w-8 h-px bg-[#E31E6E]/30"></span>
                                    Security Sector
                                </h3>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#AF94D2]/40 font-bold ml-12">Update Access Credentials</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                                <div className="relative group md:col-span-2">
                                    <label className="absolute left-0 -top-6 text-[9px] uppercase tracking-[0.2em] font-black text-white/20 group-hover:text-[#E31E6E] transition-colors">Current Password</label>
                                    <input 
                                        type="password"
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                                        placeholder="VERIFY CURRENT IDENTITY"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 font-bold text-white focus:border-[#E31E6E] focus:bg-white/[0.07]"
                                    />
                                </div>
                                <div className="relative group">
                                    <label className="absolute left-0 -top-6 text-[9px] uppercase tracking-[0.2em] font-black text-white/20 group-hover:text-[#9D01E9] transition-colors">Next Password</label>
                                    <input 
                                        type="password"
                                        value={passwordData.next}
                                        onChange={(e) => setPasswordData({...passwordData, next: e.target.value})}
                                        placeholder="NEW ACCESS KEY"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 font-bold text-white focus:border-[#9D01E9] focus:bg-white/[0.07]"
                                    />
                                </div>
                                <div className="relative group">
                                    <label className="absolute left-0 -top-6 text-[9px] uppercase tracking-[0.2em] font-black text-white/20 group-hover:text-[#9D01E9] transition-colors">Confirm Next Password</label>
                                    <input 
                                        type="password"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                                        placeholder="RE-ENTER ACCESS KEY"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 font-bold text-white focus:border-[#9D01E9] focus:bg-white/[0.07]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button 
                                    onClick={handlePasswordChange}
                                    disabled={isUpdatingPassword}
                                    className="relative group px-8 py-4 overflow-hidden rounded-xl bg-[#E31E6E]/10 border border-[#E31E6E]/20 hover:bg-[#E31E6E] text-[#E31E6E] hover:text-white transition-all duration-300 disabled:opacity-50"
                                >
                                    <span className="relative z-10 font-black uppercase tracking-[0.3em] text-[9px]">
                                        {isUpdatingPassword ? "Synchronizing..." : "Update Security Pattern"}
                                    </span>
                                </button>
                            </div>
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

            {/* ── IDENTITY HUB MODAL ── */}
            <AnimatePresence>
                {showAvatarModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAvatarModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-[#0D0620] border border-white/10 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(157,1,233,0.2)] overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9D01E9] via-[#E31E6E] to-[#9D01E9]" />
                            
                            <div className="flex justify-between items-center mb-10">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                        <Fingerprint className="text-[#9D01E9]" size={24} />
                                        Identity Hub
                                    </h2>
                                    <p className="text-[10px] uppercase font-bold text-[#AF94D2]/40 tracking-widest">Visual Reconstruction System</p>
                                </div>
                                <button 
                                    onClick={() => setShowAvatarModal(false)}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="py-6">
                                <AvatarPicker seed={tempSeed} setSeed={setTempSeed} size={160} />
                            </div>

                            <button
                                onClick={handleSaveAvatar}
                                className="w-full mt-10 py-5 bg-gradient-to-r from-[#9D01E9] to-[#E31E6E] text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-[0_10px_30px_rgba(157,1,233,0.3)] hover:shadow-[0_15px_40px_rgba(157,1,233,0.5)] transition-all active:scale-95 group flex items-center justify-center gap-3"
                            >
                                <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />
                                Synchronize Pattern
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ProfileLayout>
    );
}

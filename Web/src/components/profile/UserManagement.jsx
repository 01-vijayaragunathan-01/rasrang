import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { APP_THEME } from "../../constants/theme";
import { Key, ShieldAlert, CheckCircle2, Copy, X } from "lucide-react";

export default function UserManagement({ isSuper }) {
    const { user: currentUser, csrfToken } = useAuth();
    const toast = useToast();
    const { colors } = APP_THEME;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [resetResult, setResetResult] = useState(null); // Stores { name, password }
    const [isResetting, setIsResetting] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, { credentials: "include" });
            const data = await res.json();
            if (res.ok) {
                if (Array.isArray(data)) setUsers(data);
            } else {
                toast.error(`INTEL RETRIEVAL FAILED: ${data.error || "UNKNOWN STATUS"}`);
            }
        } catch (err) {
            toast.error("CONNECTION COLLAPSE: Data access severed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleUpdate = async (userId, newRole, canManage = false) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/role`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken
                },
                body: JSON.stringify({ userId, role: newRole, canManagePrivileges: canManage }),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`CLEARANCE UPDATED: User role synchronized.`);
                fetchUsers(); // Refresh the list
            } else {
                toast.error(`PROTOCOL REJECTED: ${data.message || data.error}`);
            }
        } catch (err) {
            toast.error("SIGNAL INTERFERENCE: Failed to update role.");
        }
    };

    const handleResetPassword = async (userId, userName) => {
        if (!window.confirm(`CRITICAL ACTION: Reset password for ${userName}? This will generate a new temporary access key.`)) return;
        
        setIsResetting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/reset-password`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken
                },
                body: JSON.stringify({ userId }),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                setResetResult({ name: userName, password: data.tempPassword });
                toast.success(`SECURITY PROTOCOL: New access key generated.`);
            } else {
                toast.error(`RESET FAILED: ${data.error || "UNKNOWN REJECTION"}`);
            }
        } catch (err) {
            toast.error("COMMUNICATION ERROR: Security hub unreachable.");
        } finally {
            setIsResetting(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-black uppercase italic mb-8 border-l-8 pl-6" style={{ borderLeftColor: colors.highlight, color: colors.textTitle }}>
                {currentUser?.role === 'SUPER_ADMIN' ? "Platform Control Node" : (isSuper ? "Overlord Protocol" : "Command Center")}
            </h2>

            <div className={`p-8 border-2`} style={{ backgroundColor: `${colors.surface}99`, borderColor: `${colors.primary}33`, boxShadow: `0 0 40px ${colors.primaryGlow}` }}>
                
                {/* Search Bar */}
                <div className="mb-10 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 mb-2 block">
                            {currentUser?.role === 'SUPER_ADMIN' ? "ENCRYPTED USER QUERY..." : (isSuper ? "SCANNING TARGETS..." : "ATTENDEE LOOKUP...")}
                        </label>
                        <input 
                            type="text" 
                            placeholder="SEARCH BY NAME, REGNO, EMAIL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ backgroundColor: colors.base, borderColor: 'rgba(255,255,255,0.05)', color: colors.textTitle }}
                            className="w-full border p-4 font-mono outline-none focus:border-[#9D01E9] transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-white/5 bg-black/20">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="text-white/40 font-mono text-[9px] uppercase tracking-widest" style={{ backgroundColor: colors.surface }}>
                            <tr>
                                <th className="p-4 border-b border-white/5">Identity</th>
                                <th className="p-4 border-b border-white/5">Registration</th>
                                <th className="p-4 border-b border-white/5">Current Status</th>
                                <th className="p-4 border-b border-white/5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="4" className="p-10 text-center uppercase tracking-widest animate-pulse opacity-40">Connecting to encrypted database...</td></tr>
                            ) : filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold">
                                                {u.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold uppercase">{u.name}</p>
                                                <p className="text-[9px] opacity-40">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono" style={{ color: colors.accent }}>{u.regNo}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest`} style={
                                            u.role === 'SUPER_ADMIN' ? { backgroundColor: colors.highlight, color: '#fff' } :
                                            u.role === 'COORDINATOR' ? { backgroundColor: colors.primary, color: '#fff' } : 
                                            u.role === 'VOLUNTEER' ? { backgroundColor: colors.secondary, color: '#fff' } : { backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }
                                        }>
                                            {u.role.replace('_', ' ')} {u.canManagePrivileges && u.role !== 'SUPER_ADMIN' ? "+++" : ""}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {currentUser?.role === 'SUPER_ADMIN' ? (
                                                <>
                                                    {u.role !== 'SUPER_ADMIN' && (
                                                        <button 
                                                            onClick={() => handleRoleUpdate(u.id, 'SUPER_ADMIN', true)}
                                                            style={{ borderColor: `${colors.highlight}55`, color: colors.highlight }}
                                                            className="px-3 py-1.5 border text-[9px] font-black uppercase hover:bg-[#E31E6E] hover:text-white transition-all"
                                                        >
                                                            Ascend to Admin
                                                        </button>
                                                    )}
                                                    {u.role !== 'COORDINATOR' && u.role !== 'SUPER_ADMIN' && (
                                                        <button 
                                                            onClick={() => handleRoleUpdate(u.id, 'COORDINATOR', false)}
                                                            style={{ borderColor: `${colors.primary}55`, color: colors.primary }}
                                                            className="px-3 py-1.5 border text-[9px] font-black uppercase hover:bg-[#9D01E9] hover:text-white transition-all"
                                                        >
                                                            Promote to Coord
                                                        </button>
                                                    )}
                                                    {u.role !== 'STUDENT' && (
                                                        <button 
                                                            onClick={() => handleRoleUpdate(u.id, 'STUDENT', false)}
                                                            className="px-3 py-1.5 border border-white/20 text-white/40 text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all"
                                                        >
                                                            Wipe Status
                                                        </button>
                                                    )}
                                                </>
                                            ) : isSuper ? (
                                                <>
                                                    {u.role !== 'COORDINATOR' && u.role !== 'SUPER_ADMIN' && (
                                                        <button 
                                                            onClick={() => handleRoleUpdate(u.id, 'COORDINATOR', false)}
                                                            className="px-3 py-1.5 border border-[#9D01E9]/50 text-[#9D01E9] text-[9px] font-black uppercase hover:bg-[#9D01E9] hover:text-white transition-all"
                                                        >
                                                            Promote to Coord
                                                        </button>
                                                    )}
                                                    {u.role === 'COORDINATOR' && !u.canManagePrivileges && (
                                                        <button 
                                                            onClick={() => handleRoleUpdate(u.id, 'COORDINATOR', true)}
                                                            style={{ borderColor: `${colors.highlight}55`, color: colors.highlight }}
                                                            className="px-3 py-1.5 border text-[9px] font-black uppercase hover:bg-[#E31E6E] hover:text-white transition-all"
                                                        >
                                                            Grant Overlord
                                                        </button>
                                                    )}
                                                    
                                                    {/* Password Reset Button (Restricted: cannot reset Super Admin unless actor is Super Admin) */}
                                                    {(u.role !== 'SUPER_ADMIN' || currentUser?.role === 'SUPER_ADMIN') && u.id !== currentUser?.id && (
                                                        <button 
                                                            onClick={() => handleResetPassword(u.id, u.name)}
                                                            disabled={isResetting}
                                                            className="p-1.5 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white transition-all rounded disabled:opacity-50"
                                                            title="Reset Access Key"
                                                        >
                                                            <Key size={14} className={isResetting ? "animate-spin" : ""} />
                                                        </button>
                                                    )}

                                                    {u.role !== 'STUDENT' && (
                                                        <button 
                                                            onClick={() => handleRoleUpdate(u.id, 'STUDENT', false)}
                                                            className="px-3 py-1.5 border border-white/20 text-white/40 text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all"
                                                        >
                                                            Wipe Status
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <button className="px-3 py-1.5 border border-white/10 hover:bg-white hover:text-black opacity-30 cursor-not-allowed text-[9px] font-black uppercase">
                                                    Read Only Access
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── RESET RESULT MODAL ── */}
            {resetResult && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-md bg-[#0D0620] border border-orange-500/30 rounded-3xl p-10 relative overflow-hidden shadow-[0_0_100px_rgba(249,115,22,0.15)]"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500" />
                        
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                                    <ShieldAlert size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">Temporary Key Generated</h3>
                                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] italic">Security Override Protocol</p>
                                </div>
                            </div>
                            <button onClick={() => setResetResult(null)} className="text-white/20 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8 text-center space-y-4">
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">New Credentials for {resetResult.name}</p>
                            <div className="relative group">
                                <div className="text-4xl font-black tracking-[0.3em] text-orange-400 font-mono select-all">
                                    {resetResult.password}
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(resetResult.password);
                                        toast.success("Copied to clipboard");
                                    }}
                                    className="mt-4 flex items-center gap-2 mx-auto text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-lg"
                                >
                                    <Copy size={12} /> Copy to Clipboard
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-8">
                            <CheckCircle2 className="text-green-500 shrink-0" size={16} />
                            <p className="text-[9px] text-green-400 font-bold uppercase leading-relaxed">
                                Share this key with the user immediately. It will not be stored or shown again for security reasons.
                            </p>
                        </div>

                        <button 
                            onClick={() => setResetResult(null)}
                            className="w-full py-4 bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-orange-600 transition-colors shadow-[0_10px_30px_rgba(249,115,22,0.3)]"
                        >
                            Close Protocol
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

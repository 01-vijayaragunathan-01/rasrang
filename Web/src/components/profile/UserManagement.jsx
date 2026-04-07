import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // <-- NEW IMPORT
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { APP_THEME } from "../../constants/theme";
import { Key, ShieldAlert, CheckCircle2, Copy, X, Pencil, Trash2, User } from "lucide-react";
import { api } from "../../utils/api";

export default function UserManagement({ isSuper }) {
    const { user: currentUser } = useAuth();
    const toast = useToast();
    const { colors } = APP_THEME;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [resetResult, setResetResult] = useState(null); 
    const [isResetting, setIsResetting] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [confirmModal, setConfirmModal] = useState({ 
        isOpen: false, 
        title: "", 
        message: "", 
        confirmText: "", 
        actionType: "",
        onConfirm: () => {} 
    });

    const fetchUsers = async () => {
        try {
            const res = await api("/api/admin/users");
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
            const res = await api("/api/admin/role", {
                method: "PUT",
                body: JSON.stringify({ userId, role: newRole, canManagePrivileges: canManage }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`CLEARANCE UPDATED: User role synchronized.`);
                fetchUsers();
            } else {
                toast.error(`PROTOCOL REJECTED: ${data.message || data.error}`);
            }
        } catch (err) {
            toast.error("SIGNAL INTERFERENCE: Failed to update role.");
        }
    };

    const handleResetPassword = async (userId, userName) => {
        setConfirmModal({
            isOpen: true,
            title: "SECURITY OVERRIDE",
            message: `CRITICAL ACTION: Generate a new temporary access key for ${userName}? The previous key will be voided.`,
            confirmText: "GENERATE KEY",
            actionType: "reset",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setIsResetting(true);
                try {
                    const res = await api("/api/admin/reset-password", {
                        method: "POST",
                        body: JSON.stringify({ userId }),
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
            }
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        const { id, name, email, regNo } = editingUser;
        try {
            const res = await api(`/api/admin/users/${id}`, {
                method: "PUT",
                body: JSON.stringify({ name, email, regNo }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("PROFILE SYNCED: User details updated successfully.");
                setEditingUser(null);
                fetchUsers();
            } else {
                toast.error(`UPGRADE FAILED: ${data.error || "REJECTED"}`);
            }
        } catch (err) {
            toast.error("DATABASE TIMEOUT: Failed to update user.");
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        setConfirmModal({
            isOpen: true,
            title: "IDENTITY PURGE",
            message: `⚠️ EXTREME CAUTION: Are you sure you want to PERMANENTLY ERASE ${userName}? This will delete all registrations, volunteer history, and profile data.`,
            confirmText: "PURGE IDENTITY",
            actionType: "delete",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setIsDeleting(true);
                try {
                    const res = await api(`/api/admin/users/${userId}`, {
                        method: "DELETE",
                    });
                    const data = await res.json();
                    if (res.ok) {
                        toast.success("IDENTITY PURGED: User has been erased from the platform.");
                        fetchUsers();
                    } else {
                        toast.error(`PURGE REJECTED: ${data.error || "SYSTEM LOCK"}`);
                    }
                } catch (err) {
                    toast.error("CONNECTION SEVERED: Failed to execute deletion.");
                } finally {
                    setIsDeleting(false);
                }
            }
        });
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* ── MAIN CONTENT LAYER ── */}
            <div className="space-y-8 relative z-10">
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
                    <div className="overflow-x-auto border border-white/5 bg-black/20 relative z-0">
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
                                            <div className="flex gap-2 items-center">
                                                {currentUser?.role === 'SUPER_ADMIN' || (isSuper && u.role !== 'SUPER_ADMIN') ? (
                                                    <>
                                                        <button 
                                                            onClick={() => setEditingUser(u)}
                                                            className="p-1.5 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all rounded"
                                                            title="Modify Profile"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>

                                                        <button 
                                                            onClick={() => handleResetPassword(u.id, u.name)}
                                                            disabled={isResetting}
                                                            className="p-1.5 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white transition-all rounded disabled:opacity-50"
                                                            title="Reset Access Key"
                                                        >
                                                            <Key size={14} className={isResetting ? "animate-spin" : ""} />
                                                        </button>

                                                        <div className="h-6 w-[1px] bg-white/10 mx-1" />

                                                        {u.role !== 'SUPER_ADMIN' && currentUser?.role === 'SUPER_ADMIN' && (
                                                            <button 
                                                                onClick={() => handleRoleUpdate(u.id, 'SUPER_ADMIN', true)}
                                                                className="px-2 py-1.5 border border-[#E31E6E]/30 text-[#E31E6E] text-[8px] font-black uppercase hover:bg-[#E31E6E] hover:text-white transition-all rounded"
                                                                title="Promote to Platform Admin"
                                                            >
                                                                Admin
                                                            </button>
                                                        )}
                                                        
                                                        {u.role !== 'SUPER_ADMIN' && (!u.canManagePrivileges || u.role !== 'COORDINATOR') && (
                                                            <button 
                                                                onClick={() => handleRoleUpdate(u.id, 'COORDINATOR', true)}
                                                                className="px-2 py-1.5 border border-[#8B5CF6]/30 text-[#8B5CF6] text-[8px] font-black uppercase hover:bg-[#8B5CF6] hover:text-white transition-all rounded"
                                                                title="Grant Privilege Management"
                                                            >
                                                                Crd++
                                                            </button>
                                                        )}

                                                        {u.role !== 'COORDINATOR' && u.role !== 'SUPER_ADMIN' && (
                                                            <button 
                                                                onClick={() => handleRoleUpdate(u.id, 'COORDINATOR', false)}
                                                                className="px-2 py-1.5 border border-[#9D01E9]/30 text-[#9D01E9] text-[8px] font-black uppercase hover:bg-[#9D01E9] hover:text-white transition-all rounded"
                                                                title="Promote to Coordinator"
                                                            >
                                                                Crd
                                                            </button>
                                                        )}

                                                        {u.role === 'STUDENT' && (
                                                            <button 
                                                                onClick={() => handleRoleUpdate(u.id, 'VOLUNTEER', false)}
                                                                className="px-2 py-1.5 border border-[#22D3EE]/30 text-[#22D3EE] text-[8px] font-black uppercase hover:bg-[#22D3EE] hover:text-white transition-all rounded"
                                                                title="Make Volunteer"
                                                            >
                                                                Vlt
                                                            </button>
                                                        )}

                                                        {u.role === 'COORDINATOR' && u.canManagePrivileges && (
                                                            <button 
                                                                onClick={() => handleRoleUpdate(u.id, 'COORDINATOR', false)}
                                                                className="px-2 py-1.5 border border-yellow-500/30 text-yellow-500 text-[8px] font-black uppercase hover:bg-yellow-500 hover:text-white transition-all rounded"
                                                                title="Revoke Management Privileges"
                                                            >
                                                                Revoke
                                                            </button>
                                                        )}

                                                        {u.role !== 'STUDENT' && (
                                                            <button 
                                                                onClick={() => handleRoleUpdate(u.id, 'STUDENT', false)}
                                                                className="px-2 py-1.5 border border-white/10 text-white/40 text-[8px] font-black uppercase hover:bg-white hover:text-black transition-all rounded"
                                                                title="Wipe Clearances"
                                                            >
                                                                Demote
                                                            </button>
                                                        )}

                                                        <div className="h-6 w-[1px] bg-white/10 mx-1" />

                                                        {u.id !== currentUser?.id && (
                                                            <button 
                                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                                disabled={isDeleting}
                                                                className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded disabled:opacity-50"
                                                                title="Purge Identity"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <button className="px-3 py-1.5 border border-white/10 hover:bg-white hover:text-black opacity-30 cursor-not-allowed text-[9px] font-black uppercase">
                                                        Read Only
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
            </div>

            {/* ── MODALS LAYER (TELEPORTED TO DOCUMENT BODY) ── */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    {/* ── EDIT USER MODAL ── */}
                    <AnimatePresence>
                        {editingUser && (
                            <motion.div 
                                key="edit-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
                                onClick={() => setEditingUser(null)} 
                            >
                                <motion.div 
                                    key="edit-modal"
                                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                                    className="w-full max-w-lg bg-[#0D0620] border border-blue-500/30 rounded-3xl p-10 relative overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.15)]"
                                    onClick={(e) => e.stopPropagation()} 
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-[#9D01E9]" />
                                    
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                                <User size={28} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black uppercase tracking-tighter text-white">Modify Profile</h3>
                                                <p className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] italic">Identity Synchronization</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setEditingUser(null)} className="text-white/20 hover:text-white transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleUpdateUser} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest pl-1">Full Name</label>
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-white outline-none focus:border-blue-500 transition-all"
                                                value={editingUser?.name || ""}
                                                onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest pl-1">Email Address</label>
                                            <input 
                                                type="email"
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-white outline-none focus:border-blue-500 transition-all"
                                                value={editingUser?.email || ""}
                                                onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest pl-1">Registration No</label>
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-white outline-none focus:border-blue-500 transition-all"
                                                value={editingUser?.regNo || ""}
                                                onChange={e => setEditingUser({...editingUser, regNo: e.target.value})}
                                                placeholder="N/A"
                                            />
                                        </div>

                                        <div className="flex gap-4 pt-6">
                                            <button 
                                                type="button"
                                                onClick={() => setEditingUser(null)}
                                                className="flex-1 py-4 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/5 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit"
                                                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-[#9D01E9] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:opacity-90 transition-all shadow-lg"
                                            >
                                                Sync Profile
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── INLINE CONFIRM MODAL ── */}
                    <AnimatePresence>
                        {confirmModal.isOpen && (
                            <motion.div
                                key="confirm-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                            >
                                <motion.div
                                    key="confirm-modal"
                                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`w-full max-w-md bg-[#0A0515] border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-2xl ${
                                        confirmModal.actionType === 'delete' ? 'shadow-red-500/10' : 'shadow-orange-500/10'
                                    }`}
                                >
                                    <div className={`absolute top-0 left-0 w-full h-1 ${
                                        confirmModal.actionType === 'delete' ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-orange-600 to-yellow-400'
                                    }`} />
                                    
                                    <h3 className={`text-xl font-black uppercase tracking-widest mb-4 flex items-center gap-3 ${
                                        confirmModal.actionType === 'delete' ? 'text-red-500' : 'text-orange-500'
                                    }`}>
                                        <ShieldAlert size={24} />
                                        {confirmModal.title}
                                    </h3>
                                    
                                    <p className="text-white/60 text-sm leading-relaxed mb-8 font-mono">
                                        {confirmModal.message}
                                    </p>
                                    
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                            className="flex-1 py-3 border border-white/10 text-white/50 hover:text-white hover:bg-white/5 font-black uppercase text-xs tracking-widest rounded-xl transition-all"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            onClick={confirmModal.onConfirm}
                                            className={`flex-1 py-3 font-black uppercase text-xs tracking-widest rounded-xl text-white transition-all shadow-lg hover:-translate-y-0.5 ${
                                                confirmModal.actionType === 'delete' 
                                                    ? 'bg-red-600 hover:bg-red-500 shadow-red-900/50' 
                                                    : 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/50'
                                            }`}
                                        >
                                            {confirmModal.confirmText}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── RESET RESULT MODAL ── */}
                    <AnimatePresence>
                        {resetResult && (
                            <motion.div 
                                key="reset-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
                            >
                                <motion.div 
                                    key="reset-modal"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="w-full max-w-md bg-[#13072E] border-2 border-orange-500/50 rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-[0_0_120px_rgba(249,115,22,0.2)]"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500" />
                                    
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="flex items-center gap-5">
                                            <div className="p-4 bg-orange-500/20 rounded-2xl text-orange-400 ring-1 ring-orange-500/30">
                                                <ShieldAlert size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Access Key</h3>
                                                <p className="text-[10px] uppercase font-bold text-orange-500/60 tracking-[0.3em] italic">System Generated</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setResetResult(null)} className="text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-8 mb-10 text-center space-y-6">
                                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">New Credentials for {resetResult.name}</p>
                                        <div className="relative group flex flex-col items-center">
                                            <div className="text-5xl font-black tracking-[0.2em] text-orange-400 font-mono select-all mb-6 drop-shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                                                {resetResult.password}
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(resetResult.password);
                                                    toast.success("Identity Key Copied");
                                                }}
                                                className="flex items-center gap-3 text-[10px] font-black uppercase text-white/50 hover:text-white transition-all bg-white/5 hover:bg-orange-500 hover:text-white border border-white/10 px-6 py-3 rounded-xl"
                                            >
                                                <Copy size={14} /> Copy to Clipboard
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-5 bg-green-500/10 border border-green-500/20 rounded-2xl mb-10">
                                        <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                                        <p className="text-[10px] text-green-400/80 font-bold uppercase leading-relaxed tracking-wide">
                                            This key is temporary. Transfer it to the user immediately. 
                                            It will be purged from active memory upon closing this terminal.
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => setResetResult(null)}
                                        className="w-full py-5 bg-orange-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-orange-600 transition-all shadow-[0_15px_40px_rgba(249,115,22,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        TERMINATE SESSION
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>,
                document.body
            )}
        </>
    );
}
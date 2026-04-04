import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { APP_THEME } from "../../constants/theme";

export default function UserManagement({ isSuper }) {
    const { user: currentUser, csrfToken } = useAuth();
    const toast = useToast();
    const { colors } = APP_THEME;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/admin/users", { credentials: "include" });
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
            const res = await fetch("http://localhost:5000/api/admin/role", {
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
        </div>
    );
}

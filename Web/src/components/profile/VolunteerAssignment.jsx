import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, UserMinus, ChevronDown, CheckCircle2, Loader2, Users, ShieldCheck, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function VolunteerAssignment() {
    const { csrfToken } = useAuth();
    const toast = useToast();

    const [data, setData] = useState({ volunteers: [], events: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedVolunteer, setExpandedVolunteer] = useState(null);
    const [processing, setProcessing] = useState(null); // volunteerId_eventId being processed

    const fetchAssignments = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/volunteer-assignments`, {
                credentials: "include"
            });
            const json = await res.json();
            if (res.ok) setData(json);
            else toast.error(json.error || "Failed to load assignments.");
        } catch {
            toast.error("Connection error. Could not load assignments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAssignments(); }, []);

    const handleAssign = async (volunteerId, eventId) => {
        const key = `${volunteerId}_${eventId}`;
        setProcessing(key);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/assign-volunteer`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
                credentials: "include",
                body: JSON.stringify({ volunteerId, eventId })
            });
            const json = await res.json();
            if (res.ok) {
                toast.success(json.message);
                fetchAssignments();
            } else {
                toast.error(json.error || "Assignment failed.");
            }
        } catch {
            toast.error("Network error during assignment.");
        } finally {
            setProcessing(null);
        }
    };

    const handleRemove = async (volunteerId, eventId) => {
        const key = `${volunteerId}_${eventId}`;
        setProcessing(key);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/remove-assignment`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
                credentials: "include",
                body: JSON.stringify({ volunteerId, eventId })
            });
            const json = await res.json();
            if (res.ok) {
                toast.success("Volunteer removed from event.");
                fetchAssignments();
            } else {
                toast.error(json.error || "Removal failed.");
            }
        } catch {
            toast.error("Network error during removal.");
        } finally {
            setProcessing(null);
        }
    };

    const filteredVolunteers = data.volunteers.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.regNo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAssigned = (volunteer, eventId) =>
        volunteer.managedEvents.some(a => a.eventId === eventId);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="flex items-center gap-3 text-white/40">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-bold uppercase tracking-widest">Loading assignments...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Staff Count</p>
                    <p className="text-2xl font-black text-white">{data.volunteers.length}</p>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Events</p>
                    <p className="text-2xl font-black text-[#22D3EE]">{data.events.length}</p>
                </div>
                <div className="md:col-span-1 bg-black/30 border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Total Assignments</p>
                    <p className="text-2xl font-black text-[#9D01E9]">
                        {data.volunteers.reduce((acc, v) => acc + v.managedEvents.length, 0)}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    placeholder="Search volunteers by name, reg no, or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:border-[#9D01E9]/50 outline-none transition-colors placeholder:text-white/20"
                />
            </div>

            {/* Warning if no events */}
            {data.events.length === 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
                    <p className="text-amber-400 font-bold text-sm">No events found. Create events in The Event Forge first.</p>
                </div>
            )}

            {/* Volunteer → Event Assignment Grid */}
            <div className="space-y-3">
                {filteredVolunteers.length === 0 && (
                    <div className="text-center py-16 text-white/20 font-bold uppercase tracking-widest text-sm">
                        {data.volunteers.length === 0 ? "No volunteers or coordinators found." : "No results match your search."}
                    </div>
                )}

                {filteredVolunteers.map(volunteer => {
                    const isExpanded = expandedVolunteer === volunteer.id;

                    return (
                        <motion.div
                            key={volunteer.id}
                            layout
                            className="bg-black/30 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
                        >
                            {/* Volunteer header row */}
                            <button
                                onClick={() => setExpandedVolunteer(isExpanded ? null : volunteer.id)}
                                className="w-full flex items-center gap-4 p-5 text-left"
                            >
                                {/* Avatar / Role Badge */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                                    volunteer.role === 'COORDINATOR'
                                        ? 'bg-[#C53099]/20 text-[#C53099]'
                                        : 'bg-[#22D3EE]/20 text-[#22D3EE]'
                                }`}>
                                    {volunteer.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white font-bold text-sm truncate">{volunteer.name}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                            volunteer.role === 'COORDINATOR'
                                                ? 'bg-[#C53099]/20 text-[#C53099]'
                                                : 'bg-[#22D3EE]/20 text-[#22D3EE]'
                                        }`}>
                                            {volunteer.role}
                                        </span>
                                    </div>
                                    <p className="text-white/30 text-xs mt-0.5 truncate">{volunteer.email}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                        <span className={`text-xs font-black ${volunteer.managedEvents.length > 0 ? 'text-emerald-400' : 'text-white/20'}`}>
                                            {volunteer.managedEvents.length} event{volunteer.managedEvents.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {/* Expanded: Event Assignment Grid */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 pt-0">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">
                                                Toggle event assignments ↓
                                            </p>
                                            {data.events.length === 0 ? (
                                                <p className="text-white/20 text-xs">No events available.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {data.events.map(event => {
                                                        const assigned = isAssigned(volunteer, event.id);
                                                        const processKey = `${volunteer.id}_${event.id}`;
                                                        const isProcessing = processing === processKey;

                                                        return (
                                                            <button
                                                                key={event.id}
                                                                onClick={() => assigned
                                                                    ? handleRemove(volunteer.id, event.id)
                                                                    : handleAssign(volunteer.id, event.id)
                                                                }
                                                                disabled={!!processing}
                                                                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all group ${
                                                                    assigned
                                                                        ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-red-500/10 hover:border-red-500/30'
                                                                        : 'bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/15'
                                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            >
                                                                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                                                                    assigned
                                                                        ? 'bg-emerald-500/30 group-hover:bg-red-500/30'
                                                                        : 'bg-white/5'
                                                                }`}>
                                                                    {isProcessing ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin text-white/50" />
                                                                    ) : assigned ? (
                                                                        <CheckCircle2 className="w-3 h-3 text-emerald-400 group-hover:text-red-400 transition-colors" />
                                                                    ) : (
                                                                        <div className="w-2.5 h-2.5 rounded border border-white/20" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-white/80 text-xs font-bold truncate group-hover:text-white transition-colors">
                                                                        {event.title}
                                                                    </p>
                                                                    <p className="text-white/30 text-[10px] font-mono">{event.date}</p>
                                                                </div>
                                                                <span className={`text-[9px] font-black uppercase shrink-0 transition-colors ${
                                                                    assigned
                                                                        ? 'text-emerald-400 group-hover:text-red-400'
                                                                        : 'text-white/20 group-hover:text-white/50'
                                                                }`}>
                                                                    {assigned ? 'Remove' : 'Assign'}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

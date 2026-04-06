import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Users, Ticket, CheckCircle, AlertTriangle, RefreshCcw, Activity, BarChart3, GraduationCap } from "lucide-react";

export default function DashboardOverview() {
    const { csrfToken } = useAuth();
    const toast = useToast();
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/overview-stats`, {
                headers: { "x-csrf-token": csrfToken },
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            } else {
                toast.error("Failed to load analytics");
            }
        } catch (err) {
            toast.error("Network error while fetching stats");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCcw className="w-8 h-8 text-[#9D01E9] animate-spin mb-4" />
                <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Compiling Analytics...</p>
            </div>
        );
    }

    if (!stats) return null;

    const onboardedPercent = stats.totalUsers > 0 ? Math.round((stats.onboardedUsers / stats.totalUsers) * 100) : 0;
    const scanPercent = stats.totalRegistrations > 0 ? Math.round((stats.scannedRegistrations / stats.totalRegistrations) * 100) : 0;
    const maxReg = Math.max(...(stats.eventStats?.map(e => e.totalReg) || [1]), 1);

    return (
        <div className="space-y-8">
            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-[#AF94D2] flex items-center gap-3">
                        <Activity className="w-6 h-6 text-[#22D3EE]" />
                        System Analytics
                    </h2>
                    <p className="text-sm text-white/40 mt-1">Real-time overview of festival performance</p>
                </div>
                <button
                    onClick={() => fetchStats(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all disabled:opacity-50"
                >
                    <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#22D3EE]" : "text-[#9D01E9]"}`} />
                    {refreshing ? "Syncing..." : "Refresh Data"}
                </button>
            </div>

            {/* ── TOP METRIC CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#22D3EE]/10 blur-2xl group-hover:bg-[#22D3EE]/20 transition-all" />
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Total Users</p>
                        <Users className="w-5 h-5 text-[#22D3EE]" />
                    </div>
                    <h3 className="text-4xl font-black text-white">{stats.totalUsers}</h3>
                </div>

                <div className="p-6 bg-black/40 border border-red-500/20 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-2xl group-hover:bg-red-500/20 transition-all" />
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Incomplete Profiles</p>
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="text-4xl font-black text-white">{stats.incompleteUsers}</h3>
                    <div className="mt-4 w-full bg-white/5 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${100 - onboardedPercent}%` }} />
                    </div>
                    <p className="text-[10px] text-white/40 mt-2 text-right">{100 - onboardedPercent}% missing data</p>
                </div>

                <div className="p-6 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#9D01E9]/10 blur-2xl group-hover:bg-[#9D01E9]/20 transition-all" />
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Total Registrations</p>
                        <Ticket className="w-5 h-5 text-[#9D01E9]" />
                    </div>
                    <h3 className="text-4xl font-black text-white">{stats.totalRegistrations}</h3>
                </div>

                <div className="p-6 bg-black/40 border border-[#25D366]/20 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#25D366]/10 blur-2xl group-hover:bg-[#25D366]/20 transition-all" />
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Attendees Scanned</p>
                        <CheckCircle className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <h3 className="text-4xl font-black text-white">{stats.scannedRegistrations}</h3>
                    <div className="mt-4 w-full bg-white/5 rounded-full h-1.5">
                        <div className="bg-[#25D366] h-1.5 rounded-full" style={{ width: `${scanPercent}%` }} />
                    </div>
                    <p className="text-[10px] text-white/40 mt-2 text-right">{scanPercent}% conversion rate</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── EVENT PERFORMANCE GRAPH ── */}
                <div className="lg:col-span-2 bg-black/40 border border-white/5 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[#C53099]" />
                            Event Performance Graph
                        </h3>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#9D01E9]" /> Registrations</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#25D366]" /> Admitted</div>
                        </div>
                    </div>

                    {stats.eventStats.length === 0 ? (
                        <p className="text-center text-white/40 text-xs py-20">No events registered in the system yet.</p>
                    ) : (
                        // FIX: Increased height to 350px and top-padding to pt-32 to prevent tooltip clipping
                        <div className="relative w-full h-[350px] flex items-end gap-2 sm:gap-4 border-b border-white/10 pb-2 overflow-x-auto hide-scrollbar pt-32">
                            {stats.eventStats.map((event, index) => {
                                const regHeight = (event.totalReg / maxReg) * 100;
                                const scanHeight = maxReg > 0 ? (event.scanned / maxReg) * 100 : 0;

                                return (
                                    <div key={event.id} className="relative flex-1 min-w-[40px] max-w-[80px] flex flex-col items-center justify-end h-full group">
                                        
                                        {/* FIX: Increased z-index and spacing for the tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#13072E] border border-white/10 p-4 rounded-xl pointer-events-none z-50 w-48 shadow-2xl translate-y-4 group-hover:translate-y-0">
                                            <p className="text-xs font-bold text-white mb-2 leading-tight break-words whitespace-normal text-center">{event.title}</p>
                                            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest mb-1">
                                                <span className="text-[#9D01E9]">Registered</span>
                                                <span className="text-white">{event.totalReg}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                                                <span className="text-[#25D366]">Admitted</span>
                                                <span className="text-white">{event.scanned}</span>
                                            </div>
                                        </div>

                                        {/* Graph Bars */}
                                        <div className="flex items-end justify-center w-full gap-[2px] h-[85%]">
                                            <motion.div 
                                                initial={{ height: 0 }} animate={{ height: `${regHeight}%` }} transition={{ duration: 1, delay: index * 0.05 }}
                                                className="w-1/2 bg-gradient-to-t from-[#9D01E9]/20 to-[#9D01E9] rounded-t-sm" 
                                            />
                                            <motion.div 
                                                initial={{ height: 0 }} animate={{ height: `${scanHeight}%` }} transition={{ duration: 1, delay: (index * 0.05) + 0.2 }}
                                                className="w-1/2 bg-gradient-to-t from-[#25D366]/20 to-[#25D366] rounded-t-sm" 
                                            />
                                        </div>
                                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-2 truncate w-full text-center group-hover:text-white transition-colors cursor-default">
                                            {event.title.substring(0, 6)}..
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── TOP COLLEGES ── */}
                <div className="bg-black/40 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-[#22D3EE]" />
                            Top Colleges
                        </h3>
                    </div>

                    {stats.collegeStats?.length === 0 ? (
                        <p className="text-center text-white/40 text-xs py-10">No college data available.</p>
                    ) : (
                        <div className="space-y-3 flex-1 overflow-y-auto pr-2 hide-scrollbar">
                            {stats.collegeStats?.map((college, index) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                                    key={index} 
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-6 h-6 rounded-full bg-[#22D3EE]/10 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-black text-[#22D3EE]">{index + 1}</span>
                                        </div>
                                        <p className="text-xs font-bold text-white/80 truncate pr-2" title={college.name}>
                                            {college.name}
                                        </p>
                                    </div>
                                    <div className="shrink-0 bg-[#22D3EE]/20 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                                        <span className="text-[10px] font-black text-[#22D3EE] tracking-widest">
                                            {college.count}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
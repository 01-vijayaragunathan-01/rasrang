import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Download, Search, Filter, Loader2, CheckCircle, 
    XCircle, Users, BarChart3, ChevronLeft, ChevronRight, 
    ArrowUpDown, Building2 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function AttendeeRegistry() {
    const { csrfToken } = useAuth();
    const toast = useToast();
    const [attendees, setAttendees] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters, Sorting, and Pagination State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEventId, setSelectedEventId] = useState("All");
    const [sortBy, setSortBy] = useState(""); // "" | "name" | "college"
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20; // Items per page

    // Global Stats State (ensures stats stay accurate even when viewing a single page)
    const [stats, setStats] = useState({ unique: 0, registrations: 0, verified: 0 });

    // Fetch Events for the Dropdown
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setEvents(data); })
            .catch(err => console.error("Error fetching events:", err));
    }, []);

    // Fetch Attendees
    const fetchAttendees = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (selectedEventId !== "All") queryParams.append("eventId", selectedEventId);
            if (searchQuery) queryParams.append("search", searchQuery);
            
            // Append Pagination & Sort Params for backend (if supported)
            queryParams.append("page", currentPage);
            queryParams.append("limit", limit);
            if (sortBy) queryParams.append("sortBy", sortBy);
             if (sortBy === 'college') {
                queryParams.append("sortBy", 'clgName');
            } else  {
                queryParams.append("sortBy", sortBy);
            }

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/attendees?${queryParams.toString()}`, {
                credentials: "include"
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();

            let fetchedAttendees = [];
            let calcStats = { unique: 0, registrations: 0, verified: 0 };
            let pages = 1;

            // Handle both flat Array (No Backend Pagination) OR Object (Backend Pagination)
            if (Array.isArray(data)) {
                // FALLBACK: Perform sorting and pagination on the frontend
                let processedData = [...data];

                // 1. Frontend Sort
                if (sortBy === 'college') {
                    processedData.sort((a, b) => (a.clgName || "").localeCompare(b.clgName || ""));
                } else if (sortBy === 'name') {
                    processedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                }

                // 2. Global Stats Calculation
                calcStats.unique = processedData.length;
                calcStats.registrations = processedData.reduce((sum, u) => sum + (u.registrations?.length || 0), 0);
                calcStats.verified = processedData.reduce((sum, u) => sum + (u.registrations?.filter(r => r.scanned)?.length || 0), 0);

                // 3. Frontend Pagination
                pages = Math.ceil(processedData.length / limit) || 1;
                const startIndex = (currentPage - 1) * limit;
                fetchedAttendees = processedData.slice(startIndex, startIndex + limit);
            } else {
                // BACKEND SUPPORTS PAGINATION
                fetchedAttendees = data.attendees || [];
                pages = data.totalPages || 1;
                calcStats = {
                    unique: data.totalUnique || fetchedAttendees.length,
                    registrations: data.totalRegistrations || 0,
                    verified: data.totalVerified || 0
                };
            }

            setAttendees(fetchedAttendees);
            setTotalPages(pages);
            setStats(calcStats);

        } catch (error) {
            console.error("Attendee fetch error:", error);
            toast.error("Failed to query attendee databanks.");
            setAttendees([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounce triggers fetch on any parameter change
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchAttendees();
        }, 400);
        return () => clearTimeout(delay);
    }, [searchQuery, selectedEventId, sortBy, currentPage]);

    // Handlers to reset to Page 1 when filters change
    const handleSearch = (e) => { setSearchQuery(e.target.value); setCurrentPage(1); };
    const handleEventFilter = (e) => { setSelectedEventId(e.target.value); setCurrentPage(1); };
    const handleSort = (e) => { setSortBy(e.target.value); setCurrentPage(1); };

    // Download CSV
    const handleDownloadCSV = () => {
        const queryParams = new URLSearchParams();
        if (selectedEventId !== "All") queryParams.append("eventId", selectedEventId);
        if (sortBy) queryParams.append("sortBy", sortBy);
        window.open(`${import.meta.env.VITE_API_BASE_URL}/api/admin/attendees/export?${queryParams.toString()}`, '_blank');
        toast.success("Registry export initiated.");
    };

    return (
        <div className="space-y-8">
            {/* ── STATS ROW ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="p-6 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-[#9D01E9]/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#9D01E9]" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Total Attendees</p>
                        <h3 className="text-2xl font-black text-white">{stats.unique}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="p-6 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-[#22D3EE]/20 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-[#22D3EE]" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Total Registrations</p>
                        <h3 className="text-2xl font-black text-[#22D3EE]">{stats.registrations}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="p-6 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-[#E4BD8D]/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-[#E4BD8D]" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Verified Entries</p>
                        <h3 className="text-2xl font-black text-[#E4BD8D]">{stats.verified}</h3>
                    </div>
                </motion.div>
            </div>

            {/* ── CONTROLS BAR ── */}
            <div className="flex flex-col xl:flex-row justify-between gap-4 items-stretch xl:items-center">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                        type="text" 
                        placeholder="Search by Name, RegNo, or Email..." 
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#C53099]/50 transition-colors placeholder:text-white/20"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Sort Dropdown */}
                    <div className="relative">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C53099]/60" />
                        <select 
                            value={sortBy}
                            onChange={handleSort}
                            className="bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-6 text-sm text-white outline-none focus:border-[#C53099]/50 transition-colors appearance-none cursor-pointer min-w-[160px]"
                        >
                            <option value="" className="bg-[#0A0A10]">Sort: Default</option>
                            <option value="name" className="bg-[#0A0A10]">Sort by Name</option>
                            <option value="college" className="bg-[#0A0A10]">Sort by College</option>
                        </select>
                    </div>

                    {/* Event Filter Dropdown */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#22D3EE]/60" />
                        <select 
                            value={selectedEventId}
                            onChange={handleEventFilter}
                            className="bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-6 text-sm text-white outline-none focus:border-[#22D3EE]/50 transition-colors appearance-none cursor-pointer min-w-[180px]"
                        >
                            <option value="All" className="bg-[#0A0A10]">All Events</option>
                            {events.map(ev => (
                                <option key={ev.id} value={ev.id} className="bg-[#0A0A10]">{ev.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Export Button */}
                    <button 
                        onClick={handleDownloadCSV}
                        disabled={attendees.length === 0 && stats.unique === 0}
                        className="flex items-center gap-2 bg-[#E4BD8D] text-[#13072E] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:shadow-[0_0_20px_rgba(228,189,141,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ── THE TABLE & PAGINATION ── */}
            <div className="w-full flex flex-col bg-black/20 rounded-2xl border border-white/5">
                <div className="w-full overflow-x-auto hide-scrollbar">
                    {loading ? (
                        <div className="w-full h-64 flex flex-col items-center justify-center text-[#E4BD8D]">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Querying Databanks...</p>
                        </div>
                    ) : attendees.length === 0 ? (
                        <div className="w-full h-64 flex flex-col items-center justify-center text-white/20">
                            <Users className="w-10 h-10 mb-4 opacity-30" />
                            <p className="text-sm font-bold">No attendees found.</p>
                            <p className="text-[10px] mt-2 text-white/10 uppercase tracking-widest">Try adjusting search or filters.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-black/40 border-b border-white/10 text-[10px] uppercase tracking-widest text-[#C53099]">
                                    <th className="py-4 px-5 font-bold">Attendee & Institution</th>
                                    <th className="py-4 px-5 font-bold">Contact</th>
                                    <th className="py-4 px-5 font-bold">Registered Events</th>
                                    <th className="py-4 px-5 font-bold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {attendees.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                                        {/* Identity & College */}
                                        <td className="py-4 px-5">
                                            <p className="text-white font-bold text-sm">{user.name}</p>
                                            <div className="flex flex-col gap-1 mt-1">
                                                {user.clgName && (
                                                    <span className="text-white/60 text-[10px] flex items-center gap-1.5 leading-none">
                                                        <Building2 className="w-3 h-3 text-white/40" /> {user.clgName}
                                                    </span>
                                                )}
                                                {user.regNo === user.email ? (
                                                    <p className="text-[#E31E6E] text-[9px] font-black uppercase tracking-tighter bg-[#E31E6E]/10 w-fit px-1.5 py-0.5 rounded border border-[#E31E6E]/20 mt-0.5">
                                                        Pending Onboarding
                                                    </p>
                                                ) : (
                                                    <p className="text-white/40 text-xs font-mono">{user.regNo || "—"}</p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="py-4 px-5">
                                            <p className="text-white/60 text-xs">{user.email}</p>
                                            <p className="text-white/30 text-xs mt-0.5">{user.phoneNo || "—"}</p>
                                        </td>

                                        {/* Events Tags */}
                                        <td className="py-4 px-5 max-w-[300px]">
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.registrations.map((reg, idx) => (
                                                    <span 
                                                        key={idx}
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md truncate max-w-[160px]
                                                        ${reg.scanned 
                                                            ? 'bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20' 
                                                            : 'bg-white/5 text-white/50 border border-white/10'
                                                        }`}
                                                        title={`${reg.event.title} (${reg.scanned ? 'Attended' : 'Pending'})`}
                                                    >
                                                        {reg.scanned && <CheckCircle className="w-2.5 h-2.5 flex-shrink-0" />}
                                                        {reg.event.title}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Attendance Summary */}
                                        <td className="py-4 px-5 text-center">
                                            {selectedEventId !== "All" ? (
                                                (() => {
                                                    const targetReg = user.registrations.find(r => r.event.id === selectedEventId);
                                                    return targetReg?.scanned ? (
                                                        <span className="inline-flex items-center gap-1.5 text-[#22D3EE] text-[10px] font-bold bg-[#22D3EE]/10 px-3 py-1.5 rounded-full border border-[#22D3EE]/20">
                                                            <CheckCircle className="w-3 h-3" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-white/30 text-[10px] font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                                            <XCircle className="w-3 h-3" /> Pending
                                                        </span>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-white/40 text-xs font-mono">
                                                    {user.registrations.filter(r => r.scanned).length}/{user.registrations.length}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── PAGINATION CONTROLS ── */}
                {!loading && stats.unique > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-t border-white/10 rounded-b-2xl">
                        <span className="text-xs text-white/40 font-mono">
                            Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
                        </span>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
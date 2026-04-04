import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Onboarding() {
    const { user, setUser, csrfToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    const [formData, setFormData] = useState({
        regNo: "",
        phoneNo: "",
        clgName: "",
        dept: "",
        year: "",
        branch: "",
        section: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.isOnboarded) {
            navigate("/profile", { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!formData.regNo || !formData.phoneNo || !formData.clgName || !formData.dept || !formData.year) {
            toast.error("MISSION CRITICAL: Fill all required fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/auth/onboard", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken 
                },
                body: JSON.stringify({ ...formData }),
                credentials: "include"
            });
            const data = await res.json();

            if (res.ok) {
                if (data.user) setUser(data.user);
                toast.success("BIOMETRICS ESTABLISHED: Onboarding Complete!");
                navigate("/events", { replace: true });
            } else {
                toast.error(`ERROR: ${data.error || "Onboarding failed"}`);
            }
        } catch (err) {
            toast.error("CONNECTION FAILURE: Identity sync severed.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#9D01E9] focus:bg-white/10 focus:shadow-[0_0_20px_rgba(157,1,233,0.2)] transition-all placeholder:text-white/30 font-medium";

    if (!user) return null; // Let ProtectedRoute handle this

    return (
        <section className="min-h-screen bg-[#04010F] flex items-center justify-center relative overflow-hidden pt-20">
            {/* ── Background Elements ── */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#9D01E9]/20 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-[#E31E6E]/15 blur-[130px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-2xl mx-4 my-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-[2.5rem] bg-[#0D0620]/80 backdrop-blur-3xl border border-white/10 p-8 sm:p-12 shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#9D01E9] to-[#E31E6E] p-[2px] mb-6">
                            <div className="w-full h-full rounded-full bg-[#0D0620] flex items-center justify-center">
                                <span className="text-3xl">🧬</span>
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Identity Initialization
                        </h1>
                        <p className="text-[#AF94D2] text-[10px] uppercase tracking-[0.4em] font-bold">
                            Finalizing your Bio-Metric Vault
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Register Number</label>
                                <input name="regNo" value={formData.regNo} onChange={handleChange} placeholder="e.g. RA2111..." required className={inputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Phone Number</label>
                                <input name="phoneNo" value={formData.phoneNo} onChange={handleChange} placeholder="Active Mobile No" required className={inputClass} />
                            </div>
                            <div className="space-y-1.5 col-span-full">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">College Name</label>
                                <input name="clgName" value={formData.clgName} onChange={handleChange} placeholder="e.g. SRM Institute..." required className={inputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Department</label>
                                <input name="dept" value={formData.dept} onChange={handleChange} placeholder="e.g. CTECH / ECE" required className={inputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Year of Study</label>
                                <select name="year" value={formData.year} onChange={handleChange} required className={`${inputClass} appearance-none`}>
                                    <option value="" disabled className="bg-[#0D0620]">Select Year</option>
                                    <option value="1st" className="bg-[#0D0620]">1st Year</option>
                                    <option value="2nd" className="bg-[#0D0620]">2nd Year</option>
                                    <option value="3rd" className="bg-[#0D0620]">3rd Year</option>
                                    <option value="4th" className="bg-[#0D0620]">4th Year</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Branch (Optional)</label>
                                <input name="branch" value={formData.branch} onChange={handleChange} placeholder="e.g. CSE" className={inputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Section (Optional)</label>
                                <input name="section" value={formData.section} onChange={handleChange} placeholder="e.g. A" className={inputClass} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#9D01E9] via-[#C53099] to-[#E31E6E] text-white font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(157,1,233,0.3)] hover:shadow-[0_15px_40px_rgba(157,1,233,0.5)] transition-all duration-300 disabled:opacity-50 mt-4 active:scale-95"
                        >
                            {loading ? "Initializing Vault..." : "Activate Account"}
                        </button>
                    </form>

                    <div className="mt-10 flex flex-col items-center">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
                        <p className="text-white/30 text-[9px] uppercase tracking-widest text-center leading-relaxed">
                            Securing your credentials. This data is strictly used for festival entry & certificate generation.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

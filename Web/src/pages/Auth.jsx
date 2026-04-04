import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Auth() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setCsrfToken, setUser } = useAuth();
    const toast = useToast();

    const from = location.state?.from || "/";

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        identifier: "", name: "", email: "", password: "",
        regNo: "", phoneNo: "", clgName: "", year: "", dept: "", branch: "", section: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
        const body = isLogin
            ? { identifier: formData.identifier, password: formData.password }
            : formData;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include"
            });
            const data = await res.json();
            if (!res.ok) {
                const errMsg = data.message || data.error || "Authentication Failed";
                setError(errMsg);
                toast.error(`ENTRY REJECTED: ${errMsg}`);
                return;
            }
            toast.success("IDENTITY RECOGNIZED: Access Granted.");
            if (data.user) setUser(data.user);
            if (data.csrfToken) setCsrfToken(data.csrfToken);
            
            if (data.user && !data.user.isOnboarded) {
                navigate("/onboarding", { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError("Connection to Central Intelligence severed.");
            toast.error("CONNECTION FAILURE: Platform unreachable.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#9D01E9] focus:bg-white/10 focus:shadow-[0_0_20px_rgba(157,1,233,0.2)] transition-all placeholder:text-white/30 font-medium";

    return (
        <section className="min-h-screen bg-[#04010F] flex items-center justify-center relative overflow-hidden">

            {/* ── Animated Gradient Orbs ── */}
            <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#9D01E9]/25 blur-[140px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[450px] h-[450px] bg-[#E31E6E]/20 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#C53099]/15 blur-[120px] rounded-full pointer-events-none" />

            {/* ── Subtle Grid Pattern ── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(rgba(157,1,233,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(157,1,233,0.5) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px"
                }}
            />

            {/* ── Giant Ghost Letters ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                <span
                    className="absolute -top-12 -left-6 text-[22vw] font-black uppercase leading-none tracking-tighter"
                    style={{
                        background: "linear-gradient(135deg, #9D01E9, #E31E6E)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        opacity: 0.04
                    }}
                >RAS</span>
                <span
                    className="absolute -bottom-12 -right-6 text-[22vw] font-black uppercase leading-none tracking-tighter"
                    style={{
                        background: "linear-gradient(135deg, #C53099, #E4BD8D)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        opacity: 0.04
                    }}
                >RANG</span>
            </div>

            {/* ── Auth Card ── */}
            <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, y: 32, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="relative z-10 w-full max-w-lg mx-4"
            >
                {/* Card Border Glow */}
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-[#9D01E9] via-[#C53099] to-[#E4BD8D] opacity-50 blur-sm" />

                <div className="relative rounded-3xl bg-[#0D0620]/90 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 overflow-hidden">

                    {/* Inner Top Shine */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                    {/* Logo / Brand */}
                    <div className="flex flex-col items-center mb-8">
                        <img src="/Assets/rasrang.png" alt="RasRang" className="h-14 w-auto object-contain mb-4 drop-shadow-[0_0_12px_rgba(157,1,233,0.8)]" />
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#9D01E9]" />
                            <span className="text-[#E4BD8D] text-[10px] font-bold uppercase tracking-[0.4em]">
                                Festival Access Portal
                            </span>
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#9D01E9]" />
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.h1
                                key={isLogin ? "wlc" : "join"}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="text-3xl sm:text-4xl font-black text-white mt-3 tracking-tight"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {isLogin ? "Welcome Back" : "Join the Vibe"}
                            </motion.h1>
                        </AnimatePresence>
                    </div>

                    {/* Error Banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-5 px-4 py-3 rounded-xl bg-[#E31E6E]/15 border border-[#E31E6E]/40 text-[#E31E6E] text-xs font-bold uppercase tracking-wide flex items-center gap-2"
                            >
                                <span>⚠</span> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full py-3.5 rounded-xl bg-white text-[#13072E] font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#E4BD8D] transition-all duration-300 hover:shadow-[0_0_24px_rgba(228,189,141,0.4)] active:scale-[0.98] mb-5"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5" alt="" />
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.div
                                    key="login-fields"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-3.5"
                                >
                                    <input
                                        type="text" name="identifier"
                                        value={formData.identifier} onChange={handleChange}
                                        placeholder="Register Number / Email" required
                                        className={inputClass}
                                    />
                                    <input
                                        type="password" name="password"
                                        value={formData.password} onChange={handleChange}
                                        placeholder="Password" required
                                        className={inputClass}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="signup-fields"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    <input name="name" onChange={handleChange} placeholder="Full Name" required className={`${inputClass} col-span-2`} />
                                    <input name="email" type="email" onChange={handleChange} placeholder="Email" required className={`${inputClass} col-span-2`} />
                                    <input name="password" type="password" onChange={handleChange} placeholder="Password" required className={`${inputClass} col-span-2`} />
                                    <input name="regNo" onChange={handleChange} placeholder="Register Number" required className={inputClass} />
                                    <input name="phoneNo" onChange={handleChange} placeholder="Phone Number" required className={inputClass} />
                                    <input name="clgName" onChange={handleChange} placeholder="College Name" className={inputClass} />
                                    <input name="year" onChange={handleChange} placeholder="Year (e.g. 3rd)" className={inputClass} />
                                    <input name="dept" onChange={handleChange} placeholder="Department" className={`${inputClass} col-span-2`} />
                                    <input name="branch" onChange={handleChange} placeholder="Branch" className={inputClass} />
                                    <input name="section" onChange={handleChange} placeholder="Section" className={inputClass} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] text-white overflow-hidden group transition-all duration-300 mt-2 disabled:opacity-60"
                            style={{
                                background: "linear-gradient(135deg, #9D01E9, #C53099, #E31E6E)",
                                boxShadow: "0 0 30px rgba(157,1,233,0.4)"
                            }}
                        >
                            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
                            <span className="relative z-10">
                                {loading ? "Verifying..." : isLogin ? "Authenticate" : "Create Identity"}
                            </span>
                        </button>
                    </form>

                    {/* Toggle */}
                    <p className="text-center text-white/40 text-xs uppercase tracking-widest mt-6">
                        {isLogin ? "New to RasRang?" : "Already a member?"}{" "}
                        <span
                            onClick={() => { setIsLogin(!isLogin); setError(""); }}
                            className="font-black cursor-pointer transition-colors"
                            style={{
                                background: "linear-gradient(90deg, #9D01E9, #E31E6E)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            {isLogin ? "Sign Up" : "Log In"}
                        </span>
                    </p>
                </div>
            </motion.div>
        </section>
    );
}

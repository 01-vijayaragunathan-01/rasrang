import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Auth() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setCsrfToken, setUser } = useAuth();
    const toast = useToast();
    
    // The path the user was trying to access
    const from = location.state?.from || "/profile";

    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState("STUDENT"); // STUDENT, VOLUNTEER, COORDINATOR

    // Form States
    const [formData, setFormData] = useState({
        identifier: "", // For login
        name: "", 
        email: "", 
        password: "", 
        regNo: "", 
        phoneNo: "",
        clgName: "", 
        year: "", 
        dept: "", 
        branch: "", 
        section: ""
    });

    const [error, setError] = useState("");

    const handleGoogleLogin = () => {
        // We could pass 'from' as a query param if the backend supported it, 
        // but for now, the backend redirects to /login?csrf=...
        // AuthContext already handles cleaning that up.
        window.location.href = "http://localhost:5000/api/auth/google";
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
        const body = isLogin 
            ? { identifier: formData.identifier, password: formData.password }
            : formData;

        try {
            const res = await fetch(`http://localhost:5000${endpoint}`, {
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
            
            // On successful local login
            toast.success("IDENTITY RECOGNIZED: Access Granted.");
            if (data.user) setUser(data.user);
            if (data.csrfToken) setCsrfToken(data.csrfToken);

            navigate(from, { replace: true });
        } catch (err) {
            setError("Connection to Central Intelligence severed.");
            toast.error("CONNECTION FAILURE: Platform unreachable.");
        }
    };

    return (
        <section className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden pt-24">
            {/* Massive Background Text for Vibe */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
                <h1 className="text-[30vw] font-black absolute -top-20 -left-10 rotate-12">ENTRY</h1>
                <h1 className="text-[25vw] font-black absolute -bottom-20 -right-10 -rotate-12">GATE</h1>
            </div>

            <motion.div 
                initial={{ rotate: -3, scale: 0.9, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                className="relative z-10 w-full max-w-xl bg-[#1E1B4B] border-2 border-[#9D01E9] p-8 md:p-12 shadow-[12px_12px_0px_#E31E6E]"
            >
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-2">
                    {isLogin ? "Welcome Back" : "Join The Rave"}
                </h2>
                <p className="text-[#AF94D2] uppercase text-[10px] tracking-[0.4em] mb-10 opacity-70">
                    Official Festival Entrance Portal
                </p>

                {error && (
                    <div className="bg-[#E31E6E]/20 border border-[#E31E6E] text-[#E31E6E] p-3 mb-6 text-xs font-bold uppercase tracking-wide">
                        ⚠️ {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Google Login Button */}
                    <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white text-black font-black uppercase flex items-center justify-center gap-4 hover:bg-[#FACC15] transition-all transform hover:-translate-y-1 active:translate-y-0"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5" alt="google" />
                        Continue with Google
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow h-px bg-white/10"></div>
                        <span className="px-4 text-[10px] text-white/30 font-bold uppercase tracking-widest">or use credentials</span>
                        <div className="flex-grow h-px bg-white/10"></div>
                    </div>

                    {/* RegNo / Password Form */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {isLogin ? (
                            <>
                                <input 
                                    type="text" 
                                    name="identifier"
                                    value={formData.identifier}
                                    onChange={handleChange}
                                    placeholder="REGISTER NUMBER / EMAIL" 
                                    required
                                    className="w-full bg-[#020617]/50 border border-white/10 p-4 text-white outline-none focus:border-[#9D01E9] transition-all font-bold placeholder:text-white/20"
                                />
                                <input 
                                    type="password" 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="PASSWORD" 
                                    required
                                    className="w-full bg-[#020617]/50 border border-white/10 p-4 text-white outline-none focus:border-[#9D01E9] transition-all font-bold placeholder:text-white/20"
                                />
                            </>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="name" onChange={handleChange} placeholder="FULL NAME" required className="col-span-full w-full bg-[#020617]/50 border border-white/10 p-3 text-white outline-none focus:border-[#22D3EE] text-sm uppercase" />
                                <input name="email" type="email" onChange={handleChange} placeholder="EMAIL" required className="col-span-full w-full bg-[#020617]/50 border border-white/10 p-3 text-white outline-none focus:border-[#22D3EE] text-sm uppercase" />
                                <input name="password" type="password" onChange={handleChange} placeholder="PASSWORD" required className="col-span-full w-full bg-[#020617]/50 border border-white/10 p-3 text-white outline-none focus:border-[#22D3EE] text-sm uppercase" />
                                <input name="regNo" onChange={handleChange} placeholder="REGISTER NUMBER" required className="w-full bg-[#020617]/50 border border-white/10 p-3 text-white outline-none focus:border-[#22D3EE] text-sm uppercase" />
                                <input name="phoneNo" onChange={handleChange} placeholder="PHONE NUMBER" required className="w-full bg-[#020617]/50 border border-white/10 p-3 text-white outline-none focus:border-[#22D3EE] text-sm uppercase" />
                                <input name="clgName" onChange={handleChange} placeholder="COLLEGE NAME" className="w-full bg-[#020617]/50 border border-white/10 p-3 text-white outline-none focus:border-[#22D3EE] text-sm uppercase" />
                                <input name="year" onChange={handleChange} placeholder="YEAR (e.g. 3rd)" className="w-full bg-[#020617]/50 border border-white/10 p-3 text-white outline-none focus:border-[#22D3EE] text-sm uppercase" />
                                <input name="dept" onChange={handleChange} placeholder="DEPARTMENT" className="col-span-full md:col-span-1 w-full bg-[#020617]/50 border border-white/10 p-3 text-white outline-none focus:border-[#22D3EE] text-sm uppercase" />
                                <div className="flex gap-2 w-full">
                                    <input name="branch" onChange={handleChange} placeholder="BRANCH" className="w-1/2 bg-[#020617]/50 border border-white/10 p-3 text-white outline-none focus:border-[#22D3EE] text-sm uppercase" />
                                    <input name="section" onChange={handleChange} placeholder="SEC" className="w-1/2 bg-[#020617]/50 border border-white/10 p-3 text-white outline-none focus:border-[#22D3EE] text-sm uppercase" />
                                </div>
                            </div>
                        )}
                        
                        <button type="submit" className="w-full py-5 bg-[#9D01E9] text-white font-black uppercase tracking-[0.2em] hover:shadow-[0_0_30px_#9D01E9] transition-all mt-4 relative overflow-hidden group">
                            <span className="relative z-10">{isLogin ? "Authenticate" : "Create Identity"}</span>
                            <div className="absolute inset-0 bg-[#E31E6E] w-0 group-hover:w-full transition-all duration-300 ease-in-out z-0"></div>
                        </button>
                    </form>

                    <p className="text-center text-white/40 text-xs uppercase tracking-widest mt-6">
                        {isLogin ? "New to RasRang?" : "Already a member?"}{" "}
                        <span 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#22D3EE] cursor-pointer hover:underline font-black"
                        >
                            {isLogin ? "Sign Up" : "Log In"}
                        </span>
                    </p>
                </div>
            </motion.div>
        </section>
    );
}

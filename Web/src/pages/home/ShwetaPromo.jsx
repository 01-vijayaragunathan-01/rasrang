import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { Sparkles, Music, Mic2, Award, Star, Pointer } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Particles from "./Particles";

gsap.registerPlugin(ScrollTrigger);

export default function ShwetaPromo() {
    const { theme } = useTheme();
    const sectionRef = useRef(null);
    const cardRef = useRef(null);

    // --- State for Image Swapping ---
    const [isFlipped, setIsFlipped] = useState(false);

    const tracklist = [
        "ENNA SOLLA", "NEE MARILYN MONROE", "YAMMA YAMMA", 
        "BOOM BOOM ROBO DA", "INNUM KONJAM NERAM", "MAYA MACHINDRA"
    ];

    // --- 3D Magnetic Hover Logic for Images ---
    const imageX = useMotionValue(0);
    const imageY = useMotionValue(0);
    const rotateX = useTransform(imageY, [-100, 100], [10, -10]);
    const rotateY = useTransform(imageX, [-100, 100], [-10, 10]);

    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        imageX.set(event.clientX - rect.left - rect.width / 2);
        imageY.set(event.clientY - rect.top - rect.height / 2);
    }
    
    function handleMouseLeave() {
        imageX.set(0);
        imageY.set(0);
    }

    // --- GSAP Scroll Animations ---
    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo(cardRef.current,
                { y: 80, opacity: 0, scale: 0.95 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Dynamic Class Generators for the Photo Stack
    const frontCardStyles = "z-20 border-fuchsia-500/30 shadow-[0_40px_80px_rgba(0,0,0,0.9)] group-hover:-translate-x-6 group-hover:translate-y-4 group-hover:-rotate-2 group-hover:scale-105";
    const backCardStyles = "z-10 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group-hover:translate-x-12 group-hover:-translate-y-6 group-hover:rotate-6 group-hover:scale-95";
    
    const frontImgStyles = "opacity-90 group-hover:opacity-100 mix-blend-normal";
    const backImgStyles = "opacity-60 group-hover:opacity-90 mix-blend-luminosity group-hover:mix-blend-normal";

    return (
        <div>
        <div ref={sectionRef} className="relative w-full pt-20 pb-16 overflow-hidden bg-black/20">
            
            {/* --- DEPTH LAYER 1: BACKDROP BLUR --- */}
            <div className="absolute inset-0 z-0 backdrop-blur-[120px] pointer-events-none" />

            {/* --- DEPTH LAYER 2: LOCALIZED PARTICLE ENGINE --- */}
            <div className="absolute inset-0 z-[1] pointer-events-none opacity-60 hardware-accelerated">
                <Particles 
                    particleCount={250}
                    particleColors={["#22D3EE", "#D946EF", "#ffffff"]} 
                    speed={0.12}
                    particleBaseSize={100}
                    sizeRandomness={0.9}
                />
            </div>

            {/* --- DEPTH LAYER 3: CINEMATIC GLOWS --- */}
            <div className="absolute top-0 left-[10%] w-[40rem] h-[40rem] bg-cyan-500/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen z-[2]" />
            <div className="absolute bottom-0 right-[10%] w-[50rem] h-[50rem] bg-fuchsia-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen z-[2]" />

            {/* --- MAIN CONTENT FOREGROUND --- */}
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 relative z-10">
                
                {/* --- SECTION HEADER --- */}
                <div className="text-center mb-16 flex flex-col items-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <p className="flex items-center justify-center gap-3 text-xs tracking-[0.5em] uppercase mb-4 font-bold font-accent drop-shadow-md text-cyan-400 whitespace-nowrap">
                            <Sparkles size={14} className="text-fuchsia-400" /> ✦ The Soulful Symphony ✦ <Sparkles size={14} className="text-fuchsia-400" />
                        </p>
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-wider font-massive text-white drop-shadow-2xl whitespace-nowrap">
                            A Night of <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400">Magic</span>
                        </h2>
                        <div className="w-24 h-1 mt-6 mx-auto rounded-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-50" />
                    </motion.div>
                </div>

                {/* --- PREMIUM GLASS CARD --- */}
                <div 
                    ref={cardRef}
                    className="relative w-full min-h-[650px] lg:min-h-[700px] rounded-[2rem] md:rounded-[3.5rem] border border-white/10 bg-[#0a0514]/80 backdrop-blur-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col lg:flex-row group hardware-accelerated"
                >
                    {/* Animated Edge Light Sweep */}
                    <div className="absolute top-0 left-0 w-[200%] h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent -translate-x-full animate-[sweep_4s_ease-in-out_Infinite]" />

                    {/* --- LEFT: CONTENT & TYPOGRAPHY --- */}
                    <div className="relative z-30 w-full lg:w-[55%] p-8 sm:p-12 lg:p-20 flex flex-col justify-center text-center lg:text-left h-full">
                        
                        {/* Event Tag */}
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 w-fit mb-8 mx-auto lg:mx-0 backdrop-blur-md shadow-[0_0_20px_rgba(217,70,239,0.15)]">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-200 whitespace-nowrap">
                                Day 02 • Grand Finale • Apr 10
                            </span>
                        </div>

                        {/* Name & Visualizer */}
                        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 mb-4 justify-center lg:justify-start">
                            <h3 className="flex flex-col text-5xl sm:text-6xl md:text-[6rem] lg:text-[7rem] font-black uppercase tracking-tighter font-massive text-white leading-[0.85] drop-shadow-2xl">
                                <span className="whitespace-nowrap">SHWETA</span>
                                <span className="whitespace-nowrap">MOHAN</span>
                            </h3>
                            
                            {/* Vibrant Audio Visualizer */}
                            <div className="flex gap-1.5 items-end h-10 pb-2 lg:mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: ["20%", "100%", "30%", "80%", "20%"] }}
                                        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1, ease: "easeInOut" }}
                                        className="w-2 rounded-t-sm bg-gradient-to-t from-fuchsia-500 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-10">
                            <div className="h-px w-12 bg-fuchsia-500/50" />
                            <p className="text-xl md:text-3xl font-serif italic text-cyan-300 drop-shadow-lg whitespace-nowrap">
                                The Melody Queen
                            </p>
                            <div className="h-px w-12 bg-fuchsia-500/50 hidden sm:block" />
                        </div>

                        <div className="text-white/85 font-body leading-7 md:leading-8 max-w-xl mx-auto lg:mx-0 mb-10 text-sm md:text-base border-l-4 border-fuchsia-500/50 pl-6">
                            The classified vault is officially unlocked. Prepare to be mesmerized as the voice behind Kollywood’s most magical chartbusters takes the stage. Close your eyes, feel the music, and let the Melody Queen orchestrate the perfect grand finale for RasRang 2K26.
                        </div>

                        {/* Accolade Badges */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/90 backdrop-blur-md cursor-default whitespace-nowrap">
                                <Award size={16} className="text-yellow-400" /> 4x Filmfare Winner
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/90 backdrop-blur-md cursor-default whitespace-nowrap">
                                <Mic2 size={16} className="text-cyan-400" /> Super Singer Icon
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: MODERN 3D MAGNETIC PHOTO STACK --- */}
                    <div 
                        className="lg:w-[45%] relative w-full min-h-[500px] lg:min-h-full flex items-center justify-center perspective-1000 z-20 py-10"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Interactive Wrapper */}
                        <motion.div 
                            style={{ rotateX, rotateY, x: imageX, y: imageY }}
                            transition={{ type: "spring", stiffness: 100, damping: 30 }}
                            className="relative w-[70%] sm:w-[50%] lg:w-[65%] aspect-[3/4] group cursor-pointer"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            {/* Ambient Glow behind the stack */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15)_0%,rgba(34,211,238,0.15)_50%,transparent_70%)] blur-[40px] pointer-events-none z-0" />

                            {/* Floating Instruction */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-black/60 border border-fuchsia-500/30 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-cyan-300 flex items-center gap-2 backdrop-blur-md animate-bounce whitespace-nowrap">
                                <Pointer size={12} className="text-fuchsia-400" /> Click to swap views
                            </div>

                            {/* --- IMAGE 2: CONCERT BACKGROUND --- */}
                            <div 
                                className={`absolute inset-0 rounded-3xl border-4 bg-black overflow-hidden transform transition-all duration-[0.8s] ease-out ${isFlipped ? frontCardStyles : backCardStyles}`}
                            >
                                <img 
                                    src="/Assets/hero/shweta1.png" 
                                    alt="Shweta Live" 
                                    className={`w-full h-full object-cover transition-all duration-700 ${isFlipped ? frontImgStyles : backImgStyles}`}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] via-[#0a0514]/20 to-transparent pointer-events-none" />
                                
                                <div className={`absolute bottom-6 left-6 flex items-center gap-3 transition-opacity duration-500 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="w-10 h-10 rounded-full border border-fuchsia-400/50 bg-fuchsia-500/20 backdrop-blur-sm flex items-center justify-center">
                                        <Mic2 size={16} className="text-cyan-300" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-cyan-300 whitespace-nowrap">Live Stage</p>
                                        <p className="text-white font-bold tracking-widest uppercase whitespace-nowrap">Shweta M.</p>
                                    </div>
                                </div>
                            </div>

                            {/* --- IMAGE 1: PRIMARY PORTRAIT --- */}
                            <div 
                                className={`absolute inset-0 rounded-3xl border-4 bg-black overflow-hidden transform transition-all duration-[0.8s] ease-out ${!isFlipped ? frontCardStyles : backCardStyles}`}
                            >
                                <img 
                                    src="/Assets/hero/shweta.jpg" 
                                    alt="Shweta Portrait" 
                                    className={`w-full h-full object-cover object-bottom transition-all duration-700 ${!isFlipped ? frontImgStyles : backImgStyles}`}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] via-[#0a0514]/20 to-transparent pointer-events-none" />
                                
                                <div className={`absolute bottom-6 left-6 flex items-center gap-3 transition-opacity duration-500 ${!isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="w-10 h-10 rounded-full border border-fuchsia-400/50 bg-fuchsia-500/20 backdrop-blur-sm flex items-center justify-center">
                                        <Music size={16} className="text-cyan-300" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-cyan-300 whitespace-nowrap">Live Focus</p>
                                        <p className="text-white font-bold tracking-widest uppercase whitespace-nowrap">Shweta M.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cinematic Glass Glare on Hover */}
                            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-[100%] transition-transform duration-[1.5s] ease-in-out skew-x-12 pointer-events-none z-30" />
                        </motion.div>
                    </div>

                    {/* Structural Fade for Mobile */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] via-[#0a0514]/80 to-transparent lg:hidden z-10 pointer-events-none" />
                </div>
            </div>

            
        </div>

        {/* --- SCROLLING HYPE TICKER TAPE (Top-Left to Bottom-Right Tilt) --- */}
            <div className="w-full relative z-30 bg-[#030008]/80 backdrop-blur-lg py-4 overflow-hidden flex whitespace-nowrap origin-center rotate-2 scale-105 my-12 border-y border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
                <motion.div
                    animate={{ x: ["-50%", "0%"] }} // Scrolling Left to Right
                    transition={{ repeat: Infinity, duration: 100, ease: "linear" }}
                    className="flex w-max items-center gap-12 font-black uppercase text-xl md:text-2xl tracking-widest drop-shadow-lg text-white/90"
                >
                    {[...Array(12)].map((_, i) => (
                        <span key={i} className="flex items-center gap-12">
                            {tracklist.map((track, j) => (
                                <React.Fragment key={`${i}-${j}`}>
                                    <span className="transition-colors cursor-default hover:text-cyan-300">{track}</span>
                                    <Sparkles size={20} className="text-fuchsia-500/80" />
                                </React.Fragment>
                            ))}
                        </span>
                    ))}
                </motion.div>
            </div>

            <style jsx>{`
                @keyframes sweep {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
}
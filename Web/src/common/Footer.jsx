import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import devData from "../data/dev.json";

function DevCredit({ member, theme }) {
  const [isHovered, setIsHovered] = useState(false);

  // Map teammate ID to their respective brand color from the theme
  const accentColors = [theme.colors.primary, theme.colors.secondary, theme.colors.accent];
  const myColor = accentColors[(member.id - 1) % accentColors.length];

  return (
    <div className="relative inline-block mx-1"
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}>
      
      {/* The Glow Capsule */}
      <motion.span 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="cursor-pointer px-4 py-1.5 rounded-full border text-[10px] tracking-[0.2em] font-black uppercase transition-all duration-300 flex items-center gap-2"
        style={{ 
            borderColor: isHovered ? myColor : 'rgba(255,255,255,0.1)',
            background: isHovered ? `${myColor}15` : 'rgba(255,255,255,0.03)',
            color: isHovered ? '#fff' : 'rgba(255,255,255,0.5)',
            boxShadow: isHovered ? `0 0 20px ${myColor}30` : 'none'
        }}
      >
        <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: myColor }} />
        {member.name}
      </motion.span>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 min-w-[320px] rounded-2xl z-[9999]"
            style={{ 
                background: "rgba(10, 10, 10, 0.98)",
                backdropFilter: "blur(25px)",
                border: `1px solid ${myColor}40`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 40px ${myColor}10` 
            }}
          >
            {/* Inner Border Gradient */}
            <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black" style={{ color: myColor }}>
                  {member.role}
                </p>
                <div className="w-8 h-[1px]" style={{ background: `${myColor}40` }} />
              </div>
              
              <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4">Core Developer</h4>
              
              {/* Academic Metadata Grid */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 pt-4 border-t border-white/5">
                {[
                  { label: "Reg No", value: member.regno },
                  { label: "Dept", value: member.dept },
                  { label: "College", value: member.clg, full: true },
                ].map((item) => (
                  <div key={item.label} className={`${item.full ? 'col-span-2' : 'col-span-1'}`}>
                    <p className="text-[8px] uppercase tracking-widest text-white/30 mb-1">{item.label}</p>
                    <p className="text-[10px] font-bold tracking-wider text-white/90">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[8px] uppercase tracking-widest text-white/30 mb-2">Short Biography</p>
                <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                  {member.bio}
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-[0.2em] font-black text-white/20">rasrang.system.v2</span>
                <div className="flex gap-4">
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest font-black transition-colors" style={{ color: theme.colors.accent }}>
                      GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${myColor}, transparent)` }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer id="contact" className="relative" style={{ backgroundColor: theme.colors.base }}>
      
      {/* Top Glow Divider (replaces film strips) */}
      <div className="w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.primary}, ${theme.colors.secondary}, transparent)` }} />
      <div className="w-full h-px mt-px opacity-40" style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.accent}, transparent)` }} />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none opacity-20 blur-[100px]"
        style={{ background: `radial-gradient(ellipse, ${theme.colors.primary}, transparent 70%)` }} />

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-4 mb-6">
              <img src="/Assets/rasrang.png" alt="RasRang Logo" className="h-14 w-auto object-contain" />
              <div>
                <p className="text-2xl font-black tracking-[0.2em] uppercase font-massive"
                   style={{ color: theme.colors.accent }}>RASRANG</p>
                <p className="text-[9px] tracking-[0.4em] uppercase" style={{ color: theme.colors.textMuted }}>
                  SRM Trichy &bull; Cultural Fest '26
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-80" style={{ color: theme.colors.textMuted }}>
              Where culture meets the stars. Two electrifying nights of art, music, dance &amp; theatre — the biggest cultural phenomenon on campus.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase mb-6 font-bold" style={{ color: theme.colors.accent }}>
              Navigation
            </p>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Events", href: "/events" },
                { label: "Gallery", href: "/gallery" },
                { label: "Team", href: "/contributors" },
                { label: "About", href: "/#about" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm tracking-widest transition-colors duration-300 hover:translate-x-1 inline-block"
                    style={{ color: theme.colors.textMuted }}
                    onMouseEnter={(e) => e.target.style.color = theme.colors.accent}
                    onMouseLeave={(e) => e.target.style.color = theme.colors.textMuted}
                  >
                    › {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase mb-6 font-bold" style={{ color: theme.colors.accent }}>
              Get In Touch
            </p>
            <div className="space-y-4">
              {[
                { label: "Email", value: "rasrang@srmtrichy.edu.in" },
                { label: "Phone", value: "+91 98765 43210" },
                { label: "Venue", value: "SRM Trichy, Main Campus" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[9px] tracking-[0.3em] uppercase mb-1 font-bold" style={{ color: `${theme.colors.primary}90` }}>
                    {label}
                  </p>
                  <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 mt-8">
              {["Instagram", "YouTube", "Twitter"].map((s) => (
                <a key={s} href="#"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 border"
                  style={{ 
                    borderColor: `${theme.colors.primary}40`, 
                    color: theme.colors.textMuted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.secondary;
                    e.currentTarget.style.color = theme.colors.accent;
                    e.currentTarget.style.boxShadow = `0 0 15px ${theme.colors.secondary}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${theme.colors.primary}40`;
                    e.currentTarget.style.color = theme.colors.textMuted;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  title={s}
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <p className="text-[10px] tracking-[0.25em] uppercase font-bold" style={{ color: theme.colors.textMuted, opacity: 0.6 }}>
            © {year} RASRANG. All rights reserved.
          </p>
          
          <div className="flex items-center gap-3">
            <div className="h-px w-8" style={{ background: `${theme.colors.secondary}40` }} />
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: theme.colors.textMuted, opacity: 0.8 }}>
              Made with ✦ by the Cultural Committee
            </p>
            <div className="h-px w-8" style={{ background: `${theme.colors.secondary}40` }} />
          </div>
        </div>

        {/* New Dev Team Redesign: Premium Credits Capsule */}
        <div className="relative py-12 px-8 rounded-[2rem] text-center" 
             style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px" 
               style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.primary}, ${theme.colors.secondary}, transparent)` }} />

          <p className="text-sm md:text-base tracking-[0.2em] mb-8 font-black uppercase text-white/90 drop-shadow-lg font-massive italic">
            "{devData.quote}"
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-10 bg-white/10" />
              <span className="text-[9px] tracking-[0.4em] uppercase font-black text-white/30 font-accent">Designed & Developed By</span>
              <div className="h-px w-10 bg-white/10" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {devData.teammates.map((member) => (
                <DevCredit key={member.id} member={member} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Glow Divider */}
      <div className="w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.primary}40, transparent)` }} />
    </footer>
  );
}

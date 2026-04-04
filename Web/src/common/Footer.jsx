import { useTheme } from "../context/ThemeContext";

export default function Footer() {
  const year = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer id="contact" className="relative overflow-hidden" style={{ backgroundColor: theme.colors.base }}>
      
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
        <div className="mt-20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" 
             style={{ borderTop: `1px solid ${theme.colors.primary}20` }}>
          <p className="text-xs tracking-[0.25em]" style={{ color: theme.colors.textMuted, opacity: 0.5 }}>
            © {year} RASRANG. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <div className="h-px w-8" style={{ background: `${theme.colors.secondary}40` }} />
            <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: theme.colors.textMuted, opacity: 0.5 }}>
              Made with ✦ by the Cultural Committee
            </p>
            <div className="h-px w-8" style={{ background: `${theme.colors.secondary}40` }} />
          </div>
        </div>
      </div>

      {/* Bottom Glow Divider */}
      <div className="w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.colors.primary}40, transparent)` }} />
    </footer>
  );
}
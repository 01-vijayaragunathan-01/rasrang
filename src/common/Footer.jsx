export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative bg-black border-t border-stone-900 overflow-hidden">
      {/* Film strip top */}
      <div className="w-full h-5 bg-black flex border-b border-stone-900">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="flex-1 border-r border-stone-900 flex items-center justify-center">
            <div className="w-1.5 h-2.5 border border-stone-800 rounded-sm" />
          </div>
        ))}
      </div>

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(251,191,36,0.04) 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="20" cy="20" r="18" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 2" />
                  <circle cx="20" cy="20" r="12" fill="#F59E0B" fillOpacity="0.08" stroke="#F59E0B" strokeWidth="1" />
                  <text x="20" y="25" textAnchor="middle" fill="#F59E0B" fontFamily="serif" fontSize="13" fontWeight="bold">R</text>
                </svg>
              </div>
              <div>
                <p className="text-amber-400 text-xl font-black tracking-[0.2em]"
                  style={{ fontFamily: "'Playfair Display', serif" }}>RASRANG</p>
                <p className="text-stone-600 text-[9px] tracking-[0.4em]"
                  style={{ fontFamily: "'Courier New', monospace" }}>Cultural Fest</p>
              </div>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed"
              style={{ fontFamily: "'Georgia', serif" }}>
              Where culture meets the stars. Our annual festival celebrating art, music, dance and the human spirit.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-amber-500/60 text-[10px] tracking-[0.4em] uppercase mb-6"
              style={{ fontFamily: "'Courier New', monospace" }}>
              Navigation
            </p>
            <ul className="space-y-3">
              {["Home", "Events", "Gallery", "About", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-stone-500 text-sm hover:text-amber-400 transition-colors tracking-widest"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    › {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-amber-500/60 text-[10px] tracking-[0.4em] uppercase mb-6"
              style={{ fontFamily: "'Courier New', monospace" }}>
              Get In Touch
            </p>
            <div className="space-y-4">
              {[
                { label: "Email", value: "rasrang@college.edu" },
                { label: "Phone", value: "+91 98765 43210" },
                { label: "Venue", value: "College Auditorium, Main Campus" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-stone-700 text-[9px] tracking-[0.3em] uppercase mb-1"
                    style={{ fontFamily: "'Courier New', monospace" }}>
                    {label}
                  </p>
                  <p className="text-stone-400 text-sm"
                    style={{ fontFamily: "'Georgia', serif" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 mt-8">
              {["Instagram", "YouTube", "Twitter"].map((s) => (
                <a key={s} href="#"
                  className="w-9 h-9 border border-stone-800 hover:border-amber-500/40 flex items-center justify-center text-stone-600 hover:text-amber-400 text-xs transition-all duration-300"
                  style={{ fontFamily: "'Courier New', monospace" }}
                  title={s}
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-stone-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone-700 text-xs tracking-[0.25em]"
            style={{ fontFamily: "'Courier New', monospace" }}>
            © {year} RASRANG. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-amber-500/20" />
            <p className="text-stone-700 text-[10px] tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Courier New', monospace" }}>
              Made with ✦ by the Cultural Committee
            </p>
            <div className="h-px w-8 bg-amber-500/20" />
          </div>
        </div>
      </div>

      {/* Film strip bottom */}
      <div className="w-full h-5 bg-black flex border-t border-stone-900">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="flex-1 border-r border-stone-900 flex items-center justify-center">
            <div className="w-1.5 h-2.5 border border-stone-800 rounded-sm" />
          </div>
        ))}
      </div>
    </footer>
  );
}
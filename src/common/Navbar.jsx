import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/#home" },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[110] transition-all duration-500 ${
        scrolled
          ? "bg-black/90 backdrop-blur-xl border-b border-white/10 py-2 shadow-[0_10px_40px_rgba(168,85,247,0.2)]"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* --- LOGO AS IMAGE --- */}
        <a href="/" className="flex items-center group transition-transform hover:scale-105 active:scale-95">
          <img 
            src="/Assets/rasrang.png" // Replace with your actual file path (e.g., logo.png)
            alt="Rasrang Logo"
            className="h-12 md:h-16 w-auto object-contain drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]"
          />
        </a>

        {/* --- DESKTOP NAV --- */}
        <ul className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.path}
                className="relative text-[13px] font-black italic uppercase tracking-[0.2em] text-gray-200 transition-all duration-300 group"
              >
                {link.name}
                {/* Multi-color Underline matching logo colors */}
                <span className="absolute -bottom-1 left-0 w-0 h-[3px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 group-hover:w-full transition-all duration-500 shadow-[0_0_10px_#22d3ee]" />
              </a>
            </li>
          ))}
          
          {/* Dynamic Action Button */}
         
        </ul>

        {/* --- MOBILE TOGGLE --- */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`block w-6 h-1 bg-pink-500 transition-all ${menuOpen ? "rotate-45 translate-y-2.5" : ""}`} />
          <span className={`block w-6 h-1 bg-cyan-400 transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-1 bg-yellow-400 transition-all ${menuOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
        </button>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      <div 
        className={`fixed inset-0 bg-black/98 transition-all duration-500 flex flex-col items-center justify-center gap-10 ${
          menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        {/* Background Neon Blurs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-600/20 blur-[120px]" />

        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.path}
            onClick={() => setMenuOpen(false)}
            className="text-5xl font-black italic tracking-tighter text-white hover:text-cyan-400 transition-all hover:skew-x-[-10deg]"
          >
            {link.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
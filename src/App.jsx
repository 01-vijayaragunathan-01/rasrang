import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BubbleMenu from "./common/BubbleMenu";
import { useTheme } from "./context/ThemeContext";
import Footer from "./common/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";

export default function App() {
  const { theme } = useTheme();

  return (
    <Router>
      <div 
        className="min-h-screen relative" 
        style={{ 
            backgroundColor: theme.colors.base, 
            color: theme.colors.textMain,
            '--tw-selection-bg': theme.colors.primaryGlow
        }}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          <video
            className="w-full h-full object-cover opacity-60"
            src="/Assets/galaxy.mp4" // Ensure galaxy.mp4 is in your public folder
            autoPlay
            muted
            loop
            playsInline
          />
          {/* Subtle logo-themed glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black opacity-80" />
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
        </div>
        {/* --- Asset Imports --- */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=IM+Fell+English:italic&display=swap"
          rel="stylesheet"
        />

        {/* --- Visual Polish removed --- */}
        {/* --- Fixed Navigation --- */}
        <div className="z-[1002] fixed top-4 left-4 right-4">
          <BubbleMenu 
            logo="/Assets/rasrang.png" 
            useFixedPosition={true}
            menuContentColor={theme.colors.base}
            menuBg={theme.colors.primary}
            items={[
              { label: 'Home', href: '/#home', rotation: -4, hoverStyles: { bgColor: theme.colors.accent, textColor: theme.colors.base } },
              { label: 'Events', href: '/events', rotation: 4, hoverStyles: { bgColor: theme.colors.highlight, textColor: theme.colors.textMain } },
              { label: 'Gallery', href: '/gallery', rotation: -4, hoverStyles: { bgColor: theme.colors.surface, textColor: theme.colors.textMain } }
            ]}
          />
        </div>

        {/* --- Page Routes --- */}
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            {/* Add a fallback to Home if route not found */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* --- Global Footer --- */}

        <Footer />
      </div>
    </Router>
  );
}
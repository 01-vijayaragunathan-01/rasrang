import { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, X } from "lucide-react";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contributors from "./pages/Contributors";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ContentPolicy from "./pages/ContentPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Particles from "./pages/home/Particles";
import Footer from "./common/Footer";
import StaggeredMenu from "./common/StaggeredMenu";

function DesktopSuggestion({ onClose }) {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 100, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed bottom-6 left-[5%] right-[5%] z-[10000] w-[90%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm"
    >
      <div 
        className="relative overflow-hidden rounded-2xl p-5 border shadow-2xl backdrop-blur-2xl"
        style={{ 
          background: "linear-gradient(135deg, rgba(30, 20, 60, 0.95) 0%, rgba(10, 5, 30, 0.98) 100%)",
          borderColor: `${theme.colors.accent}40`,
          boxShadow: `0 10px 40px -10px ${theme.colors.accent}40`
        }}
      >
        {/* Subtle Animated Glow */}
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at top left, ${theme.colors.accent}15, transparent 70%)` }}
        />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
            <Monitor className="w-6 h-6" style={{ color: theme.colors.accent }} />
          </div>
          
          <div className="flex-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: theme.colors.accent }}>
              IMMERSION ALERT
            </h4>
            <p className="text-sm text-white/90 font-bold leading-tight">
              Switch to Desktop for the full cinematic RasRang experience.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./common/Toast";
import ProtectedRoute from "./common/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";

function MainContent() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const isStaff = user && (user.role === 'VOLUNTEER' || user.role === 'COORDINATOR' || user.role === 'SUPER_ADMIN');

  const [showDesktopSuggestion, setShowDesktopSuggestion] = useState(false);

  useEffect(() => {
    // Show suggestion after 2 seconds for mobile users on every reload
    if (window.innerWidth < 1024) {
      const timer = setTimeout(() => setShowDesktopSuggestion(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const navItems = useMemo(() => [
    { label: 'Home', link: '/', ariaLabel: 'Return to headquarters' },
    { label: 'Events', link: '/events', ariaLabel: 'Explore active sectors' },
    { label: 'Gallery', link: '/gallery', ariaLabel: 'Access visual archives' },
    user ? { label: 'Profile', link: '/profile', ariaLabel: 'Open biometric vault' } 
         : { label: 'Login', link: '/login', ariaLabel: 'User authentication' },
    ...(isStaff ? [{ label: 'Dashboard', link: '/dashboard', ariaLabel: 'Command Tower access' }] : []),
    { label: 'Team', link: '/contributors', ariaLabel: 'Meet the architects' },
    ...(user ? [{ label: 'Logout', action: logout, ariaLabel: 'Terminate session' }] : [])
  ], [user, isStaff, logout]);

  const socialItems = useMemo(() => [
    { label: 'Instagram', link: 'https://instagram.com/rasrang' },
    { label: 'Twitter', link: 'https://twitter.com/rasrang' },
    { label: 'LinkedIn', link: 'https://linkedin.com' }
  ], []);

  const menuColors = useMemo(() => [
    theme.colors.primary,    // #9D01E9 - Purple
    theme.colors.secondary,  // #C53099 - Magenta
    theme.colors.highlight,  // #E31E6E - Pink
    "#22D3EE",               // Cyan
    "#FACC15"                // Yellow
  ], [theme.colors]);

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden w-full" 
      style={{ 
          background: '#000', 
          color: theme.colors.textTitle,
      }}
    >
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <Particles
          particleColors={["#ffffff", theme.colors.primary, theme.colors.secondary]}
          particleCount={400}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={120}
          moveParticlesOnHover
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* --- Fixed Navigation --- */}
      <div className="z-[1002] fixed inset-0 pointer-events-none">
        <StaggeredMenu 
          logoUrl="/Assets/rasrang.png" 
          items={navItems}
          socialItems={socialItems}
          colors={menuColors}
          accentColor={theme.colors.highlight}
          menuButtonColor="#ffffff"
          openMenuButtonColor="#ffffff"
          position="right"
          isFixed={true}
          displaySocials={false}
        />
      </div>

      {/* --- Page Routes --- */}
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contributors" element={<Contributors />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Auth />} />
          <Route path="/content-policy" element={<ContentPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <ToastContainer />

      <AnimatePresence>
        {showDesktopSuggestion && (
          <DesktopSuggestion onClose={() => setShowDesktopSuggestion(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

import { ReactLenis } from 'lenis/react';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ReactLenis root options={{ lerp: 0.07, duration: 1.5, smoothTouch: false }}>
          <Router>
            <MainContent />
          </Router>
        </ReactLenis>
      </AuthProvider>
    </ToastProvider>
  );
}
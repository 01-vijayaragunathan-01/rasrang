import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, X } from "lucide-react";
import { ReactLenis } from 'lenis/react';

// --- Auth & UI Contexts ---
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./common/Toast";
import ProtectedRoute from "./common/ProtectedRoute";

// --- Components ---
import Particles from "./pages/home/Particles";
import Footer from "./common/Footer";
import StaggeredMenu from "./common/StaggeredMenu";

// ─── LAZY LOADED PAGES ──────────────────────────────────────────────────
const Home         = lazy(() => import("./pages/Home"));
const Events       = lazy(() => import("./pages/Events"));
const Gallery      = lazy(() => import("./pages/Gallery"));
const Contributors = lazy(() => import("./pages/Contributors"));
const Profile = lazy(() => import("./pages/Profile"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ContentPolicy = lazy(() => import("./pages/ContentPolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));

// ─── UTILITY COMPONENTS ─────────────────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function DesktopSuggestion({ onClose }) {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 100, opacity: 0, scale: 0.9 }}
      className="fixed bottom-6 left-[5%] right-[5%] z-[10000] w-[90%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm"
    >
      <div
        className="relative overflow-hidden rounded-2xl p-5 border shadow-2xl backdrop-blur-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(30,20,60,0.95) 0%, rgba(10,5,30,0.98) 100%)",
          borderColor: `${theme.colors.accent}40`,
          boxShadow: `0 10px 40px -10px ${theme.colors.accent}40`,
        }}
      >
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
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN CONTENT ───────────────────────────────────────────────────────
function MainContent() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showDesktopSuggestion, setShowDesktopSuggestion] = useState(false);

  const isStaff = user && ['VOLUNTEER', 'COORDINATOR', 'SUPER_ADMIN'].includes(user.role);

  useEffect(() => {
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
    { label: 'Instagram', link: 'https://www.instagram.com/srm_org/' },
    { label: 'LinkedIn', link: 'https://www.linkedin.com/company/srmorg/' },
    { label: 'Facebook', link: 'https://www.facebook.com/srmorg/' }
  ], []);

  return (
    <div className="min-h-screen relative overflow-x-hidden w-full" style={{ background: '#000', color: theme.colors.textTitle }}>
      
      {/* Background Layers */}
      <video className="fixed inset-0 w-full h-full object-cover pointer-events-none" style={{ zIndex: 0, opacity: 0.45 }} src="/galaxy.mp4" autoPlay muted loop playsInline />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <Particles particleColors={["#ffffff", theme.colors.primary, theme.colors.secondary]} particleCount={400} speed={0.1} />
      </div>

      {/* Navigation */}
      <div className="z-[1002] fixed inset-0 pointer-events-none">
        <StaggeredMenu
          logoUrl="/Assets/rasrang.png"
          items={navItems}
          socialItems={socialItems}
          colors={[theme.colors.primary, theme.colors.secondary, theme.colors.highlight, "#22D3EE", "#FACC15"]}
          accentColor={theme.colors.highlight}
          isFixed={true}
          position="right"
        />
      </div>

      {/* Routes with Suspense for Lazy Loading */}
      <main className="relative z-10">
        <Suspense fallback={<div className="h-screen w-screen bg-black flex items-center justify-center text-white font-massive">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contributors" element={<Contributors />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/content-policy" element={<ContentPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <ToastContainer />

      <AnimatePresence>
        {showDesktopSuggestion && <DesktopSuggestion onClose={() => setShowDesktopSuggestion(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── ROOT APP ────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ReactLenis root options={{ lerp: 0.07, duration: 1.5 }}>
          <Router>
            <ScrollToTop />
            <MainContent />
          </Router>
        </ReactLenis>
      </AuthProvider>
    </ToastProvider>
  );
}
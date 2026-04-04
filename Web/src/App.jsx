import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BubbleMenu from "./common/BubbleMenu";
import { useTheme } from "./context/ThemeContext";
import Footer from "./common/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contributors from "./pages/Contributors";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Particles from "./pages/home/Particles";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./common/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

function MainContent() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const isStaff = user && (user.role === 'VOLUNTEER' || user.role === 'COORDINATOR' || user.role === 'SUPER_ADMIN');

  const navItems = [
    { label: 'Home', href: '/#home', rotation: -4, hoverStyles: { bgColor: theme.colors.interactive, textColor: theme.colors.textTitle } },
    { label: 'Events', href: '/events', rotation: 4, hoverStyles: { bgColor: theme.colors.interactive, textColor: theme.colors.textTitle } },
    { label: 'Gallery', href: '/gallery', rotation: -4, hoverStyles: { bgColor: theme.colors.interactive, textColor: theme.colors.textTitle } },
    { label: 'Login', href: '/login', rotation: 4, hoverStyles: { bgColor: theme.colors.interactive, textColor: theme.colors.textTitle } },
    { label: 'Profile', href: '/profile', rotation: -4, hoverStyles: { bgColor: theme.colors.interactive, textColor: theme.colors.textTitle } },
    ...(isStaff ? [{ label: 'Dashboard', href: '/dashboard', rotation: 4, hoverStyles: { bgColor: theme.colors.interactive, textColor: theme.colors.textTitle } }] : []),
    { label: 'Team', href: '/contributors', rotation: 4, hoverStyles: { bgColor: theme.colors.interactive, textColor: theme.colors.textTitle } }
  ];

  return (
    <div 
      className="min-h-screen relative" 
      style={{ 
          background: '#000', 
          color: theme.colors.textTitle,
      }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
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
      <div className="z-[1002] fixed top-4 left-4 right-4">
        <BubbleMenu 
          logo="/Assets/rasrang.png" 
          useFixedPosition={true}
          menuContentColor={theme.colors.base}
          menuBg={theme.colors.primary}
          items={navItems}
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
          <Route path="/login" element={<Auth />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* --- Asset Imports --- */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=IM+Fell+English:italic&family=Inter+Tight:wght@300;400;600;700;900&family=Syne:wght@700;800&family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
        <MainContent />
      </Router>
    </AuthProvider>
  );
}
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import BubbleMenu from "./common/BubbleMenu";
import { useTheme } from "./context/ThemeContext";
import Home from "./pages/Home";
import Contributors from "./pages/Contributors";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Particles from "./pages/home/Particles";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./common/Toast";
import ProtectedRoute from "./common/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";

export default function App() {
  const { theme } = useTheme();

  return (
    <Router>
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
      <div className="z-[1002] fixed inset-0 pointer-events-none">
        <StaggeredMenu 
          logoUrl="/Assets/rasrang.png" 
          items={navItems}
          socialItems={socialItems}
          colors={[
            theme.colors.primary,    // #9D01E9 - Purple
            theme.colors.secondary,  // #C53099 - Magenta
            theme.colors.highlight,  // #E31E6E - Pink
            "#22D3EE",               // Cyan
            "#FACC15"                // Yellow
          ]}
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
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

        <Footer />
      </div>
    </Router>
  );
}
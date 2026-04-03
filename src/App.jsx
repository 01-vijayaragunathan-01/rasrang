import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./common/Navbar";
import Footer from "./common/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";

// --- Design Overlays Component ---
const DesignOverlays = () => (
  <>
    <style>{`
      .film-grain {
        position: fixed; inset: 0;
        background-image: url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Noisy_Texture.png");
        opacity: 0.04; pointer-events: none; z-index: 100;
      }
      .crt-lines {
        position: fixed; inset: 0;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%);
        background-size: 100% 4px;
        pointer-events: none; z-index: 99; opacity: 0.2;
      }
      .vignette {
        position: fixed; inset: 0;
        background: radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%);
        pointer-events: none; z-index: 98;
      }
    `}</style>
    <div className="film-grain" />
    <div className="crt-lines" />
    <div className="vignette" />
  </>
);

export default function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen text-white relative selection:bg-amber-500/30">
        {/* --- Asset Imports --- */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=IM+Fell+English:italic&display=swap"
          rel="stylesheet"
        />

        {/* --- Visual Polish --- */}
        <DesignOverlays />

        {/* --- Fixed Navigation --- */}
        <Navbar />

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
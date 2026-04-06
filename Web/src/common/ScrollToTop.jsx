import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "lenis/react";

/**
 * 🛰️ SCROLL SYNCHRONIZER
 * Ensures that every page transition (route change) resets the 
 * perspective to the top of the document.
 * 
 * Integration with Lenis ensures smooth or immediate resets 
 * without ghost scrolling.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    // 1. Reset standard browser scroll
    window.scrollTo(0, 0);
    
    // 2. Synchronize Lenis if active
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  return null;
}

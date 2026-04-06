import { useState, useEffect } from "react";

/**
 * Custom hook to manage a countdown timer.
 * @param {string} unlockDate - The ISO date string to count down to.
 * @returns {object} - { timeLeft, isUnlocked }
 */
export function useCountdown(unlockDate) {
    const [timeLeft, setTimeLeft] = useState({ d: "00", h: "00", m: "00", s: "00" });
    const [isUnlocked, setIsUnlocked] = useState(false);
  
    useEffect(() => {
      if (!unlockDate) { setIsUnlocked(true); return; }
      const tick = () => {
        const diff = new Date(unlockDate).getTime() - Date.now();
        if (diff <= 0) { setIsUnlocked(true); return; }
        setTimeLeft({
          d: String(Math.floor(diff / 86400000)).padStart(2, "0"),
          h: String(Math.floor((diff / 3600000) % 24)).padStart(2, "0"),
          m: String(Math.floor((diff / 60000) % 60)).padStart(2, "0"),
          s: String(Math.floor((diff / 1000) % 60)).padStart(2, "0"),
        });
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }, [unlockDate]);
  
    return { timeLeft, isUnlocked };
}

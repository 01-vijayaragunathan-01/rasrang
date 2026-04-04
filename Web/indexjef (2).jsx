import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
  AnimatePresence,
  useInView,
} from "framer-motion";
import {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// ─── Film Leader Countdown ───────────────────────────────────────────────
const FilmLeaderCountdown = ({ onComplete, start }) => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (!start) return; // Wait until triggered by scroll

    if (count <= 0) {
      const timeout = setTimeout(() => onComplete(), 400);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 800);

    return () => clearInterval(interval);
  }, [count, onComplete, start]);

  // Before the countdown starts, show a blank black frame
  if (!start && count === 5) {
    return <div className="absolute inset-0 z-50 bg-[#0a0a0a]" />;
  }

  return (
    <motion.div
      // Changed from 'fixed' to 'absolute' so it stays inside the sticky container
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <svg className="hidden" aria-hidden="true">
        <filter id="countdownNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
      </svg>
      <div
        className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay"
        style={{ filter: "url(#countdownNoise)" }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.8) 100%)`,
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-[20%] right-[20%] h-px bg-yellow-600/15" />
        <div className="absolute top-[20%] bottom-[20%] left-1/2 w-px bg-yellow-600/15" />
        <div className="absolute top-[25%] left-[25%] w-8 h-8 border-t-2 border-l-2 border-yellow-600/20" />
        <div className="absolute top-[25%] right-[25%] w-8 h-8 border-t-2 border-r-2 border-yellow-600/20" />
        <div className="absolute bottom-[25%] left-[25%] w-8 h-8 border-b-2 border-l-2 border-yellow-600/20" />
        <div className="absolute bottom-[25%] right-[25%] w-8 h-8 border-b-2 border-r-2 border-yellow-600/20" />
      </div>

      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        className="absolute countdown-ring opacity-30"
      >
        <circle
          cx="120"
          cy="120"
          r="100"
          fill="none"
          stroke="rgba(255,200,80,0.4)"
          strokeWidth="2"
        />
        <circle
          cx="120"
          cy="120"
          r="80"
          fill="none"
          stroke="rgba(255,200,80,0.2)"
          strokeWidth="1"
        />
        <line
          x1="120"
          y1="120"
          x2="120"
          y2="25"
          stroke="rgba(255,200,80,0.6)"
          strokeWidth="2"
        />
      </svg>

      <AnimatePresence mode="wait">
        {count > 0 ? (
          <motion.span
            key={count}
            className="text-[120px] md:text-[180px] font-bold font-mono text-yellow-500/90 select-none"
            style={{ textShadow: "0 0 60px rgba(255,180,50,0.4)" }}
            initial={{ scale: 2, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {count}
          </motion.span>
        ) : (
          <motion.span
            key="go"
            className="text-4xl md:text-6xl font-bold font-mono text-yellow-500/80 uppercase tracking-[0.3em]"
            style={{ textShadow: "0 0 40px rgba(255,180,50,0.4)" }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            ▶ PLAY
          </motion.span>
        )}
      </AnimatePresence>

      <div className="absolute bottom-12 font-mono text-white/15 text-xs tracking-[0.5em] uppercase">
        LEADER — REEL 01
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-5 animate-pulse bg-white/10" />
    </motion.div>
  );
};

// ─── Animated Frame Counter ───────────────────────────────────────────────
const AnimatedFrameCounter = ({ baseNumber, scrollYProgress, index, total }) => {
  const frameRange = useTransform(
    scrollYProgress,
    [index / total, (index + 1) / total],
    [baseNumber - 20, baseNumber + 20]
  );
  const [displayFrame, setDisplayFrame] = useState(baseNumber);

  useMotionValueEvent(frameRange, "change", (v) => {
    setDisplayFrame(Math.round(v));
  });

  return (
    <span className="text-white/20 text-xs font-mono shrink-0 tabular-nums">
      FR {String(displayFrame).padStart(4, "0")}
    </span>
  );
};

// ─── Main RetroFilmRoll Component ─────────────────────────────────────────
const RetroFilmRoll = ({ events }) => {
  const targetRef = useRef(null);
  const stickyRef = useRef(null);
  const carouselRef = useRef(null);
  const audioRef = useRef(null);
  
  const [scrollRange, setScrollRange] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);

  // Trigger countdown when sticky section is 50% in view
  const isInView = useInView(stickyRef, { amount: 0.5, once: true });

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    const updateRange = () => {
      if (carouselRef.current) {
        setScrollRange(-carouselRef.current.scrollWidth + window.innerWidth);
      }
    };
    updateRange();
    window.addEventListener("resize", updateRange);
    return () => window.removeEventListener("resize", updateRange);
  }, [events, showCountdown]);

  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], [0, scrollRange]);

  const scrollTimeoutRef = useRef(null);

  const startProjectorSound = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.volume = 0.15;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const stopProjectorSound = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => stopProjectorSound();
  }, [stopProjectorSound]);

  useMotionValueEvent(scrollYProgress, "change", () => {
    if (showCountdown) return;
    setIsScrolling(true);
    startProjectorSound();

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      stopProjectorSound();
    }, 150);
  });

  const spotlightOpacity = useMemo(() => (isScrolling ? 0.6 : 0.4), [isScrolling]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
  }, []);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#0a0a0a]">
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="https://cdn.freesound.org/previews/388/388713_7364899-lq.mp3"
      />

      <svg className="hidden" aria-hidden="true">
        <filter id="globalNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </svg>

      <div ref={stickyRef} className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        {/* The countdown is now embedded inside the sticky container */}
        <AnimatePresence>
          {showCountdown && (
            <FilmLeaderCountdown start={isInView} onComplete={handleCountdownComplete} />
          )}
        </AnimatePresence>

        <div
          className="absolute inset-0 z-15 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 50% 70% at 50% 50%, transparent 0%, rgba(0,0,0,${spotlightOpacity}) 100%)`,
          }}
        />

        <div
          className="absolute inset-0 z-16 pointer-events-none"
          style={{
            background: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.9) 100%),
                         linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)`,
          }}
        />

        <div
          className="absolute inset-0 z-20 pointer-events-none opacity-15 mix-blend-overlay"
          style={{ filter: "url(#globalNoise)" }}
        />

        <div className="absolute inset-0 z-10 pointer-events-none opacity-5 animate-pulse bg-white/10" />

        <motion.div ref={carouselRef} style={{ x }} className="flex px-4 md:px-10">
          <div className="flex gap-4 md:gap-8 film-strip-active will-change-transform film-snap-container">
            {events.map((event, index) => (
              <div key={event.id} className="relative flex-shrink-0 group film-snap-item">
                <div className="absolute -top-6 left-0 right-0 flex justify-around px-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-[#1a1a1a] rounded-sm border border-white/10" />
                  ))}
                </div>

                <div className="w-[85vw] sm:w-[400px] md:w-[450px] bg-[#111] p-2 md:p-4 border-x-[8px] md:border-x-[12px] border-[#1a1a1a] shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  <div className="relative overflow-hidden aspect-[3/2]">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="object-cover w-full h-full grayscale sepia-[.3] contrast-[1.2] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-700"
                      loading="lazy"
                    />
                    <div className="light-leak-flash" />
                  </div>

                  <div className="mt-4 flex justify-between items-center px-1">
                    <p className="text-yellow-600/80 font-mono italic text-sm md:text-lg uppercase tracking-tighter truncate pr-4">
                      {event.title}
                    </p>
                    <AnimatedFrameCounter
                      baseNumber={event.frame_number}
                      scrollYProgress={scrollYProgress}
                      index={index}
                      total={events.length}
                    />
                  </div>
                </div>

                <div className="absolute -bottom-6 left-0 right-0 flex justify-around px-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-[#1a1a1a] rounded-sm border border-white/10" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="absolute bottom-6 right-[6%] z-30 pointer-events-none">
          <span className="text-white/10 text-xs font-mono tracking-widest uppercase">
            Reel 01 — Pre-Culture
          </span>
        </div>
      </div>
    </section>
  );
};

export default RetroFilmRoll;
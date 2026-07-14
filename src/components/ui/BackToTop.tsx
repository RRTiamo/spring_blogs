"use client";

import { useState, useEffect } from "react";
import { Rocket } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount to set initial state
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLaunch = () => {
    // Trigger smooth scrolling using Lenis if available, with robust multi-layer fallback
    try {
      const lenis = (window as any).lenis;
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(0, {
          duration: 1.2,
        });
      }
    } catch (e) {
      console.error("Lenis scroll to top failed:", e);
    }

    try {
      // Trigger native window scroll
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (e) {
      console.error("Window scroll to top failed:", e);
    }

    try {
      // Trigger documentElement scroll for custom scroll containers / compatibility
      document.documentElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (e) {
      console.error("documentElement scroll to top failed:", e);
    }
  };

  return (
    <button
      onClick={handleLaunch}
      className={`fixed right-5 bottom-32 z-60 flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/10 dark:border-white/10 bg-cream/90 dark:bg-charcoal/90 text-charcoal shadow-lg backdrop-blur-md transition-all duration-300 cursor-pointer pointer-events-auto hover:border-gold hover:text-gold hover:scale-105 active:scale-95 group sm:right-6 sm:bottom-36 ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-75 pointer-events-none"
      }`}
      aria-label="返回顶部"
    >
      <Rocket className="h-5 w-5 -rotate-45 transition-all duration-300 group-hover:-translate-y-1 group-hover:text-gold" />
    </button>
  );
}

"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure ScrollTrigger is registered
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // 1. Update ScrollTrigger on every Lenis scroll event to ensure parallax synchronization
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // 2. Drive Lenis updates using GSAP's high-performance ticker (required for ScrollTrigger pinning synchronization)
    const updatePhysics = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updatePhysics);
    gsap.ticker.lagSmoothing(0);

    // Expose lenis instance to window for global access (using unknown cast to prevent ESLint no-explicit-any errors)
    (window as unknown as { lenis: unknown }).lenis = lenis;

    return () => {
      gsap.ticker.remove(updatePhysics);
      lenis.destroy();
      (window as unknown as { lenis: unknown }).lenis = undefined;
    };
  }, []);

  return <>{children}</>;
}

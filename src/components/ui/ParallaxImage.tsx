"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // "aspect-video" | "aspect-[3/4]" | "aspect-[4/5]" | "aspect-square" 等
  speed?: number; // 视差移动速度系数
  sizes?: string;
  priority?: boolean;
  tone?: "natural" | "warm" | "soft";
}

const toneClassMap = {
  natural: "saturate-[1.06] contrast-[1.02]",
  warm: "saturate-[1.12] contrast-[1.02] brightness-[1.02]",
  soft: "saturate-[1.04] contrast-[0.98] brightness-[1.03]",
};

export default function ParallaxImage({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-[3/4]",
  speed = 0.8,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  tone = "natural",
  horizontal = false,
}: ParallaxImageProps & { horizontal?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const ctx = gsap.context(() => {
      // 1. 剪裁路径划开动画 (Clip-path reveal) - 仅在非横向滚动中启用，防止横向隐藏
      if (!horizontal) {
        gsap.fromTo(
          container,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.8,
            ease: "power4.inOut",
            scrollTrigger: {
              trigger: container,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          }
        );

        // 2. 纵向滚动视差 (Parallax scroll) - 仅在非横向滚动中启用
        gsap.fromTo(
          img,
          { yPercent: -10 * speed, scale: 1.1 },
          {
            yPercent: 10 * speed,
            scale: 1.05,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    }, container);

    return () => ctx.revert();
  }, [speed, horizontal]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${aspectRatio} ${className}`}
      style={{ clipPath: horizontal ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
    >
      <div className="absolute inset-0 bg-charcoal/5 pointer-events-none z-10" />
      <div
        ref={imgRef}
        className={
          horizontal
            ? "absolute inset-0 w-full h-full"
            : "absolute -top-[15%] left-0 h-[130%] w-full transition-transform duration-1000 ease-out"
        }
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-cover select-none transition duration-700 ease-out ${toneClassMap[tone]}`}
        />
      </div>
    </div>
  );
}

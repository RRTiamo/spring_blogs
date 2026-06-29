"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Experience {
  year: string;
  title: string;
  company: string;
  desc: string;
}

interface TimelineProps {
  experiences: Experience[];
}

export default function Timeline({ experiences }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeline = timelineRef.current;
    const line = lineRef.current;
    if (!timeline || !line) return;

    const ctx = gsap.context(() => {
      // 1. 滚动时，垂直线向下延伸绘制
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timeline,
            start: "top 75%",
            end: "bottom 75%",
            scrub: true,
          },
        }
      );

      // 2. 时间线每一项在进入视口时进行淡入与位移
      const items = timeline.querySelectorAll(".timeline-item");
      items.forEach((item) => {
        const dot = item.querySelector(".timeline-dot");
        const content = item.querySelector(".timeline-content");
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });

        tl.fromTo(
          dot,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }
        ).fromTo(
          content,
          { x: -15, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.3"
        );
      });
    }, timeline);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={timelineRef} className="relative pl-8 md:pl-12 space-y-12 py-2">
      {/* 时间线的主干竖线 */}
      <div
        ref={lineRef}
        className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-charcoal/15 origin-top"
      />

      {experiences.map((exp, idx) => (
        <div key={idx} className="timeline-item relative">
          {/* 时间线交点圆环 */}
          <div className="timeline-dot absolute -left-[32px] md:-left-[41px] top-1.5 w-2 h-2 rounded-full bg-cream border border-charcoal z-10" />

          <div className="timeline-content space-y-3">
            <span className="text-[10px] font-semibold tracking-widest text-gold font-sans block">
              {exp.year}
            </span>
            <h3 className="font-serif text-xl font-light text-charcoal leading-snug">
              {exp.title}{" "}
              <span className="text-xs md:text-sm font-sans font-light text-charcoal/50">
                @ {exp.company}
              </span>
            </h3>
            <p className="text-xs md:text-sm font-light leading-relaxed text-charcoal/70 max-w-xl">
              {exp.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

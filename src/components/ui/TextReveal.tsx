"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 注册 GSAP ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TextRevealProps {
  text?: string;
  lines?: string[]; // 支持手动拆分好的行数以实现高定制分排版
  className?: string;
  delay?: number;
  duration?: number; // 默认动画时间
  stagger?: number;
  once?: boolean;
}

export default function TextReveal({
  text,
  lines,
  className = "",
  delay = 0,
  duration = 0.8, // 速度调快 (从 1.4s 减到 0.8s)
  stagger = 0.08, // 延迟更紧凑 (从 0.12s 减到 0.08s)
  once = true,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const displayLines = lines || (text ? [text] : []);
  
  // 使用字符串序列化拼接作为 useEffect 依赖，防止 React 重渲染导致的 GSAP 动画循环闪跳
  const linesSerialized = displayLines.join("|");

  useEffect(() => {
    const el = containerRef.current;
    if (!el || displayLines.length === 0) return;

    const lineElements = el.querySelectorAll(".reveal-line-inner");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineElements,
        { y: "105%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: duration,
          ease: "power4.out",
          stagger: stagger,
          delay: delay,
          scrollTrigger: {
            trigger: el,
            start: "top 90%", // 当文本顶部到达视口 90% 位置时触发
            toggleActions: "play none none none", // 仅触发一次，不来回反弹
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [linesSerialized, displayLines.length, delay, duration, stagger, once]);

  return (
    <div ref={containerRef} className={`block ${className}`}>
      {displayLines.map((line, idx) => (
        <span
          key={idx}
          className="block overflow-hidden relative leading-normal"
          style={{ paddingBottom: "0.15em", marginBottom: "-0.15em" }}
        >
          <span className="reveal-line-inner inline-block transform translate-y-[105%] opacity-0">
            {line}
          </span>
        </span>
      ))}
    </div>
  );
}

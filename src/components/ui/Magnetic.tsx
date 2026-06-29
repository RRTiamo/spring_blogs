"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface MagneticProps {
  children: React.ReactElement;
  range?: number; // 磁吸响应范围
  strength?: number; // 磁吸强度 (0 ~ 1)
}

export default function Magnetic({ children, range = 80, strength = 0.35 }: MagneticProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 使用 gsap.quickTo 保证高性能的过渡动画
    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" });

    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = clientX - centerX;
      const y = clientY - centerY;
      const distance = Math.hypot(x, y);

      if (distance < range) {
        // 进入磁吸区域，组件拉向鼠标
        xTo(x * strength);
        yTo(y * strength);
      } else {
        // 超出区域，复位
        xTo(0);
        yTo(0);
      }
    };

    const onMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [range, strength]);

  // 使用 React.cloneElement 保留子组件的事件，但通常包裹一个 div 更不容易出错
  return (
    <div ref={containerRef} className="inline-block">
      {children}
    </div>
  );
}

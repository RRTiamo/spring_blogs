"use client";

import { useEffect, useState, useRef } from "react";
import { Activity } from "lucide-react";
import gsap from "gsap";

interface FocusData {
  title: string;
  subtitle: string;
  desc: string;
  code: string;
}

export default function FocusCard({ data }: { data?: FocusData }) {
  const title = data?.title || "春风不解别离";
  const subtitle = data?.subtitle || "Front-end Micro-Interactions";
  const desc = data?.desc || "调试精细的 GSAP 滚动裁剪层和 Lenis 触控摩擦物理模型，探寻屏幕里如同杂志纸页的沉稳质感。";
  const code = data?.code || 'gsap.to(".viewport", { ease: "power4.out" })';
  const [fps, setFps] = useState(60.0);
  const containerRef = useRef<HTMLDivElement>(null);
  const codeTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 模拟 FPS 微弱上下跳动
    const fpsTimer = setInterval(() => {
      setFps(Number((59.6 + Math.random() * 0.7).toFixed(1)));
    }, 1500);

    return () => clearInterval(fpsTimer);
  }, []);

  const handleMouseEnter = () => {
    // 打字机高亮效果
    gsap.fromTo(
      codeTextRef.current,
      { opacity: 0.3, y: 2 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  };

  const handleMouseLeave = () => {
    gsap.to(codeTextRef.current, {
      opacity: 0.5,
      duration: 0.4,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden border border-charcoal/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-6 md:p-8 flex flex-col justify-between group hover:border-charcoal/30 dark:hover:border-white/30 transition-all duration-300 rounded-2xl shadow-sm min-h-[300px]"
    >
      {/* 精致小角饰 */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-charcoal/30 dark:border-white/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-charcoal/30 dark:border-white/30" />

      {/* 顶部标签 */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 border border-charcoal/5 bg-cream-dark rounded-full shadow-sm">
            <Activity className="w-5 h-5 text-gold stroke-[1.25]" />
          </div>
          <span className="text-[10px] font-sans tracking-widest text-charcoal/40 dark:text-white/40 uppercase font-semibold">
            Focus / 正在研究
          </span>
        </div>

        {/* 模拟 FPS 指示器 */}
        <div className="flex items-center space-x-1.5 bg-charcoal/5 dark:bg-white/5 px-2 py-0.5 rounded border border-charcoal/5 dark:border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[8px] font-mono text-charcoal/60 dark:text-white/60">
            {fps} FPS
          </span>
        </div>
      </div>

      {/* GSAP / Ease 贝塞尔过渡曲线 SVG 展示区 */}
      <div className="relative my-4 h-24 flex items-center justify-center overflow-visible select-none">
        <svg className="w-full h-full text-charcoal/5 dark:text-white/5" viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
          {/* 网格线背景 */}
          <line x1="0" y1="20" x2="160" y2="20" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="40" x2="160" y2="40" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="60" x2="160" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <line x1="40" y1="0" x2="40" y2="80" stroke="currentColor" strokeWidth="0.5" />
          <line x1="80" y1="0" x2="80" y2="80" stroke="currentColor" strokeWidth="0.5" />
          <line x1="120" y1="0" x2="120" y2="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />

          {/* 动画贝塞尔过渡曲线路径 */}
          <path
            id="ease-path"
            d="M 10 70 C 60 70, 70 10, 150 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-charcoal/20 dark:text-white/20"
          />
          {/* 金色主高亮曲线 */}
          <path
            d="M 10 70 C 60 70, 70 10, 150 10"
            fill="none"
            stroke="url(#ease-grad)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* 定义渐变颜色 */}
          <defs>
            <linearGradient id="ease-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* 沿贝塞尔曲线滑动的金色亮点 */}
          <circle r="4" className="fill-gold shadow-lg filter drop-shadow-[0_0_4px_rgba(212,175,55,0.6)]">
            <animateMotion
              dur="2.4s"
              repeatCount="indefinite"
              path="M 10 70 C 60 70, 70 10, 150 10"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.25 0.1 0.25 1"
            />
          </circle>
        </svg>

        {/* 缓动辅助标签 */}
        <span className="absolute left-2 bottom-0 text-[7px] font-mono text-charcoal/30 dark:text-white/30 scale-75">
          t: 0.00
        </span>
        <span className="absolute right-2 top-0 text-[7px] font-mono text-charcoal/30 dark:text-white/30 scale-75">
          v: 1.00
        </span>
      </div>

      <div className="space-y-3 relative z-10">
        <div>
          <h3 className="font-serif text-lg text-charcoal dark:text-cream font-medium tracking-wide">
            {title}
          </h3>
          <p className="text-[10px] font-mono tracking-widest text-gold/80 dark:text-gold/60 uppercase">
            {subtitle}
          </p>
        </div>

        <p className="text-xs md:text-sm font-sans font-light leading-relaxed text-charcoal/60 dark:text-white/70 tracking-wider">
          {desc}
        </p>

        {/* 动态微缩代码区 */}
        <div
          ref={codeTextRef}
          className="bg-charcoal/5 dark:bg-white/5 border border-charcoal/5 dark:border-white/5 rounded px-2.5 py-1.5 font-mono text-[9px] text-charcoal/70 dark:text-white/70 opacity-50 flex items-center justify-between transition-opacity"
        >
          <span>{code}</span>
          <span className="text-[8px] font-sans text-gold uppercase tracking-wider font-semibold">
            active
          </span>
        </div>
      </div>
    </div>
  );
}

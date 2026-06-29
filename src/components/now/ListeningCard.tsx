"use client";

import { useEffect, useRef } from "react";
import { Music } from "lucide-react";
import gsap from "gsap";

interface ListeningData {
  title: string;
  subtitle: string;
  vinylText: string;
  desc: string;
}

export default function ListeningCard({ data }: { data?: ListeningData }) {
  const title = data?.title || "You Must Believe in Spring";
  const subtitle = data?.subtitle || "Bill Evans Trio (1977) · Jazz";
  const vinylText = data?.vinylText || "BILL EVANS";
  const desc = data?.desc || "忧郁而明亮的小调钢琴旋律，黑胶唱片特有的静电微噪点与琴音，极其契合江南的阴雨黄昏。";
  const containerRef = useRef<HTMLDivElement>(null);
  const vinylRef = useRef<HTMLDivElement>(null);
  const tonearmRef = useRef<SVGSVGElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    // 初始化黑胶旋转动画 (初始暂停)
    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(vinylRef.current, {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: "none",
        paused: true,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = () => {
    // 1. 唱针偏转搭上唱片
    gsap.to(tonearmRef.current, {
      rotation: 18,
      transformOrigin: "top right",
      duration: 0.5,
      ease: "power2.out",
    });

    // 2. 黑胶唱片向右滑出并旋转
    gsap.to(vinylRef.current, {
      x: 35,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        if (tweenRef.current) {
          // 平滑恢复或加速旋转
          tweenRef.current.play();
        }
      },
    });
  };

  const handleMouseLeave = () => {
    // 1. 唱针退回
    gsap.to(tonearmRef.current, {
      rotation: 0,
      duration: 0.5,
      ease: "power2.out",
    });

    // 2. 黑胶唱片滑回并停止旋转
    gsap.to(vinylRef.current, {
      x: 0,
      duration: 0.6,
      ease: "power2.out",
      onStart: () => {
        if (tweenRef.current) {
          tweenRef.current.pause();
        }
      },
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
            <Music className="w-5 h-5 text-gold stroke-[1.25]" />
          </div>
          <span className="text-[10px] font-sans tracking-widest text-charcoal/40 dark:text-white/40 uppercase font-semibold">
            Listening / 正在循环
          </span>
        </div>

        {/* 正在播放的微型模拟跳动音柱 */}
        <div className="flex items-end space-x-[3px] h-4.5">
          <div className="w-[2px] bg-gold rounded-full animate-bar-jump-1 h-3" />
          <div className="w-[2px] bg-gold rounded-full animate-bar-jump-2 h-4.5" />
          <div className="w-[2px] bg-gold rounded-full animate-bar-jump-3 h-2" />
          <div className="w-[2px] bg-gold rounded-full animate-bar-jump-4 h-4" />
          <div className="w-[2px] bg-gold rounded-full animate-bar-jump-5 h-2.5" />
        </div>
      </div>

      {/* 唱片展示区域 - 包含唱片纸套、黑胶、唱针 */}
      <div className="relative my-6 h-28 flex items-center justify-center select-none overflow-hidden">
        {/* 黑胶唱片 (vinyl) - 默认藏在纸套后面 */}
        <div
          ref={vinylRef}
          className="absolute w-24 h-24 rounded-full bg-zinc-950 dark:bg-black flex items-center justify-center shadow-md border border-zinc-800 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {/* 同心圆音轨刻纹 */}
          <div className="absolute inset-2 rounded-full border border-zinc-800/40" />
          <div className="absolute inset-4 rounded-full border border-zinc-900" />
          <div className="absolute inset-6 rounded-full border border-zinc-800/50" />
          <div className="absolute inset-8 rounded-full border border-zinc-900" />
          {/* 唱片中心金色标签 */}
          <div className="w-8 h-8 rounded-full bg-gold/90 dark:bg-gold/80 flex items-center justify-center">
            {/* 金色唱片标签上的圆孔 */}
            <div className="w-2.5 h-2.5 rounded-full bg-cream-dark dark:bg-charcoal border border-zinc-950/20" />
          </div>
        </div>

        {/* 唱片套/封壳 (Vinyl Cover sleeve) */}
        <div
          className="absolute left-1/2 -translate-x-[75px] w-24 h-24 bg-gradient-to-br from-charcoal/10 to-charcoal/5 dark:from-white/10 dark:to-white/5 border border-charcoal/15 dark:border-white/15 rounded flex items-center justify-center overflow-hidden shadow-sm"
          style={{ zIndex: 2 }}
        >
          {/* 唱片套上的缺口半圆 (die-cut hole) */}
          <div className="absolute -right-6 w-12 h-12 rounded-full bg-cream-dark dark:bg-charcoal border border-charcoal/10 dark:border-white/10" />
          <span className="text-[7px] font-mono text-charcoal/40 dark:text-white/40 tracking-wider rotate-90 scale-75 select-none">
            {vinylText}
          </span>
        </div>

        {/* 唱针 (tonearm) SVG */}
        <svg
          ref={tonearmRef}
          className="absolute right-1/2 translate-x-[45px] -translate-y-[35px] w-12 h-16 origin-top-right transition-transform"
          viewBox="0 0 48 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ zIndex: 3 }}
        >
          {/* 唱针座 */}
          <circle cx="40" cy="10" r="4" className="fill-zinc-400 dark:fill-zinc-600" />
          {/* 唱针臂 (Tonearm shaft) */}
          <path d="M 40 10 L 26 40 L 20 48" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500 dark:text-zinc-400" />
          {/* 唱针头 (Cartridge) */}
          <rect x="16" y="46" width="6" height="8" transform="rotate(-15 16 46)" className="fill-zinc-600 dark:fill-zinc-300" />
          {/* 小红点指示 */}
          <circle cx="17.5" cy="51" r="0.75" className="fill-red-500" />
        </svg>
      </div>

      {/* 底部文案 */}
      <div className="space-y-2 relative z-10">
        <h3 className="font-serif text-lg text-charcoal dark:text-cream font-medium tracking-wide">
          {title}
        </h3>
        <p className="text-[10px] font-mono tracking-widest text-gold/80 dark:text-gold/60 uppercase">
          {subtitle}
        </p>
        <p className="text-xs md:text-sm font-sans font-light leading-relaxed text-charcoal/60 dark:text-white/70 tracking-wider">
          {desc}
        </p>
      </div>
    </div>
  );
}

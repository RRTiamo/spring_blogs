"use client";

import { useEffect, useRef } from "react";
import { BookOpen } from "lucide-react";
import gsap from "gsap";

interface ReadingData {
  title: string;
  author: string;
  quote: string;
  progress: number;
  pageDesc: string;
  coverUrl?: string;
}

export default function ReadingCard({ data }: { data?: ReadingData }) {
  const title = data?.title || "The Order of Time";
  const author = data?.author || "ROVELLI";
  const quote = data?.quote || "“世界不是物体的集合，而是事件的集合。从时间跨度来看，世界在流动。”";
  const progress = data?.progress !== undefined ? data.progress : 68;
  const pageDesc = data?.pageDesc || "Page 204/300";
  const coverUrl = data?.coverUrl || "";
  const cardRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始化 3D 图书姿态
    if (bookRef.current) {
      gsap.set(bookRef.current, {
        transformPerspective: 1000,
        rotationY: -22,
        rotationX: 10,
        rotationZ: -2,
      });
    }
  }, []);

  const handleMouseEnter = () => {
    // 1. 书本翻转与悬浮
    gsap.to(bookRef.current, {
      rotationY: -8,
      rotationX: 15,
      y: -10,
      duration: 0.6,
      ease: "power2.out",
    });

    // 2. 进度条波光扫过
    gsap.fromTo(
      progressRef.current,
      { xPercent: -100 },
      { xPercent: 0, duration: 0.85, ease: "power2.out" }
    );
  };

  const handleMouseLeave = () => {
    // 1. 书本恢复
    gsap.to(bookRef.current, {
      rotationY: -22,
      rotationX: 10,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden border border-charcoal/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-6 md:p-8 flex flex-col justify-between group hover:border-charcoal/30 dark:hover:border-white/30 transition-all duration-300 rounded-2xl shadow-sm min-h-[300px]"
    >
      {/* 精致小角饰 */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-charcoal/30 dark:border-white/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-charcoal/30 dark:border-white/30" />

      {/* 顶部标签 */}
      <div className="flex items-center space-x-3 relative z-10">
        <div className="p-2 border border-charcoal/5 bg-cream-dark rounded-full shadow-sm">
          <BookOpen className="w-5 h-5 text-gold stroke-[1.25]" />
        </div>
        <span className="text-[10px] font-sans tracking-widest text-charcoal/40 dark:text-white/40 uppercase font-semibold">
          Reading / 正在阅读
        </span>
      </div>

      {/* 图书 3D 展示区域 */}
      <div className="relative my-6 h-32 flex items-center justify-between overflow-visible">
        {/* 左侧杂志排版文字 */}
        <div className="w-1/2 pr-4 z-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold/80 dark:text-gold/60">
            {author}
          </span>
          <h4 className="font-serif text-lg text-charcoal dark:text-cream font-medium tracking-wide mt-1 leading-snug">
            {title.startsWith("《") ? title : `《${title}》`}
          </h4>
          {title === "The Order of Time" ? (
            <p className="text-[9px] font-mono text-charcoal/30 dark:text-white/30 tracking-wider mt-0.5">
              L&apos;ordine del tempo
            </p>
          ) : (
            <p className="text-[9px] font-mono text-charcoal/30 dark:text-white/30 tracking-wider mt-0.5">
              IN PROGRESS
            </p>
          )}
        </div>

        {/* 右侧 3D 图书 */}
        <div className="w-1/2 h-full flex items-center justify-center relative perspective-[1000px]">
          {/* 3D 旋转容器 */}
          <div
            ref={bookRef}
            className="relative w-18 h-26 transform-style-3d shadow-xl transition-shadow duration-300 group-hover:shadow-[0_20px_35px_-10px_rgba(0,0,0,0.25)]"
          >
            {/* 书本封底 (Back Cover) - 深色 */}
            <div className="absolute inset-0 bg-stone-900 rounded-r border-r border-zinc-800 transform translate-z-[-4px]" />

            {/* 书页厚度 (Pages Thickness) */}
            <div className="absolute right-0 top-0.5 bottom-0.5 w-1 bg-stone-200 transform origin-right rotateY-90 translate-x-[0.5px]" />

            {/* 书脊 (Spine) */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-stone-950 to-stone-900 transform origin-left -rotateY-90 -translate-x-[0.5px] border-y border-stone-850" />

            {/* 书本封面 (Front Cover) */}
            <div className="absolute inset-0 bg-stone-900 border border-zinc-800 rounded-l flex flex-col justify-between overflow-hidden select-none transform translate-z-[1px]">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={title}
                  className="w-full h-full object-cover rounded-l animate-fade-in"
                />
              ) : (
                <div className="absolute inset-0 p-2 flex flex-col justify-between h-full w-full">
                  {/* 封面艺术线条 (星轨示意) */}
                  <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none" 
                       style={{ backgroundImage: "radial-gradient(circle at 70% 30%, transparent 40%, rgba(212,175,55,0.4) 75%, transparent 100%)" }} />
                  
                  <div className="space-y-0.5 z-10 relative">
                    <div className="w-1.5 h-[1px] bg-gold" />
                    <span className="block text-[6px] font-mono text-gold scale-75 origin-left tracking-wide uppercase">
                      {author}
                    </span>
                  </div>
                  
                  <div className="z-10 relative">
                    <span className="block text-[7px] font-serif text-cream scale-90 origin-left leading-tight tracking-wide break-all">
                      {title}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 名言段落与进度条 */}
      <div className="space-y-4 relative z-10">
        <blockquote className="border-l-2 border-gold/40 pl-3 py-0.5">
          <p className="font-serif italic text-xs leading-relaxed text-charcoal/70 dark:text-white/80 tracking-wide">
            {quote}
          </p>
        </blockquote>

        {/* 进度控制槽 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-mono text-charcoal/40 dark:text-white/40 uppercase tracking-widest">
            <span>Progress / 进度</span>
            <span>{progress}% ({pageDesc})</span>
          </div>
          <div className="h-[2px] bg-charcoal/5 dark:bg-white/5 rounded-full overflow-hidden relative">
            {/* 静态已读进度条 */}
            <div className="absolute inset-y-0 left-0 bg-gold/50 rounded-full" style={{ width: `${progress}%` }} />
            {/* 悬停闪光交互条 */}
            <div ref={progressRef} className="absolute inset-y-0 left-0 bg-gold rounded-full transform -translate-x-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

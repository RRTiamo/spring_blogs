"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, MapPin, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { LoveEntry } from "@/interface/love";
import ParallaxImage from "@/components/ui/ParallaxImage";
import gsap from "gsap";

interface LoveArticleRailProps {
  entries: LoveEntry[];
  onSelect: (entry: LoveEntry) => void;
}

const moodLabelMap: Record<string, string> = {
  romantic: "浪漫",
  playful: "俏皮",
  peaceful: "宁静",
};

export default function LoveArticleRail({ entries, onSelect }: LoveArticleRailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const [isDesktop, setIsDesktop] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // 自动播放与导航状态控制
  const currentX = useRef(0);
  const activeSpeed = useRef(0.5); // 文章卡片比照片更慢一点，以便阅读标题
  const currentSpeed = useRef(0.5);
  const isAutoPlaying = useRef(true);
  const rafRef = useRef<number | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const manualTweenRef = useRef<gsap.core.Tween | null>(null);

  // 复制 entries 保证无缝 Marquee 循环长度
  const displayEntries = useMemo(() => {
    if (entries.length === 0) return [];
    const minItems = 12;
    const repeatCount = Math.max(3, Math.ceil(minItems / entries.length));
    const list: LoveEntry[] = [];
    for (let i = 0; i < repeatCount; i++) {
      list.push(...entries);
    }
    return list;
  }, [entries]);

  // 监听组件是否在视口内以按需启用滚动
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // 自动播放帧循环 (仅在视口内时按需启用)
  useEffect(() => {
    if (!isDesktop || entries.length === 0 || !isInView) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (manualTweenRef.current) manualTweenRef.current.kill();
      if (trackRef.current && (!isDesktop || entries.length === 0)) {
        gsap.set(trackRef.current, { x: 0 });
      }
      return;
    }

    const cardWidth = 320; // lg 视口下卡片宽度
    const gap = 20; // gap-5 对应 20px
    const step = cardWidth + gap;
    const singleCycleWidth = entries.length * step;

    isAutoPlaying.current = true;
    currentSpeed.current = activeSpeed.current;

    const tick = () => {
      if (isAutoPlaying.current) {
        // 平滑缓动速度
        currentSpeed.current = gsap.utils.interpolate(
          currentSpeed.current,
          activeSpeed.current,
          0.06
        );

        currentX.current -= currentSpeed.current;

        // 无缝取模重置
        if (currentX.current <= -singleCycleWidth) {
          currentX.current += singleCycleWidth;
        }

        if (trackRef.current) {
          gsap.set(trackRef.current, { x: currentX.current });
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (manualTweenRef.current) manualTweenRef.current.kill();
    };
  }, [isDesktop, entries, isInView]);

  // 恢复自动滚动的计时器
  const resetAutoPlayTimer = () => {
    if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    autoPlayTimeoutRef.current = setTimeout(() => {
      isAutoPlaying.current = true;
      activeSpeed.current = 0.5;
    }, 5000);
  };

  // 左右控制按钮导航
  const handleManualNavigate = (direction: "next" | "prev") => {
    if (entries.length === 0) return;

    const cardWidth = 320;
    const gap = 20;
    const step = cardWidth + gap;
    const singleCycleWidth = entries.length * step;

    isAutoPlaying.current = false;
    if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);

    // 1. 规范化当前坐标到单个周期内
    let currX = currentX.current;
    if (currX <= -singleCycleWidth) {
      currX = currX % singleCycleWidth;
    } else if (currX > 0) {
      currX = (currX % singleCycleWidth) - singleCycleWidth;
    }
    currentX.current = currX;
    gsap.set(trackRef.current, { x: currX });

    // 2. 计算最接近的卡片索引并加上方向偏移
    const currIndex = Math.round(currX / step);
    const targetIndex = direction === "next" ? currIndex - 1 : currIndex + 1;
    const targetX = targetIndex * step;

    // 3. 过渡到目标位置
    if (manualTweenRef.current) manualTweenRef.current.kill();
    manualTweenRef.current = gsap.to(trackRef.current, {
      x: targetX,
      duration: 0.8,
      ease: "power3.out",
      onUpdate: () => {
        if (trackRef.current) {
          currentX.current = gsap.getProperty(trackRef.current, "x") as number;
        }
      },
      onComplete: () => {
        let finalX = currentX.current;
        while (finalX <= -singleCycleWidth) finalX += singleCycleWidth;
        while (finalX > 0) finalX -= singleCycleWidth;
        currentX.current = finalX;
        gsap.set(trackRef.current, { x: finalX });

        resetAutoPlayTimer();
      }
    });
  };

  const handleMouseEnter = () => {
    if (isAutoPlaying.current) {
      activeSpeed.current = 0;
    }
  };

  const handleMouseLeave = () => {
    if (isAutoPlaying.current) {
      activeSpeed.current = 0.5;
    }
  };

  useEffect(() => {
    return () => {
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative group/rail w-full">
      {/* 左右毛玻璃微光翻页按钮 (仅在桌面端且自动播放时可见) */}
      {isDesktop && entries.length > 0 && (
        <>
          <div className="absolute left-3 top-[35%] -translate-y-1/2 z-30 transition-all duration-300">
            <button
              type="button"
              aria-label="向左查看更多日记"
              onClick={() => handleManualNavigate("prev")}
              className="p-2.5 rounded-full bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md border border-charcoal/8 dark:border-white/10 text-charcoal hover:text-amber-600 dark:text-cream shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer focus-visible:outline-none"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
          <div className="absolute right-3 top-[35%] -translate-y-1/2 z-30 transition-all duration-300">
            <button
              type="button"
              aria-label="向右查看更多日记"
              onClick={() => handleManualNavigate("next")}
              className="p-2.5 rounded-full bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md border border-charcoal/8 dark:border-white/10 text-charcoal hover:text-amber-600 dark:text-cream shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer focus-visible:outline-none"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </>
      )}

      {/* 滚动容器 */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="mask-image-horizontal overflow-x-auto py-3 no-scrollbar lg:overflow-x-hidden relative"
      >
        {/* 长轨道 */}
        <div
          ref={trackRef}
          className="flex w-max gap-5 pr-4 select-none gpu-accelerated-track"
        >
          {displayEntries.map((entry, idx) => (
            <button
              key={`${entry.id}-${idx}`}
              type="button"
              onClick={() => onSelect(entry)}
              className="article-card-element group w-[270px] shrink-0 overflow-hidden rounded-[1.6rem] border border-charcoal/8 bg-white/72 p-3 text-left shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_-32px_rgba(26,26,26,0.38)] dark:border-white/10 dark:bg-white/8 sm:w-[320px] focus-visible:outline-none focus-visible:border-amber-500/30"
            >
              <div className="overflow-hidden rounded-[1.2rem] aspect-[16/10] bg-charcoal/5 relative">
                <ParallaxImage
                  src={entry.cover}
                  alt={entry.title}
                  aspectRatio="aspect-[16/10]"
                  sizes="(min-width: 1024px) 320px, 82vw"
                  tone="warm"
                  horizontal={true}
                />
              </div>
              <div className="space-y-3 px-1 pb-2 pt-4">
                <div className="flex flex-wrap gap-2 text-[12px] text-charcoal/45 dark:text-cream/45">
                  <span>{entry.date}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5 truncate max-w-[100px]">
                    <MapPin className="h-3 w-3 text-gold" /> {entry.location}
                  </span>
                  <span>•</span>
                  <span>{moodLabelMap[entry.mood] || entry.mood}</span>
                </div>
                <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-charcoal transition-colors duration-300 group-hover:text-gold dark:text-cream">
                  {entry.title}
                </h2>
                <p className="line-clamp-3 text-[13px] leading-6 text-charcoal/62 dark:text-cream/68">
                  {entry.content}
                </p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-charcoal/72 dark:text-cream/72 group-hover:text-gold transition-colors duration-300">
                    阅读故事
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Sparkles className="w-2.5 h-2.5" />
                    翻阅回忆
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

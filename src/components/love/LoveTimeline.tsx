"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { LoveEntry } from "@/interface/love";
import { MapPin, Sparkles, MailOpen, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";

interface LoveTimelineProps {
  entries: LoveEntry[];
}

export default function LoveTimeline({ entries }: LoveTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // 排序：时间轴由远及近（升序）
  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [entries],
  );

  // 复制 entries 以保证有足够的长度进行无缝滚动（至少渲染 3 个周期且大于 10 个卡片）
  const displayEntries = useMemo(() => {
    if (sortedEntries.length === 0) return [];
    const minItems = 12;
    const repeatCount = Math.max(3, Math.ceil(minItems / sortedEntries.length));
    const list: LoveEntry[] = [];
    for (let i = 0; i < repeatCount; i++) {
      list.push(...sortedEntries);
    }
    return list;
  }, [sortedEntries]);

  const [isDesktop, setIsDesktop] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // 自动播放与控制相关的 refs
  const currentX = useRef(0);
  const activeSpeed = useRef(0.8); // 自动滚动的目标速度 (px/frame)
  const currentSpeed = useRef(0.8); // 当前的实际滚动速度
  const isAutoPlaying = useRef(true);
  const rafRef = useRef<number | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const manualTweenRef = useRef<gsap.core.Tween | null>(null);

  // 监听组件是否在视口内以按需启动/停止自动滚动和漂浮动画
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // 监听窗口大小判断是否为桌面端
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // 翻转卡片，直接操作 DOM toggle class 实现状态同步，彻底消除重渲染开销
  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!trackRef.current) return;

    // 寻找同一 id 的所有复制卡片容器并 toggle 它们的翻转状态
    const cards = trackRef.current.querySelectorAll(`[data-card-id="${id}"]`);
    cards.forEach((card) => {
      card.classList.toggle("rotate-y-180");
    });

    // 翻转时重置当前卡片的 3D 倾斜
    const cardWrapper = e.currentTarget.closest(".perspective-card-wrapper") as HTMLElement;
    if (cardWrapper) {
      cardWrapper.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    }
  };

  // 鼠标移动时计算 3D 倾斜角度，直接修改 DOM 避免 React re-render 产生的掉帧
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    // 如果已经翻转（即内部包含了 class rotate-y-180），则不处理 3D 倾斜
    const innerCard = card.querySelector(".transform-style-3d");
    if (innerCard && innerCard.classList.contains("rotate-y-180")) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;

    // 倾斜最大角度设为 6 度，更加柔和
    const rotateX = ((yc - y) / yc) * 6;
    const rotateY = ((x - xc) / xc) * 6;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.015)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  // GSAP 驱动的水平自动滚动与无缝循环 (仅在视口内时按需开启)
  useEffect(() => {
    if (!isDesktop || sortedEntries.length === 0 || !isInView) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (manualTweenRef.current) manualTweenRef.current.kill();
      if (trackRef.current && (!isDesktop || sortedEntries.length === 0)) {
        gsap.set(trackRef.current, { x: 0 });
      }
      return;
    }

    const cardWidth = 380;
    const gap = 32;
    const step = cardWidth + gap;
    const singleCycleWidth = sortedEntries.length * step;

    isAutoPlaying.current = true;
    currentSpeed.current = activeSpeed.current;

    const tick = () => {
      if (isAutoPlaying.current) {
        // 平滑插值速度以实现悬停减速暂停
        currentSpeed.current = gsap.utils.interpolate(
          currentSpeed.current,
          activeSpeed.current,
          0.06
        );

        currentX.current -= currentSpeed.current;

        // 无缝取模
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
  }, [isDesktop, sortedEntries, isInView]);

  // 卡片轻微的上下漂浮动画 (仅在视口内时运行以节约开销，限制选择范围在轨道容器内)
  useEffect(() => {
    if (!isDesktop || displayEntries.length === 0 || !isInView) return;

    if (!trackRef.current) return;
    const cards = gsap.utils.toArray<HTMLElement>(trackRef.current.querySelectorAll(".timeline-card"));

    const floatingTweens = cards.map((card: any) => {
      return gsap.to(card, {
        y: "random(-6, 6)",
        duration: "random(3.5, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: "random(0, 2)"
      });
    });

    return () => {
      floatingTweens.forEach((tween: any) => tween.kill());
    };
  }, [isDesktop, displayEntries, isInView]);

  // 恢复自动播放的定时器
  const resetAutoPlayTimer = () => {
    if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    autoPlayTimeoutRef.current = setTimeout(() => {
      isAutoPlaying.current = true;
      activeSpeed.current = 0.8;
    }, 5000); // 手动交互后 5 秒恢复自动滚动
  };

  // 左右控制按钮逻辑
  const handleManualNavigate = (direction: "next" | "prev") => {
    if (sortedEntries.length === 0) return;

    const cardWidth = 380;
    const gap = 32;
    const step = cardWidth + gap;
    const singleCycleWidth = sortedEntries.length * step;

    // 暂停自动播放
    isAutoPlaying.current = false;
    if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);

    // 1. 规范化当前坐标到 [-singleCycleWidth, 0] 范围内
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

    // 3. 平滑过渡到目标位置
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
        // 动画完成后重新规范化，确保始终处于基础周期内
        let finalX = currentX.current;
        while (finalX <= -singleCycleWidth) finalX += singleCycleWidth;
        while (finalX > 0) finalX -= singleCycleWidth;
        currentX.current = finalX;
        gsap.set(trackRef.current, { x: finalX });

        // 开启自动播放延迟启动器
        resetAutoPlayTimer();
      }
    });
  };

  // 鼠标移入轨道减速暂停
  const handleMouseEnterTrack = () => {
    if (isAutoPlaying.current) {
      activeSpeed.current = 0;
    }
  };

  // 鼠标移出轨道恢复速度
  const handleMouseLeaveTrack = () => {
    if (isAutoPlaying.current) {
      activeSpeed.current = 0.8;
    }
  };

  useEffect(() => {
    return () => {
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full py-20 bg-gradient-to-b from-pink-50/20 via-pink-100/10 to-amber-50/10 dark:from-zinc-950 dark:via-zinc-900/30 dark:to-zinc-950 border-y border-pink-200/10 dark:border-zinc-800/40 relative overflow-hidden"
    >
      {/* 模块标题（大气排版） */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center relative z-20">
        <span className="text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400 font-sans font-bold bg-amber-500/5 dark:bg-amber-400/10 px-3 py-1 rounded-full border border-amber-500/10 dark:border-amber-400/20">
          ANNIVERSARY CHRONICLE
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif mt-5 font-bold text-charcoal dark:text-cream tracking-wide">
          恋爱编年史
        </h2>
        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-4" />
        <p className="text-sm text-charcoal/65 dark:text-cream/65 mt-4 max-w-md mx-auto font-sans leading-relaxed">
          时光静流，万物生长。我们在年华的脉络里，写下相依前行的波澜诗篇。
        </p>
      </div>

      {/* 滚动容器 */}
      <div
        ref={containerRef}
        className="w-full relative overflow-x-auto lg:overflow-x-hidden no-scrollbar py-8 z-20"
      >
        {/* 桌面端左右悬浮导航按钮 */}
        {isDesktop && sortedEntries.length > 0 && (
          <>
            <button
              onClick={() => handleManualNavigate("prev")}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full flex items-center justify-center bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md border border-amber-500/20 dark:border-amber-400/30 text-amber-900 dark:text-amber-400 shadow-lg hover:bg-amber-500 hover:text-white dark:hover:bg-amber-400 dark:hover:text-zinc-950 transition-all duration-300 transform hover:scale-105 active:scale-95 group focus-visible:outline-none"
              aria-label="上一张"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2] group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => handleManualNavigate("next")}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full flex items-center justify-center bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md border border-amber-500/20 dark:border-amber-400/30 text-amber-900 dark:text-amber-400 shadow-lg hover:bg-amber-500 hover:text-white dark:hover:bg-amber-400 dark:hover:text-zinc-950 transition-all duration-300 transform hover:scale-105 active:scale-95 group focus-visible:outline-none"
              aria-label="下一张"
            >
              <ChevronRight className="w-6 h-6 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}

        {/* 滚动长轨道 */}
        <div
          ref={trackRef}
          onMouseEnter={handleMouseEnterTrack}
          onMouseLeave={handleMouseLeaveTrack}
          className="relative flex items-center h-[560px] px-8 lg:px-[10vw] gap-8 w-max select-none gpu-accelerated-track"
        >
          {/* 中央时光轴线 */}
          <div className="absolute left-0 right-0 top-[280px] -translate-y-1/2 h-[2px] pointer-events-none z-10">
            <div className="w-full h-full border-t border-dashed border-amber-600/15 dark:border-amber-400/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
          </div>

          {displayEntries.map((entry, index) => {
            const isOdd = index % 2 === 0;
            const cardKey = `${entry.id}-${index}`;

            return (
              <div
                key={cardKey}
                className="relative flex flex-col items-center shrink-0 w-[380px] h-full justify-center"
              >
                {/* 轴上节点 */}
                <div className="absolute left-1/2 top-[280px] w-5 h-5 bg-pink-50 dark:bg-zinc-950 border-2 border-amber-500 dark:border-amber-400 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center shadow-md">
                  <span className="w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-ping opacity-75"></span>
                </div>

                {/* 垂直连接虚线 */}
                {isOdd ? (
                  <div className="absolute top-[260px] bottom-[280px] left-1/2 w-0 border-l border-dashed border-amber-500/30 dark:border-amber-400/35 pointer-events-none z-10 animate-pulse" />
                ) : (
                  <div className="absolute top-[280px] bottom-[300px] left-1/2 w-0 border-l border-dashed border-amber-500/30 dark:border-amber-400/35 pointer-events-none z-10 animate-pulse" />
                )}

                {/* 宽幅电影感故事卡片容器 */}
                <div
                  className={`w-full absolute transition-transform duration-500 timeline-card ${
                    isOdd ? "top-2" : "bottom-2"
                  }`}
                >
                  <div
                    onClick={(e) => toggleFlip(entry.id, e)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="perspective-card-wrapper w-full h-[430px] perspective cursor-pointer select-none relative transition-transform duration-300 ease-out"
                  >
                    {/* 卡片顶置装饰微贴 */}
                    <div
                      className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-20 h-5 bg-white/40 dark:bg-white/10 backdrop-blur-[3px] border border-white/20 shadow-sm rotate-[-1.5deg] z-30 pointer-events-none"
                      style={{
                        clipPath: "polygon(2% 15%, 8% 0%, 92% 0%, 98% 18%, 97% 85%, 89% 100%, 11% 100%, 3% 90%)"
                      }}
                    ></div>

                    <div
                      data-card-id={entry.id}
                      className="relative w-full h-full transition-transform duration-700 transform-style-3d"
                    >
                      {/* 正面：电影画幅故事卡 */}
                      <div
                        className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-amber-500/10 dark:border-amber-400/15 rounded-2xl p-4 shadow-[0_20px_50px_rgba(219,39,119,0.04)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.35)] flex flex-col backface-hidden z-20 group/card"
                      >
                        {/* 电影宽幅图像 */}
                        <div className="w-full h-[210px] bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden relative shrink-0 border border-charcoal/5 dark:border-white/5 shadow-inner">
                          <Image
                            src={entry.cover}
                            alt={entry.title}
                            fill
                            sizes="360px"
                            className="object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                          
                          {/* 右上角精致地点小金章 */}
                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-[10px] text-amber-900 dark:text-amber-400 rounded-full font-sans flex items-center gap-1 shadow-sm border border-amber-500/10 dark:border-amber-400/20">
                            <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span className="font-semibold">{entry.location}</span>
                          </div>
                        </div>

                        {/* 排版内容：大日期 & 社论文字 */}
                        <div className="grow flex flex-col justify-between pt-4 overflow-hidden text-left">
                          <div className="space-y-2">
                            {/* 大衬线日期 */}
                            <div className="flex items-center gap-3 font-serif">
                              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 tracking-tight">
                                {entry.date.substring(5)}
                              </span>
                              <span className="h-3.5 w-[1px] bg-charcoal/15 dark:bg-white/20" />
                              <span className="text-[10px] tracking-widest text-charcoal/50 dark:text-cream/50 font-mono">
                                {entry.date.substring(0, 4)}
                              </span>
                            </div>

                            {/* 标题 */}
                            <h3 className="text-base font-serif font-bold text-charcoal dark:text-cream tracking-wide line-clamp-1">
                              {entry.title}
                            </h3>
                            {/* 正文 */}
                            <p className="text-xs text-charcoal/65 dark:text-cream/65 leading-relaxed font-sans line-clamp-3">
                              {entry.content}
                            </p>
                          </div>

                          {/* 底部精细微章 */}
                          <div className="mt-3 pt-3 border-t border-charcoal/5 dark:border-white/5 flex items-center justify-between text-[10px] text-charcoal/40 dark:text-cream/45 font-sans">
                            <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-medium">
                              <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
                              Love Memoir
                            </span>
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium group-hover/card:text-amber-700 dark:group-hover/card:text-amber-300 transition-colors">
                              <Sparkles className="w-3 h-3 animate-spin-slow" />
                              点击翻阅回想
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 背面：复古信笺故事 */}
                      <div className="absolute inset-0 bg-[#FCFAF2] dark:bg-zinc-950 border border-amber-900/15 dark:border-amber-400/20 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.4)] rotate-y-180 backface-hidden flex flex-col justify-between z-10 overflow-hidden">
                        {/* 优雅信纸横线格 */}
                        <div
                          className="absolute inset-0 opacity-25 dark:opacity-10 pointer-events-none"
                          style={{
                            backgroundImage: "linear-gradient(#c5a880 1px, transparent 1px)",
                            backgroundSize: "100% 24px",
                            paddingTop: "48px"
                          }}
                        ></div>

                        <div className="grow flex flex-col min-h-0 z-10 relative text-left">
                          {/* 背面页眉 */}
                          <div className="border-b border-amber-900/15 dark:border-white/10 pb-2 mb-3 flex items-center justify-between">
                            <span className="text-xs font-serif font-bold text-amber-900 dark:text-amber-400 flex items-center gap-1.5 tracking-wider">
                              <MailOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                              MEMOIR / 爱的回想
                            </span>
                            <div className="w-6 h-6 rounded-full bg-red-600 dark:bg-red-700/80 flex items-center justify-center shadow-md rotate-[15deg]">
                              <Heart className="w-3 h-3 text-white fill-current" />
                            </div>
                          </div>

                          {/* 信札内容 */}
                          <div
                            className="mt-1 grow overflow-y-auto pr-1 text-xs font-sans leading-[24px] text-amber-950 dark:text-zinc-200 font-medium whitespace-pre-line text-left scrollbar-none"
                            style={{ paddingTop: "1px" }}
                          >
                            {entry.content}
                          </div>
                        </div>

                        {/* 返回提示 */}
                        <div className="mt-3 border-t border-amber-900/10 dark:border-white/10 pt-2 text-[10px] text-amber-800/60 dark:text-zinc-400/60 text-center flex items-center justify-center gap-1 z-10 font-sans">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>点击卡片翻回正面</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { BookOpen, Film, Music } from "lucide-react";
import gsap from "gsap";

const statusCards = [
  {
    icon: BookOpen,
    title: "正在读",
    value: "《时间的秩序》",
    body: "把夜晚留给物理、散文和几页慢读。读到好的句子就收进手账。",
  },
  {
    icon: Film,
    title: "正在做",
    value: "春风不解别离",
    body: "把文章、相册和生活状态重新整理成一个更像家的个人博客。",
  },
  {
    icon: Music,
    title: "正在听",
    value: "Bill Evans Trio",
    body: "钢琴声很轻，适合写代码、整理照片，也适合把页面留白收紧一点。",
  },
];

// 重复 3 次卡片列表以实现无缝水平循环滚动
const extendedCards = [...statusCards, ...statusCards, ...statusCards];

export default function StatusGrid() {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const ctx = gsap.context(() => {
      // 计算单组卡片（共3张卡片加对应间距）的总宽度，作为滚动的循环临界点
      const getTranslateDistance = () => track.scrollWidth / 3;

      // 创建平滑的无限水平滚动动画
      tweenRef.current = gsap.to(track, {
        x: () => -getTranslateDistance(),
        duration: 20, // 调整滚动速度（数值越大滚动越慢）
        ease: "none",
        repeat: -1,
      });
    }, track);

    const handleResize = () => {
      if (tweenRef.current) {
        tweenRef.current.invalidate();
        tweenRef.current.restart();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMouseEnter = () => {
    tweenRef.current?.pause();
  };

  const handleMouseLeave = () => {
    tweenRef.current?.play();
  };

  return (
    <div className="mask-image-horizontal overflow-hidden w-full py-2">
      <div
        ref={trackRef}
        className="flex gap-4 w-max gpu-accelerated-track"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {extendedCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={`${item.title}-${index}`}
              className="home-card-reveal w-[260px] shrink-0 rounded-[1.6rem] border border-charcoal/8 bg-white/68 p-5 shadow-sm backdrop-blur transition duration-300 hover:bg-white/82 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12 sm:w-[300px]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/14 text-gold">
                <Icon className="h-5 w-5 stroke-[1.6]" />
              </div>
              <p className="text-[13px] text-charcoal/50 dark:text-cream/50">{item.title}</p>
              <h3 className="mt-2 text-lg font-semibold text-charcoal dark:text-cream">{item.value}</h3>
              <p className="mt-3 text-[13px] leading-6 text-charcoal/62 dark:text-cream/68">{item.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

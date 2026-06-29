"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StorySlide {
  year: string;
  title: string;
  image: string;
  quote: string;
  sub: string;
}

export default function HorizontalTrack() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const slides: StorySlide[] = [
    {
      year: "2019",
      title: "银盐碎影 / Silver Halide",
      image: "/assets/writing-camera.png",
      quote: "快门被按下的瞬间，时间被永久锁在感光乳剂中。那是我最初窥探世界、保存生活温度的方式。",
      sub: "RICOH GR · 50MM F/1.8",
    },
    {
      year: "2021",
      title: "东京雨夜 / Neon & Rain",
      image: "/assets/writing-tokyo.png",
      quote: "霓虹在积水里融化，便利店的关东煮冒着热气。我们只是路过时间的旅人，但代码记录下了脚步。",
      sub: "SHINJUKU · 35MM F/2.0",
    },
    {
      year: "2023",
      title: "逻辑重力 / Midnight Coffee",
      image: "/assets/writing-coffee.png",
      quote: "在咖啡的温热与冷冽的终端指令之间，逻辑世界在此默默搭建。一行编译成功的代码就是一次呼吸。",
      sub: "VS CODE · RUST / NEXT.JS",
    },
    {
      year: "2025",
      title: "穹顶之下 / Museum Vault",
      image: "/assets/love-museum.png",
      quote: "在艺术馆的几何穹顶之下，光影的律动与算法的曲线交融。理性的代码最终通往感性的美学。",
      sub: "PRIVATE EXHIBITION",
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // 仅在桌面端 (>= 1024px) 开启 GSAP Pinned Scrub 横向平移
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    let ctx: gsap.Context;

    const setupAnimations = () => {
      ctx = gsap.context(() => {
        // 计算需要滚动的总距离 = 轨道宽度 - 视口宽度
        const scrollWidth = track.scrollWidth;
        const viewportWidth = window.innerWidth;
        const totalScrollDistance = scrollWidth - viewportWidth;

        if (totalScrollDistance <= 0) return;

        // 水平平移 Timeline
        gsap.to(track, {
          x: -totalScrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${totalScrollDistance * 1.2}`, // 滚动距离乘以阻尼
            pin: true,
            scrub: 1.2, // 惯性阻尼
            invalidateOnRefresh: true,
          },
        });

        // 对每张拍立得卡片进入视口时做轻微的 3D 浮动与位移动画
        const cardEls = track.querySelectorAll(".film-card");
        cardEls.forEach((card, idx) => {
          gsap.fromTo(
            card,
            {
              scale: 0.9,
              y: 50,
              rotationZ: idx % 2 === 0 ? -6 : 6,
            },
            {
              scale: 1,
              y: 0,
              rotationZ: idx % 2 === 0 ? -1.5 : 2,
              scrollTrigger: {
                trigger: card,
                containerAnimation: gsap.getById("trackAnim") || undefined, // 水平平移动画触发关联
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        });
      }, section);
    };

    if (mediaQuery.matches) {
      setupAnimations();
    }

    // 监听窗口大小变化以重建动画或卸载
    const handleQueryChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setupAnimations();
      } else {
        if (ctx) ctx.revert();
      }
    };

    mediaQuery.addEventListener("change", handleQueryChange);

    return () => {
      if (ctx) ctx.revert();
      mediaQuery.removeEventListener("change", handleQueryChange);
    };
  }, [slides.length]);

  return (
    <div ref={sectionRef} className="relative w-full overflow-hidden bg-cream-dark/30 dark:bg-zinc-950/20 border-y border-charcoal/5 dark:border-white/5 py-12 md:py-24">
      
      {/* 模块说明 */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mb-8 md:mb-12 flex flex-col gap-2">
        <span className="text-[10px] font-sans font-semibold tracking-[0.25em] text-gold uppercase">
          02 / Life Pieces
        </span>
        <h2 className="font-serif text-2xl md:text-4xl font-light text-charcoal dark:text-white">
          生活胶片 / 记忆的轨道
        </h2>
      </div>

      {/* 滚动平移轨道 - 移动端支持原生 scroll-snap 滚动，桌面端由 GSAP Pinned 驱动 */}
      <div 
        className="w-full overflow-x-auto no-scrollbar scroll-smooth lg:overflow-hidden lg:no-scrollbar flex lg:block"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div
          ref={trackRef}
          className="gpu-accelerated-track flex gap-8 md:gap-16 px-6 md:px-16 w-max lg:h-[70vh] items-center"
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="film-card flex-shrink-0 w-[80vw] max-w-[340px] md:w-[480px] md:max-w-none bg-white dark:bg-zinc-900 border border-charcoal/10 dark:border-white/10 p-5 md:p-6 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.08)] transform hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 ease-out select-none cursor-pointer"
              style={{
                scrollSnapAlign: "center",
                transform: `rotate(${idx % 2 === 0 ? "-1deg" : "1.5deg"})`,
              }}
            >
              {/* 拍立得照片 */}
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-cream-dark shadow-inner">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 768px) 80vw, 480px"
                  className="object-cover transition-all duration-700 hover:scale-105"
                />
              </div>

              {/* 手写日记文字内容 */}
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex justify-between items-baseline border-b border-charcoal/5 dark:border-white/5 pb-2">
                  <h3 className="font-serif text-lg md:text-xl font-light text-charcoal dark:text-white">
                    {slide.title}
                  </h3>
                  <span className="font-mono text-xs text-gold font-semibold">
                    {slide.year}
                  </span>
                </div>
                
                {/* 使用毛笔字/手写感字体强调故事性 */}
                <p className="font-serif text-xs md:text-sm text-charcoal/70 dark:text-white/70 leading-relaxed font-light mt-1 min-h-[4.5em]">
                  {slide.quote}
                </p>

                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-charcoal/40 dark:text-white/40 mt-2">
                  <span>METADATA</span>
                  <span>{slide.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

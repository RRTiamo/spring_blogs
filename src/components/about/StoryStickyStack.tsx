"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StackCardData {
  num: string;
  category: string;
  title: string;
  desc: string;
  details: string[];
}

export default function StoryStickyStack() {
  const containerRef = useRef<HTMLDivElement>(null);

  const cards: StackCardData[] = [
    {
      num: "01",
      category: "BIOGRAPHY",
      title: "理性代码，感性生活",
      desc: "游走在极致逻辑与视觉浪漫之间的创造者。白天，我编写模块清晰、结构稳固、类型安全的代码；雨夜，我沉溺于老相机胶卷、黑胶唱片的律动中，并亲手在数字空间构建这一处私人档案馆。",
      details: ["逻辑之美：推崇整洁的代码结构与健壮的前端架构", "视觉探索：执着于像素级的视觉把控与阻尼动效调节", "生活银盐：热爱胶片摄影、模拟声学与老旧物件的肌理"],
    },
    {
      num: "02",
      category: "HABITATS",
      title: "对抗冰冷的精神避难所",
      desc: "本站「春风不解别离」的诞生，是为了在嘈杂的互联网洪流中，寻找一个安静记录生活碎片的自留地。这里没有 KPI，没有算法推荐，只有对生活最本真的凝视和关于设计、旅行的个人印记。",
      details: ["无算法推荐：只做最纯粹的静态内容分发与个人记录", "细节至上：全站暖纸色、微噪点颗粒及双线分隔符", "治愈系组件：提供磁带播放器与趴窗猫咪，治愈数字焦虑"],
    },
    {
      num: "03",
      category: "YEARNING",
      title: "电影分镜式的动效执念",
      desc: "我认为网页的动效与交互不应是炫技，而应当如同“编辑过的电影分镜”一样克制、缓慢、富有叙事张力。我会用一生探索代码、美学与交互的融合边界，直到将这个小宇宙搭建完成。",
      details: ["克制交互：禁止无脑的晃动与高亮，每一次动效皆有动机", "硬件加速：动画严格限制在 GPU 层，保障 60fps 平滑滚动", "美学持久：追求耐读的现代非对称排版，拒绝快餐式设计"],
    },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 仅在 >= 1024px 注册 ScrollTrigger Pin Stack
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    let ctx: gsap.Context;

    const setupPin = () => {
      ctx = gsap.context(() => {
        const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
        if (cardEls.length === 0) return;

        // 遍历卡片（除最后一张外都做 Pin）
        cardEls.forEach((card, i) => {
          if (i === cardEls.length - 1) return;

          ScrollTrigger.create({
            trigger: card,
            start: "top 12%", // 顶端对其页面顶部 12% 处
            endTrigger: cardEls[cardEls.length - 1],
            end: "top 12%",
            pin: true,
            pinSpacing: false,
          });

          // 前面的卡片随着后面卡片滑上来，逐渐缩小和变暗
          gsap.to(card, {
            scale: 0.92 - (cardEls.length - 1 - i) * 0.02,
            opacity: 0.5,
            ease: "none",
            scrollTrigger: {
              trigger: cardEls[i + 1],
              start: "top bottom",
              end: "top 12%",
              scrub: true,
            },
          });
        });
      }, container);
    };

    if (mediaQuery.matches) {
      setupPin();
    }

    const handleQueryChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setupPin();
      } else {
        if (ctx) ctx.revert();
      }
    };

    mediaQuery.addEventListener("change", handleQueryChange);

    return () => {
      if (ctx) ctx.revert();
      mediaQuery.removeEventListener("change", handleQueryChange);
    };
  }, []);

  // 鼠标移入卡片：3D 倾斜和动态扫光效果
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // 相对卡片左侧
    const y = e.clientY - rect.top;  // 相对卡片顶部

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 倾斜系数 (最大倾斜 7 度，保持克制)
    const rotateX = -(e.clientY - rect.top - centerY) / 35;
    const rotateY = (e.clientX - rect.left - centerX) / 35;

    gsap.to(card, {
      rotationX: rotateX,
      rotationY: rotateY,
      transformPerspective: 1000,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });

    const shine = card.querySelector(".shine-overlay") as HTMLElement;
    if (shine) {
      gsap.to(shine, {
        background: `radial-gradient(280px circle at ${x}px ${y}px, rgba(217, 134, 95, 0.15), transparent 80%)`,
        duration: 0.1,
        overwrite: "auto",
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
    });

    const shine = card.querySelector(".shine-overlay") as HTMLElement;
    if (shine) {
      gsap.to(shine, {
        background: `radial-gradient(280px circle at 50% 50%, rgba(217, 134, 95, 0), transparent 80%)`,
        duration: 0.8,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* 左侧固定说明面板 */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
          <span className="text-[10px] font-sans font-semibold tracking-[0.25em] text-gold uppercase">
            03 / PHILOSOPHY
          </span>
          <h2 className="font-serif text-2xl md:text-4xl font-light text-charcoal dark:text-white leading-tight">
            设计执念与<br />
            灵魂切片
          </h2>
          <p className="font-sans text-xs md:text-sm text-charcoal/50 dark:text-white/50 leading-relaxed max-w-sm">
            滚动滚轮，查看关于本站创建初衷、个人设计哲学与开发追求的详细叠放档案。
          </p>
        </div>

        {/* 右侧叠放卡片流 */}
        <div className="lg:col-span-8 space-y-12 lg:space-y-24">
          {cards.map((card, idx) => (
            <div
              key={idx}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="stack-card group relative overflow-hidden bg-white/95 dark:bg-zinc-900/95 border border-charcoal/10 dark:border-white/10 p-8 md:p-12 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(217,134,95,0.08)] transition-shadow duration-500 transform-style-3d cursor-pointer select-none"
              style={{
                top: `${idx * 24}px`, // 每一层有卡片错落的高差叠放感
                zIndex: idx + 10,
              }}
            >
              {/* 3D 扫光高亮层 */}
              <div className="shine-overlay pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 bg-transparent" />

              {/* 卡片核心内容 */}
              <div className="relative z-10 space-y-8">
                {/* 头部信息 */}
                <div className="flex justify-between items-baseline border-b border-charcoal/5 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-gold tracking-widest">
                      {card.num}
                    </span>
                    <span className="font-sans text-[10px] font-semibold text-charcoal/40 dark:text-white/40 tracking-[0.2em] uppercase">
                      {card.category}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-charcoal/30 dark:text-white/30">
                    CLASSIFIED INFO
                  </span>
                </div>

                {/* 标题 */}
                <h3 className="font-serif text-xl md:text-3xl font-light text-charcoal dark:text-white">
                  {card.title}
                </h3>

                {/* 描述 */}
                <p className="font-sans text-xs md:text-sm text-charcoal/70 dark:text-white/70 leading-relaxed font-light">
                  {card.desc}
                </p>

                {/* 列表细节 */}
                <ul className="space-y-3 pt-2">
                  {card.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                      <span className="font-sans text-[11px] md:text-xs text-charcoal/60 dark:text-white/60 font-light">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

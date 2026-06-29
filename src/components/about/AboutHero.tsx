"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

export default function AboutHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const card1 = card1Ref.current;
    const card2 = card2Ref.current;
    const card3 = card3Ref.current;
    const textEl = textRef.current;

    if (!container || !card1 || !card2 || !card3 || !textEl) return;

    // 确认 GSAP targets 存在
    const cards = [card1, card2, card3];
    const letters = textEl.querySelectorAll(".char-inner");

    const ctx = gsap.context(() => {
      // 1. 设置卡片初始叠放状态：居中、重叠、带轻微的缩放与暗淡
      gsap.set(cards, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        rotationX: 15,
        rotationY: -15,
        rotationZ: 0,
        scale: 0.85,
        opacity: 0,
        transformPerspective: 1000,
      });

      // 2. 字母遮罩动画：由下而上滑动，带有模糊度变化
      gsap.fromTo(
        letters,
        {
          y: "120%",
          filter: "blur(8px)",
          opacity: 0,
        },
        {
          y: "0%",
          filter: "blur(0px)",
          opacity: 1,
          duration: 1.2,
          stagger: 0.04,
          ease: "power4.out",
          delay: 0.2,
        }
      );

      // 3. 3D 卡片爆炸式向四周抛散
      const tl = gsap.timeline({ delay: 0.8 });

      // 首先淡入卡片
      tl.to(cards, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      });

      // 然后抛散至非对称位置
      // 卡片1：向左侧倾斜抛出
      tl.to(
        card1,
        {
          x: -240,
          y: -40,
          rotationX: 10,
          rotationY: -20,
          rotationZ: -8,
          duration: 1.4,
          ease: "elastic.out(1, 0.75)",
        },
        "-=0.4"
      );

      // 卡片2：向右侧倾斜抛出
      tl.to(
        card2,
        {
          x: 240,
          y: -80,
          rotationX: -8,
          rotationY: 15,
          rotationZ: 6,
          duration: 1.4,
          ease: "elastic.out(1, 0.75)",
        },
        "-=1.4"
      );

      // 卡片3：中间轻微往下并转正，作为视觉中心
      tl.to(
        card3,
        {
          x: 0,
          y: 60,
          rotationX: 5,
          rotationY: -5,
          rotationZ: 2,
          duration: 1.4,
          ease: "elastic.out(1, 0.75)",
        },
        "-=1.4"
      );

      // 4. 浮动悬停微物理效果：使卡片有轻微的呼吸感和漂浮感
      cards.forEach((card, idx) => {
        gsap.to(card, {
          y: "+=12",
          rotationZ: idx % 2 === 0 ? "+=1.5" : "-=1.5",
          duration: 3 + idx * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: idx * 0.2,
        });
      });
    }, container);

    // 5. 3D 磁性悬停倾斜 (Hover Mouse Follower)
    const handleMouseMove = (e: MouseEvent) => {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardX = rect.left + rect.width / 2;
        const cardY = rect.top + rect.height / 2;
        
        // 算出鼠标相对卡片中心的偏移距离
        const angleX = (e.clientY - cardY) / (window.innerHeight / 2);
        const angleY = (e.clientX - cardX) / (window.innerWidth / 2);

        // 磁性倾斜映射：最大倾斜 22 度
        gsap.to(card, {
          rotationX: -angleX * 22,
          rotationY: angleY * 22,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    };

    const handleMouseLeave = () => {
      // 鼠标离开时恢复浮动与各自初始抛散的旋转姿态
      gsap.to(card1, { rotationX: 10, rotationY: -20, duration: 0.8, ease: "power2.out" });
      gsap.to(card2, { rotationX: -8, rotationY: 15, duration: 0.8, ease: "power2.out" });
      gsap.to(card3, { rotationX: 5, rotationY: -5, duration: 0.8, ease: "power2.out" });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      ctx.revert();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 字符切割包装
  const rawText = "与代码对话，在银盐与数字档案中勾勒生活。";
  const charArray = Array.from(rawText);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90dvh] flex flex-col items-center justify-between py-12 overflow-hidden select-none"
      style={{ perspective: "1500px" }}
    >
      {/* 背景光晕 */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[30vh] bg-gold/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* 顶部标签 */}
      <div className="z-10 mt-6 md:mt-10 flex flex-col items-center gap-1.5">
        <span className="text-[10px] font-sans font-semibold tracking-[0.25em] text-gold uppercase px-3 py-1 bg-gold/10 border border-gold/15 rounded-full">
          01 / GENESIS
        </span>
      </div>

      {/* 首屏 3D 照片容器 */}
      <div className="relative w-full max-w-4xl h-[40vh] md:h-[45vh] flex items-center justify-center z-10">
        
        {/* 卡片 1 (左侧抛卡) */}
        <div
          ref={card1Ref}
          className="absolute left-1/2 top-1/2 w-48 h-64 md:w-56 md:h-76 bg-white dark:bg-zinc-900 border border-charcoal/10 dark:border-white/10 p-3 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.12)] cursor-pointer"
        >
          <div className="relative w-full h-[82%] rounded-xl overflow-hidden bg-cream-dark">
            <Image
              src="/assets/writing-camera.png"
              alt="Silver Halide Camera"
              fill
              sizes="(max-width: 768px) 192px, 224px"
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="mt-3 flex justify-between items-center px-1">
            <span className="text-[9px] font-mono tracking-widest text-charcoal/40 dark:text-white/40">FOCAL POINT</span>
            <span className="text-[10px] font-serif text-charcoal/60 dark:text-white/60">銀塩記憶</span>
          </div>
        </div>

        {/* 卡片 2 (右侧抛卡) */}
        <div
          ref={card2Ref}
          className="absolute left-1/2 top-1/2 w-48 h-64 md:w-56 md:h-76 bg-white dark:bg-zinc-900 border border-charcoal/10 dark:border-white/10 p-3 rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.12)] cursor-pointer"
        >
          <div className="relative w-full h-[82%] rounded-xl overflow-hidden bg-cream-dark">
            <Image
              src="/assets/writing-coffee.png"
              alt="Coffee & Code"
              fill
              sizes="(max-width: 768px) 192px, 224px"
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="mt-3 flex justify-between items-center px-1">
            <span className="text-[9px] font-mono tracking-widest text-charcoal/40 dark:text-white/40">LATE NIGHTS</span>
            <span className="text-[10px] font-serif text-charcoal/60 dark:text-white/60">咖啡与终端</span>
          </div>
        </div>

        {/* 卡片 3 (居中核心卡) */}
        <div
          ref={card3Ref}
          className="absolute left-1/2 top-1/2 w-52 h-68 md:w-60 md:h-80 bg-white dark:bg-zinc-900 border border-charcoal/15 dark:border-white/15 p-3 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] cursor-pointer z-20"
        >
          <div className="relative w-full h-[82%] rounded-xl overflow-hidden bg-cream-dark">
            <Image
              src="/assets/love-museum.png"
              alt="Museum & Art"
              fill
              sizes="(max-width: 768px) 208px, 240px"
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="mt-3 flex justify-between items-center px-1">
            <span className="text-[9px] font-mono tracking-widest text-gold">CURRENT ATTIRE</span>
            <span className="text-[10px] font-serif text-charcoal/80 dark:text-white/80 font-medium">数字生命</span>
          </div>
        </div>

      </div>

      {/* 底部开屏炫酷文字滚动 */}
      <div className="w-full max-w-4xl px-6 text-center z-10 mb-8">
        <h1
          ref={textRef}
          className="font-serif text-3xl md:text-5xl lg:text-6xl font-light text-charcoal dark:text-white leading-[1.25] tracking-wide"
        >
          {charArray.map((char, idx) => (
            <span
              key={idx}
              className="inline-block overflow-hidden h-[1.2em] vertical-align-bottom"
              style={{ contentVisibility: "auto" }}
            >
              <span className="char-inner inline-block transform translate-y-[120%] opacity-0 filter blur-[8px] select-text">
                {char === "，" ? "，" : char === "。" ? "。" : char}
              </span>
            </span>
          ))}
        </h1>
        <p className="mt-8 font-sans text-xs md:text-sm text-charcoal/50 dark:text-white/50 tracking-widest uppercase font-light">
          SCROLL DOWN TO DECLASSIFY · 向下滑动解密档案
        </p>
      </div>

    </section>
  );
}

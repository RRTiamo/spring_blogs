"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aboutIcons } from "@/icon/about";
import type { AboutIconName, AboutLink, AboutProfile } from "@/interface/about";
import RotatingText from "@/components/ui/RotatingText";
import SpotlightCard from "@/components/ui/SpotlightCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface AboutPageClientProps {
  profile: AboutProfile;
}



// 统一图标渲染
function AboutIcon({ name, className = "h-5 w-5" }: { name: AboutIconName; className?: string }) {
  const Icon = aboutIcons[name];
  if (!Icon) return null;
  return <Icon aria-hidden="true" className={className} weight="regular" />;
}

// 统一按钮链接
function ActionLink({ link, primary = false }: { link: AboutLink; primary?: boolean }) {
  const className = primary
    ? "relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white dark:text-zinc-900 hover:bg-gold/90 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-px shadow-lg shadow-gold/15 group"
    : "inline-flex items-center justify-center gap-2 rounded-full border border-charcoal/15 bg-cream/70 px-6 py-3 text-sm font-medium text-charcoal hover:border-gold hover:bg-cream-dark transition-all duration-300 hover:-translate-y-0.5 active:translate-y-px dark:border-white/15 dark:text-cream dark:bg-zinc-900/40 dark:hover:bg-zinc-900/90";

  if (primary) {
    return (
      <Link
        href={link.href}
        className={className}
        target={link.external ? "_blank" : undefined}
        rel={link.external ? "noreferrer" : undefined}
      >
        {/* Shiny sweep sweep effect */}
        <span className="absolute inset-0 w-[50%] h-full bg-white/20 transform -skew-x-12 -translate-x-[150%] animate-shine-sweep pointer-events-none" />
        <span className="relative z-10 whitespace-nowrap">{link.label}</span>
        <AboutIcon name={link.icon} className="relative z-10 h-4 w-4" />
      </Link>
    );
  }

  return (
    <Link
      href={link.href}
      className={className}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
    >
      <span className="whitespace-nowrap">{link.label}</span>
      <AboutIcon name={link.icon} className="h-4 w-4" />
    </Link>
  );
}

export default function AboutPageClient({ profile }: AboutPageClientProps) {
  const rootRef = useRef<HTMLElement>(null);
  const genesisContainerRef = useRef<HTMLDivElement>(null);

  // 状态：彩蛋点击次数与消息气泡
  const eggClickCountRef = useRef(0);
  const [showEggMessage, setShowEggMessage] = useState(false);

  // 状态：聚光灯的鼠标微动偏移
  const [spotlightOffset, setSpotlightOffset] = useState({ x: 0, y: 0 });

  // 隐藏彩蛋触发函数
  const handleEggClick = () => {
    eggClickCountRef.current += 1;
    if (eggClickCountRef.current >= 5) {
      setShowEggMessage(true);
      setTimeout(() => {
        setShowEggMessage(false);
      }, 4000);
      eggClickCountRef.current = 0;
    }
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;

    // 1. GSAP 各大震撼动效绑定
    const ctx = gsap.context(() => {

      // 2. 震撼动效 1：人生坐标引线文本软上升与淡入
      const coordCards = Array.from(root.querySelectorAll<HTMLElement>(".coordinate-card"));
      if (coordCards.length > 0 && !reduceMotion && desktop) {
        gsap.fromTo(
          coordCards,
          {
            y: 40,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: "#coordinates",
              start: "top 80%",
            },
          }
        );
      }

      // 3. 震撼动效 2：价值观行滚动聚焦高亮与边缘高斯模糊淡出 (Scroll Scrub Highlight)
      const beliefLines = Array.from(root.querySelectorAll<HTMLElement>(".belief-line"));
      if (beliefLines.length > 0 && !reduceMotion) {
        beliefLines.forEach((line) => {
          // 滚入屏幕中央亮起动画
          gsap.fromTo(
            line,
            {
              opacity: 0.25,
              filter: "blur(4px)",
              scale: 0.97,
            },
            {
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: line,
                start: "top 82%",
                end: "top 52%",
                scrub: true,
              },
            }
          );

          // 滚出屏幕中央淡出模糊动画
          gsap.to(line, {
            opacity: 0.25,
            filter: "blur(4px)",
            scale: 0.97,
            ease: "none",
            scrollTrigger: {
              trigger: line,
              start: "bottom 48%",
              end: "bottom 18%",
              scrub: true,
            },
          });
        });
      }



      // 5. Bento 单元格 3D Staggered 折角翻转进入动画
      const bentoCells = Array.from(root.querySelectorAll<HTMLElement>(".bento-cell"));
      if (bentoCells.length > 0 && !reduceMotion) {
        gsap.fromTo(
          bentoCells,
          {
            rotationX: -18,
            y: 50,
            opacity: 0,
            transformPerspective: 1000,
          },
          {
            rotationX: 0,
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: "#fragments",
              start: "top 85%",
            },
          }
        );

        // Bento Cell hover interaction
        bentoCells.forEach((cell) => {
          const moveHandler = (e: MouseEvent) => {
            const rect = cell.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(cell, {
              rotationX: -y / (rect.height / 12),
              rotationY: x / (rect.width / 12),
              transformPerspective: 800,
              duration: 0.35,
              ease: "power2.out",
              overwrite: "auto",
            });
          };

          const leaveHandler = () => {
            gsap.to(cell, {
              rotationX: 0,
              rotationY: 0,
              duration: 0.6,
              ease: "power2.out",
              overwrite: "auto",
            });
          };

          cell.addEventListener("mousemove", moveHandler);
          cell.addEventListener("mouseleave", leaveHandler);
        });
      }

      // 6. 基础 Reveal 动画（主要适用于其他可能静态呈现的板块，防止无效果）
      const revealSections = root.querySelectorAll<HTMLElement>(".reveal-section");
      if (revealSections.length > 0 && !reduceMotion) {
        revealSections.forEach((section) => {
          // 如果是坐标或信条板块，它们的卡片有更震撼的特设动效，此处的 reveal 主要起淡入引导作用
          gsap.fromTo(
            section,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 1.0,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 90%",
                toggleActions: "play none none none",
              },
            }
          );
        });
      }
    }, root);

    // 4. 聚光灯鼠标轴偏转监听
    const handleSpotlightMove = (e: MouseEvent) => {
      if (!desktop || reduceMotion) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      setSpotlightOffset({ x: x * 60, y: y * 30 });
    };

    window.addEventListener("mousemove", handleSpotlightMove);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 350);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("mousemove", handleSpotlightMove);
      ctx.revert();
    };
  }, []);

  // 标题 TrueFocus 模糊聚焦分割字符
  const titleChars = Array.from(profile.role); // "此间主人"

  return (
    <main
      ref={rootRef}
      className="w-full max-w-full overflow-x-hidden bg-cream text-charcoal font-sans"
    >
      {/* CSS 扫光与轨迹动画关键帧注入 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shine-sweep {
          0% { transform: skewX(-12deg) translate3d(-150%, 0, 0); }
          100% { transform: skewX(-12deg) translate3d(300%, 0, 0); }
        }
        .animate-shine-sweep {
          animation: shine-sweep 2.8s ease-in-out infinite;
        }


        /* 证据网络中心 Truth 节点脉冲 */
        @keyframes ping-slow {
          0% { transform: scale(0.95); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          transform-origin: center;
        }

        /* 审美呼吸感同心圆收缩舒张 */
        @keyframes breath-1 {
          0%, 100% { transform: scale(0.92); opacity: 0.6; }
          50% { transform: scale(1.12); opacity: 0.85; filter: blur(6px); }
        }
        @keyframes breath-2 {
          0%, 100% { transform: scale(0.9); }
          50% { transform: scale(1.1); }
        }
        .animate-breath-circle-1 {
          animation: breath-1 6s ease-in-out infinite;
          transform-origin: center;
        }
        .animate-breath-circle-2 {
          animation: breath-2 6s ease-in-out infinite;
          transform-origin: center;
        }


        /* 罗盘刻度仪慢速自转 */
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-rotate-slow {
          animation: rotate-slow 90s linear infinite;
        }
        .animate-rotate-slow-reverse {
          animation: rotate-slow 120s linear infinite;
          animation-direction: reverse;
        }
      `}} />

      {/* 隐藏彩蛋浮动 Toast */}
      <AnimatePresence>
        {showEggMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-50 px-6 py-3.5 rounded-full bg-charcoal/90 text-cream text-xs font-mono tracking-wider border border-gold/25 shadow-2xl backdrop-blur-md text-center max-w-xs md:max-w-md"
          >
            ✨ 这里没有秘密，只有一个正在努力把生活过明白的人。
          </motion.div>
        )}
      </AnimatePresence>

      {/* 0. 首页开屏 Hero：此间主人 (Genesis Spotlight Hero) */}
      <section
        ref={genesisContainerRef}
        id="overview"
        className="relative min-h-[95dvh] flex flex-col justify-between py-12 px-6 overflow-hidden select-none bg-gradient-to-b from-cream to-cream-dark text-charcoal transition-all duration-300"
      >
        {/* 适配主题色的聚光灯 (Theatrical Spotlight) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <svg
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[220%] h-[120%] opacity-40 dark:opacity-55"
            style={{
              transformOrigin: "top center",
              transform: `translateX(-50%) translate3d(${spotlightOffset.x}px, ${spotlightOffset.y}px, 0)`,
              transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
            viewBox="0 0 1000 1000"
            fill="none"
          >
            <defs>
              <radialGradient id="theatrical-spotlight" cx="50%" cy="0%" r="65%">
                <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.25" />
                <stop offset="35%" stopColor="var(--accent-color)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d="M350,0 L650,0 L1000,1000 L0,1000 Z" fill="url(#theatrical-spotlight)" />
          </svg>
        </div>

        {/* 顶部标签 */}
        <div className="z-10 mt-4 flex flex-col items-center gap-1">
          <span className="text-[9px] font-sans font-semibold tracking-[0.25em] text-gold/80 uppercase px-3 py-1 bg-gold/5 border border-gold/10 rounded-full">
            INDEX / 自我索引
          </span>
        </div>

        {/* 主视觉：左文右图 */}
        <div className="z-10 mx-auto w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
          {/* 左侧文字 TrueFocus 动画 */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
            
            {/* 页面大标题：字符高斯模糊聚焦 + 身份旋转文本 */}
            <motion.h1
              className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-charcoal dark:text-white flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 cursor-pointer"
              onClick={handleEggClick}
              title="点击这行字 5 次有彩蛋"
            >
              <span className="flex gap-1">
                {titleChars.map((char, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ filter: "blur(12px)", opacity: 0, y: 15 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{
                      duration: 1.0,
                      delay: idx * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
              <RotatingText
                texts={profile.rotatingTexts && profile.rotatingTexts.length > 0 ? profile.rotatingTexts : ["rrtiamo", "builder", "creator", "dreamer"]}
                mainClassName="px-4 py-1 bg-gold text-cream dark:text-zinc-900 overflow-hidden justify-center rounded-2xl text-3xl md:text-4xl lg:text-5xl font-sans font-medium select-none"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2500}
              />
            </motion.h1>

            {/* 一句话介绍 */}
            <motion.p
              initial={{ filter: "blur(8px)", opacity: 0, y: 20 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
              className="mt-6 font-serif text-lg md:text-xl leading-relaxed text-charcoal/80 dark:text-cream/90 max-w-md lg:max-w-none"
            >
              {profile.headline}
            </motion.p>

            {/* 描述段落 */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.8, ease: "easeOut" }}
              className="mt-4 text-xs md:text-sm text-charcoal/60 dark:text-cream/60 font-light leading-relaxed max-w-md lg:max-w-none"
            >
              {profile.introduction}
            </motion.p>

            {/* 标签流 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, delay: 1.0 }}
              className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2 max-w-md lg:max-w-none"
            >
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 text-[10px] font-mono text-charcoal/70 dark:text-slate-300 hover:border-gold/30 hover:text-gold transition-colors duration-250"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* 链接按钮：增加扫光与微缩放 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 1.2 }}
              className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3"
            >
              <ActionLink link={{ label: "个人博客", href: "/", icon: "compass" }} primary />
              <ActionLink link={{ label: "GitHub", href: "https://github.com", icon: "code", external: true }} />
            </motion.div>
          </div>

          {/* 右侧卡通头像，带软光圈与双圈圆环 */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center"
            >
              {/* 头像呼吸软光晕 */}
              <div className="absolute -inset-4 bg-gold/8 rounded-full blur-2xl animate-pulse pointer-events-none" />
              
              {/* 双层圆环框 */}
              <div className="relative h-48 w-48 md:h-60 md:w-60 rounded-full p-2 border border-charcoal/10 dark:border-white/10 overflow-hidden bg-cream/30 dark:bg-zinc-900/30 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                <div className="relative h-full w-full rounded-full overflow-hidden border border-charcoal/15 dark:border-white/15">
                  <Image
                    src={profile.avatar || "/assets/avtor-boy.jpg"}
                    alt={profile.name}
                    fill
                    sizes="(max-width: 768px) 192px, 240px"
                    priority
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 底部指示器 */}
        <div className="z-10 flex flex-col items-center gap-1.5 opacity-60">
          <Link
            href="#currently"
            className="flex flex-col items-center font-sans text-[10px] text-charcoal/50 dark:text-cream/50 hover:text-gold transition-colors tracking-widest uppercase font-light"
          >
            <span>SCROLL TO DECLASSIFY</span>
            <span className="mt-1 animate-bounce">继续了解 ︾</span>
          </Link>
        </div>
      </section>



      {/* 2. 当前状态区域：现状轨迹 Bento 卡片 (Currently) */}
      <section
        id="currently"
        className="border-t border-charcoal/10 py-18 sm:py-24 dark:border-white/10"
      >
        <div className="reveal-section mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-gold uppercase mb-3 block">
              01 / CURRENT STATUS
            </span>
            <h2 className="font-bento-h text-3xl font-semibold tracking-tight sm:text-4xl text-charcoal dark:text-cream">
              现状轨迹。
            </h2>
            <p className="mt-3 text-sm text-charcoal/65 dark:text-cream/65">
              我目前的主要精力和探索方向，在数字、学术与感知的缝隙中慢慢前行。
            </p>
          </div>

          {profile.currentStatus.items.length >= 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
              {/* 卡片 1：正在构建 (lg:col-span-2) */}
              <SpotlightCard
                spotlightColor="rgba(217, 134, 95, 0.12)"
                className="lg:col-span-2 group relative overflow-hidden bg-cream-dark/30 dark:bg-zinc-900/15 border border-charcoal/8 dark:border-white/8 p-8 rounded-3xl min-h-80 flex flex-col md:flex-row justify-between gap-6 hover:border-gold/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all duration-300"
              >
                <div className="flex-1 flex flex-col justify-between z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-mono text-[9px] text-gold tracking-widest uppercase font-bold">
                        01 / BUILDING
                      </span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400/80 uppercase font-semibold">
                        ACTIVE
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-medium mb-4 text-charcoal dark:text-cream">
                      {profile.currentStatus.items[0].label}
                    </h3>
                    <p className="text-sm leading-relaxed text-charcoal/65 dark:text-cream/60 font-light max-w-md">
                      {profile.currentStatus.items[0].desc}
                    </p>
                  </div>

                  {/* 模块微缩徽章 */}
                  <div className="mt-8 flex flex-wrap gap-2">
                    {[
                      { label: "随笔 ✍️", color: "hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30" },
                      { label: "项目 🛠️", color: "hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30" },
                      { label: "恋爱记录 💖", color: "hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30" },
                      { label: "灵感碎片 💡", color: "hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/30" },
                    ].map((badge) => (
                      <span
                        key={badge.label}
                        className={`px-3 py-1.5 rounded-xl bg-cream/50 dark:bg-zinc-800/50 border border-charcoal/5 dark:border-white/5 text-xs text-charcoal/70 dark:text-cream/70 cursor-default transition-all duration-300 hover:-translate-y-0.5 ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 右侧微型代码控制台 */}
                <div className="flex-1 min-w-64 max-w-96 bg-zinc-950 dark:bg-black/40 border border-white/5 p-5 rounded-2xl font-mono text-[11px] text-zinc-400 select-none relative shadow-inner overflow-hidden flex flex-col justify-between h-56 md:h-auto">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[10px] text-zinc-600">compiler.log</span>
                  </div>
                  <div className="grow space-y-1.5 overflow-y-auto pr-1">
                    <div className="flex gap-2">
                      <span className="text-zinc-600">1</span>
                      <span><span className="text-rose-400">const</span> <span className="text-amber-300">archive</span> = <span className="text-emerald-300">&quot;my_house&quot;</span>;</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-600">2</span>
                      <span><span className="text-rose-400">const</span> <span className="text-amber-300">status</span> = <span className="text-emerald-300">&quot;compiling&quot;</span>;</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-600">3</span>
                      <span><span className="text-rose-400">let</span> <span className="text-amber-300">progress</span> = <span className="text-amber-400">100</span>;</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-600">4</span>
                      <span><span className="text-zinc-500">{"// Modules initialized:"}</span></span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-600">5</span>
                      <span><span className="text-rose-400">const</span> <span className="text-amber-300">modules</span> = [</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-600">6</span>
                      <span>  <span className="text-emerald-300">&quot;writing&quot;</span>, <span className="text-emerald-300">&quot;gallery&quot;</span>, <span className="text-emerald-300">&quot;love&quot;</span></span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-600">7</span>
                      <span>];</span>
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-2 mt-3 flex items-center justify-between text-[10px] text-zinc-600">
                    <span>Antigravity Engine</span>
                    <span className="animate-pulse">● System Ready</span>
                  </div>
                </div>
              </SpotlightCard>

              {/* 右侧两张卡片合并包装成 col-span-1 */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* 卡片 2：正在研究 */}
                <SpotlightCard
                  spotlightColor="rgba(217, 134, 95, 0.12)"
                  className="group relative overflow-hidden bg-cream-dark/30 dark:bg-zinc-900/15 border border-charcoal/8 dark:border-white/8 p-8 rounded-3xl min-h-80 flex flex-col justify-between hover:border-gold/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all duration-300"
                >
                  <div>
                    <span className="font-mono text-[9px] text-gold tracking-widest uppercase block mb-4 font-bold">
                      02 / RESEARCHING
                    </span>
                    <h3 className="font-serif text-2xl font-medium mb-4 text-charcoal dark:text-cream">
                      {profile.currentStatus.items[1].label}
                    </h3>
                    <p className="text-sm leading-relaxed text-charcoal/65 dark:text-cream/60 font-light">
                      {profile.currentStatus.items[1].desc}
                    </p>
                  </div>

                  {/* 底部 SVG 证据融合网络图 */}
                  <div className="mt-8 relative h-32 w-full flex items-center justify-center bg-cream/15 dark:bg-zinc-950/20 rounded-2xl border border-charcoal/5 dark:border-white/5 overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 120" fill="none">
                      <path
                        d="M50 30 Q140 10 140 60"
                        stroke="var(--accent-color, #d9865f)"
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                        strokeDasharray="4 4"
                      />
                      <path
                        d="M50 90 Q140 110 140 60"
                        stroke="var(--accent-color, #d9865f)"
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                        strokeDasharray="4 4"
                      />
                      <path
                        d="M230 60 H140"
                        stroke="var(--accent-color, #d9865f)"
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                        strokeDasharray="4 4"
                      />

                      <circle cx="50" cy="30" r="6" fill="#d9865f" className="animate-pulse" />
                      <text x="50" y="48" textAnchor="middle" className="font-mono text-[8px] fill-charcoal/50 dark:fill-cream/40">Evid. A</text>

                      <circle cx="50" cy="90" r="6" fill="#d9865f" className="animate-pulse" />
                      <text x="50" y="108" textAnchor="middle" className="font-mono text-[8px] fill-charcoal/50 dark:fill-cream/40">Evid. B</text>

                      <circle cx="230" cy="60" r="6" fill="#d9865f" className="animate-pulse" />
                      <text x="230" y="78" textAnchor="middle" className="font-mono text-[8px] fill-charcoal/50 dark:fill-cream/40">Context</text>

                      <circle cx="140" cy="60" r="12" fill="#d9865f" fillOpacity="0.15" stroke="#d9865f" strokeWidth="1.5" className="animate-ping-slow" />
                      <circle cx="140" cy="60" r="8" fill="#d9865f" />
                      <text x="140" y="42" textAnchor="middle" className="font-mono text-[9px] font-bold fill-gold">Truth</text>

                      <rect x="110" y="86" width="60" height="16" rx="4" className="fill-cream/95 dark:fill-zinc-900/95 stroke-charcoal/10 dark:stroke-white/10" strokeWidth="0.5" />
                      <text x="140" y="97" textAnchor="middle" className="font-mono text-[8px] font-semibold fill-charcoal/70 dark:fill-cream/70">p(T|E)=0.94</text>
                    </svg>
                  </div>
                </SpotlightCard>

                {/* 卡片 3：正在学习 */}
                <SpotlightCard
                  spotlightColor="rgba(217, 134, 95, 0.12)"
                  className="group relative overflow-hidden bg-cream-dark/30 dark:bg-zinc-900/15 border border-charcoal/8 dark:border-white/8 p-8 rounded-3xl min-h-80 flex flex-col justify-between hover:border-gold/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all duration-300"
                >
                  <div>
                    <span className="font-mono text-[9px] text-gold tracking-widest uppercase block mb-4 font-bold">
                      03 / AESTHETICS
                    </span>
                    <h3 className="font-serif text-2xl font-medium mb-4 text-charcoal dark:text-cream">
                      {profile.currentStatus.items[2].label}
                    </h3>
                    <p className="text-sm leading-relaxed text-charcoal/65 dark:text-cream/60 font-light">
                      {profile.currentStatus.items[2].desc}
                    </p>
                  </div>

                  {/* 底部呼吸感同心圆与正弦波 */}
                  <div className="mt-8 relative h-32 w-full flex items-center justify-center bg-cream/15 dark:bg-zinc-950/20 rounded-2xl border border-charcoal/5 dark:border-white/5 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-gold/15 via-rose-500/5 to-transparent blur-md animate-breath-circle-1" />
                      <div className="absolute w-12 h-12 rounded-full border border-gold/15 dark:border-gold/10 animate-breath-circle-2" />
                      <div className="absolute w-6 h-6 rounded-full bg-gold/10 dark:bg-gold/5 border border-gold/25 dark:border-gold/15" />
                    </div>

                    <svg className="absolute bottom-4 left-0 w-full h-10 opacity-40 dark:opacity-60" viewBox="0 0 280 40" fill="none" preserveAspectRatio="none">
                      <path
                        d="M0 20 Q35 5, 70 20 T140 20 T210 20 T280 20"
                        stroke="var(--accent-color, #d9865f)"
                        strokeWidth="1.5"
                        strokeDasharray="5 5"
                      />
                    </svg>
                    
                    <span className="absolute bottom-2 right-3 font-mono text-[8px] text-charcoal/40 dark:text-cream/30">
                      Hz: 0.25 (calm)
                    </span>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. 人生坐标区域：4 象限卡片 (Coordinates) - 包含 3D 扇形散开动效 */}
      <section
        id="coordinates"
        className="border-t border-charcoal/10 py-18 sm:py-24 dark:border-white/10"
      >
        <div className="reveal-section mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-gold uppercase mb-3 block">
              02 / LIFE COORDINATES
            </span>
            <h2 className="font-bento-h text-3xl font-semibold tracking-tight sm:text-4xl">
              我的坐标。
            </h2>
            <p className="mt-3 text-sm text-charcoal/65 dark:text-cream/65">
              展示我是如何成为现在这个人的，在不同的坐标维度上记录痕迹。
            </p>
          </div>

          {/* 4 卡片网格 (非对称象限错落，带十字刻度坐标轴) */}
          <div className="relative py-12">
            {/* 背景十字坐标轴与刻度 */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden">
              {/* X 轴 (时间经历线) */}
              <div className="absolute w-[95%] h-px bg-charcoal/10 dark:bg-white/10 flex justify-between items-center px-4 font-mono text-[8px] text-charcoal/40 dark:text-cream/30">
                <span>PAST / 起源</span>
                <span>FUTURE / 愿景</span>
              </div>
              {/* Y 轴 (认知探索线) */}
              <div className="absolute h-[90%] w-px bg-charcoal/10 dark:bg-white/10 flex flex-col justify-between items-center py-4 font-mono text-[8px] text-charcoal/40 dark:text-cream/30">
                <span className="transform rotate-90 origin-left ml-2 whitespace-nowrap">EXPLORATION / 探索</span>
                <span className="transform rotate-90 origin-left ml-2 whitespace-nowrap">EXPERIENCE / 经历</span>
              </div>
              
              {/* 象限标示文字 */}
              <span className="absolute top-[8%] left-[8%] font-mono text-[9px] text-gold/30">QUADRANT II / BELIEF</span>
              <span className="absolute top-[8%] right-[8%] font-mono text-[9px] text-gold/30">QUADRANT I / STATUS</span>
              <span className="absolute bottom-[8%] left-[8%] font-mono text-[9px] text-gold/30">QUADRANT III / ORIGIN</span>
              <span className="absolute bottom-[8%] right-[8%] font-mono text-[9px] text-gold/30">QUADRANT IV / VISION</span>
            </div>

          {/* 回忆足迹相册画廊与贝塞尔曲线穿针引线 */}
          <div className="relative py-12">
            {/* 背景贝塞尔轨迹连线 */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
              <svg className="w-full h-full" viewBox="0 0 1000 800" fill="none" preserveAspectRatio="none">
                <path
                  d="M 200 150 Q 500 50, 750 250 T 250 550 T 800 700"
                  stroke="var(--accent-color, #d9865f)"
                  strokeWidth="1.5"
                  strokeOpacity="0.25"
                  strokeDasharray="6 6"
                />
              </svg>
            </div>

            {/* 非对称错落相册 Grid */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20 z-10 max-w-5xl mx-auto py-8 px-4">
              
              {/* 01 起源 (左上) */}
              <div className="coordinate-card md:col-start-1 md:row-start-1 md:justify-self-end w-full max-w-md flex flex-col gap-4">
                <div className="relative h-60 w-full overflow-hidden rounded-2xl border border-charcoal/8 dark:border-white/8 bg-cream-dark/30 dark:bg-zinc-900/10 shadow-md group/img">
                  <Image
                    src={profile.coordinates.items[0]?.image || "/assets/writing-tokyo.png"}
                    alt="Tokyo Origin Walk"
                    fill
                    sizes="(max-width: 768px) 100vw, 448px"
                    className="object-cover transition-transform duration-700 ease-out group-hover/img:scale-103 group-hover/img:brightness-[1.03]"
                  />
                  {/* 半透明胶带贴纸 */}
                  <div className="absolute -top-1 left-6 w-14 h-4 bg-white/20 dark:bg-white/5 backdrop-blur-[1px] border border-white/10 shadow-sm transform -rotate-3" />
                </div>
                <div className="pl-4">
                  <span className="font-mono text-[9px] text-gold/60 block mb-1 tracking-widest uppercase font-semibold">
                    01 / ORIGIN
                  </span>
                  <h3 className="font-serif text-lg font-medium mb-2 text-charcoal dark:text-cream">
                    {profile.coordinates.items[0]?.label}
                  </h3>
                  <p className="text-xs leading-relaxed text-charcoal/65 dark:text-cream/60 font-light">
                    {profile.coordinates.items[0]?.desc}
                  </p>
                </div>
              </div>

              {/* 02 状态 (右上，带向下偏移动效) */}
              <div className="coordinate-card md:col-start-2 md:row-start-1 md:justify-self-start md:translate-y-20 w-full max-w-md flex flex-col gap-4">
                <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-charcoal/8 dark:border-white/8 bg-cream-dark/30 dark:bg-zinc-900/10 shadow-md group/img">
                  <Image
                    src={profile.coordinates.items[1]?.image || "/assets/writing-coffee.png"}
                    alt="Cozy Coffee Status"
                    fill
                    sizes="(max-width: 768px) 100vw, 448px"
                    className="object-cover transition-transform duration-700 ease-out group-hover/img:scale-103 group-hover/img:brightness-[1.03]"
                  />
                  <div className="absolute -top-1 right-6 w-14 h-4 bg-white/20 dark:bg-white/5 backdrop-blur-[1px] border border-white/10 shadow-sm transform rotate-3" />
                </div>
                <div className="pl-4">
                  <span className="font-mono text-[9px] text-gold/60 block mb-1 tracking-widest uppercase font-semibold">
                    02 / CURRENT STATUS
                  </span>
                  <h3 className="font-serif text-lg font-medium mb-2 text-charcoal dark:text-cream">
                    {profile.coordinates.items[1]?.label}
                  </h3>
                  <p className="text-xs leading-relaxed text-charcoal/65 dark:text-cream/60 font-light">
                    {profile.coordinates.items[1]?.desc}
                  </p>
                </div>
              </div>

              {/* 03 信念 (左下，带向上偏移动效与轻微斜转) */}
              <div className="coordinate-card md:col-start-1 md:row-start-2 md:justify-self-end md:-translate-y-6 w-full max-w-md flex flex-col gap-4">
                <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-charcoal/8 dark:border-white/8 bg-cream-dark/30 dark:bg-zinc-900/10 shadow-md group/img transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <Image
                    src={profile.coordinates.items[2]?.image || "/assets/love-cooking.png"}
                    alt="Warm Cooking Belief"
                    fill
                    sizes="(max-width: 768px) 100vw, 448px"
                    className="object-cover transition-transform duration-700 ease-out group-hover/img:scale-103 group-hover/img:brightness-[1.03]"
                  />
                  <div className="absolute -top-2 left-1/3 w-16 h-4 bg-white/20 dark:bg-white/5 backdrop-blur-[1px] border border-white/10 shadow-sm transform rotate-6" />
                </div>
                <div className="pl-4">
                  <span className="font-mono text-[9px] text-gold/60 block mb-1 tracking-widest uppercase font-semibold">
                    03 / BELIEFS
                  </span>
                  <h3 className="font-serif text-lg font-medium mb-2 text-charcoal dark:text-cream">
                    {profile.coordinates.items[2]?.label}
                  </h3>
                  <p className="text-xs leading-relaxed text-charcoal/65 dark:text-cream/60 font-light">
                    {profile.coordinates.items[2]?.desc}
                  </p>
                </div>
              </div>

              {/* 04 愿景 (右下) */}
              <div className="coordinate-card md:col-start-2 md:row-start-2 md:translate-y-8 w-full max-w-md flex flex-col gap-4">
                <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-charcoal/8 dark:border-white/8 bg-cream-dark/30 dark:bg-zinc-900/10 shadow-md group/img">
                  <Image
                    src={profile.coordinates.items[3]?.image || "/assets/【哲风壁纸】剪影-壁纸-天空.png"}
                    alt="Cozy Sky Vision"
                    fill
                    sizes="(max-width: 768px) 100vw, 448px"
                    className="object-cover transition-transform duration-700 ease-out group-hover/img:scale-103 group-hover/img:brightness-[1.03]"
                  />
                  <div className="absolute -top-1 right-8 w-14 h-4 bg-white/20 dark:bg-white/5 backdrop-blur-[1px] border border-white/10 shadow-sm transform -rotate-3" />
                </div>
                <div className="pl-4">
                  <span className="font-mono text-[9px] text-gold/60 block mb-1 tracking-widest uppercase font-semibold">
                    04 / VISION
                  </span>
                  <h3 className="font-serif text-lg font-medium mb-2 text-charcoal dark:text-cream">
                    {profile.coordinates.items[3]?.label}
                  </h3>
                  <p className="text-xs leading-relaxed text-charcoal/65 dark:text-cream/60 font-light">
                    {profile.coordinates.items[3]?.desc}
                  </p>
                </div>
              </div>

            </div>
          </div>
          </div>
        </div>
      </section>

      {/* 4. 自我切片区域：Bento 气泡列表 (Fragments of Me) - Bento cell 3D staggered 翻折 */}
      <section
        id="fragments"
        className="border-t border-charcoal/10 py-18 sm:py-24 dark:border-white/10 bg-cream-dark/5"
      >
        <div className="reveal-section mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-gold uppercase mb-3 block">
              03 / FRAGMENTS OF ME
            </span>
            <h2 className="font-bento-h text-3xl font-semibold tracking-tight sm:text-4xl">
              自我切片。
            </h2>
            <p className="mt-3 text-sm text-charcoal/65 dark:text-cream/65">
              这些碎片化的自我特征，是构筑起这个小宇宙的有机版图。
            </p>
          </div>

          {/* 2x2 Bento 混合网格 */}
          <div className="grid gap-6 md:grid-cols-2">
            {profile.fragments.items.map((item, idx) => {
              const imageUrl = item.image || (idx === 3 ? "/assets/life_snapshot.png" : "");
              const hasImage = !!imageUrl;

              return (
                <SpotlightCard
                  key={idx}
                  spotlightColor="rgba(217, 134, 95, 0.12)"
                  className="bento-cell group relative overflow-hidden bg-cream-dark/50 dark:bg-zinc-900/25 border border-charcoal/10 dark:border-white/10 p-8 rounded-3xl min-h-60 flex flex-col justify-between hover:border-gold/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all duration-300 transform-style-3d opacity-0"
                >
                  <div className="z-10">
                    <span className="font-mono text-[9px] text-gold tracking-widest uppercase block mb-2 font-bold">
                      FRAGMENT / {item.category}
                    </span>
                    <h3 className="font-serif text-xl font-medium mb-3 text-charcoal dark:text-cream">
                      {item.desc}
                    </h3>

                    {/* 分别定制的抽屉核心视觉 */}
                    {!hasImage && idx === 0 && (
                      /* 技术专属：数据芯片堆栈 */
                      <div className="mt-4 h-12 w-full flex items-end justify-between gap-1 px-4 bg-cream/15 dark:bg-zinc-950/20 rounded-xl border border-charcoal/5 dark:border-white/5 py-2 overflow-hidden group/stack">
                        {[35, 60, 45, 80, 50, 95, 70, 40, 85, 55, 75, 30].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className="grow bg-gold/25 dark:bg-gold/15 rounded-sm transition-all duration-300 group-hover/stack:bg-gold/50"
                          />
                        ))}
                      </div>
                    )}

                    {!hasImage && idx === 1 && (
                      /* 研究专属：机密证据盖章 */
                      <div className="absolute right-6 bottom-4 select-none pointer-events-none opacity-[0.08] dark:opacity-[0.04] transform rotate-12 transition-transform duration-500 group-hover:rotate-[18deg]">
                        <div className="border-4 border-gold rounded-xl px-3 py-1 font-mono text-[14px] font-bold text-gold tracking-widest uppercase">
                          VERIFIED EVIDENCE
                        </div>
                      </div>
                    )}

                    {!hasImage && idx === 2 && (
                      /* 写作专属：稿纸横线背景 */
                      <>
                        <div
                          className="absolute inset-x-0 bottom-0 top-24 pointer-events-none opacity-20 dark:opacity-[0.06] bg-repeat-y"
                          style={{
                            backgroundImage: "linear-gradient(to bottom, transparent 0px, transparent 23px, var(--charcoal-color, #17211b) 24px)",
                            backgroundSize: "100% 24px"
                          }}
                        />
                        <div className="absolute right-6 top-6 opacity-30 dark:opacity-20 pointer-events-none">
                          <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-7-7-3 3 7 7 3-3zM9 10L2 17v5h5l7-7-5-5z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </>
                    )}

                    {hasImage && (
                      /* 拍立得彩色相册 */
                      <div className="absolute right-6 bottom-4 h-32 w-24 bg-white p-1.5 pb-4 rounded shadow-[0_12px_24px_-8px_rgba(0,0,0,0.12)] border border-zinc-200/50 dark:bg-zinc-100 dark:border-zinc-300 dark:shadow-[0_15px_30px_rgba(0,0,0,0.25)] transform rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden z-10 flex flex-col justify-between hidden sm:flex">
                        <div className="relative w-full h-22 bg-zinc-100 rounded-sm overflow-hidden border border-zinc-200/30">
                          <Image
                            src={imageUrl}
                            alt={item.category}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <div className="font-mono text-[7px] text-zinc-500 text-center tracking-wider mt-1.5">
                          {item.category.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 标签流 */}
                  <div className={`mt-6 flex flex-wrap gap-2 z-10 ${hasImage ? "max-w-[70%]" : ""}`}>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-cream dark:bg-zinc-800 px-3.5 py-1 text-[11px] font-mono text-charcoal/65 dark:text-cream/65 border border-charcoal/8 dark:border-white/10 hover:border-gold/30 hover:text-gold transition-colors duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. 信念区域：大留白居中杂志风格 (Beliefs) - 逐行滚动高亮聚焦 */}
      <section
        id="beliefs"
        className="border-t border-charcoal/10 py-20 sm:py-28 dark:border-white/10"
      >
        <div className="reveal-section mx-auto max-w-4xl px-6 text-center">
          <span className="text-[10px] font-semibold tracking-[0.25em] text-gold uppercase mb-5 block">
            04 / BELIEFS
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-charcoal/40 dark:text-cream/40 mb-14 tracking-wide">
            {profile.beliefs.subtitle}
          </h2>

          {/* 信念列表，GSAP 绑定滚动聚焦 (Scrub highlight) */}
          <div className="space-y-12 font-serif py-6 overflow-hidden">
            {profile.beliefs.items.map((belief, idx) => {
              const renderBeliefIcon = () => {
                const className = "w-6 h-6 text-gold group-hover:scale-110 transition-transform duration-300 relative z-10";
                if (idx === 0) {
                  return (
                    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L15.5 7.5m0 0l1.5 1.5M15.5 7.5L17 6M21 2h-4v4m0-4v4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  );
                }
                if (idx === 1) {
                  return (
                    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 2h14v3c0 2.5-1.5 4.5-4 5.5 2.5 1 4 3 4 5.5v3H5v-3c0-2.5 1.5-4.5 4-5.5-2.5-1-4-3-4-5.5V2z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 6h8M8 18h8" />
                    </svg>
                  );
                }
                if (idx === 2) {
                  return (
                    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 3.5 3z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  );
                }
                return (
                  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1h13.5v16M6.5 5H16M6.5 9H16" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                );
              };

              return (
                <div
                  key={idx}
                  className="belief-line group flex flex-col md:flex-row items-center gap-6 md:gap-8 max-w-3xl mx-auto border-b border-charcoal/5 dark:border-white/5 pb-10 last:border-0 last:pb-0 transform-gpu"
                >
                  {/* 象征性符号 */}
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-full border border-gold/15 dark:border-gold/10 bg-cream-dark/50 dark:bg-zinc-900/40 shadow-sm shrink-0">
                    <div className="absolute inset-0 bg-gold/5 dark:bg-gold/3 rounded-full blur-md animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {renderBeliefIcon()}
                  </div>

                  {/* 信念文本 */}
                  <p className="text-center md:text-left text-lg md:text-2xl font-light text-charcoal dark:text-cream leading-relaxed grow">
                    “ {belief} ”
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. 探索区域：大卡片聚合入口 (Explore) */}
      <section
        id="explore"
        className="border-t border-charcoal/10 py-18 sm:py-24 dark:border-white/10 bg-cream-dark/20"
      >
        <div className="reveal-section mx-auto max-w-5xl px-6">
          <div className="overflow-hidden rounded-3xl border border-charcoal/10 bg-cream-dark p-8 sm:p-12 lg:p-16 dark:border-white/10 dark:bg-zinc-900/35 text-center shadow-[0_20px_50px_rgba(0,0,0,0.015)]">
            <h2 className="font-bento-h text-3xl font-semibold tracking-tight sm:text-4xl">
              {profile.explore.title}
            </h2>
            <p className="mt-4 text-xs md:text-sm leading-relaxed text-charcoal/60 dark:text-cream/60 max-w-xl mx-auto font-light">
              {profile.explore.desc}
            </p>

            {/* 3D 抽屉拉出式明信片网格 */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {profile.explore.links.map((link, idx) => {
                const renderPostcardContent = () => {
                  if (idx === 0) {
                    return (
                      <div className="absolute inset-x-4 top-24 bottom-0 bg-amber-500/5 dark:bg-amber-500/3 border-t border-dashed border-amber-500/20 p-3 rounded-t-xl transition-transform duration-500 group-hover:-translate-y-6 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="w-[85%] h-1 bg-charcoal/10 dark:bg-white/10" />
                          <div className="w-[90%] h-1 bg-charcoal/10 dark:bg-white/10" />
                          <div className="w-[60%] h-1 bg-charcoal/10 dark:bg-white/10" />
                        </div>
                        <span className="font-mono text-[8px] text-amber-600/60 dark:text-amber-500/50">MEMORIES</span>
                      </div>
                    );
                  }
                  if (idx === 1) {
                    return (
                      <div className="absolute inset-x-4 top-24 bottom-0 bg-blue-500/5 dark:bg-blue-500/3 border-t border-dashed border-blue-500/20 p-3 rounded-t-xl transition-transform duration-500 group-hover:-translate-y-6 flex flex-col justify-between font-mono text-[8px] text-blue-600/60 dark:text-blue-500/50">
                        <span>git push origin main</span>
                        <span>SYSTEM READY</span>
                      </div>
                    );
                  }
                  if (idx === 2) {
                    return (
                      <div className="absolute inset-x-4 top-24 bottom-0 bg-emerald-500/5 dark:bg-emerald-500/3 border-t border-dashed border-emerald-500/20 p-3 rounded-t-xl transition-transform duration-500 group-hover:-translate-y-6 overflow-hidden flex items-end justify-between">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                          <div className="w-10 h-10 rounded-full border border-emerald-500/20 animate-pulse" />
                        </div>
                        <span className="font-mono text-[8px] text-emerald-600/60 dark:text-emerald-500/50 relative z-10">POND ACTIVE</span>
                      </div>
                    );
                  }
                  return (
                    <div className="absolute inset-x-4 top-24 bottom-0 bg-rose-500/5 dark:bg-rose-500/3 border-t border-dashed border-rose-500/20 p-3 rounded-t-xl transition-transform duration-500 group-hover:-translate-y-6 flex flex-col justify-between">
                      <div className="self-end w-5 h-5 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                        <span className="font-serif text-[7px] text-rose-500">印</span>
                      </div>
                      <span className="font-mono text-[8px] text-rose-600/60 dark:text-rose-500/50">DEAR YOU</span>
                    </div>
                  );
                };

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="group relative h-48 bg-cream/40 dark:bg-zinc-800/20 border border-charcoal/8 dark:border-white/8 rounded-2xl p-5 hover:border-gold/30 hover:shadow-[0_15px_30px_rgba(217,134,95,0.04)] transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-[8px] text-gold/80 tracking-widest uppercase font-semibold">
                          EXPLORE / 0{idx + 1}
                        </span>
                        <div className="p-1 rounded bg-gold/5 border border-gold/15">
                          <AboutIcon name={link.icon} className="h-3 w-3 text-gold" />
                        </div>
                      </div>
                      <h3 className="font-serif text-lg font-medium text-charcoal dark:text-cream">
                        {link.label}
                      </h3>
                    </div>
                    {renderPostcardContent()}
                  </Link>
                );
              })}
            </div>

            {/* 结束致敬词 */}
            <div className="mt-16 border-t border-charcoal/10 pt-10 dark:border-white/10">
              <p className="font-serif text-lg italic text-gold font-medium">
                {profile.explore.closing}
              </p>
              <p className="mt-2 text-[9px] tracking-[0.25em] text-charcoal/40 dark:text-cream/40 uppercase font-mono font-bold">
                {profile.explore.footerSubtitle}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

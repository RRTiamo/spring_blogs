"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { ArrowDown, Sparkles, Volume2, VolumeX } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EcgLine from "./EcgLine";

gsap.registerPlugin(ScrollTrigger);

// 氛围视频配置
const ATMOSPHERES = [
  { id: "cherry", name: "樱落", src: "/assets/【哲风壁纸】樱花-樱花飘落.mp4", type: "video" },
  { id: "island", name: "海风", src: "/assets/【哲风壁纸】户外-树枝-海岛.mp4", type: "video" },
  { id: "snow", name: "雪杉", src: "/assets/【哲风壁纸】mc-下雪-云杉树.mp4", type: "video" }
];

// 常驻背景流动弹幕文案库
const AUTO_DANMAKU_TEXTS = [
  "想你",
  "心跳同步中",
  "愿年岁并茂，相爱如初",
  "每天都要想你一遍",
  "想你，在每一个落日黄昏",
  "My heart is with you",
  "遇见你是最美好的事",
  "阿那亚的孤独图书馆",
  "荒废厨房里的笑声",
  "美术馆的无声漫步",
  "从日落一直坐到繁星点点",
  "有你在身旁，风大也安详",
  "恋爱记录",
  "你是我全部的日常与浪漫"
];

// 烟花弹幕主题定义（每次点击弹出不一样的元素组合）
const FIREWORKS_THEMES = [
  {
    type: "text",
    items: ["想你", "爱你", "想你啦", "超想你", "念你", "Miss U", "Love Ya", "心动", "Sweet", "啾~", "永远"]
  },
  {
    type: "emoji",
    items: ["心动", "想你", "拥抱", "晚安", "喜欢", "牵手", "一起走", "在身边"]
  },
  {
    type: "text",
    items: ["日落", "晚风", "月色", "花开", "晴天", "雪夜", "归途", "小事"]
  },
  {
    type: "mix",
    items: ["想你", "Rrtiamo", "Sweetheart", "一辈子", "始终如一", "陪着你", "落日", "阿那亚", "心动", "Love U"]
  }
];

interface LoveHeroProps {
  onScrollDown: () => void;
  heroBgUrl?: string;
  atmospheresJson?: string;
}

export default function LoveHero({ onScrollDown, heroBgUrl, atmospheresJson }: LoveHeroProps) {
  const [daysCount, setDaysCount] = useState(0);
  const [daysToAnniversary, setDaysToAnniversary] = useState(0);
  const [yearsCount, setYearsCount] = useState(0);

  // 氛围状态
  const [atmosphereIndex, setAtmosphereIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // 弹幕独立容器 Ref 与爱心按钮 Ref
  const danmakuContainerRef = useRef<HTMLDivElement>(null);
  const heartNodeRef = useRef<HTMLDivElement>(null);

  // 3D 悬浮视差参考
  const boyAvatarRef = useRef<HTMLDivElement>(null);
  const girlAvatarRef = useRef<HTMLDivElement>(null);

  // 性能优化：直接修改 DOM 文本，避免天数增长动画触发 React Re-render
  const daysTextRef = useRef<HTMLSpanElement>(null);
  
  const [isInView, setIsInView] = useState(true);

  // 监听组件是否在视口中，滚出视口后自动移除全局 mousemove 监听和自动弹幕以节约 CPU/GPU 资源
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // 动态生成包含专属自定义背景的氛围列表
  const atmospheresList = useMemo(() => {
    let configuredAtmospheres = ATMOSPHERES;
    if (atmospheresJson) {
      try {
        const parsed = JSON.parse(atmospheresJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          configuredAtmospheres = parsed.map((item: any) => ({
            id: item.id || Math.random().toString(),
            name: item.name || "未命名",
            src: item.src || "",
            type: item.type || (item.src?.match(/\.(mp4|webm|ogg|mov|m4v)($|\?)/i) ? "video" : "image")
          }));
        }
      } catch (error) {
        console.warn("Failed to parse custom atmospheres config, fallback to default.", error);
      }
    }

    if (heroBgUrl) {
      const isVideo = !!heroBgUrl.match(/\.(mp4|webm|ogg|mov|m4v)($|\?)/i);
      return [
        { id: "custom", name: "专属", src: heroBgUrl, type: isVideo ? "video" : "image" },
        ...configuredAtmospheres
      ];
    }
    return configuredAtmospheres;
  }, [heroBgUrl, atmospheresJson]);

  const currentAtmosphere = atmospheresList[atmosphereIndex] || atmospheresList[0];

  // ==================== 交互处理函数 ====================

  // 1. 发送单条背景慢速流动弹幕
  const createBackgroundDanmaku = () => {
    const container = danmakuContainerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 640px)").matches) return;

    const text = AUTO_DANMAKU_TEXTS[Math.floor(Math.random() * AUTO_DANMAKU_TEXTS.length)];
    const el = document.createElement("div");
    
    el.className = "absolute whitespace-nowrap bg-white/10 dark:bg-black/25 backdrop-blur-sm border border-white/20 dark:border-white/10 text-white rounded-full px-4 py-1.5 text-xs md:text-sm font-sans tracking-wide shadow-sm flex items-center gap-1.5 select-none pointer-events-none will-change-transform love-danmaku-node opacity-0 z-20";
    el.textContent = text;

    const topPercent = 20 + Math.random() * 60;
    el.style.top = `${topPercent}%`;
    el.style.left = "100%"; 

    container.appendChild(el);

    const duration = 14 + Math.random() * 4;
    const containerWidth = window.innerWidth;

    gsap.fromTo(el,
      { x: 0, opacity: 0 },
      {
        x: -(containerWidth + 450),
        duration: duration,
        ease: "none",
        force3D: true,
        onStart: () => {
          gsap.to(el, { opacity: 0.9, duration: 0.8, force3D: true });
        },
        onComplete: () => {
          el.remove();
        }
      }
    );
  };

  // 2. 互动点击烟花散射生成器
  const handleHeartClick = () => {
    if (heartNodeRef.current) {
      gsap.fromTo(
        heartNodeRef.current,
        { scale: 0.95 },
        { scale: 1.35, duration: 0.15, yoyo: true, repeat: 1, ease: "back.out(1.5)", overwrite: "auto" }
      );
    }

    const container = danmakuContainerRef.current;
    const heartNode = heartNodeRef.current;
    const hero = heroRef.current;
    if (!container || !heartNode || !hero) return;

    const heartRect = heartNode.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    const centerX = heartRect.left - heroRect.left + heartRect.width / 2;
    const centerY = heartRect.top - heroRect.top + heartRect.height / 2;

    const themeIndex = Math.floor(Math.random() * FIREWORKS_THEMES.length);
    const theme = FIREWORKS_THEMES[themeIndex];

    const particleCount = 12 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement("div");
      
      el.className = "absolute whitespace-nowrap bg-white/20 dark:bg-black/45 backdrop-blur-sm border border-white/35 dark:border-white/10 text-white rounded-full px-3 py-1 text-[10px] md:text-xs font-sans tracking-wide shadow-md pointer-events-none select-none will-change-transform love-danmaku-node z-30 opacity-100";
      
      const content = theme.items[Math.floor(Math.random() * theme.items.length)];
      el.textContent = content;

      el.style.left = `${centerX}px`;
      el.style.top = `${centerY}px`;
      el.style.transform = "translate(-50%, -50%) scale(0.2)";

      container.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const radius = 80 + Math.random() * 150; 
      
      const targetX = Math.cos(angle) * radius;
      const targetY = Math.sin(angle) * radius + (50 + Math.random() * 30);
      
      const randomSpin = -90 + Math.random() * 180; 
      const duration = 0.8 + Math.random() * 0.5; 

      gsap.to(el, {
        x: targetX,
        y: targetY,
        scale: 1,
        rotation: randomSpin,
        opacity: 0,
        duration: duration,
        ease: "power2.out", 
        force3D: true,
        onComplete: () => {
          el.remove(); 
        }
      });
    }
  };

  const handleSwitchAtmosphere = () => {
    setAtmosphereIndex((prev) => (prev + 1) % atmospheresList.length);
  };

  // ==================== React Effects ====================

  // 1. 初始化日期计算
  useEffect(() => {
    const startDate = new Date("2023-02-03T00:00:00");
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    const diffTime = today.getTime() - startDay.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let anniversaryYears = today.getFullYear() - startDay.getFullYear();
    const anniversaryThisYear = new Date(today.getFullYear(), startDay.getMonth(), startDay.getDate());
    if (today < anniversaryThisYear) {
      anniversaryYears -= 1;
    }

    const nextAnniversaryYear = today.getFullYear();
    const nextAnniversaryDate = new Date(nextAnniversaryYear, startDay.getMonth(), startDay.getDate());
    if (today >= nextAnniversaryDate) {
      nextAnniversaryDate.setFullYear(nextAnniversaryYear + 1);
    }
    const diffTimeNext = nextAnniversaryDate.getTime() - today.getTime();
    const toNextDays = Math.ceil(diffTimeNext / (1000 * 60 * 60 * 24));

    const timer = setTimeout(() => {
      setDaysCount(totalDays);
      setYearsCount(anniversaryYears);
      setDaysToAnniversary(toNextDays);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 2. 动画和视差绑定
  useEffect(() => {
    if (daysCount === 0) return;

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      // 天数翻滚动效
      gsap.to(obj, {
        val: daysCount,
        duration: 2.2,
        ease: "power3.out",
        delay: 0.4,
        onUpdate: () => {
          if (daysTextRef.current) {
            daysTextRef.current.textContent = Math.floor(obj.val).toString();
          }
        },
      });

      // 入场微动画
      const avatarBoxes = heroRef.current?.querySelectorAll(".avatar-box");
      if (avatarBoxes && avatarBoxes.length > 0) {
        gsap.fromTo(
          avatarBoxes,
          { scale: 0.85, opacity: 0, y: 25 },
          { scale: 1, opacity: 1, y: 0, duration: 1.4, ease: "power3.out", stagger: 0.15 }
        );
      }

      const anniversaryFades = heroRef.current?.querySelectorAll(".anniversary-fade");
      if (anniversaryFades && anniversaryFades.length > 0) {
        gsap.fromTo(
          anniversaryFades,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.4, ease: "power3.out", delay: 0.6, stagger: 0.12 }
        );
      }

      const scrollArrows = heroRef.current?.querySelectorAll(".scroll-arrow");
      if (scrollArrows && scrollArrows.length > 0) {
        gsap.fromTo(
          scrollArrows,
          { y: -6, opacity: 0.4 },
          { y: 4, opacity: 1, duration: 1, ease: "power1.inOut", delay: 1.8, repeat: -1, yoyo: true }
        );
      }

      // ScrollTrigger 视差滚动 (开屏视频和大图缩放)
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      
      if (isDesktop && !reduceMotion && heroRef.current && videoContainerRef.current) {
        gsap.to(videoContainerRef.current, {
          scale: 1.12,
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        if (heroContentRef.current) {
          gsap.to(heroContentRef.current, {
            y: -100,
            opacity: 0,
            scale: 0.96,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom 15%",
              scrub: true,
            },
          });
        }
      }
    }, heroRef); // 仅在 hero 容器作用域内触发

    // 鼠标 3D 悬浮视差监听
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      if (ticking) return;
      
      ticking = true;
      requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const x = clientX / innerWidth - 0.5;
        const y = clientY / innerHeight - 0.5;

        gsap.to(boyAvatarRef.current, {
          x: x * 20,
          y: y * 20,
          rotateX: -y * 12,
          rotateY: x * 12,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto"
        });

        gsap.to(girlAvatarRef.current, {
          x: -x * 20,
          y: -y * 20,
          rotateX: y * 12,
          rotateY: -x * 12,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto"
        });

        gsap.to(heartNodeRef.current, {
          x: x * 8,
          y: y * 8,
          scale: 1 + Math.abs(x * 0.1),
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto"
        });
        
        ticking = false;
      });
    };

    if (isInView) {
      window.addEventListener("mousemove", handleMouseMove);
    }
 
    return () => {
      ctx.revert();
      gsap.killTweensOf(".love-danmaku-node");
      danmakuContainerRef.current?.replaceChildren();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [daysCount, isInView]);
 
  // 3. 自动常驻后台弹幕流动 (仅在视口内时开启以节约消耗)
  useEffect(() => {
    if (daysCount === 0 || !isInView) return;
 
    let autoTimer: ReturnType<typeof setTimeout>;
 
    const triggerAutoDanmaku = () => {
      createBackgroundDanmaku();
      const nextDelay = 6000 + Math.random() * 4000;
      autoTimer = setTimeout(triggerAutoDanmaku, nextDelay);
    };
 
    const startDelay = setTimeout(() => {
      triggerAutoDanmaku();
    }, 2500);
 
    return () => {
      clearTimeout(startDelay);
      clearTimeout(autoTimer);
      gsap.killTweensOf(".love-danmaku-node");
      danmakuContainerRef.current?.replaceChildren();
    };
  }, [daysCount, isInView]);

  // 3. 视频按需加载触发
  useEffect(() => {
    setVideoLoaded(false);
    const video = videoRef.current;
    if (video && currentAtmosphere.type === "video") {
      video.load();
      video.play().catch(() => {
        // 忽略自动播放受限
      });
    }
  }, [atmosphereIndex, heroBgUrl, currentAtmosphere.type]);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100dvh] w-full max-w-full select-none flex-col items-center justify-between overflow-hidden px-4 py-8 sm:px-6 sm:py-10 md:py-12"
    >
      {/* 背景视频/图片容器 */}
      <div ref={videoContainerRef} className="absolute inset-0 z-0 scale-100 origin-center">
        {currentAtmosphere.type === "video" ? (
          <video
            ref={videoRef}
            src={currentAtmosphere.src}
            loop
            muted={isMuted}
            autoPlay
            playsInline
            preload="auto"
            onLoadedData={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover brightness-[0.72] saturate-[1.15] dark:brightness-[0.4] transition-opacity duration-1000 ${
              videoLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={currentAtmosphere.src}
              alt="恋爱纪实开屏背景"
              fill
              priority
              sizes="100vw"
              onLoad={() => setVideoLoaded(true)}
              className={`object-cover brightness-[0.72] saturate-[1.15] dark:brightness-[0.4] transition-opacity duration-1000 ${
                videoLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        )}

        {!videoLoaded && (
          <div className="absolute inset-0 bg-charcoal/20 backdrop-blur-2xl transition-all" />
        )}

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-black/20 dark:from-charcoal pointer-events-none" />
      </div>

      {/* 性能优化：直接操作 DOM 的弹幕与烟花粒子独立载体容器 */}
      <div ref={danmakuContainerRef} className="absolute inset-0 z-20 pointer-events-none overflow-hidden" />

      {/* 顶部左侧：氛围切换控制 */}
      <div className="absolute left-4 top-5 z-30 flex items-center gap-2 sm:left-6 md:left-10 md:top-7">
        <button
          onClick={handleSwitchAtmosphere}
          className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/12 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md transition-all hover:border-white/24 hover:bg-white/20 active:scale-95"
          title="切换背景氛围"
        >
          <Sparkles className="w-3 h-3 text-gold-light" />
          <span>氛围：{currentAtmosphere.name}</span>
        </button>

        {currentAtmosphere.type === "video" && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-full border border-white/12 bg-white/12 p-1.5 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
            title={isMuted ? "开启环境音效" : "静音"}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-gold-light" />}
          </button>
        )}
      </div>

      {/* 顶部右侧：简约标识 */}
      <div className="anniversary-fade relative z-10 mt-12 text-center sm:mt-14">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-black/24 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
          两个人的生活档案
        </span>
      </div>

      {/* 中间核心：3D 悬浮视差头像与自适应流光心电图 */}
      <div
        ref={heroContentRef}
        className="relative z-10 mx-auto my-auto flex w-full max-w-5xl flex-col items-center justify-center space-y-8 sm:space-y-10 md:space-y-12"
      >
        {/* 头像区域 (Flexbox 约束心电图边界) */}
        <div className="relative flex w-full max-w-[20rem] items-center justify-between gap-1 px-1 perspective-[1200px] sm:max-w-xl sm:gap-2 md:max-w-2xl lg:max-w-3xl">
          
          {/* 男方头像 */}
          <div
            ref={boyAvatarRef}
            className="avatar-box style-life z-10 flex shrink-0 origin-center flex-col items-center space-y-2 sm:space-y-3"
          >
            <div className="relative h-20 w-20 rounded-full border border-white/30 bg-white/15 p-1.5 shadow-[0_20px_50px_-8px_rgba(0,0,0,0.4)] backdrop-blur-lg transition-transform duration-300 sm:h-24 sm:w-24 md:h-36 md:w-36 lg:h-40 lg:w-40">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/assets/avtor-boy.jpg"
                  alt="Rrtiamo"
                  fill
                  sizes="(max-width: 768px) 112px, 160px"
                  className="object-cover pointer-events-none"
                  priority
                />
              </div>
            </div>
            <span className="text-xs font-sans font-medium text-white drop-shadow-md md:text-sm">Rrtiamo</span>
          </div>

          {/* 左侧心电图组件 */}
          <EcgLine direction="left" />

          {/* 宝石感玻璃态爱心按钮 */}
          <div
            ref={heartNodeRef}
            onClick={handleHeartClick}
            className="avatar-box group relative z-30 flex h-14 w-14 shrink-0 cursor-pointer select-none items-center justify-center sm:h-16 sm:w-16 md:h-24 md:w-24"
            title="点击给对方发射一束爱心烟花"
          >
            <div className="absolute inset-0 rounded-full border border-dashed border-rose-400/40 dark:border-rose-400/30 outer-dashed-ring pointer-events-none" />
            <div className="absolute inset-2.5 rounded-full bg-rose-500/10 dark:bg-rose-500/18 blur-md animate-pulse pointer-events-none" />
            <div className="absolute inset-3 rounded-full bg-white/12 dark:bg-black/45 backdrop-blur-xl border border-white/30 dark:border-white/12 shadow-[0_8px_32px_rgba(244,63,94,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all duration-500 group-hover:border-rose-500/40 group-hover:scale-105 active:scale-95 group-hover:shadow-[0_8px_32px_rgba(244,63,94,0.35)]">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.65)] transition-transform duration-300 group-hover:scale-110 md:h-8 md:w-8"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>

          {/* 右侧心电图组件 */}
          <EcgLine direction="right" />

          {/* 女方头像 */}
          <div
            ref={girlAvatarRef}
            className="avatar-box style-life z-10 flex shrink-0 origin-center flex-col items-center space-y-2 sm:space-y-3"
          >
            <div className="relative h-20 w-20 rounded-full border border-white/30 bg-white/15 p-1.5 shadow-[0_20px_50px_-8px_rgba(0,0,0,0.4)] backdrop-blur-lg transition-transform duration-300 sm:h-24 sm:w-24 md:h-36 md:w-36 lg:h-40 lg:w-40">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/assets/avtor-girl.jpg"
                  alt="Sweetheart"
                  fill
                  sizes="(max-width: 768px) 112px, 160px"
                  className="object-cover pointer-events-none"
                  priority
                />
              </div>
            </div>
            <span className="text-xs font-sans font-medium text-white drop-shadow-md md:text-sm">Sweetheart</span>
          </div>
        </div>

        {/* 天数排版 */}
        <div className="space-y-4 text-center md:space-y-5">
          <h1 className="anniversary-fade select-none font-sans text-[clamp(3.8rem,18vw,6.5rem)] font-light leading-none tracking-[-0.03em] text-white drop-shadow-[0_12px_48px_rgba(0,0,0,0.35)] md:text-[8.5rem] lg:text-[10rem]">
            <span ref={daysTextRef}>{daysCount > 0 ? daysCount : "0"}</span>{" "}
            <span className="align-baseline text-base font-medium tracking-normal opacity-85 md:text-2xl">天</span>
          </h1>
          <div className="anniversary-fade mx-auto max-w-md space-y-3 px-4">
            <p className="text-sm font-medium leading-relaxed text-white/95 drop-shadow-sm md:text-base">
              已携手共度 {yearsCount} 载温暖四季
            </p>
            <div className="w-12 h-[1px] bg-white/30 mx-auto" />
            <p className="text-xs font-sans text-white/70">
              从 2023.02.03 开始，距离下一次纪念日还有 {daysToAnniversary} 天
            </p>
          </div>
        </div>
      </div>

      {/* 底部指示器 (优化白天与暗黑模式下的视觉可见度，引入精致毛玻璃胶囊样式) */}
      <button
        onClick={onScrollDown}
        className="relative z-10 flex cursor-pointer items-center gap-2.5 rounded-full px-5 py-2.5 font-sans transition-all duration-300 group
                   bg-white/80 dark:bg-black/35 backdrop-blur-md 
                   border border-charcoal/10 dark:border-white/10
                   text-charcoal dark:text-cream/90
                   shadow-[0_4px_20px_-4px_rgba(34,51,38,0.08)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]
                   hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(34,51,38,0.15)] dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.6)]
                   hover:bg-white dark:hover:bg-black/60
                   active:scale-95 mb-3"
      >
        <span className="pl-1 text-xs font-medium">
          继续翻阅
        </span>
        <div className="scroll-arrow flex items-center justify-center w-5 h-5 rounded-full bg-charcoal/5 dark:bg-white/10 group-hover:bg-charcoal/10 dark:group-hover:bg-white/20 transition-colors">
          <ArrowDown className="w-3 h-3 stroke-[2.5] transition-transform duration-300 group-hover:translate-y-0.5" />
        </div>
      </button>
    </section>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  BookOpen, 
  Heart, 
  Camera, 
  Lock, 
  EyeSlash, 
  MapPin, 
  Smiley, 
  Funnel,
  CalendarBlank
} from "@phosphor-icons/react";

import { writingData } from "@/data/writing";
import { mockLoveNotes } from "@/mock/love";
import { galleryData } from "@/data/gallery";
import { useArticles } from "@/hooks/useArticles";
import { useLove } from "@/hooks/useLove";
import { useGallery } from "@/hooks/useGallery";
import { useSysConfig } from "@/hooks/useSysConfig";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ArchiveItem {
  key: string;
  title: string;
  date: string;
  type: "Writing" | "Love Note" | "Photo";
  visibility: "public" | "hidden" | "private";
  link: string;
  category?: string;
  mood?: string;
  description?: string;
  cover?: string;
  location?: string;
  content?: string;
  camera?: string;
  lens?: string;
  filmStock?: string;
  settings?: string;
  photoType?: "image" | "video";
}

// 情绪翻译
const translateMood = (mood: string) => {
  const map: { [key: string]: string } = {
    quiet: "安静",
    thoughtful: "沉思",
    observant: "观察",
    inspired: "灵感",
    happy: "愉悦",
    joyful: "欣喜",
    energetic: "活力",
    romantic: "浪漫",
    playful: "淘气",
    peaceful: "宁静",
  };
  return map[mood] || mood;
};

// 权限标签组件
const VisibilityBadge = ({ visibility, isLove = false }: { visibility: "public" | "hidden" | "private"; isLove?: boolean }) => {
  if (visibility === "private") {
    return (
      <span className="inline-flex items-center text-[9px] font-semibold text-amber-900 bg-amber-50/80 dark:text-amber-300 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-900/30 whitespace-nowrap">
        <Lock className="w-2.5 h-2.5 mr-0.5" /> 密码锁定
      </span>
    );
  }
  if (visibility === "hidden") {
    return (
      <span className="inline-flex items-center text-[9px] font-semibold text-charcoal/60 bg-charcoal/5 dark:text-white/60 dark:bg-white/5 px-1.5 py-0.5 rounded border border-charcoal/10 dark:border-white/10 whitespace-nowrap">
        <EyeSlash className="w-2.5 h-2.5 mr-0.5" /> 隐秘链接
      </span>
    );
  }
  return (
    <span className={`text-[8px] font-mono font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded ${
      isLove 
        ? "text-red-800 bg-red-50 dark:text-red-300 dark:bg-red-950/20" 
        : "text-charcoal/30 bg-charcoal/5 dark:text-white/30 dark:bg-white/5"
    }`}>
      PUBLIC
    </span>
  );
};

// 单张归档卡片组件 - 结合高级 GSAP 3D Hover Tilt 物理摇摆
const ArchiveCard = ({ item }: { item: ArchiveItem }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    let onMouseMove: (e: MouseEvent) => void;
    let onMouseLeave: () => void;

    const ctx = gsap.context(() => {
      // 创建高频物理磁吸过渡
      const xTo = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power2.out" });
      const yTo = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power2.out" });

      onMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        
        // 限制倾斜角度在 3.5 度以内，保持低调奢华
        const rotateY = (mouseX / (rect.width / 2)) * 3.5;
        const rotateX = -(mouseY / (rect.height / 2)) * 3.5;
        
        xTo(rotateY);
        yTo(rotateX);
      };

      onMouseLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("mousemove", onMouseMove);
      el.addEventListener("mouseleave", onMouseLeave);
    }, cardRef);

    return () => {
      if (onMouseMove && onMouseLeave) {
        el.removeEventListener("mousemove", onMouseMove);
        el.removeEventListener("mouseleave", onMouseLeave);
      }
      ctx.revert();
    };
  }, []);

  if (item.type === "Writing") {
    return (
      <div 
        ref={cardRef}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        className="group relative bg-[#F9F9F6] dark:bg-[#1E2521] border border-charcoal/10 dark:border-white/10 rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-shadow duration-500 flex flex-col justify-between min-h-[220px] overflow-hidden"
      >
        {/* 曲别针效果 */}
        <div className="absolute top-0 left-6 w-8 h-4 bg-zinc-300/40 dark:bg-zinc-800/60 rounded-b-md border-x border-b border-charcoal/5 dark:border-white/5 shadow-inner" />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-mono text-charcoal/40 dark:text-white/40 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-gold" /> {item.category || "Essay"}
            </span>
            <span className="flex items-center gap-1">
              <CalendarBlank className="w-3.5 h-3.5" /> {item.date}
            </span>
          </div>

          <div className="space-y-2 relative">
            <h3 className="font-serif text-lg md:text-xl font-medium text-charcoal dark:text-white group-hover:text-gold transition-colors duration-300 leading-snug">
              <Link href={item.link} className="after:absolute after:inset-0">
                {item.title}
              </Link>
            </h3>
            <p className="font-sans text-xs text-charcoal/60 dark:text-white/60 line-clamp-3 leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-charcoal/5 dark:border-white/5 flex justify-between items-center text-[10px] font-mono text-charcoal/40 dark:text-white/40">
          <span className="flex items-center gap-1">
            <Smiley className="w-3.5 h-3.5 text-gold" /> Mood: {item.mood ? translateMood(item.mood) : "未知"}
          </span>
          <VisibilityBadge visibility={item.visibility} />
        </div>
      </div>
    );
  }

  if (item.type === "Love Note") {
    return (
      <div 
        ref={cardRef}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        className="group relative bg-[#FCF5F2] dark:bg-[#25201E] border border-red-900/10 dark:border-red-900/20 rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(244,63,94,0.08)] transition-shadow duration-500 flex flex-col justify-between min-h-[220px] overflow-hidden"
      >
        {/* 心形火漆印记 */}
        <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-red-800/10 dark:bg-red-800/20 border border-red-800/15 flex items-center justify-center rotate-12 group-hover:rotate-45 transition-transform duration-500">
          <Heart className="w-5 h-5 text-red-800 dark:text-red-600 fill-red-800/20" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-mono text-red-800/50 dark:text-red-400/50 uppercase tracking-wider">
            <span className="flex items-center gap-1 font-semibold">
              <Heart className="w-3.5 h-3.5" /> Love Memory
            </span>
            <span className="flex items-center gap-1">
              <CalendarBlank className="w-3.5 h-3.5" /> {item.date}
            </span>
          </div>

          <div className="space-y-2 relative">
            <h3 className="font-serif text-lg md:text-xl font-medium text-red-950 dark:text-red-100 group-hover:text-gold transition-colors duration-300 leading-snug">
              <Link href={item.link} className="after:absolute after:inset-0">
                {item.title}
              </Link>
            </h3>
            <p className="font-sans text-xs text-red-950/60 dark:text-red-100/60 line-clamp-3 leading-relaxed">
              {item.content}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-red-900/5 dark:border-red-900/10 flex justify-between items-center text-[10px] font-mono text-red-800/50 dark:text-red-400/50">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-800" /> {item.location || "我们的窝"}
          </span>
          <VisibilityBadge visibility={item.visibility} isLove />
        </div>
      </div>
    );
  }

  // Photo / Polaroid 相片卡片
  return (
    <div 
      ref={cardRef}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className="group relative bg-[#FCFAF2] dark:bg-[#25241E] border border-charcoal/10 dark:border-white/10 rounded-2xl p-4 pb-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-shadow duration-500 flex flex-col justify-between min-h-[300px] overflow-hidden"
    >
      {/* 拍立得相框区 */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-charcoal/5 dark:border-white/5">
        {item.visibility === "public" ? (
          <>
            {item.photoType === "video" ? (
              <video 
                src={item.cover} 
                className="w-full h-full object-cover brightness-[0.98] group-hover:brightness-100 group-hover:scale-[1.03] transition-all duration-500" 
                muted 
                loop 
                playsInline
                onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
              />
            ) : (
              <Image 
                src={item.cover || ""} 
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover brightness-[0.98] group-hover:brightness-100 group-hover:scale-[1.03] transition-all duration-500"
              />
            )}
            
            <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-[2px] text-[8px] font-mono text-white/80 px-1.5 py-0.5 rounded-sm pointer-events-none uppercase">
              {item.camera ? item.camera.split(" ")[0] : "SNAP"}
            </div>
          </>
        ) : (
          /* 私密硫酸纸盖印效果 */
          <div className="w-full h-full bg-gradient-to-br from-amber-900/15 to-zinc-900/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none relative">
            <div className="absolute inset-0 bg-cream/10 dark:bg-black/10 mix-blend-overlay" />
            
            <div className="space-y-2 z-10">
              <div className="w-10 h-10 rounded-full bg-red-950/20 dark:bg-red-900/30 border border-red-950/20 dark:border-red-900/30 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-4 h-4 text-red-800 dark:text-red-500 fill-red-800/10" />
              </div>
              <div>
                <div className="text-xs font-serif font-medium text-red-950 dark:text-red-100">
                  {item.visibility === "private" ? "私密归档" : "隐藏档案"}
                </div>
                <div className="text-[9px] font-mono text-charcoal/50 dark:text-white/40 uppercase tracking-widest mt-0.5">
                  {item.visibility === "private" ? "Passcode Secured" : "Direct Link Only"}
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-red-800/90 dark:bg-red-700/90 text-white text-[9px] font-mono font-semibold tracking-[0.2em] px-4 py-1 shadow-md border border-red-700 pointer-events-none uppercase whitespace-nowrap">
              {item.visibility === "private" ? "CONFIDENTIAL" : "RESTRICTED"}
            </div>
          </div>
        )}
      </div>

      {/* 拍立得白边底座手写区 */}
      <div className="mt-4 space-y-3 px-1">
        <div className="space-y-1">
          <h3 className="font-ma-shan-zheng text-xl text-charcoal dark:text-zinc-100 group-hover:text-gold transition-colors duration-300 leading-snug">
            <Link href={item.link} className="after:absolute after:inset-0">
              {item.title}
            </Link>
          </h3>
          {item.visibility === "public" && (
            <p className="font-sans text-[10px] text-charcoal/50 dark:text-white/40 line-clamp-1">
              {item.description}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-charcoal/5 dark:border-white/5 flex justify-between items-end">
          <div className="text-[8px] font-mono text-charcoal/40 dark:text-white/40 leading-normal">
            {item.visibility === "public" && item.camera ? (
              <>
                <div className="line-clamp-1">{item.camera} · {item.lens}</div>
                <div className="text-gold/70 dark:text-gold-light/60 font-semibold uppercase">{item.filmStock} · {item.settings}</div>
              </>
            ) : (
              <div>SYSTEM INDEX: PHOTO-{item.key.toUpperCase()}</div>
            )}
          </div>
          <VisibilityBadge visibility={item.visibility} />
        </div>
      </div>
    </div>
  );
};

// 预先静态化提取初始年份以供延迟加载状态
const getInitialYears = () => {
  const dates = [
    ...writingData.map((post) => post.date),
    ...mockLoveNotes.map((entry) => entry.date),
    ...galleryData.map((photo) => photo.date),
  ];
  dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const years = dates.map(d => d.split("-")[0]);
  return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
};

export default function ArchivePage() {
  const { isPageEnabled } = useSysConfig();
  const loveEnabled = isPageEnabled("page.love.enable", true);
  const { posts: dynamicPosts } = useArticles();
  const { loveNotes: dynamicLove } = useLove();
  const { photos: dynamicGallery } = useGallery();
  const [activeTab, setActiveTab] = useState<"all" | "Writing" | "Love Note" | "Photo">("all");
  const [activeYear, setActiveYear] = useState<string>(() => {
    const initialYears = getInitialYears();
    return initialYears.length > 0 ? initialYears[0] : "";
  });
  const pageRef = useRef<HTMLDivElement>(null);
 
  // 动态年份同步更新
  useEffect(() => {
    const allItems = [
      ...dynamicPosts.map((post) => post.date),
      ...dynamicLove.map((entry) => entry.date),
      ...dynamicGallery.map((photo) => photo.date),
    ];
    if (allItems.length > 0) {
      allItems.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const years = Array.from(new Set(allItems.map(d => d.split("-")[0]))).sort((a, b) => b.localeCompare(a));
      if (years.length > 0 && !years.includes(activeYear)) {
        setActiveYear(years[0]);
      }
    }
  }, [dynamicPosts, dynamicLove, dynamicGallery]);
  const noteRef = useRef<HTMLDivElement>(null);

  // 独立控制黄便签的高级 3D 悬挂物理摇摆与交互
  useEffect(() => {
    const el = noteRef.current;
    if (!el) return;

    let onMouseEnter: () => void;
    let onMouseMove: (e: MouseEvent) => void;
    let onMouseLeave: () => void;

    const ctx = gsap.context(() => {
      const xTo = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power2.out" });
      const yTo = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power2.out" });
      const rTo = gsap.quickTo(el, "rotation", { duration: 0.6, ease: "power2.out" });

      onMouseEnter = () => {
        gsap.to(el, {
          y: -6,
          boxShadow: "0 15px 30px rgba(0,0,0,0.06)",
          duration: 0.4,
          ease: "power2.out"
        });
      };

      onMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        
        const rotateY = (mouseX / (rect.width / 2)) * 6;
        const rotateX = -(mouseY / (rect.height / 2)) * 6;
        const rot = -2.5 + (mouseX / (rect.width / 2)) * 4;

        xTo(rotateY);
        yTo(rotateX);
        rTo(rot);
      };

      onMouseLeave = () => {
        xTo(0);
        yTo(0);
        rTo(-2.5);
        
        gsap.to(el, {
          y: 0,
          boxShadow: "5px 5px 15px rgba(0,0,0,0.03)",
          duration: 0.8,
          ease: "elastic.out(1.2, 0.5)" // 回弹时产生微微颤动的阻尼效果
        });
      };

      el.addEventListener("mouseenter", onMouseEnter);
      el.addEventListener("mousemove", onMouseMove);
      el.addEventListener("mouseleave", onMouseLeave);
    }, noteRef);

    return () => {
      if (onMouseEnter && onMouseMove && onMouseLeave) {
        el.removeEventListener("mouseenter", onMouseEnter);
        el.removeEventListener("mousemove", onMouseMove);
        el.removeEventListener("mouseleave", onMouseLeave);
      }
      ctx.revert();
    };
  }, []);

  // 合载所有的静态/动态数据并按时间自新到旧排序
  const archives: ArchiveItem[] = [
    ...dynamicPosts.map((post) => ({
      key: post.slug,
      title: post.title,
      date: post.date,
      type: "Writing" as const,
      visibility: post.visibility,
      link: `/writing/${post.slug}`,
      category: post.category,
      mood: post.mood,
      cover: post.cover,
      description: post.description,
      content: post.content,
    })),
    ...(loveEnabled ? dynamicLove.map((entry) => ({
      key: entry.id,
      title: entry.title,
      date: entry.date,
      type: "Love Note" as const,
      visibility: entry.visibility,
      link: `/love`,
      location: entry.location,
      mood: entry.mood,
      cover: entry.cover,
      content: entry.content,
    })) : []),
    ...dynamicGallery.map((photo) => {
      // 模拟一些私密/隐藏影像切片，增加物理档案馆的仪式感
      let vis: "public" | "hidden" | "private" = "public";
      if (photo.id === "anime-boy") vis = "private";
      if (photo.id === "flower-wall") vis = "hidden";
      return {
        key: photo.id,
        title: photo.title,
        date: photo.date,
        type: "Photo" as const,
        visibility: vis,
        link: `/gallery`,
        cover: photo.src,
        description: photo.description,
        camera: photo.camera,
        lens: photo.lens,
        filmStock: photo.filmStock,
        settings: photo.settings,
        location: photo.location,
        photoType: photo.type,
      };
    }),
  ];

  archives.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 数量统计
  const writingCount = archives.filter(i => i.type === "Writing").length;
  const loveCount = archives.filter(i => i.type === "Love Note").length;
  const photoCount = archives.filter(i => i.type === "Photo").length;

  // 过滤后的数据
  const filteredArchives = archives.filter(
    (item) => activeTab === "all" || item.type === activeTab
  );

  // 年份分组
  const groups: { [key: string]: ArchiveItem[] } = {};
  filteredArchives.forEach((item) => {
    const year = item.date.split("-")[0];
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(item);
  });

  const years = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  // 高端洗牌-发牌过滤动画逻辑 (通过 GSAP 物理动画接管 Tab 切换卡片排布)
  const changeTab = (tab: "all" | "Writing" | "Love Note" | "Photo") => {
    if (tab === activeTab) return;

    // 提前在 pageRef 范围内获取所有卡片，如果不存在则不执行 GSAP 动画以防止报错
    const cards = pageRef.current?.querySelectorAll(".archive-card-anim");
    if (!cards || cards.length === 0) {
      setActiveTab(tab);
      return;
    }

    // 1. 发起“洗牌合拢淡出”动效
    gsap.to(cards, {
      opacity: 0,
      y: 25,
      scale: 0.95,
      rotation: 0,
      duration: 0.35,
      stagger: 0.015,
      ease: "power2.in",
      onComplete: () => {
        // 2. 动效完成后同步状态
        setActiveTab(tab);
        
        const filtered = archives.filter(item => tab === "all" || item.type === tab);
        const tempGroups: { [key: string]: boolean } = {};
        filtered.forEach((item) => {
          const yr = item.date.split("-")[0];
          tempGroups[yr] = true;
        });
        const tempYears = Object.keys(tempGroups).sort((a, b) => b.localeCompare(a));
        if (tempYears.length > 0) {
          setActiveYear(tempYears[0]);
        } else {
          setActiveYear("");
        }

        // 3. 在下一渲染帧中，完美发起 staggered“散开物理发牌”动效
        setTimeout(() => {
          const newCards = pageRef.current?.querySelectorAll(".archive-card-anim");
          if (newCards && newCards.length > 0) {
            gsap.fromTo(newCards, 
              {
                opacity: 0,
                y: 45,
                scale: 0.96,
                rotation: () => (Math.random() - 0.5) * 2.5,
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                rotation: () => (Math.random() - 0.5) * 1.5,
                duration: 0.9,
                stagger: 0.04,
                ease: "power4.out" // 完美的减速物理阻尼曲线
              }
            );
          }
        }, 30);
      }
    });
  };

  // GSAP 首次加载动画及 ScrollTrigger 物理联动
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. 顶部索引卡与便签滑入 (优雅的弹性入场)
      gsap.from(".archive-index-card", {
        opacity: 0,
        y: 40,
        duration: 1.0,
        ease: "power3.out"
      });

      // 2. 黄便签的“飘落悬挂物理摇摆”进场动效
      gsap.fromTo(".archive-sticky-note", 
        {
          opacity: 0,
          y: -80,
          rotation: -18,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: -2.5,
          duration: 1.6,
          delay: 0.2,
          ease: "elastic.out(1.1, 0.45)"
        }
      );
      // 2. 过滤栏滑入
      gsap.from(".archive-filter-bar", {
        opacity: 0,
        y: 25,
        duration: 1.0,
        delay: 0.15,
        ease: "power3.out"
      });
      // 3. 侧边栏时间轴滑入
      gsap.from(".archive-timeline-sidebar", {
        opacity: 0,
        x: -30,
        duration: 1.0,
        delay: 0.25,
        ease: "power3.out"
      });

      // 4. 首次加载卡片 Stagger 物理发牌滑入
      const firstCards = pageRef.current?.querySelectorAll(".archive-card-anim");
      if (firstCards && firstCards.length > 0) {
        gsap.from(firstCards, {
          opacity: 0,
          y: 45,
          rotation: () => (Math.random() - 0.5) * 2.5,
          duration: 0.9,
          stagger: 0.05,
          delay: 0.35,
          ease: "power4.out"
        });
      }

      // 5. 年份标题横线 ScrollTrigger 动态横向拉伸生长
      years.forEach((year) => {
        gsap.fromTo(`#divider-${year}`, 
          { scaleX: 0, opacity: 0 },
          { 
            scaleX: 1, 
            opacity: 1,
            ease: "power2.out",
            duration: 1.2,
            scrollTrigger: {
              trigger: `#year-${year}`,
              start: "top 85%", // 进入屏幕下方 85% 位置时触发
              once: true
            }
          }
        );
      });

      // 6. 滚动联动高亮左侧年份刻度
      years.forEach((year) => {
        ScrollTrigger.create({
          trigger: `#year-${year}`,
          start: "top 35%",      
          end: "bottom 35%",    
          onToggle: (self) => {
            if (self.isActive) {
              setActiveYear(year);
            }
          }
        });
      });

      // 7. 时光轴流逝线滚动比例拉伸 (只在桌面端 sticky sidebar 启用，避免移动端计算报错)
      if (window.innerWidth >= 1024) {
        gsap.to(".timeline-progress-fill", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".archive-timeline-sidebar",
            start: "top 32%",
            end: "bottom 70%",
            endTrigger: ".archive-cards-list-container", // 跟踪右侧网格底端
            scrub: true
          }
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, [years, activeTab]); // 过滤引起 years 变动时，安全重建 ScrollTrigger 保证坐标绝对精准

  // 锚点滚动
  const scrollToYear = (year: string) => {
    const lenis = (window as unknown as { lenis: { scrollTo: (target: string, options: { offset: number }) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(`#year-${year}`, { offset: -120 });
    } else {
      document.getElementById(`year-${year}`)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const categories = [
    { id: "all" as const, name: "全部归档", icon: null },
    { id: "Writing" as const, name: "随笔散文", icon: <BookOpen className="w-3.5 h-3.5" /> },
    ...(loveEnabled ? [{ id: "Love Note" as const, name: "恋爱纪实", icon: <Heart className="w-3.5 h-3.5" /> }] : []),
    { id: "Photo" as const, name: "影像切片", icon: <Camera className="w-3.5 h-3.5" /> },
  ];

  return (
    <div ref={pageRef} className="max-w-6xl mx-auto w-full px-4 md:px-8 py-24 md:py-32">
      {/* 1. 档案馆索书卡（数字索引卡） */}
      <div className="archive-index-card bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-charcoal/10 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden mb-10">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold/5 dark:bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center space-x-3">
              <span className="text-[9px] font-mono tracking-[0.2em] text-gold bg-gold/10 px-2.5 py-1 rounded-md uppercase font-semibold">
                NO. ATLAS-260624-MYHOUSE
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-mono text-charcoal/40 dark:text-white/40 uppercase">
                ONLINE INDEX
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal dark:text-white">
              Archive / 编目归档
            </h1>
            <p className="font-sans text-xs md:text-sm text-charcoal/60 dark:text-white/60 leading-relaxed">
              档案馆内所有收录文章、恋爱纪实与影像切片的索引总汇。
              我们用文字与胶片，在易逝的时间河流中，为日常编目，留存那些闪闪发光的细碎回忆。
            </p>
          </div>

          {/* 手写黄便签 */}
          <div 
            ref={noteRef}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            className="archive-sticky-note self-start md:self-center bg-[#FDF6E2] dark:bg-[#2C2921] border border-[#EBE3CD] dark:border-[#423C2F] p-4 rounded-xl shadow-[5px_5px_15px_rgba(0,0,0,0.03)] max-w-xs relative flex-shrink-0"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-white/40 dark:bg-black/20 backdrop-blur-[1px] rotate-1 pointer-events-none" />
            <p className="font-ma-shan-zheng text-lg text-amber-900/80 dark:text-amber-200/80 leading-relaxed pt-1.5 select-none">
              “时间的针脚密密麻麻，有些落在了纸上，有些藏在了心里。”
            </p>
            <div className="text-right mt-1.5 select-none font-sans text-[9px] text-amber-900/40 dark:text-amber-200/40">
              — 馆长编目印
            </div>
          </div>
        </div>

        {/* 统计指标卡 */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-charcoal/10 dark:border-white/10">
          <div className="bg-cream/40 dark:bg-charcoal/30 p-4 rounded-2xl border border-charcoal/5 dark:border-white/5 flex flex-col justify-between">
            <span className="text-[11px] text-charcoal/50 dark:text-white/50 flex items-center gap-1.5 font-medium">
              <BookOpen className="w-4 h-4 text-gold" /> 随笔散文
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-2xl md:text-3xl font-light text-charcoal dark:text-white">{writingCount}</span>
              <span className="text-[9px] text-charcoal/40 dark:text-white/40 font-mono">DOCS</span>
            </div>
          </div>
          
          <div className="bg-cream/40 dark:bg-charcoal/30 p-4 rounded-2xl border border-charcoal/5 dark:border-white/5 flex flex-col justify-between">
            <span className="text-[11px] text-charcoal/50 dark:text-white/50 flex items-center gap-1.5 font-medium">
              <Heart className="w-4 h-4 text-red-500" /> 恋爱纪实
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-2xl md:text-3xl font-light text-charcoal dark:text-white">{loveCount}</span>
              <span className="text-[9px] text-charcoal/40 dark:text-white/40 font-mono">NOTES</span>
            </div>
          </div>

          <div className="bg-cream/40 dark:bg-charcoal/30 p-4 rounded-2xl border border-charcoal/5 dark:border-white/5 flex flex-col justify-between">
            <span className="text-[11px] text-charcoal/50 dark:text-white/50 flex items-center gap-1.5 font-medium">
              <Camera className="w-4 h-4 text-blue-500" /> 影像切片
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-2xl md:text-3xl font-light text-charcoal dark:text-white">{photoCount}</span>
              <span className="text-[9px] text-charcoal/40 dark:text-white/40 font-mono">PHOTOS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 分类页签过滤器 */}
      <div className="archive-filter-bar flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-charcoal/5 dark:border-white/5">
        <span className="text-xs text-charcoal/40 dark:text-white/40 flex items-center gap-1 mr-2 font-mono">
          <Funnel className="w-3.5 h-3.5" /> FILTER / 检索 :
        </span>
        <div className="flex bg-cream/80 dark:bg-charcoal/50 p-1 rounded-full border border-charcoal/10 dark:border-white/10 relative">
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => changeTab(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all duration-300 relative z-10 flex items-center gap-1.5 ${
                  isActive 
                    ? "text-white dark:text-charcoal bg-gold dark:bg-gold shadow-[0_2px_8px_rgba(217,134,95,0.25)] font-medium" 
                    : "text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white"
                }`}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 两栏式主体：时光刻度轴 + 归档网格 */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* 3.A 侧边年份刻度轴 (在大屏幕下粘性固定，在小屏幕下水平滑动) */}
        <div className="archive-timeline-sidebar w-full lg:w-1/4 lg:sticky lg:top-32 self-start space-y-6">
          {/* 桌面端时间线 */}
          <div className="hidden lg:block space-y-4 pr-6">
            <div className="text-[10px] font-mono tracking-widest text-charcoal/40 dark:text-white/40 uppercase">
              TIMELINE / 时光轴
            </div>
            <div className="relative pl-4 space-y-6">
              {/* 时间轴轨道（灰色底） */}
              <div className="absolute left-[4px] top-2 bottom-2 w-[1px] bg-charcoal/10 dark:bg-white/10" />
              {/* 时光流逝金色填充进度条 */}
              <div className="absolute left-[4px] top-2 bottom-2 w-[1px] bg-gold origin-top scale-y-0 timeline-progress-fill" />
              
              {years.map((year) => {
                const count = groups[year]?.length || 0;
                const isActive = activeYear === year;
                return (
                  <button
                    key={year}
                    onClick={() => scrollToYear(year)}
                    className="group block text-left relative focus:outline-none py-1"
                  >
                    {/* 时光轴节点 */}
                    <div className={`absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cream dark:bg-charcoal border-2 transition-all duration-300 ${
                      isActive 
                        ? "border-gold bg-gold scale-125 shadow-[0_0_8px_rgba(217,134,95,0.6)]" 
                        : "border-charcoal/30 dark:border-white/30 group-hover:border-gold"
                    }`} />
                    <div className={`font-serif text-3xl font-light transition-all duration-300 flex items-baseline gap-1.5 ${
                      isActive 
                        ? "text-gold translate-x-1" 
                        : "text-charcoal/40 dark:text-white/40 group-hover:text-gold"
                    }`}>
                      {year}
                      <span className={`text-[10px] font-sans font-normal transition-all duration-300 ${
                        isActive ? "text-gold/60" : "text-charcoal/30 dark:text-white/30"
                      }`}>({count})</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 移动端年份快捷导航 */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none w-full border-b border-charcoal/5 dark:border-white/5">
            {years.map((year) => {
              const count = groups[year]?.length || 0;
              const isActive = activeYear === year;
              return (
                <button
                  key={year}
                  onClick={() => scrollToYear(year)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg border text-xs font-serif transition-all duration-300 ${
                    isActive 
                      ? "text-gold border-gold bg-gold/5 font-medium" 
                      : "bg-cream/80 dark:bg-charcoal/50 border-charcoal/10 dark:border-white/10 text-charcoal/70 dark:text-white/70"
                  }`}
                >
                  {year} 年 <span className={`font-sans text-[9px] ${isActive ? "text-gold/60" : "text-charcoal/40 dark:text-white/40"}`}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3.B 归档卡片网格列表 */}
        <div className="archive-cards-list-container w-full lg:w-3/4 space-y-16">
          {years.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white/40 dark:bg-zinc-900/40 rounded-3xl border border-charcoal/5 dark:border-white/5">
              <span className="text-3xl">📭</span>
              <p className="font-serif text-lg text-charcoal/40 dark:text-white/40">此分类下暂无已归档内容</p>
            </div>
          ) : (
            years.map((year) => (
              <div key={year} id={`year-${year}`} className="space-y-6 scroll-mt-28">
                {/* 年份标题刻度线 */}
                <div className="flex items-center gap-4 border-b border-charcoal/10 dark:border-white/10 pb-3">
                  <h2 className="font-serif text-4xl font-light text-charcoal dark:text-white tracking-wide">
                    {year}
                  </h2>
                  <span className="text-xs font-sans text-charcoal/40 dark:text-white/40 font-normal uppercase tracking-widest bg-cream/80 dark:bg-charcoal/60 px-2.5 py-0.5 rounded border border-charcoal/5 dark:border-white/5">
                    {groups[year].length} 档案
                  </span>
                  {/* origin-left 用于横线拉伸生长 */}
                  <div 
                    id={`divider-${year}`} 
                    className="grow h-px bg-gradient-to-r from-charcoal/15 dark:from-white/15 to-transparent origin-left" 
                  />
                </div>

                {/* 卡片网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {groups[year].map((item) => (
                    <div
                      key={item.key}
                      className="archive-card-anim"
                    >
                      <ArchiveCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

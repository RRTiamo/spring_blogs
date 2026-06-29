"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { getNotesList, createNote } from "@/api/notes";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { 
  Notebook,
  Clock,
  Funnel,
  Sparkle,
  PaperPlaneRight,
  Database,
  TextAlignLeft
} from "@phosphor-icons/react";

interface Note {
  id: number;
  date?: string;
  time?: string;
  content: string;
  mood?: string;
  createTime?: string;
}

// 情绪相关的辅助函数
const getMoodEmoji = (m?: string) => {
  switch (m) {
    case 'happy': return '😊';
    case 'calm': return '🌿';
    case 'tired': return '🥱';
    case 'love': return '💓';
    case 'blue': return '🍂';
    default: return '📝';
  }
};

const translateMood = (m?: string) => {
  switch (m) {
    case 'happy': return '喜悦';
    case 'calm': return '平静';
    case 'tired': return '疲惫';
    case 'love': return '心动';
    case 'blue': return '忧郁';
    default: return '随笔';
  }
};

const getMoodStyle = (m?: string) => {
  switch (m) {
    case 'happy': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/15';
    case 'calm': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15';
    case 'tired': return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/15';
    case 'love': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/15';
    case 'blue': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/15';
    default: return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15';
  }
};

// 拟真便签卡片组件，集成了 GSAP 3D Hover Tilt 倾斜和颤动回弹动效
const NoteCard = ({ note }: { note: Note }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // 创建高频物理磁吸偏转过渡
    const xTo = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power2.out" });
    const yTo = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power2.out" });

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      // 倾斜角度控制在 3.5 度以内，保持优雅低调的物理空间感
      const rotateY = (mouseX / (rect.width / 2)) * 3.5;
      const rotateX = -(mouseY / (rect.height / 2)) * 3.5;

      xTo(rotateY);
      yTo(rotateX);
    };

    const onMouseLeave = () => {
      xTo(0);
      yTo(0);

      // 回弹时产生微微震颤的阻尼效果
      gsap.to(el, {
        y: 0,
        scale: 1,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01)",
        duration: 0.8,
        ease: "elastic.out(1.2, 0.5)"
      });
    };

    const onMouseEnter = () => {
      gsap.to(el, {
        y: -4,
        scale: 1.01,
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.05)",
        duration: 0.3,
        ease: "power2.out"
      });
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("mouseenter", onMouseEnter);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  const noteDate = useMemo(() => {
    if (note.createTime) {
      return note.createTime.split("T")[0];
    }
    return note.date || "";
  }, [note]);

  const noteTime = useMemo(() => {
    if (note.createTime) {
      const t = note.createTime.split("T")[1];
      return t ? t.slice(0, 5) : "";
    }
    return note.time || "";
  }, [note]);

  return (
    <div
      ref={cardRef}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className="note-card-anim group relative bg-[#FDFBF7] dark:bg-[#1E2521] border border-charcoal/10 dark:border-white/10 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[160px] overflow-hidden transition-shadow duration-500"
    >
      {/* 顶部手写便利贴半透明胶带纸效果 */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-yellow-100/25 dark:bg-yellow-950/10 border-x border-dashed border-yellow-400/20 backdrop-blur-[0.5px] rotate-1 z-20 pointer-events-none" />

      {/* 正文区域 */}
      <div className="space-y-4">
        {/* 情绪微型标签 */}
        {note.mood && (
          <div className="flex">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide ${getMoodStyle(note.mood)}`}>
              <span>{getMoodEmoji(note.mood)}</span>
              <span>{translateMood(note.mood)}</span>
            </span>
          </div>
        )}
        <p className="font-serif text-base md:text-lg leading-relaxed text-charcoal/80 dark:text-cream/80 font-light tracking-wide break-words whitespace-pre-wrap">
          {note.content}
        </p>
      </div>

      {/* 底部时间与操作栏 */}
      <div className="mt-6 pt-4 border-t border-charcoal/5 dark:border-white/5 flex justify-between items-center text-[10px] font-mono text-charcoal/40 dark:text-white/40">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gold/80" />
          {noteDate.replace(/-/g, ".")} {"//"} {noteTime}
        </span>
      </div>
    </div>
  );
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState("calm");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);
  const inputCardRef = useRef<HTMLDivElement>(null);

  // 从后端及 localStorage 加载便签
  useEffect(() => {
    const savedNotes = localStorage.getItem("atlas_notes");
    let initialNotes: Note[] = [];

    if (savedNotes) {
      try {
        initialNotes = JSON.parse(savedNotes) as Note[];
      } catch (e) {
        console.warn("Parse saved notes failed", e);
      }
    }
    
    const fetchNotes = async () => {
      try {
        const response = await getNotesList();
        const json = response.data;
        if (json && json.code === 200 && json.data) {
          setNotes(json.data);
          return;
        }
      } catch (e) {
        console.warn("Server offline, loading notes from localstorage fallback", e);
      }
      // 离线回退
      if (initialNotes.length > 0) {
        setNotes(initialNotes);
      } else {
        const seeds = [
          {
            id: 1,
            date: "2026-06-21",
            time: "23:45",
            content: "代码和胶片是一样的。胶片是通过化学反应固定光线，代码是通过编译运行固化逻辑。它们都是把当下的心境与思考变成物理实体的尝试。",
            mood: "calm"
          },
          {
            id: 2,
            date: "2026-05-14",
            time: "08:30",
            content: "今早的咖啡偏酸。读书读到这一句：‘人们说时间流逝，但时间什么也没做，流逝的是我们自己。’ 突然很有共鸣。",
            mood: "blue"
          },
          {
            id: 3,
            date: "2026-04-20",
            time: "19:15",
            content: "写了一个平滑滚动的动效，调试了很久阻尼系数。看着网页顺滑地跟随滚轮移动，那种舒适感很难向不写前端的人解释。",
            mood: "happy"
          },
          {
            id: 4,
            date: "2026-03-08",
            time: "14:10",
            content: "在老式相机里塞进了一卷过期十年的 Kodak Gold 200。很期待冲洗出来的颗粒感。时间在感光乳剂上的老化，本身就是一种天然的滤镜。",
            mood: "love"
          }
        ];
        setNotes(seeds);
        localStorage.setItem("atlas_notes", JSON.stringify(seeds));
      }
    };

    fetchNotes();
  }, []);

  // 主导心情计算：以列表中最新一条随笔的心情为底色
  const dominantMood = useMemo(() => {
    if (notes.length === 0) return "calm";
    return notes[0].mood || "calm";
  }, [notes]);

  // 情绪流体背景 GSAP 缓动逻辑
  useEffect(() => {
    // 浅色模式色彩配置
    const moodColors: Record<string, { c1: string; c2: string; c3: string }> = {
      happy: { c1: "hsla(28, 90%, 88%, 0.75)", c2: "hsla(45, 90%, 88%, 0.75)", c3: "hsla(15, 80%, 90%, 0.55)" }, // 暖沙橘黄
      calm: { c1: "hsla(140, 45%, 88%, 0.75)", c2: "hsla(170, 40%, 88%, 0.75)", c3: "hsla(90, 35%, 90%, 0.55)" }, // 抹茶薄荷
      tired: { c1: "hsla(35, 20%, 88%, 0.75)", c2: "hsla(0, 5%, 88%, 0.75)", c3: "hsla(210, 10%, 90%, 0.55)" },   // 麦芽褐灰
      love: { c1: "hsla(350, 75%, 90%, 0.75)", c2: "hsla(320, 60%, 90%, 0.75)", c3: "hsla(15, 80%, 90%, 0.55)" },  // 樱粉烟紫
      blue: { c1: "hsla(200, 60%, 88%, 0.75)", c2: "hsla(220, 50%, 88%, 0.75)", c3: "hsla(170, 35%, 90%, 0.55)" }  // 湖蓝灰绿
    };

    // 深色模式色彩配置
    const moodColorsDark: Record<string, { c1: string; c2: string; c3: string }> = {
      happy: { c1: "hsla(28, 55%, 11%, 0.75)", c2: "hsla(45, 45%, 10%, 0.75)", c3: "hsla(15, 40%, 11%, 0.55)" },
      calm: { c1: "hsla(140, 25%, 8%, 0.75)", c2: "hsla(170, 20%, 8%, 0.75)", c3: "hsla(90, 18%, 9%, 0.55)" },
      tired: { c1: "hsla(35, 12%, 9%, 0.75)", c2: "hsla(0, 5%, 8%, 0.75)", c3: "hsla(210, 8%, 10%, 0.55)" },
      love: { c1: "hsla(350, 40%, 11%, 0.75)", c2: "hsla(320, 30%, 11%, 0.75)", c3: "hsla(15, 35%, 11%, 0.55)" },
      blue: { c1: "hsla(200, 35%, 9%, 0.75)", c2: "hsla(220, 30%, 10%, 0.75)", c3: "hsla(170, 20%, 9%, 0.55)" }
    };

    const isDark = document.documentElement.classList.contains("dark");
    const palette = isDark ? moodColorsDark : moodColors;
    const colors = palette[dominantMood] || palette.calm;

    const ctx = gsap.context(() => {
      // 1. 心情颜色平缓变化
      gsap.to("#fluid-blob-1", {
        backgroundColor: colors.c1,
        duration: 3,
        ease: "power2.out"
      });
      gsap.to("#fluid-blob-2", {
        backgroundColor: colors.c2,
        duration: 3,
        ease: "power2.out"
      });
      gsap.to("#fluid-blob-3", {
        backgroundColor: colors.c3,
        duration: 3,
        ease: "power2.out"
      });

      // 2. 持续位置漂移与呼吸起伏动画
      gsap.to("#fluid-blob-1", {
        x: "random(-50, 50)",
        y: "random(-50, 50)",
        scale: "random(0.9, 1.15)",
        duration: "random(8, 12)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to("#fluid-blob-2", {
        x: "random(-60, 60)",
        y: "random(-60, 60)",
        scale: "random(0.85, 1.1)",
        duration: "random(9, 14)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to("#fluid-blob-3", {
        x: "random(-45, 45)",
        y: "random(-45, 45)",
        scale: "random(0.9, 1.15)",
        duration: "random(7, 11)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });

    return () => ctx.revert();
  }, [dominantMood]);

  // 输入便签的 GSAP 微交互：聚焦时轻轻抬起
  useEffect(() => {
    const el = inputCardRef.current;
    if (!el) return;

    // 表单轻微倾斜，呈现手写本随性放置感
    gsap.set(el, { rotation: 1 });

    const handleFocus = () => {
      gsap.to(el, {
        y: -5,
        rotation: 0,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.04)",
        duration: 0.4,
        ease: "power2.out"
      });
    };

    const handleBlur = () => {
      gsap.to(el, {
        y: 0,
        rotation: 1,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
        duration: 0.6,
        ease: "elastic.out(1.2, 0.6)"
      });
    };

    const textarea = el.querySelector("textarea");
    textarea?.addEventListener("focus", handleFocus);
    textarea?.addEventListener("blur", handleBlur);

    return () => {
      textarea?.removeEventListener("focus", handleFocus);
      textarea?.removeEventListener("blur", handleBlur);
    };
  }, []);

  // 搜索过滤
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      return note.content.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [notes, searchQuery]);

  // 分页计算：每页展示 6 条笔记
  const itemsPerPage = 6;
  const totalNotes = filteredNotes.length;
  const totalPages = Math.ceil(totalNotes / itemsPerPage) || 1;
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  const currentPageNotes = useMemo(() => {
    return filteredNotes.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);
  }, [filteredNotes, activePage]);

  // 录入动作
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    let success = false;
    try {
      const response = await createNote({ content: input.trim(), mood });
      const json = response.data;
      if (json && json.code === 200 && json.data) {
        setNotes((prev) => [json.data, ...prev]);
        success = true;
      }
    } catch (e) {
      console.warn("Create note on server failed, fallback to localstorage", e);
    }

    if (!success) {
      const now = new Date();
      const newNote: Note = {
        id: Date.now(),
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0].slice(0, 5),
        content: input.trim(),
        mood,
      };
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      localStorage.setItem("atlas_notes", JSON.stringify(updatedNotes));
    }

    setInput("");
    setMood("calm");
    
    // 新增便签后自动切回第 1 页
    setCurrentPage(1);

    // 录入完成时，将输入框卡片轻微抖动，表达物理写下的确认反馈
    if (inputCardRef.current) {
      gsap.fromTo(inputCardRef.current,
        { scale: 0.97, y: 2 },
        { scale: 1, y: 0, duration: 0.5, ease: "elastic.out(1.5, 0.4)" }
      );
    }
  };



  // GSAP 首次加载动效 (静态部分)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".notes-index-card", {
        opacity: 0,
        y: 40,
        duration: 1.0,
        ease: "power3.out"
      });

      gsap.from(".notes-sticky-input", {
        opacity: 0,
        y: 30,
        rotation: -4,
        duration: 1.2,
        delay: 0.2,
        ease: "elastic.out(1.1, 0.55)"
      });

      gsap.from(".notes-filter-bar", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.15,
        ease: "power3.out"
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // 翻页与检索过滤触发 Stagger 发牌动画
  useEffect(() => {
    if (currentPageNotes.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(".note-card-anim",
        {
          opacity: 0,
          y: 35,
          rotation: () => (Math.random() - 0.5) * 2.5,
        },
        {
          opacity: 1,
          y: 0,
          rotation: () => (Math.random() - 0.5) * 1.5,
          duration: 0.8,
          stagger: 0.04,
          ease: "power3.out"
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [activePage, currentPageNotes.length]);

  // 统计指标
  const noteCount = notes.length;
  const wordCount = useMemo(() => {
    return notes.reduce((sum, n) => sum + n.content.length, 0);
  }, [notes]);
  const lastUpdate = useMemo(() => {
    if (notes.length === 0) return "—";
    const target = notes[0];
    const rawDate = target.createTime ? target.createTime.split("T")[0] : (target.date || "");
    return rawDate.replace(/-/g, ".");
  }, [notes]);

  return (
    <div ref={pageRef} className="max-w-6xl mx-auto w-full px-4 md:px-8 py-24 md:py-32 space-y-10 relative">
      
      {/* 情绪流体背景与毛玻璃容器 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-60 dark:opacity-40">
        <div 
          id="fluid-blob-1" 
          className="absolute -top-20 -left-20 w-[550px] h-[550px] rounded-full blur-[110px] transition-all mix-blend-multiply dark:mix-blend-screen" 
          style={{ transitionDuration: '3s' }}
        />
        <div 
          id="fluid-blob-2" 
          className="absolute -bottom-30 -right-30 w-[650px] h-[650px] rounded-full blur-[130px] transition-all mix-blend-multiply dark:mix-blend-screen" 
          style={{ transitionDuration: '3s' }}
        />
        <div 
          id="fluid-blob-3" 
          className="absolute top-1/3 left-1/4 w-[480px] h-[480px] rounded-full blur-[100px] transition-all mix-blend-multiply dark:mix-blend-screen" 
          style={{ transitionDuration: '3s' }}
        />
        <div className="absolute inset-0 bg-[#F5F2EB]/15 dark:bg-[#121513]/10 backdrop-blur-[80px]" />
      </div>

      {/* 1. 档案馆数字索引卡 Header 与 录入区 */}
      <div className="notes-index-card bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-charcoal/10 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold/5 dark:bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 relative z-10">
          
          {/* 左侧说明 & 数据指标 */}
          <div className="space-y-6 max-w-2xl grow">
            <div className="flex items-center space-x-3">
              <span className="text-[9px] font-mono tracking-[0.2em] text-gold bg-gold/10 px-2.5 py-1 rounded-md uppercase font-semibold">
                NO. ATLAS-NOTES-LOCAL
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-mono text-charcoal/40 dark:text-white/40 uppercase">
                ACTIVE WRITER
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal dark:text-white flex items-center gap-2">
                Notes / 闪念随笔
              </h1>
              <p className="font-sans text-xs md:text-sm text-charcoal/60 dark:text-white/60 leading-relaxed max-w-lg">
                随性记下微小而无声消逝的瞬间与思考。
                这里不谈体系，不求工整，只有碎片。文字是一块块在暗室里等待冲印的底片，静止并留存下当下的感官阻尼。
              </p>
            </div>

            {/* 统计指标卡 */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-charcoal/10 dark:border-white/10">
              <div className="bg-cream/40 dark:bg-charcoal/30 p-3.5 rounded-2xl border border-charcoal/5 dark:border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-charcoal/50 dark:text-white/50 flex items-center gap-1.5 font-medium">
                  <Notebook className="w-3.5 h-3.5 text-gold" /> 已载随笔
                </span>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="font-serif text-xl md:text-2xl font-light text-charcoal dark:text-white">{noteCount}</span>
                  <span className="text-[8px] text-charcoal/40 dark:text-white/40 font-mono">ITEMS</span>
                </div>
              </div>

              <div className="bg-cream/40 dark:bg-charcoal/30 p-3.5 rounded-2xl border border-charcoal/5 dark:border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-charcoal/50 dark:text-white/50 flex items-center gap-1.5 font-medium">
                  <TextAlignLeft className="w-3.5 h-3.5 text-gold" /> 笔录字数
                </span>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="font-serif text-xl md:text-2xl font-light text-charcoal dark:text-white">{wordCount}</span>
                  <span className="text-[8px] text-charcoal/40 dark:text-white/40 font-mono">CHARS</span>
                </div>
              </div>

              <div className="bg-cream/40 dark:bg-charcoal/30 p-3.5 rounded-2xl border border-charcoal/5 dark:border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-charcoal/50 dark:text-white/50 flex items-center gap-1.5 font-medium">
                  <Database className="w-3.5 h-3.5 text-gold" /> 最近记录
                </span>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="font-serif text-sm md:text-base font-light text-charcoal dark:text-white truncate max-w-full leading-normal">{lastUpdate}</span>
                </div>
              </div>
            </div>

            {/* 情绪晴雨表 */}
            <div className="pt-4 border-t border-charcoal/10 dark:border-white/10 space-y-3">
              <span className="text-[10px] text-charcoal/50 dark:text-white/50 flex items-center gap-1.5 font-medium tracking-wider uppercase font-mono">
                <Sparkle className="w-3.5 h-3.5 text-gold animate-spin" style={{ animationDuration: '8s' }} /> Mood Tracker / 情绪晴雨表
              </span>
              {notes.length === 0 ? (
                <div className="text-[10px] text-charcoal/40 dark:text-white/40 italic">暂无情绪记录...</div>
              ) : (
                <div className="space-y-2.5">
                  {/* 情绪渐变分布条 */}
                  <div className="h-2 rounded-full overflow-hidden flex bg-charcoal/5 dark:bg-white/5 border border-charcoal/5 dark:border-white/5">
                    {(() => {
                      const stats = { happy: 0, calm: 0, tired: 0, love: 0, blue: 0, other: 0 };
                      notes.forEach((n) => {
                        const m = n.mood || "calm";
                        if (m in stats) {
                          stats[m as keyof typeof stats]++;
                        } else {
                          stats.other++;
                        }
                      });
                      const total = notes.length;
                      return [
                        { key: "happy", color: "bg-orange-400 dark:bg-orange-500", label: "喜悦" },
                        { key: "calm", color: "bg-emerald-400 dark:bg-emerald-500", label: "平静" },
                        { key: "tired", color: "bg-zinc-400 dark:bg-zinc-500", label: "疲惫" },
                        { key: "love", color: "bg-red-400 dark:bg-red-500", label: "心动" },
                        { key: "blue", color: "bg-blue-400 dark:bg-blue-500", label: "忧郁" },
                        { key: "other", color: "bg-amber-400 dark:bg-amber-500", label: "其他" }
                      ].map((item) => {
                        const count = stats[item.key as keyof typeof stats] || 0;
                        if (count === 0) return null;
                        const pct = (count / total) * 100;
                        return (
                          <div
                            key={item.key}
                            className={`${item.color} h-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                            title={`${item.label}: ${count}条 (${pct.toFixed(1)}%)`}
                          />
                        );
                      });
                    })()}
                  </div>
                  {/* 情绪文字比重比例 */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-charcoal/50 dark:text-white/50 font-sans select-none">
                    {(() => {
                      const stats = { happy: 0, calm: 0, tired: 0, love: 0, blue: 0 };
                      notes.forEach((n) => {
                        const m = n.mood || "calm";
                        if (m in stats) {
                          stats[m as keyof typeof stats]++;
                        }
                      });
                      return [
                        { key: "happy", emoji: "😊", label: "喜悦", colorClass: "text-orange-500 dark:text-orange-400" },
                        { key: "calm", emoji: "🌿", label: "平静", colorClass: "text-emerald-500 dark:text-emerald-400" },
                        { key: "tired", emoji: "🥱", label: "疲惫", colorClass: "text-zinc-500/70 dark:text-zinc-400/80" },
                        { key: "love", emoji: "💓", label: "心动", colorClass: "text-red-500 dark:text-red-400" },
                        { key: "blue", emoji: "🍂", label: "忧郁", colorClass: "text-blue-500 dark:text-blue-400" }
                      ].map((item) => {
                        const count = stats[item.key as keyof typeof stats] || 0;
                        if (count === 0) return null;
                        const pct = (count / notes.length) * 100;
                        return (
                          <span key={item.key} className="flex items-center gap-1 font-mono">
                            <span className={item.colorClass}>{item.emoji}</span>
                            <span>{item.label}</span>
                            <span className="font-semibold text-charcoal/80 dark:text-white/80">{pct.toFixed(0)}%</span>
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 右侧：手撕纸信笺拟真录入区 */}
          <div ref={inputCardRef} className="notes-sticky-input self-stretch lg:self-start bg-[#FCF6E5] dark:bg-[#2C2921] border border-[#EBE3CD] dark:border-[#423C2F] p-5 rounded-2xl shadow-[5px_5px_15px_rgba(0,0,0,0.03)] w-full lg:max-w-md relative flex-shrink-0 flex flex-col justify-between">
            {/* 曲别针效果 */}
            <div className="absolute -top-1 left-8 w-3.5 h-8 bg-zinc-300/40 dark:bg-zinc-800/60 rounded-b-md border-x border-b border-charcoal/5 dark:border-white/5 shadow-inner" />
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="text-[9px] font-mono tracking-wider text-amber-900/50 dark:text-amber-200/50 uppercase pl-9 font-semibold flex items-center gap-1">
                <Sparkle className="w-3 h-3 text-gold" /> Write a flash...
              </div>

              <div className="relative border border-amber-900/10 dark:border-amber-200/10 bg-white/20 dark:bg-black/10 focus-within:bg-white/60 dark:focus-within:bg-black/30 rounded-xl p-4 transition-all duration-300">
                <textarea
                  placeholder="记下此刻的一闪之念..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-24 bg-transparent text-sm leading-relaxed border-none focus:outline-none placeholder:text-amber-900/35 dark:placeholder:text-amber-200/35 font-sans text-amber-950 dark:text-amber-100 resize-none font-light"
                />
              </div>

              {/* 心情选择器 */}
              <div className="flex flex-col gap-1.5 px-1 select-none">
                <span className="text-[10px] text-amber-900/60 dark:text-amber-200/60 font-semibold tracking-wide flex items-center gap-1">
                  当下心情 / Current Mood:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { value: "happy", emoji: "😊", label: "喜悦" },
                    { value: "calm", emoji: "🌿", label: "平静" },
                    { value: "tired", emoji: "🥱", label: "疲惫" },
                    { value: "love", emoji: "💓", label: "心动" },
                    { value: "blue", emoji: "🍂", label: "忧郁" }
                  ].map((item) => {
                    const isSelected = mood === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setMood(item.value)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-sans transition-all duration-350 border cursor-pointer ${
                          isSelected
                            ? "bg-amber-900/90 text-[#FCF6E5] border-amber-900/90 dark:bg-amber-100 dark:text-amber-950 dark:border-amber-100 font-semibold scale-105 shadow-sm"
                            : "bg-white/20 border-amber-900/10 text-amber-950/70 hover:bg-white/40 dark:bg-black/10 dark:border-amber-200/10 dark:text-amber-100/70 dark:hover:bg-black/20"
                        }`}
                      >
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-sans px-1">
                <span className="text-amber-900/50 dark:text-amber-200/50 font-mono">
                  {input.trim().length} chars
                </span>

                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="inline-flex items-center justify-center gap-1.5 text-[10px] tracking-widest uppercase bg-charcoal text-cream dark:bg-cream dark:text-charcoal hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:text-cream px-5 py-2 transition-all duration-300 font-sans cursor-pointer rounded-full font-semibold shadow-sm hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-charcoal disabled:hover:text-cream disabled:hover:translate-y-0"
                >
                  <PaperPlaneRight className="w-3 h-3" /> Record / 写下
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* 2. 检索过滤栏 */}
      <div className="notes-filter-bar flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-charcoal/5 dark:border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs text-charcoal/40 dark:text-white/40 flex items-center gap-1 font-mono">
            <Funnel className="w-3.5 h-3.5" /> SEARCH / 检索 :
          </span>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索随笔正文..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-cream/80 dark:bg-charcoal/50 px-4 py-1.5 pr-8 rounded-full border border-charcoal/10 dark:border-white/10 text-xs text-charcoal dark:text-white placeholder:text-charcoal/40 dark:placeholder:text-white/40 focus:outline-none focus:border-gold dark:focus:border-gold w-48 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 dark:text-white/40 hover:text-charcoal dark:hover:text-white text-[10px] font-sans"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {searchQuery && (
          <span className="text-[10px] font-mono text-charcoal/50 dark:text-white/50 bg-cream/50 dark:bg-charcoal/40 px-3 py-1 rounded-full border border-charcoal/5 dark:border-white/5">
            找到 {filteredNotes.length} 条符合要求的闪念
          </span>
        )}
      </div>

      {/* 空状态显示 */}
      {notes.length === 0 && (
        <div className="py-24 text-center border-2 border-dashed border-charcoal/10 dark:border-white/10 rounded-3xl max-w-md mx-auto relative z-10">
          <Notebook className="w-10 h-10 text-charcoal/20 dark:text-white/20 mx-auto mb-4" />
          <p className="text-xs font-sans text-charcoal/40 dark:text-white/40 uppercase tracking-widest">
            No notes recorded / 本卷暂无闪念记录
          </p>
        </div>
      )}

      {notes.length > 0 && filteredNotes.length === 0 && (
        <div className="py-24 text-center border border-dashed border-charcoal/10 dark:border-white/10 rounded-3xl max-w-md mx-auto relative z-10">
          <p className="text-xs font-sans text-charcoal/40 dark:text-white/40 uppercase tracking-widest">
            No matching results / 未搜索到匹配随笔
          </p>
        </div>
      )}

      {/* 3. 随笔卡片网格 - 2 列排布 (每页最多 6 条) */}
      {filteredNotes.length > 0 && (
        <div className="space-y-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[380px] content-start">
            <AnimatePresence mode="popLayout" initial={false}>
              {currentPageNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <NoteCard note={note} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 4. 精致卡槽式数字页码分页器 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-[11px] font-sans tracking-widest pt-8 border-t border-charcoal/5 dark:border-white/5 select-none">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="text-charcoal/70 dark:text-cream/70 hover:text-gold dark:hover:text-gold-light disabled:opacity-20 disabled:hover:text-charcoal/30 cursor-pointer disabled:cursor-not-allowed uppercase transition-colors font-medium"
              >
                ← Older / 更早
              </button>
              
              <div className="flex items-center space-x-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isCurrent = activePage === pNum;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono transition-all cursor-pointer ${
                        isCurrent 
                          ? "bg-gold text-white font-semibold shadow-sm" 
                          : "text-charcoal/50 dark:text-cream/50 hover:text-gold dark:hover:text-gold-light"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className="text-charcoal/70 dark:text-cream/70 hover:text-gold dark:hover:text-gold-light disabled:opacity-20 disabled:hover:text-charcoal/30 cursor-pointer disabled:cursor-not-allowed uppercase transition-colors font-medium"
              >
                Newer / 更晚 →
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

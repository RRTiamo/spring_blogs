"use client";

import { useState, useEffect, useRef } from "react";
import { Sliders, Check, Watch, RefreshCw, Layers, Compass } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type StyleType = "life" | "swiss" | "minimalist" | "glass" | "brutalist";
type StyleMode = "manual" | "time" | "scroll";

const styleClassNames = [
  "style-life",
  "style-swiss",
  "style-minimalist",
  "style-glass",
  "style-brutalist",
];

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

let currentAppliedStyle = "";

function applyStyleClass(style: StyleType) {
  const root = document.documentElement;
  const targetClass = `style-${style}`;
  if (currentAppliedStyle === targetClass) return;

  if (root.classList.contains(targetClass)) {
    currentAppliedStyle = targetClass;
    return;
  }

  root.classList.remove(...styleClassNames);
  root.classList.add(targetClass);
  currentAppliedStyle = targetClass;
}

export default function StyleConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStyle, setActiveStyle] = useState<StyleType>("life");
  const [activeMode, setActiveMode] = useState<StyleMode>("manual");
  
  const consoleWrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 初始化风格与模式
  useEffect(() => {
    const savedStyle = localStorage.getItem("atlas_style") as StyleType | null;
    const savedMode = localStorage.getItem("atlas_style_mode") as StyleMode | null;
    const initialStyle = savedStyle && savedStyle !== "swiss" ? savedStyle : "life";

    applyStyleClass(initialStyle);
    requestAnimationFrame(() => {
      setActiveStyle(initialStyle);
      if (savedMode) setActiveMode(savedMode);
    });

    // 绑定点击外部关闭控制台事件
    const handleClickOutside = (e: MouseEvent) => {
      if (consoleWrapperRef.current && !consoleWrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 用 GSAP 动效替换 Framer Motion 弹窗展开/折叠
  useEffect(() => {
    if (!panelRef.current) return;

    if (isOpen) {
      gsap.to(panelRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        pointerEvents: "auto",
        duration: 0.4,
        ease: "power3.out",
      });
    } else {
      gsap.to(panelRef.current, {
        opacity: 0,
        scale: 0.92,
        y: 15,
        pointerEvents: "none",
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  // 手动更新风格的方法
  const handleStyleChange = (style: StyleType) => {
    setActiveStyle(style);
    applyStyleClass(style);
    localStorage.setItem("atlas_style", style);
    if (activeMode !== "manual") {
      setActiveMode("manual");
      localStorage.setItem("atlas_style_mode", "manual");
    }
  };

  // 模式改变方法
  const handleModeChange = (mode: StyleMode) => {
    setActiveMode(mode);
    localStorage.setItem("atlas_style_mode", mode);
  };

  // 监听模式与滚动/时间定时器
  useEffect(() => {
    if (activeMode === "manual") {
      applyStyleClass(activeStyle);
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let styleScrollTrigger: ScrollTrigger | undefined;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    // 1. 时间驱动模式下的风格判定逻辑
    const checkTimeStyle = () => {
      const hour = new Date().getHours();
      let timeStyle: StyleType = "life";

      if (hour >= 6 && hour < 9) {
        timeStyle = "minimalist";
      } else if (hour >= 9 && hour < 18) {
        timeStyle = "life";
      } else {
        timeStyle = "glass";
      }
      applyStyleClass(timeStyle);
    };

    // 2. 滚动驱动模式下的风格判定逻辑
    const handleScrollStyle = (progress?: number) => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = progress ?? (docHeight > 0 ? window.scrollY / docHeight : 0);

      let scrollStyle: StyleType = "life";

      if (percent < 0.25) {
        scrollStyle = "life";
      } else if (percent >= 0.25 && percent < 0.55) {
        scrollStyle = "minimalist";
      } else if (percent >= 0.55 && percent < 0.8) {
        scrollStyle = "glass";
      } else {
        scrollStyle = "brutalist";
      }
      applyStyleClass(scrollStyle);
    };

    // 3. 滚动事件的防抖版本，避免滚动中高频触发 Class 改变引发全局重排
    const handleScrollStyleDebounced = (progress?: number) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        handleScrollStyle(progress);
      }, 120);
    };

    if (activeMode === "time") {
      checkTimeStyle();
      intervalId = setInterval(checkTimeStyle, 60000);
    } else if (activeMode === "scroll") {
      handleScrollStyle(); // 初始化时立即执行一次，保证初始状态准确
      styleScrollTrigger = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => handleScrollStyleDebounced(self.progress),
        invalidateOnRefresh: true,
      });
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (debounceTimer) clearTimeout(debounceTimer);
      styleScrollTrigger?.kill();
    };
  }, [activeMode, activeStyle]);

  const stylesConfig = [
    { id: "life", name: "生活档案", desc: "彩色影像、柔和卡片、个人博客默认风格" },
    { id: "swiss", name: "瑞士画报", desc: "经典报刊网格、优雅衬线体、双线描边" },
    { id: "minimalist", name: "极致极简", desc: "无界扁平卡片、微型圆角、深邃静谧" },
    { id: "glass", name: "赛博拟玻", desc: "半透毛玻璃、霓虹浮光背影、迷幻光影" },
    { id: "brutalist", name: "黑客粗野", desc: "等宽黑客字体、2px粗线实框、硬边缘阴影" },
  ] as const;

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={consoleWrapperRef}>
      {/* 悬浮主按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/10 dark:border-white/10 bg-cream/90 dark:bg-charcoal/90 text-charcoal shadow-lg backdrop-blur-md transition-all duration-300 hover:border-charcoal/30 cursor-pointer pointer-events-auto active:scale-95"
      >
        <Sliders className={`h-5 w-5 transition-transform duration-500 ${isOpen ? "rotate-90 text-gold" : ""}`} />
      </button>

      {/* 控制台面板 (GSAP 托管透明度、比例及显隐) */}
      <div
        ref={panelRef}
        className="absolute bottom-14 right-0 w-80 overflow-hidden rounded-2xl border border-charcoal/10 dark:border-white/10 bg-cream/95 dark:bg-charcoal/95 p-6 shadow-2xl backdrop-blur-lg select-none opacity-0 scale-[0.92] translate-y-4 pointer-events-none"
        style={{ transformOrigin: "bottom right" }}
      >
        {/* 头部标题 */}
        <div className="flex items-center space-x-2 border-b border-charcoal/5 pb-3">
          <Sliders className="h-4 w-4 text-gold" />
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-charcoal">
            UI PRO MAX 控制台
          </span>
        </div>

        {/* 自动化调整模式选择 */}
        <div className="mt-4 space-y-2">
          <span className="text-[9px] uppercase tracking-wider text-charcoal/40 font-semibold block">
            Adjustment Mode / 调整机制
          </span>
          <div className="grid grid-cols-3 gap-1 bg-charcoal/5 dark:bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => handleModeChange("manual")}
              className={`flex flex-col items-center justify-center py-2 rounded text-[9px] font-sans font-medium transition-all cursor-pointer ${
                activeMode === "manual"
                  ? "bg-white dark:bg-charcoal-light text-gold shadow-sm font-semibold"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <Compass className="h-3.5 w-3.5 mb-1" />
              手动选择
            </button>
            <button
              onClick={() => handleModeChange("time")}
              className={`flex flex-col items-center justify-center py-2 rounded text-[9px] font-sans font-medium transition-all cursor-pointer ${
                activeMode === "time"
                  ? "bg-white dark:bg-charcoal-light text-gold shadow-sm font-semibold"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <Watch className="h-3.5 w-3.5 mb-1" />
              时间自动
            </button>
            <button
              onClick={() => handleModeChange("scroll")}
              className={`flex flex-col items-center justify-center py-2 rounded text-[9px] font-sans font-medium transition-all cursor-pointer ${
                activeMode === "scroll"
                  ? "bg-white dark:bg-charcoal-light text-gold shadow-sm font-semibold"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5 mb-1" />
              滚动自动
            </button>
          </div>
        </div>

        {/* 风格选项列表 */}
        <div className="mt-5 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] uppercase tracking-wider text-charcoal/40 font-semibold">
              Visual Styles / 视觉风格库
            </span>
            {activeMode !== "manual" && (
              <span className="text-[8px] font-sans text-gold bg-gold/10 px-1.5 py-0.5 rounded animate-pulse">
                已启用自动流变
              </span>
            )}
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {stylesConfig.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleChange(style.id)}
                className={`w-full flex items-start text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  activeStyle === style.id && activeMode === "manual"
                    ? "border-gold/30 bg-gold/5 dark:bg-gold/10"
                    : "border-transparent bg-charcoal/5 dark:bg-white/5 hover:bg-charcoal/10 dark:hover:bg-white/10"
                }`}
              >
                <div className="grow">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-xs font-serif font-medium ${activeStyle === style.id && activeMode === "manual" ? "text-gold" : "text-charcoal"}`}>
                      {style.name}
                    </span>
                    {activeStyle === style.id && activeMode === "manual" && (
                      <Check className="h-3 w-3 text-gold" />
                    )}
                  </div>
                  <p className="text-[9px] font-sans text-charcoal/50 leading-normal mt-0.5">
                    {style.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 底部注解 */}
        <div className="mt-4 border-t border-charcoal/5 pt-3 flex items-center justify-between text-[8px] font-mono text-charcoal/30">
          <span className="flex items-center">
            <Layers className="h-3 w-3 mr-1 text-gold" />
            UI-UX-Pro-Max v1.0
          </span>
          <span>Atlas Edition</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, ChevronDown } from "lucide-react";
import gsap from "gsap";
import { useSysConfig } from "@/hooks/useSysConfig";

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pillRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部自动收起菜单
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // GSAP 控制折叠菜单展开与收起动画
  useEffect(() => {
    if (!menuRef.current) return;

    const ctx = gsap.context(() => {
      if (isMenuOpen) {
        gsap.to(menuRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.2)",
          pointerEvents: "auto",
          overwrite: "auto",
        });
      } else {
        gsap.to(menuRef.current, {
          opacity: 0,
          y: -12,
          scale: 0.95,
          duration: 0.25,
          ease: "power2.inOut",
          pointerEvents: "none",
          overwrite: "auto",
        });
      }
    }, menuRef);

    return () => ctx.revert();
  }, [isMenuOpen]);

  // 初始化主题设置
  useEffect(() => {
    const savedTheme = localStorage.getItem("atlas_theme") as "light" | "dark" | null;
    const userPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = savedTheme || (userPrefersDark ? "dark" : "light");
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    requestAnimationFrame(() => setTheme(initialTheme));
  }, []);

  // 切换主题方法
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("atlas_theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // 使用 GSAP 控制导航背景滑块 (GSAP Menu Pill Tracker)
  useEffect(() => {
    if (!pillRef.current || !navContainerRef.current) return;

    if (hoveredPath) {
      const targetEl = navContainerRef.current.querySelector(
        `[data-path="${hoveredPath}"]`
      ) as HTMLElement;
      if (targetEl) {
        gsap.to(pillRef.current, {
          x: targetEl.offsetLeft,
          y: targetEl.offsetTop,
          width: targetEl.offsetWidth,
          height: targetEl.offsetHeight,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    } else {
      gsap.to(pillRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [hoveredPath]);

  const { configs, isPageEnabled } = useSysConfig();

  const getConfigValue = (key: string, defaultValue = "") => {
    const cfg = configs.find((c) => c.configKey === key);
    return cfg ? cfg.configValue : defaultValue;
  };

  const logoUrl = getConfigValue("site.logo.url");
  const logoText = getConfigValue("site.logo.text", "RRTiamo");

  const navItems = [
    { englishName: "Archive", chineseName: "年份归档", path: "/archive", previewImg: "archive.png" },
    { englishName: "Writing", chineseName: "随笔文章", path: "/writing", previewImg: "writing.png" },
    { englishName: "Gallery", chineseName: "光影影像", path: "/gallery", previewImg: "gallery.png" },
    { englishName: "Footprints", chineseName: "岁月足迹", path: "/footprints", previewImg: "footprints.png" },
    { englishName: "Love", chineseName: "恋爱纪实", path: "/love", previewImg: "love.png" },
    { englishName: "Trophy", chineseName: "成就徽章", path: "/achievements", previewImg: "trophy.png" },
    { englishName: "Notes", chineseName: "日常碎片", path: "/notes", previewImg: "notes.png" },
    { englishName: "Now", chineseName: "目前状态", path: "/now", previewImg: "now.png" },
    { englishName: "Letter", chineseName: "岁月信件", path: "/letter", previewImg: "letter.png" },
    { englishName: "Pond", chineseName: "鱼塘反馈", path: "/pond", previewImg: "pond.png" },
    { englishName: "About", chineseName: "关于作者", path: "/about", previewImg: "about.png" },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.path === "/footprints") return isPageEnabled("page.footprints.enable", true);
    if (item.path === "/love") return isPageEnabled("page.love.enable", true);
    if (item.path === "/letter") return isPageEnabled("page.letter.enable", true);
    if (item.path === "/now") return isPageEnabled("page.now.enable", true);
    if (item.path === "/pond") return isPageEnabled("page.pond.enable", true);
    if (item.path === "/about") return isPageEnabled("page.about.enable", true);
    return true;
  });

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 px-3 sm:top-5 sm:px-6 lg:px-8">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-3">
        {/* 左胶囊: Logo */}
        <Link 
          href="/" 
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              y: -3,
              scale: 1.01,
              boxShadow: "0 12px 24px -8px rgba(15, 15, 15, 0.25)",
              duration: 0.35,
              ease: "power2.out",
            });
            const logoA = e.currentTarget.querySelector(".logo-a-icon");
            if (logoA) {
              gsap.to(logoA, { rotate: -8, scale: 1.1, duration: 0.4, ease: "back.out(1.7)" });
            }
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              y: 0,
              scale: 1,
              boxShadow: "0 6px 18px -6px rgba(15,15,15,0.15), 0 1px 2px rgba(0,0,0,0.03)",
              duration: 0.35,
              ease: "power2.out",
            });
            const logoA = e.currentTarget.querySelector(".logo-a-icon");
            if (logoA) {
              gsap.to(logoA, { rotate: 0, scale: 1, duration: 0.4, ease: "power2.out" });
            }
          }}
          className="group/logo pointer-events-auto relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-2xl border border-charcoal/10 dark:border-white/10 bg-cream/85 dark:bg-charcoal/85 px-3 py-2 shadow-[0_6px_18px_-6px_rgba(15,15,15,0.15),0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md active:scale-[0.98] sm:px-4"
        >
          {/* Logo 标志性小图标 */}
          {logoUrl ? (
            <span className="logo-a-icon relative flex h-5 w-5 items-center justify-center overflow-hidden rounded bg-transparent">
              <Image
                src={logoUrl}
                alt="Logo"
                fill
                sizes="20px"
                unoptimized
                className="object-contain"
              />
            </span>
          ) : (
            <span className="logo-a-icon relative flex h-5 w-5 items-center justify-center overflow-hidden rounded bg-charcoal text-cream dark:bg-cream dark:text-charcoal transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3 w-3"
              >
                <path d="M12 1a3 3 0 0 0-3 3v1.3a5.9 5.9 0 0 0-2.3.8L5.8 5.2a3 3 0 0 0-4.2 4.2l.9.9A5.9 5.9 0 0 0 2 12a3 3 0 0 0 3 3h1.3a5.9 5.9 0 0 0 .8 2.3l-.9.9a3 3 0 0 0 4.2 4.2l.9-.9a5.9 5.9 0 0 0 2.3.8V23a3 3 0 0 0 6 0v-1.3a5.9 5.9 0 0 0 2.3-.8l.9.9a3 3 0 0 0 4.2-4.2l-.9-.9a5.9 5.9 0 0 0 .8-2.3H22a3 3 0 0 0 0-6h-1.3a5.9 5.9 0 0 0-.8-2.3l.9-.9a3 3 0 0 0-4.2-4.2l-.9.9A5.9 5.9 0 0 0 15 5.3V4a3 3 0 0 0-3-3zm0 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
              </svg>
            </span>
          )}

          <span className="relative text-[13px] font-serif tracking-wider text-charcoal dark:text-cream transition-colors duration-300">
            {logoText}
            <span className="ml-2 hidden text-[8px] font-normal uppercase tracking-widest text-gold opacity-75 transition-opacity group-hover/logo:opacity-100 sm:inline">
              ©2026
            </span>
          </span>
        </Link>

        {/* 右胶囊: 导航链接与动作按钮 */}
        <div className="pointer-events-auto relative inline-flex min-w-0 items-center gap-1 rounded-full border border-charcoal/10 bg-cream/85 px-1.5 py-1.5 shadow-[0_6px_18px_-6px_rgba(15,15,15,0.15),0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md transition-[box-shadow,border-color] duration-300 dark:border-white/10 dark:bg-charcoal/85 sm:gap-1.5 sm:px-2">
          
          {/* 桌面端导航 */}
          <div 
            ref={navContainerRef}
            className="hidden lg:flex items-center space-x-1 relative"
            onMouseLeave={() => setHoveredPath(null)}
          >
            {/* GSAP 驱动的背景滑动气泡 */}
            <div
              ref={pillRef}
              className="absolute left-0 top-0 rounded-full bg-charcoal/10 dark:bg-white/10 border border-charcoal/5 dark:border-white/5 pointer-events-none opacity-0"
              style={{ zIndex: 0 }}
            />

            {filteredNavItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <div 
                  key={item.path} 
                  data-path={item.path}
                  className="relative group/nav"
                  onMouseEnter={() => setHoveredPath(item.path)}
                >
                  <Link
                    href={item.path}
                    className={`relative z-10 text-[10px] uppercase tracking-widest transition-colors duration-300 font-sans py-2 px-3 rounded-full inline-block ${
                      isActive ? "text-gold font-semibold" : "text-charcoal/60 hover:text-charcoal"
                    }`}
                  >
                    {item.englishName}
                  </Link>

                  {/* HoverCard 预览特效 */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 pt-2 opacity-0 translate-y-3 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-[100]">
                    <div className="w-56 h-36 bg-cream dark:bg-charcoal border border-charcoal/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)] relative">
                      <Image
                        src={`/assets/preview/${item.previewImg}`}
                        alt={item.englishName}
                        fill
                        sizes="224px"
                        className="object-cover transition-transform duration-700 ease-out group-hover/nav:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent flex flex-col justify-end p-4">
                        <span className="text-white text-[11px] font-sans font-semibold tracking-widest uppercase">
                          {item.englishName}
                        </span>
                        <span className="text-cream/80 text-[10px] font-sans font-light mt-0.5 tracking-wider">
                          {item.chineseName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 平板端平铺导航 (显示前 4 个项) */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            {filteredNavItems.slice(0, 4).map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`rounded-full px-2.5 py-1.5 font-sans text-[9px] uppercase tracking-wider transition-all ${
                    isActive
                      ? "text-gold font-semibold bg-charcoal/5 dark:bg-white/5"
                      : "text-charcoal/60 hover:text-charcoal dark:hover:text-cream"
                  }`}
                >
                  {item.englishName}
                </Link>
              );
            })}
          </div>

          {/* 平板端“更多”折叠触发按钮 */}
          {filteredNavItems.length > 4 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="hidden md:flex lg:hidden items-center gap-0.5 rounded-full px-2.5 py-1.5 font-sans text-[9px] uppercase tracking-wider transition-all text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5 dark:text-cream/60 dark:hover:text-cream dark:hover:bg-white/5 cursor-pointer"
              aria-label="Toggle More Menu"
            >
              <span>More</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`} />
            </button>
          )}

          {/* 手机端“菜单”汉堡折叠触发按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="flex md:hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 font-sans text-[9px] uppercase tracking-wider transition-all text-charcoal bg-charcoal/5 hover:bg-charcoal/10 dark:text-cream dark:bg-white/5 dark:hover:bg-white/10 cursor-pointer font-semibold"
            aria-label="Toggle Menu"
          >
            <div className="flex flex-col gap-0.5 w-3">
              <span className={`h-[1px] w-full bg-current transition-transform duration-300 ${isMenuOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
              <span className={`h-[1px] w-full bg-current transition-opacity duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
              <span className={`h-[1px] w-full bg-current transition-transform duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
            </div>
            <span>Menu</span>
          </button>

          {/* 折叠下拉导航面板 */}
          <div
            ref={menuRef}
            className="absolute top-full right-0 mt-3 w-[280px] md:w-[320px] rounded-3xl border border-charcoal/10 bg-cream/95 p-3.5 shadow-[0_20px_50px_rgba(15,15,15,0.15)] backdrop-blur-md dark:border-white/10 dark:bg-charcoal/95 pointer-events-none opacity-0 scale-95 origin-top-right transition-all z-[100]"
          >
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-charcoal/5 dark:border-white/5">
              <span className="text-[9px] font-sans font-semibold uppercase tracking-widest text-charcoal/40 dark:text-cream/40">
                Directory
              </span>
              <span className="text-[9px] font-sans uppercase tracking-widest text-gold opacity-80">
                生活档案馆
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {filteredNavItems.map((item, index) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`group flex flex-col justify-center items-start p-2.5 rounded-2xl border border-charcoal/5 dark:border-white/5 bg-cream-dark/20 dark:bg-charcoal/20 hover:bg-cream-dark/60 dark:hover:bg-charcoal/60 hover:border-charcoal/10 dark:hover:border-white/10 transition-all duration-300 active:scale-[0.98] ${
                      isActive ? "border-gold/30 bg-gold/5 dark:bg-gold/10" : ""
                    } ${index < 4 ? "md:hidden" : ""}`}
                  >
                    <span className={`text-[9px] font-sans font-bold tracking-widest uppercase transition-colors duration-300 ${
                      isActive ? "text-gold" : "text-charcoal/80 dark:text-cream/80 group-hover:text-charcoal dark:group-hover:text-cream"
                    }`}>
                      {item.englishName}
                    </span>
                    <span className="text-[8px] font-sans text-charcoal/45 dark:text-cream/45 mt-0.5 tracking-wider transition-colors duration-300 group-hover:text-charcoal/60 dark:group-hover:text-cream/60">
                      {item.chineseName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 细分界线 */}
          <div className="h-4 w-[1px] bg-charcoal/10 dark:bg-white/10" />

          {/* 明暗主题切换按钮 */}
          <button
            onClick={toggleTheme}
            className="relative cursor-pointer overflow-hidden rounded-full border border-charcoal/10 p-2 text-charcoal transition-all hover:border-charcoal hover:bg-charcoal/5 active:scale-95 dark:border-white/10 dark:hover:border-white dark:hover:bg-white/5"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon className="w-3.5 h-3.5 stroke-[1.25] text-charcoal" />
            ) : (
              <Sun className="w-3.5 h-3.5 stroke-[1.25] text-charcoal" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}

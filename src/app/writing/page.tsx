"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Lock, ArrowRight, ArrowLeft, Calendar, Tag, Smile } from "lucide-react";
import Link from "next/link";
import { writingData } from "@/data/writing";
import { useArticles } from "@/hooks/useArticles";
import Image from "next/image";
import gsap from "gsap";

export default function WritingPage() {
  const { posts: dynamicPosts, loading } = useArticles();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
 
  const listContainerRef = useRef<HTMLDivElement>(null);
 
  const categories = ["All", ...Array.from(new Set(dynamicPosts.map((post) => post.category)))];
 
  // 统一的重置页码过滤处理器
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };
 
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
  };
 
  // 防抖处理搜索输入，降低高频渲染与图片解码造成的内存占用
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);
 
  // 过滤条件：排除 visibility: "hidden" 除非有搜索匹配，过滤分类，匹配搜索词
  const filteredPosts = dynamicPosts.filter((post) => {
    if (post.visibility === "hidden" && !searchQuery) {
      return false;
    }
 
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
 
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
 
    return matchesSearch && matchesCategory;
  });

  // 分页计算
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  
  // 确保页码不越界
  const activePage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const paginatedPosts = filteredPosts.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  // GSAP 列表交替进场与视差进入动画
  useEffect(() => {
    if (loading || !listContainerRef.current) return;

    // 检查是否渲染了卡片元素，防止 GSAP 控制台打出 Target not found 警告
    const cards = listContainerRef.current.querySelectorAll(".writing-card");
    if (cards.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // 低动效模式下：仅使用极速淡入
        gsap.fromTo(
          ".writing-card",
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "none",
            overwrite: "auto",
          }
        );
      } else {
        // 1. 卡片外框淡入并上移
        gsap.fromTo(
          ".writing-card",
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            overwrite: "auto",
          }
        );

        // 2. 图片缩放淡入
        gsap.fromTo(
          ".writing-card-img-wrapper",
          { opacity: 0, scale: 1.06 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.1,
            overwrite: "auto",
          }
        );

        // 3. 文本内容自适应左右滑入
        gsap.fromTo(
          ".writing-card-text-even",
          { opacity: 0, x: 20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.15,
            overwrite: "auto",
          }
        );

        gsap.fromTo(
          ".writing-card-text-odd",
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.15,
            overwrite: "auto",
          }
        );
      }
    }, listContainerRef);

    return () => ctx.revert();
  }, [activeCategory, activePage, loading]);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-24 md:py-32">
      <div className="bg-cream/90 dark:bg-charcoal/90 backdrop-blur-md border border-charcoal/10 dark:border-white/10 rounded-[2.5rem] p-6 md:p-12 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)]">
        {/* 头部标题与检索栏 */}
        <div className="border-b border-charcoal/8 dark:border-white/8 pb-8 mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-[10px] font-sans font-semibold tracking-widest text-gold uppercase bg-gold/10 px-2.5 py-1 rounded">
              02 / Catalog
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal dark:text-cream mt-2">
              Writing / 随笔与文章
            </h1>
            <p className="font-sans text-xs text-charcoal/50 dark:text-cream/50 tracking-wider">
              关于前端视觉、摄影银盐、阅读碎片与日常琐碎的私人电子编目。
            </p>
          </div>

          {/* 玻璃拟态搜索条 */}
          <div className="relative w-full lg:max-w-xs border border-charcoal/10 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-2xl px-4 py-2.5 flex items-center focus-within:border-gold/50 transition-colors shadow-sm">
            <Search className="w-4 h-4 text-charcoal/40 dark:text-cream/40 mr-2.5 stroke-[1.8]" />
            <input
              type="text"
              placeholder="SEARCH / 检索档案..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-transparent border-none w-full text-xs tracking-wider focus:outline-none placeholder:text-charcoal/30 dark:placeholder:text-cream/30 font-sans text-charcoal dark:text-cream"
            />
          </div>
        </div>

        {/* 分类选项卡 */}
        <div className="flex flex-wrap gap-2.5 border-b border-charcoal/5 dark:border-white/5 pb-6 mb-10 select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`text-[9px] font-sans uppercase tracking-widest px-4.5 py-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
                activeCategory === cat
                  ? "bg-gold text-white border-gold shadow-sm font-semibold"
                  : "border-charcoal/10 dark:border-white/10 text-charcoal/60 dark:text-cream/60 hover:border-gold/50 hover:text-gold"
              }`}
            >
              {cat === "All" ? "ALL / 全部" : cat}
            </button>
          ))}
        </div>

        {/* 文章列表 */}
        <div ref={listContainerRef} className="space-y-6">
          {paginatedPosts.length > 0 ? (
            paginatedPosts.map((post, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={post.slug}
                  className="writing-card group relative overflow-hidden rounded-[2.5rem] border border-charcoal/8 bg-white/55 dark:bg-white/[0.03] shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/72 dark:hover:bg-white/8 hover:shadow-[0_20px_50px_-32px_rgba(217,134,95,0.22)] dark:border-white/10 flex flex-col md:flex-row items-stretch min-h-[420px] md:min-h-0 md:h-[250px]"
                >
                  {/* 封面图容器 - 绝对定位以支持无缝斜切分割 */}
                  <div className="writing-card-img-wrapper w-full h-48 relative shrink-0 md:absolute md:inset-y-0 md:left-0 md:w-full md:h-full md:z-10 pointer-events-none overflow-hidden rounded-[2.5rem]">
                    {/* 斜角切割裁剪层 - 增加 isolation 与 backface-visibility 强制规避硬件加速层穿透 bug */}
                    <div
                      className={`w-full h-full overflow-hidden ${
                        isEven ? "clip-even-img" : "clip-odd-img"
                      }`}
                      style={{
                        isolation: "isolate",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "translateZ(0)",
                      }}
                    >
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0 bg-charcoal/5 pointer-events-none z-10" />
                        <Image
                          src={post.cover}
                          alt={post.title}
                          fill
                          sizes="(min-width: 768px) 35vw, 100vw"
                          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-108 saturate-[1.12] contrast-[1.02] brightness-[1.02] pointer-events-auto"
                          priority={idx < 2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 右侧文章摘要 - 视交替左右进行内边距位移 */}
                  <div
                    className={`writing-card-text-${
                      isEven ? "even" : "odd"
                    } flex-1 p-6 md:p-0 md:absolute md:inset-0 md:z-20 md:flex md:flex-col md:justify-between md:py-6 md:px-8 ${
                      isEven ? "md:pl-[47%]" : "md:pr-[47%]"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* 元数据标签 */}
                      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-charcoal/45 dark:text-cream/45 font-sans">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gold/80" />
                          {post.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gold font-medium">
                          <Tag className="w-3.5 h-3.5 text-gold/80" />
                          {post.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Smile className="w-3.5 h-3.5 text-gold/80" />
                          {post.mood}
                        </span>
                        
                        {post.visibility === "private" && (
                          <span className="inline-flex items-center text-amber-800 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-300 px-2 py-0.5 border border-amber-200/50 dark:border-amber-900/50 rounded text-[9px]">
                            <Lock className="w-2.5 h-2.5 mr-1 stroke-[1.5]" /> PRIVATE / 已加密
                          </span>
                        )}
                      </div>

                      <Link href={`/writing/${post.slug}`} className="block">
                        <h3 className="font-serif text-xl md:text-2xl font-light text-charcoal dark:text-cream group-hover:text-gold dark:group-hover:text-gold-light transition-colors duration-300 leading-tight">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-xs md:text-sm text-charcoal/60 dark:text-cream/60 leading-relaxed font-light tracking-wide max-w-2xl line-clamp-3">
                        {post.description}
                      </p>
                    </div>

                    {/* 阅读全文按钮 */}
                    <div className="pt-2">
                      <Link
                        href={`/writing/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase border border-charcoal/10 dark:border-white/10 hover:border-gold hover:bg-gold hover:text-white px-5 py-2.5 transition-all font-sans cursor-pointer rounded-full"
                      >
                        READ / 阅读全文
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center border border-dashed border-charcoal/10 dark:border-white/10 rounded-2xl">
              <p className="text-xs font-sans text-charcoal/40 dark:text-cream/40 uppercase tracking-widest">
                No matching records found / 暂无匹配的数字档案
              </p>
            </div>
          )}
        </div>

        {/* 分页控制器 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-8 border-t border-charcoal/10 dark:border-white/10 mt-12">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={activePage === 1}
              className="p-2.5 rounded-full border border-charcoal/10 dark:border-white/10 text-charcoal/60 dark:text-cream/60 disabled:opacity-30 disabled:hover:border-charcoal/10 disabled:hover:text-charcoal/60 hover:border-gold hover:text-gold dark:hover:border-gold-light dark:hover:text-gold-light transition-all duration-300 cursor-pointer disabled:cursor-not-allowed bg-white/20 dark:bg-white/5 flex items-center justify-center"
              aria-label="Previous Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = activePage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-full text-xs font-sans tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center border ${
                      isCurrent
                        ? "bg-gold text-white border-gold shadow-sm font-semibold dark:bg-gold dark:border-gold"
                        : "border-charcoal/10 dark:border-white/10 text-charcoal/60 dark:text-cream/60 hover:border-gold/50 hover:text-gold dark:hover:text-gold-light bg-white/20 dark:bg-white/5"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={activePage === totalPages}
              className="p-2.5 rounded-full border border-charcoal/10 dark:border-white/10 text-charcoal/60 dark:text-cream/60 disabled:opacity-30 disabled:hover:border-charcoal/10 disabled:hover:text-charcoal/60 hover:border-gold hover:text-gold dark:hover:border-gold-light dark:hover:text-gold-light transition-all duration-300 cursor-pointer disabled:cursor-not-allowed bg-white/20 dark:bg-white/5 flex items-center justify-center"
              aria-label="Next Page"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


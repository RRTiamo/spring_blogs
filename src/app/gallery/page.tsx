"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { galleryData, GalleryPhoto } from "@/data/gallery";
import { useGallery } from "@/hooks/useGallery";
import Lightbox from "@/components/gallery/Lightbox";
import GalleryCard from "@/components/gallery/GalleryCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GalleryPage() {
  const { photos, loading } = useGallery();
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [columnsCount, setColumnsCount] = useState(3);
  const [mounted, setMounted] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  // 1. 客户端响应式自适应列数计算
  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumnsCount(1);
      } else if (width < 1024) {
        setColumnsCount(2);
      } else {
        setColumnsCount(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. GSAP 左右列视差漂移动效 (仅在三列大屏下生效，防移动端重排)
  useEffect(() => {
    if (!mounted || columnsCount < 3) return;

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      // 左列视差滚动偏慢 (向上滑移偏少)
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current,
          { y: 0 },
          {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // 右列视差滚动偏快 (向上滑移偏多)
      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          { y: 0 },
          {
            y: 40,
            ease: "none",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          }
        );
      }
    }, gridRef);

    // 页面高度更新时刷新缓存
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 250);

    return () => {
      ctx.revert();
      clearTimeout(refreshTimer);
    };
  }, [mounted, columnsCount]);

  // 将数据按照列数分发给对应的子数组
  const getColumnsData = () => {
    const columns: GalleryPhoto[][] = Array.from({ length: columnsCount }, () => []);
    photos.forEach((photo, idx) => {
      columns[idx % columnsCount].push(photo);
    });
    return columns;
  };

  const columns = getColumnsData();

  return (
    <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-16 md:py-24">
      {/* 栏目头部 */}
      <div className="border-b border-charcoal/10 dark:border-white/10 pb-12 mb-20">
        <span className="text-[10px] font-sans font-semibold tracking-widest text-charcoal/40 dark:text-white/40 uppercase">
          05 / Gallery
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal dark:text-cream mt-2">
          Gallery / 影像档案
        </h1>
        <p className="font-sans text-xs text-charcoal/50 dark:text-white/50 tracking-wider mt-2">
          用镜头与感光胶片物理定格的光影。已升级为极简无界艺术杂志排版，左右侧列辅以不对称顶部偏置与 GSAP 视差，实现顺畅呼吸的观看体验。
        </p>
      </div>

      {/* 瀑布流网格 */}
      <div ref={gridRef} className="relative z-10 w-full overflow-visible">
        {/* 未挂载骨架屏 */}
        {!mounted || loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {(photos.length > 0 ? photos : galleryData).map((photo) => (
              <div
                key={photo.id}
                className="bg-stone-100 dark:bg-zinc-950 border border-charcoal/5 dark:border-white/5 h-96 rounded-none animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-12 items-start w-full">
            {columns.map((columnItems, colIdx) => {
              // 决定分配视差 Ref 绑定
              let colRef = undefined;
              if (columnsCount === 3) {
                if (colIdx === 0) colRef = leftColRef;
                if (colIdx === 2) colRef = rightColRef;
              }

              // 决定不对称顶部偏置，增加版面韵律感 (仅在多列且挂载后应用)
              let colOffsetClass = "";
              if (columnsCount === 3) {
                if (colIdx === 1) colOffsetClass = "pt-20";
                if (colIdx === 2) colOffsetClass = "pt-10";
              } else if (columnsCount === 2) {
                if (colIdx === 1) colOffsetClass = "pt-12";
              }

              return (
                <div
                  key={colIdx}
                  ref={colRef}
                  className={`flex-1 flex flex-col gap-12 will-change-transform ${colOffsetClass}`}
                >
                  <AnimatePresence mode="popLayout">
                    {columnItems.map((photo) => {
                      const globalIdx = photos.indexOf(photo);
                      return (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, y: 35 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.15 }}
                          transition={{
                            duration: 0.7,
                            ease: [0.16, 1, 0.3, 1], // easeOutQuart
                          }}
                        >
                          <GalleryCard
                            photo={photo}
                            index={globalIdx}
                            onClick={() => setSelectedPhoto(photo)}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 大图查看灯箱 */}
      <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
}

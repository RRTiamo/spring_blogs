"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { X, Calendar, Award, BookOpen, Quote } from "lucide-react";
import gsap from "gsap";
import { Achievement } from "./CertificateCard";

interface AchievementModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  const modalOverlayRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!achievement) return;

    // 用 GSAP 编写高品质的弹窗出现动画
    const ctx = gsap.context(() => {
      // 遮罩层淡入
      gsap.fromTo(
        modalOverlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" }
      );

      // 内容框 3D 翻转/放大滑入 (拟真从书桌上被拿起来的效果)
      gsap.fromTo(
        modalBoxRef.current,
        {
          opacity: 0,
          scale: 0.9,
          y: 40,
          rotationX: -15,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationX: 0,
          duration: 0.6,
          ease: "back.out(1.2)",
        }
      );
    });

    // 锁死主页面滚动
    document.body.style.overflow = "hidden";

    return () => {
      ctx.revert();
      document.body.style.overflow = "unset";
    };
  }, [achievement]);

  if (!achievement) return null;

  const handleClose = () => {
    // 退出动画
    gsap.to(modalBoxRef.current, {
      opacity: 0,
      scale: 0.95,
      y: 20,
      duration: 0.25,
      ease: "power2.in",
      onComplete: onClose,
    });
    gsap.to(modalOverlayRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
    });
  };

  const formattedDate = achievement.achieveDate
    ? achievement.achieveDate.replace("T", " ").split(".")[0].slice(0, 16)
    : "";

  const translateCategory = (cat: string) => {
    switch (cat) {
      case "milestone": return "重大里程碑时刻";
      case "life": return "生活印记档案";
      case "daily": return "日常闪光/善举";
      default: return "个人成就记录";
    }
  };

  const getLevelName = (lvl: string) => {
    switch (lvl) {
      case "gold": return "史诗级黄金徽章";
      case "silver": return "稀有级白银徽章";
      case "bronze": return "普通级青铜徽章";
      default: return "日常勋章";
    }
  };

  return (
    <div
      ref={modalOverlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-charcoal/40 dark:bg-black/60 backdrop-blur-md"
      style={{ perspective: 1000 }}
    >
      {/* 遮罩背景点击关闭 */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* 实体相框/大证书卡片 */}
      <div
        ref={modalBoxRef}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full max-w-3xl bg-[#FDFBF7] dark:bg-[#1E2521] border border-[#C8B89A] dark:border-white/10 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] z-10 flex flex-col md:flex-row min-h-[420px]"
      >
        {/* 左侧大图 (如果有的话) */}
        {achievement.cover ? (
          <div className="relative md:w-5/12 h-64 md:h-auto bg-black/5 shrink-0">
            <Image
              src={achievement.cover}
              alt={achievement.title}
              fill
              sizes="(max-w-768px) 100vw, 320px"
              className="object-cover"
              priority
            />
            {/* 照片边角晕影 */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#FDFBF7] dark:from-[#1E2521] via-transparent to-transparent opacity-80 pointer-events-none" />
          </div>
        ) : (
          /* 无图时的插画占位，使用毛玻璃质感与图标 */
          <div className="md:w-5/12 h-48 md:h-auto bg-gradient-to-br from-[#F5F2EB] to-[#EAE3D2] dark:from-[#1A201C] dark:to-[#121614] flex flex-col items-center justify-center p-8 shrink-0 relative">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <Award className="w-8 h-8 text-amber-700 dark:text-amber-500" />
            </div>
            <span className="text-[10px] font-sans font-bold tracking-widest text-[#B5A891]/80 uppercase">
              HONOR & GLORY
            </span>
          </div>
        )}

        {/* 右侧详细文字信息 */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between text-left relative">
          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-charcoal/5 dark:hover:bg-white/5 border border-transparent hover:border-charcoal/10 dark:hover:border-white/10 text-charcoal/50 hover:text-charcoal dark:text-cream/50 dark:hover:text-cream transition-all cursor-pointer"
            aria-label="关闭详情"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-5">
            {/* 类别与重要度 */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAE3D2] dark:bg-white/5 border border-[#C8B89A]/30 dark:border-white/10 text-[9px] font-bold tracking-wider text-amber-800 dark:text-amber-500 uppercase select-none">
                <BookOpen className="w-3 h-3" />
                {translateCategory(achievement.category)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 text-[9px] font-bold tracking-wider text-charcoal/70 dark:text-cream/70 uppercase select-none">
                <Award className="w-3 h-3" />
                {getLevelName(achievement.level)}
              </span>
            </div>

            {/* 大标题 (Serif) */}
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal dark:text-cream leading-tight tracking-wide">
              {achievement.title}
            </h2>

            {/* 时间线 */}
            <div className="flex items-center gap-2 text-xs font-mono text-charcoal/40 dark:text-white/40">
              <Calendar className="w-3.5 h-3.5 tone-accent" />
              <span>达成时间：{formattedDate}</span>
            </div>

            {/* 详细描述（故事）- 带拟真引言底色效果 */}
            <div className="relative bg-[#FFFDF9] dark:bg-[#1C221F] border border-charcoal/5 dark:border-white/5 rounded-2xl p-4 md:p-5">
              <Quote className="absolute top-3 left-3 w-8 h-8 text-[#C8B89A]/15 pointer-events-none" />
              <p className="font-sans text-xs md:text-sm text-charcoal/80 dark:text-white/80 leading-relaxed indent-6 whitespace-pre-wrap break-words relative z-10">
                {achievement.description}
              </p>
            </div>
          </div>

          {/* 底部寄语 */}
          <div className="mt-8 pt-4 border-t border-charcoal/5 dark:border-white/5 text-[9px] font-mono tracking-widest text-[#B5A891]/60 uppercase flex justify-between select-none">
            <span>FILE NO: ACH-{achievement.id}</span>
            <span>RECORDED BY ATLAS ENGINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

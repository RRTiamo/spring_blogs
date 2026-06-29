"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { GraduationCap, Briefcase, Trophy, Medal, Heart, BookOpen } from "lucide-react";
import gsap from "gsap";

export interface Achievement {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  achieveDate: string;
  cover?: string;
  icon?: string;
}

interface CertificateCardProps {
  achievement: Achievement;
  onClick: () => void;
}

export default function CertificateCard({ achievement, onClick }: CertificateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // 优雅的 3D 悬浮倾斜 (Tilt) 动效
    const xTo = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power2.out" });
    const yTo = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power2.out" });

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
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
        duration: 0.8,
        ease: "elastic.out(1.2, 0.5)"
      });
    };

    const onMouseEnter = () => {
      gsap.to(el, {
        y: -6,
        scale: 1.01,
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.12)",
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

  // 图标匹配
  const renderIcon = (iconName?: string) => {
    const props = { className: "w-7 h-7 text-amber-700/80 dark:text-amber-500/80" };
    switch (iconName) {
      case "graduation": return <GraduationCap {...props} />;
      case "briefcase": return <Briefcase {...props} />;
      case "heart": return <Heart {...props} />;
      case "book": return <BookOpen {...props} />;
      case "medal": return <Medal {...props} />;
      default: return <Trophy {...props} />;
    }
  };

  const formattedDate = achievement.achieveDate
    ? achievement.achieveDate.split("T")[0]
    : "";

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className="ach-card-anim group relative cursor-pointer overflow-hidden rounded-2xl bg-[#EAE3D2] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#C8B89A] transition-all duration-300 flex flex-col min-h-[260px]"
    >
      {/* 相框内圈木纹阴影与金色内衬线 */}
      <div className="absolute inset-2 border-2 border-[#C8B89A]/50 pointer-events-none rounded-lg" />
      <div className="absolute inset-3 border border-amber-800/10 pointer-events-none rounded-md" />

      {/* 证书纸面主体 */}
      <div className="flex-1 bg-[#FDFBF7] dark:bg-[#1E2521] rounded-lg p-5 flex flex-col justify-between border border-[#DFD8C4] dark:border-white/5 relative overflow-hidden">
        {/* 顶部花纹装饰角 */}
        <div className="absolute top-2 left-2 text-xs font-serif text-[#C8B89A]/30 select-none">✦</div>
        <div className="absolute top-2 right-2 text-xs font-serif text-[#C8B89A]/30 select-none">✦</div>
        <div className="absolute bottom-2 left-2 text-xs font-serif text-[#C8B89A]/30 select-none">✦</div>
        <div className="absolute bottom-2 right-2 text-xs font-serif text-[#C8B89A]/30 select-none">✦</div>

        <div>
          {/* 图标与日期 */}
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/15">
              {renderIcon(achievement.icon)}
            </div>
            <span className="font-mono text-[9px] tracking-widest text-[#B5A891] uppercase pt-1">
              {formattedDate}
            </span>
          </div>

          {/* 证书大标题 (Serif) */}
          <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream leading-tight tracking-wide mb-3 text-left">
            {achievement.title}
          </h3>

          {/* 简短描述 */}
          <p className="font-sans text-xs text-charcoal/60 dark:text-white/60 leading-relaxed text-left line-clamp-3">
            {achievement.description}
          </p>
        </div>

        {/* 底部印章与签名 */}
        <div className="mt-4 pt-3 border-t border-charcoal/5 dark:border-white/5 flex justify-between items-end">
          <div className="text-left font-serif scale-90 origin-left">
            <div className="text-[8px] uppercase tracking-widest text-charcoal/40 dark:text-white/40">AUTHORIZED BY</div>
            <div className="text-[11px] font-bold text-charcoal/70 dark:text-white/70 italic mt-0.5 tracking-wider font-sans">
              Spring Breeze
            </div>
          </div>

          {/* 拟真双圈红色小印章 (Stamp) */}
          <div className="relative w-12 h-12 flex items-center justify-center pointer-events-none select-none select-none rotate-[-12deg] opacity-75 group-hover:scale-105 transition-transform duration-300">
            {/* 外圈 */}
            <div className="absolute inset-0.5 border-2 border-dashed border-[#C94A29]/80 rounded-full" />
            <div className="absolute inset-1.5 border border-[#C94A29]/80 rounded-full" />
            {/* 内字 */}
            <span className="font-serif text-[8px] font-bold text-[#C94A29]/90 scale-90 tracking-tighter">
              PASSED
            </span>
            {/* 背景印油斑驳底纹 */}
            <div className="absolute inset-0 bg-[#C94A29]/2 mix-blend-multiply rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

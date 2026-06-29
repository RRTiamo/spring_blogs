"use client";

import React, { useRef, useEffect } from "react";
import { GraduationCap, Briefcase, Trophy, Medal, Heart, BookOpen, Utensils } from "lucide-react";
import gsap from "gsap";
import { Achievement } from "./CertificateCard";

interface PinMedalProps {
  achievement: Achievement;
  onClick: () => void;
}

export default function PinMedal({ achievement, onClick }: PinMedalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const medalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = medalRef.current;
    if (!el) return;

    // 鼠标移入时产生物理回弹微震动 (Springy Shake)
    const onMouseEnter = () => {
      // 放大并抖动
      gsap.fromTo(
        el,
        { rotation: -6, scale: 1 },
        {
          rotation: 0,
          scale: 1.05,
          duration: 0.8,
          ease: "elastic.out(1.5, 0.4)",
          overwrite: "auto"
        }
      );
    };

    const onMouseLeave = () => {
      // 回归原位
      gsap.to(el, {
        rotation: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // 根据 icon 字段返回对应的图标组件
  const renderIcon = (iconName?: string) => {
    const props = { className: "w-6 h-6 text-charcoal/80 dark:text-cream/90" };
    switch (iconName) {
      case "graduation": return <GraduationCap {...props} />;
      case "briefcase": return <Briefcase {...props} />;
      case "heart": return <Heart {...props} />;
      case "book": return <BookOpen {...props} />;
      case "bowl": return <Utensils {...props} />;
      case "medal": return <Medal {...props} />;
      default: return <Trophy {...props} />;
    }
  };

  // 级别颜色渐变 (浮雕立体质感)
  const getMedalBgClass = (level: string) => {
    switch (level) {
      case "gold":
        return "bg-gradient-to-br from-[#FFE07D] via-[#F5B041] to-[#D35400] border-[#E59866] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_6px_15px_rgba(211,84,0,0.25)]";
      case "silver":
        return "bg-gradient-to-br from-[#ECEFF1] via-[#B0BEC5] to-[#78909C] border-[#CFD8DC] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_6px_15px_rgba(120,144,156,0.25)]";
      case "bronze":
      default:
        return "bg-gradient-to-br from-[#E8D3C3] via-[#D4AC0D] to-[#9A7D0A] border-[#D5F5E3]/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_6px_15px_rgba(154,125,10,0.25)]";
    }
  };

  const formattedDate = achievement.achieveDate
    ? achievement.achieveDate.split("T")[0]
    : "";

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="ach-card-anim relative flex flex-col items-center justify-center p-4 min-h-[190px] cursor-pointer"
    >
      {/* 顶部拟真银色/红色大头针 (Pushpin) - 看起来像把别针扎在软木板上 */}
      <div className="absolute top-2 w-3.5 h-3.5 bg-red-600 rounded-full border border-red-800 shadow-[0_2px_4px_rgba(0,0,0,0.3)] z-20 flex items-center justify-center">
        {/* 大头针微小反光点 */}
        <div className="w-1 h-1 bg-white/70 rounded-full absolute top-0.5 left-0.5" />
        {/* 金属针尖 */}
        <div className="absolute top-3.5 w-0.5 h-3 bg-zinc-400 opacity-60 pointer-events-none" />
      </div>

      {/* 徽章勋章主体 (Medal) */}
      <div
        ref={medalRef}
        className={`w-20 h-20 rounded-full border-2 ${getMedalBgClass(
          achievement.level
        )} flex items-center justify-center z-10 relative cursor-pointer active:scale-95 transition-transform`}
      >
        {/* 浮雕外圈花纹 */}
        <div className="absolute inset-1.5 border border-white/20 rounded-full pointer-events-none" />
        <div className="absolute inset-2.5 border border-charcoal/5 dark:border-white/5 rounded-full pointer-events-none" />
        
        {/* 图标渲染 */}
        <div className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]">
          {renderIcon(achievement.icon)}
        </div>

        {/* 金色/银色浮雕高光边框 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
      </div>

      {/* 别针下方的小标签纸 (Label) */}
      <div className="mt-4 bg-[#FFFDF9] dark:bg-[#1E2521] border border-charcoal/10 dark:border-white/10 px-3 py-1.5 rounded-lg shadow-sm max-w-[150px] w-full text-center">
        <h4 className="text-[10px] font-sans font-bold text-charcoal dark:text-cream truncate leading-tight select-none">
          {achievement.title}
        </h4>
        <span className="block text-[8px] font-mono text-charcoal/40 dark:text-white/40 mt-0.5 select-none">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

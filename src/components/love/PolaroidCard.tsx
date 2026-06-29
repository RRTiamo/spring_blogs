"use client";

import Image from "next/image";
import { MapPin, Heart, Lock } from "lucide-react";
import type { LoveEntry } from "@/interface/love";

interface PolaroidCardProps {
  entry: LoveEntry;
}

export default function PolaroidCard({ entry }: PolaroidCardProps) {
  // 依据标题字符编码计算一个确定性的旋转角度，避免服务端和客户端渲染不一致导致水合错误
  const charCode = entry.title.charCodeAt(0) || 0;
  const rotationClass =
    charCode % 3 === 0
      ? "rotate-[-1deg] hover:rotate-0"
      : charCode % 3 === 1
      ? "rotate-[1deg] hover:rotate-0"
      : "rotate-[-0.5deg] hover:rotate-1";

  return (
    <div
      className={`bg-white dark:bg-zinc-950 border border-charcoal/8 dark:border-white/8 p-4 pb-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 flex flex-col space-y-4 group relative rounded-sm ${rotationClass} cursor-pointer`}
    >
      {/* 顶角私密标记 */}
      {entry.visibility === "private" && (
        <span className="absolute top-6 right-6 z-20 inline-flex items-center text-[9px] uppercase tracking-widest text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 border border-amber-200/50 dark:border-amber-900/50 font-sans rounded-sm">
          <Lock className="w-2.5 h-2.5 mr-1 stroke-[1.5]" /> Private
        </span>
      )}

      {/* Polaroid 相片区域 */}
      <div className="relative overflow-hidden aspect-[4/3] bg-charcoal/5 dark:bg-white/5 border border-charcoal/5 dark:border-white/5 rounded-sm">
        {/* 覆盖一层微微的复古质感遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-charcoal/5 to-transparent z-10 pointer-events-none opacity-60 group-hover:opacity-0 transition-opacity duration-700" />
        <Image
          src={entry.cover}
          alt={entry.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 select-none scale-100 group-hover:scale-103"
        />
      </div>

      {/* Polaroid 标签说明区域 (手写/温暖排版样式) */}
      <div className="pt-2 grow flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] text-charcoal/40 dark:text-cream/40 font-sans tracking-widest">
            <span>{entry.date}</span>
            <span>•</span>
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-gold stroke-[1.5]" /> {entry.location}
            </span>
          </div>
          <h3 className="font-serif text-lg font-light text-charcoal dark:text-cream mt-2.5 tracking-wide group-hover:text-gold transition-colors duration-300">
            {entry.title}
          </h3>
          <p className="text-xs text-charcoal/60 dark:text-cream/60 leading-relaxed font-light tracking-wide mt-2">
            {entry.content}
          </p>
        </div>

        <div className="pt-4 border-t border-charcoal/5 dark:border-white/5 flex justify-between items-center text-[9px] text-gold dark:text-gold-light uppercase tracking-widest font-sans">
          <span>Mood: {entry.mood}</span>
          <Heart className="w-3 h-3 fill-gold text-gold stroke-[1.5] group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
}

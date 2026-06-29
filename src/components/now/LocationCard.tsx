"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import gsap from "gsap";

interface LocationData {
  name: string;
  coordinates: string;
  mapText: string;
  desc: string;
}

export default function LocationCard({ data }: { data?: LocationData }) {
  const name = data?.name || "中国 · 江苏南京";
  const coordinates = data?.coordinates || "32.0603° N, 118.7969° E · Alt: 35m";
  const mapText = data?.mapText || "南京 NJ.SYS";
  const desc = data?.desc || "暂别申城的梧桐微风，回归金陵古城的山水形胜。在秦淮河畔与玄武湖光里，寻回更沉静的生活韵律，专注以代码和银盐记录此时此刻。";
  const radarRef = useRef<SVGCircleElement>(null);
  const ring1Ref = useRef<SVGCircleElement>(null);
  const ring2Ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // 雷达涟漪扩散动效
    const ctx = gsap.context(() => {
      // 环1扩散
      gsap.fromTo(
        ring1Ref.current,
        { r: 4, opacity: 0.8 },
        {
          r: 40,
          opacity: 0,
          duration: 2.5,
          repeat: -1,
          ease: "power1.out",
        }
      );
      // 环2延迟扩散
      gsap.fromTo(
        ring2Ref.current,
        { r: 4, opacity: 0.8 },
        {
          r: 55,
          opacity: 0,
          duration: 2.5,
          delay: 1.25,
          repeat: -1,
          ease: "power1.out",
        }
      );
      // 中心点呼吸闪烁
      gsap.fromTo(
        radarRef.current,
        { opacity: 0.5 },
        {
          opacity: 1,
          duration: 1,
          yoyo: true,
          repeat: -1,
          ease: "power1.inOut",
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative overflow-hidden border border-charcoal/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-6 md:p-8 flex flex-col justify-between group hover:border-charcoal/30 dark:hover:border-white/30 transition-all duration-300 md:col-span-2 rounded-2xl shadow-sm min-h-[300px]">
      {/* 精致小角饰 */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-charcoal/30 dark:border-white/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-charcoal/30 dark:border-white/30" />

      {/* 模拟地图 SVG 背景背景层 (z-0) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-45 dark:opacity-30 select-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* 定义网格图案 */}
          <defs>
            <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-charcoal/10 dark:text-white/10" />
            </pattern>
          </defs>
          
          {/* 背景填充网格 */}
          <rect width="100%" height="100%" fill="url(#map-grid)" />
          
          {/* 南京长江抽象路径 (从左下蜿蜒到右上) */}
          <path 
            d="M -50 260 C 100 240, 180 160, 240 130 C 300 100, 360 80, 480 80 C 580 80, 700 30, 900 10" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="16" 
            className="text-charcoal/5 dark:text-white/5 stroke-[12] md:stroke-[18]"
          />
          <path 
            d="M -50 260 C 100 240, 180 160, 240 130 C 300 100, 360 80, 480 80 C 580 80, 700 30, 900 10" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="text-charcoal/15 dark:text-white/15" 
            strokeDasharray="4 4"
          />

          {/* 玄武湖极简轮廓 */}
          <path 
            d="M 450 120 C 470 110, 490 120, 500 135 C 510 150, 490 170, 470 165 C 450 160, 430 140, 450 120 Z" 
            fill="currentColor" 
            className="text-charcoal/10 dark:text-white/10"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text x="460" y="145" className="fill-charcoal/30 dark:fill-white/30 text-[9px] font-mono tracking-widest scale-75">XUANWU LAKE</text>

          {/* 紫金山等高线 */}
          <path 
            d="M 520 150 C 550 140, 580 150, 590 165 C 600 180, 570 200, 540 195 C 510 190, 500 170, 520 150 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.75" 
            className="text-charcoal/20 dark:text-white/20" 
            strokeDasharray="2 3"
          />
          <path 
            d="M 530 158 C 550 150, 570 155, 578 167 C 585 178, 560 190, 545 187 C 530 183, 520 170, 530 158 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.75" 
            className="text-charcoal/30 dark:text-white/30"
          />
          <text x="535" y="175" className="fill-charcoal/30 dark:fill-white/30 text-[8px] font-mono tracking-wider scale-75">MT. ZIJIN</text>

          {/* 测绘辅助线 */}
          <circle cx="360" cy="140" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-charcoal/10 dark:text-white/10" strokeDasharray="5 5" />
          <circle cx="360" cy="140" r="120" fill="none" stroke="currentColor" strokeWidth="0.25" className="text-charcoal/5 dark:text-white/5" />
          
          <line x1="360" y1="20" x2="360" y2="260" stroke="currentColor" strokeWidth="0.5" className="text-charcoal/10 dark:text-white/10" strokeDasharray="3 3" />
          <line x1="100" y1="140" x2="700" y2="140" stroke="currentColor" strokeWidth="0.5" className="text-charcoal/10 dark:text-white/10" strokeDasharray="3 3" />

          {/* 雷达信号波纹和定位标志点 */}
          <circle ref={ring2Ref} cx="360" cy="140" r="4" fill="none" stroke="currentColor" className="text-gold/50" strokeWidth="1.5" />
          <circle ref={ring1Ref} cx="360" cy="140" r="4" fill="none" stroke="currentColor" className="text-gold/75" strokeWidth="1" />
          <circle ref={radarRef} cx="360" cy="140" r="5" className="fill-gold" />
          
          {/* 地标字样 */}
          <text x="372" y="144" className="fill-charcoal/80 dark:fill-white/80 text-[10px] font-sans font-bold tracking-wider">{mapText}</text>
        </svg>
      </div>

      {/* 卡片前端内容层 (z-10) */}
      <div className="relative z-10 space-y-4">
        {/* 左上分类标签 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 border border-charcoal/5 dark:border-white/5 bg-cream-dark dark:bg-charcoal rounded-full shadow-sm">
              <MapPin className="w-5 h-5 text-gold stroke-[1.25]" />
            </div>
            <span className="text-[10px] font-sans tracking-widest text-charcoal/40 dark:text-white/40 uppercase font-semibold">
              Location / 地点
            </span>
          </div>
          {/* GPS 模拟状态指示 */}
          <div className="flex items-center space-x-2 bg-charcoal/5 dark:bg-white/5 px-2.5 py-1 rounded-full border border-charcoal/10 dark:border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono tracking-widest text-charcoal/60 dark:text-white/60">GPS: LOCKED</span>
          </div>
        </div>

        {/* 核心位置显示 */}
        <div className="pt-2">
          <h3 className="font-serif text-2xl text-charcoal dark:text-cream font-medium tracking-wide">
            {name}
          </h3>
          <p className="text-[10px] font-mono tracking-widest text-gold/80 dark:text-gold/60 mt-1 uppercase">
            {coordinates}
          </p>
        </div>
      </div>

      {/* 底部详细描述 */}
      <div className="relative z-10 mt-6 pt-4 border-t border-charcoal/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <p className="text-xs md:text-sm font-sans font-light leading-relaxed text-charcoal/60 dark:text-white/70 max-w-md tracking-wider">
          {desc}
        </p>
        <span className="text-[9px] font-mono tracking-wider text-charcoal/30 dark:text-white/30 uppercase shrink-0">
          Grid Ref: WGS-84
        </span>
      </div>
    </div>
  );
}

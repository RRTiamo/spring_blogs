"use client";

import { Camera, MapPin, Play } from "lucide-react";
import { GalleryPhoto } from "@/data/gallery";

interface GalleryCardProps {
  photo: GalleryPhoto;
  index: number;
  onClick: () => void;
}

export default function GalleryCard({ photo, index, onClick }: GalleryCardProps) {
  const isVideo = photo.type === "video";
  const itemNumber = index < 9 ? `0${index + 1}` : `${index + 1}`;

  // 根据相机品牌决定渲染何种艺术印戳
  const renderDarkroomStamp = () => {
    const cam = photo.camera.toLowerCase();
    
    if (cam.includes("leica")) {
      return (
        <div className="absolute top-4 right-4 z-30 pointer-events-none select-none opacity-0 group-hover:opacity-40 transition-opacity duration-500 scale-90 origin-top-right">
          {/* 红色 Leica 圆戳 */}
          <div className="w-14 h-14 rounded-full border-2 border-red-500/70 flex flex-col items-center justify-center text-red-500 font-mono text-[6px] tracking-tighter leading-none rotate-12">
            <span className="font-bold border-b border-red-500/40 pb-0.5 mb-0.5">LEICA LAB</span>
            <span>WET PROCESS</span>
            <span className="scale-75 mt-0.5">PASS // OK</span>
          </div>
        </div>
      );
    }
    
    if (cam.includes("contax")) {
      return (
        <div className="absolute top-4 right-4 z-30 pointer-events-none select-none opacity-0 group-hover:opacity-35 transition-opacity duration-500 scale-90 origin-top-right">
          {/* 矩形 Contax 双线印戳 */}
          <div className="px-2 py-1 border-2 double border-zinc-500/70 text-zinc-500 dark:text-zinc-400 font-mono text-[6px] tracking-wider leading-none -rotate-6 flex flex-col items-center space-y-0.5">
            <span className="font-bold tracking-widest">CONTAX T2</span>
            <span className="scale-90 border-t border-zinc-500/30 pt-0.5">ZEISS T* COMPACT</span>
          </div>
        </div>
      );
    }
    
    if (cam.includes("hasselblad")) {
      return (
        <div className="absolute top-4 right-4 z-30 pointer-events-none select-none opacity-0 group-hover:opacity-35 transition-opacity duration-500 scale-90 origin-top-right">
          {/* 长条哈苏印戳 */}
          <div className="px-2 py-0.5 border border-dashed border-amber-600/70 text-amber-600 font-mono text-[5.5px] tracking-widest leading-none rotate-45 flex flex-col items-center">
            <span className="font-bold">HASSELBLAD</span>
            <span className="scale-75">503CX // 6x6</span>
          </div>
        </div>
      );
    }

    // 默认通用暗房戳
    return (
      <div className="absolute top-4 right-4 z-30 pointer-events-none select-none opacity-0 group-hover:opacity-30 transition-opacity duration-500 scale-90 origin-top-right">
        <div className="px-2 py-1 border border-charcoal/30 dark:border-white/30 text-charcoal/50 dark:text-white/50 font-mono text-[5.5px] tracking-widest leading-none -rotate-12">
          DARKROOM / SHEET
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-transparent border-0 p-0 transition-all duration-300 relative flex flex-col space-y-4 select-none mb-12"
    >
      {/* 媒体展示框 - 无卡框极简设计 */}
      <div className="relative overflow-hidden w-full bg-stone-100 dark:bg-stone-950 rounded-none shadow-[0_2px_12px_rgba(0,0,0,0.03)] group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-shadow duration-500">
        
        {/* 精致的物理底片边缘刻度饰线 (仅在悬停时隐约可见) */}
        <div className="absolute inset-0 border border-charcoal/5 dark:border-white/5 pointer-events-none z-20 transition-colors group-hover:border-charcoal/20" />

        {/* 动态暗房印章叠加 */}
        {renderDarkroomStamp()}

        {/* 媒体呈现 */}
        {isVideo ? (
          <div className="relative w-full aspect-video md:aspect-[4/3] flex items-center justify-center bg-zinc-950 overflow-hidden">
            
            {/* 电影底片小齿孔 (左右装饰) */}
            <div className="absolute left-1.5 top-0 bottom-0 z-20 flex flex-col justify-around opacity-25">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-1 h-2 bg-zinc-900 border border-white/5 rounded-3xs" />
              ))}
            </div>
            <div className="absolute right-1.5 top-0 bottom-0 z-20 flex flex-col justify-around opacity-25">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-1 h-2 bg-zinc-900 border border-white/5 rounded-3xs" />
              ))}
            </div>

            {/* 视频单帧静态渲染 - preload=metadata, 且不设置 autoplay/loop，达到静态占位效果，彻底避免卡顿 */}
            <video
              src={photo.src}
              preload="metadata"
              autoPlay={false}
              loop={false}
              muted
              playsInline
              className="w-full h-full object-cover transition-all duration-700 brightness-90 group-hover:brightness-95 scale-100 group-hover:scale-102"
            />

            {/* 精美高定 Cine Play 徽章 (Cine光圈播放图标) */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-12 h-12 rounded-full border border-white/30 bg-black/40 backdrop-blur-xs flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-gold/80 group-hover:border-gold shadow-md">
                <Play className="w-4 h-4 text-white fill-white translate-x-[1px] transition-transform duration-300 group-hover:scale-95" />
              </div>
            </div>
            
            {/* 视频状态微标 */}
            <span className="absolute bottom-2.5 left-6 text-[7px] font-mono tracking-widest text-white/50 uppercase scale-75 origin-left">
              CINE FILM // MP4
            </span>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            {/* 极轻微的暗角与网格纹理叠加层 */}
            <div className="absolute inset-0 bg-radial-vignette opacity-15 pointer-events-none z-10 transition-opacity group-hover:opacity-5" />

            {/* Admin-managed images have unknown intrinsic dimensions and may use arbitrary storage origins. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.title}
              className="w-full object-cover transition-all duration-700 scale-100 group-hover:scale-102 group-hover:saturate-[1.03]"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* 极简无界画廊说明标签 (Museum Label Layout) */}
      <div className="space-y-2.5 pt-1">
        {/* 极细的博物馆说明分割线 */}
        <div className="h-[1px] bg-charcoal/10 dark:bg-white/10 w-full relative">
          {/* 金色光效条，悬停时漫过 */}
          <div className="absolute inset-y-0 left-0 bg-gold w-0 group-hover:w-full transition-all duration-700 ease-out" />
        </div>

        {/* 编号、标题与参数 */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[8px] font-mono text-gold/80 tracking-widest uppercase">
                [{itemNumber}]
              </span>
              <h3 className="font-serif text-[15px] font-light text-charcoal dark:text-cream leading-tight">
                {photo.title}
              </h3>
            </div>
            
            {/* 拍摄规格 */}
            <div className="flex items-center space-x-1 text-[8px] font-mono text-charcoal/40 dark:text-white/40 tracking-wider">
              <Camera className="w-2.5 h-2.5" />
              <span>{photo.camera} / {photo.lens}</span>
            </div>
          </div>

          {/* 时间地点 */}
          <div className="text-right shrink-0">
            <span className="block text-[8px] font-mono text-charcoal/40 dark:text-white/40 tracking-widest uppercase">
              {photo.date}
            </span>
            <span className="inline-flex items-center text-[7.5px] font-mono text-gold/80 tracking-wider mt-0.5">
              <MapPin className="w-2.5 h-2.5 mr-0.5 text-gold/75" />
              {photo.location.split(",")[0]}
            </span>
          </div>
        </div>

        {/* 激光雕刻感的底片规格 (Film Stock Badge) */}
        <div className="flex justify-between items-center text-[7px] font-mono text-charcoal/30 dark:text-white/30 uppercase tracking-widest select-none pt-1">
          <span>PLATFORM: ATLAS // EXH_05</span>
          <span className="text-gold font-semibold tracking-[0.2em]">{photo.filmStock}</span>
        </div>
      </div>
    </div>
  );
}

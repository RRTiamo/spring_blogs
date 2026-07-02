"use client";

import { useEffect } from "react";
import { X, Camera, Calendar, MapPin, Film, Sliders, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryPhoto } from "@/data/gallery";

interface LightboxProps {
  photo: GalleryPhoto | null;
  onClose: () => void;
}

export default function Lightbox({ photo, onClose }: LightboxProps) {
  // 禁止背景滚动
  useEffect(() => {
    if (photo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    }
  }, [photo]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        {/* 背景毛玻璃蒙层 (Backdrop) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-cream/96 dark:bg-zinc-950/96 backdrop-blur-lg z-0"
        />

        {/* 悬浮关闭按钮 */}
        <button
          onClick={onClose}
          className="fixed top-6 right-6 p-2 rounded-full border border-charcoal/10 dark:border-white/10 text-charcoal/60 hover:text-charcoal dark:text-white/60 dark:hover:text-white bg-white/50 dark:bg-black/50 hover:border-charcoal/30 cursor-pointer z-50 transition-colors"
          title="关闭大图"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* 弹出面板内容层 (z-10) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-6xl w-full bg-white dark:bg-zinc-900 border border-charcoal/10 dark:border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.15)] rounded-2xl z-10 overflow-hidden flex flex-col lg:flex-row my-8"
        >
          {/* 左侧：画廊相框展示 (Gallery Framed Presentation) */}
          <div className="lg:w-7/12 xl:w-8/12 bg-stone-100 dark:bg-zinc-950 p-6 md:p-12 flex items-center justify-center min-h-[40vh] lg:min-h-[70vh] relative border-b lg:border-b-0 lg:border-r border-charcoal/10 dark:border-white/10">
            {/* 卡纸内折阴影装饰 */}
            <div className="absolute inset-4 md:inset-8 pointer-events-none border border-charcoal/5 dark:border-white/5 rounded-xs" />

            <div className="relative max-w-full max-h-[60vh] p-4 md:p-6 bg-white dark:bg-zinc-900 border border-charcoal/10 dark:border-white/10 shadow-lg rounded-xs flex flex-col items-center">
              {/* 大图呈现 */}
              {photo.type === "video" ? (
                <video
                  src={photo.src}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-w-full max-h-[50vh] object-contain rounded-xs border border-charcoal/5 dark:border-white/5"
                />
              ) : (
                // Preserve the original intrinsic ratio for arbitrary admin-managed lightbox media.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="max-w-full max-h-[50vh] object-contain select-none rounded-xs border border-charcoal/5 dark:border-white/5"
                />
              )}

              {/* 相框下缘底片激光打标 */}
              <div className="w-full text-center text-[7px] font-mono tracking-[0.2em] text-charcoal/30 dark:text-white/30 pt-4 uppercase select-none leading-none">
                {photo.camera} {"//"} {photo.lens} {"//"} {photo.filmStock}
              </div>
            </div>
          </div>

          {/* 右侧：暗房冲洗加工报告单 (Darkroom Processing Sheet) */}
          <div className="lg:w-5/12 xl:w-4/12 p-6 md:p-8 flex flex-col justify-between space-y-8 bg-white dark:bg-zinc-900 relative">
            
            {/* 报告表头部 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal/10 dark:border-white/10 pb-3">
                <span className="text-[9px] font-mono tracking-widest text-charcoal/40 dark:text-white/40 uppercase font-semibold">
                  {photo.type === "video" ? "DEV SHEET // MOTION" : "DEV SHEET // STATIC"}
                </span>
                <span className="text-[9px] font-mono tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded scale-90 uppercase">
                  Batch: {photo.date.substring(5, 7)}-A
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-2xl md:text-3xl font-light text-charcoal dark:text-cream leading-tight">
                  {photo.title}
                </h2>
                <p className="text-xs font-sans font-light leading-relaxed text-charcoal/60 dark:text-white/70 tracking-wider">
                  {photo.description}
                </p>
              </div>
            </div>

            {/* 中间核心：相机摄影与胶片冲洗双轨技术参数表 */}
            <div className="space-y-6">
              {/* 参数轨道 1: 拍摄物理记录 */}
              <div className="space-y-3">
                <h4 className="text-[8px] font-mono uppercase tracking-[0.2em] text-gold font-semibold">
                  [01] CAPTURE PARAMETERS
                </h4>
                <div className="border border-charcoal/10 dark:border-white/10 rounded-lg p-4 font-mono text-[10px] text-charcoal/80 dark:text-white/80 space-y-2.5 bg-cream-dark/10 dark:bg-zinc-950/20">
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/40 flex items-center"><Camera className="w-3.5 h-3.5 mr-1.5" /> CAMERA</span>
                    <span>{photo.camera}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/40 flex items-center"><Sliders className="w-3.5 h-3.5 mr-1.5" /> LENS</span>
                    <span>{photo.lens}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/40 flex items-center"><Settings className="w-3.5 h-3.5 mr-1.5" /> SETTINGS</span>
                    <span>{photo.settings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/40 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5" /> LOCATION</span>
                    <span className="truncate max-w-[65%]">{photo.location}</span>
                  </div>
                </div>
              </div>

              {/* 参数轨道 2: 暗房显影配方 (Hardcore Darkroom Specs) */}
              <div className="space-y-3">
                <h4 className="text-[8px] font-mono uppercase tracking-[0.2em] text-gold font-semibold">
                  [02] DEV-LAB RECIPE / 冲洗报告
                </h4>
                <div className="border border-charcoal/10 dark:border-white/10 rounded-lg p-4 font-mono text-[10px] text-charcoal/80 dark:text-white/80 space-y-2.5 bg-cream-dark/10 dark:bg-zinc-950/20">
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/40 flex items-center"><Film className="w-3.5 h-3.5 mr-1.5" /> MEDIUM</span>
                    <span>{photo.filmStock}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/40">DEVELOPER / 显影剂</span>
                    <span>{photo.type === "video" ? "8K Raw Digital" : "Kodak D-76 (1:1)"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/40">TEMP / 显影温度</span>
                    <span>{photo.type === "video" ? "3200K / 5600K" : "20°C / 68°F"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/40">TIME / 显影时间</span>
                    <span>{photo.type === "video" ? "N/A" : "09 min 30 sec"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/40">AGITATION / 搅拌</span>
                    <span className="truncate max-w-[65%]">{photo.type === "video" ? "Linear Rec" : "30s Initial, 5s/30s"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 报告表底边印章与归档时间 */}
            <div className="pt-4 border-t border-charcoal/10 dark:border-white/10 flex items-center justify-between text-[8px] font-mono text-charcoal/40 dark:text-white/40 uppercase">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3 h-3" />
                <span>ARCHIVED: {photo.date}</span>
              </div>
              <span className="tracking-widest font-semibold text-charcoal/60 dark:text-white/60">SYS: VERIFIED</span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

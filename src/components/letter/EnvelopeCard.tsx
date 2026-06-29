"use client";

import { useRef, useEffect } from "react";
import { Lock, Eye } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import gsap from "gsap";

interface CapsuleLetter {
  id: string;
  title: string;
  targetDate: string;
  bypassCode: string;
  prompt: string;
  content: string;
}

interface EnvelopeCardProps {
  letter: CapsuleLetter;
  unlockedIds: string[];
  onClick: () => void;
}

export default function EnvelopeCard({ letter, unlockedIds, onClick }: EnvelopeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);

  const isUnlocked = unlockedIds.includes(letter.id);
  const isPast = new Date(letter.targetDate).getTime() < new Date().getTime();
  const canRead = isUnlocked || isPast;

  // 根据信件 ID 匹配对应的记忆图片与邮寄目的地
  const is2027 = letter.id.includes("2027");
  const stampImg = is2027 ? "/assets/letter/iceland_sea.png" : "/assets/letter/dali_sunset.png";
  const postmarkLoc = is2027 ? "REYKJAVIK" : "DALI ERHAI";
  const postmarkDate = is2027 ? "2027.06.23" : "2030.01.01";

  // 3D 悬浮倾斜效果 (遵从无障碍 prefers-reduced-motion)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReduced = mediaQuery.matches;

    const listener = (e: MediaQueryListEvent) => {
      prefersReduced = e.matches;
    };
    mediaQuery.addEventListener("change", listener);

    const onMouseMove = (e: MouseEvent) => {
      if (prefersReduced) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const angleX = -(yc - y) / 12; // 限制上下倾斜角度在 -12 到 12 度之间
      const angleY = (xc - x) / 16;  // 限制左右倾斜角度在 -16 到 16 度之间

      gsap.to(el, {
        rotateX: angleX,
        rotateY: angleY,
        scale: 1.02,
        boxShadow: "0 30px 60px -15px rgba(23, 33, 27, 0.25), 0 15px 30px -10px rgba(23, 33, 27, 0.15)",
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 1000,
        overwrite: "auto",
      });

      // 让邮票和火漆印章产生微弱的视差差速偏移，增加空间厚度感
      if (stampRef.current) {
        gsap.to(stampRef.current, {
          x: (xc - x) / 30,
          y: (yc - y) / 30,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
      if (sealRef.current) {
        gsap.to(sealRef.current, {
          x: (xc - x) / 25,
          y: (yc - y) / 25,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        boxShadow: "0 10px 30px -10px rgba(23, 33, 27, 0.1), 0 1px 3px rgba(0,0,0,0.02)",
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
      if (stampRef.current) {
        gsap.to(stampRef.current, { x: 0, y: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
      }
      if (sealRef.current) {
        gsap.to(sealRef.current, { x: 0, y: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
      }
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      mediaQuery.removeEventListener("change", listener);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className="group relative flex flex-col justify-between aspect-[1.5/1] w-full rounded-2xl border border-charcoal/10 bg-cream-dark p-6 md:p-8 cursor-pointer select-none overflow-hidden transition-colors duration-500 shadow-[0_10px_30px_-10px_rgba(23,33,27,0.1)] transform-gpu"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* 物理信封折边斜角纹路 - 营造牛皮纸折边叠加质感 */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10">
        {/* 左斜折痕线 */}
        <div className="absolute top-0 left-0 w-full h-full border-t-[1px] border-l-[1px] border-charcoal/20 origin-top-left -rotate-[30deg] scale-150" />
        {/* 右斜折痕线 */}
        <div className="absolute top-0 right-0 w-full h-full border-t-[1px] border-r-[1px] border-charcoal/20 origin-top-right rotate-[30deg] scale-150" />
      </div>

      {/* 信封折角背部三角形切角阴影 - 已解锁时微张 */}
      <div className="absolute top-0 left-0 right-0 h-4 border-b border-dashed border-charcoal/5 dark:border-white/5" />

      {/* 顶部元数据：编号与到期状态 */}
      <div className="z-10 flex justify-between items-start" style={{ transform: "translateZ(10px)" }}>
        <div className="flex flex-col space-y-1">
          <span className="font-mono text-[9px] font-bold tracking-widest text-charcoal/40 uppercase">
            Capsule No. {letter.id.slice(-4)}
          </span>
          <h3 className="font-serif text-lg md:text-xl font-medium text-charcoal leading-tight">
            {letter.title}
          </h3>
        </div>

        {/* 右侧：精美回忆邮票与盖戳区 */}
        <div
          ref={stampRef}
          className="relative shrink-0 flex items-center justify-center pl-4 pb-4"
          style={{ transform: "translateZ(15px)" }}
        >
          {/* 复古齿孔邮票 */}
          <div className="relative w-16 h-20 bg-white dark:bg-zinc-850 p-[3px] shadow-[0_4px_10px_rgba(0,0,0,0.15)] stamp-hole-effect">
            <div className="relative w-full h-full overflow-hidden bg-cream-dark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stampImg}
                alt="Stamp memory"
                className="w-full h-full object-cover grayscale-[10%] contrast-[1.1] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-1 right-1 bg-black/60 px-1 py-0.5 rounded-[1px] text-[6px] text-white font-mono tracking-tighter">
                ¥ 8.00
              </div>
            </div>
          </div>

          {/* 压在邮票上的复古圆形邮戳 */}
          <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full border border-dashed border-charcoal/30 dark:border-white/30 text-charcoal/40 dark:text-white/40 flex flex-col items-center justify-center rotate-[-12deg] pointer-events-none select-none">
            <span className="text-[5px] font-mono tracking-widest scale-[0.8]">{postmarkLoc}</span>
            <div className="w-10 h-[1px] bg-charcoal/30 dark:bg-white/30 my-0.5" />
            <span className="text-[5px] font-mono scale-[0.7]">{postmarkDate}</span>
            {/* 邮戳波浪线 */}
            <svg className="absolute w-12 h-6 -bottom-1 -left-4 text-charcoal/20 dark:text-white/20" viewBox="0 0 100 30">
              <path d="M0,15 C20,5 30,25 50,15 C70,5 80,25 100,15" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>

      {/* 中部：手写体寄信/收信信息 */}
      <div 
        className="z-10 py-2 border-b border-charcoal/5 dark:border-white/5 flex flex-col space-y-0.5 text-left" 
        style={{ transform: "translateZ(8px)" }}
      >
        <span className="font-serif italic text-xs text-charcoal/50 uppercase tracking-wider">
          To: 未来的 Rrtiamo
        </span>
        <span className="font-serif italic text-[11px] text-charcoal/40 uppercase tracking-wider">
          From: {is2027 ? "2026年夏夜 · Private Atlas" : "2026年秋分 · 逻辑信箱"}
        </span>
      </div>

      {/* 底部：解锁状态与火漆印章 */}
      <div 
        className="z-10 pt-4 flex justify-between items-end mt-auto" 
        style={{ transform: "translateZ(12px)" }}
      >
        <div className="flex flex-col space-y-1 text-[10px] text-charcoal/50 font-sans tracking-wide">
          <span>投递解锁日期:</span>
          <span className="font-mono font-semibold text-charcoal/80 text-[11px]">
            {letter.targetDate.split("T")[0]}
          </span>
        </div>

        {/* 火漆印章 (Wax Seal) - 作为状态锁定器 */}
        <div 
          ref={sealRef}
          className="relative shrink-0 flex items-center justify-center select-none"
        >
          {canRead ? (
            /* 已解锁火漆状态：金色融化火漆，微张且微发光 */
            <div className="relative group/seal flex items-center space-x-2">
              <span className="text-[10px] text-green-700 dark:text-green-400 font-sans font-medium tracking-widest uppercase flex items-center mr-1">
                <Eye className="w-3 h-3 mr-1 animate-pulse" /> UNLOCKED
              </span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D9A05B] via-[#C58B3F] to-[#8E5E24] shadow-md flex items-center justify-center border border-[#E9B06B]/30 transition-transform duration-300 group-hover:scale-105 active:scale-95">
                <div className="w-7 h-7 rounded-full border border-dashed border-[#FFF]/20 flex items-center justify-center">
                  <span className="text-white/80 font-serif font-black text-xs scale-[0.9]">A</span>
                </div>
                <div className="absolute inset-0 bg-[#C58B3F]/10 rounded-full blur-[1px] -z-10 scale-110" />
              </div>
            </div>
          ) : (
            /* 未解锁火漆状态：红褐色厚重火漆，附带倒计时 */
            <div className="flex flex-col items-end space-y-2">
              <CountdownTimer targetDate={letter.targetDate} />
              <div className="relative group/seal flex items-center space-x-2">
                <span className="text-[9px] text-[#A63F3F] dark:text-[#E26D6D] font-mono tracking-widest uppercase flex items-center font-bold">
                  <Lock className="w-3 h-3 mr-1" /> ENCRYPTED
                </span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8E2424] via-[#6B1B1B] to-[#451010] shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center border border-[#A63F3F]/30 group-hover:rotate-12 transition-transform duration-500">
                  <div className="w-7 h-7 rounded-full border border-[#FFF]/10 flex items-center justify-center bg-black/10">
                    <Lock className="w-3 h-3 text-white/70 stroke-[2]" />
                  </div>
                  <div className="absolute -top-1 -right-0.5 w-3 h-3 rounded-full bg-[#6B1B1B] opacity-80" />
                  <div className="absolute -bottom-0.5 -left-1 w-2.5 h-3 rounded-full bg-[#451010] opacity-90" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 已解锁的信封 hover 露出里面的信纸一角动画 */}
      {canRead && (
        <div className="absolute -bottom-8 right-16 w-24 h-16 bg-white dark:bg-zinc-800 border border-charcoal/10 dark:border-white/10 rounded-t shadow-sm pointer-events-none transition-transform duration-500 ease-out group-hover:-translate-y-9 rotate-[-4deg]">
          <div className="w-full h-full flex flex-col space-y-1.5 p-2 pt-3">
            <div className="h-[1px] bg-blue-500/10 w-full" />
            <div className="h-[1px] bg-blue-500/10 w-5/6" />
            <div className="h-[1px] bg-blue-500/10 w-4/5" />
          </div>
        </div>
      )}

      {/* CSS 模块注入以处理 stamp-hole 效果 */}
      <style jsx global>{`
        .stamp-hole-effect {
          mask-image: radial-gradient(circle at 0px 0px, transparent 3px, black 3px);
          mask-size: 10px 10px;
          mask-repeat: repeat;
          mask-position: -5px -5px;
          -webkit-mask-image: radial-gradient(circle at 0px 0px, transparent 3px, black 3px);
          -webkit-mask-size: 10px 10px;
          -webkit-mask-repeat: repeat;
          -webkit-mask-position: -5px -5px;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, Key, Eye, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

interface CapsuleLetter {
  id: string;
  title: string;
  targetDate: string;
  bypassCode: string;
  prompt: string;
  content: string;
  images?: string;
}

interface LetterModalProps {
  letter: CapsuleLetter | null;
  onClose: () => void;
  unlockedIds: string[];
  onUnlockSuccess: (id: string) => void;
}

export default function LetterModal({
  letter,
  onClose,
  unlockedIds,
  onUnlockSuccess,
}: LetterModalProps) {
  const [bypassInput, setBypassInput] = useState("");
  const [error, setError] = useState(false);
  const [isOpeningTransition, setIsOpeningTransition] = useState(false);

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const envelopeBackRef = useRef<HTMLDivElement>(null);

  const parseTargetDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    let formatted = dateStr.replace(" ", "T");
    if (formatted.includes("T") && formatted.split("T")[1].split(":").length === 2) {
      formatted += ":00";
    }
    const d = new Date(formatted);
    return isNaN(d.getTime()) ? new Date(dateStr) : d;
  };

  const isUnlocked = letter ? unlockedIds.includes(letter.id) : false;
  const isPast = letter ? parseTargetDate(letter.targetDate).getTime() < new Date().getTime() : false;
  const canRead = isUnlocked || isPast;

  useEffect(() => {
    if (letter) {
      console.log(
        "[岁月信箱] 弹窗属性 - ID:",
        letter.id,
        "canRead:",
        canRead,
        "isPast:",
        isPast,
        "isUnlocked:",
        isUnlocked,
        "bypassCode:",
        letter.bypassCode,
        "content字数:",
        letter.content?.length
      );
    }
  }, [letter, canRead, isPast, isUnlocked]);

  // 根据信件 ID 匹配回忆照片堆
  const is2027 = letter ? letter.id.includes("2027") : false;
  const customImages = letter?.images ? letter.images.split(",").map(s => s.trim()).filter(Boolean) : [];
  const photos = customImages.length > 0
    ? customImages.map((src, idx) => {
        const rotate = idx % 2 === 0 ? "-6deg" : "8deg";
        const offset = idx % 2 === 0 ? "left-[-220px] top-[120px]" : "right-[-220px] top-[80px]";
        return {
          src,
          caption: `时光印记 ${idx + 1}`,
          rotate,
          offset
        };
      })
    : (is2027
        ? [
            { src: "/assets/letter/iceland_sea.png", caption: "Iceland Coast, 2026", rotate: "-6deg", offset: "left-[-220px] top-[120px]" },
            { src: "/assets/writing-camera.png", caption: "Hasselblad 503CX", rotate: "8deg", offset: "right-[-220px] top-[80px]" }
          ]
        : [
            { src: "/assets/letter/dali_sunset.png", caption: "Dali Sunset Room", rotate: "-8deg", offset: "left-[-220px] top-[60px]" },
            { src: "/assets/love-anniversary.png", caption: "Anniversary Moment", rotate: "6deg", offset: "right-[-220px] top-[140px]" }
          ]);

  // 运行信纸抽出与照片散落的 GSAP 动效
  useEffect(() => {
    if (!letter || !canRead) return;

    let ctx: gsap.Context;
    const animFrameId = requestAnimationFrame(() => {
      if (!paperRef.current) return;

      ctx = gsap.context(() => {
        // 1. 信纸从信封下方向上抽出、放大并平移入场
        gsap.fromTo(
          paperRef.current,
          {
            y: 200,
            scale: 0.85,
            opacity: 0,
            rotate: -2,
          },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            rotate: 0,
            duration: 1.4,
            ease: "power4.out",
            delay: 0.1,
          }
        );

        // 2. 信封封套略微向下平移，呈现“抽出”的深度差
        if (envelopeBackRef.current) {
          gsap.fromTo(
            envelopeBackRef.current,
            { y: 0, opacity: 0.8 },
            { y: 80, opacity: 0.3, duration: 1.2, ease: "power3.out" }
          );
        }

        // 3. 侧边偏振胶片照片 stagger 入场
        const scatterPhotos = modalContainerRef.current?.querySelectorAll(".scatter-photo");
        if (scatterPhotos && scatterPhotos.length > 0) {
          gsap.fromTo(
            scatterPhotos,
            {
              opacity: 0,
              y: 60,
              scale: 0.6,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              stagger: 0.2,
              ease: "back.out(1.5)",
              delay: 0.7,
            }
          );
        }
      }, modalContainerRef);
    });

    return () => {
      cancelAnimationFrame(animFrameId);
      if (ctx) ctx.revert();
    };
  }, [letter, canRead]);

  const handleBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letter) return;

    const lockEl = modalContainerRef.current?.querySelector(".lock-container");
    if (!lockEl) return;

    if (bypassInput === letter.bypassCode || bypassInput === "2026") {
      setIsOpeningTransition(true);
      
      // 播放火漆熔化/解锁过渡动画
      gsap.to(lockEl, {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          onUnlockSuccess(letter.id);
          setIsOpeningTransition(false);
          setError(false);
          setBypassInput("");
        }
      });
    } else {
      setError(true);
      setBypassInput("");
      // 输入错误时的抖动动画
      gsap.fromTo(
        lockEl,
        { x: -10 },
        { x: 10, duration: 0.08, repeat: 5, yoyo: true, ease: "none", onComplete: () => gsap.set(lockEl, { x: 0 }) }
      );
    }
  };

  if (!letter) return null;

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-50 bg-[#F4F3ED]/90 dark:bg-[#121815]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto"
    >
      {/* 全局大关闭按钮 */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-50 p-3 rounded-full border border-charcoal/10 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-charcoal hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer shadow-sm group"
        aria-label="Close modal"
      >
        <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
      </button>

      {/* 如果有解锁权限：展示仿真信纸信封和侧边照片 */}
      {canRead ? (
        <div key="letter-content" className="relative max-w-2xl w-full my-auto flex flex-col items-center">
          {/* 背景层的物理信封封底 (z-0) - 产生信纸从中抽出的分层深度 */}
          <div
            ref={envelopeBackRef}
            className="absolute inset-x-4 top-1/4 h-[350px] bg-cream-dark border border-charcoal/15 dark:border-white/5 rounded-3xl -z-10 flex flex-col justify-end p-6 select-none shadow-md overflow-hidden"
          >
            {/* 信封三角形斜切角几何线 */}
            <div className="absolute inset-0 border-t-[80px] border-t-[#D7D4C7] dark:border-t-[#171E19] border-x-[300px] border-x-transparent" />
            <div className="z-10 flex justify-between items-center text-[10px] text-charcoal/30 font-mono tracking-widest">
              <span>POSTAL CO. TIMELINE</span>
              <span>EST. 2026 ATLAS</span>
            </div>
          </div>

          {/* 仿真毛边网格手写信纸 (z-10) */}
          <div
            ref={paperRef}
            className="relative w-full border border-charcoal/10 bg-cream px-8 py-10 md:px-12 md:py-14 text-left shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] rounded-2xl paper-tear-effect overflow-hidden transform-gpu"
          >
            {/* 信纸上方的复古装订线/手撕撕裂口 */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-charcoal/5 to-transparent border-b border-dashed border-charcoal/10" />

            {/* 信纸顶部：精美古典信头 */}
            <div className="border-b border-[#E8E6DC] dark:border-zinc-800/80 pb-6 mb-8 flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[9px] font-mono tracking-widest text-[#B5A891] dark:text-[#A8987E] uppercase">
                  <Mail className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Future Time Letter</span>
                </div>
                <h2 className="font-serif text-2xl font-light text-charcoal dark:text-cream">
                  {letter.title}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono tracking-widest text-charcoal/30 uppercase">
                  ATLAS ARCHIVE
                </span>
              </div>
            </div>

            {/* 信纸正文：应用 Google 中文手写体 Ma_Shan_Zheng + 精准对齐蓝格线 */}
            <div className="relative font-ma-shan-zheng text-lg md:text-xl text-[#3A332A] dark:text-[#D1C8BA] leading-[2.2rem] py-2 whitespace-pre-wrap tracking-wider indent-8 min-h-[220px] bg-letter-lines">
              {letter.content}
            </div>

            {/* 信封落款与投递印章 */}
            <div className="mt-12 pt-6 border-t border-[#E8E6DC] dark:border-zinc-800/80 flex justify-between items-center text-[10px] font-serif text-charcoal/40 tracking-widest">
              <div>
                <span>书于：2026 年夏日傍晚</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="italic">Rrtiamo</span>
                {/* 红色微型火漆私印 */}
                <div className="w-5 h-5 rounded-full bg-red-800/80 flex items-center justify-center text-[7px] text-cream font-bold border border-red-700 shadow-sm">
                  印
                </div>
              </div>
            </div>
          </div>

          {/* 侧边随机散落的偏振照片 */}
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`scatter-photo absolute hidden xl:block w-52 bg-white dark:bg-zinc-850 p-3 shadow-md rounded-lg border border-charcoal/5 dark:border-white/5 pointer-events-auto transform transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-30 hover:shadow-xl ${photo.offset}`}
              style={{ transform: `rotate(${photo.rotate})`, zIndex: i === 0 ? 10 : 20 }}
            >
              <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={photo.caption} className="w-full h-full object-cover grayscale-[10%]" />
              </div>
              <div className="pt-2 pb-1 text-center font-serif text-[10px] italic text-charcoal/60 flex items-center justify-center space-x-1">
                <ImageIcon className="w-3 h-3 text-[#B5A891]" />
                <span>{photo.caption}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 如果未解锁：展示复古的口令输入拨盘/黄铜密码舱界面 */
        <div key="lock-container" className="lock-container max-w-md w-full border border-charcoal/10 bg-cream p-8 md:p-10 text-center relative shadow-2xl rounded-3xl transform-gpu">
          {/* 四角古典黄铜边框饰条 */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/40 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold/40 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold/40 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/40 rounded-br-xl" />

          <div className="space-y-6">
            {/* 机械锁芯大图标 */}
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-gold/40 text-gold bg-gold/5 animate-[spin_40s_linear_infinite]">
              <div className="w-12 h-12 rounded-full border border-charcoal/10 dark:border-white/10 flex items-center justify-center bg-transparent">
                <Key className="w-5 h-5 stroke-[1.25] text-charcoal rotate-45" />
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-light text-charcoal">
                此信封封存中
              </h2>
              <p className="text-xs font-sans text-charcoal/60 leading-relaxed tracking-wider mt-2.5 max-w-70 mx-auto">
                写信人在此信上设置了时空锁。
                <br />
                解锁日期为：<span className="font-mono text-charcoal font-bold">{letter.targetDate.replace("T", " ")}</span>
                <br />
                <span className="text-[10px] text-gold/80 block mt-2">提示：输入寄信年份或 bypass code 可以提前解锁。</span>
              </p>
            </div>

            {/* 黄铜质感机械式密码框 */}
            <form onSubmit={handleBypassSubmit} className="space-y-6">
              <div className="relative max-w-70 mx-auto bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/15 rounded-xl px-3 focus-within:border-gold transition-colors">
                <input
                  type="password"
                  placeholder="请输入时空秘钥"
                  value={bypassInput}
                  onChange={(e) => {
                    setBypassInput(e.target.value);
                    setError(false);
                  }}
                  className="w-full bg-transparent border-none py-3.5 text-center text-sm tracking-[0.6em] focus:outline-none placeholder:text-charcoal/30 dark:placeholder:text-charcoal/20 placeholder:tracking-normal font-mono text-charcoal"
                  autoFocus
                  disabled={isOpeningTransition}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-[#A63F3F] dark:text-[#E26D6D] tracking-wider font-light"
                  >
                    秘钥印记不符，无法解锁这封胶囊。
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isOpeningTransition}
                className="w-full max-w-70 mx-auto bg-charcoal dark:bg-white text-cream dark:text-charcoal hover:bg-gold dark:hover:bg-gold dark:hover:text-charcoal hover:text-charcoal transition-colors py-3.5 rounded-xl text-xs tracking-widest font-sans font-semibold uppercase cursor-pointer flex items-center justify-center space-x-2 shadow-md"
              >
                {isOpeningTransition ? (
                  <span>解锁中...</span>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>转动密钥，拆阅未来</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 信纸撕边、撕裂阴影、以及横线渐变 CSS 模块注入 */}
      <style jsx global>{`
        .paper-tear-effect {
          /* 制造稍微不规则的手工纸边缘，增加温度 */
          clip-path: polygon(
            0% 1%, 4% 0%, 9% 1%, 15% 0%, 20% 1%, 26% 0%, 32% 1%, 38% 0%, 45% 1%, 50% 0%, 56% 1%, 63% 0%, 70% 1%, 76% 0%, 82% 1%, 88% 0%, 93% 1%, 98% 0%, 100% 1%,
            100% 99%, 97% 100%, 92% 99%, 85% 100%, 80% 99%, 74% 100%, 67% 99%, 60% 100%, 54% 99%, 47% 100%, 42% 99%, 36% 100%, 30% 99%, 23% 100%, 16% 99%, 10% 100%, 4% 99%, 0% 100%
          );
        }
        
        /* 中文手写体信纸淡蓝色/淡墨色横格线，采用 precise px 对齐 */
        .bg-letter-lines {
          background-image: linear-gradient(
            rgba(0, 0, 0, 0) 95%,
            rgba(147, 168, 185, 0.25) 95%
          );
          background-size: 100% 2.2rem;
          background-attachment: local;
        }

        .dark .bg-letter-lines {
          background-image: linear-gradient(
            rgba(0, 0, 0, 0) 95%,
            rgba(217, 160, 91, 0.15) 95%
          );
        }
        
        .font-ma-shan-zheng {
          font-family: var(--font-ma-shan-zheng), cursive, sans-serif;
        }
      `}</style>
    </div>
  );
}

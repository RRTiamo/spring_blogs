"use client";

import { useEffect, useRef, useState } from "react";
import type { TimeCapsule } from "@/interface/love";
import { Lock, Unlock, Mail, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import LetterModal from "@/components/letter/LetterModal";

interface LoveTimeCapsuleProps {
  capsules: TimeCapsule[];
}

export default function LoveTimeCapsule({ capsules }: LoveTimeCapsuleProps) {
  return (
    <div className="w-full py-12 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
      {/* 模块标题 */}
      <div className="mb-10 text-center lg:text-left">
        <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">
          写给未来的悄悄话
        </span>
        <h2 className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-charcoal dark:text-cream">
          时光信箱
        </h2>
        <p className="text-sm tone-muted mt-2 font-sans max-w-md">
          有些话，只说给未来的我们听。在这里寄存秘密信件，直到指定的一天被开启。
        </p>
      </div>

      {/* 胶囊卡片网络 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {capsules.map((capsule) => (
          <CapsuleEnvelope key={capsule.id} capsule={capsule} />
        ))}
        {capsules.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-charcoal/10 dark:border-white/10 rounded-2xl tone-muted text-sm font-sans flex flex-col items-center justify-center">
            <Mail className="w-8 h-8 text-charcoal/20 dark:text-cream/20 mb-3" />
            时光信箱空无一信。
          </div>
        )}
      </div>
    </div>
  );
}

// 独立的单胶囊信封组件，封装倒计时、抖动及开信状态
function CapsuleEnvelope({ capsule }: { capsule: TimeCapsule }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [shakeMsg, setShakeMsg] = useState<string | null>(null);

  // 1. 倒计时效果
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!capsule.openDate) return;
      const dateOnly = capsule.openDate.split(" ")[0].split("T")[0];
      const targetTime = new Date(dateOnly).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setIsLocked(false);
        setTimeLeft(null);
        return;
      }

      setIsLocked(true);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ d, h, m, s });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [capsule.openDate]);

  // 2. 物理抖动与物理提示（若未到期且无解锁密码则拦截，否则允许弹窗）
  const handleEnvelopeClick = () => {
    if (isLocked && !capsule.bypassCode) {
      const el = cardRef.current;
      if (el) {
        gsap.fromTo(
          el,
          { x: 0 },
          {
            x: 8,
            duration: 0.08,
            repeat: 5,
            yoyo: true,
            ease: "sine.inOut",
            onComplete: () => {
              gsap.set(el, { x: 0 });
            }
          }
        );
      }

      setShakeMsg("时间未到，不可偷看哦");
      setTimeout(() => setShakeMsg(null), 2500);
    } else {
      setShowModal(true);
    }
  };

  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  const mappedLetter = {
    id: String(capsule.id),
    title: capsule.title,
    targetDate: capsule.openDate || "",
    bypassCode: capsule.bypassCode || "",
    prompt: capsule.prompt || `致未来的我们：这是一封密封的时光信件。`,
    content: capsule.content || ""
  };

  return (
    <>
      <div
        ref={cardRef}
        onClick={handleEnvelopeClick}
        className={`relative overflow-hidden border rounded-2xl p-6 flex flex-col justify-between h-[210px] cursor-pointer select-none transition-all duration-300 ${
          isLocked && !unlockedIds.includes(String(capsule.id))
            ? "bg-amber-950/5 dark:bg-charcoal/20 border-amber-900/10 dark:border-white/5 opacity-80"
            : "bg-amber-50/20 dark:bg-amber-950/5 border-amber-900/15 dark:border-amber-400/15 shadow-sm hover:shadow-md hover:scale-[1.01]"
        }`}
      >
        {/* 背景信封折痕纹理 */}
        <div className="absolute right-4 bottom-4 text-charcoal/[0.04] dark:text-cream/[0.04] pointer-events-none">
          <Mail className="w-32 h-32 stroke-[1]" />
        </div>

        {/* 顶部标签 */}
        <div className="flex justify-between items-center z-10">
          <span className="rounded-full border border-charcoal/10 px-2 py-0.5 text-[10px] font-semibold tone-muted dark:border-white/10">
            {capsule.sender} ➔ {capsule.receiver}
          </span>
          {isLocked && !unlockedIds.includes(String(capsule.id)) ? (
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[10px] font-mono font-semibold">
              <Lock className="w-3 h-3" />
              未解封
            </span>
          ) : (
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1 text-[10px] font-mono font-semibold">
              <Unlock className="w-3 h-3" />
              已解封
            </span>
          )}
        </div>

        {/* 中间标题 & 倒计时 */}
        <div className="my-4 z-10">
          <h3 className="line-clamp-1 text-lg font-semibold tracking-[-0.01em] text-charcoal dark:text-cream">
            {capsule.title}
          </h3>

          {/* 倒计时 */}
          {isLocked && !unlockedIds.includes(String(capsule.id)) && timeLeft ? (
            <div className="flex gap-2 items-center mt-3 font-mono">
              <div className="text-center">
                <span className="text-lg font-bold text-amber-950 dark:text-amber-200">{timeLeft.d}</span>
                <span className="text-[9px] text-charcoal/50 dark:text-cream/50 ml-0.5">天</span>
              </div>
              <span className="tone-faint text-xs">:</span>
              <div className="text-center">
                <span className="text-lg font-bold text-amber-950 dark:text-amber-200">{timeLeft.h}</span>
                <span className="text-[9px] text-charcoal/50 dark:text-cream/50 ml-0.5">时</span>
              </div>
              <span className="tone-faint text-xs">:</span>
              <div className="text-center">
                <span className="text-lg font-bold text-amber-950 dark:text-amber-200">{timeLeft.m}</span>
                <span className="text-[9px] text-charcoal/50 dark:text-cream/50 ml-0.5">分</span>
              </div>
              <span className="tone-faint text-xs">:</span>
              <div className="text-center">
                <span className="text-lg font-bold text-amber-950 dark:text-amber-200">{timeLeft.s}</span>
                <span className="text-[9px] text-charcoal/50 dark:text-cream/50 ml-0.5">秒</span>
              </div>
            </div>
          ) : !(isLocked && !unlockedIds.includes(String(capsule.id))) ? (
            <p className="text-xs text-green-700 dark:text-green-400 font-sans mt-3 flex items-center gap-1 font-semibold">
              <Unlock className="w-3.5 h-3.5" />
              该时光胶囊已解锁开启，点击拆阅信件。
            </p>
          ) : (
            <p className="text-xs tone-muted mt-3">信件正在尘封中...</p>
          )}
        </div>

        {/* 底部信息条 */}
        <div className="flex justify-between items-end border-t border-charcoal/5 dark:border-white/5 pt-3 z-10">
          <span className="text-[10px] font-mono tone-muted">
            密封于: {capsule.writeDate}
          </span>
          <span className="text-[10px] font-mono tone-muted flex items-center gap-0.5">
            解封日: {capsule.openDate}
            {!(isLocked && !unlockedIds.includes(String(capsule.id))) && <ArrowUpRight className="w-3 h-3 ml-0.5 text-amber-600 animate-pulse" />}
          </span>
        </div>

        {/* 抖动警告气泡 */}
        {shakeMsg && (
          <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/15 backdrop-blur-[2px] flex items-center justify-center z-20 transition-all duration-300">
            <span className="bg-red-600 text-white dark:bg-red-700 text-xs px-3 py-1.5 rounded-lg font-sans font-semibold tracking-wide shadow-md animate-bounce flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              {shakeMsg}
            </span>
          </div>
        )}
      </div>

      {/* 3D 沉浸式拆信弹窗 (Modal) */}
      {showModal && (
        <LetterModal
          letter={mappedLetter}
          onClose={() => setShowModal(false)}
          unlockedIds={unlockedIds}
          onUnlockSuccess={(id) => setUnlockedIds([...unlockedIds, id])}
        />
      )}
    </>
  );
}

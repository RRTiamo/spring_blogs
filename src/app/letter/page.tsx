"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { useSysConfig } from "@/hooks/useSysConfig";
import EnvelopeCard from "@/components/letter/EnvelopeCard";
import LetterModal from "@/components/letter/LetterModal";
import { getTimeLetterList } from "@/api/letter";

interface CapsuleLetter {
  id: string;
  title: string;
  targetDate: string; // ISO 日期
  bypassCode: string; // 绕过密码
  prompt: string; // 胶囊预告
  content: string; // 信件内容
  images?: string;
}

export default function LetterPage() {
  const { isPageEnabled, loading } = useSysConfig();
  const [letters, setLetters] = useState<CapsuleLetter[]>([]);
  const [activeLetter, setActiveLetter] = useState<CapsuleLetter | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const res = await getTimeLetterList();
        if (res.data?.code === 200) {
          const list = (res.data.data || []).map((item: any) => ({
            id: String(item.id),
            title: item.title,
            targetDate: item.targetDate,
            bypassCode: item.bypassCode || "",
            prompt: item.prompt || "",
            content: item.content || "",
            images: item.images || ""
          }));
          setLetters(list);
        }
      } catch (err) {
        console.error("Failed to fetch letters", err);
      }
    };
    fetchLetters();
  }, []);

  if (!loading && !isPageEnabled("page.letter.enable", true)) {
    notFound();
    return null;
  }

  const handleOpenLetter = (letter: CapsuleLetter) => {
    setActiveLetter(letter);
  };

  const handleUnlockSuccess = (id: string) => {
    setUnlockedIds([...unlockedIds, id]);
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-24 md:py-32 relative">
      
      {/* 3D 书桌皮质/木质档案垫板容器 */}
      <div className="relative bg-cream border border-charcoal/10 rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_-20px_rgba(23,33,27,0.3)] overflow-hidden">
        
        {/* 精致拟真黄铜回形针 (Paper Clip) - 别在信笺的左上角 */}
        <div className="absolute top-8 left-8 w-6 h-14 border-2 border-[#D4AF37]/50 rounded-full pointer-events-none rotate-[25deg] z-20 shadow-[2px_4px_6px_rgba(0,0,0,0.15)] flex justify-center">
          {/* 回形针内折叠金属环 */}
          <div className="absolute top-2 w-3.5 h-10 border border-[#D4AF37]/60 rounded-full" />
          {/* 回形针最内层回环 */}
          <div className="absolute top-4 w-2 h-7 border border-[#D4AF37]/50 rounded-full" />
        </div>

        {/* 右上角精致信箱标签印花 */}
        <div className="absolute top-8 right-8 font-mono text-[8px] tracking-widest text-[#B5A891]/40 dark:text-white/20 uppercase pointer-events-none select-none text-right hidden sm:block">
          <span>SPRING TIME-BOX</span>
          <br />
          <span>EST. 2026.06</span>
        </div>

        {/* 栏目头部 */}
        <div className="border-b border-charcoal/10 dark:border-white/10 pb-10 mb-12 relative pl-8">
          <span className="text-[10px] font-sans font-semibold tracking-widest text-charcoal/40 uppercase">
            08 / Time Capsule
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal dark:text-cream mt-2 tracking-wide">
            Letter / 岁月信箱
          </h1>
          <p className="font-sans text-xs text-charcoal/50 tracking-wider mt-2.5 max-w-[60ch] leading-relaxed">
            投递给未来自己的时光胶囊。它们静静沉睡于「春风不解别离」逻辑舱中，将在倒计时归零时解封开启，亦可输入对应的时空秘钥提前唤醒阅读。
          </p>
        </div>

        {/* 实体信卡列表 - 采用符合网格的 2 列排列 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10 px-2">
          {letters.map((letter) => (
            <EnvelopeCard
              key={letter.id}
              letter={letter}
              unlockedIds={unlockedIds}
              onClick={() => handleOpenLetter(letter)}
            />
          ))}
        </div>
      </div>

      {/* 模块化信件查看弹窗 */}
      <LetterModal
        letter={activeLetter}
        onClose={() => setActiveLetter(null)}
        unlockedIds={unlockedIds}
        onUnlockSuccess={handleUnlockSuccess}
      />
    </div>
  );
}

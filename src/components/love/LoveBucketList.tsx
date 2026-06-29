"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { BucketItem } from "@/interface/love";
import { Check, Heart, Smile, Plane, Utensils, Home, Compass } from "lucide-react";

interface LoveBucketListProps {
  items: BucketItem[];
}

export default function LoveBucketList({ items }: LoveBucketListProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const categories = [
    { key: "all", label: "全部清单" },
    { key: "travel", label: "携手旅行" },
    { key: "food", label: "浪漫美食" },
    { key: "daily", label: "生活日常" },
    { key: "adventure", label: "共同冒险" }
  ];

  // 过滤
  const filteredItems = items.filter(
    (item) => activeFilter === "all" || item.category === activeFilter
  );

  // 统计
  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full py-12 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
      {/* 头部进度信息 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 border-b border-charcoal/5 dark:border-white/5 pb-8">
        <div>
          <span className="text-sm font-semibold text-gold">
            慢慢完成的约定
          </span>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-charcoal dark:text-cream">
            爱的 100 件事
          </h2>
          <p className="text-sm tone-muted mt-2 font-sans">
            将对未来的期待写进清单，然后一件件，用温度与光影将它们逐一“点亮”。
          </p>
        </div>

        {/* 精美进度环看板 */}
        <div className="flex items-center gap-4 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-900/10 dark:border-amber-400/10 rounded-2xl p-4 sm:px-6 shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-amber-900/10 dark:text-amber-400/10"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - percent / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="text-amber-600 dark:text-amber-400 transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-sm font-mono font-bold text-amber-950 dark:text-amber-100">
              {percent}%
            </span>
          </div>
          <div>
            <div className="text-xs tone-muted font-sans font-semibold">已点亮愿望</div>
            <div className="text-lg font-serif font-bold text-amber-950 dark:text-amber-100 mt-0.5">
              {completed} <span className="text-xs tone-muted">/ {total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 检索分类 Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveFilter(cat.key)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
              activeFilter === cat.key
                ? "bg-amber-600 dark:bg-amber-500 text-white shadow-sm"
                : "border border-charcoal/8 dark:border-white/10 hover:border-amber-600/50 hover:text-amber-600 tone-muted"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Bento Grid 卡片列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <BucketCard key={item.id} item={item} />
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-charcoal/10 dark:border-white/10 rounded-2xl tone-muted text-sm font-sans flex flex-col items-center justify-center">
            <Smile className="w-8 h-8 text-charcoal/20 dark:text-cream/20 mb-3" />
            该分类下还没有计划的愿望。
          </div>
        )}
      </div>
    </div>
  );
}

// 独立的单卡片组件，实现局部 Canvas 纸屑动效
function BucketCard({ item }: { item: BucketItem }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showThoughts, setShowThoughts] = useState(false);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "travel":
        return <Plane className="w-3 h-3" />;
      case "food":
        return <Utensils className="w-3 h-3" />;
      case "daily":
        return <Home className="w-3 h-3" />;
      case "adventure":
        return <Compass className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case "travel": return "旅行";
      case "food": return "美食";
      case "daily": return "日常";
      case "adventure": return "冒险";
      default: return cat;
    }
  };

  const fireConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const particles: any[] = [];
    const colors = ["#D97706", "#B45309", "#E11D48", "#F59E0B", "#059669", "#FBBF24"];

    // 创建喷发粒子
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height - 15,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 6 - 4,
        r: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.02
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        if (p.alpha > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.22; // 重力
          p.alpha -= p.decay;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(draw);
      }
    };
    draw();
  };

  const handleCardClick = () => {
    if (item.completed) {
      fireConfetti();
      if (item.thoughts || item.cover) {
        setShowThoughts(!showThoughts);
      }
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative overflow-hidden border rounded-2xl p-5 flex flex-col justify-between h-[180px] cursor-pointer select-none transition-all duration-300 ${
        item.completed
          ? "bg-amber-50/20 dark:bg-amber-950/5 border-amber-900/10 dark:border-amber-400/10 shadow-sm hover:shadow-md"
          : "bg-cream/40 dark:bg-charcoal/40 border-charcoal/8 dark:border-white/10 hover:border-charcoal/15 dark:hover:border-white/20 hover:scale-[1.02]"
      }`}
    >
      {/* 粒子 Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30" />

      {/* 正面卡片默认展示 */}
      {!showThoughts ? (
        <>
          <div className="flex justify-between items-start">
            <span className="flex items-center gap-1 rounded-full border border-charcoal/8 px-2 py-0.5 text-[10px] font-semibold tone-muted dark:border-white/10">
              {getCategoryIcon(item.category)}
              {getCategoryName(item.category)}
            </span>
            {item.completed && (
              <span className="text-amber-600 dark:text-amber-400 p-1 bg-amber-500/10 rounded-full">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            )}
          </div>

          <div className="mt-4 flex-1">
            <h3
              className={`text-base font-serif font-bold text-charcoal dark:text-cream leading-snug tracking-tight ${
                item.completed ? "line-through opacity-70" : ""
              }`}
            >
              {item.title}
            </h3>
          </div>

          {/* 底部已点亮信息 / 拟真 Completed 印章 */}
          <div className="mt-4 flex justify-between items-end border-t border-charcoal/5 dark:border-white/5 pt-3">
            {item.completed ? (
              <>
                <span className="text-[10px] font-mono font-semibold text-amber-800/60 dark:text-amber-400/60 leading-none">
                  {item.completedDate}
                </span>
                {/* 拟物斜印章印记 */}
                <div className="absolute bottom-2 right-3 pointer-events-none select-none rounded border-2 border-rose-500/30 px-1.5 py-0.5 text-[10px] font-bold text-rose-500/30 rotate-[-12deg] scale-90">
                  已点亮
                </div>
              </>
            ) : (
              <span className="text-[10px] font-sans tone-muted leading-none flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400 animate-pulse" />
                待打卡点亮
              </span>
            )}
          </div>
        </>
      ) : (
        /* 反面卡片展示想法回忆 */
        <div className="absolute inset-0 bg-amber-50 dark:bg-zinc-950 p-4 flex flex-col justify-between z-20 overflow-hidden animate-fade-in text-left">
          {item.cover ? (
            <div className="flex gap-3 h-full items-center">
              <div className="relative w-20 h-full rounded-lg overflow-hidden shrink-0 border border-charcoal/10 bg-black/5">
                <Image
                  src={item.cover}
                  alt={`${item.title} 的纪念照`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                <p className="text-xs leading-normal font-sans font-medium text-amber-950 dark:text-zinc-300 line-clamp-4 italic">
                  “{item.thoughts || "完成这件事的感动，都藏在合照里。"}”
                </p>
                <span className="text-[9px] font-mono text-amber-800/50 dark:text-zinc-500 block">
                  点亮日期: {item.completedDate}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full py-1">
              <p className="text-xs leading-relaxed font-sans font-medium text-amber-950 dark:text-zinc-300 italic whitespace-pre-line overflow-y-auto">
                “{item.thoughts}”
              </p>
              <span className="text-[9px] font-mono text-amber-800/50 dark:text-zinc-500 block mt-2 border-t border-amber-900/5 pt-1">
                点亮日期: {item.completedDate}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

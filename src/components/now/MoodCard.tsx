"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Smile } from "lucide-react";
import gsap from "gsap";

interface MoodData {
  title: string;
  status: string;
  desc: string;
  stats?: {
    focus: number;
    creative: number;
    calm: number;
    energy: number;
    social: number;
    physical: number;
  };
}

export default function MoodCard({ data }: { data?: MoodData }) {
  const title = data?.title || "Quiet / 静谧而专注";
  const status = data?.status || "Concentrating · Digital Detox";
  const desc = data?.desc || "屏蔽外界大部分杂乱信息，专注在编辑器逻辑与黑白暗房冲洗里，在日常生活的细微叙事中建立物理秩序。";
  
  // 提取配置数据，确保有默认值以进行向前兼容，且防止部分维度为 undefined / null / NaN
  const stats = useMemo(() => {
    const rawStats = data?.stats;
    return {
      focus: typeof rawStats?.focus === 'number' ? rawStats.focus : 85,
      creative: typeof rawStats?.creative === 'number' ? rawStats.creative : 75,
      calm: typeof rawStats?.calm === 'number' ? rawStats.calm : 90,
      energy: typeof rawStats?.energy === 'number' ? rawStats.energy : 60,
      social: typeof rawStats?.social === 'number' ? rawStats.social : 20,
      physical: typeof rawStats?.physical === 'number' ? rawStats.physical : 70,
    };
  }, [data?.stats]);

  const glowRef = useRef<HTMLDivElement>(null);

  // 用一个状态变量去渲染雷达图，让 GSAP 驱动其展开动画
  const [animatedStats, setAnimatedStats] = useState({
    focus: 0,
    creative: 0,
    calm: 0,
    energy: 0,
    social: 0,
    physical: 0
  });

  useEffect(() => {
    // 缓和的呼吸与发光脉动，以及雷达数值的优雅入场展开
    const ctx = gsap.context(() => {
      // 1. 发光气泡层动画
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { scale: 0.85, opacity: 0.5, x: -10, y: -5 },
          {
            scale: 1.15,
            opacity: 0.85,
            x: 10,
            y: 5,
            duration: 5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          }
        );
      }

      // 2. 雷达图维度数值过渡动画
      // 创建代理变量 targetObj 避免直接 Mutating React state
      const targetObj = {
        focus: 0,
        creative: 0,
        calm: 0,
        energy: 0,
        social: 0,
        physical: 0
      };

      gsap.to(targetObj, {
        focus: stats.focus,
        creative: stats.creative,
        calm: stats.calm,
        energy: stats.energy,
        social: stats.social,
        physical: stats.physical,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          setAnimatedStats({ ...targetObj });
        }
      });
    });

    return () => ctx.revert();
  }, [stats.focus, stats.creative, stats.calm, stats.energy, stats.social, stats.physical]); // 仅当具体数值发生改变时重新渲染动画，杜绝渲染无限循环

  // 极坐标转换辅助函数，中心点为 (60, 60)
  const getPoint = (value: number, angle: number, radius = 40) => {
    const r = radius * (value / 100);
    const rad = (angle * Math.PI) / 180;
    const x = 60 + r * Math.cos(rad);
    const y = 60 + r * Math.sin(rad);
    return { x, y };
  };

  // 生成雷达覆盖多边形的点
  const pointsStr = [
    getPoint(animatedStats.focus, -90),
    getPoint(animatedStats.creative, -30),
    getPoint(animatedStats.energy, 30),
    getPoint(animatedStats.physical, 90),
    getPoint(animatedStats.social, 150),
    getPoint(animatedStats.calm, 210)
  ].map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  // 背景六边形的顶点生成
  const getBgPointsStr = (level: number) => {
    return [
      getPoint(level, -90),
      getPoint(level, -30),
      getPoint(level, 30),
      getPoint(level, 90),
      getPoint(level, 150),
      getPoint(level, 210)
    ].map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  };

  const bgLevels = [25, 50, 75, 100];
  
  // 用于绘制顶点小圆点
  const vertices = [
    getPoint(animatedStats.focus, -90),
    getPoint(animatedStats.creative, -30),
    getPoint(animatedStats.energy, 30),
    getPoint(animatedStats.physical, 90),
    getPoint(animatedStats.social, 150),
    getPoint(animatedStats.calm, 210)
  ];

  return (
    <div className="relative overflow-hidden border border-charcoal/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-6 md:p-8 flex flex-col justify-between group hover:border-charcoal/30 dark:hover:border-white/30 transition-all duration-300 rounded-2xl shadow-sm min-h-[300px]">
      {/* 精致小角饰 */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-charcoal/30 dark:border-white/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-charcoal/30 dark:border-white/30" />

      {/* 动态发光心流气泡层 (z-0) */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center select-none overflow-hidden">
        <div
          ref={glowRef}
          className="w-40 h-40 rounded-full bg-radial from-amber-500/25 via-amber-200/5 to-transparent blur-3xl dark:from-amber-600/15 dark:via-amber-500/5"
          style={{ willChange: "transform, opacity" }}
        />
      </div>

      {/* 顶栏分类 */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 border border-charcoal/5 bg-cream-dark rounded-full shadow-sm">
            <Smile className="w-5 h-5 text-gold stroke-[1.25]" />
          </div>
          <span className="text-[10px] font-sans tracking-widest text-charcoal/40 dark:text-white/40 uppercase font-semibold">
            Mood / 精神状态
          </span>
        </div>

        {/* 呼吸率数值微标签 */}
        <div className="text-[8px] font-mono tracking-widest text-charcoal/35 dark:text-white/35 uppercase">
          Heart rate: 64 bpm
        </div>
      </div>

      {/* 视觉六边形雷达图中心图 */}
      <div className="relative my-4 h-36 flex items-center justify-center z-10">
        <svg className="w-36 h-36 text-charcoal dark:text-cream" viewBox="0 0 120 120">
          {/* 1. 背景多边形网格线 (25%, 50%, 75%, 100%) */}
          {bgLevels.map((lvl) => (
            <polygon
              key={lvl}
              points={getBgPointsStr(lvl)}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray={lvl === 100 ? "3 3" : "none"}
              className="opacity-20 dark:opacity-10"
            />
          ))}

          {/* 2. 辐射状轴线 */}
          {[-90, -30, 30, 90, 150, 210].map((angle, idx) => {
            const target = getPoint(100, angle);
            return (
              <line
                key={idx}
                x1="60"
                y1="60"
                x2={target.x}
                y2={target.y}
                stroke="currentColor"
                strokeWidth="0.5"
                className="opacity-20 dark:opacity-10"
              />
            );
          })}

          {/* 3. 数据覆盖区域多边形 */}
          <polygon
            points={pointsStr}
            fill="rgba(212,175,55,0.15)"
            stroke="rgb(212,175,55)"
            strokeWidth="1.25"
            className="transition-all duration-300 ease-out"
          />

          {/* 4. 数据顶点小圆点 */}
          {vertices.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="1.75"
              className="fill-gold stroke-white dark:stroke-charcoal stroke-[0.75]"
            />
          ))}

          {/* 5. 中心基准圆点 */}
          <circle cx="60" cy="60" r="1.5" className="fill-gold" />

          {/* 6. 指标文本标签 (双语，微缩设计) */}
          {/* FOCUS 专注 */}
          <text x="60" y="10" textAnchor="middle" className="text-[5px] font-mono tracking-widest fill-charcoal/50 dark:fill-white/50 uppercase">
            FOCUS / <tspan className="fill-gold dark:fill-gold/80 font-sans font-medium">专注</tspan>
          </text>
          {/* CREATIVE 创意 */}
          <text x="104" y="38" textAnchor="start" className="text-[5px] font-mono tracking-widest fill-charcoal/50 dark:fill-white/50 uppercase">
            CREATIVE / <tspan className="fill-gold dark:fill-gold/80 font-sans font-medium">创意</tspan>
          </text>
          {/* ENERGY 能量 */}
          <text x="104" y="86" textAnchor="start" className="text-[5px] font-mono tracking-widest fill-charcoal/50 dark:fill-white/50 uppercase">
            ENERGY / <tspan className="fill-gold dark:fill-gold/80 font-sans font-medium">能量</tspan>
          </text>
          {/* PHYSICAL 物理 */}
          <text x="60" y="115" textAnchor="middle" className="text-[5px] font-mono tracking-widest fill-charcoal/50 dark:fill-white/50 uppercase">
            PHYSICAL / <tspan className="fill-gold dark:fill-gold/80 font-sans font-medium">物理</tspan>
          </text>
          {/* SOCIAL 社交 */}
          <text x="16" y="86" textAnchor="end" className="text-[5px] font-mono tracking-widest fill-charcoal/50 dark:fill-white/50 uppercase">
            <tspan className="fill-gold dark:fill-gold/80 font-sans font-medium">社交</tspan> / SOCIAL
          </text>
          {/* CALM 平和 */}
          <text x="16" y="38" textAnchor="end" className="text-[5px] font-mono tracking-widest fill-charcoal/50 dark:fill-white/50 uppercase">
            <tspan className="fill-gold dark:fill-gold/80 font-sans font-medium">平和</tspan> / CALM
          </text>
        </svg>
      </div>

      {/* 底部详细描述 */}
      <div className="space-y-2 relative z-10">
        <h3 className="font-serif text-lg text-charcoal dark:text-cream font-medium tracking-wide">
          {title}
        </h3>
        <p className="text-[10px] font-mono tracking-widest text-gold/80 dark:text-gold/60 uppercase">
          {status}
        </p>
        <p className="text-xs md:text-sm font-sans font-light leading-relaxed text-charcoal/60 dark:text-white/70 tracking-wider">
          {desc}
        </p>
      </div>
    </div>
  );
}

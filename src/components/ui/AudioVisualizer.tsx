"use client";

import React from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  size?: "sm" | "md" | "lg";
  barCount?: number;
  className?: string;
}

/**
 * 🌊 动态音频 Equalizer 柱波浪组件
 * 参考 Apple Music / 网易云经典 4-6 柱圆角跳动频波
 * 当 isPlaying 为 true 时产生平滑振幅跃动，暂停时优雅平缓归底
 */
export default function AudioVisualizer({
  isPlaying,
  size = "md",
  barCount = 5,
  className = "",
}: AudioVisualizerProps) {
  // 根据 size 配置不同的柱体尺寸与间距
  const sizeStyles = {
    sm: {
      container: "h-4 gap-0.5 px-1",
      bar: "w-1",
      minHeight: "h-1",
    },
    md: {
      container: "h-7 gap-1 px-2",
      bar: "w-1.5",
      minHeight: "h-1.5",
    },
    lg: {
      container: "h-12 gap-1.5 px-3",
      bar: "w-2.5",
      minHeight: "h-2",
    },
  };

  const style = sizeStyles[size] || sizeStyles.md;

  // 生成指定数量柱子的随机动画延迟与振幅倍数
  const bars = Array.from({ length: barCount }, (_, i) => {
    const delay = (i * 150) % 600;
    const duration = 0.5 + (i % 3) * 0.25; // 0.5s - 1.0s
    return { id: i, delay, duration };
  });

  return (
    <div className={`flex items-end justify-center select-none ${style.container} ${className}`}>
      {bars.map((bar) => (
        <span
          key={bar.id}
          className={`rounded-full transition-all duration-300 ${style.bar} ${
            isPlaying
              ? "bg-[#E07A5F] dark:bg-[#F28482] shadow-[0_0_10px_rgba(224,122,95,0.5)]"
              : `bg-[#E07A5F]/40 dark:bg-[#F28482]/40 ${style.minHeight}`
          }`}
          style={{
            animation: isPlaying
              ? `equalizer-bounce ${bar.duration}s ease-in-out infinite alternate`
              : "none",
            animationDelay: `${bar.delay}ms`,
          }}
        />
      ))}

      {/* 动态均衡器 Keyframes 注入 */}
      <style jsx global>{`
        @keyframes equalizer-bounce {
          0% {
            height: 15%;
            opacity: 0.6;
          }
          30% {
            height: 85%;
            opacity: 1;
          }
          65% {
            height: 35%;
            opacity: 0.75;
          }
          100% {
            height: 100%;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

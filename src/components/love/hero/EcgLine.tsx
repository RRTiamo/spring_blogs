"use client";

import React from "react";

interface EcgLineProps {
  direction: "left" | "right";
}

export default function EcgLine({ direction }: EcgLineProps) {
  // 根据左右两侧方向，决定对应的路径、流光类名以及渐变色设置
  const isLeft = direction === "left";
  
  // QRS 经典心跳双峰路径定义（包含一个高度不同的小矮峰与一个大高峰）
  // 左侧（小矮峰在 X=45~53 处，大高峰在 X=60~71 处，靠近右侧爱心）
  // 右侧（大高峰在 X=29~40 处，小矮峰在 X=47~55 处，靠近左侧爱心）
  const pathData = isLeft
    ? "M 0 10 L 45 10 L 47 11 L 50 5 L 53 10 L 60 10 L 62 12 L 65 2 L 68 18 L 71 10 L 100 10"
    : "M 0 10 L 29 10 L 31 12 L 34 2 L 37 18 L 40 10 L 47 10 L 49 11 L 52 5 L 55 10 L 100 10";

  const flowClass = isLeft ? "ecg-flow-left" : "ecg-flow-right";
  const gradientId = isLeft ? "ecg-left-gradient" : "ecg-right-gradient";

  return (
    <svg
      className="pointer-events-none z-0 hidden h-7 min-w-0 flex-1 -mx-2 sm:block md:-mx-5 md:h-8"
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
    >
      {/* 底色暗淡心电图线 */}
      <path
        d={pathData}
        fill="transparent"
        stroke="currentColor"
        className="text-white/12 dark:text-white/8"
        strokeWidth="0.8"
      />
      {/* 动态流光线 (带呼吸方向) */}
      <path
        d={pathData}
        fill="transparent"
        stroke={`url(#${gradientId})`}
        className={flowClass}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        {isLeft ? (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fda4af" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="1" />
          </linearGradient>
        ) : (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="1" />
            <stop offset="100%" stopColor="#fda4af" stopOpacity="0.4" />
          </linearGradient>
        )}
      </defs>
    </svg>
  );
}

"use client";

import React, { useState } from "react";

interface PlayerProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  formatTime: (seconds: number) => string;
  hasTrack?: boolean;
}

export default function PlayerProgressBar({
  currentTime,
  duration,
  onSeek,
  formatTime,
  hasTrack = false,
}: PlayerProgressBarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPositionRatio, setHoverPositionRatio] = useState(0);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const calculateRatioFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    return x / rect.width;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const ratio = calculateRatioFromEvent(e);
    setHoverPositionRatio(ratio);
    if (duration > 0) {
      onSeek(ratio * duration);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ratio = calculateRatioFromEvent(e);
    setHoverPositionRatio(ratio);
    if (duration > 0) {
      setHoverTime(ratio * duration);
    }
    if (isDragging && duration > 0) {
      onSeek(ratio * duration);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoverTime(null);
      }}
      className="absolute top-0 left-0 right-0 h-3.5 flex items-start cursor-pointer group z-20"
      title="点击或拖动调整播放进度"
    >
      {/* 局部裁剪容器：高度与大圆角半径一致 (24px/h-6)，利用 rounded-t-3xl 与 overflow-hidden 完美截断溢出圆弧的直角轨道 */}
      <div className="absolute top-0 left-0 right-0 h-6 overflow-hidden rounded-t-3xl pointer-events-none w-full">
        {/* 实际的进度条轨道 */}
        <div className="w-full h-1 bg-(--fg-color)/15 transition-all duration-200 group-hover:h-2 relative">
          <div
            className="h-full bg-(--accent-color) transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 进度条控制圆点：脱离 overflow-hidden 轨道层放置，以防边界剪裁 */}
      {hasTrack && (
        <div
          className="absolute size-3.5 rounded-full bg-white border-2 border-(--accent-color) shadow-md animate-in zoom-in duration-150 z-30 pointer-events-none"
          style={{
            left: `calc(7px + ${progressPercent} * (100% - 14px) / 100)`,
            top: isHovered ? "4px" : "2px",
            transform: "translate(-50%, -50%)"
          }}
        />
      )}

      {isHovered && hoverTime !== null && (
        <div
          className="absolute top-4 -translate-x-1/2 px-2 py-0.5 rounded-md bg-(--bg-dark-color) border border-(--border-line-color) text-[10px] font-mono text-(--fg-color) shadow-lg pointer-events-none z-30 animate-in fade-in duration-100"
          style={{ left: `${hoverPositionRatio * 100}%` }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
}

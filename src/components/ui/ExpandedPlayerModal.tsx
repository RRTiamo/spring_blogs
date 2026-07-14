"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Music2,
  ListMusic,
  Radio,
  Loader2,
  Heart,
} from "lucide-react";
import type { TrackDetail } from "@/interface/music";

const DefaultVinylCover = () => (
  <div className="size-full bg-radial from-[#22232a] to-[#0f1015] flex items-center justify-center relative shadow-inner select-none pointer-events-none">
    {/* 唱片的同心圆纹路 */}
    <div className="absolute inset-2 rounded-full border border-white/5" />
    <div className="absolute inset-5 rounded-full border border-white/5" />
    <div className="absolute inset-9 rounded-full border border-white/5" />
    {/* 红心胶心 */}
    <div className="size-10 rounded-full bg-rose-500 flex items-center justify-center shadow-xs">
      <Music2 className="w-5 h-5 text-white/80" />
    </div>
  </div>
);

export interface LyricLine {
  time: number;
  text: string;
  translation?: string;
}

function parseLyric(lrc?: string, tlrc?: string): LyricLine[] {
  if (!lrc && !tlrc) return [];

  const parseSingle = (content?: string) => {
    if (!content) return [];
    const lines = content.split("\n");
    const result: { time: number; text: string }[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
      const match = timeRegex.exec(line);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = parseInt(match[3], 10);
        const time = minutes * 60 + seconds + (milliseconds > 99 ? milliseconds / 1000 : milliseconds / 100);
        const text = line.replace(timeRegex, "").trim();
        if (text) {
          result.push({ time, text });
        }
      }
    }
    return result;
  };

  const mainLines = parseSingle(lrc);
  const transLines = parseSingle(tlrc);

  const resultMap = new Map<number, LyricLine>();

  for (const item of mainLines) {
    const key = Math.floor(item.time * 10) / 10;
    resultMap.set(key, { time: item.time, text: item.text });
  }

  for (const item of transLines) {
    const key = Math.floor(item.time * 10) / 10;
    const existing = resultMap.get(key);
    if (existing) {
      existing.translation = item.text;
    } else {
      resultMap.set(key, { time: item.time, text: item.text, translation: item.text });
    }
  }

  return Array.from(resultMap.values()).sort((a, b) => a.time - b.time);
}

interface ExpandedPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: TrackDetail;
  isPlaying: boolean;
  isResolvingTrack?: boolean;
  isLoadingAudio?: boolean;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  bgmVolume: number;
  isMuted: boolean;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  playMode: "sequence" | "repeat" | "shuffle";
  onCycleMode: () => void;
  formatTime: (seconds: number) => string;
  onOpenDrawer: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  brokenCovers?: Set<string>;
  playerMessage?: string;
  onMarkBrokenCover?: (id: string) => void;
  playlistLength?: number;
}

export default function ExpandedPlayerModal({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  isResolvingTrack = false,
  isLoadingAudio = false,
  onTogglePlay,
  onPlayNext,
  onPlayPrev,
  currentTime,
  duration,
  onSeek,
  bgmVolume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  playMode,
  onCycleMode,
  formatTime,
  onOpenDrawer,
  isFavorite = false,
  onToggleFavorite,
  brokenCovers,
  playerMessage,
  onMarkBrokenCover,
  playlistLength = 0,
}: ExpandedPlayerModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const lyricScrollRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLParagraphElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [localCoverFailed, setLocalCoverFailed] = React.useState(false);
  useEffect(() => {
    setLocalCoverFailed(false);
  }, [currentTrack?.id]);

  const lyricLines = useMemo(
    () => parseLyric(currentTrack?.lyric, currentTrack?.tlyric),
    [currentTrack?.lyric, currentTrack?.tlyric]
  );

  const activeIndex = useMemo(() => {
    if (lyricLines.length === 0) return -1;
    const index = lyricLines.findIndex((line) => line.time > currentTime);
    if (index === -1) return lyricLines.length - 1;
    return Math.max(0, index - 1);
  }, [currentTime, lyricLines]);

  // 滚动高亮歌词到视图中央
  useEffect(() => {
    if (activeLyricRef.current && lyricScrollRef.current) {
      const activeEl = activeLyricRef.current;
      const containerEl = lyricScrollRef.current;
      const top = activeEl.offsetTop - containerEl.offsetTop - containerEl.clientHeight / 2 + activeEl.clientHeight / 2;
      containerEl.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }, [activeIndex]);

  // GSAP 打开/收起动画
  useEffect(() => {
    if (!mounted) return;
    const backdrop = backdropRef.current;
    const card = cardRef.current;
    if (!backdrop || !card) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (isOpen) {
        gsap.set(backdrop, { display: "flex", autoAlpha: 0 });
        gsap.set(card, { scale: 0.95, y: 20, autoAlpha: 0 });

        gsap.to(backdrop, {
          autoAlpha: 1,
          duration: reduceMotion ? 0 : 0.3,
          ease: "power2.out",
        });

        gsap.to(card, {
          scale: 1,
          y: 0,
          autoAlpha: 1,
          duration: reduceMotion ? 0 : 0.4,
          ease: "back.out(1.2)",
        });
      } else {
        gsap.to(card, {
          scale: 0.95,
          y: 20,
          autoAlpha: 0,
          duration: reduceMotion ? 0 : 0.25,
          ease: "power2.in",
        });

        gsap.to(backdrop, {
          autoAlpha: 0,
          duration: reduceMotion ? 0 : 0.3,
          ease: "power2.in",
          onComplete: () => {
            if (backdrop) gsap.set(backdrop, { display: "none" });
          },
        });
      }
    });

    return () => ctx.revert();
  }, [isOpen, mounted]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const isLoading = isResolvingTrack || isLoadingAudio;
  const coverIsAvailable = Boolean(
    playlistLength > 0 &&
    currentTrack?.cover && 
    !brokenCovers?.has(currentTrack.id) && 
    !localCoverFailed
  );

  const modalContent = (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-200 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 transition-opacity"
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl h-[85vh] max-h-[750px] bg-(--bg-dark-color)/95 border border-(--border-line-color) rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-(--fg-color)/10 hover:bg-(--fg-color)/20 text-(--fg-color) transition-colors cursor-pointer"
          aria-label="关闭黑胶唱片大屏"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. 左侧：黑胶唱片与控制 */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full p-6 md:p-10 flex flex-col justify-between items-center border-b md:border-b-0 md:border-r border-(--border-line-color) relative">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-(--accent-color)/15 text-(--accent-color) border border-(--accent-color)/30">
              {currentTrack?.source || "netease"} 音源
            </span>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  isFavorite
                    ? "text-rose-500 bg-rose-500/10 hover:bg-rose-500/20"
                    : "text-(--fg-color)/50 hover:text-rose-500 hover:bg-(--fg-color)/10"
                }`}
                title={isFavorite ? "取消收藏" : "加入收藏"}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            )}
          </div>

          {/* 拟物黑胶唱片 */}
          <div className="relative my-auto size-48 sm:size-60 md:size-64 rounded-full bg-linear-to-tr from-zinc-900 via-zinc-800 to-zinc-950 p-3 shadow-2xl border-4 border-zinc-800 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />
            <div
              className={`relative size-full rounded-full overflow-hidden border-2 border-zinc-700/50 shadow-inner ${
                isPlaying ? "animate-spin-slow" : ""
              }`}
              style={{ animationPlayState: isPlaying ? "running" : "paused", willChange: "transform", transform: "translateZ(0)" }}
            >
              {coverIsAvailable ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="size-full object-cover"
                  onError={() => {
                    onMarkBrokenCover?.(currentTrack.id);
                    setLocalCoverFailed(true);
                  }}
                />
              ) : (
                <DefaultVinylCover />
              )}
            </div>
            <div className="absolute size-10 rounded-full bg-zinc-900 border-4 border-zinc-800 shadow-inner flex items-center justify-center pointer-events-none">
              <div className="size-3 rounded-full bg-zinc-950" />
            </div>
          </div>

          <div className="w-full text-center space-y-1 mt-2">
            <h3 className="text-lg md:text-xl font-bold text-(--fg-color) truncate px-4">
              {currentTrack?.title || "暂无歌曲播放"}
            </h3>
            <p className="text-xs md:text-sm text-(--fg-color)/60 truncate">
              {currentTrack?.artist || "未知歌手"} • {currentTrack?.album || "生活档案馆"}
            </p>
          </div>

          <div className="w-full space-y-1.5 my-3">
            <div className="w-full flex items-center gap-3 text-xs font-mono text-(--fg-color)/60">
              <span className="w-10 text-right shrink-0">{formatTime(currentTime)}</span>
              <div className="grow relative flex items-center group h-3 cursor-pointer">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => onSeek(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-(--fg-color)/20 rounded-lg appearance-none cursor-pointer accent-(--accent-color) focus:outline-none"
                />
              </div>
              <span className="w-10 shrink-0">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-between pt-2 px-2">
            <button
              type="button"
              onClick={onCycleMode}
              className="p-2 text-(--fg-color)/60 hover:text-(--fg-color) transition-colors cursor-pointer"
              title={playMode === "sequence" ? "顺序播放" : playMode === "repeat" ? "单曲循环" : "随机播放"}
            >
              {playMode === "sequence" && <Repeat className="w-4 h-4" />}
              {playMode === "repeat" && <Repeat1 className="w-4 h-4 text-(--accent-color)" />}
              {playMode === "shuffle" && <Shuffle className="w-4 h-4 text-(--accent-color)" />}
            </button>

            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={onPlayPrev}
                className="text-(--fg-color)/80 hover:text-(--fg-color) transition-transform active:scale-90 cursor-pointer"
                title="上一首"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button
                type="button"
                onClick={onTogglePlay}
                disabled={isLoading}
                className="w-13 h-13 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: "var(--accent-color, #E07A5F)" }}
                title={isPlaying ? "暂停" : "播放"}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={onPlayNext}
                className="text-(--fg-color)/80 hover:text-(--fg-color) transition-transform active:scale-90 cursor-pointer"
                title="下一首"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenDrawer}
              className="p-2 text-(--fg-color)/60 hover:text-(--fg-color) transition-colors cursor-pointer"
              title="打开播放列表与搜索"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. 右侧：独立流动歌词面板 */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full p-6 md:p-10 flex flex-col justify-between bg-(--fg-color)/2 relative">
          <div className="w-full pb-4 border-b border-(--border-line-color) flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-(--accent-color)" />
              <h4 className="font-bold text-sm text-(--fg-color)/80">
                歌词中心 <span className="text-[10px] font-normal text-(--fg-color)/40 ml-1">(点击歌词可跳转播放进度)</span>
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onToggleMute}
                className="text-(--fg-color)/60 hover:text-(--fg-color) cursor-pointer"
              >
                {isMuted || bgmVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : bgmVolume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-(--fg-color)/20 rounded-lg appearance-none cursor-pointer accent-(--accent-color) focus:outline-none"
              />
            </div>
          </div>

          <div
            ref={lyricScrollRef}
            className="w-full grow overflow-y-auto py-12 px-2 space-y-6 scrollbar-none transition-all overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
            style={{ scrollBehavior: "smooth" }}
          >
            {lyricLines.length > 0 ? (
              lyricLines.map((line, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={idx}
                    ref={isActive ? activeLyricRef : null}
                    onClick={() => onSeek(line.time)}
                    className={`transition-all duration-300 text-center leading-relaxed cursor-pointer select-none hover:scale-105 active:scale-95 ${
                      isActive
                        ? "text-xl md:text-2xl font-bold text-(--accent-color) scale-105 drop-shadow-[0_0_12px_rgba(224,122,95,0.4)]"
                        : "text-sm md:text-base text-(--fg-color)/40 hover:text-(--fg-color)/80"
                    }`}
                    title={`点击跳转至 ${formatTime(line.time)}`}
                  >
                    <p>{line.text}</p>
                    {line.translation && (
                      <p className={`text-xs md:text-sm mt-1 font-normal ${isActive ? "text-(--accent-color)/80" : "text-(--fg-color)/30"}`}>
                        {line.translation}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-(--fg-color)/40 space-y-2">
                <Radio className="w-10 h-10 stroke-1 opacity-40 animate-pulse" />
                <p className="text-sm font-mono">纯音乐 / 暂无歌词</p>
                <p className="text-xs text-(--fg-color)/30">
                  {currentTrack?.album || "生活档案馆 • 治愈听觉体验"}
                </p>
              </div>
            )}
          </div>

          <div className="w-full pt-3 text-center text-[11px] text-(--fg-color)/50 font-mono border-t border-(--border-line-color) shrink-0">
            {currentTrack?.title} - {currentTrack?.artist}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

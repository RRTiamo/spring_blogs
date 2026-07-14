"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { musicIcons } from "@/icon/music";
import type { PlaybackMode, TrackDetail } from "@/interface/music";
import RollingLyrics from "../RollingLyrics";
import PlayerProgressBar from "./PlayerProgressBar";

const {
  loading: LoadingIcon,
  next: NextIcon,
  pause: PauseIcon,
  play: PlayIcon,
  playlist: PlaylistIcon,
  previous: PreviousIcon,
  repeat: RepeatIcon,
  repeatOne: RepeatOneIcon,
  shuffle: ShuffleIcon,
  volume: VolumeIcon,
  volumeMuted: VolumeMutedIcon,
  lyrics: LyricsIcon,
  heart: HeartIcon,
  music: MusicIcon,
} = musicIcons;

interface PlayerCapsuleBarProps {
  currentTrack: TrackDetail;
  playlistLength: number;
  isPlaying: boolean;
  isResolvingTrack: boolean;
  playMode: PlaybackMode;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  brokenCovers: Set<string>;
  playerMessage: string;
  isFavorite: boolean;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onCycleMode: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleFavorite: () => void;
  onOpenDrawer: () => void;
  onOpenExpandedModal: () => void;
  onMarkBrokenCover: (id: string) => void;
  formatTime: (seconds: number) => string;
}

const DefaultVinylCover = ({ isPlaying = false }: { isPlaying?: boolean }) => (
  <div
    className="size-full bg-radial from-[#22232a] to-[#0f1015] flex items-center justify-center relative shadow-inner select-none pointer-events-none animate-spin-slow"
    style={{ animationPlayState: isPlaying ? "running" : "paused", willChange: "transform", transform: "translateZ(0)" }}
  >
    {/* 唱片的同心圆纹路 */}
    <div className="absolute inset-1 rounded-full border border-white/5" />
    <div className="absolute inset-2 rounded-full border border-white/5" />
    <div className="absolute inset-3 rounded-full border border-white/5" />
    {/* 红心胶心 */}
    <div className="size-3.5 rounded-full bg-rose-500 flex items-center justify-center shadow-xs">
      <MusicIcon size={8} className="text-white/80" />
    </div>
  </div>
);

export default function PlayerCapsuleBar({
  currentTrack,
  playlistLength,
  isPlaying,
  isResolvingTrack,
  playMode,
  currentTime,
  duration,
  volume,
  isMuted,
  brokenCovers,
  playerMessage,
  isFavorite,
  onTogglePlay,
  onPlayNext,
  onPlayPrev,
  onCycleMode,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleFavorite,
  onOpenDrawer,
  onOpenExpandedModal,
  onMarkBrokenCover,
  formatTime,
}: PlayerCapsuleBarProps) {
  const volumeContainerRef = useRef<HTMLDivElement | null>(null);
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localCoverFailed, setLocalCoverFailed] = useState(false);

  useEffect(() => {
    setLocalCoverFailed(false);
  }, [currentTrack?.id]);

  // 清除 5s 自动折叠倒计时
  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  }, []);

  // 启动 5s 自动折叠倒计时
  const startCollapseTimer = useCallback(() => {
    clearCollapseTimer();
    collapseTimerRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 5000);
  }, [clearCollapseTimer]);

  // 当鼠标悬浮到播放器：立刻唤醒展开
  const handleMouseEnterPlayer = () => {
    clearCollapseTimer();
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  // 当鼠标离开播放器：启动 5 秒失焦折叠倒计时
  const handleMouseLeavePlayer = () => {
    if (!isDraggingVolume) {
      startCollapseTimer();
    }
  };

  useEffect(() => {
    startCollapseTimer();
    return () => clearCollapseTimer();
  }, [startCollapseTimer, clearCollapseTimer]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (volumeContainerRef.current && !volumeContainerRef.current.contains(e.target as Node)) {
        if (!isDraggingVolume) {
          setShowVolumeSlider(false);
        }
      }
    };
    if (showVolumeSlider) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showVolumeSlider, isDraggingVolume]);

  const calculateVolumeFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    return x / rect.width;
  };

  const handleVolumePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingVolume(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const newVol = calculateVolumeFromEvent(e);
    onVolumeChange(newVol);
  };

  const handleVolumePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingVolume) {
      const newVol = calculateVolumeFromEvent(e);
      onVolumeChange(newVol);
    }
  };

  const handleVolumePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingVolume) {
      setIsDraggingVolume(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
      startCollapseTimer();
    }
  };

  const ModeIcon = playMode === "repeat" ? RepeatOneIcon : playMode === "shuffle" ? ShuffleIcon : RepeatIcon;
  const coverIsAvailable = Boolean(
    playlistLength > 0 &&
    currentTrack?.cover && 
    !brokenCovers.has(currentTrack.id) && 
    !localCoverFailed
  );
  const displayFallbackMessage = playerMessage || currentTrack.album || "等待一段声音开始";

  return (
    <div
      onMouseEnter={handleMouseEnterPlayer}
      onMouseLeave={handleMouseLeavePlayer}
      data-player-style="floating-drawer-dock"
      style={{
        transform: isCollapsed
          ? "translate(-50%, calc(100% - 24px))"
          : "translate(-50%, 0)",
      }}
      className={`fixed bottom-0 left-1/2 z-70 w-[calc(100%-2rem)] max-w-6xl backdrop-blur-2xl bg-(--bg-dark-color)/95 text-(--fg-color) border-t border-x border-(--border-line-color) shadow-[0_-12px_40px_rgba(0,0,0,0.3)] rounded-t-3xl px-5 pt-3 pb-3 transition-transform duration-500 cubic-bezier(0.16,1,0.3,1) select-none overflow-visible group/drawer ${
        isCollapsed ? "cursor-pointer hover:border-(--accent-color)/60" : ""
      }`}
      onClick={() => {
        if (isCollapsed) {
          setIsCollapsed(false);
          clearCollapseTimer();
        }
      }}
    >
      {/* 顶部微型的 Drawer 指示条 */}
      <div className="w-full pb-2 flex flex-col items-center shrink-0 cursor-pointer">
        <div className={`h-1 rounded-full transition-all duration-300 ${
          isCollapsed ? "w-16 bg-(--accent-color) animate-pulse" : "w-10 bg-(--fg-color)/20 group-hover/drawer:bg-(--fg-color)/40"
        }`} />
      </div>

      <PlayerProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
        formatTime={formatTime}
        hasTrack={playlistLength > 0}
      />

      <div className="flex items-center justify-between gap-3 pt-1">
        {/* 左侧：专辑封面与歌曲信息 */}
        <div className="flex items-center gap-3.5 min-w-0 grow md:grow-0">
          <button
            type="button"
            onClick={(e) => {
              if (isCollapsed) return;
              e.stopPropagation();
              onOpenExpandedModal();
            }}
            className="relative size-10 sm:size-11 shrink-0 rounded-full overflow-hidden border border-(--border-line-color) shadow-sm group cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title="打开沉浸式歌词大屏"
          >
            {coverIsAvailable ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.cover}
                alt={`${currentTrack.title} 封面`}
                className="size-full object-cover animate-spin-slow"
                style={{ animationPlayState: isPlaying ? "running" : "paused", willChange: "transform", transform: "translateZ(0)" }}
                onError={() => {
                  onMarkBrokenCover(currentTrack.id);
                  setLocalCoverFailed(true);
                }}
              />
            ) : (
              <DefaultVinylCover isPlaying={isPlaying} />
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <LyricsIcon size={14} weight="bold" />
            </div>
          </button>

          <div className="min-w-0 max-w-[260px] sm:max-w-md md:max-w-lg lg:max-w-xl">
            <div className="flex items-center gap-2 truncate">
              <p className="truncate text-xs sm:text-sm font-semibold text-(--fg-color) tracking-tight">
                {playlistLength > 0 ? currentTrack.title : "暂无歌曲播放"}
              </p>
              {playlistLength > 0 && (
                <span className="hidden sm:inline text-[10px] text-(--fg-color)/60 truncate">
                  • {currentTrack.artist}
                </span>
              )}
            </div>
            <div className="text-[11px] sm:text-xs text-(--fg-color)/70 mt-0.5 truncate">
              {playlistLength > 0 ? (
                <RollingLyrics
                  lyric={currentTrack.lyric}
                  translatedLyric={currentTrack.tlyric}
                  currentTime={currentTime}
                  fallback={displayFallbackMessage}
                />
              ) : (
                <span className="text-[11px] text-(--fg-color)/40">开启您的音乐生活档案</span>
              )}
            </div>
          </div>
        </div>

        {/* 中间：播放控制核心组 */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`grid size-8 place-items-center rounded-full transition-all active:scale-90 cursor-pointer ${
              isFavorite
                ? "text-rose-500 bg-rose-500/10 hover:bg-rose-500/20"
                : "text-(--fg-color)/60 hover:text-rose-500 hover:bg-(--fg-color)/10"
            }`}
            title={isFavorite ? "取消收藏" : "加入收藏"}
          >
            <HeartIcon size={16} weight={isFavorite ? "fill" : "regular"} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCycleMode();
            }}
            className={`hidden sm:grid size-8 place-items-center rounded-full transition-colors hover:bg-(--fg-color)/10 ${
              playMode === "sequence" ? "text-(--fg-color)/60" : "text-(--accent-color)"
            }`}
            title={playMode === "repeat" ? "单曲循环" : playMode === "shuffle" ? "随机播放" : "顺序播放"}
          >
            <ModeIcon size={16} weight="bold" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayPrev();
            }}
            className="grid size-8 sm:size-9 place-items-center rounded-full text-(--fg-color)/80 hover:text-(--fg-color) hover:bg-(--fg-color)/10 transition-all active:scale-90 cursor-pointer"
            title="上一首"
          >
            <PreviousIcon size={18} weight="fill" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            disabled={isResolvingTrack}
            className="grid size-9 sm:size-10 place-items-center rounded-full bg-(--accent-color) text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            title={isPlaying ? "暂停" : "播放"}
          >
            {isResolvingTrack ? (
              <LoadingIcon size={18} className="animate-spin" />
            ) : isPlaying ? (
              <PauseIcon size={18} weight="fill" />
            ) : (
              <PlayIcon size={18} weight="fill" className="translate-x-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayNext();
            }}
            className="grid size-8 sm:size-9 place-items-center rounded-full text-(--fg-color)/80 hover:text-(--fg-color) hover:bg-(--fg-color)/10 transition-all active:scale-90 cursor-pointer"
            title="下一首"
          >
            <NextIcon size={18} weight="fill" />
          </button>

          <span className="hidden lg:inline-block ml-1 font-mono text-[10px] text-(--fg-color)/60 shrink-0">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* 右侧：音量控制 & 播放队列（采用绝对定位向左连体平滑展开，绝对不挤压左侧操控按钮） */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            ref={volumeContainerRef}
            className="relative hidden md:block size-8 sm:size-9"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => {
              if (!isDraggingVolume) setShowVolumeSlider(false);
            }}
          >
            <div
              className={`absolute right-0 top-0 h-full flex flex-row-reverse items-center transition-all duration-300 ease-out z-20 backdrop-blur-md rounded-full bg-(--fg-color)/5 hover:bg-(--fg-color)/10 border border-(--border-line-color)/40 ${
                showVolumeSlider || isDraggingVolume
                  ? "w-40 sm:w-44 px-2.5 sm:px-3 shadow-lg bg-(--fg-color)/8 border-(--border-line-color)/60 overflow-visible"
                  : "w-8 sm:w-9 px-0 justify-center overflow-hidden"
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMuted) {
                    onToggleMute();
                  } else {
                    setShowVolumeSlider((prev) => !prev);
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onToggleMute();
                }}
                className="grid size-7 sm:size-8 place-items-center rounded-full text-(--fg-color)/70 hover:text-(--fg-color) transition-colors cursor-pointer shrink-0"
                title={isMuted ? "取消静音" : "调整音量 (双击静音)"}
              >
                {isMuted || volume === 0 ? <VolumeMutedIcon size={15} /> : <VolumeIcon size={15} />}
              </button>

              <div
                className={`flex items-center gap-2 grow min-w-0 transition-opacity duration-200 ${
                  showVolumeSlider || isDraggingVolume ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <span className="font-mono text-[9px] font-bold text-(--fg-color)/50 shrink-0 select-none">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>

                <div
                  onPointerDown={handleVolumePointerDown}
                  onPointerMove={handleVolumePointerMove}
                  onPointerUp={handleVolumePointerUp}
                  className="grow h-3 flex items-center cursor-pointer group/voltrack"
                  title={`音量: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                >
                  <div className="w-full h-1 bg-(--fg-color)/15 rounded-full group-hover/voltrack:h-1.5 transition-all relative">
                    <div
                      className="h-full bg-(--accent-color) rounded-full relative transition-all duration-75"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-2.5 rounded-full bg-white border border-(--accent-color) shadow-sm group-hover/voltrack:scale-125 transition-transform z-30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              if (isCollapsed) return;
              e.stopPropagation();
              onOpenDrawer();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-(--fg-color)/8 hover:bg-(--fg-color)/15 text-xs text-(--fg-color) font-medium transition-all border border-(--border-line-color) cursor-pointer"
            title="打开播放队列与搜索"
          >
            <PlaylistIcon size={15} weight="bold" />
            <span className="hidden sm:inline text-[11px]">队列 ({playlistLength})</span>
          </button>
        </div>
      </div>
    </div>
  );
}

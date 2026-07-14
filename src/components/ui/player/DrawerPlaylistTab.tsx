"use client";

import React, { useState, useEffect } from "react";
import { musicIcons } from "@/icon/music";
import type { TrackDetail } from "@/interface/music";
import AnimatedList from "../AnimatedList";

const {
  heart: HeartIcon,
  music: MusicIcon,
  trash: TrashIcon,
  waveform: WaveformIcon,
} = musicIcons;

interface DrawerPlaylistTabProps {
  playlist: TrackDetail[];
  currentIndex: number;
  isPlaying: boolean;
  isResolvingTrack: boolean;
  onSelectTrack: (index: number) => void;
  onRemoveTrack?: (index: number) => void;
  onToggleFavorite?: (track: TrackDetail) => void;
  isFavorite?: (track: TrackDetail) => boolean;
}

const DefaultVinylCover = () => (
  <div className="size-full bg-radial from-[#22232a] to-[#0f1015] flex items-center justify-center relative shadow-inner select-none pointer-events-none">
    {/* 唱片的同心圆纹路 */}
    <div className="absolute inset-1 rounded-full border border-white/5" />
    <div className="absolute inset-2 rounded-full border border-white/5" />
    <div className="absolute inset-3.5 rounded-full border border-white/5" />
    {/* 红心胶心 */}
    <div className="size-3 rounded-full bg-rose-500 flex items-center justify-center shadow-xs">
      <div className="size-1 rounded-full bg-black/60" />
    </div>
  </div>
);

const TrackCover = ({ coverUrl, title }: { coverUrl?: string; title: string }) => {
  const [hasError, setHasError] = useState(false);

  if (coverUrl && !hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverUrl}
        alt={title}
        className="size-full object-cover"
        onError={() => setHasError(true)}
      />
    );
  }

  return <DefaultVinylCover />;
};

export default function DrawerPlaylistTab({
  playlist,
  currentIndex,
  isPlaying,
  isResolvingTrack,
  onSelectTrack,
  onRemoveTrack,
  onToggleFavorite,
  isFavorite,
}: DrawerPlaylistTabProps) {
  const [visibleLimit, setVisibleLimit] = useState(25);
  const [showAll, setShowAll] = useState(false);

  // 折叠机制：打开时只展示当前播放歌曲的前 5 首到后面 visibleLimit 首，彻底免去大队列实例化 DOM 造成的卡顿
  const startIdx = showAll ? 0 : Math.max(0, currentIndex - 5);
  const visibleTracks = playlist.slice(startIdx, startIdx + visibleLimit);

  useEffect(() => {
    const relativeIndex = currentIndex - startIdx;
    if (relativeIndex >= visibleLimit) {
      setVisibleLimit(relativeIndex + 25);
    }
  }, [currentIndex, visibleLimit, startIdx]);

  const handlePlaylistScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 300) {
      if (visibleLimit < playlist.length - startIdx) {
        setVisibleLimit((prev) => Math.min(prev + 25, playlist.length - startIdx));
      }
    }
  };

  if (playlist.length === 0) {
    return (
      <div className="grow flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="size-12 rounded-full bg-(--fg-color)/4 border border-(--border-line-color)/30 flex items-center justify-center text-(--fg-color)/30">
          <MusicIcon size={22} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-(--fg-color)/60">暂无歌曲播放</p>
          <p className="text-[11px] text-(--fg-color)/40 leading-relaxed">
            您可以通过【在线搜索】或【歌单导入】来添加歌曲到播放队列
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grow min-h-0 flex flex-col gap-2">
      {startIdx > 0 && !showAll && (
        <div className="flex justify-center shrink-0 px-1">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="w-full py-2 rounded-2xl bg-(--fg-color)/4 hover:bg-(--fg-color)/8 border border-(--border-line-color)/40 text-center text-xs font-bold text-(--accent-color) transition-all cursor-pointer active:scale-99"
          >
            显示更早的 {startIdx} 首已播曲目
          </button>
        </div>
      )}
      <AnimatedList
        items={visibleTracks}
        showGradients={false}
        enableArrowNavigation={false}
        getItemKey={(track, index) => `${track.source}-${track.id}-${startIdx + index}`}
        onScroll={handlePlaylistScroll}
        renderItem={(track, index) => {
          const globalIndex = startIdx + index;
          const isCurrent = globalIndex === currentIndex;
          return (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (isResolvingTrack) return;
                onSelectTrack(globalIndex);
              }}
              className={`group relative z-10 flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left transition-colors duration-150 border ${
                isResolvingTrack ? "pointer-events-none opacity-60" : "cursor-pointer"
              } ${
                isCurrent
                  ? "bg-(--accent-color)/12 text-(--fg-color) font-medium border-(--accent-color)/35 shadow-sm"
                  : "bg-(--fg-color)/4 hover:bg-(--fg-color)/8 border-(--border-line-color)"
              }`}
            >
              <span className="w-5 text-center text-xs font-mono text-(--fg-color)/40 group-hover:text-(--fg-color)/70 shrink-0">
                {isCurrent ? (
                  <MusicIcon size={16} weight="fill" className="text-(--accent-color) mx-auto" />
                ) : (
                  String(globalIndex + 1).padStart(2, "0")
                )}
              </span>

              <div className="relative size-11 shrink-0 rounded-xl overflow-hidden bg-(--fg-color)/10 border border-(--border-line-color) shadow-sm">
                <TrackCover coverUrl={track.cover} title={track.title} />
              </div>

              <div className="min-w-0 grow">
                <div className="flex items-center gap-2">
                  <p className={`truncate text-sm ${isCurrent ? "text-(--fg-color) font-semibold" : "text-(--fg-color)/90"}`}>
                    {track.title}
                  </p>
                </div>
                <p className="truncate text-xs text-(--fg-color)/60 mt-0.5">
                  {track.artist} {track.album ? `• ${track.album}` : ""}
                </p>
              </div>

              {isCurrent && isPlaying && (
                <WaveformIcon size={18} className="shrink-0 text-(--accent-color) animate-pulse" />
              )}

              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(track);
                  }}
                  className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer border border-transparent ${
                    isFavorite?.(track)
                      ? "text-rose-500 bg-rose-500/10 border-rose-500/20"
                      : "opacity-0 group-hover:opacity-100 bg-(--fg-color)/6 text-(--fg-color)/50 hover:text-rose-500 hover:bg-rose-500/10"
                  }`}
                  title={isFavorite?.(track) ? "取消收藏" : "加入收藏"}
                >
                  <HeartIcon size={15} weight={isFavorite?.(track) ? "fill" : "regular"} />
                </button>
              )}

              {onRemoveTrack && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isResolvingTrack) return;
                    onRemoveTrack(globalIndex);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-(--fg-color)/6 text-(--fg-color)/50 hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0 cursor-pointer border border-transparent hover:border-red-500/20"
                  title="从播放队列中移除"
                >
                  <TrashIcon size={15} />
                </button>
              )}
            </div>
          );
        }}
      />
      {playlist.length > visibleLimit && (
        <div className="py-2 text-center text-[11px] text-(--fg-color)/50 font-mono shrink-0">
          已展现 {visibleLimit} / {playlist.length} 首 (向下滚动载入更多)
        </div>
      )}
    </div>
  );
}

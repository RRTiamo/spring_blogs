"use client";

import React, { useState } from "react";
import { musicIcons } from "@/icon/music";
import type { TrackDetail } from "@/interface/music";
import AnimatedList from "../AnimatedList";

const {
  heart: HeartIcon,
  play: PlayIcon,
} = musicIcons;

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

interface DrawerFavoritesTabProps {
  favorites: TrackDetail[];
  currentTrack: TrackDetail;
  isResolvingTrack: boolean;
  onPlayFavorites?: () => void;
  onClearFavorites?: () => void;
  onToggleFavorite?: (track: TrackDetail) => void;
  onPlayFavoriteTrack?: (track: TrackDetail) => void;
  onSwitchToSearch: () => void;
}

export default function DrawerFavoritesTab({
  favorites,
  currentTrack,
  isResolvingTrack,
  onPlayFavorites,
  onClearFavorites,
  onToggleFavorite,
  onPlayFavoriteTrack,
  onSwitchToSearch,
}: DrawerFavoritesTabProps) {
  return (
    <div className="grow min-h-0 flex flex-col space-y-3 overscroll-contain">
      {favorites.length > 0 ? (
        <>
          <div className="flex items-center justify-between px-1 py-1 shrink-0 text-xs">
            <span className="text-(--fg-color)/60 font-medium">
              共收藏 <strong className="text-(--accent-color)">{favorites.length}</strong> 首曲目
            </span>
            <div className="flex items-center gap-2">
              {onPlayFavorites && (
                <button
                  type="button"
                  onClick={onPlayFavorites}
                  className="px-3 py-1 rounded-xl bg-(--accent-color) text-white font-semibold flex items-center gap-1 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <PlayIcon size={13} weight="fill" />
                  <span>全部播放</span>
                </button>
              )}
              {onClearFavorites && (
                <button
                  type="button"
                  onClick={onClearFavorites}
                  className="px-3 py-1 rounded-xl bg-(--fg-color)/6 hover:bg-red-500/10 text-(--fg-color)/60 hover:text-red-500 font-medium transition-all cursor-pointer border border-(--border-line-color) hover:border-red-500/20"
                >
                  清空收藏
                </button>
              )}
            </div>
          </div>

          <AnimatedList
            items={favorites}
            showGradients={false}
            enableArrowNavigation={false}
            getItemKey={(track, index) => `fav-${track.source}-${track.id}-${index}`}
            renderItem={(track, index) => {
              const isCurrent = currentTrack.id === track.id && currentTrack.source === track.source;
              return (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isResolvingTrack) return;
                    onPlayFavoriteTrack?.(track);
                  }}
                  className={`group relative z-10 flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left transition-colors duration-150 border cursor-pointer ${
                    isCurrent
                      ? "bg-(--accent-color)/12 text-(--fg-color) font-medium border-(--accent-color)/35 shadow-sm"
                      : "bg-(--fg-color)/4 hover:bg-(--fg-color)/8 border-(--border-line-color)"
                  }`}
                >
                  <span className="w-5 text-center text-xs font-mono text-(--fg-color)/40 group-hover:text-(--fg-color)/70 shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="relative size-11 shrink-0 rounded-xl overflow-hidden bg-(--fg-color)/10 border border-(--border-line-color) shadow-sm">
                    <TrackCover coverUrl={track.cover} title={track.title} />
                  </div>

                  <div className="min-w-0 grow">
                    <p className={`truncate text-sm ${isCurrent ? "text-(--fg-color) font-semibold" : "text-(--fg-color)/90"}`}>
                      {track.title}
                    </p>
                    <p className="truncate text-xs text-(--fg-color)/60 mt-0.5">
                      {track.artist} {track.album ? `• ${track.album}` : ""}
                    </p>
                  </div>

                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track);
                      }}
                      className="p-2 rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all shrink-0 cursor-pointer border border-rose-500/20"
                      title="取消收藏"
                    >
                      <HeartIcon size={15} weight="fill" />
                    </button>
                  )}
                </div>
              );
            }}
          />
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
          <div className="size-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <HeartIcon size={32} weight="regular" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-(--fg-color)">暂无收藏歌曲</h4>
            <p className="text-xs text-(--fg-color)/50 mt-1">
              在播放队列或搜索列表中点击心形图标，将喜爱的声音加入私藏
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToSearch}
            className="px-4 py-2 rounded-2xl bg-(--accent-color) text-white text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer mt-2"
          >
            前往在线搜索
          </button>
        </div>
      )}
    </div>
  );
}

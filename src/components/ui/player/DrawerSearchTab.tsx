"use client";

import React, { useRef, useState, useEffect } from "react";
import { musicIcons } from "@/icon/music";
import type { ApiSearchResult, MusicSource, TrackDetail } from "@/interface/music";

const {
  caretDown: CaretDownIcon,
  heart: HeartIcon,
  loading: LoadingIcon,
  play: PlayIcon,
  radio: RadioIcon,
  search: SearchIcon,
} = musicIcons;

const SOURCE_OPTIONS: Array<{ label: string; value: MusicSource; color: string; badge: string }> = [
  { label: "网易云音乐", value: "netease", color: "bg-red-500/15 text-red-500 border-red-500/25", badge: "网易云" },
  { label: "酷我音乐", value: "kuwo", color: "bg-amber-500/15 text-amber-500 border-amber-500/25", badge: "酷我" },
  { label: "Bilibili", value: "bilibili", color: "bg-pink-500/15 text-pink-500 border-pink-500/25", badge: "Bilibili" },
  { label: "JOOX 音乐", value: "joox", color: "bg-teal-500/15 text-teal-500 border-teal-500/25", badge: "JOOX" },
];

interface DrawerSearchTabProps {
  selectedSource: MusicSource;
  onSourceChange: (source: MusicSource) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onExecuteSearch: () => void;
  isSearching: boolean;
  searchResults: ApiSearchResult[];
  searchMessage: string;
  onResolveAndPlay: (result: ApiSearchResult) => void;
  isResolvingTrack: boolean;
  onToggleFavorite?: (track: TrackDetail) => void;
  isFavorite?: (track: TrackDetail) => boolean;
}

export default function DrawerSearchTab({
  selectedSource,
  onSourceChange,
  searchQuery,
  onSearchQueryChange,
  onExecuteSearch,
  isSearching,
  searchResults,
  searchMessage,
  onResolveAndPlay,
  isResolvingTrack,
  onToggleFavorite,
  isFavorite,
}: DrawerSearchTabProps) {
  const [isSelectDropdownOpen, setIsSelectDropdownOpen] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isResolvingTrack) {
      setResolvingId(null);
    }
  }, [isResolvingTrack]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSelectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const activeSourceObj = SOURCE_OPTIONS.find((s) => s.value === selectedSource) || SOURCE_OPTIONS[0];

  return (
    <div className="flex flex-col h-full grow min-h-0 space-y-4">
      <div className="flex items-center gap-2 bg-(--fg-color)/6 p-2 rounded-2xl border border-(--border-line-color) shrink-0">
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsSelectDropdownOpen((open) => !open)}
            className="flex items-center gap-2 bg-(--bg-dark-color) text-(--fg-color) text-xs px-3 py-2 rounded-xl border border-(--border-line-color) shadow-sm hover:border-(--accent-color)/50 transition-all cursor-pointer font-medium"
          >
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${activeSourceObj.color}`}>
              {activeSourceObj.badge}
            </span>
            <span>{activeSourceObj.label}</span>
            <CaretDownIcon size={14} className={`text-(--fg-color)/50 transition-transform ${isSelectDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isSelectDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-44 rounded-2xl bg-(--bg-dark-color) border border-(--border-line-color) shadow-2xl z-50 p-1.5 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-150">
              {SOURCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSourceChange(opt.value);
                    setIsSelectDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    selectedSource === opt.value
                      ? "bg-(--accent-color)/15 text-(--accent-color) font-semibold"
                      : "text-(--fg-color)/70 hover:bg-(--fg-color)/8 hover:text-(--fg-color)"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${opt.color}`}>
                    {opt.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative grow flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onExecuteSearch();
            }}
            placeholder={`在 ${activeSourceObj.label} 检索在线歌曲/歌手/专辑...`}
            className="w-full bg-transparent px-3 py-1.5 text-xs text-(--fg-color) placeholder-(--fg-color)/40 focus:outline-hidden"
          />
        </div>

        <button
          type="button"
          onClick={onExecuteSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="px-4 py-2 rounded-xl bg-(--accent-color) text-white text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          {isSearching ? (
            <LoadingIcon size={15} className="animate-spin" />
          ) : (
            <>
              <SearchIcon size={14} weight="bold" />
              <span>搜索</span>
            </>
          )}
        </button>
      </div>

      <div className="grow min-h-0 overflow-y-auto space-y-2.5 pr-1 overscroll-contain">
        {searchMessage && (
          <p className="py-8 text-center text-xs text-(--fg-color)/60">{searchMessage}</p>
        )}

        {!searchMessage && searchResults.length === 0 && (
          <div className="flex h-52 flex-col items-center justify-center gap-3 text-center text-(--fg-color)/40">
            <RadioIcon size={36} className="opacity-40" />
            <p className="text-xs max-w-56 leading-relaxed">选择平台并输入名称，直接把喜欢的音乐添加到播放队列</p>
          </div>
        )}

        {searchResults.map((result) => {
          const isThisTrackResolving = isResolvingTrack && resolvingId === String(result.id);
          const searchTrackItem: TrackDetail = {
            id: String(result.id),
            title: result.name,
            artist: Array.isArray(result.artist) ? result.artist.join(" / ") : result.artist || "未知歌手",
            album: result.album || "",
            src: "",
            source: result.source,
            picId: result.pic_id,
            lyricId: result.lyric_id,
          };

          return (
            <div
              key={`${result.source}-${result.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isResolvingTrack) return;
                setResolvingId(String(result.id));
                onResolveAndPlay(result);
              }}
              className={`group relative z-10 flex items-center justify-between rounded-2xl px-4 py-3 border transition-all ${
                isThisTrackResolving
                  ? "bg-(--accent-color)/15 border-(--accent-color)/50 shadow-md pointer-events-none cursor-wait"
                  : isResolvingTrack
                  ? "pointer-events-none opacity-50 bg-(--fg-color)/4 border-(--border-line-color)"
                  : "bg-(--fg-color)/4 hover:bg-(--fg-color)/10 border-(--border-line-color) hover:border-(--accent-color)/40 cursor-pointer"
              }`}
            >
              <div className="min-w-0 grow pr-3">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-(--fg-color)/90 group-hover:text-(--fg-color)">
                    {result.name}
                  </p>
                </div>
                <p className="truncate text-xs text-(--fg-color)/60 mt-0.5">
                  {Array.isArray(result.artist) ? result.artist.join(" / ") : result.artist} {result.album ? `• ${result.album}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(searchTrackItem);
                    }}
                    className={`p-2 rounded-xl transition-all cursor-pointer border border-transparent ${
                      isFavorite?.(searchTrackItem)
                        ? "text-rose-500 bg-rose-500/10 border-rose-500/20"
                        : "opacity-0 group-hover:opacity-100 bg-(--fg-color)/6 text-(--fg-color)/50 hover:text-rose-500 hover:bg-rose-500/10"
                    }`}
                    title={isFavorite?.(searchTrackItem) ? "取消收藏" : "加入收藏"}
                  >
                    <HeartIcon size={15} weight={isFavorite?.(searchTrackItem) ? "fill" : "regular"} />
                  </button>
                )}

                <button
                  type="button"
                  disabled={isResolvingTrack}
                  className={`grid size-9 place-items-center rounded-xl transition-all shrink-0 shadow-sm ${
                    isThisTrackResolving
                      ? "bg-(--accent-color) text-white"
                      : "bg-(--fg-color)/10 text-(--fg-color)/80 group-hover:bg-(--accent-color) group-hover:text-white group-hover:scale-105 active:scale-95"
                  }`}
                  aria-label="播放这首歌"
                >
                  {isThisTrackResolving ? (
                    <LoadingIcon size={16} className="animate-spin text-white" />
                  ) : (
                    <PlayIcon size={15} weight="fill" className="translate-x-0.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

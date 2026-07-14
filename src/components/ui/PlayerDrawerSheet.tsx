"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { musicIcons } from "@/icon/music";
import type { ApiSearchResult, MusicSource, TrackDetail } from "@/interface/music";
import DrawerPlaylistTab from "./player/DrawerPlaylistTab";
import DrawerFavoritesTab from "./player/DrawerFavoritesTab";
import DrawerSearchTab from "./player/DrawerSearchTab";
import DrawerImportTab from "./player/DrawerImportTab";
import DrawerPlaylistsTab from "./player/DrawerPlaylistsTab";
import type { PlaylistFolder } from "@/hooks/usePlayerPlaylists";

const {
  close: CloseIcon,
  heart: HeartIcon,
  folder: FolderIcon,
  trash: TrashIcon,
} = musicIcons;

interface PlayerDrawerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: TrackDetail[];
  currentIndex: number;
  isPlaying: boolean;
  currentTrack: TrackDetail;
  onSelectTrack: (index: number) => void;
  onRemoveTrack?: (index: number) => void;
  onImportPlaylist?: (tracks: TrackDetail[], targetPlaylistId?: string) => void;
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
  favorites?: TrackDetail[];
  onToggleFavorite?: (track: TrackDetail) => void;
  onPlayFavorites?: () => void;
  onClearFavorites?: () => void;
  isFavorite?: (track: TrackDetail) => boolean;
  onPlayFavoriteTrack?: (track: TrackDetail) => void;

  // 我的歌单相关 props
  playlists?: PlaylistFolder[];
  createPlaylist?: (name: string, tracks?: TrackDetail[]) => string;
  renamePlaylist?: (id: string, name: string) => void;
  removePlaylist?: (id: string) => void;
  removeTrackFromPlaylist?: (playlistId: string, trackId: string, source: MusicSource) => void;
  addPlaylistToQueue?: (playlistId: string, append?: boolean) => void;
  playPlaylistTrack?: (track: TrackDetail) => void;
  onAddTrackToQueue?: (track: TrackDetail) => void;
  onClearPlaylist?: () => void;
}

export default function PlayerDrawerSheet({
  isOpen,
  onClose,
  playlist,
  currentIndex,
  isPlaying,
  currentTrack,
  onSelectTrack,
  onRemoveTrack,
  onImportPlaylist,
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
  favorites = [],
  onToggleFavorite,
  onPlayFavorites,
  onClearFavorites,
  isFavorite,
  onPlayFavoriteTrack,
  playlists = [],
  createPlaylist,
  renamePlaylist,
  removePlaylist,
  removeTrackFromPlaylist,
  addPlaylistToQueue,
  playPlaylistTrack,
  onAddTrackToQueue,
  onClearPlaylist,
}: PlayerDrawerSheetProps) {
  const [activeTab, setActiveTab] = useState<"playlist" | "favorites" | "playlists" | "search" | "import">("playlist");
  const [mounted, setMounted] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const backdrop = backdropRef.current;
    const drawer = drawerRef.current;
    if (!backdrop || !drawer) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (isOpen) {
        gsap.killTweensOf([backdrop, drawer]);
        gsap.set(backdrop, { display: "block", autoAlpha: 0 });
        gsap.set(drawer, { yPercent: 100, autoAlpha: 0 });

        gsap.to(backdrop, {
          autoAlpha: 1,
          duration: reduceMotion ? 0 : 0.3,
          ease: "power2.out",
          force3D: true,
        });

        gsap.to(drawer, {
          yPercent: 0,
          autoAlpha: 1,
          duration: reduceMotion ? 0 : 0.4,
          ease: "power3.out",
          force3D: true,
        });
      } else {
        gsap.killTweensOf([backdrop, drawer]);
        gsap.to(drawer, {
          yPercent: 100,
          autoAlpha: 0,
          duration: reduceMotion ? 0 : 0.3,
          ease: "power3.in",
          force3D: true,
        });

        gsap.to(backdrop, {
          autoAlpha: 0,
          duration: reduceMotion ? 0 : 0.25,
          ease: "power2.in",
          force3D: true,
          onComplete: () => {
            if (backdrop) gsap.set(backdrop, { display: "none" });
          },
        });
      }
    });

    return () => ctx.revert();
  }, [isOpen, mounted]);

  const content = (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-160 bg-black/50 select-none"
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-0 mx-auto w-[calc(100%-2rem)] max-w-6xl h-[78vh] max-h-[700px] rounded-t-3xl border-t border-x border-(--border-line-color) bg-(--bg-dark-color)/98 text-(--fg-color) shadow-[0_-20px_60px_rgba(0,0,0,0.4)] flex flex-col pointer-events-auto overflow-hidden"
        role="dialog"
        aria-label="播放队列与音乐搜索"
      >
        <div className="w-full pt-3 pb-1 flex flex-col items-center shrink-0">
          <div className="w-12 h-1 rounded-full bg-(--fg-color)/20" />
        </div>

        <header className="flex items-center justify-between border-b border-(--border-line-color) px-6 py-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-(--fg-color)/6 p-1 rounded-2xl border border-(--border-line-color)">
            <button
              type="button"
              onClick={() => setActiveTab("playlist")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "playlist"
                  ? "bg-(--accent-color) text-white shadow-md"
                  : "text-(--fg-color)/60 hover:text-(--fg-color)"
              }`}
            >
              播放队列 ({playlist.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("favorites")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "favorites"
                  ? "bg-(--accent-color) text-white shadow-md"
                  : "text-(--fg-color)/60 hover:text-(--fg-color)"
              }`}
            >
              <HeartIcon size={13} weight={activeTab === "favorites" ? "fill" : "regular"} className={activeTab === "favorites" ? "text-white" : "text-rose-400"} />
              <span>我的收藏 ({favorites.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("playlists")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "playlists"
                  ? "bg-(--accent-color) text-white shadow-md"
                  : "text-(--fg-color)/60 hover:text-(--fg-color)"
              }`}
            >
              <FolderIcon size={13} weight={activeTab === "playlists" ? "fill" : "regular"} className={activeTab === "playlists" ? "text-white" : "text-amber-400"} />
              <span>我的歌单 ({playlists.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("search")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "search"
                  ? "bg-(--accent-color) text-white shadow-md"
                  : "text-(--fg-color)/60 hover:text-(--fg-color)"
              }`}
            >
              在线搜索
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("import")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "import"
                  ? "bg-(--accent-color) text-white shadow-md"
                  : "text-(--fg-color)/60 hover:text-(--fg-color)"
              }`}
            >
              歌单导入
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full bg-(--fg-color)/6 text-(--fg-color)/70 transition-colors hover:bg-(--fg-color)/15 hover:text-(--fg-color) cursor-pointer"
            aria-label="关闭播放面板"
          >
            <CloseIcon size={18} weight="bold" />
          </button>
        </header>

        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-(--border-line-color)/40 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-(--fg-color)/40 shrink-0">●</span>
            <span className="text-xs font-semibold text-(--fg-color)/70 truncate">
              正在播放: {playlist.length > 0 && currentTrack ? `${currentTrack.title} - ${currentTrack.artist}` : "暂无歌曲播放"}
            </span>
          </div>

          {activeTab === "playlist" && playlist.length > 0 && onClearPlaylist && (
            <button
              type="button"
              onClick={onClearPlaylist}
              className="text-red-500 hover:text-red-600 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 active:scale-95 shrink-0 ml-4"
              title="一键清空整个播放队列"
            >
              <TrashIcon size={13} />
              <span>清空队列</span>
            </button>
          )}
        </div>

        <div className="grow min-h-0 flex flex-col p-6">
          {activeTab === "playlist" && (
            <DrawerPlaylistTab
              playlist={playlist}
              currentIndex={currentIndex}
              isPlaying={isPlaying}
              isResolvingTrack={isResolvingTrack}
              onSelectTrack={onSelectTrack}
              onRemoveTrack={onRemoveTrack}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite}
            />
          )}

          {activeTab === "favorites" && (
            <DrawerFavoritesTab
              favorites={favorites}
              currentTrack={currentTrack}
              isResolvingTrack={isResolvingTrack}
              onPlayFavorites={onPlayFavorites}
              onClearFavorites={onClearFavorites}
              onToggleFavorite={onToggleFavorite}
              onPlayFavoriteTrack={onPlayFavoriteTrack}
              onSwitchToSearch={() => setActiveTab("search")}
            />
          )}

          {activeTab === "playlists" && (
            <DrawerPlaylistsTab
              playlists={playlists}
              isPlaying={isPlaying}
              currentTrack={currentTrack}
              isResolvingTrack={isResolvingTrack}
              createPlaylist={createPlaylist || (() => "")}
              renamePlaylist={renamePlaylist || (() => {})}
              removePlaylist={removePlaylist || (() => {})}
              removeTrackFromPlaylist={removeTrackFromPlaylist || (() => {})}
              addPlaylistToQueue={addPlaylistToQueue || (() => {})}
              playPlaylistTrack={playPlaylistTrack || (() => {})}
              onAddTrackToQueue={onAddTrackToQueue}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
            />
          )}

          {activeTab === "search" && (
            <DrawerSearchTab
              selectedSource={selectedSource}
              onSourceChange={onSourceChange}
              searchQuery={searchQuery}
              onSearchQueryChange={onSearchQueryChange}
              onExecuteSearch={onExecuteSearch}
              isSearching={isSearching}
              searchResults={searchResults}
              searchMessage={searchMessage}
              onResolveAndPlay={onResolveAndPlay}
              isResolvingTrack={isResolvingTrack}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite}
            />
          )}

          {activeTab === "import" && (
            <DrawerImportTab
              selectedSource={selectedSource}
              onImportPlaylist={onImportPlaylist}
              playlists={playlists}
            />
          )}
        </div>
      </div>
    </div>
  );

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  return createPortal(content, document.body);
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { searchMusic } from "@/api/music";

import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { usePlayerFavorites } from "@/hooks/usePlayerFavorites";
import { usePlayerPlaylists } from "@/hooks/usePlayerPlaylists";

import PlayerToast from "./player/PlayerToast";
import PlayerCapsuleBar from "./player/PlayerCapsuleBar";
import PlayerDrawerSheet from "./PlayerDrawerSheet";
import ExpandedPlayerModal from "./ExpandedPlayerModal";
import type { ApiSearchResult, TrackDetail } from "@/interface/music";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

export default function ArchivePlayer() {
  const {
    playlist,
    setPlaylist,
    currentIndex,
    setCurrentIndex,
    currentTrack,
    isPlaying,
    setIsPlaying,
    playMode,
    currentTime,
    duration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    selectedSource,
    setSelectedSource,
    isResolvingTrack,
    playerMessage,
    brokenCovers,
    setBrokenCovers,
    toastMessage,
    setToastMessage,
    showToast,
    selectTrack,
    playNext,
    playPrevious,
    cycleMode,
    seek,
    removeTrack,
    resolveAndPlay,
  } = useAudioPlayer();

  const {
    favorites,
    isFavorite,
    toggleFavorite,
    playFavorites,
    clearFavorites,
    playFavoriteTrack,
  } = usePlayerFavorites({
    showToast,
    setPlaylist,
    setCurrentIndex,
    setIsPlaying,
  });

  const {
    playlists,
    createPlaylist,
    renamePlaylist,
    removePlaylist,
    addTracksToPlaylist,
    removeTrackFromPlaylist,
    handleTrackPlayback,
    addPlaylistToQueue,
    playPlaylistTrack,
  } = usePlayerPlaylists({
    setPlaylist,
    setCurrentIndex,
    setIsPlaying,
    showToast,
  });

  // 包裹原本的导入逻辑：导入歌曲时，支持导入到已有的指定文件夹或自动新建文件夹
  const handleImportPlaylistAndCreateFolder = useCallback(
    (importedTracks: TrackDetail[], targetPlaylistId?: string) => {
      // 根据目标文件夹选择决定是新建还是追加
      if (!targetPlaylistId || targetPlaylistId === "create_new") {
        const now = new Date();
        const dateStr = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        const folderName = `导入歌单 - ${dateStr}`;
        createPlaylist(folderName, importedTracks);
      } else {
        // 追加到指定已有歌单
        addTracksToPlaylist(targetPlaylistId, importedTracks);
      }
    },
    [createPlaylist, addTracksToPlaylist]
  );

  // 向当前播放队列追加单首曲目
  const handleAddTrackToQueue = useCallback(
    (track: TrackDetail) => {
      setPlaylist((prev) => {
        const exists = prev.some((t) => t.id === track.id && t.source === track.source);
        if (exists) {
          showToast(`《${track.title}》已在播放列表中`);
          return prev;
        }
        showToast(`已将《${track.title}》追加到播放队列`);
        return [...prev, track];
      });
    },
    [setPlaylist, showToast]
  );

  // 一键清空当前播放队列
  const handleClearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    showToast("播放队列已一键清空");
  }, [setPlaylist, setCurrentIndex, setIsPlaying, showToast]);

  // 当切歌或播放时，自动在后台产出海报并更新对应歌单的封面
  useEffect(() => {
    if (isPlaying && currentTrack) {
      void handleTrackPlayback(currentTrack);
    }
  }, [isPlaying, currentTrack?.id, currentTrack?.source, handleTrackPlayback]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApiSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const handleExecuteSearch = useCallback(async () => {
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true);
    setSearchMessage("正在全网检索曲目...");
    try {
      const results = await searchMusic(searchQuery, selectedSource, 15);
      setSearchResults(results);
      setSearchMessage(results.length === 0 ? "未检索到相关曲目，换个关键词试一试" : "");
    } catch {
      setSearchMessage("检索音乐服务异常，请稍后重试");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedSource, isSearching]);

  const handleMarkBrokenCover = useCallback((id: string) => {
    setBrokenCovers((prev) => new Set(prev).add(id));
  }, [setBrokenCovers]);

  return (
    <>
      <PlayerToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      <PlayerCapsuleBar
        currentTrack={currentTrack}
        playlistLength={playlist.length}
        isPlaying={isPlaying}
        isResolvingTrack={isResolvingTrack}
        playMode={playMode}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        brokenCovers={brokenCovers}
        playerMessage={playerMessage}
        isFavorite={isFavorite(currentTrack)}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onPlayNext={playNext}
        onPlayPrev={playPrevious}
        onCycleMode={cycleMode}
        onSeek={seek}
        onVolumeChange={setVolume}
        onToggleMute={() => setIsMuted((m) => !m)}
        onToggleFavorite={() => toggleFavorite(currentTrack)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenExpandedModal={() => setIsExpandedModalOpen(true)}
        onMarkBrokenCover={handleMarkBrokenCover}
        formatTime={formatTime}
      />

      <PlayerDrawerSheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        playlist={playlist}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        currentTrack={currentTrack}
        onSelectTrack={selectTrack}
        onRemoveTrack={removeTrack}
        onImportPlaylist={handleImportPlaylistAndCreateFolder}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onExecuteSearch={() => void handleExecuteSearch()}
        isSearching={isSearching}
        searchResults={searchResults}
        searchMessage={searchMessage}
        onResolveAndPlay={resolveAndPlay}
        isResolvingTrack={isResolvingTrack}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onPlayFavorites={playFavorites}
        onClearFavorites={clearFavorites}
        isFavorite={isFavorite}
        onPlayFavoriteTrack={playFavoriteTrack}
        playlists={playlists}
        createPlaylist={createPlaylist}
        renamePlaylist={renamePlaylist}
        removePlaylist={removePlaylist}
        removeTrackFromPlaylist={removeTrackFromPlaylist}
        addPlaylistToQueue={addPlaylistToQueue}
        playPlaylistTrack={playPlaylistTrack}
        onAddTrackToQueue={handleAddTrackToQueue}
        onClearPlaylist={handleClearPlaylist}
      />

      <ExpandedPlayerModal
        isOpen={isExpandedModalOpen}
        onClose={() => setIsExpandedModalOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        playMode={playMode}
        bgmVolume={volume}
        isMuted={isMuted}
        brokenCovers={brokenCovers}
        playerMessage={playerMessage}
        isResolvingTrack={isResolvingTrack}
        isFavorite={isFavorite(currentTrack)}
        onToggleFavorite={() => toggleFavorite(currentTrack)}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onPlayNext={playNext}
        onPlayPrev={playPrevious}
        onCycleMode={cycleMode}
        onSeek={seek}
        onVolumeChange={setVolume}
        onToggleMute={() => setIsMuted((m) => !m)}
        onOpenDrawer={() => {
          setIsExpandedModalOpen(false);
          setIsDrawerOpen(true);
        }}
        onMarkBrokenCover={handleMarkBrokenCover}
        playlistLength={playlist.length}
        formatTime={formatTime}
      />
    </>
  );
}

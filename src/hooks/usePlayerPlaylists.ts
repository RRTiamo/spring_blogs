"use client";

import { useCallback, useEffect, useState } from "react";
import type { TrackDetail, MusicSource } from "@/interface/music";
import { getTrackPoster } from "@/lib/poster";

export interface PlaylistFolder {
  id: string;
  name: string;
  cover?: string;
  tracks: TrackDetail[];
  createdAt: number;
}

interface UsePlayerPlaylistsOptions {
  setPlaylist: React.Dispatch<React.SetStateAction<TrackDetail[]>>;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: (msg: string) => void;
}

export function usePlayerPlaylists({
  setPlaylist,
  setCurrentIndex,
  setIsPlaying,
  showToast,
}: UsePlayerPlaylistsOptions) {
  const [playlists, setPlaylists] = useState<PlaylistFolder[]>([]);

  // 页面初始化：从 localStorage 恢复已保存的“我的歌单”
  useEffect(() => {
    try {
      const saved = localStorage.getItem("archive_player_playlists");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPlaylists(parsed);
        }
      }
    } catch {
      // 容错处理，忽略 storage 报错
    }
  }, []);

  // 内部辅助：更新状态并同步持久化
  const savePlaylists = (next: PlaylistFolder[]) => {
    setPlaylists(next);
    try {
      localStorage.setItem("archive_player_playlists", JSON.stringify(next));
    } catch {
      // 忽略存储溢出或禁用错误
    }
  };

  // 创建歌单
  const createPlaylist = useCallback((name: string, tracks: TrackDetail[] = []) => {
    const trimmedName = name.trim();
    if (!trimmedName) return "";
    const id = `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newFolder: PlaylistFolder = {
      id,
      name: trimmedName,
      tracks,
      createdAt: Date.now(),
    };
    savePlaylists([newFolder, ...playlists]);
    return id;
  }, [playlists]);

  // 重命名歌单
  const renamePlaylist = useCallback((id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const next = playlists.map(pl => pl.id === id ? { ...pl, name: trimmed } : pl);
    savePlaylists(next);
    showToast(`歌单已重命名为《${trimmed}》`);
  }, [playlists, showToast]);

  // 删除歌单
  const removePlaylist = useCallback((id: string) => {
    const target = playlists.find(pl => pl.id === id);
    if (!target) return;
    const next = playlists.filter(pl => pl.id !== id);
    savePlaylists(next);
    showToast(`已删除歌单《${target.name}》`);
  }, [playlists, showToast]);

  // 将歌曲加入歌单 (单独点播时手动收藏或者从播放队列挪入)
  const addTrackToPlaylist = useCallback((playlistId: string, track: TrackDetail) => {
    let success = false;
    const next = playlists.map(pl => {
      if (pl.id === playlistId) {
        const exists = pl.tracks.some(t => t.id === track.id && t.source === track.source);
        if (exists) {
          showToast(`《${track.title}》已在该歌单中`);
          return pl;
        }
        success = true;
        return { ...pl, tracks: [...pl.tracks, track] };
      }
      return pl;
    });
    if (success) {
      savePlaylists(next);
      const targetPl = playlists.find(p => p.id === playlistId);
      if (targetPl) {
        showToast(`已将《${track.title}》保存至歌单《${targetPl.name}》`);
      }
    }
  }, [playlists, showToast]);

  // 批量追加歌曲到某歌单（用于导入时直接追加到指定歌单，避免重复加入）
  const addTracksToPlaylist = useCallback((playlistId: string, tracksToImport: TrackDetail[]) => {
    let successCount = 0;
    const next = playlists.map(pl => {
      if (pl.id === playlistId) {
        const existingKeys = new Set(pl.tracks.map(t => `${t.source}-${t.id}`));
        const newTracks = tracksToImport.filter(t => !existingKeys.has(`${t.source}-${t.id}`));
        if (newTracks.length === 0) {
          showToast("导入的歌曲均已在目标歌单中");
          return pl;
        }
        successCount = newTracks.length;
        return { ...pl, tracks: [...pl.tracks, ...newTracks] };
      }
      return pl;
    });

    if (successCount > 0) {
      savePlaylists(next);
      const targetPl = playlists.find(p => p.id === playlistId);
      showToast(`已成功将 ${successCount} 首歌曲导入歌单《${targetPl?.name || ""}》`);
    }
  }, [playlists, showToast]);

  // 从特定歌单中移除一首歌
  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string, source: MusicSource) => {
    const next = playlists.map(pl => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          tracks: pl.tracks.filter(t => !(t.id === trackId && t.source === source))
        };
      }
      return pl;
    });
    savePlaylists(next);
    showToast("已从歌单中移除该歌曲");
  }, [playlists, showToast]);

  // 核心逻辑：播放一首歌曲时，如果是属于某些歌单，则异步生成海报并自动以此海报做封面
  const handleTrackPlayback = useCallback(async (track: TrackDetail) => {
    // 1. 先异步生成/获取歌曲的海报 Base64 字符串
    const posterUrl = await getTrackPoster(track);
    if (!posterUrl) return;

    // 2. 使用 setPlaylists 的函数式更新以解耦对外部 playlists 的依赖，彻底掐死 React 重新渲染的死循环
    setPlaylists((prev) => {
      // 检查当前是否有包含该歌曲的歌单，没有就不更新以避免无效重绘
      const hasMatched = prev.some(pl => 
        pl.tracks.some(t => t.id === track.id && t.source === track.source)
      );
      if (!hasMatched) return prev;

      let isChanged = false;
      const next = prev.map(pl => {
        if (pl.tracks.some(t => t.id === track.id && t.source === track.source)) {
          // 歌单封面固定逻辑：如果歌单已经拥有海报封面 (pl.cover 存在)，则保持原封面，不再随播放频繁切换
          if (pl.cover) return pl;
          isChanged = true;
          return { ...pl, cover: posterUrl };
        }
        return pl;
      });

      if (!isChanged) return prev;

      // 同步到 localStorage
      try {
        localStorage.setItem("archive_player_playlists", JSON.stringify(next));
      } catch {
        // ignore
      }

      return next;
    });
  }, [setPlaylists]);

  // 将歌单内的歌曲导入到播放队列
  const addPlaylistToQueue = useCallback((playlistId: string, append = true) => {
    const folder = playlists.find(pl => pl.id === playlistId);
    if (!folder || folder.tracks.length === 0) {
      showToast("该歌单中没有可播放的歌曲");
      return;
    }

    if (append) {
      // 追加模式：合并去重追加，防播放队列膨胀和卡顿
      setPlaylist(prev => {
        const existingIds = new Set(prev.map(t => `${t.source}-${t.id}`));
        const newTracks = folder.tracks.filter(t => !existingIds.has(`${t.source}-${t.id}`));
        if (newTracks.length === 0) {
          showToast("歌单曲目已全部在播放列表中");
          return prev;
        }
        showToast(`已成功将 ${newTracks.length} 首歌曲追加到播放队列`);
        return [...prev, ...newTracks];
      });
    } else {
      // 替换并播放模式
      setPlaylist(folder.tracks);
      setCurrentIndex(0);
      setIsPlaying(true);
      showToast(`已开始播放歌单《${folder.name}》`);
    }
  }, [playlists, setPlaylist, setCurrentIndex, setIsPlaying, showToast]);

  // 播放歌单里单首曲目
  const playPlaylistTrack = useCallback((track: TrackDetail) => {
    setPlaylist((prev) => {
      const idx = prev.findIndex((t) => t.id === track.id && t.source === track.source);
      if (idx >= 0) {
        setCurrentIndex(idx);
        return prev;
      }
      setCurrentIndex(0);
      return [track, ...prev];
    });
    setIsPlaying(true);
  }, [setCurrentIndex, setIsPlaying, setPlaylist]);

  return {
    playlists,
    createPlaylist,
    renamePlaylist,
    removePlaylist,
    addTrackToPlaylist,
    addTracksToPlaylist,
    removeTrackFromPlaylist,
    handleTrackPlayback,
    addPlaylistToQueue,
    playPlaylistTrack,
  };
}

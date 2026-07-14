"use client";

import { useCallback, useEffect, useState } from "react";
import type { TrackDetail } from "@/interface/music";

interface UsePlayerFavoritesOptions {
  showToast: (msg: string) => void;
  setPlaylist: React.Dispatch<React.SetStateAction<TrackDetail[]>>;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export function usePlayerFavorites({
  showToast,
  setPlaylist,
  setCurrentIndex,
  setIsPlaying,
}: UsePlayerFavoritesOptions) {
  const [favorites, setFavorites] = useState<TrackDetail[]>([]);

  // 页面初始化：从 localStorage 恢复收藏数据
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem("archive_player_favorites");
      if (savedFavs) {
        const parsedFavs = JSON.parse(savedFavs);
        if (Array.isArray(parsedFavs)) {
          setFavorites(parsedFavs);
        }
      }
    } catch {
      // ignore storage error
    }
  }, []);

  const isFavorite = useCallback(
    (track: TrackDetail) => favorites.some((f) => f.id === track.id && f.source === track.source),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (track: TrackDetail) => {
      let isAdding = false;
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === track.id && f.source === track.source);
        let nextFavs: TrackDetail[];
        if (exists) {
          nextFavs = prev.filter((f) => !(f.id === track.id && f.source === track.source));
          showToast(`已将《${track.title}》移出收藏`);
        } else {
          isAdding = true;
          nextFavs = [track, ...prev];
          showToast(`已成功收藏《${track.title}》`);
        }
        try {
          localStorage.setItem("archive_player_favorites", JSON.stringify(nextFavs));
        } catch {
          // ignore
        }
        return nextFavs;
      });

      if (isAdding && !track.cover) {
        const enrichFavoriteTrack = async () => {
          try {
            const { resolveTrackDetails } = await import("@/api/music");
            const searchResult = {
              id: track.id,
              name: track.title,
              artist: track.artist,
              album: track.album || "",
              pic_id: track.picId || track.id,
              lyric_id: track.lyricId || track.id,
              source: track.source,
            };
            const resolved = await resolveTrackDetails(searchResult);
            if (resolved && resolved.cover) {
              setFavorites((prev) => {
                const nextFavs = prev.map((f) => {
                  if (f.id === track.id && f.source === track.source) {
                    return {
                      ...f,
                      cover: resolved.cover,
                      src: resolved.src || f.src,
                      lyric: f.lyric || resolved.lyric,
                      tlyric: f.tlyric || resolved.tlyric,
                    };
                  }
                  return f;
                });
                try {
                  localStorage.setItem("archive_player_favorites", JSON.stringify(nextFavs));
                } catch {
                  // ignore
                }
                return nextFavs;
              });
            }
          } catch {
            // ignore
          }
        };
        void enrichFavoriteTrack();
      }
    },
    [showToast]
  );

  const playFavorites = useCallback(() => {
    if (favorites.length === 0) return;
    setPlaylist(favorites);
    setCurrentIndex(0);
    setIsPlaying(true);
    showToast("已开始播放我的收藏歌曲");
  }, [favorites, setPlaylist, setCurrentIndex, setIsPlaying, showToast]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    try {
      localStorage.removeItem("archive_player_favorites");
    } catch {
      // ignore
    }
    showToast("已清空我的收藏");
  }, [showToast]);

  const playFavoriteTrack = useCallback(
    (track: TrackDetail) => {
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
    },
    [setCurrentIndex, setIsPlaying, setPlaylist]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    playFavorites,
    clearFavorites,
    playFavoriteTrack,
  };
}

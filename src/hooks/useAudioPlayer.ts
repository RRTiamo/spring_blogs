"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiSearchResult, MusicSource, PlaybackMode, TrackDetail } from "@/interface/music";
import { resolveTrackDetails, searchMusic } from "@/api/music";
import { mockDefaultTracks } from "@/mock/music";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playlist, setPlaylist] = useState<TrackDetail[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState<PlaybackMode>("sequence");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.62);
  const [isMuted, setIsMuted] = useState(false);

  const [selectedSource, setSelectedSource] = useState<MusicSource>("netease");
  const [isResolvingTrack, setIsResolvingTrack] = useState(false);
  const [playerMessage, setPlayerMessage] = useState("");
  const [brokenCovers, setBrokenCovers] = useState<Set<string>>(() => new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 恢复进度相关 refs
  const initialPositionRef = useRef<number | null>(null);
  const hasRestoredPositionRef = useRef(false);
  const failingTrackIdsRef = useRef<Set<string>>(new Set());
  const enrichedTrackIdsRef = useRef<Set<string>>(new Set());
  const resolvedTrackSrcIdsRef = useRef<Set<string>>(new Set());

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  const currentTrack = playlist[currentIndex] || mockDefaultTracks[0];
  const currentTrackRef = useRef(currentTrack);
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // 换源重试错误处理
  const handleTrackError = useCallback(async () => {
    const track = currentTrackRef.current;
    if (!track || failingTrackIdsRef.current.has(`${track.id}-${track.source}`)) {
      setIsPlaying(false);
      const errMsg = "全网暂无可用的音频播放路径";
      setPlayerMessage(errMsg);
      showToast(errMsg);
      return;
    }

    failingTrackIdsRef.current.add(`${track.id}-${track.source}`);
    setPlayerMessage(`音轨播放异常，正在自动换源重试...`);

    const fallbackSources: MusicSource[] = (["netease", "kuwo", "bilibili"] as MusicSource[]).filter(
      (s) => s !== track.source
    );

    let resolvedTrack: TrackDetail | null = null;
    for (const src of fallbackSources) {
      try {
        const query = `${track.title} ${track.artist || ""}`.trim();
        const searchRes = await searchMusic(query, src, 1);
        if (searchRes.length > 0) {
          resolvedTrack = await resolveTrackDetails(searchRes[0]);
          if (resolvedTrack && resolvedTrack.src) {
            break;
          }
        }
      } catch {
        continue;
      }
    }

    if (resolvedTrack && resolvedTrack.src) {
      const mergedTrack: TrackDetail = {
        ...track,
        src: resolvedTrack.src,
        source: resolvedTrack.source,
        cover: track.cover || resolvedTrack.cover,
        lyric: track.lyric || resolvedTrack.lyric,
      };

      setPlaylist((prevList) =>
        prevList.map((t, idx) => (idx === currentIndex ? mergedTrack : t))
      );
      setPlayerMessage("");
      showToast(`已为您自动切换至可用音源`);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      const errMsg = "全网暂无可用的音频播放路径";
      setPlayerMessage(errMsg);
      showToast(errMsg);
    }
  }, [currentIndex, showToast]);

  // 页面初始化：从 localStorage 恢复记录、进度与状态
  useEffect(() => {
    try {
      const saved = localStorage.getItem("archive_player_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.playlist) && parsed.playlist.length > 0) {
          const hasInvalidCache = parsed.playlist.some(
            (t: TrackDetail) =>
              t.source === "joox" ||
              t.id === "1u41XhDyuTRZ_BFM_EVpdA==" ||
              t.id === "uPZirG1+JSxugKvPA7pyJQ=="
          );
          if (hasInvalidCache) {
            setPlaylist(mockDefaultTracks);
            setCurrentIndex(0);
          } else {
            setPlaylist(parsed.playlist);
          }
        }
        if (typeof parsed.currentIndex === "number") {
          setCurrentIndex(parsed.currentIndex);
        }
        if (parsed.selectedSource) {
          setSelectedSource(parsed.selectedSource);
        }
        if (typeof parsed.volume === "number") {
          setVolume(parsed.volume);
        }
        if (parsed.playMode) {
          setPlayMode(parsed.playMode);
        }
        if (typeof parsed.currentTime === "number" && parsed.currentTime > 0) {
          initialPositionRef.current = parsed.currentTime;
          setCurrentTime(parsed.currentTime);
        }
      }
    } catch {
      // ignore storage error
    }
  }, []);

  // 页面离开/刷新瞬间强行同步写入当前精确播放位置
  useEffect(() => {
    const saveCurrentStateImmediately = () => {
      try {
        const exactTime = audioRef.current?.currentTime || currentTime;
        if (!hasRestoredPositionRef.current && initialPositionRef.current !== null && exactTime === 0) {
          return;
        }
        localStorage.setItem(
          "archive_player_state",
          JSON.stringify({
            playlist,
            currentIndex,
            selectedSource,
            volume,
            playMode,
            currentTime: exactTime,
          })
        );
      } catch {
        // ignore storage error
      }
    };

    const handleUnload = () => {
      saveCurrentStateImmediately();
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [playlist, currentIndex, selectedSource, volume, playMode, currentTime]);

  // 状态变更时防抖保存播放数据到 localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const exactTime = audioRef.current?.currentTime || currentTime;
        if (!hasRestoredPositionRef.current && initialPositionRef.current !== null && exactTime === 0) {
          return;
        }
        localStorage.setItem(
          "archive_player_state",
          JSON.stringify({
            playlist,
            currentIndex,
            selectedSource,
            volume,
            playMode,
            currentTime: exactTime,
          })
        );
      } catch {
        // ignore storage error
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [playlist, currentIndex, selectedSource, volume, playMode, currentTime]);

  // 自动按需补全当前播放曲目的歌词与海报封面 (通过 enrichedTrackIdsRef 防并发/无限次网络请求)
  useEffect(() => {
    if (!currentTrack || isResolvingTrack) return;
    const trackId = `${currentTrack.source}-${currentTrack.id}`;
    if (enrichedTrackIdsRef.current.has(trackId)) return;

    const needCover = !currentTrack.cover || brokenCovers.has(currentTrack.id);
    const needLyric = !currentTrack.lyric;

    if (!needCover && !needLyric) {
      // 已经齐全，标为已补全，无需后续无谓执行
      enrichedTrackIdsRef.current.add(trackId);
      return;
    }

    let isSubscribed = true;
    // 标记为已启动补全流程，保证任何情况下都不会发起第二次关于该歌曲的补全请求
    enrichedTrackIdsRef.current.add(trackId);

    const enrichTrackDetails = async () => {
      try {
        const searchResult: ApiSearchResult = {
          id: currentTrack.id,
          name: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album || "",
          pic_id: currentTrack.picId || currentTrack.id,
          lyric_id: currentTrack.lyricId || currentTrack.id,
          source: currentTrack.source || "netease",
        };

        const resolved = await resolveTrackDetails(searchResult);
        if (!isSubscribed) return;

        if (resolved.cover || resolved.lyric) {
          setPlaylist((prevList) =>
            prevList.map((t, idx) => {
              if (idx === currentIndex) {
                return {
                  ...t,
                  cover: t.cover || resolved.cover,
                  lyric: t.lyric || resolved.lyric,
                  tlyric: t.tlyric || resolved.tlyric,
                };
              }
              return t;
            })
          );
        }
      } catch {
        // ignore background enrichment error
      }
    };

    void enrichTrackDetails();

    return () => {
      isSubscribed = false;
    };
  }, [currentTrack, currentIndex, isResolvingTrack, brokenCovers, setPlaylist]);

  // 自动解析当前无 src 资源曲目的流媒体路径
  useEffect(() => {
    if (!currentTrack || isResolvingTrack) return;
    if (currentTrack.src) return;

    const trackId = `${currentTrack.source}-${currentTrack.id}`;
    if (resolvedTrackSrcIdsRef.current.has(trackId)) return;

    let isSubscribed = true;
    setIsResolvingTrack(true);
    setPlayerMessage(`正在解析播放路径 (${currentTrack.source})...`);

    resolvedTrackSrcIdsRef.current.add(trackId);

    const resolveCurrentTrackSrc = async () => {
      const trySources: MusicSource[] = [
        currentTrack.source,
        ...(["netease", "kuwo", "bilibili"] as MusicSource[]).filter((s) => s !== currentTrack.source),
      ];

      let resolvedTrack: TrackDetail | null = null;

      for (const src of trySources) {
        try {
          if (src === currentTrack.source) {
            const searchResult: ApiSearchResult = {
              id: currentTrack.id,
              name: currentTrack.title,
              artist: currentTrack.artist,
              album: currentTrack.album || "",
              pic_id: currentTrack.picId || currentTrack.id,
              lyric_id: currentTrack.lyricId || currentTrack.id,
              source: currentTrack.source,
            };
            resolvedTrack = await resolveTrackDetails(searchResult);
          } else {
            const searchRes = await searchMusic(currentTrack.title, src, 1);
            if (searchRes.length > 0) {
              resolvedTrack = await resolveTrackDetails(searchRes[0]);
            }
          }
          if (resolvedTrack && resolvedTrack.src) {
            break;
          }
        } catch {
          continue;
        }
      }

      if (!isSubscribed) return;

      if (resolvedTrack && resolvedTrack.src) {
        setPlaylist((prevList) =>
          prevList.map((t, idx) => {
            if (idx === currentIndex) {
              return {
                ...t,
                src: resolvedTrack!.src,
                source: resolvedTrack!.source,
                cover: t.cover || resolvedTrack!.cover,
                lyric: t.lyric || resolvedTrack!.lyric,
                tlyric: t.tlyric || resolvedTrack!.tlyric,
              };
            }
            return t;
          })
        );
        setPlayerMessage("");
        setIsResolvingTrack(false);
      } else {
        showToast("全网暂无可用的播放路径，请尝试搜索其他曲目");
        setIsResolvingTrack(false);
        setPlayerMessage("");
        setIsPlaying(false);
      }
    };

    void resolveCurrentTrackSrc();

    return () => {
      isSubscribed = false;
      setIsResolvingTrack(false);
      setPlayerMessage("");
    };
  }, [currentTrack, currentIndex, isResolvingTrack, showToast, setIsPlaying]);

  // 切换/重新点播当前歌曲时，自动清除该歌曲已尝试解析的 Ref 标记缓存，使其拥有重新解析和播放的机会
  useEffect(() => {
    if (currentTrack) {
      const trackId = `${currentTrack.source}-${currentTrack.id}`;
      resolvedTrackSrcIdsRef.current.delete(trackId);
    }
  }, [currentTrack]);

  // 自动滚动裁剪/限流队列，确保播放队列长度始终恒定在 30 首，防止 DOM 卡顿
  useEffect(() => {
    if (playlist.length <= 30) return;

    const excessCount = playlist.length - 30; // 剔除超出 30 长度的部分

    // 优先从头部已播历史记录里进行滚动剔除，以保证接下来的待播曲目完整
    if (currentIndex >= excessCount) {
      setPlaylist((prev) => prev.slice(excessCount));
      setCurrentIndex((prev) => prev - excessCount);
    } else {
      const headToRemove = currentIndex;
      const tailToRemove = excessCount - headToRemove;
      setPlaylist((prev) => {
        const slicedHead = prev.slice(headToRemove);
        return slicedHead.slice(0, slicedHead.length - tailToRemove);
      });
      setCurrentIndex(0);
    }
  }, [playlist.length, currentIndex]);

  // 初始化 HTML5 Audio 实例
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.setAttribute("referrerpolicy", "no-referrer");
    audioRef.current = audio;

    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime || 0);
      }
    };
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const handleError = () => {
      void handleTrackError();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("error", handleError);
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, [handleTrackError]);

  // 音频源同步与延迟精确定位上次播放位置
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.src) return;

    const nextSource = new URL(currentTrack.src, window.location.origin).href;
    if (audio.src !== nextSource) {
      audio.src = nextSource;
      audio.load();
      if (!isResolvingTrack) {
        setPlayerMessage("");
      }
    }

    const applyRestoredPosition = () => {
      if (!hasRestoredPositionRef.current && initialPositionRef.current !== null && initialPositionRef.current > 0) {
        const targetTime = initialPositionRef.current;
        hasRestoredPositionRef.current = true;
        try {
          audio.currentTime = targetTime;
          setCurrentTime(targetTime);
        } catch {
          // ignore seek error
        }
      }
    };

    const handleReady = () => {
      applyRestoredPosition();
    };

    audio.addEventListener("canplay", handleReady, { once: true });
    audio.addEventListener("loadedmetadata", handleReady, { once: true });

    if (audio.readyState >= 1) {
      handleReady();
    }

    return () => {
      audio.removeEventListener("canplay", handleReady);
      audio.removeEventListener("loadedmetadata", handleReady);
    };
  }, [currentTrack, isResolvingTrack]);

  // 播放与暂停状态精确控制：响应 isPlaying 状态的变化，确保点击暂停按钮能瞬间无条件响应
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.src) return;

    let isSubscribed = true;

    if (isPlaying) {
      const attemptPlay = () => {
        if (!isSubscribed) return;
        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch((err: unknown) => {
            if (!isSubscribed) return;
            if (err instanceof Error) {
              if (err.name === "AbortError") return;
              if (err.name === "NotAllowedError") {
                setIsPlaying(false);
                const restorePos = initialPositionRef.current;
                if (restorePos && restorePos > 0) {
                  showToast(`已恢复至上次进度 (${formatTime(restorePos)})，点击播放继续`);
                } else {
                  showToast("浏览器阻止了自动播放，请手动点击播放按钮");
                }
                return;
              }
            }
            setIsPlaying(false);
          });
        }
      };

      if (audio.readyState >= 1) {
        attemptPlay();
      } else {
        const playWhenReady = () => {
          attemptPlay();
        };
        audio.addEventListener("canplay", playWhenReady, { once: true });
        return () => {
          audio.removeEventListener("canplay", playWhenReady);
        };
      }
    } else {
      audio.pause();
    }

    return () => {
      isSubscribed = false;
    };
  }, [isPlaying, currentTrack, showToast, setIsPlaying]);

  // 音量控制
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    if (playMode === "shuffle") {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentIndex((index) => (index + 1) % playlist.length);
    }
    setIsPlaying(true);
    setPlayerMessage("");
  }, [playMode, playlist.length]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;
    if ((audioRef.current?.currentTime || 0) > 4) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    setCurrentIndex((index) => (index - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
    setPlayerMessage("");
  }, [playlist.length]);

  const selectTrack = useCallback((index: number) => {
    if (!playlist[index]) return;
    setCurrentIndex(index);
    setIsPlaying(true);
    setPlayerMessage("");
  }, [playlist]);

  const cycleMode = useCallback(() => {
    setPlayMode((mode) => (mode === "sequence" ? "repeat" : mode === "repeat" ? "shuffle" : "sequence"));
  }, []);

  const seek = useCallback((time: number) => {
    const nextTime = Math.max(0, Math.min(time, duration || time));
    setCurrentTime(nextTime);
    if (audioRef.current) audioRef.current.currentTime = nextTime;
  }, [duration]);

  const removeTrack = useCallback(
    (indexToRemove: number) => {
      setPlaylist((tracks) => {
        const newPlaylist = tracks.filter((_, i) => i !== indexToRemove);
        if (newPlaylist.length === 0) {
          setCurrentIndex(0);
          setIsPlaying(false);
          setPlayerMessage("");
          return [];
        }
        if (indexToRemove < currentIndex) {
          setCurrentIndex((idx) => idx - 1);
        } else if (indexToRemove === currentIndex) {
          setCurrentIndex((idx) => (idx >= newPlaylist.length ? 0 : idx));
        }
        return newPlaylist;
      });
    },
    [currentIndex]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      if (playMode === "repeat") {
        audio.currentTime = 0;
        void audio.play();
        return;
      }
      playNext();
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playMode, playNext]);

  const resolveAndPlay = useCallback(
    async (result: ApiSearchResult) => {
      setIsResolvingTrack(true);
      setPlayerMessage(`正在获取音轨 (${result.source})...`);

      const trySources: MusicSource[] = [
        result.source,
        ...(["netease", "kuwo", "bilibili", "joox"] as MusicSource[]).filter((s) => s !== result.source),
      ];

      let resolvedTrack: TrackDetail | null = null;

      for (const src of trySources) {
        try {
          if (src === result.source) {
            resolvedTrack = await resolveTrackDetails(result);
          } else {
            setPlayerMessage(`原音轨暂不可用，正在尝试备用源 (${src})...`);
            const searchRes = await searchMusic(result.name, src, 1);
            if (searchRes.length > 0) {
              resolvedTrack = await resolveTrackDetails(searchRes[0]);
            }
          }
          if (resolvedTrack && resolvedTrack.src) {
            break;
          }
        } catch {
          continue;
        }
      }

      if (!resolvedTrack || !resolvedTrack.src) {
        showToast("全网暂无可用的播放路径，请尝试搜索其他曲目");
        setIsResolvingTrack(false);
        setPlayerMessage("");
        return;
      }

      setPlaylist((tracks) => [resolvedTrack!, ...tracks.filter((t) => t.id !== resolvedTrack!.id)]);
      setCurrentIndex(0);
      setIsPlaying(true);
      setIsResolvingTrack(false);
      setPlayerMessage("");
    },
    [showToast]
  );

  const handleImportPlaylist = useCallback(
    (importedTracks: TrackDetail[]) => {
      setPlaylist((prevList) => {
        const existingIds = new Set(prevList.map((t) => t.id));
        const newTracks = importedTracks.filter((t) => !existingIds.has(t.id));
        if (newTracks.length === 0) {
          showToast("歌单中的曲目已在播放列表中");
          return prevList;
        }
        showToast(`成功解析并导入 ${newTracks.length} 首歌单曲目！`);
        return [...prevList, ...newTracks];
      });
    },
    [showToast]
  );

  return {
    playlist,
    setPlaylist,
    currentIndex,
    setCurrentIndex,
    currentTrack,
    isPlaying,
    setIsPlaying,
    playMode,
    setPlayMode,
    currentTime,
    setCurrentTime,
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
    handleImportPlaylist,
  };
}

"use client";

import React, { useState, useRef } from "react";
import { musicIcons } from "@/icon/music";
import type { TrackDetail, MusicSource } from "@/interface/music";
import type { PlaylistFolder } from "@/hooks/usePlayerPlaylists";

const {
  music: MusicIcon,
  trash: TrashIcon,
  waveform: WaveformIcon,
  folder: FolderIcon,
  edit: EditIcon,
  plus: PlusIcon,
  play: PlayIcon,
  caretLeft: CaretLeftIcon,
  heart: HeartIcon,
} = musicIcons;

interface DrawerPlaylistsTabProps {
  playlists: PlaylistFolder[];
  isPlaying: boolean;
  currentTrack: TrackDetail;
  isResolvingTrack: boolean;
  createPlaylist: (name: string, tracks?: TrackDetail[]) => string;
  renamePlaylist: (id: string, name: string) => void;
  removePlaylist: (id: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string, source: MusicSource) => void;
  addPlaylistToQueue: (playlistId: string, append?: boolean) => void;
  playPlaylistTrack: (track: TrackDetail) => void;
  onAddTrackToQueue?: (track: TrackDetail) => void;
  isFavorite?: (track: TrackDetail) => boolean;
  onToggleFavorite?: (track: TrackDetail) => void;
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

export default function DrawerPlaylistsTab({
  playlists,
  isPlaying,
  currentTrack,
  isResolvingTrack,
  createPlaylist,
  renamePlaylist,
  removePlaylist,
  removeTrackFromPlaylist,
  addPlaylistToQueue,
  playPlaylistTrack,
  onAddTrackToQueue,
  isFavorite,
  onToggleFavorite,
}: DrawerPlaylistsTabProps) {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  
  // 自定义重命名 Modal 状态控制
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const pointerDownTargetRef = useRef<EventTarget | null>(null);
  
  // 用于视图切换：null 代表一级页面（歌单列表），有值代表二级页面（特定歌单详情页）
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  
  // 歌单详情页内曲目的分页，防单歌单过大卡顿
  const [visibleTracksLimit, setVisibleTracksLimit] = useState(25);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) return;
    createPlaylist(name);
    setNewPlaylistName("");
  };

  const handleRename = (folderId: string, currentName: string) => {
    setRenameTargetId(folderId);
    setRenameInput(currentName);
  };

  const handleFolderClick = (folderId: string) => {
    setActivePlaylistId(folderId);
    setVisibleTracksLimit(25); // 进入详情页时重置分页限制
  };

  const handleLoadMoreTracks = (maxLen: number) => {
    setVisibleTracksLimit((prev) => Math.min(prev + 25, maxLen));
  };

  // 渲染二级页面（歌单详情页）
  if (activePlaylistId !== null) {
    const folder = playlists.find(pl => pl.id === activePlaylistId);
    
    // 如果对应的文件夹不存在（比如被删除了），安全返回一级页面
    if (!folder) {
      setActivePlaylistId(null);
      return null;
    }

    const hasCover = Boolean(folder.cover);

    return (
      <div className="grow min-h-0 flex flex-col space-y-4 overflow-y-auto pr-1 overscroll-contain animate-in fade-in duration-200">
        {/* 顶部：返回导航与歌单信息 */}
        <div className="flex flex-col gap-3 shrink-0">
          <div>
            <button
              type="button"
              onClick={() => setActivePlaylistId(null)}
              className="flex items-center gap-1.5 text-xs text-(--fg-color)/70 hover:text-(--fg-color) transition-all cursor-pointer font-semibold py-1.5 px-3.5 rounded-xl bg-(--fg-color)/5 hover:bg-(--fg-color)/10 border border-(--border-line-color)/50 inline-flex"
            >
              <CaretLeftIcon size={14} weight="bold" />
              <span>返回歌单列表</span>
            </button>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl bg-(--fg-color)/4 border border-(--border-line-color)/60">
            {/* 歌单封面海报 */}
            <div className="relative size-20 sm:size-24 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 border border-(--border-line-color) shadow-md flex items-center justify-center text-white">
              {hasCover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={folder.cover}
                  alt={`${folder.name} 封面`}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center opacity-70">
                  <FolderIcon size={32} weight="fill" className="text-neutral-400" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between py-1 min-w-0 grow">
              <div className="min-w-0">
                <h3 className="font-bold text-base text-(--fg-color) truncate">
                  {folder.name}
                </h3>
                <p className="text-xs text-(--fg-color)/50 mt-1.5">
                  共 {folder.tracks.length} 首曲目 • 创建于 {new Date(folder.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* 详情页控制大按钮 */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => addPlaylistToQueue(folder.id, false)}
                  className="px-3.5 py-1.5 rounded-xl bg-(--accent-color) hover:bg-(--accent-color)/90 text-white shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  disabled={folder.tracks.length === 0}
                >
                  <PlayIcon size={13} weight="fill" />
                  <span>播放全部</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => addPlaylistToQueue(folder.id, true)}
                  className="px-3.5 py-1.5 rounded-xl bg-(--fg-color)/8 hover:bg-(--fg-color)/15 text-(--fg-color) transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-(--border-line-color)"
                  disabled={folder.tracks.length === 0}
                >
                  <PlusIcon size={13} weight="bold" />
                  <span>追加到队列</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 歌曲列表 (单独页面渲染，带分页防卡顿) */}
        <div className="grow min-h-0 space-y-1.5">
          {folder.tracks.length === 0 ? (
            <div className="text-center py-16 text-xs text-(--fg-color)/40 font-medium">
              歌单内暂无曲目，请在【在线搜索】或【歌单导入】中为歌单添加歌曲。
            </div>
          ) : (
            <div className="space-y-1.5">
              {folder.tracks.slice(0, visibleTracksLimit).map((track, idx) => {
                const isCurrent = currentTrack && currentTrack.id === track.id && currentTrack.source === track.source;
                
                return (
                  <div
                    key={`${track.source}-${track.id}-${idx}`}
                    onClick={() => {
                      if (isResolvingTrack) return;
                      playPlaylistTrack(track);
                    }}
                    className={`group relative flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-left transition-colors duration-150 border ${
                      isResolvingTrack ? "pointer-events-none opacity-60" : "cursor-pointer"
                    } ${
                      isCurrent
                        ? "bg-(--accent-color)/12 text-(--fg-color) font-medium border-(--accent-color)/30 shadow-xs"
                        : "bg-(--fg-color)/4 hover:bg-(--fg-color)/8 border-(--border-line-color)"
                    }`}
                  >
                    <span className="w-5 text-center text-xs font-mono text-(--fg-color)/40 group-hover:text-(--fg-color)/70 shrink-0">
                      {isCurrent ? (
                        <MusicIcon size={14} weight="fill" className="text-(--accent-color) mx-auto" />
                      ) : (
                        String(idx + 1).padStart(2, "0")
                      )}
                    </span>

                    <div className="relative size-10 shrink-0 rounded-xl overflow-hidden bg-(--fg-color)/10 border border-(--border-line-color) shadow-xs">
                      <TrackCover coverUrl={track.cover} title={track.title} />
                    </div>

                    <div className="min-w-0 grow">
                      <p className={`truncate text-sm ${isCurrent ? "text-(--fg-color) font-semibold" : "text-(--fg-color)/90"}`}>
                        {track.title}
                      </p>
                      <p className="truncate text-xs text-(--fg-color)/55 mt-0.5">
                        {track.artist} {track.album ? `• ${track.album}` : ""}
                      </p>
                    </div>

                    {isCurrent && isPlaying && (
                      <WaveformIcon size={16} className="shrink-0 text-(--accent-color) animate-pulse" />
                    )}

                    {/* 按钮组：包含单曲专有的“我喜欢”（收藏）、追加到队列按钮，以及从歌单移除按钮 */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {onToggleFavorite && isFavorite && (
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(track)}
                          className={`opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all shrink-0 cursor-pointer border border-transparent ${
                            isFavorite(track)
                              ? "text-rose-500 bg-rose-500/10 border-rose-500/20"
                              : "bg-(--fg-color)/6 text-(--fg-color)/55 hover:text-rose-500 hover:bg-rose-500/10"
                          }`}
                          title={isFavorite(track) ? "取消收藏" : "加入收藏（我喜欢）"}
                        >
                          <HeartIcon size={13} weight={isFavorite(track) ? "fill" : "regular"} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onAddTrackToQueue?.(track)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-(--fg-color)/6 text-(--fg-color)/55 hover:text-(--accent-color) hover:bg-(--accent-color)/10 transition-all cursor-pointer border border-transparent hover:border-(--accent-color)/20"
                        title="追加该曲到播放队列"
                      >
                        <PlusIcon size={13} weight="bold" />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeTrackFromPlaylist(folder.id, track.id, track.source)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-(--fg-color)/6 text-(--fg-color)/55 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                        title="从歌单中移除"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* 分页加载更多 */}
              {folder.tracks.length > visibleTracksLimit && (
                <div className="pt-2 text-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLoadMoreTracks(folder.tracks.length)}
                    className="px-5 py-2 rounded-xl border border-(--border-line-color) hover:border-(--accent-color)/30 bg-(--fg-color)/4 hover:bg-(--fg-color)/8 text-xs text-(--fg-color)/70 hover:text-(--fg-color) transition-all cursor-pointer inline-flex items-center gap-1 font-semibold"
                  >
                    <span>展开更多歌曲 (共 {folder.tracks.length} 首，已显示 {visibleTracksLimit} 首)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 渲染一级页面（歌单列表页）
  return (
    <div className="grow min-h-0 flex flex-col space-y-4 overflow-y-auto pr-1 overscroll-contain animate-in fade-in duration-200">
      {/* 顶部：新建歌单区域 */}
      <form onSubmit={handleCreatePlaylist} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="新建我的歌单文件夹..."
          className="grow px-4 py-2.5 rounded-2xl bg-(--fg-color)/6 border border-(--border-line-color) text-xs text-(--fg-color) placeholder-(--fg-color)/40 focus:outline-hidden focus:border-(--accent-color) transition-all"
        />
        <button
          type="submit"
          disabled={!newPlaylistName.trim()}
          className="px-5 py-2.5 rounded-2xl bg-(--accent-color) hover:bg-(--accent-color)/90 text-white text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0"
        >
          <PlusIcon size={14} weight="bold" />
          <span>新建</span>
        </button>
      </form>

      {/* 歌单文件夹展示 */}
      {playlists.length === 0 ? (
        <div className="grow flex flex-col items-center justify-center py-12 text-center text-(--fg-color)/40 space-y-3">
          <FolderIcon size={40} className="stroke-1 opacity-70" />
          <div className="text-xs">
            <p className="font-semibold text-(--fg-color)/70">尚无歌单文件夹</p>
            <p className="mt-1 text-[11px] text-(--fg-color)/45 leading-relaxed">
              您可以通过上方新建歌单，或者从【歌单导入】<br />解析网易云歌单，导入的歌曲会自动生成文件夹。
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
          {playlists.map((folder) => {
            const hasCover = Boolean(folder.cover);
            
            return (
              <div
                key={folder.id}
                onClick={() => handleFolderClick(folder.id)}
                className="group relative flex items-center justify-between gap-3 p-4 rounded-2xl bg-(--fg-color)/4 hover:bg-(--fg-color)/8 border border-(--border-line-color) hover:border-(--accent-color)/30 transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="flex items-center gap-3.5 min-w-0 grow">
                  {/* 文件夹小封面：海报图 */}
                  <div className="relative size-12 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 border border-(--border-line-color) shadow-sm flex items-center justify-center text-white">
                    {hasCover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={folder.cover}
                        alt={`${folder.name} 封面`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center opacity-70">
                        <FolderIcon size={20} weight="fill" className="text-neutral-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-(--fg-color) truncate group-hover:text-(--accent-color) transition-colors">
                      {folder.name}
                    </p>
                    <p className="text-[11px] text-(--fg-color)/50 mt-1">
                      {folder.tracks.length} 首曲目
                    </p>
                  </div>
                </div>

                {/* 悬浮/快捷操作区 */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => addPlaylistToQueue(folder.id, false)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-(--accent-color)/15 hover:bg-(--accent-color) text-(--accent-color) hover:text-white transition-all cursor-pointer"
                    title="播放全部"
                    disabled={folder.tracks.length === 0}
                  >
                    <PlayIcon size={12} weight="fill" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRename(folder.id, folder.name)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-(--fg-color)/10 text-(--fg-color)/60 hover:text-(--fg-color) transition-all cursor-pointer"
                    title="重命名"
                  >
                    <EditIcon size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() => removePlaylist(folder.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-(--fg-color)/50 hover:text-red-500 transition-all cursor-pointer"
                    title="删除"
                  >
                    <TrashIcon size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 自定义高颜值重命名对话弹窗：拒绝丑陋的原生 alert/prompt */}
      {renameTargetId !== null && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200"
          onMouseDown={(e) => {
            pointerDownTargetRef.current = e.target;
          }}
          onMouseUp={(e) => {
            // 只有当 mousedown 的起点是遮罩层本身，且 mouseup 释放的终点也是遮罩层本身时，才进行关闭
            // 这能 100% 杜绝鼠标在输入框内按住并向外拖拽全选文字时发生误触关闭的 Bug！
            if (pointerDownTargetRef.current === e.currentTarget && e.target === e.currentTarget) {
              setRenameTargetId(null);
            }
          }}
        >
          <div 
            className="bg-white dark:bg-[#161720] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 w-80 max-w-[90%] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-(--fg-color)">重命名歌单文件夹</h4>
              <p className="text-[10px] text-(--fg-color)/45">请输入该文件夹的新名称：</p>
            </div>
            <input
              type="text"
              autoFocus
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const name = renameInput.trim();
                  if (name) {
                    renamePlaylist(renameTargetId, name);
                    setRenameTargetId(null);
                  }
                } else if (e.key === "Escape") {
                  setRenameTargetId(null);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-(--fg-color)/4 border border-(--border-line-color) text-xs text-(--fg-color) focus:outline-hidden focus:border-(--accent-color)/60 transition-colors"
              placeholder="歌单名称..."
            />
            <div className="flex items-center justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => setRenameTargetId(null)}
                className="px-4 py-2 rounded-xl hover:bg-(--fg-color)/6 text-(--fg-color)/60 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = renameInput.trim();
                  if (name) {
                    renamePlaylist(renameTargetId, name);
                    setRenameTargetId(null);
                  }
                }}
                disabled={!renameInput.trim()}
                className="px-4 py-2 rounded-xl bg-(--accent-color) hover:bg-(--accent-color)/90 disabled:opacity-50 text-white font-semibold transition-colors cursor-pointer shadow-sm"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { musicIcons } from "@/icon/music";
import { fetchPlaylist, parsePlaylistUrl, MusicApiError } from "@/api/music";
import type { MusicSource, TrackDetail } from "@/interface/music";

const {
  loading: LoadingIcon,
  radio: RadioIcon,
  plus: PlusIcon,
  folder: FolderIcon,
} = musicIcons;

interface DrawerImportTabProps {
  selectedSource: MusicSource;
  onImportPlaylist?: (tracks: TrackDetail[], targetPlaylistId?: string) => void;
  playlists?: { id: string; name: string }[];
}

export default function DrawerImportTab({
  selectedSource,
  onImportPlaylist,
  playlists = [],
}: DrawerImportTabProps) {
  const [playlistInput, setPlaylistInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [targetPlaylistId, setTargetPlaylistId] = useState("create_new");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleImport = async (inputStr?: string) => {
    const query = (inputStr ?? playlistInput).trim();
    if (!query || isImporting) return;

    const parsed = parsePlaylistUrl(query, selectedSource);
    if (!parsed) {
      setImportMessage("未识别到有效的歌单链接或ID，请检查格式后重试");
      return;
    }

    setIsImporting(true);
    setImportMessage(`正在解析 ${parsed.source} 歌单 (${parsed.id})...`);
    try {
      const tracks = await fetchPlaylist(parsed.id, parsed.source);
      if (onImportPlaylist) {
        onImportPlaylist(tracks, targetPlaylistId);
      }
      setImportMessage(`成功解析并导入 ${tracks.length} 首曲目！`);
      setPlaylistInput("");
    } catch (error) {
      setImportMessage(error instanceof MusicApiError ? error.message : "歌单导入失败，请检查歌单公开权限或网络链接");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="grow min-h-0 flex flex-col space-y-4 overflow-y-auto pr-1 overscroll-contain">
      <div className="p-4 rounded-2xl bg-(--accent-color)/10 border border-(--accent-color)/20 text-xs text-(--fg-color) space-y-1.5">
        <p className="font-semibold text-(--accent-color) flex items-center gap-1.5">
          <RadioIcon size={16} /> 网易云歌单导入教程
        </p>
        <div className="text-(--fg-color)/75 leading-relaxed space-y-1 text-[11px]">
          <p>1. 打开网易云音乐，进入您要导入的公开歌单或「我喜欢的音乐」</p>
          <p>2. 复制浏览器链接（或提取其中的数字 ID）</p>
          <p>3. 粘贴到下方输入框中，选择要导入的目标歌单文件夹，点击「一键导入」即可</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-(--fg-color)/80 block">
          选择导入至哪个文件夹歌单
        </label>
        <div className="relative">
          {/* 自定义触发按钮：在激活和悬停时引入高端的主色调响应及圆润边框 */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            className={`w-full px-4 py-2.5 rounded-2xl bg-(--fg-color)/4 border text-xs text-(--fg-color) text-left transition-all cursor-pointer flex items-center justify-between ${
              isDropdownOpen
                ? "border-(--accent-color)/60 shadow-xs bg-(--fg-color)/6"
                : "border-(--border-line-color) hover:border-(--fg-color)/20 hover:bg-(--fg-color)/6"
            }`}
          >
            <span className="truncate font-medium flex items-center gap-1.5">
              {targetPlaylistId === "create_new" ? (
                <>
                  <PlusIcon size={14} className="text-(--accent-color)" />
                  <span>自动创建新的歌单文件夹</span>
                </>
              ) : (
                <>
                  <FolderIcon size={14} className="text-(--accent-color)" />
                  <span>导入并追加到已有歌单：{playlists.find((p) => p.id === targetPlaylistId)?.name || ""}</span>
                </>
              )}
            </span>
            <svg
              className={`size-4 fill-current text-(--fg-color)/40 transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180 text-(--accent-color)" : ""
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>

          {/* 高定下拉浮层选项列表：使用高对比反差底色，双层软阴影，以及 iOS 风格圆角子项布局 */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 max-h-56 overflow-y-auto rounded-2xl bg-white/95 dark:bg-[#161720]/95 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] z-50 py-2 backdrop-blur-lg animate-in fade-in slide-in-from-top-1 duration-150">
              <div
                onClick={() => {
                  setTargetPlaylistId("create_new");
                  setIsDropdownOpen(false);
                }}
                className={`px-3 mx-1.5 py-2 rounded-xl text-xs cursor-pointer transition-all flex items-center gap-2 ${
                  targetPlaylistId === "create_new"
                    ? "bg-(--accent-color)/10 text-(--accent-color) font-bold"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <PlusIcon size={14} className={targetPlaylistId === "create_new" ? "text-(--accent-color)" : "text-zinc-400"} />
                <span>自动创建新的歌单文件夹</span>
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800/50 my-1 mx-3" />
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => {
                    setTargetPlaylistId(pl.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`px-3 mx-1.5 py-2 rounded-xl text-xs cursor-pointer transition-all flex items-center gap-2 ${
                    targetPlaylistId === pl.id
                      ? "bg-(--accent-color)/10 text-(--accent-color) font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  <FolderIcon size={14} className={targetPlaylistId === pl.id ? "text-(--accent-color)" : "text-zinc-400"} />
                  <span className="truncate">导入并追加到已有歌单：{pl.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-(--fg-color)/80 block">
          粘贴网易云歌单链接或歌单 ID
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={playlistInput}
            onChange={(e) => setPlaylistInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleImport();
            }}
            placeholder="例如: https://music.163.com/#/playlist?id=7101058132 或 纯数字ID"
            className="grow px-4 py-2.5 rounded-2xl bg-(--fg-color)/6 border border-(--border-line-color) text-xs text-(--fg-color) placeholder-(--fg-color)/40 focus:outline-hidden focus:border-(--accent-color) transition-all"
          />
          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={isImporting || !playlistInput.trim()}
            className="px-5 py-2.5 rounded-2xl bg-(--accent-color) text-white text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isImporting ? <LoadingIcon size={16} className="animate-spin" /> : "一键导入"}
          </button>
        </div>
      </div>



      {importMessage && (
        <div className="p-3.5 rounded-2xl bg-(--fg-color)/6 border border-(--border-line-color) text-xs text-(--fg-color)/90 font-medium flex items-center gap-2 animate-in fade-in duration-200">
          {isImporting && <LoadingIcon size={16} className="animate-spin text-(--accent-color) shrink-0" />}
          <span>{importMessage}</span>
        </div>
      )}
    </div>
  );
}

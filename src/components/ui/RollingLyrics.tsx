"use client";

import { memo, useMemo } from "react";
import type { LyricLine } from "@/interface/music";

interface RollingLyricsProps {
  lyric?: string;
  translatedLyric?: string;
  currentTime: number;
  fallback: string;
}

function parseTimestamp(minutes: string, seconds: string, fraction = "0") {
  const fractionValue = Number(fraction) / 10 ** fraction.length;
  return Number(minutes) * 60 + Number(seconds) + fractionValue;
}

function parseLyricText(value?: string) {
  if (!value) return [] as LyricLine[];
  const result: LyricLine[] = [];
  const timestampPattern = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const sourceLine of value.split(/\r?\n/)) {
    const timestamps = [...sourceLine.matchAll(timestampPattern)];
    if (timestamps.length === 0) continue;
    const text = sourceLine.replace(timestampPattern, "").trim();
    if (!text) continue;
    for (const timestamp of timestamps) {
      result.push({
        time: parseTimestamp(timestamp[1], timestamp[2], timestamp[3]),
        text,
      });
    }
  }

  return result.sort((left, right) => left.time - right.time);
}

export function parseLrc(lyric?: string, translatedLyric?: string) {
  const primary = parseLyricText(lyric);
  const translated = parseLyricText(translatedLyric);
  if (translated.length === 0) return primary;

  return primary.map((line) => {
    const matchingLine = translated.find((candidate) => Math.abs(candidate.time - line.time) < 0.08);
    return matchingLine ? { ...line, translation: matchingLine.text } : line;
  });
}

function RollingLyricsInner({
  lyric,
  translatedLyric,
  currentTime,
  fallback,
}: RollingLyricsProps) {
  const lines = useMemo(() => parseLrc(lyric, translatedLyric), [lyric, translatedLyric]);
  const activeIndex = useMemo(() => {
    if (lines.length === 0) return -1;
    let index = 0;
    for (let cursor = 0; cursor < lines.length; cursor += 1) {
      if (currentTime >= lines[cursor].time) index = cursor;
      else break;
    }
    return index;
  }, [currentTime, lines]);

  if (activeIndex < 0) {
    const isAlert = fallback.includes("此音乐没有播放路径") || fallback.includes("正在获取");
    return (
      <p className={`truncate text-xs ${isAlert ? "font-semibold text-rose-500 dark:text-rose-400" : "text-(--fg-color)/60"}`}>
        {fallback}
      </p>
    );
  }

  return (
    <div className="relative h-8 overflow-hidden contain-strict" aria-live="polite" aria-atomic="true">
      <div
        className="transition-transform duration-500 ease-out motion-reduce:transition-none will-change-transform"
        style={{ transform: `translate3d(0, -${activeIndex * 2}rem, 0)` }}
      >
        {lines.map((line, index) => (
          <div
            key={`${line.time}-${index}`}
            className={`flex h-8 flex-col justify-center truncate transition-opacity duration-300 motion-reduce:transition-none ${
              index === activeIndex ? "opacity-100" : "opacity-24"
            }`}
          >
            <p className="truncate text-xs font-medium text-gold" title={line.text}>
              {line.text}
            </p>
            {line.translation && (
              <p className="truncate text-[9px] text-charcoal/42 dark:text-cream/42" title={line.translation}>
                {line.translation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const RollingLyrics = memo(RollingLyricsInner);
export default RollingLyrics;

"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import {
  Copy,
  Check,
  Info,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  X,
  Link as LinkIcon,
  Square,
  CheckSquare
} from "lucide-react";

// Types for Callout / Alert
export type CalloutType = "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";

interface CalloutConfig {
  icon: React.ElementType;
  title: string;
  borderColorClass: string;
  bgColorClass: string;
  textColorClass: string;
  iconColorClass: string;
}

const CALLOUT_MAP: Record<CalloutType, CalloutConfig> = {
  NOTE: {
    icon: Info,
    title: "NOTE",
    borderColorClass: "border-sky-500/30 dark:border-sky-400/30",
    bgColorClass: "bg-sky-500/10 dark:bg-sky-500/15",
    textColorClass: "text-sky-900 dark:text-sky-200",
    iconColorClass: "text-sky-600 dark:text-sky-400",
  },
  TIP: {
    icon: Lightbulb,
    title: "TIP",
    borderColorClass: "border-emerald-500/30 dark:border-emerald-400/30",
    bgColorClass: "bg-emerald-500/10 dark:bg-emerald-500/15",
    textColorClass: "text-emerald-900 dark:text-emerald-200",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
  },
  IMPORTANT: {
    icon: Info,
    title: "IMPORTANT",
    borderColorClass: "border-purple-500/30 dark:border-purple-400/30",
    bgColorClass: "bg-purple-500/10 dark:bg-purple-500/15",
    textColorClass: "text-purple-900 dark:text-purple-200",
    iconColorClass: "text-purple-600 dark:text-purple-400",
  },
  WARNING: {
    icon: AlertTriangle,
    title: "WARNING",
    borderColorClass: "border-amber-500/30 dark:border-amber-400/30",
    bgColorClass: "bg-amber-500/10 dark:bg-amber-500/15",
    textColorClass: "text-amber-900 dark:text-amber-200",
    iconColorClass: "text-amber-600 dark:text-amber-400",
  },
  CAUTION: {
    icon: AlertCircle,
    title: "CAUTION",
    borderColorClass: "border-rose-500/30 dark:border-rose-400/30",
    bgColorClass: "bg-rose-500/10 dark:bg-rose-500/15",
    textColorClass: "text-rose-900 dark:text-rose-200",
    iconColorClass: "text-rose-600 dark:text-rose-400",
  },
};

// Copy button for code blocks with rich micro-interactions
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`group relative flex items-center gap-1.5 px-3 py-1 text-[11px] font-sans font-medium rounded-lg transition-all duration-300 border backdrop-blur-md cursor-pointer active:scale-95 select-none ${
        copied
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
          : "bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.12] border-white/10 hover:border-white/25 shadow-xs"
      }`}
      title="复制代码到剪贴板"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in-50 duration-200" />
          <span className="text-emerald-300 font-semibold tracking-wide">已复制</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-white/50 group-hover:text-white/90 transition-colors" />
          <span className="tracking-wide">复制</span>
        </>
      )}
    </button>
  );
}

// Recursive inline markdown parser for Bold, Italic, Strikethrough, Highlight, Kbd, Code, Links, Task checkbox, Images
export function parseInline(text: string, onImageClick?: (url: string, alt: string) => void, offset: number = 0): React.ReactNode[] {
  if (!text) return [];

  let minIndex = Infinity;
  let matchType: "image" | "bold" | "italic" | "strike" | "highlight" | "kbd" | "code" | "link" | "task_checked" | "task_unchecked" | null = null;
  let matchedString = "";
  let matchData: any = null;

  // 0. Task Checkboxes ([x] or [ ])
  const taskCheckedRegex = /^\[([xX])\]\s+/;
  const taskUncheckedRegex = /^\[\s\]\s+/;
  const taskCheckedMatch = taskCheckedRegex.exec(text);
  if (taskCheckedMatch && taskCheckedMatch.index < minIndex) {
    minIndex = taskCheckedMatch.index;
    matchType = "task_checked";
    matchedString = taskCheckedMatch[0];
  }
  const taskUncheckedMatch = taskUncheckedRegex.exec(text);
  if (taskUncheckedMatch && taskUncheckedMatch.index < minIndex) {
    minIndex = taskUncheckedMatch.index;
    matchType = "task_unchecked";
    matchedString = taskUncheckedMatch[0];
  }

  // 1. Image (![alt](url))
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
  const imageMatch = imageRegex.exec(text);
  if (imageMatch && imageMatch.index < minIndex) {
    minIndex = imageMatch.index;
    matchType = "image";
    matchedString = imageMatch[0];
    matchData = { alt: imageMatch[1], url: imageMatch[2] };
  }

  // 2. Bold (**text**)
  const boldRegex = /\*\*([^*]+)\*\*/;
  const boldMatch = boldRegex.exec(text);
  if (boldMatch && boldMatch.index < minIndex) {
    minIndex = boldMatch.index;
    matchType = "bold";
    matchedString = boldMatch[0];
    matchData = boldMatch[1];
  }

  // 3. Highlight (==text==)
  const highlightRegex = /==([^=]+)==/;
  const highlightMatch = highlightRegex.exec(text);
  if (highlightMatch && highlightMatch.index < minIndex) {
    minIndex = highlightMatch.index;
    matchType = "highlight";
    matchedString = highlightMatch[0];
    matchData = highlightMatch[1];
  }

  // 4. Strikethrough (~~text~~)
  const strikeRegex = /~~([^~]+)~~/;
  const strikeMatch = strikeRegex.exec(text);
  if (strikeMatch && strikeMatch.index < minIndex) {
    minIndex = strikeMatch.index;
    matchType = "strike";
    matchedString = strikeMatch[0];
    matchData = strikeMatch[1];
  }

  // 5. Italic (*text*)
  const italicRegex = /\*([^*]+)\*/;
  const italicMatch = italicRegex.exec(text);
  if (italicMatch && italicMatch.index < minIndex) {
    minIndex = italicMatch.index;
    matchType = "italic";
    matchedString = italicMatch[0];
    matchData = italicMatch[1];
  }

  // 6. Inline Kbd (<kbd>Key</kbd>)
  const kbdRegex = /<kbd>([^<]+)<\/kbd>/i;
  const kbdMatch = kbdRegex.exec(text);
  if (kbdMatch && kbdMatch.index < minIndex) {
    minIndex = kbdMatch.index;
    matchType = "kbd";
    matchedString = kbdMatch[0];
    matchData = kbdMatch[1];
  }

  // 7. Inline Code (`code`)
  const codeRegex = /`([^`]+)`/;
  const codeMatch = codeRegex.exec(text);
  if (codeMatch && codeMatch.index < minIndex) {
    minIndex = codeMatch.index;
    matchType = "code";
    matchedString = codeMatch[0];
    matchData = codeMatch[1];
  }

  // 8. Link ([text](url))
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
  const linkMatch = linkRegex.exec(text);
  if (linkMatch && linkMatch.index < minIndex) {
    minIndex = linkMatch.index;
    matchType = "link";
    matchedString = linkMatch[0];
    matchData = { text: linkMatch[1], url: linkMatch[2] };
  }

  if (matchType === null) {
    return [text];
  }

  const before = text.substring(0, minIndex);
  const after = text.substring(minIndex + matchedString.length);

  const result: React.ReactNode[] = [];
  if (before) {
    result.push(...parseInline(before, onImageClick, offset));
  }

  const key = `${matchType}-${offset + minIndex}`;

  if (matchType === "task_checked") {
    result.push(
      <span key={key} className="inline-flex items-center align-middle mr-2 text-(--accent-color)">
        <CheckSquare className="w-4 h-4" />
      </span>
    );
  } else if (matchType === "task_unchecked") {
    result.push(
      <span key={key} className="inline-flex items-center align-middle mr-2 text-(--fg-color)/40">
        <Square className="w-4 h-4" />
      </span>
    );
  } else if (matchType === "bold" && typeof matchData === "string") {
    result.push(
      <strong key={key} className="font-bold text-(--fg-color)">
        {parseInline(matchData, onImageClick, offset + minIndex + 2)}
      </strong>
    );
  } else if (matchType === "italic" && typeof matchData === "string") {
    result.push(
      <em key={key} className="italic text-(--fg-color)/90 font-serif">
        {parseInline(matchData, onImageClick, offset + minIndex + 1)}
      </em>
    );
  } else if (matchType === "strike" && typeof matchData === "string") {
    result.push(
      <del key={key} className="line-through text-(--fg-color)/50">
        {parseInline(matchData, onImageClick, offset + minIndex + 2)}
      </del>
    );
  } else if (matchType === "highlight" && typeof matchData === "string") {
    result.push(
      <mark key={key} className="bg-(--accent-color)/20 text-(--fg-color) px-1.5 py-0.5 rounded font-medium border-b-2 border-(--accent-color)/40">
        {parseInline(matchData, onImageClick, offset + minIndex + 2)}
      </mark>
    );
  } else if (matchType === "kbd" && typeof matchData === "string") {
    result.push(
      <kbd
        key={key}
        className="px-2 py-1 text-xs font-mono text-(--fg-color)/90 bg-(--bg-dark-color)/80 rounded-md border border-(--border-line-color) shadow-[0_2px_0_rgba(0,0,0,0.15)] dark:shadow-[0_2px_0_rgba(255,255,255,0.08)] inline-block mx-0.5"
      >
        {matchData}
      </kbd>
    );
  } else if (matchType === "code" && typeof matchData === "string") {
    result.push(
      <code
        key={key}
        className="px-1.5 py-0.5 font-mono text-[0.85em] text-(--accent-color) bg-(--accent-color)/10 rounded border border-(--accent-color)/20 font-medium"
      >
        {matchData}
      </code>
    );
  } else if (matchType === "link" && matchData && typeof matchData === "object" && "text" in matchData) {
    result.push(
      <a
        key={key}
        href={matchData.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-(--accent-color) hover:text-(--accent-light-color) underline underline-offset-4 decoration-(--accent-color)/30 hover:decoration-(--accent-color) transition-colors font-sans font-medium text-[0.95em] inline-inline-flex items-center gap-0.5"
      >
        {parseInline(matchData.text, onImageClick, offset + minIndex + 1)}
      </a>
    );
  } else if (matchType === "image" && matchData && typeof matchData === "object" && "url" in matchData) {
    const { url, alt } = matchData;
    result.push(
      <figure
        key={key}
        className="group relative my-8 overflow-hidden rounded-2xl border border-(--border-line-color) bg-(--bg-dark-color)/40 p-2 sm:p-3 transition-all duration-300 hover:shadow-xl"
      >
        <div
          className="relative overflow-hidden rounded-xl cursor-zoom-in"
          onClick={() => onImageClick?.(url, alt)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt || "Article Image"}
            className="w-full h-auto max-h-[550px] object-cover rounded-xl group-hover:scale-[1.015] transition-transform duration-500 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-sans rounded-full shadow-lg flex items-center gap-1.5 border border-white/20">
              点击放大预览
            </span>
          </div>
        </div>
        {alt && (
          <figcaption className="text-center text-xs text-(--fg-color)/60 pt-3 pb-1 font-sans tracking-wide">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  }

  if (after) {
    result.push(...parseInline(after, onImageClick, offset + minIndex + matchedString.length));
  }

  return result;
}

function parseTableLine(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) {
    trimmed = trimmed.slice(1);
  }
  if (trimmed.endsWith("|")) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed.split("|").map((cell) => cell.trim());
}

function parseTableAligns(line: string): ("left" | "center" | "right")[] {
  const parts = parseTableLine(line);
  return parts.map((part) => {
    const trimmed = part.trim();
    const left = trimmed.startsWith(":");
    const right = trimmed.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    return "left";
  });
}

export interface Block {
  type:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "paragraph"
    | "blockquote"
    | "callout"
    | "ul"
    | "ol"
    | "code"
    | "table"
    | "hr";
  content?: string;
  lines?: string[];
  lang?: string;
  calloutType?: CalloutType;
  tableData?: {
    headers: string[];
    aligns: ("left" | "center" | "right")[];
    rows: string[][];
  };
}

export function parseBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let currentBlock: Block | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 0. Table Line continuation
    if (currentBlock && currentBlock.type === "table") {
      if (line.includes("|")) {
        const row = parseTableLine(line);
        currentBlock.tableData!.rows.push(row);
        continue;
      } else {
        blocks.push(currentBlock);
        currentBlock = null;
        i--; // re-process line
        continue;
      }
    }

    // 0.5. Table Start Check
    if (line.includes("|") && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      const tableDividerRegex = /^\s*\|?\s*(:?-+:?)\s*(\|\s*(:?-+:?)\s*)*\|?\s*$/;
      if (tableDividerRegex.test(nextLine)) {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        const headers = parseTableLine(line);
        const aligns = parseTableAligns(nextLine);
        currentBlock = {
          type: "table",
          tableData: {
            headers,
            aligns,
            rows: [],
          },
        };
        i++; // skip divider
        continue;
      }
    }

    // 1. Code Block (```lang)
    if (trimmed.startsWith("```")) {
      if (currentBlock && currentBlock.type === "code") {
        blocks.push(currentBlock);
        currentBlock = null;
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        const lang = trimmed.slice(3).trim();
        currentBlock = { type: "code", lang, lines: [] };
      }
      continue;
    }

    if (currentBlock && currentBlock.type === "code") {
      currentBlock.lines!.push(line);
      continue;
    }

    // 2. Horizontal Rule (---, ***, ___)
    if (/^(---|[*]{3,}|_{3,})$/.test(trimmed)) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      blocks.push({ type: "hr" });
      continue;
    }

    // 3. Callout / Blockquote (>)
    if (trimmed.startsWith(">")) {
      const quoteContent = line.replace(/^\s*>\s?/, "");

      // Check if this is the start of a Callout: > [!NOTE] etc.
      const calloutMatch = quoteContent.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);

      if (calloutMatch) {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        const calloutType = calloutMatch[1].toUpperCase() as CalloutType;
        const remainingText = quoteContent.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, "");
        currentBlock = {
          type: "callout",
          calloutType,
          lines: remainingText ? [remainingText] : [],
        };
        continue;
      }

      if (currentBlock && (currentBlock.type === "blockquote" || currentBlock.type === "callout")) {
        currentBlock.lines!.push(quoteContent);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: "blockquote", lines: [quoteContent] };
      }
      continue;
    }

    // 4. Unordered List (- or * or +)
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    if (ulMatch) {
      const itemContent = ulMatch[3];
      if (currentBlock && currentBlock.type === "ul") {
        currentBlock.lines!.push(itemContent);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: "ul", lines: [itemContent] };
      }
      continue;
    }

    // 5. Ordered List (1., 2.)
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (olMatch) {
      const itemContent = olMatch[3];
      if (currentBlock && currentBlock.type === "ol") {
        currentBlock.lines!.push(itemContent);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: "ol", lines: [itemContent] };
      }
      continue;
    }

    // 6. Headings (# H1 ~ ###### H6)
    if (trimmed.startsWith("#")) {
      const hMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (hMatch) {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        const level = hMatch[1].length;
        const hContent = hMatch[2];
        const hType = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        blocks.push({ type: hType, content: hContent });
        currentBlock = null;
        continue;
      }
    }

    // 7. Blank Line
    if (trimmed === "") {
      if (currentBlock) {
        if (
          currentBlock.type === "paragraph" ||
          currentBlock.type === "blockquote" ||
          currentBlock.type === "callout" ||
          currentBlock.type === "ul" ||
          currentBlock.type === "ol"
        ) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
      }
      continue;
    }

    // 8. Paragraph
    if (currentBlock && currentBlock.type === "paragraph") {
      currentBlock.lines!.push(line);
    } else {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = { type: "paragraph", lines: [line] };
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
}

// Image Lightbox Modal using React Portal
function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock background scroll when Lightbox is open
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 animate-fadeIn"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 p-2.5 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors border border-white/20 cursor-pointer z-[10000] shadow-lg"
        title="关闭预览 (Esc)"
      >
        <X className="w-6 h-6" />
      </button>
      <div
        className="relative max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/15 shadow-2xl bg-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
        />
        {alt && (
          <div className="bg-black/80 backdrop-blur-md text-center text-xs sm:text-sm text-white/90 py-3 px-4 font-sans border-t border-white/10">
            {alt}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function Markdown({ content }: { content: string }) {
  const [activeImage, setActiveImage] = useState<{ url: string; alt: string } | null>(null);
  const blocks = parseBlocks(content);

  const handleImageClick = (url: string, alt: string) => {
    setActiveImage({ url, alt });
  };

  return (
    <div className="space-y-6 text-(--fg-color)">
      {blocks.map((block, idx) => {
        const key = `${block.type}-${idx}`;
        switch (block.type) {
          case "hr":
            return (
              <div key={key} className="relative my-10 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-(--border-line-color)" />
                </div>
                <div className="relative bg-(--bg-color) px-4">
                  <span className="inline-block w-2 h-2 rotate-45 bg-(--accent-color)/40 rounded-[1px]" />
                </div>
              </div>
            );

          case "table": {
            const data = block.tableData;
            if (!data) return null;
            return (
              <div
                key={key}
                className="my-8 overflow-x-auto rounded-2xl border border-(--border-line-color) bg-(--bg-dark-color)/30 shadow-sm"
              >
                <table className="w-full border-collapse text-left text-xs md:text-sm font-sans tracking-wide">
                  <thead>
                    <tr className="border-b border-(--border-line-color) bg-(--accent-color)/10 text-(--fg-color) font-semibold">
                      {data.headers.map((header, i) => {
                        const align = data.aligns[i] || "left";
                        return (
                          <th
                            key={i}
                            style={{ textAlign: align }}
                            className="px-4 py-3.5 uppercase tracking-wider text-[0.85em] text-(--accent-color)"
                          >
                            {parseInline(header, handleImageClick)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border-line-color)">
                    {data.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-(--accent-color)/5 transition-colors"
                      >
                        {row.map((cell, cIdx) => {
                          const align = data.aligns[cIdx] || "left";
                          return (
                            <td
                              key={cIdx}
                              style={{ textAlign: align }}
                              className="px-4 py-3 leading-relaxed text-(--fg-color)/85"
                            >
                              {parseInline(cell, handleImageClick)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6": {
            const textContent = block.content || "";
            const slug = textContent
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
              .replace(/^-+|-+$/g, "");
            const headingId = slug || `heading-${idx}`;

            const baseHeadingClasses =
              "group relative font-serif text-(--fg-color) tracking-wide leading-snug font-normal flex items-center gap-2.5";

            if (block.type === "h1") {
              return (
                <h1
                  key={key}
                  id={headingId}
                  className={`${baseHeadingClasses} text-2xl md:text-3xl mt-12 mb-5 pb-3 border-b border-(--border-line-color)`}
                >
                  <span className="w-1.5 h-6 rounded-full bg-(--accent-color) shrink-0" />
                  <span className="flex-1">{parseInline(textContent, handleImageClick)}</span>
                  <a
                    href={`#${headingId}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-(--accent-color)/60 hover:text-(--accent-color) p-1"
                    title="锚点链接"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </a>
                </h1>
              );
            }
            if (block.type === "h2") {
              return (
                <h2
                  key={key}
                  id={headingId}
                  className={`${baseHeadingClasses} text-xl md:text-2xl mt-10 mb-4 pb-2 border-b border-(--border-line-color)/60`}
                >
                  <span className="w-1.5 h-5 rounded-full bg-(--accent-color)/80 shrink-0" />
                  <span className="flex-1">{parseInline(textContent, handleImageClick)}</span>
                  <a
                    href={`#${headingId}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-(--accent-color)/60 hover:text-(--accent-color) p-1"
                    title="锚点链接"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </a>
                </h2>
              );
            }
            if (block.type === "h3") {
              return (
                <h3
                  key={key}
                  id={headingId}
                  className={`${baseHeadingClasses} text-lg md:text-xl mt-8 mb-3`}
                >
                  <span className="w-2 h-2 rounded-full bg-(--accent-color) shrink-0" />
                  <span className="flex-1">{parseInline(textContent, handleImageClick)}</span>
                  <a
                    href={`#${headingId}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-(--accent-color)/60 hover:text-(--accent-color) p-1"
                    title="锚点链接"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </a>
                </h3>
              );
            }
            return (
              <h4
                key={key}
                id={headingId}
                className={`${baseHeadingClasses} text-base md:text-lg mt-6 mb-2 text-(--fg-color)/90`}
              >
                <span className="flex-1">{parseInline(textContent, handleImageClick)}</span>
              </h4>
            );
          }

          case "callout": {
            const calloutType = block.calloutType || "NOTE";
            const config = CALLOUT_MAP[calloutType];
            const Icon = config.icon;
            const calloutText = block.lines ? block.lines.join(" ") : "";

            return (
              <div
                key={key}
                className={`my-6 rounded-2xl border ${config.borderColorClass} ${config.bgColorClass} p-4.5 sm:p-5 shadow-sm transition-all`}
              >
                <div className="flex items-center gap-2.5 mb-2 font-sans font-semibold text-xs tracking-wider uppercase">
                  <Icon className={`w-4 h-4 ${config.iconColorClass}`} />
                  <span className={config.textColorClass}>{config.title}</span>
                </div>
                <div className={`font-serif text-sm md:text-base leading-relaxed ${config.textColorClass} opacity-95`}>
                  {parseInline(calloutText, handleImageClick)}
                </div>
              </div>
            );
          }

          case "blockquote": {
            const quoteText = block.lines ? block.lines.join(" ") : "";
            return (
              <blockquote
                key={key}
                className="font-serif italic text-base md:text-lg text-(--fg-color)/80 pl-5 border-l-4 border-(--accent-color) bg-(--accent-color)/5 px-5 py-3.5 rounded-r-2xl my-6 leading-relaxed shadow-xs"
              >
                {parseInline(quoteText, handleImageClick)}
              </blockquote>
            );
          }

          case "paragraph": {
            const text = block.lines ? block.lines.join(" ") : "";
            return (
              <p
                key={key}
                className="text-justify leading-loose text-(--fg-color)/85 text-base font-serif tracking-wide"
              >
                {parseInline(text, handleImageClick)}
              </p>
            );
          }

          case "ul":
            return (
              <ul
                key={key}
                className="list-none pl-2 space-y-2.5 text-sm md:text-base font-serif tracking-wide text-(--fg-color)/85 my-6 bg-(--bg-dark-color)/30 p-5 rounded-2xl border border-(--border-line-color)"
              >
                {block.lines?.map((line, i) => {
                  const isTask = /^\[([ xX])\]/.test(line.trim());
                  return (
                    <li key={i} className="flex items-start gap-2.5">
                      {!isTask && (
                        <span className="mt-2.5 inline-block w-1.5 h-1.5 shrink-0 rounded-full bg-(--accent-color)" />
                      )}
                      <span className="leading-relaxed flex-1">{parseInline(line, handleImageClick)}</span>
                    </li>
                  );
                })}
              </ul>
            );

          case "ol":
            return (
              <ol
                key={key}
                className="list-decimal pl-6 space-y-2.5 text-sm md:text-base font-serif tracking-wide text-(--fg-color)/85 my-6 bg-(--bg-dark-color)/30 p-5 rounded-2xl border border-(--border-line-color)"
              >
                {block.lines?.map((line, i) => (
                  <li key={i} className="pl-1 leading-relaxed">
                    <span>{parseInline(line, handleImageClick)}</span>
                  </li>
                ))}
              </ol>
            );

          case "code": {
            const codeText = block.lines ? block.lines.join("\n") : "";
            const lang = block.lang;
            let highlightedCode = codeText;
            try {
              if (lang && hljs.getLanguage(lang)) {
                highlightedCode = hljs.highlight(codeText, { language: lang }).value;
              } else {
                highlightedCode = hljs.highlightAuto(codeText).value;
              }
            } catch (err) {
              console.warn("Highlight.js failed, falling back to raw code text.", err);
            }

            return (
              <div
                key={key}
                className="my-8 rounded-2xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-xl font-mono text-xs md:text-sm"
              >
                {/* Mac Terminal Topbar */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/10 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shrink-0" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dab12d] inline-block shrink-0" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1a9c2b] inline-block shrink-0" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-sans font-medium uppercase tracking-widest text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {block.lang || "code"}
                    </span>
                    <CopyButton code={codeText} />
                  </div>
                </div>
                <pre className="p-4 sm:p-5 overflow-x-auto text-[#e6edf3] leading-relaxed font-mono bg-[#0d1117]">
                  <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                </pre>
              </div>
            );
          }

          default:
            return null;
        }
      })}

      {/* Lightbox Modal */}
      {activeImage && (
        <ImageLightbox
          src={activeImage.url}
          alt={activeImage.alt}
          onClose={() => setActiveImage(null)}
        />
      )}
    </div>
  );
}

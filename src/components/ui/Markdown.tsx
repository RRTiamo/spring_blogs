"use client";

import React from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

// Recursive inline markdown parser for Bold, Italic, Code, and Links
export function parseInline(text: string, offset: number = 0): React.ReactNode[] {
  if (!text) return [];

  let minIndex = Infinity;
  let matchType: "bold" | "italic" | "code" | "link" | "image" | null = null;
  let matchedString = "";
  let matchData: string | { text: string; url: string } | null = null;

  // 0. Image (![alt](url))
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
  const imageMatch = imageRegex.exec(text);
  if (imageMatch && imageMatch.index < minIndex) {
    minIndex = imageMatch.index;
    matchType = "image";
    matchedString = imageMatch[0];
    matchData = { text: imageMatch[1], url: imageMatch[2] };
  }

  // 1. Bold (**text**)
  const boldRegex = /\*\*([^*]+)\*\*/;
  const boldMatch = boldRegex.exec(text);
  if (boldMatch && boldMatch.index < minIndex) {
    minIndex = boldMatch.index;
    matchType = "bold";
    matchedString = boldMatch[0];
    matchData = boldMatch[1];
  }

  // 2. Italic (*text*)
  const italicRegex = /\*([^*]+)\*/;
  const italicMatch = italicRegex.exec(text);
  if (italicMatch && italicMatch.index < minIndex) {
    minIndex = italicMatch.index;
    matchType = "italic";
    matchedString = italicMatch[0];
    matchData = italicMatch[1];
  }

  // 3. Inline Code (`code`)
  const codeRegex = /`([^`]+)`/;
  const codeMatch = codeRegex.exec(text);
  if (codeMatch && codeMatch.index < minIndex) {
    minIndex = codeMatch.index;
    matchType = "code";
    matchedString = codeMatch[0];
    matchData = codeMatch[1];
  }

  // 4. Link ([text](url))
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
    result.push(...parseInline(before, offset));
  }

  const key = `${matchType}-${offset + minIndex}`;
  if (matchType === "bold" && typeof matchData === "string") {
    result.push(
      <strong key={key} className="font-bold text-charcoal dark:text-cream">
        {parseInline(matchData, offset + minIndex + 2)}
      </strong>
    );
  } else if (matchType === "italic" && typeof matchData === "string") {
    result.push(
      <em key={key} className="italic text-charcoal/90 dark:text-cream/90">
        {parseInline(matchData, offset + minIndex + 1)}
      </em>
    );
  } else if (matchType === "code" && typeof matchData === "string") {
    result.push(
      <code
        key={key}
        className="px-1.5 py-0.5 font-mono text-[0.8em] text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-950/20 rounded border border-rose-500/20 dark:border-rose-900/50"
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
        className="text-gold hover:underline border-b border-gold/20 pb-0.5 transition-all font-sans text-[0.95em]"
      >
        {parseInline(matchData.text, offset + minIndex + 1)}
      </a>
    );
  } else if (matchType === "image" && matchData && typeof matchData === "object" && "text" in matchData) {
    result.push(
      <span key={key} className="block my-6 overflow-hidden rounded-2xl border border-charcoal/10 dark:border-white/10 bg-charcoal/5 dark:bg-white/5">
        <img
          src={matchData.url}
          alt={matchData.text}
          className="w-full h-auto max-h-[500px] object-cover hover:scale-[1.01] transition-transform duration-500"
          loading="lazy"
        />
        {matchData.text && (
          <span className="block text-center text-xs tone-muted py-2.5 border-t border-charcoal/5 dark:border-white/5 bg-charcoal/[0.02] dark:bg-white/[0.01] font-sans">
            {matchData.text}
          </span>
        )}
      </span>
    );
  }

  if (after) {
    result.push(...parseInline(after, offset + minIndex + matchedString.length));
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
  return trimmed.split("|").map(cell => cell.trim());
}

function parseTableAligns(line: string): ("left" | "center" | "right")[] {
  const parts = parseTableLine(line);
  return parts.map(part => {
    const trimmed = part.trim();
    const left = trimmed.startsWith(":");
    const right = trimmed.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    return "left";
  });
}

interface Block {
  type: "h1" | "h2" | "h3" | "h4" | "paragraph" | "blockquote" | "ul" | "ol" | "code" | "table";
  content?: string;
  lines?: string[];
  lang?: string;
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
        // Table ends
        blocks.push(currentBlock);
        currentBlock = null;
        i--; // re-process current line
        continue;
      }
    }

    // 0.5. Check Table Start
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
            rows: []
          }
        };
        i++; // skip divider line
        continue;
      }
    }

    // 1. Code Block (```lang)
    if (trimmed.startsWith("```")) {
      if (currentBlock && currentBlock.type === "code") {
        // End of code block
        blocks.push(currentBlock);
        currentBlock = null;
      } else {
        // Start of code block
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

    // 2. Unordered List (- or *)
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

    // 3. Ordered List (1., 2.)
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

    // 4. Blockquote (>)
    if (trimmed.startsWith(">")) {
      const quoteContent = line.replace(/^\s*>\s?/, "");
      if (currentBlock && currentBlock.type === "blockquote") {
        currentBlock.lines!.push(quoteContent);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: "blockquote", lines: [quoteContent] };
      }
      continue;
    }

    // 5. Headings
    if (trimmed.startsWith("#")) {
      const hMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
      if (hMatch) {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        const level = hMatch[1].length;
        const hContent = hMatch[2];
        const hType = level === 1 ? "h1" : level === 2 ? "h2" : level === 3 ? "h3" : "h4";
        blocks.push({ type: hType, content: hContent });
        currentBlock = null;
        continue;
      }
    }

    // 6. Blank line
    if (trimmed === "") {
      if (currentBlock) {
        if (
          currentBlock.type === "paragraph" ||
          currentBlock.type === "blockquote" ||
          currentBlock.type === "ul" ||
          currentBlock.type === "ol"
        ) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
      }
      continue;
    }

    // 7. Paragraph
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

export default function Markdown({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-6">
      {blocks.map((block, idx) => {
        const key = `${block.type}-${idx}`;
        switch (block.type) {
          case "table": {
            const data = block.tableData;
            if (!data) return null;
            return (
              <div key={key} className="my-6 overflow-x-auto rounded-2xl border border-charcoal/10 dark:border-white/10 bg-charcoal/[0.02] dark:bg-white/[0.01]">
                <table className="w-full border-collapse text-left text-xs md:text-sm font-sans tracking-wide text-charcoal/80 dark:text-cream/80">
                  <thead>
                    <tr className="border-b border-charcoal/10 dark:border-white/10 bg-charcoal/5 dark:bg-white/5 text-charcoal dark:text-cream font-medium">
                      {data.headers.map((header, i) => {
                        const align = data.aligns[i] || "left";
                        return (
                          <th
                            key={i}
                            style={{ textAlign: align }}
                            className="px-4 py-3 font-semibold text-[0.9em] uppercase tracking-wider"
                          >
                            {parseInline(header)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5 dark:divide-white/5">
                    {data.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-charcoal/[0.04] dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {row.map((cell, cIdx) => {
                          const align = data.aligns[cIdx] || "left";
                          return (
                            <td
                              key={cIdx}
                              style={{ textAlign: align }}
                              className="px-4 py-3 leading-relaxed"
                            >
                              {parseInline(cell)}
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
            return (
              <h1
                key={key}
                id={`heading-${idx}`}
                className="font-serif text-2xl md:text-3xl font-light text-charcoal dark:text-cream mt-10 mb-4 border-b border-charcoal/10 dark:border-white/10 pb-2.5 tracking-wide leading-snug"
              >
                {parseInline(block.content || "")}
              </h1>
            );
          case "h2":
            return (
              <h2
                key={key}
                id={`heading-${idx}`}
                className="font-serif text-xl md:text-2xl font-light text-charcoal dark:text-cream mt-8 mb-4 border-b border-charcoal/5 dark:border-white/5 pb-1.5 tracking-wide leading-snug"
              >
                {parseInline(block.content || "")}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={key}
                id={`heading-${idx}`}
                className="font-serif text-lg md:text-xl font-light text-charcoal dark:text-cream mt-6 mb-3 tracking-wide"
              >
                {parseInline(block.content || "")}
              </h3>
            );
          case "h4":
            return (
              <h4
                key={key}
                id={`heading-${idx}`}
                className="font-serif text-base md:text-lg font-light text-charcoal dark:text-cream mt-4 mb-2 tracking-wide"
              >
                {parseInline(block.content || "")}
              </h4>
            );
          case "paragraph": {
            const text = block.lines ? block.lines.join(" ") : "";
            return (
              <p
                key={key}
                className="text-justify leading-loose text-charcoal/85 dark:text-cream/85 text-sm md:text-base font-serif tracking-wide"
              >
                {parseInline(text)}
              </p>
            );
          }
          case "blockquote": {
            const text = block.lines ? block.lines.join(" ") : "";
            return (
              <blockquote
                key={key}
                className="font-serif italic text-base md:text-lg text-charcoal/70 dark:text-cream/70 pl-6 border-l-4 border-gold bg-gold/5 dark:bg-gold/10 px-6 py-4 rounded-r-2xl my-6 leading-relaxed shadow-sm"
              >
                {parseInline(text)}
              </blockquote>
            );
          }
          case "ul":
            return (
              <ul
                key={key}
                className="list-none pl-4 space-y-2.5 text-xs md:text-sm font-sans tracking-wider text-charcoal/75 dark:text-cream/75 my-6 bg-charcoal/5 dark:bg-white/5 p-6 rounded-2xl border border-charcoal/5 dark:border-white/5"
              >
                {block.lines?.map((line, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-gold mt-1.5 inline-block w-1.5 h-1.5 shrink-0 rounded-full bg-gold" />
                    <span className="leading-relaxed">{parseInline(line)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={key}
                className="list-decimal pl-6 space-y-2.5 text-xs md:text-sm font-sans tracking-wider text-charcoal/75 dark:text-cream/75 my-6 bg-charcoal/5 dark:bg-white/5 p-6 rounded-2xl border border-charcoal/5 dark:border-white/5"
              >
                {block.lines?.map((line, i) => (
                  <li key={i} className="pl-1 leading-relaxed">
                    <span>{parseInline(line)}</span>
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
                className="my-6 rounded-2xl overflow-hidden border border-charcoal/10 dark:border-white/10 bg-[#0d1117] shadow-xl font-mono text-xs"
              >
                {/* Mac 风格三色窗口控制栏 */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-charcoal/5 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shrink-0" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dab12d] inline-block shrink-0" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1a9c2b] inline-block shrink-0" />
                  </div>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-charcoal/50 dark:text-cream/50">
                    {block.lang || "code"}
                  </span>
                </div>
                <pre className="p-4 overflow-x-auto text-[#e6edf3] leading-relaxed font-mono bg-[#0d1117]">
                  <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                </pre>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

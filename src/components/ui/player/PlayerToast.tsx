"use client";

import React from "react";

interface PlayerToastProps {
  message: string | null;
  onClose: () => void;
}

export default function PlayerToast({ message, onClose }: PlayerToastProps) {
  if (!message) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-220 max-w-md px-5 py-3 rounded-2xl bg-(--bg-dark-color)/96 text-(--fg-color) border border-(--border-line-color) shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-(--accent-color)/15 text-(--accent-color) shrink-0">
        提示
      </span>
      <p className="text-xs leading-relaxed text-(--fg-color) font-medium grow">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="text-xs text-(--fg-color)/40 hover:text-(--fg-color) shrink-0 ml-1 cursor-pointer"
        aria-label="关闭提示"
      >
        ✕
      </button>
    </div>
  );
}

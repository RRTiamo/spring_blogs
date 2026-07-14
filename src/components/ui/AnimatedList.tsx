"use client";

import React, { useRef, useState, useCallback, memo } from "react";
import "./AnimatedList.css";

export interface AnimatedItemProps {
  children: React.ReactNode;
  index: number;
  onMouseEnter?: () => void;
  onClick?: () => void;
}

export const AnimatedItem: React.FC<AnimatedItemProps> = memo(({
  children,
  index,
  onMouseEnter,
  onClick,
}) => {
  // 只在前 15 个元素计算交错入场动画延迟，之后的瞬间展示，避免滚动时滞后
  const animationDelay = index < 15 ? `${index * 0.025}s` : "0s";

  return (
    <div
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className="animated-item-wrapper"
      style={{ animationDelay }}
    >
      {children}
    </div>
  );
});

AnimatedItem.displayName = "AnimatedItem";

export interface AnimatedListProps<T = any> {
  items?: T[];
  onItemSelect?: (item: T, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  renderItem?: (item: T, index: number, isSelected: boolean) => React.ReactNode;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

export default function AnimatedList<T = any>({
  items = [],
  onItemSelect,
  showGradients = false,
  className = "",
  itemClassName = "",
  displayScrollbar = true,
  initialSelectedIndex = -1,
  renderItem,
  onScroll,
  getItemKey,
}: AnimatedListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback(
    (item: T, index: number) => {
      setSelectedIndex(index);
      if (onItemSelect) {
        onItemSelect(item, index);
      }
    },
    [onItemSelect]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (showGradients) {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        setTopGradientOpacity(Math.min(scrollTop / 30, 1));
        const bottomDistance = scrollHeight - (scrollTop + clientHeight);
        setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 30, 1));
      }
      if (onScroll) {
        onScroll(e);
      }
    },
    [showGradients, onScroll]
  );

  return (
    <div className={`scroll-list-container ${className}`}>
      <div
        ref={listRef}
        data-lenis-prevent
        className={`scroll-list overscroll-contain ${!displayScrollbar ? "no-scrollbar" : ""}`}
        onScroll={handleScroll}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {items.map((item, index) => {
          const isSelected = selectedIndex === index;
          const key = getItemKey ? getItemKey(item, index) : index;

          return (
            <AnimatedItem
              key={key}
              index={index}
              onMouseEnter={() => handleItemMouseEnter(index)}
              onClick={() => handleItemClick(item, index)}
            >
              {renderItem ? (
                renderItem(item, index, isSelected)
              ) : (
                <div className={`item ${isSelected ? "selected" : ""} ${itemClassName}`}>
                  <p className="item-text">{typeof item === "string" ? item : JSON.stringify(item)}</p>
                </div>
              )}
            </AnimatedItem>
          );
        })}
      </div>
      {showGradients && (
        <>
          <div className="top-gradient" style={{ opacity: topGradientOpacity }} />
          <div className="bottom-gradient" style={{ opacity: bottomGradientOpacity }} />
        </>
      )}
    </div>
  );
}

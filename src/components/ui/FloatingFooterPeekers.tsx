"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import footerPeekers from "../../../assets/footer-peekers.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FloatingFooterPeekers() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let triggerInstance: ScrollTrigger | null = null;
    let currentFooter: HTMLElement | null = null;
    let currentDockedElement: HTMLElement | null = null;
    let debounceTimer: number | null = null;

    let refreshTimer: number | null = null;

    const initTrigger = () => {
      // 销毁旧实例以防重复创建和内存泄漏
      if (triggerInstance) {
        triggerInstance.kill();
        triggerInstance = null;
      }

      const root = rootRef.current;
      const footer = document.querySelector<HTMLElement>("[data-footer-peekers-anchor]");
      if (!root || !footer) return;

      currentFooter = footer;
      currentDockedElement = document.querySelector<HTMLElement>("[data-footer-peekers-docked]");

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // 初始隐藏 docked 状态（如果存在）
      gsap.set(root, { autoAlpha: 1 });
      if (currentDockedElement) {
        gsap.set(currentDockedElement, { autoAlpha: 0 });
      }

      // 每次 handOff 触发时都重新 query docked 节点，解决 React 重绘引用过期问题
      const handOff = (docked_on: boolean, immediate = false) => {
        const rootNode = rootRef.current;
        if (!rootNode) return;
        const currentDocked = document.querySelector<HTMLElement>("[data-footer-peekers-docked]");
        const duration = immediate || reduceMotion ? 0 : 0.4;
        
        gsap.to(rootNode, { autoAlpha: docked_on ? 0 : 1, duration, ease: "power2.out", overwrite: "auto" });
        if (currentDocked) {
          gsap.to(currentDocked, { autoAlpha: docked_on ? 1 : 0, duration, ease: "power2.out", overwrite: "auto" });
        }
      };

      triggerInstance = ScrollTrigger.create({
        trigger: footer,
        start: "top bottom",
        end: "bottom top",
        invalidateOnRefresh: true,
        onEnter: () => handOff(true),
        onLeaveBack: () => handOff(false),
      });

      // 首次同步状态
      handOff(triggerInstance.isActive, true);
    };

    const debouncedInit = () => {
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(() => {
        initTrigger();
      }, 150) as unknown as number;
    };

    const debouncedRefresh = () => {
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
      }
      refreshTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200) as unknown as number;
    };

    // 首次初始化
    initTrigger();

    // 创建 MutationObserver 监听 DOM 树变动，一旦发现 Footer 节点或 docked 节点被 React 重写替换，则立刻重写绑定 ScrollTrigger
    const observer = new MutationObserver(() => {
      const footer = document.querySelector<HTMLElement>("[data-footer-peekers-anchor]");
      const docked = document.querySelector<HTMLElement>("[data-footer-peekers-docked]");
      if ((footer && footer !== currentFooter) || (docked && docked !== currentDockedElement)) {
        debouncedInit();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 监听文档尺寸变化，自适应动态数据加载带来的高度改变，重新计算触发点
    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== "undefined" && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        debouncedRefresh();
      });
      resizeObserver.observe(document.body);
    }

    return () => {
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
      }
      if (triggerInstance) {
        triggerInstance.kill();
      }
      observer.disconnect();
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [pathname]);

  return (
    <div
      ref={rootRef}
      className="footer-peekers-floating pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center"
      aria-hidden="true"
    >
      <div className="footer-peekers-floating-image relative z-[1] w-[min(48rem,74vw)] drop-shadow-[0_16px_24px_rgba(34,51,38,0.12)] max-[1023px]:w-[min(44rem,86vw)] max-[640px]:w-[104vw]">
        <Image
          src={footerPeekers}
          alt=""
          sizes="(max-width: 640px) 94vw, (max-width: 1024px) 78vw, 760px"
          className="block h-auto w-full select-none"
          priority
        />
      </div>
    </div>
  );
}

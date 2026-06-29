"use client";

import { useEffect, useRef, useState } from "react";
import { LoveStats as StatsType } from "@/interface/love";
import { Calendar, Compass, Film, Utensils } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface LoveStatsProps {
  stats: StatsType;
}

export default function LoveStats({ stats }: LoveStatsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);

  // 引用数字元素，用于 Odometer 动画
  const daysRef = useRef<HTMLSpanElement>(null);
  const citiesRef = useRef<HTMLSpanElement>(null);
  const flightRef = useRef<HTMLSpanElement>(null);
  const movieRef = useRef<HTMLSpanElement>(null);
  const mealRef = useRef<HTMLSpanElement>(null);

  // 计算相识天数
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (stats.startDate) {
      const start = new Date(stats.startDate).getTime();
      const diff = Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
      setTotalDays(diff);
    }
  }, [stats.startDate]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      if (daysRef.current) daysRef.current.innerText = totalDays.toLocaleString();
      if (citiesRef.current) citiesRef.current.innerText = stats.citiesCount.toLocaleString();
      if (flightRef.current) flightRef.current.innerText = stats.flightDistance.toLocaleString();
      if (movieRef.current) movieRef.current.innerText = stats.movieCount.toLocaleString();
      if (mealRef.current) mealRef.current.innerText = stats.mealCount.toLocaleString();
      return;
    }

    const ctx = gsap.context(() => {
      // 1. 数字滚动增长动画
      const animateNumber = (element: HTMLSpanElement | null, targetVal: number) => {
        if (!element) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: targetVal,
          duration: 2.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          },
          onUpdate: () => {
            if (element) {
              element.innerText = Math.floor(obj.val).toLocaleString();
            }
          }
        });
      };

      animateNumber(daysRef.current, totalDays);
      animateNumber(citiesRef.current, stats.citiesCount);
      animateNumber(flightRef.current, stats.flightDistance);
      animateNumber(movieRef.current, stats.movieCount);
      animateNumber(mealRef.current, stats.mealCount);

      // 2. 纸飞机滑翔路径动画
      const path = pathRef.current;
      const plane = planeRef.current;
      if (path && plane) {
        const length = path.getTotalLength();
        // 设置初始位置
        const startPoint = path.getPointAtLength(0);
        plane.setAttribute("transform", `translate(${startPoint.x}, ${startPoint.y})`);

        // 创建补间并暂缓播放，在更新时计算路径坐标与偏角（昂贵操作，必须按需运行）
        const flyTween = gsap.to({ progress: 0 }, {
          progress: 1,
          duration: 4.5,
          repeat: -1,
          repeatDelay: 1.5,
          ease: "power1.inOut",
          onUpdate: function () {
            const p = this.targets()[0].progress;
            const point = path.getPointAtLength(p * length);
            const nextPoint = path.getPointAtLength(Math.min(0.999, p + 0.005) * length);
            const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI;
            plane.setAttribute("transform", `translate(${point.x}, ${point.y}) rotate(${angle})`);
          }
        });

        flyTween.pause();

        // 用 ScrollTrigger 联动在可视区域内才播放，不可见时暂停以节省 CPU
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top 95%",
          end: "bottom -50px",
          onEnter: () => flyTween.play(),
          onLeave: () => flyTween.pause(),
          onEnterBack: () => flyTween.play(),
          onLeaveBack: () => flyTween.pause()
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [totalDays, stats]);

  return (
    <div ref={containerRef} className="w-full py-10 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
      {/* 模块标题 */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-gold">
            被时间认真记下的日常
          </span>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-charcoal dark:text-cream">
            陪伴档案馆
          </h2>
        </div>
        <p className="text-sm tone-muted max-w-md font-sans">
          时光如水，而数字是我们携手走过四季最忠实的刻度。
        </p>
      </div>

      {/* Bento Grid 布局 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 卡片 1: 相识天数 (双倍宽) */}
        <div className="md:col-span-2 relative overflow-hidden bg-amber-50/40 dark:bg-amber-950/10 border border-amber-900/10 dark:border-amber-400/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between group hover:border-amber-900/20 dark:hover:border-amber-400/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gold/12 rounded-xl text-gold">
              <Calendar className="w-6 h-6 stroke-[1.5]" />
            </div>
            <span className="text-xs font-mono text-charcoal/42 dark:text-cream/42">始于 {stats.startDate}</span>
          </div>
          <div className="mt-8">
            <span className="text-sm font-medium text-charcoal/58 dark:text-cream/58">
              我们携手走过了
            </span>
            <div className="mt-1 flex items-baseline font-sans">
              <span ref={daysRef} className="text-5xl font-semibold tracking-[-0.04em] text-charcoal dark:text-cream sm:text-6xl">
                0
              </span>
              <span className="ml-2 text-lg font-medium text-gold">天</span>
            </div>
            <p className="text-xs tone-muted mt-3 leading-relaxed max-w-sm">
              从相遇那天起，时间的每一格走动都充满了心动的旋律，我们正一起奔向未来的每一个日落。
            </p>
          </div>
        </div>

        {/* 卡片 2: 共同去过的城市 */}
        <div className="bg-cream/40 dark:bg-charcoal/40 border border-charcoal/8 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-charcoal/15 dark:hover:border-white/20 transition-all duration-300">
          <div className="p-3 bg-gold/12 rounded-xl text-gold w-fit">
            <Compass className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="mt-8">
            <span className="text-sm font-medium text-charcoal/58 dark:text-cream/58">
              共同涉足的城市
            </span>
            <div className="mt-1 flex items-baseline font-sans">
              <span ref={citiesRef} className="text-5xl font-semibold tracking-[-0.04em] text-charcoal dark:text-cream">
                0
              </span>
              <span className="ml-2 text-lg font-medium text-gold">个</span>
            </div>
            <p className="text-xs tone-muted mt-2">在大理、阿那亚、西岸的街角，都留下了我们的欢笑。</p>
          </div>
        </div>

        {/* 卡片 3: 一起看过的电影 */}
        <div className="bg-cream/40 dark:bg-charcoal/40 border border-charcoal/8 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-charcoal/15 dark:hover:border-white/20 transition-all duration-300">
          <div className="p-3 bg-gold/12 rounded-xl text-gold w-fit">
            <Film className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="mt-8">
            <span className="text-sm font-medium text-charcoal/58 dark:text-cream/58">
              并肩观看的影作
            </span>
            <div className="mt-1 flex items-baseline font-sans">
              <span ref={movieRef} className="text-5xl font-semibold tracking-[-0.04em] text-charcoal dark:text-cream">
                0
              </span>
              <span className="ml-2 text-lg font-medium text-gold">部</span>
            </div>
            <p className="text-xs tone-muted mt-2">影院的荧幕亮起又熄灭，而在黑暗中紧握的双手从未放开。</p>
          </div>
        </div>

        {/* 卡片 4: 共同飞行里程 (双倍宽) */}
        <div className="md:col-span-2 relative overflow-hidden bg-cream/40 dark:bg-charcoal/40 border border-charcoal/8 dark:border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-charcoal/15 dark:hover:border-white/20 transition-all duration-300">
          <div className="flex-1 flex flex-col justify-between h-full">
            <div>
              <span className="text-sm font-medium text-charcoal/58 dark:text-cream/58">
                双奔赴的轨迹
              </span>
              <div className="mt-2 flex items-baseline font-sans">
                <span ref={flightRef} className="text-4xl font-semibold tracking-[-0.04em] text-charcoal dark:text-cream sm:text-5xl">
                  0
                </span>
                <span className="ml-2 text-lg font-medium text-gold">公里</span>
              </div>
            </div>
            <p className="text-xs tone-muted mt-4 max-w-xs leading-relaxed">
              云端之上的每一次飞翔，都是奔向对方怀抱的倒计时，地平线退去，你就在终点。
            </p>
          </div>
          <div className="w-full sm:w-48 h-32 relative bg-charcoal/5 dark:bg-white/5 rounded-xl border border-charcoal/8 dark:border-white/10 overflow-hidden flex items-center justify-center shrink-0">
            <svg viewBox="0 0 200 100" className="w-full h-full p-2">
              <path
                ref={pathRef}
                id="flight-path"
                d="M 15 80 C 40 10, 80 15, 110 55 C 130 80, 160 70, 185 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                className="text-charcoal/30 dark:text-cream/30"
              />
              <g ref={planeRef} className="text-amber-800 dark:text-amber-400">
                {/* 纸飞机 SVG */}
                <polygon points="0,-4 10,0 0,4 2,0" fill="currentColor" />
              </g>
            </svg>
          </div>
        </div>

        {/* 卡片 5: 一起吃过的火锅/大餐 (双倍宽) */}
        <div className="md:col-span-2 bg-cream/40 dark:bg-charcoal/40 border border-charcoal/8 dark:border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-charcoal/15 dark:hover:border-white/20 transition-all duration-300">
          <div className="flex-1 flex flex-col justify-between h-full">
            <div>
              <span className="text-sm font-medium text-charcoal/58 dark:text-cream/58">
                分享过的人间烟火
              </span>
              <div className="mt-2 flex items-baseline font-sans">
                <span ref={mealRef} className="text-4xl font-semibold tracking-[-0.04em] text-charcoal dark:text-cream sm:text-5xl">
                  0
                </span>
                <span className="ml-2 text-lg font-medium text-gold">顿火锅/大餐</span>
              </div>
            </div>
            <p className="text-xs tone-muted mt-4 max-w-xs leading-relaxed">
              热气腾腾的火锅，翻滚的是我们最平实真挚的温情。唯美食与爱，不可辜负。
            </p>
          </div>
          <div className="w-24 h-24 bg-gold/12 rounded-2xl flex items-center justify-center text-gold shrink-0">
            <Utensils className="w-12 h-12 stroke-[1.2]" />
          </div>
        </div>
      </div>
    </div>
  );
}

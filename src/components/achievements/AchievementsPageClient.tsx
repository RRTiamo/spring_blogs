"use client";

import React, { useState, useEffect, useRef } from "react";
import { Award, Compass, RefreshCw } from "lucide-react";
import gsap from "gsap";
import CertificateCard, { Achievement } from "./CertificateCard";
import { getAchievementsList, getAchievementMetasList } from "@/api/achievements";
import PinMedal from "./PinMedal";
import AchievementModal from "./AchievementModal";

export interface AchievementMeta {
  id: number;
  type: string; // category or level
  name: string;
  code: string;
  icon?: string;
}

const defaultMetas: AchievementMeta[] = [
  { id: 1, type: "category", name: "重大里程碑", code: "milestone", icon: "i-mdi-trophy-outline" },
  { id: 2, type: "category", name: "生活纪实", code: "life", icon: "i-mdi-notebook-outline" },
  { id: 3, type: "category", name: "日常善举", code: "daily", icon: "i-mdi-heart-outline" },
  { id: 4, type: "level", name: "史诗 (Gold)", code: "gold", icon: "i-mdi-medal-outline" },
  { id: 5, type: "level", name: "稀有 (Silver)", code: "silver", icon: "i-mdi-medal-outline" },
  { id: 6, type: "level", name: "日常 (Bronze)", code: "bronze", icon: "i-mdi-medal-outline" }
];

interface AchievementsPageClientProps {
  initialItems: Achievement[];
  initialMetas: AchievementMeta[];
}

export default function AchievementsPageClient({ initialItems, initialMetas }: AchievementsPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);
  const [items, setItems] = useState<Achievement[]>(initialItems);
  const [metas, setMetas] = useState<AchievementMeta[]>(
    initialMetas && initialMetas.length > 0 ? initialMetas : defaultMetas
  );
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 刷新与载入数据
  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await getAchievementsList();
      const payload = res.data;
      if (payload?.code === 200 && Array.isArray(payload.data)) {
        setItems(payload.data);
        // 判断后端是否使用了 Mock 降级
        setIsDemoMode(payload.msg?.includes("演示") || false);
      }
      
      const metaRes = await getAchievementMetasList();
      const metaPayload = metaRes.data;
      if (metaPayload?.code === 200 && Array.isArray(metaPayload.data) && metaPayload.data.length > 0) {
        setMetas(metaPayload.data);
      } else if (metaPayload?.code === 200 && Array.isArray(metaPayload.data)) {
        setMetas(defaultMetas);
      }
    } catch (err) {
      console.warn("Failed to fetch achievements or metas from API, using initial SSR data.", err);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 首次进入检测
    if (initialItems.length === 0 || initialMetas.length === 0) {
      fetchAchievements();
    }
  }, [initialItems, initialMetas]);

  // 当列表改变或过滤改变时，应用 GSAP 开场 Stagger 卡片渐现动效
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // 严防 GSAP target not found: 确保卡片节点存在
      const cards = gsap.utils.toArray(".ach-card-anim");
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            scale: 0.85,
            y: 30,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: "back.out(1.2)",
            clearProps: "transform", // 动画结束后清除 transform 属性以支持 Hover CSS/GSAP 倾斜
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [activeFilter, items, loading]);

  // 过滤逻辑
  const categories = metas.filter(m => m.type === "category");

  const filteredItems = items.filter(
    (item) => activeFilter === "all" || item.category === activeFilter
  );

  const displayedMilestones = filteredItems.filter((item) => item.category === "milestone");
  const displayedDailyLife = filteredItems.filter((item) => item.category !== "milestone");

  return (
    <div
      ref={containerRef}
      className="max-w-6xl mx-auto w-full px-4 md:px-8 py-24 md:py-32 relative"
    >
      {/* 3D 纸张档案垫板大背景容器 */}
      <div className="relative bg-cream/90 border border-charcoal/10 rounded-3xl p-6 md:p-12 shadow-[0_20px_50px_-20px_rgba(23,33,27,0.2)] overflow-hidden">
        
        {/* 右上角精致档案标签印花 */}
        <div className="absolute top-8 right-8 font-mono text-[8px] tracking-widest text-[#B5A891]/40 dark:text-white/20 uppercase pointer-events-none select-none text-right hidden sm:block">
          <span>ATLAS HONOR CABINET</span>
          <br />
          <span>EST. 2026.06</span>
        </div>

        {/* 栏目头部 */}
        <div className="border-b border-charcoal/10 dark:border-white/10 pb-10 mb-10 relative text-left">
          <span className="text-[10px] font-sans font-semibold tracking-widest text-charcoal/40 dark:text-white/40 uppercase flex items-center gap-1.5 select-none">
            <Award className="w-3.5 h-3.5 tone-accent animate-pulse" />
            <span>09 / Achievement Hall</span>
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal dark:text-cream mt-2 tracking-wide">
            Trophy / 成就徽章
          </h1>
          <p className="font-sans text-xs text-charcoal/50 dark:text-white/50 tracking-wider mt-3 max-w-[65ch] leading-relaxed">
            记录时光里的里程碑与日常微光。装订每一张见证成长的荣誉证书，把生活里的善意与小灵感化为别针徽章永久挂在墙上。
          </p>

          {/* 演示模式软提示 */}
          {isDemoMode && (
            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/15 text-[10px] text-amber-700 dark:text-amber-400 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              <span>数据来源于本地演示模式</span>
            </div>
          )}
        </div>

        {/* 过滤器及刷新按钮栏 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          {/* 分类过滤器按钮 */}
          <div className="inline-flex flex-wrap rounded-full bg-charcoal/5 dark:bg-white/5 p-1 border border-charcoal/5 dark:border-white/5 relative z-10 gap-1 sm:gap-0">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-charcoal text-cream dark:bg-cream dark:text-charcoal shadow-sm"
                  : "text-charcoal/50 dark:text-white/50 hover:text-charcoal dark:hover:text-cream"
              }`}
            >
              全部记录
            </button>
            {categories.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setActiveFilter(cat.code)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all cursor-pointer ${
                  activeFilter === cat.code
                    ? "bg-charcoal text-cream dark:bg-cream dark:text-charcoal shadow-sm"
                    : "text-charcoal/50 dark:text-white/50 hover:text-charcoal dark:hover:text-cream"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 刷新列表按钮 */}
          <button
            onClick={fetchAchievements}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-[10px] font-sans font-semibold tracking-wider text-charcoal/50 dark:text-white/50 hover:text-charcoal dark:hover:text-cream transition-all cursor-pointer bg-transparent border-0 outline-none disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>刷新档案库</span>
          </button>
        </div>

        {/* 主加载中状态 */}
        {loading ? (
          <div className="flex justify-center items-center py-20 relative z-10">
            <div className="w-10 h-10 border-4 border-charcoal/10 border-t-charcoal dark:border-white/10 dark:border-t-cream rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-12 relative z-10">
            {/* SECTION 1: 重大里程碑 (相框证书墙) */}
            {displayedMilestones.length > 0 && (
              <div>
                <h3 className="font-serif text-sm font-bold text-charcoal/40 dark:text-white/40 tracking-wider mb-6 text-left border-l-2 border-amber-600/30 pl-3">
                  📜 里程碑大奖状 (Milestones & Credentials)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedMilestones.map((item) => (
                    <CertificateCard
                      key={item.id}
                      achievement={item}
                      onClick={() => setActiveAchievement(item)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: 日常成就 (软木板别针勋章墙) */}
            {displayedDailyLife.length > 0 && (
              <div>
                <h3 className="font-serif text-sm font-bold text-charcoal/40 dark:text-white/40 tracking-wider mb-6 text-left border-l-2 border-amber-600/30 pl-3">
                  📌 闪光日常别针 (Pins & Badges)
                </h3>

                {/* 拟真软木板质感背景 */}
                <div className="relative rounded-2xl p-6 md:p-10 border-2 border-dashed border-[#CFD8DC] dark:border-white/10 bg-[#FAF7F0] dark:bg-[#181D1A] overflow-hidden shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)]">
                  {/* 木板的年轮/纤维纹理微动效 */}
                  <div className="absolute inset-0 bg-[#D7CCC8]/5 pointer-events-none" />
                  
                  {/* 勋章别针以小网格紧凑呈现，形成错落钉在板上的质感 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 justify-center">
                    {displayedDailyLife.map((item) => (
                      <PinMedal
                        key={item.id}
                        achievement={item}
                        onClick={() => setActiveAchievement(item)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 当无数据符合搜索时的状态 */}
            {displayedMilestones.length === 0 && displayedDailyLife.length === 0 && (
              <div className="py-20 text-center">
                <Compass className="w-12 h-12 tone-accent opacity-30 mx-auto mb-3" />
                <p className="text-sm tone-muted">没有符合当前分类的成就记录。</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 模块化成就查看详情浮窗 */}
      <AchievementModal
        achievement={activeAchievement}
        onClose={() => setActiveAchievement(null)}
      />
    </div>
  );
}

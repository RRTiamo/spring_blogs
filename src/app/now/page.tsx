"use client";

import LocationCard from "@/components/now/LocationCard";
import FocusCard from "@/components/now/FocusCard";
import ReadingCard from "@/components/now/ReadingCard";
import ListeningCard from "@/components/now/ListeningCard";
import MoodCard from "@/components/now/MoodCard";
import SetupCard from "@/components/now/SetupCard";
import { notFound } from "next/navigation";
import { useSysConfig } from "@/hooks/useSysConfig";

export default function NowPage() {
  const { isPageEnabled, configs, loading } = useSysConfig();

  if (!loading && !isPageEnabled("page.now.enable", true)) {
    notFound();
    return null;
  }

  // 尝试反序列化此时此刻内容数据
  let nowData: any = null;
  const nowConfig = configs.find((c) => c.configKey === "now.content.json");
  if (nowConfig && nowConfig.configValue) {
    try {
      nowData = JSON.parse(nowConfig.configValue);
    } catch (e) {
      console.warn("Failed to parse now.content.json", e);
    }
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-24 md:py-32">
      <div className="bg-cream/90 border border-charcoal/10 rounded-3xl p-8 md:p-12 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)]">
        {/* 栏目头部 */}
        <div className="border-b border-charcoal/10 dark:border-white/10 pb-10 mb-12">
          <span className="text-[10px] font-sans font-semibold tracking-widest text-charcoal/40 dark:text-white/40 uppercase">
            07 / Live Status
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal dark:text-cream mt-2">
            Now / 此时此刻
          </h1>
          <p className="font-sans text-xs text-charcoal/50 dark:text-white/50 tracking-wider mt-2">
            这是根据 nownownow.com 理念建立的现状版，定期同步我当前生活的关注点。最近更新时间：2026年06月24日。
          </p>
        </div>

        {/* 主面板布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* 左侧超大号 Serif NOW 排版 */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="font-serif text-8xl md:text-9xl font-light tracking-tighter text-charcoal/10 dark:text-white/5 select-none">
              NOW.
            </div>
            <div className="border-l-2 border-gold/40 pl-4 py-1 space-y-2">
              <p className="text-xs uppercase font-semibold font-sans tracking-widest text-charcoal dark:text-cream">
                Focusing on Less / 专注当下
              </p>
              <p className="text-xs font-sans font-light leading-relaxed text-charcoal/50 dark:text-white/50 tracking-wider">
                “不盲从，不浮躁。在一行代码与一格快门里，寻回自我的稳定叙事。”
              </p>
            </div>
          </div>

          {/* 右侧 Bento 卡片网格 */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 地点 (横跨两栏) */}
            <LocationCard data={nowData?.location} />
            
            {/* 正在研究 */}
            <FocusCard data={nowData?.focus} />
            
            {/* 正在阅读 */}
            <ReadingCard data={nowData?.reading} />
            
            {/* 正在循环 */}
            <ListeningCard data={nowData?.listening} />
            
            {/* 精神状态 */}
            <MoodCard data={nowData?.mood} />
            
            {/* 工具设备 (横跨两栏) */}
            <SetupCard data={nowData?.setup} />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Monitor } from "lucide-react";

interface Device {
  name: string;
  spec: string;
  type: string;
  badge: string;
  lightColor: string;
  desc: string;
}

interface SetupData {
  descText?: string;
  devices?: Device[];
}

export default function SetupCard({ data }: { data?: SetupData }) {
  const descText = data?.descText || "在数字比特的严密逻辑与感光溴化银的物理颗粒之间，探寻并记录生活的两面。";
  const devices = data?.devices || [
    {
      name: "MacBook Pro",
      spec: "14-inch / M-Series",
      type: "Digital Base / 调试终端",
      badge: "TS · NEXT.JS",
      lightColor: "bg-emerald-500 shadow-emerald-500/50",
      desc: "运行与调试 TypeScript 逻辑，打磨像素交互细节",
    },
    {
      name: "Leica M6",
      spec: "Classic Rangefinder",
      type: "Analog Soul / 银盐旁轴",
      badge: "35MM FILM",
      lightColor: "bg-red-500 shadow-red-500/50",
      desc: "装填 35mm 银盐反转片，以物理快门对焦城市叙事",
    },
    {
      name: "Contax T2",
      spec: "Carl Zeiss Sonnar 38mm",
      type: "Compact Pocket / 随身行纪",
      badge: "ZEISS T*",
      lightColor: "bg-amber-500 shadow-amber-500/50",
      desc: "袖珍钛合金机身，记录生活日常 of 无声切片",
    },
  ];

  return (
    <div className="relative overflow-hidden border border-charcoal/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-6 md:p-8 flex flex-col justify-between group hover:border-charcoal/30 dark:hover:border-white/30 transition-all duration-300 md:col-span-2 rounded-2xl shadow-sm min-h-[320px]">
      {/* 精致小角饰 */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-charcoal/30 dark:border-white/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-charcoal/30 dark:border-white/30" />

      {/* 顶栏分类 */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 border border-charcoal/5 bg-cream-dark rounded-full shadow-sm">
            <Monitor className="w-5 h-5 text-gold stroke-[1.25]" />
          </div>
          <span className="text-[10px] font-sans tracking-widest text-charcoal/40 dark:text-white/40 uppercase font-semibold">
            Setup / 工具设备
          </span>
        </div>

        {/* 硬件面板标识 */}
        <div className="text-[8px] font-mono tracking-widest text-charcoal/30 dark:text-white/30 uppercase flex items-center space-x-2">
          <span>CONSOLE V2.6</span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400/40" />
          <span>PWR: ON</span>
        </div>
      </div>

      {/* 核心排布：三大硬件插槽 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 relative z-10">
        {devices.map((dev, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden border border-charcoal/5 bg-cream-dark/30 p-5 rounded-xl group/slot hover:bg-cream-dark/50 hover:border-charcoal/20 transition-all duration-300 flex flex-col justify-between min-h-[160px]"
          >
            {/* 模拟硬件面板定位钉 SVG */}
            <div className="absolute top-2 right-2 opacity-25 dark:opacity-15">
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="3" cy="3" r="2.5" stroke="currentColor" strokeWidth="0.5" />
                <line x1="3" y1="1" x2="3" y2="5" stroke="currentColor" strokeWidth="0.5" />
                <line x1="1" y1="3" x2="5" y2="3" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>

            {/* 扫光微效 (Shimmer) */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover/slot:translate-x-[100%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="space-y-3">
              {/* 卡槽设备头 */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-charcoal dark:text-cream leading-tight">
                    {dev.name}
                  </h4>
                  <span className="text-[8px] font-mono text-charcoal/35 dark:text-white/35 block mt-0.5 uppercase tracking-wide">
                    {dev.spec}
                  </span>
                </div>
                {/* 状态指示小灯 */}
                <div className={`w-1.5 h-1.5 rounded-full ${dev.lightColor} animate-pulse shadow-[0_0_8px_var(--tw-shadow-color)]`} />
              </div>

              {/* 描述文案 */}
              <p className="text-[11px] font-sans font-light leading-relaxed text-charcoal/60 dark:text-white/70 tracking-wide">
                {dev.desc}
              </p>
            </div>

            {/* 卡槽标签 */}
            <div className="mt-4 pt-3 border-t border-charcoal/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-[7px] font-mono text-charcoal/40 dark:text-white/40 tracking-wider">
                {dev.type}
              </span>
              <span className="text-[8px] font-mono text-gold bg-gold/10 px-1.5 py-0.5 rounded scale-90 tracking-widest uppercase font-semibold">
                {dev.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 底部融合文案 */}
      <div className="relative z-10 pt-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-2 border-t border-charcoal/5 dark:border-white/5 text-charcoal/50 dark:text-white/50 text-[10px]">
        <p className="font-sans font-light tracking-wide">
          {descText}
        </p>
        <span className="font-mono tracking-widest uppercase shrink-0">
          SYS STATUS: NOMINAL
        </span>
      </div>
    </div>
  );
}

"use client";

import { Heart } from "lucide-react";

export default function LoveQuote() {
  return (
    <section className="px-4 pt-10 pb-28 sm:px-6 md:pt-12 md:pb-36 lg:px-8">
      <div className="home-card-reveal relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-rose-500/15 bg-gradient-to-br from-cream-dark/80 via-cream/65 to-rose-400/15 p-7 shadow-[0_18px_44px_-26px_rgba(244,63,94,0.3)] backdrop-blur dark:border-white/10 dark:from-white/8 dark:via-white/[0.04] dark:to-rose-500/10 md:p-10">
        {/* 装饰性双引号背景字 */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-1 -top-7 select-none font-serif text-[8rem] leading-none text-rose-500/10 dark:text-rose-500/20 md:text-[10rem]"
        >
          ”
        </span>
        {/* 暖粉色柔光晕 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-rose-300/25 blur-3xl dark:bg-rose-500/15"
        />

        <div className="relative grid gap-6 md:grid-cols-[auto_1fr] md:items-start md:gap-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20">
            <Heart className="h-5 w-5 stroke-[1.6]" />
          </div>
          <div className="space-y-4">
            <p className="text-pretty text-xl font-semibold leading-snug text-charcoal dark:text-cream md:text-[1.7rem]">
              我们携手走过四季，把时间酿成记忆。
            </p>
            <p className="max-w-xl text-sm leading-7 text-charcoal/62 dark:text-cream/68">
              我喜欢把这句话放在恋爱记的末尾。它提醒我们，每一个稀疏平常的日常里，有你在身旁，就是最温柔的时光档案馆。
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="h-px w-8 bg-rose-500/45" />
              <p className="text-[13px] font-medium tracking-wide text-charcoal/55 dark:text-cream/55">
                Rrtiamo & Sweetheart · 《生活档案馆》
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

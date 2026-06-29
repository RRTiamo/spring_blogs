import { Compass } from "lucide-react";

export default function HomeQuote() {
  return (
    <section className="px-4 pt-10 pb-28 sm:px-6 md:pt-12 md:pb-36 lg:px-8">
      <div className="home-card-reveal relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-gold/15 bg-gradient-to-br from-cream-dark/80 via-cream/65 to-gold-light/15 p-7 shadow-[0_18px_44px_-26px_rgba(217,134,95,0.5)] backdrop-blur dark:border-white/10 dark:from-white/8 dark:via-white/[0.04] dark:to-gold/10 md:p-10">
        {/* 装饰性引号字形 */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-1 -top-7 select-none font-serif text-[8rem] leading-none text-gold/15 dark:text-gold/20 md:text-[10rem]"
        >
          ”
        </span>
        {/* 暖色柔光晕 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-gold-light/25 blur-3xl dark:bg-gold/15"
        />

        <div className="relative grid gap-6 md:grid-cols-[auto_1fr] md:items-start md:gap-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold ring-1 ring-gold/20">
            <Compass className="h-5 w-5 stroke-[1.6]" />
          </div>
          <div className="space-y-4">
            <p className="text-pretty text-xl font-semibold leading-snug text-charcoal dark:text-cream md:text-[1.7rem]">
              世界不是物体的集合，而是事件的集合。
            </p>
            <p className="max-w-xl text-sm leading-7 text-charcoal/60 dark:text-cream/65">
              我喜欢把这句话放在首页末尾。它提醒我，博客不只是页面的集合，而是日常事件慢慢留下来的路径。
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="h-px w-8 bg-gold/45" />
              <p className="text-[13px] font-medium tracking-wide text-charcoal/55 dark:text-cream/55">
                卡洛·罗韦利 · 《时间的秩序》
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

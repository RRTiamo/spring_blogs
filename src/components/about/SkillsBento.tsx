"use client";

interface SkillCategory {
  title: string;
  items: string[];
  layoutClass: string;
  glowColor: string;
}

export default function SkillsBento() {
  const skills: SkillCategory[] = [
    {
      title: "FRAMEWORKS / 核心架构",
      items: ["Next.js (App Router)", "React 19", "Node.js (Express)", "GraphQL", "REST APIs"],
      layoutClass: "col-span-12 md:col-span-8",
      glowColor: "group-hover:bg-gold/10",
    },
    {
      title: "WORKFLOW / 创意工具",
      items: ["Git / GitHub", "Figma Design", "Vercel / AWS", "Docker", "Sentry"],
      layoutClass: "col-span-12 md:col-span-4",
      glowColor: "group-hover:bg-blue-500/10",
    },
    {
      title: "LANGUAGES / 核心语言",
      items: ["TypeScript", "JavaScript (ES6+)", "HTML5 / CSS3", "Python / Go", "SQL"],
      layoutClass: "col-span-12 md:col-span-5",
      glowColor: "group-hover:bg-green-500/10",
    },
    {
      title: "VISUAL & MOTION / 动效与交互",
      items: ["GSAP / ScrollTrigger", "Framer Motion", "Tailwind CSS v4", "SVG Path Morphing", "WebGL / Canvas"],
      layoutClass: "col-span-12 md:col-span-7",
      glowColor: "group-hover:bg-pink-500/10",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
      {/* 标题 */}
      <div className="mb-12 flex flex-col gap-2">
        <span className="text-[10px] font-sans font-semibold tracking-[0.25em] text-gold uppercase">
          04 / CAPABILITIES
        </span>
        <h2 className="font-serif text-2xl md:text-4xl font-light text-charcoal dark:text-white">
          技能版图 / Bento Grids
        </h2>
      </div>

      {/* Bento 网格 */}
      <div className="grid grid-cols-12 gap-6">
        {skills.map((skill, idx) => (
          <div
            key={idx}
            className={`group relative overflow-hidden bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md border border-charcoal/10 dark:border-white/10 p-6 md:p-8 rounded-3xl transition-all duration-500 ease-out hover:scale-[1.015] hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] cursor-default ${skill.layoutClass}`}
          >
            {/* 四角古典微装饰线 */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-charcoal/20 dark:border-white/20 group-hover:border-gold/60 transition-colors duration-500" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-charcoal/20 dark:border-white/20 group-hover:border-gold/60 transition-colors duration-500" />

            {/* 背景发光层 */}
            <div className={`absolute -inset-24 rounded-full bg-transparent blur-[80px] opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none z-0 ${skill.glowColor}`} />

            <div className="relative z-10 space-y-6">
              {/* 分类标题 */}
              <h3 className="text-[10px] font-mono font-semibold tracking-[0.22em] text-charcoal/40 dark:text-white/40 group-hover:text-gold transition-colors duration-500 uppercase">
                {skill.title}
              </h3>

              {/* 技能标签流 */}
              <div className="flex flex-wrap gap-2.5">
                {skill.items.map((item, itemIdx) => (
                  <span
                    key={itemIdx}
                    className="text-xs font-sans font-light bg-charcoal/[0.04] dark:bg-white/[0.03] text-charcoal/80 dark:text-white/80 px-3.5 py-1.5 rounded-full border border-charcoal/5 dark:border-white/5 hover:border-gold/30 hover:bg-gold/[0.02] hover:text-gold transition-all duration-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

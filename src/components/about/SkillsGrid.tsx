interface SkillGroup {
  category: string;
  items: string[];
}

interface SkillsGridProps {
  skills: SkillGroup[];
}

export default function SkillsGrid({ skills }: SkillsGridProps) {
  return (
    <div className="space-y-8">
      {skills.map((skillGroup, idx) => (
        <div key={idx} className="border border-charcoal/10 bg-white/20 p-6 relative">
          {/* 装饰边角 */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-charcoal/30" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-charcoal/30" />

          <h3 className="text-[10px] font-sans font-semibold tracking-widest text-charcoal/40 uppercase mb-4">
            {skillGroup.category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {skillGroup.items.map((item, itemIdx) => (
              <span
                key={itemIdx}
                className="text-xs font-sans font-light bg-charcoal/5 text-charcoal/80 px-2.5 py-1 rounded-sm border border-charcoal/5 hover:border-gold hover:text-gold transition-colors duration-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

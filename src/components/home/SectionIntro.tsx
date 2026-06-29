import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ComponentType } from "react";

interface SectionIntroProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  href: string;
  action: string;
}

export default function SectionIntro({ icon: Icon, title, body, href, action }: SectionIntroProps) {
  return (
    <div className="home-card-reveal max-w-md space-y-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/14 text-gold">
        <Icon className="h-5 w-5 stroke-[1.6]" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-normal text-charcoal dark:text-cream md:text-3xl">
          {title}
        </h2>
        <p className="text-sm leading-7 text-charcoal/62 dark:text-cream/68">{body}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal dark:text-cream/70 dark:hover:text-cream"
      >
        {action}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

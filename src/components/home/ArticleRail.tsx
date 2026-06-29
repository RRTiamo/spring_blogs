import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { RefObject } from "react";
import type { Post } from "@/data/writing";
import ParallaxImage from "@/components/ui/ParallaxImage";

interface ArticleRailProps {
  posts: Post[];
  trackRef: RefObject<HTMLDivElement | null>;
}

export default function ArticleRail({ posts, trackRef }: ArticleRailProps) {
  return (
    <div className="mask-image-horizontal overflow-x-auto py-2 no-scrollbar lg:overflow-hidden">
      <div ref={trackRef} className="flex w-max gap-5 pr-4 gpu-accelerated-track">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="article-card-element group w-[270px] shrink-0 overflow-hidden rounded-[1.6rem] border border-charcoal/8 bg-white/72 p-3 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_-32px_rgba(26,26,26,0.38)] dark:border-white/10 dark:bg-white/8 sm:w-[320px]"
          >
            <Link href={`/writing/${post.slug}`} className="block">
              <div className="overflow-hidden rounded-[1.2rem]">
                <ParallaxImage
                  src={post.cover}
                  alt={post.title}
                  aspectRatio="aspect-[16/10]"
                  sizes="(min-width: 1024px) 320px, 82vw"
                  tone="warm"
                  horizontal={true}
                />
              </div>
              <div className="space-y-3 px-1 pb-2 pt-4">
                <div className="flex flex-wrap gap-2 text-[12px] text-charcoal/45 dark:text-cream/45">
                  <span>{post.date}</span>
                  <span>{post.category}</span>
                  <span>{post.mood}</span>
                </div>
                <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-charcoal transition-colors duration-300 group-hover:text-gold dark:text-cream">
                  {post.title}
                </h2>
                <p className="line-clamp-3 text-[13px] leading-6 text-charcoal/62 dark:text-cream/68">
                  {post.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-charcoal/72 dark:text-cream/72">
                  继续阅读
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

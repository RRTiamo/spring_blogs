"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Heart, Lock, Unlock } from "lucide-react";
import type { GalleryPhoto } from "@/data/gallery";
import type { LoveEntry } from "@/interface/love";
import {
  useLove,
  useLoveBucket,
  useLoveCapsules,
  useLoveStats,
} from "@/hooks/useLove";
import Lightbox from "@/components/gallery/Lightbox";
import SectionIntro from "@/components/home/SectionIntro";
import LoveArticleRail from "@/components/love/LoveArticleRail";
import LoveBucketList from "@/components/love/LoveBucketList";
import LoveGalleryRail from "@/components/love/LoveGalleryRail";
import LoveQuote from "@/components/love/LoveQuote";
import LoveStats from "@/components/love/LoveStats";
import LoveTimeCapsule from "@/components/love/LoveTimeCapsule";
import LoveTimeline from "@/components/love/LoveTimeline";
import LoveHero from "@/components/love/hero/LoveHero";
import PasscodeGate from "@/components/ui/PasscodeGate";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function galleryPhotoOfLoveEntry(entry: LoveEntry): GalleryPhoto {
  return {
    id: entry.id,
    title: entry.title || "未命名瞬间",
    date: entry.date || "",
    camera: "生活影像",
    lens: "自然视角",
    filmStock:
      entry.mood === "romantic"
        ? "柔和暖调"
        : entry.mood === "playful"
          ? "轻快日常"
          : "安静记录",
    settings: "自然光",
    location: entry.location || "未标注地点",
    src: entry.cover || "/assets/love-anniversary.png",
    description: entry.content || "",
    type: "image",
  };
}

interface LovePageClientProps {
  configs?: Record<string, string>;
}

export default function LovePageClient({ configs }: LovePageClientProps) {
  const { loveNotes, loading: notesLoading } = useLove();
  const { bucketItems, loading: bucketLoading } = useLoveBucket();
  const { capsules, loading: capsuleLoading } = useLoveCapsules();
  const { stats: loveStats, loading: statsLoading } = useLoveStats();

  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem("atlas_unlocked") === "true");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 600);

    return () => window.clearTimeout(timer);
  }, [unlocked, notesLoading, bucketLoading, capsuleLoading, statsLoading]);

  const visibleEntries = loveNotes.filter((entry) => {
    if (entry.visibility === "private" || entry.visibility === "hidden") {
      return unlocked;
    }
    return true;
  });

  const handleUnlock = () => {
    sessionStorage.setItem("atlas_unlocked", "true");
    setUnlocked(true);
    setShowGate(false);

    window.setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const handleLock = () => {
    sessionStorage.removeItem("atlas_unlocked");
    setUnlocked(false);
    setShowGate(false);
  };

  const handleScrollDown = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-cream text-charcoal transition-colors duration-500 dark:bg-charcoal dark:text-cream">
      <LoveHero
        onScrollDown={handleScrollDown}
        heroBgUrl={configs?.["page.love.heroBgUrl"]}
        atmospheresJson={configs?.["page.love.atmospheres"]}
      />

      <div
        ref={contentRef}
        className="relative w-full scroll-mt-5 bg-cream transition-colors duration-500 dark:bg-charcoal"
      >
        <div className="mx-auto flex max-w-7xl justify-end px-4 pb-3 pt-8 sm:px-6 md:pt-10 lg:px-8">
          {!unlocked ? (
            <button
              type="button"
              onClick={() => setShowGate(true)}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-charcoal shadow-[0_14px_32px_-26px_rgba(34,51,38,0.55)] transition duration-300 hover:-translate-y-0.5 hover:bg-gold/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold dark:text-cream"
            >
              <Lock className="h-4 w-4 shrink-0 stroke-[1.8]" />
              <span className="truncate">解锁私密归档</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLock}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-charcoal/10 bg-white/55 px-4 py-2 text-sm font-semibold text-charcoal shadow-[0_14px_32px_-26px_rgba(34,51,38,0.5)] transition duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold dark:border-white/12 dark:bg-white/8 dark:text-cream"
            >
              <Unlock className="h-4 w-4 shrink-0 stroke-[1.8]" />
              <span className="truncate">锁定私密归档</span>
            </button>
          )}
        </div>

        {showGate && !unlocked ? (
          <section className="mx-auto max-w-3xl px-4 py-12 transition-all duration-500 sm:px-6">
            <div className="mb-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowGate(false)}
                className="text-sm font-semibold text-charcoal/55 transition-colors hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold dark:text-cream/55 dark:hover:text-cream"
              >
                返回公开区域
              </button>
            </div>
            <PasscodeGate onUnlock={handleUnlock} />
          </section>
        ) : (
          <>
            {unlocked && <LoveStats stats={loveStats} />}
            {unlocked && <LoveTimeline entries={visibleEntries} />}

            <div className="w-full">
              <section className="relative border-y border-charcoal/8 bg-cream/45 px-4 py-8 dark:border-white/10 dark:bg-charcoal/45 sm:px-6 md:py-10 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(240px,0.32fr)_minmax(0,0.68fr)] lg:items-center">
                  <SectionIntro
                    icon={Camera}
                    title="甜蜜瞬间"
                    body="把日常光影、偶然相遇和一起停下来的时刻，按自然色彩留在这里。"
                    href="/love"
                    action="查看照片"
                  />
                  <LoveGalleryRail
                    photos={visibleEntries}
                    onSelect={(entry) => setSelectedPhoto(galleryPhotoOfLoveEntry(entry))}
                  />
                </div>
              </section>

              <section className="relative border-b border-charcoal/8 bg-cream/45 px-4 py-8 dark:border-white/10 dark:bg-charcoal/45 sm:px-6 md:py-10 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(240px,0.32fr)_minmax(0,0.68fr)] lg:items-center">
                  <SectionIntro
                    icon={Heart}
                    title="恋爱日记"
                    body="那些小笑声、绕远路和晚归路上的灯，都可以被慢慢写下来。"
                    href="/love"
                    action="阅读故事"
                  />
                  <LoveArticleRail
                    entries={visibleEntries}
                    onSelect={(entry) => setSelectedPhoto(galleryPhotoOfLoveEntry(entry))}
                  />
                </div>
              </section>
            </div>

            {unlocked && <LoveBucketList items={bucketItems} />}
            {unlocked && <LoveTimeCapsule capsules={capsules} />}
          </>
        )}

        <LoveQuote />
      </div>

      <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
}

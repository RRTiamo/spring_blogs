"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Coffee, Compass } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { GalleryPhoto } from "@/data/gallery";
import type { Post } from "@/data/writing";
import Lightbox from "@/components/gallery/Lightbox";
import ArticleRail from "@/components/home/ArticleRail";
import GalleryRail from "@/components/home/GalleryRail";
import HomeHero from "@/components/home/HomeHero";
import HomeQuote from "@/components/home/HomeQuote";
import SectionIntro from "@/components/home/SectionIntro";
import StatusGrid from "@/components/home/StatusGrid";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomePageClientProps {
  featuredPosts: Post[];
  homeGallerySlices: GalleryPhoto[];
  configs?: Record<string, string>;
}

export default function HomePageClient({
  featuredPosts,
  homeGallerySlices,
  configs,
}: HomePageClientProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const articlesSectionRef = useRef<HTMLElement>(null);
  const articlesTrackRef = useRef<HTMLDivElement>(null);
  const gallerySectionRef = useRef<HTMLElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    const setupRail = (section: HTMLElement | null, track: HTMLDivElement | null) => {
      if (!section || !track || reduceMotion || !isDesktop) return;

      const getDistance = () => {
        const viewport = track.parentElement?.clientWidth ?? window.innerWidth;
        return Math.max(0, track.scrollWidth - viewport);
      };

      if (getDistance() < 80) return;

      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 88px",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    };

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(".home-reveal, .home-card-reveal, .article-card-element, .gallery-slice-element", {
          opacity: 1,
          y: 0,
        });
        return;
      }

      gsap.fromTo(
        ".home-reveal",
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.07,
          delay: 0.1,
        }
      );

      gsap.utils.toArray<HTMLElement>(".home-card-reveal").forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            delay: index * 0.035,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 86%",
              once: true,
            },
          }
        );
      });

      gsap.fromTo(
        ".article-card-element",
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: articlesSectionRef.current,
            start: "top 82%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".gallery-slice-element",
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: gallerySectionRef.current,
            start: "top 82%",
            once: true,
          },
        }
      );

      setupRail(articlesSectionRef.current, articlesTrackRef.current);
      setupRail(gallerySectionRef.current, galleryTrackRef.current);
    }, root);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 250);

    return () => {
      window.clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen overflow-x-hidden bg-cream text-charcoal transition-colors duration-300 dark:bg-charcoal"
    >
      <HomeHero
        featuredCount={featuredPosts.length}
        galleryCount={homeGallerySlices.length}
        heroBgUrl={configs?.["page.home.heroBgUrl"]}
        welcomeText={configs?.["page.home.welcomeText"]}
        welcomeSubtitle={configs?.["page.home.welcomeSubtitle"]}
        logoText={configs?.["site.logo.text"]}
      />

      <section
        id="home-sections"
        ref={articlesSectionRef}
        className="relative border-y border-charcoal/8 px-4 py-9 dark:border-white/10 sm:px-6 md:py-11 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.34fr_0.66fr] lg:items-center">
          <SectionIntro
            icon={Coffee}
            title="精选文章"
            body="最近最想被读到的几篇，关于旅途、咖啡馆、代码和一些没那么急着说完的念头。"
            href="/writing"
            action="全部随笔"
          />
          <ArticleRail posts={featuredPosts} trackRef={articlesTrackRef} />
        </div>
      </section>

      <section className="bento-grid-trigger px-4 py-9 sm:px-6 md:py-11 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
          <SectionIntro
            icon={Compass}
            title="此时状态"
            body="不是仪表盘，更像一张小便签。记录正在读、正在做和正在循环的声音。"
            href="/now"
            action="完整状态"
          />
          <StatusGrid />
        </div>
      </section>

      <section
        ref={gallerySectionRef}
        className="relative border-y border-charcoal/8 px-4 py-9 dark:border-white/10 sm:px-6 md:py-11 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.34fr_0.66fr] lg:items-center">
          <SectionIntro
            icon={Camera}
            title="彩色相册"
            body="日常光线、旅行色彩和偶然遇见的小片段，都先以自然的颜色留在这里。"
            href="/gallery"
            action="打开相册"
          />
          <GalleryRail
            photos={homeGallerySlices}
            trackRef={galleryTrackRef}
            onSelect={setSelectedPhoto}
          />
        </div>
      </section>

      <HomeQuote />
      <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
}

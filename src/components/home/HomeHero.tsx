"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Camera, Feather, PenLine } from "lucide-react";
import SocialDock from "@/components/home/SocialDock";
import gsap from "gsap";
import TextType from "@/components/ui/TextType";

interface HomeHeroProps {
  featuredCount: number;
  galleryCount: number;
  heroBgUrl?: string;
  welcomeText?: string;
  welcomeSubtitle?: string;
  logoText?: string;
}

export default function HomeHero({ 
  featuredCount, 
  galleryCount, 
  heroBgUrl,
  welcomeText,
  welcomeSubtitle,
  logoText
}: HomeHeroProps) {
  return (
    <section className="relative isolate min-h-[100dvh] overflow-hidden bg-charcoal px-4 pt-24 text-cream sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        {heroBgUrl ? (
          heroBgUrl.match(/\.(mp4|webm|ogg|mov|m4v)($|\?)/i) ? (
            <video
              src={heroBgUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover object-[62%_center] brightness-[0.82] saturate-[1.14] dark:brightness-[0.7]"
            />
          ) : (
            <Image
              src={heroBgUrl}
              alt="主页开屏背景"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[62%_center] brightness-[0.82] saturate-[1.14] dark:brightness-[0.7]"
            />
          )
        ) : (
          <Image
            src="/bg-image.png"
            alt="月色与花枝"
            fill
            preload
            sizes="100vw"
            className="object-cover object-[62%_center] brightness-[0.82] saturate-[1.14] dark:brightness-[0.7]"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,33,27,0.82)_0%,rgba(23,33,27,0.46)_42%,rgba(23,33,27,0.12)_74%),linear-gradient(180deg,rgba(23,33,27,0.24)_0%,rgba(23,33,27,0.08)_50%,rgba(23,33,27,0.62)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_42%,rgba(247,248,241,0.2),transparent_34%),radial-gradient(circle_at_68%_28%,rgba(217,134,95,0.22),transparent_32%)] dark:bg-[radial-gradient(circle_at_20%_42%,rgba(241,244,234,0.13),transparent_34%),radial-gradient(circle_at_68%_28%,rgba(241,167,124,0.18),transparent_32%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-6xl flex-col justify-center pb-44 sm:pb-48 lg:pb-52">
        <div className="home-reveal max-w-full sm:max-w-3xl">
          <div
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                y: -4,
                backgroundColor: "rgba(255, 255, 255, 0.18)",
                borderColor: "rgba(255, 255, 255, 0.35)",
                duration: 0.35,
                ease: "power2.out",
              });
              const imgContainer = e.currentTarget.querySelector(".avatar-img-container");
              if (imgContainer) {
                gsap.to(imgContainer, { rotate: 6, duration: 0.4, ease: "back.out(1.7)" });
              }
              const img = e.currentTarget.querySelector("img");
              if (img) {
                gsap.to(img, { scale: 1.1, duration: 0.4, ease: "power2.out" });
              }
              const txt = e.currentTarget.querySelector(".avatar-text");
              if (txt) {
                gsap.to(txt, { color: "#ffffff", duration: 0.3 });
              }
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                y: 0,
                backgroundColor: "rgba(255, 255, 255, 0.14)",
                borderColor: "rgba(255, 255, 255, 0.22)",
                duration: 0.35,
                ease: "power2.out",
              });
              const imgContainer = e.currentTarget.querySelector(".avatar-img-container");
              if (imgContainer) {
                gsap.to(imgContainer, { rotate: 0, duration: 0.4, ease: "power2.out" });
              }
              const img = e.currentTarget.querySelector("img");
              if (img) {
                gsap.to(img, { scale: 1, duration: 0.4, ease: "power2.out" });
              }
              const txt = e.currentTarget.querySelector(".avatar-text");
              if (txt) {
                gsap.to(txt, { color: "rgba(247, 248, 241, 0.82)", duration: 0.3 });
              }
            }}
            className="group inline-flex max-w-full items-center gap-3 rounded-full border border-white/22 bg-white/14 px-3 py-2 shadow-[0_18px_60px_-32px_rgba(0,0,0,0.65)] backdrop-blur-md cursor-pointer"
          >
            <div className="avatar-img-container relative h-11 w-11 overflow-hidden rounded-full border border-white/45 bg-white/55 p-0.5">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src="/assets/avtor-boy.jpg"
                  alt="Rrtiamo"
                  fill
                  loading="eager"
                  sizes="44px"
                  className="object-cover saturate-[1.08]"
                />
              </div>
            </div>
            <span className="avatar-text min-w-0 text-[13px] font-medium text-cream/82">
              个人博客 / 生活记录 / 彩色相册
            </span>
          </div>

          <div className="mt-8 max-w-full space-y-5 sm:max-w-3xl">
            <h1 className="font-hero-h text-[3.55rem] font-semibold leading-[0.95] tracking-normal text-cream drop-shadow-[0_18px_48px_rgba(0,0,0,0.28)] sm:text-7xl md:text-8xl">
              <TextType
                text={[logoText || "Rrtiamo", welcomeText || "Spring Breeze", welcomeSubtitle || "此间主人"]}
                typingSpeed={90}
                deletingSpeed={50}
                pauseDuration={2500}
                showCursor={true}
                cursorCharacter="|"
                cursorClassName="text-gold ml-1.5"
                as="span"
              />
            </h1>
            <p className="max-w-[32rem] break-words text-[15px] leading-8 text-cream/78 md:text-base">
              写一点代码，拍一些照片，记下那些普通但值得被留下的日子。
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/writing"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  y: -4,
                  scale: 1.02,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 24px 48px -18px rgba(0,0,0,0.8)",
                  duration: 0.35,
                  ease: "power2.out",
                });
                const icon = e.currentTarget.querySelector("svg");
                if (icon) {
                  gsap.to(icon, { rotate: 8, scale: 1.1, duration: 0.3, ease: "power2.out" });
                }
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  y: 0,
                  scale: 1,
                  backgroundColor: "#f7f8f1",
                  boxShadow: "0 18px 42px -24px rgba(0,0,0,0.7)",
                  duration: 0.35,
                  ease: "power2.out",
                });
                const icon = e.currentTarget.querySelector("svg");
                if (icon) {
                  gsap.to(icon, { rotate: 0, scale: 1, duration: 0.3, ease: "power2.out" });
                }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-sm font-semibold text-charcoal shadow-[0_18px_42px_-24px_rgba(0,0,0,0.7)]"
            >
              <PenLine className="h-4 w-4" />
              随笔
            </Link>
            <Link
              href="/gallery"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  y: -4,
                  scale: 1.02,
                  backgroundColor: "rgba(255, 255, 255, 0.18)",
                  borderColor: "rgba(255, 255, 255, 0.42)",
                  color: "#ffffff",
                  boxShadow: "0 24px 48px -18px rgba(0,0,0,0.8)",
                  duration: 0.35,
                  ease: "power2.out",
                });
                const icon = e.currentTarget.querySelector("svg");
                if (icon) {
                  gsap.to(icon, { rotate: -8, scale: 1.1, duration: 0.3, ease: "power2.out" });
                }
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  y: 0,
                  scale: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.24)",
                  color: "rgba(247, 248, 241, 0.86)",
                  boxShadow: "none",
                  duration: 0.35,
                  ease: "power2.out",
                });
                const icon = e.currentTarget.querySelector("svg");
                if (icon) {
                  gsap.to(icon, { rotate: 0, scale: 1, duration: 0.3, ease: "power2.out" });
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-white/12 px-5 py-3 text-sm font-medium text-cream/86 shadow-sm backdrop-blur-md"
            >
              <Camera className="h-4 w-4" />
              相册
            </Link>
            <SocialDock />
          </div>

        </div>

        <div className="home-reveal absolute inset-x-0 bottom-28 mx-auto flex w-full max-w-6xl items-end justify-start px-2 text-left text-[13px] text-cream/68 sm:bottom-32 sm:justify-between lg:bottom-36">
          <div className="hidden items-center gap-3 rounded-full border border-white/16 bg-white/12 px-4 py-2 shadow-[0_14px_48px_-32px_rgba(0,0,0,0.8)] backdrop-blur-md sm:flex">
            <Feather className="h-4 w-4 text-gold-light" />
            <span>{featuredCount} 篇精选文章</span>
            <span className="h-1 w-1 rounded-full bg-cream/35" />
            <span>{galleryCount} 个相册切片</span>
          </div>
          <a
            href="#home-sections"
            className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/12 px-4 py-2 shadow-[0_14px_48px_-32px_rgba(0,0,0,0.8)] backdrop-blur-md transition-colors hover:border-white/34 hover:text-cream sm:ml-auto"
          >
            进入首页
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="home-hero-wave pointer-events-none absolute inset-x-0 bottom-0 z-[3]" aria-hidden="true">
        <svg
          className="waves"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="home-gentle-wave"
              d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
            />
          </defs>
          <g className="wave-parallax">
            <use href="#home-gentle-wave" x="48" y="0" className="wave-layer wave-layer-1" />
            <use href="#home-gentle-wave" x="48" y="3" className="wave-layer wave-layer-2" />
            <use href="#home-gentle-wave" x="48" y="5" className="wave-layer wave-layer-3" />
            <use href="#home-gentle-wave" x="48" y="7" className="wave-layer wave-layer-4" />
          </g>
        </svg>
      </div>
    </section>
  );
}

import { Mail } from "lucide-react";
import { GithubLogo, XLogo } from "@phosphor-icons/react";
import gsap from "gsap";

export default function SocialDock() {
  return (
    <div
      onMouseEnter={(e) => {
        gsap.to(e.currentTarget, {
          y: -4,
          backgroundColor: "rgba(255, 255, 255, 0.18)",
          borderColor: "rgba(255, 255, 255, 0.42)",
          boxShadow: "0 20px 48px -18px rgba(0,0,0,0.75)",
          duration: 0.35,
          ease: "power2.out",
        });
      }}
      onMouseLeave={(e) => {
        gsap.to(e.currentTarget, {
          y: 0,
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          borderColor: "rgba(255, 255, 255, 0.24)",
          boxShadow: "none",
          duration: 0.35,
          ease: "power2.out",
        });
      }}
      className="flex items-center gap-1 rounded-full border border-white/24 bg-white/12 px-3 py-2 shadow-sm backdrop-blur-md"
    >
      <a
        href="https://github.com"
        target="_blank"
        rel="noreferrer"
        onMouseEnter={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1.15,
            color: "#ffffff",
            backgroundColor: "rgba(255,255,255,0.12)",
            duration: 0.25,
            ease: "power2.out",
          });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1,
            color: "rgba(247, 248, 241, 0.8)",
            backgroundColor: "transparent",
            duration: 0.25,
            ease: "power2.out",
          });
        }}
        className="rounded-full p-1.5 text-cream/80"
        aria-label="GitHub"
      >
        <GithubLogo className="h-4 w-4" weight="regular" />
      </a>
      <a
        href="https://twitter.com"
        target="_blank"
        rel="noreferrer"
        onMouseEnter={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1.15,
            color: "#ffffff",
            backgroundColor: "rgba(255,255,255,0.12)",
            duration: 0.25,
            ease: "power2.out",
          });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1,
            color: "rgba(247, 248, 241, 0.8)",
            backgroundColor: "transparent",
            duration: 0.25,
            ease: "power2.out",
          });
        }}
        className="rounded-full p-1.5 text-cream/80"
        aria-label="X"
      >
        <XLogo className="h-4 w-4" weight="regular" />
      </a>
      <a
        href="mailto:contact@domain.com"
        onMouseEnter={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1.15,
            color: "#ffffff",
            backgroundColor: "rgba(255,255,255,0.12)",
            duration: 0.25,
            ease: "power2.out",
          });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1,
            color: "rgba(247, 248, 241, 0.8)",
            backgroundColor: "transparent",
            duration: 0.25,
            ease: "power2.out",
          });
        }}
        className="rounded-full p-1.5 text-cream/80"
        aria-label="Email"
      >
        <Mail className="h-4 w-4" />
      </a>
    </div>
  );
}

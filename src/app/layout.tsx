import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Playfair_Display, Space_Grotesk, Space_Mono, Jost, Noto_Serif_SC, Ma_Shan_Zheng } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/ui/SmoothScroll";
import StyleConsole from "@/components/ui/StyleConsole";
import BackToTop from "@/components/ui/BackToTop";
import ArchivePlayer from "@/components/ui/ArchivePlayer";
import ThemeApplier from "@/components/ui/ThemeApplier";
import { getPublicConfigSnapshot } from "@/api/config";
import { SysConfigProvider } from "@/hooks/useSysConfig";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  preload: false,
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const maShanZheng = Ma_Shan_Zheng({
  variable: "--font-ma-shan-zheng",
  weight: "400",
  subsets: ["latin"],
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  let title = "春风不解别离 | 个人生活档案馆";
  let faviconUrl = "/icon.png";
  const configs = await getPublicConfigSnapshot();
  const titleItem = configs.find((config) => config.configKey === "site.title.default");
  if (titleItem?.configValue) title = titleItem.configValue;
  const faviconItem = configs.find((config) => config.configKey === "site.favicon.url");
  if (faviconItem?.configValue) {
    faviconUrl = faviconItem.configValue;
    }

  return {
    title,
    description: "春风得意马蹄疾，不信人间有别离。承载思想随笔、时间胶囊、恋爱纪实与日常影像的私人电子展厅。",
    icons: {
      icon: faviconUrl,
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const configs = await getPublicConfigSnapshot();

  return (
    <html
      lang="zh"
      className={`${inter.variable} ${cormorant.variable} ${playfair.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${jost.variable} ${notoSerifSC.variable} ${maShanZheng.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-charcoal bg-transparent">
        <SysConfigProvider initialConfigs={configs}>
        <ThemeApplier />
        {/* 1. 全局底色层 (z-0) */}
        <div className="fixed inset-0 z-0 bg-cream pointer-events-none" />

        {/* 2. 静态高定背景图片层 (z-1) */}
        <div 
          className="fixed inset-0 z-1 pointer-events-none bg-cover bg-center bg-image-layer"
          style={{ backgroundImage: "url('/bg-image.png')" }}
        />

        {/* 2.5 霓虹发光灯效层 (仅在 Glassmorphic 风格下可见) */}
        <div className="fixed inset-0 z-[2] opacity-0 pointer-events-none transition-opacity duration-1000 glass-glows overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-pink-500/10 dark:bg-pink-500/15 blur-[120px]" />
          <div className="absolute bottom-[15%] right-[5%] w-[50vw] h-[50vw] rounded-full bg-blue-500/15 dark:bg-blue-500/20 blur-[150px]" />
        </div>

        {/* 3. 电影胶片质感颗粒图层 (z-50, 保证极弱噪点铺在最上层) */}
        <div className="film-grain" />

        {/* 4. 网页主内容容器 (z-10)，拥有显式正值 z-index，保证所有文字、按钮绝对不被背景或视频遮挡 */}
        <div className="relative z-10 min-h-full flex flex-col">
          <SmoothScroll>
            <Navbar />
            <main className="grow flex flex-col">{children}</main>
            <Footer />
          </SmoothScroll>
        </div>

        {/* 6. 悬浮的视觉控制中心 */}
        <StyleConsole />

        {/* 7. 全局回到顶部按钮 */}
        <BackToTop />

        {/* 8. 沉浸式音乐播放器 */}
        <ArchivePlayer />
        </SysConfigProvider>
      </body>
    </html>
  );
}

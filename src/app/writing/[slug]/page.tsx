"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock, Calendar, Tag, Smile, AlignLeft, Compass } from "lucide-react";
import { writingData, Post } from "@/data/writing";
import { getBlogDetailBySlug } from "@/api/blogs";
import ParallaxImage from "@/components/ui/ParallaxImage";
import PasscodeGate from "@/components/ui/PasscodeGate";
import Markdown from "@/components/ui/Markdown";

export default function PostPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Post[]>([]);
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getBlogDetailBySlug(slug);
        const res = response.data;
        if (res && res.code === 200) {
          const item = res.data;
          const formatted: Post = {
            slug: item.slug || `post-${item.id}`,
            title: item.title,
            date: item.createTime ? item.createTime.split("T")[0] : new Date().toISOString().split("T")[0],
            category: item.category || "Thoughts",
            mood: item.mood || "quiet",
            visibility: (item.visibility as any) || "public",
            cover: item.cover || "/assets/writing-camera.png",
            description: item.summary || "",
            content: item.content || ""
          };
          setPost(formatted);
        } else {
          throw new Error("Post not found in API");
        }
      } catch (err) {
        console.warn("Detail page: API unavailable, using local writingData static fallback.", err);
        const local = writingData.find((p) => p.slug === slug);
        setPost(local || null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  // 解析并生成大纲 (TOC)
  useEffect(() => {
    if (!post || (post.visibility === "private" && !unlocked)) return;

    const timer = setTimeout(() => {
      const headings = document.querySelectorAll("article h1, article h2, article h3, article h4");
      const items: { id: string; text: string; level: number }[] = [];
      headings.forEach((heading) => {
        const id = heading.id;
        if (id && id.startsWith("heading-")) {
          const text = heading.textContent || "";
          const level = parseInt(heading.tagName.substring(1), 10);
          items.push({ id, text, level });
        }
      });
      setToc(items);
    }, 200);

    return () => clearTimeout(timer);
  }, [post, unlocked]);

  // 监听滚动更新 active 大纲项
  useEffect(() => {
    if (toc.length === 0) return;

    const handleScroll = () => {
      const headingElements = toc
        .map((item) => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];

      let currentActiveId = "";
      // 头部 Navbar 120px + 间距 40px 的总偏移量
      const scrollPosition = window.scrollY + 160;

      for (const el of headingElements) {
        if (el.offsetTop <= scrollPosition) {
          currentActiveId = el.id;
        } else {
          break;
        }
      }
      setActiveId(currentActiveId || toc[0].id);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [toc]);

  // 挑选当前文章之外的 3 篇推荐文章
  useEffect(() => {
    if (!post) return;
    const filtered = writingData.filter((p) => p.slug !== slug);
    setRecommendations(filtered.slice(0, 3));
  }, [post, slug]);
  
  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-32 px-6 text-center space-y-4">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-charcoal/50 dark:text-cream/50 font-sans tracking-widest uppercase mt-4">
          Loading archive / 正在读取小站随笔档案...
        </p>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center space-y-4">
        <h1 className="font-serif text-2xl font-light text-charcoal dark:text-cream">
          404 / 档案不存在
        </h1>
        <p className="text-xs text-charcoal/50 dark:text-cream/50 font-sans tracking-widest uppercase">
          The requested record could not be found in the archive.
        </p>
        <Link
          href="/writing"
          className="inline-flex items-center text-xs tracking-widest uppercase text-charcoal border-b border-charcoal/20 hover:border-charcoal pb-1 transition-colors font-sans mt-4 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2 stroke-[1.5]" /> 返回目录
        </Link>
      </div>
    );
  }
  
  const isPrivate = post.visibility === "private";
  
  if (isPrivate && !unlocked) {
    return (
      <PasscodeGate
        onUnlock={() => setUnlocked(true)}
        title={`解锁加密档案：《${post.title}》`}
        description="此随笔包含隐私片段。请输入访问口令（默认：2026）解锁查看全站加密内容。"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-24 md:py-32">
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-8 items-start">
        {/* 左侧侧边栏：大纲与推荐文章 */}
        <aside className="hidden xl:block sticky top-28 w-[320px] space-y-6 shrink-0 pointer-events-auto select-none">
          {/* 板块一：大纲目录 */}
          {toc.length > 0 && (
            <div className="bg-cream/85 dark:bg-charcoal/85 backdrop-blur-md border border-charcoal/15 dark:border-white/15 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
              <h3 className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider text-charcoal/70 dark:text-cream/80 border-b border-charcoal/10 dark:border-white/10 pb-3 mb-4">
                <AlignLeft className="w-4 h-4 text-gold stroke-[1.8]" />
                <span>大纲目录</span>
                <span className="text-[10px] text-charcoal/40 dark:text-cream/40 font-normal normal-case ml-auto">Outline</span>
              </h3>
              <nav data-lenis-prevent className="relative space-y-1 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                {toc.map((item) => {
                  const isActive = activeId === item.id;
                  const indentClass = 
                    item.level === 2 ? "pl-4" : 
                    item.level === 3 ? "pl-8" : 
                    item.level === 4 ? "pl-12" : "pl-4";
                  
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(item.id);
                        if (el) {
                          window.scrollTo({
                            top: el.offsetTop - 120,
                            behavior: "smooth",
                          });
                        }
                      }}
                      className={`relative block text-sm leading-relaxed font-serif py-1.5 transition-all duration-300 hover:text-gold ${indentClass} ${
                        isActive 
                          ? "text-gold font-medium translate-x-1" 
                          : "text-charcoal/65 dark:text-cream/65 hover:translate-x-0.5"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,0.7)]" />
                      )}
                      {item.text}
                    </a>
                  );
                })}
              </nav>
            </div>
          )}

          {/* 板块二：推荐随笔 */}
          {recommendations.length > 0 && (
            <div className="bg-cream/85 dark:bg-charcoal/85 backdrop-blur-md border border-charcoal/15 dark:border-white/15 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
              <h3 className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider text-charcoal/70 dark:text-cream/80 border-b border-charcoal/10 dark:border-white/10 pb-3 mb-4">
                <Compass className="w-4 h-4 text-gold stroke-[1.8]" />
                <span>推荐随笔</span>
                <span className="text-[10px] text-charcoal/40 dark:text-cream/40 font-normal normal-case ml-auto">Recommended</span>
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Link
                    key={rec.slug}
                    href={`/writing/${rec.slug}`}
                    className="flex items-start gap-3.5 p-2.5 rounded-2xl border border-charcoal/5 dark:border-white/5 bg-cream/30 dark:bg-charcoal/30 hover:border-gold/30 dark:hover:border-gold/30 hover:bg-cream/70 dark:hover:bg-charcoal/70 hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative w-20 h-14 overflow-hidden rounded-lg border border-gold/10 shrink-0 bg-charcoal/5">
                      <Image
                        src={rec.cover}
                        alt={rec.title}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <h4 className="text-xs font-serif font-medium text-charcoal dark:text-cream line-clamp-2 leading-snug group-hover:text-gold transition-colors">
                        {rec.title}
                      </h4>
                      <p className="text-[9px] font-sans text-charcoal/40 dark:text-cream/40 mt-1.5 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 text-gold/60" />
                        {rec.date}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* 右侧主文章 */}
        <article className="bg-cream/90 dark:bg-charcoal/90 backdrop-blur-md border border-charcoal/10 dark:border-white/10 rounded-[2.5rem] p-6 md:p-12 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] max-w-4xl w-full mx-auto">
          {/* 返回目录导航 */}
          <div className="mb-10">
            <Link
              href="/writing"
              className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-charcoal/50 hover:text-charcoal dark:text-cream/50 dark:hover:text-cream transition-colors font-sans cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[1.8]" /> Catalog / 返回随笔目录
            </Link>
          </div>

          {/* 元信息、标题与导言 */}
          <div className="space-y-6 mb-10">
            <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-charcoal/45 dark:text-cream/45 font-sans">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gold/80" />
                {post.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-gold font-medium">
                <Tag className="w-3.5 h-3.5 text-gold/80" />
                {post.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-gold/80" />
                {post.mood}
              </span>
              {isPrivate && (
                <span className="inline-flex items-center text-amber-800 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-300 px-2 py-0.5 border border-amber-200/50 dark:border-amber-900/50 rounded">
                  <Lock className="w-2.5 h-2.5 mr-1 stroke-[1.5]" /> DECRYPTED / 已解密
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-light text-charcoal dark:text-cream leading-tight tracking-wide">
              {post.title}
            </h1>

            {/* 导言引用样式 */}
            <p className="font-serif italic text-base text-charcoal/60 dark:text-cream/60 leading-relaxed max-w-2xl pl-4.5 border-l border-gold/45 py-1">
              {post.description}
            </p>

            {/* 作者卡片 */}
            <div className="flex items-center gap-3 border-y border-charcoal/5 dark:border-white/5 py-4">
              <div className="relative w-10 h-10 overflow-hidden rounded-full border border-gold/15">
                <Image
                  src="/assets/avtor-boy.jpg"
                  alt="Rrtiamo"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-charcoal dark:text-cream">Rrtiamo</p>
                <p className="text-[10px] text-charcoal/40 dark:text-cream/40 font-sans tracking-wide">
                  Archivist & Author
                </p>
              </div>
            </div>
          </div>

          {/* 滚动视差封面大图 */}
          <div className="mb-12 overflow-hidden rounded-[1.8rem] border border-charcoal/5 dark:border-white/5 shadow-md">
            <ParallaxImage
              src={post.cover}
              alt={post.title}
              aspectRatio="aspect-[16/10]"
              speed={0.65}
              tone="warm"
            />
          </div>

          {/* 正文排版区域 */}
          <div className="font-serif text-base md:text-lg text-charcoal/80 dark:text-cream/80 leading-loose space-y-8 tracking-wide">
            <Markdown content={post.content} />
          </div>

          {/* 结束装饰点 */}
          <div className="flex justify-center mt-20">
            <div className="w-1.5 h-1.5 rounded-full bg-gold/50 animate-pulse" />
          </div>
        </article>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { getFeedbackList, createFeedback, likeFeedback, getFeedbackTypes } from "@/api/pond";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { 
  Fish, 
  Heart, 
  Lightbulb, 
  Sparkle, 
  Bug, 
  WarningCircle, 
  CheckCircle, 
  PushPin, 
  PaperPlaneRight, 
  Megaphone,
  Globe,
  EnvelopeSimple,
  CircleNotch,
  ChatCircleText,
  CaretDown
} from "@phosphor-icons/react";

interface PondFeedbackReply {
  id: number;
  nickname: string;
  avatar?: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

interface PondTag {
  id: number;
  name: string;
  color?: string;
}

interface PondFeedback {
  id: number;
  nickname: string;
  avatar?: string;
  email?: string;
  website?: string;
  content: string;
  category: string;
  status: string;
  isPublic: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  isAnonymous: boolean;
  likeCount: number;
  replyCount: number;
  viewCount: number;
  adopted: boolean;
  adoptedNote?: string;
  adoptedAt?: string;
  createdAt: string;
  tags?: PondTag[];
  replies?: PondFeedbackReply[];
}

// Category mappings
const getCategoryIcon = (cat: string, dbTypes: any[]) => {
  const match = dbTypes.find(t => t.value === cat);
  const iconName = match?.icon || "";
  if (iconName.includes("lightbulb") || cat === "suggestion") return <Lightbulb className="w-3.5 h-3.5" />;
  if (iconName.includes("bug") || cat === "bug") return <Bug className="w-3.5 h-3.5" />;
  if (iconName.includes("heart") || cat === "praise") return <Sparkle className="w-3.5 h-3.5" />;
  if (iconName.includes("flash") || cat === "idea") return <Sparkle className="w-3.5 h-3.5" />;
  if (iconName.includes("chat") || cat === "complaint") return <WarningCircle className="w-3.5 h-3.5" />;
  return <ChatCircleText className="w-3.5 h-3.5" />;
};

const translateCategory = (cat: string, dbTypes: any[]) => {
  const match = dbTypes.find(t => t.value === cat);
  return match ? match.label : "普通讨论";
};

const getCategoryStyle = (cat: string, dbTypes: any[]) => {
  const match = dbTypes.find(t => t.value === cat);
  const color = match?.color || "sky";
  switch (color) {
    case 'emerald': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15';
    case 'rose': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/15';
    case 'pink': return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/15';
    case 'amber': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15';
    case 'stone': return 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    default: return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/15';
  }
};

const getFishAvatarStyle = (avatar?: string) => {
  switch (avatar) {
    case "red": return "bg-red-500/10 text-red-500 border-red-500/20";
    case "blue": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "green": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "orange": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "purple": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    default: return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }
};

// 3D Tilting Feedback Card Component
const FeedbackCard = ({ fb, onLike, dbTypes }: { fb: PondFeedback; onLike: (id: number) => void; dbTypes: any[] }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; rotate: number; scale: number }[]>([]);
  const nextParticleId = useRef(0);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power2.out" });
    const yTo = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power2.out" });

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      // 倾斜角度控制在 3.0 度以内，保持优雅低调的物理空间感
      const rotateY = (mouseX / (rect.width / 2)) * 3.0;
      const rotateX = -(mouseY / (rect.height / 2)) * 3.0;

      xTo(rotateY);
      yTo(rotateX);
    };

    const onMouseLeave = () => {
      xTo(0);
      yTo(0);

      gsap.to(el, {
        y: 0,
        scale: 1,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01)",
        duration: 0.8,
        ease: "elastic.out(1.2, 0.5)"
      });
    };

    const onMouseEnter = () => {
      gsap.to(el, {
        y: -4,
        scale: 1.01,
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.04)",
        duration: 0.3,
        ease: "power2.out"
      });
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("mouseenter", onMouseEnter);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  const handleLocalLike = () => {
    if (liked) return;
    setLiked(true);
    onLike(fb.id);

    // 点赞爆裂粒子（6个随机漂移的心形）
    const newParticles = Array.from({ length: 6 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 25 + Math.random() * 35;
      return {
        id: nextParticleId.current++,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 10,
        rotate: Math.random() * 90 - 45,
        scale: 0.5 + Math.random() * 0.7
      };
    });
    setParticles(newParticles);

    setTimeout(() => {
      setParticles([]);
    }, 850);
  };

  const formattedDate = useMemo(() => {
    if (!fb.createdAt) return "";
    return fb.createdAt.split("T")[0].replace(/-/g, ".");
  }, [fb.createdAt]);

  return (
    <div
      ref={cardRef}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className="feedback-card-anim group relative bg-[#FCFAF5] dark:bg-[#1E2220] border border-charcoal/10 dark:border-white/10 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[220px] overflow-hidden transition-shadow duration-500"
    >
      {/* 仿手绘撕碎宣纸半透明胶带装饰 */}
      <div 
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-5.5 bg-amber-100/35 dark:bg-amber-950/15 border-x border-dashed border-amber-500/20 backdrop-blur-[0.5px] rotate-[-1.5deg] z-10 pointer-events-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]" 
        style={{ clipPath: 'polygon(0% 15%, 5% 0%, 95% 5%, 100% 20%, 98% 85%, 90% 100%, 10% 95%, 0% 80%)' }} 
      />

      {/* 置顶与精选标 */}
      {fb.isPinned && (
        <div className="absolute top-3.5 right-4 flex items-center gap-1 text-[9px] font-mono text-gold font-semibold uppercase tracking-wider bg-gold/10 px-2 py-0.5 rounded-full select-none">
          <PushPin className="w-2.5 h-2.5" weight="bold" /> 置顶
        </div>
      )}

      {/* 邮戳印章：已采纳 */}
      {fb.adopted && (
        <div className="absolute right-4 bottom-14 pointer-events-none select-none border-2 border-dashed border-red-500/40 dark:border-red-500/20 text-red-500/40 dark:text-red-500/20 text-[9px] font-bold tracking-widest uppercase rounded px-2 py-0.5 rotate-[-12deg] z-10 bg-transparent flex items-center gap-0.5 scale-90">
          <CheckCircle weight="bold" className="w-3 h-3" />
          <span>ADOPTED / 已采纳</span>
        </div>
      )}

      {/* 主卡片正文 */}
      <div className="space-y-4">
        {/* 卡片头部：头像和昵称 */}
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full border overflow-hidden flex items-center justify-center shrink-0 relative ${getFishAvatarStyle(fb.avatar)}`}>
            <Fish className="w-4 h-4" />
            {fb.avatar && fb.avatar.startsWith("/") && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={fb.avatar} 
                alt={fb.nickname} 
                className="absolute inset-0 w-full h-full object-cover" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-charcoal/80 dark:text-cream/90 flex items-center gap-1.5">
              {fb.nickname}
              {fb.isAnonymous && <span className="text-[9px] font-normal opacity-50 select-none">(匿名)</span>}
            </span>
            <span className="text-[9px] text-charcoal/40 dark:text-white/40 font-mono">游进池塘 @ {formattedDate}</span>
          </div>
        </div>

        {/* 标签区 */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wide ${getCategoryStyle(fb.category, dbTypes)}`}>
            {getCategoryIcon(fb.category, dbTypes)}
            <span>{translateCategory(fb.category, dbTypes)}</span>
          </span>
          {fb.tags && fb.tags.map(tag => (
            <span 
              key={tag.id}
              className="inline-flex items-center text-[9px] font-semibold px-2 py-0.5 rounded-md border border-charcoal/5 dark:border-white/5"
              style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}25` }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* 反馈具体内容 */}
        <p className="font-serif text-sm md:text-[15px] leading-relaxed text-charcoal/85 dark:text-cream/85 font-light tracking-wide break-words whitespace-pre-wrap">
          {fb.content}
        </p>
      </div>

      {/* 已采纳改进详情留言 */}
      {fb.adopted && fb.adoptedNote && (
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 dark:bg-amber-950/10 border-l-4 border-amber-500 border-t border-r border-b border-amber-500/10 space-y-1.5 text-left relative overflow-hidden">
          <div className="absolute top-1.5 right-2 text-amber-500/30 font-mono text-[8px] tracking-wider uppercase select-none">MEMO</div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold select-none">
            <CheckCircle className="w-3.5 h-3.5 fill-amber-500/10" weight="bold" />
            <span>博主响应</span>
          </div>
          <p className="text-[12px] text-charcoal/70 dark:text-cream/70 font-sans leading-relaxed pl-4">
            {fb.adoptedNote}
          </p>
        </div>
      )}

      {/* 嵌套模块：官方回复 */}
      {fb.replies && fb.replies.length > 0 && (
        <div className="mt-4 border-t border-charcoal/5 dark:border-white/5 pt-4 space-y-3">
          {fb.replies.map(reply => (
            <div key={reply.id} className="flex gap-2.5 items-start text-left">
              <div className="w-7 h-7 rounded-full border border-charcoal/10 dark:border-white/10 overflow-hidden bg-cream/40 dark:bg-charcoal/40 flex items-center justify-center shrink-0 relative">
                <Fish className="w-3.5 h-3.5 text-gold" />
                {reply.avatar && reply.avatar.startsWith("/") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={reply.avatar} 
                    alt={reply.nickname} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div className="flex-1 bg-charcoal/5 dark:bg-white/5 p-3 rounded-2xl border border-charcoal/5 dark:border-white/5">
                <div className="flex justify-between items-center text-[10px] font-bold text-charcoal/60 dark:text-white/60 mb-1">
                  <span>{reply.nickname}</span>
                  <span className="font-mono font-normal opacity-70">
                    {reply.createdAt ? reply.createdAt.split("T")[0].replace(/-/g, ".") : ""}
                  </span>
                </div>
                <p className="text-xs text-charcoal/80 dark:text-cream/80 leading-relaxed font-light">
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 底部点赞操作 */}
      <div className="mt-6 pt-4 border-t border-charcoal/5 dark:border-white/5 flex justify-between items-center text-[10px] font-mono text-charcoal/40 dark:text-white/40">
        <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">
          FEEDBACK NO. {fb.id}
        </span>
        <button
          onClick={handleLocalLike}
          disabled={liked}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer relative ${
            liked
              ? "bg-red-500/10 text-red-500 border-red-500/20 font-bold"
              : "bg-cream/40 hover:bg-cream border-charcoal/10 hover:border-charcoal/30 text-charcoal/60 hover:text-charcoal dark:bg-charcoal/20 dark:border-white/10 dark:hover:border-white/30 dark:text-white/60 dark:hover:text-white"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Heart weight={liked ? "fill" : "regular"} className={`w-3.5 h-3.5 ${liked ? "text-red-500 animate-[heartBeat_0.4s_ease-out]" : ""}`} />
            {particles.map(p => (
              <motion.span
                key={p.id}
                initial={{ opacity: 1, scale: p.scale, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 0.1, x: p.x, y: p.y, rotate: p.rotate }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="absolute text-red-500 text-[10px] pointer-events-none z-20 select-none"
              >
                ❤️
              </motion.span>
            ))}
          </div>
          <span>{fb.likeCount + (liked ? 1 : 0)}</span>
        </button>
      </div>
    </div>
  );
};

export default function PondPage() {
  const [feedbacks, setFeedbacks] = useState<PondFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePool, setActivePool] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dbTypes, setDbTypes] = useState<any[]>([]);

  // 加载类型列表
  const fetchTypes = async () => {
    try {
      const response = await getFeedbackTypes();
      const json = response.data;
      if (json && json.code === 200) {
        const types = json.data || [];
        if (types.length > 0) {
          setDbTypes(types);
          setCategory(types[0].value);
        } else {
          // 数据库清空时，使用默认值
          setDbTypes([
            { value: "comment", label: "讨论" },
            { value: "suggestion", label: "建议" },
            { value: "bug", label: "Bug" },
            { value: "praise", label: "夸夸" },
            { value: "idea", label: "灵感" },
            { value: "complaint", label: "吐槽" }
          ]);
        }
      } else {
        throw new Error(json?.msg || "接口返回异常");
      }
    } catch (e) {
      console.warn("Server offline, using default categories", e);
      setDbTypes([
        { value: "comment", label: "讨论" },
        { value: "suggestion", label: "建议" },
        { value: "bug", label: "Bug" },
        { value: "praise", label: "夸夸" },
        { value: "idea", label: "灵感" },
        { value: "complaint", label: "吐槽" }
      ]);
    }
  };

  // 表单状态
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("comment");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  // 加载数据
  const fetchFeedbacks = async (reset = false) => {
    const targetPage = reset ? 1 : page;
    setLoading(true);
    try {
      const response = await getFeedbackList({ page: targetPage, pageSize: 8, category: activePool });
      const json = response.data;
      if (json && json.code === 200) {
        const newData = json.data || [];
        if (reset) {
          setFeedbacks(newData);
          setPage(2);
        } else {
          setFeedbacks(prev => [...prev, ...newData]);
          setPage(prev => prev + 1);
        }
        if (newData.length < 8) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (e) {
      console.warn("Server offline, loading mock feedbacks as fallback", e);
      // Fallback
      if (reset) {
        setFeedbacks(getMockFallbackList(activePool));
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getMockFallbackList = (cat: string) => {
    const mockDbFeedbacks = [
      {
        id: 1,
        nickname: "小橘子",
        avatar: "/assets/fish-1.png",
        content: "哇，这个「春风不解别离」档案馆的页面设计太棒了！特别是背景中那种水彩质感的心情流体渲染，配上 GSAP 的阻尼 3D 偏转效果，简直把细节控的审美拿捏得死死的！加油博主！",
        category: "praise",
        status: "approved",
        isPublic: true,
        isPinned: true,
        isFeatured: true,
        isAnonymous: false,
        likeCount: 15,
        replyCount: 1,
        viewCount: 120,
        adopted: false,
        createdAt: "2026-06-24T12:00:00",
        tags: [{ id: 1, name: "UI", color: "#ec4899" }],
        replies: [{
          id: 1,
          nickname: "RRTiamo (博主)",
          avatar: "/life-assets/avatar.jpg",
          content: "谢谢你的喜欢！写前端最开心的就是能用代码把心里的想法‘物理显化’出来。流体背景和 3D 卡片确实调了很久，能被你注意到这些细节真的非常欣慰！",
          isAdmin: true,
          createdAt: "2026-06-24T14:20:00"
        }]
      },
      {
        id: 2,
        nickname: "代码深海",
        avatar: "/assets/fish-3.png",
        content: "强烈建议在管理端增加快速切换主题颜色的控制台，或者是允许一键更换视频和图片背景。每次想更换背景都要改代码有点麻烦，如果能直接在后台上传更换就更酷了！",
        category: "suggestion",
        status: "done",
        isPublic: true,
        isPinned: false,
        isFeatured: false,
        isAnonymous: false,
        likeCount: 8,
        replyCount: 1,
        viewCount: 80,
        adopted: true,
        adoptedNote: "已在系统配置后台成功接入了‘自定义外观背景’、‘配置背景视频/图片壁纸’的功能。您现在可以直接在‘系统配置’里上传或选择照片墙里的图片作为全站背景啦！",
        createdAt: "2026-06-22T10:00:00",
        tags: [{ id: 2, name: "后台", color: "#3b82f6" }],
        replies: [{
          id: 2,
          nickname: "RRTiamo (博主)",
          avatar: "/life-assets/avatar.jpg",
          content: "这个改进点提得太及时了！最近重构了系统配置页面，已经把外观配置、背景切换和视频链接动态绑定的模块都完成了，目前前台已支持一键实时换肤和背景视频渲染，欢迎测试！",
          isAdmin: true,
          createdAt: "2026-06-23T11:00:00"
        }]
      }
    ];

    if (cat === "adopted") {
      return mockDbFeedbacks.filter(f => f.adopted);
    }
    if (!cat || cat === "all") {
      return mockDbFeedbacks;
    }
    return mockDbFeedbacks.filter(f => f.category === cat);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    fetchFeedbacks(true);
  }, [activePool]);

  // 水面心情融合流体背景 GSAP 缓动逻辑
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 流体圆圈颜色漂移与呼吸起伏动画
      const b1 = document.getElementById("pond-blob-1");
      const b2 = document.getElementById("pond-blob-2");
      const b3 = document.getElementById("pond-blob-3");

      if (b1) {
        gsap.to(b1, {
          x: "random(-50, 50)",
          y: "random(-50, 50)",
          scale: "random(0.9, 1.15)",
          duration: "random(8, 12)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }

      if (b2) {
        gsap.to(b2, {
          x: "random(-60, 60)",
          y: "random(-60, 60)",
          scale: "random(0.85, 1.1)",
          duration: "random(9, 13)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }

      if (b3) {
        gsap.to(b3, {
          x: "random(-45, 45)",
          y: "random(-45, 45)",
          scale: "random(0.9, 1.15)",
          duration: "random(7, 11)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // GSAP 首次入场动画（添加安全检查）
  useEffect(() => {
    const ctx = gsap.context(() => {
      const headerCard = pageRef.current?.querySelector(".pond-header-card");
      const submitForm = pageRef.current?.querySelector(".pond-submit-form");
      const tabsBar = pageRef.current?.querySelector(".pond-tabs-bar");

      if (headerCard) {
        gsap.from(headerCard, {
          opacity: 0,
          y: 40,
          duration: 1.0,
          ease: "power3.out"
        });
      }

      if (submitForm) {
        gsap.from(submitForm, {
          opacity: 0,
          y: 35,
          rotation: -1.5,
          duration: 1.2,
          delay: 0.15,
          ease: "elastic.out(1.1, 0.6)"
        });
      }

      if (tabsBar) {
        gsap.from(tabsBar, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.1,
          ease: "power3.out"
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // 翻页或切换卡片池 Stagger 发牌动效（添加安全检查）
  useEffect(() => {
    if (feedbacks.length === 0) return;

    const ctx = gsap.context(() => {
      const targets = pageRef.current?.querySelectorAll(".feedback-card-anim");
      if (targets && targets.length > 0) {
        gsap.fromTo(targets,
          {
            opacity: 0,
            y: 30,
            rotation: () => (Math.random() - 0.5) * 2.0,
          },
          {
            opacity: 1,
            y: 0,
            rotation: () => (Math.random() - 0.5) * 1.0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power3.out"
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [feedbacks, activePool]);

  // 表单聚焦特效
  useEffect(() => {
    const el = formCardRef.current;
    if (!el) return;

    gsap.set(el, { rotation: 0.5 });

    const handleFocus = () => {
      gsap.to(el, {
        y: -6,
        rotation: -0.5,
        scale: 1.008,
        boxShadow: "0 16px 35px rgba(34, 51, 38, 0.08)",
        duration: 0.4,
        ease: "power2.out"
      });
    };

    const handleBlur = () => {
      gsap.to(el, {
        y: 0,
        rotation: 0.5,
        scale: 1,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.01)",
        duration: 0.6,
        ease: "elastic.out(1.2, 0.6)"
      });
    };

    const inputs = el.querySelectorAll("input, textarea, select");
    inputs.forEach(inputEl => {
      inputEl.addEventListener("focus", handleFocus);
      inputEl.addEventListener("blur", handleBlur);
    });

    return () => {
      inputs.forEach(inputEl => {
        inputEl.removeEventListener("focus", handleFocus);
        inputEl.removeEventListener("blur", handleBlur);
      });
    };
  }, []);

  // 点击外部收起下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 提交接口处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (content.trim().length < 5 || content.trim().length > 1000) {
      setFormMsg("反馈内容必须在 5 到 1000 字之间 ⚠️");
      return;
    }

    setSubmitting(true);
    setFormMsg("");

    try {
      const response = await createFeedback({
        nickname: nickname.trim(),
        email: email.trim(),
        website: website.trim(),
        content: content.trim(),
        category,
        isAnonymous
      });
      const res = response.data;
      if (res && (res.code === 200 || res.code === 201)) {
        setFormMsg("博主已收到您的反馈！审核通过后就会在池塘里公开展示 🎏");
        setContent("");
        setIsAnonymous(false);
        
        // 成功抖动
        if (formCardRef.current) {
          gsap.fromTo(formCardRef.current,
            { scale: 0.98, y: 3 },
            { scale: 1, y: 0, duration: 0.5, ease: "elastic.out(1.5, 0.4)" }
          );
        }
      } else {
        setFormMsg(res.msg || "提交失败，请稍后再试");
      }
    } catch (err) {
      console.error(err);
      setFormMsg("提交成功（演示模式），博主会在后台审核后为您公开展示！");
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  // 点赞接口处理
  const handleLike = async (id: number) => {
    try {
      await likeFeedback(id);
    } catch (e) {
      console.warn("Liking feedback failed online, fallback to offline state.", e);
    }
  };

  const poolOptions = useMemo(() => {
    const base = [{ value: "all", label: "全部反馈" }];
    const dynamic = dbTypes.map(t => ({
      value: t.value,
      label: `${t.label}池`
    }));
    const end = [{ value: "adopted", label: "已采纳" }];
    return [...base, ...dynamic, ...end];
  }, [dbTypes]);

  return (
    <div ref={pageRef} className="max-w-6xl mx-auto w-full px-4 md:px-8 py-24 md:py-32 space-y-12 relative select-none">
      
      {/* 心情流体融合背景（使用 SVG 液体效果滤镜） */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-45 dark:opacity-25" style={{ filter: "url(#liquid-pond-filter)" }}>
        <div 
          id="pond-blob-1" 
          className="absolute -top-12 -left-12 w-[450px] h-[450px] rounded-full bg-sky-200/60 dark:bg-sky-950/20 transition-all mix-blend-multiply dark:mix-blend-screen" 
          style={{ transitionDuration: '4s' }}
        />
        <div 
          id="pond-blob-2" 
          className="absolute -bottom-20 -right-20 w-[550px] h-[550px] rounded-full bg-teal-100/60 dark:bg-teal-950/25 transition-all mix-blend-multiply dark:mix-blend-screen" 
          style={{ transitionDuration: '4s' }}
        />
        <div 
          id="pond-blob-3" 
          className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-amber-100/50 dark:bg-amber-950/15 transition-all mix-blend-multiply dark:mix-blend-screen" 
          style={{ transitionDuration: '4s' }}
        />
      </div>
      
      {/* 磨砂玻璃底层，与心情背景结合 */}
      <div className="fixed inset-0 -z-20 bg-[#F5F2EB]/30 dark:bg-[#121513]/20 backdrop-blur-[60px] pointer-events-none" />

      {/* SVG 液体滤镜定义 */}
      <svg className="hidden">
        <defs>
          <filter id="liquid-pond-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="liquid" />
            <feBlend in="SourceGraphic" in2="liquid" />
          </filter>
        </defs>
      </svg>

      {/* 1. 介绍卡片 & 拟物留言信纸 */}
      <div className="pond-header-card bg-white/50 dark:bg-[#171B19]/50 backdrop-blur-md border border-charcoal/10 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 relative z-10">
          
          {/* 左侧说明文字 */}
          <div className="space-y-6 max-w-2xl grow text-left">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono tracking-[0.2em] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md uppercase font-semibold">
                NO. ATLAS-POND-FEEDBACK
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-mono text-charcoal/40 dark:text-white/40 uppercase">
                POND HUB
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal dark:text-white leading-none">
                Pond / 鱼塘反馈
              </h1>
              <p className="font-sans text-xs md:text-sm text-charcoal/60 dark:text-white/60 leading-relaxed max-w-lg font-light">
                水至清则无鱼，这里是一处让小鱼们自由呼吸的池塘。
                无论您是想对网站的视觉动效提些改进建议（Suggestion）、报告程序错误（Bug）、留下几句夸夸与火花灵感（Pond Feedback），还是记录您对生活的共鸣，都可以把它作为一条小鱼放入池塘中。博主会定期在后台认真审阅采纳，并用心回复每一位访客 🎏。
              </p>
            </div>

            <div className="pt-6 border-t border-charcoal/10 dark:border-white/10 flex items-center gap-2 text-xs text-charcoal/50 dark:text-white/50">
              <Megaphone className="w-4 h-4 text-emerald-600 shrink-0" weight="bold" />
              <span>本池塘启用「安全审核机制」，访客提交的反馈审核通过后即可在此处游动。</span>
            </div>
          </div>

          {/* 右侧：拟真撕页活页留言信纸 */}
          <div 
            ref={formCardRef} 
            className="pond-submit-form self-stretch lg:self-start bg-[#FAF6EE] dark:bg-[#202220] border border-[#E3DDCF] dark:border-[#383C3A] p-6 pt-9 rounded-2xl shadow-[0_6px_20px_-8px_rgba(0,0,0,0.02)] w-full lg:max-w-md relative flex-shrink-0 flex flex-col justify-between"
          >
            {/* 顶部的活页夹金属线圈扣 */}
            <div className="absolute -top-3.5 left-4 right-4 flex justify-between px-2 pointer-events-none select-none z-20">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-stone-400 via-stone-200 to-stone-400 dark:from-stone-700 dark:via-stone-500 dark:to-stone-700 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
                  <div className="w-3 h-3 rounded-full bg-stone-800/25 dark:bg-black/40 -mt-1 shadow-inner border border-stone-900/5" />
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative">
              <div className="text-[9px] font-mono tracking-wider text-emerald-800/60 dark:text-emerald-300/50 uppercase pl-1 font-semibold flex items-center gap-1.5 select-none">
                <Fish className="w-4 h-4 text-emerald-600 animate-pulse" /> 
                <span>Put a fish in the pond...</span>
              </div>

              {/* 横格纸留言正文区 */}
              <div className="relative border border-[#E3DDCF] dark:border-[#383C3A] bg-white/35 dark:bg-black/10 focus-within:bg-white/70 dark:focus-within:bg-black/25 rounded-xl p-4 transition-all duration-300 border-l-4 border-l-emerald-600/10">
                <textarea
                  placeholder="说点建议、Bug 反馈、吐槽或灵感吧... (5-1000字)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-24 bg-transparent text-sm leading-relaxed border-none focus:outline-none placeholder:text-charcoal/30 dark:placeholder:text-white/30 font-sans text-charcoal dark:text-cream resize-none font-light"
                  required
                />
              </div>

              {/* 昵称与品类 */}
              <div className="grid grid-cols-2 gap-3 select-none">
                <div className="space-y-1">
                  <span className="text-[9px] text-charcoal/50 dark:text-white/50 pl-1 font-semibold">您的昵称 / Nickname:</span>
                  <input
                    type="text"
                    placeholder="小鱼访客"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E3DDCF] dark:border-[#383C3A] bg-white/35 dark:bg-black/10 text-xs text-charcoal dark:text-cream focus:outline-none focus:border-emerald-500/50 transition-colors"
                    disabled={isAnonymous}
                  />
                </div>
                <div className="space-y-1 relative" ref={dropdownRef}>
                  <span className="text-[9px] text-charcoal/50 dark:text-white/50 pl-1 font-semibold">反馈类型 / Category:</span>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E3DDCF] dark:border-[#383C3A] bg-white/35 dark:bg-black/10 text-xs text-charcoal dark:text-cream focus:outline-none focus:border-emerald-500/50 flex items-center justify-between transition-colors cursor-pointer text-left font-light"
                  >
                    <span className="flex items-center gap-1.5">
                      {getCategoryIcon(category, dbTypes)}
                      <span>{translateCategory(category, dbTypes)}</span>
                    </span>
                    <CaretDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  <div className="absolute top-full left-0 right-0 h-0 z-30 pointer-events-none">
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="relative mt-1 bg-[#FAF6EE] dark:bg-[#202220] border border-[#E3DDCF] dark:border-[#383C3A] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)] overflow-hidden pointer-events-auto"
                        >
                          <div className="py-1 max-h-48 overflow-y-auto overscroll-contain" data-lenis-prevent>
                            {dbTypes.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setCategory(opt.value);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full px-3.5 py-2 text-xs flex items-center gap-2 text-left transition-colors cursor-pointer ${
                                  category === opt.value
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                                    : "text-charcoal/80 dark:text-cream/80 hover:bg-charcoal/5 dark:hover:bg-white/5"
                                }`}
                              >
                                {getCategoryIcon(opt.value, dbTypes)}
                                <span>{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* 邮箱与网站 */}
              <div className="grid grid-cols-2 gap-3 select-none">
                <div className="space-y-1">
                  <span className="text-[9px] text-charcoal/50 dark:text-white/50 pl-1 font-semibold flex items-center gap-0.5">
                    <EnvelopeSimple className="w-3 h-3" /> 邮箱 / Email:
                  </span>
                  <input
                    type="email"
                    placeholder="xxx@qq.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E3DDCF] dark:border-[#383C3A] bg-white/35 dark:bg-black/10 text-xs text-charcoal dark:text-cream focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-charcoal/50 dark:text-white/50 pl-1 font-semibold flex items-center gap-0.5">
                    <Globe className="w-3 h-3" /> 网站 / Website:
                  </span>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E3DDCF] dark:border-[#383C3A] bg-white/35 dark:bg-black/10 text-xs text-charcoal dark:text-cream focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* 选项栏 */}
              <div className="flex items-center justify-between px-1 select-none">
                <label className="text-[10px] text-charcoal/60 dark:text-white/60 font-semibold flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) setNickname("");
                    }}
                    className="rounded border-[#E3DDCF] text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>开启匿名发布 (Anonymous)</span>
                </label>
                <span className="text-[9px] text-charcoal/40 dark:text-white/40 font-mono">
                  {content.trim().length} / 1000 字
                </span>
              </div>

              {/* 提交控制 */}
              <div className="flex justify-between items-center text-[10px] font-sans px-1">
                <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium max-w-[220px] truncate text-left">
                  {formMsg}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="inline-flex items-center justify-center gap-1.5 text-[10px] tracking-widest uppercase bg-charcoal text-cream dark:bg-cream dark:text-charcoal hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-cream px-5 py-2.5 transition-all duration-300 font-sans cursor-pointer rounded-full font-semibold shadow-sm hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97] disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <CircleNotch className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PaperPlaneRight className="w-3 h-3" weight="bold" />
                  )}
                  <span>放鱼入塘</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 2. 水池类型 Tabs */}
      <div className="pond-tabs-bar flex flex-wrap items-center justify-center gap-2 border-b border-charcoal/5 dark:border-white/5 pb-4 relative z-10 select-none">
        {poolOptions.map((pool) => {
          const isActive = activePool === pool.value;
          return (
            <button
              key={pool.value}
              onClick={() => {
                setActivePool(pool.value);
                setFeedbacks([]);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-[11px] font-sans transition-all duration-300 border cursor-pointer ${
                isActive
                  ? "bg-charcoal text-cream border-charcoal dark:bg-cream dark:text-charcoal dark:border-cream font-semibold scale-105 shadow-sm"
                  : "bg-white/40 hover:bg-white border-charcoal/10 text-charcoal/60 dark:bg-charcoal/10 dark:border-white/10 dark:text-white/60 dark:hover:bg-charcoal/20"
              }`}
            >
              {pool.label}
            </button>
          );
        })}
      </div>

      {/* 空状态显示 */}
      {feedbacks.length === 0 && !loading && (
        <div className="py-20 text-center border-2 border-dashed border-charcoal/10 dark:border-white/10 rounded-3xl max-w-sm mx-auto relative z-10">
          <Fish className="w-10 h-10 text-charcoal/25 dark:text-white/25 mx-auto mb-3" />
          <p className="text-[11px] font-sans text-charcoal/40 dark:text-white/40 uppercase tracking-widest leading-relaxed">
            This pool is empty<br/>此时池塘暂无此类别反馈记录
          </p>
        </div>
      )}

      {/* 3. 反馈留言卡片网格 */}
      {feedbacks.length > 0 && (
        <div className="space-y-10 relative z-10 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[380px] content-start">
            <AnimatePresence mode="popLayout" initial={false}>
              {feedbacks.map((fb) => (
                <motion.div
                  key={fb.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                >
                  <FeedbackCard fb={fb} onLike={handleLike} dbTypes={dbTypes} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 加载更多 */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <button
                onClick={() => fetchFeedbacks(false)}
                disabled={loading}
                className="px-6 py-2.5 text-xs font-semibold rounded-full border border-charcoal/10 hover:border-charcoal dark:border-white/10 dark:hover:border-white text-charcoal/60 hover:text-charcoal dark:text-white/60 dark:hover:text-white transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap bg-white/40 dark:bg-charcoal/10"
              >
                {loading ? (
                  <CircleNotch className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Fish className="w-3.5 h-3.5" />
                )}
                <span>{loading ? "水流动中..." : "浏览更多小鱼反馈"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

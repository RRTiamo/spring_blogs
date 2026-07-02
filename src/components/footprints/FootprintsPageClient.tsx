"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Compass, Calendar, MapPin, X, Info } from "lucide-react";
import * as Icons from "lucide-react";
import gsap from "gsap";
import { DynamicIcon } from "@/icon/love";

interface FootprintItem {
  id: string;
  type: string;
  slug: string;
  title: string;
  date: string;
  location: string;
  longitude: number;
  latitude: number;
  cover: string;
  content: string;
  mediaType?: "image" | "video";
  // 照片额外参数
  camera?: string;
  lens?: string;
  filmStock?: string;
  settings?: string;
  // 恋爱日记额外参数
  mood?: string;
}

interface FootprintCategory {
  id: number;
  name: string;
  code: string;
  icon: string;
}

interface FootprintsPageClientProps {
  initialItems: FootprintItem[];
  apiMapKey?: string;
  apiMapCode?: string;
  categories?: FootprintCategory[];
}

const defaultCategories: FootprintCategory[] = [
  { id: 1, name: "光影影像", code: "photo", icon: "Camera" },
  { id: 2, name: "甜蜜瞬间", code: "love", icon: "Heart" },
];

const MAP_CREDENTIAL_SALT = "ArchiveAmapSalt_2026";

// 顶级隐藏解密逻辑，避免在组件内被 React DevTools 捕获，同时增强为 XOR 混淆
const resolveMapCredentials = (str: string): string => {
  if (!str) return "";
  if (str.startsWith("enc_v2:")) {
    try {
      const payload = str.substring(7);
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoded = new TextDecoder().decode(bytes);
      let decrypted = "";
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ MAP_CREDENTIAL_SALT.charCodeAt(i % MAP_CREDENTIAL_SALT.length);
        decrypted += String.fromCharCode(charCode);
      }
      return decrypted;
    } catch {
      return str;
    }
  }
  if (str.startsWith("enc:")) {
    try {
      const payload = str.substring(4);
      const shifted = decodeURIComponent(atob(payload));
      return shifted.split("").map((c) => String.fromCharCode(c.charCodeAt(0) - 3)).join("");
    } catch {
      return str;
    }
  }
  return str;
};

export default function FootprintsPageClient({
  initialItems,
  apiMapKey,
  apiMapCode,
  categories = defaultCategories,
}: FootprintsPageClientProps) {
  const [items] = useState<FootprintItem[]>(initialItems);
  const [filter, setFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<FootprintItem | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const infoWindowRef = useRef<any>(null);
  const detailModalRef = useRef<HTMLDivElement>(null);

  // 1. 检查是否存在地图配置，不暴露明文 Key 属性给 React 开发者工具
  const hasConfig = useMemo(() => {
    const rawKey = apiMapKey || process.env.NEXT_PUBLIC_AMAP_KEY || "";
    return !!rawKey;
  }, [apiMapKey]);

  // 智能跳转 URL 自动推断器
  const handleGoToConfig = () => {
    let adminUrl = "http://localhost:5173/#/config";
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (origin.includes(":3000")) {
        adminUrl = origin.replace(":3000", ":5173") + "/#/config";
      } else {
        // 生产环境通常挂载在 /admin 下
        adminUrl = origin + "/admin/#/config";
      }
      window.open(adminUrl, "_blank");
    }
  };

  // 根据过滤器筛选足迹
  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.type === filter);
  }, [items, filter]);

  // 数据统计
  const stats = useMemo(() => {
    const total = items.length;
    const photos = items.filter((i) => i.type === "photo").length;
    const loves = items.filter((i) => i.type === "love").length;
    
    // 计算去过的省份/城市（去重）
    const cities = new Set(
      items
        .map((i) => {
          const part = i.location.split(/[·,\s]/)[0];
          return part ? part.trim() : "";
        })
        .filter(Boolean)
    );

    return { total, photos, loves, citiesCount: cities.size };
  }, [items]);

  // 2. 动态加载高德地图 JS API
  useEffect(() => {
    const rawKey = apiMapKey || process.env.NEXT_PUBLIC_AMAP_KEY || "";
    const rawCode = apiMapCode || process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || "";
    if (!rawKey) return;

    // 局部临时解密，变量在 effect 结束后即被销毁，有效防止泄露
    const resolvedKey = resolveMapCredentials(rawKey);
    const resolvedCode = resolveMapCredentials(rawCode);

    // 设置安全密钥
    if (typeof window !== "undefined") {
      (window as any)._AMapSecurityConfig = {
        securityJsCode: resolvedCode,
      };
    }

    const loadAMap = () => {
      if ((window as any).AMap) {
        setMapLoaded(true);
        return;
      }

      // 如果已有 script，先删除，防止重复加载报错
      const oldScript = document.querySelector('script[src*="webapi.amap.com"]');
      if (oldScript) {
        oldScript.remove();
      }

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${resolvedKey}`;
      script.async = true;

      script.onload = () => {
        setMapLoaded(true);
      };

      script.onerror = () => {
        setMapError("高德地图加载失败，请检查网络或配置的 API Key 是否有效。");
      };

      document.head.appendChild(script);
    };

    loadAMap();
  }, [apiMapKey, apiMapCode]);

  // 3. 初始化与控制地图
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !(window as any).AMap) return;

    const AMap = (window as any).AMap;

    // 确定初始地图主题样式
    const isDark = document.documentElement.classList.contains("dark");
    const initialStyle = isDark ? "amap://styles/dark" : "amap://styles/whitesmoke";

    // 创建地图实例
    const map = new AMap.Map(mapContainerRef.current, {
      zoom: 4.8,
      center: [112.5, 34.5], // 稍微偏东的中国几何中心，更契合东部足迹多的人群
      mapStyle: initialStyle,
      features: ["bg", "road", "building", "point"], // 隐藏部分次要要素，保持极简感
      defaultCursor: "zoom-in",
    });

    mapRef.current = map;
    infoWindowRef.current = new AMap.InfoWindow({
      isCustom: true, // 使用自定义信息窗体，配合本站设计规范
      offset: new AMap.Pixel(0, -32),
    });

    // 4. 主题实时观测器 (MutationObserver)
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      if (mapRef.current) {
        mapRef.current.setMapStyle(isDark ? "amap://styles/dark" : "amap://styles/whitesmoke");
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
      markersRef.current = {};
    };
  }, [mapLoaded]);

  // 5. 根据过滤与数据重新渲染 Markers
  useEffect(() => {
    if (!mapRef.current || !(window as any).AMap) return;

    const AMap = (window as any).AMap;
    const map = mapRef.current;

    // 清除已有的 Markers
    Object.values(markersRef.current).forEach((marker) => marker.setMap(null));
    markersRef.current = {};
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // 循环创建新 Markers
    filteredItems.forEach((item) => {
      const markerContent = document.createElement("div");
      markerContent.className = "custom-map-marker group/marker";
      
      // 男生头像代表光影照片，女生头像代表甜蜜恋爱瞬间
      const avatarSrc = item.type === "love" ? "/assets/avtor-girl.jpg" : "/assets/avtor-boy.jpg";

      markerContent.innerHTML = `
        <div class="marker-wrapper relative flex items-center justify-center transition-all duration-300">
          <div class="marker-pulse-ring absolute inset-0 rounded-full bg-amber-500/30 border border-amber-500/40 animate-ping opacity-60"></div>
          <div class="marker-glow-ring absolute -inset-0.5 rounded-full border border-amber-500/50 bg-cream/90 shadow-lg dark:bg-charcoal"></div>
          <div class="marker-avatar-circle relative h-8 w-8 overflow-hidden rounded-full border border-charcoal/10 dark:border-white/15 bg-white">
            <img src="${avatarSrc}" alt="avatar" class="h-full w-full object-cover transition-transform duration-300 group-hover/marker:scale-110" />
          </div>
          <div class="marker-dot-bottom absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-500 border border-white dark:border-charcoal shadow-sm"></div>
        </div>
      `;

      const marker = new AMap.Marker({
        position: [item.longitude, item.latitude],
        content: markerContent,
        offset: new AMap.Pixel(-17, -17), // 居中偏移
        title: item.title,
      });

      marker.setMap(map);
      markersRef.current[item.id] = marker;

      // 绑定 Marker 点击与鼠标浮动事件
      marker.on("click", () => {
        setSelectedItem(item);
        map.panTo([item.longitude, item.latitude]);
      });

      marker.on("mouseover", () => {
        setHoveredItemId(item.id);
        
        // 显示简易的气泡地名框
        const infoContent = document.createElement("div");
        infoContent.className = "px-2.5 py-1.5 bg-cream/95 dark:bg-charcoal/95 border border-charcoal/10 dark:border-white/10 rounded-lg shadow-md text-[10px] uppercase tracking-widest text-charcoal dark:text-cream font-sans font-medium pointer-events-none transition-all";
        infoContent.innerText = `${item.location} : ${item.title}`;
        
        infoWindowRef.current.setContent(infoContent);
        infoWindowRef.current.open(map, [item.longitude, item.latitude]);
      });

      marker.on("mouseout", () => {
        setHoveredItemId(null);
        infoWindowRef.current.close();
      });
    });

    // 如果有数据，可以根据点集自动微调地图中心
    if (filteredItems.length > 0) {
      const points = filteredItems.map((item) => new AMap.LngLat(item.longitude, item.latitude));
      // 如果只有一个点，居中并放大，多个点自适应缩放
      if (points.length === 1) {
        map.setZoomAndCenter(10, points[0]);
      } else {
        // 使用高德官方的 setFitView 自动贴合，增加 padding 保证视觉舒适
        map.setFitView(Object.values(markersRef.current), false, [60, 60, 60, 60], 12);
      }
    }
  }, [filteredItems, mapLoaded]);

  // 6. 列表卡片与地图 Marker 联动
  const handleItemHover = (id: string | null) => {
    setHoveredItemId(id);
    const marker = markersRef.current[id || ""];
    if (marker && mapRef.current) {
      if (id) {
        // 浮动时给 Marker 添加跳跃或放大动效样式
        const dom = marker.getContent();
        if (dom) {
          dom.querySelector(".marker-wrapper")?.classList.add("scale-125", "z-50");
          dom.querySelector(".marker-glow-ring")?.classList.add("border-amber-500", "shadow-xl");
        }
      } else {
        // 清理所有 Marker 激活样式
        Object.values(markersRef.current).forEach((m) => {
          const dom = m.getContent();
          if (dom) {
            dom.querySelector(".marker-wrapper")?.classList.remove("scale-125", "z-50");
            dom.querySelector(".marker-glow-ring")?.classList.remove("border-amber-500", "shadow-xl");
          }
        });
      }
    }
  };

  const handleCardClick = (item: FootprintItem) => {
    setSelectedItem(item);
    if (mapRef.current) {
      mapRef.current.setZoomAndCenter(11, [item.longitude, item.latitude]);
    }
  };

  // 7. GSAP 列表入场与详情展开动效
  useEffect(() => {
    // 只在列表里有元素被渲染时才执行卡片动画，防止 GSAP 抛出 Target not found 报错
    const cards = document.querySelectorAll(".footprint-card-reveal");
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out", overwrite: "auto" }
      );
    }
  }, [filter]);

  useEffect(() => {
    if (selectedItem) {
      // 延迟一帧，等待 React 将 Modal 的 DOM 渲染并挂载成功，防止 querySelector 得到 null
      requestAnimationFrame(() => {
        if (!detailModalRef.current) return;
        const modalBody = detailModalRef.current.querySelector(".modal-body");
        if (modalBody) {
          gsap.fromTo(
            modalBody,
            { opacity: 0, scale: 0.95, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out" }
          );
        }
      });
    }
  }, [selectedItem]);

  // 如果没有配置 Key，不允许访问，直接展示需要配置的提示
  if (!hasConfig) {
    return (
      <div className="min-h-screen bg-cream text-charcoal flex items-center justify-center p-6 dark:bg-charcoal transition-colors duration-300">
        <div className="max-w-md w-full bg-cream/70 dark:bg-charcoal/70 border border-charcoal/10 dark:border-white/10 rounded-3xl p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-md space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500 animate-pulse">
              <Compass className="w-8 h-8" />
            </div>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[9px] tracking-widest uppercase text-amber-600 dark:text-amber-500">Map Config Required</span>
            <h2 className="font-serif text-2xl font-light text-charcoal dark:text-cream tracking-wide">
              地图组件尚未启用
            </h2>
            <p className="font-sans text-xs text-charcoal/80 dark:text-cream/70 leading-relaxed">
              本数字档案馆的“岁月足迹”页面需要配置高德地图 API 密钥。请先在系统后台配置 Key 后再行访问。
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={handleGoToConfig}
              className="w-full py-3 bg-charcoal text-cream dark:bg-white dark:text-charcoal rounded-xl text-xs font-semibold hover:opacity-90 active:scale-98 transition-all shadow-sm cursor-pointer"
            >
              前往后台配置 Key
            </button>
            <a
              href="/writing/config-guide"
              target="_blank"
              className="w-full py-3 text-center rounded-xl border border-charcoal/10 dark:border-white/10 text-charcoal/80 dark:text-cream/80 text-xs font-semibold hover:bg-charcoal/5 dark:hover:bg-white/5 transition-all inline-block"
            >
              参考高德地图配置指南
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-charcoal transition-colors duration-300 dark:bg-charcoal w-full relative pt-24 pb-8 md:pt-32">
      
      {/* 极简自定义样式注入 */}
      <style jsx global>{`
        .custom-map-marker {
          transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          will-change: transform;
        }
        .marker-avatar-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        /* AMap InfoWindow 默认重置 */
        .amap-info-combo-close-card {
          display: none !important;
        }
        .amap-container {
          cursor: zoom-in !important;
        }
      `}</style>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 lg:h-[calc(100vh-200px)] h-auto min-h-[580px] lg:min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_0.6fr] gap-6 md:gap-8 h-full">
          
          {/* 左侧栏：面板、统计、足迹卡片列表 */}
          <div className="flex flex-col h-[500px] lg:h-full min-h-0 overflow-hidden border border-charcoal/10 dark:border-white/10 bg-cream/50 dark:bg-charcoal/50 rounded-3xl p-5 md:p-7 backdrop-blur-sm">
            
            {/* 栏目头部 */}
            <div className="border-b border-charcoal/10 dark:border-white/10 pb-4 mb-4 shrink-0">
              <span className="text-[9px] font-sans font-semibold tracking-widest text-charcoal/80 dark:text-cream/70 uppercase">
                Life Footprints / 物理足迹
              </span>
              <h1 className="font-serif text-3xl font-light text-charcoal dark:text-cream mt-1 tracking-wide">
                岁月足迹
              </h1>
              <p className="font-sans text-[11px] text-charcoal/85 dark:text-cream/80 tracking-wider mt-1.5 leading-relaxed">
                记录在不同城市的停留与影像。每一次按下快门，每一个恋爱瞬间，都在地图上留下了可追溯的印记。
              </p>
            </div>
 
            {/* 数据统计看板 */}
            <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-charcoal/[0.03] dark:bg-white/[0.02] border border-charcoal/5 dark:border-white/5 rounded-2xl mb-4 shrink-0">
              <div className="text-center">
                <span className="block font-mono text-xl font-light text-amber-600 dark:text-amber-500">
                  {stats.citiesCount}
                </span>
                <span className="font-sans text-[9px] text-charcoal/85 dark:text-cream/75 uppercase tracking-widest">
                  足迹城市
                </span>
              </div>
              <div className="text-center border-x border-charcoal/10 dark:border-white/10">
                <span className="block font-mono text-xl font-light text-charcoal dark:text-cream">
                  {stats.photos}
                </span>
                <span className="font-sans text-[9px] text-charcoal/85 dark:text-cream/75 uppercase tracking-widest">
                  影像相片
                </span>
              </div>
              <div className="text-center">
                <span className="block font-mono text-xl font-light text-charcoal dark:text-cream">
                  {stats.loves}
                </span>
                <span className="font-sans text-[9px] text-charcoal/85 dark:text-cream/75 uppercase tracking-widest">
                  甜蜜记忆
                </span>
              </div>
            </div>

            {/* 过滤器 */}
            <div className="flex items-center gap-1.5 mb-4 shrink-0 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-full text-[9px] tracking-widest uppercase transition-all duration-300 font-sans ${
                  filter === "all"
                    ? "bg-charcoal text-cream dark:bg-white dark:text-charcoal font-semibold shadow-sm"
                    : "bg-charcoal/5 text-charcoal/75 hover:text-charcoal dark:bg-white/5 dark:text-cream/75 dark:hover:text-cream"
                }`}
              >
                全部足迹
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.code)}
                  className={`px-3 py-1.5 rounded-full text-[9px] tracking-widest uppercase transition-all duration-300 font-sans flex items-center gap-1 ${
                    filter === cat.code
                      ? "bg-charcoal text-cream dark:bg-white dark:text-charcoal font-semibold shadow-sm"
                      : "bg-charcoal/5 text-charcoal/75 hover:text-charcoal dark:bg-white/5 dark:text-cream/75 dark:hover:text-cream"
                  }`}
                >
                  <DynamicIcon name={cat.icon} className="w-2.5 h-2.5" />
                  {cat.name}
                </button>
              ))}
            </div>
            
            {/* 滚动卡片列表 */}
            <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin dark:scrollbar-white/10 scrollbar-track-transparent">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-[11px] text-charcoal/80 dark:text-cream/70 font-sans tracking-wide">
                  暂无符合当前过滤器的足迹坐标。
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onMouseEnter={() => handleItemHover(item.id)}
                    onMouseLeave={() => handleItemHover(null)}
                    onClick={() => handleCardClick(item)}
                    className={`footprint-card-reveal cursor-pointer group p-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.06)] transition-all duration-300 flex gap-4 ${
                      hoveredItemId === item.id
                        ? "bg-amber-500/10 dark:bg-amber-500/10 border-amber-500/40 dark:border-amber-500/40"
                        : "bg-cream dark:bg-charcoal/80 border-charcoal/10 dark:border-white/10 hover:border-charcoal/20 dark:hover:border-white/20"
                    }`}
                  >
                    {/* 卡片封面 */}
                    <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-charcoal/5 dark:bg-white/5 border border-charcoal/5 dark:border-white/5">
                      {item.mediaType === "video" ? (
                        <div className="relative w-full h-full">
                          <video
                            src={item.cover}
                            preload="metadata"
                            muted
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                            <Icons.Play className="w-4 h-4 text-cream drop-shadow-sm opacity-80 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={item.cover}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute top-1.5 left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cream/90 backdrop-blur-sm border border-charcoal/10 shadow-sm">
                        <DynamicIcon 
                          name={categories.find(c => c.code === item.type)?.icon || "Compass"} 
                          className={`w-2.5 h-2.5 ${item.type === "love" ? "text-amber-600" : "text-charcoal/60"}`} 
                        />
                      </div>
                    </div>
 
                    {/* 卡片文字描述 */}
                    <div className="flex flex-col justify-between py-0.5 min-w-0 flex-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[9px] text-charcoal/80 dark:text-cream/70 flex items-center gap-1 select-none">
                            <Calendar className="w-2.5 h-2.5" />
                            {item.date.split("T")[0]}
                          </span>
                          <span className="font-mono text-[9px] tracking-wider text-amber-600 dark:text-amber-500 flex items-center gap-0.5 select-none">
                            <MapPin className="w-2.5 h-2.5" />
                            {item.location}
                          </span>
                        </div>
                        <h3 className="font-serif text-sm font-medium text-charcoal dark:text-cream line-clamp-1 group-hover:text-amber-600 transition-colors duration-250">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-[10px] text-charcoal/85 dark:text-cream/80 font-sans line-clamp-2 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
 
          {/* 右侧栏：地图容器 */}
          <div className="relative h-[400px] lg:h-full border border-charcoal/10 dark:border-white/10 rounded-3xl overflow-hidden bg-cream/80 dark:bg-charcoal/80 shadow-[inset_0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-center">
            
            {/* 地图实际装载区域 */}
            <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />

            {/* AMap 异常/加载遮罩 */}
            {!mapLoaded && !mapError && (
              <div className="absolute inset-0 bg-cream/80 dark:bg-charcoal/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-charcoal border-t-transparent dark:border-cream" />
                <span className="font-sans text-[10px] uppercase tracking-widest text-charcoal/80 dark:text-cream/70">
                  载入岁月足迹地图...
                </span>
              </div>
            )}

            {mapError && (
              <div className="absolute inset-0 bg-cream/90 dark:bg-charcoal/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <Info className="w-8 h-8 text-red-500/80" />
                <div className="space-y-1">
                  <h3 className="font-serif text-md font-medium text-charcoal dark:text-cream">
                    地图服务暂时不可用
                  </h3>
                  <p className="font-sans text-xs text-charcoal/80 dark:text-cream/70 max-w-[40ch] leading-relaxed">
                    {mapError}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 详情浮动模态框 */}
      {selectedItem && (
        <div
          ref={detailModalRef}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-charcoal/30 dark:bg-black/40 backdrop-blur-md"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="modal-body w-full max-w-xl bg-cream dark:bg-charcoal border border-charcoal/10 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full border border-charcoal/10 dark:border-white/10 text-charcoal/75 dark:text-cream/75 hover:border-charcoal dark:hover:border-white transition-all duration-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* 详情标题与类型角标 */}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-[9px] tracking-widest uppercase py-0.5 px-2 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-md text-charcoal/85 dark:text-cream/85 select-none">
                {categories.find(c => c.code === selectedItem?.type)?.name || selectedItem?.type}
              </span>
              <span className="font-mono text-[9px] text-charcoal/80 dark:text-cream/70 flex items-center gap-1 select-none">
                <Calendar className="w-2.5 h-2.5" />
                {selectedItem.date.split("T")[0]}
              </span>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-500 flex items-center gap-0.5 select-none ml-auto">
                <MapPin className="w-2.5 h-2.5" />
                {selectedItem.location}
              </span>
            </div>

            {/* 媒体内容：图片或视频 */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal/[0.03] dark:bg-white/[0.02] border border-charcoal/10 dark:border-white/10 mb-6 shadow-md">
              {selectedItem.mediaType === "video" ? (
                <video
                  src={selectedItem.cover}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={selectedItem.cover}
                  alt={selectedItem.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* 核心详情信息 */}
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-light text-charcoal dark:text-cream tracking-wide">
                  {selectedItem.title}
                </h2>
              </div>

              {/* 如果是照片，显示相机镜头胶卷元数据 */}
              {selectedItem.type === "photo" && (selectedItem.camera || selectedItem.lens || selectedItem.filmStock) && (
                <div className="grid grid-cols-2 gap-3 py-3 px-4 bg-charcoal/[0.03] dark:bg-white/[0.02] border border-charcoal/5 dark:border-white/5 rounded-2xl font-mono text-[10px] tracking-wider text-charcoal/80 dark:text-cream/80">
                  {selectedItem.camera && (
                    <div>
                      <span className="block text-[9px] text-charcoal/60 dark:text-cream/60 font-medium uppercase select-none">相机 :</span>
                      {selectedItem.camera}
                    </div>
                  )}
                  {selectedItem.lens && (
                    <div>
                      <span className="block text-[9px] text-charcoal/60 dark:text-cream/60 font-medium uppercase select-none">镜头 :</span>
                      {selectedItem.lens}
                    </div>
                  )}
                  {selectedItem.filmStock && (
                    <div>
                      <span className="block text-[9px] text-charcoal/60 dark:text-cream/60 font-medium uppercase select-none">胶片/感光 :</span>
                      {selectedItem.filmStock}
                    </div>
                  )}
                  {selectedItem.settings && (
                    <div>
                      <span className="block text-[9px] text-charcoal/60 dark:text-cream/60 font-medium uppercase select-none">曝光设置 :</span>
                      {selectedItem.settings}
                    </div>
                  )}
                </div>
              )}

              {/* 心情状态 */}
              {selectedItem.type === "love" && selectedItem.mood && (
                <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-amber-500/10 border border-amber-500/20 rounded-md font-mono text-[9px] tracking-widest text-amber-600 dark:text-amber-500 uppercase">
                  <span>心情记事 : {selectedItem.mood}</span>
                </div>
              )}

              {/* 记录文字 */}
              <div data-lenis-prevent className="max-h-36 overflow-y-auto pr-1 scrollbar-thin dark:scrollbar-white/10">
                <p className="font-sans text-xs text-charcoal/85 dark:text-cream/80 leading-relaxed tracking-wide whitespace-pre-wrap">
                  {selectedItem.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

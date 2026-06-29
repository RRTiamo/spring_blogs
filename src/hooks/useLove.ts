import { useState, useEffect } from "react";
import type { LoveEntry, BucketItem, TimeCapsule, LoveStats } from "@/interface/love";
import { mockLoveNotes, mockLoveBucket, mockLoveCapsules, mockLoveStats } from "@/mock/love";
import { getLoveList, getLoveBucketList, getLoveCapsuleList } from "@/api/love";
import { getPublicConfig } from "@/api/config";

function toNumber(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// 1. 获取纪念随笔
export function useLove() {
  const [loveNotes, setLoveNotes] = useState<LoveEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoveNotes = async () => {
      try {
        const response = await getLoveList();
        const res = response.data;
        if (res?.code !== 200) {
          throw new Error("API return code was not 200");
        }
        const formattedNotes: LoveEntry[] = res.data.map((item: any) => ({
          id: item.slug || `love-${item.id}`,
          title: item.title,
          date: item.date ? item.date.split("T")[0] : new Date().toISOString().split("T")[0],
          location: item.location || "",
          mood: item.mood || "quiet",
          visibility: (item.visibility as any) || "public",
          cover: item.cover || "/assets/love-anniversary.png",
          content: item.content || "",
          longitude: typeof item.longitude === "number" ? item.longitude : parseFloat(item.longitude) || 0,
          latitude: typeof item.latitude === "number" ? item.latitude : parseFloat(item.latitude) || 0
        }));
        setLoveNotes(formattedNotes);
      } catch (err) {
        console.warn("Next.js: Backend API unavailable, falling back to static local loveData.", err);
        setLoveNotes(mockLoveNotes);
      } finally {
        setLoading(false);
      }
    };

    fetchLoveNotes();
  }, []);

  return { loveNotes, loading };
}

// 2. 获取 100 件事愿望清单
export function useLoveBucket() {
  const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBucket = async () => {
      try {
        const response = await getLoveBucketList();
        const res = response.data;
        if (res?.code !== 200) {
          throw new Error("API code not 200");
        }
        const items: BucketItem[] = res.data.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          completed: item.completed === true || item.completed === 1,
          completedDate: item.completedDate || "",
          cover: item.cover || "",
          thoughts: item.thoughts || "",
          category: item.category || "daily"
        }));
        setBucketItems(items);
      } catch (err) {
        console.warn("Next.js: Backend API unavailable, falling back to static local bucket data.", err);
        setBucketItems(mockLoveBucket);
      } finally {
        setLoading(false);
      }
    };

    fetchBucket();
  }, []);

  return { bucketItems, loading, setBucketItems };
}

// 3. 获取时光胶囊
export function useLoveCapsules() {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const response = await getLoveCapsuleList();
        const res = response.data;
        if (res?.code !== 200) {
          throw new Error("API code not 200");
        }
        const items: TimeCapsule[] = res.data.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          sender: item.sender || "共同",
          receiver: item.receiver || "共同",
          writeDate: item.writeDate || "",
          openDate: item.openDate || "",
          content: item.content || ""
        }));
        setCapsules(items);
      } catch (err) {
        console.warn("Next.js: Backend API unavailable, falling back to static local capsules data.", err);
        setCapsules(mockLoveCapsules);
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, []);

  return { capsules, loading };
}

// 4. 获取恋爱陪伴数据（从系统配置中提取）
export function useLoveStats() {
  const [stats, setStats] = useState<LoveStats>(mockLoveStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getPublicConfig();
        const res = response.data;
        if (res?.code !== 200) {
          throw new Error("API code not 200");
        }
        const list = res.data || [];
        const findVal = (key: string, fallback: string) => {
          const match = list.find((c: any) => c.configKey === key);
          return match ? match.configValue : fallback;
        };

        setStats({
          startDate: findVal("love.stats.startDate", mockLoveStats.startDate),
          citiesCount: toNumber(findVal("love.stats.citiesCount", String(mockLoveStats.citiesCount)), mockLoveStats.citiesCount),
          flightDistance: toNumber(findVal("love.stats.flightDistance", String(mockLoveStats.flightDistance)), mockLoveStats.flightDistance),
          movieCount: toNumber(findVal("love.stats.movieCount", String(mockLoveStats.movieCount)), mockLoveStats.movieCount),
          mealCount: toNumber(findVal("love.stats.mealCount", String(mockLoveStats.mealCount)), mockLoveStats.mealCount)
        });
      } catch (err) {
        console.warn("Next.js: Backend API unavailable, falling back to local defaultLoveStats.", err);
        setStats(mockLoveStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

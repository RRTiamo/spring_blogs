import React from "react";
import AchievementsPageClient from "@/components/achievements/AchievementsPageClient";
import { Achievement } from "@/components/achievements/CertificateCard";
import { getAchievementsList, getAchievementMetasList } from "@/api/achievements";

export interface AchievementMeta {
  id: number;
  type: string; // category or level
  name: string;
  code: string;
  icon?: string;
}

async function getAchievements(): Promise<Achievement[]> {
  try {
    const res = await getAchievementsList();
    const data = res.data;
    if (data && data.code === 200 && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (err) {
    console.warn("Achievements Page SSR: API offline, falling back to client-side initialization.", err);
  }
  return [];
}

async function getAchievementMetas(): Promise<AchievementMeta[]> {
  try {
    const res = await getAchievementMetasList();
    const data = res.data;
    if (data && data.code === 200 && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (err) {
    console.warn("Achievements Page SSR metas: API offline, using empty meta.", err);
  }
  return [];
}

export default async function AchievementsPage() {
  const achievements = await getAchievements();
  const metas = await getAchievementMetas();

  return (
    <AchievementsPageClient
      initialItems={achievements}
      initialMetas={metas}
    />
  );
}

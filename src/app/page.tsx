import HomePageClient from "@/components/home/HomePageClient";
import { galleryData } from "@/data/gallery";
import { writingData, Post } from "@/data/writing";
import { getBlogsList } from "@/api/blogs";
import { getGalleryList } from "@/api/gallery";
import { getPublicConfig } from "@/api/config";
 
async function getFeaturedPosts(): Promise<Post[]> {
  try {
    const res = await getBlogsList();
    const data = res.data;
    if (data && data.code === 200) {
      return data.data.map((item: any) => ({
        slug: item.slug || `post-${item.id}`,
        title: item.title,
        date: item.createTime ? item.createTime.split("T")[0] : new Date().toISOString().split("T")[0],
        category: item.category || "Thoughts",
        mood: item.mood || "quiet",
        visibility: (item.visibility as any) || "public",
        cover: item.cover || "/assets/writing-camera.png",
        description: item.summary || "",
        content: item.content || ""
      })).slice(0, 3);
    }
  } catch (err) {
    console.warn("Home page: API unavailable, using local writingData static fallback.", err);
  }
  return writingData.slice(0, 3);
}

async function getFeaturedPhotos(): Promise<any[]> {
  try {
    const res = await getGalleryList();
    const data = res.data;
    if (data && data.code === 200) {
      return data.data.map((item: any) => ({
        id: item.slug || `photo-${item.id}`,
        title: item.title,
        date: item.date ? item.date.split("T")[0] : new Date().toISOString().split("T")[0],
        camera: item.camera || "",
        lens: item.lens || "",
        filmStock: item.filmStock || "",
        settings: item.settings || "",
        location: item.location || "",
        src: item.src || "",
        description: item.description || "",
        type: item.type || "image"
      })).slice(0, 4);
    }
  } catch (err) {
    console.warn("Home page gallery: API unavailable, using local galleryData static fallback.", err);
  }
  return galleryData.slice(0, 4);
}
 
async function getPublicConfigs(): Promise<Record<string, string>> {
  try {
    const res = await getPublicConfig();
    const data = res.data;
    if (data && data.code === 200 && Array.isArray(data.data)) {
      const configMap: Record<string, string> = {};
      data.data.forEach((item: any) => {
        configMap[item.configKey] = item.configValue;
      });
      return configMap;
    }
  } catch (err) {
    console.warn("Home page configs: API unavailable, using empty config fallback.", err);
  }
  return {};
}

 
export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts();
  const featuredPhotos = await getFeaturedPhotos();
  const configs = await getPublicConfigs();
  return (
    <HomePageClient
      featuredPosts={featuredPosts}
      homeGallerySlices={featuredPhotos}
      configs={configs}
    />
  );
}

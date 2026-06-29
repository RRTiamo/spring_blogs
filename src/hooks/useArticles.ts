/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Post, writingData } from "@/data/writing";
import { getBlogsList } from "@/api/blogs";
 
export function useArticles() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch posts from backend API (running on port 8080)
        const response = await getBlogsList();
        const res = response.data;
        if (res && res.code === 200) {
          // Map backend Entity representation to Next.js Post structure
          const formattedPosts: Post[] = res.data.map((item: any) => ({
            slug: item.slug || `post-${item.id}`,
            title: item.title,
            date: item.createTime ? item.createTime.split("T")[0] : new Date().toISOString().split("T")[0],
            category: item.category || "Thoughts",
            mood: item.mood || "quiet",
            visibility: (item.visibility as any) || "public",
            cover: item.cover || "/assets/writing-camera.png",
            description: item.summary || "",
            content: item.content || ""
          }));
          setPosts(formattedPosts);
        } else {
          throw new Error("API return code was not 200");
        }
      } catch (err) {
        console.warn("Next.js: Backend API unavailable, falling back to static local posts.", err);
        setPosts(writingData);
      } finally {
        setLoading(false);
      }
    };
 
    fetchArticles();
  }, []);
 
  return { posts, loading };
}

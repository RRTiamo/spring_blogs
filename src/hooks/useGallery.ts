import { useState, useEffect } from "react";
import { GalleryPhoto, galleryData } from "@/data/gallery";
import { getGalleryList } from "@/api/gallery";

export function useGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await getGalleryList();
        const res = response.data;
        if (res && res.code === 200) {
          const formattedPhotos: GalleryPhoto[] = res.data.map((item: any) => ({
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
            type: (item.type as any) || "image"
          }));
          setPhotos(formattedPhotos);
        } else {
          throw new Error("API return code was not 200");
        }
      } catch (err) {
        console.warn("Next.js: Backend API unavailable, falling back to static local galleryData.", err);
        setPhotos(galleryData);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return { photos, loading };
}

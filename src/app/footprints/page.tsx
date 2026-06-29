import FootprintsPageClient from "@/components/footprints/FootprintsPageClient";
import { getPublicConfig } from "@/api/config";
import { getGalleryList, getFootprintCategoryList } from "@/api/gallery";
import { getLoveList } from "@/api/love";

interface PublicConfig {
  configKey: string;
  configValue: string;
}

// 1. 获取公开系统配置以取得高德地图密钥
async function getMapConfig() {
  try {
    const res = await getPublicConfig();
    const payload = res.data;
    if (payload?.code === 200 && Array.isArray(payload.data)) {
      const data = payload.data as PublicConfig[];
      const keyCfg = data.find((c) => c.configKey === "page.footprint.amap.key");
      const codeCfg = data.find((c) => c.configKey === "page.footprint.amap.securityJsCode");
      return {
        key: keyCfg?.configValue || "",
        code: codeCfg?.configValue || "",
      };
    }
  } catch (error) {
    console.warn("Footprints: API public configs unavailable, fallback to env keys.", error);
  }
  return { key: "", code: "" };
}

// 2. 拉取照片墙列表
async function getGalleryFootprints(): Promise<any[]> {
  try {
    const res = await getGalleryList();
    const payload = res.data;
    if (payload?.code === 200 && Array.isArray(payload.data)) {
      return payload.data
        .filter((item: any) => item.longitude && item.latitude) // 只要带坐标的
        .map((item: any) => ({
          id: `photo-${item.id}`,
          type: (item.footprintType || "photo") as "photo" | "love",
          slug: item.slug || `photo-${item.id}`,
          title: item.title,
          date: item.date ? item.date.split("T")[0] : new Date().toISOString().split("T")[0],
          location: item.location || "未知",
          longitude: Number(item.longitude),
          latitude: Number(item.latitude),
          cover: item.src || "/assets/writing-camera.png",
          content: item.description || "",
          camera: item.camera || "",
          lens: item.lens || "",
          filmStock: item.filmStock || "",
          settings: item.settings || "",
          mediaType: item.type || "image",
        }));
    }
  } catch (error) {
    console.warn("Footprints page: Gallery API offline, falling back to static photo data.", error);
  }
  return [];
}

// 3. 拉取恋爱日记列表
async function getLoveFootprints(): Promise<any[]> {
  try {
    const res = await getLoveList();
    const payload = res.data;
    if (payload?.code === 200 && Array.isArray(payload.data)) {
      return payload.data
        .filter((item: any) => item.longitude && item.latitude) // 只要带坐标的
        .map((item: any) => ({
          id: `love-${item.id}`,
          type: (item.footprintType || "love") as "photo" | "love",
          slug: item.slug || `love-${item.id}`,
          title: item.title,
          date: item.date ? item.date.split("T")[0] : new Date().toISOString().split("T")[0],
          location: item.location || "未知",
          longitude: Number(item.longitude),
          latitude: Number(item.latitude),
          cover: item.cover || "/assets/love-anniversary.png",
          content: item.content || "",
          mood: item.mood || "",
          mediaType: "image",
        }));
    }
  } catch (error) {
    console.warn("Footprints page: Love API offline, falling back to static love data.", error);
  }
  return [];
}

// 4. 拉取足迹类别列表
async function getFootprintCategories(): Promise<any[]> {
  try {
    const res = await getFootprintCategoryList();
    const payload = res.data;
    if (payload?.code === 200 && Array.isArray(payload.data)) {
      return payload.data;
    }
  } catch (error) {
    console.warn("Footprints page: Categories API offline, falling back to static categories.", error);
  }
  return [
    { id: 1, name: "光影影像", code: "photo", icon: "Camera" },
    { id: 2, name: "甜蜜瞬间", code: "love", icon: "Heart" },
  ];
}

export default async function FootprintsPage() {
  const mapConfig = await getMapConfig();
  const galleryItems = await getGalleryFootprints();
  const loveItems = await getLoveFootprints();
  const categories = await getFootprintCategories();

  // 拼接与去重
  let combinedItems = [...galleryItems, ...loveItems];

  // 4. 静态本地 fallback 兜底数据（在接口完全离线时保证前台完美可看）
  if (combinedItems.length === 0) {
    combinedItems = [
      {
        id: "static-photo-1",
        type: "photo",
        slug: "sidewalk-night",
        title: "深夜霓虹下的人行道",
        date: "2026-06-18",
        location: "上海 · 南京东路",
        longitude: 121.4883,
        latitude: 31.2369,
        cover: "/assets/【哲风壁纸】人行道-城市-夜晚.png",
        content: "城市的霓虹反射在微湿的人行道上。路灯把行人的影子拉得很长。深邃的蓝色调中透着都市的孤独感。胶片特有的银盐颗粒在暗部特别明显，配合 Zeiss 镜头的大光圈，散发出迷人的光圈散景。",
        camera: "Contax T2",
        lens: "Sonnar 38mm f/2.8",
        filmStock: "Fujifilm Superia 400",
        settings: "f/2.8, 1/30s",
      },
      {
        id: "static-photo-2",
        type: "photo",
        slug: "mountain-pavilion",
        title: "孤山亭子与破晓薄雾",
        date: "2026-03-05",
        location: "南京 · 紫金山巅",
        longitude: 118.8443,
        latitude: 32.0621,
        cover: "/assets/【哲风壁纸】亭子-励志文案-山石.png",
        content: "立于山巅乱石之中的古典凉亭，旁侧印刻着励志文字。朝霞初生，破晓的薄雾在树干之间弥漫，这是一场逃离都市的山野探索。在清晨五点爬上山顶，寒风料峭中按下这枚快门，定格物理意义上的光线碰撞。",
        camera: "Canon F-1",
        lens: "FD 50mm f/1.4",
        filmStock: "Kodak Portra 160",
        settings: "f/5.6, 1/125s",
      },
      {
        id: "static-photo-3",
        type: "photo",
        slug: "rabbit-sunset",
        title: "公路旁日落时分的小兔",
        date: "2026-02-14",
        location: "杭州 · 龙井山道",
        longitude: 120.1551,
        latitude: 30.2741,
        cover: "/assets/【哲风壁纸】兔子-公路-日落.png",
        content: "夕阳将公路渲染成温暖的金黄色，一只小兔在路边草丛里探出头。金色的逆光将兔毛边缘照亮成光晕。在落日前的最后十分钟，使用 Leica M6 的黄斑快速对焦，这是一张极其难得的生活切片。",
        camera: "Leica M6",
        lens: "Elmarit 90mm f/2.8",
        filmStock: "Kodak Gold 200",
        settings: "f/4.0, 1/250s",
      },
      {
        id: "static-love-1",
        type: "love",
        slug: "anniversary-3years",
        title: "三周年：从日落到星空",
        date: "2026-05-20",
        location: "秦皇岛 · 阿那亚孤独图书馆",
        longitude: 119.866068,
        latitude: 39.734289,
        cover: "/assets/love-anniversary.png",
        content: "海浪冲刷着沙滩，我们在阿那亚的孤独图书馆旁坐了很久。从天色微红一直坐到繁星点点，风很大，但因为你靠在身旁，一切都显得无比安详。谢谢你陪我走过的第三个四季。希望下一个三年、十年，我们依然能在世界各个海角仰望同一片星空。",
        mood: "romantic",
      },
      {
        id: "static-love-2",
        type: "love",
        slug: "first-cooking-disaster",
        title: "厨房里的“灾难”与大笑",
        date: "2026-02-14",
        location: "上海 · 卢湾旧租屋",
        longitude: 121.4737,
        latitude: 31.2304,
        cover: "/assets/love-cooking.png",
        content: "本来计划做一顿法式红酒炖牛肉，结果因为聊天太投入，红酒收汁过头，牛肉有些焦糊，烟雾报警器还响了起来。我们手忙脚乱地挥动抹布散热，最后只能叫了外卖披萨。但那晚我们开了一瓶好酒，坐在地板上笑了整整一个通宵。其实幸福并不是多么精致的晚宴，而是我们面对灾难时能一起大笑的默契。",
        mood: "playful",
      },
      {
        id: "static-love-3",
        type: "love",
        slug: "rainy-day-museum",
        title: "美术馆的无声漫步",
        date: "2025-11-18",
        location: "上海 · 徐汇西岸美术馆",
        longitude: 121.45524,
        latitude: 31.18123,
        cover: "/assets/love-museum.png",
        content: "窗外是阴冷潮湿的上海秋雨，展厅内是巨大而沉静的抽象画作。我们没有太多言语，只是安静地并肩走过一个又一个展厅。有时候，爱情不需要轰轰烈烈的对白，只要在沉默的艺术品前，余光里全是你，就足够温暖。",
        mood: "peaceful",
      },
    ];
  }

  // 按照日期倒序排列，让最新的足迹先展示在顶部
  combinedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <FootprintsPageClient
      initialItems={combinedItems}
      apiMapKey={mapConfig.key}
      apiMapCode={mapConfig.code}
      categories={categories}
    />
  );
}

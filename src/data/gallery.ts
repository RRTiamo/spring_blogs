export interface GalleryPhoto {
  id: string;
  title: string;
  date: string;
  camera: string;
  lens: string;
  filmStock: string;
  settings: string;
  location: string;
  src: string;
  description: string;
  type: "image" | "video";
}

export const galleryData: GalleryPhoto[] = [
  // 1. 人行道-城市-夜晚
  {
    id: "sidewalk-night",
    title: "深夜霓虹下的人行道",
    date: "2026-06-18",
    camera: "Contax T2",
    lens: "Sonnar 38mm f/2.8",
    filmStock: "Fujifilm Superia 400",
    settings: "f/2.8, 1/30s",
    location: "City Sidewalk, Night",
    src: "/assets/【哲风壁纸】人行道-城市-夜晚.png",
    description: "城市的霓虹反射在微湿的人行道上。路灯把行人的影子拉得很长。深邃的蓝色调中透着都市的孤独感。",
    type: "image"
  },
  // 2. 二次元-卡通
  {
    id: "anime-cartoon",
    title: "卡通少女的午后遐思",
    date: "2026-05-24",
    camera: "Digital Art Studio",
    lens: "Custom Brush",
    filmStock: "RGB Digital",
    settings: "300 DPI, sRGB",
    location: "Dreamy Studio",
    src: "/assets/【哲风壁纸】二次元-卡通.png",
    description: "柔和明亮的色彩描绘出一位少女静静凝视前方的状态，洋溢着二次元独有的手绘艺术风情与空气感。",
    type: "image"
  },
  // 3. 云层-地球-大气层
  {
    id: "earth-stratosphere",
    title: "仰望平流层：地球边缘",
    date: "2026-04-12",
    camera: "Hasselblad 503CX",
    lens: "Distagon 40mm f/4",
    filmStock: "Kodak Ektar 100",
    settings: "f/11, 1/500s",
    location: "Above the Clouds",
    src: "/assets/【哲风壁纸】云层-地球-大气层.png",
    description: "从高空俯瞰地球，淡蓝的大气层边缘与厚重的云海重叠，形成了一种无声的壮丽视角。",
    type: "image"
  },
  // 4. 亭子-励志文案-山石
  {
    id: "mountain-pavilion",
    title: "孤山亭子与励志格言",
    date: "2026-03-05",
    camera: "Canon F-1",
    lens: "FD 50mm f/1.4",
    filmStock: "Kodak Portra 160",
    settings: "f/5.6, 1/125s",
    location: "Mountain Summit",
    src: "/assets/【哲风壁纸】亭子-励志文案-山石.png",
    description: "立于山巅乱石之中的古典凉亭，旁侧印刻着励志文字，在破晓的薄雾中显示出坚毅的物理哲学意味。",
    type: "image"
  },
  // 5. 兔子-公路-日落
  {
    id: "rabbit-sunset",
    title: "公路旁日落时分的小兔",
    date: "2026-02-14",
    camera: "Leica M6",
    lens: "Elmarit 90mm f/2.8",
    filmStock: "Kodak Gold 200",
    settings: "f/4.0, 1/250s",
    location: "Highway Margins",
    src: "/assets/【哲风壁纸】兔子-公路-日落.png",
    description: "夕阳将公路渲染成温暖的金黄色，一只小兔在路边草丛里探出头。金色的逆光将兔毛边缘照亮成光晕。",
    type: "image"
  },
  // 6. 二次元-少年-帅
  {
    id: "anime-boy",
    title: "侧影：风中伫立的少年",
    date: "2026-01-20",
    camera: "Hand-painted Sketch",
    lens: "Ink Pen & Pencil",
    filmStock: "Canson Paper",
    settings: "High Contrast",
    location: "Retro Atelier",
    src: "/assets/【哲风壁纸】二次元-少年-帅.png",
    description: "简洁高对比度的铅笔勾勒线条，定格少年被微风拂过的一瞬间，呈现纯粹的日系极简画风。",
    type: "image"
  },
  // 7. 剪影-壁纸-天空
  {
    id: "sky-silhouette",
    title: "日暮天际线与孤独剪影",
    date: "2025-12-15",
    camera: "Contax T2",
    lens: "Sonnar 38mm f/2.8",
    filmStock: "Kodak Ektar 100",
    settings: "f/8.0, 1/125s",
    location: "Wasteland, Sunset",
    src: "/assets/【哲风壁纸】剪影-壁纸-天空.png",
    description: "强烈的背光让地表景物化为安静剪影。天空中残存的晚霞铺开蓝紫与橙红的色带。",
    type: "image"
  },
  // 8. 发丝-手绘少女
  {
    id: "handdrawn-girl",
    title: "发丝飞扬的手绘微写",
    date: "2025-11-08",
    camera: "Digital Art Studio",
    lens: "Fine Pen Preset",
    filmStock: "Monochrome Canvas",
    settings: "Ultra High Res",
    location: "Imagination Void",
    src: "/assets/【哲风壁纸】发丝-手绘少女.png",
    description: "极尽细腻的线条绘制出飞扬的发丝。少女的目光中充满迷茫与微光，是情绪主义插画的精品之作。",
    type: "image"
  },
  // 9. 围墙白花-夜空-晨曦
  {
    id: "flower-wall",
    title: "围墙白花：夜空与晨曦交融",
    date: "2025-10-14",
    camera: "Hasselblad 503CX",
    lens: "Planar 80mm f/2.8",
    filmStock: "Fujifilm Velvia 50",
    settings: "f/4.0, 1/60s",
    location: "Garden Wall",
    src: "/assets/【哲风壁纸】围墙白花-夜空-晨曦.png",
    description: "在夜幕尚未退去、晨曦初现的极佳时段，白色的藤蔓小花在深邃天空背景前静静绽放，富有诗意意味。",
    type: "image"
  },
  // 10. 图片-夜晚-好看
  {
    id: "nice-night",
    title: "幽静蓝色森林之夜",
    date: "2025-09-02",
    camera: "Canon F-1",
    lens: "FD 28mm f/2.8",
    filmStock: "Kodak Portra 800",
    settings: "f/2.8, 1/15s",
    location: "Deep Forest",
    src: "/assets/【哲风壁纸】图片-夜晚-好看.png",
    description: "繁星照耀下的静谧林地。冷色调的蓝雾在树干之间弥漫，这是一场逃离现实的夏夜好梦。",
    type: "image"
  },
  // 11. 动态视频：云杉树雪景
  {
    id: "spruce-snow",
    title: "云杉林与飘落的大雪",
    date: "2026-01-05",
    camera: "RED V-Raptor",
    lens: "Cine Lens 50mm",
    filmStock: "8K Digital Video",
    settings: "24 fps, shutter 180°",
    location: "Spruce Forest",
    src: "/assets/【哲风壁纸】mc-下雪-云杉树.mp4",
    description: "三维像素风的云杉林下，鹅毛大雪静静飘落，营造出极度催眠与安详的冬日雪景意境。",
    type: "video"
  },
  // 12. 动态视频：二次元-动漫女孩
  {
    id: "anime-girl-video",
    title: "月色窗边的动漫女孩",
    date: "2026-03-20",
    camera: "Animate Presets",
    lens: "Digital Camera",
    filmStock: "MP4 Video stream",
    settings: "60 fps, Full HD",
    location: "Bedroom Window",
    src: "/assets/【哲风壁纸】二次元-动漫女孩.mp4",
    description: "月光透过窗帘洒进房间。女孩安静地靠在床边，微风轻轻掀起发梢。这是一个适合白日梦的动态切片。",
    type: "video"
  },
  // 13. 动态视频：海岛树枝
  {
    id: "island-branches",
    title: "海岛树梢与微风",
    date: "2025-08-20",
    camera: "Sony FX3",
    lens: "24-70mm GM II",
    filmStock: "S-Log3 Video",
    settings: "120 fps Slow Motion",
    location: "Tropical Island",
    src: "/assets/【哲风壁纸】户外-树枝-海岛.mp4",
    description: "热带海岛海岸线上，被海风摇曳的椰子树枝和绿叶，背景是波光粼粼的蔚蓝海面。",
    type: "video"
  },
  // 14. 动态视频：樱花飘落
  {
    id: "sakura-fall",
    title: "古风庭院与樱花落雨",
    date: "2026-04-18",
    camera: "RED V-Raptor",
    lens: "Cine Lens 85mm",
    filmStock: "Ultra HD Raw",
    settings: "60 fps, f/1.8",
    location: "Kyoto Temple",
    src: "/assets/【哲风壁纸】樱花-樱花飘落.mp4",
    description: "古老的寺庙庭院中，满树樱花在微风中飞舞，化作一片片粉色的樱花雨，带有一种禅意与逝去之美。",
    type: "video"
  }
];

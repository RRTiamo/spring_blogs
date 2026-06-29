import { LoveEntry, BucketItem, TimeCapsule, LoveStats } from "../interface/love";

export const mockLoveNotes: LoveEntry[] = [
  {
    id: "anniversary-3years",
    title: "三周年：从日落到星空",
    date: "2026-05-20",
    location: "阿那亚 · 黄金海岸",
    mood: "romantic",
    visibility: "public",
    cover: "/assets/love-anniversary.png",
    content: "海浪冲刷着沙滩，我们在阿那亚的孤独图书馆旁坐了很久。从天色微红一直坐到繁星点点，风很大，但因为你靠在身旁，一切都显得无比安详。谢谢你陪我走过的第三个四季。",
    longitude: 119.884561,
    latitude: 39.693421
  },
  {
    id: "first-cooking-disaster",
    title: "厨房里的“灾难”与大笑",
    date: "2026-02-14",
    location: "我们的出租屋",
    mood: "playful",
    visibility: "private",
    cover: "/assets/love-cooking.png",
    content: "本来计划做一顿法式红酒炖牛肉，结果因为聊天太投入，红酒收汁过头，牛肉有些焦糊，烟雾报警器还响了起来。我们手忙脚乱地挥动抹布散热，最后只能叫了外卖披萨。但那晚我们开了一瓶好酒，坐在地板上笑了整整一个通宵。",
    longitude: 121.473701,
    latitude: 31.230401
  },
  {
    id: "rainy-day-museum",
    title: "美术馆的无声漫步",
    date: "2025-11-18",
    location: "西岸美术馆",
    mood: "peaceful",
    visibility: "hidden",
    cover: "/assets/love-museum.png",
    content: "窗外是阴冷潮湿的上海秋雨，展厅内是巨大而沉静的抽象画作。我们没有太多言语，只是安静地并肩走过一个又一个展厅。有时候，爱情不需要轰轰烈烈的对白，只要在沉默的艺术品前，余光里全是你，就足够温暖。",
    longitude: 121.458901,
    latitude: 31.183401
  }
];

export const mockLoveBucket: BucketItem[] = [
  {
    id: "bucket-1",
    title: "一起去阿那亚看一次日出",
    completed: true,
    completedDate: "2026-05-21",
    cover: "/assets/love-anniversary.png",
    thoughts: "虽然海风很大，冻得清鼻涕直流，但是当第一缕阳光穿破云雾照在孤独图书馆上时，感觉一切等待都是值得的。",
    category: "travel"
  },
  {
    id: "bucket-2",
    title: "共同拼完一幅 1000 片拼图",
    completed: false,
    category: "daily"
  },
  {
    id: "bucket-3",
    title: "学会做一次完美的红酒炖牛肉",
    completed: false,
    category: "food"
  },
  {
    id: "bucket-4",
    title: "一起坐一次热气球",
    completed: false,
    category: "adventure"
  }
];

export const mockLoveCapsules: TimeCapsule[] = [
  {
    id: "capsule-1",
    title: "三周年写给未来的彼此",
    sender: "共同",
    receiver: "共同",
    writeDate: "2026-05-20",
    openDate: "2026-06-01",
    content: "亲爱的：不知道当你打开这封信时，我们是不是已经养了那只金毛？或者是已经搬进了有大阳台的房子？三年的时光飞快掠过，谢谢你给我的每一个拥抱和无条件的支持。未来的日子里，我们还要继续相爱，去往更远的地方！"
  },
  {
    id: "capsule-2",
    title: "写给 2028 年的你",
    sender: "他",
    receiver: "她",
    writeDate: "2026-06-25",
    openDate: "2028-06-25",
    content: "宝贝，这是一封来自两年前的时光信件。此时的我在默默敲下这些字。希望到了 2028 年，你依然拥有如今天这般清澈温暖的笑容，而我，也依然紧紧牵着你的手。那时候，我们应该已经实现了一起去看冰岛极光的约定了吧？"
  }
];

export const mockLoveStats: LoveStats = {
  startDate: "2023-05-20",
  citiesCount: 5,
  flightDistance: 12400,
  movieCount: 48,
  mealCount: 99
};

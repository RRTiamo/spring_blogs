import type { AboutProfile } from "@/interface/about";

export const aboutProfile: AboutProfile = {
  name: "RRTiamo",
  role: "此间主人",
  headline: "我在代码、文字和生活的缝隙里，慢慢搭建一个属于自己的小宇宙。",
  introduction:
    "这里不是一份简历，而是一些关于我的切片：我正在做的事、相信的东西、留下的痕迹，以及一些暂时还说不清楚的未来。",
  tags: [
    "# Developer",
    "# Researcher",
    "# Writer",
    "# Life Recorder",
    "# Romantic Builder",
  ],
  avatar: "/assets/avtor-boy.jpg",
  currentStatus: {
    title: "现在的我",
    items: [
      {
        label: "正在构建",
        desc: "正在搭建一个个人网站。它会保存随笔、项目、恋爱记录、灵感碎片和一些不太适合被算法推荐的东西。",
      },
      {
        label: "正在研究",
        desc: "正在研究多源证据融合与虚假新闻检测。我对复杂信息如何被判断、解释和相信这件事很感兴趣。",
      },
      {
        label: "正在学习",
        desc: "正在学习如何让页面更有审美。比起功能堆叠，我更希望每个页面都有它自己的呼吸。",
      },
    ],
  },
  coordinates: {
    title: "我的坐标",
    items: [
      {
        label: "我从哪里来",
        desc: "从一个只想把功能做出来的人，慢慢变成一个开始在意结构、表达和体验的人。",
      },
      {
        label: "我正在做什么",
        desc: "用代码搭建自己的数字空间，也用文字记录生活里那些容易被忽略的瞬间。",
      },
      {
        label: "我在意什么",
        desc: "清晰、克制、长期、真实，以及一点不合时宜的浪漫。",
      },
      {
        label: "我想去哪里",
        desc: "希望多年以后再打开这里，还能看见一个具体、鲜活、没有被时间磨平的自己。",
      },
    ],
  },
  fragments: {
    title: "Fragments of Me",
    subtitle: "自我切片",
    items: [
      {
        category: "技术",
        tags: ["Java", "Spring Boot", "MySQL", "Vue", "Nuxt", "TypeScript"],
        desc: "用代码搭建秩序",
        image: "",
      },
      {
        category: "研究",
        tags: ["虚假新闻检测", "多源证据融合", "事实核查", "信息融合"],
        desc: "在复杂信息里寻找证据",
        image: "",
      },
      {
        category: "写作",
        tags: ["随笔", "论文", "博客", "个人叙事"],
        desc: "把想法从混乱里捞出来",
        image: "",
      },
      {
        category: "生活",
        tags: ["恋爱记录", "情绪碎片", "旅行", "电影", "音乐", "深夜胡思乱想"],
        desc: "收藏一些不会重来的瞬间",
        image: "/assets/life_snapshot.png",
      },
    ],
  },
  beliefs: {
    title: "我相信",
    subtitle: "Some Things I Believe",
    items: [
      "我相信技术不只是工具，它也可以成为表达的一部分。",
      "我相信个人网站的意义，不在于展示一个完美的人，而在于保存一个正在变化的人。",
      "我相信真正高级的东西，往往不是复杂，而是克制、准确和有温度。",
      "我相信生活值得被记录，哪怕只是某个深夜突然出现的一句话。",
    ],
  },
  explore: {
    title: "继续探索",
    desc: "如果你想再多认识我一点，可以去看看我的文章、项目、恋爱记录，也可以去鱼塘里留下一条建议。",
    links: [
      { label: "翻开随笔", href: "/writing", icon: "notes" },
      { label: "看看项目", href: "/gallery", icon: "code" },
      { label: "去鱼塘冒泡", href: "/pond", icon: "travel" },
      { label: "写一封信", href: "/letter", icon: "notes" },
    ],
    closing: "这个网站还没有完成。准确地说，我也没有。",
    footerSubtitle: "About the one behind this site.",
  },
};

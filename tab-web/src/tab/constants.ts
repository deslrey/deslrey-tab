import type { QuickSite, SearchEngine, TabGroup, TileSize } from "@/tab/types";

export const defaultGroups: TabGroup[] = [
  { id: "home", name: "主页", icon: "home" },
  { id: "coding", name: "编程", icon: "code" },
];

export const defaultQuickSites: QuickSite[] = [
  { name: "GitHub", short: "GH", url: "https://github.com", color: "bg-zinc-900", groupId: "coding" },
  { name: "淘宝", short: "淘", url: "https://taobao.com", color: "bg-orange-500", groupId: "home" },
  { name: "Bilibili", short: "B", url: "https://bilibili.com", color: "bg-pink-500", groupId: "home" },
  { name: "百度", short: "度", url: "https://baidu.com", color: "bg-blue-500", groupId: "home" },
  { name: "掘金", short: "掘", url: "https://juejin.cn", color: "bg-cyan-500", groupId: "coding" },
  { name: "抖音", short: "抖", url: "https://douyin.com", color: "bg-black", groupId: "home" },
  { name: "Steam", short: "S", url: "https://store.steampowered.com", color: "bg-slate-700", groupId: "home" },
  { name: "网易云", short: "云", url: "https://music.163.com", color: "bg-red-600", groupId: "home" },
];

export const iconColorOptions = [
  { value: "bg-zinc-900", swatchClass: "bg-zinc-900" },
  { value: "bg-orange-500", swatchClass: "bg-orange-500" },
  { value: "bg-pink-500", swatchClass: "bg-pink-500" },
  { value: "bg-blue-500", swatchClass: "bg-blue-500" },
  { value: "bg-cyan-500", swatchClass: "bg-cyan-500" },
  { value: "bg-black", swatchClass: "bg-black" },
  { value: "bg-slate-700", swatchClass: "bg-slate-700" },
  { value: "bg-red-600", swatchClass: "bg-red-600" },
  { value: "bg-emerald-500", swatchClass: "bg-emerald-500" },
  { value: "bg-violet-500", swatchClass: "bg-violet-500" },
  { value: "transparent", swatchClass: "bg-transparent border border-zinc-400" },
];

export const engines: SearchEngine[] = [
  { key: "baidu", label: "B", url: "https://www.baidu.com/s?wd=" },
  { key: "bing", label: "必应", url: "https://cn.bing.com/search?q=" },
  { key: "google", label: "G", url: "https://www.google.com/search?q=" },
];

export const tileSizeClasses: Record<TileSize, string> = {
  "1x1": "col-span-1 row-span-1",
  "1x2": "col-span-2 row-span-1",
  "2x1": "col-span-1 row-span-2",
  "2x2": "col-span-2 row-span-2",
  "2x4": "col-span-4 row-span-2",
};

export const tileIconClasses: Record<TileSize, string> = {
  "1x1": "h-14 w-14 text-lg",
  "1x2": "h-full w-full text-2xl",
  "2x1": "h-full w-full text-2xl",
  "2x2": "h-full w-full text-4xl",
  "2x4": "h-full w-full text-5xl",
};

export const tileSizeOptions: TileSize[] = ["1x1", "1x2", "2x1", "2x2", "2x4"];

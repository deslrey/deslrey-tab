import { Cloud, Cog, Download, Heart, Languages, Plus, Search, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const quickSites = [
  { name: "GitHub", short: "GH", url: "https://github.com", color: "bg-zinc-900" },
  { name: "淘宝", short: "淘", url: "https://taobao.com", color: "bg-orange-500" },
  { name: "Bilibili", short: "B", url: "https://bilibili.com", color: "bg-pink-500" },
  { name: "百度", short: "度", url: "https://baidu.com", color: "bg-blue-500" },
  { name: "掘金", short: "掘", url: "https://juejin.cn", color: "bg-cyan-500" },
  { name: "抖音", short: "抖", url: "https://douyin.com", color: "bg-black" },
  { name: "Steam", short: "S", url: "https://store.steampowered.com", color: "bg-slate-700" },
  { name: "网易云", short: "云", url: "https://music.163.com", color: "bg-red-600" },
];

const engines = [
  { key: "baidu", label: "B", url: "https://www.baidu.com/s?wd=" },
  { key: "bing", label: "必应", url: "https://cn.bing.com/search?q=" },
  { key: "google", label: "G", url: "https://www.google.com/search?q=" },
];

type ContextMenuState = {
  open: boolean;
  x: number;
  y: number;
};

type IconMenuState = {
  open: boolean;
  x: number;
  y: number;
  siteName: string | null;
};

type TileSize = "1x1" | "1x2" | "2x1" | "2x2" | "2x4";

const tileSizeClasses: Record<TileSize, string> = {
  "1x1": "col-span-1 row-span-1",
  "1x2": "col-span-2 row-span-1",
  "2x1": "col-span-1 row-span-2",
  "2x2": "col-span-2 row-span-2",
  "2x4": "col-span-4 row-span-2",
};

const tileIconClasses: Record<TileSize, string> = {
  "1x1": "h-14 w-14 text-lg",
  "1x2": "h-16 w-16 text-xl",
  "2x1": "h-16 w-16 text-xl",
  "2x2": "h-20 w-20 text-2xl",
  "2x4": "h-24 w-24 text-3xl",
};

function App() {
  const [keyword, setKeyword] = useState("");
  const [searchEngine, setSearchEngine] = useState(engines[2].url);
  const [now, setNow] = useState(new Date());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isTimeExpanded, setIsTimeExpanded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ open: false, x: 0, y: 0 });
  const [iconMenu, setIconMenu] = useState<IconMenuState>({ open: false, x: 0, y: 0, siteName: null });
  const [draggingSite, setDraggingSite] = useState<string | null>(null);
  const [siteSizes, setSiteSizes] = useState<Record<string, TileSize>>(() => {
    try {
      const cached = window.localStorage.getItem("tab-site-sizes");
      return cached ? (JSON.parse(cached) as Record<string, TileSize>) : {};
    } catch {
      return {};
    }
  });
  const [siteOrder, setSiteOrder] = useState<string[]>(() => {
    try {
      const cached = window.localStorage.getItem("tab-site-order");
      const parsed = cached ? (JSON.parse(cached) as string[]) : [];
      const validNames = new Set(quickSites.map((site) => site.name));
      const filtered = parsed.filter((name) => validNames.has(name));
      const missing = quickSites.map((site) => site.name).filter((name) => !filtered.includes(name));
      return [...filtered, ...missing];
    } catch {
      return quickSites.map((site) => site.name);
    }
  });

  useEffect(() => {
    const updateClock = () => {
      setNow(new Date());
    };
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentEngineKey = useMemo(
    () => engines.find((item) => item.url === searchEngine)?.key ?? "google",
    [searchEngine],
  );
  const orderedSites = useMemo(() => {
    const byName = new Map(quickSites.map((site) => [site.name, site]));
    return siteOrder.map((name) => byName.get(name)).filter((site): site is (typeof quickSites)[number] => Boolean(site));
  }, [siteOrder]);

  const clock = useMemo(() => {
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    return `${hour}:${minute}`;
  }, [now]);

  const dateText = useMemo(
    () =>
      new Intl.DateTimeFormat("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(now),
    [now],
  );

  const lunarText = useMemo(
    () =>
      new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
        month: "long",
        day: "numeric",
      }).format(now),
    [now],
  );

  const isSearchMode = isSearchFocused || isTimeExpanded;

  const launchSearch = () => {
    const text = keyword.trim();
    if (!text) return;
    window.open(`${searchEngine}${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const closeContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, open: false }));
    setIconMenu((prev) => ({ ...prev, open: false }));
  };

  const handleContextMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const menuWidth = 170;
    const menuHeight = 210;
    const x = Math.min(event.clientX, window.innerWidth - menuWidth - 12);
    const y = Math.min(event.clientY, window.innerHeight - menuHeight - 12);
    setContextMenu({ open: true, x: Math.max(x, 12), y: Math.max(y, 12) });
  };

  const handleSiteContextMenu = (event: MouseEvent<HTMLElement>, siteName: string) => {
    event.preventDefault();
    event.stopPropagation();
    const menuWidth = 220;
    const menuHeight = 260;
    const x = Math.min(event.clientX, window.innerWidth - menuWidth - 12);
    const y = Math.min(event.clientY, window.innerHeight - menuHeight - 12);
    setContextMenu((prev) => ({ ...prev, open: false }));
    setIconMenu({
      open: true,
      x: Math.max(x, 12),
      y: Math.max(y, 12),
      siteName,
    });
  };

  const changeSiteSize = (size: TileSize) => {
    if (!iconMenu.siteName) return;
    setSiteSizes((prev) => ({
      ...prev,
      [iconMenu.siteName!]: size,
    }));
    setIconMenu((prev) => ({ ...prev, open: false }));
  };

  const openSelectedSite = () => {
    if (!iconMenu.siteName) return;
    const targetSite = quickSites.find((site) => site.name === iconMenu.siteName);
    if (!targetSite) return;
    window.open(targetSite.url, "_blank", "noopener,noreferrer");
    setIconMenu((prev) => ({ ...prev, open: false }));
  };

  const reorderSites = (fromName: string, toName: string) => {
    if (fromName === toName) return;
    setSiteOrder((prev) => {
      const fromIndex = prev.indexOf(fromName);
      const toIndex = prev.indexOf(toName);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const next = [...prev];
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, fromName);
      return next;
    });
  };

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContextMenu();
        setIsTimeExpanded(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tab-site-sizes", JSON.stringify(siteSizes));
  }, [siteSizes]);

  useEffect(() => {
    window.localStorage.setItem("tab-site-order", JSON.stringify(siteOrder));
  }, [siteOrder]);

  return (
    <main
      className="tab-bg min-h-screen text-white"
      onContextMenu={handleContextMenu}
      onClick={() => {
        closeContextMenu();
        if (isTimeExpanded) setIsTimeExpanded(false);
      }}
    >
      <div className={`tab-overlay min-h-screen transition-all duration-300 ${isSearchMode ? "backdrop-blur-md" : ""}`}>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="打开设置"
              className="fixed right-8 top-4 z-20 text-zinc-100 hover:bg-white/15 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>页面设置</DialogTitle>
              <DialogDescription>先本地配置搜索引擎，后续再接后端接口保存。</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-zinc-700">默认搜索引擎</p>
              <div className="flex gap-2">
                {engines.map((engine) => (
                  <Button
                    key={engine.key}
                    variant={currentEngineKey === engine.key ? "default" : "secondary"}
                    onClick={() => setSearchEngine(engine.url)}
                  >
                    {engine.key === "bing" ? "必应" : engine.key === "baidu" ? "百度" : "Google"}
                  </Button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary">保存（待接接口）</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-8 py-8">

          <section className="mx-auto mt-20 flex w-full max-w-4xl flex-1 flex-col items-center">
            <button
              type="button"
              className={`rounded-xl px-6 py-3 text-center transition ${isTimeExpanded ? "bg-black/10" : "hover:bg-black/10"}`}
              onClick={(event) => {
                event.stopPropagation();
                setIsTimeExpanded((prev) => !prev);
              }}
            >
              <h1 className={`${isTimeExpanded ? "text-7xl font-bold" : "text-5xl font-semibold"} tracking-wider text-white/95`}>
                {clock}
              </h1>
              {isTimeExpanded && (
                <p className="mt-2 text-sm text-white/90">
                  {dateText} · 农历 {lunarText}
                </p>
              )}
            </button>

            <div
              className="mt-8 flex w-full max-w-xl items-center rounded-full border border-white/15 bg-white/45 px-4 py-2 shadow-lg backdrop-blur-md"
              onClick={(event) => event.stopPropagation()}
            >
              <Search className="h-4 w-4 text-zinc-700" />
              <Input
                className="h-9 border-0 bg-transparent text-zinc-900 placeholder:text-zinc-700/75 focus:border-0"
                placeholder="输入关键字搜索..."
                value={keyword}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") launchSearch();
                }}
              />
              <Button
                onClick={launchSearch}
                className="h-8 rounded-full bg-zinc-900/90 px-5 text-xs hover:bg-zinc-900"
              >
                搜索
              </Button>
            </div>

            <div
              className="mt-4 flex items-center gap-2 rounded-full bg-white/30 px-3 py-1.5 backdrop-blur-sm transition"
              onClick={(event) => event.stopPropagation()}
            >
              {engines.map((engine) => (
                <button
                  key={engine.key}
                  type="button"
                  onClick={() => setSearchEngine(engine.url)}
                  className={`h-7 min-w-12 rounded-full px-3 text-xs transition ${currentEngineKey === engine.key
                      ? "bg-white text-zinc-800 shadow"
                      : "bg-white/20 text-white hover:bg-white/35"
                    }`}
                >
                  {engine.label}
                </button>
              ))}
            </div>

            <div
              className={`mt-16 grid w-fit grid-flow-dense grid-cols-8 auto-rows-[88px] gap-4 transition-all duration-300 ${isSearchMode ? "pointer-events-none translate-y-2 opacity-0" : "translate-y-0 opacity-100"
                }`}
            >
              {orderedSites.map((site) => {
                const size = siteSizes[site.name] ?? "1x1";
                return (
                  <a
                    key={site.name}
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    draggable
                    onDragStart={() => setDraggingSite(site.name)}
                    onDragEnd={() => setDraggingSite(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (draggingSite) {
                        reorderSites(draggingSite, site.name);
                      }
                      setDraggingSite(null);
                    }}
                    onContextMenu={(event) => handleSiteContextMenu(event, site.name)}
                    className={`group flex min-w-0 flex-col items-center justify-center rounded-2xl text-center no-underline transition ${tileSizeClasses[size]
                      }`}
                  >
                    <div
                      className={`flex items-center justify-center rounded-2xl ${site.color} font-semibold text-white shadow-md transition group-hover:-translate-y-0.5 group-hover:shadow-xl ${tileIconClasses[size]}`}
                    >
                      {site.short}
                    </div>
                    <p className={`mt-2 w-full truncate text-white/90 ${size === "2x4" || size === "2x2" ? "text-sm" : "text-xs"}`}>
                      {site.name}
                    </p>
                  </a>
                );
              })}
            </div>
          </section>
        </section>
      </div>

      {contextMenu.open && (
        <div
          className="fixed z-50 w-[170px] rounded-2xl border border-white/20 bg-slate-900/70 p-2 shadow-2xl backdrop-blur-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button className="flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm text-white hover:bg-white/12">
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              添加图标
            </span>
            <span className="text-lg leading-none text-white/70">+</span>
          </button>

          <button className="mt-1 flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm text-white hover:bg-white/12">
            <span className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              换壁纸
            </span>
            <span className="flex items-center gap-2 text-white/70">
              <Download className="h-3.5 w-3.5" />
              <Heart className="h-3.5 w-3.5" />
            </span>
          </button>

          <button className="mt-1 flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm text-white hover:bg-white/12">
            <span>本地搜索</span>
            <span className="text-xs text-white/70">Ctrl+F</span>
          </button>

          <button className="mt-1 flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm text-white hover:bg-white/12">
            <span>立即备份</span>
            <Cloud className="h-4 w-4 text-white/70" />
          </button>

          <button
            className="mt-1 flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm text-white hover:bg-white/12"
            onClick={() => {
              setSettingsOpen(true);
              closeContextMenu();
            }}
          >
            <span>设置</span>
            <Cog className="h-4 w-4 text-white/70" />
          </button>
        </div>
      )}

      {iconMenu.open && (
        <div
          className="fixed z-50 w-[220px] rounded-2xl border border-white/20 bg-slate-900/75 p-3 shadow-2xl backdrop-blur-xl"
          style={{ left: iconMenu.x, top: iconMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-white hover:bg-white/12"
            onClick={openSelectedSite}
          >
            <span>↗</span>
            在新标签页打开
          </button>
          <div className="mt-2 rounded-lg bg-white/8 px-3 py-2">
            <p className="text-sm text-white">布局</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["1x1", "1x2", "2x1", "2x2", "2x4"] as TileSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => changeSiteSize(size)}
                  className={`rounded-lg px-2.5 py-1 text-xs ${(siteSizes[iconMenu.siteName ?? ""] ?? "1x1") === size
                      ? "bg-white text-slate-800"
                      : "bg-white/20 text-white hover:bg-white/35"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <button className="mt-2 flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-white hover:bg-white/12">
            编辑图标
          </button>
          <button className="mt-1 flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-white hover:bg-white/12">
            编辑主页
          </button>
          <button className="mt-1 flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-white hover:bg-white/12">
            删除
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
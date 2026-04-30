import { Search, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";

import { GlobalContextMenu } from "@/components/tab/GlobalContextMenu";
import { IconContextMenu } from "@/components/tab/IconContextMenu";
import { QuickSitesGrid } from "@/components/tab/QuickSitesGrid";
import { SiteFormDialog } from "@/components/tab/SiteFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { defaultQuickSites, engines } from "@/tab/constants";
import { buildFaviconUrl, buildGoogleFaviconUrl, extractHostAndInitial, normalizeUrl } from "@/tab/favicon";
import type { ContextMenuState, IconMenuState, IconSource, QuickSite, TileSize } from "@/tab/types";

const emptySiteForm: QuickSite = { name: "", short: "", url: "", color: "bg-zinc-900", favicon: "" };

function App() {
  const [sites, setSites] = useState<QuickSite[]>(() => {
    try {
      const cached = window.localStorage.getItem("tab-sites");
      if (!cached) {
        return defaultQuickSites.map((site) => ({
          ...site,
          favicon: buildFaviconUrl(site.url),
          iconSource: "current",
        }));
      }
      return (JSON.parse(cached) as QuickSite[]).map((site) => ({
        ...site,
        favicon: site.favicon ?? buildFaviconUrl(site.url),
        iconSource:
          site.iconSource ??
          (site.favicon?.includes("google.com/s2/favicons") ? "official" : site.favicon ? "current" : "text"),
      }));
    } catch {
      return defaultQuickSites.map((site) => ({
        ...site,
        favicon: buildFaviconUrl(site.url),
        iconSource: "current",
      }));
    }
  });

  const [keyword, setKeyword] = useState("");
  const [searchEngine, setSearchEngine] = useState(engines[2].url);
  const [now, setNow] = useState(new Date());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isTimeExpanded, setIsTimeExpanded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ open: false, x: 0, y: 0 });
  const [iconMenu, setIconMenu] = useState<IconMenuState>({ open: false, x: 0, y: 0, siteName: null });
  const [draggingSite, setDraggingSite] = useState<string | null>(null);
  const [brokenFavicons, setBrokenFavicons] = useState<Record<string, boolean>>({});
  const [addIconOpen, setAddIconOpen] = useState(false);
  const [editIconOpen, setEditIconOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteSiteName, setPendingDeleteSiteName] = useState<string | null>(null);
  const [addIconSource, setAddIconSource] = useState<IconSource>("current");
  const [editIconSource, setEditIconSource] = useState<IconSource>("current");
  const [editingSiteName, setEditingSiteName] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<QuickSite>(emptySiteForm);
  const [editForm, setEditForm] = useState<QuickSite>(emptySiteForm);
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
      const validNames = new Set(sites.map((site) => site.name));
      const filtered = parsed.filter((name) => validNames.has(name));
      const missing = sites.map((site) => site.name).filter((name) => !filtered.includes(name));
      return [...filtered, ...missing];
    } catch {
      return sites.map((site) => site.name);
    }
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => window.localStorage.setItem("tab-site-sizes", JSON.stringify(siteSizes)), [siteSizes]);
  useEffect(() => window.localStorage.setItem("tab-sites", JSON.stringify(sites)), [sites]);
  useEffect(() => window.localStorage.setItem("tab-site-order", JSON.stringify(siteOrder)), [siteOrder]);

  useEffect(() => {
    const names = new Set(sites.map((site) => site.name));
    setSiteOrder((prev) => {
      const filtered = prev.filter((name) => names.has(name));
      const missing = sites.map((site) => site.name).filter((name) => !filtered.includes(name));
      return missing.length === 0 && filtered.length === prev.length ? prev : [...filtered, ...missing];
    });
  }, [sites]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setContextMenu((prev) => ({ ...prev, open: false }));
      setIconMenu((prev) => ({ ...prev, open: false }));
      setIsTimeExpanded(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const orderedSites = useMemo(() => {
    const byName = new Map(sites.map((site) => [site.name, site]));
    return siteOrder.map((name) => byName.get(name)).filter((site): site is QuickSite => Boolean(site));
  }, [siteOrder, sites]);

  const currentEngineKey = useMemo(
    () => engines.find((engine) => engine.url === searchEngine)?.key ?? "google",
    [searchEngine],
  );
  const clock = useMemo(
    () => `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    [now],
  );
  const dateText = useMemo(
    () => new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(now),
    [now],
  );
  const lunarText = useMemo(
    () => new Intl.DateTimeFormat("zh-CN-u-ca-chinese", { month: "long", day: "numeric" }).format(now),
    [now],
  );
  const isSearchMode = isSearchFocused || isTimeExpanded;

  const closeMenus = () => {
    setContextMenu((prev) => ({ ...prev, open: false }));
    setIconMenu((prev) => ({ ...prev, open: false }));
  };

  const openRightMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const x = Math.min(event.clientX, window.innerWidth - 182);
    const y = Math.min(event.clientY, window.innerHeight - 222);
    setContextMenu({ open: true, x: Math.max(x, 12), y: Math.max(y, 12) });
  };

  const openSiteMenu = (event: MouseEvent<HTMLElement>, siteName: string) => {
    event.preventDefault();
    event.stopPropagation();
    const x = Math.min(event.clientX, window.innerWidth - 232);
    const y = Math.min(event.clientY, window.innerHeight - 272);
    setContextMenu((prev) => ({ ...prev, open: false }));
    setIconMenu({ open: true, x: Math.max(x, 12), y: Math.max(y, 12), siteName });
  };

  const launchSearch = () => {
    const text = keyword.trim();
    if (!text) return;
    window.open(`${searchEngine}${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const reorderSites = (fromName: string, toName: string) => {
    if (fromName === toName) return;
    setSiteOrder((prev) => {
      const from = prev.indexOf(fromName);
      const to = prev.indexOf(toName);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, fromName);
      return next;
    });
  };

  const fetchFormIcon = (form: QuickSite, setter: (next: QuickSite) => void) => {
    const parsed = extractHostAndInitial(form.url);
    if (!parsed) return;
    setter({
      ...form,
      name: parsed.host,
      short: form.short.trim() ? form.short : parsed.first,
      favicon: `${parsed.origin}/favicon.ico`,
    });
  };

  const openAddDialog = () => {
    setAddForm(emptySiteForm);
    setAddIconSource("current");
    setAddIconOpen(true);
    setContextMenu((prev) => ({ ...prev, open: false }));
  };

  const openEditDialog = () => {
    if (!iconMenu.siteName) return;
    const target = sites.find((site) => site.name === iconMenu.siteName);
    if (!target) return;
    setEditingSiteName(target.name);
    setEditForm(target);
    setEditIconSource(
      target.iconSource ?? (target.favicon?.includes("google.com/s2/favicons") ? "official" : target.favicon ? "current" : "text"),
    );
    setEditIconOpen(true);
    setIconMenu((prev) => ({ ...prev, open: false }));
  };

  const saveAddedSite = () => {
    if (!addForm.url.trim()) return;
    const normalizedUrl = normalizeUrl(addForm.url);
    const host = extractHostAndInitial(normalizedUrl)?.host ?? "new-site";
    const baseName = addForm.name.trim() || host;
    let uniqueName = baseName;
    let idx = 2;
    const used = new Set(sites.map((site) => site.name));
    while (used.has(uniqueName)) {
      uniqueName = `${baseName}-${idx}`;
      idx += 1;
    }
    const nextSite: QuickSite = {
      name: uniqueName,
      short: addForm.short.trim() || uniqueName.slice(0, 2).toUpperCase(),
      url: normalizedUrl,
      color: addForm.color,
      iconSource: addIconSource,
      favicon:
        addIconSource === "text"
          ? ""
          : addIconSource === "official"
            ? buildGoogleFaviconUrl(normalizedUrl)
            : addForm.favicon?.trim() || buildFaviconUrl(normalizedUrl),
    };
    setSites((prev) => [...prev, nextSite]);
    setSiteOrder((prev) => [...prev, uniqueName]);
    setAddIconOpen(false);
  };

  const saveEditedSite = () => {
    if (!editingSiteName) return;
    const normalizedUrl = normalizeUrl(editForm.url);
    const defaultHostName = extractHostAndInitial(normalizedUrl)?.host ?? editingSiteName;
    const nextName = editForm.name.trim() || defaultHostName;
    const nextSite: QuickSite = {
      ...editForm,
      name: nextName,
      short: editForm.short.trim() || nextName.slice(0, 2).toUpperCase(),
      url: normalizedUrl,
      iconSource: editIconSource,
      favicon:
        editIconSource === "text"
          ? ""
          : editIconSource === "official"
            ? buildGoogleFaviconUrl(normalizedUrl)
            : editForm.favicon?.trim() || buildFaviconUrl(normalizedUrl),
    };
    setSites((prev) => prev.map((site) => (site.name === editingSiteName ? nextSite : site)));
    if (nextName !== editingSiteName) {
      setSiteOrder((prev) => prev.map((name) => (name === editingSiteName ? nextName : name)));
      setSiteSizes((prev) => {
        const { [editingSiteName]: oldSize, ...rest } = prev;
        return oldSize ? { ...rest, [nextName]: oldSize } : rest;
      });
    }
    setBrokenFavicons((prev) => {
      const { [editingSiteName]: removed, ...rest } = prev;
      if (nextName !== editingSiteName && removed) return { ...rest, [nextName]: false };
      return rest;
    });
    setEditIconOpen(false);
    setEditingSiteName(null);
  };

  const handleFaviconError = (site: QuickSite) => {
    const currentFavicon = site.favicon ?? "";
    const googleFallback = buildGoogleFaviconUrl(site.url);
    if (googleFallback && !currentFavicon.includes("google.com/s2/favicons")) {
      setSites((prev) => prev.map((item) => (item.name === site.name ? { ...item, favicon: googleFallback } : item)));
      return;
    }
    setBrokenFavicons((prev) => ({ ...prev, [site.name]: true }));
  };

  const handleFaviconLoad = (site: QuickSite, naturalWidth: number) => {
    const currentFavicon = site.favicon ?? "";
    const isGoogleFavicon = currentFavicon.includes("google.com/s2/favicons");
    const source = site.iconSource ?? (isGoogleFavicon ? "official" : currentFavicon ? "current" : "text");
    if (source === "current" || source === "text") return;
    if (isGoogleFavicon) return;
    // Some sites only expose tiny 16x16 icons. Swap to a larger source.
    if (naturalWidth > 0 && naturalWidth < 48) {
      const googleFallback = buildGoogleFaviconUrl(site.url);
      if (!googleFallback) return;
      setSites((prev) =>
        prev.map((item) =>
          item.name === site.name
            ? {
                ...item,
                favicon: googleFallback,
              }
            : item,
        ),
      );
    }
  };

  const openSelectedSite = () => {
    if (!iconMenu.siteName) return;
    const target = sites.find((site) => site.name === iconMenu.siteName);
    if (!target) return;
    window.open(target.url, "_blank", "noopener,noreferrer");
    setIconMenu((prev) => ({ ...prev, open: false }));
  };

  const changeCurrentSiteSize = (size: TileSize) => {
    if (!iconMenu.siteName) return;
    setSiteSizes((prev) => ({ ...prev, [iconMenu.siteName!]: size }));
    setIconMenu((prev) => ({ ...prev, open: false }));
  };

  const requestDeleteCurrentSite = () => {
    if (!iconMenu.siteName) return;
    setPendingDeleteSiteName(iconMenu.siteName);
    setDeleteConfirmOpen(true);
    setIconMenu((prev) => ({ ...prev, open: false }));
  };

  const deleteCurrentSite = () => {
    const siteName = pendingDeleteSiteName;
    if (!siteName) return;
    setSites((prev) => prev.filter((site) => site.name !== siteName));
    setSiteOrder((prev) => prev.filter((name) => name !== siteName));
    setSiteSizes((prev) => {
      const next = { ...prev };
      delete next[siteName];
      return next;
    });
    setBrokenFavicons((prev) => {
      const next = { ...prev };
      delete next[siteName];
      return next;
    });
    setDeleteConfirmOpen(false);
    setPendingDeleteSiteName(null);
  };

  return (
    <main
      className="tab-bg min-h-screen text-white"
      onContextMenu={openRightMenu}
      onClick={() => {
        closeMenus();
        if (isTimeExpanded) setIsTimeExpanded(false);
      }}
    >
      <div className={`tab-overlay min-h-screen transition-all duration-300 ${isSearchMode ? "backdrop-blur-md" : ""}`}>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="打开设置" className="fixed right-8 top-4 z-20 text-zinc-100 hover:bg-white/15 hover:text-white">
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
                  <Button key={engine.key} variant={currentEngineKey === engine.key ? "default" : "secondary"} onClick={() => setSearchEngine(engine.url)}>
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
              <h1 className={`${isTimeExpanded ? "text-7xl font-bold" : "text-5xl font-semibold"} tracking-wider text-white/95`}>{clock}</h1>
              {isTimeExpanded && <p className="mt-2 text-sm text-white/90">{dateText} · 农历 {lunarText}</p>}
            </button>

            <div className="mt-8 flex w-full max-w-xl items-center rounded-full border border-white/15 bg-white/45 px-4 py-2 shadow-lg backdrop-blur-md" onClick={(event) => event.stopPropagation()}>
              <Search className="h-4 w-4 text-zinc-700" />
              <Input
                className="h-9 border-0 bg-transparent text-zinc-900 placeholder:text-zinc-700/75 focus:border-0"
                placeholder="输入关键字搜索..."
                value={keyword}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && launchSearch()}
              />
              <Button onClick={launchSearch} className="h-8 rounded-full bg-zinc-900/90 px-5 text-xs hover:bg-zinc-900">
                搜索
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-full bg-white/30 px-3 py-1.5 backdrop-blur-sm transition" onClick={(event) => event.stopPropagation()}>
              {engines.map((engine) => (
                <button
                  key={engine.key}
                  type="button"
                  onClick={() => setSearchEngine(engine.url)}
                  className={`h-7 min-w-12 rounded-full px-3 text-xs transition ${currentEngineKey === engine.key ? "bg-white text-zinc-800 shadow" : "bg-white/20 text-white hover:bg-white/35"}`}
                >
                  {engine.label}
                </button>
              ))}
            </div>

            <QuickSitesGrid
              sites={orderedSites}
              siteSizes={siteSizes}
              draggingSite={draggingSite}
              isSearchMode={isSearchMode}
              brokenFavicons={brokenFavicons}
              onDragStart={setDraggingSite}
              onDragEnd={() => setDraggingSite(null)}
              onDropSite={(targetName) => {
                if (draggingSite) reorderSites(draggingSite, targetName);
                setDraggingSite(null);
              }}
              onSiteContextMenu={openSiteMenu}
              onFaviconLoad={handleFaviconLoad}
              onFaviconError={handleFaviconError}
            />
          </section>
        </section>
      </div>

      {contextMenu.open && (
        <GlobalContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddIcon={openAddDialog}
          onOpenSettings={() => {
            setSettingsOpen(true);
            closeMenus();
          }}
        />
      )}

      {iconMenu.open && (
        <IconContextMenu
          x={iconMenu.x}
          y={iconMenu.y}
          currentSize={siteSizes[iconMenu.siteName ?? ""] ?? "1x1"}
          onOpenSelected={openSelectedSite}
          onChangeSize={changeCurrentSiteSize}
          onEditIcon={openEditDialog}
          onDelete={requestDeleteCurrentSite}
        />
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除图标</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除图标「{pendingDeleteSiteName ?? ""}」吗？删除后无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteSiteName(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCurrentSite}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SiteFormDialog
        open={addIconOpen}
        onOpenChange={setAddIconOpen}
        title="添加图标"
        description="输入网站信息并生成图标。"
        form={addForm}
        onFormChange={setAddForm}
        onFetchIcon={() => fetchFormIcon(addForm, setAddForm)}
        onCancel={() => setAddIconOpen(false)}
        onSave={saveAddedSite}
        iconSource={addIconSource}
        onIconSourceChange={setAddIconSource}
        officialFaviconUrl={buildGoogleFaviconUrl(addForm.url)}
      />

      <SiteFormDialog
        open={editIconOpen}
        onOpenChange={setEditIconOpen}
        title="编辑图标"
        description="修改图标地址、名称和显示样式。"
        form={editForm}
        onFormChange={setEditForm}
        onFetchIcon={() => fetchFormIcon(editForm, setEditForm)}
        onCancel={() => setEditIconOpen(false)}
        onSave={saveEditedSite}
        iconSource={editIconSource}
        onIconSourceChange={setEditIconSource}
        officialFaviconUrl={buildGoogleFaviconUrl(editForm.url)}
      />
    </main>
  );
}

export default App;
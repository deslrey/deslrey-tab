import { tileIconClasses, tileSizeClasses } from "@/tab/constants";
import type { QuickSite, TileSize } from "@/tab/types";
import type { MouseEvent } from "react";

type QuickSitesGridProps = {
  sites: QuickSite[];
  siteSizes: Record<string, TileSize>;
  draggingSite: string | null;
  isSearchMode: boolean;
  brokenFavicons: Record<string, boolean>;
  onDragStart: (siteName: string) => void;
  onDragEnd: () => void;
  onDropSite: (targetSiteName: string) => void;
  onSiteContextMenu: (event: MouseEvent<HTMLElement>, siteName: string) => void;
  onFaviconError: (site: QuickSite) => void;
  onFaviconLoad: (site: QuickSite, naturalWidth: number) => void;
};

export function QuickSitesGrid({
  sites,
  siteSizes,
  draggingSite,
  isSearchMode,
  brokenFavicons,
  onDragStart,
  onDragEnd,
  onDropSite,
  onSiteContextMenu,
  onFaviconError,
  onFaviconLoad,
}: QuickSitesGridProps) {
  return (
    <div
      className={`mt-16 grid w-full max-w-[980px] grid-flow-dense grid-cols-[repeat(12,72px)] auto-rows-[72px] justify-center gap-2 transition-all duration-300 ${
        isSearchMode ? "pointer-events-none translate-y-2 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      {sites.map((site) => {
        const size = siteSizes[site.name] ?? "1x1";
        const tileColorClass = site.color === "transparent" ? "bg-transparent" : site.color;
        const imageBgClass = site.color === "transparent" ? "" : "bg-white/90 p-1";
        return (
          <a
            key={site.name}
            href={site.url}
            title={site.name}
            target="_blank"
            rel="noreferrer"
            draggable
            onDragStart={() => onDragStart(site.name)}
            onDragEnd={onDragEnd}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (draggingSite) onDropSite(site.name);
            }}
            onContextMenu={(event) => onSiteContextMenu(event, site.name)}
            className={`group relative flex min-w-0 flex-col items-center justify-center rounded-2xl text-center no-underline transition ${
              tileSizeClasses[size]
            }`}
          >
            <div
              className={`flex items-center justify-center rounded-2xl ${tileColorClass} font-semibold text-white shadow-md transition group-hover:-translate-y-0.5 group-hover:shadow-xl ${tileIconClasses[size]}`}
            >
              {site.favicon && !brokenFavicons[site.name] ? (
                <img
                  src={site.favicon}
                  alt={site.name}
                  className={`h-[68%] w-[68%] rounded-xl object-contain ${imageBgClass}`}
                  onLoad={(event) => onFaviconLoad(site, event.currentTarget.naturalWidth)}
                  onError={() => onFaviconError(site)}
                />
              ) : (
                site.short
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}

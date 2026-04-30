import { Cloud, Cog, Download, Heart, Languages, Plus } from "lucide-react";

type GlobalContextMenuProps = {
  x: number;
  y: number;
  onAddIcon: () => void;
  onOpenSettings: () => void;
};

export function GlobalContextMenu({ x, y, onAddIcon, onOpenSettings }: GlobalContextMenuProps) {
  return (
    <div
      className="fixed z-50 w-[170px] rounded-2xl border border-white/20 bg-slate-900/70 p-2 shadow-2xl backdrop-blur-xl"
      style={{ left: x, top: y }}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm text-white hover:bg-white/12"
        onClick={onAddIcon}
      >
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
        onClick={onOpenSettings}
      >
        <span>设置</span>
        <Cog className="h-4 w-4 text-white/70" />
      </button>
    </div>
  );
}

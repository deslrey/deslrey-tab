import { tileSizeOptions } from "@/tab/constants";
import type { TileSize } from "@/tab/types";

type IconContextMenuProps = {
  x: number;
  y: number;
  currentSize: TileSize;
  onOpenSelected: () => void;
  onChangeSize: (size: TileSize) => void;
  onEditIcon: () => void;
  onDelete: () => void;
};

export function IconContextMenu({
  x,
  y,
  currentSize,
  onOpenSelected,
  onChangeSize,
  onEditIcon,
  onDelete,
}: IconContextMenuProps) {
  return (
    <div
      className="fixed z-50 w-[220px] rounded-2xl border border-white/20 bg-slate-900/75 p-3 shadow-2xl backdrop-blur-xl"
      style={{ left: x, top: y }}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-white hover:bg-white/12"
        onClick={onOpenSelected}
      >
        <span>↗</span>
        在新标签页打开
      </button>
      <div className="mt-2 rounded-lg bg-white/8 px-3 py-2">
        <p className="text-sm text-white">布局</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tileSizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onChangeSize(size)}
              className={`rounded-lg px-2.5 py-1 text-xs ${currentSize === size ? "bg-white text-slate-800" : "bg-white/20 text-white hover:bg-white/35"
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <button
        className="mt-2 flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-white hover:bg-white/12"
        onClick={onEditIcon}
      >
        编辑图标
      </button>
      <button className="mt-1 flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-white hover:bg-white/12">
        编辑主页
      </button>
      <button
        className="mt-1 flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-white hover:bg-white/12"
        onClick={onDelete}
      >
        删除
      </button>
    </div>
  );
}

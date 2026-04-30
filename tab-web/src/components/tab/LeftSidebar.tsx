import {
  BookOpen,
  Briefcase,
  Code2,
  Gamepad2,
  Heart,
  Home,
  Image,
  LayoutGrid,
  Map as MapIcon,
  Music,
  Palette,
  Plane,
  Plus,
  ShoppingBag,
  Star,
  Wrench,
} from "lucide-react";

import type { TabGroup } from "@/tab/types";

type LeftSidebarProps = {
  visible: boolean;
  groups: TabGroup[];
  activeGroupId: string;
  onSelectGroup: (groupId: string) => void;
  onAddGroup: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

const groupIcons = {
  home: Home,
  code: Code2,
  group: LayoutGrid,
  heart: Heart,
  music: Music,
  briefcase: Briefcase,
  gamepad: Gamepad2,
  book: BookOpen,
  wrench: Wrench,
  star: Star,
  palette: Palette,
  image: Image,
  plane: Plane,
  map: MapIcon,
  "shopping-bag": ShoppingBag,
  terminal: Code2,
} as const;

export function LeftSidebar({
  visible,
  groups,
  activeGroupId,
  onSelectGroup,
  onAddGroup,
  onMouseEnter,
  onMouseLeave,
}: LeftSidebarProps) {
  return (
    <>
      <div className="fixed left-0 top-0 z-30 h-screen w-3" onMouseEnter={onMouseEnter} />
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-24 bg-sky-200/30 backdrop-blur-md transition-transform duration-200 ${
          visible ? "translate-x-0" : "-translate-x-[88px]"
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="mt-20 flex flex-col items-center gap-3 px-2">
          {groups.map((group) => {
            const Icon = groupIcons[group.icon];
            const active = group.id === activeGroupId;
            return (
              <button
                key={group.id}
                type="button"
                className={`flex w-full flex-col items-center rounded-xl px-2 py-2 text-xs transition ${
                  active ? "bg-sky-500/25 text-sky-900" : "text-sky-900/80 hover:bg-white/35"
                }`}
                onClick={() => onSelectGroup(group.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="mt-1">{group.name}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onAddGroup}
            className="mt-1 flex w-full flex-col items-center rounded-xl px-2 py-2 text-xs text-sky-900/80 transition hover:bg-white/35"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}

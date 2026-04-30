export type QuickSite = {
  name: string;
  short: string;
  url: string;
  color: string;
  favicon?: string;
  iconSource?: IconSource;
  groupId?: string;
};

export type ContextMenuState = {
  open: boolean;
  x: number;
  y: number;
};

export type IconMenuState = {
  open: boolean;
  x: number;
  y: number;
  siteName: string | null;
};

export type TileSize = "1x1" | "1x2" | "2x1" | "2x2" | "2x4";

export type SearchEngine = {
  key: "baidu" | "bing" | "google";
  label: string;
  url: string;
};

export type IconSource = "current" | "text" | "official";

export type TabGroup = {
  id: string;
  name: string;
  icon:
    | "home"
    | "code"
    | "group"
    | "heart"
    | "music"
    | "briefcase"
    | "gamepad"
    | "book"
    | "wrench"
    | "star"
    | "palette"
    | "image"
    | "plane"
    | "map"
    | "shopping-bag"
    | "terminal";
};

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { iconColorOptions } from "@/tab/constants";
import type { IconSource, QuickSite } from "@/tab/types";

type SiteFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  form: QuickSite;
  onFormChange: (next: QuickSite) => void;
  onFetchIcon: () => void;
  onCancel: () => void;
  onSave: () => void;
  iconSource: IconSource;
  onIconSourceChange: (source: IconSource) => void;
  officialFaviconUrl: string;
};

export function SiteFormDialog({
  open,
  onOpenChange,
  title,
  description,
  form,
  onFormChange,
  onFetchIcon,
  onCancel,
  onSave,
  iconSource,
  onIconSourceChange,
  officialFaviconUrl,
}: SiteFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-zinc-700">地址</p>
            <div className="flex gap-2">
              <Input
                value={form.url}
                onChange={(event) => onFormChange({ ...form, url: event.target.value })}
                placeholder="https://example.com"
              />
              <Button variant="secondary" onClick={onFetchIcon}>
                获取图标
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-zinc-700">名称</p>
            <Input
              value={form.name}
              onChange={(event) => onFormChange({ ...form, name: event.target.value })}
              placeholder="网站名称"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-zinc-700">图标文字</p>
            <Input
              value={form.short}
              onChange={(event) => onFormChange({ ...form, short: event.target.value })}
              placeholder="例如 GH"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-zinc-700">图标地址（favicon）</p>
            <Input
              value={form.favicon ?? ""}
              onChange={(event) => onFormChange({ ...form, favicon: event.target.value })}
              placeholder="https://example.com/favicon.ico"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-zinc-700">图标颜色</p>
            <div className="flex flex-wrap gap-2">
              {iconColorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  className={`h-6 w-6 rounded-full ${colorOption.swatchClass} ring-offset-2 ${
                    form.color === colorOption.value ? "ring-2 ring-zinc-900" : ""
                  }`}
                  onClick={() => onFormChange({ ...form, color: colorOption.value })}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 p-3">
            <p className="mb-2 text-xs text-zinc-500">预览</p>
            <div className="flex gap-3">
              <button
                type="button"
                className={`rounded-2xl border p-1 ${iconSource === "current" ? "border-blue-500" : "border-zinc-200"}`}
                onClick={() => onIconSourceChange("current")}
              >
                <span className={`${form.color === "transparent" ? "bg-transparent" : form.color} flex h-14 w-14 items-center justify-center rounded-xl text-white`}>
                  {form.favicon ? (
                    <img
                      src={form.favicon}
                      alt={form.name || "current icon"}
                      className={`h-[68%] w-[68%] rounded-xl object-contain ${
                        form.color === "transparent" ? "" : "bg-white/90 p-1"
                      }`}
                    />
                  ) : (
                    form.short || "A"
                  )}
                </span>
                <p className="mt-1 text-xs text-zinc-600">当前图标</p>
              </button>

              <button
                type="button"
                className={`rounded-2xl border p-1 ${iconSource === "text" ? "border-blue-500" : "border-zinc-200"}`}
                onClick={() => onIconSourceChange("text")}
              >
                <span className={`${form.color === "transparent" ? "bg-zinc-200" : form.color} flex h-14 w-14 items-center justify-center rounded-xl text-xl font-semibold text-white`}>
                  {form.short || "A"}
                </span>
                <p className="mt-1 text-xs text-zinc-600">文字图标</p>
              </button>

              <button
                type="button"
                className={`rounded-2xl border p-1 ${iconSource === "official" ? "border-blue-500" : "border-zinc-200"}`}
                onClick={() => onIconSourceChange("official")}
              >
                <span className={`${form.color === "transparent" ? "bg-transparent" : form.color} flex h-14 w-14 items-center justify-center rounded-xl text-white`}>
                  {officialFaviconUrl ? (
                    <img
                      src={officialFaviconUrl}
                      alt={form.name || "official icon"}
                      className={`h-[68%] w-[68%] rounded-xl object-contain ${
                        form.color === "transparent" ? "" : "bg-white/90 p-1"
                      }`}
                    />
                  ) : (
                    "A"
                  )}
                </span>
                <p className="mt-1 text-xs text-zinc-600">官方图标</p>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={onSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

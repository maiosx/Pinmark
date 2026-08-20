import { useEffect, useState } from "react";
import { StickyNote } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function TopBar() {
  const now = useClock();
  const widgetCount = useStore((s) => s.widgetOrder.length);
  const editorVisible = useStore((s) => s.editorVisible);
  const menuOpen = useStore((s) => s.menuOpen);
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const toggleEditor = useStore((s) => s.toggleEditor);

  const clock = now
    ? now.toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <header className="absolute inset-x-0 top-0 z-[4000] flex h-12 items-center justify-between gap-3 bg-bar/85 px-3 text-fg shadow-[0_1px_0_color-mix(in_oklab,var(--color-fg)_8%,transparent)] backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-3">
        <span className="font-display text-sm font-medium tracking-tight">
          Pinmark
        </span>
        <nav className="hidden items-center gap-1 text-xs text-muted sm:flex" aria-label="Spaces">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={cn(
                "grid size-6 place-items-center rounded-sm",
                n === 1 ? "bg-fg/10 text-fg" : "text-subtle",
              )}
            >
              {n}
            </span>
          ))}
        </nav>
      </div>

      <div className="absolute left-1/2 hidden -translate-x-1/2 text-xs font-medium tracking-wide text-muted tabular-nums sm:block">
        {clock}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="hidden text-xs font-medium tracking-wider text-muted uppercase sm:inline">
          {editorVisible ? "Editor" : "Desk"}
          <span className="mx-1.5 text-subtle">·</span>
          {widgetCount} {widgetCount === 1 ? "widget" : "widgets"}
        </span>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-label="Board menu"
          onClick={() => setMenuOpen(!menuOpen)}
          onContextMenu={(e) => {
            e.preventDefault();
            toggleEditor();
          }}
          className={cn(
            "relative grid size-9 place-items-center rounded-sm text-fg transition-colors duration-150",
            menuOpen ? "bg-fg/12" : "hover:bg-fg/8",
            !editorVisible && "opacity-55",
          )}
        >
          <StickyNote className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}

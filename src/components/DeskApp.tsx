import { useEffect, useRef } from "react";
import { BoardMenu } from "@/components/desktop/BoardMenu";
import { TopBar } from "@/components/desktop/TopBar";
import { Wallpaper } from "@/components/desktop/Wallpaper";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { NoteWidget } from "@/components/widgets/NoteWidget";
import { TooltipProvider } from "@/components/ui/tooltip";
import { bindMarkdownFileOpener, openMarkdownFiles } from "@/lib/open-markdown";
import { useStore } from "@/lib/store";

export function DeskApp() {
  const widgetOrder = useStore((s) => s.widgetOrder);
  const widgets = useStore((s) => s.widgets);
  const rescueWidgets = useStore((s) => s.rescueWidgets);
  const toggleEditor = useStore((s) => s.toggleEditor);
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void useStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const onResize = () => rescueWidgets(window.innerWidth, window.innerHeight);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [rescueWidgets]);

  useEffect(() => bindMarkdownFileOpener(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        toggleEditor();
      }
      if (meta && e.key.toLowerCase() === "o") {
        e.preventDefault();
        fileRef.current?.click();
      }
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleEditor, setMenuOpen]);

  return (
    <TooltipProvider>
      <div className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
        <input
          ref={fileRef}
          type="file"
          accept=".md,.markdown,.mdown,.mkd,text/markdown"
          multiple
          className="sr-only"
          aria-label="Open markdown files"
          onChange={(e) => {
            const files = e.target.files;
            if (files?.length) void openMarkdownFiles(files);
            e.target.value = "";
          }}
        />
        <Wallpaper />
        <TopBar />
        {widgetOrder.map((id) => {
          const w = widgets[id];
          return w ? <NoteWidget key={id} widget={w} /> : null;
        })}
        <MarkdownEditor />
        <BoardMenu />
      </div>
    </TooltipProvider>
  );
}
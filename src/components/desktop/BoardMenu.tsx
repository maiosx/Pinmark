import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ARCH_INSTALL =
  "omarchy plugin add https://github.com/maiosx/pinmark-omarchy.git --enable && omarchy-restart-shell";
const ARCH_REPO = "https://github.com/maiosx/pinmark-omarchy";

export function BoardMenu() {
  const open = useStore((s) => s.menuOpen);
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const editorVisible = useStore((s) => s.editorVisible);
  const toggleEditor = useStore((s) => s.toggleEditor);
  const widgetCount = useStore((s) => s.widgetOrder.length);
  const addDoc = useStore((s) => s.addDoc);
  const addHelp = useStore((s) => s.addHelp);
  const panelRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(t)) {
        const barBtn = (e.target as HTMLElement).closest("[aria-label='Board menu']");
        if (!barBtn) setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, setMenuOpen]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  if (!open) return null;

  const status = editorVisible ? "Editor open" : "Hidden";

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(ARCH_INSTALL);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[5000]">
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Pinmark board"
        className="pointer-events-auto absolute top-12 right-3 w-80 max-h-[calc(100dvh-4rem)] max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-editor)]"
      >
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-md bg-fg/8 text-accent">
            <StickyNote className="size-5" strokeWidth={1.6} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base font-medium tracking-tight">Pinmark</div>
            <div className="text-xs font-semibold tracking-wider text-muted uppercase">
              {status}
            </div>
          </div>
          <div
            className="font-display text-3xl font-medium tabular-nums leading-none text-fg"
            style={{ opacity: editorVisible ? 1 : 0.4 }}
          >
            {widgetCount}
          </div>
        </div>

        <div className="my-3.5 h-px bg-border" />

        <div className="grid grid-cols-3 gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() =>
              addDoc({
                title: "Untitled",
                body: "",
                withWidget: true,
                widget: { pinned: true },
              })
            }
          >
            New
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn("h-9", !editorVisible && "bg-fg/10")}
            onClick={toggleEditor}
          >
            {editorVisible ? "Hide" : "Show"}
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={addHelp}>
            Help
          </Button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          {editorVisible
            ? "Hide folds the editor. Pinned widgets stay on top of it."
            : "The editor is hidden. Show it from here — pinned widgets stay on the desk."}
        </p>

        <div className="my-3.5 h-px bg-border" />

        <div className="text-xs font-semibold tracking-wider text-muted uppercase">
          Arch Linux · Omarchy
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          Installs as a desk plugin: widgets on the wallpaper, pinned ones over the editor.
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md bg-bg px-2.5 py-2 font-mono text-[11px] leading-relaxed text-fg/90">
          {ARCH_INSTALL}
        </pre>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <Button variant="outline" size="sm" className="h-9" onClick={() => void copyInstall()}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" className="h-9" asChild>
            <a href="/pinmark-omarchy.zip" download="pinmark-omarchy.zip">
              <Download className="size-3.5" />
              Zip
            </a>
          </Button>
        </div>
        <a
          href={ARCH_REPO}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-xs text-link hover:underline"
        >
          github.com/maiosx/pinmark-omarchy
        </a>
      </div>
    </div>
  );
}

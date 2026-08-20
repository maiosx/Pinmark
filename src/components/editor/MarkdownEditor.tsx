import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  ChevronsLeft,
  ChevronsRight,
  Code,
  Eye,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  Quote,
  SquareSplitHorizontal,
  Strikethrough,
  Table,
  Trash2,
  Type,
  Maximize2,
  Minimize2,
  Save,
  X,
} from "lucide-react";
import { MarkdownPreview } from "@/components/markdown/MarkdownPreview";
import { Button } from "@/components/ui/button";
import { applyCommand, type EditorCommand } from "@/lib/markdown";
import { saveMarkdownFile } from "@/lib/open-markdown";
import { useStore } from "@/lib/store";
import { cn, readingTime, relativeTime, wordCount } from "@/lib/utils";

export function MarkdownEditor() {
  const visible = useStore((s) => s.editorVisible);
  const mode = useStore((s) => s.editorMode);
  const setMode = useStore((s) => s.setEditorMode);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const toggleEditor = useStore((s) => s.toggleEditor);
  const setEditorVisible = useStore((s) => s.setEditorVisible);
  const docs = useStore((s) => s.docs);
  const docOrder = useStore((s) => s.docOrder);
  const widgets = useStore((s) => s.widgets);
  const widgetOrder = useStore((s) => s.widgetOrder);
  const activeDocId = useStore((s) => s.activeDocId);
  const setActiveDoc = useStore((s) => s.setActiveDoc);
  const addDoc = useStore((s) => s.addDoc);
  const updateDoc = useStore((s) => s.updateDoc);
  const removeDoc = useStore((s) => s.removeDoc);
  const pinActiveDoc = useStore((s) => s.pinActiveDoc);

  const doc = activeDocId ? docs[activeDocId] : undefined;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewScroll = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLElement>(null);
  const syncing = useRef(false);
  const [clockReady, setClockReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => setClockReady(true), []);

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        void toggleFullscreen();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const current = useStore.getState();
        const active = current.activeDocId ? current.docs[current.activeDocId] : undefined;
        if (active) {
          void exitFullscreen();
          current.setEditorVisible(false);
          void saveMarkdownFile(active.title, active.body);
        }
      } else if (e.key === "Escape" && fullscreen) {
        e.preventDefault();
        void exitFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  async function exitFullscreen() {
    setFullscreen(false);
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* preview hosts often block this */
      }
    }
  }

  async function toggleFullscreen() {
    if (fullscreen) {
      await exitFullscreen();
      return;
    }
    setFullscreen(true);
    try {
      await frameRef.current?.requestFullscreen();
    } catch {
      /* CSS fullscreen still applies */
    }
  }

  const pinnedOnEditor = useMemo(() => {
    const set = new Set<string>();
    for (const id of widgetOrder) {
      const w = widgets[id];
      if (w?.pinned) set.add(w.docId);
    }
    return set;
  }, [widgets, widgetOrder]);

  const deskWidgetIds = useMemo(() => {
    const set = new Set<string>();
    for (const id of widgetOrder) {
      const w = widgets[id];
      if (w) set.add(w.docId);
    }
    return set;
  }, [widgets, widgetOrder]);

  const onDesk = activeDocId ? deskWidgetIds.has(activeDocId) : false;
  const onEditor = activeDocId ? pinnedOnEditor.has(activeDocId) : false;

  function run(command: EditorCommand) {
    const el = textareaRef.current;
    if (!el || !doc) return;
    const { next, selStart, selEnd } = applyCommand(
      el.value,
      el.selectionStart,
      el.selectionEnd,
      command,
    );
    updateDoc(doc.id, { body: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === "b") {
      e.preventDefault();
      run("bold");
    } else if (meta && e.key.toLowerCase() === "i") {
      e.preventDefault();
      run("italic");
    } else if (meta && e.key.toLowerCase() === "k") {
      e.preventDefault();
      run("link");
    } else if (meta && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (doc) {
        void exitFullscreen();
        setEditorVisible(false);
        void saveMarkdownFile(doc.title, doc.body);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = el.value.slice(0, start) + "  " + el.value.slice(end);
      if (doc) updateDoc(doc.id, { body: next });
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  }

  function syncScroll(from: "edit" | "preview") {
    if (syncing.current) return;
    const a = from === "edit" ? textareaRef.current : previewScroll.current;
    const b = from === "edit" ? previewScroll.current : textareaRef.current;
    if (!a || !b) return;
    const maxA = a.scrollHeight - a.clientHeight;
    const maxB = b.scrollHeight - b.clientHeight;
    if (maxA <= 0 || maxB <= 0) return;
    syncing.current = true;
    b.scrollTop = (a.scrollTop / maxA) * maxB;
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  }

  const words = doc ? wordCount(doc.body) : 0;

  return (
    <section
      ref={frameRef}
      aria-hidden={!visible}
      aria-label="Markdown editor"
      className={cn(
        "editor-frame absolute z-[1000] flex flex-col overflow-hidden bg-bg-elevated shadow-[var(--shadow-editor)]",
        "transition-[opacity,transform] duration-200 ease-[var(--ease-smooth-out)]",
        visible
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0 duration-150",
        fullscreen && "is-fullscreen",
      )}
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-2">
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:inline-flex"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label={sidebarOpen ? "Hide documents" : "Show documents"}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <ChevronsLeft className="size-4" /> : <ChevronsRight className="size-4" />}
        </Button>
        <div className="min-w-0 flex-1">
          <input
            value={doc?.title ?? ""}
            onChange={(e) => doc && updateDoc(doc.id, { title: e.target.value })}
            className="w-full bg-transparent font-display text-sm font-medium tracking-tight text-fg outline-none placeholder:text-subtle"
            placeholder="Untitled"
            aria-label="Document title"
          />
        </div>
        <div className="flex items-center rounded-sm bg-fg/6 p-0.5">
          {(
            [
              ["write", Type, "Write"],
              ["split", SquareSplitHorizontal, "Split"],
              ["preview", Eye, "Preview"],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
              className={cn(
                "grid size-8 place-items-center rounded-xs transition-colors duration-150",
                mode === id ? "bg-bg-elevated text-fg shadow-[0_0_0_1px_var(--color-border)]" : "text-muted hover:text-fg",
              )}
            >
              <Icon className="size-3.5" />
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
          aria-pressed={onDesk}
          onClick={pinActiveDoc}
        >
          <Pin className={cn("size-3.5", onDesk && "fill-current")} />
          {onEditor ? "Move to desk" : onDesk ? "On desk" : "Pin to desk"}
        </Button>
        {doc && (
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex text-muted hover:text-danger"
            aria-label="Delete document"
            onClick={() => removeDoc(doc.id)}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        )}
        {doc && (
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            aria-label="Save markdown file"
            onClick={() => {
              void exitFullscreen();
              setEditorVisible(false);
              void saveMarkdownFile(doc.title, doc.body);
            }}
          >
            <Save className="size-3.5" />
            Save
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          aria-pressed={fullscreen}
          onClick={() => void toggleFullscreen()}
        >
          {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Fold editor"
          onClick={() => {
            void exitFullscreen();
            toggleEditor();
          }}
        >
          <X className="size-4" />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "flex shrink-0 flex-col border-r border-border bg-bg/40 transition-[width,opacity] duration-200 ease-[var(--ease-smooth-out)]",
            sidebarOpen ? "w-56 max-w-[42vw] opacity-100" : "w-0 overflow-hidden opacity-0",
          )}
        >
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <span className="text-xs font-semibold tracking-wider text-muted uppercase">
              Documents
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="New document"
              onClick={() => addDoc({ title: "Untitled", body: "", withWidget: false })}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
          <ul className="min-h-0 flex-1 overflow-auto px-2 pb-3">
            {docOrder.map((id) => {
              const d = docs[id];
              if (!d) return null;
              const active = id === activeDocId;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setActiveDoc(id)}
                    className={cn(
                      "mb-0.5 flex w-full flex-col rounded-sm px-2.5 py-2 text-left transition-colors duration-150",
                      active ? "bg-fg/10" : "hover:bg-fg/6",
                    )}
                  >
                      <span className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {deskWidgetIds.has(id) && (
                        <Pin
                          className={cn(
                            "size-3 shrink-0",
                            pinnedOnEditor.has(id) ? "fill-current text-sage" : "text-sage",
                          )}
                        />
                      )}
                      <span className="truncate">{d.title || "Untitled"}</span>
                    </span>
                    <span className="mt-0.5 text-xs text-subtle tabular-nums">
                      {clockReady ? relativeTime(d.updatedAt) : "saved"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {mode !== "preview" && (
            <Toolbar onCommand={run} className={mode === "write" ? "" : "border-b border-border"} />
          )}

          <div className="flex min-h-0 flex-1 max-lg:flex-col">
            {mode !== "preview" && doc && (
              <textarea
                ref={textareaRef}
                value={doc.body}
                onChange={(e) => updateDoc(doc.id, { body: e.target.value })}
                onKeyDown={onKey}
                onScroll={() => mode === "split" && syncScroll("edit")}
                spellCheck
                placeholder="Write markdown…"
                className={cn(
                  "min-h-0 min-w-0 flex-1 resize-none bg-transparent px-4 py-3 font-sans text-sm leading-relaxed text-fg outline-none placeholder:text-subtle",
                  mode === "split" && "lg:border-r border-border",
                )}
              />
            )}
            {mode !== "write" && doc && (
              <div
                ref={previewScroll}
                onScroll={() => mode === "split" && syncScroll("preview")}
                className={cn(
                  "min-h-0 min-w-0 flex-1 overflow-auto px-5 py-4",
                  mode === "split" && "max-lg:hidden",
                )}
              >
                <MarkdownPreview
                  source={doc.body}
                  onChange={(next) => updateDoc(doc.id, { body: next })}
                  className="text-base"
                />
              </div>
            )}
          </div>

          <footer className="flex h-9 shrink-0 items-center justify-between gap-3 border-t border-border px-3 text-xs text-muted">
            <span className="tabular-nums">
              {words} {words === 1 ? "word" : "words"}
              {doc && words > 0 ? ` · ${readingTime(doc.body)} min` : ""}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs sm:hidden"
                aria-pressed={onDesk}
                onClick={pinActiveDoc}
              >
                <Pin className={cn("size-3", onDesk && "fill-current")} />
                {onEditor ? "To desk" : onDesk ? "On desk" : "Pin"}
              </Button>
              {doc && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs sm:hidden"
                  aria-label="Save markdown file"
                  onClick={() => {
                    void exitFullscreen();
                    setEditorVisible(false);
                    void saveMarkdownFile(doc.title, doc.body);
                  }}
                >
                  <Save className="size-3" />
                  Save
                </Button>
              )}
              {doc && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted hover:text-danger sm:hidden"
                  onClick={() => removeDoc(doc.id)}
                >
                  <Trash2 className="size-3" />
                  Delete
                </Button>
              )}
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}

function Toolbar({
  onCommand,
  className,
}: {
  onCommand: (c: EditorCommand) => void;
  className?: string;
}) {
  const items: { cmd: EditorCommand; icon: typeof Bold; label: string }[] = [
    { cmd: "bold", icon: Bold, label: "Bold" },
    { cmd: "italic", icon: Italic, label: "Italic" },
    { cmd: "strike", icon: Strikethrough, label: "Strikethrough" },
    { cmd: "h1", icon: Heading1, label: "Heading" },
    { cmd: "h2", icon: Heading2, label: "Subheading" },
    { cmd: "quote", icon: Quote, label: "Quote" },
    { cmd: "code", icon: Code, label: "Code" },
    { cmd: "ul", icon: List, label: "List" },
    { cmd: "ol", icon: ListOrdered, label: "Numbered list" },
    { cmd: "task", icon: ListChecks, label: "Checklist" },
    { cmd: "link", icon: Link2, label: "Link" },
    { cmd: "table", icon: Table, label: "Table" },
    { cmd: "hr", icon: Minus, label: "Divider" },
  ];
  return (
    <div
      className={cn(
        "flex h-10 shrink-0 items-center gap-0.5 overflow-x-auto px-2",
        className,
      )}
      role="toolbar"
      aria-label="Formatting"
    >
      {items.map(({ cmd, icon: Icon, label }) => (
        <button
          key={cmd}
          type="button"
          title={label}
          aria-label={label}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand(cmd)}
          className="grid size-8 shrink-0 place-items-center rounded-xs text-muted transition-colors duration-150 hover:bg-fg/8 hover:text-fg"
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

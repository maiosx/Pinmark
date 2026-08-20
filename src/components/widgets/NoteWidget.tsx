import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { MarkdownPreview } from "@/components/markdown/MarkdownPreview";
import { PALETTE, useStore, type Widget } from "@/lib/store";
import { clamp, cn } from "@/lib/utils";

const MIN_W = 200;
const MIN_H = 140;
const BAR = 52;

type Props = {
  widget: Widget;
};

export function NoteWidget({ widget }: Props) {
  const doc = useStore((s) => s.docs[widget.docId]);
  const updateDoc = useStore((s) => s.updateDoc);
  const updateWidget = useStore((s) => s.updateWidget);
  const raiseWidget = useStore((s) => s.raiseWidget);
  const cycleColor = useStore((s) => s.cycleColor);
  const removeWidget = useStore((s) => s.removeWidget);
  const setActiveDoc = useStore((s) => s.setActiveDoc);

  const [editing, setEditing] = useState(false);
  const [frame, setFrame] = useState({
    x: widget.x,
    y: widget.y,
    w: widget.w,
    h: widget.h,
  });
  const dragging = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const swatch = PALETTE[widget.color % PALETTE.length]!;
  const accent = swatch.accent;
  const paper = Boolean(swatch.paper);
  const body = doc?.body ?? "";

  useEffect(() => {
    if (dragging.current) return;
    setFrame({ x: widget.x, y: widget.y, w: widget.w, h: widget.h });
  }, [widget.x, widget.y, widget.w, widget.h]);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  if (!doc) return null;

  const z = (widget.pinned ? 2000 : 20) + widget.z;

  function startDrag(e: React.PointerEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest("[data-chrome]")) return;
    e.preventDefault();
    raiseWidget(widget.id);
    dragging.current = true;
    const ox = e.clientX - frame.x;
    const oy = e.clientY - frame.y;
    const start = { ...frame };
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const boardW = window.innerWidth;
      const boardH = window.innerHeight;
      const next = {
        ...start,
        x: clamp(Math.round(ev.clientX - ox), 8, Math.max(8, boardW - start.w - 8)),
        y: clamp(Math.round(ev.clientY - oy), BAR, Math.max(BAR, boardH - start.h - 8)),
      };
      setFrame(next);
    };
    const onUp = (ev: PointerEvent) => {
      dragging.current = false;
      el.releasePointerCapture(ev.pointerId);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      setFrame((f) => {
        updateWidget(widget.id, { x: f.x, y: f.y });
        return f;
      });
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
  }

  function startResize(e: React.PointerEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    raiseWidget(widget.id);
    dragging.current = true;
    const ox = e.clientX;
    const oy = e.clientY;
    const start = { ...frame };
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const boardW = window.innerWidth;
      const boardH = window.innerHeight;
      const next = {
        ...start,
        w: clamp(start.w + (ev.clientX - ox), MIN_W, Math.max(MIN_W, boardW - start.x - 8)),
        h: clamp(start.h + (ev.clientY - oy), MIN_H, Math.max(MIN_H, boardH - start.y - 8)),
      };
      setFrame(next);
    };
    const onUp = (ev: PointerEvent) => {
      dragging.current = false;
      el.releasePointerCapture(ev.pointerId);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      setFrame((f) => {
        updateWidget(widget.id, { w: f.w, h: f.h });
        return f;
      });
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
  }

  return (
    <article
      className={cn(
        "absolute flex flex-col overflow-hidden rounded-lg shadow-[var(--shadow-widget)]",
        paper ? "text-ink" : "bg-bg-elevated/92 text-fg backdrop-blur-sm",
      )}
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.w,
        height: frame.h,
        zIndex: z,
        background: paper ? swatch.paper! : undefined,
      }}
      onPointerDown={() => raiseWidget(widget.id)}
    >
      <div
        className="absolute inset-y-2 left-1.5 w-0.5 rounded-full"
        style={{ background: accent }}
        aria-hidden
      />

      <header
        className={cn(
          "flex h-10 shrink-0 cursor-grab items-center gap-1 pr-1 pl-3.5 active:cursor-grabbing",
          paper ? "bg-ink/5" : "bg-fg/4",
        )}
        onPointerDown={startDrag}
      >
        <button
          type="button"
          data-chrome
          title="Cycle colour"
          aria-label="Cycle colour"
          className="size-4 shrink-0 rounded-full shadow-[0_0_0_1px_rgb(0_0_0/0.2)]"
          style={{ background: accent }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => cycleColor(widget.id)}
        />
        <button
          type="button"
          data-chrome
          className={cn(
            "min-w-0 flex-1 truncate text-left text-xs font-medium tracking-wide",
            paper ? "text-ink/80" : "text-fg/80",
          )}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setActiveDoc(widget.docId)}
          title="Open in editor"
        >
          {doc.title}
        </button>
        <div
          className="flex shrink-0 items-center gap-0.5"
          data-chrome
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ChromeBtn
            label="Close note"
            paper={paper}
            danger
            onClick={() => removeWidget(widget.id)}
          >
            <X className="size-3.5" />
            Close
          </ChromeBtn>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-2.5">
        {editing ? (
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => updateDoc(doc.id, { body: e.target.value })}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setEditing(false);
              }
            }}
            className={cn(
              "h-full min-h-full w-full resize-none bg-transparent text-sm leading-relaxed outline-none",
              paper ? "text-ink placeholder:text-ink/35" : "text-fg placeholder:text-subtle",
            )}
            placeholder="Take a note…"
            spellCheck
          />
        ) : (
          <div
            className="block min-h-full w-full cursor-text rounded-sm text-left"
            onClick={(e) => {
              const t = e.target as HTMLElement;
              if (t.closest("a, input, button")) return;
              setEditing(true);
            }}
          >
            <MarkdownPreview
              source={body}
              onChange={(next) => updateDoc(doc.id, { body: next })}
              paper={paper}
              className="text-sm md-widget"
            />
          </div>
        )}
      </div>

      <div
        className="absolute right-0 bottom-0 size-4 cursor-nwse-resize"
        onPointerDown={startResize}
        aria-label="Resize"
        role="separator"
      >
        <svg viewBox="0 0 16 16" className="size-4 opacity-40" aria-hidden>
          <path
            d="M14 6 L6 14 M14 10 L10 14"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </article>
  );
}

function ChromeBtn({
  children,
  onClick,
  label,
  paper,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  paper?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-xs px-2 text-xs font-medium transition-colors duration-150",
        paper ? "hover:bg-ink/10" : "hover:bg-fg/10",
        danger
          ? "text-muted hover:text-danger"
          : paper
            ? "text-ink/80"
            : "text-fg/80",
      )}
    >
      {children}
    </button>
  );
}

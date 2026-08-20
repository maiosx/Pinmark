import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  GROCERIES_MARKDOWN,
  HELP_MARKDOWN,
  TODAY_MARKDOWN,
  WELCOME_MARKDOWN,
  titleFromBody,
} from "@/lib/markdown";
import { clamp, uid } from "@/lib/utils";

export const PALETTE = [
  { id: "sage", accent: "#8a9a7c", paper: "#eef2e6", label: "Sage" },
  { id: "sky", accent: "#6e8ca3", paper: "#e7eef3", label: "Sky" },
  { id: "sand", accent: "#a89880", paper: "#f3efe6", label: "Sand" },
  { id: "frost", accent: "#8a9296", paper: "#eceff1", label: "Frost" },
  { id: "clay", accent: "#a88878", paper: "#f2ebe6", label: "Clay" },
  { id: "moss", accent: "#6f8468", paper: "#e8eee6", label: "Moss" },
  { id: "ink", accent: "#c5c1b4", paper: null, label: "Ink" },
] as const;

export type Doc = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
};

export type Widget = {
  id: string;
  docId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  color: number;
  pinned: boolean;
};

export type EditorMode = "write" | "split" | "preview";

type State = {
  hydrated: boolean;
  docs: Record<string, Doc>;
  docOrder: string[];
  widgets: Record<string, Widget>;
  widgetOrder: string[];
  activeDocId: string | null;
  editorVisible: boolean;
  editorMode: EditorMode;
  sidebarOpen: boolean;
  menuOpen: boolean;
  topZ: number;
  setHydrated: (v: boolean) => void;
  toggleEditor: () => void;
  setEditorVisible: (v: boolean) => void;
  setEditorMode: (m: EditorMode) => void;
  setSidebarOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setActiveDoc: (id: string) => void;
  addDoc: (seed?: Partial<Doc> & { withWidget?: boolean; widget?: Partial<Widget>; focus?: boolean }) => string;
  updateDoc: (id: string, patch: Partial<Pick<Doc, "title" | "body">>) => void;
  removeDoc: (id: string) => void;
  addWidget: (docId: string, near?: Partial<Widget>) => string | null;
  updateWidget: (id: string, patch: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  raiseWidget: (id: string) => void;
  cycleColor: (id: string) => void;
  togglePin: (id: string) => void;
  pinActiveDoc: () => void;
  addHelp: () => void;
  rescueWidgets: (boardW: number, boardH: number) => void;
  boardW: number;
  boardH: number;
};

function seed() {
  const now = Date.now();
  const welcome: Doc = {
    id: "d-welcome",
    title: "Welcome to Pinmark",
    body: WELCOME_MARKDOWN,
    updatedAt: now,
  };
  const groceries: Doc = {
    id: "d-groceries",
    title: "Groceries",
    body: GROCERIES_MARKDOWN,
    updatedAt: now,
  };
  const today: Doc = {
    id: "d-today",
    title: "Today",
    body: TODAY_MARKDOWN,
    updatedAt: now,
  };
  const docs = {
    [welcome.id]: welcome,
    [groceries.id]: groceries,
    [today.id]: today,
  };
  const widgets: Record<string, Widget> = {
    "w-groceries": {
      id: "w-groceries",
      docId: groceries.id,
      x: 20,
      y: 80,
      w: 236,
      h: 280,
      z: 1,
      color: 0,
      pinned: false,
    },
    "w-today": {
      id: "w-today",
      docId: today.id,
      x: 900,
      y: 460,
      w: 268,
      h: 236,
      z: 2,
      color: 1,
      pinned: true,
    },
  };
  return {
    docs,
    docOrder: [welcome.id, today.id, groceries.id],
    widgets,
    widgetOrder: ["w-today", "w-groceries"],
    activeDocId: welcome.id,
    topZ: 2,
  };
}

const BAR = 52;
const MIN_W = 200;
const MIN_H = 140;
const RAIL_X = 16;
const RAIL_GAP = 12;
const WIDE = 1024;

function railSlot(
  widgets: Record<string, Widget>,
  widgetOrder: string[],
  boardH: number,
  skipId?: string,
) {
  let y = BAR + 20;
  for (const id of widgetOrder) {
    if (id === skipId) continue;
    const w = widgets[id];
    if (!w || w.pinned) continue;
    if (Math.abs(w.x - RAIL_X) > 140) continue;
    y = Math.max(y, w.y + w.h + RAIL_GAP);
  }
  const h = 240;
  if (y + h > boardH - 12) y = BAR + 20;
  return { x: RAIL_X, y, w: 236, h };
}

function editorSlot(boardW: number, boardH: number, size?: { w: number; h: number }) {
  const w = size?.w ?? 268;
  const h = size?.h ?? 236;
  const leftMin = boardW >= WIDE ? 340 : 16;
  return {
    x: clamp(boardW - w - 40, leftMin, Math.max(leftMin, boardW - w - 16)),
    y: clamp(boardH - h - 36, BAR + 56, Math.max(BAR + 56, boardH - h - 16)),
    w,
    h,
  };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      hydrated: true,
      ...seed(),
      editorVisible: true,
      editorMode: "split",
      sidebarOpen: true,
      menuOpen: false,
      boardW: 1280,
      boardH: 800,
      setHydrated: (v) => set({ hydrated: v }),
      toggleEditor: () =>
        set((s) => ({ editorVisible: !s.editorVisible, menuOpen: false })),
      setEditorVisible: (v) => set({ editorVisible: v, menuOpen: false }),
      setEditorMode: (m) => set({ editorMode: m }),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      setMenuOpen: (v) => set({ menuOpen: v }),
      setActiveDoc: (id) => set({ activeDocId: id, editorVisible: true }),
      addDoc: (opts) => {
        const id = uid("d");
        const body = opts?.body ?? "";
        const title = opts?.title || titleFromBody(body);
        const doc: Doc = {
          id,
          title,
          body,
          updatedAt: Date.now(),
        };
        set((s) => ({
          docs: { ...s.docs, [id]: doc },
          docOrder: [id, ...s.docOrder],
        activeDocId: opts?.focus === false ? s.activeDocId : id,
          editorVisible: opts?.focus === false ? s.editorVisible : true,
          menuOpen: false,
        }));
        if (opts?.withWidget !== false) {
          get().addWidget(id, opts?.widget);
        }
        return id;
      },
      updateDoc: (id, patch) =>
        set((s) => {
          const prev = s.docs[id];
          if (!prev) return s;
          return {
            docs: {
              ...s.docs,
              [id]: { ...prev, ...patch, updatedAt: Date.now() },
            },
          };
        }),
      removeDoc: (id) =>
        set((s) => {
          const { [id]: _removed, ...docs } = s.docs;
          const widgetOrder = s.widgetOrder.filter((wid) => s.widgets[wid]?.docId !== id);
          const widgets = { ...s.widgets };
          for (const wid of Object.keys(widgets)) {
            if (widgets[wid]?.docId === id) delete widgets[wid];
          }
          let docOrder = s.docOrder.filter((d) => d !== id);
          let activeDocId = s.activeDocId === id ? (docOrder[0] ?? null) : s.activeDocId;
          if (docOrder.length === 0) {
            const nid = uid("d");
            docs[nid] = {
              id: nid,
              title: "Untitled",
              body: "",
              updatedAt: Date.now(),
            };
            docOrder = [nid];
            activeDocId = nid;
          }
          return { docs, docOrder, widgets, widgetOrder, activeDocId };
        }),
      addWidget: (docId, near) => {
        const s = get();
        if (!s.docs[docId]) return null;
        const existing = s.widgetOrder.find((id) => s.widgets[id]?.docId === docId);
        if (existing) {
          get().raiseWidget(existing);
          return existing;
        }
        const id = uid("w");
        const z = s.topZ + 1;
        const widget: Widget = {
          id,
          docId,
          x: near?.x ?? 56,
          y: near?.y ?? 72,
          w: near?.w ?? 260,
          h: near?.h ?? 240,
          z,
          color: near?.color ?? 0,
          pinned: near?.pinned ?? false,
        };
        if (typeof near?.x !== "number") {
          const last = s.widgetOrder[0] ? s.widgets[s.widgetOrder[0]] : null;
          if (last) {
            widget.x = last.x + 28;
            widget.y = last.y + 28;
            widget.w = last.w;
            widget.h = last.h;
            widget.color = last.color;
          }
        }
        set({
          widgets: { ...s.widgets, [id]: widget },
          widgetOrder: [id, ...s.widgetOrder],
          topZ: z,
          menuOpen: false,
        });
        return id;
      },
      updateWidget: (id, patch) =>
        set((s) => {
          const prev = s.widgets[id];
          if (!prev) return s;
          return { widgets: { ...s.widgets, [id]: { ...prev, ...patch } } };
        }),
      removeWidget: (id) =>
        set((s) => {
          const { [id]: _r, ...widgets } = s.widgets;
          return {
            widgets,
            widgetOrder: s.widgetOrder.filter((w) => w !== id),
          };
        }),
      raiseWidget: (id) =>
        set((s) => {
          const prev = s.widgets[id];
          if (!prev) return s;
          const z = s.topZ + 1;
          return {
            topZ: z,
            widgets: { ...s.widgets, [id]: { ...prev, z } },
            widgetOrder: [id, ...s.widgetOrder.filter((w) => w !== id)],
          };
        }),
      cycleColor: (id) =>
        set((s) => {
          const prev = s.widgets[id];
          if (!prev) return s;
          return {
            widgets: {
              ...s.widgets,
              [id]: { ...prev, color: (prev.color + 1) % PALETTE.length },
            },
          };
        }),
      togglePin: (id) =>
        set((s) => {
          const prev = s.widgets[id];
          if (!prev) return s;
          const z = s.topZ + 1;
          const pinned = !prev.pinned;
          const wide = s.boardW >= WIDE;
          let { x, y } = prev;
          if (pinned) {
            if (!wide || prev.x < 300) {
              const slot = editorSlot(s.boardW, s.boardH, { w: prev.w, h: prev.h });
              x = slot.x;
              y = slot.y;
            }
          } else if (wide) {
            const slot = railSlot(s.widgets, s.widgetOrder, s.boardH, id);
            x = slot.x;
            y = slot.y;
          }
          return {
            topZ: z,
            widgets: {
              ...s.widgets,
              [id]: { ...prev, pinned, z, x, y },
            },
          };
        }),
      pinActiveDoc: () => {
        const s = get();
        if (!s.activeDocId) return;
        const wide = s.boardW >= WIDE;
        const existing = s.widgetOrder.find((id) => s.widgets[id]?.docId === s.activeDocId);
        if (existing) {
          const w = s.widgets[existing]!;
          if (!wide && !w.pinned) {
            const slot = editorSlot(s.boardW, s.boardH, { w: w.w, h: w.h });
            set((cur) => {
              const prev = cur.widgets[existing];
              if (!prev) return cur;
              const z = cur.topZ + 1;
              return {
                topZ: z,
                widgets: {
                  ...cur.widgets,
                  [existing]: { ...prev, pinned: true, z, x: slot.x, y: slot.y },
                },
              };
            });
            return;
          }
          if (w.pinned) {
            const slot = wide
              ? railSlot(s.widgets, s.widgetOrder, s.boardH, existing)
              : editorSlot(s.boardW, s.boardH, { w: w.w, h: w.h });
            set((cur) => {
              const prev = cur.widgets[existing];
              if (!prev) return cur;
              const z = cur.topZ + 1;
              return {
                topZ: z,
                widgets: {
                  ...cur.widgets,
                  [existing]: {
                    ...prev,
                    pinned: !wide,
                    z,
                    x: slot.x,
                    y: slot.y,
                  },
                },
              };
            });
          } else {
            get().raiseWidget(existing);
          }
          return;
        }
        if (wide) {
          const slot = railSlot(s.widgets, s.widgetOrder, s.boardH);
          get().addWidget(s.activeDocId, { pinned: false, ...slot });
        } else {
          const slot = editorSlot(s.boardW, s.boardH);
          get().addWidget(s.activeDocId, { pinned: true, ...slot });
        }
      },
      addHelp: () => {
        get().addDoc({
          title: "Cheat sheet",
          body: HELP_MARKDOWN,
          withWidget: true,
          focus: false,
          widget: { w: 320, h: 380, color: 1, pinned: false, x: 80, y: 80 },
        });
      },
      rescueWidgets: (boardW, boardH) =>
        set((s) => {
          let changed = false;
          const widgets = { ...s.widgets };
          for (const id of Object.keys(widgets)) {
            const w = widgets[id]!;
            const nw = clamp(w.w, MIN_W, Math.max(MIN_W, boardW - 16));
            const nh = clamp(w.h, MIN_H, Math.max(MIN_H, boardH - BAR - 16));
            const nx = clamp(w.x, 8, Math.max(8, boardW - nw - 8));
            const ny = clamp(w.y, BAR, Math.max(BAR, boardH - nh - 8));
            if (nx !== w.x || ny !== w.y || nw !== w.w || nh !== w.h) {
              widgets[id] = { ...w, x: nx, y: ny, w: nw, h: nh };
              changed = true;
            }
          }
          if (!changed && s.boardW === boardW && s.boardH === boardH) return s;
          return { widgets: changed ? widgets : s.widgets, boardW, boardH };
        }),
    }),
    {
      name: "pinmark-v3",
      skipHydration: true,
      partialize: (s) => ({
        docs: s.docs,
        docOrder: s.docOrder,
        widgets: s.widgets,
        widgetOrder: s.widgetOrder,
        activeDocId: s.activeDocId,
        editorVisible: s.editorVisible,
        editorMode: s.editorMode,
        sidebarOpen: s.sidebarOpen,
        topZ: s.topZ,
      }),
    },
  ),
);

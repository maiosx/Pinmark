import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { C as Code, E as Bold, S as Eye, T as ChevronsLeft, _ as ListChecks, a as Table, b as Heading2, c as SquareSplitHorizontal, d as Pin, f as PanelLeftOpen, g as ListOrdered, h as List, i as Trash2, l as Quote, m as Minus, n as Type, o as Strikethrough, p as PanelLeftClose, s as StickyNote, t as X, u as Plus, v as Link2, w as ChevronsRight, x as Heading1, y as Italic } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { i as Slot } from "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as defaultSchema } from "../_libs/hast-util-sanitize+[...].mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as remarkGfm } from "../_libs/remark-gfm.mjs";
import { t as rehypeSanitize } from "../_libs/rehype-sanitize.mjs";
import { n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C3JWPBpW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function clamp(n, min, max) {
	return Math.max(min, Math.min(max, n));
}
function uid(prefix) {
	return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
function relativeTime(ts) {
	const s = Math.round((Date.now() - ts) / 1e3);
	if (s < 20) return "just now";
	if (s < 60) return `${s}s ago`;
	const m = Math.round(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.round(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.round(h / 24);
	if (d < 14) return `${d}d ago`;
	return new Date(ts).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
function wordCount(text) {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}
function readingTime(text) {
	const words = wordCount(text);
	return Math.max(1, Math.round(words / 220));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,box-shadow] duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_8%,transparent)]",
			secondary: "bg-bg-subtle text-fg hover:bg-border",
			ghost: "bg-transparent text-fg hover:bg-fg/8",
			outline: "bg-transparent text-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_18%,transparent)] hover:bg-fg/6",
			danger: "bg-danger/15 text-danger hover:bg-danger/25"
		},
		size: {
			sm: "h-8 rounded-sm px-2.5 text-xs",
			md: "h-10 rounded-md px-3.5 text-sm",
			lg: "h-11 rounded-lg px-4 text-sm",
			icon: "size-8 rounded-sm",
			"icon-sm": "size-7 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "md"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
});
Button.displayName = "Button";
var TASK = /^(\s*(?:[-*+]|\d+[.)])\s+)\[([ xX])\]/;
function toggleNthTask(src, n) {
	const lines = String(src).split("\n");
	let count = 0;
	for (let i = 0; i < lines.length; i++) {
		const m = lines[i].match(TASK);
		if (!m) continue;
		if (count === n) {
			lines[i] = m[1] + "[" + (m[2] === " " ? "x" : " ") + "]" + lines[i].slice(m[0].length);
			return lines.join("\n");
		}
		count++;
	}
	return String(src);
}
function titleFromBody(body, fallback = "Untitled") {
	const heading = body.match(/^\s{0,3}#{1,6}\s+(.+)$/m);
	if (heading?.[1]) return heading[1].trim().slice(0, 80);
	const line = body.split("\n").find((l) => l.trim());
	if (!line) return fallback;
	return line.replace(/^[#>*\-\s`]+/, "").slice(0, 80) || fallback;
}
function lineBounds(value, start, end) {
	const from = value.lastIndexOf("\n", start - 1) + 1;
	const to = value.indexOf("\n", end);
	return {
		from,
		to: to === -1 ? value.length : to
	};
}
function prefixLines(value, start, end, prefix) {
	const { from, to } = lineBounds(value, start, end);
	const nextBlock = value.slice(from, to).split("\n").map((line) => line.startsWith(prefix) ? line : prefix + line).join("\n");
	return {
		next: value.slice(0, from) + nextBlock + value.slice(to),
		selStart: from,
		selEnd: from + nextBlock.length
	};
}
function wrap(value, start, end, before, after, placeholder) {
	const selected = value.slice(start, end) || placeholder;
	const next = value.slice(0, start) + before + selected + after + value.slice(end);
	const selStart = start + before.length;
	return {
		next,
		selStart,
		selEnd: selStart + selected.length
	};
}
function applyCommand(value, start, end, command) {
	switch (command) {
		case "bold": return wrap(value, start, end, "**", "**", "bold");
		case "italic": return wrap(value, start, end, "*", "*", "italic");
		case "strike": return wrap(value, start, end, "~~", "~~", "text");
		case "code": return wrap(value, start, end, "`", "`", "code");
		case "link": return wrap(value, start, end, "[", "](https://)", "label");
		case "image": return wrap(value, start, end, "![", "](https://)", "alt");
		case "h1": return prefixLines(value, start, end, "# ");
		case "h2": return prefixLines(value, start, end, "## ");
		case "h3": return prefixLines(value, start, end, "### ");
		case "quote": return prefixLines(value, start, end, "> ");
		case "ul": return prefixLines(value, start, end, "- ");
		case "ol": return prefixLines(value, start, end, "1. ");
		case "task": return prefixLines(value, start, end, "- [ ] ");
		case "hr": {
			const insert = `${start > 0 && value[start - 1] !== "\n" ? "\n" : ""}---\n`;
			const next = value.slice(0, start) + insert + value.slice(end);
			const caret = start + insert.length;
			return {
				next,
				selStart: caret,
				selEnd: caret
			};
		}
		case "codeblock": return wrap(value, start, end, "```\n", "\n```\n", "code");
		case "table": {
			const next = value.slice(0, start) + "\n| Column | Column |\n| --- | --- |\n|  |  |\n" + value.slice(end);
			const caret = start + 43;
			return {
				next,
				selStart: caret,
				selEnd: caret
			};
		}
		default: return {
			next: value,
			selStart: start,
			selEnd: end
		};
	}
}
var HELP_MARKDOWN = `# Cheat sheet

Click a widget to edit its **markdown**. Click away, or press Esc, to render.

- [ ] tick me
- [x] done

1. numbered lists
2. work too

\`code\`, *italic*, **bold**, [links](https://example.com)

> and quotes

| Syntax | Renders |
| --- | --- |
| \`# heading\` | Heading |
| \`- [ ]\` | Checklist |

**Header:** pin onto the editor · colour · duplicate · delete.
Drag the header to move, the corner grip to resize.

The **Hide** button in the bar menu shows or hides the full markdown editor. Pinned widgets stay on top of it.
`;
var WELCOME_MARKDOWN = `# Welcome to Pinmark

A full markdown editor that lives on your desk. Notes are **pinnable widgets** — not sticky paper — and they float over the editor when you pin them.

## Write

Use the toolbar or shortcuts:

- **Ctrl/Cmd + B** bold
- **Ctrl/Cmd + I** italic
- **Ctrl/Cmd + K** link
- **Ctrl/Cmd + Shift + H** hide or show this editor

## Pin

1. Open a document in this editor
2. Click **Pin to desk** in the sidebar
3. Drag the widget by its header
4. Click the pin glyph so it sits *on* the editor

## Checklists

- [x] Open the bar menu
- [ ] Pin a widget onto the editor
- [ ] Hide the editor, then show it again

> Widgets keep their place. Hide only folds the editor away.
`;
var GROCERIES_MARKDOWN = `# Groceries

Run **before** noon.

- [x] milk
- [ ] oat flour
- [ ] black tea
- [x] lemons
- [ ] sourdough
`;
var TODAY_MARKDOWN = `# Today

Morning pages. Keep this pinned to the editor.

- [ ] Review the draft
- [ ] Walk at four
- [x] Water the plants

> Short sentences. No performance.
`;
var PALETTE = [
	{
		id: "sage",
		accent: "#8a9a7c",
		paper: "#eef2e6",
		label: "Sage"
	},
	{
		id: "sky",
		accent: "#6e8ca3",
		paper: "#e7eef3",
		label: "Sky"
	},
	{
		id: "sand",
		accent: "#a89880",
		paper: "#f3efe6",
		label: "Sand"
	},
	{
		id: "frost",
		accent: "#8a9296",
		paper: "#eceff1",
		label: "Frost"
	},
	{
		id: "clay",
		accent: "#a88878",
		paper: "#f2ebe6",
		label: "Clay"
	},
	{
		id: "moss",
		accent: "#6f8468",
		paper: "#e8eee6",
		label: "Moss"
	},
	{
		id: "ink",
		accent: "#c5c1b4",
		paper: null,
		label: "Ink"
	}
];
function seed() {
	const now = Date.now();
	const welcome = {
		id: "d-welcome",
		title: "Welcome to Pinmark",
		body: WELCOME_MARKDOWN,
		updatedAt: now
	};
	const groceries = {
		id: "d-groceries",
		title: "Groceries",
		body: GROCERIES_MARKDOWN,
		updatedAt: now
	};
	const today = {
		id: "d-today",
		title: "Today",
		body: TODAY_MARKDOWN,
		updatedAt: now
	};
	const docs = {
		[welcome.id]: welcome,
		[groceries.id]: groceries,
		[today.id]: today
	};
	const widgets = {
		"w-groceries": {
			id: "w-groceries",
			docId: groceries.id,
			x: 20,
			y: 80,
			w: 236,
			h: 280,
			z: 1,
			color: 0,
			pinned: false
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
			pinned: true
		}
	};
	return {
		docs,
		docOrder: [
			welcome.id,
			today.id,
			groceries.id
		],
		widgets,
		widgetOrder: ["w-today", "w-groceries"],
		activeDocId: welcome.id,
		topZ: 2
	};
}
var BAR$1 = 52;
var MIN_W$1 = 200;
var MIN_H$1 = 140;
var useStore = create()(persist((set, get) => ({
	hydrated: true,
	...seed(),
	editorVisible: true,
	editorMode: "split",
	sidebarOpen: true,
	menuOpen: false,
	setHydrated: (v) => set({ hydrated: v }),
	toggleEditor: () => set((s) => ({
		editorVisible: !s.editorVisible,
		menuOpen: false
	})),
	setEditorVisible: (v) => set({
		editorVisible: v,
		menuOpen: false
	}),
	setEditorMode: (m) => set({ editorMode: m }),
	setSidebarOpen: (v) => set({ sidebarOpen: v }),
	setMenuOpen: (v) => set({ menuOpen: v }),
	setActiveDoc: (id) => set({
		activeDocId: id,
		editorVisible: true
	}),
	addDoc: (opts) => {
		const id = uid("d");
		const body = opts?.body ?? "";
		const doc = {
			id,
			title: opts?.title || titleFromBody(body),
			body,
			updatedAt: Date.now()
		};
		set((s) => ({
			docs: {
				...s.docs,
				[id]: doc
			},
			docOrder: [id, ...s.docOrder],
			activeDocId: opts?.focus === false ? s.activeDocId : id,
			editorVisible: opts?.focus === false ? s.editorVisible : true,
			menuOpen: false
		}));
		if (opts?.withWidget !== false) get().addWidget(id, opts?.widget);
		return id;
	},
	updateDoc: (id, patch) => set((s) => {
		const prev = s.docs[id];
		if (!prev) return s;
		return { docs: {
			...s.docs,
			[id]: {
				...prev,
				...patch,
				updatedAt: Date.now()
			}
		} };
	}),
	removeDoc: (id) => set((s) => {
		const { [id]: _removed, ...docs } = s.docs;
		const widgetOrder = s.widgetOrder.filter((wid) => s.widgets[wid]?.docId !== id);
		const widgets = { ...s.widgets };
		for (const wid of Object.keys(widgets)) if (widgets[wid]?.docId === id) delete widgets[wid];
		let docOrder = s.docOrder.filter((d) => d !== id);
		let activeDocId = s.activeDocId === id ? docOrder[0] ?? null : s.activeDocId;
		if (docOrder.length === 0) {
			const nid = uid("d");
			docs[nid] = {
				id: nid,
				title: "Untitled",
				body: "",
				updatedAt: Date.now()
			};
			docOrder = [nid];
			activeDocId = nid;
		}
		return {
			docs,
			docOrder,
			widgets,
			widgetOrder,
			activeDocId
		};
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
		const widget = {
			id,
			docId,
			x: near?.x ?? 56,
			y: near?.y ?? 72,
			w: near?.w ?? 260,
			h: near?.h ?? 240,
			z,
			color: near?.color ?? 0,
			pinned: near?.pinned ?? false
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
			widgets: {
				...s.widgets,
				[id]: widget
			},
			widgetOrder: [id, ...s.widgetOrder],
			topZ: z,
			menuOpen: false
		});
		return id;
	},
	updateWidget: (id, patch) => set((s) => {
		const prev = s.widgets[id];
		if (!prev) return s;
		return { widgets: {
			...s.widgets,
			[id]: {
				...prev,
				...patch
			}
		} };
	}),
	removeWidget: (id) => set((s) => {
		const { [id]: _r, ...widgets } = s.widgets;
		return {
			widgets,
			widgetOrder: s.widgetOrder.filter((w) => w !== id)
		};
	}),
	raiseWidget: (id) => set((s) => {
		const prev = s.widgets[id];
		if (!prev) return s;
		const z = s.topZ + 1;
		return {
			topZ: z,
			widgets: {
				...s.widgets,
				[id]: {
					...prev,
					z
				}
			},
			widgetOrder: [id, ...s.widgetOrder.filter((w) => w !== id)]
		};
	}),
	cycleColor: (id) => set((s) => {
		const prev = s.widgets[id];
		if (!prev) return s;
		return { widgets: {
			...s.widgets,
			[id]: {
				...prev,
				color: (prev.color + 1) % PALETTE.length
			}
		} };
	}),
	togglePin: (id) => set((s) => {
		const prev = s.widgets[id];
		if (!prev) return s;
		const z = s.topZ + 1;
		return {
			topZ: z,
			widgets: {
				...s.widgets,
				[id]: {
					...prev,
					pinned: !prev.pinned,
					z
				}
			}
		};
	}),
	pinActiveDoc: () => {
		const s = get();
		if (!s.activeDocId) return;
		const existing = s.widgetOrder.find((id) => s.widgets[id]?.docId === s.activeDocId);
		if (existing) {
			if (!s.widgets[existing].pinned) get().togglePin(existing);
			get().raiseWidget(existing);
			return;
		}
		get().addWidget(s.activeDocId, {
			pinned: true,
			x: 72,
			y: 96,
			w: 280,
			h: 240
		});
	},
	addHelp: () => {
		get().addDoc({
			title: "Cheat sheet",
			body: HELP_MARKDOWN,
			withWidget: true,
			focus: false,
			widget: {
				w: 320,
				h: 380,
				color: 1,
				pinned: false,
				x: 80,
				y: 80
			}
		});
	},
	rescueWidgets: (boardW, boardH) => set((s) => {
		let changed = false;
		const widgets = { ...s.widgets };
		for (const id of Object.keys(widgets)) {
			const w = widgets[id];
			const nw = clamp(w.w, MIN_W$1, Math.max(MIN_W$1, boardW - 16));
			const nh = clamp(w.h, MIN_H$1, Math.max(MIN_H$1, boardH - BAR$1 - 16));
			const nx = clamp(w.x, 8, Math.max(8, boardW - nw - 8));
			const ny = clamp(w.y, BAR$1, Math.max(BAR$1, boardH - nh - 8));
			if (nx !== w.x || ny !== w.y || nw !== w.w || nh !== w.h) {
				widgets[id] = {
					...w,
					x: nx,
					y: ny,
					w: nw,
					h: nh
				};
				changed = true;
			}
		}
		return changed ? { widgets } : s;
	})
}), {
	name: "pinmark-v2",
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
		topZ: s.topZ
	})
}));
function BoardMenu() {
	const open = useStore((s) => s.menuOpen);
	const setMenuOpen = useStore((s) => s.setMenuOpen);
	const editorVisible = useStore((s) => s.editorVisible);
	const toggleEditor = useStore((s) => s.toggleEditor);
	const widgetCount = useStore((s) => s.widgetOrder.length);
	const addDoc = useStore((s) => s.addDoc);
	const addHelp = useStore((s) => s.addHelp);
	const panelRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === "Escape") setMenuOpen(false);
		};
		const onDown = (e) => {
			const t = e.target;
			if (panelRef.current && !panelRef.current.contains(t)) {
				if (!e.target.closest("[aria-label='Board menu']")) setMenuOpen(false);
			}
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("pointerdown", onDown);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("pointerdown", onDown);
		};
	}, [open, setMenuOpen]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed inset-0 z-[5000]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: panelRef,
			role: "dialog",
			"aria-label": "Pinmark board",
			className: "pointer-events-auto absolute top-12 right-3 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-editor)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-11 place-items-center rounded-md bg-fg/8 text-accent",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, {
								className: "size-5",
								strokeWidth: 1.6
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-base font-medium tracking-tight",
								children: "Pinmark"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-semibold tracking-wider text-muted uppercase",
								children: editorVisible ? "Editor open" : "Hidden"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-3xl font-medium tabular-nums leading-none text-fg",
							style: { opacity: editorVisible ? 1 : .4 },
							children: widgetCount
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-3.5 h-px bg-border" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							className: "h-9",
							onClick: () => addDoc({
								title: "Untitled",
								body: "",
								withWidget: true,
								widget: { pinned: true }
							}),
							children: "New"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							className: cn("h-9", !editorVisible && "bg-fg/10"),
							onClick: toggleEditor,
							children: editorVisible ? "Hide" : "Show"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							className: "h-9",
							onClick: addHelp,
							children: "Help"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs leading-relaxed text-muted",
					children: editorVisible ? "Hide folds the editor. Pinned widgets stay on top of it." : "The editor is hidden. Show it from here — pinned widgets stay on the desk."
				})
			]
		})
	});
}
function useClock() {
	const [now, setNow] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setNow(/* @__PURE__ */ new Date());
		const id = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => clearInterval(id);
	}, []);
	return now;
}
function TopBar() {
	const now = useClock();
	const widgetCount = useStore((s) => s.widgetOrder.length);
	const editorVisible = useStore((s) => s.editorVisible);
	const menuOpen = useStore((s) => s.menuOpen);
	const setMenuOpen = useStore((s) => s.setMenuOpen);
	const toggleEditor = useStore((s) => s.toggleEditor);
	const clock = now ? now.toLocaleString(void 0, {
		weekday: "short",
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit"
	}) : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "absolute inset-x-0 top-0 z-[4000] flex h-12 items-center justify-between gap-3 bg-bar/85 px-3 text-fg shadow-[0_1px_0_color-mix(in_oklab,var(--color-fg)_8%,transparent)] backdrop-blur-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-sm font-medium tracking-tight",
					children: "Pinmark"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-1 text-xs text-muted sm:flex",
					"aria-label": "Spaces",
					children: [
						1,
						2,
						3
					].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("grid size-6 place-items-center rounded-sm", n === 1 ? "bg-fg/10 text-fg" : "text-subtle"),
						children: n
					}, n))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-1/2 hidden -translate-x-1/2 text-xs font-medium tracking-wide text-muted tabular-nums sm:block",
				children: clock
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "hidden text-xs font-medium tracking-wider text-muted uppercase sm:inline",
					children: [
						editorVisible ? "Editor" : "Desk",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mx-1.5 text-subtle",
							children: "·"
						}),
						widgetCount,
						" ",
						widgetCount === 1 ? "widget" : "widgets"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-haspopup": "dialog",
					"aria-expanded": menuOpen,
					"aria-label": "Board menu",
					onClick: () => setMenuOpen(!menuOpen),
					onContextMenu: (e) => {
						e.preventDefault();
						toggleEditor();
					},
					className: cn("relative grid size-9 place-items-center rounded-sm text-fg transition-colors duration-150", menuOpen ? "bg-fg/12" : "hover:bg-fg/8", !editorVisible && "opacity-55"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, {
						className: "size-4",
						strokeWidth: 1.75
					})
				})]
			})
		]
	});
}
function Wallpaper() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 overflow-hidden bg-bg",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				className: "absolute inset-0 h-full w-full",
				viewBox: "0 0 1600 900",
				preserveAspectRatio: "xMidYMid slice",
				xmlns: "http://www.w3.org/2000/svg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
							id: "sky",
							cx: "50%",
							cy: "18%",
							r: "80%",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: "#2a3328"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "45%",
									stopColor: "#1a1e18"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: "#0e100e"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
							id: "moonGlow",
							cx: "50%",
							cy: "50%",
							r: "50%",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: "#e8e4d6",
									stopOpacity: "0.9"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "40%",
									stopColor: "#c5c1b4",
									stopOpacity: "0.35"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: "#c5c1b4",
									stopOpacity: "0"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: "hill1",
							x1: "0",
							y1: "0",
							x2: "0",
							y2: "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "0%",
								stopColor: "#1f261c"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "100%",
								stopColor: "#121511"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: "hill2",
							x1: "0",
							y1: "0",
							x2: "0",
							y2: "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "0%",
								stopColor: "#252c22"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "100%",
								stopColor: "#161914"
							})]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: "1600",
						height: "900",
						fill: "url(#sky)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "1180",
						cy: "160",
						r: "90",
						fill: "url(#moonGlow)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "1180",
						cy: "160",
						r: "28",
						fill: "#e8e4d6"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "1192",
						cy: "150",
						r: "8",
						fill: "#d4d0c2",
						opacity: "0.45"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						fill: "#d8d4c6",
						opacity: "0.55",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "180",
								cy: "90",
								r: "1.2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "260",
								cy: "140",
								r: "0.8"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "420",
								cy: "70",
								r: "1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "640",
								cy: "120",
								r: "0.7"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "790",
								cy: "55",
								r: "1.1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "980",
								cy: "88",
								r: "0.8"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "1320",
								cy: "64",
								r: "1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "1460",
								cy: "130",
								r: "0.9"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "1520",
								cy: "210",
								r: "0.7"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "90",
								cy: "200",
								r: "0.8"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 520 C 180 460, 320 500, 480 440 C 640 380, 780 430, 960 390 C 1140 350, 1280 400, 1600 340 L 1600 900 L 0 900 Z",
						fill: "url(#hill2)",
						opacity: "0.9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 610 C 220 540, 400 600, 620 560 C 860 514, 1040 580, 1280 530 C 1440 500, 1540 540, 1600 520 L 1600 900 L 0 900 Z",
						fill: "url(#hill1)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 740 C 260 690, 480 760, 760 710 C 1040 660, 1280 730, 1600 690 L 1600 900 L 0 900 Z",
						fill: "#0c0e0b"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grain" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0c0e0b_100%)] opacity-50" })
		]
	});
}
var MdCtx = (0, import_react.createContext)(null);
var schema = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		input: [
			...defaultSchema.attributes?.input ?? [],
			"type",
			"checked",
			"disabled"
		],
		li: [
			...defaultSchema.attributes?.li ?? [],
			"className",
			"class"
		],
		ul: [
			...defaultSchema.attributes?.ul ?? [],
			"className",
			"class"
		],
		ol: [
			...defaultSchema.attributes?.ol ?? [],
			"className",
			"class"
		],
		code: [
			...defaultSchema.attributes?.code ?? [],
			"className",
			"class"
		]
	}
};
function isSafeHref(href) {
	if (!href) return false;
	return /^(https?:|mailto:|#)/i.test(href);
}
function TaskCheckbox({ checked }) {
	const ctx = (0, import_react.useContext)(MdCtx);
	const index = (0, import_react.useRef)(null);
	if (index.current === null && ctx) index.current = ctx.nextIndex();
	const i = index.current ?? 0;
	const interactive = Boolean(ctx?.onChange);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type: "checkbox",
		checked: Boolean(checked),
		readOnly: !interactive,
		onChange: (e) => {
			e.stopPropagation();
			if (!ctx?.onChange) return;
			ctx.onChange(toggleNthTask(ctx.source, i));
		},
		onClick: (e) => e.stopPropagation(),
		className: cn(interactive && "cursor-pointer")
	});
}
function MarkdownPreview({ source, onChange, className, paper }) {
	const counter = (0, import_react.useRef)(0);
	counter.current = 0;
	const empty = source.trim().length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MdCtx.Provider, {
		value: {
			source,
			onChange,
			nextIndex: () => counter.current++
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("md", paper && "md-paper", className),
			children: empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "opacity-40 italic",
				children: "Take a note…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
				remarkPlugins: [remarkGfm],
				rehypePlugins: [[rehypeSanitize, schema]],
				components: {
					a: ({ href, children }) => isSafeHref(href) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href,
						target: "_blank",
						rel: "noreferrer",
						children
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children }),
					input: ({ type, checked }) => type === "checkbox" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCheckbox, { checked }) : null
				},
				children: source
			})
		})
	});
}
function MarkdownEditor() {
	const visible = useStore((s) => s.editorVisible);
	const mode = useStore((s) => s.editorMode);
	const setMode = useStore((s) => s.setEditorMode);
	const sidebarOpen = useStore((s) => s.sidebarOpen);
	const setSidebarOpen = useStore((s) => s.setSidebarOpen);
	const toggleEditor = useStore((s) => s.toggleEditor);
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
	const doc = activeDocId ? docs[activeDocId] : void 0;
	const textareaRef = (0, import_react.useRef)(null);
	const previewScroll = (0, import_react.useRef)(null);
	const syncing = (0, import_react.useRef)(false);
	const [clockReady, setClockReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setClockReady(true), []);
	const pinnedIds = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const id of widgetOrder) {
			const w = widgets[id];
			if (w) set.add(w.docId);
		}
		return set;
	}, [widgets, widgetOrder]);
	function run(command) {
		const el = textareaRef.current;
		if (!el || !doc) return;
		const { next, selStart, selEnd } = applyCommand(el.value, el.selectionStart, el.selectionEnd, command);
		updateDoc(doc.id, { body: next });
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(selStart, selEnd);
		});
	}
	function onKey(e) {
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
	function syncScroll(from) {
		if (syncing.current) return;
		const a = from === "edit" ? textareaRef.current : previewScroll.current;
		const b = from === "edit" ? previewScroll.current : textareaRef.current;
		if (!a || !b) return;
		const maxA = a.scrollHeight - a.clientHeight;
		const maxB = b.scrollHeight - b.clientHeight;
		if (maxA <= 0 || maxB <= 0) return;
		syncing.current = true;
		b.scrollTop = a.scrollTop / maxA * maxB;
		requestAnimationFrame(() => {
			syncing.current = false;
		});
	}
	const words = doc ? wordCount(doc.body) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-hidden": !visible,
		"aria-label": "Markdown editor",
		className: cn("editor-frame absolute z-[1000] flex flex-col overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-editor)]", "transition-[opacity,transform] duration-200 ease-[var(--ease-smooth-out)]", visible ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0 duration-150"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex h-12 shrink-0 items-center gap-2 border-b border-border px-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "hidden sm:inline-flex",
					"aria-label": sidebarOpen ? "Collapse sidebar" : "Expand sidebar",
					onClick: () => setSidebarOpen(!sidebarOpen),
					children: sidebarOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeftClose, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeftOpen, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "sm:hidden",
					"aria-label": sidebarOpen ? "Hide documents" : "Show documents",
					onClick: () => setSidebarOpen(!sidebarOpen),
					children: sidebarOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsLeft, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsRight, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: doc?.title ?? "",
						onChange: (e) => doc && updateDoc(doc.id, { title: e.target.value }),
						className: "w-full bg-transparent font-display text-sm font-medium tracking-tight text-fg outline-none placeholder:text-subtle",
						placeholder: "Untitled",
						"aria-label": "Document title"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center rounded-sm bg-fg/6 p-0.5",
					children: [
						[
							"write",
							Type,
							"Write"
						],
						[
							"split",
							SquareSplitHorizontal,
							"Split"
						],
						[
							"preview",
							Eye,
							"Preview"
						]
					].map(([id, Icon, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": label,
						"aria-pressed": mode === id,
						onClick: () => setMode(id),
						className: cn("grid size-8 place-items-center rounded-xs transition-colors duration-150", mode === id ? "bg-bg-elevated text-fg shadow-[0_0_0_1px_var(--color-border)]" : "text-muted hover:text-fg"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" })
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					className: "hidden md:inline-flex",
					onClick: pinActiveDoc,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-3.5" }), "Pin to desk"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					"aria-label": "Fold editor",
					onClick: toggleEditor,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("flex shrink-0 flex-col border-r border-border bg-bg/40 transition-[width,opacity] duration-200 ease-[var(--ease-smooth-out)]", sidebarOpen ? "w-56 max-w-[42vw] opacity-100" : "w-0 overflow-hidden opacity-0"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-3 pt-3 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold tracking-wider text-muted uppercase",
						children: "Documents"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "New document",
						onClick: () => addDoc({
							title: "Untitled",
							body: "",
							withWidget: false
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "min-h-0 flex-1 overflow-auto px-2 pb-3",
					children: docOrder.map((id) => {
						const d = docs[id];
						if (!d) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveDoc(id),
							className: cn("mb-0.5 flex w-full flex-col rounded-sm px-2.5 py-2 text-left transition-colors duration-150", id === activeDocId ? "bg-fg/10" : "hover:bg-fg/6"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5 truncate text-sm font-medium",
								children: [pinnedIds.has(id) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-3 shrink-0 text-sage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: d.title || "Untitled"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 text-xs text-subtle tabular-nums",
								children: clockReady ? relativeTime(d.updatedAt) : "saved"
							})]
						}) }, id);
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [
					mode !== "preview" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toolbar, {
						onCommand: run,
						className: mode === "write" ? "" : "border-b border-border"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 flex-1 max-lg:flex-col",
						children: [mode !== "preview" && doc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							ref: textareaRef,
							value: doc.body,
							onChange: (e) => updateDoc(doc.id, { body: e.target.value }),
							onKeyDown: onKey,
							onScroll: () => mode === "split" && syncScroll("edit"),
							spellCheck: true,
							placeholder: "Write markdown…",
							className: cn("min-h-0 min-w-0 flex-1 resize-none bg-transparent px-4 py-3 font-sans text-sm leading-relaxed text-fg outline-none placeholder:text-subtle", mode === "split" && "lg:border-r border-border")
						}), mode !== "write" && doc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: previewScroll,
							onScroll: () => mode === "split" && syncScroll("preview"),
							className: cn("min-h-0 min-w-0 flex-1 overflow-auto px-5 py-4", mode === "split" && "max-lg:hidden"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownPreview, {
								source: doc.body,
								onChange: (next) => updateDoc(doc.id, { body: next }),
								className: "text-base"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "flex h-9 shrink-0 items-center justify-between gap-3 border-t border-border px-3 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [
								words,
								" ",
								words === 1 ? "word" : "words",
								doc && words > 0 ? ` · ${readingTime(doc.body)} min` : ""
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "h-7 px-2 text-xs md:hidden",
								onClick: pinActiveDoc,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-3" }), "Pin"]
							}), doc && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "h-7 px-2 text-xs text-muted hover:text-danger",
								onClick: () => removeDoc(doc.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" }), "Delete"]
							})]
						})]
					})
				]
			})]
		})]
	});
}
function Toolbar({ onCommand, className }) {
	const items = [
		{
			cmd: "bold",
			icon: Bold,
			label: "Bold"
		},
		{
			cmd: "italic",
			icon: Italic,
			label: "Italic"
		},
		{
			cmd: "strike",
			icon: Strikethrough,
			label: "Strikethrough"
		},
		{
			cmd: "h1",
			icon: Heading1,
			label: "Heading"
		},
		{
			cmd: "h2",
			icon: Heading2,
			label: "Subheading"
		},
		{
			cmd: "quote",
			icon: Quote,
			label: "Quote"
		},
		{
			cmd: "code",
			icon: Code,
			label: "Code"
		},
		{
			cmd: "ul",
			icon: List,
			label: "List"
		},
		{
			cmd: "ol",
			icon: ListOrdered,
			label: "Numbered list"
		},
		{
			cmd: "task",
			icon: ListChecks,
			label: "Checklist"
		},
		{
			cmd: "link",
			icon: Link2,
			label: "Link"
		},
		{
			cmd: "table",
			icon: Table,
			label: "Table"
		},
		{
			cmd: "hr",
			icon: Minus,
			label: "Divider"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex h-10 shrink-0 items-center gap-0.5 overflow-x-auto px-2", className),
		role: "toolbar",
		"aria-label": "Formatting",
		children: items.map(({ cmd, icon: Icon, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			title: label,
			"aria-label": label,
			onMouseDown: (e) => e.preventDefault(),
			onClick: () => onCommand(cmd),
			className: "grid size-8 shrink-0 place-items-center rounded-xs text-muted transition-colors duration-150 hover:bg-fg/8 hover:text-fg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" })
		}, cmd))
	});
}
var MIN_W = 200;
var MIN_H = 140;
var BAR = 52;
function NoteWidget({ widget }) {
	const doc = useStore((s) => s.docs[widget.docId]);
	const updateDoc = useStore((s) => s.updateDoc);
	const updateWidget = useStore((s) => s.updateWidget);
	const raiseWidget = useStore((s) => s.raiseWidget);
	const cycleColor = useStore((s) => s.cycleColor);
	const togglePin = useStore((s) => s.togglePin);
	const removeWidget = useStore((s) => s.removeWidget);
	const addDoc = useStore((s) => s.addDoc);
	const setActiveDoc = useStore((s) => s.setActiveDoc);
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [armed, setArmed] = (0, import_react.useState)(false);
	const [frame, setFrame] = (0, import_react.useState)({
		x: widget.x,
		y: widget.y,
		w: widget.w,
		h: widget.h
	});
	const dragging = (0, import_react.useRef)(false);
	const armTimer = (0, import_react.useRef)(null);
	const textareaRef = (0, import_react.useRef)(null);
	const swatch = PALETTE[widget.color % PALETTE.length];
	const accent = swatch.accent;
	const paper = Boolean(swatch.paper);
	const body = doc?.body ?? "";
	(0, import_react.useEffect)(() => {
		if (dragging.current) return;
		setFrame({
			x: widget.x,
			y: widget.y,
			w: widget.w,
			h: widget.h
		});
	}, [
		widget.x,
		widget.y,
		widget.w,
		widget.h
	]);
	(0, import_react.useEffect)(() => {
		if (editing) textareaRef.current?.focus();
	}, [editing]);
	(0, import_react.useEffect)(() => {
		return () => {
			if (armTimer.current) window.clearTimeout(armTimer.current);
		};
	}, []);
	if (!doc) return null;
	const z = (widget.pinned ? 2e3 : 20) + widget.z;
	function startDrag(e) {
		if (e.target.closest("[data-chrome]")) return;
		e.preventDefault();
		raiseWidget(widget.id);
		dragging.current = true;
		const ox = e.clientX - frame.x;
		const oy = e.clientY - frame.y;
		const start = { ...frame };
		const el = e.currentTarget;
		el.setPointerCapture(e.pointerId);
		const onMove = (ev) => {
			const boardW = window.innerWidth;
			const boardH = window.innerHeight;
			const next = {
				...start,
				x: clamp(Math.round(ev.clientX - ox), 8, Math.max(8, boardW - start.w - 8)),
				y: clamp(Math.round(ev.clientY - oy), BAR, Math.max(BAR, boardH - start.h - 8))
			};
			setFrame(next);
		};
		const onUp = (ev) => {
			dragging.current = false;
			el.releasePointerCapture(ev.pointerId);
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerup", onUp);
			setFrame((f) => {
				updateWidget(widget.id, {
					x: f.x,
					y: f.y
				});
				return f;
			});
		};
		el.addEventListener("pointermove", onMove);
		el.addEventListener("pointerup", onUp);
	}
	function startResize(e) {
		e.preventDefault();
		e.stopPropagation();
		raiseWidget(widget.id);
		dragging.current = true;
		const ox = e.clientX;
		const oy = e.clientY;
		const start = { ...frame };
		const el = e.currentTarget;
		el.setPointerCapture(e.pointerId);
		const onMove = (ev) => {
			const boardW = window.innerWidth;
			const boardH = window.innerHeight;
			const next = {
				...start,
				w: clamp(start.w + (ev.clientX - ox), MIN_W, Math.max(MIN_W, boardW - start.x - 8)),
				h: clamp(start.h + (ev.clientY - oy), MIN_H, Math.max(MIN_H, boardH - start.y - 8))
			};
			setFrame(next);
		};
		const onUp = (ev) => {
			dragging.current = false;
			el.releasePointerCapture(ev.pointerId);
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerup", onUp);
			setFrame((f) => {
				updateWidget(widget.id, {
					w: f.w,
					h: f.h
				});
				return f;
			});
		};
		el.addEventListener("pointermove", onMove);
		el.addEventListener("pointerup", onUp);
	}
	function armDelete() {
		if (!body.trim() || armed) {
			removeWidget(widget.id);
			return;
		}
		setArmed(true);
		if (armTimer.current) window.clearTimeout(armTimer.current);
		armTimer.current = window.setTimeout(() => setArmed(false), 3e3);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("absolute flex flex-col overflow-hidden rounded-lg shadow-[var(--shadow-widget)]", paper ? "text-ink" : "bg-bg-elevated/92 text-fg backdrop-blur-sm"),
		style: {
			left: frame.x,
			top: frame.y,
			width: frame.w,
			height: frame.h,
			zIndex: z,
			background: paper ? swatch.paper : void 0
		},
		onPointerDown: () => raiseWidget(widget.id),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-y-2 left-1.5 w-0.5 rounded-full",
				style: { background: accent },
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: cn("flex h-9 shrink-0 cursor-grab items-center gap-1 pr-1.5 pl-4 active:cursor-grabbing", paper ? "bg-ink/5" : "bg-fg/4"),
				onPointerDown: startDrag,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-chrome": true,
						title: "Cycle colour",
						"aria-label": "Cycle colour",
						className: "size-4 shrink-0 rounded-full shadow-[0_0_0_1px_rgb(0_0_0/0.2)]",
						style: { background: accent },
						onPointerDown: (e) => e.stopPropagation(),
						onClick: () => cycleColor(widget.id)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-chrome": true,
						className: cn("min-w-0 flex-1 truncate text-left text-xs font-medium tracking-wide", paper ? "text-ink/80" : "text-fg/80"),
						onPointerDown: (e) => e.stopPropagation(),
						onClick: () => setActiveDoc(widget.docId),
						title: "Open in editor",
						children: doc.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center",
						"data-chrome": true,
						onPointerDown: (e) => e.stopPropagation(),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
								label: widget.pinned ? "Unpin from editor" : "Pin onto editor",
								onClick: () => togglePin(widget.id),
								paper,
								active: widget.pinned,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: cn("size-3.5", widget.pinned && "fill-current") })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
								label: "New widget nearby",
								onClick: () => addDoc({
									title: "Untitled",
									body: "",
									withWidget: true,
									focus: false,
									widget: {
										x: frame.x + 28,
										y: frame.y + 28,
										w: frame.w,
										h: frame.h,
										color: widget.color,
										pinned: widget.pinned
									}
								}),
								paper,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
								label: armed ? "Click again to delete" : "Remove widget",
								onClick: armDelete,
								paper,
								danger: armed,
								children: armed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-auto px-4 py-2.5",
				children: editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					ref: textareaRef,
					value: body,
					onChange: (e) => updateDoc(doc.id, { body: e.target.value }),
					onBlur: () => setEditing(false),
					onKeyDown: (e) => {
						if (e.key === "Escape") {
							e.preventDefault();
							setEditing(false);
						}
					},
					className: cn("h-full min-h-full w-full resize-none bg-transparent text-sm leading-relaxed outline-none", paper ? "text-ink placeholder:text-ink/35" : "text-fg placeholder:text-subtle"),
					placeholder: "Take a note…",
					spellCheck: true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "block min-h-full w-full cursor-text rounded-sm text-left",
					onClick: (e) => {
						if (e.target.closest("a, input, button")) return;
						setEditing(true);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownPreview, {
						source: body,
						onChange: (next) => updateDoc(doc.id, { body: next }),
						paper,
						className: "text-sm md-widget"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute right-0 bottom-0 size-4 cursor-nwse-resize",
				onPointerDown: startResize,
				"aria-label": "Resize",
				role: "separator",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 16 16",
					className: "size-4 opacity-40",
					"aria-hidden": true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M14 6 L6 14 M14 10 L10 14",
						stroke: "currentColor",
						strokeWidth: "1.2",
						fill: "none",
						strokeLinecap: "round"
					})
				})
			})
		]
	});
}
function IconBtn({ children, onClick, label, paper, active, danger }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		title: label,
		onClick,
		className: cn("grid size-7 place-items-center rounded-xs transition-colors duration-150", paper ? "hover:bg-ink/8" : "hover:bg-fg/10", active && (paper ? "text-ink" : "text-accent"), danger && "text-danger"),
		children
	});
}
function TooltipProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Provider, {
		delayDuration: 280,
		skipDelayDuration: 120,
		children
	});
}
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-[80] rounded-sm bg-bg-elevated px-2 py-1 text-xs text-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_12%,transparent),0_8px_24px_-12px_rgb(0_0_0/0.5)]", "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out", className),
	...props
}) }));
TooltipContent.displayName = "TooltipContent";
function DeskApp() {
	const widgetOrder = useStore((s) => s.widgetOrder);
	const widgets = useStore((s) => s.widgets);
	const rescueWidgets = useStore((s) => s.rescueWidgets);
	const toggleEditor = useStore((s) => s.toggleEditor);
	const setMenuOpen = useStore((s) => s.setMenuOpen);
	(0, import_react.useEffect)(() => {
		useStore.persist.rehydrate();
	}, []);
	(0, import_react.useEffect)(() => {
		const onResize = () => rescueWidgets(window.innerWidth, window.innerHeight);
		onResize();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [rescueWidgets]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "h") {
				e.preventDefault();
				toggleEditor();
			}
			if (e.key === "Escape") setMenuOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [toggleEditor, setMenuOpen]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallpaper, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}),
			widgetOrder.map((id) => {
				const w = widgets[id];
				return w ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteWidget, { widget: w }, id) : null;
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownEditor, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardMenu, {})
		]
	}) });
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskApp, {});
}
//#endregion
export { Home as component };

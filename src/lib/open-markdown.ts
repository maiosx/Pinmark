import { titleFromBody } from "@/lib/markdown";
import { useStore } from "@/lib/store";

const MD_EXT = /\.(md|markdown|mdown|mkd)$/i;

export function isMarkdownFile(file: File) {
  if (MD_EXT.test(file.name)) return true;
  return file.type === "text/markdown" || file.type === "text/x-markdown";
}

export function titleFromFileName(name: string) {
  return name.replace(MD_EXT, "").trim() || "Untitled";
}

export async function openMarkdownFiles(files: Iterable<File>) {
  const list = [...files].filter(isMarkdownFile);
  if (list.length === 0) return 0;
  const store = useStore.getState();
  for (let i = 0; i < list.length; i++) {
    const file = list[i]!;
    const body = await file.text();
    const title = titleFromBody(body, titleFromFileName(file.name));
    store.addDoc({
      title,
      body,
      withWidget: false,
      focus: i === list.length - 1,
    });
  }
  store.setEditorVisible(true);
  return list.length;
}

export function bindMarkdownFileOpener() {
  const onDrop = (e: DragEvent) => {
    const files = e.dataTransfer?.files;
    if (!files?.length) return;
    const md = [...files].filter(isMarkdownFile);
    if (md.length === 0) return;
    e.preventDefault();
    void openMarkdownFiles(md);
  };
  const onDragOver = (e: DragEvent) => {
    const dt = e.dataTransfer;
    if (!dt) return;
    if (![...dt.items].some((it) => it.kind === "file")) return;
    e.preventDefault();
    dt.dropEffect = "copy";
  };
  window.addEventListener("drop", onDrop);
  window.addEventListener("dragover", onDragOver);

  const w = window as Window & {
    launchQueue?: {
      setConsumer: (cb: (params: { files?: Array<{ kind?: string; getFile?: () => Promise<File> }> }) => void) => void;
    };
  };
  if (w.launchQueue?.setConsumer) {
    w.launchQueue.setConsumer(async (params) => {
      const files: File[] = [];
      for (const handle of params.files ?? []) {
        if (typeof handle.getFile === "function") {
          files.push(await handle.getFile());
        }
      }
      await openMarkdownFiles(files);
    });
  }

  return () => {
    window.removeEventListener("drop", onDrop);
    window.removeEventListener("dragover", onDragOver);
  };
}

export function filenameFromTitle(title: string) {
  const base =
    title
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 80) || "untitled";
  return /\.(md|markdown)$/i.test(base) ? base : `${base}.md`;
}

export async function saveMarkdownFile(title: string, body: string) {
  const name = filenameFromTitle(title);
  const picker = (
    window as Window & {
      showSaveFilePicker?: (opts: {
        suggestedName: string;
        types: { description: string; accept: Record<string, string[]> }[];
      }) => Promise<{
        createWritable: () => Promise<{ write: (d: string) => Promise<void>; close: () => Promise<void> }>;
      }>;
    }
  ).showSaveFilePicker;
  const allowPicker =
    typeof picker === "function" &&
    window.self === window.top &&
    !navigator.webdriver;
  if (allowPicker) {
    try {
      const handle = await picker({
        suggestedName: name,
        types: [{ description: "Markdown", accept: { "text/markdown": [".md"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(body);
      await writable.close();
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return false;
    }
  }
  const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}

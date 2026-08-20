const TASK = /^(\s*(?:[-*+]|\d+[.)])\s+)\[([ xX])\]/;

export function toggleNthTask(src: string, n: number): string {
  const lines = String(src).split("\n");
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i]!.match(TASK);
    if (!m) continue;
    if (count === n) {
      lines[i] =
        m[1] +
        "[" +
        (m[2] === " " ? "x" : " ") +
        "]" +
        lines[i]!.slice(m[0].length);
      return lines.join("\n");
    }
    count++;
  }
  return String(src);
}

export function titleFromBody(body: string, fallback = "Untitled") {
  const heading = body.match(/^\s{0,3}#{1,6}\s+(.+)$/m);
  if (heading?.[1]) return heading[1].trim().slice(0, 80);
  const line = body.split("\n").find((l) => l.trim());
  if (!line) return fallback;
  return line.replace(/^[#>*\-\s`]+/, "").slice(0, 80) || fallback;
}

export type EditorCommand =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "h1"
  | "h2"
  | "h3"
  | "quote"
  | "ul"
  | "ol"
  | "task"
  | "link"
  | "image"
  | "table"
  | "hr"
  | "codeblock";

export type EditResult = {
  next: string;
  selStart: number;
  selEnd: number;
};

function lineBounds(value: string, start: number, end: number) {
  const from = value.lastIndexOf("\n", start - 1) + 1;
  const to = value.indexOf("\n", end);
  return { from, to: to === -1 ? value.length : to };
}

function prefixLines(value: string, start: number, end: number, prefix: string): EditResult {
  const { from, to } = lineBounds(value, start, end);
  const block = value.slice(from, to);
  const lines = block.split("\n");
  const nextBlock = lines
    .map((line) => (line.startsWith(prefix) ? line : prefix + line))
    .join("\n");
  const next = value.slice(0, from) + nextBlock + value.slice(to);
  return { next, selStart: from, selEnd: from + nextBlock.length };
}

function wrap(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string,
): EditResult {
  const selected = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  const selStart = start + before.length;
  return { next, selStart, selEnd: selStart + selected.length };
}

export function applyCommand(
  value: string,
  start: number,
  end: number,
  command: EditorCommand,
): EditResult {
  switch (command) {
    case "bold":
      return wrap(value, start, end, "**", "**", "bold");
    case "italic":
      return wrap(value, start, end, "*", "*", "italic");
    case "strike":
      return wrap(value, start, end, "~~", "~~", "text");
    case "code":
      return wrap(value, start, end, "`", "`", "code");
    case "link":
      return wrap(value, start, end, "[", "](https://)", "label");
    case "image":
      return wrap(value, start, end, "![", "](https://)", "alt");
    case "h1":
      return prefixLines(value, start, end, "# ");
    case "h2":
      return prefixLines(value, start, end, "## ");
    case "h3":
      return prefixLines(value, start, end, "### ");
    case "quote":
      return prefixLines(value, start, end, "> ");
    case "ul":
      return prefixLines(value, start, end, "- ");
    case "ol":
      return prefixLines(value, start, end, "1. ");
    case "task":
      return prefixLines(value, start, end, "- [ ] ");
    case "hr": {
      const insert = `${start > 0 && value[start - 1] !== "\n" ? "\n" : ""}---\n`;
      const next = value.slice(0, start) + insert + value.slice(end);
      const caret = start + insert.length;
      return { next, selStart: caret, selEnd: caret };
    }
    case "codeblock":
      return wrap(value, start, end, "```\n", "\n```\n", "code");
    case "table": {
      const snippet =
        "\n| Column | Column |\n| --- | --- |\n|  |  |\n";
      const next = value.slice(0, start) + snippet + value.slice(end);
      const caret = start + snippet.length;
      return { next, selStart: caret, selEnd: caret };
    }
    default:
      return { next: value, selStart: start, selEnd: end };
  }
}

export const HELP_MARKDOWN = `# Cheat sheet

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

On Arch Linux (Omarchy), install from the board menu — Copy the plugin command, or grab the zip.
`;

export const WELCOME_MARKDOWN = `# Welcome to Pinmark

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

export const GROCERIES_MARKDOWN = `# Groceries

Run **before** noon.

- [x] milk
- [ ] oat flour
- [ ] black tea
- [x] lemons
- [ ] sourdough
`;

export const TODAY_MARKDOWN = `# Today

Morning pages. Keep this pinned to the editor.

- [ ] Review the draft
- [ ] Walk at four
- [x] Water the plants

> Short sentences. No performance.
`;

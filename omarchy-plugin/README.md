# Pinmark

Markdown, pinned to your Omarchy desk.

A full markdown editor that appears from the **Hide** button, with parchment
widgets you can pin *on top of* the editor. Built as an Omarchy shell plugin
for Arch Linux.

## Install (Arch / Omarchy)

```bash
omarchy plugin add https://github.com/maiosx/pinmark-omarchy.git --enable
omarchy-restart-shell
```

That registers the service (widgets + editor). For the bar icon, add the widget
from the bar customization UI, or put `{ "id": "io.github.maiosx.pinmark" }`
in a `bar.layout` section of `~/.config/omarchy/shell.json`.

### Manual copy

If you already have the files:

```bash
chmod +x install.sh
./install.sh
omarchy-restart-shell
```

`install.sh` copies the plugin into `~/.config/omarchy/plugins/io.github.maiosx.pinmark`
and reminds you to enable it.

## Remove

```bash
omarchy plugin remove io.github.maiosx.pinmark
omarchy-restart-shell
```

Notes live in `~/.local/state/omarchy/pinmark.json`; delete that file too if you
don't want them back.

No extra packages — Omarchy's shell (Quickshell/Qt) is enough.

## Use

| | |
|---|---|
| Board menu | Click the bar icon |
| New widget | **New**, or `+` in a widget header |
| Hide / show editor | **Hide** / **Show**, or right click the bar icon |
| Cheat sheet | **Help** — drops a widget listing the syntax |
| Edit in widget | Click the widget body |
| Full editor | Show the editor; pick a document in the sidebar |
| Render | Click away, or `Esc` |
| Tick a box | Click ☐ / ☑ |
| Pin on the editor | `◉` in the widget header — Overlay layer, above the editor |
| Unpin to the desk | `⊙` — Bottom layer, under normal windows |
| Move | Drag the header — across monitors too |
| Move to another monitor | `◀` / `▶` |
| Resize | Drag the corner grip |
| Colour | `●` cycles sage → sky → sand → frost → clay → moss → ink |
| Delete | `✕` — twice within 3s if the widget has text |

Hide folds **only the editor**. Widgets stay on the desk. Pinned widgets sit on
the editor; unpinned widgets live on the wallpaper.

## Markdown

Bodies are CommonMark, rendered by Qt: headings, **bold**, *italic*, `code`,
quotes, tables, lists, links.

Checklists are `- [ ]` / `- [x]`, and ticking a box in the rendered view
rewrites the markdown underneath.

The editor toolbar wraps the usual marks (bold, italic, headings, lists, tasks,
links) without round-tripping the source through the renderer.

## Storage

`~/.local/state/omarchy/pinmark.json`, written 400ms after the last edit.
Edit it with the shell stopped — the plugin owns the file while running.

## Hyprland

```
layerrule = ignorezero, pinmark-widget
layerrule = blur, pinmark-widget
layerrule = ignorezero, pinmark-pinned
layerrule = blur, pinmark-pinned
layerrule = ignorezero, pinmark-editor
```

Unpinned widgets use namespace `pinmark-widget` on the Bottom layer.
Pinned widgets use `pinmark-pinned` on Overlay (above the editor).
The editor uses `pinmark-editor` on Top.

## Development

```bash
node test.mjs
omarchy plugin validate .
omarchy-shell shell rescanPlugins
```

## License

MIT. Desktop windowing and drag math follow Omasticky (Jonas Clausen).

# Pinmark

Markdown, pinned to your desk.

A full markdown editor with parchment widgets — not sticky notes. Hide folds
the editor; widgets stay on the desk. Pin a widget and it sits *on* the editor.

This repository is the **web app**. The native **Omarchy / Arch** plugin lives
in [`omarchy-plugin/`](omarchy-plugin/) and at
[maiosx/pinmark-omarchy](https://github.com/maiosx/pinmark-omarchy).

## Pin to desk

Open a document and click **Pin to desk** in the editor header.

- On a wide desk the widget lands in the left rail, beside the editor.
- On a phone it lands on the lower part of the editor, below the toolbar.
- The pin glyph on a widget then moves it onto the editor (lower right), not
  over the title bar.

The button reads **On desk** once the document is a widget, and **Move to desk**
if that widget is currently sitting on the editor.

## Web app

```bash
npm install
npm run dev
```

Notes persist in the browser (`pinmark-v3`). Seed documents: Welcome, Today,
and Groceries.

## Arch / Omarchy

```bash
omarchy plugin add https://github.com/maiosx/pinmark-omarchy.git --enable
omarchy-restart-shell
```

Or from a checkout of this repo:

```bash
cd omarchy-plugin
chmod +x install.sh
./install.sh
omarchy-restart-shell
```

A zip of the plugin is also at [`public/pinmark-omarchy.zip`](public/pinmark-omarchy.zip).

## License

MIT. Desktop windowing and drag math follow Omasticky (Jonas Clausen).

#!/usr/bin/env bash
# Install Pinmark as an Omarchy plugin on Arch Linux, and register it as
# the handler for Markdown files.
set -euo pipefail

ID="io.github.maiosx.pinmark"
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${XDG_CONFIG_HOME:-$HOME/.config}/omarchy/plugins/${ID}"
STATE="${XDG_STATE_HOME:-$HOME/.local/state}/omarchy"
SHELL_JSON="${XDG_CONFIG_HOME:-$HOME/.config}/omarchy/shell.json"
BIN="${XDG_BIN_HOME:-$HOME/.local/bin}"
DATA="${XDG_DATA_HOME:-$HOME/.local/share}"
APP="$DATA/applications"
MIME="$DATA/mime/packages"

mkdir -p "$DEST" "$STATE" "$BIN" "$APP" "$MIME"

for f in manifest.json Service.qml Widget.qml DeskSurface.qml EditorWindow.qml Model.js LICENSE README.md; do
  if [[ ! -f "$SRC/$f" ]]; then
    echo "missing $f in $SRC" >&2
    exit 1
  fi
  cp -f "$SRC/$f" "$DEST/$f"
done

install -m755 "$SRC/pinmark-open" "$BIN/pinmark-open"

if [[ -f "$SRC/pinmark.desktop" ]]; then
  sed "s|^Exec=.*|Exec=${BIN}/pinmark-open %F|" "$SRC/pinmark.desktop" \
    | sed "s|^TryExec=.*|TryExec=${BIN}/pinmark-open|" \
    > "$APP/pinmark.desktop"
fi

if [[ -f "$SRC/pinmark-mime.xml" ]]; then
  cp -f "$SRC/pinmark-mime.xml" "$MIME/pinmark.xml"
fi

if command -v update-mime-database >/dev/null 2>&1; then
  update-mime-database "$DATA/mime" >/dev/null 2>&1 || true
fi
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APP" >/dev/null 2>&1 || true
fi
if command -v xdg-mime >/dev/null 2>&1; then
  xdg-mime default pinmark.desktop text/markdown >/dev/null 2>&1 || true
  xdg-mime default pinmark.desktop text/x-markdown >/dev/null 2>&1 || true
fi

echo "Installed Pinmark to $DEST"
echo "Markdown files open in Pinmark via $BIN/pinmark-open"
echo
echo "Enable it (pick one):"
echo
echo "  omarchy plugin add https://github.com/maiosx/pinmark-omarchy.git --enable"
echo "  omarchy-restart-shell"
echo
echo "Or add \"${ID}\" to plugins[] in:"
echo "  $SHELL_JSON"
echo "then run: omarchy-restart-shell"
echo
echo "Add the bar widget from the bar customization UI, or put"
echo "  { \"id\": \"${ID}\" }"
echo "in a bar.layout section of shell.json."
echo
echo "Put $BIN on your PATH if it is not already, so pinmark-open is found."

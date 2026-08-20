#!/usr/bin/env bash
# Install Pinmark as an Omarchy plugin on Arch Linux.
set -euo pipefail

ID="io.github.maiosx.pinmark"
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${XDG_CONFIG_HOME:-$HOME/.config}/omarchy/plugins/${ID}"
STATE="${XDG_STATE_HOME:-$HOME/.local/state}/omarchy"
SHELL_JSON="${XDG_CONFIG_HOME:-$HOME/.config}/omarchy/shell.json"

mkdir -p "$DEST" "$STATE"

for f in manifest.json Service.qml Widget.qml DeskSurface.qml EditorWindow.qml Model.js LICENSE README.md; do
  if [[ ! -f "$SRC/$f" ]]; then
    echo "missing $f in $SRC" >&2
    exit 1
  fi
  cp -f "$SRC/$f" "$DEST/$f"
done

echo "Installed Pinmark to $DEST"
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

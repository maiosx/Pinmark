import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Wayland
import Quickshell.Hyprland
import qs.Commons
import qs.Ui
import "Model.js" as Model

// Pinmark: pinnable markdown widgets on the desk, plus a full editor that
// Hide/Show folds. Unpinned widgets sit on the Bottom layer (wallpaper).
// Pinned widgets sit on Overlay, above the editor.
Item {
  id: root

  readonly property string storePath: Quickshell.env("HOME") + "/.local/state/omarchy/pinmark.json"

  readonly property var palette: ["#eef2e6", "#e7eef3", "#f3efe6", "#eceff1", "#f2ebe6", "#e8eee6", "#1c1e1b"]
  readonly property var accents: ["#8a9a7c", "#6e8ca3", "#a89880", "#8a9296", "#a88878", "#6f8468", "#c5c1b4"]

  property bool editorVisible: true
  property string activeId: ""

  // Kept so older JSON with `"alwaysOnTop": true` still pins every widget.
  property bool alwaysOnTop: false

  function toggleEditor() {
    root.editorVisible = !root.editorVisible
    saveTimer.restart()
  }

  // Alias used by the bar widget's older "hidden" reading.
  readonly property bool hidden: !root.editorVisible
  function toggleHidden() { root.toggleEditor() }

  property var notes: Object.create(null)
  property var noteIds: []
  property bool loaded: false
  property int seq: 0

  function noteData(id) {
    var key = String(id)
    return Object.prototype.hasOwnProperty.call(root.notes, key) ? root.notes[key] : null
  }

  function ink(paper) {
    var c = Qt.color(paper)
    return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) > 0.55 ? "#1a1c18" : "#eceae4"
  }

  function openLink(url) {
    if (!/^(https?|mailto|file):/i.test(String(url))) return
    Quickshell.execDetached(["xdg-open", String(url)])
  }

  property int placement: 0
  property int topStack: 0

  readonly property int screenCount: Quickshell.screens.length
  onScreenCountChanged: root.placement++

  property string dragId: ""
  property url dragImage: ""
  property int dragGx: 0
  property int dragGy: 0
  property int dragW: 0
  property int dragH: 0
  property var dragGrab: null

  function beginDrag(id, item, w, h) {
    root.dragId = String(id)
    root.dragW = w
    root.dragH = h
    root.dragImage = ""
    root.dragGrab = null
    if (!item || typeof item.grabToImage !== "function") return
    item.grabToImage(function (result) {
      if (root.dragId !== String(id) || !result || !result.url) return
      root.dragGrab = result
      root.dragImage = result.url
    })
  }

  function endDrag() {
    root.dragId = ""
    root.dragImage = ""
    root.dragGrab = null
  }

  function screenExists(name) {
    if (!name) return false
    var list = Quickshell.screens
    for (var i = 0; i < list.length; i++) if (list[i].name === String(name)) return true
    return false
  }

  function idsForScreen(scr, placementTick, ids, pinnedWanted) {
    if (!scr) return []
    var fallback = root.screenFor("")
    var isFallback = fallback && fallback.name === scr.name
    var list = ids || root.noteIds
    var out = []
    for (var i = 0; i < list.length; i++) {
      var note = root.noteData(list[i])
      if (!note) continue
      if (note.desk === false) continue
      var isPinned = note.pinned === true || (root.alwaysOnTop && note.pinned !== false)
      if (!!isPinned !== !!pinnedWanted) continue
      var name = String(note.screen || "")
      if (name === scr.name) out.push(note.id)
      else if (isFallback && !root.screenExists(name)) out.push(note.id)
    }
    return out
  }

  function screenFor(name) {
    var list = Quickshell.screens
    for (var i = 0; i < list.length; i++) if (list[i].name === String(name)) return list[i]
    return list.length > 0 ? list[0] : null
  }

  function focusedScreenName() {
    var monitor = Hyprland.focusedMonitor
    if (monitor && monitor.name) return String(monitor.name)
    var s = root.screenFor("")
    return s ? s.name : ""
  }

  function addNote(nearId, seed) {
    root.seq += 1
    var id = "n" + root.seq
    var base = nearId ? root.noteData(nearId) : null
    var s = seed || ({})
    var pinned = s.pinned === true
    root.notes[id] = {
      id: id,
      text: String(s.text || ""),
      x: s.x !== undefined ? s.x : (base ? base.x + 28 : 80),
      y: s.y !== undefined ? s.y : (base ? base.y + 28 : 80),
      w: s.w || (base ? base.w : 260),
      h: s.h || (base ? base.h : 240),
      color: s.color !== undefined ? s.color : (base ? base.color : 0),
      screen: s.screen || (base ? base.screen : root.focusedScreenName()),
      pinned: pinned,
      desk: s.desk !== false
    }
    root.noteIds = root.noteIds.concat([id])
    root.activeId = id
    if (s.focus !== false) root.editorVisible = true
    root.placement++
    saveTimer.restart()
    return id
  }

  readonly property string helpText: [
    "# Cheat sheet",
    "",
    "The **Hide** button folds the editor. Widgets stay on the desk.",
    "",
    "- [ ] tick me",
    "- [x] done",
    "",
    "1. numbered lists",
    "2. work too",
    "",
    "`code`, *italic*, **bold**, [links](https://omarchy.org)",
    "",
    "> Pin a widget so it sits on the editor.",
    "",
    "Header: ● colour · ◉ pin · ◀ ▶ screen · + new · ✕ delete.",
    "Drag the header to move, the corner grip to resize."
  ].join("\n")

  readonly property string welcomeText: [
    "# Welcome to Pinmark",
    "",
    "A full markdown editor that lives on your desk. Notes are **pinnable widgets** — not sticky paper — and they float over the editor when you pin them.",
    "",
    "## Write",
    "",
    "Use the toolbar or shortcuts:",
    "",
    "- **Ctrl+B** bold",
    "- **Ctrl+I** italic",
    "- **Ctrl+K** link",
    "",
    "## Pin",
    "",
    "1. Open a document in this editor",
    "2. Click **◉** on the widget header",
    "3. Drag it onto the editor",
    "",
    "## Checklists",
    "",
    "- [x] Open the bar menu",
    "- [ ] Pin a widget onto the editor",
    "- [ ] Hide the editor, then show it again",
    "",
    "> Widgets keep their place. Hide only folds the editor away."
  ].join("\n")

  readonly property string groceriesText: [
    "# Groceries",
    "",
    "Run **before** noon.",
    "",
    "- [x] milk",
    "- [ ] oat flour",
    "- [ ] black tea",
    "- [x] lemons",
    "- [ ] sourdough"
  ].join("\n")

  readonly property string todayText: [
    "# Today",
    "",
    "Morning pages. Keep this pinned to the editor.",
    "",
    "- [ ] Review the draft",
    "- [ ] Walk at four",
    "- [x] Water the plants",
    "",
    "> Short sentences. No performance."
  ].join("\n")

  function addHelpNote() {
    return root.addNote(null, { text: root.helpText, w: 340, h: 380, color: 3, pinned: true })
  }

  function removeNote(id) {
    var key = String(id)
    if (!root.noteData(key)) return
    delete root.notes[key]
    root.noteIds = root.noteIds.filter(function (n) { return n !== key })
    if (root.activeId === key) root.activeId = root.noteIds.length ? root.noteIds[0] : ""
    if (root.noteIds.length === 0) root.addNote(null, { text: "", pinned: false })
    else {
      root.placement++
      saveTimer.restart()
    }
  }

  function updateNote(id, patch) {
    var note = root.noteData(id)
    if (!note) return
    var moved = false
    var layerChanged = false
    for (var key in patch) {
      if (key === "screen" && String(note[key]) !== String(patch[key])) moved = true
      if (key === "pinned" && !!note[key] !== !!patch[key]) layerChanged = true
      if (key === "desk" && !!note[key] !== !!patch[key]) layerChanged = true
      note[key] = patch[key]
    }
    if (moved || layerChanged) root.placement++
    saveTimer.restart()
  }

  function togglePin(id) {
    var note = root.noteData(id)
    if (!note) return
    note.pinned = !note.pinned
    root.placement++
    saveTimer.restart()
  }

  function pinActive() {
    var id = root.activeId
    var note = root.noteData(id)
    if (!note) return
    if (note.desk !== false && note.pinned !== true) return
    var y = 80
    for (var i = 0; i < root.noteIds.length; i++) {
      var n = root.noteData(root.noteIds[i])
      if (!n || n.id === id || n.desk === false || n.pinned === true) continue
      if (Math.abs((n.x || 0) - 20) < 140)
        y = Math.max(y, (n.y || 0) + (n.h || 240) + 12)
    }
    root.updateNote(id, { desk: true, pinned: false, x: 20, y: y })
  }

  function setActive(id) {
    if (!root.noteData(id)) return
    root.activeId = String(id)
    root.editorVisible = true
  }

  function seedDefaults() {
    root.addNote(null, { text: root.welcomeText, w: 320, h: 360, color: 2, pinned: false, desk: false, x: 24, y: 72, focus: false })
    root.addNote(null, { text: root.groceriesText, w: 236, h: 280, color: 0, pinned: false, x: 20, y: 80, focus: false })
    root.addNote(null, { text: root.todayText, w: 268, h: 236, color: 1, pinned: true, x: 880, y: 420, focus: false })
    if (root.noteIds.length) root.activeId = root.noteIds[0]
  }

  function load(raw) {
    if (root.loaded) return
    root.loaded = true

    var parsed = null
    try { parsed = JSON.parse(raw) } catch (e) { parsed = null }
    if (parsed && parsed.alwaysOnTop === true) root.alwaysOnTop = true
    if (parsed && parsed.editorVisible === false) root.editorVisible = false
    if (parsed && parsed.hidden === true && parsed.editorVisible === undefined) root.editorVisible = false

    var fallbackScreen = root.screenFor("")
    var list = (parsed && Array.isArray(parsed.notes)) ? parsed.notes : []
    var map = Object.create(null)
    var ids = []
    for (var i = 0; i < list.length; i++) {
      var n = list[i] || {}
      var id = String(n.id || ("n" + (i + 1)))
      if (Object.prototype.hasOwnProperty.call(map, id)) continue
      map[id] = {
        id: id,
        text: String(n.text || ""),
        x: Math.max(0, Math.round(Number(n.x) || 0)),
        y: Math.max(0, Math.round(Number(n.y) || 0)),
        w: Math.max(160, Math.round(Number(n.w) || 260)),
        h: Math.max(120, Math.round(Number(n.h) || 240)),
        color: Math.max(0, Math.min(root.palette.length - 1, Math.round(Number(n.color) || 0))),
        screen: String(n.screen || "") || (fallbackScreen ? fallbackScreen.name : ""),
        pinned: n.pinned === true,
        desk: n.desk !== false
      }
      ids.push(id)
      var num = parseInt(id.replace(/^n/, ""), 10)
      if (isFinite(num) && num > root.seq) root.seq = num
    }
    for (var e = 0; e < root.noteIds.length; e++) {
      var pending = root.noteIds[e]
      if (Object.prototype.hasOwnProperty.call(map, pending)) continue
      map[pending] = root.notes[pending]
      ids.push(pending)
    }
    root.notes = map
    root.noteIds = ids
    if (parsed && parsed.activeId && Object.prototype.hasOwnProperty.call(map, parsed.activeId))
      root.activeId = String(parsed.activeId)
    else if (ids.length) root.activeId = ids[0]
    if (ids.length === 0) root.seedDefaults()
  }

  function flush() {
    if (!root.loaded) return
    var out = []
    for (var i = 0; i < root.noteIds.length; i++) {
      var n = root.notes[root.noteIds[i]]
      if (n) out.push(n)
    }
    storeFile.setText(JSON.stringify({
      version: 2,
      alwaysOnTop: root.alwaysOnTop,
      editorVisible: root.editorVisible,
      activeId: root.activeId,
      notes: out
    }, null, 2) + "\n")
  }

  Timer {
    id: saveTimer
    interval: 400
    onTriggered: root.flush()
  }

  Component.onDestruction: root.flush()

  FileView {
    id: storeFile
    path: root.storePath
    watchChanges: false
    atomicWrites: true
    printErrors: false
    onLoaded: root.load(text())
    onLoadFailed: root.load("")
    onSaveFailed: function (error) {
      console.warn("pinmark: could not write " + root.storePath + ": " + error)
    }
  }

  Process {
    command: ["mkdir", "-p", Quickshell.env("HOME") + "/.local/state/omarchy"]
    running: true
  }

  Component.onCompleted: Qt.callLater(function () { storeFile.reload() })

  Variants {
    model: Quickshell.screens
    DeskSurface {
      host: root
      pinnedLayer: false
    }
  }

  Variants {
    model: Quickshell.screens
    DeskSurface {
      host: root
      pinnedLayer: true
    }
  }

  Variants {
    model: Quickshell.screens
    EditorWindow {
      host: root
    }
  }
}

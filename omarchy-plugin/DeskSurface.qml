import QtQuick
import Quickshell
import Quickshell.Wayland
import qs.Commons
import qs.Ui
import "Model.js" as Model

PanelWindow {
  id: surface
  required property var modelData
  required property var host
  required property bool pinnedLayer

  readonly property var noteIds: host.idsForScreen(surface.modelData, host.placement, host.noteIds, surface.pinnedLayer)

  property var cards: []

  function addCard(item) {
    var next = surface.cards.slice()
    next.push(item)
    surface.cards = next
  }

  function dropCard(item) {
    surface.cards = surface.cards.filter(function (c) { return c !== item })
  }

  screen: modelData
  visible: !remapGuard.remapping
  color: "transparent"
  anchors { top: true; bottom: true; left: true; right: true }

  ScreenMoveRemap {
    id: remapGuard
    window: surface
  }
  exclusionMode: ExclusionMode.Normal
  exclusiveZone: 0

  WlrLayershell.namespace: surface.pinnedLayer ? "pinmark-pinned" : "pinmark-widget"
  WlrLayershell.layer: surface.pinnedLayer ? WlrLayer.Overlay : WlrLayer.Bottom
  WlrLayershell.keyboardFocus: WlrKeyboardFocus.OnDemand

  Instantiator {
    id: maskParts
    model: surface.cards
    delegate: Region {
      required property var modelData
      x: modelData.x
      y: modelData.y
      width: modelData.width
      height: modelData.height
    }
    onObjectAdded: surface.rebuildMask()
    onObjectRemoved: surface.rebuildMask()
  }

  property var maskRegions: []
  function rebuildMask() {
    var parts = []
    for (var i = 0; i < maskParts.count; i++) parts.push(maskParts.objectAt(i))
    surface.maskRegions = parts
  }

  mask: Region { regions: surface.maskRegions }

  Image {
    visible: host.dragId !== "" && surface.noteIds.indexOf(host.dragId) === -1
    source: host.dragImage
    cache: false
    x: host.dragGx - (surface.screen ? surface.screen.x : 0)
    y: host.dragGy - (surface.screen ? surface.screen.y : 0)
    width: host.dragW
    height: host.dragH
    z: host.topStack + 1
  }

  Repeater {
    model: surface.noteIds

    Item {
      id: win
      required property var modelData

      anchors.fill: parent
      z: win.stack

      property int stack: 0
      function raise() { win.stack = ++host.topStack }

      Component.onDestruction: {
        if (host.dragId === win.modelData) host.endDrag()
        surface.dropCard(card)
      }

      readonly property var note: host.noteData(win.modelData)
      property int nx: 80
      property int ny: 80
      property int nw: 260
      property int nh: 240
      property int ci: 0
      property bool pinned: false
      property string nscreen: ""
      property int pointerGx: 0
      property int pointerGy: 0

      function trackPointer(mx, my) {
        win.pointerGx = (surface.screen ? surface.screen.x : 0) + win.nx + mx
        win.pointerGy = (surface.screen ? surface.screen.y : 0) + win.ny + my
      }
      function dragTo(lx, ly) {
        var sx = surface.screen ? surface.screen.x : 0
        var sy = surface.screen ? surface.screen.y : 0
        var b = Model.bounds(Quickshell.screens)
        var insetW = surface.screen ? surface.screen.width - win.width : 0
        var insetH = surface.screen ? surface.screen.height - win.height : 0
        win.nx = Math.max(b.x1, Math.min(lx + sx, b.x2 - insetW - win.nw)) - sx
        win.ny = Math.max(b.y1, Math.min(ly + sy, b.y2 - insetH - win.nh)) - sy
      }
      function publishDrag() {
        host.dragGx = (surface.screen ? surface.screen.x : 0) + win.nx
        host.dragGy = (surface.screen ? surface.screen.y : 0) + win.ny
      }
      function settle() {
        host.endDrag()
        var from = surface.screen
        if (!from) return
        var insetW = from.width - win.width
        var insetH = from.height - win.height
        var to = Model.screenForDrop(Quickshell.screens, win.pointerGx, win.pointerGy, insetW, insetH) || from
        var placed = Model.relocate(win.nx, win.ny, win.nw, win.nh,
          { x: from.x, y: from.y },
          {
            x: to.x,
            y: to.y,
            usableW: to.width - insetW,
            usableH: to.height - insetH
          })
        win.nx = placed.x
        win.ny = placed.y
        if (to.name !== from.name) win.nscreen = to.name
      }

      readonly property var leftScreen: Model.adjacentScreen(Quickshell.screens, surface.screen, -1)
      readonly property var rightScreen: Model.adjacentScreen(Quickshell.screens, surface.screen, 1)

      function moveToScreen(to) {
        var from = surface.screen
        if (!from || !to) return
        var placed = Model.clampOnto(win.nx, win.ny, win.nw, win.nh,
          to.width - (from.width - win.width),
          to.height - (from.height - win.height))
        win.nx = placed.x
        win.ny = placed.y
        win.nscreen = to.name
      }

      property string source: ""
      property bool editing: false
      property int seenTick: -1

      function syncText() {
        var n = host.noteData(win.modelData)
        if (!n) return
        if (host.contentTick === win.seenTick && n.text === win.source) return
        win.seenTick = host.contentTick
        if (win.editing && body.text === n.text) {
          win.source = n.text
          return
        }
        if (win.editing) return
        if (n.text === win.source && body.text === n.text) return
        win.source = n.text
        if (body.text !== n.text) body.text = n.text
      }

      Connections {
        target: host
        function onContentTickChanged() { win.syncText() }
      }
      function followLink(link) {
        var s = String(link)
        if (s.indexOf("toggle:") !== 0) {
          host.openLink(s)
          return
        }
        var next = Model.toggleTask(win.source, parseInt(s.slice(7), 10))
        if (next === win.source) return
        win.source = next
        body.text = next
        host.updateNote(win.modelData, { text: next })
      }

      readonly property color paper: host.palette[Math.min(ci, host.palette.length - 1)]
      readonly property color accent: host.accents[Math.min(ci, host.accents.length - 1)]
      readonly property color pen: host.ink(paper)
      readonly property bool dark: pen === Qt.color("#eceae4")
      readonly property color headerPaper: dark ? Qt.lighter(paper, 1.25) : Qt.darker(paper, 1.04)

      function clampX(v) { return Math.max(0, Math.min(v, Math.max(0, win.width - win.nw))) }
      function clampY(v) { return Math.max(0, Math.min(v, Math.max(0, win.height - win.nh))) }

      Component.onCompleted: {
        surface.addCard(card)
        if (!note) return
        nx = note.x
        ny = note.y
        nw = note.w
        nh = note.h
        ci = note.color
        pinned = note.pinned === true
        nscreen = note.screen
        win.source = note.text
        body.text = note.text
        win.seenTick = host.contentTick
      }
      onEditingChanged: if (editing) body.forceActiveFocus()
      onNxChanged: host.updateNote(win.modelData, { x: nx })
      onNyChanged: host.updateNote(win.modelData, { y: ny })
      onNwChanged: host.updateNote(win.modelData, { w: nw })
      onNhChanged: host.updateNote(win.modelData, { h: nh })
      onCiChanged: host.updateNote(win.modelData, { color: ci })
      onNscreenChanged: host.updateNote(win.modelData, { screen: nscreen })

      function rescueOffscreen() {
        if (win.width <= 0 || win.height <= 0) return
        if (win.nx + win.nw > 0 && win.ny + win.nh > 0
          && win.nx < win.width && win.ny < win.height) return
        win.nx = win.clampX(win.nx)
        win.ny = win.clampY(win.ny)
      }
      onWidthChanged: win.rescueOffscreen()
      onHeightChanged: win.rescueOffscreen()

      Rectangle {
        id: card
        x: win.nx
        y: win.ny
        width: win.nw
        height: win.nh
        color: win.paper
        radius: Style.cornerRadius
        border.width: 1
        border.color: win.dark ? Qt.lighter(win.paper, 1.6) : Qt.darker(win.paper, 1.18)

        Rectangle {
          anchors { top: parent.top; bottom: parent.bottom; left: parent.left }
          width: 4
          radius: 2
          color: win.accent
        }

        Rectangle {
          id: header
          anchors { top: parent.top; left: parent.left; right: parent.right; leftMargin: 4 }
          height: 32
          radius: Style.cornerRadius
          color: win.headerPaper

          Rectangle {
            anchors { left: parent.left; right: parent.right; bottom: parent.bottom }
            height: Math.max(1, Style.cornerRadius)
            color: parent.color
          }

          Text {
            id: headerTitle
            anchors {
              left: parent.left
              right: parent.right
              verticalCenter: parent.verticalCenter
              leftMargin: 10
              rightMargin: 80
            }
            text: Model.titleFromBody(win.source, "Untitled")
            elide: Text.ElideRight
            color: win.pen
            font.family: Style.font.family
            font.pixelSize: Style.font.caption
            font.bold: true
          }

          Item {
            id: dragStrip
            z: 5
            anchors { fill: parent; rightMargin: 76 }

            DragHandler {
              id: moveHandler
              target: null
              acceptedButtons: Qt.LeftButton
              grabPermissions: PointerHandler.CanTakeOverFromAnything
              property real startX: 0
              property real startY: 0
              onActiveChanged: {
                if (active) {
                  startX = win.nx
                  startY = win.ny
                  win.raise()
                  host.setActive(win.modelData)
                  if (host.dragId !== win.modelData)
                    host.beginDrag(win.modelData, card, win.nw, win.nh)
                } else {
                  win.settle()
                }
              }
              onTranslationChanged: {
                if (!active) return
                win.dragTo(Math.round(startX + translation.x), Math.round(startY + translation.y))
                win.pointerGx = (surface.screen ? surface.screen.x : 0) + win.nx + 24
                win.pointerGy = (surface.screen ? surface.screen.y : 0) + win.ny + 12
                win.publishDrag()
              }
            }

            HoverHandler {
              cursorShape: moveHandler.active ? Qt.ClosedHandCursor : Qt.OpenHandCursor
            }
          }

          Row {
            z: 10
            anchors { right: parent.right; verticalCenter: parent.verticalCenter; rightMargin: 4 }
            spacing: 4

            component HeaderButton: Rectangle {
              property alias glyph: label.text
              property color glyphColor: win.pen
              signal activated
              width: Math.max(56, label.implicitWidth + 18)
              height: 26
              radius: 4
              color: hover.containsMouse ? Qt.rgba(win.pen.r, win.pen.g, win.pen.b, 0.14) : Qt.rgba(win.pen.r, win.pen.g, win.pen.b, 0.06)
              border.width: 1
              border.color: Qt.rgba(win.pen.r, win.pen.g, win.pen.b, 0.18)
              Text {
                id: label
                anchors.centerIn: parent
                color: parent.glyphColor
                font.family: Style.font.family
                font.pixelSize: Style.font.caption
              }
              MouseArea {
                id: hover
                anchors.fill: parent
                hoverEnabled: true
                preventStealing: true
                propagateComposedEvents: false
                cursorShape: Qt.PointingHandCursor
                onPressed: function (m) {
                  m.accepted = true
                  parent.activated()
                }
              }
            }

            HeaderButton {
              glyph: "Close"
              glyphColor: win.pen
              onActivated: host.closeWidget(win.modelData)
            }
          }
        }

        Flickable {
          id: flick
          anchors {
            top: header.bottom
            left: parent.left
            right: parent.right
            bottom: parent.bottom
            leftMargin: 12
            rightMargin: 10
            topMargin: 4
            bottomMargin: 10
          }
          clip: true
          contentWidth: width
          contentHeight: win.editing ? body.implicitHeight : Math.max(rendered.implicitHeight, 20)
          interactive: contentHeight > height
          boundsBehavior: Flickable.StopAtBounds

          function ensureVisible(r) {
            if (contentY >= r.y) contentY = r.y
            else if (contentY + height <= r.y + r.height) contentY = r.y + r.height - height
          }

          Text {
            id: rendered
            visible: !win.editing
            width: flick.width
            wrapMode: Text.Wrap
            textFormat: Text.MarkdownText
            text: win.editing ? "" : Model.renderMarkdown(win.source)
            color: win.pen
            linkColor: win.dark ? "#8aa4b8" : "#3d5a73"
            font.family: Style.font.family
            font.pixelSize: Style.font.subtitle
          }

          MouseArea {
            width: flick.width
            height: Math.max(flick.height, flick.contentHeight)
            visible: !win.editing
            hoverEnabled: true
            cursorShape: rendered.linkAt(mouseX, mouseY) ? Qt.PointingHandCursor : Qt.IBeamCursor
            onClicked: function (m) {
              win.raise()
              host.setActive(win.modelData)
              var link = rendered.linkAt(m.x, m.y)
              if (link) win.followLink(link)
              else win.editing = true
            }
          }

          Text {
            visible: !win.editing && win.source.length === 0
            text: "Take a note…"
            color: Qt.rgba(win.pen.r, win.pen.g, win.pen.b, 0.4)
            font.family: Style.font.family
            font.pixelSize: Style.font.subtitle
          }

          TextEdit {
            id: body
            visible: win.editing
            width: flick.width
            wrapMode: TextEdit.Wrap
            selectByMouse: true
            persistentSelection: true
            color: win.pen
            selectionColor: Qt.rgba(win.pen.r, win.pen.g, win.pen.b, 0.25)
            selectedTextColor: win.pen
            font.family: Style.font.family
            font.pixelSize: Style.font.subtitle
            onTextChanged: {
              if (text === win.source) {
                var n = host.noteData(win.modelData)
                if (n && n.text === text) return
              }
              win.source = text
              host.updateNote(win.modelData, { text: text })
            }
            onCursorRectangleChanged: if (win.editing) flick.ensureVisible(cursorRectangle)
            onActiveFocusChanged: if (!activeFocus) win.editing = false
            Keys.onEscapePressed: win.editing = false
          }
        }

        MouseArea {
          anchors { right: parent.right; bottom: parent.bottom }
          width: 16
          height: 16
          cursorShape: Qt.SizeFDiagCursor
          property real ox: 0
          property real oy: 0
          onPressed: function (m) { ox = m.x; oy = m.y }
          onPositionChanged: function (m) {
            if (!pressed) return
            win.nw = Math.max(180, Math.min(win.width - win.nx, Math.round(win.nw + m.x - ox)))
            win.nh = Math.max(120, Math.min(win.height - win.ny, Math.round(win.nh + m.x - oy)))
          }

          Repeater {
            model: [4, 8, 12]
            Rectangle {
              required property int modelData
              width: modelData * 1.1
              height: 1
              color: Qt.rgba(win.pen.r, win.pen.g, win.pen.b, 0.35)
              x: parent.width - 1 - width / 2 - modelData / 2
              y: parent.height - 1 - modelData / 2
              rotation: -45
            }
          }
        }
      }
    }
  }
}

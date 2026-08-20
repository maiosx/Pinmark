import QtQuick
import QtQuick.Dialogs
import Quickshell
import Quickshell.Wayland
import Quickshell.Hyprland
import qs.Commons
import qs.Ui
import "Model.js" as Model

PanelWindow {
  id: editor
  required property var modelData
  required property var host

  readonly property bool isFocusedScreen: {
    var mon = Hyprland.focusedMonitor
    if (mon && mon.name) return String(mon.name) === String(modelData.name)
    var first = Quickshell.screens.length ? Quickshell.screens[0] : null
    return first && first.name === modelData.name
  }

  screen: modelData
  visible: host.editorVisible && editor.isFocusedScreen && !remapGuard.remapping
  color: "transparent"
  anchors { top: true; bottom: true; left: true; right: true }

  ScreenMoveRemap {
    id: remapGuard
    window: editor
  }
  exclusionMode: ExclusionMode.Normal
  exclusiveZone: 0

  WlrLayershell.namespace: "pinmark-editor"
  WlrLayershell.layer: WlrLayer.Top
  WlrLayershell.keyboardFocus: WlrKeyboardFocus.OnDemand

  mask: Region {
    x: frame.x
    y: frame.y
    width: frame.width
    height: frame.height
  }

  readonly property var active: host.noteData(host.activeId)
  property string mode: "split"
  property bool sidebarOpen: true
  property bool fullscreen: false
  property string syncedId: ""

  function syncBody() {
    var next = editor.active ? editor.active.text : ""
    if (body.text !== next) body.text = next
    editor.syncedId = host.activeId
  }

  onVisibleChanged: if (visible) syncBody()

  Connections {
    target: host
    function onActiveIdChanged() { editor.syncBody() }
    function onContentTickChanged() {
      if (body.activeFocus) return
      editor.syncBody()
    }
  }

  function apply(cmd) {
    if (!active) return
    var s = body.selectionStart
    var e = body.selectionEnd
    var r = Model.applyCommand(body.text, s, e, cmd)
    body.text = r.next
    host.updateNote(host.activeId, { text: r.next })
    body.forceActiveFocus()
    body.select(r.selStart, r.selEnd)
  }

  function openSave() {
    var n = editor.active
    var name = n ? Model.suggestedFileName(n.text) : "untitled.md"
    saveDialog.selectedFile = "file://" + Quickshell.env("HOME") + "/Documents/" + name
    saveDialog.open()
  }

  FileDialog {
    id: saveDialog
    title: "Save markdown"
    fileMode: FileDialog.SaveFile
    nameFilters: ["Markdown files (*.md)"]
    defaultSuffix: "md"
    onAccepted: host.saveNoteTo(selectedFile)
  }

  Rectangle {
    id: frame
    anchors {
      fill: parent
      leftMargin: editor.fullscreen ? 0 : (editor.width >= 1024 ? 300 : Math.max(16, Math.min(48, editor.width * 0.04)))
      rightMargin: editor.fullscreen ? 0 : Math.max(16, Math.min(48, editor.width * 0.04))
      topMargin: editor.fullscreen ? 0 : 10
      bottomMargin: editor.fullscreen ? 0 : Math.max(24, editor.height * 0.06)
    }
    color: "#1c1e1b"
    radius: 0
    border.width: 1
    border.color: Qt.rgba(0.93, 0.92, 0.89, 0.12)

    Rectangle {
      id: titlebar
      anchors { top: parent.top; left: parent.left; right: parent.right }
      height: 44
      color: "#141613"
      radius: 0

      Text {
        anchors { left: parent.left; leftMargin: 16; verticalCenter: parent.verticalCenter }
        text: "Pinmark"
        color: "#eceae4"
        font.family: Style.font.family
        font.pixelSize: Style.font.title
        font.bold: true
      }

      Row {
        anchors { right: parent.right; rightMargin: 10; verticalCenter: parent.verticalCenter }
        spacing: 6

        Repeater {
          model: [
            { id: "write", label: "Write" },
            { id: "split", label: "Split" },
            { id: "preview", label: "Preview" }
          ]
          Rectangle {
            required property var modelData
            width: modeLabel.implicitWidth + 16
            height: 26
            radius: 6
            color: editor.mode === modelData.id ? Qt.rgba(0.93, 0.92, 0.89, 0.12) : "transparent"
            Text {
              id: modeLabel
              anchors.centerIn: parent
              text: modelData.label
              color: editor.mode === modelData.id ? "#eceae4" : "#9a9a90"
              font.family: Style.font.family
              font.pixelSize: Style.font.caption
            }
            MouseArea {
              anchors.fill: parent
              cursorShape: Qt.PointingHandCursor
              onClicked: editor.mode = modelData.id
            }
          }
        }

        Rectangle {
          width: pinLabel.implicitWidth + 18
          height: 26
          radius: 6
          color: "transparent"
          border.width: 1
          border.color: Qt.rgba(0.93, 0.92, 0.89, 0.18)
          Text {
            id: pinLabel
            anchors.centerIn: parent
            text: {
              var n = editor.active
              if (n && n.desk !== false && n.pinned !== true) return "On desk"
              if (n && n.pinned) return "Move to desk"
              return "Pin to desk"
            }
            color: "#eceae4"
            font.family: Style.font.family
            font.pixelSize: Style.font.caption
          }
          MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            onClicked: host.pinActive()
          }
        }

        Rectangle {
          width: delLabel.implicitWidth + 18
          height: 26
          radius: 6
          color: "transparent"
          border.width: 1
          border.color: Qt.rgba(0.93, 0.92, 0.89, 0.18)
          Text {
            id: delLabel
            anchors.centerIn: parent
            text: "Delete"
            color: "#c45c4a"
            font.family: Style.font.family
            font.pixelSize: Style.font.caption
          }
          MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            onClicked: if (host.activeId) host.removeNote(host.activeId)
          }
        }

        Rectangle {
          width: saveLabel.implicitWidth + 18
          height: 26
          radius: 6
          color: "transparent"
          border.width: 1
          border.color: Qt.rgba(0.93, 0.92, 0.89, 0.18)
          Text {
            id: saveLabel
            anchors.centerIn: parent
            text: "Save"
            color: "#eceae4"
            font.family: Style.font.family
            font.pixelSize: Style.font.caption
          }
          MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            onClicked: editor.openSave()
          }
        }

        Rectangle {
          width: fullLabel.implicitWidth + 18
          height: 26
          radius: 6
          color: editor.fullscreen ? Qt.rgba(0.93, 0.92, 0.89, 0.12) : "transparent"
          border.width: 1
          border.color: Qt.rgba(0.93, 0.92, 0.89, 0.18)
          Text {
            id: fullLabel
            anchors.centerIn: parent
            text: editor.fullscreen ? "Exit full" : "Fullscreen"
            color: "#eceae4"
            font.family: Style.font.family
            font.pixelSize: Style.font.caption
          }
          MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            onClicked: editor.fullscreen = !editor.fullscreen
          }
        }

        Rectangle {
          width: hideLabel.implicitWidth + 18
          height: 26
          radius: 6
          color: "transparent"
          border.width: 1
          border.color: Qt.rgba(0.93, 0.92, 0.89, 0.18)
          Text {
            id: hideLabel
            anchors.centerIn: parent
            text: "Hide"
            color: "#eceae4"
            font.family: Style.font.family
            font.pixelSize: Style.font.caption
          }
          MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            onClicked: {
              editor.fullscreen = false
              host.toggleEditor()
            }
          }
        }
      }
    }

    Row {
      id: toolbar
      anchors { top: titlebar.bottom; left: parent.left; right: parent.right; leftMargin: editor.sidebarOpen ? 220 : 12; rightMargin: 12 }
      height: 36
      spacing: 4

      Repeater {
        model: [
          { cmd: "bold", glyph: "B" },
          { cmd: "italic", glyph: "I" },
          { cmd: "h1", glyph: "H1" },
          { cmd: "h2", glyph: "H2" },
          { cmd: "quote", glyph: "“" },
          { cmd: "ul", glyph: "•" },
          { cmd: "task", glyph: "☑" },
          { cmd: "link", glyph: "↗" }
        ]
        Rectangle {
          required property var modelData
          width: Math.max(28, toolGlyph.implicitWidth + 12)
          height: 26
          radius: 5
          color: toolHover.containsMouse ? Qt.rgba(0.93, 0.92, 0.89, 0.1) : "transparent"
          Text {
            id: toolGlyph
            anchors.centerIn: parent
            text: modelData.glyph
            color: "#c5c1b4"
            font.family: Style.font.family
            font.pixelSize: Style.font.body
            font.bold: modelData.cmd === "bold"
            font.italic: modelData.cmd === "italic"
          }
          MouseArea {
            id: toolHover
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: editor.apply(modelData.cmd)
          }
        }
      }
    }

    Rectangle {
      id: sidebar
      visible: editor.sidebarOpen && frame.width > 640
      anchors { top: titlebar.bottom; bottom: parent.bottom; left: parent.left }
      width: 208
      color: "#141613"

      Rectangle {
        anchors.right: parent.right
        width: 1
        height: parent.height
        color: Qt.rgba(0.93, 0.92, 0.89, 0.08)
      }

      Column {
        anchors { fill: parent; margins: 10 }
        spacing: 6

        Rectangle {
          width: parent.width
          height: 28
          radius: 6
          color: Qt.rgba(0.93, 0.92, 0.89, 0.08)
          Text {
            anchors.centerIn: parent
            text: "New document"
            color: "#eceae4"
            font.family: Style.font.family
            font.pixelSize: Style.font.caption
          }
          MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            onClicked: host.addNote(null, { text: "# Untitled\n\n", pinned: false })
          }
        }

        Repeater {
          model: host.noteIds
          Rectangle {
            required property var modelData
            width: sidebar.width - 20
            height: 44
            radius: 6
            color: host.activeId === modelData ? Qt.rgba(0.93, 0.92, 0.89, 0.1) : "transparent"
            readonly property var note: host.noteData(modelData)
            Column {
              anchors { left: parent.left; right: parent.right; verticalCenter: parent.verticalCenter; leftMargin: 8; rightMargin: 8 }
              spacing: 2
              Text {
                width: parent.width
                text: {
                  host.contentTick
                  var n = host.noteData(modelData)
                  return n ? Model.titleFromBody(n.text, "Untitled") : "Untitled"
                }
                elide: Text.ElideRight
                color: "#eceae4"
                font.family: Style.font.family
                font.pixelSize: Style.font.body
              }
              Text {
                text: {
                  host.contentTick
                  var n = host.noteData(modelData)
                  if (!n) return ""
                  if (n.desk === false) return "In editor"
                  return n.pinned ? "Pinned widget" : "Desk widget"
                }
                color: "#6e6e66"
                font.family: Style.font.family
                font.pixelSize: Style.font.caption
              }
            }
            MouseArea {
              anchors.fill: parent
              cursorShape: Qt.PointingHandCursor
              onClicked: host.setActive(modelData)
            }
          }
        }
      }
    }

    Item {
      id: work
      anchors {
        top: toolbar.bottom
        left: parent.left
        right: parent.right
        bottom: parent.bottom
        leftMargin: sidebar.visible ? 220 : 16
        rightMargin: 16
        bottomMargin: 16
      }

      readonly property bool showWrite: editor.mode !== "preview"
      readonly property bool showPreview: editor.mode !== "write"
      readonly property int gap: 12
      readonly property int paneW: {
        if (showWrite && showPreview) return Math.floor((width - gap) / 2)
        return width
      }

      Rectangle {
        visible: work.showWrite
        width: work.paneW
        height: parent.height
        color: "#141613"
        radius: 8
        border.width: 1
        border.color: Qt.rgba(0.93, 0.92, 0.89, 0.08)

        Flickable {
          id: writeFlick
          anchors.fill: parent
          anchors.margins: 12
          clip: true
          contentWidth: width
          contentHeight: body.implicitHeight
          boundsBehavior: Flickable.StopAtBounds
          function ensureVisible(r) {
            if (contentY >= r.y) contentY = r.y
            else if (contentY + height <= r.y + r.height) contentY = r.y + r.height - height
          }
          TextEdit {
            id: body
            width: writeFlick.width
            wrapMode: TextEdit.Wrap
            selectByMouse: true
            persistentSelection: true
            color: "#eceae4"
            selectionColor: Qt.rgba(0.54, 0.6, 0.49, 0.4)
            selectedTextColor: "#eceae4"
            font.family: Style.font.family
            font.pixelSize: Style.font.subtitle
            Component.onCompleted: editor.syncBody()
            onTextChanged: {
              if (!editor.active) return
              if (text === editor.active.text) return
              host.updateNote(host.activeId, { text: text })
            }
            onCursorRectangleChanged: writeFlick.ensureVisible(cursorRectangle)
            Keys.onPressed: function (ev) {
              if (!(ev.modifiers & Qt.ControlModifier)) return
              if (ev.key === Qt.Key_B) { editor.apply("bold"); ev.accepted = true }
              else if (ev.key === Qt.Key_I) { editor.apply("italic"); ev.accepted = true }
              else if (ev.key === Qt.Key_K) { editor.apply("link"); ev.accepted = true }
            }
          }
        }
      }

      Rectangle {
        visible: work.showPreview
        x: work.showWrite ? work.paneW + work.gap : 0
        width: work.paneW
        height: parent.height
        color: "#232522"
        radius: 8
        border.width: 1
        border.color: Qt.rgba(0.93, 0.92, 0.89, 0.08)

        Flickable {
          anchors.fill: parent
          anchors.margins: 16
          clip: true
          contentWidth: width
          contentHeight: preview.implicitHeight
          boundsBehavior: Flickable.StopAtBounds
          Text {
            id: preview
            width: parent.width
            wrapMode: Text.Wrap
            textFormat: Text.MarkdownText
            text: {
              host.contentTick
              return editor.active ? Model.renderMarkdown(editor.active.text) : ""
            }
            color: "#eceae4"
            linkColor: "#8aa4b8"
            font.family: Style.font.family
            font.pixelSize: Style.font.subtitle
            onLinkActivated: function (link) {
              var s = String(link)
              if (s.indexOf("toggle:") === 0 && editor.active) {
                var next = Model.toggleTask(editor.active.text, parseInt(s.slice(7), 10))
                host.updateNote(host.activeId, { text: next })
                body.text = next
              } else host.openLink(s)
            }
          }
        }
      }
    }
  }
}

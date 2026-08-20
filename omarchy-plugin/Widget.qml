import QtQuick
import qs.Commons
import qs.Ui

// Bar entry: icon opens the board menu. Right click toggles the editor.
Panel {
  id: root
  moduleName: "io.github.maiosx.pinmark"
  ipcTarget: "io.github.maiosx.pinmark"

  readonly property var notes: bar && bar.shell && bar.shell.serviceFor
    ? bar.shell.serviceFor(root.moduleName)
    : null

  readonly property bool editorVisible: notes ? notes.editorVisible : false
  readonly property int noteCount: notes ? notes.noteIds.length : 0
  readonly property string icon: "\uf08d"
  readonly property string statusText: editorVisible
    ? "Editor open"
    : "Hidden"

  implicitWidth: button.implicitWidth
  implicitHeight: button.implicitHeight

  function newNote() {
    if (!notes) return
    notes.addNote(null, null)
    close()
  }

  function newHelpNote() {
    if (!notes) return
    notes.addHelpNote()
    close()
  }

  function toggleEditor() {
    if (notes) notes.toggleEditor()
  }

  BarIconButton {
    id: button
    anchors.fill: parent
    bar: root.bar
    text: root.icon
    slotSize: Style.bar.statusSlot
    dimmed: !root.editorVisible
    active: root.opened
    tooltipText: "Pinmark — " + root.statusText.toLowerCase()
    onPressed: function (mouseButton) {
      if (mouseButton === Qt.RightButton) root.toggleEditor()
      else root.toggle()
    }
  }

  KeyboardPanel {
    id: panel
    anchorItem: button
    owner: root
    bar: root.bar
    open: root.opened
    focusTarget: keyCatcher
    contentWidth: panel.fittedContentWidth(Style.space(280))
    contentHeight: panel.fittedContentHeight(column.implicitHeight)

    PanelKeyCatcher {
      id: keyCatcher
      anchors.fill: parent
      onCloseRequested: root.close()
      onTabRequested: function (direction) { root.switchPanel(direction) }
      onActivateRequested: root.newNote()

      Column {
        id: column
        anchors { left: parent.left; right: parent.right; top: parent.top }
        spacing: Style.space(14)

        Item {
          width: parent.width
          implicitHeight: Math.max(heroIcon.implicitHeight, heroLabels.implicitHeight, heroCount.implicitHeight)

          Text {
            id: heroIcon
            text: root.icon
            color: root.bar.foreground
            font.family: root.bar.fontFamily
            font.pixelSize: Style.font.display
            anchors.left: parent.left
            anchors.verticalCenter: parent.verticalCenter
          }

          Column {
            id: heroLabels
            anchors.left: heroIcon.right
            anchors.leftMargin: Style.space(14)
            anchors.right: heroCount.left
            anchors.rightMargin: Style.space(10)
            anchors.verticalCenter: parent.verticalCenter
            spacing: Style.space(2)

            Text {
              text: "Pinmark"
              color: root.bar.foreground
              font.family: root.bar.fontFamily
              font.pixelSize: Style.font.title
              font.bold: true
              elide: Text.ElideRight
              width: parent.width
            }

            Text {
              text: root.statusText.toUpperCase()
              color: Qt.darker(root.bar.foreground, 1.4)
              font.family: root.bar.fontFamily
              font.pixelSize: Style.font.caption
              font.bold: true
              font.letterSpacing: 1.2
              elide: Text.ElideRight
              width: parent.width
            }
          }

          Text {
            id: heroCount
            text: root.noteCount
            color: root.bar.foreground
            opacity: root.editorVisible ? 1 : 0.4
            font.family: root.bar.fontFamily
            font.pixelSize: Style.font.displayLarge
            font.bold: true
            anchors.right: parent.right
            anchors.verticalCenter: parent.verticalCenter
          }
        }

        PanelSeparator {
          foreground: root.bar.foreground
        }

        Row {
          width: parent.width
          spacing: Style.space(6)

          Button {
            width: (parent.width - parent.spacing * 2) / 3
            text: "New"
            foreground: root.bar.foreground
            fontFamily: root.bar.fontFamily
            horizontalPadding: Style.spacing.controlPaddingX
            verticalPadding: Style.spacing.controlPaddingY
            bordered: true
            onClicked: root.newNote()
          }

          Button {
            width: (parent.width - parent.spacing * 2) / 3
            text: root.editorVisible ? "Hide" : "Show"
            foreground: root.bar.foreground
            fontFamily: root.bar.fontFamily
            horizontalPadding: Style.spacing.controlPaddingX
            verticalPadding: Style.spacing.controlPaddingY
            bordered: true
            active: !root.editorVisible
            onClicked: root.toggleEditor()
          }

          Button {
            width: (parent.width - parent.spacing * 2) / 3
            text: "Help"
            foreground: root.bar.foreground
            fontFamily: root.bar.fontFamily
            horizontalPadding: Style.spacing.controlPaddingX
            verticalPadding: Style.spacing.controlPaddingY
            bordered: true
            onClicked: root.newHelpNote()
          }
        }

        Text {
          width: parent.width
          wrapMode: Text.Wrap
          text: root.editorVisible
            ? "Hide folds the editor. Pinned widgets stay on top of it."
            : "The editor is hidden. Show it from here — pinned widgets stay on the desk."
          color: root.bar.foreground
          opacity: 0.6
          font.family: root.bar.fontFamily
          font.pixelSize: Style.font.bodySmall
        }
      }
    }
  }
}

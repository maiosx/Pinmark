.pragma library

// Qt renders `- [ ]` task items, but only as static glyphs. Swapping them for
// links that carry their own source line number makes them clickable without
// hit-testing the rendered document back to the markdown source.

var TASK = /^(\s*(?:[-*+]|\d+[.)])\s+)\[([ xX])\]/

function renderMarkdown(src) {
  var lines = String(src).split("\n")
  for (var i = 0; i < lines.length; i++) {
    var m = lines[i].match(TASK)
    if (!m) continue
    var box = m[2] === " " ? "☐" : "☑"
    lines[i] = m[1] + "[" + box + "](toggle:" + i + ")" + lines[i].slice(m[0].length)
  }
  return lines.join("\n")
}

function toggleTask(src, lineIndex) {
  var lines = String(src).split("\n")
  if (!(lineIndex >= 0) || lineIndex >= lines.length) return String(src)
  var m = lines[lineIndex].match(TASK)
  if (!m) return String(src)
  lines[lineIndex] = m[1] + "[" + (m[2] === " " ? "x" : " ") + "]" + lines[lineIndex].slice(m[0].length)
  return lines.join("\n")
}

function titleFromBody(body, fallback) {
  var src = String(body || "")
  var heading = src.match(/^\s{0,3}#{1,6}\s+(.+)$/m)
  if (heading && heading[1]) return heading[1].trim().slice(0, 80)
  var lines = src.split("\n")
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim()
    if (!line) continue
    return line.replace(/^[#>*\-\s`]+/, "").slice(0, 80) || (fallback || "Untitled")
  }
  return fallback || "Untitled"
}

function lineBounds(value, start, end) {
  var from = value.lastIndexOf("\n", start - 1) + 1
  var to = value.indexOf("\n", end)
  return { from: from, to: to === -1 ? value.length : to }
}

function prefixLines(value, start, end, prefix) {
  var b = lineBounds(value, start, end)
  var block = value.slice(b.from, b.to)
  var lines = block.split("\n")
  var nextBlock = lines.map(function (line) {
    return line.indexOf(prefix) === 0 ? line : prefix + line
  }).join("\n")
  var next = value.slice(0, b.from) + nextBlock + value.slice(b.to)
  return { next: next, selStart: b.from, selEnd: b.from + nextBlock.length }
}

function wrap(value, start, end, before, after, placeholder) {
  var selected = value.slice(start, end) || placeholder
  var next = value.slice(0, start) + before + selected + after + value.slice(end)
  var selStart = start + before.length
  return { next: next, selStart: selStart, selEnd: selStart + selected.length }
}

function applyCommand(value, start, end, command) {
  var v = String(value)
  var s = Math.max(0, start | 0)
  var e = Math.max(s, end | 0)
  switch (command) {
    case "bold": return wrap(v, s, e, "**", "**", "bold")
    case "italic": return wrap(v, s, e, "*", "*", "italic")
    case "strike": return wrap(v, s, e, "~~", "~~", "text")
    case "code": return wrap(v, s, e, "`", "`", "code")
    case "link": return wrap(v, s, e, "[", "](https://)", "label")
    case "h1": return prefixLines(v, s, e, "# ")
    case "h2": return prefixLines(v, s, e, "## ")
    case "h3": return prefixLines(v, s, e, "### ")
    case "quote": return prefixLines(v, s, e, "> ")
    case "ul": return prefixLines(v, s, e, "- ")
    case "ol": return prefixLines(v, s, e, "1. ")
    case "task": return prefixLines(v, s, e, "- [ ] ")
    case "hr": {
      var insert = (s > 0 && v[s - 1] !== "\n" ? "\n" : "") + "---\n"
      var next = v.slice(0, s) + insert + v.slice(e)
      var caret = s + insert.length
      return { next: next, selStart: caret, selEnd: caret }
    }
    case "codeblock": return wrap(v, s, e, "```\n", "\n```\n", "code")
    default: return { next: v, selStart: s, selEnd: e }
  }
}

// ---------------------------------------------------------------- screens
//
// Note positions are stored per screen, local to that screen's usable area.
// The bar reserves the same strip on every output, so that inset cancels out
// of a screen-to-screen conversion and only the origins matter.

function screenDistance(s, gx, gy, insetW, insetH) {
  var dx = Math.max(s.x - gx, 0, gx - (s.x + s.width - insetW))
  var dy = Math.max(s.y - gy, 0, gy - (s.y + s.height - insetH))
  return dx * dx + dy * dy
}

function screenForDrop(screens, gx, gy, insetW, insetH) {
  for (var i = 0; i < screens.length; i++) {
    var s = screens[i]
    if (gx >= s.x && gx < s.x + s.width - insetW
      && gy >= s.y && gy < s.y + s.height - insetH) return s
  }
  var ordered = orderedScreens(screens)
  var best = null
  var bestDistance = Infinity
  for (var j = 0; j < ordered.length; j++) {
    var d = screenDistance(ordered[j], gx, gy, insetW, insetH)
    if (d < bestDistance) {
      bestDistance = d
      best = ordered[j]
    }
  }
  return best
}

function bounds(screens) {
  if (!screens.length) return { x1: 0, y1: 0, x2: 0, y2: 0 }
  var b = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity }
  for (var i = 0; i < screens.length; i++) {
    var s = screens[i]
    b.x1 = Math.min(b.x1, s.x)
    b.y1 = Math.min(b.y1, s.y)
    b.x2 = Math.max(b.x2, s.x + s.width)
    b.y2 = Math.max(b.y2, s.y + s.height)
  }
  return b
}

function orderedScreens(screens) {
  return screens.slice().sort(function (a, b) { return (a.x - b.x) || (a.y - b.y) })
}

function adjacentScreen(screens, from, dir) {
  if (!from) return null
  var list = orderedScreens(screens)
  for (var i = 0; i < list.length; i++) {
    if (list[i].name === from.name) return list[i + dir] || null
  }
  return null
}

function clampOnto(x, y, w, h, usableW, usableH) {
  return {
    x: Math.max(0, Math.min(x, Math.max(0, usableW - w))),
    y: Math.max(0, Math.min(y, Math.max(0, usableH - h)))
  }
}

function relocate(lx, ly, w, h, from, to) {
  return clampOnto(lx + from.x - to.x, ly + from.y - to.y, w, h, to.usableW, to.usableH)
}

// node test-markdown.mjs
import { readFileSync } from "node:fs"
import assert from "node:assert/strict"

const src = readFileSync(new URL("./Model.js", import.meta.url), "utf8")
const EXPORTS = [
  "renderMarkdown",
  "toggleTask",
  "screenForDrop",
  "bounds",
  "relocate",
  "clampOnto",
  "adjacentScreen",
  "orderedScreens",
  "applyCommand",
  "titleFromBody",
  "suggestedFileName"
]
const { renderMarkdown, toggleTask, screenForDrop, bounds, relocate, clampOnto, adjacentScreen, orderedScreens, applyCommand, titleFromBody, suggestedFileName } =
  new Function(src.replace(".pragma library", "") + `\nreturn { ${EXPORTS.join(", ")} }`)()

const note = "# List\n\n- [x] milk\n- [ ] eggs\nnot a task\n  2) [ ] nested\n"

// Every task line becomes a link tagged with its own source line number.
assert.equal(
  renderMarkdown(note),
  "# List\n\n- [☑](toggle:2) milk\n- [☐](toggle:3) eggs\nnot a task\n  2) [☐](toggle:5) nested\n"
)

// Those numbers index straight back into the source.
assert.equal(toggleTask(note, 3).split("\n")[3], "- [x] eggs")
assert.equal(toggleTask(note, 2).split("\n")[2], "- [ ] milk")
assert.equal(toggleTask(note, 5).split("\n")[5], "  2) [x] nested")

// Toggling twice is the identity; non-tasks and bad indices are left alone.
assert.equal(toggleTask(toggleTask(note, 3), 3), note)
assert.equal(toggleTask(note, 4), note)
assert.equal(toggleTask(note, 99), note)
assert.equal(toggleTask(note, -1), note)

// Text after the checkbox survives verbatim, brackets included.
assert.equal(renderMarkdown("- [ ] a [b](c) d"), "- [☐](toggle:0) a [b](c) d")

// ---------------------------------------------------------------- screens
// The real layout here: laptop left of the external, both 1920x1080, with a
// 26px bar on each so the usable area is 1920x1054.
const LAPTOP = { name: "eDP-1", x: -64, y: 64, width: 1920, height: 1080 }
const EXTERNAL = { name: "DP-1", x: 1856, y: 64, width: 1920, height: 1080 }
const SCREENS = [LAPTOP, EXTERNAL]
// What the bar takes off each output, the same on every one of them. Named
// once so the arithmetic below reads as "minus the bar" rather than as a
// number that has to be traced back here.
const INSET_W = 0
const INSET_H = 26
const usable = (s) => ({ x: s.x, y: s.y, usableW: s.width - INSET_W, usableH: s.height - INSET_H })

// Positions are screen-local, so a drop is resolved against each screen's
// origin plus its *usable* size — the bar's strip is not part of any band.
const at = (gx, gy, screens = SCREENS) => screenForDrop(screens, gx, gy, INSET_W, INSET_H).name

assert.equal(at(500, 500), "eDP-1")
assert.equal(at(2000, 500), "DP-1")
assert.equal(at(1855, 500), "eDP-1") // last pixel before the seam
assert.equal(at(1856, 500), "DP-1") // first pixel after it

// Off the end of the layout entirely: the nearest screen, never nothing. A
// drop that resolves to nothing sends the note back where it came from, which
// is the whole complaint this is meant to answer.
assert.equal(at(99999, 500), "DP-1")
assert.equal(at(-99999, 500), "eDP-1")
assert.equal(screenForDrop([], 0, 0, INSET_W, INSET_H), null)

// The band a note can occupy stops short of the far edge by the bar's strip,
// so between two stacked screens there is a gap that belongs to neither. A
// drop there has to fall to whichever side is closer, not to the screen the
// drag started on.
const UPPER = { name: "DP-3", x: 0, y: 0, width: 1920, height: 1080 }
const LOWER = { name: "DP-4", x: 0, y: 1080, width: 1920, height: 1080 }
const STACK = [UPPER, LOWER]
assert.equal(at(500, 500, STACK), "DP-3")
assert.equal(at(500, 1053, STACK), "DP-3") // last pixel of the upper band
assert.equal(at(500, 1080, STACK), "DP-4") // first pixel of the lower band
assert.equal(at(500, 1075, STACK), "DP-4") // in the gap, nearer the lower one
assert.equal(at(500, 1058, STACK), "DP-3") // in the gap, nearer the upper one
// Dead centre of the gap is an exact tie. It settles on the screen that comes
// first in the layout rather than first in whatever order the compositor
// listed them, so the same drop always lands the same way.
assert.equal(at(500, 1067, STACK), "DP-3")
assert.equal(screenForDrop([LOWER, UPPER], 500, 1067, INSET_W, INSET_H).name, "DP-3")

assert.deepEqual(bounds(SCREENS), { x1: -64, y1: 64, x2: 3776, y2: 1144 })
assert.deepEqual(bounds([]), { x1: 0, y1: 0, x2: 0, y2: 0 })

// Dragged off the laptop's right edge: the note keeps its place on the
// desktop, re-expressed against the external's origin.
// laptop-local 1800 sits at layout 1736, which is 120 left of the external.
assert.deepEqual(
  relocate(1800, 300, 260, 240, usable(LAPTOP), usable(EXTERNAL)),
  { x: 0, y: 300 } // clamped: -120 would hang off the left edge
)
// A note comfortably inside the external converts without clamping.
assert.deepEqual(
  relocate(2200, 300, 260, 240, usable(LAPTOP), usable(EXTERNAL)),
  { x: 280, y: 300 }
)
// And back the other way.
assert.deepEqual(
  relocate(100, 200, 260, 240, usable(EXTERNAL), usable(LAPTOP)),
  { x: 1660, y: 200 }
)
// Same screen in and out is a no-op.
assert.deepEqual(
  relocate(400, 250, 260, 240, usable(LAPTOP), usable(LAPTOP)),
  { x: 400, y: 250 }
)
// A note taller than the screen still lands at the origin, never negative.
assert.deepEqual(
  relocate(0, 0, 4000, 4000, usable(LAPTOP), usable(EXTERNAL)),
  { x: 0, y: 0 }
)

// Arrows only appear where there is actually a screen to move to.
assert.equal(adjacentScreen(SCREENS, LAPTOP, 1).name, "DP-1")
assert.equal(adjacentScreen(SCREENS, LAPTOP, -1), null)
assert.equal(adjacentScreen(SCREENS, EXTERNAL, -1).name, "eDP-1")
assert.equal(adjacentScreen(SCREENS, EXTERNAL, 1), null)
assert.equal(adjacentScreen([LAPTOP], LAPTOP, 1), null)
assert.equal(adjacentScreen(SCREENS, null, 1), null)

// With three in a row, "adjacent" means the next one along, not just any on
// that side — and connector order says nothing about layout order.
const FAR = { name: "HDMI-1", x: 3776, y: 64, width: 1920, height: 1080 }
assert.equal(adjacentScreen([LAPTOP, EXTERNAL, FAR], LAPTOP, 1).name, "DP-1")
assert.equal(adjacentScreen([LAPTOP, EXTERNAL, FAR], FAR, -1).name, "DP-1")
assert.equal(adjacentScreen([FAR, LAPTOP, EXTERNAL], LAPTOP, 1).name, "DP-1")
assert.deepEqual(orderedScreens([FAR, EXTERNAL, LAPTOP]).map((s) => s.name), [
  "eDP-1",
  "DP-1",
  "HDMI-1"
])

// Stacked monitors share an x. Comparing left/right leaves both arrows dead
// and a note stranded on whichever screen it happens to be on.
const TOP = { name: "DP-3", x: 0, y: 0, width: 1920, height: 1080 }
const BOTTOM = { name: "DP-4", x: 0, y: 1080, width: 1920, height: 1080 }
assert.equal(adjacentScreen([TOP, BOTTOM], TOP, 1).name, "DP-4")
assert.equal(adjacentScreen([TOP, BOTTOM], BOTTOM, -1).name, "DP-3")
assert.equal(adjacentScreen([TOP, BOTTOM], BOTTOM, 1), null)

// An L: x decides and y only breaks the tie, so the two screens sharing a
// column come out one after the other. Sorting on y first also passes every
// test above — a purely horizontal or purely vertical layout cannot tell the
// two apart — so it takes a mixed one to pin which is meant.
const RIGHT = { name: "DP-5", x: 1920, y: 0, width: 1920, height: 1080 }
assert.deepEqual(orderedScreens([RIGHT, BOTTOM, TOP]).map((s) => s.name), [
  "DP-3", // 0,0
  "DP-4", // 0,1080  — same column as DP-3, so it comes before anything further right
  "DP-5" // 1920,0
])
assert.equal(adjacentScreen([TOP, BOTTOM, RIGHT], BOTTOM, 1).name, "DP-5")

// What the ◀ / ▶ buttons do: pick the neighbour, then keep the note where it
// sits on the screen, clamped onto the new one. Unlike a drag, the position is
// screen-local — re-expressing it in layout coordinates would clamp every note
// to x=0 and pile them all against the shared edge.
// Calls the same clamp the arrows do, inset and all, rather than restating it:
// a copy here drifts from the real one and then guards nothing.
function press(screens, from, dir, x, y, w = 260, h = 240) {
  const to = adjacentScreen(screens, from, dir)
  if (!to) return null
  return { screen: to.name, ...clampOnto(x, y, w, h, to.width - INSET_W, to.height - INSET_H) }
}
// Same spot on the next monitor, not slammed against the edge.
assert.deepEqual(press(SCREENS, LAPTOP, 1, 400, 250), { screen: "DP-1", x: 400, y: 250 })
// Right then left is a round trip back to where it started.
const there = press(SCREENS, LAPTOP, 1, 400, 250)
assert.deepEqual(press(SCREENS, EXTERNAL, -1, there.x, there.y), { screen: "eDP-1", x: 400, y: 250 })
// A note past the edge of a smaller target gets pulled fully onto it — and the
// bar's strip counts, so the bottom stop is 720 - 26 - 240, not 720 - 240.
const SMALL = { name: "DP-2", x: 1856, y: 64, width: 1280, height: 720 }
assert.deepEqual(press([LAPTOP, SMALL], LAPTOP, 1, 1500, 600), { screen: "DP-2", x: 1020, y: 454 })
// At the end of the layout the arrow is a no-op, not a throw.
assert.equal(press(SCREENS, EXTERNAL, 1, 100, 100), null)
// A note taller than the screen it is sent to lands at the origin, not above it.
assert.deepEqual(press([LAPTOP, SMALL], LAPTOP, 1, 500, 500, 260, 4000), {
  screen: "DP-2",
  x: 500,
  y: 0
})

// What releasing a drag does: the screen comes from where the *pointer* was
// dropped, and the position is the card re-expressed on it. The order the
// caller writes these back matters — the screen has to go last, because
// handing the note over rebuilds it from whatever position is stored at that
// instant — so keep them as one value that cannot be half-applied.
function drop(screens, from, x, y, gx, gy, w = 260, h = 240) {
  const to = screenForDrop(screens, gx, gy, INSET_W, INSET_H) || from
  return { screen: to.name, ...relocate(x, y, w, h, usable(from), usable(to)) }
}
// Dropped well inside the external: it keeps the spot it was dragged to.
// laptop-local 2400 is layout 2336, which is 480 into the external.
assert.deepEqual(drop(SCREENS, LAPTOP, 2400, 300, 2400, 400), {
  screen: "DP-1",
  x: 480,
  y: 300
})
// Dropped back on the screen it started from: nothing moves.
assert.deepEqual(drop(SCREENS, LAPTOP, 400, 250, 500, 400), {
  screen: "eDP-1",
  x: 400,
  y: 250
})
// Released over the gap between outputs: it stays where it was, not teleported
// to whichever screen happens to contain the origin.
assert.deepEqual(drop(SCREENS, EXTERNAL, 300, 200, 99999, 99999), {
  screen: "DP-1",
  x: 300,
  y: 200
})

assert.deepEqual(applyCommand("hello", 0, 5, "bold"), {
  next: "**hello**",
  selStart: 2,
  selEnd: 7
})
assert.equal(applyCommand("line", 0, 4, "h1").next, "# line")
assert.equal(applyCommand("x", 0, 0, "task").next, "- [ ] x")
assert.equal(titleFromBody("# Groceries\n\n- milk"), "Groceries")
assert.equal(titleFromBody(""), "Untitled")
assert.equal(suggestedFileName("# Groceries\n\n- milk"), "Groceries.md")
assert.equal(suggestedFileName(""), "untitled.md")

console.log("ok")

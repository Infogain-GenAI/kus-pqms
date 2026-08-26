// Computed-style + geometry DIAGNOSTIC. **This is not a gate, and it is not
// wired into `build` or `pre-push`.**
//
// ITS ROLE: RUN IT WHEN THE PIXEL GATE FAILS.
// `scripts/fidelity-gate.mjs` answers *did anything change* — exactly, at
// threshold zero, because run-to-run capture on a fixed machine and browser is
// byte-identical. What it cannot answer is *which declaration changed*; its
// output is a pixel count and a diff image.
//
// This answers that second question. On a screen carrying forty token
// conversions, "row-gap: 10px -> 14px on the breadcrumb row" versus "24,696
// pixels differ" is the entire cost of triage.
//
// So the two are layered, not alternatives:
//   fidelity-gate.mjs   did anything change?      -> the gate, in build/pre-push
//   style-gate.mjs      which declaration?        -> this, run by hand on failure
//
// An earlier revision of this file described it as a REPLACEMENT for the pixel
// comparison, on the reasoning that a pixel gate needs a tolerance wider than its
// signal. **That reasoning was wrong about this harness** — it measured
// CROSS-MACHINE drift and attributed it to the method. Same-machine run-to-run
// drift is 0.0000% across all nine screens, so no tolerance is required at all.
// 15-devsecops-and-ci-cd.md's structural-blindness rule stands on its own; its
// application here did not.
//
// WHY IT IS NOT PROMOTED TO A GATE (14 requires the reason and the trigger to
// live in the file): it is strictly narrower than the pixel comparison. It sees
// only whitelisted properties on elements that exist in both snapshots, so it is
// blind to anything it was not told to look for — a changed SVG path, a swapped
// image, a font that failed to load. The pixel gate sees all of that.
// **Trigger to promote:** the pixel comparison proving unreliable in practice.
// **Owner:** Frontend Lead.
//
// TWO HALVES, AND THEY HAVE DIFFERENT GUARANTEES. Do not conflate them.
//
//   STYLES   — cross-machine. Every property in the whitelist resolves without
//              consulting layout or text metrics, so the same DOM yields the same
//              values on any machine, browser build or DPI.
//
//   GEOMETRY — SAME-MACHINE ONLY. getBoundingClientRect() depends on layout, and
//              layout depends on font rasterisation and text measurement. It is
//              recorded because it catches reflow that computed styles cannot, and
//              it is diffed separately so a machine change degrades it to a
//              warning rather than silently failing the run.
//
// Usage:
//   node scripts/style-gate.mjs --write    capture a snapshot to .style-baseline/
//   node scripts/style-gate.mjs --check    diff live DOM against the snapshot
//   node scripts/style-gate.mjs --check --styles-only   ignore geometry
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, '.style-baseline')
const APP_URL = process.env.PQMS_APP_URL ?? 'http://localhost:4173'

const MODE = process.argv.includes('--write') ? 'write' : 'check'
const STYLES_ONLY = process.argv.includes('--styles-only')

// --- the whitelist ----------------------------------------------------------
// EVERY property here resolves independently of layout. That is the entire
// criterion, and it is what makes the styles half cross-machine.
//
// Justification, property by property:
//   padding*/margin*   - a length or a percentage of the CONTAINING BLOCK'S WIDTH.
//                        Both resolve from the box model, not from content size.
//   gap/rowGap/columnGap - lengths on the container; not derived from children.
//   border*Width       - a length; independent of content.
//   border*Radius      - a length or percentage of the border box's own dimensions.
//   color/background*  - colour resolution; no layout input.
//   border*Color       - same.
//   fontSize           - resolved against the PARENT font size. Depends on the
//                        cascade, never on layout or on glyph metrics.
//   fontWeight         - a number after resolution.
//   lineHeight         - a length, or a multiple of font-size. Derived from
//                        font-size only; `normal` resolves from font METRICS,
//                        which is why `normal` is recorded verbatim rather than
//                        being resolved to a px value.
//   letterSpacing      - a length.
//   boxShadow          - lengths and colours.
//   opacity/visibility - no layout input; catches a hidden-vs-shown regression.
//
// ONE CAVEAT, stated rather than glossed: a PERCENTAGE padding or margin resolves
// against the containing block's width, and getComputedStyle returns that resolved
// px value. Where the containing block is itself auto-sized by text, such a value
// is transitively text-metric dependent. This codebase styles in px inline, so it
// does not arise today — but if percentage box values appear, the machine-
// independence claim above needs re-checking rather than assuming.
//
// Audited 2026-08-26: 31 properties whitelisted, ZERO layout-dependent ones.
//
// DELIBERATELY EXCLUDED, and this is the load-bearing part:
//   width/height/inlineSize/blockSize - getComputedStyle returns the USED value
//     for these. On an auto-sized element that is the laid-out size, which depends
//     on text measurement and therefore on font rasterisation. Including even one
//     of them would make the styles half machine-dependent while still LOOKING
//     cross-machine — rebuilding the exact problem this gate exists to escape.
//   top/right/bottom/left - used values for positioned elements; same problem.
//   flexBasis/flexGrow resolved sizes, transform matrices, scrollHeight - same.
const STYLE_PROPS = [
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'row-gap', 'column-gap',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
  'color', 'background-color',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'font-size', 'font-weight', 'line-height', 'letter-spacing',
  'box-shadow', 'opacity', 'visibility',
]

const ROUTES = [
  { name: '01-dashboard', path: '/dashboard' },
  { name: '02-issues', path: '/issues' },
  { name: '03-issue-workspace', path: '/issues/HV-260101' },
  { name: '04-issue-create', path: '/issues/new' },
  { name: '05-notifications', path: '/notifications' },
  { name: '06-admin', path: '/admin' },
]

/** Runs in the page. Walks the DOM and emits one record per element. */
const collect = (props) => {
  const out = []
  const seen = new Map()

  const label = (el) => {
    const t = el.getAttribute('data-testid')
    if (t) return t
    const r = el.getAttribute('role')
    const a = el.getAttribute('aria-label')
    if (a) return `${el.tagName.toLowerCase()}[${a}]`
    if (r) return `${el.tagName.toLowerCase()}[role=${r}]`
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean)[0]
    if (cls) return `${el.tagName.toLowerCase()}.${cls}`
    // This codebase styles inline and carries almost no classNames or test ids,
    // so the usual identifiers are absent. A short text snippet is what makes a
    // failure message readable — "div 'Issue Management' > padding-top" instead of
    // a bare tag name. Own text only (not descendants') and length-capped, so the
    // key stays stable and short.
    const own = Array.prototype.filter
      .call(el.childNodes, (n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (own) return `${el.tagName.toLowerCase()} "${own.slice(0, 28)}"`
    return el.tagName.toLowerCase()
  }

  // A key must be stable across runs and readable in a failure message. Path
  // position makes it unique; the label makes it identifiable.
  const keyFor = (el) => {
    const parts = []
    let cur = el
    while (cur && cur !== document.body) {
      const parent = cur.parentElement
      if (!parent) break
      const idx = Array.prototype.indexOf.call(parent.children, cur) + 1
      parts.unshift(`${cur.tagName.toLowerCase()}:${idx}`)
      cur = parent
    }
    const path = parts.join('>')
    const base = `${label(el)} @ ${path}`
    const n = (seen.get(base) || 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base} #${n}`
  }

  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none') continue
    const styles = {}
    for (const p of props) styles[p] = cs.getPropertyValue(p).trim()
    const r = el.getBoundingClientRect()
    out.push({
      key: keyFor(el),
      styles,
      // Rounded: sub-pixel layout differences are not the signal, and rounding
      // makes an honest same-machine comparison instead of a noisy one.
      geometry: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    })
  }
  return out
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

mkdirSync(OUT, { recursive: true })
const snapshots = {}
for (const route of ROUTES) {
  await page.goto(`${APP_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 })
  // Fonts change text metrics, which changes geometry. Wait for them explicitly
  // rather than sleeping and hoping.
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  snapshots[route.name] = await page.evaluate(collect, STYLE_PROPS)
}
await browser.close()

if (MODE === 'write') {
  for (const [name, data] of Object.entries(snapshots)) {
    writeFileSync(join(OUT, `${name}.json`), JSON.stringify(data, null, 1) + '\n')
  }
  const n = Object.values(snapshots).reduce((s, d) => s + d.length, 0)
  console.log(`v style-gate: wrote ${Object.keys(snapshots).length} route snapshots, ${n} elements -> .style-baseline/`)
  process.exit(0)
}

// --- check ------------------------------------------------------------------
if (!existsSync(OUT) || readdirSync(OUT).filter((f) => f.endsWith('.json')).length === 0) {
  console.error('x style-gate: no baseline. Run `node scripts/style-gate.mjs --write` first.')
  process.exit(1)
}

let styleDiffs = 0, geoDiffs = 0, missing = 0, added = 0
const report = []

for (const route of ROUTES) {
  const f = join(OUT, `${route.name}.json`)
  if (!existsSync(f)) {
    console.error(`x style-gate: no baseline for route ${route.name}`)
    process.exit(1)
  }
  const base = JSON.parse(readFileSync(f, 'utf8'))
  const now = snapshots[route.name]
  const baseByKey = new Map(base.map((e) => [e.key, e]))
  const nowByKey = new Map(now.map((e) => [e.key, e]))

  for (const [key, b] of baseByKey) {
    const n = nowByKey.get(key)
    if (!n) { missing++; report.push(`  ${route.name}  ELEMENT GONE   ${key}`); continue }
    for (const p of STYLE_PROPS) {
      if (b.styles[p] !== n.styles[p]) {
        styleDiffs++
        report.push(`  ${route.name}  ${key} > ${p}: ${b.styles[p]} -> ${n.styles[p]}`)
      }
    }
    if (!STYLES_ONLY) {
      for (const g of ['x', 'y', 'w', 'h']) {
        if (b.geometry[g] !== n.geometry[g]) {
          geoDiffs++
          report.push(`  ${route.name}  [geometry] ${key} > ${g}: ${b.geometry[g]} -> ${n.geometry[g]}`)
        }
      }
    }
  }
  for (const key of nowByKey.keys()) if (!baseByKey.has(key)) { added++; report.push(`  ${route.name}  ELEMENT ADDED  ${key}`) }
}

const total = styleDiffs + geoDiffs + missing + added
if (total === 0) {
  const n = Object.values(snapshots).reduce((s, d) => s + d.length, 0)
  console.log(`v style-gate: ${n} elements across ${ROUTES.length} routes — every computed style${STYLES_ONLY ? '' : ' and geometry'} unchanged.`)
  process.exit(0)
}

console.error(`x style-gate: ${total} difference(s)`)
console.error(`   computed styles ${styleDiffs}   geometry ${geoDiffs}   elements gone ${missing}   added ${added}`)
console.error('')
for (const line of report.slice(0, 60)) console.error(line)
if (report.length > 60) console.error(`  ... and ${report.length - 60} more`)
console.error('')
if (styleDiffs > 0) {
  console.error('   Computed-style differences are CROSS-MACHINE VALID: a token substitution that')
  console.error('   preserved its value cannot produce one. Treat these as real regressions.')
}
if (geoDiffs > 0 && styleDiffs === 0) {
  console.error('   Only GEOMETRY differs. That half is same-machine only — if this baseline was')
  console.error('   captured on another machine or browser build, re-run with --styles-only and')
  console.error('   regenerate the baseline here rather than chasing it.')
}
process.exit(1)

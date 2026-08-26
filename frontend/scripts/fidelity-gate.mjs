// Fidelity gate — exact pixel comparison at THRESHOLD ZERO.
//
// WHY ZERO AND NOT A TOLERANCE
// Measured on this project: same machine, same browser, back-to-back capture is
// **0.0000% different across all nine screens — byte-identical**. So there is no
// noise floor to clear, and **any non-zero diff is signal**.
//
// A tolerance was proposed and rejected on evidence. Cross-machine drift against
// baselines captured elsewhere ran 0.66–2.14% on screens whose source never
// changed, while a genuine source change measured 4.61%. A threshold wide enough
// to absorb the first swallows the second — but that drift is an artefact of
// BASELINE PROVENANCE, not of the method. Fix the provenance (pin the browser,
// regenerate locally) and the correct threshold is zero.
//
// THE CONDITION THIS RESTS ON, and it is not optional:
//   - `playwright` is pinned EXACTLY in package.json (no caret). The version
//     determines the chromium revision — 1.62.1 -> revision 1234 — and a revision
//     bump reshapes text. The pin turns that into a loud install failure instead
//     of silent pixel drift, which is the single change that makes this durable.
//   - `timezoneId` is pinned below. Dates render through local-time getters over
//     UTC-anchored seed strings, so the same row shows a different day in IST and
//     US-East. That is an APPLICATION DEFECT (see 18), not a harness setting; the
//     pin stops it corrupting captures while the real fix is scheduled.
//   - A baseline is valid for the environment that produced it and no other.
//     Until CI runs in a fixed image, every machine regenerates its own.
//
// WHEN THIS FAILS, run `pnpm run style:diff`. This says *something moved*;
// scripts/style-gate.mjs says *which declaration moved*.
//
// Usage:
//   node scripts/fidelity-gate.mjs --write         capture baselines
//   node scripts/fidelity-gate.mjs --check         compare, exit 1 on any diff
//   node scripts/fidelity-gate.mjs --write --proto also capture the prototype
import { chromium } from 'playwright'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
// SEPARATE DIRECTORY, deliberately. `.fidelity/` holds the 2026-08-22 historical
// captures, which are retained as a visual archive (see 18). Writing here would
// COLLIDE — seven of this gate's screen names match old filenames, and a --write
// silently overwrote seven tracked archive images before this was caught.
// The archive and the live baseline are different things and live apart.
const OUT = join(root, '.pixel-baseline')
const DIFFS = join(OUT, '_diff')

// DEFECT 1 REPAIRED — was hardcoded to `file:///D:/workspace-II/...`, a drive that
// exists on no current machine. Resolved relatively from this file instead, so it
// works from any checkout.
const PROTO_FILE = resolve(
  root,
  '../_bmad-output/planning-artifacts/ux/design-source/exports/pqms-bundled-page-2026-08-16/PQMS_SE.html',
)

// DEFECT 3 REPAIRED — was `http://127.0.0.1:4173`. `vite preview` binds `[::1]`
// only on this machine, so every app capture failed with ECONNREFUSED while the
// script reported success. `localhost` resolves to whichever family is listening.
const APP_URL = process.env.PQMS_APP_URL ?? 'http://localhost:4173'

const VIEWPORT = { width: 1280, height: 900 }
const MODE = process.argv.includes('--write') ? 'write' : 'check'
const WITH_PROTO = process.argv.includes('--proto')

const APP_SCREENS = [
  { name: 'app-01-dashboard', go: '/dashboard' },
  { name: 'app-02-issues', go: '/issues' },
  { name: 'app-03-ws-detail', go: '/issues/HV-260101' },
  { name: 'app-04-ws-investigation', go: '/issues/HV-260101', tab: 'Investigation' },
  { name: 'app-05-ws-resolution', go: '/issues/HV-260101', tab: 'Resolution' },
  { name: 'app-06-ws-communication', go: '/issues/HV-260101', tab: 'Communication' },
  { name: 'app-07-ws-history', go: '/issues/HV-260101', tab: 'History' },
  { name: 'app-08-create', go: '/issues/new' },
  { name: 'app-09-admin', go: '/admin' },
  { name: 'app-10-notifications', go: '/notifications' },
]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: VIEWPORT,
  // Pinned so a developer's local zone cannot change what the date column renders.
  timezoneId: 'UTC',
  locale: 'en-US',
  // Rendering must not depend on the OS accessibility settings of whoever runs it.
  reducedMotion: 'reduce',
  colorScheme: 'light',
  deviceScaleFactor: 1,
})
const page = await context.newPage()

const captured = []
const shoot = async (name) => {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
  const target = MODE === 'write' ? join(OUT, `${name}.png`) : join(OUT, '_current', `${name}.png`)
  mkdirSync(dirname(target), { recursive: true })
  await page.screenshot({ path: target })
  captured.push(name)
}

let failures = 0
const step = async (label, fn) => {
  try {
    await fn()
  } catch (e) {
    // DEFECT 4, HALF ONE — the old harness swallowed every failure here and still
    // exited 0. A capture that did not happen is now a hard failure.
    console.error(`x capture failed: ${label} — ${String(e).split('\n')[0].slice(0, 110)}`)
    failures++
  }
}

// --- app ---
for (const s of APP_SCREENS) {
  await step(s.name, async () => {
    await page.goto(`${APP_URL}${s.go}`, { waitUntil: 'networkidle', timeout: 30000 })
    if (s.tab) await page.getByRole('tab', { name: new RegExp(s.tab, 'i') }).first().click()
    await shoot(s.name)
  })
}

// --- prototype (optional; only needed to measure app-vs-prototype) ---
if (WITH_PROTO) {
  if (!existsSync(PROTO_FILE)) {
    console.error(`x prototype not found at ${PROTO_FILE}`)
    failures++
  } else {
    const url = `file:///${PROTO_FILE.split('\\').join('/')}`
    const P = [
      { name: 'proto-01-dashboard', act: async () => {} },
      { name: 'proto-02-issues', act: async (p) => p.getByText('Issue Management', { exact: true }).first().click() },
    ]
    for (const s of P) {
      await step(s.name, async () => {
        await page.goto(url, { waitUntil: 'load', timeout: 60000 })
        await page.waitForTimeout(4000)
        await s.act(page)
        await page.waitForTimeout(1200)
        await shoot(s.name)
      })
    }
  }
}

await browser.close()

if (MODE === 'write') {
  if (failures > 0) {
    console.error(`\nx fidelity: ${failures} capture(s) failed — baseline NOT trustworthy, fix before writing.`)
    process.exit(1)
  }
  console.log(`v fidelity: wrote ${captured.length} baselines -> .pixel-baseline/`)
  process.exit(0)
}

// --- compare ------------------------------------------------------------------
const missing = captured.filter((n) => !existsSync(join(OUT, `${n}.png`)))
if (missing.length) {
  console.error(`x fidelity: no baseline for ${missing.length} screen(s): ${missing.join(', ')}`)
  console.error('   Run `pnpm run fidelity:baseline` first.')
  process.exit(1)
}

mkdirSync(DIFFS, { recursive: true })
let diffScreens = 0
const rows = []
for (const name of captured) {
  const a = PNG.sync.read(readFileSync(join(OUT, `${name}.png`)))
  const b = PNG.sync.read(readFileSync(join(OUT, '_current', `${name}.png`)))
  if (a.width !== b.width || a.height !== b.height) {
    rows.push(`  ${name.padEnd(26)} SIZE ${a.width}x${a.height} -> ${b.width}x${b.height}`)
    diffScreens++
    continue
  }
  const diff = new PNG({ width: a.width, height: a.height })
  // threshold 0: exact. See the header for why no tolerance is correct here.
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0 })
  if (n > 0) {
    diffScreens++
    writeFileSync(join(DIFFS, `${name}.png`), PNG.sync.write(diff))
    const pct = ((100 * n) / (a.width * a.height)).toFixed(4)
    rows.push(`  ${name.padEnd(26)} ${String(n).padStart(8)} px  ${pct.padStart(8)}%   -> .pixel-baseline/_diff/${name}.png`)
  }
}

if (failures > 0) {
  console.error(`x fidelity: ${failures} capture(s) failed to run.`)
  process.exit(1)
}
if (diffScreens === 0) {
  console.log(`v fidelity: ${captured.length} screens, pixel-identical to the baseline.`)
  process.exit(0)
}

// DEFECT 4, HALF TWO — there is now a verdict, and it is non-zero on failure.
console.error(`x fidelity: ${diffScreens} of ${captured.length} screen(s) differ from the baseline.`)
console.error('')
for (const r of rows) console.error(r)
console.error('')
console.error('   Threshold is ZERO by design: same-machine capture is byte-identical, so any')
console.error('   non-zero count is a real change. Do not add a tolerance.')
console.error('   To see WHICH declaration moved:  pnpm run style:diff')
process.exit(1)

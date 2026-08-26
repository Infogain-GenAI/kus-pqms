// One-off measurement: how far is the app from the UX prototype, in pixels?
//
// WHY THIS NUMBER DOES NOT EXIST YET, DESPITE A FIDELITY HARNESS
// The previous harness captured the two halves by DIFFERENT ROUTES: `dc-*` came
// from the vite DEV server, `app-*` from `vite preview`, at different viewports,
// on different days. The two families were never mutually comparable, so no
// app-vs-prototype delta was ever computed — the 2026-08-22 "Aligned" verdict was
// a human looking at pairs of images, not a measurement.
//
// This captures BOTH halves in ONE browser context, one viewport, one timezone,
// back to back, and diffs the pairs.
//
// WHY IT IS WORTH TAKING NOW, AND ONLY NOW
// Step 8 performs ~815 token conversions. Any deviation from the prototype that
// exists TODAY becomes, after that, indistinguishable from a deviation Step 8
// caused. This is the last moment the two can be told apart cheaply.
//
// WHAT THE NUMBER IS AND IS NOT
// It is NOT a pass/fail gate and must never become one. The app renders its own
// deterministic seed while the prototype renders its own sample rows, so a large
// share of any delta is DATA, not layout. Read it as: where is the app
// structurally close to the prototype, and where is it not.
//
// Usage: node scripts/measure-prototype-delta.mjs
//   expects `vite preview` on :4173
import { chromium } from 'playwright'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const OUT = join(root, '.pixel-baseline', '_delta')
const PROTO_FILE = resolve(
  root,
  '../_bmad-output/planning-artifacts/ux/design-source/exports/pqms-bundled-page-2026-08-16/PQMS_SE.html',
)
const APP_URL = process.env.PQMS_APP_URL ?? 'http://localhost:4173'
const VIEWPORT = { width: 1280, height: 900 }

if (!existsSync(PROTO_FILE)) {
  console.error(`x prototype not found: ${PROTO_FILE}`)
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

const PROTO_URL = `file:///${PROTO_FILE.split('\\').join('/')}`

// Paired screens. Left = prototype navigation, right = app route.
const PAIRS = [
  { name: '01-dashboard', app: '/dashboard', proto: async () => {} },
  { name: '02-issues', app: '/issues', proto: async (p) => p.getByText('Issue Management', { exact: true }).first().click() },
  {
    name: '03-ws-detail',
    app: '/issues/HV-260101',
    proto: async (p) => {
      await p.getByText('Issue Management', { exact: true }).first().click()
      await p.waitForTimeout(900)
      await p.locator('text=/^[A-Z]{2}-\\d{6}$/').first().click()
    },
  },
  {
    name: '04-create',
    app: '/issues/new',
    proto: async (p) => {
      await p.getByText('Issue Management', { exact: true }).first().click()
      await p.waitForTimeout(700)
      await p.getByText('New issue', { exact: true }).first().click()
    },
  },
]

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: VIEWPORT,
  timezoneId: 'UTC',
  locale: 'en-US',
  reducedMotion: 'reduce',
  colorScheme: 'light',
  deviceScaleFactor: 1,
})
const page = await context.newPage()

const shoot = async (file) => {
  await page.evaluate(() => document.fonts.ready).catch(() => {})
  await page.waitForTimeout(700)
  await page.screenshot({ path: join(OUT, file) })
}

const ok = []
for (const pair of PAIRS) {
  try {
    await page.goto(PROTO_URL, { waitUntil: 'load', timeout: 60000 })
    await page.waitForTimeout(4000) // inline bundle boot
    await pair.proto(page)
    await shoot(`proto-${pair.name}.png`)

    await page.goto(`${APP_URL}${pair.app}`, { waitUntil: 'networkidle', timeout: 30000 })
    await shoot(`app-${pair.name}.png`)
    ok.push(pair.name)
  } catch (e) {
    console.error(`x ${pair.name}: ${String(e).split('\n')[0].slice(0, 100)}`)
  }
}
await browser.close()

console.log('')
console.log('APP vs PROTOTYPE — same machine, same browser, same viewport, one run')
console.log('')
console.log('screen              differing px      % of frame   note')
console.log('-'.repeat(74))
let sum = 0
for (const name of ok) {
  const a = PNG.sync.read(await import('node:fs').then((fs) => fs.readFileSync(join(OUT, `proto-${name}.png`))))
  const b = PNG.sync.read(await import('node:fs').then((fs) => fs.readFileSync(join(OUT, `app-${name}.png`))))
  if (a.width !== b.width || a.height !== b.height) {
    console.log(`${name.padEnd(20)} SIZE MISMATCH ${a.width}x${a.height} vs ${b.width}x${b.height}`)
    continue
  }
  const diff = new PNG({ width: a.width, height: a.height })
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 })
  writeFileSync(join(OUT, `diff-${name}.png`), PNG.sync.write(diff))
  const pct = (100 * n) / (a.width * a.height)
  sum += pct
  const note = pct < 5 ? 'very close' : pct < 20 ? 'structurally similar' : pct < 45 ? 'substantial differences' : 'largely different'
  console.log(`${name.padEnd(20)} ${String(n).padStart(9)}  ${pct.toFixed(2).padStart(11)}%   ${note}`)
}
console.log('-'.repeat(74))
console.log(`mean ${(sum / (ok.length || 1)).toFixed(2)}% across ${ok.length} paired screens`)
console.log('')
console.log('Diff images: .pixel-baseline/_delta/diff-*.png')
console.log('NOT a gate. The app renders its own seed and the prototype its own sample rows,')
console.log('so a share of every number above is DATA rather than layout.')

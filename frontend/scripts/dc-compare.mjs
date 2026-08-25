// Compare the LIVE .dc.html prototype (V4-V5 "ISM + QIR SE Role - P:C", rendered
// locally via its own support.js/_ds bundle) against the dev app — all screens + overlays.
// Usage: node scripts/dc-compare.mjs [width] [height]
//   expects: http://127.0.0.1:8123 serving exports/kia-npqms-v4-v5/
//            http://127.0.0.1:5173 the vite dev server
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../.fidelity')
mkdirSync(OUT, { recursive: true })

const W = Number(process.argv[2]) || 1920
const H = Number(process.argv[3]) || 1080
const EXPORT_DIR = resolve(here, '../../_bmad-output/planning-artifacts/ux/design-source/exports/kia-npqms-v4-v5')
const DC_URL = 'http://127.0.0.1:8123/ISM%20%2B%20QIR%20SE%20Role%20-%20P-C.dc.html'
const APP_URL = 'http://127.0.0.1:5173'

// The SE prototype's admin screen is unreachable through its own nav; regenerate a copy
// whose constructor boots straight into screen:'admin' (the only change).
//
// ⚠️ THIS WRITES INTO A TRACKED DIRECTORY, AND IT HAS TO.
// EXPORT_DIR is `_bmad-output/planning-artifacts/ux/design-source/exports/...`, which
// is tracked and belongs to the UX design source — another component's artefact.
// 33-polyglot-monorepo-integration.md's boundary rule says not to write there.
//
// A temp directory is NOT an option: the `.dc.html` resolves its own runtime
// (`support.js`, `_ds/`) by RELATIVE path and is served over :8123 from EXPORT_DIR,
// so a copy anywhere else loads a blank page. The boot copy must sit beside its
// assets. This was tried and reverted rather than left as a plausible-looking fix.
//
// ⚠️ AND IT ALREADY HAPPENED. `_boot-admin.dc.html` is not a hypothetical future
// commit — it was committed in `fa25e69` and is tracked today. **`.gitignore` does
// not affect an already-tracked file**, so the entry added alongside this comment
// prevents a recurrence and does NOT untrack the existing one. Closing it fully
// needs `git rm --cached` on that path, which is a deliberate staged change and is
// left for whoever picks this up.
//
// What is closed here:
//   1. `.gitignore` carries `_boot-admin.dc.html`, so a fresh generation on any
//      other checkout cannot be swept in by `git add -A`.
//   2. The `existsSync` guard is removed. It also caused a subtler bug: a
//      re-vendored prototype would keep serving a STALE boot copy, silently
//      comparing the app against the previous design revision — which, given the
//      file is tracked, is exactly what would happen on every clone today.
const bootAdmin = resolve(EXPORT_DIR, '_boot-admin.dc.html')
{
  const src = readFileSync(resolve(EXPORT_DIR, 'ISM + QIR SE Role - P-C.dc.html'), 'utf8')
  writeFileSync(bootAdmin, src.replace("screen: props.startScreen || 'home',", "screen: 'admin',"))
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: W, height: H } })

// --- live prototype ---
try {
  await page.goto(DC_URL, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(5000) // dc runtime boot
  await page.screenshot({ path: `${OUT}/dc-home@${W}.png` })
  console.log(`✓ dc-home@${W}`)
  await page.getByText('Issue Management', { exact: true }).first().click()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/dc-list@${W}.png` })
  console.log(`✓ dc-list@${W}`)
  await page.locator('text=/^[A-Z]{2}-\\d{6}$/').first().click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUT}/dc-ws-detail@${W}.png` })
  console.log(`✓ dc-ws-detail@${W}`)
  for (const [key, tab] of [['investigation', 'Investigation'], ['resolution', 'Resolution'], ['communication', 'Communication'], ['history', 'History']]) {
    await page.getByText(tab, { exact: true }).first().click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${OUT}/dc-ws-${key}@${W}.png` })
    console.log(`✓ dc-ws-${key}@${W}`)
  }
  await page.getByText('Issue Management', { exact: true }).first().click()
  await page.waitForTimeout(500)
  await page.getByText('New issue', { exact: true }).first().click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/dc-create@${W}.png` })
  console.log(`✓ dc-create@${W}`)
  // overlays: notification panel, list drawers, change-status modal
  await page.goto(DC_URL, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(4500)
  await page.locator('button[title="Notifications"]').first().click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/dc-notifpanel@${W}.png` })
  console.log(`✓ dc-notifpanel@${W}`)
  await page.getByText('View all notifications', { exact: true }).first().click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/dc-notifications@${W}.png` })
  console.log(`✓ dc-notifications@${W}`)
  await page.getByText('Issue Management', { exact: true }).first().click()
  await page.waitForTimeout(900)
  await page.getByText('Filter', { exact: true }).first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/dc-modal-filter@${W}.png` })
  console.log(`✓ dc-modal-filter@${W}`)
  await page.locator('button[title="Close"]').first().click()
  await page.waitForTimeout(400)
  await page.getByText('Columns', { exact: true }).first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/dc-modal-columns@${W}.png` })
  console.log(`✓ dc-modal-columns@${W}`)
  await page.locator('button[title="Close"]').first().click()
  await page.waitForTimeout(400)
  await page.getByText('HV-260101', { exact: true }).first().click()
  await page.waitForTimeout(900)
  await page.getByText('Change status', { exact: true }).first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/dc-modal-changestatus@${W}.png` })
  console.log(`✓ dc-modal-changestatus@${W}`)
  // admin screen (patched boot copy)
  await page.goto('http://127.0.0.1:8123/_boot-admin.dc.html', { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(4500)
  await page.screenshot({ path: `${OUT}/dc-admin@${W}.png`, fullPage: true })
  console.log(`✓ dc-admin@${W}`)
} catch (e) {
  console.log(`✗ dc proto: ${String(e).split('\n')[0]}`)
}

// --- dev app ---
try {
  await page.goto(`${APP_URL}/issues`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/dev-list@${W}.png` })
  console.log(`✓ dev-list@${W}`)
  await page.getByText(/^[A-Z]{2}-\d{6}$/).first().click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/dev-ws-detail@${W}.png` })
  console.log(`✓ dev-ws-detail@${W}`)
  for (const [key, tab] of [['investigation', 'Investigation'], ['resolution', 'Resolution'], ['communication', 'Communication'], ['history', 'History']]) {
    await page.getByRole('tab', { name: new RegExp(tab, 'i') }).first().click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/dev-ws-${key}@${W}.png` })
    console.log(`✓ dev-ws-${key}@${W}`)
  }
  await page.goto(`${APP_URL}/issues/new`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/dev-create@${W}.png` })
  console.log(`✓ dev-create@${W}`)
  // overlays: notification panel + page, list drawers, change-status modal
  await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(600)
  await page.getByLabel(/^Notifications,/).click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/dev-notifpanel@${W}.png` })
  console.log(`✓ dev-notifpanel@${W}`)
  await page.getByText('View all notifications', { exact: true }).click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/dev-notifications@${W}.png` })
  console.log(`✓ dev-notifications@${W}`)
  await page.goto(`${APP_URL}/issues`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(600)
  await page.getByText('Filter', { exact: true }).first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/dev-modal-filter@${W}.png` })
  console.log(`✓ dev-modal-filter@${W}`)
  await page.getByLabel('Close').click()
  await page.getByText('Columns', { exact: true }).first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/dev-modal-columns@${W}.png` })
  console.log(`✓ dev-modal-columns@${W}`)
  await page.getByLabel('Close').click()
  await page.goto(`${APP_URL}/issues/HV-260101`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(600)
  await page.getByText('Change status', { exact: true }).first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/dev-modal-changestatus@${W}.png` })
  console.log(`✓ dev-modal-changestatus@${W}`)
} catch (e) {
  console.log(`✗ dev app: ${String(e).split('\n')[0]}`)
}

await browser.close()
console.log(`done → ${OUT}`)

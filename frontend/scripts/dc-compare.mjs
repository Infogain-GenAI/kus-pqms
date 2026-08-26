// Compare the LIVE .dc.html prototype (V4-V5 "ISM + QIR SE Role - P:C", rendered
// locally via its own support.js/_ds bundle) against the dev app — all screens + overlays.
// Usage: node scripts/dc-compare.mjs [width] [height]
//   expects: http://127.0.0.1:8123 serving exports/kia-npqms-v4-v5/
//            http://127.0.0.1:5173 the vite dev server
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../.fidelity')
mkdirSync(OUT, { recursive: true })

const W = Number(process.argv[2]) || 1920
const H = Number(process.argv[3]) || 1080
// The prototype export directory is served EXTERNALLY on :8123 (see usage above).
// This script no longer needs a path into it — the in-flight rewrite below removed
// the last reason to reach across the component boundary at all.
//   serve with: npx serve _bmad-output/planning-artifacts/ux/design-source/exports/kia-npqms-v4-v5 -p 8123
const DC_URL = 'http://127.0.0.1:8123/ISM%20%2B%20QIR%20SE%20Role%20-%20P-C.dc.html'
const APP_URL = 'http://127.0.0.1:5173'

// The SE prototype's admin screen is unreachable through its own nav, so the
// document's constructor has to be booted straight into screen:'admin'.
//
// THIS NO LONGER WRITES A FILE ANYWHERE. Previous revisions generated
// `_boot-admin.dc.html` INSIDE `_bmad-output/.../exports/`, which is another
// team's directory and a boundary violation (33-polyglot-monorepo-integration.md).
//
// Relocating the copy is not possible: the `.dc.html` resolves its runtime
// (`support.js`, `_ds/`) by RELATIVE path from wherever it is served, so a copy in
// `.fidelity/` or a temp directory loads a blank page. The file has to be at that
// origin — which is exactly why writing it there was hard to avoid.
//
// So the file is removed from the problem entirely: the ORIGINAL url is requested
// and the response body is rewritten IN FLIGHT by a Playwright route handler. Same
// origin, same relative asset resolution, no artefact on disk, and nothing that
// can go stale after a re-vendor.
//
// (`_boot-admin.dc.html` was committed in `fa25e69` and is still tracked. It is
// now unreferenced; untracking it with `git rm --cached` is a separate step,
// recorded in 18-project-context-and-implementation-status.md.)
const PROTO_FILE = 'ISM + QIR SE Role - P-C.dc.html'
const bootAdminInto = async (page) => {
  await page.route(`**/${encodeURIComponent(PROTO_FILE).replace(/%20/g, '*')}*`, async (route) => {
    const res = await route.fetch()
    const body = (await res.text()).replace("screen: props.startScreen || 'home',", "screen: 'admin',")
    await route.fulfill({ response: res, body })
  })
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
  // admin screen — same URL as the rest, with the constructor rewritten in flight
  // so no patched copy is ever written to disk. See bootAdminInto above.
  await bootAdminInto(page)
  await page.goto(DC_URL, { waitUntil: 'load', timeout: 60000 })
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

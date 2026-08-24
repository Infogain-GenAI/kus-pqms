// Phase-5 fidelity harness: screenshots the UX ground-truth prototype (PQMS_SE.html)
// and the running app (vite preview) screen-by-screen into frontend/.fidelity/.
// Usage: node scripts/fidelity-capture.mjs [proto|app|both] [width] [height]
//   e.g. node scripts/fidelity-capture.mjs both 1920 1080   (full-window check)
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../.fidelity')
mkdirSync(OUT, { recursive: true })

const PROTO_URL =
  'file:///D:/workspace-II/kus-pqms/_bmad-output/planning-artifacts/ux/design-source/exports/pqms-bundled-page-2026-08-16/PQMS_SE.html'
const APP_URL = 'http://127.0.0.1:4173'
const VIEWPORT = { width: Number(process.argv[3]) || 1280, height: Number(process.argv[4]) || 900 }
const SUFFIX = VIEWPORT.width === 1280 ? '' : `@${VIEWPORT.width}`

const mode = process.argv[2] ?? 'both'

async function shot(page, name) {
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/${name}${SUFFIX}.png` })
  console.log(`  ✓ ${name}${SUFFIX}`)
}

async function step(label, fn) {
  try {
    await fn()
  } catch (e) {
    console.log(`  ✗ ${label}: ${String(e).split('\n')[0]}`)
  }
}

async function captureProto(browser) {
  console.log('— prototype —')
  const page = await browser.newPage({ viewport: VIEWPORT })
  await page.goto(PROTO_URL, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(4000) // big inline bundle boot
  await step('home', () => shot(page, 'proto-01-home'))
  await step('list', async () => {
    await page.getByText('Issue Management', { exact: true }).first().click()
    await shot(page, 'proto-02-list')
  })
  await step('workspace', async () => {
    await page.locator('text=/^[A-Z]{2}-\\d{6}$/').first().click()
    await page.waitForTimeout(800)
    await shot(page, 'proto-03-ws-detail')
  })
  for (const [i, tab] of [['04', 'Investigation'], ['05', 'Resolution'], ['06', 'Communication'], ['07', 'History']]) {
    await step(`ws tab ${tab}`, async () => {
      await page.getByText(tab, { exact: true }).first().click()
      await shot(page, `proto-${i}-ws-${tab.toLowerCase()}`)
    })
  }
  await step('create', async () => {
    await page.getByText('Issue Management', { exact: true }).first().click()
    await page.waitForTimeout(500)
    await page.getByText('New issue', { exact: true }).first().click()
    await shot(page, 'proto-08-create')
  })
  await step('notifications', async () => {
    // bell button in the header utilities
    const bell = page.locator('button:has(svg.lucide-bell), button[aria-label*="otification"]').first()
    await bell.click()
    await page.waitForTimeout(400)
    await shot(page, 'proto-09-notifpanel')
    const viewAll = page.getByText(/view all/i).first()
    await viewAll.click()
    await shot(page, 'proto-10-notifications')
  })
  await page.close()
}

async function captureApp(browser) {
  console.log('— app —')
  const page = await browser.newPage({ viewport: VIEWPORT })
  const go = async (path) => {
    await page.goto(`${APP_URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 })
  }
  await step('dashboard', async () => { await go('/dashboard'); await shot(page, 'app-01-home') })
  await step('list', async () => { await go('/issues'); await shot(page, 'app-02-list') })
  await step('ws detail', async () => { await go('/issues/HV-260101'); await shot(page, 'app-03-ws-detail') })
  for (const [i, tab] of [['04', 'Investigation'], ['05', 'Resolution'], ['06', 'Communication'], ['07', 'History']]) {
    await step(`ws tab ${tab}`, async () => {
      await page.getByRole('tab', { name: new RegExp(tab, 'i') }).first().click()
      await shot(page, `app-${i}-ws-${tab.toLowerCase()}`)
    })
  }
  await step('create', async () => { await go('/issues/new'); await shot(page, 'app-08-create') })
  await step('notifications', async () => { await go('/notifications'); await shot(page, 'app-10-notifications') })
  await page.close()
}

const browser = await chromium.launch()
if (mode === 'proto' || mode === 'both') await captureProto(browser)
if (mode === 'app' || mode === 'both') await captureApp(browser)
await browser.close()
console.log(`done → ${OUT}`)

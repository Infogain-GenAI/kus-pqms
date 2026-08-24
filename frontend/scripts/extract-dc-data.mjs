// Extract the LIVE .dc prototype's Issue List dataset (both tabs, all pages)
// by parsing the rendered text (the list is div-built, not a <table>).
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../.fidelity/dc-data.json')
const DC_URL = 'http://127.0.0.1:8123/ISM%20%2B%20QIR%20SE%20Role%20-%20P-C.dc.html'

const ID_RE = /^[A-Z]{2}-\d{6}$/
const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/
const STATUSES = new Set(['Open', 'Investigating', 'Top Issue', 'QIR', 'Monitoring', 'NASO', 'Closed', 'Resolved'])

function parseRows(txt) {
  const lines = txt.split('\n').map((l) => l.trim()).filter(Boolean)
  const rows = []
  let i = 0
  while (i < lines.length) {
    if (!ID_RE.test(lines[i])) { i++; continue }
    const id = lines[i++]
    const buf = []
    while (i < lines.length && !DATE_RE.test(lines[i]) && !ID_RE.test(lines[i])) buf.push(lines[i++])
    let date = ''
    if (i < lines.length && DATE_RE.test(lines[i])) date = lines[i++]
    // buf = [title, modelCode, ...classification(1-2), status]
    const statusIdx = buf.findIndex((l) => STATUSES.has(l))
    if (statusIdx < 2) continue
    const title = buf[0]
    const modelCode = buf[1]
    const classification = buf.slice(2, statusIdx)
    const status = buf[statusIdx]
    rows.push({ id, title, modelCode, system: classification[0] ?? '', component: classification[1] ?? '', status, date })
  }
  return rows
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 2400 } })
await page.goto(DC_URL, { waitUntil: 'load', timeout: 60000 })
await page.waitForTimeout(5000)
await page.getByText('Issue Management', { exact: true }).first().click()
await page.waitForTimeout(1000)

async function grabAllPages() {
  try {
    const sel = page.locator('select').last()
    await sel.selectOption('50', { timeout: 2000 })
    await page.waitForTimeout(700)
  } catch { /* paginate below */ }
  const seen = new Map()
  for (let p = 0; p < 5; p++) {
    const txt = await page.evaluate(() => document.body.innerText)
    for (const r of parseRows(txt)) seen.set(r.id, r)
    const next = page.locator('button:has(svg.lucide-chevron-right)').last()
    if (!(await next.isVisible().catch(() => false)) || (await next.isDisabled().catch(() => true))) break
    await next.click()
    await page.waitForTimeout(700)
  }
  return Array.from(seen.values())
}

const mine = await grabAllPages()
await page.getByText('All Issues', { exact: false }).first().click()
await page.waitForTimeout(900)
const all = await grabAllPages()

const data = { mine: mine.map((r) => r.id), issues: all.length >= mine.length ? all : mine }
writeFileSync(OUT, JSON.stringify(data, null, 1))
console.log(`mine=${mine.length} all=${all.length}`)
console.log(JSON.stringify(data))
await browser.close()

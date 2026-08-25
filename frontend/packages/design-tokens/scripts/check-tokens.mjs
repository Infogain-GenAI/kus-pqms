// token-diff gate — asserts the vendored design-system token CSS matches the
// design-system manifest byte-for-token. Fails CI on any drift so the app can
// never silently diverge from the UX design system. (Run: npm run tokens:check)
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(join(root, 'design-system-manifest.json'), 'utf8'))
const tokensDir = join(root, 'src/styles/design-system/tokens')

const norm = (v) => String(v).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim()

const cssVars = new Map()
for (const file of readdirSync(tokensDir).filter((f) => f.endsWith('.css'))) {
  const css = readFileSync(join(tokensDir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(css)) !== null) cssVars.set(m[1], norm(m[2]))
}

const mismatches = []
const missing = []
let checked = 0
for (const t of manifest.tokens ?? []) {
  if (!cssVars.has(t.name)) { missing.push(t.name); continue }
  checked++
  const actual = cssVars.get(t.name)
  const expected = norm(t.value)
  if (actual !== expected) mismatches.push({ name: t.name, expected, actual })
}

if (!mismatches.length && !missing.length) {
  console.log(`✓ token-diff gate: ${checked} tokens match the design-system manifest.`)
  process.exit(0)
}
if (missing.length) {
  console.error(`✗ ${missing.length} manifest token(s) missing from vendored CSS:`)
  for (const n of missing) console.error(`   - ${n}`)
}
for (const mm of mismatches) {
  console.error(`✗ ${mm.name}\n     manifest: ${mm.expected}\n     css:      ${mm.actual}`)
}
process.exit(1)

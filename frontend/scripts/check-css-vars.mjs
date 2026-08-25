// CSS custom-property reference gate.
//
// `var(--space-41)` is valid CSS. It compiles, it ships, and it renders NOTHING —
// the declaration is simply dropped at computed-value time. No compiler, no
// bundler and no existing gate says a word, and the first report is a visual bug
// found by a person.
//
// This checks every var(--x) occurrence under src/ against the names that
// actually exist: the design-system manifest, plus any custom property this app
// defines in its own CSS. ~20 lines of real work.
//
// WHY THIS RATHER THAN DRIVING cssVar() ADOPTION:
// tokens.generated.ts exports a typed cssVar() helper whose TokenName union would
// make a bad name a type error. Its adoption is ZERO — 0 call sites against 1,829
// raw var() occurrences (RESTRUCTURE-BASELINE.md). Converting them all is a
// large, fidelity-risky change to source; this validates the same property for
// every occurrence, including inside plain CSS files where cssVar() cannot reach.
// Cheaper and strictly broader.
//
// Fallback syntax is honoured: `var(--a, var(--b))` checks both --a and --b.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'src')

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx|css)$/.test(entry)) out.push(p)
  }
  return out
}

const files = walk(SRC)

// Known names: the manifest is the source of truth, plus anything this app
// defines itself in CSS (`--x: value`). A locally-defined property is legitimate
// even though it is not a design-system token.
const manifest = JSON.parse(readFileSync(join(root, 'design-system-manifest.json'), 'utf8'))
const known = new Set((manifest.tokens ?? []).map((t) => t.name))
for (const f of files.filter((f) => f.endsWith('.css'))) {
  for (const m of readFileSync(f, 'utf8').matchAll(/(--[\w-]+)\s*:/g)) known.add(m[1])
}

let occurrences = 0
const referenced = new Set()
const unresolved = new Map()

for (const f of files) {
  // tokens.generated.ts declares the names rather than consuming them.
  if (f.endsWith('tokens.generated.ts')) continue
  const text = readFileSync(f, 'utf8')
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--[\w-]+)/g)) {
      occurrences++
      referenced.add(m[1])
      if (!known.has(m[1])) {
        const key = m[1]
        if (!unresolved.has(key)) unresolved.set(key, [])
        unresolved.get(key).push(`${relative(root, f).split(/[\\/]/).join('/')}:${i + 1}`)
      }
    }
  })
}

if (unresolved.size === 0) {
  console.log(`v css-vars — ${occurrences} var() references across ${referenced.size} names, all resolve.`)
  process.exit(0)
}

console.error(`x css-vars — ${unresolved.size} custom property name(s) referenced but never defined.`)
console.error('   These are valid CSS: they compile, ship, and render nothing.')
for (const [name, sites] of unresolved) {
  console.error(`   ${name}  (${sites.length}x)`)
  for (const s of sites.slice(0, 3)) console.error(`      ${s}`)
  if (sites.length > 3) console.error(`      ... and ${sites.length - 3} more`)
}
process.exit(1)

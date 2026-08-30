// THE i18n NAMESPACE GUARD.
//
// 09-i18n-and-localization.md states the hazard and leaves it unsolved:
//
//   "the namespace string passed to `addResourceBundle` and the string passed to
//    `useTranslation()` must be identical … A mismatch FAILS SILENTLY, falling
//    back rather than throwing. This is a manual-discipline risk worth a lint
//    rule or a thin wrapper helper later; it is not solved now."
//
// This is that lint rule. A mismatch does not throw, does not warn, and does not
// fail a typecheck — the screen simply renders the KEY where a sentence should
// be, and only a human looking at the right screen notices.
//
// ─── WHAT IT CHECKS ──────────────────────────────────────────────────────────
//
//   1. Every `*.i18n.ts` exports `NS` and registers exactly that value.
//   2. Every `useTranslation(...)` argument resolves to a registered namespace.
//   3. `useTranslation()` is NEVER called bare — 09 forbids it, because a bare
//      call reads from a shared default namespace and breaks the per-component
//      isolation the whole convention rests on.
//   4. Every registered namespace has at least one consumer, so a renamed
//      component cannot leave an orphan bundle nobody reads.
//
// ─── WHY THE `NS` CONSTANT ───────────────────────────────────────────────────
//
// 09 says "keeping it to one literal per file is the only defence available".
// Exporting it and importing the constant is a stronger defence than discipline:
// a typo becomes an unresolved import, which tsc catches. This script covers what
// remains — that the literal in `registerMessages(NS, …)` matches the file, and
// that nobody reverts to a bare string.
//
// Run: node scripts/check-i18n-namespaces.mjs   (or: pnpm run lint:i18n)

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, sep } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SEARCH_ROOTS = ['apps/portal/src']

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue
      walk(full, out)
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      out.push(full)
    }
  }
  return out
}

const files = SEARCH_ROOTS.flatMap((r) => walk(join(root, r)))
const rel = (f) => relative(root, f).split(sep).join('/')

/**
 * Strips comments before scanning.
 *
 * ⚠️ NEEDED, NOT DEFENSIVE. Several files DOCUMENT the rules this script
 * enforces, quoting `useTranslation('X')` in prose — including `i18n/index.ts`,
 * which explains the namespace hazard. Without this the guard flags its own
 * documentation, and a gate that fails on comments teaches people to disable it.
 */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const problems = []
/** namespace → the .i18n.ts that registered it. */
const registered = new Map()
/** namespace → files that consume it. */
const consumed = new Map()

for (const file of files.filter((f) => f.endsWith('.i18n.ts'))) {
  const src = readFileSync(file, 'utf8')
  const ns = /export const NS = '([^']+)'/.exec(src)?.[1]

  if (!ns) {
    problems.push(`${rel(file)} — no \`export const NS = '…'\`. Every .i18n.ts must name its namespace exactly once.`)
    continue
  }

  if (!/registerMessages\(NS,/.test(src)) {
    problems.push(
      `${rel(file)} — does not call \`registerMessages(NS, messages)\`. Its bundle is never registered, ` +
        `so every key in it renders as the key.`,
    )
  }

  // A second literal is the exact drift 09 warns about.
  const literals = [...src.matchAll(/registerMessages\('([^']+)'/g)].map((m) => m[1])
  for (const lit of literals) {
    problems.push(`${rel(file)} — registers the literal '${lit}' instead of NS. Pass NS, so there is one string.`)
  }

  if (registered.has(ns)) {
    problems.push(`namespace '${ns}' is registered twice — ${rel(registered.get(ns))} and ${rel(file)}. The second silently overwrites.`)
  }
  registered.set(ns, file)

  if (!/^export default messages$/m.test(src)) {
    problems.push(`${rel(file)} — no \`export default messages\`. 09 requires it so tests assert against the real string.`)
  }
}

for (const file of files.filter((f) => !f.endsWith('.i18n.ts'))) {
  const src = stripComments(readFileSync(file, 'utf8'))
  for (const m of src.matchAll(/useTranslation\(([^)]*)\)/g)) {
    const arg = m[1].trim()

    if (arg === '') {
      problems.push(
        `${rel(file)} — bare \`useTranslation()\`. 09 requires an explicit namespace; a bare call reads the ` +
          `shared default namespace and breaks per-component isolation.`,
      )
      continue
    }

    if (arg === 'NS') {
      // Resolved through the imported constant — tsc already proves it exists.
      // Record the consumer against whichever namespace this file imports.
      const importedFrom = /import \{ NS \} from '([^']+)'/.exec(src)?.[1]
      if (!importedFrom) {
        problems.push(`${rel(file)} — uses \`useTranslation(NS)\` but does not import NS.`)
        continue
      }
      const key = importedFrom.split('/').pop().replace(/\.i18n$/, '')
      consumed.set(key, [...(consumed.get(key) ?? []), file])
      continue
    }

    const literal = /^'([^']+)'$/.exec(arg)?.[1]
    if (literal) {
      problems.push(
        `${rel(file)} — \`useTranslation('${literal}')\` uses a bare string. Import NS from the sibling ` +
          `.i18n.ts instead, so a typo is an unresolved import rather than a silent fallback.`,
      )
      continue
    }
  }
}

// An orphan bundle is dead weight AND a sign a rename went half-done.
for (const [ns, file] of registered) {
  const consumers = consumed.get(ns) ?? []
  if (consumers.length === 0) {
    problems.push(`namespace '${ns}' (${rel(file)}) is registered but nothing calls useTranslation for it.`)
  }
}

if (registered.size === 0) {
  console.error('x i18n-namespaces: found NO *.i18n.ts files. Either none exist yet, or this script is looking in the wrong place.')
  console.error('   A guard that checks nothing reports success — see scripts/check-import-rule.mjs on why that matters.')
  process.exit(1)
}

if (problems.length > 0) {
  console.error(`x i18n-namespaces: ${problems.length} problem(s).\n`)
  for (const p of problems) console.error(`    ${p}`)
  console.error('\n  A namespace mismatch does not throw — the UI renders the key. See 09-i18n-and-localization.md.')
  process.exit(1)
}

console.log(`v i18n-namespaces: ${registered.size} namespace(s) registered, all consumed, no bare useTranslation().`)

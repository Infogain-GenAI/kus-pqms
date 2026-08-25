// Design-system adherence gate with a machine-written ceiling.
//
// Usage:  node scripts/ds-gate.mjs <family>
//   families: values | imports | numeric
//
// WHY THE CEILING IS WRITTEN BY A SCRIPT AND NOT BY A HUMAN
// A single hand-edited `--max-warnings N` is a budget, not a ratchet. This
// project's own recorded history is 623 -> 638 -> 662, every movement upward,
// arriving at exactly the current count with zero headroom — the steady state of
// any number a human may edit in either direction, because nobody lowers one and
// everybody eventually raises one.
//
// So the two directions are made asymmetric:
//   - LOWERING is automatic. Count drops -> this script rewrites .ds-ceilings.json
//     and exits 0. Progress is captured the moment it happens, with no ceremony.
//   - RAISING requires editing a tracked file by hand, which appears in review as
//     a deliberate act with a name attached to it.
//
// That asymmetry is the whole mechanism. It is 10-testing-standards.md's coverage
// ratchet ("record today's number as the floor, fail on any drop, raise it, delete
// the ratchet at target") applied to lint counts, and 30's Phase 1 mechanism 2
// ("record the current violation count and fail CI on any increase").
//
// NOTE ON REACH, so nobody mistakes this for CI: RESTRUCTURE-BASELINE.md
// establishes there is no pipeline anywhere in this repository. Until one exists
// this gate runs on a developer's machine and in the pre-push hook, and nothing
// enforces it on a push or a merge.
import { ESLint } from 'eslint'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CEILINGS = join(root, '.ds-ceilings.json')

/**
 * Each family owns a predicate over ESLint messages. Families are disjoint and
 * together must account for every message the config can emit — see the
 * unclassified check below, which fails rather than letting a message escape
 * every ceiling.
 */
const FAMILIES = {
  // The ratchet. Raw px + raw hex + font literals — the real signal, converted
  // to tokens over Step 8. This number should only ever fall.
  values: {
    label: 'raw values (px / hex / font literals)',
    match: (m) => m.ruleId === 'no-restricted-syntax' && /^(Raw |Font not provided)/.test(m.message),
  },
  // Already clean; held at 0. This one is a REGRESSION GUARD, not a burn-down,
  // and it is the one that goes quiet in the most dangerous way: after the Phase 2
  // workspace split the vendored patterns match `@pqms/ui-library` specifiers
  // rather than `components/**`, and a pattern that matches nothing reports zero
  // instead of erroring. Zero here means "checked and clean" ONLY while the
  // alias twinning in eslint.adherence.config.mjs still resolves.
  imports: {
    label: 'restricted imports',
    match: (m) => m.ruleId === 'no-restricted-imports',
  },
  // The numeric blind spot — see story 6 and .ds-ceilings.json.
  numeric: {
    label: 'numeric hard-coded dimensions',
    match: (m) => m.ruleId === 'no-restricted-syntax' && m.message === NUMERIC_MESSAGE,
  },
}

export const NUMERIC_MESSAGE_TEXT = 'Numeric hard-coded dimension — use a design-system token via var().'
const NUMERIC_MESSAGE = NUMERIC_MESSAGE_TEXT

const family = process.argv[2]
if (!family || !FAMILIES[family]) {
  console.error(`ds-gate: unknown family ${JSON.stringify(family)}. Expected one of: ${Object.keys(FAMILIES).join(', ')}`)
  process.exit(2)
}

const eslint = new ESLint({
  cwd: root,
  overrideConfigFile: join(root, 'eslint.adherence.config.mjs'),
})
const results = await eslint.lintFiles(['src'])

// An error (as opposed to a warning) is never in scope for a ceiling — it means
// the config itself failed to run, or a rule is misconfigured. Fail immediately
// rather than reporting a count that was produced by a broken run.
const errorCount = results.reduce((n, r) => n + r.errorCount, 0)
if (errorCount > 0) {
  console.error(`x ds-gate:${family} — ESLint reported ${errorCount} error(s); a ceiling cannot be trusted from a failed run.`)
  console.error(await (await eslint.loadFormatter('stylish')).format(results))
  process.exit(1)
}

const all = results.flatMap((r) => r.messages)
const counts = Object.fromEntries(Object.keys(FAMILIES).map((k) => [k, all.filter(FAMILIES[k].match).length]))

// Every message must belong to exactly one family. If the vendored ruleset is
// re-vendored with a new message class, it would otherwise sit under no ceiling
// at all and grow unobserved — the same silent-hole failure the import family
// warns about above.
const unclassified = all.filter((m) => !Object.values(FAMILIES).some((f) => f.match(m)))
if (unclassified.length > 0) {
  console.error(`x ds-gate:${family} — ${unclassified.length} message(s) match no family, so no ceiling covers them:`)
  for (const m of [...new Set(unclassified.map((m) => `${m.ruleId}: ${m.message}`))].slice(0, 5)) {
    console.error(`     ${m}`)
  }
  console.error('   Add a family in scripts/ds-gate.mjs. Do not edit _adherence.oxlintrc.json.')
  process.exit(1)
}

const ceilings = JSON.parse(readFileSync(CEILINGS, 'utf8'))
const ceiling = ceilings[family]
if (typeof ceiling !== 'number') {
  console.error(`x ds-gate:${family} — no ceiling recorded in .ds-ceilings.json`)
  process.exit(1)
}

const count = counts[family]
const { label } = FAMILIES[family]

if (count > ceiling) {
  console.error(`x ds-gate:${family} — ${count} ${label}, ceiling is ${ceiling}. This change adds ${count - ceiling}.`)
  console.error(`   Use a design-system token, or raise the ceiling BY HAND in .ds-ceilings.json`)
  console.error(`   and say in the commit message why it went up. Never raise it to make a build pass.`)
  process.exit(1)
}

if (count < ceiling) {
  ceilings[family] = count
  writeFileSync(CEILINGS, JSON.stringify(ceilings, null, 2) + '\n')
  console.log(`v ds-gate:${family} — ${count} ${label}. Ceiling RATCHETED ${ceiling} -> ${count}.`)
  console.log(`   .ds-ceilings.json was rewritten; commit it with your change.`)
  process.exit(0)
}

console.log(`v ds-gate:${family} — ${count} ${label}, at ceiling ${ceiling}.`)
process.exit(0)

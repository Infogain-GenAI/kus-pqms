// THE ROLE-COMPARISON GATE.
//
// Fails the build on any literal role comparison — `role === 'ASM'`,
// `user.role !== "SE"` — outside the two files permitted to know that roles
// exist. It is the mechanical form of the hard rule stated at the top of the Vue
// app's `stores/auth/auth.store.ts` and carried into
// `apps/portal/src/shared/usePermissions.ts`:
//
//   No `role === 'X'`-style comparison is permitted anywhere outside the
//   role→capability map. Every consumer gates on a named capability.
//
// ─── WHY THIS IS A HARD ZERO AND NOT A ds-gate RATCHET ───────────────────────
//
// The three ds-gate families (values / numeric / imports) are BUDGETS: a count
// that may only go down, because raw px and hex literals are a debt being paid
// off gradually. This is not that. There are zero violations today and there is
// no legitimate reason to add one, so a ratchet would be the wrong instrument —
// it would silently permit the first violation to become the new ceiling.
//
// ─── WHY A SCRIPT AND NOT AN ESLint `no-restricted-syntax` RULE ──────────────
//
// It could be either, and ESLint was the first choice. Two things decided it:
//
//   1. `eslint.adherence.config.mjs` is emphatic that `_adherence.oxlintrc.json`
//      is a BYTE-COPY of the design system's shipped ruleset and is never
//      edited. This rule is nothing to do with the design system, so it does not
//      belong in that file, and the wrapper is scoped to adapting that ruleset.
//   2. The repo already has this exact shape — a focused `scripts/check-*.mjs`
//      that hard-fails and is listed in `run-checks.mjs`. `check-css-vars.mjs`
//      and `check-tokens-drift.mjs` are both that, and `check-import-rule.mjs`
//      adds the self-test idiom this file copies below.
//
// ─── ⚠️ IT IS REGEX, NOT AN AST, AND THAT HAS A KNOWN COST ───────────────────
//
// A regex cannot know that `role` is a role and not, say, an ARIA role or a
// `roleLabel`. The patterns below are written to exclude the cases that actually
// occur in this codebase (see EXCLUSIONS), and the self-test at the bottom
// proves the gate still fires on a real violation. If it ever produces a false
// positive that cannot be excluded cleanly, the answer is a TypeScript-aware
// rule, not a looser regex.
//
// Run: node scripts/check-role-gate.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, sep } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * The ONLY files permitted to compare a role to a literal.
 *
 * Both need it for the same reason and neither does anything else with it: they
 * look a user up by role in order to resolve that user's CAPABILITY. That is the
 * role→capability map the rule exists to keep in one place.
 *
 * ⚠️ ADDING A PATH HERE IS THE THING THIS GATE EXISTS TO PREVENT. If a third
 * file needs a role comparison, the fix is almost certainly to give it the
 * capability instead — via `usePermissions()` or `hasCapability()`.
 */
const ALLOWED = ['apps/portal/src/data/roles.tsx', 'apps/portal/src/data/capabilities.ts']

/**
 * APPLICATION SOURCE ONLY. `tests/` is deliberately NOT searched.
 *
 * The rule is about where permission DECISIONS are made. A test is the one place
 * that legitimately enumerates roles by name — `expect(canAccessAdmin).toBe(role
 * === 'ADMIN')` is a table of expected outcomes, not a gate, and it is exactly
 * the assertion that proves the production gate is right.
 *
 * This was not the original scope. `tests/` was included, and the gate promptly
 * flagged four such assertions in `usePermissions.test.tsx` — correct pattern
 * matching, wrong target. Excluding the directory is the honest fix; loosening
 * the patterns to tolerate them would have blinded the gate to real violations
 * in application code too.
 *
 * THE COST, STATED PLAINLY: a test helper that reimplements permission logic
 * with a role comparison will not be caught here. That is accepted — a test
 * helper is not a permission gate, and `tsc` plus the assertions themselves are
 * what keep tests honest.
 */
const SEARCH_ROOTS = ['apps/portal/src', 'packages/ui-library/src', 'packages/design-tokens/src']
const EXTENSIONS = ['.ts', '.tsx']

/**
 * A comparison against a role-ish identifier and a string literal.
 *
 * Matches `role === 'X'`, `user.role !== "X"`, `x.role == 'X'` and the reversed
 * form `'X' === role`. Deliberately NOT matching `roleLabel` or `ownerRole`
 * against a literal — those are display strings, not permission checks — hence
 * the word boundary and the explicit alternation on the left.
 */
const PATTERNS = [
  /(?:^|[^.\w])(?:\w+\.)?role\s*[!=]==?\s*['"][^'"]*['"]/,
  /['"][^'"]*['"]\s*[!=]==?\s*(?:\w+\.)?role(?![\w])/,
]

/**
 * Lines exempt wherever they appear.
 *
 * A COMMENT MENTIONING THE RULE IS NOT A VIOLATION OF IT. Several files document
 * the rule by quoting the forbidden form, and a gate that flags its own
 * documentation trains people to disable it.
 */
const isComment = (line) => /^\s*(?:\/\/|\/?\*|\*)/.test(line.trim())

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out // A search root that does not exist is not an error.
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.coverage') continue
      walk(full, out)
    } else if (EXTENSIONS.some((e) => entry.endsWith(e))) {
      out.push(full)
    }
  }
  return out
}

export function findRoleComparisons({ allowed = ALLOWED } = {}) {
  const violations = []

  for (const searchRoot of SEARCH_ROOTS) {
    for (const file of walk(join(root, searchRoot))) {
      const rel = relative(root, file).split(sep).join('/')
      if (allowed.includes(rel)) continue

      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, i) => {
        if (isComment(line)) return
        if (PATTERNS.some((p) => p.test(line))) {
          violations.push({ file: rel, line: i + 1, text: line.trim() })
        }
      })
    }
  }
  return violations
}

/**
 * SELF-TEST, in the spirit of `check-import-rule.mjs`.
 *
 * A gate reporting zero violations and a gate that has stopped matching anything
 * LOOK IDENTICAL FROM THE OUTSIDE — and this one is expected to sit at zero
 * forever, so the count can never distinguish the two. Feeding the patterns a
 * deliberate violation and failing if it is NOT caught is what proves the gate
 * is alive rather than quiet.
 */
function selfTest() {
  const probes = [
    "  if (role === 'ASM') return true",
    '  const x = user.role !== "SE"',
    "  return 'PQM' === role",
    '  if (ctx.role == `x`) {}'.replace('`x`', "'x'"),
  ]
  const missed = probes.filter((p) => !PATTERNS.some((r) => r.test(p)))
  if (missed.length > 0) {
    console.error('x role-gate SELF-TEST FAILED — the patterns no longer catch a real violation:')
    for (const m of missed) console.error(`    ${m}`)
    console.error('\n  The gate is reporting zero because it matches nothing, not because the code is clean.')
    process.exit(1)
  }

  // And the converse: it must not flag things that merely contain the word.
  const benign = ['  const label = user.roleLabel', "  <div role=\"alert\" />", '  ownerRole: string']
  const falsePositives = benign.filter((b) => PATTERNS.some((r) => r.test(b)))
  if (falsePositives.length > 0) {
    console.error('x role-gate SELF-TEST FAILED — the patterns flag benign code:')
    for (const f of falsePositives) console.error(`    ${f}`)
    process.exit(1)
  }
}

selfTest()

const violations = findRoleComparisons()

if (violations.length > 0) {
  console.error(`x role-gate: ${violations.length} literal role comparison(s) outside the role→capability map.\n`)
  for (const v of violations) {
    console.error(`    ${v.file}:${v.line}`)
    console.error(`      ${v.text}`)
  }
  console.error(
    '\n  Gate on a CAPABILITY, not a role. Use `usePermissions()` in a component,' +
      '\n  or `hasCapability()` outside React. A role comparison is a permission check' +
      '\n  written as a fact about a person: it breaks silently the moment a fourth' +
      '\n  role is added, and the symptom is a user who cannot act with no error shown.' +
      `\n\n  The only files permitted to compare roles are:\n${ALLOWED.map((a) => `    ${a}`).join('\n')}`,
  )
  process.exit(1)
}

console.log(`v role-gate: no literal role comparisons outside ${ALLOWED.length} permitted file(s).`)

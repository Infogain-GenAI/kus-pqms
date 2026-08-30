// Self-test for the import-restriction rule.
//
// WHY THIS EXISTS, AND WHY A COUNT CANNOT REPLACE IT
// The `imports` family sits at 0 and is supposed to. A no-restricted-imports
// pattern that stops matching also reports 0. **Both states look identical from
// the outside**, so the ceiling in .ds-ceilings.json cannot distinguish
// "checked and clean" from "checking nothing at all".
//
// That is not hypothetical here. The Phase 2 workspace split moved components
// from src/components/** to packages/ui-library, changing every consumer
// specifier from '@/components/...' to '@pqms/ui-library'. The vendored patterns
// match `components/**` and the '@/' twins match `@/components/**` — after the
// move, both match nothing. steps-for-new-repo.md Step 6 names this as the single
// most dangerous property of the split, and 33/30 both record the general form:
// a lint glob or import pattern that matches nothing does not error.
//
// So this feeds the CURRENT config a deliberately violating import and fails if
// the rule does NOT report it. It asserts the gate is alive rather than quiet.
//
// Run: node scripts/check-import-rule.mjs   (or: pnpm run lint:ds:selftest)
import { ESLint } from 'eslint'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { JSX_COPY_MESSAGE } from './ds-messages.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// One probe per way a consumer can reach a component internal. Each MUST be
// reported. The file paths are virtual — nothing is written to disk — but they
// must fall under the config's `files` globs or the rule will not apply to them,
// which is itself part of what this test verifies.
const PROBES = [
  {
    label: 'package deep-path (post-split specifier)',
    filePath: join(root, 'apps/portal/src/__probe.tsx'),
    code: `import { Button } from '@pqms/ui-library/src/components/core/Button'\nexport const x = Button\n`,
  },
  {
    label: 'in-app alias twin',
    filePath: join(root, 'apps/portal/src/__probe.tsx'),
    code: `import { Button } from '@/components/core/Button'\nexport const x = Button\n`,
  },
  {
    label: 'bare vendored pattern',
    filePath: join(root, 'apps/portal/src/__probe.tsx'),
    code: `import { Button } from 'components/core/Button'\nexport const x = Button\n`,
  },
]

const eslint = new ESLint({
  cwd: root,
  overrideConfigFile: join(root, 'eslint.adherence.config.mjs'),
})

let failures = 0
for (const probe of PROBES) {
  const results = await eslint.lintText(probe.code, { filePath: probe.filePath })
  const hits = results.flatMap((r) => r.messages).filter((m) => m.ruleId === 'no-restricted-imports')
  if (hits.length > 0) {
    console.log(`v import-rule: ${probe.label} — reported`)
  } else {
    console.error(`x import-rule: ${probe.label} — NOT REPORTED. The rule is silent for this shape.`)
    console.error(`     probe: ${probe.code.split('\n')[0]}`)
    failures++
  }
}

// The negative case matters too: the barrel import is the CORRECT way, and a
// rule that flags it would push people back to deep paths.
const ok = await eslint.lintText(`import { Button } from '@pqms/ui-library'\nexport const x = Button\n`, {
  filePath: join(root, 'apps/portal/src/__probe.tsx'),
})
const falsePositives = ok.flatMap((r) => r.messages).filter((m) => m.ruleId === 'no-restricted-imports')
if (falsePositives.length === 0) {
  console.log('v import-rule: barrel import — correctly allowed')
} else {
  console.error('x import-rule: barrel import "@pqms/ui-library" is being FLAGGED. The rule is too broad.')
  failures++
}

/* -------------------------------------------------------------------------- */
/* The JSX-copy selector                                                      */
/* -------------------------------------------------------------------------- */
//
// ⚠️ ADDED BECAUSE THIS EXACT FAILURE HAPPENED, on the day the family landed.
// The `copy` selector was defined but never inserted into the rules array. It
// reported ZERO — and ds-gate RATCHETED THAT IN as a clean codebase. That is
// precisely the silent-hole failure this file exists to prevent for imports,
// reproduced one family over.
//
// A BURN-DOWN FAMILY IS MORE EXPOSED TO THIS THAN A REGRESSION GUARD, not less.
// `imports` sits at 0, where a reported 0 is at least unsurprising and a broken
// rule hides in plain sight. `copy` falls a little every pass — so a sudden drop
// to 0 reads like a good day's work rather than a dead rule. The count is never
// the instrument that catches this.

const copyProbes = [
  { label: 'JSX text between tags', code: 'export const A = () => <div>Hello world</div>\n' },
  { label: 'JSX text beside an element', code: 'export const B = () => <p><b>x</b> Save changes</p>\n' },
]

for (const probe of copyProbes) {
  const res = await eslint.lintText(probe.code, { filePath: join(root, 'apps/portal/src/__probe.tsx') })
  const hits = res.flatMap((r) => r.messages).filter((m) => m.message === JSX_COPY_MESSAGE)
  if (hits.length > 0) {
    console.log(`v copy-rule: ${probe.label} — reported`)
  } else {
    console.error(`x copy-rule: ${probe.label} — NOT REPORTED.`)
    console.error('     The selector is silent, and ds-gate would ratchet that in as success.')
    failures++
  }
}

// Punctuation-only text is MARKUP, not language — the separator dots and arrows
// between elements. Flagging it would fill the burn-down with items nobody can
// act on, and a rule whose output is mostly noise gets disabled rather than fixed.
const punctuation = await eslint.lintText('export const C = () => <span>·</span>\n', {
  filePath: join(root, 'apps/portal/src/__probe.tsx'),
})
if (punctuation.flatMap((r) => r.messages).filter((m) => m.message === JSX_COPY_MESSAGE).length === 0) {
  console.log('v copy-rule: punctuation-only text — correctly ignored')
} else {
  console.error('x copy-rule: punctuation-only text is being FLAGGED. The selector is too broad.')
  failures++
}

if (failures > 0) {
  console.error('')
  console.error(`x adherence self-test: ${failures} check(s) failed — a gate is not enforcing what it claims.`)
  console.error('   Fix the selectors in eslint.adherence.config.mjs. Do not edit _adherence.oxlintrc.json.')
  process.exit(1)
}
console.log('v adherence self-test: import gate alive (3 shapes reported, barrel allowed);')
console.log('  copy gate alive (2 shapes reported, punctuation ignored).')
process.exit(0)

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

if (failures > 0) {
  console.error('')
  console.error(`x import-rule: ${failures} check(s) failed — the import gate is not enforcing what it claims.`)
  console.error('   Fix the pattern twins in eslint.adherence.config.mjs. Do not edit _adherence.oxlintrc.json.')
  process.exit(1)
}
console.log('v import-rule: gate is alive (3 violating shapes reported, barrel allowed).')
process.exit(0)

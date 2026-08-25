// Design-system adherence gate. The RULES live in _adherence.oxlintrc.json — the byte-copy of
// the design system's own shipped ruleset (only its parse-blocking "x-omelette" metadata block
// was stripped) — and this wrapper only executes them. ESLint is the runner because oxlint
// (checked at 1.79) cannot execute `no-restricted-syntax`, and that rule carries the ruleset's
// substance: the raw-hex/px/font-literal nudges and every per-component prop/enum contract.
import { readFileSync } from 'node:fs'
import react from 'eslint-plugin-react'
import tsParser from '@typescript-eslint/parser'

const rc = JSON.parse(readFileSync(new URL('./_adherence.oxlintrc.json', import.meta.url), 'utf8'))

// The shipped no-restricted-imports patterns match bare `components/...` specifiers. This app
// reaches the same internals through its `@/` alias, so mirror each pattern with an alias twin —
// an app-side adaptation, not a change to the vendored ruleset.
const restrictedImports = structuredClone(rc.rules['no-restricted-imports'])
for (const p of restrictedImports[1].patterns) {
  p.group = [...p.group, ...p.group.map((g) => `@/${g}`)]
}

// ---------------------------------------------------------------------------
// The per-component prop/enum selectors are NOT executed. This is the app-side
// adaptation layer, so the filter goes here; _adherence.oxlintrc.json stays a
// byte-copy and is never edited.
//
// WHY THEY ARE WRONG, not merely noisy:
// The vendored ruleset carries 56 per-component selectors, each a regex allowlist
// of the props a component "declares" — authored against the design system's
// PLAIN-JS source, where `Button` declared six props. This port's Button is
//     export function Button({ ... }: ButtonProps)
//     interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>
// so `onClick`, `disabled`, `type` and every `aria-*` are correct AND type-safe.
// A regex cannot see `extends`, so the rule reports correct code as a violation.
//
// AND THE STRONGER CHECK ALREADY RUNS: `tsc --noEmit` validates every prop
// against the real interface — it catches a genuinely wrong prop that these
// selectors would miss (a typo'd handler with a valid-looking name), and it never
// flags a valid one. The selectors are therefore redundant where they are right
// and wrong where they are not.
//
// WHY FREEZING THEM AT 195 DOES NOT WORK:
// they are not a fixed debt to burn down. The next legitimate
// `<Button onClick={…} disabled>` makes it 197 and fails the build — the gate
// would block correct code on a rule that is wrong about it. Any ceiling over a
// permanently-false-positive family is a countdown, not a ratchet.
//
// Measured at the time of this change: 662 total = 362 Raw px + 105 Raw hex
// + 195 per-component. Removing the 195 leaves 467 real signals.
// Recorded in RESTRUCTURE-BASELINE.md.
const KEEP_MESSAGE = /^(Raw |Font not provided)/
const restrictedSyntax = (() => {
  const [severity, ...selectors] = rc.rules['no-restricted-syntax']
  const kept = selectors.filter((s) => KEEP_MESSAGE.test(s.message ?? ''))
  // Fail loudly if the vendored ruleset is re-vendored and the message wording
  // changes: a filter that silently matches nothing would disable the whole gate,
  // which is the same class of failure as a lint glob that stops matching.
  if (kept.length === 0) {
    throw new Error(
      'adherence: KEEP_MESSAGE matched 0 of ' +
        selectors.length +
        ' selectors in _adherence.oxlintrc.json — the vendored message wording changed. ' +
        'Fix the filter; do not edit the byte-copy.',
    )
  }
  return [severity, ...kept]
})()

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { react },
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...rc.rules,
      'no-restricted-imports': restrictedImports,
      'no-restricted-syntax': restrictedSyntax,
    },
  },
  // The ruleset's own override: the barrel may import component internals.
  {
    files: ['src/components/index.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
]

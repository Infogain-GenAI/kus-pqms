// Design-system adherence gate. The RULES live in _adherence.oxlintrc.json — the byte-copy of
// the design system's own shipped ruleset (only its parse-blocking "x-omelette" metadata block
// was stripped) — and this wrapper only executes them. ESLint is the runner because oxlint
// (checked at 1.79) cannot execute `no-restricted-syntax`, and that rule carries the ruleset's
// substance: the raw-hex/px/font-literal nudges and every per-component prop/enum contract.
import { readFileSync } from 'node:fs'
import react from 'eslint-plugin-react'
import tsParser from '@typescript-eslint/parser'
import { NUMERIC_DIM_MESSAGE } from './scripts/ds-messages.mjs'

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

// ---------------------------------------------------------------------------
// CLOSING THE NUMERIC LOOPHOLE.
//
// The vendored `Raw px value` selector matches a STRING containing `px`:
//
//     padding: '12px 14px'   // warns
//     gap: 20                //  silent — the identical hard-coded value
//
// So a developer blocked by the gate learns that deleting the quotes and the
// `px` makes the warning disappear, without a token being used. That is a gate
// teaching the opposite of what it exists for, and it is why this lands BEFORE
// the Step 8 conversion pass rather than after: converting '20px' -> 20 while the
// hole is open drains one bucket into another.
//
// Scale, measured in RESTRUCTURE-BASELINE.md with this exact selector: 348
// numeric dimensions invisible to the gate, against 4 string-px values on the
// same 15 properties. 98.9% of the hard-coded dimensions on these properties
// were unobserved.
//
// `[value>0]` deliberately skips `padding: 0` — a bare zero needs no unit and no
// token, and flagging it would be noise that trains people to ignore the rule.
//
// This selector is APP-SIDE and additive. It is not in _adherence.oxlintrc.json
// and must not be added there: the byte-copy is the design system's shipped
// ruleset, and this is this port's own adaptation.
//
// Its message text is the join key with scripts/ds-gate.mjs's `numeric` family.
// Both sides import it from one place so a reworded message cannot silently
// empty that family's count.
const NUMERIC_DIM_PROPS =
  '^(padding|margin|gap|width|height|top|right|bottom|left|borderRadius|fontSize|minWidth|maxWidth|minHeight|flexBasis)$'

const numericDimension = {
  selector: `Property[key.name=/${NUMERIC_DIM_PROPS}/] > Literal[value>0]`,
  message: NUMERIC_DIM_MESSAGE,
}

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
      'no-restricted-syntax': [...restrictedSyntax, numericDimension],
    },
  },
  // The ruleset's own override: the barrel may import component internals.
  {
    files: ['src/components/index.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
]

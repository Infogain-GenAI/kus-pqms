// Design-system adherence gate. The RULES live in _adherence.oxlintrc.json — the byte-copy of
// the design system's own shipped ruleset (only its parse-blocking "x-omelette" metadata block
// was stripped) — and this wrapper only executes them. ESLint is the runner because oxlint
// (checked at 1.79) cannot execute `no-restricted-syntax`, and that rule carries the ruleset's
// substance: the raw-hex/px/font-literal nudges and every per-component prop/enum contract.
import { readFileSync } from 'node:fs'
import react from 'eslint-plugin-react'
import tsParser from '@typescript-eslint/parser'
import { JSX_COPY_MESSAGE, NUMERIC_DIM_MESSAGE } from './scripts/ds-messages.mjs'

const rc = JSON.parse(readFileSync(new URL('./_adherence.oxlintrc.json', import.meta.url), 'utf8'))

// The shipped no-restricted-imports patterns match bare `components/...` specifiers. This app
// reaches the same internals two other ways, so each pattern gets TWO twins — an app-side
// adaptation, not a change to the vendored ruleset.
//
// ⚠️ THE THIRD TWIN IS THE ONE THE WORKSPACE SPLIT MADE NECESSARY, AND IT IS WHY THIS RULE
// COULD HAVE GONE SILENT. Before the split, components lived at src/components/** and were
// imported as '@/components/...'. They now live in packages/ui-library and are imported as
// '@pqms/ui-library'. The vendored patterns match `components/**`; the '@/' twins match
// `@/components/**`. AFTER THE MOVE BOTH MATCH NOTHING.
//
// A no-restricted-imports pattern that matches nothing DOES NOT ERROR. It reports zero
// violations, exactly like a clean codebase. And this family's ceiling was ALREADY 0 before
// the split, so the count could not have revealed the breakage either — 0 before, 0 after,
// gate dead in the middle. That is the precise failure 30/33 and steps-for-new-repo.md Step 6
// warn about, and the count is not the instrument that catches it.
//
// What catches it is scripts/check-import-rule.mjs, which feeds the rule a deliberately
// violating import and fails if it is NOT reported. Run it whenever these patterns or the
// package layout change.
const restrictedImports = structuredClone(rc.rules['no-restricted-imports'])
for (const p of restrictedImports[1].patterns) {
  p.group = [
    ...p.group,
    // in-app alias twin: '@/components/core/**'
    ...p.group.map((g) => `@/${g}`),
    // package-specifier twin: '@pqms/ui-library/src/components/core/**' and any deep path
    // under the package that reaches an internal rather than the barrel.
    ...p.group.map((g) => `@pqms/ui-library/**/${g}`),
    ...p.group.map((g) => `@pqms/ui-library/src/${g}`),
  ]
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

/*
 * ─── HARDCODED USER-FACING COPY ─────────────────────────────────────────────
 *
 * Tier 0 bans hardcoded copy; nothing measured it. Vue co-locates every
 * component's strings in a sibling `*.i18n.ts` and this port's equivalent is
 * `*.copy.ts`, so this selector is the burn-down that gets us there.
 *
 * ⚠️ IT MATCHES `JSXText` ONLY — TEXT BETWEEN TAGS. Not string props, not
 * `aria-label`, not `placeholder`. Those are copy too and eventually belong in
 * the same modules, but a selector that swept them in would also flag every
 * `className`, `data-testid`, `role` and token reference in the codebase —
 * thousands of matches, none of them copy. A rule whose output is mostly noise
 * does not get fixed; it gets disabled. Text nodes are the unambiguous subset,
 * and widening is a later, separate pass.
 *
 * The regex requires TWO consecutive letters somewhere in the node. That skips
 * punctuation-only text — the separator dots, arrows and slashes that sit
 * between elements — which is markup, not language.
 */
const jsxCopy = {
  selector: 'JSXText[value=/[A-Za-z]{2}/]',
  message: JSX_COPY_MESSAGE,
}

export default [
  {
    /*
     * ─── ⚠️ VITE'S TEMP CONFIG IS NOT SOURCE, AND LINTING IT IS A RACE ────────
     *
     * `ds-gate.mjs` calls `eslint.lintFiles(['apps', 'packages'])` — DIRECTORY
     * targets, so ESLint enumerates every lintable file it finds, `.mjs`
     * included, and only then applies the `files` globs below to decide which
     * rules run. Enumeration still parses.
     *
     * While Vite loads a config it writes `vite.config.ts.timestamp-<n>.mjs`
     * beside it and deletes it moments later. The four ds families run
     * concurrently with the test suite, so ESLint enumerated one of those temp
     * files and vitest removed it mid-run:
     *
     *     Error: ENOENT … apps/portal/vite.config.ts.timestamp-….mjs
     *     Error [RolldownError]: Parse failed with 1 error
     *
     * ⚠️ THE CONSEQUENCE IS WORSE THAN A FLAKE. `lint:ds:values` FAILED FOR
     * REASONS THAT HAVE NOTHING TO DO WITH LINT, which means a ds ceiling can be
     * computed from a crashed run — the same "a number from a failed run is not a
     * count" problem the ceilings exist to prevent. And a gate that fails
     * infrastructurally teaches people to retry gates until green.
     *
     * Ignored rather than serialised: the file is generated, transient, and never
     * ours to lint. Scheduling around it would have cost wall-clock and left the
     * race live for anyone running the checks another way.
     */
    ignores: ['**/*.timestamp-*.mjs'],
  },
  {
    // ⚠️ THREE src ROOTS NOW, NOT ONE. Before the workspace split this was a single
    // 'src/**/*.{ts,tsx}'. That glob still parses after the move and matches NOTHING,
    // because there is no top-level src/ any more — and a no-restricted-syntax rule whose
    // glob matches nothing reports zero violations rather than erroring. The values count
    // would have dropped 467 -> 0 and read as a clean codebase.
    //
    // The ceilings are what catch this one: ds-gate.mjs fails on a count ABOVE its ceiling,
    // and a drop to zero would be silently ratcheted in as success. So the acceptance check
    // for the split is "counts unchanged AND non-zero", never "counts pass".
    files: [
      'apps/*/src/**/*.{ts,tsx}',
      'packages/*/src/**/*.{ts,tsx}',
    ],
    plugins: { react },
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...rc.rules,
      'no-restricted-imports': restrictedImports,
      'no-restricted-syntax': [...restrictedSyntax, numericDimension, jsxCopy],
    },
  },
  // The ruleset's own override: the barrel may import component internals.
  {
    // The ruleset's own override: the barrel may import component internals.
    // Two entries now — the vendored barrel moved into the package, and the package's own
    // public entry re-exports it. Both are barrels by definition.
    files: [
      'packages/ui-library/src/components/index.ts',
      'packages/ui-library/src/index.ts',
    ],
    rules: { 'no-restricted-imports': 'off' },
  },
]

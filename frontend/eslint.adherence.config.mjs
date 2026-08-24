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
    },
  },
  // The ruleset's own override: the barrel may import component internals.
  {
    files: ['src/components/index.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
]

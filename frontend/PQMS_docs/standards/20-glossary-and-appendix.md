# 20 — Glossary and Appendix
**Tier:** 2
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
Config snippets, code templates, commands reference, and a
TECHNICAL/engineering-term glossary (acronyms and jargon used across
the standards files themselves — e.g. RBAC, CSP, PKCE, ITP, JIT, HMR,
testid, WCAG). Domain/business terms (Issue, DTC, roles, screens,
backend services) belong exclusively to
17-domain-glossary-and-business-context.md — this file does not
duplicate that content.

## Technical / Engineering Glossary
**Which other files use a given term is not tracked here.** An earlier
revision attached a `(used in: …)` list to every entry and hand-maintained
it; checked against the corpus, 14 of the 25 lists were wrong — some named
a file that never mentions the term at all. That is not a copy-editing
slip, it is the failure this file's own "the rule needs a mechanism, not
a restatement" principle (see 13-security-standards.md's parallel case)
describes: a fact about 21 other files, re-derived by hand on every
revision, drifts the moment any one of them changes. It is a **computed
fact about the corpus**, not a decision, so it is computed: see the
generated distribution document's derived cross-reference index, which
`build-standards-doc.mjs` regenerates from every tier file on every run
and can never go stale the way a hand-written list can.

- **RBAC** — Role-Based Access Control. Included here as the industry
  term, with a correction worth stating plainly: this app's actual
  model is **named-permission**-based, not a direct role check — the
  frontend consumes a resolved-permissions object (BRD FR-SEC-011) and
  every gate checks a named permission, never the role directly (see
  00, 08). "RBAC" appears in these standards as shorthand for that
  broader access-control category, not as a literal description of the
  mechanism.
- **CSP** — Content Security Policy. A browser-enforced HTTP
  header/meta-tag restricting which script/style/connection origins a
  page may load from.
- **PKCE** — Proof Key for Code Exchange. An OAuth extension that lets
  a public client (like a SPA) safely use the Authorization Code flow
  without a client secret.
- **OIDC** — OpenID Connect. An identity layer on top of OAuth 2.0;
  this app's auth protocol is OIDC Authorization Code Flow + PKCE.
- **ITP** — Intelligent Tracking Prevention. Safari's third-party-
  cookie/storage-blocking privacy feature; the reason Safari's silent
  MSAL re-auth path behaves differently from Chrome/Edge's.
- **JIT** — Just-In-Time. Refers to Tailwind's compiler generating only
  the utility classes actually used in source, rather than shipping a
  full static stylesheet.
- **HMR** — Hot Module Replacement. Vite's dev-server mechanism for
  swapping updated modules into a running page without a full reload.
- **testid / data-testid** — the `data-testid` HTML attribute, queried
  directly in tests independent of visible UI text or ARIA role — the
  deliberate last-resort query priority, used where an element has no
  stable accessible name/role to query by instead.
- **WCAG** — Web Content Accessibility Guidelines. The standard this
  app's accessibility target (2.2 AA) is defined against.
- **ARIA** — Accessible Rich Internet Applications. The W3C
  specification defining roles/states/properties (`role`,
  `aria-checked`, `aria-describedby`, etc.) that expose custom UI
  semantics to assistive technology.
- **NFR** — Non-Functional Requirement. A standard requirements-
  engineering term — **not** PQMS-specific vocabulary. (The content of
  specific NFRs is BRD-sourced domain content and belongs to 08's and
  11's permission-model/accessibility discussions, not this glossary.)
- **ADR** — Architecture Decision Record. A short document capturing
  one architectural decision and its rationale.
- **BFF** — Backend-for-Frontend. A dedicated backend layer serving one
  specific frontend, referenced here as the eventual home for
  HTTP-only-cookie token storage once one exists.
- **SPA** — Single-Page Application.
- **MSAL** — Microsoft Authentication Library — the
  `@azure/msal-browser`/`@azure/msal-react` package family used for
  Entra ID auth in this app.
- **XSS** — Cross-Site Scripting. The injection-of-untrusted-markup
  vulnerability class `dangerouslySetInnerHTML`/`v-html` misuse can
  open.
- **DOM** — Document Object Model.
- **ICU** — International Components for Unicode. The pluralization
  standard react-i18next implements (count-based key variants like
  `_one`/`_other`), which 09 requires instead of hand-rolled
  singular/plural key pairs.
- **BEM** — Block Element Modifier. A CSS class-naming convention this
  app explicitly does **not** use, per 06's Tailwind-only decision.
  Listed because 06 names it when ruling it out.
- **SSO** — Single Sign-On.
- **IdP** — Identity Provider. The party that authenticates a user and
  asserts their identity — Azure AD/Entra ID, in this app's case.
- **ESM** — ECMAScript Modules. The `import`/`export` module system;
  relevant because **React Router v8's own published output is
  ESM-only**. That is a statement about the package React Router ships,
  not about the dependency graph around it: CommonJS elsewhere in that
  graph is fine, and Vite handles it as it always has. An earlier
  revision of this entry said "the dependency chain is ESM-only, no
  CommonJS output permitted" — 00 withdrew exactly that wording as
  broader than the source supports, so this entry was restating a
  retracted claim and citing the file that retracted it.
- **RTL** — React Testing Library. Already self-expanded at first use
  in 10; included here only for one-stop lookup.
- **MSW** — Mock Service Worker. Already self-expanded at first use in
  10; included here only for one-stop lookup.
- **JSX** — JavaScript XML. The syntax extension React components are
  written in.
- **CSF3** — Component Story Format 3, the Storybook authoring format
  24-storybook-authoring.md requires.
- **DoD** — Definition of Done. 28-definition-of-done.md is this
  corpus's; it is the author's gate, distinct from 16's reviewer's
  checklist.
- **LCP / INP / CLS** — Largest Contentful Paint, Interaction to Next
  Paint, Cumulative Layout Shift. The three Core Web Vitals 12 sets as a
  floor.
- **SC** — Success Criterion, a numbered WCAG requirement (e.g. SC 2.5.8
  Target Size). Used throughout 11.
- **Outbox** — the transactional-outbox pattern: a change and its
  side-effect intent commit together, and a separate process performs the
  side effect. Named here because the BRD requires it of notifications
  and a reader may meet the term first in a frontend context.

## Commands Reference

The `package.json` script set to build, by package.

**The task names are not carried forward from `kus-pqms`, and this is
the second attempt at this passage.** An earlier revision reproduced
that repo's names verbatim and claimed "only the type-checker binary
changes" — but 15-devsecops-and-ci-cd.md forbids exactly that: there,
`lint` ran the type-checker while `lint:eslint` ran the linter, so
every CI step name described the wrong tool. Per 15, scripts are named
for what they do: **`typecheck`**, **`lint`**, **`format:check`**.

What does carry forward: the Turbo delegation pattern at the root, and
the Prettier globs (with `.vue` dropped and `.tsx` added).

**Root (the workspace root — `pqms-portal/` in this repository):**
```
dev                   turbo dev
build                 turbo build
test                  turbo test
test:coverage         turbo test:coverage
typecheck             turbo typecheck
lint                  turbo lint
lint:eslint           eslint .
lint:eslint:fix       eslint . --fix
format                prettier --write "{apps,packages}/**/*.{ts,tsx,js,cjs,mjs,json,css}" "*.{json,js,cjs,mjs}"
format:check          prettier --check "{apps,packages}/**/*.{ts,tsx,js,cjs,mjs,json,css}" "*.{json,js,cjs,mjs}"
docs:standards        node scripts/build-standards-doc.mjs
docs:standards:check  node scripts/build-standards-doc.mjs --check
clean                 sh scripts/clean.sh
prepare               [see 23-git-workflow-hooks-and-commits.md — Husky install; the path depends on where the git root sits relative to the workspace root]
```

Four of these exist for reasons stated elsewhere and must not be
dropped as boilerplate:

- **`test:coverage` at the root, delegating through Turbo.** 15
  requires coverage to run for **every** package, not the app alone —
  `kus-pqms` ran `pnpm --filter @pqms/pqms-portal run test:coverage`
  and two packages' tests never executed in CI. A root script fanning
  out is what makes 10's per-package thresholds reachable.
- **`docs:standards` / `docs:standards:check`.** Mandated by 00's
  precedence rule and run as a CI step per 15. `:check` is what makes
  "the generated document is never hand-edited" enforceable instead of
  requested.
- **`typecheck`, not `lint`, for `tsc --noEmit`.** See above.
- **`lint` delegates through Turbo (`turbo lint`), not a bare
  `eslint .`.** This is a deliberate revision of this section's own
  earlier text, which specified `eslint .`/`eslint . --fix` and was
  never updated once `build`, `test`, and `typecheck` all moved to the
  Turbo-delegation pattern — leaving `lint` as the one root command
  that skipped it. `turbo lint` fans out to each package's own `lint`
  script (each already `eslint .`, scoped to that package), gaining
  Turbo's caching and parallelism the other three commands already
  have; there is no reason for `lint` alone to opt out. `lint:eslint`
  and `lint:eslint:fix` are kept as a **separate, deliberate escape
  hatch**: a package-scoped `turbo lint` run never reaches root-only
  files (`eslint.config.js`, `scripts/*.mjs`) because no workspace
  package's `eslint .` is rooted there — `lint:eslint`/`:fix`, run from
  the repo root, are what lints those files. The two are not redundant
  with each other; both are required. Recorded as a live decision in
  18-project-context-and-implementation-status.md next to 05's
  fixtures-mode and 06's React Aria entries.

**`apps/portal`:**
```
dev              vite
build            tsc --noEmit && vite build
preview          vite preview
typecheck        tsc --noEmit
test:unit        vitest
test             vitest run
test:coverage    vitest run --coverage
test:e2e         playwright test
storybook        storybook dev -p 6007
build-storybook  storybook build
```

**`packages/ui-library`:**
```
build            tsc --noEmit
typecheck        tsc --noEmit
storybook        storybook dev -p 6006
build-storybook  storybook build
test             vitest run
test:coverage    vitest run --coverage
```
`build` and `typecheck` are intentionally identical, both
type-check-only: this package has no build output, per 01's "No build
step in either package". `test:coverage` exists so the root
`turbo test:coverage` above reaches this package — without it, this
package's tests run but its coverage is never measured, which is the
`kus-pqms` gap 15 records.

**`packages/design-tokens`:**
```
build            tsc --noEmit -p tsconfig.json
typecheck        tsc --noEmit -p tsconfig.json
test             vitest run
test:coverage    vitest run --coverage
```
Same as `ui-library`: `build` and `typecheck` are identical
type-check-only commands, this package has no build output either, and
`test:coverage` exists for the same all-packages reason.

**On `prepare` / Husky**: **23-git-workflow-hooks-and-commits.md owns
the hook chain**, including this script and the git-root question it
depends on. Not restated here. The one fact worth carrying in a commands
reference: the value is repo-layout-dependent, so a copied string from
another repository will silently install hooks nowhere.

## Config Snippets

**Only genuine gaps** — configuration not already specified in the file
that owns it. Everything else is a one-line cross-reference:

- Prettier settings — fully quoted already in 14. See that file.
- ESLint composition order (base → framework → project overrides →
  Prettier-disabling block) — fully described already in 14. See that
  file.
- tsconfig facts beyond the base file (`noUncheckedIndexedAccess`,
  `jsx: "react-jsx"`, the `noUnusedLocals`/`noUnusedParameters`
  reversal for React) — fully described already in 02. See that file.
- Coverage threshold numbers (85/85/85/85) — fully stated already in
  10. See that file.

**Real gaps, quoted verbatim:**

The `ignores` array for `eslint.config.js`. Provenance: `kus-pqms`'s,
carried forward — every entry still applies:
```js
ignores: [
  "**/dist/**",
  "**/coverage/**",
  "**/storybook-static/**",
  "**/.turbo/**",
  "**/node_modules/**",
  "**/*.d.ts",
  "packages/design-tokens/src/tokens.css",
  "packages/ui-library/src/styles/tokens.css",
  "_bmad/**",
  "docs/**",
  ".claude/**",
],
```

The **shape** of a per-file rule carve-out — one config object naming
the files and switching off exactly one rule, with an inline comment
giving the reason. 11-accessibility-standards.md anticipates needing
this pattern for wrapper components; it is quoted here so the shape is
unambiguous.

The rule name and paths below are `kus-pqms`'s — a Vue a11y rule on
`.vue` files. The React equivalent uses the corresponding `jsx-a11y`
rule name and `.tsx` paths; the structure is what carries forward:
```js
{
  files: [
    "packages/ui-library/src/components/base/BaseSelect/BaseSelect.vue",
    "packages/ui-library/src/components/overlay/BaseTooltip/BaseTooltip.vue",
  ],
  rules: {
    "vuejs-accessibility/no-static-element-interactions": "off",
  },
},
```

`apps/portal/vite.config.ts`'s dev-server proxy configuration.
The four paths and their target vars are carried forward from
`kus-pqms`; note the ordering — the catch-all `/api` entry must come
**last**, or it shadows the three more specific paths above it:
```js
proxy: {
  "/api/v1/master-data": { target: masterDataApiUrl, changeOrigin: true },
  "/api/v1/classification-keys": { target: masterDataApiUrl, changeOrigin: true },
  "/api/notification": { target: notificationApiUrl, changeOrigin: true },
  "/api": { target: issueManagementApiUrl, changeOrigin: true },
},
```

The Vitest `coverage` block. 10-testing-standards.md owns the four
threshold numbers; this is the surrounding block they sit in.

**The globs cover both extensions, and that is load-bearing.** Per 10,
a component spec is `.spec.tsx` and a module spec is `.spec.ts`, so a
`.ts`-only glob excludes half the suite from the exclusion — meaning
every React component spec would count as uncovered *source*. The entry
point is `src/main.tsx`, not `src/main.ts`. 10 names this block as what
makes 85%-from-day-one achievable, so a glob that misses is not a
cosmetic defect: it breaks 10's argument.

Provenance and the reason this is called out: the block is carried
forward from `kus-pqms`, whose globs were Vue-shaped (`*.spec.ts`,
`*.stories.ts`, `src/main.ts`) and were reproduced here unchanged.
15-devsecops-and-ci-cd.md caught the identical defect in
`sonar.test.inclusions` and the fix was not propagated here — which is
the corpus's own rule about re-checking dependents, unapplied.
```js
coverage: {
  provider: "v8",
  reporter: ["text", "lcov", "json-summary"],
  reportsDirectory: "./coverage",
  exclude: [
    "**/*.stories.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
    "src/tests/**",
    "**/*.d.ts",
    "**/*.config.*",
    "src/main.tsx",
  ],
  thresholds: {
    statements: 85,
    branches: 85,
    functions: 85,
    lines: 85,
  },
},
```

`.nvmrc`'s content — referenced by name in 00 and 15:
```
24
```

**`tsconfig.base.json` is not reproduced here.**
02-typescript-standards.md's "Baseline" section carries the
authoritative table of required values and owns them.

This is a deliberate removal. An earlier revision of this file quoted
`kus-pqms`'s `tsconfig.base.json` in full and labelled it "quoted
verbatim" — and it was neither verbatim (it silently dropped a six-line
comment and a commented-out option) nor correct for this repo (it
carried `"target": "ES2020"` and `"jsx": "preserve"`, both of which 02
changes). A config snippet that is wrong in an appendix is worse than
no snippet, because it looks authoritative and reads faster than the
file that actually owns it. Go to 02.

Two values worth stating here because they are easy to get wrong and 02
explains them at length: `target` and `lib` are **ES2022**, not ES2020,
in `tsconfig.base.json` **directly** — not overridden per package.

## Supersedes / absorbs
draft §16 Appendix

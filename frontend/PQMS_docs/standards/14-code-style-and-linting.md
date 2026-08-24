# 14 — Code Style and Linting
**Tier:** 1
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
ESLint, Prettier, export conventions, barrel-file patterns, and naming
conventions for this React app.

## ESLint: flat config only
One config: `eslint.config.js` at the workspace root, ESLint `^10.7.0` or
later.
**Never create or reference `.eslintrc.*`** — this repo is flat-config
only.

**Required composition order**, because the last two positions are
load-bearing:

1. Base recommended — `js.configs.recommended`, then
   `tseslint.configs.recommended`.
2. Framework plugins — `eslint-plugin-react`,
   `eslint-plugin-react-hooks`.
3. Accessibility — `eslint-plugin-jsx-a11y`.
4. Project-specific rule overrides.
5. **`eslint-config-prettier` last**, to disable any stylistic rule
   that would conflict with Prettier's own formatting.

Position 5 must be last or Prettier and ESLint will fight over
formatting. Position 4 must come after 1–3 or the overrides get
overwritten by the presets they are meant to override.

Provenance: this chain is carried forward from the prior Vue
implementation of this product (repo `kus-pqms`,
`frontend/eslint.config.js`), which used the same five-position order
with `eslint-plugin-vue` and `eslint-plugin-vuejs-accessibility` in
positions 2 and 3.

The a11y package is **`eslint-plugin-jsx-a11y`** — the full name,
including `-plugin-`. An earlier revision of this file wrote
`eslint-jsx-a11y`, which is not a real package and produces a failing
install.

This file owns the a11y plugin's **position** in the chain and nothing
else about it. **Which preset, which rules, and at what severity is
owned by 11-accessibility-standards.md** — including the one rule that
must be enabled by hand because neither of the plugin's presets turns
it on. Do not set a11y rule severities here.

## `eslint-plugin-react-hooks` rule set
Use the plugin's **`recommended`** preset. The React Compiler's lint
rules ship inside it — they are not a separate plugin or an opt-in
extra — so enabling `recommended` is what satisfies
03-react-component-patterns-and-naming.md's hard requirement on those
rules. Prefer the preset over hand-listing rules so newly added
recommended rules arrive automatically.

The `recommended` preset's rules (17), covering both the classic hooks
rules and the Compiler-derived diagnostics:

```
exhaustive-deps                rules-of-hooks
component-hook-factories       config
error-boundaries               gating
globals                        immutability
incompatible-library           preserve-manual-memoization
purity                         refs
set-state-in-effect            set-state-in-render
static-components              unsupported-syntax
use-memo
```

`recommended-latest` also exists and additionally carries experimental
Compiler rules. **Use `recommended`, not `recommended-latest`** — a new
codebase has no reason to absorb churn from an experimental rule set.

Compiler diagnostics surface through this plugin even before the
Compiler itself is adopted, so the preset is useful from the first day
of scaffolding rather than only after the Compiler is switched on.

**This preset is a necessary but incomplete detector.** It does not
catch every Rules-of-React violation that causes the Compiler to skip a
component — see 03's "Memoization and the React Compiler" section and
12-performance-guidelines.md's "Review checklist", which owns the
verification step that covers what lint misses. Do not treat a clean
lint run as proof a component was optimized.

## Prettier
Exactly one config exists: `.prettierrc.json` at the workspace root, applying
monorepo-wide. **No per-package overrides** — one Prettier config for
the whole repo.

Real settings, verbatim:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "endOfLine": "lf"
}
```

That is: 100-character print width, 2-space tabs, semicolons on, double
quotes (`singleQuote: false`), trailing commas everywhere valid, LF line
endings. Provenance: carried forward verbatim from `kus-pqms`
(`frontend/.prettierrc.json`).

## Export conventions
A settled decision, stated plainly so it is not re-litigated per-file:

**React components: default export, one component per file.**

General React community guidance often favours named exports for
components instead. That guidance is noted and **not** followed: the
tradeoff was weighed and default-export-per-component won.

Provenance: `kus-pqms` was effectively 100% default-export for
components — every SFC is the file's default export via
`<script setup>`'s implicit default, and of 124 `.vue` files, 122 used
`<script setup>`, 2 had no script block at all, and **zero** used an
explicit `defineComponent`/`export default` alternative. A codebase
that consistent is worth matching rather than diverging from on general
principle.

**Non-component modules — hooks, stores, services, utils, types: named
exports only, no default exports.** Every function, const, and type is
a named export.

Provenance: `kus-pqms` was equally consistent in the other direction —
across its composables, stores, services, and shared utils there were
**zero** default exports. The split is deliberate: default export
signals "this file is one component", named exports signal "this file
is a collection of things".

## Barrel files (`index.ts`)
Two re-export patterns, used situationally:

**Named re-export**, for component barrels:

```ts
export { default as BaseButton } from "./BaseButton";
export type { BaseButtonProps, BaseButtonVariant } from "./BaseButton.types";
```

**Wildcard re-export**, for modules that are already all-named-exports
(e.g. a `stores/index.ts` aggregating multiple store modules):

```ts
export * from "./auth";
export * from "./notification";
export * from "./issue-management";
```

### Heavy-dependency exclusion — a reusable convention, not a one-off
`BaseMarkdownEditor` is excluded from `ui-library`'s main barrel's
**value** export, because it pulls in TipTap and its bundled ProseMirror
engine — a large third-party dependency. Re-exporting it from the main
entry point would put that weight in every consumer's bundle whether or
not they render a rich-text editor. Its value export lives only at a
separate subpath (`@pqms/ui-library/markdown-editor`); its **types**
are still exported from the main entry point, because types are erased
at build time and cost nothing to re-export.

Provenance: `kus-pqms` did exactly this, with the reasoning recorded in
a comment at the exclusion site in `packages/ui-library/src/index.ts` —
worth imitating, since the omission looks like an oversight otherwise.

**This is the standard approach for any future component with a
similarly heavy dependency** — not something that only applied to
`BaseMarkdownEditor` historically. When a new component pulls in a large
third-party library, exclude its value export from the main barrel,
re-export it from its own subpath instead, and keep its types in the
main entry point.

## Naming conventions
- **Components**: PascalCase (`IssueListPage`, `BaseButton`).
  `ui-library` components specifically use the `Base*` prefix — never
  `Pqms*`, which is stale for components (see 06-styling-and-design-
  tokens.md's "Component naming").
- **Shared variant/state/size types in `ui-library`**: PascalCase with
  the **`Pqms*`** prefix, in `packages/ui-library/src/types/`. See
  06-styling-and-design-tokens.md's "Component naming" for the
  `Base*`/`Pqms*` split and why both conventions are live — that file
  owns it, and it is not restated here.
- **Functions, variables**: camelCase.
- **Hooks**: camelCase, prefixed `use*` (`useDebouncedCallback`,
  `usePermissions`, etc.). **The `use*` prefix is reserved for real
  hooks.** A plain predicate or helper that is not a hook must not be
  `use*`-named — the `eslint-plugin-react-hooks` `recommended` preset
  above enforces the Rules of Hooks on `use*` names, so a `use*`-named
  non-hook is a lint failure, not a style choice. The fixtures-mode
  predicate is the known instance: name it `isFixtureMode()`, never
  `useFixtures()` — see 05-api-integration-and-data-fetching.md's
  "Fixtures mode", which owns that predicate.
- **True constants**: UPPER_SNAKE_CASE (e.g. `BASE_BUTTON_DEFAULT_SIZE`).
- **Non-component file names**: kebab-case for standalone
  non-component files (utils, config, services, hooks), except: (1)
  filenames a build tool or framework mandates exactly (e.g.
  `vite.config.ts`, `eslint.config.js`, `tsconfig.json`) — use the
  tool-required name as-is; (2) co-located component-companion files,
  which take the PascalCase name of the component they belong to, per
  the conventions already established in 02-typescript-standards.md
  (`ComponentName.types.ts`) and 09-i18n-and-localization.md
  (`ComponentName.i18n.ts`).

## A `warn` needs a reason and a trigger, or it is permanent
The prior repository sets its project-convention and accessibility rules to
`warn` rather than `error`, deliberately:

> Pre-existing issues start as warnings so CI stays green while they are burned
> down incrementally; tighten to "error" later.

with the accessibility block carrying a named owner and phase for the
re-escalation, and the closing line "kept visible, not silenced".

**That is the right mechanism and it needs one guardrail.** A rule at `warn`
with no recorded trigger is not on a schedule — it is a rule the project has
quietly decided not to enforce, and warnings scroll past in CI output forever.

**The rule.** Any rule configured below `error` carries, in the config file
itself: (1) why it is not `error` yet, (2) what event flips it, (3) who owns
that. A `warn` without all three is a defect in the config, and reviewable as
one. 30-restructuring-an-existing-react-project.md uses this as its primary
gate-adoption mechanism.

The same applies to a per-file or per-line disable. The prior repository's two
file-level disables carry a paragraph of evidence each — including one that
explains why an inline `eslint-disable-next-line` was not usable and cites the
observed test breakage it caused. **A disable with no recorded reason is
indistinguishable from a mistake.**

## Two compiler flags the prior config turns off, and this one turns on
The prior `tsconfig.base.json` leaves `noUnusedLocals` and `noUnusedParameters`
to ESLint rather than the compiler, with the reason recorded: its template
compiler does not count bindings used **only** in a template as reads, so both
flags raise false positives on legitimate component state.

**That reason is framework-specific and does not transfer.** In this repository,
component markup is ordinary expression code and a binding used in it is an
ordinary reference — so there are no false positives to work around.

**Turn both flags on in the compiler.** The lint rule stays too; they disagree
usefully at the edges (the compiler is stricter about parameters, the lint rule
understands the `^_` convention). This is a case where copying the prior config
forward would carry a workaround for a problem that no longer exists — worth
watching for generally, not only here.

## Line endings, and the format gate that cannot pass without them
The prior repository runs `prettier --check` as a CI gate with
`endOfLine: "lf"`, has an `.editorconfig` declaring `end_of_line = lf`, and has
**no `.gitattributes`**. On a platform that checks out CRLF, that combination
makes the format gate unsatisfiable locally while remaining green in CI — the
files in CI came from a Linux checkout.

**This repository ships a `.gitattributes` with `* text=auto eol=lf` from the
first commit**, before any formatting baseline is written. Retrofitting it later
means renormalising the whole tree, which is a diff touching every file — and
23-git-workflow-hooks-and-commits.md's blame-ignore rule then applies to it.

Two supporting files, both small and both easy to omit:

- **`.editorconfig`** — charset, LF, final newline, trimmed trailing whitespace,
  2-space indent. **Exempt `[*.md]` from trailing-whitespace trimming**: two
  trailing spaces are a Markdown line break, and trimming them silently reflows
  prose.
- **`.npmrc`** — `engine-strict=true`, so the `engines` range in `package.json`
  is enforced at install rather than documented and ignored. Any loosening
  (e.g. `strict-peer-dependencies=false` for a toolchain running ahead of its
  plugins' declared peer ranges) carries its reason in the file.

**Prettier ignores `**/*.md`.** Prose and tables are hand-wrapped for meaning;
reflowing them produces large diffs that mean nothing and hide the one line that
changed.

## pnpm 11 moved the configuration file

This file specifies `.npmrc` with `engine-strict=true`. **On pnpm 11 that no
longer works**: per `docs/STACK.md` §3, pnpm 11 "no longer reads non-auth
settings from `.npmrc`" and has removed `onlyBuiltDependencies`. Non-auth
settings live in **`pnpm-workspace.yaml`**; `.npmrc` carries the registry and
authentication only.

So the rule stands and the location changes:

| Setting | Where it goes now |
|---|---|
| Engine enforcement | `pnpm-workspace.yaml` |
| `autoInstallPeers`, `strictPeerDependencies` | `pnpm-workspace.yaml` |
| `allowBuilds` (replaces `onlyBuiltDependencies`) | `pnpm-workspace.yaml` |
| Registry, auth tokens | `.npmrc` |

**Verify the engine setting takes effect rather than assuming it.** A setting
written to the file pnpm no longer reads fails silently and looks identical to a
setting that is working — which is the whole reason this correction is needed.

## Prettier is invoked but not installed

`docs/STACK.md` §8 item 5: Lefthook runs `pnpm exec prettier --write` on staged
frontend files, and **`prettier` is not a declared dependency** in
`frontend/package.json`. The same paragraph records `frontend/.storybook/` on
disk with no `storybook` dependency.

This file makes Prettier the formatter and the source of the format gate, so
this is directly in its path. **Establish in Phase 0 which of two things is
happening** — `pnpm exec` resolving a hoisted transitive copy (working by
accident, will break on any dependency change) or failing and being ignored.

Then declare the dependency explicitly. **Do not delete the hook step**: a
repository with a formatter in its hooks and none in its manifest is one commit
away from a whole-tree reformat by whoever installs it globally.

## The TypeScript version is 5.9, not 6

Which means the two compiler flags this file argues for — `noUnusedLocals` and
`noUnusedParameters` — behave exactly as described, and the framework-specific
reason the prior repository disabled them still does not apply. Turn both on.
02-typescript-standards.md carries the version correction.

## Formatting is not the only per-language gate here

The frontend shares hooks with a Java backend (Spotless + google-java-format), a
TypeScript CDK project, and Python scripts (ruff). 23-git-workflow-hooks-and-commits.md
owns the mechanics. The rule that matters here: **the frontend's formatter
configuration is scoped to frontend paths**, and never reaches
`backend/`, `infra/` or `.claude/`. A Prettier glob that escapes its component
reformats another team's code, and they find out from `git blame`.

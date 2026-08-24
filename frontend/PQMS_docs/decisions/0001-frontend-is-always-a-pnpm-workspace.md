# ADR 0001 — `frontend/` is always a pnpm workspace

- **Status:** Accepted, 2026-08-25
- **Deciders:** Prisilla Ghadi
- **Related:** `../standards/00-core-rules.md` (path convention),
  `../standards/01-project-structure-and-architecture.md` (target structure),
  `../standards/33-polyglot-monorepo-integration.md`,
  `../standards/30-restructuring-an-existing-react-project.md` (Phase 2),
  `../steps-for-new-repo.md` (decision 7)

---

## Context

Every path in this corpus is stated relative to **the pnpm workspace root** —
the directory holding `pnpm-workspace.yaml` and `turbo.json`. That convention
was adopted in `00-core-rules.md` REV 11 specifically so the corpus would be
portable to a different repository.

The observed `KUS-PQMS/frontend/` tree is **flat**: `src/` sits directly under
`frontend/`, with no `apps/` and no `packages/`. It is a 1:1 React port of an
HTML prototype, with three concerns already separated by folder inside that
single `src/`:

- `src/components/` — the design-system port, generic, behind a barrel, with a
  documented rule that it must not import from `features/` or `data/`
- `src/styles/design-system/` — a **byte-copy** of the vendored design system,
  gated by `tokens:check` against `design-system-manifest.json`
- `src/features/`, `src/app/`, `src/data/` — the application

So the question was whether the corpus should yield to the flat layout (making
`frontend/` itself the workspace root) or the layout should move to the corpus.

## Decision

**`frontend/` is a pnpm workspace. Always. The project is never flat.**

The observed tree is a **defect to be corrected during the restructure**, not a
constraint the corpus adapts to. `01-project-structure-and-architecture.md`'s
target structure stands unchanged, and Phase 2 of the restructure performs the
split.

## Consequences

### The boundaries already exist — this makes them enforceable

The port already maintains the layering rule by convention and documentation.
A workspace turns that convention into a **dependency graph the package manager
enforces**: `ui-library` cannot import from the app because the app is not one
of its dependencies. That is the point of the split, and it is worth more here
than in a greenfield project precisely because the rule is already being kept
by hand.

### Three tool boundaries move with the code, and two of them fail silently

This is the part that needs care, and it is the reason this ADR exists rather
than a one-line note.

| Tool | Currently points at | Failure mode if not moved |
|---|---|---|
| `tokens:check` | `src/styles/design-system/tokens/*.css` | **loud** — scrape finds nothing, gate errors |
| `tokens:gen` | writes `src/tokens/tokens.generated.ts` | **loud** — path no longer exists |
| `no-restricted-imports` in the adherence gate | `components/**` and `@/components/**` | **silent** — see below |
| `no-restricted-syntax` file glob `src/**/*.{ts,tsx}` | one `src/` | **silent** — see below |

**The two silent ones are the hazard.** A lint rule whose glob no longer matches
does not error. It reports zero violations and the build goes green. So a
workspace split can **disable both halves of the adherence gate while every
check passes**, and the first symptom is a raw hex colour shipping six weeks
later.

Concretely: once components live in `packages/ui-library`, they are imported as
`@pqms/ui-library`, and the vendored patterns matching `components/core/**` and
their `@/`-prefixed twins match **nothing**. The wrapper
(`eslint.adherence.config.mjs`) must grow a third alias twin for the package
specifier — and that is an app-side adaptation, so it is permitted there and
still leaves `_adherence.oxlintrc.json` byte-identical.

**Therefore: the move and the tool re-pointing land in the same commit, and the
commit records the warning count before and after.** An unchanged count is the
evidence that the gate still sees the code. **A count that drops to zero is not
success — it is the failure described above.**

### Package assignment

| Currently | Goes to |
|---|---|
| `src/components/**` | `packages/ui-library` |
| `src/icons/Icon.tsx` | `packages/ui-library` — generic, and the only sanctioned icon path |
| `src/styles/design-system/**`, `design-system-manifest.json`, both token scripts | `packages/design-tokens` |
| `src/tokens/tokens.generated.ts` | `packages/design-tokens` |
| `src/app/**`, `src/features/**`, `src/data/**`, `src/styles/global.css` | `apps/portal` |

`src/app/chrome.tsx` holds app-wide shared primitives (`PageContainer`, `Modal`,
`SectionCard`) that know nothing about issues. It is a **judgement call**: they
are generic enough for `ui-library`, and they are also the app's chrome.
**Leave them in `apps/portal` for now** — moving them is a separate decision
with its own fidelity risk, and 01's app-wide shared location exists for
exactly this case.

### The CSS import order is load-bearing and survives the move

`main.tsx` imports the design-system stylesheet before anything else because
Vite emits CSS in import order, and a component import above those lines inverts
the cascade. **After the split that import becomes a package specifier and the
ordering constraint is unchanged** — it must still be first. Record it in the
moved file's comment, because the reason becomes less obvious once the path
stops looking local.

### Fidelity captures are the acceptance test

A workspace split is a pure move. **The Playwright screenshot comparison should
be byte-identical before and after**, which makes it the strongest available
proof that the move changed nothing. Run it as the Phase 2 acceptance criterion.

### Cost

Real, and paid once: `pnpm-workspace.yaml`, three `package.json` files,
`tsconfig` project references, the `@/` alias replaced by package specifiers at
every cross-boundary import, and Vite configured to resolve workspace packages.
The vendored CSS `@source`/import paths need checking.

## Options rejected

**Make `frontend/` itself the workspace root and stay flat.** Cheaper today, and
it was genuinely defensible — the boundaries are already documented and kept.
Rejected because a documented boundary is kept until the first deadline: nothing
prevents a `features/` import inside `components/`, and the design-system port's
re-verifiability against its source depends on that boundary holding
permanently. It also leaves `ui-library` unpublishable and unversionable if a
second consumer ever appears.

**Split later, after conformance.** Rejected because every conformance change
would be made against paths that are about to move, and the adherence gate's
import patterns would be rewritten twice.

**Split into more than three packages** (separate `icons`, separate `data`).
Rejected as premature — `01`'s three-package structure is the target, and a
fourth package is a decision to make when something needs it.

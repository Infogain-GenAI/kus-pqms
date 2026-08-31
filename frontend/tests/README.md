# tests/

**The rule: this tree mirrors `apps/portal/src/`.** A test lives at the path its
subject lives at. Nothing goes at the top level.

```
tests/
  app/                          ← apps/portal/src/app/
  data/                         ← apps/portal/src/data/
  services/                     ← apps/portal/src/services/ (+ api/)
  shared/                       ← apps/portal/src/shared/
  routes/                       ← apps/portal/src/routes.tsx
  features/
    issues/
      IssueList/                ← features/issues/issue-list/
      IssueEntry/               ← features/issues/CreateIssueScreen + issue-entry/
      IssueDetails/             ← features/issues/workspace/**
    notifications/              ← features/notifications/
  ui-library/                   ← packages/ui-library/src/
  support/                      ← harnesses, not tests
```

## Why it was flat, and why that stopped working

Every test file sat directly in `tests/`, 28 of them, sorted alphabetically —
so `dataLayer`, `dtcCatalog` and `errorBoundary` were neighbours despite having
nothing to do with each other, and the only way to find the tests for a screen
was to already know their filename. Vue's suite has mirrored `src/` since the
start; this is that structure, arrived at later.

The flat layout also made a specific mistake easy: adding a test file and not
noticing an existing one already covered the same module. Co-location makes that
visible.

## Placing a new file

Ask what the test's SUBJECT is — the module it would break if you deleted it —
and put the test beside that module's mirror. When a test spans several modules,
the subject is the one whose behaviour the test would still be about if the
others were stubbed.

A few of the current placements are worth knowing because they are not obvious
from the filename alone:

| File | Lives in | Because |
| --- | --- | --- |
| `issueListView.test.tsx` | `data/` | Its subject is `data/issueListView.ts`; it renders `IssueListScreen` only to prove the persistence works end to end. |
| `issueLock.test.tsx` | `data/` | Same: `data/issueLock.ts` is the rule, the workspace renders are the evidence. |
| `dataLayer.test.ts` | `services/` | Covers `api/` and `services/` together, because the point of it is that the two are interchangeable. |
| `capabilityGuard.test.tsx` | `app/` | `app/capabilityGuard.ts` is the subject; `routes/` holds only the route tree's own test. |
| `a11y-sweep.test.tsx` | `ui-library/` | It enumerates the component barrel rather than testing one component. |

## `support/`

Harnesses, not tests — `vitest.config.ts` includes `tests/**/*.test.{ts,tsx}`,
so nothing here is collected as a suite. `dataRouter.tsx` carries a `Request`
shim as an import side effect; read its header before importing it somewhere new.

⚠️ **Imports of `support/` are relative, so they depend on depth.** A file moved
between directories must have its `../support/...` updated to match — there is no
alias for it. Five files needed exactly that fix when this structure was
introduced.

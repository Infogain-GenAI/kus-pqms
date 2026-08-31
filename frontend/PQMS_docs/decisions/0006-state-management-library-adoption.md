# ADR 0006 — Adopt TanStack Query and Zustand

- **Status:** Accepted, 2026-08-31
- **Deciders:** Prisilla Ghadi (architect)
- **Related:** `../standards/04-state-management.md` (its adoption placeholder is
  answered by this ADR), `../standards/00-core-rules.md` (divergence table row
  "TanStack Query + Zustand"),
  `../standards/05-api-integration-and-data-fetching.md` (owns query
  configuration once this classification is made),
  `../standards/30-restructuring-an-existing-react-project.md` Phase 3.5

---

## Context

04 specifies **TanStack Query** for server/async state and **Zustand** for
client/UI state. Neither was installed. The application held both kinds of state
in one hand-rolled React context, `apps/portal/src/data/store.tsx`, over a seed
array — with a second context in `data/roles.tsx` for identity, and hand-rolled
`sessionStorage` persistence in `data/issueListView.ts`.

That gap was recorded, not accidental. Three places name it:

- **00's divergence table**: `TanStack Query + Zustand | no state library — one
  React context over a seed array | architect decision required`.
- **00's corrections list**, item 6: *"Zustand + TanStack Query — no state
  library at all today — adopting them is a decision, not a restructure."*
- **04 itself**: *"Adopting either is an addition to the dependency graph, which
  makes it a decision the client owns — not something a restructure performs
  quietly,"* followed by an open placeholder naming the Frontend Lead and client
  architect as owners.

The placeholder was still open. This ADR answers it.

## Decision

**Adopt both.** TanStack Query owns server state; Zustand owns client state.
Redux, Redux Toolkit and RTK Query remain excluded, per 00.

**In 04's stated order — TanStack Query first, Zustand second.** The order is
part of the decision, not a scheduling preference. 04's reasoning:

> TanStack Query first, and it is the one that is hard to defer. Server state
> hand-rolled with `useEffect` is the single largest source of the bugs
> 10-testing-standards.md's coverage gate will not catch — stale closures,
> request races, missing cancellation, refetch storms.

> Zustand second, and it may not be needed at the current size. **Do not add a
> store because this file names one.**

The second half is binding. Zustand slices are created where 04 names a real
one — auth/session and issue-list filters — and a candidate that turns out to be
server state, or trivially local component state, is reported rather than made
into a store.

## Consequences

**The work is a classification, not a library swap.** `store.tsx` mixes the two
kinds of state that 04's hard rule says are *never held in the same place*:
server state (issues, notifications, activities, parts, comments, audit,
priorities) and client state (modal flags, drafts, the session directories).
Splitting it is the task; installing the packages is not.

30's Phase 3.5 rates this *"usually the largest single item"* in a restructure,
and 04 adds that on a codebase with no query layer *"that warning is not a
caution — it is the plan."* Estimates should follow that, not the package count.

**Three dependencies enter the graph**: `@tanstack/react-query`, `zustand`, and
— because 05 requires response validation at the mapper boundary and a query
hook over an unvalidated mapper gives false confidence — `zod` pinned at
`^4.0.0` exactly.

**MSW follows.** 10 and 26 both specify it and it is not installed; 26 F-07
requires handlers built *from* the fixture modules. Query hooks cannot be tested
at the right boundary without it.

**What this ADR does not decide.** The adoption question only. Several
preconditions in 05 remain open or in conflict with the current implementation —
the fixtures-mode predicate's name and polarity, the fixture module location, and
the notification page sizes — and are raised separately. This ADR does not
resolve them, and adopting the libraries does not depend on them being resolved
first.

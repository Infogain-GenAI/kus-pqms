# 04 — State Management
**Tier:** 1
**Status:** APPROVED — REVISION 7

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Confirmed stack
**TanStack Query** for server/async state. **Zustand** for client/UI
state. Never Redux, Redux Toolkit, or RTK Query — per 00-core-rules.md.

## Classification rule
**Every piece of state is classified once, before it is written:**

- **Does it come from a server, or is it a cache of something a server
  owns?** → TanStack Query. Never a Zustand store.
- **Is it purely a property of this client's session — a filter
  selection, a panel's open state, a sort direction?** → Zustand.

The test is ownership, not shape. A list of records fetched over HTTP is
server state even if you only read it once; a sort direction is client
state even if you send it to the server as a query parameter.

Three worked examples follow. Each is a real feature this app needs, and
each is provenance from the prior Vue implementation of this product
(repo `kus-pqms`, `frontend/apps/pqms-portal/src/stores/`), where the
same three concerns were all Pinia stores — the classification below is
the correction, not a description of that structure.

### Notifications → TanStack Query
Server-data cache, unambiguously: a notifications list, an unread count,
background polling, and optimistic mark-read writes. **This is not a
Zustand store.** Loading and error state come from `useQuery` itself
rather than being fields you maintain.

Required behaviour, with the values carried forward from `kus-pqms`
(`frontend/apps/pqms-portal/src/stores/notification/
notifications.store.ts`):
- **Data**: a notifications list and an unread count.
- **Operations**: load a page, mark one read, mark all read — the last
  two optimistic.
- **Page sizes**: **6** for the header dropdown, **50** for the
  full-page list.
- **Poll cadence**: every **60 seconds** — see "Notifications polling"
  below, and 05 for the configuration that expresses it.

### Issue-list filters → Zustand
100% client/UI state, no server data at all. Required fields:
`search`, `filters`, `scope`, `sort`, `page`, `pageSize`,
`visibleColumns` — with actions to set each, plus `clearAll` and
`resetVisibleColumns`.

Provenance: carried forward from `kus-pqms`
(`frontend/apps/pqms-portal/src/stores/issue-management/
issue-filters.store.ts`), which held exactly
this field set with actions `applyFilter`, `clearAll`, `setSearch`,
`setSort`, `setPage`, `setPageSize`, `setScope`, `setVisibleColumns`,
`resetVisibleColumns`. Note four of these fields — `sort`, `page`,
`pageSize`, `visibleColumns` — are what make `BaseDataTable` a
controlled component; see 03-react-component-patterns-and-naming.md's
note on its unspecified API.

### Auth → Zustand
Required shape: `currentUser`, plus `role` and `permissions`.

**`role` is derived, not independently written.** `setUser()` writes
`currentUser` and `permissions`; `role` is read off `currentUser` and no
action assigns it. Stated explicitly because an earlier revision named
three fields and then accounted for writing only two, leaving a reader to
infer which — while 08-authentication-and-authorization.md already
described both as "derived `role`/`permissions`". Two files agreed and
this one was silent, which is the harder defect to notice.

**How it gets populated is 08's**, not this file's — the FR-SEC-011
resolved-permissions response in real mode, a seeded identity in fixtures
mode. This file owns the shape and the writer discipline below.

**`switchRole()` is required, and it is load-bearing rather than a
convenience.** A dev-only role switcher, gated so that it throws in a
production build.

It is required because of 08-authentication-and-authorization.md's
"Fixtures-mode authentication" decision: fixtures mode bypasses MSAL
entirely and `authReady` resolves immediately against a seeded identity
in this store, so `switchRole()` is how a developer changes who they are
logged in as. That makes it **the only identity mechanism available
during all local development** until a real Entra tenant exists — every
RBAC behaviour any developer sees, and every permission-gated screen
they test, runs through it.

Provenance: `kus-pqms` had this as a prototype role switch — a
convenience it could have dropped. Here it cannot be dropped, which is
why it is specified rather than merely permitted.

Two things that follow:
- **Without it, fixtures mode has exactly one identity** — one
  hardcoded user, and no way to exercise the permission-gated call
  sites at all (see 08's call-site table). Dropping `switchRole()`
  means those access controls can never be tested locally across the
  five BRD roles (SE/ASM/PQM/ADMIN/VIEWER).
- **Its prod-build gate is a security control, not hygiene.** 08 pairs
  `isFixtureMode()` with `import.meta.env.PROD === false` as a hard
  fuse on the auth bypass; `switchRole()`'s own throws-in-production
  behaviour is the second layer of that same defence. Both layers are
  required.

Its writer discipline is the single-writer rule immediately below:
`switchRole()` routes through `setUser()` like every other writer and
never touches `currentUser` or `permissions` directly.

No action may write `currentUser` directly. The only writer is an
internal `setUser(user: AuthUser)` action, which derives `permissions`
(in fixtures mode, from a fixtures-only `ROLE_PERMISSIONS_MAP` — see
08's "Permission model"; in real mode, from the FR-SEC-011
resolved-permissions response) and sets both `currentUser` and
`permissions` in the same `set()` call.

`switchRole()`, MSAL hydration, and logout all route through
`setUser()` — none of them touch `currentUser` directly. This guarantees
`permissions` is always a plain, directly-readable field on the store's
state object (safe for `getState().permissions` to read from
middleware, outside React), never a hook-time-only derived selector.

**Export the `AuthUser` type**: `export interface AuthUser`. The
`setUser(user: AuthUser)` signature above cannot typecheck against a
module-private type once callers live outside the store module, and per
the paragraph above they will. Provenance for why a one-word detail is
called out at all: in `kus-pqms` this interface was declared without
`export`, which worked only because every writer lived in the same file
— a structure this file's single-writer rule deliberately changes.

## Notifications polling — classification, not configuration
Notifications poll on a **60-second cadence**, and in **fixtures mode
the query is disabled entirely** rather than fetching and discarding.
Those are the two product-level facts this file owns.

**How they are expressed is 05-api-integration-and-data-fetching.md's**
— see its "Polling: the notifications query" section for the query
configuration (`refetchInterval`, the `refetchIntervalInBackground`
default that gives focus-based pausing, and the `enabled` condition
including the call-the-parens trap). Not restated here: query
configuration lives in one file, and 05 is that file.

What this file adds is the classification that makes any of it apply:
notifications are **server state**, so they are a query and not a
Zustand store, and their loading and error states come from the query
rather than being fields anyone maintains. Get that wrong and no amount
of correct query configuration helps.

## Fixtures mode — owned by 05
`isFixtureMode()`, the `VITE_USE_FIXTURES` opt-in default, and what a
service returns in fixtures mode are all specified in
05-api-integration-and-data-fetching.md's "Fixtures mode" section. Not
restated here.

The only part that touches this file: **fixtures mode does not change
the store layer.** Client state is client state in both modes — the
issue-filters store behaves identically, and `switchRole()` remains the
identity selector (see "Auth → Zustand" above, and 08 for why). What
changes is where *server* data comes from, which is a question about
services and queries, not stores.

## Issue-filters persistence — Zustand `persist` middleware
The issue-filters store persists to `sessionStorage` via Zustand's
`persist` middleware. **Adding `persist` alone is not sufficient** — all
three behaviours below are required, and none of them is the
middleware's default:

- **`partialize` to exclude `scope` from the persisted payload.** Scope
  always resets to the role-derived default on mount, never restores
  from a previous session. This is deliberate: scope is derived from who
  you are, so restoring a stale one would show a returning user a scope
  their current role may not warrant.
- **A custom `merge` (or `onRehydrateStorage`) for per-field defensive
  fallback.** On partially-malformed saved data, each field falls back
  to its default **independently** — one bad field must not discard the
  rest. `persist`'s default shallow-spread merge does not do this.
- **A custom `storage` handler for corrupted-JSON recovery.** On a parse
  failure: catch it and **delete** the corrupted `sessionStorage` key,
  so the next load starts clean. `persist`'s default is a console error
  with no cleanup, which leaves the bad key in place to fail again on
  every subsequent load.

Provenance: all three behaviours are carried forward from `kus-pqms`
(`frontend/apps/pqms-portal/src/stores/issue-management/
issue-filters.store.ts`), which implemented
persistence by hand and therefore had them explicitly. They are spelled
out here because `persist` supplies none of them and the gap is silent
— you get working persistence that quietly loses the whole filter set on
one malformed field, or wedges on a corrupted key. The `scope` exclusion
in particular was an explicit, reaffirmed decision there rather than an
oversight.

## The target repository has no state library — and that is a decision, not a gap

`docs/STACK.md` §3 records the frontend as "**No state-management library** —
React hooks only", with a single route and a scaffold-sized surface.

This file specifies Zustand for client state and TanStack Query for server
state. **Adopting either is an addition to the dependency graph, which makes it
a decision the client owns — not something a restructure performs quietly.**

Two things follow, and the order matters:

- **TanStack Query first, and it is the one that is hard to defer.** Server
  state hand-rolled with `useEffect` is the single largest source of the bugs
  10-testing-standards.md's coverage gate will not catch — stale closures,
  request races, missing cancellation, refetch storms. The prior Vue repository
  built `useAsyncQuery` for exactly this reason and it is the clearest
  carry-forward in `../analysis/vue-baseline-audit.md`.
- **Zustand second, and it may not be needed at the current size.** Its two
  stores here are auth/session and notifications. If the auth model is thin
  and notifications are server state, context plus the query client may cover
  it. **Do not add a store because this file names one.**

**RESOLVED 2026-08-31 — both adopted.** See
`../decisions/0006-state-management-library-adoption.md`. TanStack Query first,
Zustand second, in this file's stated order; `zod@^4` accompanies the query layer
because 05 requires validation at the mapper boundary.

The boundary rule is unchanged by the adoption and governs regardless of
mechanism: **server state and client state are never held in the same place.**
That rule is what the migration is; the packages are not.

30-restructuring-an-existing-react-project.md Phase 3.5 already warns this is
where estimates go wrong. On a codebase with no query layer at all, that warning
is not a caution — it is the plan.

import type { IssueListQuery } from '@/api/issues'
import type { NotificationQuery } from '@/api/notifications'

/**
 * QUERY KEY CONVENTIONS.
 *
 * ⚠️ THIS IS A PROPOSAL AGAINST AN OPEN PLACEHOLDER, NOT SETTLED STANDARD.
 * `05-api-integration-and-data-fetching.md` line 161 reads:
 *
 * > Query key conventions: [PLACEHOLDER — to be finalized once the first real
 * > hooks are written; should follow TanStack Query's recommended array-based
 * > key structure scoped by feature].
 *
 * These are the first real hooks, which is the condition 05 names for finalising
 * it. What follows satisfies both halves of 05's guidance — array-based, scoped
 * by feature — and is flagged for approval rather than treated as decided. If it
 * is approved, 05's placeholder should be closed by pointing at this file.
 *
 * ─── THE CONVENTION ──────────────────────────────────────────────────────────
 *
 *   [feature]                       — the whole feature, for invalidation
 *   [feature, entity]               — a collection within it
 *   [feature, entity, 'detail', id] — one record
 *   [feature, entity, 'list', args] — a parameterised collection
 *
 * Read left to right, each prefix is a valid invalidation target: invalidating
 * `['issues']` invalidates every issue query, `['issues', 'list']` invalidates
 * every filter combination but leaves cached details alone. That prefix property
 * is the whole reason for the ordering — it is what makes a mutation able to say
 * *what* it invalidated instead of clearing the cache.
 *
 * ─── WHY FACTORY FUNCTIONS RATHER THAN BARE ARRAYS ───────────────────────────
 *
 * ⚠️ A KEY WRITTEN INLINE AT THE CALL SITE IS THE FAILURE MODE HERE. Two call
 * sites that write `['issues', 'list', query]` and `['issue', 'list', query]` do
 * not share a cache and do not invalidate each other, and nothing reports it —
 * you get a double fetch and a stale screen, with no error anywhere. Routing
 * every key through this one module makes that a typecheck failure instead.
 *
 * ─── ARGUMENT OBJECTS ARE PASSED WHOLE, DELIBERATELY ─────────────────────────
 *
 * TanStack Query hashes keys structurally and is key-order-independent for plain
 * objects, so `{ page: 1, size: 20 }` and `{ size: 20, page: 1 }` are the same
 * key. Serialising the object by hand would give up that property and introduce
 * a second place for the shape to drift from `IssueListQuery`.
 *
 * `as const` on each return keeps the tuple literal-typed, so a key built here
 * cannot be widened to `string[]` and silently accept a typo'd segment.
 */

export const queryKeys = {
  issues: {
    /** Every issue query. The invalidation target after any issue write. */
    all: () => ['issues'] as const,
    /** One filter combination. */
    list: (query: IssueListQuery = {}) => ['issues', 'list', query] as const,
    /** One issue. */
    detail: (id: string) => ['issues', 'detail', id] as const,
    /** The own/all counts for one user. */
    scopeCounts: (user: string) => ['issues', 'scopeCounts', user] as const,
    /** The dashboard KPI totals. Unparameterised. */
    kpiCounts: () => ['issues', 'kpiCounts'] as const,
  },

  notifications: {
    all: () => ['notifications'] as const,
    list: (query: NotificationQuery = {}) => ['notifications', 'list', query] as const,
  },
} as const

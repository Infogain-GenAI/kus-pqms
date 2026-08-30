import { useQuery } from '@tanstack/react-query'
import { issues } from '@/services'
import { queryKeys } from '@/shared/query/keys'
import type { IssueListQuery } from '@/api/issues'

/**
 * ISSUE QUERY HOOKS.
 *
 * `05-api-integration-and-data-fetching.md`: *"Each feature gets custom hooks
 * wrapping `useQuery`/`useMutation` around the corresponding service function
 * — e.g. `useIssueList()`, `useIssueDetail(id)`. Components call the hook,
 * never the service directly."*
 *
 * ⚠️ THESE NAMES ARE 05's, NOT THE ONES IN THE REQUEST. The instruction that
 * prompted this file asked for `useIssues()` / `useIssue(id)`; 05 names
 * `useIssueList()` / `useIssueDetail(id)` in the sentence quoted above.
 * Following the standard, and flagged rather than silently reconciled — renaming
 * is a two-line change if the other names are preferred.
 *
 * ─── WHAT THESE HOOKS DELIBERATELY DO NOT DO ─────────────────────────────────
 *
 * They do not branch on fixtures mode. `services/index.ts` owns that switch, and
 * a hook that re-decided it would be a second place for the two modes to drift.
 * A hook here is a cache and a lifecycle over the facade, nothing more.
 *
 * They hold no loading or error fields. `04-state-management.md`: *"Loading and
 * error state come from `useQuery` itself rather than being fields you
 * maintain."* Callers read `isPending` / `error` off the returned object.
 *
 * ⚠️ NOTHING RENDERS THESE YET. Every screen still reads `data/store.tsx`; the
 * cutover is a separate, reviewable step. See `services/index.ts`'s header for
 * the same note one layer down.
 */

/** A page of issues for one filter combination. */
export function useIssueList(query: IssueListQuery = {}) {
  return useQuery({
    queryKey: queryKeys.issues.list(query),
    queryFn: () => issues.list(query),
  })
}

/**
 * One issue.
 *
 * ⚠️ `enabled` GUARDS THE EMPTY ID, and it has to. The route param is
 * `string | undefined` before the router resolves it, and a query fired with an
 * empty id requests `/issues/` — a different endpoint that returns a list, which
 * then fails the detail schema with a confusing message. Disabling is the honest
 * behaviour: there is nothing to fetch yet.
 *
 * The service resolves `null` for a record that genuinely does not exist, so
 * `data === null` means "no such issue" and `data === undefined` means "not
 * fetched yet". Those are different states and callers need both.
 */
export function useIssueDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.issues.detail(id ?? ''),
    queryFn: () => issues.getById(id as string),
    enabled: Boolean(id),
  })
}

/** The own/all counts behind the issue-list scope toggle. */
export function useIssueScopeCounts(user: string | undefined) {
  return useQuery({
    queryKey: queryKeys.issues.scopeCounts(user ?? ''),
    queryFn: () => issues.scopeCounts(user as string),
    enabled: Boolean(user),
  })
}

/** The dashboard KPI totals. */
export function useIssueKpiCounts() {
  return useQuery({
    queryKey: queryKeys.issues.kpiCounts(),
    queryFn: () => issues.kpiCounts(),
  })
}

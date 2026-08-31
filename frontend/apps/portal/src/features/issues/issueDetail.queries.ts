import { useQuery } from '@tanstack/react-query'
import { issueDetail } from '@/services'
import { queryKeys } from '@/shared/query/keys'

/**
 * QUERY HOOKS FOR THE FIVE ISSUE-SCOPED COLLECTIONS.
 *
 * Per 05: *"Each feature gets custom hooks wrapping `useQuery`/`useMutation`
 * around the corresponding service function… Components call the hook, never the
 * service directly."*
 *
 * ─── ⚠️ EVERY ONE IS GUARDED ON THE ID, AND THE GUARD IS NOT DEFENSIVE NOISE ──
 *
 * A route param is `string | undefined` before the router resolves it. Firing
 * with an empty id requests `/issues//parts` — which is a DIFFERENT path, not an
 * error: the server sees an empty segment and answers 404, or worse, matches a
 * collection route and returns everyone's parts. `enabled` makes "there is
 * nothing to fetch yet" the honest state instead.
 *
 * ─── WHAT THESE DO NOT DO ────────────────────────────────────────────────────
 *
 * They do not branch on fixtures mode — `services/index.ts` owns that switch,
 * and a hook that re-decided it would be a second place for the two modes to
 * drift. They hold no loading or error fields either; 04 requires those to come
 * from `useQuery` itself.
 *
 * ⚠️ NOTHING RENDERS THESE YET. Every screen still reads `data/store.tsx`. The
 * fixture arm reads the seed while the store holds a mutated copy, so moving a
 * screen over before MSW lands would break create-then-see-it. The REAL arm has
 * no such problem, which is the point of landing this now.
 */

/** Part requests raised against an issue. */
export function usePartRequests(issueId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.issueDetail.parts(issueId ?? ''),
    queryFn: () => issueDetail.parts(issueId as string),
    enabled: Boolean(issueId),
  })
}

/** The communication thread. */
export function useComments(issueId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.issueDetail.comments(issueId ?? ''),
    queryFn: () => issueDetail.comments(issueId as string),
    enabled: Boolean(issueId),
  })
}

/** Recorded investigation activities. */
export function useActivities(issueId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.issueDetail.activities(issueId ?? ''),
    queryFn: () => issueDetail.activities(issueId as string),
    enabled: Boolean(issueId),
  })
}

/**
 * Corrections proposed against one activity.
 *
 * ⚠️ KEYED BY ACTIVITY, NOT ISSUE — that is the scope the endpoint has. Filing
 * it under the issue would mean approving one correction invalidated every
 * activity's requests on the screen.
 */
export function useActivityChangeRequests(activityId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.issueDetail.changeRequests(activityId ?? ''),
    queryFn: () => issueDetail.changeRequests(activityId as string),
    enabled: Boolean(activityId),
  })
}

/** The audit trail. */
export function useAuditTrail(issueId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.issueDetail.audit(issueId ?? ''),
    queryFn: () => issueDetail.audit(issueId as string),
    enabled: Boolean(issueId),
  })
}

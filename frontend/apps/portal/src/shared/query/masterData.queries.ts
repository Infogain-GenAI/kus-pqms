import { useQuery } from '@tanstack/react-query'
import { masterData } from '@/services'
import { queryKeys } from './keys'
import type { ClassLevel } from '@/data/types'

/**
 * QUERY HOOKS FOR REFERENCE DATA — the classification taxonomy, the part
 * catalogue, the team directory, users, priorities and VIN options.
 *
 * ⚠️ THESE LIVE IN `shared/`, NOT IN A FEATURE FOLDER, AND THAT IS THE EXCEPTION
 * RATHER THAN A DRIFT FROM 05's "each feature gets custom hooks". Reference data
 * has no single owning feature: the classification cascade is used by Issue
 * Entry, the Edit form, the filter drawer and Admin; the part catalogue and team
 * directory are used by the activity form and the parts form. Filing them under
 * whichever feature happened to need them first would make three other features
 * import across feature boundaries — the inversion `01-project-structure` exists
 * to prevent.
 *
 * ─── ⚠️ THE `staleTime`, AND WHY IT IS THE WHOLE POINT ───────────────────────
 *
 * This data is fetched once and rarely changes, which is exactly what makes
 * "load it at startup and keep it in a store" so tempting. 04 classifies by
 * OWNERSHIP, not lifetime — it is server-owned, so it is a query. What makes a
 * query behave like the thing people wanted from a store is `staleTime`: with it
 * set, mounting five pickers costs ONE request and the other four read the
 * cache, exactly as a store would have.
 *
 * The difference from a store is the part that matters: a query still has an
 * invalidation path. When an admin approves a requested system,
 * `invalidateQueries({ queryKey: queryKeys.masterData.all() })` refreshes every
 * picker. A store has no equivalent, and the failure mode is a new system nobody
 * sees until they hard-refresh.
 */

/**
 * Five minutes.
 *
 * ⚠️ NOT `Infinity`. A taxonomy that never refetches is a store with extra
 * steps, and the requested-classification flow adds nodes DURING a session — a
 * user who requests a new symptom in one tab must see it in another without
 * reloading the app. Five minutes is longer than any single form interaction and
 * short enough that a change propagates on its own if nobody invalidates.
 */
const REFERENCE_STALE_TIME = 5 * 60_000

/** The whole taxonomy, flat. Every consumer filters it by level and parent. */
export function useClassification() {
  return useQuery({
    queryKey: queryKeys.masterData.classification(),
    queryFn: () => masterData.classification(),
    staleTime: REFERENCE_STALE_TIME,
  })
}

/**
 * One level of the cascade.
 *
 * ⚠️ `parentId: undefined` MEANS "TOP LEVEL", NOT "ANY PARENT". Systems have no
 * parent, so this is a real query rather than a missing filter — and the key
 * below encodes `undefined` as `''` so the two cannot collide in the cache.
 *
 * ⚠️ The `enabled` guard is on `level`, NOT on `parentId`: asking for systems
 * with no parent is legitimate. A guard on `parentId` would permanently disable
 * the first level of every cascade — silently, with an empty picker and no error.
 */
export function useClassificationLevel(level: ClassLevel | undefined, parentId?: string) {
  return useQuery({
    queryKey: queryKeys.masterData.classificationLevel(level ?? '', parentId),
    queryFn: () => masterData.classificationLevel(level as ClassLevel, parentId),
    enabled: Boolean(level),
    staleTime: REFERENCE_STALE_TIME,
  })
}

/** The part catalogue behind the activity picker — NOT part requests. */
export function usePartOptions() {
  return useQuery({
    queryKey: queryKeys.masterData.partOptions(),
    queryFn: () => masterData.partOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })
}

/** Who may be NAMED on an activity. */
export function useTeamDirectory() {
  return useQuery({
    queryKey: queryKeys.masterData.teamDirectory(),
    queryFn: () => masterData.teamDirectory(),
    staleTime: REFERENCE_STALE_TIME,
  })
}

/** Who may SIGN IN. A different list from the team directory — see the service. */
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.masterData.users(),
    queryFn: () => masterData.users(),
    staleTime: REFERENCE_STALE_TIME,
  })
}

/**
 * One issue's saved priority matrix.
 *
 * ⚠️ NO `staleTime` HERE, unlike everything else in this module. Priority is
 * per-issue and is EDITED in the app — caching it for five minutes would show a
 * user the matrix they just replaced. It is reference-shaped but not reference
 * data.
 */
export function useIssuePriority(issueId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.masterData.priority(issueId ?? ''),
    queryFn: () => masterData.priority(issueId as string),
    enabled: Boolean(issueId),
  })
}

/** VINs offered by the VIN picker, scoped to the issue's own model codes. */
export function useVinOptions(issueId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.masterData.vinOptions(issueId ?? ''),
    queryFn: () => masterData.vinOptions(issueId as string),
    enabled: Boolean(issueId),
    staleTime: REFERENCE_STALE_TIME,
  })
}

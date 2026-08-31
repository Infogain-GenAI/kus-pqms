import { ACTIVITIES, AUDIT, COMMENTS, PARTS } from '@/data/seed'
import type {
  ActivityChangeRequest,
  AuditEntry,
  Comment,
  InvestigationActivity,
  PartRequest,
} from '@/data/types'
import { simulateLatency } from './fixture-latency'

/**
 * FIXTURE-BACKED ISSUE-DETAIL ENDPOINTS — parts, comments, investigation
 * activities, activity change requests and the audit trail.
 *
 * These are the five collections that hang off ONE issue, which is why they
 * share a module: they share a scope (`/issues/{issueId}/…`), they are fetched
 * by the same screen, and Vue groups them the same way in `issue.service.ts`.
 *
 * ─── ⚠️ THESE READ THE SEED, WHICH IS NOT THE STORE'S MUTATED COPY ───────────
 *
 * `data/store.tsx` starts from these same arrays and then mutates its own copy.
 * This module reads the seed directly, so a part added through the store is NOT
 * visible here. That is a known and deliberate limitation of the fixture path
 * until MSW handlers are built from these modules (26 F-07), and it is the
 * reason no screen has been moved onto these endpoints yet.
 *
 * It does not affect the REAL path, which is the point of this work: with
 * `VITE_USE_FIXTURES=false` every read below goes to the backend and the store
 * is not involved at all.
 *
 * ─── CHANGE REQUESTS HAVE NO SEED ────────────────────────────────────────────
 *
 * There is no `CHANGE_REQUESTS` array — the flow only ever created them at
 * runtime. The fixture therefore returns an empty list rather than inventing
 * rows, which is the honest answer: no correction has been proposed yet.
 */

/** `GET /issues/{issueId}/parts` — newest first. */
export async function fetchPartRequests(issueId: string): Promise<PartRequest[]> {
  await simulateLatency()
  return PARTS.filter((p) => p.issueId === issueId).sort((a, b) =>
    b.requestedAt.localeCompare(a.requestedAt),
  )
}

/** `GET /issues/{issueId}/comments` — oldest first, the order a thread reads in. */
export async function fetchComments(issueId: string): Promise<Comment[]> {
  await simulateLatency()
  return COMMENTS.filter((c) => c.issueId === issueId).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  )
}

/** `GET /issues/{issueId}/investigation-activities` — newest first. */
export async function fetchActivities(issueId: string): Promise<InvestigationActivity[]> {
  await simulateLatency()
  return ACTIVITIES.filter((a) => a.issueId === issueId).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

/**
 * `GET /investigation-activities/{activityId}/change-requests` — newest first.
 *
 * Always empty here; see the module note. Kept as a real async endpoint so the
 * screen that consumes it is written against a promise and an empty first
 * render, exactly as it will behave against the backend.
 */
export async function fetchActivityChangeRequests(
  activityId: string,
): Promise<ActivityChangeRequest[]> {
  await simulateLatency()
  void activityId
  return []
}

/** `GET /issues/{issueId}/audit` — newest first, which is how the trail is read. */
export async function fetchAuditTrail(issueId: string): Promise<AuditEntry[]> {
  await simulateLatency()
  return AUDIT.filter((a) => a.issueId === issueId).sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  )
}

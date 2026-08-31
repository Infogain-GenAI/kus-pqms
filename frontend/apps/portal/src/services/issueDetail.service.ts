import { del, get, post, put } from '@/shared/http'
import { parseResponse } from './issue.schemas'
import {
  backendActivityPageSchema,
  backendAuditPageSchema,
  backendChangeRequestListSchema,
  backendChangeRequestSchema,
  backendCommentPageSchema,
  backendCommentSchema,
  backendActivitySchema,
  backendPartRequestPageSchema,
  backendPartRequestSchema,
} from './issueDetail.schemas'
import {
  toActivity,
  toActivityChangeRequest,
  toAuditEntry,
  toComment,
  toPartRequest,
} from './issueDetail.mappers'
import type {
  ActivityChangeRequest,
  AuditEntry,
  Comment,
  InvestigationActivity,
  PartRequest,
} from '@/data/types'

/**
 * REAL-API ISSUE-DETAIL SERVICE — parts, comments, investigation activities,
 * activity change requests and the audit trail.
 *
 * ⚠️ ACTIVE ONLY WHEN `VITE_USE_FIXTURES=false`. Nothing here is reachable in
 * fixtures mode: `services/index.ts` owns the branch and this module is the
 * false arm of it. That is the whole contract — no screen changes when the flag
 * flips, because no screen knows which arm it got.
 *
 * ─── EVERY ENDPOINT BELOW IS TAKEN FROM THE VERIFIED VUE PORT ────────────────
 *
 * Paths, verbs and parameter placement are carried over from
 * `kus-pqms/frontend/apps/pqms-portal/src/services/issue.service.ts`, whose
 * header records that each was checked against the real controllers rather than
 * inferred. Where this app has no verified counterpart the gap is marked rather
 * than filled with a guess — see `WRITES` below.
 *
 * ─── ⚠️ PAGING IS 0-BASED AND THE DEFAULT SIZE IS DELIBERATE ─────────────────
 *
 * `page` starts at 0 (Spring's envelope). A 1-based value does not error; it
 * returns the second page, which presents as missing records. `size` defaults to
 * 100 rather than the backend's 20 because these are ISSUE-SCOPED collections
 * that a detail screen renders in full — a default that silently truncated the
 * audit trail at twenty rows would look like a complete trail.
 */

const DEFAULT_PAGE_SIZE = 100

interface PageOpts {
  /** 0-based. See the module note. */
  page?: number
  size?: number
}

const pageParams = (opts: PageOpts) => ({
  page: opts.page ?? 0,
  size: opts.size ?? DEFAULT_PAGE_SIZE,
})

/* ── Parts ────────────────────────────────────────────────────────────────── */

/** `GET /issues/{issueId}/parts`. */
export async function listPartRequests(
  issueId: string,
  opts: PageOpts = {},
): Promise<PartRequest[]> {
  const raw = await get<unknown>(`/issues/${encodeURIComponent(issueId)}/parts`, {
    params: pageParams(opts),
  })
  const page = parseResponse(backendPartRequestPageSchema, raw, `GET /issues/${issueId}/parts`)
  return page.content.map(toPartRequest)
}

/**
 * `POST /issues/{issueId}/parts`.
 *
 * ⚠️ THE REQUEST USES THE BACKEND'S FIELD NAMES, NOT THE DOMAIN'S. `partDescription`
 * and `quantity`, not `description` and `qty` — the mapper renames on the way
 * out just as it does on the way in, and sending the domain names produces a 400
 * that names fields the caller never wrote.
 */
export async function createPartRequest(
  issueId: string,
  input: {
    partNumber: string
    description: string
    qty: number
    cost?: number
    urgency: string
    neededBy?: string
    reason?: string
  },
  actor: { name: string; role: string },
): Promise<PartRequest> {
  const raw = await post<unknown>(`/issues/${encodeURIComponent(issueId)}/parts`, {
    partNumber: input.partNumber,
    partDescription: input.description,
    quantity: input.qty,
    unitCost: input.cost,
    urgency: input.urgency,
    neededBy: input.neededBy,
    reason: input.reason,
    actor,
  })
  return toPartRequest(parseResponse(backendPartRequestSchema, raw, `POST /issues/${issueId}/parts`))
}

/* ── Comments ─────────────────────────────────────────────────────────────── */

/** `GET /issues/{issueId}/comments`. */
export async function listComments(issueId: string, opts: PageOpts = {}): Promise<Comment[]> {
  const raw = await get<unknown>(`/issues/${encodeURIComponent(issueId)}/comments`, {
    params: pageParams(opts),
  })
  const page = parseResponse(backendCommentPageSchema, raw, `GET /issues/${issueId}/comments`)
  return page.content.map(toComment)
}

/** `POST /issues/{issueId}/comments`. */
export async function createComment(
  issueId: string,
  input: { type: string; body: string },
  actor: { name: string; role: string },
): Promise<Comment> {
  const raw = await post<unknown>(`/issues/${encodeURIComponent(issueId)}/comments`, {
    entryType: input.type,
    body: input.body,
    actor,
  })
  return toComment(parseResponse(backendCommentSchema, raw, `POST /issues/${issueId}/comments`))
}

/* ── Investigation activities ─────────────────────────────────────────────── */

/** `GET /issues/{issueId}/investigation-activities`. */
export async function listActivities(
  issueId: string,
  opts: PageOpts = {},
): Promise<InvestigationActivity[]> {
  const raw = await get<unknown>(
    `/issues/${encodeURIComponent(issueId)}/investigation-activities`,
    { params: pageParams(opts) },
  )
  const page = parseResponse(
    backendActivityPageSchema,
    raw,
    `GET /issues/${issueId}/investigation-activities`,
  )
  return page.content.map(toActivity)
}

/** `POST /issues/{issueId}/investigation-activities`. */
export async function createActivity(
  issueId: string,
  input: {
    type: string
    summary: string
    evaluationType?: string
    parts?: string[]
    vins?: string[]
    dealerCode?: string
    members?: string[]
    attachments?: string[]
  },
  actor: { name: string; role: string },
): Promise<InvestigationActivity> {
  const raw = await post<unknown>(
    `/issues/${encodeURIComponent(issueId)}/investigation-activities`,
    {
      activityType: input.type,
      details: input.summary,
      evaluationType: input.evaluationType,
      parts: input.parts,
      vins: input.vins,
      dealerCode: input.dealerCode,
      members: input.members,
      attachments: input.attachments,
      actor,
    },
  )
  return toActivity(
    parseResponse(backendActivitySchema, raw, `POST /issues/${issueId}/investigation-activities`),
  )
}

/**
 * `PUT /issues/{issueId}/investigation-activities/{activityId}`.
 *
 * ⚠️ NO SCREEN MAY CALL THIS, AND THAT IS A DOMAIN RULE RATHER THAN AN OVERSIGHT.
 * A recorded activity is EVIDENCE and is never edited in place — a correction is
 * proposed through `requestActivityChange` and applied only by an approval.
 * `data/store.tsx` states the same rule and is why there is no `updateActivity`
 * mutator there either.
 *
 * It exists because the endpoint exists and the port should be complete; the Vue
 * service carries it untranslated for exactly this reason. Anything wiring a UI
 * to it is changing the domain rule, not adding a feature.
 */
export function updateActivity(
  issueId: string,
  activityId: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  return put<unknown>(
    `/issues/${encodeURIComponent(issueId)}/investigation-activities/${encodeURIComponent(activityId)}`,
    body,
  )
}

/** `DELETE /issues/{issueId}/investigation-activities/{activityId}`. Same rule as above. */
export function deleteActivity(issueId: string, activityId: string): Promise<void> {
  return del<void>(
    `/issues/${encodeURIComponent(issueId)}/investigation-activities/${encodeURIComponent(activityId)}`,
  )
}

/* ── Activity change requests ─────────────────────────────────────────────── */

/** `GET /investigation-activities/{activityId}/change-requests`. */
export async function listActivityChangeRequests(
  activityId: string,
): Promise<ActivityChangeRequest[]> {
  const raw = await get<unknown>(
    `/investigation-activities/${encodeURIComponent(activityId)}/change-requests`,
  )
  const rows = parseResponse(
    backendChangeRequestListSchema,
    raw,
    `GET /investigation-activities/${activityId}/change-requests`,
  )
  return rows.map(toActivityChangeRequest)
}

/** `POST /investigation-activities/{activityId}/change-requests`. */
export async function requestActivityChange(
  activityId: string,
  input: { field: string; currentValue: string; proposedValue: string; reason: string },
  actor: { name: string; role: string },
): Promise<ActivityChangeRequest> {
  const raw = await post<unknown>(
    `/investigation-activities/${encodeURIComponent(activityId)}/change-requests`,
    {
      fieldName: input.field,
      currentValue: input.currentValue,
      proposedValue: input.proposedValue,
      reason: input.reason,
      actor,
    },
  )
  return toActivityChangeRequest(
    parseResponse(
      backendChangeRequestSchema,
      raw,
      `POST /investigation-activities/${activityId}/change-requests`,
    ),
  )
}

/**
 * `POST /investigation-activities/{activityId}/change-requests/{id}/approve`.
 *
 * ⚠️ NOT IDEMPOTENT. A request that was already decided answers **409**, so a
 * retry after a timeout is not safe and a double-click must be prevented at the
 * call site rather than absorbed here.
 *
 * ⚠️ RETURNS ONLY THE CHANGE REQUEST, never the updated activity — there is no
 * refetch-one-activity endpoint. The caller patches the visible activity from
 * this response's `proposedValue`, which is an echo of their own request rather
 * than an invented value. Both facts are verified in the Vue port.
 */
export async function approveActivityChange(
  activityId: string,
  changeRequestId: string,
  actor: { name: string; role: string },
): Promise<ActivityChangeRequest> {
  const raw = await post<unknown>(
    `/investigation-activities/${encodeURIComponent(activityId)}/change-requests/${encodeURIComponent(changeRequestId)}/approve`,
    { actor },
  )
  return toActivityChangeRequest(
    parseResponse(backendChangeRequestSchema, raw, 'POST change-requests/{id}/approve'),
  )
}

/**
 * `POST /investigation-activities/{activityId}/change-requests/{id}/reject`.
 *
 * ⚠️ THE REQUEST FIELD IS `reason`, NOT `rejectReason`. The response echoes it
 * as `rejectReason`, and sending that name instead returns 400 with
 * `details: [{ field: "reason", message: "must not be blank" }]` — verified, not
 * inferred. The reason is mandatory: the requester is told why.
 */
export async function rejectActivityChange(
  activityId: string,
  changeRequestId: string,
  reason: string,
  actor: { name: string; role: string },
): Promise<ActivityChangeRequest> {
  const raw = await post<unknown>(
    `/investigation-activities/${encodeURIComponent(activityId)}/change-requests/${encodeURIComponent(changeRequestId)}/reject`,
    { reason, actor },
  )
  return toActivityChangeRequest(
    parseResponse(backendChangeRequestSchema, raw, 'POST change-requests/{id}/reject'),
  )
}

/* ── Audit ────────────────────────────────────────────────────────────────── */

/** `GET /issues/{issueId}/audit`. */
export async function listAuditTrail(issueId: string, opts: PageOpts = {}): Promise<AuditEntry[]> {
  const raw = await get<unknown>(`/issues/${encodeURIComponent(issueId)}/audit`, {
    params: pageParams(opts),
  })
  const page = parseResponse(backendAuditPageSchema, raw, `GET /issues/${issueId}/audit`)
  return page.content.map(toAuditEntry)
}

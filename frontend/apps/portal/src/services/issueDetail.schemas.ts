import { z } from 'zod'

/**
 * RESPONSE SCHEMAS FOR THE ISSUE-DETAIL ENDPOINTS.
 *
 * Same policy as `issue.schemas.ts`, which carries the full rationale: strict by
 * default, validated at the mapper boundary, so backend drift fails loudly at
 * the boundary naming the field rather than producing `undefined` deep inside a
 * component.
 *
 * ⚠️ NO LENIENT FIELDS IN THIS FILE. 05 permits exactly three across the whole
 * API and all three are on the issue endpoints. A fourth is a change to 05, not
 * to this file.
 *
 * ─── EVERY LIST HERE IS A SPRING PAGE, AND `page` IS 0-BASED ────────────────
 *
 * All five endpoints answer with the same envelope the issue list uses. The
 * 0-based page number is called out because a 1-based value does not error — it
 * silently returns the second page, which presents as missing records rather
 * than as a bug.
 */

/** The page envelope these endpoints share. */
function pageOf<T extends z.ZodTypeAny>(row: T) {
  return z
    .object({
      content: z.array(row),
      totalElements: z.number(),
      number: z.number().optional(),
      size: z.number().optional(),
    })
    .strict()
}

export const backendPartRequestSchema = z
  .object({
    id: z.string(),
    issueId: z.string(),
    partNumber: z.string(),
    partDescription: z.string().optional(),
    quantity: z.number().optional(),
    unitCost: z.number().optional(),
    urgency: z.string().optional(),
    status: z.string().optional(),
    neededBy: z.string().optional(),
    requestedBy: z.string().optional(),
    requestedAt: z.string().optional(),
    reason: z.string().optional(),
    attachments: z.array(z.string()).optional(),
  })
  .strict()

export const backendCommentSchema = z
  .object({
    id: z.string(),
    issueId: z.string(),
    entryType: z.string().optional(),
    author: z.string().optional(),
    authorRole: z.string().optional(),
    body: z.string(),
    createdAt: z.string().optional(),
    hidden: z.boolean().optional(),
  })
  .strict()

export const backendActivitySchema = z
  .object({
    id: z.string(),
    issueId: z.string(),
    activityType: z.string(),
    /**
     * The narrative field. The backend calls it `details`; this app's domain
     * type calls it `summary`, and `issueDetail.mappers.ts` does the rename.
     * Named here so the two vocabularies meet in exactly one place.
     */
    details: z.string().optional(),
    author: z.string().optional(),
    authorRole: z.string().optional(),
    createdAt: z.string().optional(),
    evaluationType: z.string().optional(),
    parts: z.array(z.string()).optional(),
    vins: z.array(z.string()).optional(),
    dealerCode: z.string().optional(),
    members: z.array(z.string()).optional(),
    attachments: z.array(z.string()).optional(),
  })
  .strict()

export const backendChangeRequestSchema = z
  .object({
    id: z.string(),
    activityId: z.string(),
    issueId: z.string().optional(),
    fieldName: z.string().optional(),
    currentValue: z.string().optional(),
    proposedValue: z.string(),
    /**
     * ⚠️ THE REQUEST FIELD IS `reason`; THE RESPONSE ECHOES `rejectReason`.
     * Verified in the Vue port: sending `rejectReason` on a reject returns 400
     * with `details: [{ field: "reason", message: "must not be blank" }]`. Both
     * names appear here because both are real — one inbound, one outbound.
     */
    reason: z.string().optional(),
    rejectReason: z.string().optional(),
    justification: z.string().optional(),
    status: z.string().optional(),
    requestedBy: z.string().optional(),
    requestedAt: z.string().optional(),
    decidedBy: z.string().optional(),
    decidedOn: z.string().optional(),
  })
  .strict()

export const backendAuditEntrySchema = z
  .object({
    id: z.string(),
    issueId: z.string(),
    actor: z.string().optional(),
    actorRole: z.string().optional(),
    action: z.string(),
    detail: z.string().optional(),
    timestamp: z.string().optional(),
  })
  .strict()

export const backendPartRequestPageSchema = pageOf(backendPartRequestSchema)
export const backendCommentPageSchema = pageOf(backendCommentSchema)
export const backendActivityPageSchema = pageOf(backendActivitySchema)
export const backendAuditPageSchema = pageOf(backendAuditEntrySchema)

/**
 * Change requests answer with a bare ARRAY, not a page envelope.
 *
 * ⚠️ NOT AN OVERSIGHT — the list is scoped to one activity and is small by
 * construction, so the backend does not paginate it. Wrapping it in `pageOf`
 * would reject every real response.
 */
export const backendChangeRequestListSchema = z.array(backendChangeRequestSchema)

export type BackendPartRequestDto = z.infer<typeof backendPartRequestSchema>
export type BackendCommentDto = z.infer<typeof backendCommentSchema>
export type BackendActivityDto = z.infer<typeof backendActivitySchema>
export type BackendChangeRequestDto = z.infer<typeof backendChangeRequestSchema>
export type BackendAuditEntryDto = z.infer<typeof backendAuditEntrySchema>

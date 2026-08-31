import { z } from 'zod'

/**
 * RESPONSE SCHEMAS FOR THE REFERENCE-DATA ENDPOINTS.
 *
 * Strict, like every other schema here — see `issue.schemas.ts` for the full
 * rationale. No lenient fields: 05's three named exceptions are all on the issue
 * endpoints.
 *
 * ─── ⚠️ THESE ANSWER WITH BARE ARRAYS, NOT PAGE ENVELOPES ────────────────────
 *
 * Verified in the Vue port: `/classification-keys/*`, `/master-data/*` and
 * `/assignees` all return plain arrays. Wrapping them in the page schema would
 * reject every real response — the shape difference is easy to assume away
 * because every OTHER list in this API is paginated.
 */

export const backendClassificationNodeSchema = z
  .object({
    id: z.string(),
    /**
     * The backend's level vocabulary. Not narrowed to `ClassLevel` here on
     * purpose: an unrecognised level must reach the mapper, which decides how to
     * fall back. A union at the schema boundary would reject the whole taxonomy
     * because one node gained a fifth level.
     */
    level: z.string(),
    code: z.string(),
    label: z.string(),
    parentId: z.string().optional(),
    issueCount: z.number().optional(),
    pendingApproval: z.boolean().optional(),
  })
  .strict()

export const backendClassificationListSchema = z.array(backendClassificationNodeSchema)

export const backendPartOptionSchema = z
  .object({
    partNo: z.string(),
    /**
     * ⚠️ A STRING, NOT A NUMBER, AND THAT MATCHES THE DOMAIN TYPE. `PartOption.qty`
     * is a string because it is a picker's display value ("2"), not an arithmetic
     * quantity — the arithmetic one lives on `PartRequest.qty`. Coercing here
     * would put a number into a `<input value>` and reintroduce the split.
     */
    qty: z.string(),
  })
  .strict()

export const backendPartOptionListSchema = z.array(backendPartOptionSchema)

export const backendAssigneeSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    role: z.string().optional(),
    company: z.string().optional(),
  })
  .strict()

export const backendAssigneeListSchema = z.array(backendAssigneeSchema)

export const backendUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    roleLabel: z.string().optional(),
    email: z.string().optional(),
    initials: z.string().optional(),
  })
  .strict()

export const backendUserListSchema = z.array(backendUserSchema)

/**
 * The saved priority matrix.
 *
 * ⚠️ `manualFinal` IS NULLABLE AND THE NULL IS MEANINGFUL — it means "use the
 * calculated letter", which is a different state from "not yet scored"
 * (`scored: false`). `.nullish()` rather than `.optional()` so an explicit
 * `null` from the backend parses instead of failing.
 */
export const backendPrioritySchema = z
  .object({
    scores: z.record(z.string(), z.number()),
    selIdx: z.record(z.string(), z.number()),
    manualFinal: z.string().nullish(),
    scored: z.boolean(),
  })
  .strict()

export const backendVinListSchema = z.array(z.string())

export type BackendClassificationNodeDto = z.infer<typeof backendClassificationNodeSchema>
export type BackendAssigneeDto = z.infer<typeof backendAssigneeSchema>
export type BackendUserDto = z.infer<typeof backendUserSchema>
export type BackendPriorityDto = z.infer<typeof backendPrioritySchema>

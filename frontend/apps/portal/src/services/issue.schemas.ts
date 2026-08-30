import { z } from 'zod'

/**
 * RESPONSE SCHEMAS FOR THE ISSUE ENDPOINTS.
 *
 * Per `05-api-integration-and-data-fetching.md`: Zod v4 validates API responses
 * **at the mapper boundary**, before the mapper produces a domain shape.
 *
 * ─── WHY THIS EXISTS, IN 05's OWN WORDS ──────────────────────────────────────
 *
 * > A mapper without schema validation does not fail when the backend drifts;
 * > it produces `undefined` deep inside a component, far from the cause. A
 * > strict schema fails loudly, at the boundary, naming the field. Provenance:
 * > `kus-pqms`'s mappers did no validation, and that silent-`undefined` failure
 * > mode is what this replaces.
 *
 * `issue.mappers.ts` did exactly that — raw casts, no validation — so this is
 * the gap 05 names, closed.
 *
 * ─── STRICT BY DEFAULT ───────────────────────────────────────────────────────
 *
 * 05: "an unexpected shape is rejected, not silently passed through." `.strict()`
 * on the object means an UNKNOWN key is an error too, not just a missing one.
 * That is deliberate: a field the backend renamed shows up as one unexpected key
 * plus one missing key, and rejecting on both halves names the rename instead of
 * quietly dropping the value.
 *
 * ─── THE LENIENT FIELDS ARE NAMED, AND THERE ARE ONLY THREE ──────────────────
 *
 * 05 permits exactly three, each tied to a specific backend gap rather than to a
 * general leniency policy, and each is marked inline below. Adding a fourth is a
 * change to 05, not to this file.
 *
 * ⚠️ FIXTURES GO THROUGH THIS SCHEMA TOO. 05: "Fixture data goes through the same
 * mapper and the same schema as a real response. A fixture that would fail the
 * Zod schema is a broken fixture, and finding that out in fixtures mode is the
 * point."
 */

export const backendIssueSummarySchema = z
  .object({
    issueId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    status: z.string(),
    modelName: z.string().optional(),
    modelCode: z.string().optional(),
    modelYear: z.number().optional(),
    systemName: z.string().optional(),
    subSystemName: z.string().optional(),
    componentName: z.string().optional(),
    symptomName: z.string().optional(),

    /**
     * ⚠️ LENIENT — 05's FIRST NAMED EXCEPTION.
     *
     * "the field is sent in the request payload but not yet persisted by the
     * real backend, so a strict schema would reject every response that omits
     * it." A live constraint on the API this app talks to, not history.
     */
    ownerUserId: z.string().optional(),

    assigneeUserId: z.string().optional(),
    reportedDate: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    closedAt: z.string().optional(),
    ewsFlag: z.boolean().optional(),
    linkedIssueIds: z.array(z.string()).optional(),
  })
  .strict()

/**
 * The page envelope.
 *
 * `content` is validated element by element, so one malformed row names itself
 * rather than failing the page with no indication which record was at fault.
 */
export const backendIssuePageSchema = z
  .object({
    content: z.array(backendIssueSummarySchema),
    totalElements: z.number(),
    number: z.number().optional(),
    size: z.number().optional(),
  })
  .strict()

/**
 * The Edit-Issue update response.
 *
 * ⚠️ CARRIES 05's SECOND AND THIRD NAMED EXCEPTIONS — the Vehicle Info and
 * System Classification fields — both lenient for the same recorded reason:
 * "there is no matching update-endpoint field yet for these edits to round-trip
 * through." A strict schema would reject every successful edit.
 */
export const backendIssueUpdateSchema = z
  .object({
    issueId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    status: z.string(),

    /** ⚠️ LENIENT — 05's SECOND NAMED EXCEPTION (Vehicle Info). No update-endpoint field yet. */
    modelCodes: z.array(z.string()).optional(),
    modelYear: z.number().optional(),

    /** ⚠️ LENIENT — 05's THIRD NAMED EXCEPTION (System Classification). No update-endpoint field yet. */
    systemName: z.string().optional(),
    subSystemName: z.string().optional(),
    componentName: z.string().optional(),
    symptomName: z.string().optional(),

    updatedAt: z.string().optional(),
  })
  .strict()

export const scopeCountsSchema = z.object({ own: z.number(), all: z.number() }).strict()

export const kpiCountsSchema = z
  .object({ total: z.number(), byStatus: z.record(z.string(), z.number()) })
  .strict()

/**
 * Parses a response, or throws with the endpoint named.
 *
 * ⚠️ `endpoint` IS NOT DECORATION. A bare `ZodError` says a field is wrong; it
 * does not say which of six endpoints returned it, and at the point a schema
 * fails the stack is inside Zod rather than inside the caller. Naming the
 * endpoint is the difference between a five-minute fix and a bisect.
 */
export function parseResponse<T>(schema: z.ZodType<T>, data: unknown, endpoint: string): T {
  const result = schema.safeParse(data)
  if (result.success) return result.data

  const issues = result.error.issues
    .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('; ')
  throw new Error(`Response from ${endpoint} did not match its schema — ${issues}`)
}

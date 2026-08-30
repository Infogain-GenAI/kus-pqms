import { z } from 'zod'

/**
 * Response schema for the notification endpoints.
 *
 * Same rules as `issue.schemas.ts`: strict by default, validated at the mapper
 * boundary per `05-api-integration-and-data-fetching.md`.
 *
 * ⚠️ NO LENIENT FIELDS HERE. 05 permits exactly three across the whole API —
 * `ownerUserId` and the two Edit-Issue round-trip fields, all on the issue
 * endpoints. None applies to notifications, so this schema is strict throughout.
 * Adding leniency here would be a change to 05, not to this file.
 */

export const backendNotificationSchema = z
  .object({
    id: z.string(),
    category: z.string(),
    message: z.string(),
    read: z.boolean(),
    createdAt: z.string(),
    /*
     * Optional because the real service has no structured related-record field
     * — the mapper best-effort-derives it and leaves it undefined when it
     * cannot. That is a MAPPER behaviour documented in `notification.service.ts`,
     * not one of 05's three named leniency exceptions: the field is genuinely
     * absent from the contract rather than a strict field the backend fails to
     * send.
     */
    relatedRecordType: z.string().optional(),
    relatedRecordId: z.string().optional(),
  })
  .strict()

export const backendNotificationPageSchema = z
  .object({
    content: z.array(backendNotificationSchema),
    unreadCount: z.number().optional(),
  })
  .strict()

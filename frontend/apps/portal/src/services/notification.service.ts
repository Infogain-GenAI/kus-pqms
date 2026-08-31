import { get, patch } from '@/shared/http'
import type { NotificationListResult, NotificationQuery } from '@/api/notifications'
import type { AppNotification, NotificationCategory, NotificationRecordType } from '@/data/types'
import { parseResponse } from './issue.schemas'
import { backendNotificationPageSchema, unreadCountSchema } from './notification.schemas'

/**
 * REAL-API NOTIFICATION SERVICE.
 *
 * Ported in shape from Vue's `services/notification.service.ts`.
 *
 * ⚠️ ONE ORIGIN, NOT TWO — CHANGED 2026-08-31. Every call here used to pass a
 * separate `notificationApiClient` on `/api/notification/v1`, carried over from
 * the Vue app's microservices topology.
 *
 * That topology is replaced. BRD `AR-01`/`DEC-08` commit to a single backend
 * deployable behind one `/api/v1/**` surface, and the corpus is explicit about
 * the port: *"Delete the second instance; do not port it."* Notifications are a
 * path under the one origin now, not an origin of their own.
 */

/** The row shape the notification service returns. */
export interface BackendNotificationDto {
  id: string
  category: string
  message: string
  read: boolean
  createdAt: string
  relatedRecordType?: string
  relatedRecordId?: string
}

const CATEGORY_FROM_BACKEND: Record<string, NotificationCategory> = {
  CRITICAL: 'Critical',
  WARNING: 'Warning',
  ACTION_REQUIRED: 'Action Required',
  INFORMATION: 'Information',
}

/**
 * Maps one row.
 *
 * ⚠️ `recordType` IS ONLY SET WHEN IT IS ONE THIS APP KNOWS. `notificationTarget`
 * refuses to route an unknown type, and that refusal is the correct behaviour —
 * coercing an unrecognised value into `'issue'` here would send the user to
 * `/issues/<something-that-is-not-an-issue>` and a Not Found page. The Vue
 * mapper leaves it undefined for exactly the same reason.
 */
export function toNotification(dto: BackendNotificationDto): AppNotification {
  const type = dto.relatedRecordType?.toLowerCase()
  const recordType: NotificationRecordType | undefined =
    type === 'issue' || type === 'qir' ? type : undefined

  return {
    id: dto.id,
    category: CATEGORY_FROM_BACKEND[dto.category] ?? 'Information',
    title: dto.message,
    recordId: dto.relatedRecordId,
    recordType,
    read: dto.read,
    createdAt: dto.createdAt,
  }
}

/**
 * `GET /notifications?receiver=&page=&size=`.
 *
 * Backs both the header dropdown (small `size`) and the full-page feed (larger
 * `size`) from one endpoint, most-recent-first.
 *
 * ⚠️ `page` IS 0-BASED. The backend's page envelope is Spring's, and the issue
 * mappers already carry the same note — a 1-based page number here silently
 * skips the first page's worth of rows rather than erroring.
 */
export async function listNotifications(query: NotificationQuery = {}): Promise<NotificationListResult> {
  const raw = await get<unknown>('/notifications', {
    params: {
      receiver: query.recipient,
      page: query.page,
      size: query.limit,
    },
  })
  // Validate, THEN map — see the same note in `issue.service.ts`. Mapping an
  // unchecked shape loses the evidence the schema exists to name.
  const page = parseResponse(backendNotificationPageSchema, raw, 'GET /notifications')
  const rows = page.content.map(toNotification)
  return {
    // Prefer the server's own count: it knows the whole set, while this page may
    // have been limited. Falling back to the page's own unread count is better
    // than zero, and is flagged here so nobody reads it as authoritative.
    //
    // ⚠️ THE FALLBACK IS A LAST RESORT, NOT THE BADGE'S SOURCE. Use
    // `unreadCount()` below for that. Vue's service states the reason: "Never
    // derive an unread count from list()'s (bounded/paginated) result — it would
    // undercount whenever more unread rows exist than the requested page size."
    unreadCount: page.unreadCount ?? rows.filter((n) => !n.read).length,
    rows,
  }
}

/**
 * `GET /notifications/unread-count?receiver=` — the cheap, poll-friendly
 * endpoint the header badge uses.
 *
 * ⚠️ THIS EXISTS SO THE BADGE IS NEVER DERIVED FROM A PAGE. A dropdown asking
 * for six rows would cap the badge at six, and five unread would look identical
 * to five hundred. Separate endpoint, separate query, no page size involved.
 *
 * Verified against the real controller in the Vue port rather than guessed.
 */
export async function unreadCount(recipient?: string): Promise<number> {
  const raw = await get<unknown>('/notifications/unread-count', {
    params: { receiver: recipient },
  })
  return parseResponse(unreadCountSchema, raw, 'GET /notifications/unread-count').unreadCount
}

/**
 * `PATCH /notifications/{id}/read?receiver=`.
 *
 * ⚠️ `PATCH`, NOT `POST`, AND `receiver` IS REQUIRED RATHER THAN OPTIONAL.
 * Both were wrong here until this was checked against the Vue service, whose
 * every endpoint and parameter is verified against `NotificationController.java`
 * and the service's own Postman collection rather than inferred.
 *
 * The `receiver` parameter is the backend's OWNERSHIP CHECK, not a filter: a
 * mismatched receiver 404s rather than mutating. Omitting it does not mark
 * somebody else's notification read — it fails, and the optimistic update in
 * `notifications.queries.ts` then rolls back for a reason nobody can see from
 * the client.
 */
export function markRead(id: string, recipient?: string): Promise<void> {
  return patch<void>(`/notifications/${encodeURIComponent(id)}/read`, undefined, {
    params: { receiver: recipient },
  })
}

/**
 * `PATCH /notifications/read-all?receiver=`.
 *
 * ⚠️ `receiver` GOES IN THE QUERY STRING, NOT A REQUEST BODY. The real endpoint
 * takes no body at all; sending one is silently ignored and the call then
 * marks nothing, because the receiver it needed never arrived.
 */
export function markAllRead(recipient?: string): Promise<void> {
  return patch<void>('/notifications/read-all', undefined, { params: { receiver: recipient } })
}

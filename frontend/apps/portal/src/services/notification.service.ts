import { get, post } from '@/shared/http'
import type { NotificationListResult, NotificationQuery } from '@/api/notifications'
import type { AppNotification, NotificationCategory, NotificationRecordType } from '@/data/types'

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

/** `GET /notifications`. */
export async function listNotifications(query: NotificationQuery = {}): Promise<NotificationListResult> {
  const page = await get<{ content: BackendNotificationDto[]; unreadCount?: number }>(
    '/notifications',
    { params: { receiver: query.recipient, size: query.limit } },
  )
  const rows = page.content.map(toNotification)
  return {
    // Prefer the server's own count: it knows the whole set, while this page may
    // have been limited. Falling back to the page's own unread count is better
    // than zero, and is flagged here so nobody reads it as authoritative.
    unreadCount: page.unreadCount ?? rows.filter((n) => !n.read).length,
    rows,
  }
}

/** `POST /notifications/{id}/read`. */
export function markRead(id: string): Promise<void> {
  return post<void>(`/notifications/${encodeURIComponent(id)}/read`)
}

/** `POST /notifications/read-all`. */
export function markAllRead(recipient?: string): Promise<void> {
  return post<void>('/notifications/read-all', { receiver: recipient })
}

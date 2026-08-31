import { NOTIFICATIONS } from '@/data/seed'
import type { AppNotification } from '@/data/types'
import { simulateLatency } from './fixture-latency'

/**
 * FIXTURE-BACKED NOTIFICATION ENDPOINTS.
 *
 * Ported in shape from Vue's `api/notifications.ts`.
 *
 * ─── RECORDS ARE SCOPED SERVER-SIDE, NOT BY A CLIENT-SIDE TALLY ──────────────
 *
 * `recipient` filtering happens HERE, in the stand-in server, and the unread
 * count is computed from what this module returns. The Vue original calls this
 * out explicitly and it is a security property, not a performance one: a client
 * that receives everyone's notifications and hides the ones that are not its own
 * has already leaked them.
 *
 * This app's seed has no `recipient` field — every notification belongs to the
 * demo user — so the parameter is accepted and applied where present, and the
 * absence is documented rather than silently ignored. When notifications become
 * per-user, the filter is already in the right place.
 */

export interface NotificationQuery {
  /** How many to return. The panel asks for few; the page asks for all. */
  limit?: number
  /**
   * Which page, 0-BASED.
   *
   * ⚠️ ZERO-BASED BECAUSE THE BACKEND'S ENVELOPE IS SPRING'S, and the issue
   * mappers carry the same note. A 1-based value here does not error — it
   * silently skips the first page's worth of rows, which reads as missing data.
   *
   * The fixture path below ignores it: the seed is small enough that the panel
   * and the full feed both fit in one page, and inventing paging over a
   * thirty-row array would test the fixture rather than the app. It is accepted
   * here so the real path can send it without the two query shapes diverging.
   */
  page?: number
  /** Reserved for when the seed carries a recipient. See the module note. */
  recipient?: string
}

/** The panel's bound. The full feed passes no limit. */
export const NOTIFICATIONS_PANEL_PAGE_SIZE = 5

export interface NotificationListResult {
  rows: AppNotification[]
  /** Unread across the WHOLE set, not just the returned page. */
  unreadCount: number
}

/**
 * `GET /notifications`.
 *
 * ⚠️ `unreadCount` IS COMPUTED BEFORE THE LIMIT IS APPLIED. Counting the
 * returned page instead would cap the bell badge at whatever the panel asked
 * for — five unread and five hundred unread would look identical.
 */
export async function fetchNotifications(query: NotificationQuery = {}): Promise<NotificationListResult> {
  await simulateLatency()

  const scoped = NOTIFICATIONS.filter((n) => {
    // `recipient` is absent from this app's seed; when it is absent the record
    // is visible. See the module note.
    const owner = (n as AppNotification & { recipient?: string }).recipient
    return !query.recipient || !owner || owner === query.recipient
  })

  // Newest first, applied at read time so the seed need not be kept in order.
  const ordered = [...scoped].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const unreadCount = ordered.filter((n) => !n.read).length

  return {
    rows: query.limit === undefined ? ordered : ordered.slice(0, query.limit),
    unreadCount,
  }
}

/** `POST /notifications/{id}/read`. */
export async function markNotificationRead(id: string): Promise<void> {
  await simulateLatency()
  const row = NOTIFICATIONS.find((n) => n.id === id)
  /*
   * A missing id is a NO-OP, not an error. The realistic cause is a
   * notification that was dismissed in another tab between render and click,
   * and failing the request would show the user an error for something that has
   * already happened the way they wanted.
   */
  if (row) row.read = true
}

/** `POST /notifications/read-all`. */
export async function markAllNotificationsRead(recipient?: string): Promise<void> {
  await simulateLatency()
  for (const n of NOTIFICATIONS) {
    const owner = (n as AppNotification & { recipient?: string }).recipient
    if (!recipient || !owner || owner === recipient) n.read = true
  }
}

/**
 * `GET /notifications/unread-count`.
 *
 * ⚠️ COMPUTED OVER THE WHOLE SCOPED SET, never over a page — that is the entire
 * reason this is a separate endpoint rather than a field on the list response.
 * A dropdown asking for six rows would otherwise cap the badge at six, and five
 * unread would look identical to five hundred.
 */
export async function fetchUnreadNotificationCount(recipient?: string): Promise<number> {
  await simulateLatency()

  return NOTIFICATIONS.filter((n) => {
    const owner = (n as AppNotification & { recipient?: string }).recipient
    return (!recipient || !owner || owner === recipient) && !n.read
  }).length
}

import { Icon } from '@pqms/ui-library'
import { NOTIFICATION_CATEGORIES } from '@/data/notificationCategory'
import { fmtMDY } from '@/data/util'
import type { AppNotification } from '@/data/types'
import styles from './NotificationPanel.module.css'

/**
 * One notification in the header dropdown.
 *
 * Ported from `NotificationRow.vue`, and like it, a PRESENTATIONAL component: it
 * renders a notification and reports a click. It does not mark anything read and
 * does not know any route — the owner passes `onSelect`, which every caller
 * wires to `useNotificationNavigation`.
 *
 * ⚠️ IT DOES NOT `useNavigate()` ITSELF, deliberately. A row that navigated on
 * its own would be a second routing path beside the shared one, which is the
 * exact duplication this port set out to remove — just moved one level down
 * where it is harder to see.
 *
 * ─── THE PAGE DOES NOT USE THIS COMPONENT, AND THAT IS ON PURPOSE ────────────
 *
 * Vue renders the same row in both places. This app's two surfaces do not have
 * the same row: the panel is a 380px dropdown showing category, title, record
 * and date, while the Notifications page is a full-width card that also shows
 * the notification BODY, which the panel has no room for. Forcing them together
 * would mean changing one of two designs that already exist and are already
 * signed off.
 *
 * What they DO share is everything that can silently disagree — the category
 * meta (`@/data/notificationCategory`) and the click behaviour
 * (`useNotificationNavigation`). Shared data and shared behaviour, separate
 * presentation, is the split that actually prevents the bugs.
 */
export function NotificationRow({
  notification: n,
  onSelect,
}: {
  notification: AppNotification
  onSelect: (n: AppNotification) => void
}) {
  const meta = NOTIFICATION_CATEGORIES[n.category]

  return (
    <button
      type="button"
      className={n.read ? styles.row : `${styles.row} ${styles.rowUnread}`}
      // The left rail is the category colour on unread rows only. Inline because
      // it is DATA — the colour comes from the category map, so it cannot be a
      // static rule in the stylesheet.
      style={{ borderLeftColor: n.read ? 'transparent' : meta.color }}
      data-testid={`notification-row-${n.id}`}
      onClick={() => onSelect(n)}
    >
      <span className={styles.icon} style={{ background: meta.tint, color: meta.color }}>
        <Icon icon={meta.icon} size={17} />
      </span>

      <span className={styles.body}>
        {/* The category NAME, always — colour is the secondary cue, never the
            only one. See the taxonomy's note on this. */}
        <span className={styles.eyebrow} style={{ color: meta.color }}>
          {n.category}
        </span>
        <span className={styles.rowTitle}>{n.title}</span>
        <span className={styles.meta}>
          {n.recordId && <span className={styles.recordId}>{n.recordId}</span>}
          <span className={styles.date}>{fmtMDY(n.createdAt)}</span>
        </span>
      </span>

      {!n.read && <span aria-label="Unread" className={styles.dot} style={{ background: meta.color }} />}
    </button>
  )
}

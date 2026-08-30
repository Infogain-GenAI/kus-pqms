import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Icon } from '@pqms/ui-library'
import { useStore } from '@/data/store'
import { NotificationRow } from './NotificationRow'
import { useNotificationNavigation } from './useNotificationNavigation'
import styles from './NotificationPanel.module.css'

/** Recent rows shown before "View all". The full feed lives on the page. */
const MAX_ROWS = 5

/**
 * The header bell's dropdown.
 *
 * Ported from `NotificationPanel.vue`, and extracted out of `AppHeader.tsx`,
 * where it was ~45 lines of inline markup inside an already-long shell
 * component. THE DESIGN IS UNCHANGED — every dimension and colour moved across
 * verbatim into the stylesheet beside this file.
 *
 * ─── WHAT MOVING IT ACTUALLY BOUGHT ──────────────────────────────────────────
 *
 * The header owned its own copy of the row-click handler, and so did the
 * Notifications page. Both read `if (n.recordId) nav('/issues/' + n.recordId)`.
 * Now both call `useNotificationNavigation`, so where a notification leads is
 * decided once — which is the whole reason Vue has a composable for it.
 *
 * It also made the panel mountable on its own, which is why it can be tested
 * without rendering the entire app shell around it.
 *
 * ─── TWO STATES THE OLD INLINE VERSION DID NOT HAVE ──────────────────────────
 *
 * With everything read it rendered an empty white gap between header and footer,
 * which reads as a failed load rather than as "nothing to see"; and "Mark all
 * read" stayed live with nothing to mark. Both are states Vue's panel handles,
 * and both are now handled here.
 */
export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const nav = useNavigate()
  const { notifications, unreadCount, markAllRead } = useStore()
  const { selectNotification } = useNotificationNavigation()

  // Already newest-first from the store; truncated to the panel's bound.
  const visible = notifications.slice(0, MAX_ROWS)

  return (
    <>
      {/*
        The click-away scrim. A sibling rather than a document listener: it
        closes on any outside click including one on the header itself, and it
        unmounts with the panel, so there is no listener to leak.
      */}
      <div className={styles.scrim} onClick={onClose} />

      <div className={styles.panel} role="dialog" aria-label="Notifications" data-testid="notification-panel">
        <header className={styles.head}>
          <div className={styles.headLeft}>
            <span className={styles.title}>Notifications</span>
            {unreadCount > 0 && <span className={styles.pill}>{unreadCount} new</span>}
          </div>
          <button
            type="button"
            className={styles.markAll}
            disabled={unreadCount === 0}
            onClick={markAllRead}
            data-testid="notif-mark-all-read"
          >
            Mark all read
          </button>
        </header>

        <div className={styles.list}>
          {visible.length === 0 ? (
            <div className={styles.empty} data-testid="notif-empty">
              <p className={styles.emptyTitle}>You&rsquo;re all caught up.</p>
              <p className={styles.emptyBody}>New notifications will show up here.</p>
            </div>
          ) : (
            visible.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                /*
                 * Close BEFORE navigating. The panel is absolutely positioned
                 * inside the header, so leaving it open across a route change
                 * leaves a dropdown floating over the screen the user just
                 * asked for, with no obvious way back to what opened it.
                 */
                onSelect={(picked) => {
                  onClose()
                  selectNotification(picked)
                }}
              />
            ))
          )}
        </div>

        <button
          type="button"
          className={styles.viewAll}
          data-testid="notif-view-all"
          onClick={() => {
            onClose()
            nav('/notifications')
          }}
        >
          View all notifications
          <Icon icon={ArrowRight} size={15} />
        </button>
      </div>
    </>
  )
}

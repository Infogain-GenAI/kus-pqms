import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Badge, Button, EmptyState, SearchField } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { PageContainer, PageCrumb } from '@/app/chrome'
import { NOTIFICATION_CATEGORIES } from '@/data/notificationCategory'
import { useStore } from '@/data/store'
import { fmtDateTime } from '@/data/util'
import { useNotificationNavigation } from './useNotificationNavigation'

/**
 * The full notification feed.
 *
 * Ported alongside `pages/Notifications.vue`, whose own comment describes the
 * property that matters: "pure reuse — the same store, category config and
 * navigation as the header dropdown, never a second data source or a second
 * routing path". This screen had both of the things that comment forbids: its
 * own category→tone table, and its own copy of the row-click handler.
 *
 * Its LAYOUT is deliberately not Vue's and not the dropdown's — it is a
 * full-width card list with a search box and the notification body text, none of
 * which fits a 380px panel. Shared data and behaviour, separate presentation.
 */
export function NotificationsScreen() {
  const { notifications, unreadCount, markAllRead } = useStore()
  const { selectNotification } = useNotificationNavigation()
  const [q, setQ] = useState('')

  const filtered = notifications.filter((n) => `${n.title} ${n.body ?? ''} ${n.recordId ?? ''}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <PageContainer>
      <PageCrumb backTo="/dashboard" trail={[{ label: 'Kia PQMS', to: '/dashboard' }, { label: 'Notifications' }]} />
      <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h1 style={{ margin: 0, font: 'var(--fw-bold) var(--fs-h2)/1.2 var(--font-display)', color: 'var(--text-primary)' }}>Notifications</h1>
          {unreadCount > 0 && <Badge tone="danger">{unreadCount} new</Badge>}
        </div>
        <Button variant="secondary" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
          Mark all read
        </Button>
      </div>

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: 360 }}>
        <SearchField value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search notifications…" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Icon icon={Bell} size={28} />} title="No notifications" message="You're all caught up." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {filtered.map((n) => (
            <button
              key={n.id}
              data-testid={`notification-page-row-${n.id}`}
              onClick={() => selectNotification(n)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                textAlign: 'left',
                padding: 'var(--space-4)',
                border: 'var(--border-width) solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                background: n.read ? 'var(--surface-card)' : 'var(--selected-bg)',
                cursor: 'pointer',
                font: 'var(--fw-regular) var(--fs-body-md)/1.4 var(--font-body)',
              }}
            >
              <span style={{ marginTop: 3, width: 8, height: 8, borderRadius: '50%', background: n.read ? 'transparent' : 'var(--accent-500)', flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
                  <Badge tone={NOTIFICATION_CATEGORIES[n.category].tone} size="sm">{n.category}</Badge>
                  <span style={{ font: 'var(--fw-semibold) var(--fs-body-md)/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{n.title}</span>
                </div>
                {n.body && <div style={{ color: 'var(--text-secondary)' }}>{n.body}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 4 }}>
                  {n.recordId && <span style={{ font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-mono)', color: 'var(--accent-700)' }}>{n.recordId}</span>}
                  <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>{fmtDateTime(n.createdAt)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      </div>
    </PageContainer>
  )
}

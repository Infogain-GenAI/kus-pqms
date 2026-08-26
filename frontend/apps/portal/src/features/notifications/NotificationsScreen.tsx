import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { Badge, Button, EmptyState, SearchField } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { PageContainer, PageCrumb } from '@/app/chrome'
import { useStore } from '@/data/store'
import { fmtDateTime } from '@/data/util'
import type { NotificationCategory } from '@/data/types'

const CATEGORY_TONE: Record<NotificationCategory, 'accent' | 'warning' | 'danger' | 'neutral' | 'success' | 'info'> = {
  Critical: 'danger',
  Warning: 'warning',
  'Action Required': 'info',
  Information: 'success',
}

export function NotificationsScreen() {
  const nav = useNavigate()
  const { notifications, unreadCount, markAllRead, markRead } = useStore()
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
              onClick={() => {
                markRead(n.id)
                if (n.recordId) nav(`/issues/${n.recordId}`)
              }}
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
                  <Badge tone={CATEGORY_TONE[n.category]} size="sm">{n.category}</Badge>
                  <span style={{ font: 'var(--fw-semibold) var(--fs-body-md)/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{n.title}</span>
                </div>
                {n.body && <div style={{ color: 'var(--text-secondary)' }}>{n.body}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
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

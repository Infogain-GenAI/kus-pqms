import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Bell, Check, CircleDot, HelpCircle, Info, OctagonAlert, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar, IconButton, Logo } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import { fmtMDY } from '@/data/util'
import type { NotificationCategory, RoleKey } from '@/data/types'

// App chrome per the UX prototype: a white 60px sticky top bar —
// logo · divider · horizontal primary nav · spacer · help · bell(+unread) · user.
// No side nav. QIR / TSB nav items are present but disabled (out of scope).

const ROLES: { key: RoleKey; label: string }[] = [
  { key: 'SE', label: 'SE — Service Engineer' },
  { key: 'ASM', label: 'ASM — After-Sales Manager' },
  { key: 'PQM', label: 'PQM — Product Quality Manager' },
  { key: 'ADMIN', label: 'Administrator' },
]

// The prototype's notification category meta (notifVals() catMeta), token-bound where the hex
// matches a token exactly; the Information tint #E2F4F2 has no token equivalent.
const NOTIF_CAT: Record<NotificationCategory, { color: string; tint: string; icon: LucideIcon }> = {
  Critical: { color: 'var(--danger-500)', tint: 'var(--danger-50)', icon: OctagonAlert },
  Warning: { color: 'var(--warning-500)', tint: 'var(--warning-50)', icon: TriangleAlert },
  'Action Required': { color: 'var(--info-500)', tint: 'var(--info-50)', icon: CircleDot },
  Information: { color: 'var(--status-disposed)', tint: '#E2F4F2', icon: Info },
}

export function AppShell() {
  const loc = useLocation()
  const nav = useNavigate()
  const { role, user, setRole, can } = useRole()
  const { notifications, unreadCount, markAllRead, markRead } = useStore()
  const [roleMenu, setRoleMenu] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!roleMenu) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setRoleMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [roleMenu])

  const seg = loc.pathname.split('/')[1] || 'dashboard'
  const active = seg === 'issues' ? 'issues' : seg === 'admin' ? 'admin' : seg === 'notifications' ? 'notifications' : 'dashboard'

  const items: { key: string; label: string; to?: string; disabled?: boolean }[] = [
    { key: 'dashboard', label: 'Overview', to: '/dashboard' },
    { key: 'issues', label: 'Issue Management', to: '/issues' },
    { key: 'qir', label: 'QIR Management', disabled: true },
    { key: 'tsb', label: 'TSB Management', disabled: true },
    ...(can('administer') ? [{ key: 'admin', label: 'Administration', to: '/admin' }] : []),
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <header
        style={{ position: 'sticky', top: 0, zIndex: 40, height: 'var(--header-height)', flex: 'none', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-subtle)' }}
      >
      <div style={{ maxWidth: 1800, height: '100%', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <button aria-label="Kia PQMS home" onClick={() => nav('/dashboard')} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'inline-flex' }}>
          <Logo tone="dark" height={22} />
        </button>
        <span aria-hidden style={{ width: 1, height: 22, background: 'var(--border-subtle)' }} />
        <nav style={{ display: 'flex', alignItems: 'stretch', gap: 6, alignSelf: 'stretch' }}>
          {items.map((it) => {
            const isActive = it.key === active
            return (
              <button
                key={it.key}
                disabled={it.disabled}
                onClick={() => it.to && nav(it.to)}
                title={it.disabled ? 'Not available in this release' : undefined}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '0 12px',
                  cursor: it.disabled ? 'not-allowed' : 'pointer',
                  font: `${isActive ? 'var(--fw-semibold)' : 'var(--fw-medium)'} var(--fs-body-md)/1 var(--font-body)`,
                  color: it.disabled ? 'var(--text-disabled)' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: isActive ? 'inset 0 -2px 0 0 var(--accent-500)' : 'none',
                }}
              >
                {it.label}
              </button>
            )
          })}
        </nav>
        <span style={{ flex: 1 }} />
        <IconButton aria-label="Help">
          <Icon icon={HelpCircle} size={19} />
        </IconButton>
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <IconButton aria-label={`Notifications, ${unreadCount} unread`} aria-expanded={notifOpen} onClick={() => setNotifOpen((v) => !v)}>
            <Icon icon={Bell} size={19} />
          </IconButton>
          {unreadCount > 0 && (
            <span aria-hidden style={{ position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 'var(--radius-pill)', background: 'var(--status-escalated)', border: '1.5px solid var(--surface-card)', color: '#fff', font: 'var(--fw-bold) 9.5px/13px var(--font-body)', textAlign: 'center', pointerEvents: 'none' }}>
              {unreadCount}
            </span>
          )}
          {notifOpen && (
            <>
              <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
              {/* Notification panel — layout/type per the prototype's header dropdown (380w, 5 rows, View-all footer). */}
              <div style={{ position: 'absolute', top: 46, right: 0, zIndex: 100, width: 380, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #F0F2F5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ font: 'var(--fw-bold) 14px/1 var(--font-body)', color: 'var(--text-primary)' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{ font: 'var(--fw-bold) 10.5px/1 var(--font-body)', color: '#fff', background: 'var(--status-escalated)', borderRadius: 20, padding: '2px 7px' }}>{unreadCount} new</span>
                    )}
                  </div>
                  <button onClick={markAllRead} style={{ border: 'none', background: 'none', color: 'var(--accent-700)', font: 'var(--fw-semibold) 12px/1 var(--font-body)', cursor: 'pointer' }}>Mark all read</button>
                </div>
                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                  {notifications.slice(0, 5).map((n) => {
                    const m = NOTIF_CAT[n.category]
                    return (
                      <button
                        key={n.id}
                        onClick={() => { markRead(n.id); setNotifOpen(false); if (n.recordId) nav(`/issues/${n.recordId}`) }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 11, width: '100%', textAlign: 'left', border: 'none', borderLeft: `2px solid ${n.read ? 'transparent' : m.color}`, background: n.read ? 'var(--surface-card)' : 'var(--neutral-25)', padding: '12px 14px', cursor: 'pointer' }}
                      >
                        <span style={{ width: 34, height: 34, borderRadius: 9, background: m.tint, color: m.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                          <Icon icon={m.icon} size={17} />
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', font: 'var(--fw-bold) 9px/1 var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase', color: m.color }}>{n.category}</span>
                          <span style={{ display: 'block', font: 'var(--fw-semibold) 12.5px/1.35 var(--font-body)', color: 'var(--text-primary)', marginTop: 2 }}>{n.title}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            {n.recordId && <span style={{ font: 'var(--fw-semibold) 10.5px/1 var(--font-mono)', color: 'var(--accent-700)' }}>{n.recordId}</span>}
                            <span style={{ font: 'var(--fw-regular) 10.5px/1 var(--font-body)', color: 'var(--text-disabled)' }}>{fmtMDY(n.createdAt)}</span>
                          </span>
                        </span>
                        {!n.read && <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, flex: 'none', marginTop: 5 }} />}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => { setNotifOpen(false); nav('/notifications') }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: 13, border: 'none', borderTop: '1px solid #F0F2F5', background: 'var(--bg-app)', color: 'var(--text-primary)', font: 'var(--fw-semibold) 13px/1 var(--font-body)', cursor: 'pointer' }}
                >
                  View all notifications
                  <Icon icon={ArrowRight} size={15} />
                </button>
              </div>
            </>
          )}
        </span>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            aria-label="User menu (switch role — demo harness)"
            onClick={() => setRoleMenu((v) => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
          >
            <Avatar name={user.name} size="md" />
            <span style={{ textAlign: 'left' }}>
              <span style={{ display: 'block', font: 'var(--fw-semibold) var(--fs-body-sm)/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{user.name}</span>
              <span style={{ display: 'block', font: 'var(--fw-regular) var(--fs-caption)/1.2 var(--font-body)', color: 'var(--text-muted)' }}>
                {role} · {user.roleLabel.replace('After-Sales Manager', 'Area Service Mgr').replace('Service Engineer', 'Service Eng.').replace('Product Quality Manager', 'Product Quality')}
              </span>
            </span>
          </button>
          {roleMenu && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 260, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', padding: 6, zIndex: 60 }}>
              <div style={{ padding: '8px 10px 6px', font: 'var(--fw-semibold) 10.5px/1 var(--font-body)', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Switch role (demo)</div>
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => { setRole(r.key); setRoleMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', border: 'none', background: 'transparent', textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer', font: `${r.key === role ? 'var(--fw-semibold)' : 'var(--fw-regular)'} var(--fs-body-sm)/1.2 var(--font-body)`, color: 'var(--text-primary)' }}
                >
                  <span style={{ width: 14, display: 'inline-flex' }}>{r.key === role && <Icon icon={Check} size={13} />}</span>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Check, HelpCircle } from 'lucide-react'
import { Avatar, IconButton, Logo } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { NotificationPanel } from '@/features/notifications/NotificationPanel'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import type { RoleKey } from '@/data/types'

// App chrome per the UX prototype: a white 60px sticky top bar —
// logo · divider · horizontal primary nav · spacer · help · bell(+unread) · user.
// No side nav. QIR / TSB nav items are present but disabled (out of scope).
//
// EXTRACTED FROM AppShell.tsx (2026-08-27) so that DefaultLayout and
// FixedHeightLayout can render the same header without either owning it — per
// 07-routing-and-layouts.md, both layouts "render the same app header". The
// markup below is a verbatim move; only its wrapper changed.
//
// ON THIS FILE'S LOCATION: 18-project-context-and-implementation-status.md:222
// carries an open placeholder — "Where AppHeader belongs — 07 reserves
// src/layouts/ for layouts" (owner: Frontend Lead). Putting it in src/app/
// HONOURS that reservation but DOES NOT RESOLVE the placeholder; it remains open
// and is not this pass's to close.

const ROLES: { key: RoleKey; label: string }[] = [
  { key: 'SE', label: 'SE — Service Engineer' },
  { key: 'ASM', label: 'ASM — After-Sales Manager' },
  { key: 'PQM', label: 'PQM — Product Quality Manager' },
  { key: 'ADMIN', label: 'Administrator' },
]

// The notification category meta moved to `@/data/notificationCategory` when the
// dropdown became `features/notifications/NotificationPanel`: the Notifications
// page needs the same map, and it could not reach a constant private to this
// file — so it had grown a second, parallel mapping. See that module.

export function AppHeader() {
  const loc = useLocation()
  const nav = useNavigate()
  const { role, user, setRole, can } = useRole()
  const { unreadCount } = useStore()
  const [roleMenu, setRoleMenu] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  /*
   * ⚠️ THE ROLE SWITCHER IS DEV-ONLY, AND AS OF THE ZUSTAND MIGRATION IT WOULD
   * THROW IF SHOWN IN PRODUCTION.
   *
   * `switchRole()` now refuses to run in a production build — 04 calls that a
   * security control rather than hygiene, because it is the second layer of the
   * fuse on fixtures-mode's auth bypass. So the button that calls it must not be
   * offered there either: a visible control that throws when clicked is a worse
   * outcome than an absent one.
   *
   * ⚠️ HIDING IT IS NOT THE CONTROL. The throw is. This flag only stops a user
   * meeting an error; it stops nobody reaching the function. Do not remove the
   * throw on the grounds that the UI is already hidden.
   */
  const roleSwitchAvailable = !import.meta.env.PROD

  useEffect(() => {
    if (!roleMenu) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setRoleMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [roleMenu])

  const seg = loc.pathname.split('/')[1] || 'dashboard'
  const active = seg === 'issues' ? 'issues' : seg === 'qir' ? 'qir' : seg === 'tsb' ? 'tsb' : seg === 'admin' ? 'admin' : seg === 'notifications' ? 'notifications' : 'dashboard'

  const items: { key: string; label: string; to?: string; disabled?: boolean }[] = [
    { key: 'dashboard', label: 'Overview', to: '/dashboard' },
    { key: 'issues', label: 'Issue Management', to: '/issues' },
    { key: 'qir', label: 'QIR Management', to: '/qir' },
    { key: 'tsb', label: 'TSB Management', to: '/tsb' },
    ...(can('administer') ? [{ key: 'admin', label: 'Administration', to: '/admin' }] : []),
  ]

  return (
    <header
      style={{ position: 'sticky', top: 0, zIndex: 40, height: 'var(--header-height)', flex: 'none', background: 'var(--surface-card)', borderBottom: 'var(--border-width) solid var(--border-subtle)' }}
    >
      <div style={{ maxWidth: 1800, height: '100%', margin: '0 auto', padding: '0 var(--space-10)', display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
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
                  position: 'relative',
                  border: 'none',
                  background: 'transparent',
                  padding: '0 var(--space-3)',
                  cursor: it.disabled ? 'not-allowed' : 'pointer',
                  font: `${isActive ? 'var(--fw-semibold)' : 'var(--fw-medium)'} var(--fs-body-md)/1 var(--font-body)`,
                  color: it.disabled ? 'var(--text-disabled)' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {it.label}
                {isActive && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: 'var(--space-3)',
                      right: 'var(--space-3)',
                      bottom: 'var(--space-2)',
                      height: 2,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--accent-500)',
                    }}
                  />
                )}
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
            <span aria-hidden style={{ position: 'absolute', top: 2, right: 2, minWidth: 'var(--icon-sm)', height: 'var(--icon-sm)', padding: '0 var(--space-1)', borderRadius: 'var(--radius-pill)', background: 'var(--status-escalated)', border: '1.5px solid var(--surface-card)', color: 'var(--neutral-0)', font: 'var(--fw-bold) 9.5px/13px var(--font-body)', textAlign: 'center', pointerEvents: 'none' }}>
              {unreadCount}
            </span>
          )}
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </span>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            aria-label="User menu (switch role — demo harness)"
            onClick={() => { if (roleSwitchAvailable) setRoleMenu((v) => !v) }}
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
          {roleMenu && roleSwitchAvailable && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 'var(--sidenav-width)', background: 'var(--surface-card)', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', padding: 6, zIndex: 60 }}>
              <div style={{ padding: '8px 10px 6px', font: 'var(--fw-semibold) 10.5px/1 var(--font-body)', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Switch role (demo)</div>
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => { setRole(r.key); setRoleMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer', font: `${r.key === role ? 'var(--fw-semibold)' : 'var(--fw-regular)'} var(--fs-body-sm)/1.2 var(--font-body)`, color: 'var(--text-primary)' }}
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
  )
}

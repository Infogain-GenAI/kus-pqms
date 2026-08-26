import { useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '../../icons/Icon'
import styles from './SideNav.module.css'

/**
 * SideNav — primary Midnight-black navigation rail. Ported verbatim from the
 * design-system source (_ds_bundle.js → components/navigation/SideNav.jsx).
 *
 * items: [{ key, label, icon?(lucide path d), badge? }]
 * groups optional via sections: [{ title, items }]
 *
 * NOTE: item.icon is a raw Lucide *path `d` string* supplied by data (per the DS
 * contract), so it is rendered as a raw <svg><path d=…/> — it cannot go through the
 * <Icon> Lucide-component wrapper. Focus ring added on nav items for a11y.
 */
export interface NavItemData {
  key: string
  label: string
  /** A Lucide icon component (preferred) or a raw Lucide path `d` string. */
  icon?: LucideIcon | string
  badge?: ReactNode
}

export interface NavSection {
  title?: string
  items: NavItemData[]
}

export interface SideNavProps extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'onSelect'> {
  items?: NavItemData[]
  sections?: NavSection[]
  activeKey?: string
  onSelect?: (key: string) => void
  collapsed?: boolean
  footer?: ReactNode
  header?: ReactNode
  style?: CSSProperties
}

export function SideNav({
  items,
  sections,
  activeKey,
  onSelect,
  collapsed = false,
  footer,
  header,
  style,
  ...rest
}: SideNavProps) {
  const renderItem = (it: NavItemData) => {
    const active = it.key === activeKey
    return (
      <NavItem key={it.key} item={it} active={active} collapsed={collapsed} onSelect={onSelect} />
    )
  }
  return (
    <nav
      style={{
        width: collapsed ? 'var(--sidenav-collapsed)' : 'var(--sidenav-width)',
        height: '100%',
        background: 'var(--kia-midnight)',
        color: 'var(--text-inverse)',
        display: 'flex',
        flexDirection: 'column',
        flex: 'none',
        transition: 'width var(--dur-base) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {header && (
        <div
          style={{
            padding: collapsed ? 'var(--space-4) 0' : 'var(--space-4)',
            display: 'flex',
            justifyContent: collapsed ? 'center' : 'flex-start',
            flex: 'none',
          }}
        >
          {header}
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-2)' }}>
        {sections
          ? sections.map((sec, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                {!collapsed && sec.title && (
                  <div
                    style={{
                      padding: 'var(--space-2) var(--space-3) var(--space-1)',
                      font: 'var(--fw-semibold) 10px/1 var(--font-body)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {sec.title}
                  </div>
                )}
                {sec.items.map(renderItem)}
              </div>
            ))
          : (items || []).map(renderItem)}
      </div>
      {footer && (
        <div
          style={{
            padding: 8,
            borderTop: 'var(--border-width) solid rgba(255,255,255,0.08)',
            flex: 'none',
          }}
        >
          {footer}
        </div>
      )}
    </nav>
  )
}

interface NavItemProps {
  item: NavItemData
  active: boolean
  collapsed: boolean
  onSelect?: (key: string) => void
}

function NavItem({ item, active, collapsed, onSelect }: NavItemProps) {
  const [hover, setHover] = useState(false)
  return (
    <button
      title={collapsed ? item.label : undefined}
      className={styles.focusable}
      onClick={() => onSelect && onSelect(item.key)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        height: 40,
        padding: collapsed ? 0 : '0 var(--space-3)',
        justifyContent: collapsed ? 'center' : 'flex-start',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        textAlign: 'left',
        background: active
          ? 'rgba(255,255,255,0.12)'
          : hover
            ? 'rgba(255,255,255,0.06)'
            : 'transparent',
        color: active ? 'var(--neutral-0)' : 'rgba(255,255,255,0.72)',
        font: `${active ? 'var(--fw-semibold)' : 'var(--fw-medium)'} var(--fs-body-md)/1 var(--font-body)`,
        position: 'relative',
        transition: 'background var(--dur-fast)',
      }}
    >
      {active && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 8,
            bottom: 8,
            width: 3,
            borderRadius: '0 2px 2px 0',
            background: 'var(--accent-300)',
          }}
        />
      )}
      {typeof item.icon === 'function' ? (
        <Icon icon={item.icon} size={20} style={{ flex: 'none' }} />
      ) : item.icon ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flex: 'none' }}
        >
          <path d={item.icon} />
        </svg>
      ) : null}
      {!collapsed && (
        <span
          style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {item.label}
        </span>
      )}
      {!collapsed && item.badge != null && (
        <span
          style={{
            font: 'var(--fw-semibold) 11px/1 var(--font-body)',
            background: 'rgba(255,255,255,0.14)',
            color: 'var(--neutral-0)',
            padding: '2px 7px',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          {item.badge}
        </span>
      )}
    </button>
  )
}

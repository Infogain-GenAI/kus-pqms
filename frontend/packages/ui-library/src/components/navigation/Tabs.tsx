import { useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import styles from './Tabs.module.css'

/**
 * Tabs — underline tab bar. Ported verbatim from the design-system source
 * (_ds_bundle.js → components/navigation/Tabs.jsx). tabs: [{ key, label, badge? }].
 * Focus ring added on tab triggers for a11y.
 */
export interface TabItem {
  key: string
  label: ReactNode
  badge?: ReactNode
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'onChange'> {
  tabs?: TabItem[]
  activeKey?: string
  onChange?: (key: string) => void
  style?: CSSProperties
}

export function Tabs({ tabs = [], activeKey, onChange, style, ...rest }: TabsProps) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        borderBottom: 'var(--border-width) solid var(--border-subtle)',
        ...style,
      }}
      {...rest}
    >
      {tabs.map((t) => {
        const active = t.key === activeKey
        return <Tab key={t.key} tab={t} active={active} onChange={onChange} />
      })}
    </div>
  )
}

interface TabProps {
  tab: TabItem
  active: boolean
  onChange?: (key: string) => void
}

function Tab({ tab, active, onChange }: TabProps) {
  const [hover, setHover] = useState(false)
  return (
    <button
      role="tab"
      aria-selected={active}
      className={styles.focusable}
      onClick={() => onChange && onChange(tab.key)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        height: 40,
        padding: '0 14px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        font: `${active ? 'var(--fw-semibold)' : 'var(--fw-medium)'} var(--fs-body-md)/1 var(--font-body)`,
        color: active ? 'var(--text-primary)' : hover ? 'var(--text-secondary)' : 'var(--text-muted)',
        transition: 'color var(--dur-fast)',
      }}
    >
      {tab.label}
      {tab.badge != null && (
        <span
          style={{
            font: 'var(--fw-semibold) 11px/1 var(--font-body)',
            color: active ? 'var(--accent-700)' : 'var(--text-muted)',
            background: active ? 'var(--accent-50)' : 'var(--neutral-100)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          {tab.badge}
        </span>
      )}
      <span
        style={{
          position: 'absolute',
          left: 8,
          right: 8,
          bottom: -1,
          height: 2,
          borderRadius: '2px 2px 0 0',
          background: active ? 'var(--kia-midnight)' : 'transparent',
          transition: 'background var(--dur-fast)',
        }}
      />
    </button>
  )
}

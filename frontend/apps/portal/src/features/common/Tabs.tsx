import type { ReactNode } from 'react'
import { CountBadge } from './CountBadge'

export interface TabDef {
  key: string
  label: ReactNode
  count: number
}

export interface TabsProps {
  tabs: TabDef[]
  activeKey: string
  onChange: (key: string) => void
}

/**
 * Plain `<button>` tab switcher with a count badge (e.g. My Issues / All Issues).
 *
 * Deliberately NOT `@pqms/ui-library`'s `Tabs` — that renders `role="tab"` /
 * `aria-selected`, which is the correct semantics for genuine tabs but would
 * break every `getByRole('button', { name })` query the list-screen test suite
 * uses against this switcher. Verbatim port of the markup it replaces.
 */
export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div style={{ display: 'flex', gap: 18, alignSelf: 'flex-end' }}>
      {tabs.map(({ key, label, count }) => {
        const active = key === activeKey
        return (
          <button key={key} onClick={() => onChange(key)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: 'transparent', padding: '6px 2px 10px', cursor: 'pointer', font: `${active ? 'var(--fw-bold)' : 'var(--fw-medium)'} var(--fs-body-md)/1 var(--font-body)`, color: active ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: active ? 'inset 0 -2px 0 0 var(--kia-midnight)' : 'none' }}>
            {label}
            <CountBadge tone={active ? 'dark' : 'light'}>{count}</CountBadge>
          </button>
        )
      })}
    </div>
  )
}

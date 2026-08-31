import type { ReactNode } from 'react'

/** Tooltip body for a labeled bullet list (e.g. "MODEL CODES" · SP2 · CV1). */
export function ListTooltipBody({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ font: 'var(--fw-bold) 10px/1 var(--font-body)', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {items.map((it, i) => (
          <li key={`${it}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--fw-medium) var(--fs-body-sm)/1.2 var(--font-body)', color: 'var(--text-primary)' }}>
            <span aria-hidden style={{ width: 'var(--space-1)', height: 'var(--space-1)', borderRadius: '50%', background: 'var(--text-muted)', flex: 'none' }} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Rounded count pill (e.g. "2 Models") used for a cell whose value collapses multiple items. */
export function CountPill({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 'var(--radius-pill)', background: 'var(--neutral-100)', color: 'var(--text-primary)', font: 'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

/** Small "+N" badge appended next to a primary value that has additional hidden values. */
export function MorePill({ n }: { n: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 6px', borderRadius: 'var(--radius-pill)', background: 'var(--neutral-100)', color: 'var(--text-secondary)', font: 'var(--fw-semibold) 11px/1 var(--font-body)' }}>
      +{n}
    </span>
  )
}

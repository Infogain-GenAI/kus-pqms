import type { ReactNode } from 'react'

export interface CountBadgeProps {
  children: ReactNode
  /** 'dark' — filled Kia-Midnight pill (Tabs' active state, an always-on count like Filter's).
   * 'light' — neutral pill (Tabs' inactive state). Defaults to 'dark'. */
  tone?: 'dark' | 'light'
}

/** Small rounded count pill — shared so Tabs' active/inactive counts and a toggle button's
 * "N active" badge (e.g. Filter) render byte-identical pills instead of two near-identical
 * inline literals drifting apart. */
export function CountBadge({ children, tone = 'dark' }: CountBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 19,
        height: 19,
        padding: '0 6px',
        borderRadius: 'var(--radius-pill)',
        background: tone === 'dark' ? 'var(--kia-midnight)' : 'var(--neutral-100)',
        color: tone === 'dark' ? '#fff' : 'var(--text-secondary)',
        font: 'var(--fw-bold) 10.5px/1 var(--font-body)',
      }}
    >
      {children}
    </span>
  )
}

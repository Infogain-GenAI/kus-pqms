import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { IconChip } from '@/app/chrome'

export interface StatCardProps {
  label: string
  count: number | string
  icon: LucideIcon
  tone?: string
  tint?: string
  pct?: string
  /** True when this card's own filter is the one currently applied — draws an
   * accent border so the active KPI stays visually distinguishable from the rest. */
  selected?: boolean
  onClick?: () => void
}

/** KPI card: icon chip + optional pct badge, then count + uppercase label. Used as a strip of stat cards atop a list screen.
 * Hover is JS-driven (inline styles have no `:hover`) — same pattern as IssueCard and Pagination's PageBtn: raises the
 * shadow from xs to md and lifts the card 2px so it reads as elevated, matching the rest of the app's clickable-card
 * affordance. Border stays fixed width — only shadow/transform change on hover; `selected` is a separate, hover-independent
 * color swap on that same border, the same "same width, swap color" pattern Pagination's PageBtn uses for its active state.
 * The .16s timing is a deliberate one-off — it doesn't match any of --dur-fast/base/slow (120/180/240ms). */
export function Card({ label, count, icon, tone = 'var(--text-primary)', tint = 'var(--accent-50)', pct, selected = false, onClick }: StatCardProps) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left',
        background: 'var(--surface-card)',
        border: `var(--border-width) solid ${selected ? 'var(--accent-500)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-xl)',
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-xs)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        padding: 'var(--space-4)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow .16s ease, transform .16s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <IconChip icon={icon} tint={tint} color={tone === 'var(--text-primary)' ? 'var(--accent-600)' : tone} size={36} iconSize={17} />
        {pct && (
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 'var(--icon-md)', padding: '0 var(--space-2)', borderRadius: 'var(--radius-pill)', background: tint, color: tone === 'var(--text-primary)' ? 'var(--accent-700)' : tone, font: 'var(--fw-bold) 11px/1 var(--font-body)' }}>{pct}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <span style={{ font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-display)', color: tone }}>{count}</span>
        <span style={{ font: 'var(--fw-bold) 10.5px/1.2 var(--font-body)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
      </div>
    </button>
  )
}

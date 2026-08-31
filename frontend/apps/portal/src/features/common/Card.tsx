import type { LucideIcon } from 'lucide-react'
import { IconChip } from '@/app/chrome'

export interface StatCardProps {
  label: string
  count: number | string
  icon: LucideIcon
  tone?: string
  tint?: string
  pct?: string
  onClick?: () => void
}

/** KPI card: icon chip + optional pct badge, then count + uppercase label. Used as a strip of stat cards atop a list screen. */
export function Card({ label, count, icon, tone = 'var(--text-primary)', tint = 'var(--accent-50)', pct, onClick }: StatCardProps) {
  return (
    <button onClick={onClick} style={{ textAlign: 'left', background: 'var(--surface-card)', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xs)', padding: 'var(--space-4)', cursor: onClick ? 'pointer' : 'default' }}>
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

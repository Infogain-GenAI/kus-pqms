import { type CSSProperties, type HTMLAttributes } from 'react'
import { Icon } from '@/icons/Icon'
import { SOURCE, type SourceKey } from './sourceMap'

/**
 * SourceBadge — origin channel of an issue (subtle outline chip).
 * Chip styling/sizing ported verbatim from the design-system source
 * (_ds_bundle.js → components/pqms/SourceBadge.jsx). Per the canonical DS, the
 * icon + label are sourced from the single shared SOURCE map (one Lucide icon per
 * channel) instead of the bundle's inline glyphs, rendered through the app Icon wrapper.
 */
export interface SourceBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  source?: SourceKey
  size?: 'sm' | 'md'
  style?: CSSProperties
}

export function SourceBadge({ source = 'warranty', size = 'md', style, ...rest }: SourceBadgeProps) {
  const s = SOURCE[source]
  const fs = size === 'sm' ? '11px' : 'var(--fs-caption)'
  const ic = size === 'sm' ? 12 : 14
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: size === 'sm' ? 18 : 22,
        padding: '0 8px',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface-card)',
        color: 'var(--text-secondary)',
        font: `var(--fw-medium) ${fs}/1 var(--font-body)`,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      <Icon icon={s.icon} size={ic} />
      {s.label}
    </span>
  )
}

import { type CSSProperties, type HTMLAttributes } from 'react'
import { HelpCircle } from 'lucide-react'
import { Icon } from '../../icons/Icon'
import { SOURCE, type SourceKey } from './sourceMap'

/**
 * SourceBadge — origin channel of an issue (subtle outline chip).
 * Chip styling/sizing ported verbatim from the design-system source
 * (_ds_bundle.js → components/pqms/SourceBadge.jsx). Per the canonical DS, the
 * icon + label are sourced from the single shared SOURCE map (one Lucide icon per
 * channel) instead of the bundle's inline glyphs, rendered through the app Icon wrapper.
 *
 * ─── "NO SOURCE" IS A REAL STATE — DO NOT DEFAULT IT TO A CHANNEL ────────────
 * This component used to declare `source = 'warranty'`. That was a defensive
 * default that predated sourceless issues, and it silently ASSERTED a channel
 * that was never chosen: an issue with no source rendered as "Warranty".
 *
 * That stopped being harmless when Issue Entry stopped capturing a source. The
 * design registers an issue first and attributes its origin later on the edit
 * path, so `undefined` is now the NORMAL state for a newly-registered issue —
 * and this badge is the Source column of the main Issue List, rendered for every
 * row. The old default would have labelled every new issue "Warranty" in the
 * primary list view, permanently, and nothing would have looked broken.
 *
 * A wrong label is worse than an empty one: it is indistinguishable from real
 * data, so nobody investigates it.
 */
export interface SourceBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  source?: SourceKey
  size?: 'sm' | 'md'
  style?: CSSProperties
}

export function SourceBadge({ source, size = 'md', style, ...rest }: SourceBadgeProps) {
  // No lookup when there is nothing to look up. `SOURCE[undefined]` is
  // `undefined`, so reading `.icon`/`.label` off it throws — the badge has to
  // branch, not index defensively.
  const s = source ? SOURCE[source] : undefined
  const fs = size === 'sm' ? '11px' : 'var(--fs-caption)'
  const ic = size === 'sm' ? 12 : 14
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: size === 'sm' ? 18 : 22,
        padding: '0 var(--space-2)',
        border: 'var(--border-width) solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface-card)',
        color: 'var(--text-secondary)',
        font: `var(--fw-medium) ${fs}/1 var(--font-body)`,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      <Icon icon={s ? s.icon : HelpCircle} size={ic} />
      {s ? s.label : 'No source'}
    </span>
  )
}

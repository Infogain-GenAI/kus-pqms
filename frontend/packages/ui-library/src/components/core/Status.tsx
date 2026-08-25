import type { CSSProperties, HTMLAttributes } from 'react'
import { STATUS, STATUS_SIZES, type StatusKey, type StatusSize } from './statusMap'

// Three renderings of one lifecycle status, ported verbatim from the design-system
// source (_ds_bundle.js → components/core/{StatusBadge,StatusIndicator,StatusPill}.jsx).
// All read from the single STATUS map — never hand-color or paraphrase a status.

export interface StatusProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  status?: StatusKey
  size?: StatusSize
  disabled?: boolean
  style?: CSSProperties
}

/** StatusBadge — tinted badge (soft bg + status dot). Default, compact; use in tables/dense lists. */
export function StatusBadge({ status = 'open', size = 'md', disabled = false, style, ...rest }: StatusProps) {
  const s = STATUS[status] ?? STATUS.open
  const z = STATUS_SIZES[size] ?? STATUS_SIZES.md
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: z.h,
        padding: `0 ${z.px}px`,
        borderRadius: 'var(--radius-sm)',
        font: `var(--fw-semibold) ${z.fs}/1 var(--font-body)`,
        background: s.tint,
        color: s.text,
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      <span style={{ width: z.dot, height: z.dot, borderRadius: '50%', background: s.color, flex: 'none' }} />
      {s.label}
    </span>
  )
}

/** StatusPill — solid, high-emphasis pill. Use for the single most important status (e.g. issue header). */
export function StatusPill({ status = 'open', size = 'md', disabled = false, style, ...rest }: StatusProps) {
  const s = STATUS[status] ?? STATUS.open
  const z = STATUS_SIZES[size] ?? STATUS_SIZES.md
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: z.h,
        padding: `0 ${z.px + 3}px`,
        borderRadius: 'var(--radius-pill)',
        font: `var(--fw-semibold) ${z.fs}/1 var(--font-body)`,
        background: s.color,
        color: '#fff',
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      <span style={{ width: z.dot, height: z.dot, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', flex: 'none' }} />
      {s.label}
    </span>
  )
}

/** StatusIndicator — minimal colored dot + label. Lightest treatment; inline in text/metadata/legends. */
export function StatusIndicator({ status = 'open', size = 'md', disabled = false, style, ...rest }: StatusProps) {
  const s = STATUS[status] ?? STATUS.open
  const z = STATUS_SIZES[size] ?? STATUS_SIZES.md
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap', ...style }}
      {...rest}
    >
      <span style={{ width: z.dot, height: z.dot, borderRadius: '50%', background: s.color, flex: 'none' }} />
      <span style={{ font: `var(--fw-medium) ${z.fs}/1 var(--font-body)`, color: 'var(--text-primary)' }}>{s.label}</span>
    </span>
  )
}

import { type CSSProperties, type HTMLAttributes } from 'react'

/**
 * Badge — small count / category label. Ported verbatim from the design-system
 * source (_ds_bundle.js → components/core/Badge.jsx).
 * tone: neutral | accent | success | warning | danger | info
 * variant: subtle (tinted) | solid | outline
 */
export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
export type BadgeVariant = 'subtle' | 'solid' | 'outline'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  tone?: BadgeTone
  variant?: BadgeVariant
  size?: BadgeSize
  style?: CSSProperties
}

export function Badge({ tone = 'neutral', variant = 'subtle', size = 'md', children, style, ...rest }: BadgeProps) {
  const tones: Record<BadgeTone, { base: string; tint: string; text: string }> = {
    neutral: {
      base: 'var(--neutral-500)',
      tint: 'var(--neutral-100)',
      text: 'var(--neutral-700)',
    },
    accent: {
      base: 'var(--accent-500)',
      tint: 'var(--accent-50)',
      text: 'var(--accent-700)',
    },
    success: {
      base: 'var(--success-500)',
      tint: 'var(--success-50)',
      text: 'var(--success-600)',
    },
    warning: {
      base: 'var(--warning-500)',
      tint: 'var(--warning-50)',
      text: 'var(--warning-600)',
    },
    danger: {
      base: 'var(--danger-500)',
      tint: 'var(--danger-50)',
      text: 'var(--danger-600)',
    },
    info: {
      base: 'var(--info-500)',
      tint: 'var(--info-50)',
      text: 'var(--info-500)',
    },
  }
  const t = tones[tone] || tones.neutral
  const fs = size === 'sm' ? '11px' : 'var(--fs-caption)'
  const pad = size === 'sm' ? '1px 6px' : '2px 8px'
  const styles: Record<BadgeVariant, CSSProperties> = {
    subtle: {
      background: t.tint,
      color: t.text,
      border: '1px solid transparent',
    },
    solid: {
      background: t.base,
      color: '#fff',
      border: '1px solid transparent',
    },
    outline: {
      background: 'transparent',
      color: t.text,
      border: `1px solid ${t.base}`,
    },
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: `var(--fw-semibold) ${fs}/1.4 var(--font-body)`,
        padding: pad,
        borderRadius: 'var(--radius-sm)',
        whiteSpace: 'nowrap',
        ...styles[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  )
}

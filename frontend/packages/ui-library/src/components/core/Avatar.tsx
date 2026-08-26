import { type CSSProperties, type HTMLAttributes } from 'react'

/**
 * Avatar — user initials or image. Sizes sm | md | lg.
 * Ported verbatim from the design-system source (_ds_bundle.js → components/core/Avatar.jsx).
 */
export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  name?: string
  src?: string | null
  size?: AvatarSize
  style?: CSSProperties
}

export function Avatar({ name = '', src = null, size = 'md', style, ...rest }: AvatarProps) {
  const sizes: Record<AvatarSize, number> = {
    sm: 24,
    md: 32,
    lg: 40,
  }
  const dim = sizes[size] || 32
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

  // deterministic tint from name
  const hues = ['var(--accent-500)', 'var(--status-review)', 'var(--status-disposed)', 'var(--status-pending)', 'var(--kia-midnight-70)']
  const hue = hues[(name.charCodeAt(0) || 0) % hues.length]
  return (
    <span
      title={name}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: '50%',
        overflow: 'hidden',
        background: src ? 'var(--neutral-100)' : hue,
        color: 'var(--neutral-0)',
        flex: 'none',
        font: `var(--fw-semibold) ${dim * 0.4}px/1 var(--font-body)`,
        ...style,
      }}
      {...rest}
    >
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </span>
  )
}

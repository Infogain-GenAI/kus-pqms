import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'
import styles from './button.module.css'

/**
 * Button — primary action control. Ported verbatim from the design-system source
 * (_ds_bundle.js → components/core/Button.jsx). NOTE: `primary` is Kia Midnight
 * (not accent-500 as DESIGN.md's prose says — the DS source is authoritative).
 * Hover/active are JS-driven (as in the DS source); focus ring added for a11y.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  style?: CSSProperties
}

const SIZES: Record<ButtonSize, { h: string; px: string; fs: string; gap: string }> = {
  sm: { h: 'var(--control-sm)', px: '10px', fs: 'var(--fs-body-sm)', gap: '6px' },
  md: { h: 'var(--control-md)', px: '14px', fs: 'var(--fs-body-md)', gap: 'var(--space-2)' },
  lg: { h: 'var(--control-lg)', px: '18px', fs: 'var(--fs-body-lg)', gap: 'var(--space-2)' },
}

const PALETTE: Record<ButtonVariant, { bg: string; fg: string; bd: string; hbg: string; abg: string }> = {
  primary: { bg: 'var(--kia-midnight)', fg: 'var(--text-inverse)', bd: 'transparent', hbg: 'var(--kia-midnight-80)', abg: 'var(--kia-midnight-90)' },
  secondary: { bg: 'var(--surface-card)', fg: 'var(--text-primary)', bd: 'var(--border-default)', hbg: 'var(--neutral-50)', abg: 'var(--neutral-100)' },
  tertiary: { bg: 'var(--accent-50)', fg: 'var(--accent-700)', bd: 'transparent', hbg: 'var(--accent-100)', abg: 'var(--accent-100)' },
  danger: { bg: 'var(--danger-500)', fg: '#fff', bd: 'transparent', hbg: 'var(--danger-600)', abg: 'var(--danger-600)' },
  ghost: { bg: 'transparent', fg: 'var(--text-secondary)', bd: 'transparent', hbg: 'var(--neutral-50)', abg: 'var(--neutral-100)' },
  link: { bg: 'transparent', fg: 'var(--text-link)', bd: 'transparent', hbg: 'transparent', abg: 'transparent' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  type = 'button',
  children,
  style,
  className,
  ...rest
}: ButtonProps) {
  const s = SIZES[size] ?? SIZES.md
  const p = PALETTE[variant] ?? PALETTE.primary
  const isLink = variant === 'link'
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const isDisabled = disabled || loading
  const bg = isDisabled ? 'var(--disabled-bg)' : active ? p.abg : hover ? p.hbg : p.bg
  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[styles.btn, className].filter(Boolean).join(' ')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setActive(false)
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        height: s.h,
        padding: isLink ? '0 var(--space-1)' : `0 ${s.px}`,
        width: fullWidth ? '100%' : 'auto',
        font: `var(--fw-semibold) ${s.fs}/1 var(--font-body)`,
        color: isDisabled ? 'var(--text-disabled)' : p.fg,
        background: bg,
        border: `1px solid ${isDisabled ? (isLink ? 'transparent' : 'var(--border-subtle)') : p.bd}`,
        borderRadius: 'var(--radius-md)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        textDecoration: isLink && hover && !isDisabled ? 'underline' : 'none',
        textUnderlineOffset: '3px',
        transition: 'background var(--dur-fast) var(--ease-standard)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {!loading && iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  )
}

import { useState, type ButtonHTMLAttributes, type CSSProperties } from 'react'
import styles from './IconButton.module.css'

/**
 * IconButton — square, icon-only action. Pass a Lucide icon as children.
 * Ported verbatim from the design-system source (_ds_bundle.js → components/core/IconButton.jsx).
 * Hover is JS-driven (as in the DS source); focus ring added for a11y.
 * Variants: default | ghost | danger; Sizes: sm | md | lg
 */
export type IconButtonVariant = 'default' | 'ghost' | 'danger'
export type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: IconButtonVariant
  size?: IconButtonSize
  style?: CSSProperties
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  disabled = false,
  'aria-label': ariaLabel,
  children,
  style,
  className,
  ...rest
}: IconButtonProps) {
  const sizes: Record<IconButtonSize, number> = {
    sm: 28,
    md: 36,
    lg: 44,
  }
  const dim = sizes[size] || 36
  const palette: Record<IconButtonVariant, { bg: string; bd: string; fg: string; hbg: string }> = {
    default: {
      bg: 'var(--surface-card)',
      bd: 'var(--border-default)',
      fg: 'var(--text-secondary)',
      hbg: 'var(--neutral-50)',
    },
    ghost: {
      bg: 'transparent',
      bd: 'transparent',
      fg: 'var(--text-secondary)',
      hbg: 'var(--neutral-50)',
    },
    danger: {
      bg: 'transparent',
      bd: 'transparent',
      fg: 'var(--danger-500)',
      hbg: 'var(--danger-50)',
    },
  }
  const p = palette[variant] || palette.ghost
  const [hover, setHover] = useState(false)
  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      className={[styles.focusable, className].filter(Boolean).join(' ')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        color: disabled ? 'var(--text-disabled)' : p.fg,
        background: disabled ? 'var(--disabled-bg)' : hover ? p.hbg : p.bg,
        border: `1px solid ${disabled ? 'var(--border-subtle)' : p.bd}`,
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}

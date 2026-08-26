import { useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'

/**
 * Tooltip — hover/focus label. placement: top | bottom | left | right.
 * Ported verbatim from the design-system source (_ds_bundle.js → components/feedback/Tooltip.jsx).
 * NOTE: the `style` prop customises the tooltip bubble (inner span), not the wrapper — as in the DS source.
 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  label?: ReactNode
  placement?: TooltipPlacement
  style?: CSSProperties
}

export function Tooltip({ label, placement = 'top', children, style, ...rest }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const positions: Record<TooltipPlacement, CSSProperties> = {
    top: {
      bottom: 'calc(100% + 6px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    bottom: {
      top: 'calc(100% + 6px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    left: {
      right: 'calc(100% + 6px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    right: {
      left: 'calc(100% + 6px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  }
  const pos = positions[placement]
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      {...rest}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 'var(--z-dropdown)',
            ...pos,
            padding: '5px 9px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--kia-midnight)',
            color: 'var(--neutral-0)',
            font: `var(--fw-medium) var(--fs-caption)/1.3 var(--font-body)`,
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            pointerEvents: 'none',
            ...style,
          }}
        >
          {label}
        </span>
      )}
    </span>
  )
}

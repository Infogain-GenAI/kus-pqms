import { useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Tooltip — hover/focus label. placement: top | bottom | left | right.
 * Ported from the design-system source (_ds_bundle.js → components/feedback/Tooltip.jsx),
 * with one deliberate departure: the bubble renders through a portal to `document.body`
 * instead of as an absolutely-positioned sibling. A table with `border-collapse: collapse`
 * establishes a stacking context per cell, which silently paints a positioned descendant of
 * one row underneath a later sibling row regardless of z-index — the portal sidesteps that
 * entirely so the tooltip also works as a table-cell trigger.
 * NOTE: the `style` prop customises the tooltip bubble, not the wrapper — as in the DS source.
 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  label?: ReactNode
  placement?: TooltipPlacement
  style?: CSSProperties
  /** Overrides the wrapper span's own style (default: `position: relative; display: inline-flex`) — for callers that need the trigger to fill its container, e.g. a truncated table cell. */
  wrapperStyle?: CSSProperties
}

const GAP = 6
const NOTCH_SIZE = 8

function bubblePosition(placement: TooltipPlacement, rect: DOMRect): CSSProperties {
  switch (placement) {
    case 'top':
      return { left: rect.left + rect.width / 2, top: rect.top - GAP, transform: 'translate(-50%, -100%)' }
    case 'bottom':
      return { left: rect.left + rect.width / 2, top: rect.bottom + GAP, transform: 'translate(-50%, 0)' }
    case 'left':
      return { left: rect.left - GAP, top: rect.top + rect.height / 2, transform: 'translate(-100%, -50%)' }
    case 'right':
      return { left: rect.right + GAP, top: rect.top + rect.height / 2, transform: 'translate(0, -50%)' }
  }
}

/**
 * A 45°-rotated square, half tucked behind the bubble's edge, with only the two
 * outward-facing sides bordered — the standard "speech bubble" notch trick. Which
 * two sides are visible (and so which corner becomes the pointing tip) depends on
 * the bubble's placement relative to the trigger it points back at.
 */
function notchStyle(placement: TooltipPlacement, background: CSSProperties['background'], bordered: boolean): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    background,
    transform: 'rotate(45deg)',
    borderStyle: 'solid',
    borderWidth: bordered ? 'var(--border-width)' : 0,
    borderColor: 'var(--border-subtle)',
  }
  switch (placement) {
    // Bubble is ABOVE the trigger — notch sits on the bubble's bottom edge, tip pointing down.
    case 'top':
      return { ...base, bottom: -NOTCH_SIZE / 2, left: '50%', marginLeft: -NOTCH_SIZE / 2, borderTopWidth: 0, borderLeftWidth: 0 }
    // Bubble is BELOW the trigger — notch sits on the bubble's top edge, tip pointing up.
    case 'bottom':
      return { ...base, top: -NOTCH_SIZE / 2, left: '50%', marginLeft: -NOTCH_SIZE / 2, borderRightWidth: 0, borderBottomWidth: 0 }
    // Bubble is LEFT of the trigger — notch sits on the bubble's right edge, tip pointing right.
    case 'left':
      return { ...base, right: -NOTCH_SIZE / 2, top: '50%', marginTop: -NOTCH_SIZE / 2, borderBottomWidth: 0, borderLeftWidth: 0 }
    // Bubble is RIGHT of the trigger — notch sits on the bubble's left edge, tip pointing left.
    case 'right':
      return { ...base, left: -NOTCH_SIZE / 2, top: '50%', marginTop: -NOTCH_SIZE / 2, borderTopWidth: 0, borderRightWidth: 0 }
  }
}

export function Tooltip({ label, placement = 'top', children, style, wrapperStyle, ...rest }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const update = () => setRect(triggerRef.current!.getBoundingClientRect())
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  const resolvedBackground = style?.background ?? 'var(--kia-midnight)'
  const bordered = Boolean(style?.border)

  return (
    <span
      ref={triggerRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        ...wrapperStyle,
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      {...rest}
    >
      {children}
      {open &&
        rect &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: 'fixed',
              zIndex: 'var(--z-dropdown)',
              ...bubblePosition(placement, rect),
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
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
            <span aria-hidden style={notchStyle(placement, resolvedBackground, bordered)} />
          </span>,
          document.body
        )}
    </span>
  )
}

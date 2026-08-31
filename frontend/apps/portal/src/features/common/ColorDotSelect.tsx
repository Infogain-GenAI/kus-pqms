import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { Icon } from '@pqms/ui-library'

export interface ColorDotOption {
  key: string
  label: string
  color: string
}

export interface ColorDotSelectProps {
  value: string
  options: ColorDotOption[]
  onChange: (key: string) => void
  placeholder?: string
}

/**
 * Custom select with a colored dot per option (e.g. matching status badges elsewhere
 * in the app). The native `Select` can't render option content, hence this bespoke
 * dropdown instead of reusing it.
 *
 * The options panel renders through a portal to `document.body` with `position: fixed`,
 * computed from the trigger's own bounding rect, rather than as an absolutely-positioned
 * child. A modal body scrolls based on its descendants' full painted extent — an absolute
 * panel inside it still pushes that extent outward even with its own `overflow-y: auto`,
 * so the *modal* ends up scrolling to reveal it instead of the panel scrolling in place.
 * Portaling out sidesteps that entirely (same fix as the table-cell Tooltip elsewhere).
 */
export function ColorDotSelect({ value, options, onChange, placeholder = 'Select…' }: ColorDotSelectProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!open) return
    // The panel is a portal-child of <body>, not a DOM descendant of the trigger, so a click
    // on an option is otherwise indistinguishable from a genuine outside click — closing the
    // menu on mousedown then leaves nothing mounted for the option's own click to land on.
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const selected = options.find((o) => o.key === value)
  return (
    <div ref={triggerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', height: 'var(--control-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-3)', border: `var(--border-width) solid ${open ? 'var(--accent-500)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', boxShadow: open ? 'var(--shadow-focus)' : 'none', cursor: 'pointer', font: 'var(--fw-regular) var(--fs-body-md)/1 var(--font-body)', color: selected ? 'var(--text-primary)' : 'var(--text-disabled)' }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {selected && <span aria-hidden style={{ width: 'var(--space-2)', height: 'var(--space-2)', borderRadius: '50%', background: selected.color, flex: 'none' }} />}
          {selected ? selected.label : placeholder}
        </span>
        <Icon icon={ChevronDown} size={16} style={{ color: 'var(--text-disabled)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }} />
      </button>
      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
              // Above var(--z-modal) (1200): this panel is a portal-child of <body>, same as
              // the Modal itself, so it needs to outrank the modal's own z-index to paint on
              // top of it — the ordinary --z-dropdown tier (1000) sits below the modal.
              zIndex: 'var(--z-toast)' as unknown as number,
              maxHeight: 220,
              overflowY: 'auto',
              background: 'var(--surface-card)',
              border: 'var(--border-width) solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: 'var(--space-1)',
            }}
          >
            {options.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => { onChange(o.key); setOpen(false) }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', border: 'none', background: value === o.key ? 'var(--neutral-50)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left', font: 'var(--fw-semibold) var(--fs-body-md)/1 var(--font-body)', color: 'var(--text-primary)' }}
              >
                <span aria-hidden style={{ width: 'var(--space-2)', height: 'var(--space-2)', borderRadius: '50%', background: o.color, flex: 'none' }} />
                {o.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}

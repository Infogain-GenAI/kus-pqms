import { Fragment, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '@pqms/ui-library'

export interface BulkActionBarAction {
  key: string
  label: ReactNode
  icon: LucideIcon
  onClick: () => void
}

export interface BulkActionBarProps {
  /** How many rows are selected. The bar renders nothing when this is 0. */
  count: number
  /** The count's noun, already pluralized by the caller (e.g. "Issue Selected" / "Issues Selected"). */
  label: ReactNode
  actions: BulkActionBarAction[]
  onClear: () => void
  clearLabel?: string
}

const dividerStyle = { width: 'var(--border-width)', height: 'var(--space-5)', background: 'rgba(255,255,255,0.2)', flex: 'none' } as const
const actionButtonStyle = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', border: 'none', background: 'transparent', padding: 0, color: 'var(--neutral-0)', font: 'var(--fw-semibold) var(--fs-body-md)/1 var(--font-body)', whiteSpace: 'nowrap', cursor: 'pointer' } as const

/** Floating pill bar shown over the table once rows are selected — selection count, a row of
 * actions, and a clear (X) control. Used by any list screen with row selection (Issue List
 * today, QIR later). */
export function BulkActionBar({ count, label, actions, onClear, clearLabel = 'Clear selection' }: BulkActionBarProps) {
  if (count === 0) return null
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'var(--space-6)',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-sticky)' as unknown as number,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-2) var(--space-5)',
        background: 'var(--kia-midnight)',
        borderRadius: 'var(--radius-pill)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'var(--control-sm)', height: 'var(--control-sm)', borderRadius: '50%', background: 'var(--neutral-0)', color: 'var(--kia-midnight)', font: 'var(--fw-bold) var(--fs-body-sm)/1 var(--font-body)', flex: 'none' }}>
          {count}
        </span>
        <span style={{ color: 'var(--neutral-0)', font: 'var(--fw-semibold) var(--fs-body-md)/1 var(--font-body)', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </span>
      {actions.map((a) => (
        <Fragment key={a.key}>
          <span aria-hidden style={dividerStyle} />
          <button onClick={a.onClick} style={actionButtonStyle}>
            <Icon icon={a.icon} size={16} />
            {a.label}
          </button>
        </Fragment>
      ))}
      <span aria-hidden style={dividerStyle} />
      <button
        aria-label={clearLabel}
        onClick={onClear}
        style={{ display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', padding: 0, color: 'var(--neutral-0)', cursor: 'pointer' }}
      >
        <Icon icon={X} size={18} />
      </button>
    </div>
  )
}

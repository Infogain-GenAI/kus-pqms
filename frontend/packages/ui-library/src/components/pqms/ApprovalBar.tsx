import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { Clock } from 'lucide-react'
import { Icon } from '../../icons/Icon'
import { Button } from '../core/Button'

/**
 * ApprovalBar — approval request panel with approve / reject / delegate. Ported
 * verbatim from the design-system source (_ds_bundle.js → components/pqms/
 * ApprovalBar.jsx). Shows requester, step, and action buttons. The clock avatar
 * is Lucide Clock (DS used an inline clock path). Action buttons render via the
 * ported <Button>, which already carries the always-visible focus ring.
 */
export interface ApprovalBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'title'> {
  title?: ReactNode
  requester?: ReactNode
  step?: ReactNode
  onApprove?: () => void
  onReject?: () => void
  onDelegate?: () => void
  style?: CSSProperties
}

export function ApprovalBar({
  title = 'Pending your approval',
  requester,
  step,
  onApprove,
  onReject,
  onDelegate,
  style,
  ...rest
}: ApprovalBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 16px',
        background: 'var(--warning-50)',
        border: '1px solid #F4E2C0',
        borderRadius: 'var(--radius-lg)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--warning-500)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <Icon icon={Clock} size={18} strokeWidth={2} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              font: `var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)`,
              color: 'var(--warning-600)',
            }}
          >
            {title}
          </div>
          <div
            style={{
              font: `var(--fw-regular) var(--fs-body-sm)/1.3 var(--font-body)`,
              color: 'var(--text-secondary)',
            }}
          >
            {requester && <>Requested by {requester}</>}
            {requester && step && ' · '}
            {step}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
        {onDelegate && (
          <Button variant="ghost" size="sm" onClick={onDelegate}>
            Delegate
          </Button>
        )}
        {onReject && (
          <Button variant="secondary" size="sm" onClick={onReject}>
            Reject
          </Button>
        )}
        {onApprove && (
          <Button variant="primary" size="sm" onClick={onApprove}>
            Approve
          </Button>
        )}
      </div>
    </div>
  )
}

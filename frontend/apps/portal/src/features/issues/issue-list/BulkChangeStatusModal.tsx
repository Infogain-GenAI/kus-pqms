import { Check, RefreshCw, X } from 'lucide-react'
import { Button, Icon, STATUS, STATUS_KEYS, Textarea } from '@pqms/ui-library'
import { IconChip, Modal, ULabel } from '@/app/chrome'
import { ColorDotSelect } from '@/features/common/ColorDotSelect'
import { useTranslation } from 'react-i18next'
import { NS } from './IssueListScreen.i18n'

export interface BulkChangeStatusModalProps {
  open: boolean
  onClose: () => void
  count: number
  target: string
  onTargetChange: (v: string) => void
  reason: string
  onReasonChange: (v: string) => void
  onSubmit: () => void
  submitDisabled: boolean
}

/** Bulk status-change modal. Wires the generic ColorDotSelect to this app's STATUS map. */
export function BulkChangeStatusModal({ open, onClose, count, target, onTargetChange, reason, onReasonChange, onSubmit, submitDisabled }: BulkChangeStatusModalProps) {
  const { t } = useTranslation(NS)
  if (!open) return null
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={520}
      title={
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <IconChip icon={RefreshCw} tint="var(--accent-50)" color="var(--accent-600)" size={40} iconSize={18} />
            <div>
              <div style={{ font: 'var(--fw-bold) var(--fs-h4)/1.25 var(--font-body)', color: 'var(--text-primary)' }}>{t('bulkStatusTitle')}</div>
              <div style={{ marginTop: 4, font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
                {t('bulkStatusBody', { count })}
              </div>
            </div>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', color: 'var(--text-secondary)', cursor: 'pointer', flex: 'none' }}
          >
            <Icon icon={X} size={18} />
          </button>
        </div>
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{t('bulkStatusCancel')}</Button>
          <Button iconLeft={<Icon icon={Check} size={15} />} onClick={onSubmit} disabled={submitDisabled}>
            {t('bulkStatusSubmit', { count })}
          </Button>
        </>
      }
    >
      <div style={{ borderTop: 'var(--border-width) solid var(--border-subtle)', margin: '0 0 var(--space-4)' }} />
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <ULabel>{t('bulkStatusNewStatus')} <span style={{ color: 'var(--danger-500)' }}>*</span></ULabel>
        <ColorDotSelect
          value={target}
          onChange={onTargetChange}
          placeholder="Select status…"
          options={STATUS_KEYS.map((k) => ({ key: k, label: STATUS[k].label, color: STATUS[k].color }))}
        />
      </div>
      <div>
        <ULabel>{t('bulkStatusReason')} <span style={{ color: 'var(--danger-500)' }}>*</span></ULabel>
        <Textarea aria-label="Reason / comment" value={reason} onChange={(e) => onReasonChange(e.target.value)} rows={3} placeholder="e.g. Bulk triage — moving reviewed issues to the next stage" />
      </div>
    </Modal>
  )
}

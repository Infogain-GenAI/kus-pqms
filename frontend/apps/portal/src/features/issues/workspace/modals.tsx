import { useState } from 'react'
import { Check, ClipboardPlus } from 'lucide-react'
import { Button, STATUS, STATUS_KEYS, Select, StatusBadge, Textarea, type StatusKey } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { Modal, ULabel } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import type { DispositionOutcome, Issue } from '@/data/types'
import { inputStyle } from './shared'
import { Trans, useTranslation } from 'react-i18next'
import { NS } from './IssueDetail.i18n'

// The four Workspace modals, moved verbatim from IssueWorkspaceScreen.tsx
// (2026-08-27) when the sections became child routes.
//
// THEY STAY MOUNTED IN THE SHELL, not in sections, and the reason is not
// tidiness: three of the four are opened from the SHELL's own header buttons
// (Edit issue / Change status / Create QIR), and two are ALSO opened from inside
// sections — Resolution reaches "Change status" and "Create QIR", and Detail
// reaches "Manage links". A modal owned by a section would unmount the moment the
// user navigated to a sibling section, and would not exist at all when the header
// button that opens it is the one pressed.
//
// That is why `openModal` is on the workspace outlet context: the sections ask
// the shell to open them.

export function ChangeStatusModal({ open, issue, canApprove, onClose }: { open: boolean; issue: Issue; canApprove: boolean; onClose: () => void }) {
  const { t } = useTranslation(NS)
  const store = useStore()
  const { user } = useRole()
  const [target, setTarget] = useState<StatusKey | ''>('')
  const [reason, setReason] = useState('')
  const actor = { name: user.name, role: user.role }
  /**
   * TERMINAL STATES ACCEPT NO FURTHER CHANGE.
   *
   * A closed or out-of-scope issue is finished. The modal previously offered the
   * full status list for one anyway — so a closed issue could be walked back to
   * `open` with a one-word reason, silently, and the audit trail would record it
   * as an ordinary transition.
   *
   * The guard is stated here rather than by removing the header button, because
   * a user who reaches for it needs to be told WHY it will not work; a control
   * that has quietly vanished teaches nothing.
   */
  const terminal = issue.status === 'closed' || issue.status === 'outofscope'
  // NASO (no action) keeps the ≥30-char justification gate the disposition flow required.
  const minLen = target === 'outofscope' ? 30 : 1
  const valid = !terminal && target && reason.trim().length >= minLen
  const submit = () => {
    if (!valid || !target) return
    const oc: DispositionOutcome | undefined = target === 'outofscope' ? 'No Action' : target === 'monitoring' ? 'Monitoring' : undefined
    if (canApprove) store.setStatus(issue.id, target, reason.trim(), actor, 'Status changed', oc)
    else store.proposeTransition(issue.id, target, reason.trim(), actor, oc)
    setTarget(''); setReason(''); onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={
      <>
        {t('statusModalTitle')}
        <div style={{ marginTop: 3, font: 'var(--fw-regular) var(--fs-body-sm)/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>{t('statusModalSubtitle')}</div>
      </>
    } footer={
      <>
        <Button variant="ghost" onClick={onClose}>{t('statusModalCancel')}</Button>
        <Button disabled={!valid} iconLeft={<Icon icon={Check} size={16} />} onClick={submit}>{t('statusModalSave')}</Button>
      </>
    }>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
        <ULabel style={{ marginBottom: 0 }}>{t('statusModalCurrentStatus')}</ULabel>
        <StatusBadge status={issue.status} />
      </div>
      {terminal && (
        <p style={{ margin: '0 0 var(--space-4)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--neutral-50)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }} role="status">
          <Trans t={t} i18nKey="statusModalTerminal" values={{ status: STATUS[issue.status].label }} components={{ b: <b style={{ color: 'var(--text-primary)' }} /> }} />
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div>
          <ULabel>{t('statusModalNewStatus')}</ULabel>
          <Select aria-label="New status" value={target} disabled={terminal} placeholder="Select status…" options={STATUS_KEYS.filter((k) => k !== issue.status).map((k) => ({ value: k, label: STATUS[k].label }))} onChange={(e) => setTarget(e.target.value as StatusKey)} />
        </div>
      </div>
      <ULabel>{t('statusModalReason')}</ULabel>
      <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={target === 'outofscope' ? 'NASO (no action) requires at least 30 characters…' : 'e.g. Reviewed investigation details and moved for technical validation'} />
      <p style={{ margin: '10px 0 0', font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
        {canApprove ? 'Override roles apply directly; the justification is audit-logged.' : 'Submits as Pending Approval — an ASM/PQM decides with a remark.'}
      </p>
    </Modal>
  )
}

export function CreateQirModal({ open, issue, onClose }: { open: boolean; issue: Issue; onClose: () => void }) {
  const { t } = useTranslation(NS)
  const store = useStore()
  const { user } = useRole()
  const [reason, setReason] = useState('')
  const valid = reason.trim().length >= 20
  return (
    <Modal open={open} onClose={onClose} title="Create QIR" footer={
      <>
        <Button variant="ghost" onClick={onClose}>{t('qirModalCancel')}</Button>
        <Button disabled={!valid} iconLeft={<Icon icon={ClipboardPlus} size={15} />} onClick={() => { store.setStatus(issue.id, 'escalated', reason.trim(), { name: user.name, role: user.role }, 'Escalated to QIR (hand-off)'); setReason(''); onClose() }}>{t('qirModalCreate')}</Button>
      </>
    }>
      <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>
        <Trans t={t} i18nKey="qirModalBody" values={{ issueId: issue.id }} components={{ b: <b /> }} />
      </p>
      <ULabel>{t('qirModalReason')}</ULabel>
      <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why does this issue warrant a QIR?" />
    </Modal>
  )
}

export function EditIssueModal({ open, issue, onClose }: { open: boolean; issue: Issue; onClose: () => void }) {
  const { t } = useTranslation(NS)
  const store = useStore()
  const { user } = useRole()
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description)
  const [dtc, setDtc] = useState((issue.dtcCodes ?? []).join(', '))
  const valid = title.trim().length >= 5
  return (
    <Modal open={open} onClose={onClose} title="Edit issue" footer={
      <>
        <Button variant="ghost" onClick={onClose}>{t('editModalCancel')}</Button>
        <Button disabled={!valid} onClick={() => { store.updateIssue(issue.id, { title: title.trim(), description: description.trim(), dtcCodes: dtc.trim() ? dtc.split(',').map((d) => d.trim()).filter(Boolean) : undefined }, { name: user.name, role: user.role }); onClose() }}>{t('editModalSave')}</Button>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div><ULabel>{t('editModalTitle')}</ULabel><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. EV6 — HV battery rapid SOC drop under cold soak" style={{ ...inputStyle, height: 'var(--control-md)' }} /></div>
        <div><ULabel>{t('editModalDescription')}</ULabel><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Symptoms, reproduction steps, environmental conditions, frequency, and any safety implications…" /></div>
        <div><ULabel>{t('editModalDtc')} <span style={{ color: 'var(--text-disabled)', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>{t('editModalDtcHint')}</span></ULabel><input value={dtc} onChange={(e) => setDtc(e.target.value)} placeholder="e.g. P0A0F, C1234, B1020" style={{ ...inputStyle, height: 'var(--control-md)' }} /></div>
      </div>
    </Modal>
  )
}

/**
 * Manage Related Issues — the PARENT/CHILD GROUP editor.
 *
 * ─── IT MOVED, AND THE NAME STAYED ──────────────────────────────────────────
 *
 * The implementation now lives in `ManageRelatedIssuesModal.tsx`, rebuilt to the
 * prototype's own anatomy: a banded dialog with a search panel, an impact band
 * and a Parent-change warning. It outgrew this file, which holds the three small
 * modals the shell's header buttons open.
 *
 * The `ManageLinksModal` alias stays because two test files and the shell import
 * it by that name, and renaming a symbol is not part of a design sync — the new
 * name is the accurate one and callers can migrate to it on their own schedule.
 */
export { ManageRelatedIssuesModal as ManageLinksModal } from './ManageRelatedIssuesModal'

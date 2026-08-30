import { useEffect, useMemo, useState } from 'react'
import { Check, ClipboardPlus, Link2 } from 'lucide-react'
import { Button, STATUS, STATUS_KEYS, Select, StatusBadge, Textarea, type StatusKey } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { Modal, ULabel } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import type { DispositionOutcome, Issue } from '@/data/types'
import { inputStyle } from './shared'

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
        Change issue status
        <div style={{ marginTop: 3, font: 'var(--fw-regular) var(--fs-body-sm)/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>A valid reason is required for every status change.</div>
      </>
    } footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!valid} iconLeft={<Icon icon={Check} size={16} />} onClick={submit}>Save status change</Button>
      </>
    }>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
        <ULabel style={{ marginBottom: 0 }}>Current status</ULabel>
        <StatusBadge status={issue.status} />
      </div>
      {terminal && (
        <p style={{ margin: '0 0 var(--space-4)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--neutral-50)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }} role="status">
          This issue is <b style={{ color: 'var(--text-primary)' }}>{STATUS[issue.status].label}</b> and its status cannot be changed any further.
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div>
          <ULabel>New status *</ULabel>
          <Select aria-label="New status" value={target} disabled={terminal} placeholder="Select status…" options={STATUS_KEYS.filter((k) => k !== issue.status).map((k) => ({ value: k, label: STATUS[k].label }))} onChange={(e) => setTarget(e.target.value as StatusKey)} />
        </div>
      </div>
      <ULabel>Reason / comment *</ULabel>
      <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={target === 'outofscope' ? 'NASO (no action) requires at least 30 characters…' : 'e.g. Reviewed investigation details and moved for technical validation'} />
      <p style={{ margin: '10px 0 0', font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
        {canApprove ? 'Override roles apply directly; the justification is audit-logged.' : 'Submits as Pending Approval — an ASM/PQM decides with a remark.'}
      </p>
    </Modal>
  )
}

export function CreateQirModal({ open, issue, onClose }: { open: boolean; issue: Issue; onClose: () => void }) {
  const store = useStore()
  const { user } = useRole()
  const [reason, setReason] = useState('')
  const valid = reason.trim().length >= 20
  return (
    <Modal open={open} onClose={onClose} title="Create QIR" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!valid} iconLeft={<Icon icon={ClipboardPlus} size={15} />} onClick={() => { store.setStatus(issue.id, 'escalated', reason.trim(), { name: user.name, role: user.role }, 'Escalated to QIR (hand-off)'); setReason(''); onClose() }}>Create QIR</Button>
      </>
    }>
      <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>
        Escalates {issue.id} to the QIR module. The issue becomes <b>Escalated</b>; the QIR reference will appear read-only in Resolution. The QIR module owns what happens next.
      </p>
      <ULabel>Escalation reason * (min 20 characters)</ULabel>
      <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why does this issue warrant a QIR?" />
    </Modal>
  )
}

export function EditIssueModal({ open, issue, onClose }: { open: boolean; issue: Issue; onClose: () => void }) {
  const store = useStore()
  const { user } = useRole()
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description)
  const [dtc, setDtc] = useState((issue.dtcCodes ?? []).join(', '))
  const valid = title.trim().length >= 5
  return (
    <Modal open={open} onClose={onClose} title="Edit issue" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!valid} onClick={() => { store.updateIssue(issue.id, { title: title.trim(), description: description.trim(), dtcCodes: dtc.trim() ? dtc.split(',').map((d) => d.trim()).filter(Boolean) : undefined }, { name: user.name, role: user.role }); onClose() }}>Save changes</Button>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div><ULabel>Issue title *</ULabel><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. EV6 — HV battery rapid SOC drop under cold soak" style={{ ...inputStyle, height: 'var(--control-md)' }} /></div>
        <div><ULabel>Description *</ULabel><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Symptoms, reproduction steps, environmental conditions, frequency, and any safety implications…" /></div>
        <div><ULabel>DTC / trouble code <span style={{ color: 'var(--text-disabled)', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>· optional · comma-separated</span></ULabel><input value={dtc} onChange={(e) => setDtc(e.target.value)} placeholder="e.g. P0A0F, C1234, B1020" style={{ ...inputStyle, height: 'var(--control-md)' }} /></div>
      </div>
    </Modal>
  )
}

export function ManageLinksModal({ open, issue, onClose }: { open: boolean; issue: Issue; onClose: () => void }) {
  const store = useStore()
  const { user } = useRole()
  const actor = { name: user.name, role: user.role }
  const committed = useMemo(() => issue.linkedIssueIds ?? [], [issue.linkedIssueIds])
  // Prototype behavior: edits are a draft; everything applies together on Save.
  const [draft, setDraft] = useState<string[]>(committed)
  useEffect(() => { if (open) setDraft(committed) }, [open, committed])
  const dirty = draft.length !== committed.length || draft.some((d) => !committed.includes(d))
  const candidates = store.correlations(issue.id).filter((c) => !draft.includes(c.id))
  const save = () => {
    committed.filter((id) => !draft.includes(id)).forEach((id) => store.unlinkIssue(issue.id, id, actor))
    draft.filter((id) => !committed.includes(id)).forEach((id) => store.linkIssue(issue.id, id, actor))
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={
      <>
        Manage Related Issues
        <div style={{ marginTop: 3, font: 'var(--fw-regular) var(--fs-body-sm)/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>Review, unlink, and link Parent/Child issues. All changes apply together on Save.</div>
      </>
    } width={620} footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!dirty} iconLeft={<Icon icon={Check} size={15} />} onClick={save}>Save changes</Button>
      </>
    }>
      <ULabel>Current Related Issues</ULabel>
      {draft.length === 0 ? (
        <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>This issue has no related Parent/Child issues.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {draft.map((lid) => {
            const li = store.getIssue(lid)
            return (
              <div key={lid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-2) var(--space-3)', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{lid}</span>
                <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', font: 'var(--fw-regular) var(--fs-body-sm)/1.2 var(--font-body)' }}>{li?.title}</span>
                <Button variant="ghost" size="sm" style={{ color: 'var(--danger-500)', borderColor: '#E3B8B0' }} onClick={() => setDraft((d) => d.filter((x) => x !== lid))}>Unlink</Button>
              </div>
            )
          })}
        </div>
      )}
      <ULabel>Link Another Issue</ULabel>
      {candidates.length === 0 ? (
        <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>No classification-matched candidates.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {candidates.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-2) var(--space-3)', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{c.id}</span>
              <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', font: 'var(--fw-regular) var(--fs-body-sm)/1.2 var(--font-body)' }}>{c.title}</span>
              <StatusBadge status={c.status} size="sm" />
              <Button variant="secondary" size="sm" iconLeft={<Icon icon={Link2} size={14} />} onClick={() => setDraft((d) => [...d, c.id])}>Link</Button>
            </div>
          ))}
        </div>
      )}
      <p style={{ margin: 'var(--space-3) 0 0', font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
        Links notify both owners; unlink is a soft delete recorded in the audit trail.
      </p>
    </Modal>
  )
}

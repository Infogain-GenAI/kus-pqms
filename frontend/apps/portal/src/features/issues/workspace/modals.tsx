import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Check, ClipboardPlus, Link2 } from 'lucide-react'
import { Button, STATUS, STATUS_KEYS, Select, StatusBadge, Textarea, type StatusKey } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { Modal, ULabel } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import { LinkJustifyBox } from '../linking/LinkJustifyBox'
import { LinkJustifyApplied } from '../linking/LinkJustifyApplied'
import { NS as LINK_JUSTIFY_NS } from '../linking/LinkJustify.i18n'
import { usePendingJustifications } from '../linking/usePendingJustifications'
import type { DispositionOutcome, Issue } from '@/data/types'
import { inputStyle } from './shared'
import mlStyles from './manageLinks.module.css'
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
 * ─── ⚠️ THIS USED TO EDIT THE WRONG RELATIONSHIP ────────────────────────────
 *
 * The app carries TWO relationship types, and the canonical does too:
 *   `linkedIssueIds` — symmetric, single-action, edited in `ExistingIssueModal`;
 *   `groupId`        — hierarchical Parent/Child, draft/commit, edited HERE.
 *
 * This modal edited the FIRST while its own copy described the second — the
 * subtitle already read "Review, unlink, and link Parent/Child issues" and the
 * empty state "This issue has no related Parent/Child issues". The labels were
 * right and the behaviour was wrong, which is why nobody spotted it by reading
 * the screen.
 *
 * ⚠️ AND ITS OLD BEHAVIOUR WAS A FALLBACK NOBODY KNEW THEY HAD: until
 * `ExistingIssueModal` was wired into the workspace, this was the ONLY place a
 * symmetric link could be edited there. That is why the wiring had to land first.
 *
 * ─── NO CANDIDATE LIST, BY DESIGN ───────────────────────────────────────────
 *
 * It used to suggest `store.correlations()` matches. The canonical offers only an
 * Issue-ID box: joining a Parent/Child group on the strength of a classification
 * overlap is a weaker basis than a person naming the id, and the group is a
 * hierarchy rather than a similarity cluster.
 *
 * ─── EVERY PENDING CHANGE CARRIES ITS OWN JUSTIFICATION ─────────────────────
 *
 * Per change, not per Save — the design keys its pending map by member id with a
 * separate reason on each, and `saveSameModal` says each change gets its own
 * audit entry. Save is refused until every pending change is applied.
 * `planGroupEdits` owns the cascades (dissolve, parent promotion, chaining).
 */
export function ManageLinksModal({ open, issue, onClose }: { open: boolean; issue: Issue; onClose: () => void }) {
  const { t } = useTranslation(NS)
  const { t: tj } = useTranslation(LINK_JUSTIFY_NS)
  const store = useStore()
  const { user } = useRole()
  const actor = { name: user.name, role: user.role }

  /** The group as it stands, parent first, excluding the issue being managed. */
  const members = useMemo(
    () => store.groupMembers(issue.id).filter((m) => m.id !== issue.id),
    [store, issue.id],
  )
  const parentId = store.groupMembers(issue.id)[0]?.id

  const [removals, setRemovals] = useState<string[]>([])
  const [additions, setAdditions] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [queryErr, setQueryErr] = useState('')

  useEffect(() => {
    if (open) {
      setRemovals([])
      setAdditions([])
      setQuery('')
      setQueryErr('')
    }
  }, [open])

  const changedIds = [...removals, ...additions]
  const justify = usePendingJustifications(changedIds)
  useEffect(() => { if (open) justify.reset() }, [open])

  /** The canonical's own validation, in its own order and wording. */
  const addById = () => {
    const raw = query.trim()
    if (!raw) return setQueryErr(t('linksModalErrEmpty'))
    const id = raw.toUpperCase()
    const found = store.issues.find((i) => i.id.toUpperCase() === id)
    if (!found) {
      // A well-formed id that does not exist reads differently from a typo, and
      // the design says so differently.
      return setQueryErr(
        /^[a-z]{1,4}-?\d{3,}$/i.test(raw) ? t('linksModalErrNotFound', { id: raw }) : t('linksModalErrInvalid'),
      )
    }
    if (found.id === issue.id) return setQueryErr(t('linksModalErrSelf'))
    if (members.some((m) => m.id === found.id)) return setQueryErr(t('linksModalErrAlready', { id: found.id }))
    if (additions.includes(found.id)) return setQueryErr(t('linksModalErrPending', { id: found.id }))
    setAdditions((a) => [...a, found.id])
    setQuery('')
    setQueryErr('')
  }

  const save = () => {
    store.saveGroupEdits(
      {
        activeId: issue.id,
        removals: removals.map((id) => ({ id, justification: justify.reasonFor(id) })),
        additions: additions.map((id) => ({ id, justification: justify.reasonFor(id) })),
      },
      actor,
    )
    onClose()
  }

  const justifyRow = (id: string, kind: 'link' | 'unlink') => {
    const row = justify.reasons[id]
    if (!row) return null
    if (row.applied) return <LinkJustifyApplied kind={kind} text={row.text} onEdit={() => justify.edit(id)} />
    return (
      <LinkJustifyBox
        text={row.text}
        error={row.err}
        onText={(next) => justify.setText(id, next)}
        onApply={() => justify.apply(id)}
        onCancel={() => justify.setText(id, '')}
        label={`${kind === 'unlink' ? 'Justification for unlinking' : 'Justification for linking'} ${id}`}
        inputLabel={`Justification for ${kind === 'unlink' ? 'unlinking' : 'linking'} ${id}`}
      />
    )
  }

  const rowShell = (danger: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 'var(--space-2) var(--space-3)',
    border: `var(--border-width) solid ${danger ? 'var(--danger-500)' : 'var(--border-subtle)'}`,
    borderRadius: 'var(--radius-md)',
    background: danger ? 'var(--danger-50)' : undefined,
  })

  return (
    <Modal open={open} onClose={onClose} title={
      <>
        {t('linksModalTitle')}
        <div style={{ marginTop: 3, font: 'var(--fw-regular) var(--fs-body-sm)/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>{t('linksModalSubtitle')}</div>
      </>
    } width={620} footer={
      <>
        {/* Not merely "dirty": a pending change with no accepted reason must not
            be saveable, or the gate is decorative. */}
        {changedIds.length > 0 && !justify.allApplied && (
          <span style={{ marginRight: 'auto', font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
            {tj('saveBlocked')}
          </span>
        )}
        <Button variant="ghost" onClick={onClose}>{t('linksModalCancel')}</Button>
        <Button disabled={changedIds.length === 0 || !justify.allApplied} iconLeft={<Icon icon={Check} size={15} />} onClick={save}>{t('linksModalSave')}</Button>
      </>
    }>
      <ULabel>{t('linksModalCurrentHeading')}</ULabel>
      {members.length === 0 && additions.length === 0 ? (
        <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>{t('linksModalEmpty')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {members.map((m) => {
            const pending = removals.includes(m.id)
            return (
              <div key={m.id}>
                <div style={rowShell(pending)}>
                  <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)', textDecoration: pending ? 'line-through' : undefined }}>{m.id}</span>
                  <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', font: 'var(--fw-regular) var(--fs-body-sm)/1.2 var(--font-body)' }}>{m.title}</span>
                  {/* Role is DERIVED from registration order, never stored. */}
                  <span className={`${mlStyles.pendingBadge} ${m.id === parentId ? mlStyles.pendingLink : ''}`}>
                    {m.id === parentId ? t('linksModalParent') : t('linksModalChild')}
                  </span>
                  {pending && <span className={`${mlStyles.pendingBadge} ${mlStyles.pendingUnlink}`}>{t('linksModalPendingUnlink')}</span>}
                  {pending ? (
                    <Button variant="ghost" size="sm" onClick={() => setRemovals((r) => r.filter((x) => x !== m.id))}>{t('linksModalUndo')}</Button>
                  ) : (
                    <Button variant="ghost" size="sm" style={{ color: 'var(--danger-500)', borderColor: '#E3B8B0' }} onClick={() => setRemovals((r) => [...r, m.id])}>{t('linksModalUnlink')}</Button>
                  )}
                </div>
                {pending && justifyRow(m.id, 'unlink')}
              </div>
            )
          })}

          {additions.map((id) => {
            const added = store.getIssue(id)
            return (
              <div key={id}>
                <div style={rowShell(false)}>
                  <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{id}</span>
                  <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', font: 'var(--fw-regular) var(--fs-body-sm)/1.2 var(--font-body)' }}>{added?.title}</span>
                  <span className={`${mlStyles.pendingBadge} ${mlStyles.pendingLink}`}>{t('linksModalPendingLink')}</span>
                  <Button variant="ghost" size="sm" onClick={() => setAdditions((a) => a.filter((x) => x !== id))}>{t('linksModalUndo')}</Button>
                </div>
                {justifyRow(id, 'link')}
              </div>
            )
          })}
        </div>
      )}

      <ULabel>{t('linksModalCandidatesHeading')}</ULabel>
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
        <input
          aria-label={t('linksModalSearchLabel')}
          value={query}
          placeholder={t('linksModalSearchPlaceholder')}
          onChange={(e) => { setQuery(e.target.value); setQueryErr('') }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addById() } }}
          style={{ ...inputStyle, flex: 1 }}
        />
        <Button variant="secondary" iconLeft={<Icon icon={Link2} size={14} />} onClick={addById}>{t('linksModalLink')}</Button>
      </div>
      {queryErr && (
        <p role="alert" style={{ margin: 'var(--space-2) 0 0', font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: 'var(--danger-500)' }}>{queryErr}</p>
      )}

      <p style={{ margin: 'var(--space-3) 0 0', font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
        {t('linksModalFootnote')}
      </p>
    </Modal>
  )
}

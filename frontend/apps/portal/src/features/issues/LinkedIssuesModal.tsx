import { useEffect, useMemo, useState } from 'react'
import { Link2, X } from 'lucide-react'
import { Button, Checkbox, StatusBadge } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { IconChip, Modal, TagChip } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import { useTranslation } from 'react-i18next'
import { LinkJustifyBox } from './linking/LinkJustifyBox'
import { LinkJustifyApplied } from './linking/LinkJustifyApplied'
import { NS as LINK_JUSTIFY_NS } from './linking/LinkJustify.i18n'
import { usePendingJustifications } from './linking/usePendingJustifications'
import { linkChangeSet } from './linking/changeSet'
import type { Issue } from '@/data/types'

/** Fields whose match on another issue counts as a correlation signal, in display order.
 * `symptom` stands in for title similarity — in this dataset, issues that share a symptom
 * are worded near-identically (e.g. "Engine vibration during idle" / "... after warm-up"). */
const MATCH_FIELDS: { key: keyof Pick<Issue, 'system' | 'subSystem' | 'component' | 'modelCode' | 'symptom'>; label: string }[] = [
  { key: 'system', label: 'Same system' },
  { key: 'subSystem', label: 'Same sub-system' },
  { key: 'component', label: 'Same component' },
  { key: 'modelCode', label: 'Same model code' },
  { key: 'symptom', label: 'Similar issue title' },
]

/**
 * "Same existing issues" — opened from the Issue List's Linked column. Detects issues
 * correlated with `issueId` by shared system/sub-system/component/model code/symptom, lets
 * the user check/uncheck which to link, and also accepts a live issue-ID search. Everything
 * applies together on Save, matching the review-then-commit pattern used by the Issue
 * Workspace's own link management (ManageLinksModal) — this is a separate component because
 * the two screens' link-review needs diverged enough (a unified checkbox list with
 * match-reason tags here vs. two split sections there) that sharing one would mean branching
 * it apart.
 */
export function LinkedIssuesModal({ open, issueId, onClose }: { open: boolean; issueId: string; onClose: () => void }) {
  const store = useStore()
  const { t: tj } = useTranslation(LINK_JUSTIFY_NS)
  const { user } = useRole()
  const issue = store.getIssue(issueId)
  const committed = useMemo(() => issue?.linkedIssueIds ?? [], [issue?.linkedIssueIds])
  const [draft, setDraft] = useState<string[]>(committed)
  const [filterQuery, setFilterQuery] = useState('')

  useEffect(() => {
    if (open) { setDraft(committed); setFilterQuery('') }
  }, [open, committed])

  const candidates = useMemo(() => {
    if (!issue) return []
    return store.issues
      .filter((i) => i.id !== issueId)
      .map((i) => ({
        issue: i,
        reasons: MATCH_FIELDS.filter((m) => issue[m.key] && i[m.key] === issue[m.key]).map((m) => m.label),
      }))
      .filter((c) => c.reasons.length > 0 || committed.includes(c.issue.id))
  }, [store.issues, issue, issueId, committed])

  const { additions, removals, changedIds, mustRenderIds } = linkChangeSet(committed, draft)

  /*
   * ⚠️ `changedIds` IS PART OF THIS PREDICATE, AND LEAVING IT OUT WAS A DEFECT.
   *
   * A row is shown when it is currently linked, when it matches on a
   * classification field, OR WHEN IT IS A PENDING CHANGE. That third clause was
   * missing, and the gap was reachable: a committed link with no match-field
   * overlap — entirely normal for something linked by hand — dropped out of
   * `visible` the moment it was unchecked, because `draft` no longer held it and
   * it had no match reasons.
   *
   * It was not a bypass; the gate held and Save stayed disabled. It was worse in
   * a different way: the row took its checkbox AND its justification box with
   * it, so the change could neither be completed nor withdrawn, and since
   * `allApplied` is all-or-nothing it blocked every other pending change in the
   * session. The only exit was closing the modal, which discarded the work.
   *
   * Manage Links already kept pending rows visible; this surface did not,
   * because the two computed their change sets separately. They now share
   * `linkChangeSet`, which is where that contract is written down.
   */
  const visible = candidates
    .filter((c) => mustRenderIds.includes(c.issue.id) || c.reasons.length > 0)
    .filter((c) => c.issue.id.toUpperCase().includes(filterQuery.trim().toUpperCase()))
  const selectedToLink = additions.length

  const toggle = (id: string) => setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))

  /*
   * Same governance rule and same three-state lifecycle as the workspace's
   * Manage Links, because it is the same mutation — a toggled checkbox IS a
   * pending change. Two different justification interactions for one rule would
   * have to be explained to every reviewer and user forever.
   *
   * WITHDRAWING A CHANGE (untoggling) DISCARDS ITS JUSTIFICATION — see
   * `usePendingJustifications`, which owns that decision and the reasoning. The
   * prototype's list is not a checkbox list, so it never had to answer this.
   */
  const justify = usePendingJustifications(changedIds)
  useEffect(() => { if (open) justify.reset() }, [open])

  const save = () => {
    if (!issue) return
    const actor = { name: user.name, role: user.role }
    // Unreachable until every pending change is applied — see the Save button.
    removals.forEach((id) => store.unlinkIssue(issueId, id, justify.reasonFor(id), actor))
    additions.forEach((id) => store.linkIssue(issueId, id, justify.reasonFor(id), actor))
    onClose()
  }

  const justifyRow = (id: string) => {
    const row = justify.reasons[id]
    if (!row) return null
    const kind = removals.includes(id) ? 'unlink' : 'link'
    if (row.applied) {
      return <LinkJustifyApplied kind={kind} text={row.text} onEdit={() => justify.edit(id)} />
    }
    return (
      <LinkJustifyBox
        text={row.text}
        error={row.err}
        onText={(next) => justify.setText(id, next)}
        onApply={() => justify.apply(id)}
        onCancel={() => justify.setText(id, '')}
        label={`Justification for ${kind === 'unlink' ? 'unlinking' : 'linking'} ${id}`}
        inputLabel={`Justification for ${kind === 'unlink' ? 'unlinking' : 'linking'} ${id}`}
      />
    )
  }

  if (!open || !issue) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={720}
      align="center"
      title={
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <IconChip icon={Link2} tint="var(--success-50)" color="var(--success-600)" size={40} iconSize={18} />
            <div>
              <div style={{ font: 'var(--fw-bold) var(--fs-h4)/1.25 var(--font-body)', color: 'var(--text-primary)' }}>Same existing issues</div>
              <div style={{ marginTop: 4, font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
                Review correlated issues and link or unlink them from this issue. Changes apply on save.
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
          {changedIds.length > 0 && !justify.allApplied && (
            <span style={{ marginRight: 'auto', font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
              {tj('saveBlocked')}
            </span>
          )}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={changedIds.length === 0 || !justify.allApplied} onClick={save}>Save changes</Button>
        </>
      }
    >
      <div style={{ borderTop: 'var(--border-width) solid var(--border-subtle)', margin: '0 0 var(--space-4)' }} />

      <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>
        {candidates.length} correlated issue{candidates.length === 1 ? '' : 's'} detected · {selectedToLink} selected to link
      </p>

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-secondary)' }}>
          Search by issue ID
        </label>
        <input
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="e.g. CL-260045"
          style={{ width: '100%', height: 'var(--control-md)', padding: '0 var(--space-3)', border: 'var(--border-width) solid var(--border-default)', borderRadius: 'var(--radius-md)', font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-primary)', background: 'var(--surface-card)' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {visible.length === 0 ? (
          <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
            {filterQuery.trim() ? `No correlated issue matches “${filterQuery.trim()}”.` : 'No correlated issues detected.'}
          </p>
        ) : (
          visible.map(({ issue: c, reasons }) => {
            const linked = draft.includes(c.id)
            return (
              <div key={c.id} style={{ padding: 'var(--space-3)', border: 'var(--border-width) solid ' + (changedIds.includes(c.id) ? 'var(--accent-300)' : 'var(--border-subtle)'), borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <span style={{ marginTop: 2 }}>
                  <Checkbox checked={linked} onChange={() => toggle(c.id)} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{c.id}</span>
                    {linked ? (
                      <TagChip tint="var(--success-50)" color="var(--success-600)">Linked</TagChip>
                    ) : (
                      reasons.map((r) => <TagChip key={r} tint="var(--accent-50)" color="var(--accent-700)">{r}</TagChip>)
                    )}
                  </div>
                  <div style={{ font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{c.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-muted)' }}>
                      {[c.model, c.system, c.component].filter(Boolean).join(' · ')}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  {reasons.length > 0 && (
                    <div style={{ marginTop: 4, font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: 'var(--text-disabled)' }}>
                      Suggested because: {reasons.join(' · ')}
                    </div>
                  )}
                </div>
              </div>
              {justifyRow(c.id)}
              </div>
            )
          })
        )}
      </div>
    </Modal>
  )
}

import { useEffect, type ReactNode } from 'react'
import { ExternalLink, Link as LinkIcon } from 'lucide-react'
import { Button, Icon, StatusBadge } from '@pqms/ui-library'
import { useStore } from '@/data/store'
import { fmtDate } from '@/data/util'
import type { Issue } from '@/data/types'
import styles from './ExistingIssueModal.module.css'

/**
 * The existing-issue popup — inspect an issue before deciding to link it.
 *
 * ⚠️ ONE COMPONENT FOR TWO SCREENS, DELIBERATELY. The design exposes this as
 * `existingModal` on Issue Entry and `wsExistingModal` on the Issue Workspace,
 * and they are the same modal: 21 of their 23 bound fields are identical. Issue
 * Entry has only `onUnlink`; the workspace adds fourteen `unlinkJustify.*`
 * fields — an inline justification flow before an unlink commits. That is the
 * `unlinkSlot` below.
 *
 * ⚠️ UNLINK IS GATED ON THE WORKSPACE AND UNGATED ON ISSUE ENTRY, and the
 * asymmetry has a reason rather than being an inconsistency: on Issue Entry the
 * issue does not exist yet, so an unlink discards a draft decision with nothing
 * to audit. In the workspace it undoes a recorded relationship between two live
 * issues. An earlier note of ours read this as "unlink is never gated" and
 * treated it as a design principle — that generalised from one screen.
 *
 * ⚠️ "Related history" IS INLINE AND ALWAYS SHOWN. It is not an accordion. The
 * toggling history accordion in the design belongs to communications rows, a
 * different feature, and the two are easy to conflate from a description.
 */
export function ExistingIssueModal({
  issue,
  linked,
  onClose,
  onLink,
  onUnlink,
  onOpenIssue,
  unlinkSlot,
}: {
  /** Null closes the modal — the caller holds "which issue", not a boolean. */
  issue: Issue | null
  linked: boolean
  onClose: () => void
  onLink: () => void
  /** Ignored when `unlinkSlot` is supplied; that slot owns the flow instead. */
  onUnlink: () => void
  onOpenIssue: (id: string) => void
  /**
   * The workspace's justification flow, rendered in place of the plain Unlink
   * button. Absent on Issue Entry, where unlink is immediate.
   */
  unlinkSlot?: ReactNode
}) {
  const store = useStore()

  useEffect(() => {
    if (!issue) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [issue, onClose])

  if (!issue) return null

  const classification = [issue.system, issue.subSystem, issue.component, issue.symptom]
    .map((p) => p || '—')
    .join(' · ')
  const activities = store.activitiesFor(issue.id)
  const history = store.auditFor(issue.id)

  return (
    <div className={styles.scrim} onClick={onClose} role="presentation">
      {/* The panel swallows the click so only the scrim closes. */}
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label={`Issue ${issue.id}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <div className={styles.headTop}>
            <div className={styles.ident}>
              <span className={styles.id}>{issue.id}</span>
              <StatusBadge status={issue.status} size="sm" />
              {linked && (
                <span className={styles.linkedPill}>
                  <Icon icon={LinkIcon} size={12} />
                  Linked
                </span>
              )}
            </div>
            <button type="button" className={styles.viewIssue} onClick={() => onOpenIssue(issue.id)}>
              <Icon icon={ExternalLink} size={14} />
              View Issue
            </button>
          </div>
          <div className={styles.title}>{issue.title}</div>
          <div className={styles.meta}>
            {issue.model} · MY{issue.modelYear} · Registered {fmtDate(issue.createdAt)}
          </div>
        </div>

        <div className={styles.body}>
          <div>
            <div className={styles.sectionLabel}>Classification</div>
            <p className={styles.sectionText}>{classification}</p>
          </div>

          <div>
            <div className={styles.sectionLabel}>Issue description</div>
            <p className={styles.sectionText}>{issue.description || '—'}</p>
          </div>

          <div>
            <div className={styles.sectionLabel}>Investigation summary</div>
            {activities.length > 0 ? (
              <p className={styles.sectionText}>{activities[0].summary}</p>
            ) : (
              <p className={styles.empty}>No investigation activity recorded yet.</p>
            )}
          </div>

          <div>
            <div className={styles.sectionLabel}>Actions taken</div>
            {activities.length > 0 ? (
              <p className={styles.sectionText}>
                {activities.map((a) => a.type).join(' · ')}
              </p>
            ) : (
              <p className={styles.empty}>No actions recorded yet.</p>
            )}
          </div>

          {/*
            NO QIR SECTION. The design shows a "QIR summary" block behind
            `hasQir`, with its own View QIR affordance. We have no QIR model at
            all — omitted rather than stubbed, so nobody mistakes an empty block
            for "this issue has no QIR".
          */}

          <div>
            <div className={styles.sectionLabel}>Related history</div>
            {history.length > 0 ? (
              history.map((h) => (
                <div key={h.id} className={styles.historyRow}>
                  <span className={styles.historyWhen}>{fmtDate(h.timestamp)}</span>
                  <span className={styles.historyWhat}>
                    {h.action}
                    {h.detail ? ` — ${h.detail}` : ''}
                  </span>
                </div>
              ))
            ) : (
              <p className={styles.empty}>No history recorded for this issue yet.</p>
            )}
          </div>
        </div>

        <div className={styles.foot}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          {linked
            ? (unlinkSlot ?? <Button variant="secondary" onClick={onUnlink}>Unlink issue</Button>)
            : <Button onClick={onLink}>Link issue</Button>}
        </div>
      </div>
    </div>
  )
}

import { Button } from '@pqms/ui-library'
import { changeRequestFieldLabel } from '@/data/investigation'
import type { ActivityChangeRequest } from '@/data/types'
import { fmtHM, fmtMDY } from '@/data/util'
import styles from './ChangeRequestPanel.module.css'

const STATUS_LABEL: Record<ActivityChangeRequest['status'], string> = {
  // "Pending Review", not "Pending" — it names what is waiting to happen rather
  // than only that something is.
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
}

/**
 * The change requests raised against one activity.
 *
 * Ported from `FindingChangeRequestPanel.vue`.
 *
 * THE APPROVE GATE IS A CAPABILITY, NEVER A ROLE COMPARE — Tier 0's RBAC rule.
 * A non-approver still SEES the request, because a pending correction is
 * material to anyone reading the record; they are told who decides it instead of
 * being shown two dead buttons.
 *
 * The request's `reason` is deliberately not rendered here. It is captured, and
 * it reaches the audit trail, but the card shows the change — what the value is
 * now and what it would become. The reason belongs to the decision, not to the
 * summary of it.
 */
export function ChangeRequestPanel({
  requests,
  activityType,
  canApprove,
  canEdit,
  onApprove,
  onReject,
}: {
  requests: ActivityChangeRequest[]
  activityType: string
  canApprove: boolean
  canEdit: boolean
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  if (requests.length === 0) return null

  return (
    <section className={styles.panel} data-testid="change-request-panel">
      {requests.map((r) => (
        <article key={r.id} className={styles.card} data-testid={`change-request-${r.id}`}>
          <header className={styles.header}>
            <span className={styles.kind}>Change Request</span>
            <span className={styles.sep} aria-hidden>│</span>
            <span data-testid={`change-request-field-${r.id}`}>
              Update Requested for {changeRequestFieldLabel(r.field, activityType)}
            </span>
            <span className={styles.sep} aria-hidden>│</span>
            <span className={styles.stamp}>{fmtMDY(r.requestedAt)} {fmtHM(r.requestedAt)}</span>
            <span className={styles.spacer} />
            <span className={styles.status} data-status={r.status} data-testid={`change-request-status-${r.id}`}>
              {STATUS_LABEL[r.status]}
            </span>
          </header>

          <dl className={styles.values}>
            <div>
              <dt>Current value</dt>
              <dd data-testid={`change-request-current-${r.id}`}>{r.currentValue || '—'}</dd>
            </div>
            <div>
              <dt>Proposed value</dt>
              <dd className={styles.proposed} data-testid={`change-request-proposed-${r.id}`}>{r.proposedValue}</dd>
            </div>
          </dl>

          {r.status !== 'pending' && (
            <p className={styles.decision} data-testid={`change-request-decision-${r.id}`}>
              {r.status === 'approved' ? 'Approved by' : 'Rejected by'} {r.decidedBy} on{' '}
              {r.decidedOn ? `${fmtMDY(r.decidedOn)} ${fmtHM(r.decidedOn)}` : '—'}
            </p>
          )}

          {r.adminComment && <p className={styles.comment}>Admin comment: {r.adminComment}</p>}

          {r.status === 'pending' &&
            (canApprove ? (
              <div className={styles.actions}>
                <Button size="sm" disabled={!canEdit} data-testid={`approve-change-request-${r.id}`} onClick={() => onApprove(r.id)}>
                  Approve
                </Button>
                <Button variant="secondary" size="sm" disabled={!canEdit} data-testid={`reject-change-request-${r.id}`} onClick={() => onReject(r.id)}>
                  Reject
                </Button>
              </div>
            ) : (
              <p className={styles.notApprover}>Only an approver can decide this request.</p>
            ))}
        </article>
      ))}
    </section>
  )
}

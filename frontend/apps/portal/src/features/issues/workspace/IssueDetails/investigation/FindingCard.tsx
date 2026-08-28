import { ChevronDown, ChevronUp, GitCompareArrows, Paperclip } from 'lucide-react'
import { Icon } from '@pqms/ui-library'
import { activityTypeForm, type ActivityFieldKey } from '@/data/investigation'
import type { ActivityChangeRequest, InvestigationActivity } from '@/data/types'
import { fmtHM, fmtMDY } from '@/data/util'
import { ChangeRequestPanel } from './ChangeRequestPanel'
import { ActivityTypeBadge } from './primitives'
import styles from './FindingCard.module.css'

/**
 * One recorded activity in the timeline. Ported from `FindingCard.vue`.
 *
 * ─── WHAT THIS ADDS over the flat row it replaces ────────────────────────────
 *
 * The previous timeline row showed type, summary, author and date, and nothing
 * else — so an activity's evaluation type, cited parts, VINs, dealer code and
 * team members were captured by no form and displayed nowhere. This row is
 * COLLAPSIBLE and its expanded body is the full inventory.
 *
 * THE COLLAPSED ROW IS ALWAYS RENDERED, at every expansion state, so expanding
 * one row never changes the position of the others.
 *
 * WHICH FACTS APPEAR is the activity type's own field set, PLUS any field
 * outside that set which actually holds a value. The second half is a rule
 * rather than padding: an activity carrying a dealer code should show it even if
 * its type does not normally ask for one — the value was recorded, and omitting
 * it would misrepresent the record.
 *
 * `Request update` IS LIVE. A recorded activity is evidence and is never edited
 * in place — a correction is proposed against it, reviewed, and applied only by
 * an approval. So this button opens the request modal, and any resulting
 * requests render at the top of this card's expanded body until they are
 * decided. See `store.requestActivityChange` for why the approval, not the
 * request, is what mutates the activity.
 */
export function FindingCard({
  activity,
  expanded,
  onToggle,
  changeRequests,
  canEdit,
  canApprove,
  onRequestUpdate,
  onApprove,
  onReject,
}: {
  activity: InvestigationActivity
  expanded: boolean
  onToggle: (id: string) => void
  changeRequests: ActivityChangeRequest[]
  canEdit: boolean
  canApprove: boolean
  onRequestUpdate: (activity: InvestigationActivity) => void
  onApprove: (requestId: string) => void
  onReject: (requestId: string) => void
}) {
  const form = activityTypeForm(activity.type)

  const valueFor = (key: ActivityFieldKey): string | undefined => {
    switch (key) {
      case 'evaluationType': return activity.evaluationType
      case 'parts': return activity.parts?.length ? activity.parts.join(', ') : undefined
      case 'vins': return activity.vins?.length ? activity.vins.join(', ') : undefined
      case 'dealerCode': return activity.dealerCode
      case 'members': return activity.members?.length ? activity.members.join(', ') : undefined
    }
  }

  const LABELS: Record<ActivityFieldKey, string> = {
    evaluationType: 'Evaluation type',
    parts: 'Parts',
    vins: 'VIN(s)',
    dealerCode: 'Dealer code',
    members: 'Team members involved',
  }

  const ALL_KEYS: ActivityFieldKey[] = ['evaluationType', 'parts', 'vins', 'dealerCode', 'members']
  // The type's own fields first, in its order; then anything else that has a value.
  const keys = [...form.fields, ...ALL_KEYS.filter((k) => !form.fields.includes(k))]
  const facts = keys
    .map((key) => ({ key, label: LABELS[key], value: valueFor(key) }))
    .filter((f): f is { key: ActivityFieldKey; label: string; value: string } => !!f.value)

  const attachmentCount = activity.attachments?.length ?? 0

  return (
    <article className={styles.card} data-testid={`finding-${activity.id}`}>
      <header className={styles.row}>
        <ActivityTypeBadge type={activity.type} />
        <span className={styles.creator}>{activity.author}</span>
        <span className={styles.sep} aria-hidden>·</span>
        <span className={styles.date}>{fmtMDY(activity.createdAt)} {fmtHM(activity.createdAt)}</span>

        <span className={styles.spacer} />

        <button
          type="button"
          className={styles.request}
          disabled={!canEdit}
          data-testid={`request-update-${activity.id}`}
          onClick={() => onRequestUpdate(activity)}
        >
          <Icon icon={GitCompareArrows} size={16} />
          Request update
        </button>

        {attachmentCount > 0 && (
          <span className={styles.chip} data-testid={`finding-attachments-${activity.id}`}>
            <Icon icon={Paperclip} size={13} />
            {attachmentCount}
          </span>
        )}

        <button
          type="button"
          className={styles.chevron}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse activity' : 'Expand activity'}
          data-testid={`finding-toggle-${activity.id}`}
          onClick={() => onToggle(activity.id)}
        >
          <Icon icon={expanded ? ChevronUp : ChevronDown} size={16} />
        </button>
      </header>

      {expanded && (
        <div className={styles.body} data-testid={`finding-body-${activity.id}`}>
          {/* ABOVE the facts, not below: a pending correction changes how every
              value beneath it should be read, so it has to be seen first. */}
          <ChangeRequestPanel
            requests={changeRequests}
            activityType={activity.type}
            canApprove={canApprove}
            canEdit={canEdit}
            onApprove={onApprove}
            onReject={onReject}
          />

          {facts.length > 0 && (
            <dl className={styles.facts}>
              {facts.map((f) => (
                <div key={f.key} data-testid={`finding-fact-${f.key}`}>
                  <dt>{f.label}</dt>
                  <dd className={f.key === 'parts' || f.key === 'vins' ? styles.mono : undefined}>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div>
            {/* Type-aware here too: Evaluation details vs Investigation details. */}
            <h5 className={styles.detailsLabel}>{form.detailsLabel}</h5>
            <p className={styles.detailsText}>{activity.summary}</p>
          </div>

          {activity.measurements?.length ? (
            <dl className={styles.facts}>
              {activity.measurements.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {attachmentCount > 0 && (
            <div>
              <h5 className={styles.detailsLabel}>Attachments</h5>
              <div className={styles.evidence}>
                {activity.attachments?.map((name) => (
                  <span key={name} className={styles.evidenceItem}>
                    <Icon icon={Paperclip} size={13} />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

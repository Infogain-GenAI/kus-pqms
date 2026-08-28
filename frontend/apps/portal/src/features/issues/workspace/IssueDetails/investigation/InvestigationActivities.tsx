import { useState } from 'react'
import { Microscope } from 'lucide-react'
import { IconChip } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import type { ActivityChangeRequest, ChangeRequestField, InvestigationActivity } from '@/data/types'
import { AddActivityForm } from './AddActivityForm'
import { RejectRequestModal, RequestUpdateModal } from './ChangeRequestModals'
import { FindingCard } from './FindingCard'
import { PanelHeading } from './primitives'
import emptyStyles from './emptyState.module.css'
import styles from './investigation.module.css'

/**
 * The Activities workstream: the Add-activity rail and the activity timeline.
 *
 * Ported from `InvestigationActivities.vue`.
 *
 * EXPANSION STATE IS NOT OWNED HERE. It belongs to the tab, because the header's
 * Expand/Collapse-all toggle and these rows read the same set — the toggle's own
 * label is derived from it. A set owned here could be written by the header but
 * never read back by it.
 *
 * THE CHANGE-REQUEST MODALS ARE OWNED HERE, not per row. Two reasons: only one
 * can be open at a time regardless of which row raised it, and a modal mounted
 * inside a collapsible row would unmount the moment the row collapsed behind it.
 *
 * Newest first: an investigation is read from what just happened backwards.
 */
export function InvestigationActivities({
  issueId,
  canEdit,
  expanded,
  onToggle,
}: {
  issueId: string
  canEdit: boolean
  expanded: Set<string>
  onToggle: (id: string) => void
}) {
  const store = useStore()
  const { user, can } = useRole()
  const actor = { name: user.name, role: user.role }
  const activities = [...store.activitiesFor(issueId)].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  /** Deciding a correction is an approval, so it rides the same capability. */
  const canApprove = can('approve')

  const [requestFor, setRequestFor] = useState<InvestigationActivity | null>(null)
  const [rejecting, setRejecting] = useState<ActivityChangeRequest | null>(null)

  /** Fields already awaiting a decision on this activity — one request per field. */
  const pendingFields = (activityId: string): ChangeRequestField[] =>
    store.changeRequestsFor(activityId).filter((r) => r.status === 'pending').map((r) => r.field)

  return (
    <div className={styles.split}>
      <div className={styles.rail}>
        <AddActivityForm
          issueId={issueId}
          disabled={!canEdit}
          onSave={(draft) =>
            store.addActivity(issueId, draft.type, draft.details, actor, {
              evaluationType: draft.evaluationType,
              parts: draft.parts,
              vins: draft.vins,
              dealerCode: draft.dealerCode,
              members: draft.members,
              attachments: draft.attachments,
            })
          }
        />
      </div>

      <div className={styles.column}>
        <PanelHeading>Activity timeline</PanelHeading>
        {activities.length === 0 ? (
          <div className={emptyStyles.empty}>
            <IconChip icon={Microscope} tint="var(--neutral-50)" color="var(--neutral-400)" size={48} />
            <div className={emptyStyles.title}>No investigation activities have been recorded yet</div>
            <div className={emptyStyles.body}>
              Record inspection results, analysis, observations and supporting evidence throughout the
              investigation.
            </div>
          </div>
        ) : (
          <div className={emptyStyles.list}>
            {activities.map((a) => (
              <FindingCard
                key={a.id}
                activity={a}
                expanded={expanded.has(a.id)}
                onToggle={onToggle}
                changeRequests={store.changeRequestsFor(a.id)}
                canEdit={canEdit}
                canApprove={canApprove}
                onRequestUpdate={setRequestFor}
                onApprove={(id) => store.approveActivityChange(id, actor)}
                onReject={(id) => {
                  const req = store.changeRequestsFor(a.id).find((r) => r.id === id)
                  if (req) setRejecting(req)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {requestFor && (
        <RequestUpdateModal
          open
          activity={requestFor}
          pendingFields={pendingFields(requestFor.id)}
          onClose={() => setRequestFor(null)}
          onSubmit={(input) =>
            store.requestActivityChange({ activityId: requestFor.id, issueId, ...input }, actor)
          }
        />
      )}

      <RejectRequestModal
        open={!!rejecting}
        request={rejecting}
        onClose={() => setRejecting(null)}
        onReject={(id, comment) => store.rejectActivityChange(id, comment, actor)}
      />
    </div>
  )
}

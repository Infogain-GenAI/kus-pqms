import { useState } from 'react'
import { Package, PackageSearch } from 'lucide-react'
import { Badge, Button, Icon, Input, Select, Textarea } from '@pqms/ui-library'
import { IconChip } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import type { PartStatus, PartUrgency } from '@/data/types'
import { fmtMDY } from '@/data/util'
import { AttachmentsDropzone } from './AttachmentsDropzone'
import { FieldLabel, PanelHeading, ValidationBanner } from './primitives'
import emptyStyles from './emptyState.module.css'
import historyStyles from './PartRequestHistory.module.css'
import styles from './investigation.module.css'

/**
 * The Part Requests workstream: a Raise-part-request rail beside the request
 * history.
 *
 * Ported from `PartRequestsSection.vue` / `PartRequestForm.vue` /
 * `PartRequestHistory.vue`.
 *
 * ─── WHAT CHANGED FROM THE PREVIOUS PANEL ────────────────────────────────────
 *
 * It was a single card: a five-column inline form above a flat list of rows. It
 * is now the two-column rail-and-history split the rest of this tab uses, which
 * also means the form has room for the fields it was missing — a required part
 * DESCRIPTION, a REASON, and ATTACHMENTS. Description previously existed but was
 * optional and captioned "Auto-fills on lookup", promising a part-number lookup
 * that does not exist here and never did.
 *
 * ─── THE URGENCY VOCABULARY IS THIS APP'S, DELIBERATELY ──────────────────────
 *
 * Vue uses the backend's LOW / MEDIUM / HIGH enum. This app uses Routine /
 * Priority / Emergency, and `addPart` derives auto-approval from "Routine"
 * specifically — Routine approves on submit, the other two are submitted for
 * review. There is no backend here for LOW/MEDIUM/HIGH to be the wire format OF,
 * so adopting it would break a working rule to satisfy a constraint this app
 * does not have. The subtitle that explains that rule is kept too.
 */
/**
 * The status a request moves to next.
 *
 * The progression already existed in this app's `PartStatus` type and in the
 * store's `setPartStatus`, but NOTHING CALLED IT — so a request could be raised
 * and then sat at Submitted for ever, and the "Priority / Emergency need manager
 * approval" rule the panel states had no way to be carried out. This is the
 * missing half of that rule, not a new workflow: one step at a time, in the
 * order the type already declares, ending at Received.
 */
const NEXT_STATUS: Partial<Record<PartStatus, PartStatus>> = {
  Submitted: 'Approved',
  Approved: 'Ordered',
  Ordered: 'Received',
}

export function PartRequestsSection({ issueId, canEdit, lockNote }: {
  issueId: string
  canEdit: boolean
  /**
   * Why the form is disabled, when the caller knows. See AddActivityForm's
   * matching prop — this note had the same "told the wrong cause" defect.
   */
  lockNote?: string
}) {
  const store = useStore()
  const { user, can } = useRole()
  const canApprove = can('approve')
  const requests = [...store.partsFor(issueId)].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))

  const [partNumber, setPartNumber] = useState('')
  const [description, setDescription] = useState('')
  const [qty, setQty] = useState('1')
  const [urgency, setUrgency] = useState<PartUrgency>('Routine')
  const [reason, setReason] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [attempted, setAttempted] = useState(false)

  const missing = () => {
    const gaps: string[] = []
    if (!partNumber.trim()) gaps.push('partNumber')
    if (!description.trim()) gaps.push('description')
    return gaps
  }
  const gaps = attempted ? missing() : []

  const submit = () => {
    setAttempted(true)
    if (missing().length > 0) return
    store.addPart(
      issueId,
      {
        partNumber: partNumber.trim(),
        description: description.trim(),
        cost: 0,
        qty: Number(qty) || 1,
        urgency,
        reason: reason.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
      },
      { name: user.name, role: user.role },
    )
    setPartNumber(''); setDescription(''); setQty('1'); setUrgency('Routine')
    setReason(''); setAttachments([]); setAttempted(false)
  }

  return (
    <div className={styles.split}>
      <div className={styles.rail}>
        <PanelHeading>Raise part request</PanelHeading>
        <p className={styles.requestNew}>
          Priority / Emergency need manager approval; Routine auto-approves within 24 h.
        </p>

        {gaps.length > 0 && <ValidationBanner title="Cannot submit request" body="Complete the required fields." />}

        <div className={styles.field}>
          <FieldLabel text="Part number" required />
          <Input
            aria-label="Part number"
            value={partNumber}
            placeholder="e.g. 0K2A1-58-810"
            disabled={!canEdit}
            error={gaps.includes('partNumber') ? 'Enter a part number.' : undefined}
            onChange={(e) => setPartNumber(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <FieldLabel text="Part description" required />
          <Input
            aria-label="Part description"
            value={description}
            placeholder="e.g. Front brake pad set"
            disabled={!canEdit}
            error={gaps.includes('description') ? 'Enter a part description.' : undefined}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <FieldLabel text="Quantity" />
            <Input
              aria-label="Quantity"
              value={qty}
              disabled={!canEdit}
              onChange={(e) => setQty(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className={styles.field}>
            <FieldLabel text="Priority" />
            <Select
              aria-label="Priority"
              value={urgency}
              options={['Routine', 'Priority', 'Emergency']}
              disabled={!canEdit}
              onChange={(e) => setUrgency(e.target.value as PartUrgency)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <FieldLabel text="Reason / comments" />
          <Textarea
            rows={3}
            aria-label="Reason / comments"
            value={reason}
            placeholder="Why is this part needed for the investigation?"
            disabled={!canEdit}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <AttachmentsDropzone value={attachments} onChange={setAttachments} disabled={!canEdit} />

        <Button fullWidth disabled={!canEdit} iconLeft={<Icon icon={Package} size={14} />} onClick={submit}>
          Submit request
        </Button>

        {lockNote && <p className={styles.closedNote}>{lockNote}</p>}
      </div>

      <div className={styles.column}>
        <PanelHeading>Part request history</PanelHeading>
        {requests.length === 0 ? (
          <div className={emptyStyles.empty}>
            <IconChip icon={PackageSearch} tint="var(--neutral-50)" color="var(--neutral-400)" size={48} />
            <div className={emptyStyles.title}>No part requests raised yet</div>
            <div className={emptyStyles.body}>
              Use the form on the left to request parts. Each request appears here with its current status.
            </div>
          </div>
        ) : (
          <ul className={historyStyles.list}>
            {requests.map((r) => (
              <li key={r.id} className={historyStyles.row} data-testid={`part-request-${r.id}`}>
                <div className={historyStyles.top}>
                  <span className={historyStyles.partNumber}>{r.partNumber}</span>
                  <Badge tone={r.urgency === 'Emergency' ? 'danger' : r.urgency === 'Priority' ? 'warning' : 'neutral'} size="sm">
                    {r.urgency}
                  </Badge>
                  <Badge tone={r.status === 'Received' ? 'success' : r.status === 'Approved' || r.status === 'Ordered' ? 'accent' : 'neutral'} size="sm">
                    {r.status}
                  </Badge>
                  <span className={historyStyles.spacer} />
                  <span className={historyStyles.date}>{fmtMDY(r.requestedAt)}</span>
                </div>
                <p className={historyStyles.description}>{r.description}</p>
                <p className={historyStyles.meta}>Qty {r.qty} · Requested by {r.requestedBy}</p>
                {r.reason && <p className={historyStyles.reason}>{r.reason}</p>}

                {r.attachments?.length ? (
                  <p className={historyStyles.meta}>
                    {r.attachments.length} attachment{r.attachments.length > 1 ? 's' : ''} · {r.attachments.join(', ')}
                  </p>
                ) : null}

                {/* Advancing a request is an approval, so it rides the approve
                    capability — never a role compare (Tier 0's RBAC rule). A
                    Received request has nowhere left to go and shows no control
                    rather than a disabled one. */}
                {canApprove && NEXT_STATUS[r.status] && (
                  <div className={historyStyles.advance}>
                    <Button
                      variant="secondary"
                      size="sm"
                      data-testid={`advance-part-${r.id}`}
                      onClick={() => store.setPartStatus(r.id, NEXT_STATUS[r.status]!, { name: user.name, role: user.role })}
                    >
                      Mark {NEXT_STATUS[r.status]}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Button, Input, Select, Textarea, type ComboboxOption } from '@pqms/ui-library'
import { Modal } from '@/app/chrome'
import {
  CHANGE_REQUEST_FIELDS,
  ELIGIBLE_PARTS,
  IMMUTABILITY_NOTE,
  changeRequestControl,
  changeRequestFieldLabel,
} from '@/data/investigation'
import type { ActivityChangeRequest, ChangeRequestField, InvestigationActivity } from '@/data/types'
import { FieldLabel, ValidationBanner } from './primitives'
import { ValuePicker } from './ValuePicker'
import styles from './investigation.module.css'

/**
 * Request an activity update.
 *
 * Ported from `RequestActivityUpdateModal.vue`.
 *
 * ─── THE PROPOSED-CHANGE CONTROL IS TYPED TO THE CHOSEN FIELD ────────────────
 *
 * Three fields, three genuinely different controls — a textarea for details, a
 * date input for the activity date, a parts picker for part numbers. Not one
 * textarea with variants: a date typed as free text is a date nothing can
 * validate, and a part number typed by hand defeats the picker that exists to
 * stop exactly that.
 *
 * ─── THE DUPLICATE GUARD SITS ABOVE THE FORM, NOT IN PLACE OF IT ─────────────
 *
 * Selecting a field that already has a pending request shows a warning and
 * blocks Submit, leaving the fields visible. Replacing the form made choosing a
 * pending field look like the form had vanished. The trigger that opens this
 * modal is never hidden either — a user must be able to find out WHY they cannot
 * request a change, which they cannot do if the way in disappears.
 */
export function RequestUpdateModal({
  open,
  activity,
  pendingFields,
  onClose,
  onSubmit,
}: {
  open: boolean
  activity: InvestigationActivity
  /** Fields that already have a pending request on this activity. */
  pendingFields: ChangeRequestField[]
  onClose: () => void
  onSubmit: (input: { field: ChangeRequestField; currentValue: string; proposedValue: string; reason: string }) => void
}) {
  const [field, setField] = useState<ChangeRequestField>('details')
  const [proposed, setProposed] = useState('')
  const [proposedParts, setProposedParts] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [error, setError] = useState<'none' | 'same' | 'reason' | 'empty'>('none')

  // Reopening must not show the last request's draft — that is how someone
  // submits a correction they did not mean to make.
  useEffect(() => {
    if (!open) return
    setField('details'); setProposed(''); setProposedParts([]); setReason(''); setError('none')
  }, [open])

  const control = changeRequestControl(field)

  const currentValue = useMemo(() => {
    if (field === 'details') return activity.summary
    if (field === 'activityDate') return (activity.activityDate ?? activity.createdAt).slice(0, 10)
    return (activity.parts ?? []).join(', ')
  }, [field, activity])

  const partOptions = useMemo<ComboboxOption[]>(
    () => ELIGIBLE_PARTS.map((p) => ({ value: p.partNo, label: p.partNo, meta: `qty ${p.qty}` })),
    [],
  )

  const value = control === 'parts' ? proposedParts.join(', ') : proposed
  const isPending = pendingFields.includes(field)

  const submit = () => {
    if (isPending) return
    if (!value.trim()) return setError('empty')
    // A "change" that changes nothing is not a change — blocking it here keeps
    // the audit trail free of no-op entries an approver would have to read.
    if (value.trim() === currentValue.trim()) return setError('same')
    if (!reason.trim()) return setError('reason')
    onSubmit({ field, currentValue, proposedValue: value.trim(), reason: reason.trim() })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={620}
      title={
        <>
          Request activity update
          <div className={styles.modalSubtitle}>{IMMUTABILITY_NOTE}</div>
        </>
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={isPending} onClick={submit}>Submit request</Button>
        </>
      }
    >
      <div className={styles.modalBody}>
        <div className={styles.field}>
          <FieldLabel text="What would you like to update?" required />
          <Select
            aria-label="What would you like to update?"
            value={field}
            options={CHANGE_REQUEST_FIELDS.map((f) => ({ value: f, label: changeRequestFieldLabel(f, activity.type) }))}
            onChange={(e) => { setField(e.target.value as ChangeRequestField); setError('none') }}
          />
        </div>

        {isPending && (
          <ValidationBanner
            title="Request pending"
            body={`You've already raised a request to update the ${changeRequestFieldLabel(field, activity.type)}. Another request for this field cannot be submitted until the current one has been reviewed. You can still request updates for other fields.`}
          />
        )}

        <div className={styles.field}>
          <FieldLabel text="Current value" />
          <p className={styles.currentValue} data-testid="cr-current-value">{currentValue || '—'}</p>
        </div>

        <div className={styles.field}>
          <FieldLabel text="Proposed change" required />
          {control === 'date' ? (
            <Input
              type="date"
              aria-label="Proposed change"
              value={proposed}
              disabled={isPending}
              onChange={(e) => { setProposed(e.target.value); setError('none') }}
            />
          ) : control === 'parts' ? (
            <ValuePicker
              label="Proposed change"
              mono
              options={partOptions}
              value={proposedParts}
              onChange={(v) => { setProposedParts(v); setError('none') }}
              disabled={isPending}
              placeholder="Search eligible parts…"
              addLabel="Add a part manually"
            />
          ) : (
            <Textarea
              rows={3}
              aria-label="Proposed change"
              value={proposed}
              placeholder="Provide the corrected details in full"
              disabled={isPending}
              onChange={(e) => { setProposed(e.target.value); setError('none') }}
            />
          )}
        </div>

        <div className={styles.field}>
          <FieldLabel text="Reason for change" required />
          <Textarea
            rows={3}
            aria-label="Reason for change"
            value={reason}
            placeholder="Explain why this update is required…"
            disabled={isPending}
            onChange={(e) => { setReason(e.target.value); setError('none') }}
          />
        </div>

        {error === 'same' && <p className={styles.modalError}>The proposed value must be different from the current value.</p>}
        {error === 'reason' && <p className={styles.modalError}>A reason for the change is required.</p>}
        {error === 'empty' && <p className={styles.modalError}>Enter the proposed change.</p>}
      </div>
    </Modal>
  )
}

/**
 * Reject a pending request. Ported from `RejectUpdateRequestModal.vue`.
 *
 * The comment is MANDATORY, and that is the only reason this is a modal rather
 * than a second button beside Approve: a rejection without a stated reason
 * leaves the requester with no way forward, and the comment is shared with them
 * and written to the issue's history.
 */
export function RejectRequestModal({
  open,
  request,
  onClose,
  onReject,
}: {
  open: boolean
  request: ActivityChangeRequest | null
  onClose: () => void
  onReject: (id: string, comment: string) => void
}) {
  const [comment, setComment] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) { setComment(''); setTouched(false) }
  }, [open])

  if (!request) return null

  const submit = () => {
    setTouched(true)
    if (!comment.trim()) return
    onReject(request.id, comment.trim())
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reject update request"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Reject request</Button>
        </>
      }
    >
      <div className={styles.modalBody}>
        <p className={styles.modalNote}>
          The comment is shared with the requester and written to the issue&apos;s History.
        </p>
        <div className={styles.field}>
          <FieldLabel text="Admin comment" required />
          <Textarea
            rows={4}
            aria-label="Admin comment"
            value={comment}
            placeholder="Explain why this request is rejected"
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        {touched && !comment.trim() && (
          <p className={styles.modalError}>A comment is required to reject this request.</p>
        )}
      </div>
    </Modal>
  )
}

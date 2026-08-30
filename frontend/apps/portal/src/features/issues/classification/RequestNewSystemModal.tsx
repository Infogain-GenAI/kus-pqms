import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { Button, Icon, Input, Textarea } from '@pqms/ui-library'
import { Modal, ULabel } from '@/app/chrome'
import type { ClassLevel } from '@/data/types'
import styles from './classification.module.css'

/** Copy per level, so one modal serves System, Sub-system, Component and Symptom. */
const LEVEL_COPY: Record<ClassLevel, { title: string; nameLabel: string; namePlaceholder: string }> = {
  system: {
    title: 'Request New System',
    nameLabel: 'Requested system name',
    namePlaceholder: 'e.g. ADAS / Driver Assistance',
  },
  subSystem: {
    title: 'Request New Sub-system',
    nameLabel: 'Requested sub-system name',
    namePlaceholder: 'e.g. Forward Collision Avoidance',
  },
  component: {
    title: 'Request New Component',
    nameLabel: 'Requested component name',
    namePlaceholder: 'e.g. Front radar module',
  },
  symptom: {
    title: 'Request New Symptom',
    nameLabel: 'Requested symptom name',
    namePlaceholder: 'e.g. Latch fails to release',
  },
}

/**
 * Request a new classification value.
 *
 * Ported from `SystemClassificationForm.vue`'s embedded Request-New-System modal.
 *
 * ─── WHY IT EXISTS AS A SHARED COMPONENT ─────────────────────────────────────
 *
 * There were two half-versions of this. The Edit-issue form rendered a "Request
 * New System" button wired to NOTHING — it was disabled, because there was no
 * flow behind it. Create Issue had its own separate symptom-request modal whose
 * result lived in one local `pendingSymptom` string and reached no store, so the
 * request evaporated the moment the screen unmounted.
 *
 * One modal, one level-aware copy table, one store call.
 *
 * ─── SUBMIT IS ALWAYS ENABLED, DELIBERATELY ──────────────────────────────────
 *
 * Validation fires on click and marks the offending fields, rather than the
 * button sitting disabled until both are filled. A disabled button cannot say
 * which field it is waiting for; this one can. Each field's error then clears
 * the instant that field becomes valid — errors derive from the values, they are
 * not frozen at the moment of the attempt.
 *
 * The justification is REQUIRED for the same reason it is on the Vue side: an
 * approver is being asked to extend a governed taxonomy, and "why" is the whole
 * of what they have to go on.
 */
export function RequestNewSystemModal({
  open,
  level,
  onClose,
  onSubmit,
}: {
  open: boolean
  level: ClassLevel
  onClose: () => void
  onSubmit: (input: { label: string; justification: string }) => void
}) {
  const copy = LEVEL_COPY[level]
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [attempted, setAttempted] = useState(false)

  // Reopening must not show the previous request's draft — that is how someone
  // submits a request they did not mean to make.
  useEffect(() => {
    if (open) { setName(''); setReason(''); setAttempted(false) }
  }, [open])

  const nameError = attempted && !name.trim() ? `Enter the requested ${level === 'subSystem' ? 'Sub-system' : level} name.` : undefined
  const reasonError = attempted && !reason.trim() ? 'Provide a business justification.' : undefined

  const submit = () => {
    setAttempted(true)
    if (!name.trim() || !reason.trim()) return
    onSubmit({ label: name.trim(), justification: reason.trim() })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <>
          {copy.title}
          <div className={styles.modalSubcopy}>Submit a request. Once approved, it will be added.</div>
        </>
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button iconLeft={<Icon icon={Send} size={15} />} onClick={submit}>Submit request</Button>
        </>
      }
    >
      <div className={styles.modalBody}>
        <div>
          <ULabel>{copy.nameLabel} *</ULabel>
          <Input
            aria-label={copy.nameLabel}
            value={name}
            placeholder={copy.namePlaceholder}
            error={nameError}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <ULabel>Reason / business justification *</ULabel>
          <Textarea
            rows={4}
            aria-label="Reason / business justification"
            value={reason}
            placeholder="Why is this classification needed? Reference the issue or programme that requires it."
            error={reasonError}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}

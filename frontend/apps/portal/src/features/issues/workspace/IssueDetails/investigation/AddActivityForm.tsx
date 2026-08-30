import { useMemo, useState } from 'react'
import { Button, Select, Textarea, type ComboboxOption } from '@pqms/ui-library'
import {
  ACTIVITY_TYPES,
  DEALERS,
  ELIGIBLE_PARTS,
  EVALUATION_TYPES,
  TEAM_DIRECTORY,
  activityTypeForm,
  typeHasField,
  vinOptionsFor,
  type ActivityType,
} from '@/data/investigation'
import { AttachmentsDropzone } from './AttachmentsDropzone'
import { FieldLabel, PanelHeading, ValidationBanner } from './primitives'
import { ValuePicker } from './ValuePicker'
import styles from './investigation.module.css'

export interface ActivityDraft {
  type: ActivityType
  details: string
  evaluationType?: string
  parts?: string[]
  vins?: string[]
  dealerCode?: string
  members?: string[]
  attachments?: string[]
}

/**
 * Add-activity form. Ported from `AddActivityForm.vue`.
 *
 * ─── THE FORM'S SHAPE IS CONDITIONAL ON THE ACTIVITY TYPE ────────────────────
 *
 * This is the change that matters, and the previous version had none of it: it
 * rendered a fixed Type + Details + (dead) attachments block for every type.
 * Every type now follows one skeleton —
 *
 *   Activity type* → [the type's own fields] → {Type} details* → Attachments → Save
 *
 * — where the middle set, AND the details field's label and placeholder, come
 * from `activityTypeForm()`. A type with no captured field set renders no
 * conditional fields rather than a guess, which is exactly how this app's five
 * original types behave.
 *
 * EVERY CONDITIONAL FIELD THAT APPEARS IS REQUIRED; attachments are always
 * present and always optional; Save is always last.
 *
 * VALIDATION IS ON SUBMIT, NOT ON KEYSTROKE. An untouched form shows no errors,
 * and fixing a field clears its own error immediately — errors are derived from
 * the value once a save has been attempted, not stored per field.
 */
export function AddActivityForm({
  issueId,
  disabled,
  lockNote,
  onSave,
  onRequestNewType,
}: {
  issueId: string
  disabled: boolean
  /**
   * Why the form is disabled, when the caller knows. Rendered verbatim beneath
   * the Save button; nothing is shown when it is absent.
   *
   * ⚠️ THIS USED TO BE `{disabled && <p>This issue is closed …</p>}` — the note
   * was hardcoded and fired on `disabled`, which is also true for a viewer with
   * no propose capability. Those users were told the issue was closed when it
   * was open. The note now comes from whoever actually knows the reason.
   */
  lockNote?: string
  onSave: (draft: ActivityDraft) => void
  onRequestNewType?: () => void
}) {
  const [type, setType] = useState<ActivityType>(ACTIVITY_TYPES[0])
  const [details, setDetails] = useState('')
  const [evaluationType, setEvaluationType] = useState('')
  const [parts, setParts] = useState<string[]>([])
  const [vins, setVins] = useState<string[]>([])
  const [dealerCode, setDealerCode] = useState<string[]>([])
  const [members, setMembers] = useState<string[]>([])
  const [attachments, setAttachments] = useState<string[]>([])
  const [attempted, setAttempted] = useState(false)

  const form = activityTypeForm(type)
  const shows = (f: Parameters<typeof typeHasField>[1]) => typeHasField(type, f)

  const partOptions = useMemo<ComboboxOption[]>(
    () => ELIGIBLE_PARTS.map((p) => ({ value: p.partNo, label: p.partNo, meta: `qty ${p.qty}` })),
    [],
  )
  const dealerOptions = useMemo<ComboboxOption[]>(
    () => DEALERS.map((d) => ({ value: d.code, label: d.code, detail: d.name })),
    [],
  )
  const memberOptions = useMemo<ComboboxOption[]>(
    () => TEAM_DIRECTORY.map((m) => ({ value: m.name, label: m.name, detail: `${m.role} · ${m.company}` })),
    [],
  )
  const vinOptions = useMemo<ComboboxOption[]>(
    () => vinOptionsFor(issueId).map((v) => ({ value: v, label: v })),
    [issueId],
  )

  /** A conditional field is required exactly when the type renders it. */
  const missing = () => {
    const gaps: string[] = []
    if (!details.trim()) gaps.push('details')
    if (shows('evaluationType') && !evaluationType) gaps.push('evaluationType')
    if (shows('parts') && parts.length === 0) gaps.push('parts')
    if (shows('vins') && vins.length === 0) gaps.push('vins')
    if (shows('dealerCode') && dealerCode.length === 0) gaps.push('dealerCode')
    if (shows('members') && members.length === 0) gaps.push('members')
    return gaps
  }

  const gaps = attempted ? missing() : []
  const err = (k: string, msg: string) => (gaps.includes(k) ? msg : undefined)

  const save = () => {
    setAttempted(true)
    if (missing().length > 0) return
    onSave({
      type,
      details: details.trim(),
      evaluationType: shows('evaluationType') ? evaluationType : undefined,
      parts: shows('parts') ? parts : undefined,
      vins: shows('vins') ? vins : undefined,
      dealerCode: shows('dealerCode') ? dealerCode[0] : undefined,
      members: shows('members') ? members : undefined,
      attachments: attachments.length ? attachments : undefined,
    })
    // Type is kept: logging several activities of one kind in a row is the
    // common case, and re-picking it every time is friction with no purpose.
    setDetails('')
    setEvaluationType('')
    setParts([]); setVins([]); setDealerCode([]); setMembers([])
    setAttachments([])
    setAttempted(false)
  }

  return (
    <>
      <PanelHeading>Add activity</PanelHeading>

      {/* Above the first field, NOT inside the Activity-type dropdown. The
          pickers' own add-triggers ARE in-panel — the two kinds of "can't find
          it?" affordance sit in different places by design. */}
      <p className={styles.requestNew}>
        Can&apos;t find the required Activity?
        <button
          type="button"
          className={styles.link}
          disabled={disabled || !onRequestNewType}
          onClick={onRequestNewType}
        >
          Request New
        </button>
      </p>

      {gaps.length > 0 && <ValidationBanner title="Cannot save activity" body="Complete the required fields." />}

      <div className={styles.field}>
        <FieldLabel text="Activity type" required />
        <Select
          aria-label="Activity type"
          value={type}
          options={[...ACTIVITY_TYPES]}
          disabled={disabled}
          onChange={(e) => setType(e.target.value)}
        />
      </div>

      {shows('evaluationType') && (
        <div className={styles.field}>
          <FieldLabel text="Evaluation type" required />
          <Select
            aria-label="Evaluation type"
            value={evaluationType}
            placeholder="Select Evaluation Type"
            options={[...EVALUATION_TYPES]}
            disabled={disabled}
            error={err('evaluationType', 'Required.')}
            onChange={(e) => setEvaluationType(e.target.value)}
          />
        </div>
      )}

      {shows('parts') && (
        <ValuePicker
          label="Part number"
          required
          mono
          options={partOptions}
          value={parts}
          onChange={setParts}
          disabled={disabled}
          placeholder="Search eligible parts…"
          addLabel="Add parts manually"
          invalid={err('parts', 'Select or add at least one part.')}
        />
      )}

      {shows('vins') && (
        <ValuePicker
          label="VIN(s)"
          required
          mono
          options={vinOptions}
          value={vins}
          onChange={setVins}
          disabled={disabled}
          placeholder="Search VIN…"
          addLabel="Enter a VIN manually"
          invalid={err('vins', 'Add at least one VIN.')}
        />
      )}

      {shows('dealerCode') && (
        <ValuePicker
          label="Dealer code"
          required
          options={dealerOptions}
          value={dealerCode}
          // Single-valued in the model, so a second pick replaces the first
          // rather than accumulating.
          onChange={(next) => setDealerCode(next.slice(-1))}
          disabled={disabled}
          placeholder="Search dealer code or name…"
          invalid={err('dealerCode', 'Select a dealer.')}
        />
      )}

      {shows('members') && (
        <ValuePicker
          label="Team members involved"
          required
          options={memberOptions}
          value={members}
          onChange={setMembers}
          disabled={disabled}
          placeholder="Search team members…"
          addLabel="Add a team member"
          invalid={err('members', 'Add at least one team member.')}
        />
      )}

      <div className={styles.field}>
        <FieldLabel text={form.detailsLabel} required />
        <Textarea
          rows={4}
          aria-label={form.detailsLabel}
          value={details}
          placeholder={form.detailsPlaceholder}
          disabled={disabled}
          error={err('details', 'Required.')}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <AttachmentsDropzone value={attachments} onChange={setAttachments} disabled={disabled} />

      <Button fullWidth disabled={disabled} onClick={save}>Save activity</Button>

      {lockNote && <p className={styles.closedNote}>{lockNote}</p>}
    </>
  )
}

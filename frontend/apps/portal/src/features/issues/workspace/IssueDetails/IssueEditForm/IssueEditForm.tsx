import { useMemo, useRef, useState } from 'react'
import { Check, CircleX } from 'lucide-react'
import { Button, Icon, Input, Textarea } from '@pqms/ui-library'
import { ULabel } from '@/app/chrome'
import { useStore } from '@/data/store'
import type { SourceChannel } from '@/data/sourceChannels'
import type { Issue } from '@/data/types'
import { LinkIssuesSection } from '../../../LinkIssuesSection'
import { SameExistingIssuesSection } from './SameExistingIssuesSection'
import { useTranslation } from 'react-i18next'
import { NS } from '../../IssueDetail.i18n'
import { ModelCodeYearPicker, type ModelCodeSelection } from '../../../ModelCodeYearPicker'
import { SystemClassificationPicker, type ClassificationValue } from '../../../SystemClassificationPicker'
import { EditSourcesForm, type EditSourcesHandle } from '../issue-detail/EditSourcesForm'
import styles from './IssueEditForm.module.css'

/**
 * Full-page Edit-issue mode.
 *
 * Ported from `IssueEditForm.vue`.
 *
 * IT IS NOT A MODAL, AND THAT IS THE POINT. It replaces the section body and the
 * shell suppresses the right rail while it is mounted. The three-field modal
 * this supersedes could hold title, description and DTC and nothing more; this
 * form is five sections and would be unusable in a dialog — which is exactly why
 * the Vue implementation moved it out of one.
 *
 * REUSES, RATHER THAN FORKS, THE PICKERS. `ModelCodeYearPicker` and
 * `LinkIssuesSection` already exist here and their own doc comments say they are
 * shared with "Issue Detail's in-tab edit mode" — this is that consumer finally
 * arriving. The Vue file records the same lesson learned the hard way: its
 * sections were once hand-rolled markup that drifted from Issue Entry's, and two
 * of its panels were suppressed on the false assumption that this form had its
 * own working versions. It did not, and the clicks silently did nothing.
 *
 * `EditSourcesForm` is the same component the section-scoped "Add / edit sources"
 * flow mounts; only the chrome around it differs. It must be validated here too,
 * or a required source field left blank in this form would save silently.
 *
 * DIRTY TRACKING gates Save: an unchanged form cannot be submitted, so the
 * button state answers "is there anything to save" rather than "is the form
 * valid", which is the question a user actually has at that moment.
 */
export function IssueEditForm({
  issue,
  channels,
  disabled = false,
  onCancel,
  onSave,
}: {
  issue: Issue
  channels: SourceChannel[]
  disabled?: boolean
  onCancel: () => void
  onSave: (payload: {
    title: string
    description: string
    dtcCodes: string[]
    modelCodes: string[]
    modelYear: number
    system?: string
    subSystem?: string
    component?: string
    symptom?: string
    channels: SourceChannel[]
  }) => void
}) {
  const { t } = useTranslation(NS)
  const store = useStore()
  const sourcesRef = useRef<EditSourcesHandle>(null)

  // ── 1 · Vehicle information ───────────────────────────────────────────────
  const initialVehicle: ModelCodeSelection = useMemo(() => {
    const codes = issue.modelCodes?.length ? issue.modelCodes : [issue.modelCode]
    return { codes, yearsByCode: Object.fromEntries(codes.map((c) => [c, [String(issue.modelYear)]])) }
  }, [issue])
  const [vehicle, setVehicle] = useState<ModelCodeSelection>(initialVehicle)

  /** Every selected code must keep at least one year. Gates Save. */
  const codesWithNoYear = vehicle.codes.filter((c) => (vehicle.yearsByCode[c] ?? []).length === 0)

  // ── 2 · System classification ─────────────────────────────────────────────
  // Labels, not ids — that is what `Issue` stores, and the picker resolves the
  // cascade internally. See SystemClassificationPicker for why.
  const initialClass: ClassificationValue = useMemo(
    () => ({
      system: issue.system,
      subSystem: issue.subSystem,
      component: issue.component,
      symptom: issue.symptom,
    }),
    [issue],
  )
  const [classification, setClassification] = useState<ClassificationValue>(initialClass)

  // ── 3 · Related issues ────────────────────────────────────────────────────
  // GATED NOW, IN BOTH DIRECTIONS. This note used to say the Vue form's
  // justification prompt was not reproduced because "this app has no
  // justification capture anywhere" — true when it was written, and no longer.
  // `LinkIssuesSection` captures the reason inline and does not call through
  // until it clears the shared rule, so both callbacks below receive one.
  const linked = issue.linkedIssueIds ?? []

  /*
   * ⚠️ THE SAME PLACEHOLDER THIS FORM ALREADY USES, matched deliberately rather
   * than improved. Both existing calls below pass { name: 'You', role: 'SE' }
   * literally, so audit rows from this screen are attributed to "You" instead of
   * the signed-in user. Using `useRole()` here would be correct AND would change
   * what this screen writes to the audit trail — a behaviour change on a surface
   * another developer owns. Reported instead of fixed; the ranked block matches
   * the existing value so one screen does not attribute two ways.
   */
  const EDIT_ACTOR = { name: 'You', role: 'SE' }

  // ── 4 · Issue information ─────────────────────────────────────────────────
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description)
  const [dtc, setDtc] = useState((issue.dtcCodes ?? []).join(', '))

  // ── Dirty tracking ────────────────────────────────────────────────────────
  const dirty =
    title !== issue.title ||
    description !== issue.description ||
    dtc !== (issue.dtcCodes ?? []).join(', ') ||
    JSON.stringify(vehicle) !== JSON.stringify(initialVehicle) ||
    JSON.stringify(classification) !== JSON.stringify(initialClass)

  const titleValid = title.trim().length >= 5
  const canSave = !disabled && dirty && titleValid && codesWithNoYear.length === 0

  const submit = () => {
    if (!canSave) return
    // Same gate the section-scoped save applies — see EditSourcesForm.
    if (sourcesRef.current?.validate() === false) return
    const years = vehicle.codes.flatMap((c) => vehicle.yearsByCode[c] ?? []).map(Number).filter(Number.isFinite)
    onSave({
      title: title.trim(),
      description: description.trim(),
      dtcCodes: dtc.trim() ? dtc.split(',').map((d) => d.trim()).filter(Boolean) : [],
      modelCodes: vehicle.codes,
      modelYear: years.length ? Math.max(...years) : issue.modelYear,
      system: classification.system,
      subSystem: classification.subSystem,
      component: classification.component,
      symptom: classification.symptom,
      channels: sourcesRef.current?.getDraft() ?? channels,
    })
  }

  return (
    <section className={styles.form} data-testid="issue-edit-form">
      <header className={styles.header}>
        <h2 className={styles.title}>{t('editFormTitle')}</h2>
        <div className={styles.actions}>
          <Button variant="secondary" iconLeft={<Icon icon={CircleX} size={16} />} onClick={onCancel} data-testid="edit-form-cancel">
            {t('editFormCancel')}
          </Button>
          <Button disabled={!canSave} iconLeft={<Icon icon={Check} size={16} />} onClick={submit} data-testid="edit-form-save">
            {t('editFormSave')}
          </Button>
        </div>
      </header>

      {/* 1 — Vehicle information */}
      <div className={styles.section} data-section="vehicle-information">
        <h3 className={styles.sectionTitle}>{t('editFormVehicle')}</h3>
        <ModelCodeYearPicker value={vehicle} onChange={setVehicle} disabled={disabled} />
        {codesWithNoYear.length > 0 && (
          <p className={styles.error} role="alert">
            {t('editFormYearRequired', { count: codesWithNoYear.length, codes: codesWithNoYear.join(', ') })}
          </p>
        )}
      </div>

      {/* 2 — System classification. System stays governance-locked, matching the
          Vue form's `system-field-read-only`: changing an issue's system is a
          request, not an edit, and that request flow does not exist here yet —
          so the link is rendered disabled rather than wired to nothing. */}
      <div className={styles.section} data-section="system-classification">
        <h3 className={styles.sectionTitle}>{t('editFormClassification')}</h3>
        <SystemClassificationPicker
          value={classification}
          onChange={setClassification}
          modelCodes={vehicle.codes}
          disabled={disabled}
          systemReadOnly
          issueId={issue.id}
        />
      </div>

      {/* 3 — Same existing issues */}
      <div className={styles.section} data-section="same-existing-issues">
        <h3 className={styles.sectionTitle}>{t('editFormSameExisting')}</h3>
        {/*
          TWO BLOCKS, AND THE SPLIT IS DELIBERATE. The heading has always said
          "Same existing issues" while the body was the SEARCH block alone, so it
          promised ranked suggestions the screen never made. The ranked half is
          now its own component; `LinkIssuesSection` is unchanged and still owns
          search and the linked list.

          They do not overlap: suggestions exclude anything already linked, so
          unlink is offered in exactly one place. Two ways to perform one
          mutation is how two paths drift apart.
        */}
        <SameExistingIssuesSection
          issue={issue}
          /* LIVE — the form's current values, so editing the classification
             re-ranks. The design's own view-model computes its matches from form
             state unconditionally, and its edit mode repopulates that state. */
          subject={{
            system: classification.system,
            subSystem: classification.subSystem,
            component: classification.component,
            symptom: classification.symptom,
            title,
            description,
            dtcCodes: dtc.split(',').map((d) => d.trim()).filter(Boolean),
            modelCode: vehicle.codes[0],
          }}
          linkedIds={linked}
          disabled={disabled}
          onLink={(ids, why) => {
            // One reason, audited against each link it justified. A group card
            // links every member, and each of those links is a real mutation.
            for (const id of ids) store.linkIssue(issue.id, id, why, EDIT_ACTOR)
          }}
          onUnlink={(id, why) => store.removeRelated(issue.id, id, why, EDIT_ACTOR)}
        />
        <LinkIssuesSection
          linkedIds={linked}
          excludeId={issue.id}
          onLink={(id, why) => store.linkIssue(issue.id, id, why, { name: 'You', role: 'SE' })}
          onUnlink={(id, why) => store.unlinkIssue(issue.id, id, why, { name: 'You', role: 'SE' })}
        />
      </div>

      {/* 4 — Issue information */}
      <div className={styles.section} data-section="issue-information">
        <h3 className={styles.sectionTitle}>{t('editFormIssueInformation')}</h3>
        <div>
          <ULabel>{t('editFormIssueTitle')}</ULabel>
          <Input
            value={title}
            disabled={disabled}
            placeholder="e.g. EV6 — HV battery rapid SOC drop under cold soak"
            error={title.length > 0 && !titleValid ? 'Title must be at least 5 characters.' : undefined}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <ULabel>{t('editFormDescription')}</ULabel>
          <Textarea
            rows={4}
            value={description}
            disabled={disabled}
            placeholder="Symptoms, reproduction steps, environmental conditions, frequency, and any safety implications…"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <ULabel>{t('editFormDtc')}</ULabel>
          <Input
            value={dtc}
            disabled={disabled}
            placeholder="e.g. P0A0F, C1234, B1020"
            onChange={(e) => setDtc(e.target.value)}
          />
          <p className={styles.hint}>
            {t('editFormDtcHint')}
          </p>
        </div>
      </div>

      {/* 5 — Issue source: the same component the section-scoped flow uses. */}
      <div className={styles.section} data-section="issue-source">
        <h3 className={styles.sectionTitle}>{t('editFormIssueSource')}</h3>
        <EditSourcesForm ref={sourcesRef} channels={channels} disabled={disabled} />
      </div>
    </section>
  )
}

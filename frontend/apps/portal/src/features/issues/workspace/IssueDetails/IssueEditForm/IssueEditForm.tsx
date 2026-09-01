import { useMemo, useRef, useState } from 'react'
import { Check, CircleX } from 'lucide-react'
import { Button, Icon, Input, Textarea } from '@pqms/ui-library'
import { ULabel } from '@/app/chrome'
import { useStore } from '@/data/store'
import type { SourceChannel } from '@/data/sourceChannels'
import type { Issue } from '@/data/types'
import { SameExistingIssuesSection } from './SameExistingIssuesSection'
import { DtcChipInput } from '@/features/issues/issue-entry/DtcChipInput'
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
 * REUSES, RATHER THAN FORKS, THE PICKERS. `ModelCodeYearPicker` already exists
 * here and its doc comment says it is shared with "Issue Detail's in-tab edit
 * mode" — this is that consumer finally arriving. `SameExistingIssuesSection`
 * likewise renders the cards Issue Entry renders, because the canonical draws
 * that section identically on both screens. The Vue file records the same lesson learned the hard way: its
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
  // `SameExistingIssuesSection` captures the reason inline and does not call
  // through until it clears the shared rule, so the callbacks below receive one.
  const linked = issue.linkedIssueIds ?? []

  /*
   * ─── ⚠️ THE LITERAL ACTOR IS DELIBERATE, AND IT EXPIRES ─────────────────────
   *
   * Every store call on this screen passes this literal rather than reading the
   * session.
   * That is CORRECT today: RBAC is not implemented and SE is the only role in
   * use, so a hardcoded SE reports reality instead of inventing an attribution.
   *
   * ⚠️ IT BECOMES WRONG THE DAY RBAC LANDS, and it is close to unfindable then:
   * it compiles, nothing tests it, and the symptom — every audit row on this
   * screen attributed to "You" — reads as a UI copy choice rather than a bug. So
   * the note lives at the call site, where someone changing the auth model has to
   * pass through it, rather than in a document nobody re-reads.
   *
   * WHEN RBAC ARRIVES: replace this with `useRole()` and pass the real actor.
   *
   * ⚠️ THERE IS NOW EXACTLY ONE CALL SITE, and this comment used to say three.
   * The other two belonged to `LinkIssuesSection`, the separate search card this
   * form no longer renders — so the consolidation that used to be "the first step
   * of the RBAC change" happened as a side effect of superseding that component.
   * Recorded because a stale count in a comment is exactly the kind of claim that
   * outlives its subject.
   */
  const EDIT_ACTOR = { name: 'You', role: 'SE' }

  // ── 4 · Issue information ─────────────────────────────────────────────────
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description)
  /*
   * ─── TOKENS, NOT A COMMA-SEPARATED STRING ───────────────────────────────────
   *
   * This was a `string` holding `dtcCodes.join(', ')`, edited through a plain
   * `<Input>`. It is now the same `DtcChipInput` Issue Entry uses, so the state
   * is the array the rest of the form already wanted: `onSave` has always taken
   * `dtcCodes: string[]`, and the string existed only as an input representation.
   *
   * The change is confined to the field. The save payload's shape is unchanged,
   * DTC has no validation to adjust, and stored values round-trip — an array
   * arrives as chips and leaves as the same array.
   */
  const [dtcCodes, setDtcCodes] = useState<string[]>(issue.dtcCodes ?? [])

  // ── Dirty tracking ────────────────────────────────────────────────────────
  const dirty =
    title !== issue.title ||
    description !== issue.description ||
    dtcCodes.join(', ') !== (issue.dtcCodes ?? []).join(', ') ||
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
      // No parsing left to do: the control hands over tokens already trimmed,
      // uppercased and de-duplicated.
      dtcCodes,
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
          ONE BLOCK NOW. This section holds the ranked suggestions AND the search
          panel, folded in behind its own header toggle, because the canonical
          renders them as one section — the same one it renders on Issue Entry.
          `LinkIssuesSection`, the separate search card that used to sit beside
          this, is superseded and deleted; its behaviour was pinned first and its
          tests target this panel.
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
            dtcCodes,
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
          {/*
            The hint that used to sit here is gone with the plain input, not
            lost: `DtcChipInput` renders its own help text, which carries the
            same P/B/C/U legend PLUS the fact that free entry is allowed
            alongside search. Keeping both printed the legend twice on one field.
          */}
          <DtcChipInput
            codes={dtcCodes}
            onChange={setDtcCodes}
            disabled={disabled}
            aria-label={t('editFormDtc')}
          />
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

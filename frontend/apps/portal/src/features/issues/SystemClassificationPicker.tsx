import { useId, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Info } from 'lucide-react'
import { Combobox, Icon, type ComboboxOption } from '@pqms/ui-library'
import { useStore } from '@/data/store'
import { useRole } from '@/data/roles'
import type { ClassLevel } from '@/data/types'
import { RequestNewSystemModal } from './classification/RequestNewSystemModal'
import { NS } from './SystemClassificationPicker.i18n'
import styles from './SystemClassificationPicker.module.css'

/**
 * System Classification — the PATH breadcrumb, the "Request New System" link,
 * and the four cascading comboboxes.
 *
 * Ported from `SystemClassificationForm.vue`, whose structure this had none of:
 * the previous React treatment was four bare `Select` dropdowns with no path
 * display and no request affordance.
 *
 * THE BREADCRUMB IS THE POINT OF THIS SECTION. Classification is four dependent
 * choices, and the only way to see the whole of what you have picked is a line
 * that shows all five slots at once — model code first, then the four levels,
 * with unfilled slots shown as muted placeholders rather than omitted. Omitting
 * them would make a half-finished path look complete.
 *
 * VALUES ARE LABELS, NOT IDS. `Issue` stores classification as display strings,
 * so this component takes and returns labels while resolving ids internally for
 * the cascade. That keeps the id vocabulary from leaking into the issue record,
 * which is what would make a taxonomy renumbering a data migration.
 *
 * SELECTING A LEVEL CLEARS THE ONES BELOW IT. A component that no longer belongs
 * to the selected sub-system is worse than an empty field, because it still
 * reads as a valid answer.
 */

export interface ClassificationValue {
  system?: string
  subSystem?: string
  component?: string
  symptom?: string
}

export function SystemClassificationPicker({
  value,
  onChange,
  modelCodes,
  disabled = false,
  /** System is governance-locked in Edit mode: changing it is a request, not an edit. */
  systemReadOnly = false,
  issueId,
  errors,
  symptomDisabled = false,
  symptomFooter,
  requestPrompt = 'Can’t find the required System?',
  requestLabel = 'Request New System',
  onRequestSystem,
}: {
  value: ClassificationValue
  onChange: (next: ClassificationValue) => void
  modelCodes: string[]
  disabled?: boolean
  systemReadOnly?: boolean
  /** Audits the request against this issue when raised from a workspace form. */
  issueId?: string
  /** Per-field messages, shown only once the caller decides to show them. */
  errors?: Partial<Record<'system' | 'subSystem' | 'component' | 'symptom', string | undefined>>
  /** Issue Entry disables Symptom while a new one is pending approval. */
  symptomDisabled?: boolean
  /** Rendered under Symptom — Issue Entry puts the "Pending Approval" badge here. */
  symptomFooter?: ReactNode
  /**
   * The request affordance's copy differs by screen:
   *   Issue Entry  `Can't find the required classification?` → `Request New`
   *   Edit Issue   `Need to change the System?`              → `Raise a Request`
   * Defaults preserve what `IssueEditForm` renders.
   */
  requestPrompt?: string
  requestLabel?: string
  /**
   * MERGE NOTE — an escape hatch, not a second design.
   *
   * This component owns a request modal (`RequestNewSystemModal` +
   * `store.requestClassification`), which is the right home for it. Issue Entry
   * additionally runs a SYMPTOM-level request with its own pending-approval
   * badge, which the system-level modal does not express. When this is supplied
   * the row defers to the caller; otherwise the internal modal opens.
   */
  onRequestSystem?: () => void
}) {
  const store = useStore()
  const { user } = useRole()
  const { t } = useTranslation(NS)
  const ids = useId()
  /**
   * Which level the request modal is asking about. The affordance reads
   * "Request New System" but the same flow serves every level — a user stuck at
   * Symptom needs it just as much, and Create Issue already proved that by
   * building a separate symptom-only version of it.
   */
  const [requesting, setRequesting] = useState<ClassLevel | null>(null)

  // The cascade resolves by label at each level, because that is what the issue
  // stores. `find` on label is safe here: the taxonomy's labels are unique
  // within a parent, which is what makes them usable as the stored value at all.
  const systems = store.classByLevel('system')
  const sysNode = systems.find((s) => s.label === value.system)
  const subs = useMemo(() => (sysNode ? store.classChildren(sysNode.id) : []), [sysNode, store])
  const subNode = subs.find((s) => s.label === value.subSystem)
  const comps = useMemo(() => (subNode ? store.classChildren(subNode.id) : []), [subNode, store])
  const compNode = comps.find((s) => s.label === value.component)
  const symptoms = useMemo(() => (compNode ? store.classChildren(compNode.id) : []), [compNode, store])

  const toOptions = (list: { id: string; label: string }[]): ComboboxOption[] =>
    list.map((n) => ({ value: n.label, label: n.label }))

  // No model code means no classification: the taxonomy is scoped by vehicle, so
  // offering it first would invite a choice that has to be discarded.
  const locked = disabled || modelCodes.length === 0

  const segments: { label: string; filled: boolean }[] = [
    { label: modelCodes.join(', ') || 'Model Code', filled: modelCodes.length > 0 },
    { label: value.system ?? 'System', filled: !!value.system },
    { label: value.subSystem ?? 'Sub-System', filled: !!value.subSystem },
    { label: value.component ?? 'Component', filled: !!value.component },
    { label: value.symptom ?? 'Symptom', filled: !!value.symptom },
  ]

  return (
    <div className={styles.root}>
      <div className={styles.path}>
        <span className={styles.pathLabel}>{t('path')}</span>
        {segments.map((seg, i) => (
          <span key={seg.label + i} style={{ display: 'contents' }}>
            {i > 0 && <Icon icon={ChevronRight} size={13} className={styles.sep} />}
            <span className={seg.filled ? `${styles.seg} ${styles.segFilled}` : styles.seg}>{seg.label}</span>
          </span>
        ))}
      </div>

      {modelCodes.length === 0 && (
        <div className={styles.hint}>
          <Icon icon={Info} size={14} />
          {t('modelCodeFirst')}
        </div>
      )}

      {/* This button was DISABLED — rendered with no handler behind it, because
          nothing implemented the flow. It now opens the request modal. */}
      <div className={styles.requestRow}>
        <span>{requestPrompt}</span>
        <button type="button" className={styles.requestLink} onClick={() => (onRequestSystem ? onRequestSystem() : setRequesting('system'))}>
          {requestLabel}
        </button>
      </div>

      {/* SYSTEM ONLY, matching the source. A user stuck at Symptom has no escape
          hatch here either — that gap is inherited, not introduced, and closing
          it is a product decision rather than a porting one. The modal itself is
          level-capable, so Create Issue's symptom request reuses it unchanged. */}
      <RequestNewSystemModal
        open={requesting !== null}
        level="system"
        onClose={() => setRequesting(null)}
        onSubmit={({ label, justification }) => {
          const node = store.requestClassification(
            { level: 'system', label, justification, issueId },
            { name: user.name, role: user.role },
          )
          // Selected straight away. Making the user hunt for the value they just
          // asked for would defeat the point of asking from inside the form —
          // and the cascade below resets, because the old sub-system belongs to
          // a different system.
          onChange({ system: node.label })
        }}
      />

      <div className={styles.grid}>
        <Field
          id={`${ids}-sys`}
          label={t('labelSystem')}
          options={toOptions(systems)}
          selected={value.system}
          disabled={locked || systemReadOnly}
          placeholder={locked ? 'Select a model code first' : 'Search system… (e.g. “Bat”, “Electrical”)'}
          emptyText="No matching system."
          error={errors?.system}
          onSelect={(v) => onChange({ system: v })}
          note={systemReadOnly ? 'Governance-locked — changing the System is a request, not an edit.' : undefined}
        />
        <Field
          id={`${ids}-sub`}
          label={t('labelSubSystem')}
          options={toOptions(subs)}
          selected={value.subSystem}
          disabled={locked || !value.system}
          placeholder={value.system ? 'Search sub-system…' : 'Select a system first'}
          emptyText="No matching sub-system."
          error={errors?.subSystem}
          onSelect={(v) => onChange({ ...value, subSystem: v, component: undefined, symptom: undefined })}
        />
        <Field
          id={`${ids}-comp`}
          label={t('labelComponent')}
          options={toOptions(comps)}
          selected={value.component}
          disabled={locked || !value.subSystem}
          placeholder={value.subSystem ? 'Search component…' : 'Select a sub-system first'}
          emptyText="No matching component."
          error={errors?.component}
          onSelect={(v) => onChange({ ...value, component: v, symptom: undefined })}
        />
        <Field
          id={`${ids}-symp`}
          label={t('labelSymptom')}
          options={toOptions(symptoms)}
          selected={value.symptom}
          disabled={locked || !value.component || symptomDisabled}
          placeholder={value.component ? 'Search symptom…' : 'Select a component first'}
          emptyText="No matching symptom."
          error={errors?.symptom}
          footer={symptomFooter}
          onSelect={(v) => onChange({ ...value, symptom: v })}
        />
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  options,
  selected,
  disabled,
  placeholder,
  onSelect,
  note,
  emptyText,
  error,
  footer,
}: {
  id: string
  label: string
  options: ComboboxOption[]
  selected?: string
  disabled: boolean
  placeholder: string
  onSelect: (value: string) => void
  note?: string
  /** The design gives each level its own no-match line ("No matching system."). */
  emptyText: string
  error?: string
  footer?: ReactNode
}) {
  return (
    <div>
      <span id={id} className={styles.label}>{label}</span>
      <Combobox
        options={options}
        selected={selected ? [selected] : []}
        onSelect={onSelect}
        disabled={disabled}
        placeholder={placeholder}
        emptyText={emptyText}
        invalid={!!error}
        // The accessible name is the field name WITHOUT the asterisk — labelling
        // via the visible span made it "System *", which reads as "System star".
        aria-label={label.replace(/\s*\*$/, '')}
      />
      {footer}
      {error && <p className={styles.error}>{error}</p>}
      {note && <p className={styles.error}>{note}</p>}
    </div>
  )
}

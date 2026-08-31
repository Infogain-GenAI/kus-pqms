import { useState } from 'react'
import { X } from 'lucide-react'
import { Combobox, Icon, type ComboboxOption } from '@pqms/ui-library'
import { FieldLabel } from './primitives'
import styles from './ValuePicker.module.css'

/**
 * Multi-select picker with selected-value chips and an optional manual-entry
 * escape hatch — the control behind Part number, VIN(s) and Team members.
 *
 * Ported from Vue's `SearchablePicker.vue` and its four wrappers
 * (`PartsPicker`, `VinsPicker`, `TeamMembersPicker`, `DealerCodePicker`).
 *
 * ONE COMPONENT, NOT FOUR. Vue has a shared behavioural core plus a thin wrapper
 * per field, which is a reasonable shape there because each wrapper also carries
 * its own i18n. Here the differences reduce to three props — the options, the
 * label, and whether values are monospaced — so four files would be three lines
 * of difference apiece.
 *
 * THE MANUAL-ENTRY PATH IS NOT DECORATION. Parts may be cited that have no part
 * request behind them, and a VIN will routinely be one nobody catalogued. The
 * source is explicit that this is intended, so `onAdd` typing a value straight
 * in is a first-class path, not a fallback.
 */
export function ValuePicker({
  label,
  required,
  options,
  value,
  onChange,
  disabled = false,
  mono = false,
  addLabel,
  onAdd,
  placeholder,
  invalid,
}: {
  label: string
  required?: boolean
  options: ComboboxOption[]
  value: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
  /** Monospace the chips — for part numbers and VINs. */
  mono?: boolean
  /** Renders the add trigger beneath the field when provided. */
  addLabel?: string
  /**
   * What the add trigger does. WITHOUT it the trigger opens the INLINE
   * single-value input below; WITH it, the trigger calls this instead.
   *
   * ─── THE TWO PATHS ARE NOT INTERCHANGEABLE ─────────────────────────────────
   *
   * Inline entry captures ONE STRING into this field and forgets it. That is the
   * whole requirement for a VIN, which is a bare identifier nobody catalogues.
   *
   * A part needs a quantity and a member needs a role and a company, and both
   * are normally added several at a time — so those pass `onAdd` and open
   * `MultiRowDraftModal`, whose rows join the shared directory and become
   * options for every later activity. Vue splits this the same way: `VinsPicker`
   * has no manual path at all, while the parts and members pickers open modals.
   */
  onAdd?: () => void
  placeholder?: string
  invalid?: string
}) {
  const [manual, setManual] = useState(false)
  const [draft, setDraft] = useState('')

  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  const commitManual = () => {
    const v = draft.trim()
    // Silently ignoring a duplicate beats an error for a value that is already
    // where the user wanted it.
    if (v && !value.includes(v)) onChange([...value, v])
    setDraft('')
    setManual(false)
  }

  return (
    <div>
      <FieldLabel text={label} required={required} />
      {manual ? (
        <input
          autoFocus
          className={styles.manualInput}
          value={draft}
          placeholder={`Type a ${label.toLowerCase()} and press Enter`}
          aria-label={`Add ${label} manually`}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitManual}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commitManual() }
            if (e.key === 'Escape') { setDraft(''); setManual(false) }
          }}
        />
      ) : (
        <Combobox
          options={options}
          selected={value}
          onSelect={toggle}
          multiple
          disabled={disabled}
          placeholder={placeholder}
          displayValue={value.length === 0 ? '' : `${value.length} selected`}
          aria-label={label}
          invalid={!!invalid}
          emptyText="No options found"
        />
      )}

      {value.length > 0 && (
        <div className={styles.chips}>
          {value.map((v) => (
            <span key={v} className={mono ? `${styles.chip} ${styles.chipMono}` : styles.chip}>
              {v}
              <button
                type="button"
                className={styles.chipRemove}
                disabled={disabled}
                aria-label={`Remove ${v}`}
                onClick={() => onChange(value.filter((x) => x !== v))}
              >
                <Icon icon={X} size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {addLabel && !manual && (
        <div className={styles.addRow}>
          <button type="button" className={styles.addLink} disabled={disabled} onClick={() => (onAdd ? onAdd() : setManual(true))}>
            {addLabel}
          </button>
        </div>
      )}

      {invalid && <p className={styles.invalid}>{invalid}</p>}
    </div>
  )
}

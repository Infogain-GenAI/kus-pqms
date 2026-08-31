import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Icon } from '../../icons/Icon'
import styles from './Combobox.module.css'

/**
 * Searchable combobox — one control, single- or multi-select.
 *
 * WHY THIS IS ONE COMPONENT AND NOT FIVE. The prototype uses this exact control
 * in five places: Model Code (multi-select) and the four classification levels
 * (single-select). The Vue implementation shares the behaviour through a
 * `makeCombo` factory but repeats the ~40-line markup at every call site, and
 * its own comments record the drift that followed — one copy gained a loading
 * state, another a retry link, a third neither.
 *
 * So the markup is shared here too. `multiple` is the only structural switch:
 * it adds the option checkbox and keeps the panel open across picks.
 *
 * WHY `ui-library` AND NOT THE FEATURE FOLDER. It carries no feature logic and
 * no data access — it takes options and reports selection. That is the stated
 * boundary for this package, and 01 allows exactly one shared location, so a
 * second one next to the consumers is not available.
 *
 * BEHAVIOURS THAT LOOK LIKE DETAILS AND ARE NOT:
 *  - The panel closes on a 150ms blur delay, so an option's mousedown lands
 *    before the panel unmounts. Without it, clicking an option does nothing.
 *  - Multi-select picks do NOT close the panel, and `onMouseDown`+`preventDefault`
 *    keeps focus on the input, so several picks in a row work without re-opening.
 *  - The trigger shows the live query while open and the summary while closed,
 *    so typing is never fighting a value the user did not type.
 */

export interface ComboboxOption {
  value: string
  /** Primary text. */
  label: string
  /** Optional middle column — the model name in the Model Code picker. */
  detail?: string
  /** Optional trailing column — the model-year range. */
  meta?: string
}

export interface ComboboxProps {
  options: ComboboxOption[]
  /** Selected values. Single-select reads only the first. */
  selected: string[]
  onSelect: (value: string) => void
  multiple?: boolean
  disabled?: boolean
  placeholder?: string
  /** Shown in the trigger when closed. Defaults to the selected labels. */
  displayValue?: string
  invalid?: boolean
  /** Replaces the "no options" text — e.g. a loading message. */
  emptyText?: ReactNode
  /**
   * Optional content pinned above the option list, with a hairline divider
   * beneath it. Renders nothing when omitted, so no existing consumer changes.
   *
   * Intended for bulk actions over the selection — the Model Code picker's
   * "Select all" / "Clear selection" pair. The BEHAVIOUR deliberately stays with
   * the caller rather than being built in here: only the caller knows whether
   * "all" means every option or only the ones currently matching the query, and
   * baking one answer into a shared component would impose it on every future
   * consumer.
   *
   * It sits INSIDE the panel, so it appears only while the panel is open and
   * scrolls with it.
   */
  header?: ReactNode
  'aria-labelledby'?: string
  'aria-label'?: string
}

export function Combobox({
  /**
   * ⚠️ RUNTIME DEFAULTS, even though both props are REQUIRED in the type.
   *
   * The types stay required so a real caller still has to supply them — these
   * defaults are not an invitation to omit them. They exist because a missing
   * array here THREW during render (`options.filter` at the trigger's summary),
   * and a throw in render tears down the React tree. That is a wildly
   * disproportionate failure for a prop with an obvious, already-designed empty
   * behaviour: an empty combobox renders its `emptyText` ("No options found").
   *
   * Found by `a11y-sweep.test.tsx`, which renders every barrel export with its
   * default props and had no entry for this one. React caught the throw and
   * logged it, so the suite stayed green while the component failed on every
   * render of that path — the exact thing a passing run can hide.
   *
   * It also matters beyond the sweep: any consumer whose options arrive async
   * has a first render where the array is not there yet.
   */
  options = [],
  selected = [],
  onSelect,
  multiple = false,
  disabled = false,
  placeholder,
  displayValue,
  invalid = false,
  emptyText = 'No options found',
  header,
  'aria-labelledby': labelledBy,
  'aria-label': ariaLabel,
}: ComboboxProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(-1)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => `${o.label} ${o.detail ?? ''}`.toLowerCase().includes(q))
  }, [options, query])

  // A filtered list is a different list; keeping an index into the old one would
  // highlight an unrelated row.
  useEffect(() => setHighlighted(-1), [filtered])

  useEffect(() => () => { if (blurTimer.current) clearTimeout(blurTimer.current) }, [])

  const close = () => {
    if (blurTimer.current) { clearTimeout(blurTimer.current); blurTimer.current = null }
    setOpen(false)
    setQuery('')
    setHighlighted(-1)
  }

  const openPanel = () => {
    if (disabled) return
    setQuery('')
    setOpen(true)
    setHighlighted(-1)
  }

  const pick = (value: string) => {
    onSelect(value)
    // Single-select commits and closes; multi-select stays open for the next pick.
    if (!multiple) close()
  }

  const move = (delta: number) => {
    if (!open || filtered.length === 0) return
    setHighlighted((h) => {
      // From "nothing highlighted", Down goes to the first option and Up to the
      // LAST — the conventional wrap. Feeding -1 through the modulo below would
      // send Up to the second option instead, which reads as a skipped row.
      if (h === -1) return delta > 0 ? 0 : filtered.length - 1
      return (h + delta + filtered.length) % filtered.length
    })
  }

  const shown = open
    ? query
    : displayValue ?? options.filter((o) => selected.includes(o.value)).map((o) => o.label).join(', ')

  const triggerClass = [styles.trigger, open && styles.triggerOpen, invalid && styles.triggerError]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.root}>
      <input
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        aria-controls={open ? `${id}-panel` : undefined}
        aria-activedescendant={open && highlighted >= 0 ? `${id}-opt-${highlighted}` : undefined}
        className={triggerClass}
        placeholder={placeholder}
        disabled={disabled}
        value={shown}
        onFocus={openPanel}
        onClick={openPanel}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlighted(-1) }}
        onBlur={() => { blurTimer.current = setTimeout(close, 150) }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') close()
          else if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
          else if (e.key === 'Enter') {
            e.preventDefault()
            const opt = filtered[highlighted]
            if (opt) pick(opt.value)
          }
        }}
      />
      <Icon icon={ChevronDown} size={16} className={open ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron} />

      {open && (
        <div id={`${id}-panel`} role="listbox" aria-multiselectable={multiple || undefined} className={styles.panel}>
          {/* The header is presentation only and must not join the listbox's
              option set — `role="presentation"` keeps assistive tech from
              counting bulk-action buttons as selectable options. */}
          {header != null && (
            <div className={styles.header} role="presentation">
              {header}
            </div>
          )}
          {filtered.length === 0 ? (
            <div className={styles.status}>{emptyText}</div>
          ) : (
            filtered.map((o, i) => {
              const isSelected = selected.includes(o.value)
              const cls = [styles.option, isSelected && styles.optionSelected, highlighted === i && styles.optionHighlighted]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={o.value}
                  id={`${id}-opt-${i}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={disabled}
                  className={cls}
                  // preventDefault keeps focus on the input, so blur never fires
                  // and a run of multi-select picks works without re-opening.
                  onMouseDown={(e) => { e.preventDefault(); pick(o.value) }}
                >
                  {multiple && (
                    <span className={isSelected ? `${styles.check} ${styles.checkOn}` : styles.check} aria-hidden>
                      {isSelected && <Icon icon={Check} size={11} strokeWidth={3.4} />}
                    </span>
                  )}
                  <ComboboxRow option={o} />
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

/** Option row: label, optional detail, optional trailing meta. */
function ComboboxRow({ option }: { option: ComboboxOption }) {
  if (!option.detail && !option.meta) return <span>{option.label}</span>
  return (
    <>
      <span className={styles.optLabel}>{option.label}</span>
      {option.detail && <span className={styles.optDetail}>{option.detail}</span>}
      {option.meta && <span className={styles.optMeta}>{option.meta}</span>}
    </>
  )
}

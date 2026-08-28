import { useId, useMemo } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { Combobox, Icon, type ComboboxOption } from '@pqms/ui-library'
import { MODEL_CODES, modelYearsFor, type ModelCodeEntry } from '@/data/modelCodes'
import styles from './ModelCodeYearPicker.module.css'

/**
 * Model Code (multi-select combobox) + the "Model year(s) per model code" panel.
 *
 * ─── RESTRUCTURED TO THE PROTOTYPE, VIA THE VUE IMPLEMENTATION ───────────────
 *
 * This was an always-visible checkbox list with a separate search field, and a
 * year area built from generic `Checkbox` + `Button` primitives. It is now the
 * prototype's actual structure, traced through `VehicleInformationForm.vue`:
 *
 *  - The code field is a COMBOBOX. Closed it reads "" / the single code /
 *    "N Model Codes Selected"; focusing opens a filtered panel; picking does not
 *    close it. The list no longer occupies 168px of the form before anyone has
 *    searched for anything.
 *  - The YEAR PANEL APPEARS ONLY ONCE A CODE IS SELECTED, with its own header,
 *    a running "N model codes · N model years selected" summary, and column
 *    headers over a fixed 186px first column.
 *  - Years are CHIPS with inline checkboxes, preceded by an "All" chip and a
 *    divider — not a row of bare checkboxes behind a "Select all" button.
 *
 * ⚠ THIS COMPONENT IS SHARED. Issue Entry (`CreateIssueScreen`) and the Issue
 * Detail edit form both render it, so both change together. That is deliberate
 * and matches the Vue app, where the same component backs both screens — but it
 * is a blast-radius change, and per 00's shared-component rule it is named here
 * rather than left for someone to discover.
 *
 * TWO BEHAVIOURS THAT SURVIVE FROM THE PREVIOUS VERSION, both worth keeping:
 *
 * 1. The year universe for a code is the UNION of its nominal range and the
 *    years actually recorded on the issue, so a stored out-of-range year still
 *    appears (checked) instead of silently vanishing. The Vue version reads the
 *    catalogue only, and would drop it.
 * 2. The per-row remove control. Vue removes a code only by re-opening the
 *    combobox and un-picking it; a direct affordance on the row it applies to is
 *    strictly easier to find, and costs nothing.
 */

export interface ModelCodeSelection {
  /** Selected codes, ordered by the master list. First is the anchor (drives model name). */
  codes: string[]
  /** code → selected years. A code absent from the map means "all of its years". */
  yearsByCode: Record<string, string[]>
}

export function ModelCodeYearPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: ModelCodeSelection
  onChange: (next: ModelCodeSelection) => void
  disabled?: boolean
}) {
  const labelId = useId()
  const { codes, yearsByCode } = value

  const options = useMemo<ComboboxOption[]>(
    () => MODEL_CODES.map((m) => ({ value: m.code, label: m.code, detail: m.name, meta: `MY${m.range}` })),
    [],
  )

  /** Keep codes in master order so the anchor is stable regardless of pick order. */
  const order = (list: string[]) => {
    const idx = new Map(MODEL_CODES.map((m, i) => [m.code, i]))
    return [...new Set(list)].filter((c) => idx.has(c)).sort((a, b) => idx.get(a)! - idx.get(b)!)
  }

  /** Selected years for a code, defaulting to its whole universe. */
  const selectedYears = (entry: ModelCodeEntry) => yearsByCode[entry.code] ?? modelYearsFor(entry.code)

  const toggleCode = (code: string) => {
    const nextYears = { ...yearsByCode }
    let next: string[]
    if (codes.includes(code)) {
      next = codes.filter((c) => c !== code)
      delete nextYears[code]
    } else {
      next = [...codes, code]
      // A newly added code starts fully selected — the prototype's default.
      nextYears[code] = modelYearsFor(code)
    }
    onChange({ codes: order(next), yearsByCode: nextYears })
  }

  const removeRow = (code: string) => {
    const nextYears = { ...yearsByCode }
    delete nextYears[code]
    onChange({ codes: codes.filter((c) => c !== code), yearsByCode: nextYears })
  }

  const toggleYear = (entry: ModelCodeEntry, year: string) => {
    const cur = selectedYears(entry)
    const next = cur.includes(year) ? cur.filter((y) => y !== year) : [...cur, year]
    onChange({ codes, yearsByCode: { ...yearsByCode, [entry.code]: next.sort((a, b) => +a - +b) } })
  }

  /** "All" toggles between fully-selected and empty; it never removes the code. */
  const toggleAllYears = (entry: ModelCodeEntry, universe: string[]) => {
    const cur = selectedYears(entry)
    const all = universe.length > 0 && universe.every((y) => cur.includes(y))
    onChange({ codes, yearsByCode: { ...yearsByCode, [entry.code]: all ? [] : [...universe] } })
  }

  const rows = codes
    .map((code) => MODEL_CODES.find((m) => m.code === code))
    .filter((e): e is ModelCodeEntry => !!e)
    .map((entry) => {
      const sel = selectedYears(entry)
      // Union: nominal range ∪ actually-selected, so a stored out-of-range year shows.
      const universe = [...new Set([...modelYearsFor(entry.code), ...sel])].sort((a, b) => +a - +b)
      return { entry, sel, universe, allSelected: universe.length > 0 && universe.every((y) => sel.includes(y)) }
    })

  const totalYears = rows.reduce((a, r) => a + r.sel.length, 0)

  // Closed-state trigger text: nothing, the single code, or the multi summary.
  const display =
    codes.length === 0 ? '' : codes.length === 1 ? codes[0] : `${codes.length} Model Codes Selected`

  return (
    <div className={styles.stack}>
      {/* The second column is intentionally empty: it holds the first at 50% so
          the trigger's width never changes as codes are picked. */}
      <div className={styles.row}>
        <div className={styles.col}>
          <span id={labelId} className={styles.label}>Model code *</span>
          <Combobox
            options={options}
            selected={codes}
            onSelect={toggleCode}
            multiple
            disabled={disabled}
            displayValue={display}
            aria-labelledby={labelId}
            placeholder={codes.length > 0 ? 'Search to add or remove…' : 'Search model code… (e.g. KA, DL, CV)'}
            emptyText="No matching model code."
          />
        </div>
        <div className={styles.col} aria-hidden />
      </div>

      {rows.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Model year(s) per model code *</span>
            <span className={styles.summary}>
              {rows.length} model code{rows.length === 1 ? '' : 's'} · {totalYears} model year
              {totalYears === 1 ? '' : 's'} selected
            </span>
          </div>

          <div className={styles.colHeads}>
            <div className={styles.colHeadFirst}>Model code</div>
            <div className={styles.colHead}>Model year(s)</div>
          </div>

          {rows.map(({ entry, sel, universe, allSelected }) => (
            <div key={entry.code} className={styles.yearRow}>
              <div className={styles.rowCode}>
                <div className={styles.rowCodeTop}>
                  <span className={styles.code}>{entry.code}</span>
                  {!disabled && (
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => removeRow(entry.code)}
                      aria-label={`Remove model code ${entry.code}`}
                    >
                      <Icon icon={Trash2} size={13} />
                    </button>
                  )}
                </div>
                <div className={styles.rowModel}>{entry.name} · MY{entry.range}</div>
              </div>

              <div className={styles.rowYears}>
                <Chip on={allSelected} disabled={disabled} onClick={() => toggleAllYears(entry, universe)}>
                  All
                </Chip>
                <span className={styles.divider} aria-hidden />
                {universe.map((y) => (
                  <Chip key={y} on={sel.includes(y)} disabled={disabled} onClick={() => toggleYear(entry, y)}>
                    {y}
                  </Chip>
                ))}
                {sel.length === 0 && (
                  <span className={styles.rowError} role="alert">Select at least one model year.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Year / "All" chip — a checkbox and its label in one pressable control. */
function Chip({
  on,
  disabled,
  onClick,
  children,
}: {
  on: boolean
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={on}
      onClick={onClick}
      className={on ? `${styles.chip} ${styles.chipOn}` : styles.chip}
    >
      <span className={on ? `${styles.chipBox} ${styles.chipBoxOn}` : styles.chipBox} aria-hidden>
        {on && <Icon icon={Check} size={11} strokeWidth={3.4} />}
      </span>
      {children}
    </button>
  )
}

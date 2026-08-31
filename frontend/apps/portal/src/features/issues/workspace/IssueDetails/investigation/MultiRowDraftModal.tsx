import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Icon } from '@pqms/ui-library'
import { Modal } from '@/app/chrome'
import styles from './MultiRowDraftModal.module.css'

/**
 * SHARED MULTI-ROW DRAFT MODAL — add several structured rows in one pass.
 *
 * Ported from `MultiRowDraftModal.vue`. Backs BOTH "Add parts manually" and
 * "Add team member", which have identical mechanics and differ only in their
 * columns and copy. The second consumer was known at design time, so extracting
 * the primitive was not speculative in Vue and is not here.
 *
 * ─── WHY THIS EXISTS WHEN `ValuePicker` ALREADY TAKES A MANUAL VALUE ─────────
 *
 * `ValuePicker`'s manual entry takes ONE STRING, once, into the current field.
 * That is enough for a VIN. It is not enough for a part, which needs a quantity,
 * or a team member, who needs a role and a company — and it cannot capture
 * several at a time, which is the normal case for both.
 *
 * The rows also go somewhere different: a value typed into `ValuePicker` is used
 * by this activity and forgotten, while rows submitted here join the shared
 * DIRECTORY and become options for every later activity. That difference is the
 * feature, not an implementation detail.
 *
 * ─── IT CARRIES NO COPY OF ITS OWN ───────────────────────────────────────────
 *
 * Every string is a prop, matching the Vue original's rule: a mechanism
 * component should not own product text. The two wrappers supply theirs.
 */

/**
 * A draft row. `Record<string, string>` rather than a generic parameter for the
 * reason the Vue file gives: the domain row types are plain interfaces with no
 * index signature, and adding one to satisfy this component would weaken them
 * everywhere else. Each wrapper maps back to its own typed row at the boundary.
 */
export type MultiRowDraft = Record<string, string>

export interface MultiRowColumn {
  key: string
  label: string
  placeholder?: string
  /** Grid width for this column. Defaults to an equal share. */
  width?: string
}

type Guard = 'none' | 'empty' | 'incomplete'

export function MultiRowDraftModal({
  open,
  title,
  subtitle,
  columns,
  makeRow,
  addMoreLabel,
  submitLabel,
  counterLabel,
  emptyGuardTitle,
  emptyGuardBody,
  incompleteGuardTitle,
  incompleteGuardBody,
  removeRowLabel,
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  subtitle?: string
  columns: MultiRowColumn[]
  /** A blank row — called for the initial row and every "Add more". */
  makeRow: () => MultiRowDraft
  addMoreLabel: string
  submitLabel: string
  /**
   * Footer counter. The literal token `%n` is replaced with the row count.
   *
   * `%n` rather than `{n}` is carried over from Vue, where `{n}` was vue-i18n's
   * own interpolation syntax and got resolved against an empty param set,
   * rendering a countless "part row(s)". This app has no i18n runtime, so the
   * hazard does not exist here — but keeping the token identical means the two
   * apps' strings stay copy-pasteable.
   */
  counterLabel: string
  /** Shown when submitting with zero rows — warning tone. */
  emptyGuardTitle: string
  emptyGuardBody: string
  /** Shown when any row is incomplete — danger tone. */
  incompleteGuardTitle: string
  incompleteGuardBody: string
  removeRowLabel: string
  onClose: () => void
  onSubmit: (rows: MultiRowDraft[]) => void
}) {
  const [rows, setRows] = useState<MultiRowDraft[]>([])
  const [guard, setGuard] = useState<Guard>('none')
  /** Row indices that failed validation — drives the per-field error borders. */
  const [invalidRows, setInvalidRows] = useState<Set<number>>(new Set())

  /*
   * `makeRow` through a ref, so the reset effect can depend on `open` ALONE and
   * still call the current factory.
   *
   * ⚠️ NOT A SUPPRESSED DEPENDENCY. Depending on `makeRow` directly would reset
   * the form on every parent render for any caller that passes an inline arrow —
   * wiping what the user had typed. Both current wrappers happen to define it at
   * module scope, so it is stable for them, but a component must not be correct
   * only because of how its callers happen to be written today.
   */
  const makeRowRef = useRef(makeRow)
  useEffect(() => {
    makeRowRef.current = makeRow
  })

  /*
   * Reset ON OPEN, not on close. Resetting on close would blank the form while
   * it is still animating away, and a modal reopened after a cancel must start
   * clean rather than showing what was abandoned.
   */
  useEffect(() => {
    if (!open) return
    setRows([makeRowRef.current()])
    setGuard('none')
    setInvalidRows(new Set())
  }, [open])

  if (!open) return null

  const isRowComplete = (row: MultiRowDraft) =>
    columns.every((c) => String(row[c.key] ?? '').trim().length > 0)

  const fieldInvalid = (index: number, key: string) =>
    invalidRows.has(index) && String(rows[index]?.[key] ?? '').trim() === ''

  const setField = (index: number, key: string, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)))
    // Clear the guard the moment the user starts fixing it — a red banner over a
    // form they have already corrected reads as broken.
    if (guard !== 'none') {
      setGuard('none')
      setInvalidRows(new Set())
    }
  }

  /**
   * ⚠️ THE LAST ROW CANNOT BE REMOVED, and the check is HERE rather than only on
   * the button's `disabled`. Enforcing it in the handler means a programmatic
   * call cannot empty the form into a state the submit guards then have to
   * catch. Vue's original makes the same point.
   */
  const removeRow = (index: number) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((_, i) => i !== index))
    setInvalidRows(new Set())
    setGuard('none')
  }

  const submit = () => {
    if (rows.length === 0) {
      setGuard('empty')
      return
    }
    const invalid = new Set<number>()
    rows.forEach((row, i) => {
      if (!isRowComplete(row)) invalid.add(i)
    })
    if (invalid.size > 0) {
      setInvalidRows(invalid)
      setGuard('incomplete')
      return
    }
    onSubmit(rows.slice())
    onClose()
  }

  // Columns share the width, with a fixed trailing cell for the remove button.
  const gridTemplate = `${columns.map((c) => c.width ?? '1fr').join(' ')} var(--control-md)`

  return (
    <Modal
      open
      onClose={onClose}
      width={620}
      align="center"
      title={
        <div>
          <div>{title}</div>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      }
      footer={
        <>
          <span className={styles.counter}>{counterLabel.replace('%n', String(rows.length))}</span>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} data-testid="multi-row-submit">
            {submitLabel}
          </Button>
        </>
      }
    >
      <div data-testid="multi-row-draft-modal">
        {guard === 'empty' && (
          <div className={`${styles.guard} ${styles.guardWarning}`} role="alert" data-testid="multi-row-guard-empty">
            <span className={styles.guardTitle}>{emptyGuardTitle}</span>
            <span className={styles.guardBody}>{emptyGuardBody}</span>
          </div>
        )}
        {guard === 'incomplete' && (
          <div className={`${styles.guard} ${styles.guardDanger}`} role="alert" data-testid="multi-row-guard-incomplete">
            <span className={styles.guardTitle}>{incompleteGuardTitle}</span>
            <span className={styles.guardBody}>{incompleteGuardBody}</span>
          </div>
        )}

        <div className={styles.headRow} style={{ gridTemplateColumns: gridTemplate }}>
          {columns.map((c) => (
            <span key={c.key} className={styles.head}>
              {c.label}
            </span>
          ))}
          {/* Spacer above the remove column — a header here would label a control. */}
          <span aria-hidden />
        </div>

        <div className={styles.rows}>
          {rows.map((row, index) => (
            <div key={index} className={styles.row} style={{ gridTemplateColumns: gridTemplate }}>
              {columns.map((c) => (
                <input
                  key={c.key}
                  className={fieldInvalid(index, c.key) ? `${styles.input} ${styles.inputInvalid}` : styles.input}
                  value={row[c.key] ?? ''}
                  placeholder={c.placeholder}
                  aria-label={`${c.label} ${index + 1}`}
                  aria-invalid={fieldInvalid(index, c.key)}
                  onChange={(e) => setField(index, c.key, e.target.value)}
                />
              ))}
              <button
                type="button"
                className={styles.remove}
                disabled={rows.length <= 1}
                aria-label={`${removeRowLabel} ${index + 1}`}
                onClick={() => removeRow(index)}
              >
                <Icon icon={Trash2} size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.addRow}>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<Icon icon={Plus} size={14} />}
            data-testid="multi-row-add"
            onClick={() => {
              setRows((prev) => [...prev, makeRowRef.current()])
              setGuard('none')
            }}
          >
            {addMoreLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { justificationError } from '@/data/linkJustification'

/**
 * Per-change justifications for a draft/commit link editor.
 *
 * ─── THE THREE-STATE LIFECYCLE, FROM THE PROTOTYPE ───────────────────────────
 *
 * The canonical holds `mr = { unlink: {id: {...}}, links: [{...}] }`, each entry
 * carrying its own `text`, `err`, `editing` and `applied`. A change moves:
 *
 *   pending  (toggled, no reason yet)  → editing
 *   applied  (reason accepted)         → applied: true
 *   committed                          → on Save, and ONLY applied ones
 *
 * `saveSameModal()` states the audit consequence outright: "each change gets its
 * own audit entry". So this is keyed per change, never one reason for a batch.
 *
 * ─── ⚠️ A WITHDRAWN CHANGE DISCARDS ITS JUSTIFICATION ────────────────────────
 *
 * THIS ANSWER IS OURS, NOT THE DESIGN'S. The prototype's list is not a checkbox
 * list, so it has no "untoggle" and never had to answer what happens to the
 * reason when a pending change is taken back.
 *
 * The choice: withdrawing a change DELETES its justification, so re-toggling
 * starts blank. The alternative — remembering it — would let a reason typed for
 * "unlink CL-260022", withdrawn, then re-applied after the user changed their
 * mind about WHY, commit silently against the new decision with the old text. An
 * audit trail that records a reason the user no longer holds is worse than one
 * that asks again. Re-typing is a small cost; a wrong recorded reason is not.
 *
 * Pruning is driven by `changedIds`: anything no longer a change is dropped.
 */
export interface PendingReason {
  text: string
  err: string
  applied: boolean
}

export function usePendingJustifications(changedIds: string[]) {
  const [reasons, setReasons] = useState<Record<string, PendingReason>>({})

  /*
   * The change set as a STABLE STRING, because `changedIds` is a fresh array on
   * every render and depending on it directly would re-run this forever.
   *
   * ⚠️ THE IDS ARE READ BACK OUT OF `key` INSIDE THE EFFECT, rather than closing
   * over `changedIds`. That is what makes the dependency list honest: the effect
   * uses nothing but `key`, so there is no stale closure and no need for an
   * `eslint-disable` to silence one. The first version of this did close over
   * `changedIds` and carried a disable comment for `react-hooks/exhaustive-deps`
   * — which the adherence ESLint config does not load, making the comment itself
   * an ERROR that poisoned all four ds-gate families, since a ceiling cannot be
   * trusted from a failed lint run. Suppressing the warning was the wrong move
   * twice over; not needing it is the fix.
   */
  const key = changedIds.slice().sort().join('|')
  useEffect(() => {
    const ids = key ? key.split('|') : []
    // Drop entries for changes that no longer exist, and seed new ones.
    setReasons((prev) => {
      const next: Record<string, PendingReason> = {}
      for (const id of ids) next[id] = prev[id] ?? { text: '', err: '', applied: false }
      return next
    })
  }, [key])

  const setText = useCallback((id: string, text: string) => {
    setReasons((r) => ({ ...r, [id]: { text, err: '', applied: r[id]?.applied ?? false } }))
  }, [])

  /** Validates on Apply and writes the error rather than silently refusing. */
  const apply = useCallback((id: string) => {
    setReasons((r) => {
      const row = r[id]
      if (!row) return r
      const err = justificationError(row.text)
      return { ...r, [id]: err ? { ...row, err, applied: false } : { ...row, err: '', applied: true } }
    })
  }, [])

  /** Reopens an applied row for editing without losing what it says. */
  const edit = useCallback((id: string) => {
    setReasons((r) => (r[id] ? { ...r, [id]: { ...r[id], applied: false } } : r))
  }, [])

  const reset = useCallback(() => setReasons({}), [])

  /** Save is only offered once EVERY pending change carries an accepted reason. */
  const allApplied = changedIds.length > 0 && changedIds.every((id) => reasons[id]?.applied)

  /** The reason to record for a change, trimmed as the audit will store it. */
  const reasonFor = useCallback((id: string) => (reasons[id]?.text ?? '').trim(), [reasons])

  return { reasons, setText, apply, edit, reset, allApplied, reasonFor }
}

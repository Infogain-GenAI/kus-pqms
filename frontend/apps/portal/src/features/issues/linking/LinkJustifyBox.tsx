import { useTranslation } from 'react-i18next'
import { Button } from '@pqms/ui-library'
import {
  JUSTIFICATION_MAX,
  clampJustification,
  justificationCounterVerbose,
  justificationError,
} from '@/data/linkJustification'
import { NS } from './LinkJustify.i18n'
import styles from './LinkJustifyBox.module.css'

/**
 * The inline justification a pending link or unlink must carry before it commits.
 *
 * ─── INLINE, NOT A MODAL — AND THAT IS THE DESIGN'S CHOICE ───────────────────
 *
 * The canonical puts this in the row itself: `mlLink(ws)` pushes a pending entry
 * `{text:'', err:'', applied:false, editing:true}` and notifies "Add a
 * justification and Apply to confirm <ID> as a pending link". `mrApplyUnlink`
 * does the same for the other direction. So each change is justified where it
 * sits, and a batch of five edits is five inline boxes rather than five modals.
 *
 * ─── SHARED BY THREE SURFACES, AND DELIBERATELY NOT BY ISSUE ENTRY ───────────
 *
 * Manage Links, the issue-list modal and the edit form all present this the same
 * way, so they share it. ISSUE ENTRY DOES NOT: there the justification is a
 * confirmation MODAL before a draft link commits, which is a different control at
 * a different moment. It shares the RULE (`@/data/linkJustification`) and nothing
 * else. Forcing one component to be both shapes is what this split avoids.
 *
 * ⚠️ THE COUNTER IS THE VERBOSE FORM ON PURPOSE. `N / 500 characters` here,
 * `N/500` on Issue Entry. Both are the design's own, consistent within each
 * surface; see the note in `@/data/linkJustification`. Do not unify them.
 */
export function LinkJustifyBox({
  text,
  error,
  onText,
  onApply,
  onCancel,
  /** Overrides the default "Apply" where a surface names the action. */
  applyLabel,
  label,
  inputLabel,
}: {
  text: string
  error: string
  onText: (next: string) => void
  onApply: () => void
  onCancel: () => void
  applyLabel?: string
  /** Names what is being justified, e.g. "Justification for unlinking CL-260022". */
  label: string
  /** The accessible name for the textarea — unique per row, so tests can target it. */
  inputLabel: string
}) {
  const { t } = useTranslation(NS)
  return (
    <div className={styles.root}>
      <span className={styles.label}>{label}</span>
      <textarea
        className={error ? styles.boxError : styles.box}
        aria-label={inputLabel}
        value={text}
        maxLength={JUSTIFICATION_MAX}
        rows={3}
        placeholder={t('boxPlaceholder')}
        onChange={(e) => onText(clampJustification(e.target.value))}
      />
      <div className={styles.foot}>
        {error ? <span className={styles.error}>{error}</span> : <span />}
        <span className={styles.counter}>{justificationCounterVerbose(text)}</span>
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onCancel}>{t('cancel')}</Button>
        {/*
          NOT DISABLED, deliberately — unlike Issue Entry's confirm button.
          The design's `mrApplyUnlink` lets Apply be pressed and then WRITES the
          error, which is how the user learns the threshold exists. A disabled
          button with no message leaves them guessing why nothing happens.
        */}
        <Button size="sm" onClick={onApply}>{applyLabel ?? t('apply')}</Button>
      </div>
    </div>
  )
}

/**
 * Validate on Apply, returning the error to show or `null` to proceed.
 *
 * Exists so all three surfaces produce the SAME message from the SAME predicate;
 * each one holds its own state, which is why this is a function and not a hook.
 */
export const applyJustification = (text: string): string | null => justificationError(text)

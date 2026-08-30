import { ArrowLeft, ArrowRight, Check, TriangleAlert } from 'lucide-react'
import { Button, Icon } from '@pqms/ui-library'
import { Modal } from '@/app/chrome'
import { useTranslation } from 'react-i18next'
import { NS } from './IssueEntry.i18n'
import type { FieldError } from './validation'
import styles from './issue-entry.module.css'

/**
 * Confirm before clearing the form.
 *
 * Ported from `ClearFormConfirmModal.vue`.
 *
 * WHY THIS EXISTS: Clear was immediate and unguarded. It resets three sections
 * and every linked issue, there is no undo, and the button sits directly beside
 * Register Issue — the one control a user is reaching for when the form is at
 * its most complete. A misclick cost everything typed.
 *
 * The body names exactly what is lost rather than asking a generic "are you
 * sure?", because the question a user actually has is how much work this
 * destroys.
 */
export function ClearFormConfirmModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const { t } = useTranslation(NS)
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Clear all entered information?"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{t('clearFormCancel')}</Button>
          <Button onClick={() => { onConfirm(); onClose() }}>{t('clearFormConfirm')}</Button>
        </>
      }
    >
      <p className={styles.successBody}>
        {t('clearFormBody')}
      </p>
    </Modal>
  )
}

/**
 * The success modal shown after an issue is registered.
 *
 * Ported from `SubmitConfirmationModal.vue`.
 *
 * ─── IT REPLACES AN IMMEDIATE REDIRECT, AND THAT IS THE POINT ────────────────
 *
 * Registering used to navigate straight to the new issue's workspace. The user
 * never saw the ID that was minted, and never got the choice of what to do next
 * — which matters because the two next steps are genuinely different jobs:
 * carry on with THIS issue, or go back and log the next one. A redirect picks
 * one silently, and picks the wrong one for anyone entering a batch.
 *
 * So it confirms with the record — ID, title, status — and offers both. Neither
 * button is styled as the default, because neither is.
 *
 * It cannot be dismissed by backdrop or Escape: the issue is already created, so
 * there is no "cancel" here, only a choice of where to go. Closing it to nothing
 * would leave the user on a stale form for an issue that already exists.
 */
export function SubmitConfirmationModal({
  open,
  issueId,
  issueTitle,
  onBackToList,
  onOpenWorkspace,
}: {
  open: boolean
  issueId: string
  issueTitle: string
  onBackToList: () => void
  onOpenWorkspace: () => void
}) {
  const { t } = useTranslation(NS)
  return (
    <Modal
      open={open}
      // Both actions navigate away, so there is no dismissal path that leaves
      // the user somewhere sensible — this deliberately does nothing.
      onClose={() => {}}
      align="center"
      width={440}
      title={<span className={styles.successTitle}>{t('submittedTitle')}</span>}
    >
      <div className={styles.success}>
        <span className={styles.successDisc} aria-hidden>
          <Icon icon={Check} size={30} />
        </span>
        <p className={styles.successBody}>
          {t('submittedBody')}
        </p>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t('submittedIssueId')}</span>
            <span className={styles.summaryId} data-testid="created-issue-id">{issueId}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t('submittedIssueTitle')}</span>
            <span className={styles.summaryTitle} title={issueTitle}>{issueTitle}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t('submittedStatus')}</span>
            {/* Fixed copy, not derived from the record: immediately after a
                successful create there is no other state this could be. */}
            <span className={styles.statusPill}>
              <span className={styles.statusDot} aria-hidden />
              {t('submittedStatusValue')}
            </span>
          </div>
        </div>

        <div className={styles.successActions}>
          <Button variant="secondary" iconLeft={<Icon icon={ArrowLeft} size={16} />} onClick={onBackToList}>
            {t('submittedBackToList')}
          </Button>
          <Button iconRight={<Icon icon={ArrowRight} size={16} />} onClick={onOpenWorkspace}>
            {t('submittedOpenWorkspace')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/**
 * The submit-blocked banner. Lists every outstanding requirement at once.
 *
 * A form this long must not be fixed one round-trip at a time: showing only the
 * first problem means submitting four times to discover four fields. The
 * per-field messages still render at their controls — this is the summary that
 * makes the total visible from wherever the user happens to be scrolled.
 */
export function ValidationBanner({ errors }: { errors: FieldError[] }) {
  const { t } = useTranslation(NS)
  if (errors.length === 0) return null
  return (
    <div className={styles.banner} role="alert" data-testid="issue-entry-validation">
      <Icon icon={TriangleAlert} size={16} className={styles.bannerIcon} />
      <div>
        <p className={styles.bannerTitle}>
          {t('validationBanner', { count: errors.length })}
        </p>
        <ul className={styles.bannerList}>
          {errors.map((e) => (
            <li key={e.fieldKey}>{e.message}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

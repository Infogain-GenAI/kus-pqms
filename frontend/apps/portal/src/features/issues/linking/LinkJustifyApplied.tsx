import { useTranslation } from 'react-i18next'
import { Button } from '@pqms/ui-library'
import { NS } from './LinkJustify.i18n'
import styles from './LinkJustifyBox.module.css'

/**
 * A pending change whose justification has been accepted.
 *
 * Replaces two hand-copied versions of this row — one in `workspace/modals.tsx`
 * and one in `LinkedIssuesModal.tsx`, with the same markup, the same tint and the
 * same words under two different key sets. Extracting it was the fix; adding a
 * second set of keys would have been the mistake.
 *
 * Reopening for edit keeps the text, unlike WITHDRAWING the change, which
 * discards it — see `usePendingJustifications` for why those differ.
 */
export function LinkJustifyApplied({
  kind,
  text,
  onEdit,
}: {
  kind: 'link' | 'unlink'
  text: string
  onEdit: () => void
}) {
  const { t } = useTranslation(NS)
  return (
    <div className={styles.applied}>
      <span className={styles.appliedText}>
        <strong className={styles.appliedLabel}>{kind === 'unlink' ? t('appliedUnlink') : t('appliedLink')}</strong>{' '}
        {text.trim()}
      </span>
      <Button variant="ghost" size="sm" onClick={onEdit}>{t('edit')}</Button>
    </div>
  )
}

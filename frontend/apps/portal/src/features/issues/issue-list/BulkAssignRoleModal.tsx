import { UserRoundCog } from 'lucide-react'
import { Button } from '@pqms/ui-library'
import { IconChip, Modal } from '@/app/chrome'
import { Trans, useTranslation } from 'react-i18next'
import { ASSIGNABLE_ROLES, type AssignableRole } from '@/data/assignableRoles'
import { NS } from './IssueListScreen.i18n'

/**
 * Bulk assign-role modal.
 *
 * ─── A MODAL, WHERE THE DESIGN USES A MENU — AND THAT IS DELIBERATE ──────────
 *
 * The canonical hangs role options straight off the bulk bar (`bulkMenu`), so a
 * single click both picks the role and commits. This asks first, for the reason
 * every other bulk affordance here asks: it writes to every selected issue at
 * once, and a menu that commits on click gives no moment to notice the count is
 * 40 rather than the 4 you meant. The count is restated in the body precisely so
 * that moment exists.
 *
 * ─── FIVE ROLES, NOT THREE ──────────────────────────────────────────────────
 *
 * The options come from `ASSIGNABLE_ROLES`, which is the canonical's own set.
 * The previous version of this feature offered three, because it typed the role
 * as `RoleKey` — the SESSION vocabulary — and so could only ever offer the
 * session roles minus ADMIN. See `data/assignableRoles.ts`.
 *
 * ⚠️ REBUILT AFTER A MERGE DELETED IT. The feature, its store function, its i18n
 * and its tests were lost when main's Issue List rewrite won at the old file's
 * path. It is rebuilt into main's shape rather than reverted, and the two
 * divergences above are corrections made on the way back in, not restorations of
 * what we had.
 */
export interface BulkAssignRoleModalProps {
  open: boolean
  onClose: () => void
  count: number
  onAssign: (role: AssignableRole) => void
}

export function BulkAssignRoleModal({ open, onClose, count, onAssign }: BulkAssignRoleModalProps) {
  const { t } = useTranslation(NS)
  if (!open) return null
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={520}
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <IconChip icon={UserRoundCog} tint="var(--accent-50)" color="var(--accent-700)" size={40} iconSize={18} />
          {t('assignRoleTitle')}
        </span>
      }
      footer={<Button variant="ghost" onClick={onClose}>{t('assignRoleCancel')}</Button>}
    >
      <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>
        <Trans t={t} i18nKey="assignRoleBody" count={count} components={{ b: <b style={{ color: 'var(--text-primary)' }} /> }} />
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {ASSIGNABLE_ROLES.map((r) => (
          /*
           * The CODE is the button's label and the full title is its accessible
           * name. The bar is narrow and five full titles will not sit in a row,
           * but "ASM" alone is not a name a screen reader can act on.
           */
          <Button key={r.code} variant="secondary" aria-label={r.label} onClick={() => onAssign(r.code)}>
            {r.code}
          </Button>
        ))}
      </div>
    </Modal>
  )
}

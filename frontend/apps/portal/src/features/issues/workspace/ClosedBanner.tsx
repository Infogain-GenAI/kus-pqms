import { Lock } from 'lucide-react'
import { Icon } from '@pqms/ui-library'
import { CLOSED_NOTES } from '@/data/issueLock'
import styles from './ClosedBanner.module.css'

/**
 * States the Closed-issue lock once, for the whole workspace.
 *
 * ─── WHY A BANNER AT ALL ─────────────────────────────────────────────────────
 *
 * The lock disables controls across five sections. Without one statement of the
 * rule, a user meets it as a series of unexplained greyed-out buttons and has to
 * infer the cause — and the inference they usually reach is "I don't have
 * permission", which is wrong and sends them to ask for access they already
 * have. Naming the reason once, up front, is what turns scattered disabled
 * controls into a coherent read-only mode.
 *
 * It also carries the explanation this app would otherwise lose by disabling the
 * Change-status trigger, which used to be the only route to the status modal's
 * own terminal message.
 *
 * ─── IT LIVES IN THE SHELL, ABOVE THE OUTLET ─────────────────────────────────
 *
 * Same reason `ApprovalBanner` does: Closed is a fact about the ISSUE, not about
 * any one section, so it must be visible whichever section is routed. Pushing it
 * into the sections would mean rendering it five times and forgetting it in the
 * sixth.
 *
 * Both banners can be on screen together — an issue can be Closed while a
 * proposal it raised earlier is still pending a decision — so this does not
 * replace the approval banner or sit in an `else` branch of it.
 */
export function ClosedBanner() {
  return (
    <div className={styles.banner} role="status" data-testid="closed-banner">
      <Icon icon={Lock} size={16} className={styles.icon} />
      {/* Rendered FROM the constant, not retyped beside it. A second copy of the
          sentence here is the same class of drift the lock itself exists to
          stop, one level down: the note and the rule would be free to disagree. */}
      <p className={styles.text}>{CLOSED_NOTES.workspace}</p>
    </div>
  )
}

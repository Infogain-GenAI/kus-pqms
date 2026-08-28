import type { ReactNode } from 'react'
import { activityTint, type ActivityType } from '@/data/investigation'
import styles from './investigation.module.css'

/**
 * The three one-element pieces the Investigation sub-area repeats: the field
 * label, the activity-type badge, and the validation banner.
 *
 * Grouped in one module rather than three files because each is a single
 * element with no state — a file apiece would be more navigation than the
 * contents justify, and the sub-area's own folder is already the boundary that
 * says where they belong.
 */

/**
 * Uppercase micro-label. Ported from Vue's `InvestigationFieldLabel.vue`.
 *
 * Not `ULabel`: this one carries a required asterisk and an "— optional" suffix
 * in a lighter weight, and every field on both Investigation forms uses one
 * treatment across four different control types — a select, a text input, a
 * textarea and the pickers, none of which agree on their own built-in labels.
 */
export function FieldLabel({ text, required, optional }: { text: string; required?: boolean; optional?: string }) {
  return (
    <span className={styles.fieldLabel}>
      {text}
      {required && <span className={styles.req} aria-hidden> *</span>}
      {optional && <span className={styles.optional}>{optional}</span>}
    </span>
  )
}

/**
 * Activity-type badge with a per-type tint. Ported from `ActivityTypeBadge.vue`.
 *
 * Portal-local rather than a `ui-library` `Badge` variant, for the reason the
 * Vue file gives: that component's tone vocabulary is a STATUS vocabulary
 * (draft/open/review/…), and activity types are Issue-domain business data.
 * Widening a union every status render in the product reads, to carry one
 * screen's colours, is the wrong blast radius.
 *
 * The tint always resolves — `activityTint()` falls back rather than indexing a
 * map that cannot be total, because a requested type will occur in production.
 */
export function ActivityTypeBadge({ type }: { type: ActivityType }) {
  return (
    <span className={styles.badge} data-tint={activityTint(type)} data-testid="activity-type-badge">
      {type}
    </span>
  )
}

/** Save-blocked banner: a title and a body, matching the prototype's two lines. */
export function ValidationBanner({ title, body }: { title: string; body: string }) {
  return (
    <p className={styles.validation} role="alert">
      <strong>{title}</strong>
      <span>{body}</span>
    </p>
  )
}

/** Rail/column heading. */
export function PanelHeading({ children }: { children: ReactNode }) {
  return <h3 className={styles.heading}>{children}</h3>
}

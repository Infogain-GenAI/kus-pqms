import { CircleDot, Info, OctagonAlert, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { NotificationCategory } from './types'

/**
 * NOTIFICATION CATEGORY TAXONOMY — the single source for a category's label
 * colour and glyph.
 *
 * Ported from `config/notification-categories.config.ts`, which calls itself
 * "the SINGLE source of truth for category label, color, and icon". It was not
 * single here: this map lived inside `AppHeader.tsx`, so the Notifications page
 * could not reach it and grew its own parallel mapping onto `Badge` tones. Two
 * maps over one taxonomy is how a category ends up red in one place and amber in
 * the other.
 *
 * ─── MEANING IS CARRIED BY THE LABEL, NEVER BY COLOUR ALONE ──────────────────
 *
 * Vue's config states this as a hard rule and it is honoured here: every surface
 * that renders a category renders its NAME, with the colour as a secondary cue.
 * Colour-only encoding fails for the users most likely to be triaging a Critical
 * notification under time pressure.
 *
 * ─── THIS APP HAS A FOURTH CATEGORY ──────────────────────────────────────────
 *
 * Vue's fixed set is Critical / Action Required / Warning. This app's taxonomy
 * comes from the V4-V5 prototype and adds `Information`, which is why the
 * vocabulary is NOT copied across wholesale — the type stays this app's own and
 * only the shape of the config is borrowed.
 */
/** `Badge`'s tone vocabulary, as used by the Notifications page. */
export type NotificationBadgeTone = 'accent' | 'warning' | 'danger' | 'neutral' | 'success' | 'info'

export interface NotificationCategoryMeta {
  /** The one hue for this category — icon, eyebrow and left rail. */
  color: string
  /** Soft background tint behind the icon. */
  tint: string
  icon: LucideIcon
  /**
   * The `Badge` tone the Notifications page renders this category as.
   *
   * IT LIVES HERE RATHER THAN ON THE PAGE because the page had its own
   * `CATEGORY_TONE` map — a second table over the same four categories, free to
   * drift from the colours above. Both surfaces now read one record per
   * category, so a new category is added in one place or not at all.
   *
   * It stays a TONE NAME, not a colour: `Badge` owns how a tone renders, and
   * handing it a raw hue from `color` would bypass its own light/dark and
   * contrast rules. This is the same taxonomy expressed in the vocabulary each
   * consumer actually speaks.
   */
  tone: NotificationBadgeTone
}

/**
 * Token-bound where the hex matches a token exactly; the Information tint
 * `#E2F4F2` has no token equivalent. Carried over verbatim from `AppHeader`, so
 * nothing about the header's appearance changed when it moved here.
 */
export const NOTIFICATION_CATEGORIES: Record<NotificationCategory, NotificationCategoryMeta> = {
  Critical: { color: 'var(--danger-500)', tint: 'var(--danger-50)', icon: OctagonAlert, tone: 'danger' },
  Warning: { color: 'var(--warning-500)', tint: 'var(--warning-50)', icon: TriangleAlert, tone: 'warning' },
  'Action Required': { color: 'var(--info-500)', tint: 'var(--info-50)', icon: CircleDot, tone: 'info' },
  Information: { color: 'var(--status-disposed)', tint: '#E2F4F2', icon: Info, tone: 'success' },
}

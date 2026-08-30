import type { AppNotification } from './types'

/**
 * WHERE A NOTIFICATION SENDS THE USER — one function, both surfaces.
 *
 * Ported from `composables/useNotificationNavigation.ts` in the Vue app, whose
 * own header comment states the reason it exists: so the header dropdown and the
 * full Notifications page "can never diverge on where a notification sends the
 * user".
 *
 * ─── THEY HAD ALREADY DIVERGED HERE, IN THE WAY THAT MATTERS ─────────────────
 *
 * Both surfaces carried their own copy of the click handler, and both said the
 * same thing: `if (n.recordId) nav('/issues/' + n.recordId)`. Identical, and
 * both wrong in the same way — every notification was assumed to point at an
 * issue. The moment a QIR notification exists, both send the user to
 * `/issues/QIR-…`, which is a Not Found page. Two copies of a rule do not have
 * to disagree with each other to be a problem; they only have to be wrong
 * together and get fixed one at a time.
 *
 * ─── PURE, AND SEPARATE FROM THE HOOK ────────────────────────────────────────
 *
 * This resolves a destination and does nothing else — no navigation, no
 * mark-read, no router. That is what makes the routing table testable as a
 * table, without a render and without a memory router. The side effects live in
 * `features/notifications/useNotificationNavigation.ts`, which is the only thing
 * either surface calls.
 */

/**
 * The path a notification opens, or `null` when it opens nothing.
 *
 * NULL IS A LEGITIMATE ANSWER AND CALLERS MUST HANDLE IT. A row with no record,
 * or with a record whose type we cannot name, has no destination — Vue's
 * composable returns early in exactly these cases. Marking such a row read is
 * still useful; sending the user somewhere invented is not.
 */
export function notificationTarget(n: Pick<AppNotification, 'recordId' | 'recordType'>): string | null {
  if (!n.recordId || !n.recordType) return null

  switch (n.recordType) {
    /*
     * Deep-links to the issue's canonical URL. `/issues/:id` redirects to
     * `/issues/:id/detail`, so this lands on the Detail section — deliberately
     * the same place the Issue List's own row click lands, so arriving from a
     * notification and arriving from the list are the same experience.
     */
    case 'issue':
      return `/issues/${n.recordId}`

    /*
     * QIR Management, NOT a per-QIR route — there is no `/qir/:id` in this app,
     * and Vue's composable makes the same choice for the same reason (it pushes
     * the `qir-management` route by name, ignoring the record id). Landing on
     * the list the QIR is in is a real destination; a route that does not exist
     * is a 404 dressed up as a feature.
     */
    case 'qir':
      return '/qir'

    /*
     * Unreachable while `NotificationRecordType` has two members, and kept so
     * that adding a third is a COMPILE ERROR here rather than a silent fall
     * through that nobody notices until a user reports a dead notification.
     *
     * ⚠️ IT RETURNS NULL, NOT THE VALUE. An earlier version returned the
     * `never`-typed binding, which types fine and is wrong at runtime: a record
     * type TypeScript never knew about — one from an API response, or a value
     * that outlived a rename — would have been handed back AS THE PATH, sending
     * the router to `/tsb-thing` or worse. Types do not hold at the edge of the
     * program, and this is the edge.
     */
    default: {
      const exhaustive: never = n.recordType
      void exhaustive
      return null
    }
  }
}

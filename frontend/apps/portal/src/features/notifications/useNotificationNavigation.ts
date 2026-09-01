import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { notificationTarget } from '@/data/notifications'
import { useStore } from '@/data/store'
import type { AppNotification } from '@/data/types'

/**
 * What happens when a notification row is clicked — the ONE implementation the
 * header dropdown and the Notifications page both call.
 *
 * Ported from `composables/useNotificationNavigation.ts`.
 *
 * ─── MARK READ FIRST, NAVIGATE SECOND, AND MARK READ REGARDLESS ──────────────
 *
 * The order is not incidental. A row with no destination is still a row the user
 * has now seen, so it is marked read and nothing else happens; Vue returns early
 * at exactly this point for exactly this reason. Marking read only on rows that
 * happen to navigate would leave undeliverable notifications stuck in the unread
 * badge forever, with no way for a user to clear them but "Mark all read".
 *
 * ─── WHY A HOOK RATHER THAN A PROP PASSED DOWN FROM EACH SURFACE ─────────────
 *
 * Because a prop is a thing a surface can forget to pass, or pass a slightly
 * different version of — which is the state this code was already in, with two
 * copies of the handler that were identical and identically wrong. A hook the
 * row's owner calls has no such seam.
 */
export function useNotificationNavigation(): {
  selectNotification: (n: AppNotification) => void
} {
  const nav = useNavigate()
  const { markRead } = useStore()

  const selectNotification = useCallback(
    (n: AppNotification) => {
      markRead(n.id)

      // No determinable destination — see `notificationTarget`. Read, but going
      // nowhere, is the correct outcome, not a bug to paper over with a guess.
      const target = notificationTarget(n)
      if (target) nav(target)
    },
    [markRead, nav],
  )

  return { selectNotification }
}

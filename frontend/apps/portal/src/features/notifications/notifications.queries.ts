import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@/services'
import { isFixtureMode } from '@/config/data-source'
import { queryKeys } from '@/shared/query/keys'
import type { NotificationQuery } from '@/api/notifications'

/**
 * NOTIFICATION QUERY HOOKS.
 *
 * `04-state-management.md` classifies notifications as server state — *"Server
 * data cache, unambiguously… **This is not a Zustand store.**"* — and hands the
 * configuration to 05. This file is the second half of that.
 *
 * ⚠️ PAGE SIZES ARE 04's, AND THEY ARE NOT WHAT THE APP USES TODAY. 04 requires
 * **6** for the header dropdown and **50** for the full-page list; the current
 * panel passes 5 and the full feed passes no limit at all. The constants below
 * are 04's values, exported so the screens adopt them when they move onto these
 * hooks — changing the screens is not this step's job, so the divergence is live
 * until then and is flagged here rather than left to be noticed.
 */

/** 04: the header dropdown shows six. */
export const NOTIFICATION_DROPDOWN_PAGE_SIZE = 6

/** 04: the full-page list shows fifty. */
export const NOTIFICATION_PAGE_SIZE = 50

/**
 * The notifications list and unread count.
 *
 * ⚠️ THE POLLING CONFIGURATION BELOW IS SPECIFIED LINE BY LINE IN 05 AND EACH
 * LINE HAS A NAMED FAILURE BEHIND IT. Do not tune these without reading 05's
 * "Polling: the notifications query".
 */
export function useNotifications(query: NotificationQuery = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.list(query),
    queryFn: () => notifications.list(query),

    /* 05: a 60-second poll. 04 owns the cadence as a product decision. */
    refetchInterval: 60_000,

    /*
     * ⚠️ `refetchIntervalInBackground` IS ABSENT ON PURPOSE — DO NOT ADD IT.
     * 05: *"Leave it at its default (`false`). This is what gives you
     * focus-based pausing: polling stops when the tab is not focused and
     * resumes when it is. Do not set it to `true`, and do not hand-roll the
     * pausing."* Writing `refetchIntervalInBackground: false` explicitly would
     * be harmless today but reads as a setting someone chose and may flip;
     * omitting it is the standard's instruction taken literally.
     *
     * Provenance for why this is spelled out: `kus-pqms` hand-rolled a
     * `setInterval` that never stopped and skipped the network call via a
     * `document.hidden` check each tick. This one line replaces that.
     */

    /*
     * ⚠️ NOTE THE PARENTHESES. 05: *"**Call the predicate**: `!isFixtureMode`
     * without parens evaluates a function reference, which is always truthy,
     * permanently disabling the query in every mode with no error and no
     * network call."* The bug is invisible — the screen simply never loads and
     * nothing is logged.
     */
    enabled: !isFixtureMode(),
  })
}

/**
 * Mark one notification read.
 *
 * ⚠️ OPTIMISTIC, per 04 (*"mark one read, mark all read — the last two
 * optimistic"*). The full cancel/snapshot/rollback shape is required rather than
 * decorative: without `cancelQueries`, an in-flight poll started before the
 * click can land AFTER the optimistic write and overwrite it with the stale
 * unread row, so the badge flicks back. Without the snapshot there is nothing to
 * restore when the write fails, and the user is left looking at a read state the
 * server never accepted.
 */
export function useMarkNotificationRead() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notifications.markRead(id),

    async onMutate(id) {
      const key = queryKeys.notifications.all()
      await client.cancelQueries({ queryKey: key })
      const previous = client.getQueriesData({ queryKey: key })

      client.setQueriesData<Awaited<ReturnType<typeof notifications.list>>>(
        { queryKey: key },
        (current) => {
          if (!current) return current
          const rows = current.rows.map((n) => (n.id === id ? { ...n, read: true } : n))
          return {
            rows,
            // Recomputed from the rows rather than decremented: decrementing
            // double-counts when the same row is marked read twice, which a
            // double click does.
            unreadCount: rows.filter((n) => !n.read).length,
          }
        },
      )

      return { previous }
    },

    onError(_error, _id, context) {
      // Restore EVERY cached list we touched, not just one — `setQueriesData`
      // above wrote to all of them (the dropdown and the full page are separate
      // keys), so a single-entry rollback would leave the other one wrong.
      context?.previous.forEach(([key, data]) => client.setQueryData(key, data))
    },

    onSettled() {
      // Refetch on both success and failure. On success it reconciles the
      // optimistic guess with the server's own unread count, which is
      // authoritative; on failure it repairs anything the rollback missed.
      void client.invalidateQueries({ queryKey: queryKeys.notifications.all() })
    },
  })
}

/** Mark every notification read. Same optimistic shape, applied to all rows. */
export function useMarkAllNotificationsRead() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (recipient?: string) => notifications.markAllRead(recipient),

    async onMutate() {
      const key = queryKeys.notifications.all()
      await client.cancelQueries({ queryKey: key })
      const previous = client.getQueriesData({ queryKey: key })

      client.setQueriesData<Awaited<ReturnType<typeof notifications.list>>>(
        { queryKey: key },
        (current) =>
          current ? { rows: current.rows.map((n) => ({ ...n, read: true })), unreadCount: 0 } : current,
      )

      return { previous }
    },

    onError(_error, _recipient, context) {
      context?.previous.forEach(([key, data]) => client.setQueryData(key, data))
    },

    onSettled() {
      void client.invalidateQueries({ queryKey: queryKeys.notifications.all() })
    },
  })
}

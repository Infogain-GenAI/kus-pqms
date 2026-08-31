// The HTTP contract of the notification endpoints.
//
// ─── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
//
// These assertions are about METHOD, PATH and PARAMETER PLACEMENT — the details
// that are invisible to every other kind of test. A mapper test passes whatever
// verb you used; a query-hook test passes whatever the service did, because the
// service is mocked. Only a test that inspects the outgoing request can tell
// `POST /x` from `PATCH /x`, or a query parameter from a request body.
//
// ⚠️ AND THEY ARE NOT INFERRED. Every value below is taken from the Vue port's
// `services/notification.service.ts`, whose header records that each endpoint
// and parameter is verified against `NotificationController.java` and the
// service's own Postman collection. Four of them were wrong on this side until
// they were checked against it:
//
//   • mark-read and mark-all-read were POST; the backend takes PATCH.
//   • `receiver` was sent as a request BODY on mark-all-read; the endpoint takes
//     no body at all, so it arrived as nothing.
//   • mark-read sent no `receiver` — which is the backend's OWNERSHIP CHECK, not
//     an optional filter. A call without it 404s rather than mutating.
//   • there was no `unread-count` endpoint, so the badge was derived from a
//     bounded page and silently capped at the page size.
import { describe, it, expect, afterEach } from 'vitest'
import { apiClient } from '@/shared/http'
import {
  listNotifications,
  markAllRead,
  markRead,
  unreadCount,
} from '@/services/notification.service'

const realAdapter = apiClient.defaults.adapter

afterEach(() => {
  apiClient.defaults.adapter = realAdapter
})

interface Recorded {
  method?: string
  url?: string
  params?: Record<string, unknown>
  data?: unknown
}

/** Records the outgoing request and answers with `body`. */
function stubTransport(body: unknown) {
  const calls: Recorded[] = []
  apiClient.defaults.adapter = (async (config) => {
    calls.push({
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params as Record<string, unknown>,
      data: config.data,
    })
    return { data: body, status: 200, statusText: 'OK', headers: {}, config }
  }) as typeof realAdapter
  return calls
}

describe('GET /notifications', () => {
  it('sends receiver, page and size as query parameters', async () => {
    const calls = stubTransport({ content: [] })

    await listNotifications({ recipient: 'qe_user_01@pqms.internal', page: 0, limit: 6 })

    expect(calls[0].method).toBe('GET')
    expect(calls[0].url).toBe('/notifications')
    expect(calls[0].params).toMatchObject({
      receiver: 'qe_user_01@pqms.internal',
      page: 0,
      size: 6,
    })
  })
})

describe('GET /notifications/unread-count', () => {
  // The badge's own endpoint. Its whole reason for existing is that a count
  // derived from a page undercounts whenever more unread rows exist than the
  // page size — five unread and five hundred would render identically.
  it('returns the count from its own endpoint', async () => {
    const calls = stubTransport({ unreadCount: 137 })

    await expect(unreadCount('u-se')).resolves.toBe(137)

    expect(calls[0].method).toBe('GET')
    expect(calls[0].url).toBe('/notifications/unread-count')
    expect(calls[0].params).toMatchObject({ receiver: 'u-se' })
  })

  // Strict schema: an endpoint that starts returning `{count: n}` would
  // otherwise parse to `undefined` and render a badge of NaN, or none at all.
  it('rejects a response whose shape drifted', async () => {
    stubTransport({ count: 137 })
    await expect(unreadCount('u-se')).rejects.toThrow(/unread-count/)
  })
})

describe('PATCH /notifications/{id}/read', () => {
  it('uses PATCH, not POST', async () => {
    const calls = stubTransport(undefined)
    await markRead('N-1', 'u-se')
    expect(calls[0].method).toBe('PATCH')
  })

  it('puts the id in the path and receiver in the query string', async () => {
    const calls = stubTransport(undefined)

    await markRead('N-1', 'u-se')

    expect(calls[0].url).toBe('/notifications/N-1/read')
    // `receiver` is the ownership check: a mismatched value 404s rather than
    // mutating, so omitting it does not mark somebody else's row read — it
    // fails, and the optimistic update rolls back for an invisible reason.
    expect(calls[0].params).toMatchObject({ receiver: 'u-se' })
  })

  it('encodes an id that would otherwise break the path', async () => {
    const calls = stubTransport(undefined)
    await markRead('N/1 2', 'u-se')
    expect(calls[0].url).toBe('/notifications/N%2F1%202/read')
  })
})

describe('PATCH /notifications/read-all', () => {
  it('uses PATCH and sends receiver as a query parameter, not a body', async () => {
    const calls = stubTransport(undefined)

    await markAllRead('u-se')

    expect(calls[0].method).toBe('PATCH')
    expect(calls[0].url).toBe('/notifications/read-all')
    expect(calls[0].params).toMatchObject({ receiver: 'u-se' })
    // The real endpoint takes no body. One sent here is ignored, and the call
    // then marks nothing — because the receiver it needed never arrived.
    expect(calls[0].data).toBeUndefined()
  })
})

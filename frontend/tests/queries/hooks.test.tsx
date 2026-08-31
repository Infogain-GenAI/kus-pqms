// Tests for the TanStack Query hook layer.
//
// ─── WHAT IS AND IS NOT UNDER TEST ───────────────────────────────────────────
//
// The hooks are a cache and a lifecycle over `services/`. The service contracts
// are already covered in `tests/services/dataLayer.test.ts`, so re-asserting
// them here would test the same thing twice and couple these tests to fixture
// content. What is only testable HERE is the query behaviour: that the key is
// stable across argument orderings, that `enabled` actually disables, that the
// optimistic mark-read applies and rolls back, and that an error surfaces
// through the hook rather than being swallowed.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { withQueryClient, createTestQueryClient } from '../support/queryWrapper'
import { queryKeys } from '@/shared/query/keys'
import * as services from '@/services'
import {
  useIssueDetail,
  useIssueKpiCounts,
  useIssueList,
  useIssueScopeCounts,
} from '@/features/issues/issues.queries'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/features/notifications/notifications.queries'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('query keys', () => {
  // The property the whole convention rests on. TanStack hashes keys
  // structurally, so two callers that pass the same filters in a different
  // literal order must land on ONE cache entry — otherwise the same screen
  // fetches twice and neither copy invalidates the other.
  it('resolves to one cache entry regardless of argument key order', () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.issues.list({ page: 1, pageSize: 20 }), 'X')
    expect(client.getQueryData(queryKeys.issues.list({ pageSize: 20, page: 1 }))).toBe('X')
  })

  // Prefix invalidation is what lets a mutation say what it invalidated instead
  // of clearing the cache. If the ordering ever changed, this would fail.
  it('nests every issue key under the all() prefix', () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.issues.list(), 'list')
    client.setQueryData(queryKeys.issues.detail('ISS-1'), 'detail')

    expect(client.getQueriesData({ queryKey: queryKeys.issues.all() })).toHaveLength(2)
  })

  // Issue and notification keys must not collide, or marking a notification read
  // would invalidate the issue list.
  it('keeps the two features in separate namespaces', () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.issues.list(), 'issues')
    client.setQueryData(queryKeys.notifications.list(), 'notifications')

    expect(client.getQueriesData({ queryKey: queryKeys.notifications.all() })).toHaveLength(1)
  })
})

describe('useIssueList', () => {
  it('resolves the service result', async () => {
    const { result } = renderHook(() => useIssueList({ page: 1, pageSize: 5 }), {
      wrapper: withQueryClient(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(Array.isArray(result.current.data?.rows)).toBe(true)
  })

  // 04: loading and error state come from the query itself. If a service
  // rejection were swallowed, a screen would show an empty list rather than an
  // error — the exact silent failure the query layer exists to prevent.
  it('surfaces a service rejection as the query error', async () => {
    vi.spyOn(services.issues, 'list').mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useIssueList(), { wrapper: withQueryClient() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })
})

describe('useIssueDetail', () => {
  // The guard that stops a query firing against `/issues/` — a different
  // endpoint that returns a list and then fails the detail schema confusingly.
  it('does not fetch while the id is undefined', () => {
    const spy = vi.spyOn(services.issues, 'getById')

    const { result } = renderHook(() => useIssueDetail(undefined), { wrapper: withQueryClient() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(spy).not.toHaveBeenCalled()
  })

  it('fetches once an id is supplied', async () => {
    const spy = vi.spyOn(services.issues, 'getById').mockResolvedValue(null)

    const { result } = renderHook(() => useIssueDetail('ISS-1'), { wrapper: withQueryClient() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith('ISS-1')
    // `null` is "no such issue" and is distinct from `undefined`, which is "not
    // fetched yet". Callers need both, so the hook must not conflate them.
    expect(result.current.data).toBeNull()
  })
})

describe('useIssueScopeCounts', () => {
  it('does not fetch without a user', () => {
    const spy = vi.spyOn(services.issues, 'scopeCounts')
    renderHook(() => useIssueScopeCounts(undefined), { wrapper: withQueryClient() })
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('useNotifications', () => {
  // 05's `enabled: !isFixtureMode()`. Asserted because the failure it guards
  // against — writing `!isFixtureMode` without parens — is silent in both
  // directions: no error, no request, no log.
  it('is disabled in fixtures mode', () => {
    vi.stubEnv('VITE_USE_FIXTURES', 'true')
    const spy = vi.spyOn(services.notifications, 'list')

    const { result } = renderHook(() => useNotifications(), { wrapper: withQueryClient() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(spy).not.toHaveBeenCalled()
  })

  it('fetches when fixtures mode is off', async () => {
    vi.stubEnv('VITE_USE_FIXTURES', 'false')
    vi.spyOn(services.notifications, 'list').mockResolvedValue({ rows: [], unreadCount: 0 })

    const { result } = renderHook(() => useNotifications(), { wrapper: withQueryClient() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('optimistic mark-read', () => {
  const seeded = {
    rows: [
      { id: 'N-1', category: 'Critical' as const, title: 'a', read: false, createdAt: '2026-08-31' },
      { id: 'N-2', category: 'Warning' as const, title: 'b', read: false, createdAt: '2026-08-31' },
    ],
    unreadCount: 2,
  }

  beforeEach(() => {
    vi.stubEnv('VITE_USE_FIXTURES', 'false')
  })

  it('marks the row read and recomputes the count before the server replies', async () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.notifications.list(), seeded)

    let release: () => void = () => {}
    vi.spyOn(services.notifications, 'markRead').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        }),
    )

    const { result } = renderHook(() => useMarkNotificationRead(), {
      wrapper: withQueryClient(client),
    })

    act(() => {
      result.current.mutate('N-1')
    })

    // Asserted deliberately while the request is still in flight — that is the
    // whole claim of an optimistic update.
    await waitFor(() => {
      const data = client.getQueryData<typeof seeded>(queryKeys.notifications.list())
      expect(data?.rows.find((n) => n.id === 'N-1')?.read).toBe(true)
      expect(data?.unreadCount).toBe(1)
    })

    act(() => release())
  })

  // Without the snapshot-and-restore, a failed write leaves the user looking at
  // a read state the server never accepted.
  it('rolls back when the write fails', async () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.notifications.list(), seeded)
    vi.spyOn(services.notifications, 'markRead').mockRejectedValue(new Error('nope'))
    vi.spyOn(services.notifications, 'list').mockResolvedValue(seeded)

    const { result } = renderHook(() => useMarkNotificationRead(), {
      wrapper: withQueryClient(client),
    })

    act(() => {
      result.current.mutate('N-1')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const data = client.getQueryData<typeof seeded>(queryKeys.notifications.list())
    expect(data?.rows.find((n) => n.id === 'N-1')?.read).toBe(false)
    expect(data?.unreadCount).toBe(2)
  })

  // Recomputing the count from the rows rather than decrementing it. A decrement
  // would reach 0 here and be wrong by one.
  it('does not double-count when the same row is marked read twice', async () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.notifications.list(), seeded)
    vi.spyOn(services.notifications, 'markRead').mockResolvedValue(undefined)
    vi.spyOn(services.notifications, 'list').mockResolvedValue(seeded)

    const { result } = renderHook(() => useMarkNotificationRead(), {
      wrapper: withQueryClient(client),
    })

    act(() => {
      result.current.mutate('N-1')
    })
    act(() => {
      result.current.mutate('N-1')
    })

    await waitFor(() => {
      expect(client.getQueryData<typeof seeded>(queryKeys.notifications.list())?.unreadCount).toBe(1)
    })
  })

  it('mark-all zeroes the count optimistically', async () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.notifications.list(), seeded)

    let release: () => void = () => {}
    vi.spyOn(services.notifications, 'markAllRead').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        }),
    )

    const { result } = renderHook(() => useMarkAllNotificationsRead(), {
      wrapper: withQueryClient(client),
    })

    act(() => {
      result.current.mutate(undefined)
    })

    await waitFor(() => {
      const data = client.getQueryData<typeof seeded>(queryKeys.notifications.list())
      expect(data?.unreadCount).toBe(0)
      expect(data?.rows.every((n) => n.read)).toBe(true)
    })

    act(() => release())
  })
})

describe('useIssueKpiCounts', () => {
  it('resolves the dashboard totals', async () => {
    vi.spyOn(services.issues, 'kpiCounts').mockResolvedValue({ total: 3, byStatus: { OPEN: 3 } })

    const { result } = renderHook(() => useIssueKpiCounts(), { wrapper: withQueryClient() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.total).toBe(3)
  })

  // Unparameterised, so every caller must land on ONE cache entry — otherwise
  // the dashboard's several KPI tiles each fetch the same totals separately.
  it('uses one key for every caller', () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.issues.kpiCounts(), { total: 1, byStatus: {} })
    expect(client.getQueryData(queryKeys.issues.kpiCounts())).toEqual({ total: 1, byStatus: {} })
  })
})

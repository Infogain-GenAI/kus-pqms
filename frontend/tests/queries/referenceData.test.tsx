// Tests for the reference-data and issue-detail query hooks.
//
// ─── WHAT IS WORTH ASSERTING ─────────────────────────────────────────────────
//
// Not "does the hook return what the service returned" — that would restate the
// service tests through a mock. What only exists at this layer is the CACHING
// POLICY and the ENABLED GUARDS, and both have failure modes that are silent:
//
//   • A missing `staleTime` turns five mounted pickers into five requests, and
//     nothing reports it — the screen looks identical.
//   • An `enabled` guard on the wrong argument permanently disables the first
//     level of the classification cascade, and the symptom is an empty picker.
//   • An id-less query hits a DIFFERENT path (`/issues//parts`), which either
//     404s or matches a collection route and returns everyone's records.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { withQueryClient, createTestQueryClient } from '../support/queryWrapper'
import { queryKeys } from '@/shared/query/keys'
import * as services from '@/services'
import {
  useClassification,
  useClassificationLevel,
  useIssuePriority,
  usePartOptions,
  useTeamDirectory,
  useUsers,
  useVinOptions,
} from '@/shared/query/masterData.queries'
import {
  useActivities,
  useActivityChangeRequests,
  useAuditTrail,
  useComments,
  usePartRequests,
} from '@/features/issues/issueDetail.queries'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('reference data is cached, which is what makes a query beat a store', () => {
  /*
   * ⚠️ THE POINT OF `staleTime`. Reference data feels like "load once at startup
   * and stash it", and this is the behaviour people actually want from that:
   * mounting several consumers costs ONE request. The difference from a store is
   * that this still has an invalidation path.
   */
  it('serves a second consumer from cache rather than refetching', async () => {
    const spy = vi.spyOn(services.masterData, 'classification').mockResolvedValue([])
    const wrapper = withQueryClient(createTestQueryClient())

    const first = renderHook(() => useClassification(), { wrapper })
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true))

    const second = renderHook(() => useClassification(), { wrapper })
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledTimes(1)
  })

  // Every reference query shares the prefix, so approving a requested system can
  // refresh every picker with one invalidation. A store has no equivalent, and
  // the failure mode is a new system nobody sees until they hard-refresh.
  it('files every reference query under one invalidation prefix', () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.masterData.classification(), [])
    client.setQueryData(queryKeys.masterData.partOptions(), [])
    client.setQueryData(queryKeys.masterData.teamDirectory(), [])
    client.setQueryData(queryKeys.masterData.users(), [])

    expect(client.getQueriesData({ queryKey: queryKeys.masterData.all() })).toHaveLength(4)
  })

  it('resolves the catalogue, the directory and the user list', async () => {
    vi.spyOn(services.masterData, 'partOptions').mockResolvedValue([{ partNo: 'A', qty: '1' }])
    vi.spyOn(services.masterData, 'teamDirectory').mockResolvedValue([
      { id: 'tm-1', name: 'A', role: 'SE', company: 'Kia' },
    ])
    vi.spyOn(services.masterData, 'users').mockResolvedValue([])

    const wrapper = withQueryClient()
    const parts = renderHook(() => usePartOptions(), { wrapper })
    const team = renderHook(() => useTeamDirectory(), { wrapper })
    const users = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(parts.result.current.data).toHaveLength(1))
    await waitFor(() => expect(team.result.current.data).toHaveLength(1))
    await waitFor(() => expect(users.result.current.isSuccess).toBe(true))
  })
})

describe('the classification cascade', () => {
  /*
   * ⚠️ THE GUARD IS ON `level`, NOT ON `parentId`. Systems have no parent, so
   * asking for them with `parentId: undefined` is a legitimate query. A guard on
   * `parentId` would permanently disable the FIRST level of every cascade —
   * silently, with an empty picker and no error anywhere.
   */
  it('fetches the top level even with no parent', async () => {
    const spy = vi.spyOn(services.masterData, 'classificationLevel').mockResolvedValue([])

    const { result } = renderHook(() => useClassificationLevel('system'), {
      wrapper: withQueryClient(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith('system', undefined)
  })

  it('does not fetch before a level is known', () => {
    const spy = vi.spyOn(services.masterData, 'classificationLevel')

    const { result } = renderHook(() => useClassificationLevel(undefined), {
      wrapper: withQueryClient(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(spy).not.toHaveBeenCalled()
  })

  // `undefined` is encoded as `''` in the key, so "top level" and "children of
  // X" cannot collide — a collision would serve sub-systems into the system
  // picker, which reads as corrupted data rather than a caching bug.
  it('keeps a top-level query and a parented one in separate cache entries', () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.masterData.classificationLevel('subSystem'), 'top')
    client.setQueryData(queryKeys.masterData.classificationLevel('subSystem', 'sys-ee'), 'child')

    expect(client.getQueryData(queryKeys.masterData.classificationLevel('subSystem'))).toBe('top')
  })
})

describe('priority is reference-shaped but not reference data', () => {
  /*
   * ⚠️ NO `staleTime`, unlike everything else in that module. Priority is edited
   * in the app, so caching it for five minutes would show a user the matrix they
   * just replaced.
   */
  it('refetches rather than serving a stale matrix', async () => {
    const spy = vi
      .spyOn(services.masterData, 'priority')
      .mockResolvedValue({ scores: {}, selIdx: {}, manualFinal: null, scored: false })
    const wrapper = withQueryClient(createTestQueryClient())

    const first = renderHook(() => useIssuePriority('ISS-1'), { wrapper })
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true))

    const second = renderHook(() => useIssuePriority('ISS-1'), { wrapper })
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true))

    expect(spy.mock.calls.length).toBeGreaterThan(1)
  })

  it('does not fetch without an issue id', () => {
    const spy = vi.spyOn(services.masterData, 'priority')
    renderHook(() => useIssuePriority(undefined), { wrapper: withQueryClient() })
    expect(spy).not.toHaveBeenCalled()
  })

  // An unscored issue resolves to a real record, not null: `scored: false` is
  // the meaningful state that gates QIR creation.
  it('treats an unscored issue as a record, not an absence', async () => {
    vi.spyOn(services.masterData, 'priority').mockResolvedValue({
      scores: {},
      selIdx: {},
      manualFinal: null,
      scored: false,
    })

    const { result } = renderHook(() => useIssuePriority('ISS-1'), { wrapper: withQueryClient() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.scored).toBe(false)
  })
})

describe('VIN options', () => {
  it('does not fetch without an issue id', () => {
    const spy = vi.spyOn(services.masterData, 'vinOptions')
    renderHook(() => useVinOptions(undefined), { wrapper: withQueryClient() })
    expect(spy).not.toHaveBeenCalled()
  })

  it('scopes the list to the issue', async () => {
    const spy = vi.spyOn(services.masterData, 'vinOptions').mockResolvedValue(['KNA1'])
    const { result } = renderHook(() => useVinOptions('ISS-1'), { wrapper: withQueryClient() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith('ISS-1')
  })
})

describe('the five issue-scoped collections', () => {
  /*
   * ⚠️ WHY EVERY ONE IS GUARDED. A route param is `string | undefined` before
   * the router resolves it, and firing with an empty id requests
   * `/issues//parts` — a DIFFERENT path, not an error. The server either 404s or
   * matches a collection route and returns everyone's records.
   */
  it('none of them fetch without an id', () => {
    const spies = [
      vi.spyOn(services.issueDetail, 'parts'),
      vi.spyOn(services.issueDetail, 'comments'),
      vi.spyOn(services.issueDetail, 'activities'),
      vi.spyOn(services.issueDetail, 'audit'),
      vi.spyOn(services.issueDetail, 'changeRequests'),
    ]
    const wrapper = withQueryClient()

    renderHook(() => usePartRequests(undefined), { wrapper })
    renderHook(() => useComments(undefined), { wrapper })
    renderHook(() => useActivities(undefined), { wrapper })
    renderHook(() => useAuditTrail(undefined), { wrapper })
    renderHook(() => useActivityChangeRequests(undefined), { wrapper })

    for (const spy of spies) expect(spy).not.toHaveBeenCalled()
  })

  it('each fetches once an id is supplied', async () => {
    vi.spyOn(services.issueDetail, 'parts').mockResolvedValue([])
    vi.spyOn(services.issueDetail, 'comments').mockResolvedValue([])
    vi.spyOn(services.issueDetail, 'activities').mockResolvedValue([])
    vi.spyOn(services.issueDetail, 'audit').mockResolvedValue([])
    vi.spyOn(services.issueDetail, 'changeRequests').mockResolvedValue([])
    const wrapper = withQueryClient()

    const hooks = [
      renderHook(() => usePartRequests('ISS-1'), { wrapper }),
      renderHook(() => useComments('ISS-1'), { wrapper }),
      renderHook(() => useActivities('ISS-1'), { wrapper }),
      renderHook(() => useAuditTrail('ISS-1'), { wrapper }),
      renderHook(() => useActivityChangeRequests('ACT-1'), { wrapper }),
    ]

    for (const h of hooks) await waitFor(() => expect(h.result.current.isSuccess).toBe(true))
  })

  /*
   * ⚠️ KEYS NEST UNDER THE ISSUE ID, NOT THE COLLECTION NAME — so closing an
   * issue can invalidate everything about it at once, and leaving the screen
   * cannot invalidate a different issue's parts.
   */
  it('nests every collection under the issue id', () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.issueDetail.parts('ISS-1'), [])
    client.setQueryData(queryKeys.issueDetail.comments('ISS-1'), [])
    client.setQueryData(queryKeys.issueDetail.parts('ISS-2'), [])

    expect(client.getQueriesData({ queryKey: queryKeys.issueDetail.all('ISS-1') })).toHaveLength(2)
  })

  /*
   * ⚠️ CHANGE REQUESTS ARE KEYED BY ACTIVITY, NOT ISSUE, because that is the
   * scope the endpoint has. Filing them under the issue would mean approving one
   * correction invalidated every activity's requests on the screen.
   */
  it('keys change requests by activity, outside the issue prefix', () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.issueDetail.parts('ISS-1'), [])
    client.setQueryData(queryKeys.issueDetail.changeRequests('ACT-1'), [])

    expect(client.getQueriesData({ queryKey: queryKeys.issueDetail.all('ISS-1') })).toHaveLength(1)
  })
})

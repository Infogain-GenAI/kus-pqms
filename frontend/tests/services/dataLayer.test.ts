// Tests for the fixture API, the mappers and the fixtures/live switch.
//
// ─── THE PROPERTY THAT MATTERS MOST ──────────────────────────────────────────
//
// The two implementations must be INTERCHANGEABLE. A screen written against
// `services.issues.list()` has to work on either, which means their contracts
// have to agree on the awkward cases as well as the happy one: what `total`
// means, what a missing record resolves to, whether paging is 0- or 1-based.
// Most of the tests below are about exactly those disagreements, because they
// are the ones that would only be discovered on cutover day.
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  fetchIssueById,
  fetchIssueKpiCounts,
  fetchIssueScopeCounts,
  fetchIssues,
} from '@/api/issues'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/api/notifications'
import {
  STATUS_FROM_BACKEND,
  STATUS_TO_BACKEND,
  fromBackendPage,
  serializeListParams,
  statusFromBackend,
  toIssue,
} from '@/services/issue.mappers'
import { toNotification } from '@/services/notification.service'
import { apiClient } from '@/shared/http'
import { services } from '@/services'
import { dataSourceMode, isFixtureMode } from '@/config/data-source'
import { ISSUES, NOTIFICATIONS } from '@/data/seed'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  apiClient.defaults.adapter = realAdapter
})

/**
 * Records every request the HTTP client actually makes.
 *
 * ⚠️ STUBS THE AXIOS ADAPTER, NOT `fetch`. These tests used to spy on
 * `globalThis.fetch`, because the client was built on it. `05` specifies Axios,
 * and axios does not use `fetch` here — a fetch spy against an axios client
 * records nothing, so "did the facade hit HTTP?" would answer NO on both
 * branches and the test would pass for the wrong reason on the fixture side
 * while failing on the live side.
 */
const realAdapter = apiClient.defaults.adapter
function stubTransport() {
  const calls: string[] = []
  apiClient.defaults.adapter = (async (config) => {
    calls.push(`${config.baseURL ?? ''}${config.url ?? ''}`)
    return { data: { content: [], totalElements: 0 }, status: 200, statusText: 'OK', headers: {}, config }
  }) as typeof realAdapter
  return { calls }
}

/* -------------------------------------------------------------------------- */
/* The fixture endpoints                                                      */
/* -------------------------------------------------------------------------- */

describe('the fixture list endpoint behaves like a server, not like an array', () => {
  it('pages the rows and reports the FULL total', async () => {
    // The classic paginated-list bug is reporting the page length as the total,
    // which looks right until someone reaches page 2.
    const { rows, total } = await fetchIssues({ page: 1, pageSize: 3 })
    expect(rows).toHaveLength(3)
    expect(total).toBe(ISSUES.length)
  })

  it('page 2 returns different rows from page 1', async () => {
    const p1 = await fetchIssues({ page: 1, pageSize: 3 })
    const p2 = await fetchIssues({ page: 2, pageSize: 3 })
    expect(p2.rows.map((r) => r.id)).not.toEqual(p1.rows.map((r) => r.id))
  })

  it('keeps the total stable across pages', async () => {
    const p1 = await fetchIssues({ page: 1, pageSize: 3 })
    const p2 = await fetchIssues({ page: 2, pageSize: 3 })
    expect(p2.total).toBe(p1.total)
  })

  it('a page past the end is empty but still reports the real total', async () => {
    const out = await fetchIssues({ page: 999, pageSize: 20 })
    expect(out.rows).toHaveLength(0)
    expect(out.total).toBe(ISSUES.length)
  })

  it('filters reduce the TOTAL, not just the page', async () => {
    // If a filter only trimmed the returned rows, the pager would still offer
    // pages of results that no longer exist.
    const all = await fetchIssues({ pageSize: 1 })
    const open = await fetchIssues({ status: ['open'], pageSize: 1 })
    expect(open.total).toBeLessThan(all.total)
    expect(open.total).toBe(ISSUES.filter((i) => i.status === 'open').length)
  })

  it('searches across id, title, model and owner', async () => {
    const target = ISSUES[0]
    const out = await fetchIssues({ search: target.id, pageSize: 50 })
    expect(out.rows.map((r) => r.id)).toContain(target.id)
  })

  it('scope=own needs a user, and narrows to issues currently assigned to them — not merely owned', async () => {
    const user = 'Arpita Chavda'
    const out = await fetchIssues({ scope: 'own', scopeUser: user, pageSize: 100 })
    expect(out.rows.length).toBeGreaterThan(0)
    expect(out.rows.every((r) => r.assignee === user)).toBe(true)

    // An issue Arpita owns but has never been assigned must NOT appear — the
    // scope tracks who is working it now, not who reported it.
    const ownedNotAssigned = ISSUES.find((i) => i.owner === user && i.assignee !== user)
    expect(ownedNotAssigned).toBeTruthy()
    expect(out.rows.map((r) => r.id)).not.toContain(ownedNotAssigned!.id)
  })

  it('scope=own with NO user does not silently narrow', async () => {
    const out = await fetchIssues({ scope: 'own', pageSize: 100 })
    expect(out.total).toBe(ISSUES.length)
  })

  it('sorts, and reverses on direction', async () => {
    const asc = await fetchIssues({ sortBy: 'id', sortDir: 'asc', pageSize: 100 })
    const desc = await fetchIssues({ sortBy: 'id', sortDir: 'desc', pageSize: 100 })
    expect(desc.rows.map((r) => r.id)).toEqual([...asc.rows.map((r) => r.id)].reverse())
  })

  it('falls back to a stable order for an unknown sort key', async () => {
    // An unknown key must not produce an apparently random order — that reads
    // as corrupted data rather than an ignored preference.
    const a = await fetchIssues({ sortBy: 'nonsense', pageSize: 100 })
    const b = await fetchIssues({ sortBy: 'nonsense', pageSize: 100 })
    expect(a.rows.map((r) => r.id)).toEqual(b.rows.map((r) => r.id))
  })

  it('is async — the fixture path rehearses the real one', async () => {
    // A synchronous fixture lets components be written with no loading state,
    // and every one of those omissions becomes a bug on cutover day.
    expect(fetchIssues()).toBeInstanceOf(Promise)
  })
})

describe('fetchIssueById', () => {
  it('returns the record', async () => {
    await expect(fetchIssueById(ISSUES[0].id)).resolves.toMatchObject({ id: ISSUES[0].id })
  })

  it('resolves NULL for a missing record rather than rejecting', async () => {
    // "Not found" is an answer to this question, not a failure of it. A caller
    // forced to catch in order to render an empty state will eventually catch a
    // real error and render the same empty state.
    await expect(fetchIssueById('NOPE-000000')).resolves.toBeNull()
  })
})

describe('counts', () => {
  it('scope counts match the seed', async () => {
    const user = 'Arpita Chavda'
    const out = await fetchIssueScopeCounts(user)
    expect(out.all).toBe(ISSUES.length)
    expect(out.own).toBe(ISSUES.filter((i) => i.assignee === user).length)
  })

  it('kpi counts sum to the total', async () => {
    const { total, byStatus } = await fetchIssueKpiCounts()
    expect(Object.values(byStatus).reduce((a, b) => a + b, 0)).toBe(total)
  })
})

describe('the fixture notification endpoints', () => {
  it('counts unread across the WHOLE set, not just the returned page', async () => {
    // Otherwise the bell badge caps at the panel's page size and five unread
    // looks identical to five hundred.
    const all = await fetchNotifications()
    const limited = await fetchNotifications({ limit: 1 })
    expect(limited.rows).toHaveLength(1)
    expect(limited.unreadCount).toBe(all.unreadCount)
  })

  it('returns newest first', async () => {
    const { rows } = await fetchNotifications()
    const stamps = rows.map((r) => r.createdAt)
    expect(stamps).toEqual([...stamps].sort((a, b) => b.localeCompare(a)))
  })

  it('marking an unknown id is a no-op, not an error', async () => {
    // The realistic cause is a notification dismissed in another tab between
    // render and click — failing would show an error for something that already
    // happened the way the user wanted.
    await expect(markNotificationRead('does-not-exist')).resolves.toBeUndefined()
  })

  it('markAllRead clears every unread flag', async () => {
    const before = NOTIFICATIONS.map((n) => n.read)
    try {
      await markAllNotificationsRead()
      expect((await fetchNotifications()).unreadCount).toBe(0)
    } finally {
      // The fixture module mutates the shared seed, so this must be undone or
      // it leaks into every later test in the file.
      NOTIFICATIONS.forEach((n, i) => { n.read = before[i] })
    }
  })
})

/* -------------------------------------------------------------------------- */
/* The mappers                                                                */
/* -------------------------------------------------------------------------- */

describe('status mapping', () => {
  it('round-trips every status this app can produce', () => {
    for (const [app, backend] of Object.entries(STATUS_TO_BACKEND)) {
      expect(STATUS_FROM_BACKEND[backend]).toBe(app)
    }
  })

  it('falls back rather than throwing on a status the backend added', () => {
    // The backend's vocabulary is larger. Rejecting a whole page because one row
    // has an unmapped status would take the list down for a change that should
    // have been invisible.
    expect(statusFromBackend('SOME_NEW_STATUS')).toBe('open')
  })
})

describe('request mapping', () => {
  it('converts the 1-based UI page to the backend 0-based page', () => {
    // Off-by-one here hides the first twenty records and gets reported as
    // missing data.
    expect(serializeListParams({ page: 1 }).page).toBe(0)
    expect(serializeListParams({ page: 3 }).page).toBe(2)
  })

  it('never emits a negative page', () => {
    expect(serializeListParams({ page: 0 }).page).toBe(0)
  })

  it('maps status values to the backend vocabulary', () => {
    expect(serializeListParams({ status: ['open', 'closed'] }).status).toEqual(['OPEN', 'CLOSED'])
  })

  it('emits sort as a single property,direction string', () => {
    expect(serializeListParams({ sortBy: 'issueDate', sortDir: 'asc' }).sort).toBe('issueDate,asc')
  })

  it('omits sort entirely when none was asked for', () => {
    expect(serializeListParams({}).sort).toBeUndefined()
  })
})

describe('response mapping', () => {
  const dto = {
    issueId: 'EE-260001',
    title: 'Charge port fault',
    status: 'IN_REVIEW',
    modelName: 'EV6',
    modelCode: 'CV',
    modelYear: 2026,
    ownerUserId: 'Arpita Chavda',
    reportedDate: '2026-06-16',
  }

  it('maps a row into the Issue shape this app uses', () => {
    const issue = toIssue(dto)
    expect(issue).toMatchObject({ id: 'EE-260001', status: 'review', model: 'EV6', owner: 'Arpita Chavda' })
  })

  it('defaults required fields a sparse row omits, rather than crashing the list', () => {
    const sparse = toIssue({ issueId: 'X-1', title: 'x', status: 'OPEN' })
    expect(sparse.model).toBe('')
    expect(sparse.modelYear).toBe(0)
    expect(sparse.owner).toBe('')
  })

  it('takes the total from totalElements, never from the page length', () => {
    const page = fromBackendPage({ content: [dto], totalElements: 137 })
    expect(page.rows).toHaveLength(1)
    expect(page.total).toBe(137)
  })
})

describe('notification mapping', () => {
  it('maps a known record type', () => {
    const n = toNotification({ id: 'n1', category: 'CRITICAL', message: 'x', read: false, createdAt: '2026-07-09T08:00:00Z', relatedRecordType: 'ISSUE', relatedRecordId: 'EE-1' })
    expect(n.recordType).toBe('issue')
    expect(n.category).toBe('Critical')
  })

  it('leaves recordType UNDEFINED for a type this app cannot route', () => {
    // Coercing it to 'issue' would send the user to /issues/<not-an-issue>.
    const n = toNotification({ id: 'n1', category: 'CRITICAL', message: 'x', read: false, createdAt: '2026-07-09T08:00:00Z', relatedRecordType: 'TSB', relatedRecordId: 'T-1' })
    expect(n.recordType).toBeUndefined()
  })

  it('falls back to Information for an unknown category', () => {
    const n = toNotification({ id: 'n1', category: 'WHATEVER', message: 'x', read: false, createdAt: '2026-07-09T08:00:00Z' })
    expect(n.category).toBe('Information')
  })
})

/* -------------------------------------------------------------------------- */
/* The switch                                                                 */
/* -------------------------------------------------------------------------- */

describe('VITE_USE_FIXTURES actually switches the implementation', () => {
  it('defaults to fixtures', () => {
    expect(isFixtureMode()).toBe(true)
    expect(dataSourceMode()).toBe('fixtures')
  })

  it('only the exact string "false" selects the live branch', () => {
    // A misspelled or empty value must fall back to the SAFE path — the value
    // comes from an untracked .env that differs per machine.
    for (const v of ['', 'no', 'FALSE', '0', 'true']) {
      vi.stubEnv('VITE_USE_FIXTURES', v)
      expect(isFixtureMode(), `"${v}" should keep fixtures`).toBe(true)
    }
    vi.stubEnv('VITE_USE_FIXTURES', 'false')
    expect(isFixtureMode()).toBe(false)
    expect(dataSourceMode()).toBe('api')
  })

  it('the facade serves fixtures by default WITHOUT touching the network', async () => {
    const { calls } = stubTransport()
    const out = await services.issues.list({ pageSize: 2 })
    expect(out.rows).toHaveLength(2)
    expect(calls).toHaveLength(0)
  })

  it('the facade hits HTTP once the flag says so', async () => {
    // THE POINT OF THE WHOLE LAYER: same call, different implementation.
    vi.stubEnv('VITE_USE_FIXTURES', 'false')
    const { calls } = stubTransport()

    await services.issues.list()
    expect(calls).toHaveLength(1)
    expect(calls[0]).toContain('/issues')
  })

  it('reads the flag PER CALL, so a change mid-session is honoured', async () => {
    // A module-level constant would freeze it at import time and make a
    // live-branch test pass while exercising fixtures.
    expect((await services.issues.list({ pageSize: 1 })).rows).toHaveLength(1)

    vi.stubEnv('VITE_USE_FIXTURES', 'false')
    const { calls } = stubTransport()
    await services.issues.list()
    expect(calls.length).toBeGreaterThan(0)
  })

  it('exposes every service through the one object', () => {
    // Catches a service added to the folder and never wired in — a module
    // nobody can reach.
    expect(Object.keys(services).sort()).toEqual([
      'issueDetail',
      'issues',
      'masterData',
      'notifications',
    ])
  })
})

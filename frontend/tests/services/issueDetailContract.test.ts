// The HTTP contract of the issue-detail and reference-data endpoints, and the
// `VITE_USE_FIXTURES` switch that gates them.
//
// ─── THE TWO THINGS THIS FILE PROVES ─────────────────────────────────────────
//
// 1. **The live arm is unreachable in fixtures mode.** That is the whole
//    contract of the facade: with `VITE_USE_FIXTURES=true` no request leaves the
//    app, and with it `false` every read goes to the backend. A screen written
//    against the facade must not be able to tell which arm it got.
//
// 2. **Method, path and parameter placement.** Invisible to every other kind of
//    test — a mapper test passes whatever verb you used, and a hook test passes
//    whatever the service did because the service is mocked. Only inspecting the
//    outgoing request can tell `POST /x` from `PUT /x`, or a query parameter
//    from a request body.
import { describe, it, expect, afterEach, vi } from 'vitest'
import { apiClient } from '@/shared/http'
import { services } from '@/services'
import {
  approveActivityChange,
  createComment,
  listActivities,
  listAuditTrail,
  listComments,
  listPartRequests,
  rejectActivityChange,
  requestActivityChange,
} from '@/services/issueDetail.service'
import {
  listClassification,
  listClassificationLevel,
  listTeamDirectory,
  listUsers,
} from '@/services/masterData.service'

const realAdapter = apiClient.defaults.adapter

afterEach(() => {
  apiClient.defaults.adapter = realAdapter
  vi.unstubAllEnvs()
})

interface Recorded {
  method?: string
  url?: string
  params?: Record<string, unknown>
  data?: unknown
}

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

const emptyPage = { content: [], totalElements: 0 }

/* -------------------------------------------------------------------------- */
/* The switch                                                                 */
/* -------------------------------------------------------------------------- */

describe('VITE_USE_FIXTURES gates every new service', () => {
  /*
   * ⚠️ THE ASSERTION IS THAT NOTHING LEAVES THE APP. A facade that fell through
   * to the live arm in fixtures mode would still "work" in development against a
   * proxy, and would only be discovered in an environment with no backend — by
   * which point every screen depends on it.
   */
  it('makes no HTTP request in fixtures mode', async () => {
    vi.stubEnv('VITE_USE_FIXTURES', 'true')
    const calls = stubTransport(emptyPage)

    await Promise.all([
      services.issueDetail.parts('ISS-1'),
      services.issueDetail.comments('ISS-1'),
      services.issueDetail.activities('ISS-1'),
      services.issueDetail.changeRequests('ACT-1'),
      services.issueDetail.audit('ISS-1'),
      services.masterData.classification(),
      services.masterData.partOptions(),
      services.masterData.teamDirectory(),
      services.masterData.users(),
      services.masterData.priority('ISS-1'),
      services.masterData.vinOptions('ISS-1'),
    ])

    expect(calls).toHaveLength(0)
  })

  it('routes every read over HTTP when fixtures are off', async () => {
    vi.stubEnv('VITE_USE_FIXTURES', 'false')
    const calls = stubTransport(emptyPage)

    await services.issueDetail.parts('ISS-1')
    await services.issueDetail.comments('ISS-1')
    await services.issueDetail.audit('ISS-1')

    expect(calls.map((c) => c.url)).toEqual([
      '/issues/ISS-1/parts',
      '/issues/ISS-1/comments',
      '/issues/ISS-1/audit',
    ])
  })

  // The branch is read per call, never hoisted — a module-level constant would
  // freeze the value at import and make a live-branch test silently exercise
  // fixtures. Flipping it mid-test is the only way to prove that.
  it('re-reads the flag on every call rather than caching it', async () => {
    vi.stubEnv('VITE_USE_FIXTURES', 'true')
    // A bare array, not a page envelope: the master-data endpoints are not
    // paginated. Getting this wrong the first time was the schema doing its job.
    const calls = stubTransport([])
    await services.masterData.partOptions()
    expect(calls).toHaveLength(0)

    vi.stubEnv('VITE_USE_FIXTURES', 'false')
    await services.masterData.partOptions()
    expect(calls).toHaveLength(1)
  })
})

/* -------------------------------------------------------------------------- */
/* Issue-detail endpoints                                                     */
/* -------------------------------------------------------------------------- */

describe('issue-detail reads', () => {
  it('sends 0-based paging', async () => {
    const calls = stubTransport(emptyPage)
    await listPartRequests('ISS-1')

    // ⚠️ 0, NOT 1. A 1-based value does not error — it returns the second page,
    // which presents as missing records rather than as a bug.
    expect(calls[0].params).toMatchObject({ page: 0 })
  })

  // The default size is 100, not the backend's 20: these are issue-scoped
  // collections a detail screen renders in full, and a silently-truncated audit
  // trail looks like a complete one.
  it('asks for enough rows to render a full collection', async () => {
    const calls = stubTransport(emptyPage)
    await listAuditTrail('ISS-1')
    expect(calls[0].params).toMatchObject({ size: 100 })
  })

  it('encodes an issue id that would otherwise break the path', async () => {
    const calls = stubTransport(emptyPage)
    await listActivities('ISS/1')
    expect(calls[0].url).toBe('/issues/ISS%2F1/investigation-activities')
  })

  it('rejects a response whose shape drifted', async () => {
    stubTransport({ rows: [] })
    await expect(listComments('ISS-1')).rejects.toThrow(/GET \/issues\/ISS-1\/comments/)
  })
})

describe('issue-detail writes use the backend field names', () => {
  /*
   * ⚠️ THE MAPPER RENAMES ON THE WAY OUT AS WELL AS IN. The domain calls it
   * `type`; the backend calls it `entryType`. Sending the domain name produces a
   * 400 naming a field the caller never wrote.
   */
  it('sends entryType, not type, when adding a comment', async () => {
    const calls = stubTransport({ id: 'C-1', issueId: 'ISS-1', body: 'hello' })

    await createComment('ISS-1', { type: 'Internal', body: 'hello' }, { name: 'A', role: 'SE' })

    const body = JSON.parse(String(calls[0].data))
    expect(body.entryType).toBe('Internal')
    expect('type' in body).toBe(false)
  })
})

describe('activity change requests', () => {
  const dto = { id: 'CR-1', activityId: 'ACT-1', proposedValue: 'new text' }

  it('posts to the activity scope, not the issue scope', async () => {
    const calls = stubTransport(dto)

    await requestActivityChange(
      'ACT-1',
      { field: 'details', currentValue: 'old', proposedValue: 'new text', reason: 'typo' },
      { name: 'A', role: 'SE' },
    )

    expect(calls[0].method).toBe('POST')
    expect(calls[0].url).toBe('/investigation-activities/ACT-1/change-requests')
    // The domain calls it `field`; the backend calls it `fieldName`.
    expect(JSON.parse(String(calls[0].data)).fieldName).toBe('details')
  })

  it('approve targets the request under its activity', async () => {
    const calls = stubTransport(dto)
    await approveActivityChange('ACT-1', 'CR-1', { name: 'A', role: 'ASM' })
    expect(calls[0].url).toBe('/investigation-activities/ACT-1/change-requests/CR-1/approve')
  })

  /*
   * ⚠️ THE REQUEST FIELD IS `reason`, NOT `rejectReason`. Verified in the Vue
   * port: sending `rejectReason` returns 400 with
   * `details: [{ field: "reason", message: "must not be blank" }]`. The response
   * echoes the other name, which is exactly why this is easy to get backwards.
   */
  it('reject sends reason, never rejectReason', async () => {
    const calls = stubTransport(dto)

    await rejectActivityChange('ACT-1', 'CR-1', 'not justified', { name: 'A', role: 'ASM' })

    const body = JSON.parse(String(calls[0].data))
    expect(body.reason).toBe('not justified')
    expect('rejectReason' in body).toBe(false)
  })
})

/* -------------------------------------------------------------------------- */
/* Reference data                                                             */
/* -------------------------------------------------------------------------- */

describe('classification', () => {
  /*
   * ⚠️ THE BACKEND PLURALISES AND THIS APP DOES NOT, and `subSystem` →
   * `subsystems` also drops the hyphen — so the path cannot be built by
   * appending an `s`. This pins the map that does it.
   */
  it('maps each level to the backend path', async () => {
    const calls = stubTransport([])

    await listClassificationLevel('system')
    await listClassificationLevel('subSystem', 'sys-ee')
    await listClassificationLevel('component', 'sub-1')
    await listClassificationLevel('symptom', 'cmp-1')

    expect(calls.map((c) => c.url)).toEqual([
      '/classification-keys/systems',
      '/classification-keys/subsystems',
      '/classification-keys/components',
      '/classification-keys/symptoms',
    ])
  })

  /*
   * ⚠️ OMITTED, NOT SENT AS UNDEFINED. The backend treats a present-but-empty
   * `parentCode` as "match nothing" rather than "match all", so a top-level
   * query with the parameter attached returns an empty picker and no error.
   */
  it('omits parentCode entirely for a top-level query', async () => {
    const calls = stubTransport([])
    await listClassificationLevel('system')
    expect(calls[0].params).toBeUndefined()
  })

  it('sends parentCode when there is a parent', async () => {
    const calls = stubTransport([])
    await listClassificationLevel('subSystem', 'sys-ee')
    expect(calls[0].params).toEqual({ parentCode: 'sys-ee' })
  })

  // There is no whole-tree endpoint, so the flat list is four parallel requests.
  it('fetches all four levels for the full taxonomy', async () => {
    const calls = stubTransport([])
    await listClassification()
    expect(calls).toHaveLength(4)
  })

  it('stamps the level onto each node from the request, not the response', async () => {
    stubTransport([{ id: 'sys-ee', level: 'SYSTEM_KEY', code: 'EE', label: 'Electrical' }])

    const [node] = await listClassificationLevel('subSystem', 'x')

    // The backend's own `level` vocabulary is not this app's. The level is known
    // from which endpoint was called, so it is stamped rather than translated —
    // one less mapping table to keep in step.
    expect(node.level).toBe('subSystem')
  })
})

describe('people', () => {
  it('reads the team directory from /assignees', async () => {
    const calls = stubTransport([{ id: 'tm-1', name: 'A', role: 'SE', company: 'Kia' }])
    const rows = await listTeamDirectory()
    expect(calls[0].url).toBe('/assignees')
    expect(rows[0]).toEqual({ id: 'tm-1', name: 'A', role: 'SE', company: 'Kia' })
  })

  /*
   * ⚠️ `cap` IS NOT SENT BY THE BACKEND AND IS NOT INVENTED HERE. Capability is
   * derived from the role by `stores/auth`, which owns the one permitted role
   * comparison in the codebase — deriving it a second time in a mapper is
   * exactly the duplicate the role-gate check exists to prevent. So the mapper
   * defers to the least-privileged value.
   */
  it('does not derive a capability when mapping a user', async () => {
    stubTransport([{ id: 'u-admin', name: 'Min-jun Oh', role: 'ADMIN' }])
    const [user] = await listUsers()
    expect(user.cap).toBe('read')
  })

  it('falls back to initials derived from the name', async () => {
    stubTransport([{ id: 'u-1', name: 'Arpita Chavda', role: 'SE' }])
    const [user] = await listUsers()
    expect(user.initials).toBe('AR')
  })
})

// Tests for the issue-filters Zustand store.
//
// ─── WHY THIS FILE EXISTS ALONGSIDE `tests/data/issueListView.test.tsx` ──────
//
// That file drives the screen, and it is the one that proves the user-visible
// behaviour: filter, navigate away, come back, filters still applied. It is
// unchanged by this migration and must stay that way.
//
// What it CANNOT reach is the three `persist` behaviours 04 says the middleware
// does not supply, asserted against the store directly rather than inferred from
// a rendered table — plus the two actions 04 names that no screen calls yet, and
// the write guard the scope field made necessary.
import { describe, it, expect, beforeEach } from 'vitest'
import { createIssueFiltersStore } from '@/stores/issue-management'
import {
  EMPTY_ISSUE_FILTERS,
  ISSUE_LIST_VIEW_STORAGE_KEY,
  type IssueListView,
} from '@/data/issueListView'

const COLUMNS = ['modelCode', 'status', 'source', 'severity']

const DEFAULTS: IssueListView = {
  q: '',
  flt: EMPTY_ISSUE_FILTERS,
  cols: ['modelCode', 'status'],
  sort: { key: 'status', dir: 'desc' },
  page: 1,
  pageSize: 20,
}

/** A fresh store per test — a shared one would carry state between them. */
const build = () => createIssueFiltersStore(DEFAULTS, COLUMNS)
const seed = (raw: string) => sessionStorage.setItem(ISSUE_LIST_VIEW_STORAGE_KEY, raw)
const stored = () => sessionStorage.getItem(ISSUE_LIST_VIEW_STORAGE_KEY)

beforeEach(() => {
  sessionStorage.clear()
})

describe('REQUIREMENT 1 — scope is excluded from the persisted payload', () => {
  it('never writes scope, however it changes', () => {
    const store = build()
    store.getState().setQ('charge')
    store.getState().setScope('all')

    const blob = JSON.parse(stored() ?? '{}')
    expect(blob.q).toBe('charge')
    // 04: "restoring a stale one would show a returning user a scope their
    // current role may not warrant." It must not even be in the payload.
    expect('scope' in blob).toBe(false)
  })

  it('ignores a scope written into a stored blob by anything else', () => {
    seed(JSON.stringify({ ...DEFAULTS, scope: 'all' }))
    const store = build()
    void store.persist.rehydrate()

    expect(store.getState().scope).toBe('my')
  })
})

describe('REQUIREMENT 2 — per-field fallback, independently', () => {
  /*
   * 04: "one bad field must not discard the rest. `persist`'s default shallow-
   * spread merge does not do this."
   *
   * The user-facing reason: losing a page number should not cost somebody the
   * filters they spent five minutes building.
   */
  it('keeps the good fields when one is malformed', () => {
    seed(JSON.stringify({ q: 'brake', page: -1, pageSize: 'fifty' }))
    const store = build()
    void store.persist.rehydrate()

    const s = store.getState()
    expect(s.q).toBe('brake')
    expect(s.page).toBe(DEFAULTS.page)
    expect(s.pageSize).toBe(DEFAULTS.pageSize)
  })

  // The realistic drift case: a blob written by an older build, naming a column
  // that has since been removed. Rendering one throws.
  it('drops a column that no longer exists and keeps the rest, in stored order', () => {
    seed(JSON.stringify({ cols: ['source', 'removedLastRelease', 'status'] }))
    const store = build()
    void store.persist.rehydrate()

    expect(store.getState().cols).toEqual(['source', 'status'])
  })

  it('rejects a sort on a key that is not a column', () => {
    seed(JSON.stringify({ sort: { key: 'notAColumn', dir: 'asc' } }))
    const store = build()
    void store.persist.rehydrate()

    expect(store.getState().sort).toEqual(DEFAULTS.sort)
  })
})

describe('REQUIREMENT 3 — corrupted JSON is deleted, not left to fail again', () => {
  it('falls back to the defaults and removes the bad key', () => {
    seed('{"q":"half-writ')
    const store = build()
    void store.persist.rehydrate()

    expect(store.getState().q).toBe(DEFAULTS.q)
    /*
     * The delete is the half that matters. 04: "`persist`'s default is a console
     * error with no cleanup, which leaves the bad key in place to fail again on
     * every subsequent load." Without it the user meets this on every visit for
     * the life of the tab, and each time it looks like fresh data loss.
     */
    expect(stored()).toBeNull()
  })
})

describe('the storage format stays flat', () => {
  /*
   * ⚠️ NOT COSMETIC. `data/issueListView.ts` records that the key is
   * deliberately the same string the Vue app uses so the two do not fight over
   * one origin's storage during a phased migration — and a shared key is only
   * shared if the SHAPE matches. `createJSONStorage` would write
   * {"state":{…},"version":0} and both apps would silently discard each other's
   * payload.
   */
  it('writes the six fields at the top level, with no persist envelope', () => {
    const store = build()
    store.getState().setQ('charge')

    const blob = JSON.parse(stored() ?? '{}')
    expect(blob.q).toBe('charge')
    expect('state' in blob).toBe(false)
    expect('version' in blob).toBe(false)
  })
})

describe('an unchanged payload is not rewritten', () => {
  /*
   * ⚠️ THE GUARD THAT `scope` MADE NECESSARY. `persist` writes on EVERY state
   * change and `partialize` does not change that — it only decides what goes
   * into the payload. So changing a deliberately-excluded field still triggers a
   * full write of identical contents.
   *
   * That matters because the screen re-seeds `scope` from the viewer's role on
   * every mount: without the guard, a MOUNT writes the defaults, destroying the
   * blob a user wants back after a transient read failure.
   */
  it('writes nothing when only scope changes', () => {
    const store = build()
    void store.persist.rehydrate()
    expect(stored()).toBeNull()

    store.getState().setScope('all')

    expect(stored()).toBeNull()
  })

  it('writes as soon as a persisted field does change', () => {
    const store = build()
    void store.persist.rehydrate()

    store.getState().setPage(3)

    expect(JSON.parse(stored() ?? '{}').page).toBe(3)
  })
})

describe('the actions 04 names', () => {
  // Neither is called by a screen yet. They are here because 04 lists them in
  // the store's required shape, and an action nothing exercises is an action
  // nobody notices is broken.
  it('clearAll resets the filters and returns to page 1, leaving search alone', () => {
    const store = build()
    store.getState().setQ('brake')
    store.getState().setFlt({ ...EMPTY_ISSUE_FILTERS, status: 'open' })
    store.getState().setPage(4)

    store.getState().clearAll()

    const s = store.getState()
    expect(s.flt).toEqual(EMPTY_ISSUE_FILTERS)
    expect(s.page).toBe(1)
    // Search is a separate affordance with its own clear control; wiping it here
    // would surprise someone who only wanted the filter drawer emptied.
    expect(s.q).toBe('brake')
  })

  it('resetVisibleColumns restores the default columns and their order', () => {
    const store = build()
    store.getState().setCols(['severity', 'source'])

    store.getState().resetVisibleColumns()

    expect(store.getState().cols).toEqual(DEFAULTS.cols)
  })
})

describe('setting a field to what it already holds is a no-op', () => {
  // The screen does this on some paths. A re-render plus a re-persist on every
  // such call is the difference between typing feeling instant and feeling laggy.
  it('does not notify subscribers', () => {
    const store = build()
    let notifications = 0
    const unsubscribe = store.subscribe(() => {
      notifications += 1
    })

    store.getState().setPage(1) // already 1
    store.getState().setQ('') // already ''

    unsubscribe()
    expect(notifications).toBe(0)
  })
})

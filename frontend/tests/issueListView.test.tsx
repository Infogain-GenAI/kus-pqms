// Tests for the persisted Issue List view.
//
// ─── TWO KINDS OF TEST HERE, AND BOTH ARE NEEDED ─────────────────────────────
//
// The VALIDATION block drives `readIssueListView` directly with blobs a screen
// test cannot produce — truncated JSON, a column removed in a later build, a
// negative page. sessionStorage is writable by anything on the origin and
// outlives a deploy, so those are the realistic inputs, not exotic ones.
//
// The SCREEN block proves the thing the user actually asked for: filter, leave,
// come back, and the filters are still applied. That is unmount-and-remount, not
// a function call, and only a render can show it.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { IssueListScreen } from '@/features/issues/IssueListScreen'
import {
  EMPTY_ISSUE_FILTERS,
  ISSUE_LIST_VIEW_STORAGE_KEY,
  clearIssueListView,
  readIssueListView,
  writeIssueListView,
  type IssueListView,
} from '@/data/issueListView'

const COLUMNS = ['modelCode', 'classification', 'status', 'issueDate', 'linked', 'source', 'severity']

const DEFAULTS: IssueListView = {
  q: '',
  flt: EMPTY_ISSUE_FILTERS,
  cols: ['modelCode', 'status'],
  sort: { key: 'issueDate', dir: 'desc' },
  page: 1,
  pageSize: 20,
}

const read = () => readIssueListView(DEFAULTS, COLUMNS)
/** Writes a raw blob, bypassing the typed writer — the whole point of validation. */
const seedRaw = (raw: string) => sessionStorage.setItem(ISSUE_LIST_VIEW_STORAGE_KEY, raw)

describe('a round trip returns what was stored', () => {
  it('restores every persisted field', () => {
    const stored: IssueListView = {
      q: 'charge port',
      flt: { ...EMPTY_ISSUE_FILTERS, status: 'open', modelCode: 'MV' },
      cols: ['status', 'source'],
      sort: { key: 'severity', dir: 'asc' },
      page: 3,
      pageSize: 50,
    }
    writeIssueListView(stored)
    expect(read()).toEqual(stored)
  })

  it('returns the defaults when nothing is stored', () => {
    clearIssueListView()
    expect(read()).toEqual(DEFAULTS)
  })
})

describe('the stored blob is treated as untrusted input', () => {
  it('falls back on unparseable JSON and DELETES the bad blob', () => {
    seedRaw('{"q":"half-writ')
    expect(read()).toEqual(DEFAULTS)
    // Deleting matters: without it the user hits this branch on every visit for
    // the life of the tab, and the next write has nothing to overwrite cleanly.
    expect(sessionStorage.getItem(ISSUE_LIST_VIEW_STORAGE_KEY)).toBeNull()
  })

  it('falls back when the payload parses to a non-object', () => {
    seedRaw('"just a string"')
    expect(read()).toEqual(DEFAULTS)
    seedRaw('[1,2,3]')
    expect(read()).toEqual(DEFAULTS)
  })

  it('drops filter keys it does not know and non-string values', () => {
    seedRaw(JSON.stringify({ flt: { status: 'open', notAFilter: 'x', modelCode: 42 } }))
    const out = read()
    expect(out.flt.status).toBe('open')
    // A number would reach a <Select value> and never match an option.
    expect(out.flt.modelCode).toBe('')
    expect('notAFilter' in out.flt).toBe(false)
  })

  it('drops columns that no longer exist but KEEPS the stored order', () => {
    // The realistic case: a blob written before a column was removed. Order is
    // preserved because the table renders in this array's order — re-sorting it
    // would silently rearrange the user's table on reload.
    seedRaw(JSON.stringify({ cols: ['source', 'columnDeletedLastRelease', 'status'] }))
    expect(read().cols).toEqual(['source', 'status'])
  })

  it('falls back when every stored column is gone, rather than rendering no columns', () => {
    seedRaw(JSON.stringify({ cols: ['gone', 'alsoGone'] }))
    expect(read().cols).toEqual(DEFAULTS.cols)
  })

  it('de-duplicates repeated columns', () => {
    seedRaw(JSON.stringify({ cols: ['status', 'status', 'source'] }))
    expect(read().cols).toEqual(['status', 'source'])
  })

  it('rejects a sort on a column that is not a column', () => {
    // Sorting by an unknown key compares undefined to undefined for every row,
    // so the order looks random — which reads as corrupted data, not a stale
    // preference.
    seedRaw(JSON.stringify({ sort: { key: 'notAColumn', dir: 'asc' } }))
    expect(read().sort).toEqual(DEFAULTS.sort)
  })

  it('rejects a sort direction that is not asc or desc', () => {
    seedRaw(JSON.stringify({ sort: { key: 'status', dir: 'sideways' } }))
    expect(read().sort).toEqual(DEFAULTS.sort)
  })

  it('rejects page and pageSize values that are not positive integers', () => {
    for (const bad of [0, -3, 1.5, 'two', null]) {
      seedRaw(JSON.stringify({ page: bad, pageSize: bad }))
      expect(read().page).toBe(1)
      expect(read().pageSize).toBe(20)
    }
  })

  it('keeps the good fields when only one field is bad', () => {
    // Partial recovery, not all-or-nothing: losing a page number should not cost
    // the user the filters they spent time building.
    seedRaw(JSON.stringify({ q: 'brake', page: -1 }))
    const out = read()
    expect(out.q).toBe('brake')
    expect(out.page).toBe(1)
  })
})

// ─── The behaviour the change exists for ──────────────────────────────────────

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)
const renderList = () => render(<IssueListScreen />, { wrapper: Wrapped })
const pagingLine = () => {
  const all = screen.getAllByText(/Showing .* issues/i)
  return all[all.length - 1].textContent ?? ''
}
const total = () => Number(/of\s+([\d,]+)\s+issues/i.exec(pagingLine())?.[1]?.replace(/,/g, '') ?? '0')
const search = () => screen.getByPlaceholderText(/search/i)

describe('REGRESSION — the list forgot everything on navigation', () => {
  it('a search survives unmount and remount', () => {
    // Unmounting IS the scenario: the screen unmounts the moment a row is
    // opened, and it was that unmount — not a reload — that discarded the user's
    // filters. `unmount()` reproduces it exactly.
    const first = renderList()
    fireEvent.change(search(), { target: { value: 'charge' } })
    const narrowed = total()
    expect(narrowed).toBeGreaterThan(0)
    first.unmount()

    renderList()
    expect((search() as HTMLInputElement).value).toBe('charge')
    expect(total()).toBe(narrowed)
  })

  it('restores the search box already filtered on FIRST paint', () => {
    // Hydration is a lazy useState initialiser, not an effect, so the restored
    // view is on screen from the first render. An effect would show the full
    // list for a frame and then snap to the filtered one.
    writeIssueListView({ ...DEFAULTS, q: 'charge', cols: ['modelCode', 'status'] })
    renderList()
    expect((search() as HTMLInputElement).value).toBe('charge')
  })

  it('persists an applied filter across a remount', () => {
    const first = renderList()
    fireEvent.click(screen.getByRole('button', { name: /^Filter$/i }))
    fireEvent.change(screen.getByLabelText(/^Status$/i), { target: { value: 'open' } })
    fireEvent.click(screen.getByRole('button', { name: /^Apply$/i }))
    const narrowed = total()
    first.unmount()

    renderList()
    expect(total()).toBe(narrowed)
  })

  it('reopening the drawer shows the RESTORED filter, not an empty draft', () => {
    // The draft is seeded from the applied state on open. If it were seeded from
    // the module default instead, the drawer would show "All" over a list that
    // is visibly filtered — and the next Apply would silently clear it.
    writeIssueListView({ ...DEFAULTS, flt: { ...EMPTY_ISSUE_FILTERS, status: 'open' } })
    renderList()
    fireEvent.click(screen.getByRole('button', { name: /^Filter$/i }))
    expect((screen.getByLabelText(/^Status$/i) as HTMLSelectElement).value).toBe('open')
  })
})

describe('scope is deliberately NOT persisted', () => {
  it('ignores a scope written into the blob and keeps the role default', () => {
    // An SE defaults to "My Issues". A stored scope could seat a user in a scope
    // their current role would not have chosen, so it has no persistence path at
    // all — an extra key in the blob must simply be ignored, not honoured.
    seedRaw(JSON.stringify({ ...DEFAULTS, tab: 'all', scope: 'all' }))
    renderList()

    // Asserted through the ROW COUNT rather than a pressed-state attribute: "My
    // Issues" is a strict subset of "All Issues", so if the stored scope had
    // been honoured the list would open on the larger total. Switching tabs then
    // proves the two differ, which is what makes the first number meaningful.
    const scoped = total()
    fireEvent.click(screen.getAllByRole('button', { name: /All Issues/i })[0])
    expect(total()).toBeGreaterThan(scoped)
  })
})

describe('mounting does not overwrite what is stored', () => {
  it('writes nothing until the view actually changes', () => {
    // A read failure must not be instantly papered over by a write of the
    // defaults — that would destroy the blob a user wants back after a
    // transient error. Also pins the StrictMode hazard: a "have I run yet" flag
    // fails this, because StrictMode runs every effect twice.
    clearIssueListView()
    const { unmount } = renderList()
    expect(sessionStorage.getItem(ISSUE_LIST_VIEW_STORAGE_KEY)).toBeNull()
    unmount()
  })

  it('writes as soon as something IS changed', () => {
    clearIssueListView()
    renderList()
    fireEvent.change(search(), { target: { value: 'charge' } })
    const raw = sessionStorage.getItem(ISSUE_LIST_VIEW_STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!).q).toBe('charge')
  })
})

describe('storage being unavailable is survivable, not fatal', () => {
  // Private-browsing modes and blocked-cookie settings make sessionStorage
  // THROW on access rather than return null. A list screen that cannot be opened
  // in a private window because persistence failed is a far worse bug than one
  // that simply does not remember filters — so every access is guarded, and
  // these pin that the guards actually exist.
  const withBrokenStorage = (fn: () => void) => {
    const real = Object.getOwnPropertyDescriptor(window, 'sessionStorage')
    const boom = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError')
    }
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get: () => ({ getItem: boom, setItem: boom, removeItem: boom, clear: boom }),
    })
    try {
      fn()
    } finally {
      if (real) Object.defineProperty(window, 'sessionStorage', real)
      else delete (window as unknown as Record<string, unknown>).sessionStorage
    }
  }

  it('reading falls back to the defaults instead of throwing', () => {
    withBrokenStorage(() => {
      expect(read()).toEqual(DEFAULTS)
    })
  })

  it('writing fails silently — the screen keeps working, just unpersisted', () => {
    withBrokenStorage(() => {
      expect(() => writeIssueListView(DEFAULTS)).not.toThrow()
    })
  })

  it('clearing fails silently', () => {
    withBrokenStorage(() => {
      expect(() => clearIssueListView()).not.toThrow()
    })
  })

  it('the list still renders with storage unavailable', () => {
    // The assertion that matters: not "the helper returned defaults" but "the
    // user can still use the screen".
    withBrokenStorage(() => {
      renderList()
      expect(total()).toBeGreaterThan(0)
    })
  })
})

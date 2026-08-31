import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useStore } from 'zustand'
import type { DataTableSort } from '@pqms/ui-library'
import { createIssueFiltersStore, type IssueFiltersStore } from '@/stores/issue-management'

/**
 * PERSISTED ISSUE-LIST VIEW STATE — search, filters, sort, page, page size and
 * visible columns, kept for the lifetime of the browser tab.
 *
 * Ported from `stores/issue-management/issue-filters.store.ts` in the Vue app.
 *
 * ─── THE PROBLEM THIS SOLVES ─────────────────────────────────────────────────
 *
 * The list's view state lived in `useState` on the screen. The screen unmounts
 * the moment you open an issue, so filtering a list down to something useful,
 * opening a row and pressing Back returned an unfiltered list at page 1 — the
 * user's work discarded by navigation. Vue never had that failure because the
 * state lived in a store outside the component tree and was mirrored to
 * sessionStorage.
 *
 * ─── WHY sessionStorage AND NOT A CONTEXT PROVIDER ───────────────────────────
 *
 * A provider above the route would fix navigation and nothing else: a reload, a
 * middle-click into a new tab, or a crash still drops everything. sessionStorage
 * covers navigation AND reload with no provider to mount, and it is what Vue
 * settled on. THE KEY IS DELIBERATELY THE SAME STRING Vue uses, so the two apps
 * do not fight over one origin's storage during a phased migration.
 *
 * ─── AND NOT localStorage ────────────────────────────────────────────────────
 *
 * Tab lifetime is the point. Filters are a working context, not a preference:
 * coming back tomorrow to a list still narrowed to one model year from a
 * question you already answered is a bug that presents as missing data. Vue's
 * PRD calls this out as an assumption; it is carried over deliberately, not by
 * copying the API name.
 *
 * ─── WHAT IS NOT PERSISTED, AND WHY THAT IS NOT AN OVERSIGHT ─────────────────
 *
 * `scope` — the My Issues / All Issues tab — has NO persistence path here, and
 * Vue's store carries a long comment saying the same about its own. Scope is
 * derived from the viewer's capability, so a stale one restored from a previous
 * visit could seat a user in a scope their current role would not have chosen.
 * Every fresh mount lands on the role default. Do not "fix" this by adding it.
 *
 * The two drawer DRAFTS are not persisted either, for an unrelated reason: they
 * are seeded from the applied state when a drawer opens, so they have nothing of
 * their own to restore.
 *
 * ─── EVERYTHING READ BACK IS VALIDATED ───────────────────────────────────────
 *
 * sessionStorage is writable by anything running on this origin and survives
 * code changes, so a stored blob is UNTRUSTED INPUT — not merely "our own data
 * from a second ago". Two failure modes are real and neither is exotic: a
 * half-written or hand-edited value, and a payload written by an older build
 * whose filter keys or column keys no longer exist. `readIssueListView` takes
 * only keys it knows, coerces every value to the type the screen expects, and
 * discards the rest. A bad blob costs the user their filters; it must never
 * render an unknown column or put a non-number in `page`.
 */

/** The filter drawer's applied state. Every value is a select/segment key or ''. */
export interface IssueFilterState {
  modelCode: string
  modelYear: string
  system: string
  subSystem: string
  component: string
  symptom: string
  status: string
  source: string
  owner: string
  grouping: string
  dateFrom: string
  dateTo: string
  days: string
  linked: string
  ews: string
}

/**
 * The filter field names, as a runtime value.
 *
 * A TypeScript interface vanishes at compile time, and validation happens at
 * RUNTIME against a string somebody else wrote — so the key list has to exist as
 * data. Derived from `EMPTY_ISSUE_FILTERS` below rather than typed out twice, so
 * adding a filter cannot leave the validator behind.
 */
export const EMPTY_ISSUE_FILTERS: IssueFilterState = {
  modelCode: '',
  modelYear: '',
  system: '',
  subSystem: '',
  component: '',
  symptom: '',
  status: '',
  source: '',
  owner: '',
  grouping: '',
  dateFrom: '',
  dateTo: '',
  days: '',
  linked: '',
  ews: '',
}

const FILTER_KEYS = Object.keys(EMPTY_ISSUE_FILTERS) as (keyof IssueFilterState)[]

/** What the screen keeps, and therefore what is stored. */
export interface IssueListView {
  /** The search box. */
  q: string
  /** Applied filters (not the drawer draft). */
  flt: IssueFilterState
  /** Visible column keys, in the screen's own order. */
  cols: string[]
  sort: DataTableSort
  page: number
  pageSize: number
}

/**
 * ⚠️ THE SAME KEY THE VUE APP USES. Both apps store the same six fields under
 * the same names, so a user moving between them keeps their view rather than
 * having one silently clobber the other's blob.
 */
export const ISSUE_LIST_VIEW_STORAGE_KEY = 'pqms.issue-filters'

/** `unknown` narrowed to a plain object, so property access is safe. */
function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

/** Keeps known filter keys with string values; everything else falls back. */
export function readFilters(raw: unknown, fallback: IssueFilterState): IssueFilterState {
  const rec = asRecord(raw)
  if (!rec) return { ...fallback }
  const out = { ...fallback }
  for (const key of FILTER_KEYS) {
    // Only strings. A number or object here would reach a <Select value> and
    // React would warn, or a comparison below would silently never match.
    if (typeof rec[key] === 'string') out[key] = rec[key] as string
  }
  return out
}

/**
 * Keeps stored columns that still exist, in the STORED order.
 *
 * Order is preserved rather than re-derived because the screen renders columns
 * in the order this array holds them; re-sorting to the canonical order would
 * silently rearrange a user's table on reload. Unknown keys — a column removed
 * since the blob was written — are dropped, since rendering one would throw.
 */
export function readColumns(raw: unknown, allowed: readonly string[], fallback: string[]): string[] {
  if (!Array.isArray(raw)) return [...fallback]
  const seen = new Set<string>()
  const out: string[] = []
  for (const key of raw) {
    if (typeof key === 'string' && allowed.includes(key) && !seen.has(key)) {
      seen.add(key)
      out.push(key)
    }
  }
  // An empty result means the blob named only columns that no longer exist. Fall
  // back rather than render a table with no columns at all.
  return out.length > 0 ? out : [...fallback]
}

export function readSort(raw: unknown, allowed: readonly string[], fallback: DataTableSort): DataTableSort {
  const rec = asRecord(raw)
  if (!rec) return { ...fallback }
  const key = rec.key
  const dir = rec.dir
  // Sorting by a column that no longer exists yields an all-equal comparison and
  // an apparently random order, which reads as corrupted data rather than as a
  // stale preference.
  if (typeof key !== 'string' || !allowed.includes(key)) return { ...fallback }
  if (dir !== 'asc' && dir !== 'desc') return { ...fallback }
  return { key, dir }
}

/** A positive integer, or the fallback. Guards `page: 0` and `page: NaN` alike. */
export function readCount(raw: unknown, fallback: number): number {
  return typeof raw === 'number' && Number.isInteger(raw) && raw > 0 ? raw : fallback
}

/**
 * Reads the stored view, validated against `defaults`.
 *
 * @param allowedColumns every column key the screen can render. Also the set a
 *   stored SORT key must belong to — sorting is by column, so a sort key that is
 *   not a column is not a sort.
 */
export function readIssueListView(
  defaults: IssueListView,
  allowedColumns: readonly string[],
): IssueListView {
  let raw: string | null = null
  try {
    raw = sessionStorage.getItem(ISSUE_LIST_VIEW_STORAGE_KEY)
  } catch {
    // Storage disabled (private mode, blocked cookies). Not an error the user
    // needs told about — the screen simply does not persist, which is exactly
    // how it behaved before this file existed.
    return defaults
  }
  if (!raw) return defaults

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    // Corrupt beyond parsing. Drop it, so the next write starts clean rather
    // than the user hitting this same branch on every visit for the tab's life.
    try {
      sessionStorage.removeItem(ISSUE_LIST_VIEW_STORAGE_KEY)
    } catch {
      /* storage went away between the read and the remove; nothing to do */
    }
    return defaults
  }

  const rec = asRecord(parsed)
  if (!rec) return defaults

  return {
    q: typeof rec.q === 'string' ? rec.q : defaults.q,
    flt: readFilters(rec.flt, defaults.flt),
    cols: readColumns(rec.cols, allowedColumns, defaults.cols),
    sort: readSort(rec.sort, allowedColumns, defaults.sort),
    page: readCount(rec.page, defaults.page),
    pageSize: readCount(rec.pageSize, defaults.pageSize),
  }
}

/** Mirrors the view to storage. Silent on failure — see `readIssueListView`. */
export function writeIssueListView(view: IssueListView): void {
  try {
    sessionStorage.setItem(ISSUE_LIST_VIEW_STORAGE_KEY, JSON.stringify(view))
  } catch {
    /* quota exceeded or storage disabled; the screen keeps working unpersisted */
  }
}

/** Removes the stored view. Exported for tests and for a future "reset view". */
export function clearIssueListView(): void {
  try {
    sessionStorage.removeItem(ISSUE_LIST_VIEW_STORAGE_KEY)
  } catch {
    /* nothing to clear if storage is unavailable */
  }
}

/**
 * The screen's view state — NOW BACKED BY A ZUSTAND `persist` STORE.
 *
 * ─── WHAT MOVED, AND WHAT DID NOT ────────────────────────────────────────────
 *
 * The state and its sessionStorage mirroring used to live here in `useState`
 * plus an effect. They now live in `stores/issue-management/issue-filters.store.ts` under
 * `persist`, per `04-state-management.md`'s "Issue-filters persistence".
 *
 * ⚠️ THE RETURNED SHAPE IS BYTE-FOR-BYTE THE SAME, and that is the point. Each
 * setter still has React's own `Dispatch<SetStateAction<T>>` signature, so the
 * screen's `setPage(1)` and `setFlt((f) => ({ ...f, status: s }))` calls are
 * unchanged and every one of this module's 23 tests runs against the new
 * implementation without being touched.
 *
 * The four validators above did not move either — the store's `merge` imports
 * and calls THESE. Reimplementing them inside the store would have created two
 * copies of the untrusted-input rules, free to disagree on exactly the blobs
 * they exist to handle.
 *
 * ─── ⚠️ WHY THE STORE IS BUILT LAZILY AND REHYDRATED ON EVERY MOUNT ──────────
 *
 * A Zustand store is a module singleton created once per process. That is wrong
 * for this hook in two ways, and both are load-bearing:
 *
 * 1. `defaults` and `allowedColumns` arrive as ARGUMENTS, from the screen's own
 *    column definitions. The store cannot validate a stored blob without them,
 *    so it cannot exist before the first call.
 * 2. The previous implementation read storage on EVERY mount, in a lazy
 *    initialiser. Anything else changes behaviour: mount, unmount, write to
 *    storage from elsewhere, remount — the singleton would still hold its stale
 *    in-memory copy and ignore what storage now says. `rehydrate()` here keeps
 *    storage authoritative, exactly as before.
 *
 * Hydration stays SYNCHRONOUS and inside the initialiser, so the first paint
 * already shows the restored view. An effect would render the unfiltered list
 * for a frame and then snap to the filtered one.
 */
let storeRef: IssueFiltersStore | null = null


export function useIssueListView(
  defaults: IssueListView,
  allowedColumns: readonly string[],
  initialScope: 'my' | 'all',
): {
  view: IssueListView
  scope: 'my' | 'all'
  setScope: (next: 'my' | 'all') => void
  setQ: Dispatch<SetStateAction<string>>
  setFlt: Dispatch<SetStateAction<IssueFilterState>>
  setCols: Dispatch<SetStateAction<string[]>>
  setSort: Dispatch<SetStateAction<DataTableSort>>
  setPage: Dispatch<SetStateAction<number>>
  setPageSize: Dispatch<SetStateAction<number>>
} {
  const store = useState(() => {
    if (!storeRef) storeRef = createIssueFiltersStore(defaults, allowedColumns)
    // Re-read storage on mount. `sessionStorage` is synchronous, so the merged
    // state is in place before this initialiser returns and therefore before the
    // first render reads it.
    void storeRef.persist.rehydrate()

    /*
     * ⚠️ SCOPE IS RE-SEEDED FROM THE ROLE ON EVERY MOUNT, and that IS its
     * persistence policy rather than an omission. 04: "Scope always resets to
     * the role-derived default on mount, never restores from a previous
     * session… restoring a stale one would show a returning user a scope their
     * current role may not warrant."
     *
     * Seeded HERE, inside the same initialiser, because the store is a singleton
     * that outlives the screen: without this, unmounting and remounting would
     * keep whichever scope was last selected, which is precisely the restore
     * that 04 forbids.
     */
    storeRef.getState().setScope(initialScope)
    return storeRef
  })[0]

  const q = useStore(store, (s) => s.q)
  const flt = useStore(store, (s) => s.flt)
  const cols = useStore(store, (s) => s.cols)
  const sort = useStore(store, (s) => s.sort)
  const page = useStore(store, (s) => s.page)
  const pageSize = useStore(store, (s) => s.pageSize)
  const scope = useStore(store, (s) => s.scope)

  /*
   * `view` is rebuilt only when one of the six actually changes. The screen
   * destructures it and passes several fields into memo dependency lists, where
   * a fresh object every render would re-run filtering and sorting on every
   * unrelated re-render.
   */
  const view = useMemo<IssueListView>(
    () => ({ q, flt, cols, sort, page, pageSize }),
    [q, flt, cols, sort, page, pageSize],
  )

  /*
   * The setters come straight off the store, so their identities are stable for
   * the store's lifetime — the same guarantee the old `useMemo`-built setters
   * gave, now for free.
   */
  const s = store.getState()
  return {
    view,
    scope,
    setScope: s.setScope,
    setQ: s.setQ,
    setFlt: s.setFlt,
    setCols: s.setCols,
    setSort: s.setSort,
    setPage: s.setPage,
    setPageSize: s.setPageSize,
  }
}

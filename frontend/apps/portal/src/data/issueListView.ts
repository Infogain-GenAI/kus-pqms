import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { DataTableSort } from '@pqms/ui-library'

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
function readFilters(raw: unknown, fallback: IssueFilterState): IssueFilterState {
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
function readColumns(raw: unknown, allowed: readonly string[], fallback: string[]): string[] {
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

function readSort(raw: unknown, allowed: readonly string[], fallback: DataTableSort): DataTableSort {
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
function readCount(raw: unknown, fallback: number): number {
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
 * The screen's view state, hydrated from storage and mirrored back to it.
 *
 * ─── IT RETURNS PER-FIELD SETTERS, AND THAT IS THE POINT ─────────────────────
 *
 * Each setter has React's own `Dispatch<SetStateAction<T>>` signature, so the
 * screen's existing `setPage(1)` and `setFlt((f) => ({ ...f, status: s }))`
 * calls work unchanged. Persistence is therefore invisible at the call sites —
 * which is what stops the next person adding a seventh piece of view state and
 * forgetting to persist it. The alternative, one storage key per field, would
 * spread the same decision over six places and diverge from Vue's single blob.
 *
 * Hydration runs in a LAZY initialiser, so storage is read once on mount rather
 * than on every render, and the first paint already shows the restored view —
 * no flash of an unfiltered list settling into a filtered one.
 */
export function useIssueListView(
  defaults: IssueListView,
  allowedColumns: readonly string[],
): {
  view: IssueListView
  setQ: Dispatch<SetStateAction<string>>
  setFlt: Dispatch<SetStateAction<IssueFilterState>>
  setCols: Dispatch<SetStateAction<string[]>>
  setSort: Dispatch<SetStateAction<DataTableSort>>
  setPage: Dispatch<SetStateAction<number>>
  setPageSize: Dispatch<SetStateAction<number>>
} {
  const [view, setView] = useState<IssueListView>(() => readIssueListView(defaults, allowedColumns))

  /*
   * Mirror on change.
   *
   * An effect rather than a write inside each setter: a setter can be called
   * twice in one event (Apply sets filters AND resets the page), and writing
   * from the setter would persist the intermediate state and then the final one.
   * The effect sees only what React committed.
   *
   * Nothing is written until the view actually CHANGES. Without that, mounting
   * the screen immediately re-writes what was just read — harmless in itself,
   * but it means a storage failure at read time is instantly papered over by a
   * write of the defaults, destroying the very blob the user would want back
   * after a transient error.
   *
   * ⚠️ THE GUARD COMPARES OBJECT IDENTITY, NOT A "have I run yet" FLAG. A flag
   * is wrong here and was wrong at first: `<StrictMode>` — which this app mounts
   * in dev — deliberately runs every effect twice, so the flag is already true
   * on the second run and the mount write happens anyway. Identity has no such
   * hole: `setView` always produces a NEW object, so `view` can only still be
   * the hydrated one while nothing has been changed, no matter how many times
   * React chooses to run this.
   */
  const hydrated = useRef(view)
  useEffect(() => {
    if (view === hydrated.current) return
    writeIssueListView(view)
  }, [view])

  /*
   * The six setters, built ONCE.
   *
   * `useMemo` around the whole set rather than a `useCallback` per field: the
   * factory below is an ordinary function, not a hook, so it can be called in a
   * loop or conditionally without the hook-order hazard that a `useCallback`
   * inside a helper would carry. `setView`'s identity is guaranteed stable by
   * React, so the empty dependency list is honest — these never need rebuilding.
   *
   * Stable identities matter here: the screen passes several of these straight
   * to memoised children and effect dependency lists, where a new function each
   * render would re-run work on every keystroke.
   *
   * Each setter takes the value OR an updater, matching `useState`, and returns
   * the previous view untouched when the value did not actually change — so
   * setting a field to what it already holds does not re-render or re-persist.
   */
  const setters = useMemo(() => {
    const field = <K extends keyof IssueListView>(key: K): Dispatch<SetStateAction<IssueListView[K]>> =>
      (next) =>
        setView((prev) => {
          const value =
            typeof next === 'function'
              ? (next as (p: IssueListView[K]) => IssueListView[K])(prev[key])
              : next
          return Object.is(value, prev[key]) ? prev : { ...prev, [key]: value }
        })

    return {
      setQ: field('q'),
      setFlt: field('flt'),
      setCols: field('cols'),
      setSort: field('sort'),
      setPage: field('page'),
      setPageSize: field('pageSize'),
    }
  }, [])

  return { view, ...setters }
}

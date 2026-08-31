import { createStore } from 'zustand/vanilla'
import { persist, type PersistStorage } from 'zustand/middleware'
import type { DataTableSort } from '@pqms/ui-library'
import {
  ISSUE_LIST_VIEW_STORAGE_KEY,
  readColumns,
  readCount,
  readFilters,
  readSort,
  type IssueFilterState,
  type IssueListView,
} from '@/data/issueListView'

/**
 * ISSUE-LIST FILTERS — the second of the two stores `04-state-management.md`
 * names, and the one it specifies in the most detail.
 *
 * 04: *"100% client/UI state, no server data at all."* Correct even though the
 * values end up as query parameters — 04's test is ownership, not shape: *"a
 * sort direction is client state even if you send it to the server as a query
 * parameter."*
 *
 * ─── ⚠️ THIS STORE IS CREATED BY A FACTORY, NOT AT MODULE SCOPE ──────────────
 *
 * Every other store in this app is a module singleton. This one cannot be,
 * because two things `persist` needs are supplied by the CONSUMER at call time:
 *
 *   • `defaults`        — the view a first-time visitor sees.
 *   • `allowedColumns`  — every column key the screen can render, which is also
 *                         the set a stored SORT key must belong to.
 *
 * Both are derived from the column definitions inside `IssueListScreen`, and the
 * custom `merge` below cannot validate a stored blob without them. Hoisting them
 * into this module would mean dragging the screen's column table down with them.
 * So the store is built on first use and reused after that.
 *
 * ─── THE THREE `persist` BEHAVIOURS 04 REQUIRES, NONE OF WHICH IT SUPPLIES ───
 *
 * 04 is emphatic that *"adding `persist` alone is not sufficient"*, and names
 * three behaviours the middleware does not give you. All three are below, each
 * marked. They were all present in the hand-rolled implementation this replaces,
 * which is why this migration must not quietly lose them.
 */

/** What the screen keeps, plus the one field that is deliberately not persisted. */
export interface IssueFiltersState extends IssueListView {
  /**
   * My Issues / All Issues.
   *
   * ⚠️ IN THE STORE, BUT NEVER IN STORAGE — see `partialize`. 04 requires the
   * field here and requires it excluded from the persisted payload, and those
   * are not in tension: scope is live client state that resets from the viewer's
   * role on every mount.
   */
  scope: 'my' | 'all'

  setQ: (next: string | ((prev: string) => string)) => void
  setFlt: (next: IssueFilterState | ((prev: IssueFilterState) => IssueFilterState)) => void
  setCols: (next: string[] | ((prev: string[]) => string[])) => void
  setSort: (next: DataTableSort | ((prev: DataTableSort) => DataTableSort)) => void
  setPage: (next: number | ((prev: number) => number)) => void
  setPageSize: (next: number | ((prev: number) => number)) => void
  setScope: (next: 'my' | 'all') => void
  /** 04 names this action explicitly. Resets every filter, leaving search and columns. */
  clearAll: () => void
  /** 04 names this one too. Restores the default visible columns and their order. */
  resetVisibleColumns: () => void
}

/** The persisted half. `scope` and the actions are absent by construction. */
type PersistedView = IssueListView

/**
 * The persisted slice, as ONE function used by both `partialize` and the
 * storage handler's no-op guard. Two copies could disagree about what counts as
 * "the same payload", and the guard would then either write too often or, far
 * worse, skip a write that mattered.
 *
 * ⚠️ LISTS THE FIELDS POSITIVELY rather than deleting `scope` from the state. A
 * subtractive version silently starts persisting anything added later —
 * including the next field somebody decides is role-derived.
 */
function partializeView(state: IssueListView): PersistedView {
  return {
    q: state.q,
    flt: state.flt,
    cols: state.cols,
    sort: state.sort,
    page: state.page,
    pageSize: state.pageSize,
  }
}

/**
 * ⚠️ REQUIREMENT 3 — CORRUPTED-JSON RECOVERY, WITH A DELETE.
 *
 * 04: *"On a parse failure: catch it and **delete** the corrupted
 * `sessionStorage` key, so the next load starts clean. `persist`'s default is a
 * console error with no cleanup, which leaves the bad key in place to fail again
 * on every subsequent load."*
 *
 * The deletion is the part that matters. Without it the user hits this branch on
 * every visit for the life of the tab, and each failure looks like fresh data
 * loss rather than one bad write.
 *
 * ⚠️ EVERY ACCESS IS ALSO GUARDED AGAINST STORAGE THROWING. Private-browsing
 * modes and blocked-cookie settings make `sessionStorage` throw on ACCESS rather
 * than return null. A list screen that cannot be opened in a private window
 * because persistence failed is a far worse bug than one that does not remember
 * filters, so a storage failure degrades to "unpersisted" and never propagates.
 *
 * ─── ⚠️ AND IT WRITES A FLAT BLOB, NOT `persist`'s `{state, version}` ENVELOPE ─
 *
 * `createJSONStorage` — the obvious thing to reach for here — stores
 * `{"state":{…},"version":0}`. This one reads and writes the six fields at the
 * TOP LEVEL instead, unwrapping into the envelope on the way in and out.
 *
 * That is not a stylistic preference. `data/issueListView.ts` records that the
 * storage key is *deliberately the same string the Vue app uses, "so the two
 * apps do not fight over one origin's storage during a phased migration"* — and
 * a shared key is only shared if the SHAPE matches too. Adopting the envelope
 * would leave both apps writing incompatible payloads to one key, each silently
 * discarding the other's, which is worse than not sharing at all.
 *
 * It also keeps `readIssueListView`/`writeIssueListView` — still exported, still
 * used to seed and inspect storage — reading the same bytes this store writes.
 */
function safeSessionStorage(defaults: IssueListView): PersistStorage<PersistedView> {
  /*
   * ⚠️ THE LAST PAYLOAD WRITTEN OR READ, SO AN IDENTICAL ONE IS NOT REWRITTEN.
   *
   * `persist` writes on EVERY state change, and `partialize` does not change
   * that — it only decides what goes into the payload. So changing a field that
   * is deliberately excluded (`scope`) still triggers a full write of the
   * persisted slice, with identical contents.
   *
   * That is not merely wasteful, and this guard is not an optimisation. The
   * screen re-seeds `scope` from the viewer's role on every mount, so without
   * this a MOUNT would write the payload — and a mount that writes the defaults
   * destroys the very blob a user wants back after a transient read failure.
   * The hand-rolled implementation this replaces guarded the same case by
   * comparing object identity against the hydrated value; this is that guard,
   * moved to the boundary where `persist` actually writes.
   *
   * Seeded with the SERIALISED DEFAULTS rather than null, so "nothing stored,
   * nothing changed yet" is also recognised as a no-op write.
   */
  let lastPayload = JSON.stringify(partializeView(defaults))

  return {
    getItem: (name) => {
      /*
       * ⚠️ EVERY READ RE-ESTABLISHES THE BASELINE, and it has to.
       *
       * The store is a singleton but this hook re-reads storage on every mount,
       * and storage can change underneath it — cleared by the user, by another
       * tab, or between two tests in one file. A baseline left over from the
       * previous mount would make the guard below skip a write that mattered,
       * or allow one that should have been skipped. Whatever the read finds is
       * the truth this write cycle is measured against.
       */
      const defaultPayload = JSON.stringify(partializeView(defaults))

      let raw: string | null = null
      try {
        raw = sessionStorage.getItem(name)
      } catch {
        // Storage disabled (private mode, blocked cookies). Not an error the
        // user needs told about — the screen simply does not persist, which is
        // exactly how it behaved before persistence existed.
        lastPayload = defaultPayload
        return null
      }
      if (!raw) {
        // Nothing stored: the defaults ARE the current truth, so writing them
        // back adds nothing. This is what keeps a mount from papering over a
        // cleared or failed read with a write of the defaults.
        lastPayload = defaultPayload
        return null
      }

      try {
        const state = JSON.parse(raw) as PersistedView
        // What is on disk is now the baseline: re-writing it verbatim is a no-op.
        lastPayload = raw
        return { state }
      } catch {
        // ⚠️ REQUIREMENT 3, THE ACTUAL DELETE. Corrupt beyond parsing. Drop the
        // key so the next write starts clean, rather than the user hitting this
        // same branch on every visit for the life of the tab.
        try {
          sessionStorage.removeItem(name)
        } catch {
          /* storage went away between the read and the remove; nothing to do */
        }
        lastPayload = defaultPayload
        return null
      }
    },

    setItem: (name, value) => {
      const payload = JSON.stringify(value.state)
      if (payload === lastPayload) return
      lastPayload = payload
      try {
        sessionStorage.setItem(name, payload)
      } catch {
        /* quota exceeded or storage disabled; the screen keeps working unpersisted */
      }
    },

    removeItem: (name) => {
      try {
        sessionStorage.removeItem(name)
      } catch {
        /* nothing to clear if storage is unavailable */
      }
    },
  }
}

export function createIssueFiltersStore(defaults: IssueListView, allowedColumns: readonly string[]) {
  /**
   * Applies a value-or-updater, skipping the write entirely when nothing changed.
   *
   * ⚠️ IT RETURNS EARLY RATHER THAN RETURNING AN EMPTY PATCH, and the difference
   * is not cosmetic. Zustand merges a partial into a NEW state object and then
   * notifies, so `set(() => ({}))` still re-renders every subscriber and still
   * triggers a persist write — a no-op that costs exactly as much as a real
   * change. Only not calling `set` is actually a no-op.
   *
   * This matters because the screen sets fields to their current value on some
   * paths (re-applying an unchanged filter, paging to the page you are on).
   */
  const field =
    <K extends keyof IssueListView>(
      set: (patch: Partial<IssueFiltersState>) => void,
      get: () => IssueFiltersState,
      key: K,
    ) =>
    (next: IssueListView[K] | ((prev: IssueListView[K]) => IssueListView[K])) => {
      const prev = get()[key]
      const value =
        typeof next === 'function'
          ? (next as (p: IssueListView[K]) => IssueListView[K])(prev)
          : next
      if (Object.is(value, prev)) return
      set({ [key]: value } as Partial<IssueFiltersState>)
    }

  return createStore<IssueFiltersState>()(
    persist(
      (set, get) => ({
        ...defaults,
        scope: 'my',

        setQ: field(set, get, 'q'),
        setFlt: field(set, get, 'flt'),
        setCols: field(set, get, 'cols'),
        setSort: field(set, get, 'sort'),
        setPage: field(set, get, 'page'),
        setPageSize: field(set, get, 'pageSize'),

        setScope: (next) => {
          if (get().scope === next) return
          set({ scope: next })
        },

        clearAll: () => set({ flt: defaults.flt, page: 1 }),
        resetVisibleColumns: () => set({ cols: [...defaults.cols] }),
      }),
      {
        name: ISSUE_LIST_VIEW_STORAGE_KEY,
        storage: safeSessionStorage(defaults),

        /*
         * ⚠️ REQUIREMENT 1 — `scope` IS EXCLUDED FROM THE PERSISTED PAYLOAD.
         *
         * 04: *"Scope always resets to the role-derived default on mount, never
         * restores from a previous session. This is deliberate: scope is derived
         * from who you are, so restoring a stale one would show a returning user
         * a scope their current role may not warrant."*
         *
         * Note this lists the persisted fields POSITIVELY rather than deleting
         * `scope` from the state. A subtractive partialize silently starts
         * persisting anything added later — including the next field somebody
         * decides is role-derived.
         */
        partialize: (state) => partializeView(state),

        /*
         * ⚠️ REQUIREMENT 2 — PER-FIELD DEFENSIVE FALLBACK.
         *
         * 04: *"On partially-malformed saved data, each field falls back to its
         * default **independently** — one bad field must not discard the rest.
         * `persist`'s default shallow-spread merge does not do this."*
         *
         * The reason it matters is a user one: losing a page number should not
         * cost somebody the filters they spent five minutes building.
         *
         * ⚠️ THE STORED BLOB IS UNTRUSTED INPUT, NOT "OUR OWN DATA FROM A SECOND
         * AGO". sessionStorage is writable by anything on this origin and
         * survives a deploy, so the two realistic failures are a hand-edited
         * value and a payload written by an OLDER BUILD whose column keys no
         * longer exist. Rendering a column that no longer exists throws; a sort
         * on a missing key compares undefined to undefined for every row and
         * looks like corrupted data rather than a stale preference.
         *
         * The validators are the same ones `readIssueListView` uses, imported
         * rather than reimplemented — two copies of this logic would be free to
         * disagree, and the disagreement would only show up on a bad blob.
         */
        merge: (persisted, current) => {
          const raw = (persisted ?? {}) as Record<string, unknown>
          return {
            ...current,
            q: typeof raw.q === 'string' ? raw.q : defaults.q,
            flt: readFilters(raw.flt, defaults.flt),
            cols: readColumns(raw.cols, allowedColumns, defaults.cols),
            sort: readSort(raw.sort, allowedColumns, defaults.sort),
            page: readCount(raw.page, defaults.page),
            pageSize: readCount(raw.pageSize, defaults.pageSize),
          }
        },
      },
    ),
  )
}

/**
 * The store's own type, INFERRED rather than annotated.
 *
 * `persist` augments the store API with a `persist` property (`rehydrate`,
 * `clearStorage`, and the rest), and a hand-written `StoreApi<IssueFiltersState>`
 * annotation erases it — the middleware's additions are exactly what the
 * annotation drops. Inferring keeps them.
 */
export type IssueFiltersStore = ReturnType<typeof createIssueFiltersStore>

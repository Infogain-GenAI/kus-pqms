import type { StatusKey } from '@pqms/ui-library'
import { ISSUES } from '@/data/seed'
import { daysOpen } from '@/data/util'
import type { Issue } from '@/data/types'
import { simulateLatency } from './fixture-latency'

/**
 * FIXTURE-BACKED ISSUE ENDPOINTS.
 *
 * Ported in shape from Vue's `api/issues.ts`. This is the stand-in "server":
 * it reads `data/seed.ts` and answers the same queries the real endpoint will.
 *
 * ─── THE ONE RULE THAT MAKES THIS WORTH HAVING ───────────────────────────────
 *
 * FILTERING, SORTING AND PAGING HAPPEN INSIDE THIS MODULE, never in a consuming
 * component. That is the property that makes the fixture path a faithful
 * rehearsal for the real one: a component that receives a pre-paged 20 rows and
 * a total count cannot accidentally be written against "all the data is already
 * here", which is the assumption that breaks on the day a real server-paginated
 * endpoint is switched on.
 *
 * Vue's file is 2,595 lines because it also carries its own fixture DATA. This
 * one does not — `data/seed.ts` already holds it, and forking a second copy of
 * the seed to match the Vue file's shape would create exactly the drift this
 * layer exists to avoid.
 *
 * ─── IT DOES NOT MUTATE THE STORE, AND MUST NOT ──────────────────────────────
 *
 * Every function here is a READ. The in-memory store (`data/store.tsx`) is still
 * the app's source of truth for writes, and this layer is not yet wired to any
 * screen — see `services/index.ts` for the switch, and the note in
 * `config/data-source.ts` about what is and is not live.
 */

/* -------------------------------------------------------------------------- */
/* Query + result contract                                                    */
/* -------------------------------------------------------------------------- */

export type IssueSortDirection = 'asc' | 'desc'

/**
 * What a caller asks the list endpoint for.
 *
 * Shaped as a REQUEST, not as a set of client-side predicates: `page`/`pageSize`
 * rather than a slice, `sortBy`/`sortDir` rather than a comparator. It is the
 * shape the real `GET /api/v1/issues` takes.
 */
export interface IssueListQuery {
  /** Free-text across id, title, model, owner. */
  search?: string
  status?: StatusKey[]
  model?: string[]
  modelCode?: string[]
  owner?: string[]
  system?: string[]
  /** `own` restricts to issues the named user owns or is assigned. */
  scope?: 'all' | 'own'
  /** Required when `scope` is `own`. */
  scopeUser?: string
  sortBy?: string
  sortDir?: IssueSortDirection
  /** 1-based, matching the UI's own paging. */
  page?: number
  pageSize?: number
}

/**
 * `rows` is ONE PAGE; `total` is the count across the whole filtered set.
 *
 * Both are needed and neither can be derived from the other — that is the
 * contract a paginated list has, and returning only rows is what forces a
 * consumer to guess at the total.
 */
export interface IssueListResult {
  rows: Issue[]
  total: number
}

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

/** Sortable columns → the value to compare. Unknown keys fall back to id. */
const SORT_VALUE: Record<string, (i: Issue) => string | number> = {
  id: (i) => i.id,
  title: (i) => i.title.toLowerCase(),
  status: (i) => i.status,
  model: (i) => i.model,
  modelCode: (i) => i.modelCode,
  modelYear: (i) => i.modelYear,
  owner: (i) => i.owner,
  issueDate: (i) => i.reportedDate,
  days: (i) => daysOpen(i.reportedDate, i.closedAt),
}

function compare(a: Issue, b: Issue, sortBy: string, dir: IssueSortDirection): number {
  const read = SORT_VALUE[sortBy] ?? SORT_VALUE.id
  const av = read(a)
  const bv = read(b)
  const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
  return dir === 'asc' ? cmp : -cmp
}

/* -------------------------------------------------------------------------- */
/* Endpoints                                                                  */
/* -------------------------------------------------------------------------- */

const has = (list: string[] | undefined, value: string | undefined) =>
  !list || list.length === 0 || (value !== undefined && list.includes(value))

/** `GET /issues` — filtered, sorted and paged server-side. */
export async function fetchIssues(query: IssueListQuery = {}): Promise<IssueListResult> {
  await simulateLatency()

  const {
    search = '',
    status,
    model,
    modelCode,
    owner,
    system,
    scope = 'all',
    scopeUser,
    sortBy = 'issueDate',
    sortDir = 'desc',
    page = 1,
    pageSize = 20,
  } = query

  const needle = search.trim().toLowerCase()

  const filtered = ISSUES.filter((i) => {
    /*
     * Scope is checked FIRST and separately from the field filters, because it
     * answers a different question — "may I see this / is it mine" rather than
     * "does it match what I typed". Folding it in with the rest would make an
     * empty `scopeUser` silently widen the result set.
     */
    if (scope === 'own' && scopeUser && i.owner !== scopeUser && i.assignee !== scopeUser) return false

    if (!has(status, i.status)) return false
    if (!has(model, i.model)) return false
    if (!has(modelCode, i.modelCode)) return false
    if (!has(owner, i.owner)) return false
    if (!has(system, i.system)) return false

    if (needle) {
      const hay = `${i.id} ${i.title} ${i.model} ${i.modelCode} ${i.system ?? ''} ${i.owner} ${i.assignee ?? ''}`.toLowerCase()
      if (!hay.includes(needle)) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => compare(a, b, sortBy, sortDir))

  /*
   * `total` is taken BEFORE slicing. Reading it from the page would report 20
   * for every result set of any size — the classic paginated-list bug, and one
   * that looks correct until someone reaches page 2.
   */
  const total = sorted.length
  const start = Math.max(0, (page - 1) * pageSize)

  return { rows: sorted.slice(start, start + pageSize), total }
}

/**
 * `GET /issues/{id}`.
 *
 * Resolves to `null` for a missing record rather than rejecting: "not found" is
 * an ANSWER to this question, not a failure of it, and a caller that has to
 * catch in order to render an empty state will eventually catch a real error
 * too and render the same empty state.
 */
export async function fetchIssueById(id: string): Promise<Issue | null> {
  await simulateLatency()
  return ISSUES.find((i) => i.id === id) ?? null
}

/** `GET /issues/scope-counts` — the My Issues / All Issues tab counts. */
export async function fetchIssueScopeCounts(user: string): Promise<{ own: number; all: number }> {
  await simulateLatency()
  return {
    own: ISSUES.filter((i) => i.owner === user || i.assignee === user).length,
    all: ISSUES.length,
  }
}

/** `GET /issues/kpi-summary` — one count per status, plus the total. */
export async function fetchIssueKpiCounts(): Promise<{ total: number; byStatus: Record<string, number> }> {
  await simulateLatency()
  const byStatus: Record<string, number> = {}
  for (const i of ISSUES) byStatus[i.status] = (byStatus[i.status] ?? 0) + 1
  return { total: ISSUES.length, byStatus }
}

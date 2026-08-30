import { get } from '@/shared/http'
import type { IssueListQuery, IssueListResult } from '@/api/issues'
import type { Issue } from '@/data/types'
import {
  fromBackendPage,
  serializeListParams,
  toIssue,
  type BackendIssueSummaryDto,
  type BackendPageResponse,
} from './issue.mappers'

/**
 * REAL-API ISSUE SERVICE.
 *
 * Ported in shape from Vue's `services/issue.service.ts`. Mirrors the read
 * operations in `api/issues.ts` — the fixture layer, which is UNCHANGED and
 * still the default source — as typed calls over the centralised
 * `@/shared/http` client.
 *
 * Types come from `@/api/issues` and are never redeclared, so the fixture and
 * live paths are provably interchangeable: both satisfy the same signature, and
 * `services/index.ts` picks between them.
 *
 * ⚠️ NO BACKEND EXISTS FOR THIS APP YET. Every URL below follows the Vue app's
 * contract and is UNVERIFIED here — see `issue.mappers.ts`. Nothing calls this
 * module while `VITE_USE_FIXTURES` is anything but the exact string `"false"`.
 */

/** `GET /issues` — server-filtered, sorted and paged. */
export function listIssues(query: IssueListQuery = {}): Promise<IssueListResult> {
  return get<BackendPageResponse<BackendIssueSummaryDto>>('/issues', {
    params: serializeListParams(query),
  }).then(fromBackendPage)
}

/**
 * `GET /issues/{id}`.
 *
 * A 404 resolves to `null` rather than rejecting, so this matches the fixture
 * function's contract exactly. Any OTHER failure still rejects — collapsing a
 * 500 into "not found" would show an empty state for an outage and nobody would
 * know the backend was down.
 */
export async function getIssueById(id: string): Promise<Issue | null> {
  try {
    return toIssue(await get<BackendIssueSummaryDto>(`/issues/${encodeURIComponent(id)}`))
  } catch (err) {
    if (typeof err === 'object' && err !== null && (err as { status?: number }).status === 404) return null
    throw err
  }
}

/** `GET /issues/scope-counts`. */
export function getIssueScopeCounts(user: string): Promise<{ own: number; all: number }> {
  return get<{ own: number; all: number }>('/issues/scope-counts', { params: { ownerUserId: user } })
}

/** `GET /issues/kpi-summary`. */
export function getIssueKpiCounts(): Promise<{ total: number; byStatus: Record<string, number> }> {
  return get<{ total: number; byStatus: Record<string, number> }>('/issues/kpi-summary')
}

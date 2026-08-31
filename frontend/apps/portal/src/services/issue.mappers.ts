import type { IssueListQuery, IssueListResult } from '@/api/issues'
import type { StatusKey } from '@pqms/ui-library'
import type { Issue } from '@/data/types'

/**
 * THE ONLY PLACE THE BACKEND'S SHAPE IS KNOWN.
 *
 * Ported from Vue's `services/issue.mappers.ts`, whose header states the rule
 * this file exists to enforce: backend param names, casing and enum values live
 * HERE, and `issue.service.ts` calls into this module rather than knowing any of
 * them. Nothing else in the app talks to the backend's shape directly.
 *
 * ─── WHY A MAPPER LAYER RATHER THAN JUST USING THE BACKEND'S TYPES ───────────
 *
 * Because the two vocabularies genuinely differ and always will. The backend
 * speaks `UPPER_SNAKE` enums, 0-based pages and `content`/`totalElements`; this
 * app speaks camelCase keys, 1-based pages and `rows`/`total`. Letting the
 * backend's shape reach a component means every rename on the server is a change
 * across the UI — and it means a screen cannot be tested without knowing the
 * wire format.
 *
 * ⚠️ THESE MAPS ARE PROVISIONAL. No backend exists for this app yet (see
 * `config/data-source.ts`). The enum values below follow the Vue app's contract,
 * which was derived from a real Postman collection — they are the best available
 * guess, NOT a verified contract, and every one must be confirmed against the
 * real API before the live branch is switched on. Recorded here rather than
 * discovered later by a silent mis-map.
 */

/* -------------------------------------------------------------------------- */
/* Enum maps                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * This app's status vocabulary → the backend's.
 *
 * NOTE THE TWO VOCABULARIES ARE NOT THE SAME SIZE. Vue carries ten statuses
 * (including `draft`, `pendingApproval` and `resolved`); this app's prototype
 * vocabulary has seven. Only the seven are mapped — inventing entries for
 * statuses this app cannot produce would create dead code that looks like a
 * contract.
 */
export const STATUS_TO_BACKEND: Record<StatusKey, string> = {
  open: 'OPEN',
  review: 'IN_REVIEW',
  monitoring: 'MONITORING',
  escalated: 'ESCALATED',
  topissue: 'TOP_ISSUE',
  outofscope: 'OUT_OF_SCOPE',
  closed: 'CLOSED',
}

/**
 * The reverse map, DERIVED rather than typed out.
 *
 * Two hand-maintained tables drift the moment someone edits one — and the
 * failure is silent, because a missing reverse entry just yields `undefined` and
 * renders a blank status.
 */
export const STATUS_FROM_BACKEND: Record<string, StatusKey> = Object.fromEntries(
  Object.entries(STATUS_TO_BACKEND).map(([app, backend]) => [backend, app as StatusKey]),
)

/**
 * Maps a backend status, falling back to `open` for one this app does not know.
 *
 * A FALLBACK, NOT A THROW: the backend's vocabulary is larger, so an unmapped
 * value is an expected condition rather than corruption. Rejecting the whole
 * page because one row has a status added server-side would take the list down
 * for a change that should have been invisible.
 */
export function statusFromBackend(value: string): StatusKey {
  return STATUS_FROM_BACKEND[value] ?? 'open'
}

/* -------------------------------------------------------------------------- */
/* Request mapping                                                            */
/* -------------------------------------------------------------------------- */

/** The backend's page envelope. */
export interface BackendPageResponse<T> {
  content: T[]
  totalElements: number
  /** 0-based. See `serializeListParams`. */
  number?: number
  size?: number
}

/** The row shape `GET /issues` returns. */
export interface BackendIssueSummaryDto {
  issueId: string
  title: string
  description?: string
  status: string
  modelName?: string
  modelCode?: string
  modelYear?: number
  systemName?: string
  subSystemName?: string
  componentName?: string
  symptomName?: string
  ownerUserId?: string
  assigneeUserId?: string
  reportedDate?: string
  createdAt?: string
  updatedAt?: string
  closedAt?: string
  ewsFlag?: boolean
  linkedIssueIds?: string[]
}

/**
 * `IssueListQuery` → query parameters.
 *
 * ⚠️ THE PAGE NUMBER IS CONVERTED FROM 1-BASED TO 0-BASED. This app and its UI
 * count pages from 1; Spring's `Pageable` counts from 0. Off-by-one here shows
 * page 2's rows under the heading "page 1" and silently hides the first twenty
 * records — the kind of bug that gets reported as missing data.
 */
export function serializeListParams(query: IssueListQuery): Record<string, unknown> {
  const { page = 1, pageSize = 20, sortBy, sortDir = 'desc', status, scope, scopeUser, search, ...rest } = query

  return {
    page: Math.max(0, page - 1),
    size: pageSize,
    // Spring's sort parameter is a single `property,direction` string.
    ...(sortBy ? { sort: `${sortBy},${sortDir}` } : {}),
    ...(search ? { search } : {}),
    ...(status?.length ? { status: status.map((s) => STATUS_TO_BACKEND[s]) } : {}),
    // The server decides scope from the user; sending both keeps it explicit.
    ...(scope === 'own' && scopeUser ? { ownerUserId: scopeUser } : {}),
    ...rest,
  }
}

/* -------------------------------------------------------------------------- */
/* Response mapping                                                           */
/* -------------------------------------------------------------------------- */

/**
 * One backend row → this app's `Issue`.
 *
 * ⚠️ REQUIRED FIELDS GET DEFAULTS, AND THAT IS DELIBERATE. `Issue` demands
 * `model`, `modelCode`, `modelYear`, `owner` and the timestamps; a real response
 * may omit any of them. Defaulting keeps one sparse row from breaking the whole
 * list render, and an empty string is visibly wrong on screen in a way that a
 * crash is not diagnosable.
 */
export function toIssue(dto: BackendIssueSummaryDto): Issue {
  return {
    id: dto.issueId,
    title: dto.title,
    description: dto.description ?? '',
    status: statusFromBackend(dto.status),
    model: dto.modelName ?? '',
    modelCode: dto.modelCode ?? '',
    modelYear: dto.modelYear ?? 0,
    system: dto.systemName,
    subSystem: dto.subSystemName,
    component: dto.componentName,
    symptom: dto.symptomName,
    owner: dto.ownerUserId ?? '',
    assignee: dto.assigneeUserId,
    // `reportedDate` is date-only; `@/shared/format/date` parses that correctly.
    reportedDate: dto.reportedDate ?? '',
    createdAt: dto.createdAt ?? dto.reportedDate ?? '',
    updatedAt: dto.updatedAt ?? dto.createdAt ?? '',
    closedAt: dto.closedAt,
    isEws: dto.ewsFlag,
    linkedIssueIds: dto.linkedIssueIds,
  }
}

/** The page envelope → this app's `{ rows, total }`. */
export function fromBackendPage(page: BackendPageResponse<BackendIssueSummaryDto>): IssueListResult {
  return {
    rows: page.content.map(toIssue),
    // `totalElements`, never `content.length` — the latter is the page size and
    // reports 20 for every result set. See `api/issues.ts` for the same note.
    total: page.totalElements,
  }
}

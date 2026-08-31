import { get, post } from '@/shared/http'
import { parseResponse } from './issue.schemas'
import {
  backendAssigneeListSchema,
  backendClassificationListSchema,
  backendClassificationNodeSchema,
  backendPartOptionListSchema,
  backendPrioritySchema,
  backendUserListSchema,
  backendVinListSchema,
  type BackendClassificationNodeDto,
  type BackendPriorityDto,
} from './masterData.schemas'
import type { PartOption, TeamMember } from '@/data/investigation'
import type { ClassLevel, ClassificationNode, IssuePriority, User } from '@/data/types'
import type { PriorityLetter } from '@/data/priorityMatrix'

/**
 * REAL-API REFERENCE-DATA SERVICE — classification, part catalogue, team
 * directory, users, priorities and VIN options.
 *
 * ⚠️ ACTIVE ONLY WHEN `VITE_USE_FIXTURES=false`. `services/index.ts` owns the
 * branch; this module is its false arm and is unreachable in fixtures mode.
 *
 * ─── WHERE THE ENDPOINTS COME FROM, AND WHERE THEY DO NOT ────────────────────
 *
 * The classification and master-data paths are carried from the verified Vue
 * port (`classification.service.ts`, `master-data.service.ts`,
 * `assignee.service.ts`), which checked each against the real controllers.
 *
 * ⚠️ TWO ARE NOT VERIFIED, AND ARE MARKED WHERE THEY APPEAR: the user list and
 * the priority matrix. Vue has neither — the priority matrix is a feature this
 * React app added, and Vue's admin surface never shipped. Their paths below are
 * the conventional ones for this API, chosen so the client is ready, and they
 * are the first thing to confirm when the backend lands. They are flagged rather
 * than presented as verified because a guessed path that looks verified is worse
 * than an obvious gap.
 */

/* ── Classification ───────────────────────────────────────────────────────── */

/**
 * The four levels, and the ONE place the app's vocabulary meets the backend's.
 *
 * ⚠️ THE BACKEND PLURALISES AND THIS APP DOES NOT. `system` → `systems`. Every
 * path below is built from this map rather than by appending an `s`, because
 * `sub-system` → `subsystems` is not a suffix rule — it also drops the hyphen.
 */
const LEVEL_PATH: Record<ClassLevel, string> = {
  system: 'systems',
  subSystem: 'subsystems',
  component: 'components',
  symptom: 'symptoms',
}

const LEVELS = Object.keys(LEVEL_PATH) as ClassLevel[]

function toClassificationNode(dto: BackendClassificationNodeDto, level: ClassLevel): ClassificationNode {
  return {
    id: dto.id,
    level,
    code: dto.code,
    label: dto.label,
    parentId: dto.parentId,
    // Absent means "not counted", which renders as zero rather than as a gap.
    issueCount: dto.issueCount ?? 0,
    pendingApproval: dto.pendingApproval,
  }
}

/** `GET /classification-keys/{level}?parentCode=`. */
export async function listClassificationLevel(
  level: ClassLevel,
  parentId?: string,
): Promise<ClassificationNode[]> {
  const path = `/classification-keys/${LEVEL_PATH[level]}`
  const raw = await get<unknown>(path, {
    // Omitted entirely rather than sent as undefined: the backend treats a
    // present-but-empty `parentCode` as "match nothing", not "match all".
    params: parentId === undefined ? undefined : { parentCode: parentId },
  })
  return parseResponse(backendClassificationListSchema, raw, `GET ${path}`).map((dto) =>
    toClassificationNode(dto, level),
  )
}

/**
 * The whole taxonomy, as one flat list.
 *
 * ⚠️ FOUR REQUESTS IN PARALLEL, BECAUSE THERE IS NO WHOLE-TREE ENDPOINT. The
 * backend exposes one path per level and nothing that returns all four, so this
 * fans out and flattens. `Promise.all` rather than a sequence: they do not
 * depend on each other, and four round trips in series is four times the latency
 * on a screen that cannot render until all of them land.
 */
export async function listClassification(): Promise<ClassificationNode[]> {
  const levels = await Promise.all(LEVELS.map((level) => listClassificationLevel(level)))
  return levels.flat()
}

/** `POST /master-data/system-requests`. Returns the node already marked pending. */
export async function requestClassificationNode(input: {
  level: ClassLevel
  parentId?: string
  label: string
  justification: string
}): Promise<ClassificationNode> {
  const raw = await post<unknown>('/master-data/system-requests', {
    level: input.level,
    parentCode: input.parentId,
    label: input.label,
    justification: input.justification,
  })
  return toClassificationNode(
    parseResponse(backendClassificationNodeSchema, raw, 'POST /master-data/system-requests'),
    input.level,
  )
}

/* ── Part catalogue and people ────────────────────────────────────────────── */

/** `GET /master-data/parts`. The catalogue, not part requests — see the fixture. */
export async function listPartOptions(): Promise<PartOption[]> {
  const raw = await get<unknown>('/master-data/parts')
  return parseResponse(backendPartOptionListSchema, raw, 'GET /master-data/parts')
}

/** `GET /assignees` — who may be NAMED on an activity. */
export async function listTeamDirectory(): Promise<TeamMember[]> {
  const raw = await get<unknown>('/assignees')
  return parseResponse(backendAssigneeListSchema, raw, 'GET /assignees').map((dto) => ({
    id: dto.id,
    name: dto.name,
    role: dto.role ?? '',
    company: dto.company ?? '',
  }))
}

/**
 * `GET /users` — who may SIGN IN.
 *
 * ⚠️ PATH NOT VERIFIED — see the module note. Vue has no admin surface, so there
 * is no checked counterpart for this one.
 *
 * ⚠️ AND IT IS A DIFFERENT LIST FROM `listTeamDirectory` even though both look
 * like "people". The two diverge the moment a contractor is named on a finding
 * without holding an account, which the seed already shows.
 */
export async function listUsers(): Promise<User[]> {
  const raw = await get<unknown>('/users')
  return parseResponse(backendUserListSchema, raw, 'GET /users').map((dto) => ({
    id: dto.id,
    name: dto.name,
    role: dto.role as User['role'],
    roleLabel: dto.roleLabel ?? dto.role,
    // ⚠️ `cap` IS NOT SENT BY THE BACKEND AND MUST NOT BE INVENTED HERE.
    // Capability is derived from the role by `stores/auth`, which owns the one
    // permitted role comparison in the codebase. Deriving it a second time in a
    // mapper is exactly the duplicate the role-gate check exists to prevent, so
    // this defers to the least-privileged value and lets the store decide.
    cap: 'read',
    email: dto.email ?? '',
    initials: dto.initials ?? dto.name.slice(0, 2).toUpperCase(),
  }))
}

/* ── Priorities and VINs ──────────────────────────────────────────────────── */

function toPriority(dto: BackendPriorityDto): IssuePriority {
  return {
    scores: dto.scores,
    selIdx: dto.selIdx,
    // `null` means "use the calculated letter" and is a different state from
    // "not yet scored" — see the schema.
    manualFinal: (dto.manualFinal ?? null) as PriorityLetter | null,
    scored: dto.scored,
  }
}

/**
 * `GET /issues/{issueId}/priority`.
 *
 * ⚠️ PATH NOT VERIFIED — the priority matrix is a feature this React app added
 * and Vue has no counterpart. See the module note.
 */
export async function getIssuePriority(issueId: string): Promise<IssuePriority> {
  const raw = await get<unknown>(`/issues/${encodeURIComponent(issueId)}/priority`)
  return toPriority(parseResponse(backendPrioritySchema, raw, `GET /issues/${issueId}/priority`))
}

/** `PUT /issues/{issueId}/priority`. Same unverified-path caveat. */
export async function saveIssuePriority(
  issueId: string,
  priority: { scores: Record<string, number>; selIdx: Record<string, number>; manualFinal: PriorityLetter | null },
): Promise<IssuePriority> {
  const raw = await post<unknown>(`/issues/${encodeURIComponent(issueId)}/priority`, {
    scores: priority.scores,
    selIdx: priority.selIdx,
    manualFinal: priority.manualFinal,
  })
  return toPriority(parseResponse(backendPrioritySchema, raw, `PUT /issues/${issueId}/priority`))
}

/** `GET /master-data/vins?issueId=` — scoped to the issue's own model codes. */
export async function listVinOptions(issueId: string): Promise<string[]> {
  const raw = await get<unknown>('/master-data/vins', { params: { issueId } })
  return parseResponse(backendVinListSchema, raw, 'GET /master-data/vins')
}

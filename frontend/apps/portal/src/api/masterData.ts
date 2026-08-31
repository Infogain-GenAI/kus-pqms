import { CLASSIFICATION, ISSUES, PRIORITIES, USERS } from '@/data/seed'
import { ELIGIBLE_PARTS, TEAM_DIRECTORY, type PartOption, type TeamMember } from '@/data/investigation'
import type { ClassLevel, ClassificationNode, IssuePriority, User } from '@/data/types'
import { simulateLatency } from './fixture-latency'

/**
 * FIXTURE-BACKED REFERENCE DATA — the classification taxonomy, the part
 * catalogue, the team directory, the user list and saved priorities.
 *
 * ─── ⚠️ THIS IS SERVER STATE, NOT "LOAD ONCE AND STASH IT" ───────────────────
 *
 * Everything here is fetched once and rarely changes, which makes it feel like
 * startup data belonging in a store. It is not. `04-state-management.md`
 * classifies by OWNERSHIP, not lifetime: *"A list of records fetched over HTTP is
 * server state even if you only read it once."*
 *
 * So these are queries with a long `staleTime`, never Zustand stores. Putting
 * them in a store gives you a second cache with no invalidation path, and the
 * failure mode is an admin adding a system that nobody sees until they
 * hard-refresh. `stores/README.md` records the same trap.
 *
 * ─── THE CLASSIFICATION TAXONOMY IS SERVED AS A FLAT LIST, NOT A TREE ────────
 *
 * `ClassificationNode` carries `parentId`, so the shape is already a flat
 * adjacency list and every consumer filters it. Serving a nested tree would mean
 * every caller walking it, and the "give me one level" question — which is the
 * only question the cascading pickers ask — becomes a traversal instead of a
 * filter.
 */

/** `GET /classification-keys` — the whole taxonomy, flat. */
export async function fetchClassification(): Promise<ClassificationNode[]> {
  await simulateLatency()
  return [...CLASSIFICATION]
}

/**
 * `GET /classification-keys/{level}?parentCode=` — one level of the cascade.
 *
 * ⚠️ AN ABSENT `parentId` MEANS "TOP LEVEL", NOT "ANY PARENT". Systems have no
 * parent, so `parentId === undefined` is a real query rather than a missing
 * filter — treating it as "unfiltered" would offer every sub-system in the
 * catalogue as a top-level choice.
 */
export async function fetchClassificationLevel(
  level: ClassLevel,
  parentId?: string,
): Promise<ClassificationNode[]> {
  await simulateLatency()
  return CLASSIFICATION.filter(
    (node) => node.level === level && (parentId === undefined || node.parentId === parentId),
  )
}

/**
 * `POST /master-data/system-requests` — request a new classification node.
 *
 * ⚠️ RETURNS THE NODE ALREADY MARKED `pendingApproval`, and the caller selects
 * it immediately. That is the entire reason the affordance sits inside the form
 * rather than in Admin: the requester must be able to pick the value they just
 * asked for and carry on. The flag is what keeps it distinguishable from an
 * approved node, which is why every consumer reads `pendingApproval` rather than
 * assuming a node is governed. `data/store.tsx` records the same decision.
 */
export async function requestClassificationNode(input: {
  level: ClassLevel
  parentId?: string
  label: string
  justification: string
}): Promise<ClassificationNode> {
  await simulateLatency()
  return {
    id: `req-${input.level}-${input.label.toLowerCase().replace(/\s+/g, '-')}`,
    level: input.level,
    code: input.label.slice(0, 4).toUpperCase(),
    label: input.label,
    parentId: input.parentId,
    issueCount: 0,
    pendingApproval: true,
  }
}

/**
 * `GET /master-data/parts` — the part catalogue behind the activity picker.
 *
 * ⚠️ DISTINCT FROM A PART REQUEST, and the two must never be routed to each
 * other. This is what a user may CITE on an activity; a part request is a
 * procurement record with a status and an approver. `data/investigation.ts`
 * carries the same warning on the seed.
 */
export async function fetchPartOptions(): Promise<PartOption[]> {
  await simulateLatency()
  return [...ELIGIBLE_PARTS]
}

/** `GET /assignees` — the team directory offered by the members picker. */
export async function fetchTeamDirectory(): Promise<TeamMember[]> {
  await simulateLatency()
  return [...TEAM_DIRECTORY]
}

/**
 * `GET /users` — the admin screen's user list.
 *
 * Distinct from the team directory above even though both look like "people":
 * the directory is who may be NAMED on an activity, this is who may SIGN IN.
 * They diverge the moment a contractor is listed on a finding without holding an
 * account, which the seed already shows (`Sunil Rao`, Mando).
 */
export async function fetchUsers(): Promise<User[]> {
  await simulateLatency()
  return [...USERS]
}

/**
 * `GET /issues/{issueId}/priority` — the saved priority matrix for one issue.
 *
 * ⚠️ AN UNSCORED ISSUE RESOLVES TO A REAL RECORD, NOT `null`. `scored: false` is
 * the meaningful state — it is what gates QIR creation — and a `null` here would
 * force every caller to invent the same empty record, differently.
 */
export async function fetchIssuePriority(issueId: string): Promise<IssuePriority> {
  await simulateLatency()
  return (
    PRIORITIES[issueId] ?? { scores: {}, selIdx: {}, manualFinal: null, scored: false }
  )
}

/**
 * `GET /master-data/vins?issueId=` — the VINs offered by the VIN picker.
 *
 * Derived from the issue's own model codes rather than a global list: offering
 * every VIN in the fleet on an EV6 issue is not a longer list, it is a wrong one.
 */
export async function fetchVinOptions(issueId: string): Promise<string[]> {
  await simulateLatency()
  const issue = ISSUES.find((i) => i.id === issueId)
  if (!issue) return []
  const codes = issue.modelCodes?.length ? issue.modelCodes : [issue.modelCode ?? issue.model]
  return codes.filter(Boolean).map((code, index) => `KNA${code}${String(index + 1).padStart(6, '0')}`)
}

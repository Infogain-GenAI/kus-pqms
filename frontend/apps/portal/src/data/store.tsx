import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { StatusKey } from '@pqms/ui-library'
import { relatedRank } from './relatedRank'
import type {
  ActivityType,
  AppNotification,
  AuditEntry,
  ClassificationNode,
  ActivityChangeRequest,
  ChangeRequestField,
  ClassLevel,
  Comment,
  CommEntryType,
  DispositionOutcome,
  InvestigationActivity,
  Issue,
  IssuePriority,
  PartRequest,
  PartStatus,
  PartUrgency,
} from './types'
import { reportDataSource } from '@/config/data-source'
import { ACTIVITIES, AUDIT, CLASSIFICATION, COMMENTS, ISSUES, NOTIFICATIONS, PARTS, PRIORITIES } from './seed'
import { assertSeedAnchors } from './assertSeed'
import { newId } from './util'
import { ELIGIBLE_PARTS, TEAM_DIRECTORY, type PartOption, type TeamMember } from './investigation'
import type { AssignableRole } from './assignableRoles'
import { formIssueGroup } from './issueGroups'
import { planGroupEdits, type GroupEditRequest } from './groupEdits'
import { findPriorityItem, priorityLetter, priorityTotal, type PriorityLetter } from './priorityMatrix'

// Fail fast (dev server, preview build and every fidelity capture) if the dataset's
// date anchor or its pinned rows ever drift from the export's _todayBase().
assertSeedAnchors()

/**
 * Announce which data source is in effect (`VITE_USE_FIXTURES`).
 *
 * This store IS the fixture source, so it is the honest place to say so. The
 * call is a no-op while fixtures are on; it warns exactly once when the env asks
 * for the real API, because there is no API layer to hand over to yet. See
 * `config/data-source.ts` for why that is a warning rather than silence.
 */
reportDataSource()

export interface Actor {
  name: string
  role: string
}

export interface NewIssueInput {
  title: string
  description?: string
  source?: Issue['source']
  model: string
  modelCode?: string
  /** All affected codes (V4-V5 multi-select). `modelCode` stays the anchor for display. */
  modelCodes?: string[]
  /** code → selected model years. Absent code means "all years for that code". */
  yearsByCode?: Record<string, string[]>
  modelYear: number
  /** Issues linked at creation time. Linked reciprocally, same as linkIssue(). */
  linkedIssueIds?: string[]
  /**
   * Justifications captured by the link-confirmation modal, one per link action.
   *
   * They are held on the DRAFT until registration and written to the audit trail
   * here — the design does the same, accumulating `pendingLinkLogs` and applying
   * them when the issue is registered. Linking during a draft has no issue to
   * hang an audit entry on until that moment.
   */
  linkJustifications?: { ids: string[]; justification: string }[]
  system?: string
  subSystem?: string
  component?: string
  symptom?: string
  dtcCodes?: string[]
  submit?: boolean // true = Open, false = Draft
}

interface StoreValue {
  issues: Issue[]
  classification: ClassificationNode[]
  notifications: AppNotification[]
  unreadCount: number
  // selectors
  getIssue: (id: string) => Issue | undefined
  partsFor: (issueId: string) => PartRequest[]
  commentsFor: (issueId: string) => Comment[]
  activitiesFor: (issueId: string) => InvestigationActivity[]
  /** Change requests raised against an activity, newest first. */
  changeRequestsFor: (activityId: string) => ActivityChangeRequest[]
  auditFor: (issueId: string) => AuditEntry[]
  classChildren: (parentId?: string) => ClassificationNode[]
  classByLevel: (level: ClassLevel, parentId?: string) => ClassificationNode[]
  /** Members of an issue's group, PARENT FIRST. Empty when it belongs to none. */
  groupMembers: (issueId: string) => Issue[]
  /** Where an issue sits in its group. Derived — nothing stores "parent". */
  relKind: (issueId: string) => 'standalone' | 'parent' | 'child'
  correlations: (issueId: string) => Issue[]
  /**
   * The parts pickable in the Add-activity form — the seeded eligible list plus
   * anything added this session through 'Add parts manually'.
   */
  partOptions: () => PartOption[]
  /** The same for team members. */
  teamDirectory: () => TeamMember[]
  /** Saved priority for an issue; an unscored issue returns an empty, unscored record. */
  priorityFor: (issueId: string) => IssuePriority
  /** Calculated total, calculated letter, effective letter and whether it was overridden. */
  priorityResult: (issueId: string) => { total: number; calc: PriorityLetter; final: PriorityLetter; isOverride: boolean; scored: boolean }
  // mutations
  createIssue: (input: NewIssueInput, actor: Actor) => Issue
  startInvestigation: (id: string, actor: Actor) => void
  /** Direct status change (override roles / hand-off actions) with mandatory reason. */
  setStatus: (id: string, status: StatusKey, reason: string, actor: Actor, action?: string, outcome?: DispositionOutcome) => void
  /**
   * Widened for the full-page Edit-issue form, which captures more than the old
   * three-field modal did: the vehicle rows (`modelCodes`/`modelYear`), the
   * classification path, and the per-channel source evidence.
   *
   * `sources` and `sourceChannels` move together and `source` stays the primary
   * — the list screen and every badge still read `source`, so the edit form
   * writes all three rather than leaving the single-key field stale.
   */
  updateIssue: (
    id: string,
    patch: Partial<
      Pick<
        Issue,
        | 'title'
        | 'description'
        | 'dtcCodes'
        | 'source'
        | 'sources'
        | 'sourceChannels'
        | 'modelCodes'
        | 'modelYear'
        | 'system'
        | 'subSystem'
        | 'component'
        | 'symptom'
      >
    >,
    actor: Actor,
  ) => void
  /**
   * Link two issues, reciprocally, with a MANDATORY audited justification.
   *
   * ─── WHY `justification` IS REQUIRED AND NOT OPTIONAL ────────────────────────
   *
   * Every caller mutates a PERSISTED relationship between two live issues, and
   * the governance rule is that each such change records why. An optional
   * parameter is how that goes unenforced at one call site while looking done
   * everywhere else — so it is required, and the compiler enumerates the
   * surfaces instead of a reviewer having to.
   *
   * It sits BEFORE `actor`, matching `setStatus`, `proposeTransition` and
   * `bulkStatus`, which all take their reason in that position. That placement
   * also means an un-migrated 3-argument call fails as a TYPE error rather than
   * quietly passing an actor where a reason belongs.
   *
   * ONE CALL IS ONE CHANGE IS ONE AUDIT ROW. The prototype's `saveSameModal()`
   * settles this: "each change gets its own audit entry". So a batch of edits
   * calls this once per change, each with its own reason, rather than sharing one
   * blanket justification across several.
   */
  linkIssue: (id: string, otherId: string, justification: string, actor: Actor) => void
  unlinkIssue: (id: string, otherId: string, justification: string, actor: Actor) => void
  proposeTransition: (id: string, target: StatusKey, rationale: string, actor: Actor, outcome?: DispositionOutcome) => void
  approveProposal: (id: string, remark: string, actor: Actor) => void
  rejectProposal: (id: string, remark: string, actor: Actor) => void
  bulkStatus: (ids: string[], status: StatusKey, reason: string, actor: Actor) => void
  /**
   * Reassign the ASSIGNEE role on several issues at once.
   *
   * ⚠️ IT WRITES `assigneeRole`, NEVER `ownerRole`, and that distinction is the
   * whole point. Ownership records who raised the issue and is part of its
   * history; assignment is who is working it now. Bulk reassignment moves the
   * second and must never rewrite the first.
   *
   * ⚠️ THIS WAS SILENTLY DELETED BY A MERGE and restored afterwards. Main's Issue
   * List rewrite won at that file's path and took the function, its control, its
   * i18n and a dedicated test suite with it. Nothing conflicted and no gate
   * failed — `scripts/check-merge-loss.mjs` exists because of this.
   *
   * ⚠️ THE ROLE IS `AssignableRole`, NOT `RoleKey` — see `assignableRoles.ts`.
   * Typing it as the session vocabulary is what limited this to three options
   * when the design offers five.
   *
   * NOTE ON FIDELITY: the canonical's `bulkAssign(role)` PERSISTS NOTHING — it
   * clears the selection and raises a notification, unlike its `bulkStatus`
   * which does map the issues. Writing `assigneeRole` is therefore ours, not the
   * design's, and deliberately so: a bulk action that changes no data is
   * theatre. Recorded rather than presented as a faithful port.
   */
  bulkAssignRole: (ids: string[], role: AssignableRole, actor: Actor) => void
  /**
   * Commit a batch of group-membership changes — the workspace's Manage Related
   * Issues Save.
   *
   * ⚠️ NOT EXPRESSIBLE AS REPEATED TWO-PARTY CALLS, which is why it is its own
   * function rather than a loop over `linkIssue`. One Save can:
   *   · rewrite several issues' `groupId`;
   *   · DISSOLVE a group when a removal leaves exactly one member;
   *   · promote a new parent and log a SYSTEM-GENERATED entry that carries no
   *     user reason;
   *   · chain, so the second removal sees the first one's result.
   * `planGroupEdits` owns all of it and is tested directly; this applies the plan.
   *
   * EVERY REMOVAL AND ADDITION CARRIES ITS OWN JUSTIFICATION — one per change,
   * not one per Save. The design keys its pending map by member id with a
   * separate reason on each, and `saveSameModal` states that each change gets
   * its own audit entry.
   */
  saveGroupEdits: (request: GroupEditRequest, actor: Actor) => void
  /**
   * Request a new classification node — the forms' "Request New System" flow.
   *
   * The node is added immediately with pendingApproval: true rather than being
   * held in a separate queue. That is deliberate: the requester must be able to
   * SELECT the value they just asked for and carry on with the issue, which is
   * the entire reason the affordance sits inside the form rather than in Admin.
   * The flag is what keeps it distinguishable from an approved node, and it is
   * why every consumer reads pendingApproval rather than assuming a node is
   * governed.
   *
   * Returns the new node so the caller can select it without re-querying.
   */
  requestClassification: (
    input: { level: ClassLevel; parentId?: string; label: string; justification: string; issueId?: string },
    actor: Actor,
  ) => ClassificationNode
  addComment: (issueId: string, type: CommEntryType, body: string, actor: Actor) => void
  /**
   * `extra` carries the type-conditional fields the Add-activity form captures
   * (evaluation type, parts, VINs, dealer code, members, attachments). Optional
   * and defaulted, so the original four-argument call still compiles and behaves
   * identically — the five original activity types capture none of these.
   */
  addActivity: (
    issueId: string,
    type: ActivityType,
    summary: string,
    actor: Actor,
    extra?: Partial<Pick<InvestigationActivity, 'evaluationType' | 'parts' | 'vins' | 'dealerCode' | 'members' | 'attachments'>>,
  ) => void
  addPart: (
    issueId: string,
    input: { partNumber: string; description: string; cost: number; qty: number; urgency: PartUrgency; neededBy?: string; reason?: string; attachments?: string[] },
    actor: Actor,
  ) => void
  /**
   * ─── The activity change-request flow ───────────────────────────────────────
   *
   * A recorded activity is EVIDENCE and is never edited in place. A correction
   * is proposed, reviewed, and applied only by an approval — which is why these
   * are three separate mutators rather than an `updateActivity`.
   *
   * `currentValue` is captured on the request, not read from the activity at
   * decision time: an approval that lands after another change would otherwise
   * record a "before" that was never true.
   */
  /**
   * Adds manually-entered parts to the session directory and returns what was
   * added, so the caller can select them immediately.
   *
   * Rows already present by part number are IGNORED rather than duplicated — the
   * user's intent is 'this part should be available', which is already true.
   */
  addManualParts: (rows: { partNo: string; qty: string }[]) => PartOption[]
  /** The same for team members, keyed on name. */
  addManualTeamMembers: (rows: { name: string; role: string; company: string }[]) => TeamMember[]
  requestActivityChange: (
    input: { activityId: string; issueId: string; field: ChangeRequestField; currentValue: string; proposedValue: string; reason: string },
    actor: Actor,
  ) => void
  approveActivityChange: (requestId: string, actor: Actor) => void
  /** `comment` is mandatory — the requester is told why, and it lands in the audit trail. */
  rejectActivityChange: (requestId: string, comment: string, actor: Actor) => void
  setPartStatus: (partId: string, status: PartStatus, actor?: Actor) => void
  savePriority: (issueId: string, scores: Record<string, number>, selIdx: Record<string, number>, manualFinal: PriorityLetter | null, actor: Actor) => void
  markAllRead: () => void
  markRead: (id: string) => void
}

/**
 * How many link candidates `correlations` returns. Matches Issue Entry's own
 * cap, so the same issue suggests the same shortlist in both places.
 */
const MAX_LINK_CANDIDATES = 8

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>(ISSUES)
  const [parts, setParts] = useState<PartRequest[]>(PARTS)
  const [comments, setComments] = useState<Comment[]>(COMMENTS)
  const [activities, setActivities] = useState<InvestigationActivity[]>(ACTIVITIES)
  const [changeRequests, setChangeRequests] = useState<ActivityChangeRequest[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>(AUDIT)
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS)
  const [classification, setClassification] = useState<ClassificationNode[]>(CLASSIFICATION)
  const [priorities, setPriorities] = useState<Record<string, IssuePriority>>(PRIORITIES)

  const now = () => new Date().toISOString()
  const appendAudit = useCallback((issueId: string, actor: Actor, action: string, detail?: string) => {
    setAudit((a) => [{ id: newId('au'), issueId, actor: actor.name, actorRole: actor.role, action, detail, timestamp: now() }, ...a])
  }, [])
  const touch = (id: string, patch: Partial<Issue>) =>
    setIssues((list) => list.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: now() } : i)))

  const getIssue = useCallback((id: string) => issues.find((i) => i.id === id), [issues])
  const partsFor = useCallback((issueId: string) => parts.filter((p) => p.issueId === issueId), [parts])
  const commentsFor = useCallback((issueId: string) => comments.filter((c) => c.issueId === issueId), [comments])
  const activitiesFor = useCallback((issueId: string) => activities.filter((a) => a.issueId === issueId), [activities])
  const changeRequestsFor = useCallback(
    (activityId: string) =>
      changeRequests.filter((r) => r.activityId === activityId).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    [changeRequests],
  )
  const auditFor = useCallback((issueId: string) => audit.filter((a) => a.issueId === issueId), [audit])
  const classChildren = useCallback((parentId?: string) => classification.filter((c) => c.parentId === parentId), [classification])
  const classByLevel = useCallback(
    (level: ClassLevel, parentId?: string) => classification.filter((c) => c.level === level && (parentId ? c.parentId === parentId : true)),
    [classification],
  )
  /**
   * Group membership, ordered by registration — earliest first.
   *
   * ⚠️ THE FIRST ELEMENT IS THE PARENT. That is the whole definition; there is
   * no stored parent pointer, matching the design (`groupMembers()[0]` after a
   * sort on `_registeredMs`). The consequence is deliberate: pull an issue out
   * of a group and the next-earliest becomes parent on its own, with nothing to
   * update and nothing left dangling.
   */
  const groupMembers = useCallback(
    (issueId: string) => {
      const self = issues.find((i) => i.id === issueId)
      if (!self?.groupId) return []
      return issues
        .filter((i) => i.groupId === self.groupId)
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0))
    },
    [issues],
  )

  const relKind = useCallback(
    (issueId: string): 'standalone' | 'parent' | 'child' => {
      const members = groupMembers(issueId)
      if (members.length === 0) return 'standalone'
      return members[0].id === issueId ? 'parent' : 'child'
    },
    [groupMembers],
  )

  /**
   * Link candidates for the Manage-Related-Issues modal, ranked.
   *
   * ─── IT WAS EXACT-SYMPTOM EQUALITY, AND THAT ALMOST NEVER MATCHED ───────────
   *
   * The previous body was `i.symptom === me.symptom` — a single string
   * comparison on one field. Measured against the seed: **20 of 35 issues
   * returned ZERO candidates**, so the modal rendered "No classification-matched
   * candidates" for well over half the register, and the feature read as broken
   * rather than empty.
   *
   * ⚠️ NOTE THE FAILURE MODE, because it is why this survived so long: an empty
   * candidate list compiles cleanly, renders a legitimate-looking empty state,
   * and captures pixel-identically. Neither a typecheck nor a fidelity snapshot
   * can see it. Only reading the predicate, or exercising the screen against real
   * data, finds this class of defect.
   *
   * `issue-entry/relatedRank.ts` recorded this exact instance as a KNOWN SECOND
   * SITE of the bug it was written to fix on Issue Entry, and deliberately left
   * it alone as out of scope for that pass. This is that follow-up.
   *
   * ─── WHY THE SAME RANKER RATHER THAN A LOOSER PREDICATE ─────────────────────
   *
   * Because "what counts as related?" must have one answer. Issue Entry and this
   * modal are the same question asked at two moments — before an issue exists and
   * after — and two different similarity rules would mean a candidate suggested
   * at entry that cannot be found again at link time.
   *
   * `relatedRank` moved from `features/issues/issue-entry/` to `data/` for this:
   * `data/` is a leaf layer that has never imported from `features/`, and the
   * store reaching upward would have been the first inversion.
   */
  /*
   * ─── SESSION DIRECTORIES ────────────────────────────────────────────────────
   *
   * Parts and team members added through the two 'add manually' modals. Held
   * SEPARATELY from the seeded constants rather than by mutating them: the seed
   * is a module-level readonly array shared by every test in a file, and pushing
   * into it would leak one test's additions into the next and one user's session
   * into a reload's idea of what shipped.
   *
   * They are session-scoped and deliberately NOT persisted. A manually added
   * part is a note that this activity cites something the catalogue does not
   * carry; treating it as a permanent master-data edit is a different feature
   * with an approval flow behind it, which is what 'Request new' is for.
   */
  const [manualParts, setManualParts] = useState<PartOption[]>([])
  const [manualMembers, setManualMembers] = useState<TeamMember[]>([])

  const partOptions = useCallback(() => [...ELIGIBLE_PARTS, ...manualParts], [manualParts])
  const teamDirectory = useCallback(() => [...TEAM_DIRECTORY, ...manualMembers], [manualMembers])

  const addManualParts = useCallback(
    (rows: { partNo: string; qty: string }[]) => {
      const existing = new Set([...ELIGIBLE_PARTS, ...manualParts].map((p) => p.partNo))
      const added = rows
        .map((r) => ({ partNo: r.partNo.trim(), qty: r.qty.trim(), manual: true as const }))
        .filter((r) => r.partNo && !existing.has(r.partNo))
      if (added.length > 0) setManualParts((prev) => [...prev, ...added])
      // Returns only what was NEW, so the caller selects exactly what it added.
      return added
    },
    [manualParts],
  )

  const addManualTeamMembers = useCallback(
    (rows: { name: string; role: string; company: string }[]) => {
      const existing = new Set([...TEAM_DIRECTORY, ...manualMembers].map((m) => m.name))
      const added = rows
        .map((r) => ({ id: newId('tm'), name: r.name.trim(), role: r.role.trim(), company: r.company.trim(), manual: true as const }))
        .filter((r) => r.name && !existing.has(r.name))
      if (added.length > 0) setManualMembers((prev) => [...prev, ...added])
      return added
    },
    [manualMembers],
  )

  const correlations = useCallback(
    (issueId: string) => {
      const me = issues.find((i) => i.id === issueId)
      if (!me) return []

      /*
       * Closed issues are excluded from the POOL, exactly as before — linking to
       * a settled record is not a useful suggestion. Kept as a pre-filter rather
       * than folded into the ranker, which is deliberately about similarity only
       * and knows nothing about lifecycle.
       */
      const pool = issues.filter((i) => i.status !== 'closed')

      return relatedRank(
        {
          system: me.system,
          subSystem: me.subSystem,
          component: me.component,
          symptom: me.symptom,
          title: me.title,
          description: me.description,
          dtcCodes: me.dtcCodes,
          modelCode: me.modelCode,
        },
        pool,
        issueId,
      )
        // Same bound as Issue Entry. Without it a broad system match can return
        // eleven rows into a modal that has room for a handful, and a list that
        // long stops being a suggestion.
        .slice(0, MAX_LINK_CANDIDATES)
        .map((r) => r.issue)
    },
    [issues],
  )

  const createIssue = useCallback<StoreValue['createIssue']>((input, actor) => {
    const seq = 260043 + issues.filter((i) => i.id.startsWith('EE-26')).length
    const issue: Issue = {
      id: `EE-${seq}`,
      title: input.title,
      description: input.description ?? '',
      source: input.source,
      status: 'open',
      model: input.model,
      modelCode: input.modelCode ?? '',
      modelCodes: input.modelCodes?.length ? input.modelCodes : undefined,
      modelYear: input.modelYear,
      linkedIssueIds: input.linkedIssueIds?.length ? input.linkedIssueIds : undefined,
      system: input.system,
      subSystem: input.subSystem,
      component: input.component,
      symptom: input.symptom,
      dtcCodes: input.dtcCodes,
      owner: actor.name,
      ownerRole: actor.role,
      assignee: actor.name,
      assigneeRole: actor.role,
      reportedDate: now().slice(0, 10),
      createdAt: now(),
      updatedAt: now(),
    }
    const links = input.linkedIssueIds ?? []

    /*
     * ─── ISSUE-GROUP FORMATION HAPPENS HERE, AT REGISTRATION, AND NOWHERE ELSE ─
     *
     * The design resolves group membership only at this moment, from whatever
     * ended up in the link set — see `formIssueGroup`, which owns every rule.
     * Registering ONE issue can therefore rewrite SEVERAL others: pulling in a
     * group transitively, or merging two groups, changes their members' `groupId`
     * and writes history to each of them.
     *
     * ⚠️ THIS WAS MISSING UNTIL NOW, and the reason it went unnoticed is worth
     * keeping: the read side (group cards, Parent/Child badges, the expander)
     * shipped first and renders SEEDED groups correctly, so the screen looked
     * complete. A read-only port over seeded data is indistinguishable from a
     * finished one by inspection.
     */
    const formation = formIssueGroup({
      newIssueId: issue.id,
      newIssueCreatedAt: issue.createdAt,
      linkedIds: links,
      pool: issues,
    })

    /*
     * The chronology guard refusing. UNREACHABLE BY CONSTRUCTION: `CreateIssueScreen`
     * checks the same formation before calling this and declines with the design's
     * own message, so this is a backstop for a second caller — and it throws rather
     * than silently forming an inverted hierarchy, which is the outcome the guard
     * exists to prevent. See `formIssueGroup` for why it never fires on this seed.
     */
    if (formation.blockedReason) throw new Error(`createIssue refused: ${formation.blockedReason}`)

    const grouped = formation.groupId
    const rewrite = new Set(formation.rewriteIds)

    setIssues((list) => [
      grouped ? { ...issue, groupId: grouped } : issue,
      ...list.map((i) => {
        // Mirror the link onto each counterpart so the relationship reads the same from
        // either side — the same invariant linkIssue()/unlinkIssue() maintain.
        const linked = links.includes(i.id)
          ? { ...i, linkedIssueIds: Array.from(new Set([...(i.linkedIssueIds ?? []), issue.id])), updatedAt: now() }
          : i
        // THE FAN-OUT: a merge, or absorbing a standalone, moves other issues
        // into this group. Only those whose group actually changes are touched.
        return rewrite.has(i.id) ? { ...linked, groupId: grouped ?? undefined, updatedAt: now() } : linked
      }),
    ])

    appendAudit(issue.id, actor, input.submit ? 'Submitted' : 'Draft saved', input.submit ? 'Draft → Open' : undefined)
    if (links.length) appendAudit(issue.id, actor, 'Issues linked', links.join(', '))
    for (const log of input.linkJustifications ?? []) {
      appendAudit(issue.id, actor, 'Linked issue(s) added', `${log.ids.join(', ')} — ${log.justification}`)
    }

    if (formation.action && grouped) {
      /*
       * ONE REASON, REUSED — no new justification is captured for the group.
       * The design embeds the link justification the confirmation modal already
       * collected into the group log, so the governance requirement is met by
       * data we were already carrying. Only the WRITING is new.
       */
      const why = (input.linkJustifications ?? []).map((l) => l.justification).join(' | ')
      const detail = `${[...formation.memberIds, issue.id].join(', ')}. Parent Issue: ${formation.parentId}.${why ? ` Justification: "${why}".` : ''}`
      appendAudit(issue.id, actor, formation.action, detail)
      /*
       * MIRRORED to every existing member: the group changed for them too, and an
       * audit trail that records it on only the new issue leaves the others with
       * no explanation for why their parent or membership moved.
       *
       * ⚠️ EVERY MEMBER GETS THE SAME SENTENCE, and that is the design's shape
       * rather than ours. `relLogMeta` builds one string and writes it to all
       * members, so a member of the LOSING group in a merge reads exactly what a
       * member of the surviving group reads — neither is told what changed for
       * IT specifically.
       *
       * PER-MEMBER PHRASING IS A DELIBERATE OPEN IMPROVEMENT, not an oversight.
       * It is a divergence from the design, and divergences here get recorded as
       * ours rather than smuggled in as fidelity — so the limitation is ported
       * and noted instead of quietly fixed. Small follow-up if wanted.
       */
      for (const id of formation.memberIds) appendAudit(id, actor, formation.action, detail)
    }

    return issue
  }, [issues, appendAudit])

  const startInvestigation = useCallback<StoreValue['startInvestigation']>((id, actor) => {
    touch(id, { status: 'review' })
    appendAudit(id, actor, 'Started investigation', 'Open → Investigating')
  }, [appendAudit])

  const setStatus = useCallback<StoreValue['setStatus']>((id, status, reason, actor, action = 'Status changed', outcome) => {
    touch(id, { status, dispositionOutcome: outcome, closedAt: status === 'closed' || status === 'outofscope' ? now() : undefined })
    appendAudit(id, actor, action, `→ ${status}: ${reason}`)
  }, [appendAudit])

  const updateIssue = useCallback<StoreValue['updateIssue']>((id, patch, actor) => {
    touch(id, patch)
    appendAudit(id, actor, 'Issue updated', Object.keys(patch).join(', '))
  }, [appendAudit])

  const linkIssue = useCallback<StoreValue['linkIssue']>((id, otherId, justification, actor) => {
    setIssues((list) =>
      list.map((i) => {
        if (i.id === id) return { ...i, linkedIssueIds: Array.from(new Set([...(i.linkedIssueIds ?? []), otherId])), updatedAt: now() }
        if (i.id === otherId) return { ...i, linkedIssueIds: Array.from(new Set([...(i.linkedIssueIds ?? []), id])), updatedAt: now() }
        return i
      }),
    )
    appendAudit(id, actor, 'Issue linked', `↔ ${otherId} — ${justification}`)
  }, [appendAudit])

  const unlinkIssue = useCallback<StoreValue['unlinkIssue']>((id, otherId, justification, actor) => {
    setIssues((list) =>
      list.map((i) => {
        if (i.id === id) return { ...i, linkedIssueIds: (i.linkedIssueIds ?? []).filter((x) => x !== otherId), updatedAt: now() }
        if (i.id === otherId) return { ...i, linkedIssueIds: (i.linkedIssueIds ?? []).filter((x) => x !== id), updatedAt: now() }
        return i
      }),
    )
    appendAudit(id, actor, 'Issue unlinked', `↮ ${otherId} (soft delete) — ${justification}`)
  }, [appendAudit])

  const proposeTransition = useCallback<StoreValue['proposeTransition']>((id, target, rationale, actor, outcome) => {
    // Proposals never change the visible status (the prototype has no "Pending Approval"
    // status) — the proposal fields drive the ApprovalBar until an override role decides.
    touch(id, { proposedStatus: target, proposalRationale: rationale, proposedBy: actor.name, dispositionOutcome: outcome })
    appendAudit(id, actor, 'Proposed transition', `→ ${target}${outcome ? ` (${outcome})` : ''}: ${rationale}`)
  }, [appendAudit])

  const approveProposal = useCallback<StoreValue['approveProposal']>((id, remark, actor) => {
    setIssues((list) =>
      list.map((i) => {
        if (i.id !== id) return i
        const target = i.proposedStatus ?? i.status
        return { ...i, status: target, proposedStatus: undefined, proposalRationale: undefined, proposedBy: undefined, updatedAt: now(), closedAt: target === 'closed' || target === 'outofscope' ? now() : i.closedAt }
      }),
    )
    appendAudit(id, actor, 'Approved transition', remark)
  }, [appendAudit])

  const rejectProposal = useCallback<StoreValue['rejectProposal']>((id, remark, actor) => {
    touch(id, { proposedStatus: undefined, proposalRationale: undefined, proposedBy: undefined })
    appendAudit(id, actor, 'Rejected transition', remark)
  }, [appendAudit])

  const bulkAssignRole = useCallback<StoreValue['bulkAssignRole']>((ids, role, actor) => {
    setIssues((list) => list.map((i) => (ids.includes(i.id) ? { ...i, assigneeRole: role, updatedAt: now() } : i)))
    // One audit row PER ISSUE: the action happened to each of them, and a single
    // combined entry would leave four of five issues with no record of the change.
    ids.forEach((id) => appendAudit(id, actor, 'Bulk role assignment', `assigned to ${role}`))
  }, [appendAudit])

  const saveGroupEdits = useCallback<StoreValue['saveGroupEdits']>((request, actor) => {
    const plan = planGroupEdits(issues, request)
    const changed = Object.keys(plan.groupIds)
    if (!changed.length && !plan.audits.length) return

    setIssues((list) =>
      list.map((i) =>
        i.id in plan.groupIds ? { ...i, groupId: plan.groupIds[i.id] ?? undefined, updatedAt: now() } : i,
      ),
    )
    // The plan already decided who hears what, including the system-generated
    // parent-change entry; this writes it verbatim rather than re-deriving.
    for (const a of plan.audits) appendAudit(a.issueId, actor, a.action, a.detail)
  }, [issues, appendAudit])

  const bulkStatus = useCallback<StoreValue['bulkStatus']>((ids, status, reason, actor) => {
    setIssues((list) => list.map((i) => (ids.includes(i.id) ? { ...i, status, updatedAt: now() } : i)))
    ids.forEach((id) => appendAudit(id, actor, 'Bulk status change', `→ ${status}: ${reason}`))
  }, [appendAudit])

  const requestClassification = useCallback<StoreValue['requestClassification']>((input, actor) => {
    const node: ClassificationNode = {
      id: newId('cls'),
      level: input.level,
      // Derived, not asked for: a requester should not have to invent a code
      // scheme, and a real one is assigned on approval.
      code: input.label.trim().slice(0, 3).toUpperCase(),
      label: input.label.trim(),
      parentId: input.parentId,
      issueCount: 0,
      pendingApproval: true,
    }
    setClassification((list) => [...list, node])
    // Audited against the issue that prompted it when there is one — a request
    // raised from an issue is part of that issue's story.
    if (input.issueId) {
      appendAudit(input.issueId, actor, 'Classification requested', input.level + ': ' + node.label + ' — ' + input.justification.trim())
    }
    return node
  }, [appendAudit])

  const addComment = useCallback<StoreValue['addComment']>((issueId, type, body, actor) => {
    setComments((c) => [...c, { id: newId('c'), issueId, type, author: actor.name, authorRole: actor.role, body, createdAt: now() }])
    const mention = body.match(/@([\w\s-]+)/)
    if (mention) {
      setNotifications((n) => [{ id: newId('n'), category: 'Information', title: 'You were mentioned', body: `${actor.name} mentioned you on ${issueId}.`, recordId: issueId, read: false, createdAt: now() }, ...n])
    }
  }, [])

  const addActivity = useCallback<StoreValue['addActivity']>((issueId, type, summary, actor, extra) => {
    setActivities((a) => [
      ...a,
      { id: newId('a'), issueId, type, summary, author: actor.name, authorRole: actor.role, createdAt: now(), ...extra },
    ])
    appendAudit(issueId, actor, 'Logged activity', `${type}: ${summary}`)
  }, [appendAudit])

  const addPart = useCallback<StoreValue['addPart']>((issueId, input, actor) => {
    const status: PartStatus = input.urgency === 'Routine' ? 'Approved' : 'Submitted'
    setParts((p) => [...p, { id: newId('pr'), issueId, ...input, status, requestedBy: actor.name, requestedAt: now() }])
    appendAudit(issueId, actor, 'Parts request', `${input.partNumber} ×${input.qty} (${input.urgency})`)
  }, [appendAudit])

  const setPartStatus = useCallback<StoreValue['setPartStatus']>((partId, status, actor) => {
    setParts((p) => {
      const target = p.find((x) => x.id === partId)
      // Audited like every other state change. Done inside the updater so the
      // part's issue id and number are read from the row being changed rather
      // than looked up separately and possibly staler.
      if (target && actor) appendAudit(target.issueId, actor, 'Part request updated', `${target.partNumber} → ${status}`)
      return p.map((x) => (x.id === partId ? { ...x, status } : x))
    })
  }, [appendAudit])

  // ---- Activity change requests ----

  const requestActivityChange = useCallback<StoreValue['requestActivityChange']>((input, actor) => {
    setChangeRequests((r) => [
      ...r,
      {
        id: newId('cr'),
        activityId: input.activityId,
        issueId: input.issueId,
        field: input.field,
        currentValue: input.currentValue,
        proposedValue: input.proposedValue,
        reason: input.reason,
        status: 'pending',
        requestedBy: actor.name,
        requestedAt: now(),
      },
    ])
    appendAudit(input.issueId, actor, 'Activity change requested', `${input.field}: ${input.reason}`)
  }, [appendAudit])

  const approveActivityChange = useCallback<StoreValue['approveActivityChange']>((requestId, actor) => {
    setChangeRequests((list) => {
      const req = list.find((r) => r.id === requestId)
      // Only a pending request can be decided — a double-click must not
      // re-apply a value that was already written.
      if (!req || req.status !== 'pending') return list
      const decidedOn = now()

      // THE APPROVAL IS WHAT MUTATES THE ACTIVITY. Nothing else writes these
      // fields, which is what makes the change request the complete record of
      // how a recorded activity came to differ from what was first entered.
      setActivities((acts) =>
        acts.map((a) => {
          if (a.id !== req.activityId) return a
          const patch =
            req.field === 'details' ? { summary: req.proposedValue }
            : req.field === 'activityDate' ? { activityDate: req.proposedValue }
            : { parts: req.proposedValue.split(',').map((s) => s.trim()).filter(Boolean) }
          return { ...a, ...patch, updatedAt: decidedOn }
        }),
      )
      appendAudit(req.issueId, actor, 'Activity change approved', `${req.field}: "${req.currentValue}" → "${req.proposedValue}"`)
      return list.map((r) => (r.id === requestId ? { ...r, status: 'approved' as const, decidedBy: actor.name, decidedOn } : r))
    })
  }, [appendAudit])

  const rejectActivityChange = useCallback<StoreValue['rejectActivityChange']>((requestId, comment, actor) => {
    setChangeRequests((list) => {
      const req = list.find((r) => r.id === requestId)
      if (!req || req.status !== 'pending') return list
      // The activity is untouched — that is the whole point of a rejection.
      appendAudit(req.issueId, actor, 'Activity change rejected', `${req.field}: ${comment}`)
      return list.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' as const, decidedBy: actor.name, decidedOn: now(), adminComment: comment } : r,
      )
    })
  }, [appendAudit])

  // ---- Issue Priority ----
  const EMPTY_PRIORITY: IssuePriority = { scores: {}, selIdx: {}, manualFinal: null, scored: false }

  const priorityFor = useCallback<StoreValue['priorityFor']>(
    (issueId) => {
      const rec = priorities[issueId]
      if (!rec) return EMPTY_PRIORITY
      // Seeded records carry scores but no selIdx. Derive it from the points value so the
      // matrix restores the right chip; where two options share a points value the first
      // wins, which is what the prototype's priSeedDraft does.
      const selIdx = { ...rec.selIdx }
      for (const key of Object.keys(rec.scores)) {
        if (selIdx[key] != null) continue
        const item = findPriorityItem(key)
        const idx = item ? item.options.findIndex((o) => o.pts === rec.scores[key]) : -1
        selIdx[key] = idx >= 0 ? idx : 0
      }
      return { ...rec, selIdx }
    },
    [priorities],
  )

  const priorityResult = useCallback<StoreValue['priorityResult']>(
    (issueId) => {
      const rec = priorityFor(issueId)
      const total = priorityTotal(rec.scores)
      const calc = priorityLetter(total)
      return { total, calc, final: rec.manualFinal ?? calc, isOverride: !!rec.manualFinal && rec.manualFinal !== calc, scored: rec.scored }
    },
    [priorityFor],
  )

  const savePriority = useCallback<StoreValue['savePriority']>(
    (issueId, scores, selIdx, manualFinal, actor) => {
      const total = priorityTotal(scores)
      const final = manualFinal ?? priorityLetter(total)
      setPriorities((p) => ({ ...p, [issueId]: { scores: { ...scores }, selIdx: { ...selIdx }, manualFinal, scored: true } }))
      appendAudit(
        issueId,
        actor,
        'Issue Priority saved',
        `Priority ${final} · ${total} pts${manualFinal && manualFinal !== priorityLetter(total) ? ` (manual override of calculated ${priorityLetter(total)})` : ''}`,
      )
    },
    [appendAudit],
  )

  const markAllRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, read: true }))), [])
  const markRead = useCallback((id: string) => setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x))), [])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const value: StoreValue = {
    issues, classification, notifications, unreadCount,
    getIssue, partsFor, commentsFor, activitiesFor, changeRequestsFor, auditFor, classChildren, classByLevel, groupMembers, relKind, correlations, partOptions, teamDirectory,
    priorityFor, priorityResult, savePriority,
    createIssue, startInvestigation, setStatus, updateIssue, linkIssue, unlinkIssue, proposeTransition, approveProposal, rejectProposal, bulkStatus, bulkAssignRole, saveGroupEdits,
    requestClassification, addComment, addActivity, addPart, setPartStatus,
    addManualParts, addManualTeamMembers,
    requestActivityChange, approveActivityChange, rejectActivityChange, markAllRead, markRead,
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { StatusKey } from '@pqms/ui-library'
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
  linkIssue: (id: string, otherId: string, actor: Actor) => void
  unlinkIssue: (id: string, otherId: string, actor: Actor) => void
  proposeTransition: (id: string, target: StatusKey, rationale: string, actor: Actor, outcome?: DispositionOutcome) => void
  approveProposal: (id: string, remark: string, actor: Actor) => void
  rejectProposal: (id: string, remark: string, actor: Actor) => void
  bulkStatus: (ids: string[], status: StatusKey, reason: string, actor: Actor) => void
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

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>(ISSUES)
  const [parts, setParts] = useState<PartRequest[]>(PARTS)
  const [comments, setComments] = useState<Comment[]>(COMMENTS)
  const [activities, setActivities] = useState<InvestigationActivity[]>(ACTIVITIES)
  const [changeRequests, setChangeRequests] = useState<ActivityChangeRequest[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>(AUDIT)
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS)
  const [classification] = useState<ClassificationNode[]>(CLASSIFICATION)
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

  const correlations = useCallback(
    (issueId: string) => {
      const me = issues.find((i) => i.id === issueId)
      if (!me?.symptom) return []
      return issues.filter((i) => i.id !== issueId && i.symptom === me.symptom && i.status !== 'closed')
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
    setIssues((list) => [
      issue,
      // Mirror the link onto each counterpart so the relationship reads the same from
      // either side — the same invariant linkIssue()/unlinkIssue() maintain.
      ...list.map((i) => (links.includes(i.id) ? { ...i, linkedIssueIds: Array.from(new Set([...(i.linkedIssueIds ?? []), issue.id])), updatedAt: now() } : i)),
    ])
    appendAudit(issue.id, actor, input.submit ? 'Submitted' : 'Draft saved', input.submit ? 'Draft → Open' : undefined)
    if (links.length) appendAudit(issue.id, actor, 'Issues linked', links.join(', '))
    for (const log of input.linkJustifications ?? []) {
      appendAudit(issue.id, actor, 'Linked issue(s) added', `${log.ids.join(', ')} — ${log.justification}`)
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

  const linkIssue = useCallback<StoreValue['linkIssue']>((id, otherId, actor) => {
    setIssues((list) =>
      list.map((i) => {
        if (i.id === id) return { ...i, linkedIssueIds: Array.from(new Set([...(i.linkedIssueIds ?? []), otherId])), updatedAt: now() }
        if (i.id === otherId) return { ...i, linkedIssueIds: Array.from(new Set([...(i.linkedIssueIds ?? []), id])), updatedAt: now() }
        return i
      }),
    )
    appendAudit(id, actor, 'Issue linked', `↔ ${otherId}`)
  }, [appendAudit])

  const unlinkIssue = useCallback<StoreValue['unlinkIssue']>((id, otherId, actor) => {
    setIssues((list) =>
      list.map((i) => {
        if (i.id === id) return { ...i, linkedIssueIds: (i.linkedIssueIds ?? []).filter((x) => x !== otherId), updatedAt: now() }
        if (i.id === otherId) return { ...i, linkedIssueIds: (i.linkedIssueIds ?? []).filter((x) => x !== id), updatedAt: now() }
        return i
      }),
    )
    appendAudit(id, actor, 'Issue unlinked', `↮ ${otherId} (soft delete)`)
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

  const bulkStatus = useCallback<StoreValue['bulkStatus']>((ids, status, reason, actor) => {
    setIssues((list) => list.map((i) => (ids.includes(i.id) ? { ...i, status, updatedAt: now() } : i)))
    ids.forEach((id) => appendAudit(id, actor, 'Bulk status change', `→ ${status}: ${reason}`))
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
    getIssue, partsFor, commentsFor, activitiesFor, changeRequestsFor, auditFor, classChildren, classByLevel, groupMembers, relKind, correlations,
    priorityFor, priorityResult, savePriority,
    createIssue, startInvestigation, setStatus, updateIssue, linkIssue, unlinkIssue, proposeTransition, approveProposal, rejectProposal, bulkStatus,
    addComment, addActivity, addPart, setPartStatus,
    requestActivityChange, approveActivityChange, rejectActivityChange, markAllRead, markRead,
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

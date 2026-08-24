import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { StatusKey } from '@/components'
import type {
  ActivityType,
  AppNotification,
  AuditEntry,
  ClassificationNode,
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
import { ACTIVITIES, AUDIT, CLASSIFICATION, COMMENTS, ISSUES, NOTIFICATIONS, PARTS, PRIORITIES } from './seed'
import { assertSeedAnchors } from './assertSeed'
import { newId } from './util'
import { findPriorityItem, priorityLetter, priorityTotal, type PriorityLetter } from './priorityMatrix'

// Fail fast (dev server, preview build and every fidelity capture) if the dataset's
// date anchor or its pinned rows ever drift from the export's _todayBase().
assertSeedAnchors()

export interface Actor {
  name: string
  role: string
}

export interface NewIssueInput {
  title: string
  description?: string
  source: Issue['source']
  model: string
  modelCode?: string
  modelYear: number
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
  auditFor: (issueId: string) => AuditEntry[]
  classChildren: (parentId?: string) => ClassificationNode[]
  classByLevel: (level: ClassLevel, parentId?: string) => ClassificationNode[]
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
  updateIssue: (id: string, patch: Partial<Pick<Issue, 'title' | 'description' | 'dtcCodes' | 'source'>>, actor: Actor) => void
  linkIssue: (id: string, otherId: string, actor: Actor) => void
  unlinkIssue: (id: string, otherId: string, actor: Actor) => void
  proposeTransition: (id: string, target: StatusKey, rationale: string, actor: Actor, outcome?: DispositionOutcome) => void
  approveProposal: (id: string, remark: string, actor: Actor) => void
  rejectProposal: (id: string, remark: string, actor: Actor) => void
  bulkStatus: (ids: string[], status: StatusKey, reason: string, actor: Actor) => void
  addComment: (issueId: string, type: CommEntryType, body: string, actor: Actor) => void
  addActivity: (issueId: string, type: ActivityType, summary: string, actor: Actor) => void
  addPart: (issueId: string, input: { partNumber: string; description: string; cost: number; qty: number; urgency: PartUrgency; neededBy?: string }, actor: Actor) => void
  setPartStatus: (partId: string, status: PartStatus) => void
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
  const auditFor = useCallback((issueId: string) => audit.filter((a) => a.issueId === issueId), [audit])
  const classChildren = useCallback((parentId?: string) => classification.filter((c) => c.parentId === parentId), [classification])
  const classByLevel = useCallback(
    (level: ClassLevel, parentId?: string) => classification.filter((c) => c.level === level && (parentId ? c.parentId === parentId : true)),
    [classification],
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
      modelYear: input.modelYear,
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
    setIssues((list) => [issue, ...list])
    appendAudit(issue.id, actor, input.submit ? 'Submitted' : 'Draft saved', input.submit ? 'Draft → Open' : undefined)
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

  const addActivity = useCallback<StoreValue['addActivity']>((issueId, type, summary, actor) => {
    setActivities((a) => [...a, { id: newId('a'), issueId, type, summary, author: actor.name, createdAt: now() }])
    appendAudit(issueId, actor, 'Logged activity', `${type}: ${summary}`)
  }, [appendAudit])

  const addPart = useCallback<StoreValue['addPart']>((issueId, input, actor) => {
    const status: PartStatus = input.urgency === 'Routine' ? 'Approved' : 'Submitted'
    setParts((p) => [...p, { id: newId('pr'), issueId, ...input, status, requestedBy: actor.name, requestedAt: now() }])
    appendAudit(issueId, actor, 'Parts request', `${input.partNumber} ×${input.qty} (${input.urgency})`)
  }, [appendAudit])

  const setPartStatus = useCallback<StoreValue['setPartStatus']>((partId, status) => {
    setParts((p) => p.map((x) => (x.id === partId ? { ...x, status } : x)))
  }, [])

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
    getIssue, partsFor, commentsFor, activitiesFor, auditFor, classChildren, classByLevel, correlations,
    priorityFor, priorityResult, savePriority,
    createIssue, startInvestigation, setStatus, updateIssue, linkIssue, unlinkIssue, proposeTransition, approveProposal, rejectProposal, bulkStatus,
    addComment, addActivity, addPart, setPartStatus, markAllRead, markRead,
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

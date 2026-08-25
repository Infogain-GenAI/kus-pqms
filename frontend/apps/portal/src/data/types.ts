// Domain types — scoped to the current ISM UX only.
// No severity scoring, no QIR/TSB entities (out of scope). Issue Priority IS in scope:
// V4-V5 added it to the Issue Workspace as the source of truth for QIR priority.
import type { SourceKey, StatusKey } from '@pqms/ui-library'
import type { PriorityLetter } from './priorityMatrix'

export type Cap = 'read' | 'override' | 'admin'
export type RoleKey = 'SE' | 'ASM' | 'PQM' | 'ADMIN'

export interface User {
  id: string
  name: string
  role: RoleKey
  roleLabel: string
  cap: Cap
  email: string
  initials: string
}

export type PartUrgency = 'Routine' | 'Priority' | 'Emergency'
export type PartStatus = 'Submitted' | 'Approved' | 'Ordered' | 'Received'

export interface PartRequest {
  id: string
  issueId: string
  partNumber: string
  description: string
  cost: number
  qty: number
  urgency: PartUrgency
  status: PartStatus
  neededBy?: string
  requestedBy: string
  requestedAt: string
}

export type CommEntryType = 'Internal' | 'External' | 'Email'

export interface Comment {
  id: string
  issueId: string
  type: CommEntryType
  author: string
  authorRole: string
  body: string
  createdAt: string
  hidden?: boolean
}

export type ActivityType = 'Field Inspection' | 'Bench Test' | 'Data Analysis' | 'Supplier Review' | 'Note'

export interface InvestigationActivity {
  id: string
  issueId: string
  type: ActivityType
  summary: string
  author: string
  createdAt: string
  attachments?: string[]
}

export interface AuditEntry {
  id: string
  issueId: string
  actor: string
  actorRole: string
  action: string
  detail?: string
  timestamp: string
}

export type DispositionOutcome = 'Resolved' | 'No Action' | 'Monitoring'

export interface Issue {
  id: string
  title: string
  description: string
  source: SourceKey
  status: StatusKey
  model: string
  modelCode: string
  /** All affected model codes; list renders "N Models" when more than one (per the UX). */
  modelCodes?: string[]
  modelYear: number
  system?: string
  subSystem?: string
  component?: string
  symptom?: string
  dtcCodes?: string[]
  owner: string
  ownerRole?: string
  assignee?: string
  assigneeRole?: string
  reportedDate: string
  createdAt: string
  updatedAt: string
  closedAt?: string
  isEws?: boolean
  linkedIssueIds?: string[]
  /** Channel-specific origin evidence shown on the Issue source card. */
  sourceEvidence?: { label: string; value: string }[]
  // propose → approve gate
  proposedStatus?: StatusKey
  proposalRationale?: string
  proposedBy?: string
  dispositionOutcome?: DispositionOutcome
  monitoringNextReview?: string
}

export type ClassLevel = 'system' | 'subSystem' | 'component' | 'symptom'

export interface ClassificationNode {
  id: string
  level: ClassLevel
  code: string
  label: string
  parentId?: string
  issueCount: number
  pendingApproval?: boolean
}

/** The prototype's notification taxonomy (NOTIFS() cats — catMeta keys), verbatim. */
export type NotificationCategory = 'Critical' | 'Warning' | 'Action Required' | 'Information'

export interface AppNotification {
  id: string
  category: NotificationCategory
  title: string
  /** Panel rows show category/title/issue/date only; body is page-level detail (e.g. mention text). */
  body?: string
  recordId?: string
  read: boolean
  createdAt: string
}

/** Saved Issue Priority. `selIdx` records which option of each item is chosen so the
 *  matrix can restore its selection (two options can share the same points value). */
export interface IssuePriority {
  /** itemKey → points awarded. */
  scores: Record<string, number>
  /** itemKey → index of the selected option. */
  selIdx: Record<string, number>
  /** Set when a user overrides the calculated letter; null means "use calculated". */
  manualFinal: PriorityLetter | null
  /** False until the matrix has been saved at least once — gates QIR creation. */
  scored: boolean
}

/** Fixed "today" so days-open and relative labels are deterministic on mock data. */
export const NOW = '2026-07-09T09:00:00Z'

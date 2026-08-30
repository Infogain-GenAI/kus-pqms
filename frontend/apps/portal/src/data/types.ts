// Domain types — scoped to the current ISM UX only.
// No severity scoring, no QIR/TSB entities (out of scope). Issue Priority IS in scope:
// V4-V5 added it to the Issue Workspace as the source of truth for QIR priority.
import type { SourceKey, StatusKey } from '@pqms/ui-library'
import type { PriorityLetter } from './priorityMatrix'
import type { SourceChannel } from './sourceChannels'

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
  /**
   * "Reason / comments" — why this part is needed for the investigation.
   * Optional and additive: every request that predates the field is still valid,
   * and the history row simply omits the line when it is absent.
   */
  reason?: string
  /** Files attached to the request. Names only — there is no upload endpoint. */
  attachments?: string[]
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

/**
 * Open by construction — see `data/investigation.ts`. A user can request a NEW
 * activity type, so no closed union can hold the set. The five original members
 * are still offered (`ACTIVITY_TYPES`); they are no longer the only ones the
 * type permits.
 */
export type { ActivityType } from './investigation'

/** One file recorded against an activity or a finding. */
export interface ActivityEvidence {
  id: string
  name: string
  kind: 'Attachment' | 'Image' | 'Diagnostic log' | 'Report' | 'Document' | 'Video'
  sizeLabel: string
  /** Uploader. */
  by: string
}

export interface InvestigationActivity {
  id: string
  issueId: string
  type: string
  summary: string
  author: string
  authorRole?: string
  createdAt: string
  attachments?: string[]
  /**
   * ─── The per-type field set, all OPTIONAL and all additive ────────────────
   *
   * Which of these an activity carries depends on its type — see
   * `activityTypeForm()`. They are optional rather than required because the
   * five original activity types capture none of them, and an activity recorded
   * before this existed is still a valid activity.
   */
  evaluationType?: string
  /** Cited part numbers. MAY include manually entered parts with no part request behind them. */
  parts?: string[]
  vins?: string[]
  dealerCode?: string
  /** Team members involved. */
  members?: string[]
  measurements?: { label: string; value: string }[]
  evidence?: ActivityEvidence[]
  /**
   * The activity's OWN date — not `createdAt`.
   *
   * A correction can move this ("the inspection happened on the 3rd, not the
   * 5th"), which a creation stamp must never do. Optional: nothing captures it
   * on entry today, so it defaults to the creation date at the render site and
   * becomes real the first time a change request sets it.
   */
  activityDate?: string
  /** Set when an approved change request rewrites a field. */
  updatedAt?: string
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

/**
 * A field-level correction proposed against a recorded activity.
 *
 * ACTIVITIES ARE IMMUTABLE. Nothing edits one in place — a correction is
 * proposed, reviewed, and only applied by an approval. That is the whole reason
 * this record exists rather than an "edit activity" mutator, and it is why the
 * before/after values are stored on the request itself: the audit trail has to
 * survive the approval that changes the activity.
 */
export type ChangeRequestField = 'details' | 'activityDate' | 'partNumber'
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected'

export interface ActivityChangeRequest {
  id: string
  activityId: string
  issueId: string
  field: ChangeRequestField
  currentValue: string
  proposedValue: string
  reason: string
  status: ChangeRequestStatus
  requestedBy: string
  requestedAt: string
  decidedBy?: string
  decidedOn?: string
  /** Required on reject — the requester is told why. */
  adminComment?: string
}

export type DispositionOutcome = 'Resolved' | 'No Action' | 'Monitoring'

export interface Issue {
  id: string
  title: string
  description: string
  /**
   * The origin channel — OPTIONAL, because registration does not capture it.
   *
   * Issue Entry deliberately does not ask for a source: the design's flow is
   * two-stage, registering the issue first and attributing its origin later on
   * the edit path (`EditSourcesForm`). The prototype states the resulting state
   * outright in its own history text — "Registered from Issue Entry — no source
   * assigned yet." So `undefined` here is a real, expected state, not missing
   * data, and code reading it must handle that rather than assume a default.
   */
  source?: SourceKey
  /** Additional origin channels beyond `source`; list renders "+N" when present (per the UX). */
  sources?: SourceKey[]
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
  /**
   * Issue-group membership — the design's `_groupId`, whose value is the
   * PARENT's own id.
   *
   * Distinct from `linkedIssueIds`, and deliberately not derived from it:
   * links are many-to-many "related to", and taking connected components over
   * the seed's links merges nine issues across three classifications into one
   * blob. Groups are a disjoint partition of same-symptom issues.
   *
   * THE PARENT IS NOT STORED. It is the earliest-registered member (see
   * `store.groupMembers`), so removing an issue from a group re-parents it
   * automatically rather than leaving a dangling pointer.
   */
  groupId?: string
  /** Channel-specific origin evidence shown on the Issue source card. */
  sourceEvidence?: { label: string; value: string }[]
  /**
   * Per-channel evidence carrying the full typed field schema, as captured by
   * the Add / edit sources form.
   *
   * OPTIONAL AND ADDITIVE. `sourceEvidence` above is untouched and still the
   * only thing the seed sets — `resolveSourceChannels()` derives a channel list
   * from `source`/`sources` and folds that flat evidence into it, so every issue
   * that predates this field renders exactly as it did before.
   */
  sourceChannels?: SourceChannel[]
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

/**
 * Which kind of record a notification points at.
 *
 * Ported from Vue's `NotificationRecordType`. Without it every notification was
 * routed to `/issues/<recordId>` on the assumption that an id is an issue id —
 * so the first QIR notification to arrive would have sent the user to
 * `/issues/QIR-26014` and a Not Found page.
 */
export type NotificationRecordType = 'issue' | 'qir'

export interface AppNotification {
  id: string
  category: NotificationCategory
  title: string
  /** Panel rows show category/title/issue/date only; body is page-level detail (e.g. mention text). */
  body?: string
  recordId?: string
  /**
   * OPTIONAL, AND ABSENT IS A REAL STATE — not a gap in the seed.
   *
   * Vue's mapper leaves this undefined when the backend gives it nothing
   * structured to derive a destination from, and its navigation composable then
   * marks the row read but declines to guess where to send anyone. The same
   * contract holds here: a row with no type has no destination, and inventing
   * one is how a user ends up on a 404 they cannot explain.
   */
  recordType?: NotificationRecordType
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

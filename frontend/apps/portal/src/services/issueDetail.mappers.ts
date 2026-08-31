import type {
  ActivityChangeRequest,
  AuditEntry,
  ChangeRequestField,
  ChangeRequestStatus,
  Comment,
  CommEntryType,
  InvestigationActivity,
  PartRequest,
  PartStatus,
  PartUrgency,
} from '@/data/types'
import type {
  BackendActivityDto,
  BackendAuditEntryDto,
  BackendChangeRequestDto,
  BackendCommentDto,
  BackendPartRequestDto,
} from './issueDetail.schemas'

/**
 * BACKEND → DOMAIN MAPPERS FOR THE ISSUE-DETAIL COLLECTIONS.
 *
 * ⚠️ THESE RUN AFTER THE SCHEMA, NEVER INSTEAD OF IT. `parseResponse` validates
 * first; a mapper's job is renaming and defaulting, not deciding whether the
 * payload was plausible. `issue.schemas.ts` records why the two are separate.
 *
 * ─── WHERE THE TWO VOCABULARIES DISAGREE ─────────────────────────────────────
 *
 * The backend and this app do not use the same words, and every disagreement is
 * resolved here rather than in a component:
 *
 *   backend                     domain
 *   ─────────────────────────   ───────────────────────
 *   partDescription             description
 *   quantity                    qty
 *   unitCost                    cost
 *   entryType                   type          (comments)
 *   activityType                type          (activities)
 *   details                     summary       (activities)
 *   fieldName                   field         (change requests)
 *   rejectReason                adminComment
 *
 * A component that reached for `dto.partDescription` would be reaching past this
 * boundary, which is the thing the boundary exists to prevent.
 */

/** Falls back rather than throwing: a missing timestamp is a display gap, not a failure. */
const orEmpty = (value: string | undefined): string => value ?? ''

/**
 * ⚠️ UNRECOGNISED VALUES FALL BACK RATHER THAN COERCING TO THE FIRST MEMBER.
 * A backend that adds a sixth urgency must not silently render as "Routine" —
 * the safest visible default is the least alarming one that is still honest, and
 * the alternative (throwing) would take down a whole issue for one bad row.
 */
const URGENCIES: readonly PartUrgency[] = ['Routine', 'Priority', 'Emergency']
const PART_STATUSES: readonly PartStatus[] = ['Submitted', 'Approved', 'Ordered', 'Received']
const COMMENT_TYPES: readonly CommEntryType[] = ['Internal', 'External', 'Email']
const CHANGE_FIELDS: readonly ChangeRequestField[] = ['details', 'activityDate', 'partNumber']
const CHANGE_STATUSES: readonly ChangeRequestStatus[] = ['pending', 'approved', 'rejected']

function oneOf<T extends string>(allowed: readonly T[], value: string | undefined, fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

export function toPartRequest(dto: BackendPartRequestDto): PartRequest {
  return {
    id: dto.id,
    issueId: dto.issueId,
    partNumber: dto.partNumber,
    description: dto.partDescription ?? '',
    cost: dto.unitCost ?? 0,
    qty: dto.quantity ?? 0,
    urgency: oneOf(URGENCIES, dto.urgency, 'Routine'),
    status: oneOf(PART_STATUSES, dto.status, 'Submitted'),
    neededBy: dto.neededBy,
    requestedBy: orEmpty(dto.requestedBy),
    requestedAt: orEmpty(dto.requestedAt),
    reason: dto.reason,
    attachments: dto.attachments,
  }
}

export function toComment(dto: BackendCommentDto): Comment {
  return {
    id: dto.id,
    issueId: dto.issueId,
    type: oneOf(COMMENT_TYPES, dto.entryType, 'Internal'),
    author: orEmpty(dto.author),
    authorRole: orEmpty(dto.authorRole),
    body: dto.body,
    createdAt: orEmpty(dto.createdAt),
    hidden: dto.hidden,
  }
}

/**
 * ⚠️ `activityType` IS NOT NARROWED TO A UNION, DELIBERATELY. `ActivityType` is
 * `string` by construction — `data/investigation.ts` records why: a user can
 * REQUEST a new activity type, so no closed union can hold the set. Coercing an
 * unrecognised type to a known one here would erase exactly the case the open
 * type exists for.
 */
export function toActivity(dto: BackendActivityDto): InvestigationActivity {
  return {
    id: dto.id,
    issueId: dto.issueId,
    type: dto.activityType,
    summary: dto.details ?? '',
    author: orEmpty(dto.author),
    authorRole: dto.authorRole,
    createdAt: orEmpty(dto.createdAt),
    attachments: dto.attachments,
    evaluationType: dto.evaluationType,
    parts: dto.parts,
    vins: dto.vins,
    dealerCode: dto.dealerCode,
    members: dto.members,
  }
}

export function toActivityChangeRequest(dto: BackendChangeRequestDto): ActivityChangeRequest {
  return {
    id: dto.id,
    activityId: dto.activityId,
    issueId: orEmpty(dto.issueId),
    field: oneOf(CHANGE_FIELDS, dto.fieldName, 'details'),
    currentValue: orEmpty(dto.currentValue),
    proposedValue: dto.proposedValue,
    // The requester's justification. `reason` on the way in, and the backend
    // also accepts `justification` — take whichever arrived.
    reason: dto.reason ?? dto.justification ?? '',
    status: oneOf(CHANGE_STATUSES, dto.status, 'pending'),
    requestedBy: orEmpty(dto.requestedBy),
    requestedAt: orEmpty(dto.requestedAt),
    decidedBy: dto.decidedBy,
    decidedOn: dto.decidedOn,
    // ⚠️ The REJECTION reason, which is a different field from the request's own
    // `reason` above. Conflating them would show the requester their own words
    // back as the explanation for the refusal.
    adminComment: dto.rejectReason,
  }
}

export function toAuditEntry(dto: BackendAuditEntryDto): AuditEntry {
  return {
    id: dto.id,
    issueId: dto.issueId,
    actor: orEmpty(dto.actor),
    actorRole: orEmpty(dto.actorRole),
    action: dto.action,
    detail: dto.detail,
    timestamp: orEmpty(dto.timestamp),
  }
}

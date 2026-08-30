import {
  CircleDot,
  FileEdit,
  FilePlus,
  FilePlus2,
  Flag,
  GitCompareArrows,
  Hash,
  Link2,
  Link2Off,
  Microscope,
  Package,
  SquarePen,
  Tags,
  UserRoundCheck,
  UserRoundCog,
  type LucideIcon,
} from 'lucide-react'

/**
 * The history event vocabulary — label, segment and icon for every audit action
 * this application writes.
 *
 * Ported from `tabs/HistoryTab/history.catalogue.ts`.
 *
 * ─── THE INVARIANT THIS FILE EXISTS TO HOLD ──────────────────────────────────
 *
 * An event's SEGMENT is a property of the event, declared exactly once, here.
 * No caller derives it and no caller overrides it.
 *
 * The section previously decided both segment and icon by REGEX-MATCHING the
 * action string — `/status|created|approved|escalated/` and eleven more like it.
 * That works only for the strings it was written against: it silently
 * mis-files anything new, and the failure is invisible because a
 * wrongly-categorised row still renders perfectly.
 *
 * ─── KEYED ON ACTION STRINGS, NOT EVENT CODES, AND THAT IS DELIBERATE ────────
 *
 * The Vue catalogue is keyed on wire codes (`ISSUE_STATUS_CHANGED`) because its
 * backend sends them. This app's audit entries carry a human action STRING
 * written at the call site (`store.appendAudit(id, actor, 'Bulk status change')`),
 * so that string is the only key available. Every one it writes today is
 * enumerated below — the list was collected from the store and the seed rather
 * than guessed.
 *
 * ─── AN UNKNOWN ACTION FALLS BACK; IT IS NEVER GUESSED INTO A SEGMENT ────────
 *
 * `resolve()` returns `undefined` for an action with no row, and the caller
 * keeps its existing heuristics for that case. That is the agreed arrangement:
 * nothing that renders today stops rendering, and anything catalogued gets the
 * right treatment instead of a lucky regex hit. When an action is added to the
 * store WITHOUT a row here, it degrades to the old behaviour rather than
 * disappearing.
 */

/** Which segment of the History filter a row belongs to. */
export type HistorySegment = 'lifecycle' | 'audit'

export type HistoryTint = 'blue' | 'amber' | 'purple' | 'green' | 'neutral'

export interface HistoryEventPresentation {
  /** Row title, rendered verbatim — this is what the user reads. */
  label: string
  /** Required. There is no default: a default is what lets an event land in the wrong segment. */
  segment: HistorySegment
  icon: LucideIcon
  tint: HistoryTint
}

/**
 * Every action string the store and the seed write.
 *
 * LIFECYCLE is "what happened to the issue" — the events someone reconstructing
 * the issue's course would want. AUDIT is "what someone did to the record" —
 * still evidence, but noise when you are reading the story.
 *
 * The split matters most where it is least obvious: "Issue record created" and
 * "Status initialized" are AUDIT, not lifecycle, because they are the system
 * writing its own bookkeeping at creation time — the lifecycle event a reader
 * wants there is "Issue created".
 */
export const HISTORY_CATALOGUE: Record<string, HistoryEventPresentation> = {
  // ── Lifecycle ──
  'Issue created': { label: 'Issue created', segment: 'lifecycle', icon: Flag, tint: 'blue' },
  'Started investigation': { label: 'Investigation started', segment: 'lifecycle', icon: Microscope, tint: 'purple' },
  'Proposed transition': { label: 'Status change proposed', segment: 'lifecycle', icon: CircleDot, tint: 'amber' },
  'Approved transition': { label: 'Status change approved', segment: 'lifecycle', icon: CircleDot, tint: 'green' },
  'Rejected transition': { label: 'Status change rejected', segment: 'lifecycle', icon: CircleDot, tint: 'amber' },
  'Bulk status change': { label: 'Status changed in bulk', segment: 'lifecycle', icon: CircleDot, tint: 'blue' },
  'Initial owner assigned': { label: 'Initial owner assigned', segment: 'lifecycle', icon: UserRoundCheck, tint: 'blue' },
  'Owner assigned': { label: 'Owner assigned', segment: 'lifecycle', icon: UserRoundCog, tint: 'blue' },
  'Bulk role assignment': { label: 'Role reassigned in bulk', segment: 'lifecycle', icon: UserRoundCog, tint: 'blue' },
  'Classification selected': { label: 'Classification selected', segment: 'lifecycle', icon: Tags, tint: 'purple' },
  'Issue linked': { label: 'Issue linked', segment: 'lifecycle', icon: Link2, tint: 'blue' },
  'Issues linked': { label: 'Issues linked', segment: 'lifecycle', icon: Link2, tint: 'blue' },
  'Issue unlinked': { label: 'Issue unlinked', segment: 'lifecycle', icon: Link2Off, tint: 'neutral' },

  // ── Activity / audit log ──
  'Issue record created': { label: 'Issue record created', segment: 'audit', icon: FilePlus, tint: 'neutral' },
  'Issue ID generated': { label: 'Issue ID generated', segment: 'audit', icon: Hash, tint: 'neutral' },
  'Status initialized': { label: 'Status initialised', segment: 'audit', icon: CircleDot, tint: 'neutral' },
  'Initial field values saved': { label: 'Initial field values saved', segment: 'audit', icon: FilePlus2, tint: 'neutral' },
  'Issue updated': { label: 'Issue fields updated', segment: 'audit', icon: SquarePen, tint: 'amber' },
  'Logged activity': { label: 'Investigation activity added', segment: 'audit', icon: Microscope, tint: 'purple' },
  'Activity change requested': { label: 'Activity change requested', segment: 'audit', icon: GitCompareArrows, tint: 'amber' },
  'Activity change approved': { label: 'Activity change approved', segment: 'audit', icon: GitCompareArrows, tint: 'green' },
  'Activity change rejected': { label: 'Activity change rejected', segment: 'audit', icon: GitCompareArrows, tint: 'neutral' },
  'Parts request': { label: 'Part requested', segment: 'audit', icon: Package, tint: 'blue' },
  'Part request updated': { label: 'Part request updated', segment: 'audit', icon: Package, tint: 'amber' },
  'Comment added': { label: 'Comment added', segment: 'audit', icon: FileEdit, tint: 'neutral' },
}

/**
 * The catalogue row for an action, or `undefined` when it has none.
 *
 * Deliberately NOT defaulting: a default is exactly what would quietly file a
 * lifecycle event under the audit log, where nobody reading the lifecycle
 * segment would ever see it.
 */
export function resolveHistoryEvent(action: string): HistoryEventPresentation | undefined {
  return HISTORY_CATALOGUE[action]
}

import { Ban, Eye, FileSearch, Flame, FolderOpen, Lock, Microscope, type LucideIcon } from 'lucide-react'
import { STATUS, STATUS_KEYS, type StatusKey } from '@pqms/ui-library'
import type { AuditEntry, Issue } from '@/data/types'

/**
 * THE ISSUE LIFECYCLE TRACK — pure logic, no rendering.
 *
 * Ported 1:1 from the prototype's `stLifecycleData()` in
 * `docs/ux-prototype/PQMS-2.html/PQMS.html`. Its two constant maps (`LC_ICON`,
 * `LC_DESC`) and its `ORDER` rules are reproduced verbatim below; only the data
 * SOURCE differs, and that difference is the one thing worth reading closely —
 * see "WHAT THIS DOES NOT INVENT".
 *
 * ⚠️ PURE, AND IT MUST STAY THAT WAY. It reads no clock and no store: the issue
 * and its audit entries come in as arguments. The track's shape is decided by
 * branches ("was this issue ever monitored?") that are cheap to get subtly wrong
 * and impossible to notice by looking — the same reason `history.ts` next door
 * is a pure module rather than logic inside its component.
 */

/** The prototype's `LC_ICON`, verbatim. */
const LC_ICON: Record<StatusKey, LucideIcon> = {
  open: FolderOpen,
  review: Microscope,
  monitoring: Eye,
  escalated: FileSearch,
  topissue: Flame,
  outofscope: Ban,
  closed: Lock,
}

/** The prototype's `LC_DESC`, verbatim — the tooltip on the current-stage label. */
export const LC_DESC: Record<StatusKey, string> = {
  open: 'Issue registered and awaiting triage.',
  review: 'Investigation activities and evidence are currently being evaluated.',
  monitoring: 'Countermeasure effectiveness is being monitored in the field.',
  escalated: 'A Quality Issue Report has been raised for engineering resolution.',
  topissue: 'Elevated to Top Issue for executive visibility and expedited resolution.',
  outofscope:
    'Determined not applicable / serviceable. QIR and TSB creation are disabled for this issue.',
  closed: 'Issue closed and read-only. Corrective action effectiveness has been confirmed.',
}

/** One recorded move of this issue INTO a status, read back from the audit trail. */
export interface StatusMove {
  to: StatusKey
  timestamp: string
  by: string
  role: string
  reason: string
}

/**
 * The audit trail's status transitions, oldest first.
 *
 * ⚠️ THE TARGET STATUS IS ONLY RECORDED IN A STRING, and that is a property of
 * the store, not a choice made here: `setStatus` and `bulkStatus` both write
 * `detail: "→ <key>: <reason>"`, and the key exists nowhere else on the entry.
 * So this parses it, against the real `StatusKey` vocabulary rather than a loose
 * word match — an unrecognised key is dropped rather than guessed at.
 *
 * TWO ENTRIES ARE DELIBERATELY EXCLUDED, and both would be wrong to count:
 *   · "Proposed transition" writes the SAME `→ key:` shape but does NOT move the
 *     issue — the status only changes if an override role approves it later.
 *   · "Rejected transition" never had a target at all.
 * "Started investigation" IS counted: it moves the issue to `review` and is the
 * one transition the store records without the arrow form.
 */
export function readStatusMoves(audit: AuditEntry[]): StatusMove[] {
  const moves: StatusMove[] = []
  for (const entry of [...audit].reverse()) {
    if (entry.action === 'Started investigation') {
      moves.push({ to: 'review', timestamp: entry.timestamp, by: entry.actor, role: entry.actorRole, reason: entry.detail ?? '' })
      continue
    }
    if (entry.action === 'Proposed transition' || entry.action === 'Rejected transition') continue
    const match = /^→\s+(\w+)(?:\s+\([^)]*\))?:\s*([\s\S]*)$/.exec(entry.detail ?? '')
    if (!match) continue
    const to = match[1] as StatusKey
    if (!STATUS_KEYS.includes(to)) continue
    moves.push({ to, timestamp: entry.timestamp, by: entry.actor, role: entry.actorRole, reason: match[2].trim() })
  }
  return moves
}

/**
 * The stations this issue's track is made of.
 *
 * THE TRACK IS NOT FIXED, and the prototype's comment says why: "Monitoring only
 * appears if it's the current status or the issue was ever moved into it; when
 * shown, Monitoring sits BEFORE Investigating. NASO collapses the path to
 * Open → Investigating → NASO only."
 *
 * That is a better answer than padding every issue with two stations it will
 * never reach — the track a reader sees is the track this issue is actually on.
 */
export function lifecycleOrder(status: StatusKey, moves: StatusMove[]): StatusKey[] {
  if (status === 'outofscope') return ['open', 'review', 'outofscope']
  const everMonitored = status === 'monitoring' || moves.some((m) => m.to === 'monitoring')
  return everMonitored
    ? ['open', 'monitoring', 'review', 'escalated', 'topissue', 'closed']
    : ['open', 'review', 'escalated', 'topissue', 'closed']
}

export type StageState = 'completed' | 'current' | 'upcoming'

export interface LifecycleStage {
  key: StatusKey
  label: string
  color: string
  icon: LucideIcon
  state: StageState
  /**
   * Who moved the issue into this stage, when, and why — `null` when the stage
   * has been passed but no audit entry records the move. See below.
   */
  move: StatusMove | null
}

/**
 * ─── WHAT THIS DOES NOT INVENT ───────────────────────────────────────────────
 *
 * The prototype SYNTHESISES a plausible date, author and reason for every passed
 * stage (`ts = base + vIdx*3*D`, falling back to the owner's name). That is
 * right for a demo and wrong here: this app shows real issues, and a fabricated
 * "moved by Arpita Chavda on 06/14" beside a real audit trail is a lie a reader
 * has no way to detect.
 *
 * So a stage carries `move: null` when the trail holds no entry for it, and the
 * card says so in words. The stage is still marked completed — the CURRENT
 * status proves the issue passed through it; only the provenance is missing.
 */
export function lifecycleStages(issue: Issue, moves: StatusMove[]): LifecycleStage[] {
  const order = lifecycleOrder(issue.status, moves)
  const at = order.indexOf(issue.status)
  return order.map((key, idx) => ({
    key,
    label: STATUS[key].label,
    color: STATUS[key].color,
    icon: LC_ICON[key],
    state: key === issue.status ? 'current' : idx < at ? 'completed' : 'upcoming',
    // The LAST move into this stage: a status can be revisited, and what the
    // panel should show is how the issue got to where it is now, not the first
    // time it ever touched this station.
    move: [...moves].reverse().find((m) => m.to === key) ?? null,
  }))
}

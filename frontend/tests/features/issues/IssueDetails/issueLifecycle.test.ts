// The Issue Lifecycle track's rules — the pure half.
//
// ─── WHY THIS IS THE FILE THAT MATTERS ──────────────────────────────────────
//
// The card's appearance is a stylesheet; its BEHAVIOUR is three branches ported
// from the prototype's `stLifecycleData()`, and each of them is invisible when
// wrong. A track that quietly drops the Monitoring station, or shows the five
// standard stations for a NASO issue, renders perfectly and says something
// false — which is exactly the failure a screenshot review cannot catch.
//
//   · ORDER is dynamic: Monitoring appears only if the issue is there now or was
//     ever moved there, and when it appears it sits BEFORE Investigating.
//   · NASO collapses the whole track to Open → Investigating → NASO.
//   · The target status of a move exists ONLY inside an audit `detail` string,
//     so reading it back is a parser, and parsers are where this breaks.
//
// The proposal cases are the sharp ones: "Proposed transition" writes the same
// `→ key:` shape as a real move but does NOT change the status. A reader that
// counted it would show a track running ahead of the issue.
import { describe, it, expect } from 'vitest'
import type { AuditEntry, Issue } from '@/data/types'
import { ISSUES } from '@/data/seed'
import {
  lifecycleOrder,
  lifecycleStages,
  readStatusMoves,
  type StatusMove,
} from '@/features/issues/workspace/IssueDetails/issue-detail/lifecycle'

/** Audit entries are newest-first, as `auditFor` returns them. */
const entry = (over: Partial<AuditEntry>): AuditEntry => ({
  id: 'a1',
  issueId: 'X-1',
  actor: 'Arpita Chavda',
  actorRole: 'SE',
  action: 'Status changed',
  timestamp: '2026-06-16T08:52:00.000Z',
  ...over,
})

const issueWith = (status: Issue['status']): Issue => ({ ...ISSUES[0], status })

describe('readStatusMoves — the target status lives in a string, so this is a parser', () => {
  it('reads the status and the reason out of the arrow form', () => {
    const moves = readStatusMoves([entry({ detail: '→ escalated: Warranty spike confirmed.' })])
    expect(moves).toEqual([
      expect.objectContaining({ to: 'escalated', reason: 'Warranty spike confirmed.', by: 'Arpita Chavda', role: 'SE' }),
    ])
  })

  it('reads the disposition-outcome variant, which puts a parenthetical before the colon', () => {
    const moves = readStatusMoves([entry({ detail: '→ closed (tsb): Countermeasure shipped.' })])
    expect(moves[0]).toMatchObject({ to: 'closed', reason: 'Countermeasure shipped.' })
  })

  it('counts "Started investigation" — the one move the store records without the arrow', () => {
    const moves = readStatusMoves([entry({ action: 'Started investigation', detail: 'Open → Investigating' })])
    expect(moves[0]).toMatchObject({ to: 'review' })
  })

  it('⚠️ IGNORES a proposal — it writes the same shape but does not move the issue', () => {
    expect(readStatusMoves([entry({ action: 'Proposed transition', detail: '→ closed: Ready to close.' })])).toEqual([])
    expect(readStatusMoves([entry({ action: 'Rejected transition', detail: 'Not yet.' })])).toEqual([])
  })

  it('drops a target that is not a real status rather than guessing at it', () => {
    expect(readStatusMoves([entry({ detail: '→ pending: whatever' })])).toEqual([])
  })

  it('ignores the many audit entries that are not transitions at all', () => {
    const trail = [
      entry({ action: 'Issue updated', detail: 'title, description' }),
      entry({ action: 'Issue linked', detail: '↔ CL-260003 — same symptom' }),
      entry({ action: 'Logged activity', detail: 'teardown: bench test' }),
    ]
    expect(readStatusMoves(trail)).toEqual([])
  })

  it('returns moves oldest-first, reversing the newest-first audit order', () => {
    const trail = [
      entry({ id: 'a2', detail: '→ escalated: second', timestamp: '2026-06-18T09:00:00.000Z' }),
      entry({ id: 'a1', detail: '→ review: first', timestamp: '2026-06-16T09:00:00.000Z' }),
    ]
    expect(readStatusMoves(trail).map((m) => m.to)).toEqual(['review', 'escalated'])
  })
})

describe('lifecycleOrder — the track is built per issue, not fixed', () => {
  const none: StatusMove[] = []

  it('is the five standard stations for an issue that was never monitored', () => {
    expect(lifecycleOrder('escalated', none)).toEqual(['open', 'review', 'escalated', 'topissue', 'closed'])
  })

  it('inserts Monitoring BEFORE Investigating when the issue is there now', () => {
    expect(lifecycleOrder('monitoring', none)).toEqual([
      'open', 'monitoring', 'review', 'escalated', 'topissue', 'closed',
    ])
  })

  it('keeps Monitoring on the track for an issue that has since moved on', () => {
    const moves = readStatusMoves([entry({ detail: '→ monitoring: watching the field.' })])
    expect(lifecycleOrder('closed', moves)).toContain('monitoring')
  })

  it('leaves Monitoring OFF for an issue that never touched it', () => {
    expect(lifecycleOrder('closed', none)).not.toContain('monitoring')
  })

  it('collapses to three stations for NASO, whatever else the trail says', () => {
    const moves = readStatusMoves([entry({ detail: '→ monitoring: watched.' })])
    expect(lifecycleOrder('outofscope', moves)).toEqual(['open', 'review', 'outofscope'])
  })
})

describe('lifecycleStages — exactly one current station, everything before it completed', () => {
  it('marks the status it is on current and the run behind it completed', () => {
    const stages = lifecycleStages(issueWith('escalated'), [])
    expect(stages.map((s) => s.state)).toEqual(['completed', 'completed', 'current', 'upcoming', 'upcoming'])
  })

  it('has nothing completed on a new issue', () => {
    expect(lifecycleStages(issueWith('open'), []).map((s) => s.state)).toEqual([
      'current', 'upcoming', 'upcoming', 'upcoming', 'upcoming',
    ])
  })

  it('has nothing upcoming on a closed issue', () => {
    expect(lifecycleStages(issueWith('closed'), []).map((s) => s.state)).toEqual([
      'completed', 'completed', 'completed', 'completed', 'current',
    ])
  })

  it('carries exactly one current station on every status the vocabulary has', () => {
    for (const status of ['open', 'review', 'monitoring', 'escalated', 'topissue', 'outofscope', 'closed'] as const) {
      const current = lifecycleStages(issueWith(status), []).filter((s) => s.state === 'current')
      expect(current.map((s) => s.key), status).toEqual([status])
    }
  })

  it('attaches the audit entry that produced each stage', () => {
    const moves = readStatusMoves([entry({ detail: '→ review: Investigation opened.' })])
    const stages = lifecycleStages(issueWith('escalated'), moves)
    expect(stages.find((s) => s.key === 'review')?.move).toMatchObject({ reason: 'Investigation opened.' })
  })

  it('⚠️ SYNTHESISES NOTHING — a passed stage with no audit entry carries no move', () => {
    const stages = lifecycleStages(issueWith('escalated'), [])
    expect(stages.find((s) => s.key === 'open')?.move).toBeNull()
    // ...and is still marked completed: the current status proves it was passed.
    expect(stages.find((s) => s.key === 'open')?.state).toBe('completed')
  })

  it('takes the LAST move into a revisited stage, not the first', () => {
    const moves = readStatusMoves([
      entry({ id: 'a2', detail: '→ review: reopened for a second look.', timestamp: '2026-06-20T09:00:00.000Z' }),
      entry({ id: 'a1', detail: '→ review: first pass.', timestamp: '2026-06-16T09:00:00.000Z' }),
    ])
    expect(lifecycleStages(issueWith('escalated'), moves).find((s) => s.key === 'review')?.move?.reason).toBe(
      'reopened for a second look.',
    )
  })
})

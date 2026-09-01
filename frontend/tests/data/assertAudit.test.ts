// The audit-trail seed invariants — one test per guard.
//
// ⚠️ WHY THIS FILE EXISTS AT ALL. `checkAuditRows` guards the seeded history
// trails, and read against the real seed every one of its failure branches is
// unreachable: the fixture is valid, so nothing takes them. A guard in that
// state reports "all clear" whether or not its comparisons are the right way
// round — it is indistinguishable from an empty function until the day it has to
// catch something, which is the day it is trusted most.
//
// So each rule is violated deliberately, one at a time, and the guard is required
// to name it. The real seed is separately asserted to PASS, so the tests below
// cannot be satisfied by a guard that simply rejects everything.
import { describe, it, expect } from 'vitest'
import { checkAuditRows } from '@/data/assertSeed'
import { AUDIT, ISSUES } from '@/data/seed'
import type { AuditEntry, Issue } from '@/data/types'

/** Two issues, deliberately minimal — only the fields the guard reads. */
const issue = (id: string, createdAt: string): Issue =>
  ({ id, title: id, status: 'open', createdAt }) as unknown as Issue

const row = (over: Partial<AuditEntry> & { id: string; issueId: string; timestamp: string }): AuditEntry => ({
  actor: 'Tester',
  actorRole: 'SE',
  action: 'Issue created',
  detail: 'Lifecycle',
  ...over,
})

/**
 * Eight issues with a row each, which is the minimum the guard demands. Every
 * test below starts from a VALID set and breaks exactly one thing, so a failure
 * can only be the rule under test.
 */
const validPair = () => {
  const issues = Array.from({ length: 8 }, (_, i) => issue(`EE-${100 + i}`, '2026-01-01T09:00:00Z'))
  const rows = issues.map((i) => row({ id: `r-${i.id}`, issueId: i.id, timestamp: '2026-01-02T09:00:00Z' }))
  return { issues, rows }
}

const expectRefusal = (issues: Issue[], rows: AuditEntry[], match: RegExp) =>
  expect(() => checkAuditRows(issues, rows)).toThrow(match)

describe('the guard accepts a valid set', () => {
  it('passes the real seed', () => {
    // The control. Without it, every test below could be satisfied by a guard
    // that throws unconditionally.
    expect(() => checkAuditRows(ISSUES, AUDIT)).not.toThrow()
  })

  it('passes the minimal synthetic set the other tests build on', () => {
    const { issues, rows } = validPair()
    expect(() => checkAuditRows(issues, rows)).not.toThrow()
  })
})

describe('row-level rules', () => {
  it('refuses a duplicate audit id', () => {
    const { issues, rows } = validPair()
    rows.push(row({ id: rows[0].id, issueId: issues[0].id, timestamp: '2026-01-03T09:00:00Z' }))
    expectRefusal(issues, rows, /duplicate audit id/i)
  })

  it('refuses a row belonging to an unseeded issue', () => {
    const { issues, rows } = validPair()
    rows.push(row({ id: 'r-ghost', issueId: 'ZZ-999999', timestamp: '2026-01-02T09:00:00Z' }))
    expectRefusal(issues, rows, /unseeded issue/i)
  })

  it('refuses a row with no actor', () => {
    const { issues, rows } = validPair()
    rows[0] = { ...rows[0], actor: '   ' }
    expectRefusal(issues, rows, /has no actor$/im)
  })

  it('refuses a row with no actor role', () => {
    const { issues, rows } = validPair()
    rows[0] = { ...rows[0], actorRole: '' }
    expectRefusal(issues, rows, /has no actor role/i)
  })

  it('refuses a row with no action', () => {
    const { issues, rows } = validPair()
    rows[0] = { ...rows[0], action: '' }
    expectRefusal(issues, rows, /has no action/i)
  })
})

describe('⚠️ ORDER, which is the rule with no visible symptom', () => {
  /*
   * `auditFor` filters and does not sort, so the array order IS the render order.
   * A trail assembled oldest-first still renders as a timeline — it just reads
   * backwards, which no type, screenshot or diff catches.
   */
  it('refuses a trail that is not newest-first', () => {
    const { issues, rows } = validPair()
    const id = issues[0].id
    const oldest = row({ id: 'r-old', issueId: id, timestamp: '2026-01-01T10:00:00Z' })
    const newest = row({ id: 'r-new', issueId: id, timestamp: '2026-01-05T10:00:00Z' })
    // Oldest first — the wrong way round.
    expectRefusal(issues, [oldest, newest, ...rows.slice(1)], /not newest-first/i)
  })

  it('ALLOWS two rows sharing a timestamp', () => {
    // Only a strict increase is a failure: two events can land in the same
    // minute, and refusing that would make the guard reject valid fixtures.
    const { issues, rows } = validPair()
    const id = issues[0].id
    const a = row({ id: 'r-a', issueId: id, timestamp: '2026-01-03T10:00:00Z' })
    const b = row({ id: 'r-b', issueId: id, timestamp: '2026-01-03T10:00:00Z' })
    expect(() => checkAuditRows(issues, [a, b, ...rows.slice(1)])).not.toThrow()
  })

  it('refuses a row that predates the issue it describes', () => {
    const { issues, rows } = validPair()
    rows[0] = { ...rows[0], timestamp: '2025-12-31T09:00:00Z' }
    expectRefusal(issues, rows, /predates/i)
  })

  /*
   * HV-260101's trail is hand-written against the NOW anchor rather than derived
   * from `createdAt`, so it is exempt from the predates rule. The exemption is
   * asserted because an unexercised exemption is indistinguishable from a typo.
   */
  it('exempts HV-260101 from the predates rule', () => {
    const { issues, rows } = validPair()
    const hv = issue('HV-260101', '2026-06-01T09:00:00Z')
    const early = row({ id: 'r-hv', issueId: hv.id, timestamp: '2026-01-01T09:00:00Z' })
    expect(() => checkAuditRows([...issues, hv], [...rows, early])).not.toThrow()
  })
})

describe('the coverage rule', () => {
  /*
   * The reason the seed grew trails in the first place: View History was empty
   * for 34 of 35 issues. If the generator stops producing them the only symptom
   * is a blank panel that reads as a design choice, so the count is pinned.
   */
  it('refuses a seed where too few issues have trails', () => {
    const { issues, rows } = validPair()
    // Collapse every row onto one issue: eight rows, one trail.
    const collapsed = rows.map((r, i) => ({ ...r, id: `c-${i}`, issueId: issues[0].id }))
    expectRefusal(issues, collapsed, /only 1 issues have audit trails/i)
  })

  it('counts issues, not rows', () => {
    // Exactly eight trails of one row each satisfies it; the guard must not be
    // counting total rows, which would pass the collapsed case above too.
    const { issues, rows } = validPair()
    expect(() => checkAuditRows(issues, rows)).not.toThrow()
  })
})

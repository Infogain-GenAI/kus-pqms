// Issue-group FORMATION at registration.
//
// ─── WHY THIS IS PINNED SO HEAVILY ───────────────────────────────────────────
//
// Four outcomes hide behind one user action — form / join / MERGE / refuse — and
// three of them are invisible on screen. Only the audit action name distinguishes
// "this created a group" from "this merged two", and a merge silently rewrites
// issues the user never selected. Nothing pinned any of it before now, which is
// how the whole mechanism went unported without being noticed.
//
// ⚠️ THESE TEST THE PURE HELPER. The store-level fan-out — which OTHER issues
// change and what each of their audit trails says — is pinned in
// `store.test.tsx`, because that is where the writing happens and where a
// "a group exists afterwards" assertion would be too weak to catch a defect.
import { describe, it, expect } from 'vitest'
import { formIssueGroup } from '@/data/issueGroups'
import type { Issue } from '@/data/types'

/** A minimal issue; only the fields formation reads are meaningful. */
const mk = (id: string, createdAt: string, groupId?: string): Issue =>
  ({ id, title: id, status: 'open', model: 'X', modelYear: 2026, createdAt, groupId }) as unknown as Issue

const NEW = 'EE-999999'
/** Later than every fixture below, as a real registration always is. */
const NOW = '2026-09-01T00:00:00Z'

const form = (linkedIds: string[], pool: Issue[], createdAt = NOW) =>
  formIssueGroup({ newIssueId: NEW, newIssueCreatedAt: createdAt, linkedIds, pool })

describe('no links means no group', () => {
  it('forms nothing when nothing is linked', () => {
    const r = form([], [mk('A', '2026-01-01T00:00:00Z')])
    expect(r.groupId).toBeNull()
    expect(r.action).toBeNull()
    expect(r.memberIds).toEqual([])
    expect(r.rewriteIds).toEqual([])
  })

  it('ignores a linked id with no issue behind it', () => {
    // Seed data contains such ids deliberately; they must not abort formation.
    const r = form(['GHOST-1'], [mk('A', '2026-01-01T00:00:00Z')])
    expect(r.groupId).toBeNull()
    expect(r.blockedReason).toBeNull()
  })
})

describe('0 source groups — a new group FORMS', () => {
  const pool = [mk('A', '2026-01-01T00:00:00Z'), mk('B', '2026-02-01T00:00:00Z')]

  it('is called "Issue Group created"', () => {
    expect(form(['A', 'B'], pool).action).toBe('Issue Group created')
  })

  it('keys the group on the EARLIEST member, not the new issue', () => {
    const r = form(['A', 'B'], pool)
    expect(r.parentId).toBe('A')
    // groupId IS the parent's id — the convention assertIssueGroups validates.
    expect(r.groupId).toBe('A')
    // Negative control: the brand-new issue must never become parent.
    expect(r.parentId).not.toBe(NEW)
  })

  it('rewrites BOTH standalones, since neither had a group', () => {
    expect(form(['A', 'B'], pool).rewriteIds.sort()).toEqual(['A', 'B'])
  })
})

describe('1 source group — the new issue JOINS it', () => {
  // A pre-existing group of three, keyed on its earliest member.
  const pool = [
    mk('P', '2026-01-01T00:00:00Z', 'P'),
    mk('C1', '2026-02-01T00:00:00Z', 'P'),
    mk('C2', '2026-03-01T00:00:00Z', 'P'),
  ]

  it('is called "Issue linked to Issue Group"', () => {
    expect(form(['C1'], pool).action).toBe('Issue linked to Issue Group')
  })

  it('⚠️ PULLS IN MEMBERS THE USER NEVER SELECTED — transitively', () => {
    // The user linked ONE issue. All three of its group arrive.
    const r = form(['C1'], pool)
    expect(r.memberIds.sort()).toEqual(['C1', 'C2', 'P'])
  })

  it('keeps the existing parent and rewrites NOBODY', () => {
    const r = form(['C1'], pool)
    expect(r.groupId).toBe('P')
    // The members already carry this groupId. Rewriting them would produce
    // pointless audit entries claiming their group changed when it did not.
    expect(r.rewriteIds).toEqual([])
  })

  it('expands the source group once, however many of its members are linked', () => {
    const r = form(['C1', 'C2', 'P'], pool)
    expect(r.memberIds.sort()).toEqual(['C1', 'C2', 'P'])
    expect(r.sourceGroupIds).toEqual(['P'])
    expect(r.action).toBe('Issue linked to Issue Group')
  })
})

describe('2+ source groups — they MERGE', () => {
  const pool = [
    mk('P1', '2026-01-01T00:00:00Z', 'P1'),
    mk('A1', '2026-02-01T00:00:00Z', 'P1'),
    mk('P2', '2026-03-01T00:00:00Z', 'P2'),
    mk('B1', '2026-04-01T00:00:00Z', 'P2'),
  ]

  it('is called "Issue Groups merged" — the only outward sign it happened', () => {
    expect(form(['A1', 'B1'], pool).action).toBe('Issue Groups merged')
  })

  it('collects every member of both groups from two selections', () => {
    const r = form(['A1', 'B1'], pool)
    expect(r.memberIds.sort()).toEqual(['A1', 'B1', 'P1', 'P2'])
    expect(r.sourceGroupIds.sort()).toEqual(['P1', 'P2'])
  })

  it('keys the merged group on the earliest member across BOTH', () => {
    expect(form(['A1', 'B1'], pool).groupId).toBe('P1')
  })

  it('rewrites only the LOSING group, not the surviving one', () => {
    // P1's members keep their groupId; P2's move. Rewriting all four would
    // audit a change that did not happen to half of them.
    expect(form(['A1', 'B1'], pool).rewriteIds.sort()).toEqual(['B1', 'P2'])
  })
})

describe('the chronology guard REFUSES registration', () => {
  /*
   * Constructed deliberately rather than waited for: on today's seed the new
   * issue's timestamp is always the largest, so this can never occur naturally.
   * That is the guard working, and it is why it must be tested this way — an
   * untested guard that never fires is indistinguishable from dead code.
   */
  const future = [mk('FUTURE', '2099-01-01T00:00:00Z')]

  it('blocks when a linked issue is dated AFTER the new one', () => {
    const r = form(['FUTURE'], future)
    expect(r.blockedReason).toBe('Child Issue Date cannot be earlier than the Parent Issue Date.')
  })

  it('forms NOTHING when blocked — no partial group', () => {
    const r = form(['FUTURE'], future)
    expect(r.groupId).toBeNull()
    expect(r.parentId).toBeNull()
    expect(r.memberIds).toEqual([])
    expect(r.rewriteIds).toEqual([])
    expect(r.action).toBeNull()
  })

  it('does NOT block on an equal timestamp, only a later one', () => {
    // The boundary: same instant is not an inversion. Asserted in both
    // directions so the comparison cannot be off by one.
    const at = '2026-05-05T00:00:00Z'
    expect(form(['S'], [mk('S', at)], at).blockedReason).toBeNull()
    expect(form(['S'], [mk('S', at)], '2026-05-04T23:59:59Z').blockedReason).not.toBeNull()
  })
})

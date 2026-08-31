// Draft/commit group-membership edits — the CASCADES.
//
// Three things happen that are invisible on screen, and each is pinned here
// separately because each has its own way of being silently wrong:
//   · a group of two DISSOLVES when a member leaves;
//   · removing the PARENT promotes the next-earliest and logs a system entry;
//   · removals are CHAINED — each computed against the previous one's result.
//
// ⚠️ THE DISSOLVE AND THE PARENT-CHANGE ENTRY BOTH NEED A GROUP CONSTRUCTED ON
// PURPOSE. A 2-member group is the only way to observe the dissolve, and the
// parent-change entry only fires when the parent leaves a group of 3+. Neither
// arises from casually chosen fixtures, which is exactly why they are the two
// most likely to go untested.
import { describe, it, expect } from 'vitest'
import { planGroupEdits } from '@/data/groupEdits'
import type { Issue } from '@/data/types'

const mk = (id: string, createdAt: string, groupId?: string): Issue =>
  ({ id, title: id, status: 'open', model: 'X', modelYear: 2026, createdAt, groupId }) as unknown as Issue

const WHY = 'No longer believed to share a root cause.'

/** A three-member group keyed on its earliest, P. */
const trio = () => [
  mk('P', '2026-01-01T00:00:00Z', 'P'),
  mk('B', '2026-02-01T00:00:00Z', 'P'),
  mk('C', '2026-03-01T00:00:00Z', 'P'),
]

/** A two-member group — the only shape in which a dissolve is observable. */
const pair = () => [mk('P', '2026-01-01T00:00:00Z', 'P'), mk('B', '2026-02-01T00:00:00Z', 'P')]

const remove = (pool: Issue[], ids: string[], activeId = 'P') =>
  planGroupEdits(pool, { activeId, removals: ids.map((id) => ({ id, justification: WHY })), additions: [] })

const actionsFor = (plan: ReturnType<typeof planGroupEdits>, id: string) =>
  plan.audits.filter((a) => a.issueId === id).map((a) => a.action)

describe('removing a non-parent from a group of three', () => {
  it('clears only that member', () => {
    const plan = remove(trio(), ['C'])
    expect(plan.groupIds).toEqual({ C: null })
  })

  it('audits the removed member and EVERY survivor, with distinguishable wording', () => {
    const plan = remove(trio(), ['C'])
    const own = plan.audits.find((a) => a.issueId === 'C' && a.action === 'Issue Unlinked')
    expect(own?.detail).toContain('C removed from Issue Group')
    for (const id of ['P', 'B']) {
      const row = plan.audits.find((a) => a.issueId === id && a.action === 'Issue Unlinked')
      expect(row, `${id} was not told`).toBeTruthy()
      // The survivors' wording says "this Issue Group" — their view of it.
      expect(row!.detail).toContain('removed from this Issue Group')
      expect(row!.detail).toContain(WHY)
    }
  })

  it('logs NO parent change — the parent did not move', () => {
    expect(remove(trio(), ['C']).audits.map((a) => a.action)).not.toContain('Parent Issue Changed')
  })
})

describe('⚠️ removing the PARENT of a group of three', () => {
  it('promotes the next-earliest and says so', () => {
    const plan = remove(trio(), ['P'])
    const entry = plan.audits.find((a) => a.action === 'Parent Issue Changed')
    expect(entry, 'no parent-change entry').toBeTruthy()
    // Written to the NEW parent, which is the issue whose role changed.
    expect(entry!.issueId).toBe('B')
    expect(entry!.detail).toContain('Previous Parent: P')
    expect(entry!.detail).toContain('New Parent: B')
  })

  it('⚠️ CARRIES NO USER JUSTIFICATION — it is system-generated', () => {
    // The reason the user gave was for the REMOVAL. Repeating it here would
    // attribute a system decision to them.
    const entry = remove(trio(), ['P']).audits.find((a) => a.action === 'Parent Issue Changed')!
    expect(entry.detail).not.toContain(WHY)
    expect(entry.detail).toContain('Previous Parent Issue was unlinked')
  })

  it('does NOT rewrite the survivors — the key is allowed to dangle', () => {
    // P leaves; B and C keep groupId 'P', which now names a non-member.
    // Membership is equality on a shared value, so they remain a group.
    expect(remove(trio(), ['P']).groupIds).toEqual({ P: null })
  })
})

describe('⚠️ THE CASCADING DISSOLVE — a group of two', () => {
  it('clears BOTH members, not just the one removed', () => {
    // A single remaining member is not a group. This is the case that needs a
    // 2-member fixture to see at all.
    const plan = remove(pair(), ['B'])
    expect(plan.groupIds).toEqual({ B: null, P: null })
  })

  it('emits NO parent-change entry — there is no group left to have a parent', () => {
    expect(remove(pair(), ['P']).audits.map((a) => a.action)).not.toContain('Parent Issue Changed')
  })

  it('dissolves when the PARENT is the one removed, too', () => {
    const plan = remove(pair(), ['P'])
    expect(plan.groupIds).toEqual({ P: null, B: null })
  })

  it('still tells the surviving member why', () => {
    const plan = remove(pair(), ['B'])
    const row = plan.audits.find((a) => a.issueId === 'P' && a.action === 'Issue Unlinked')
    expect(row?.detail).toContain(WHY)
  })
})

describe('⚠️ REMOVALS ARE CHAINED, not independent', () => {
  it('a second removal from a trio triggers the DISSOLVE', () => {
    /*
     * Remove C, then B. Independently, each is "remove a non-parent from a
     * 3-member group" and P would keep its group. Chained, the second removal
     * sees a 2-member group and dissolves it — so P is cleared too.
     *
     * This is the assertion that fails if the loop reads `pool` each time
     * instead of threading its own override.
     */
    const plan = remove(trio(), ['C', 'B'])
    expect(plan.groupIds).toEqual({ C: null, B: null, P: null })
  })

  it('promotes on the first removal and dissolves on the second', () => {
    // Remove P (parent, 3 members → promote B), then B (2 members → dissolve).
    const plan = remove(trio(), ['P', 'B'])
    expect(actionsFor(plan, 'B')).toContain('Parent Issue Changed')
    expect(plan.groupIds).toEqual({ P: null, B: null, C: null })
  })
})

describe('adding a member', () => {
  it('joins the active issue existing group, keyed on its parent', () => {
    const pool = [...trio(), mk('NEW', '2026-06-01T00:00:00Z')]
    const plan = planGroupEdits(pool, { activeId: 'B', removals: [], additions: [{ id: 'NEW', justification: WHY }] })
    expect(plan.groupIds).toEqual({ NEW: 'P' })
  })

  it('forms a group keyed on the EARLIER of the two when the active issue has none', () => {
    const pool = [mk('OLD', '2026-01-01T00:00:00Z'), mk('YOUNG', '2026-05-01T00:00:00Z')]
    const plan = planGroupEdits(pool, {
      activeId: 'YOUNG',
      removals: [],
      additions: [{ id: 'OLD', justification: WHY }],
    })
    // OLD is earlier, so it keys the group even though YOUNG is the active issue.
    expect(plan.groupIds).toEqual({ YOUNG: 'OLD', OLD: 'OLD' })
  })

  it('audits both sides, each with the reason', () => {
    const pool = [...trio(), mk('NEW', '2026-06-01T00:00:00Z')]
    const plan = planGroupEdits(pool, { activeId: 'B', removals: [], additions: [{ id: 'NEW', justification: WHY }] })
    const rows = plan.audits.filter((a) => a.action === 'Issue Linked')
    expect(rows.map((r) => r.issueId).sort()).toEqual(['B', 'NEW'])
    for (const r of rows) expect(r.detail).toContain(WHY)
  })
})

describe('nothing to do', () => {
  it('plans no change and no audit for an empty request', () => {
    const plan = planGroupEdits(trio(), { activeId: 'P', removals: [], additions: [] })
    expect(plan.groupIds).toEqual({})
    expect(plan.audits).toEqual([])
  })

  it('ignores a removal of an issue that is in no group', () => {
    const plan = remove([mk('LONE', '2026-01-01T00:00:00Z')], ['LONE'], 'LONE')
    expect(plan.groupIds).toEqual({})
    expect(plan.audits).toEqual([])
  })
})

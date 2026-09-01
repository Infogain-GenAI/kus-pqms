// Immediate single-member removal — `store.removeRelated`.
//
// ⚠️ ONE CONTROL, TWO RELATIONSHIP TYPES. The design's `openGroupUnlinkModal`
// inspects `groupMembers(id)` before deciding what "unlink" even means:
//   · a genuine 2+ group → remove from the GROUP, with the dissolve cascade;
//   · anything else      → plain SYMMETRIC unlink.
// Picking the wrong branch silently edits the wrong relationship and looks
// entirely successful, which is the whole class of defect this model change
// exists to fix. So the branch itself is what these pin.
//
// Both branches are awkward to reach by accident: the dissolve needs a 2-member
// group built on purpose, and the fallback needs a target that is NOT really
// grouped. Both are constructed deliberately below.
import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'

const Wrapped = ({ children }: { children: ReactNode }) => (
  <RoleProvider>
    <StoreProvider>{children}</StoreProvider>
  </RoleProvider>
)

const ACTOR = { name: 'Tester', role: 'SE' }
const WHY = 'Investigated separately; no longer part of this cohort.'

/** A seeded four-member group, keyed on its earliest. */
const GROUP = 'EE-260023'

const setup = () => renderHook(() => useStore(), { wrapper: Wrapped })
const remove = (r: { current: ReturnType<typeof useStore> }, active: string, target: string, why = WHY) =>
  act(() => r.current.removeRelated(active, target, why, ACTOR))

describe('the GROUP branch — target is in a real group', () => {
  it('removes the member from the group', () => {
    const { result } = setup()
    const members = result.current.groupMembers(GROUP)
    expect(members.length, 'fixture must be a multi-member group').toBeGreaterThan(2)
    const target = members[members.length - 1].id

    remove(result, GROUP, target)

    expect(result.current.getIssue(target)!.groupId).toBeUndefined()
    // The others are untouched — this removes one member, not the group.
    for (const m of members.filter((x) => x.id !== target)) {
      expect(result.current.getIssue(m.id)!.groupId, `${m.id} moved`).toBeTruthy()
    }
  })

  it('audits the removal on the member AND on every survivor', () => {
    const { result } = setup()
    const members = result.current.groupMembers(GROUP).map((m) => m.id)
    const target = members[members.length - 1]

    remove(result, GROUP, target)

    for (const id of members) {
      const rows = result.current.auditFor(id).filter((a) => a.action === 'Issue Unlinked')
      expect(rows.length, `${id} audit rows`).toBe(1)
      expect(rows[0].detail).toContain(WHY)
    }
  })

  it('⚠️ PROMOTES A NEW PARENT when the parent itself is removed', () => {
    const { result } = setup()
    const members = result.current.groupMembers(GROUP).map((m) => m.id)
    const parent = members[0]
    const heir = members[1]

    remove(result, GROUP, parent)

    const entry = result.current.auditFor(heir).find((a) => a.action === 'Parent Issue Changed')
    expect(entry, 'no promotion recorded').toBeTruthy()
    expect(entry!.detail).toContain(`Previous Parent: ${parent}`)
    expect(entry!.detail).toContain(`New Parent: ${heir}`)
    // System-generated: it must NOT borrow the user's reason for the removal.
    expect(entry!.detail).not.toContain(WHY)
  })

  it('does NOT touch symmetric links', () => {
    const { result } = setup()
    const members = result.current.groupMembers(GROUP).map((m) => m.id)
    const target = members[members.length - 1]
    const before = [...(result.current.getIssue(target)!.linkedIssueIds ?? [])]

    remove(result, GROUP, target)

    expect(result.current.getIssue(target)!.linkedIssueIds ?? []).toEqual(before)
  })
})

describe('⚠️ THE DISSOLVE — removing from a group of exactly two', () => {
  /*
   * Constructed on purpose: the seeded groups have three and four members, so
   * nothing reaches a 2-member group by accident. Reduced to two first, then the
   * dissolve is observed on the next removal.
   */
  const reduceToPair = (r: { current: ReturnType<typeof useStore> }) => {
    let members = r.current.groupMembers(GROUP).map((m) => m.id)
    /*
     * ⚠️ BOUNDED. This was an unbounded `while`, and a mutation that stopped
     * removal from working made it spin forever — turning a clean failure into a
     * ten-minute timeout with no diagnosis. A test loop whose exit depends on the
     * code under test needs a bound, or it stops being able to report anything.
     */
    for (let guard = 0; guard < 10 && members.length > 2; guard++) {
      remove(r, GROUP, members[members.length - 1], 'Trimming the cohort down for this scenario.')
      members = r.current.groupMembers(GROUP).map((m) => m.id)
    }
    return members
  }

  it('clears BOTH members — one issue is not a group', () => {
    const { result } = setup()
    const pair = reduceToPair(result)
    expect(pair.length, 'failed to construct a 2-member group').toBe(2)

    remove(result, GROUP, pair[1])

    expect(result.current.getIssue(pair[1])!.groupId, 'removed member still grouped').toBeUndefined()
    expect(result.current.getIssue(pair[0])!.groupId, 'THE SURVIVOR WAS LEFT IN A GROUP OF ONE').toBeUndefined()
    expect(result.current.groupMembers(pair[0])).toEqual([])
  })

  it('records NO parent change — there is no group left to have a parent', () => {
    const { result } = setup()
    const pair = reduceToPair(result)
    remove(result, GROUP, pair[0]) // remove the parent of the pair

    for (const id of pair) {
      const actions = result.current.auditFor(id).map((a) => a.action)
      expect(actions, `${id} recorded a promotion into an empty group`).not.toContain('Parent Issue Changed')
    }
  })
})

describe('⚠️ THE FALLBACK — target is NOT in a real group', () => {
  /*
   * ─── TWO HONEST CAVEATS, BOTH WORTH STATING ────────────────────────────────
   *
   * 1. THIS BRANCH IS UNREACHABLE FROM THE UI TODAY. Both live callers of
   *    `removeRelated` are GroupCard's `onRemoveMember`, and GroupCard renders
   *    only for a `e.group` entry — entries gain `.group` only when the issue has
   *    a `groupId` that resolves to members — so every id a control can pass is
   *    already a confirmed multi-member group. The branch exists so
   *    `removeRelated` is safe as a general-purpose store function for whoever
   *    wires the workspace's own removal next. That is a real reason, but it is
   *    not the same as "covered because users hit it", and it should not read
   *    that way.
   *
   * 2. THE SEED CANNOT PRODUCE THE SCENARIO. An earlier version of this suite
   *    searched for two seeded issues sharing a symmetric link and belonging to
   *    no group, and quietly substituted a weaker synthetic case when it found
   *    none. It ALWAYS found none: of 35 seeded issues, all 10 reciprocal links
   *    are between issues that also share a `groupId`. So the primary scenario
   *    silently degraded on every run — a test that passes while proving less
   *    than it claims, which is the same family as the vacuity cases.
   *
   * The fix is neither to seed a pair nor to write the limitation off: the pair
   * is CONSTRUCTED here, unconditionally, through `linkIssue`. `linkIssue` writes
   * only `linkedIssueIds` and never `groupId`, so two ungrouped issues linked
   * this way are exactly the intended input, and the setup cannot degrade because
   * there is no longer a search to fail.
   */
  const WHY_LINK = 'Recorded as related while the investigation was open.'

  /** Two ungrouped issues, symmetrically linked on purpose. */
  const linkUngroupedPair = (r: { current: ReturnType<typeof useStore> }) => {
    const ungrouped = r.current.issues.filter((i) => !i.groupId).map((i) => i.id)
    expect(ungrouped.length, 'fixture has no ungrouped issues at all').toBeGreaterThan(1)
    const [a, b] = ungrouped
    act(() => r.current.linkIssue(a, b, WHY_LINK, ACTOR))

    // The construction is asserted, not assumed — if `linkIssue` ever starts
    // assigning a group, or stops being symmetric, these tests would otherwise
    // go on "passing" against the wrong input.
    expect(r.current.getIssue(a)!.linkedIssueIds ?? [], 'link not written').toContain(b)
    expect(r.current.getIssue(b)!.linkedIssueIds ?? [], 'link is not reciprocal').toContain(a)
    expect(r.current.getIssue(a)!.groupId, 'linkIssue assigned a group').toBeUndefined()
    expect(r.current.getIssue(b)!.groupId, 'linkIssue assigned a group').toBeUndefined()
    return [a, b] as const
  }

  it('falls back to a SYMMETRIC unlink rather than a group removal', () => {
    const { result } = setup()
    const [a, b] = linkUngroupedPair(result)

    remove(result, a, b)

    // Removed from BOTH sides — the defining property of the symmetric relation.
    expect(result.current.getIssue(a)!.linkedIssueIds ?? []).not.toContain(b)
    expect(result.current.getIssue(b)!.linkedIssueIds ?? []).not.toContain(a)
  })

  it('⚠️ takes the symmetric branch, distinguished by CASE alone', () => {
    const { result } = setup()
    const [a, b] = linkUngroupedPair(result)

    remove(result, a, b)

    /*
     * `unlinkIssue` audits the issue whose screen you are on, NOT the target —
     * the group path audits the removed member and every survivor instead. The
     * asymmetry is easy to assert backwards and doing so cost a debugging cycle.
     *
     * And the two actions differ only by one letter's case: 'Issue unlinked' is
     * symmetric, 'Issue Unlinked' is the group removal. That is what pins which
     * branch ran.
     */
    const rows = result.current.auditFor(a).filter((x) => x.action === 'Issue unlinked')
    expect(rows.length, 'the symmetric branch did not run').toBe(1)
    expect(rows[0].detail).toContain(WHY)
    expect(
      result.current.auditFor(a).map((x) => x.action),
      'took the GROUP branch for an ungrouped target',
    ).not.toContain('Issue Unlinked')
  })

  it('leaves every group untouched', () => {
    const { result } = setup()
    const [a, b] = linkUngroupedPair(result)
    const before = new Map(result.current.issues.map((i) => [i.id, i.groupId]))

    remove(result, a, b)

    const moved = result.current.issues.filter((i) => before.get(i.id) !== i.groupId).map((i) => i.id)
    expect(moved, 'the fallback changed group membership').toEqual([])
  })
})

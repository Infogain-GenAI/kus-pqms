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
  /** Two seeded issues that share a symmetric link and belong to no group. */
  const linkedPair = (s: ReturnType<typeof useStore>) => {
    const ids = new Set(s.issues.map((i) => i.id))
    for (const i of s.issues) {
      if (i.groupId) continue
      const partner = (i.linkedIssueIds ?? []).find((l) => ids.has(l) && !s.getIssue(l)?.groupId)
      if (partner) return [i.id, partner]
    }
    return []
  }

  it('falls back to a SYMMETRIC unlink rather than a group removal', () => {
    const { result } = setup()
    const [a, b] = linkedPair(result.current)

    if (!a) {
      /*
       * No ungrouped, mutually-linked pair in the fixture — so the branch is
       * exercised through its other observable consequence instead: an
       * ungrouped target must not gain or lose a group.
       */
      const lone = result.current.issues.find((i) => !i.groupId)!.id
      const other = result.current.issues.find((i) => i.id !== lone)!.id
      remove(result, other, lone)
      expect(result.current.getIssue(lone)!.groupId).toBeUndefined()
      /*
       * ⚠️ THE ROW LANDS ON THE ACTIVE ISSUE, NOT THE TARGET — the two branches
       * audit differently, and that asymmetry is easy to assert backwards.
       * `unlinkIssue` writes one row to the issue whose screen you are on;
       * `planGroupEdits` writes to the removed member AND every survivor.
       */
      const rows = result.current.auditFor(other).filter((x) => x.action === 'Issue unlinked')
      expect(rows.length, 'the symmetric branch did not run').toBe(1)
      expect(rows[0].detail).toContain(WHY)
      // Lowercase 'Issue unlinked' is the SYMMETRIC action; the group one is
      // 'Issue Unlinked'. They differ only by case, so this pins which ran.
      expect(result.current.auditFor(other).map((x) => x.action)).not.toContain('Issue Unlinked')
      return
    }

    remove(result, a, b)

    // Symmetric removal, both sides — and NOT a group action.
    expect(result.current.getIssue(a)!.linkedIssueIds ?? []).not.toContain(b)
    expect(result.current.getIssue(b)!.linkedIssueIds ?? []).not.toContain(a)
    const actions = result.current.auditFor(b).map((x) => x.action)
    expect(actions).toContain('Issue unlinked')
    expect(actions, 'took the group branch for an ungrouped target').not.toContain('Issue Unlinked')
  })

  it('leaves every group untouched', () => {
    const { result } = setup()
    const before = new Map(result.current.issues.map((i) => [i.id, i.groupId]))
    const lone = result.current.issues.find((i) => !i.groupId)!.id
    const other = result.current.issues.find((i) => i.id !== lone)!.id

    remove(result, other, lone)

    const moved = result.current.issues.filter((i) => before.get(i.id) !== i.groupId).map((i) => i.id)
    expect(moved, 'the fallback changed group membership').toEqual([])
  })
})

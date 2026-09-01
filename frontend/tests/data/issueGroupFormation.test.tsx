// Registration-time group formation, THROUGH THE STORE.
//
// `issueGroups.test.ts` pins the pure rules. This pins the part that writes:
// registering ONE issue can change SEVERAL others' `groupId` and must leave an
// audit row on each of them.
//
// ⚠️ SO THESE ASSERT *WHICH* ISSUES MOVED AND WHAT EACH TRAIL SAYS. "A group
// exists afterwards" would pass with the fan-out deleted, with the wrong issues
// moved, or with the audit written only to the new issue — which is the failure
// that leaves other issues' owners with no explanation for why their parent
// changed.
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
const WHY = 'Same root cause suspected across these records.'

/** Seeded cohorts — `assertIssueGroups` guarantees both exist and are disjoint. */
const GROUP_A_MEMBER = 'EE-260031' // group 'EE-260023'
const GROUP_B_MEMBER = 'EE-260105' // group 'EE-260100'

const setup = () => renderHook(() => useStore(), { wrapper: Wrapped })

/** groupId of every issue, for before/after diffing. */
const snapshot = (s: ReturnType<typeof useStore>) => new Map(s.issues.map((i) => [i.id, i.groupId]))

function register(result: { current: ReturnType<typeof useStore> }, linkedIssueIds: string[]) {
  const before = snapshot(result.current)
  let id = ''
  act(() => {
    id = result.current.createIssue(
      {
        title: 'A new issue',
        model: 'EV6',
        modelYear: 2026,
        linkedIssueIds,
        linkJustifications: linkedIssueIds.length ? [{ ids: linkedIssueIds, justification: WHY }] : [],
        submit: true,
      },
      ACTOR,
    ).id
  })
  const after = snapshot(result.current)
  const moved = [...after.entries()].filter(([k, v]) => before.has(k) && before.get(k) !== v).map(([k]) => k)
  return { id, before, after, moved }
}

describe('joining an existing group', () => {
  it('puts the new issue in that group, keyed on the existing parent', () => {
    const { result } = setup()
    const expected = result.current.getIssue(GROUP_A_MEMBER)!.groupId
    const { id } = register(result, [GROUP_A_MEMBER])

    expect(expected, 'fixture must start grouped').toBeTruthy()
    expect(result.current.getIssue(id)!.groupId).toBe(expected)
  })

  it('MOVES NOBODY ELSE — the existing members already had this group', () => {
    const { result } = setup()
    const { moved } = register(result, [GROUP_A_MEMBER])
    // Rewriting them would claim in their audit trail that their group changed
    // when it did not.
    expect(moved).toEqual([])
  })

  it('still audits EVERY member, because the group changed for them too', () => {
    const { result } = setup()
    const groupId = result.current.getIssue(GROUP_A_MEMBER)!.groupId!
    const { id } = register(result, [GROUP_A_MEMBER])

    const members = result.current.groupMembers(id).map((i) => i.id)
    expect(members.length, 'expected a multi-member group').toBeGreaterThan(2)

    for (const m of members) {
      const rows = result.current.auditFor(m).filter((a) => a.action === 'Issue linked to Issue Group')
      expect(rows.length, `${m} has no group audit row`).toBe(1)
      // The reason travels to every member, not just the new issue.
      expect(rows[0].detail, `${m} detail`).toContain(WHY)
      expect(rows[0].detail, `${m} parent`).toContain(`Parent Issue: ${groupId}`)
    }
  })
})

describe('⚠️ MERGING TWO GROUPS — the N-way rewrite', () => {
  it('names it "Issue Groups merged", not "created" or "linked"', () => {
    const { result } = setup()
    const { id } = register(result, [GROUP_A_MEMBER, GROUP_B_MEMBER])
    const rows = result.current.auditFor(id).map((a) => a.action)
    expect(rows).toContain('Issue Groups merged')
    // Negative control: the two lesser outcomes must NOT also be logged.
    expect(rows).not.toContain('Issue Group created')
    expect(rows).not.toContain('Issue linked to Issue Group')
  })

  it('rewrites EXACTLY the losing group and leaves the survivor alone', () => {
    const { result } = setup()
    const groupA = result.current.getIssue(GROUP_A_MEMBER)!.groupId!
    const groupB = result.current.getIssue(GROUP_B_MEMBER)!.groupId!
    const membersA = result.current.groupMembers(GROUP_A_MEMBER).map((i) => i.id)
    const membersB = result.current.groupMembers(GROUP_B_MEMBER).map((i) => i.id)

    const { id, moved } = register(result, [GROUP_A_MEMBER, GROUP_B_MEMBER])

    // Whichever group is keyed on the earlier issue survives; derived, not
    // hardcoded, so the test does not encode a seed date.
    const survivor = result.current.getIssue(id)!.groupId
    expect([groupA, groupB]).toContain(survivor)
    const losers = survivor === groupA ? membersB : membersA
    const keepers = survivor === groupA ? membersA : membersB

    expect(moved.sort(), 'exactly the losing group should move').toEqual(losers.sort())
    for (const k of keepers) {
      expect(result.current.getIssue(k)!.groupId, `${k} must not move`).toBe(survivor)
    }
  })

  it('lands ONE audit row on every member of BOTH groups', () => {
    const { result } = setup()
    const all = [
      ...result.current.groupMembers(GROUP_A_MEMBER).map((i) => i.id),
      ...result.current.groupMembers(GROUP_B_MEMBER).map((i) => i.id),
    ]
    expect(all.length, 'expected two multi-member cohorts').toBeGreaterThan(4)

    const { id } = register(result, [GROUP_A_MEMBER, GROUP_B_MEMBER])

    for (const m of [...all, id]) {
      const rows = result.current.auditFor(m).filter((a) => a.action === 'Issue Groups merged')
      expect(rows.length, `${m} audit rows`).toBe(1)
      expect(rows[0].detail, `${m} justification`).toContain(WHY)
    }
  })

  it('ends with ONE group containing everybody', () => {
    const { result } = setup()
    const expectedSize =
      result.current.groupMembers(GROUP_A_MEMBER).length + result.current.groupMembers(GROUP_B_MEMBER).length + 1
    const { id } = register(result, [GROUP_A_MEMBER, GROUP_B_MEMBER])
    expect(result.current.groupMembers(id).map((i) => i.id).length).toBe(expectedSize)
  })
})

describe('forming a group from standalones', () => {
  /** Two seeded issues that belong to no group. */
  const standalones = (s: ReturnType<typeof useStore>) =>
    s.issues.filter((i) => !i.groupId).slice(0, 2).map((i) => i.id)

  it('is named "Issue Group created" and moves both into it', () => {
    const { result } = setup()
    const [a, b] = standalones(result.current)
    expect(a && b, 'fixture needs two standalone issues').toBeTruthy()

    const { id, moved } = register(result, [a, b])

    expect(result.current.auditFor(id).map((x) => x.action)).toContain('Issue Group created')
    expect(moved.sort()).toEqual([a, b].sort())
    // All three share one group, keyed on the earliest.
    const g = result.current.getIssue(id)!.groupId
    expect(result.current.getIssue(a)!.groupId).toBe(g)
    expect(result.current.getIssue(b)!.groupId).toBe(g)
  })
})

describe('registering with no links', () => {
  it('forms no group and writes no group audit row', () => {
    const { result } = setup()
    const { id, moved } = register(result, [])
    expect(result.current.getIssue(id)!.groupId).toBeUndefined()
    expect(moved).toEqual([])
    const actions = result.current.auditFor(id).map((a) => a.action)
    for (const a of ['Issue Group created', 'Issue linked to Issue Group', 'Issue Groups merged']) {
      expect(actions, `unexpected ${a}`).not.toContain(a)
    }
  })
})

// The Manage Related Issues impact band, and the Parent projection behind it.
//
// ─── WHY THE PROJECTION IS THE TEST THAT MATTERS ────────────────────────────
//
// Parent is NOT a stored field. It is the earliest-registered member of the
// group, re-derived after every edit — so linking an OLDER issue silently
// demotes the current Parent, and unlinking the Parent silently promotes
// whoever is next. Both happen at Save, and before this warning existed neither
// was visible until afterwards.
//
// That makes the warning a claim about a computation the user cannot check, and
// a warning that is WRONG is worse than none: it would be trusted. The cases
// below are the ones where a plausible implementation goes wrong — the added
// issue that is older than the whole group, the removal of the Parent itself,
// and the dissolve, where a "group" of one has no Parent to warn about at all.
import { describe, it, expect } from 'vitest'
import type { Issue } from '@/data/types'
import { ISSUES } from '@/data/seed'
import { projectParent, relatedImpact } from '@/features/issues/linking/relatedIssues'

const link = (id: string) => ({ id, rel: 'Child' as const })
const unlink = (id: string) => ({ id, rel: 'Child' as const })

/** Only `id` and `reportedDate` drive the projection; the rest is fixture noise. */
const at = (id: string, reportedDate: string): Issue => ({ ...ISSUES[0], id, reportedDate })

describe('relatedImpact — the band states what Save will do', () => {
  it('counts changes, and says "Change" for one', () => {
    expect(relatedImpact([link('A')], []).countLabel).toBe('1 Change Pending')
    expect(relatedImpact([link('A')], [unlink('B')]).countLabel).toBe('2 Changes Pending')
  })

  it('links only: leads with adding to the group, singular and plural', () => {
    expect(relatedImpact([link('A')], []).head).toBe('Linking this issue will add it to the current issue group.')
    expect(relatedImpact([link('A'), link('B')], []).head).toBe(
      'Linking these issues will add them to the current issue group.',
    )
  })

  it('unlinks only: leads with removal, and promises the rest stay grouped', () => {
    const one = relatedImpact([], [unlink('A')])
    expect(one.head).toBe('Unlinking this issue will remove it from the issue group.')
    expect(one.body).toContain('The remaining related issues will stay grouped together.')
    expect(relatedImpact([], [unlink('A'), unlink('B')]).head).toBe(
      'Unlinking these issues will remove them from the issue group.',
    )
  })

  it('⚠️ MIXED: no lead sentence, because neither one is the whole truth', () => {
    const mixed = relatedImpact([link('A')], [unlink('B'), unlink('C')])
    expect(mixed.head).toBe('')
    expect(mixed.body).toBe(
      '1 issue will be added to this issue group and 2 issues will be removed from the issue group. ' +
        'These changes will take effect when you click Save Changes.',
    )
  })
})

describe('projectParent — who will be Parent after Save', () => {
  // Registration order: P is oldest, so P is Parent.
  const P = at('P-1', '2026-01-10')
  const C1 = at('C-1', '2026-02-10')
  const C2 = at('C-2', '2026-03-10')
  const group = [P, C1, C2]

  it('reports no change when nothing is pending', () => {
    const p = projectParent(group, [], [])
    expect(p.currentParentId).toBe('P-1')
    expect(p.nextParentId).toBe('P-1')
    expect(p.willChange).toBe(false)
  })

  it('⚠️ WARNS when an OLDER issue is linked in — it takes the Parent role', () => {
    const older = at('O-1', '2025-06-01')
    const p = projectParent(group, [], [older])
    expect(p.nextParentId).toBe('O-1')
    expect(p.willChange).toBe(true)
  })

  it('stays quiet when a NEWER issue is linked in', () => {
    const p = projectParent(group, [], [at('N-1', '2026-09-01')])
    expect(p.nextParentId).toBe('P-1')
    expect(p.willChange).toBe(false)
  })

  it('⚠️ WARNS when the Parent itself is unlinked — the next oldest is promoted', () => {
    const p = projectParent(group, ['P-1'], [])
    expect(p.nextParentId).toBe('C-1')
    expect(p.willChange).toBe(true)
  })

  it('stays quiet when a Child is unlinked', () => {
    const p = projectParent(group, ['C-2'], [])
    expect(p.nextParentId).toBe('P-1')
    expect(p.willChange).toBe(false)
  })

  it('⚠️ DOES NOT WARN when the group dissolves to one — there is no Parent left to change', () => {
    // `planGroupEdits` clears the last survivor's group entirely, so a warning
    // naming a "new Parent" would describe a group that will not exist.
    const p = projectParent([P, C1], ['P-1'], [])
    expect(p.nextParentId).toBe('C-1')
    expect(p.willChange, 'warned about a group that dissolves').toBe(false)
  })

  it('handles a link and an unlink together, ordering by date not by arrival', () => {
    const older = at('O-1', '2025-06-01')
    const p = projectParent(group, ['P-1'], [older])
    expect(p.nextParentId).toBe('O-1')
    expect(p.willChange).toBe(true)
  })

  it('ignores an addition that is already a member, so a re-link cannot duplicate a row', () => {
    const p = projectParent(group, [], [C1])
    expect(p.nextParentId).toBe('P-1')
    expect(p.willChange).toBe(false)
  })
})

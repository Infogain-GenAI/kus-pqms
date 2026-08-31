// CHARACTERISATION tests for the store — the three domain rules
// steps-for-new-repo.md Step 10 says must survive any rewrite:
//
//   1. Links are reciprocal.        linkIssue(a,b) writes BOTH sides.
//   2. Propose -> approve.          A proposal parks the target in side fields and
//                                   does NOT move the visible status.
//   3. Every mutation is audited.   A state change with no audit entry is a bug.
//
// These pin CURRENT behaviour. They are the store's equivalent of the pixel gate:
// a later phase — Step 9's data-access slice especially — can prove it did not
// change them. Where behaviour looks questionable it is pinned and the question
// recorded, never fixed here.
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { StoreProvider, useStore } from '@/data/store'
import { classificationErrors } from '@/data/assertSeed'
import type { ClassificationNode, Issue } from '@/data/types'
import type { Actor } from '@/data/types'

const ACTOR: Actor = { name: 'Test Actor', role: 'SE' } as Actor

const wrapper = ({ children }: { children: ReactNode }) => <StoreProvider>{children}</StoreProvider>
const setup = () => renderHook(() => useStore(), { wrapper })

/** Two ids that exist in the seed and are not already linked to each other. */
const pickPair = (issues: { id: string; linkedIssueIds?: string[] }[]) => {
  for (const a of issues) {
    for (const b of issues) {
      if (a.id === b.id) continue
      if ((a.linkedIssueIds ?? []).includes(b.id)) continue
      return [a.id, b.id] as const
    }
  }
  throw new Error('seed has no unlinked pair — the fixture changed')
}

describe('INVARIANT 1 — links are reciprocal', () => {
  it('linkIssue writes both sides', () => {
    const { result } = setup()
    const [a, b] = pickPair(result.current.issues)

    act(() => result.current.linkIssue(a, b, ACTOR))

    expect(result.current.getIssue(a)?.linkedIssueIds).toContain(b)
    expect(result.current.getIssue(b)?.linkedIssueIds).toContain(a)
  })

  it('unlinkIssue removes both sides', () => {
    const { result } = setup()
    const [a, b] = pickPair(result.current.issues)

    act(() => result.current.linkIssue(a, b, ACTOR))
    act(() => result.current.unlinkIssue(a, b, ACTOR))

    expect(result.current.getIssue(a)?.linkedIssueIds ?? []).not.toContain(b)
    expect(result.current.getIssue(b)?.linkedIssueIds ?? []).not.toContain(a)
  })

  it('linking twice does not duplicate the id', () => {
    const { result } = setup()
    const [a, b] = pickPair(result.current.issues)

    act(() => result.current.linkIssue(a, b, ACTOR))
    act(() => result.current.linkIssue(a, b, ACTOR))

    const links = result.current.getIssue(a)?.linkedIssueIds ?? []
    expect(links.filter((x) => x === b)).toHaveLength(1)
  })
})

describe('INVARIANT 2 — propose parks, approve moves', () => {
  it('proposeTransition does NOT change the visible status', () => {
    const { result } = setup()
    const id = result.current.issues[0].id
    const before = result.current.getIssue(id)!.status

    act(() => result.current.proposeTransition(id, 'closed', 'because', ACTOR))

    const after = result.current.getIssue(id)!
    expect(after.status).toBe(before) // unchanged — this is the invariant
    expect(after.proposedStatus).toBe('closed')
    expect(after.proposalRationale).toBe('because')
    expect(after.proposedBy).toBe(ACTOR.name)
  })

  it('approveProposal moves the status and clears the proposal fields', () => {
    const { result } = setup()
    const id = result.current.issues[0].id

    act(() => result.current.proposeTransition(id, 'closed', 'because', ACTOR))
    act(() => result.current.approveProposal(id, 'agreed', ACTOR))

    const after = result.current.getIssue(id)!
    expect(after.status).toBe('closed')
    expect(after.proposedStatus).toBeUndefined()
    expect(after.proposalRationale).toBeUndefined()
    expect(after.proposedBy).toBeUndefined()
  })

  it('approving to a terminal status stamps closedAt', () => {
    const { result } = setup()
    const id = result.current.issues[0].id

    act(() => result.current.proposeTransition(id, 'closed', 'because', ACTOR))
    act(() => result.current.approveProposal(id, 'agreed', ACTOR))

    expect(result.current.getIssue(id)!.closedAt).toBeTruthy()
  })

  it('rejectProposal clears the proposal and leaves the status alone', () => {
    const { result } = setup()
    const id = result.current.issues[0].id
    const before = result.current.getIssue(id)!.status

    act(() => result.current.proposeTransition(id, 'closed', 'because', ACTOR))
    act(() => result.current.rejectProposal(id, 'no', ACTOR))

    const after = result.current.getIssue(id)!
    expect(after.status).toBe(before)
    expect(after.proposedStatus).toBeUndefined()
  })

  it('approving with NO proposal outstanding leaves the status where it is', () => {
    // Pinned as current behaviour: `approveProposal` falls back to `i.status`
    // when `proposedStatus` is undefined, so it is a no-op rather than an error.
    // Whether that should throw is a question, recorded not resolved.
    const { result } = setup()
    const id = result.current.issues[0].id
    const before = result.current.getIssue(id)!.status

    act(() => result.current.approveProposal(id, 'stray approval', ACTOR))

    expect(result.current.getIssue(id)!.status).toBe(before)
  })
})

describe('INVARIANT 3 — every mutation appends an audit entry', () => {
  // The runbook calls this the invariant most likely to be broken silently by a
  // future refactor, because nothing about a missing audit row is visible.
  const mutations: [string, (s: ReturnType<typeof useStore>, id: string, other: string) => void][] = [
    ['linkIssue', (s, id, other) => s.linkIssue(id, other, ACTOR)],
    ['unlinkIssue', (s, id, other) => s.unlinkIssue(id, other, ACTOR)],
    ['proposeTransition', (s, id) => s.proposeTransition(id, 'closed', 'r', ACTOR)],
    ['approveProposal', (s, id) => s.approveProposal(id, 'ok', ACTOR)],
    ['rejectProposal', (s, id) => s.rejectProposal(id, 'no', ACTOR)],
    ['startInvestigation', (s, id) => s.startInvestigation(id, ACTOR)],
    ['addActivity', (s, id) => s.addActivity(id, 'Note', 'summary', ACTOR)],
  ]

  it.each(mutations)('%s appends at least one audit entry', (_name, mutate) => {
    const { result } = setup()
    const [a, b] = pickPair(result.current.issues)
    const before = result.current.auditFor(a).length

    act(() => mutate(result.current, a, b))

    expect(result.current.auditFor(a).length).toBeGreaterThan(before)
  })

  it('the audit entry records the actor name and role', () => {
    const { result } = setup()
    const id = result.current.issues[0].id

    act(() => result.current.addActivity(id, 'Note', 'summary', ACTOR))

    const latest = result.current.auditFor(id)[0]
    expect(latest?.actor).toBe(ACTOR.name)
    expect(latest?.actorRole).toBe(ACTOR.role)
  })

  // ⚠️ FINDING — addComment does NOT audit. Pinned, not fixed.
  //
  // Every other mutation in this store calls appendAudit(). addComment writes a
  // comment row and, if the body contains an @mention, a notification — and
  // nothing else. So a user-visible change to an issue's communication history
  // leaves NO audit entry.
  //
  // steps-for-new-repo.md Step 10 says "nearly every mutation calls both touch()
  // and appendAudit()" and that "a state change without an audit entry is a bug".
  // Whether a comment counts as a state change for audit purposes is a DOMAIN
  // question — in a quality-management system where the Communication tab is
  // marked immutable in the UI, it probably does.
  //
  // Pinned as current behaviour so a later change to it is visible. Recorded in
  // 18's application-defect register; NOT fixed here, because characterisation
  // pins what is and fixing it in the same change destroys the evidence.
  it('addComment appends NO audit entry — pinned defect, see 18', () => {
    const { result } = setup()
    const id = result.current.issues[0].id
    const before = result.current.auditFor(id).length

    act(() => result.current.addComment(id, 'Internal', 'body', ACTOR))

    expect(result.current.commentsFor(id).length).toBeGreaterThan(0)
    expect(result.current.auditFor(id).length).toBe(before) // <- the defect
  })
})

describe('savePriority — the manual-override path', () => {
  it('computes the letter from the score when no override is given', () => {
    const { result } = setup()
    const id = result.current.issues[0].id

    act(() => result.current.savePriority(id, { any: 30 }, {}, null, ACTOR))

    const r = result.current.priorityResult(id)
    expect(r.total).toBe(30)
    expect(r.calc).toBe('A')
    expect(r.final).toBe('A')
    expect(r.isOverride).toBe(false)
  })

  it('a manual override wins, and is flagged as an override', () => {
    const { result } = setup()
    const id = result.current.issues[0].id

    act(() => result.current.savePriority(id, { any: 30 }, {}, 'C', ACTOR))

    const r = result.current.priorityResult(id)
    expect(r.calc).toBe('A') // the computed value is retained...
    expect(r.final).toBe('C') // ...and the override wins
    expect(r.isOverride).toBe(true)
  })

  it('an override equal to the computed letter is NOT flagged as an override', () => {
    // Pinned: isOverride compares values, so setting the override to the same
    // letter the matrix produced reads as "not overridden".
    const { result } = setup()
    const id = result.current.issues[0].id

    act(() => result.current.savePriority(id, { any: 30 }, {}, 'A', ACTOR))

    expect(result.current.priorityResult(id).isOverride).toBe(false)
  })
})

/**
 * The classification invariant's own failure paths.
 *
 * These never execute against the real seed — that is the point of the seed
 * being valid — so they are exercised here with crafted rows. Without this the
 * guard is four branches nobody has ever seen run.
 */
describe('classificationErrors catches each way a filing can be wrong', () => {
  const TAXONOMY: ClassificationNode[] = [
    { id: 's1', level: 'system', code: 'S1', label: 'Engine', issueCount: 0 },
    { id: 'b1', level: 'subSystem', code: 'S1-01', label: 'Fuel System', parentId: 's1', issueCount: 0 },
    { id: 'c1', level: 'component', code: 'S1-01-01', label: 'Fuel Injector', parentId: 'b1', issueCount: 0 },
    { id: 'm1', level: 'symptom', code: 'S1-01-01-01', label: 'Engine vibration', parentId: 'c1', issueCount: 0 },
  ]
  const row = (over: Partial<Issue>) =>
    ({ id: 'X-1', system: 'Engine', subSystem: 'Fuel System', component: 'Fuel Injector', symptom: 'Engine vibration', ...over }) as Issue

  it('accepts a fully valid path', () => {
    expect(classificationErrors([row({})], TAXONOMY)).toEqual([])
  })

  it('skips an issue with no classification at all', () => {
    // Registration can precede triage, so "unclassified" is not "mis-classified".
    const blank = { id: 'X-2' } as Issue
    expect(classificationErrors([blank], TAXONOMY)).toEqual([])
  })

  it('rejects an unknown system', () => {
    expect(classificationErrors([row({ system: 'Teleportation' })], TAXONOMY)[0]).toMatch(/system .* not in the taxonomy/)
  })

  it('rejects a sub-system that exists but not under that system', () => {
    expect(classificationErrors([row({ subSystem: 'Rack' })], TAXONOMY)[0]).toMatch(/sub-system .* not under/)
  })

  it('rejects a component that is not under its sub-system', () => {
    // The exact defect the seed carried: the sub-system name repeated as the component.
    expect(classificationErrors([row({ component: 'Fuel System' })], TAXONOMY)[0]).toMatch(/component .* not under/)
  })

  it('rejects a symptom that is not under its component', () => {
    expect(classificationErrors([row({ symptom: 'Harsh upshift' })], TAXONOMY)[0]).toMatch(/symptom .* not under/)
  })

  it('reports one error per bad issue rather than stopping at the first', () => {
    const errs = classificationErrors([row({ system: 'Nope' }), row({ id: 'X-3', symptom: 'Nope' })], TAXONOMY)
    expect(errs).toHaveLength(2)
  })
})

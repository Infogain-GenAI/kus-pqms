// Same Existing Issues on the EDIT surface — ranked suggestions that persist.
//
// ⚠️ EVERY ASSERTION READS THE STORE. Not that a handler fired, not that a modal
// opened, not that a justification box rendered. The reason is a specific trap
// this block was built to avoid: Issue Entry's card-level link opens the
// confirmation modal, COLLECTS a justification, and then commits by mutating a
// local draft array. Ported to a surface where the issue exists, that control
// would answer "yes" to "does linking ask for a reason here?" while persisting
// nothing and auditing nothing. A test that watched the modal could not tell the
// two apart; one that reads `linkedIssueIds` can.
import { describe, it, expect } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'
import { SameExistingIssuesSection } from '@/features/issues/workspace/IssueDetails/IssueEditForm/SameExistingIssuesSection'
import messages from '@/features/issues/workspace/IssueDetail.i18n'
import entryMessages from '@/features/issues/issue-entry/IssueEntry.i18n'
import { JUSTIFICATION_MIN } from '@/data/linkJustification'

const M = messages.en
const ACTOR = { name: 'Tester', role: 'SE' }
const WHY = 'Same injector symptom across this cohort; investigating together.'
const TOO_SHORT = 'x'.repeat(JUSTIFICATION_MIN - 1)

/** The engine-vibration cohort's classification — ranks the EE-260023 group. */
const COHORT_SUBJECT = {
  system: 'Engine',
  subSystem: 'Fuel System',
  component: 'Fuel Injector',
  symptom: 'Engine vibration',
  title: 'Vibration felt at idle',
  description: 'Reported through warranty.',
}

/** An issue OUTSIDE that cohort, so the cohort is a genuine suggestion. */
const SUBJECT_ID = 'PT-260005'
/** An issue INSIDE the cohort — used to prove the subject's own group is skipped. */
const COHORT_MEMBER = 'EE-260031'

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)

let captured: ReturnType<typeof useStore> | null = null
const body = () => document.body.textContent ?? ''

/**
 * Rendered with the SAME store wiring `IssueEditForm` uses, so what the tests
 * observe is what the screen does. A harness that stubbed onLink/onUnlink would
 * be measuring the stub.
 */
function mount(subjectId = SUBJECT_ID, subject = COHORT_SUBJECT) {
  captured = null
  const Harness = () => {
    const store = useStore()
    captured = store
    const [, force] = useState(0)
    const issue = store.getIssue(subjectId)
    if (!issue) return null
    return (
      <SameExistingIssuesSection
        issue={issue}
        subject={subject}
        linkedIds={issue.linkedIssueIds ?? []}
        onLink={(ids, why) => {
          for (const id of ids) store.linkIssue(issue.id, id, why, ACTOR)
          force((n) => n + 1)
        }}
        onUnlink={(id, why) => {
          store.removeRelated(issue.id, id, why, ACTOR)
          force((n) => n + 1)
        }}
      />
    )
  }
  render(<Harness />, { wrapper: Wrapped })
  return { store: () => captured! }
}

/**
 * The ids currently offered as suggestion CARDS.
 *
 * ⚠️ ADDRESSED BY TESTID, NOT BY SEARCHING BODY TEXT. An id also appears inside a
 * group card's member list and inside audit detail strings, so `body().includes(id)`
 * cannot answer "is this offered as a suggestion" — and an assertion built on it
 * passes for the wrong reason. The card carries `data-testid="same-suggestion-<key>"`.
 */
const suggestedKeys = () =>
  Array.from(document.querySelectorAll('[data-testid^="same-suggestion-"]')).map((el) =>
    (el.getAttribute('data-testid') ?? '').replace('same-suggestion-', ''),
  )

/*
 * ─── ⚠️ THESE NOW ADDRESS THE SHARED CARDS ──────────────────────────────────
 *
 * This section used to render bespoke compact rows with its own labels — four
 * i18n keys now retired with the markup they described. It now renders
 * `related/RelatedIssueCards`, the same components Issue Entry uses, because the
 * canonical renders this section identically on both screens. So the labels are
 * the shared ones — and the two that matter are HARDCODED in the card rather than
 * translated, which is why they are literals here rather than keys.
 *
 * Retargeted rather than rewritten: every assertion below still checks the same
 * behaviour it was written for, against the markup that behaviour now lives in.
 */
const linkBtns = () => screen.queryAllByRole('button', { name: /^Link to Issue$/ })
const groupBtns = () => screen.queryAllByRole('button', { name: /^Link to Issue Group$/ })
const justifyBox = () => screen.getByRole('textbox', { name: new RegExp(M.sameJustifyLink, 'i') })
const applyBtn = (label: string) => screen.getByRole('button', { name: new RegExp(`^${label}$`) })

describe('the ranked half exists at all', () => {
  it('renders suggestions with the reasons they were suggested for', () => {
    mount()
    /*
     * The heading is Issue Entry's `sameExistingTitle` now, not this surface's
     * own `sameSuggestTitle` — the design gives both screens the same section, so
     * the copy comes from one bundle rather than two that can drift.
     */
    expect(body()).toContain(entryMessages.en.sameExistingTitle)
    expect(linkBtns().length + groupBtns().length, 'no suggestions ranked').toBeGreaterThan(0)
    /*
     * The shared card prefixes reasons with "Suggested because:" — copy the old
     * bespoke rows did not have. Asserting the prefix rather than a loose keyword
     * match, because the prefix is the thing that makes a ranked list legible.
     */
    expect(body()).toMatch(/Suggested because:/)
  })

  it('says so plainly when nothing ranks', () => {
    mount(SUBJECT_ID, { system: 'Nonexistent System', component: 'Nothing', symptom: 'Nothing' })
    expect(body()).toContain(M.sameSuggestEmpty)
  })
})

describe('⚠️ SELF-EXCLUSION — the divergence from the design', () => {
  /*
   * The design calls its ranker with a hardcoded `null` exclude, so an issue can
   * rank as its own top suggestion while being edited. We pass the issue's id.
   * Twenty lines from that call, the design's own free-text search excludes the
   * issue being edited — which is why this is an oversight and not a spec.
   */
  /*
   * ⚠️ THE SUBJECT MUST BE UNGROUPED, and the first version of this test got that
   * wrong. It edited a GROUPED issue, so the own-group skip below removed the
   * issue before self-exclusion had to — deleting the `issue.id` exclude entirely
   * left the test passing. Proved by mutation, not by reading.
   *
   * `PT-260005` belongs to no group, and it is ranked against ITS OWN
   * classification, so nothing but the exclude can keep it out of its own list.
   */
  const OWN_CLASSIFICATION = {
    system: 'Powertrain',
    subSystem: '6-Speed Automatic Transmission',
    component: 'Valve Body',
    symptom: 'Cold-start shift slip',
    title: '6AT slip at cold start, intermittent',
  }

  it('never suggests the issue being edited', () => {
    const { store } = mount(SUBJECT_ID, OWN_CLASSIFICATION)
    const self = store().getIssue(SUBJECT_ID)!
    expect(self.groupId, 'this subject must be UNGROUPED or the own-group skip masks the exclude').toBeUndefined()
    expect(suggestedKeys(), `${SUBJECT_ID} was offered as a suggestion for itself`).not.toContain(SUBJECT_ID)
  })

  it('and its own classification still ranks OTHER issues, so the list is not simply empty', () => {
    mount(SUBJECT_ID, OWN_CLASSIFICATION)
    expect(
      suggestedKeys().length,
      'nothing ranked against its own classification — the exclusion test proves nothing',
    ).toBeGreaterThan(0)
  })

  it('and still ranks OTHER issues, so exclusion has not emptied the list', () => {
    // The control for the test above: excluding everything would satisfy it.
    mount(SUBJECT_ID, COHORT_SUBJECT)
    expect(suggestedKeys().length, 'nothing ranked at all — the previous test proves nothing').toBeGreaterThan(
      0,
    )
  })

  /*
   * ⚠️ AND ITS OWN GROUP IS SKIPPED WHOLE. Found while writing these tests, not
   * by review: a card for the subject's own group would call
   * `linkIssue(id, id, …)` — a self-link the seed invariants forbid — and would
   * offer "Remove from group" on the issue being edited.
   */
  it("never offers the subject's OWN group as a suggestion", () => {
    const { store } = mount(COHORT_MEMBER, COHORT_SUBJECT)
    const gid = store().getIssue(COHORT_MEMBER)!.groupId
    expect(gid, 'fixture issue must be grouped for this to mean anything').toBeTruthy()
    expect(groupBtns().length, "the subject's own group was offered for linking").toBe(0)
  })
})

describe('⚠️ LINKING IS GATED, AND THE GATE IS THE STORE', () => {
  it('persists NOTHING until a reason is accepted', () => {
    const { store } = mount()
    const before = [...(store().getIssue(SUBJECT_ID)!.linkedIssueIds ?? [])]

    // Open the justification box and stop there.
    const btn = groupBtns()[0] ?? linkBtns()[0]
    fireEvent.click(btn)
    expect(store().getIssue(SUBJECT_ID)!.linkedIssueIds ?? [], 'a link persisted before any reason').toEqual(
      before,
    )

    // A reason below the floor is refused, and still nothing persists.
    fireEvent.change(justifyBox(), { target: { value: TOO_SHORT } })
    fireEvent.click(applyBtn(M.sameConfirmLink))
    expect(
      store().getIssue(SUBJECT_ID)!.linkedIssueIds ?? [],
      'a link persisted on a below-floor reason',
    ).toEqual(before)
  })

  it('persists the link once the reason is accepted, with the reason audited', () => {
    const { store } = mount()
    const before = new Set(store().getIssue(SUBJECT_ID)!.linkedIssueIds ?? [])

    fireEvent.click(linkBtns()[0] ?? groupBtns()[0])
    fireEvent.change(justifyBox(), { target: { value: WHY } })
    fireEvent.click(applyBtn(M.sameConfirmLink))

    const after = store().getIssue(SUBJECT_ID)!.linkedIssueIds ?? []
    const added = after.filter((id) => !before.has(id))
    expect(added.length, 'nothing was linked').toBeGreaterThan(0)

    // ⚠️ THE AUDIT IS THE POINT, not the array. A link with no audited reason is
    // the failure this whole surface exists to prevent.
    const rows = store().auditFor(SUBJECT_ID).filter((a) => a.action === 'Issue linked')
    expect(rows.length, 'the link was not audited').toBeGreaterThan(0)
    expect(rows[0].detail, 'the reason was not recorded').toContain(WHY)
  })
})

describe('a group card stands for the whole cohort', () => {
  it('renders ONE card for a multi-member group, with derived Parent and Child', () => {
    const { store } = mount()
    expect(groupBtns().length, 'no group card ranked').toBeGreaterThan(0)
    expect(body()).toContain(M.linksModalParent)
    expect(body()).toContain(M.linksModalChild)
    // The parent is derived, never stored — earliest member of the cohort.
    const parent = store().groupMembers('EE-260023')[0]
    expect(body()).toContain(parent.id)
  })

  it('links EVERY member on one reason, each link audited', () => {
    const { store } = mount()
    const members = store().groupMembers('EE-260023').map((m) => m.id)
    expect(members.length, 'fixture must be a multi-member group').toBeGreaterThan(2)

    fireEvent.click(groupBtns()[0])
    fireEvent.change(justifyBox(), { target: { value: WHY } })
    fireEvent.click(applyBtn(M.sameConfirmLink))

    const after = store().getIssue(SUBJECT_ID)!.linkedIssueIds ?? []
    for (const id of members) {
      expect(after, `${id} was not linked by the group action`).toContain(id)
    }
    // One reason, recorded against each link it justified — not once for the set.
    const rows = store().auditFor(SUBJECT_ID).filter((a) => a.action === 'Issue linked')
    expect(rows.length, 'audit rows do not match the links made').toBe(members.length)
  })
})

describe('per-member removal mutates real group membership', () => {
  it('is gated, then clears that member group', () => {
    const { store } = mount()
    const before = store().groupMembers('EE-260023').map((m) => m.id)
    expect(before.length).toBeGreaterThan(2)

    const target = before[before.length - 1]
    /*
     * ⚠️ THE CARD GATES THIS ITSELF, and its control is addressed by id: the
     * shared card's aria-label is "Remove from group <id>", so a `^…$` match on
     * the bare label finds nothing. Targeting by id is also stronger than
     * indexing into a list of identical buttons, which is what this did before —
     * the group must be expanded for a child's control to exist at all.
     */
    fireEvent.click(screen.getByRole('button', { name: /show child issues/i }))
    fireEvent.click(screen.getByRole('button', { name: `Remove from group ${target}` }))

    // Nothing yet.
    expect(store().getIssue(target)!.groupId, 'membership changed before a reason').toBeTruthy()

    fireEvent.change(screen.getByRole('textbox', { name: /justification for removing/i }), {
      target: { value: WHY },
    })
    fireEvent.click(screen.getByRole('button', { name: /^confirm unlink$/i }))

    expect(store().getIssue(target)!.groupId, 'the member was not removed from the group').toBeUndefined()
  })
})

describe('⚠️ A LINKED ENTRY NOW STAYS IN THE LIST — the reverse of what it did', () => {
  /*
   * ⚠️ THIS TEST ASSERTED THE OPPOSITE, AND THE REVERSAL IS DELIBERATE.
   *
   * While this section was only the ranked half, already-linked issues were
   * EXCLUDED from it — the separate search card owned the linked list, and
   * offering unlink in two places was the duplicate-affordance problem.
   *
   * That card is gone. The design keeps linked issues in this list, marked, and
   * INJECTS any that did not rank with `reasons: ['Manually linked']`. So there is
   * exactly one place to unlink again, and it is here. Excluding them now would
   * make a linked issue with an unrelated classification invisible: counted in the
   * header, absent from the list, impossible to unlink from this screen.
   */
  it('keeps a linked issue visible and offers Unlink on it', () => {
    const { store } = mount()
    fireEvent.click(groupBtns()[0] ?? linkBtns()[0])
    fireEvent.change(justifyBox(), { target: { value: WHY } })
    fireEvent.click(applyBtn(M.sameConfirmLink))

    const linked = store().getIssue(SUBJECT_ID)!.linkedIssueIds ?? []
    expect(linked.length, 'nothing was linked').toBeGreaterThan(0)

    /*
     * ⚠️ CHECKED BY CARD, NOT BY SCANNING FOR EVERY MEMBER ID. A group card keeps
     * its children behind a collapsed expander, so a linked child is legitimately
     * absent from the rendered text — requiring every id made a correct component
     * look like it had dropped one.
     */
    const cards = Array.from(document.querySelectorAll('[data-testid^="same-suggestion-"]'))
    expect(cards.length, 'the list emptied once something was linked').toBeGreaterThan(0)
    expect(body(), 'the linked entry vanished').toContain(store().groupMembers('EE-260023')[0].id)
    expect(
      screen.queryAllByRole('button', { name: /^Unlink from Issue( Group)?$/ }).length,
      'no unlink control on a linked entry',
    ).toBeGreaterThan(0)
  })
})

// The link/unlink justification GATE, driven through the UI.
//
// ─── WHY THESE EXIST SEPARATELY FROM THE RULE'S OWN TESTS ────────────────────
//
// `tests/data/linkJustification.test.ts` proves the predicate is right, and
// `store.test.tsx` proves a justification reaches the audit trail WHEN PASSED.
// Neither proves the UI cannot commit without one — and that is the whole
// governance claim. A Save that commits an un-Applied row, an Apply that accepts
// 19 characters, or an audit entry carrying the wrong change's reason would all
// leave both of those suites green.
//
// ⚠️ SO EVERY TEST HERE ASSERTS THE REFUSAL, NOT THE HAPPY PATH. A test that only
// checks "a correct justification commits" passes just as well with the gate
// deleted.
//
// ⚠️ AND EVERY ONE CARRIES A NEGATIVE CONTROL. Two tests in this project have
// passed vacuously, both because a query matched something already on the page —
// and the `cancel` key bug shipped precisely because `/cancel/i` matched the
// broken lowercase output. Text assertions here are CASE-SENSITIVE and scoped to
// a specific control.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'
import { ManageLinksModal } from '@/features/issues/workspace/modals'
import { LinkedIssuesModal } from '@/features/issues/LinkedIssuesModal'
import { LinkJustifyBox } from '@/features/issues/linking/LinkJustifyBox'
import detailMessages from '@/features/issues/workspace/IssueDetail.i18n'
import justifyMessages from '@/features/issues/linking/LinkJustify.i18n'
import { JUSTIFICATION_MIN } from '@/data/linkJustification'

const M = detailMessages.en
const J = justifyMessages.en

/** An issue seeded WITH related issues, so there is something to unlink. */
const ANCHOR = 'EE-260001'

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)

const exact = (s: string) => new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
const btn = (name: string) => screen.getByRole('button', { name: exact(name) })
const queryBtn = (name: string) => screen.queryByRole('button', { name: exact(name) })
const body = () => document.body.textContent ?? ''

/*
 * `@testing-library/jest-dom` is NOT installed here, so `toBeDisabled` and
 * `toHaveValue` do not exist — the rest of this suite asserts on properties, and
 * so do these. Worth noting the matcher was MISSING rather than silently
 * passing: an absent Chai property throws, which is the good failure mode.
 */
const isDisabled = (name: string) => (btn(name) as HTMLButtonElement).disabled
const valueOf = (el: HTMLElement) => (el as HTMLTextAreaElement).value

/**
 * The Unlink control for the Nth current row.
 *
 * Scoped by INDEX, not by name: the fixture has five related issues and so five
 * identically-named Unlink buttons, which makes `getByRole` ambiguous. Row order
 * is `committed` order, which is `issue.linkedIssueIds` order.
 */
const unlinkNth = (n: number) => screen.getAllByRole('button', { name: exact(M.linksModalUnlink) })[n]

/** A reason exactly at the floor, and one exactly below it. */
const AT_FLOOR = 'x'.repeat(JUSTIFICATION_MIN)
const BELOW_FLOOR = 'x'.repeat(JUSTIFICATION_MIN - 1)

/*
 * ⚠️ THE MODAL AND THE STORE ASSERTIONS MUST SHARE ONE PROVIDER.
 *
 * The first version of this called `renderHook(() => useStore())` and `render(…)`
 * separately, which mounts TWO independent `StoreProvider`s: the modal mutated
 * one and the assertions read the other, so the audit row was never found. That
 * failed loudly here because the assertion was positive ("the reason IS
 * recorded"). Had it been a negative assertion it would have PASSED for entirely
 * the wrong reason — a second provider is a perfect vacuous-pass generator.
 *
 * So the harness reads the issue out of the same store the modal renders from,
 * which is also how `IssueWorkspaceScreen` supplies it in the real app.
 */
let captured: ReturnType<typeof useStore> | null = null

function ManageLinksHarness() {
  const store = useStore()
  captured = store
  const issue = store.getIssue(ANCHOR)
  if (!issue) return null
  return <ManageLinksModal open issue={issue} onClose={() => {}} />
}

function renderManageLinks() {
  captured = null
  const view = render(<ManageLinksHarness />, { wrapper: Wrapped })
  const issue = captured!.getIssue(ANCHOR)!
  expect(issue.linkedIssueIds?.length, 'fixture must start with related issues').toBeGreaterThan(0)
  return { view, issue, store: () => captured! }
}

/** The textarea for one pending change, found by its own accessible name. */
const justifyBoxFor = (id: string, kind: 'link' | 'unlink') =>
  screen.getByRole('textbox', { name: `Justification for ${kind === 'unlink' ? 'unlinking' : 'linking'} ${id}` })

/*
 * ─── ⚠️ THESE MOVED FROM SYMMETRIC LINKS TO GROUP MEMBERSHIP ────────────────
 *
 * `ManageLinksModal` used to edit `linkedIssueIds`; it is now the Parent/Child
 * GROUP editor, which is what its copy always claimed. The governance claims are
 * unchanged — Save refuses an unjustified change, the floor is 20 trimmed
 * characters, a withdrawn change discards its reason — so the tests are retargeted
 * rather than deleted. The anchor is a seeded GROUP, since an issue with no group
 * now has nothing for this modal to edit.
 */
const GROUPED = 'EE-260023'

function renderGroupModal() {
  captured = null
  const Harness = () => {
    const store = useStore()
    captured = store
    const issue = store.getIssue(GROUPED)
    if (!issue) return null
    return <ManageLinksModal open issue={issue} onClose={() => {}} />
  }
  const view = render(<Harness />, { wrapper: Wrapped })
  const members = captured!.groupMembers(GROUPED).filter((m) => m.id !== GROUPED)
  expect(members.length, 'fixture must be a multi-member group').toBeGreaterThan(1)
  return { view, members, store: () => captured! }
}

const unlinkNthMember = (n: number) =>
  screen.getAllByRole('button', { name: exact(M.linksModalUnlink) })[n]

describe('Manage Links — Save cannot commit an unjustified group change', () => {
  it('offers no Save while a pending removal has no justification', () => {
    renderGroupModal()
    expect(isDisabled(M.linksModalSave)).toBe(true)
    expect(body()).not.toContain(J.saveBlocked)

    fireEvent.click(unlinkNthMember(0))

    expect(isDisabled(M.linksModalSave)).toBe(true)
    expect(body()).toContain(J.saveBlocked)
  })

  it('REFUSES a justification one character below the floor', () => {
    const { members } = renderGroupModal()
    fireEvent.click(unlinkNthMember(0))
    fireEvent.change(justifyBoxFor(members[0].id, 'unlink'), { target: { value: BELOW_FLOOR } })
    fireEvent.click(btn(J.apply))

    expect(body()).toContain(`${JUSTIFICATION_MIN - 1} entered.`)
    expect(isDisabled(M.linksModalSave)).toBe(true)
    expect(body()).not.toContain(J.appliedUnlink)
  })

  it('accepts it AT the floor', () => {
    const { members } = renderGroupModal()
    fireEvent.click(unlinkNthMember(0))
    fireEvent.change(justifyBoxFor(members[0].id, 'unlink'), { target: { value: AT_FLOOR } })
    fireEvent.click(btn(J.apply))

    expect(body()).toContain(J.appliedUnlink)
    expect(isDisabled(M.linksModalSave)).toBe(false)
    expect(body()).not.toContain('entered.')
  })

  it('removes the member from the GROUP on Save, with the reason audited', () => {
    const { members, store } = renderGroupModal()
    const target = members[0].id
    const REASON = 'Investigated separately; no longer part of this cohort.'

    fireEvent.click(unlinkNthMember(0))
    fireEvent.change(justifyBoxFor(target, 'unlink'), { target: { value: REASON } })
    fireEvent.click(btn(J.apply))
    fireEvent.click(btn(M.linksModalSave))

    // ⚠️ GROUP membership changed — NOT the symmetric link array, which this
    // modal no longer touches.
    expect(store().getIssue(target)!.groupId, 'still in the group').toBeUndefined()
    const rows = store().auditFor(target).filter((a) => a.action === 'Issue Unlinked')
    expect(rows.length).toBe(1)
    expect(rows[0].detail).toContain(REASON)
  })
})

describe('Manage Links — a pending removal stays visible', () => {
  it('keeps the row on screen, flagged Pending, instead of dropping it', () => {
    const { members } = renderGroupModal()
    const target = members[0].id

    expect(screen.getByText(target)).toBeTruthy()
    expect(body()).not.toContain(M.linksModalPendingUnlink)

    fireEvent.click(unlinkNthMember(0))

    expect(screen.queryByText(target), 'ROW VANISHED — its justification has nowhere to live').toBeTruthy()
    expect(body()).toContain(M.linksModalPendingUnlink)
    expect(queryBtn(M.linksModalUndo)).toBeTruthy()
  })

  it('discards the justification when the change is WITHDRAWN via Undo', () => {
    const { members } = renderGroupModal()
    const target = members[0].id

    fireEvent.click(unlinkNthMember(0))
    fireEvent.change(justifyBoxFor(target, 'unlink'), { target: { value: AT_FLOOR } })
    expect(valueOf(justifyBoxFor(target, 'unlink'))).toBe(AT_FLOOR)

    fireEvent.click(btn(M.linksModalUndo))
    expect(body()).not.toContain(M.linksModalPendingUnlink)

    fireEvent.click(unlinkNthMember(0))
    expect(valueOf(justifyBoxFor(target, 'unlink'))).toBe('')
  })
})

describe('Issue-list modal — withdrawal by untoggling a checkbox', () => {
  const renderList = () =>
    render(<LinkedIssuesModal open issueId={ANCHOR} onClose={() => {}} />, { wrapper: Wrapped })

  it('starts BLANK on re-toggle, so a withdrawn reason cannot be reused', () => {
    renderList()
    // The first unchecked candidate is a pending LINK once toggled.
    const boxes = screen.getAllByRole('checkbox').filter((b) => !(b as HTMLInputElement).checked)
    expect(boxes.length, 'no unchecked candidate to toggle').toBeGreaterThan(0)

    fireEvent.click(boxes[0])
    const area = screen.getAllByRole('textbox').find((t) => t.tagName === 'TEXTAREA')!
    fireEvent.change(area, { target: { value: AT_FLOOR } })
    expect(valueOf(area)).toBe(AT_FLOOR) // negative control

    fireEvent.click(boxes[0]) // withdraw
    fireEvent.click(boxes[0]) // re-toggle

    const again = screen.getAllByRole('textbox').find((t) => t.tagName === 'TEXTAREA')!
    expect(valueOf(again)).toBe('')
  })

  it('will not save an unjustified toggle', () => {
    renderList()
    const boxes = screen.getAllByRole('checkbox').filter((b) => !(b as HTMLInputElement).checked)

    // Establish the pre-click state so the post-click assertion is about the gate.
    expect(body()).not.toContain(J.saveBlocked)
    fireEvent.click(boxes[0])

    expect(body()).toContain(J.saveBlocked)
    expect(isDisabled('Save changes')).toBe(true)
  })
})

describe('Issue-list modal — a pending unlink with NO match overlap', () => {
  /*
   * ─── REGRESSION: THE UNBLOCKABLE DEAD END ──────────────────────────────────
   *
   * `visible` kept a row when it was in `draft` or had match-reasons. A COMMITTED
   * link with neither — no shared system/sub-system/component/model/symptom,
   * which is what any hand-made link can look like — vanished the instant it was
   * unchecked, taking its checkbox and its justification box with it.
   *
   * Not a bypass: the gate held and Save stayed disabled. Worse in the other
   * direction — the change could neither be completed nor withdrawn, and because
   * `allApplied` is all-or-nothing it blocked every other pending change too.
   * The only exit discarded the work.
   *
   * ⚠️ THE SEED CANNOT REACH THIS ON ITS OWN. Checked: zero of its committed
   * links have empty overlap, which is exactly why the defect survived review of
   * the seeded paths.
   *
   * SO THE ARRANGE STEP CALLS `store.linkIssue()` DIRECTLY. Stated precisely,
   * because an earlier note claimed this was done "the way a user does it": it
   * is NOT driven through the search UI. It calls the same store method a user's
   * link action calls, reaching an identical committed state, and the ASSERT
   * phase then exercises the real checkbox / justify / Save UI. That is sound
   * for what this test is about — row visibility for a zero-overlap committed
   * link — but it does not cover the search box that would create such a link,
   * and describing it as a user journey overstated it.
   */
  const ZERO_OVERLAP = 'ST-260002'
  const WHY = 'Linked by hand during triage; no classification overlap at all.'

  function renderWithManualLink() {
    captured = null
    const Harness = () => {
      const store = useStore()
      captured = store
      return <LinkedIssuesModal open issueId={ANCHOR} onClose={() => {}} />
    }
    const view = render(<Harness />, { wrapper: Wrapped })
    // Create the committed, zero-overlap link through the store the modal reads.
    act(() => captured!.linkIssue(ANCHOR, ZERO_OVERLAP, WHY, { name: 'T', role: 'SE' }))
    return view
  }

  const rowFor = (id: string) => screen.queryByText(exact(id))

  it('keeps the row, its checkbox and its justification box after unchecking', () => {
    renderWithManualLink()

    // Negative control: it must be on screen, and CHECKED, before the click —
    // otherwise the assertions below could pass on a row that never appeared.
    expect(rowFor(ZERO_OVERLAP), 'manual link never rendered').toBeTruthy()
    const box = screen
      .getAllByRole('checkbox')
      .find((c) => (c as HTMLInputElement).checked && c.closest('div')?.parentElement?.textContent?.includes(ZERO_OVERLAP))
    expect(box, 'no checked checkbox for the manual link').toBeTruthy()

    fireEvent.click(box!)

    // THE REGRESSION: before the fix, all three of these were gone.
    expect(rowFor(ZERO_OVERLAP), 'ROW VANISHED — change cannot be completed or withdrawn').toBeTruthy()
    expect(justifyBoxFor(ZERO_OVERLAP, 'unlink'), 'justification box vanished with the row').toBeTruthy()
    expect(
      screen.getAllByRole('checkbox').some((c) => c.closest('div')?.parentElement?.textContent?.includes(ZERO_OVERLAP)),
      'checkbox vanished — no way back',
    ).toBe(true)
  })

  it('can be COMPLETED — the reason reaches the audit trail', () => {
    renderWithManualLink()
    const box = screen
      .getAllByRole('checkbox')
      .find((c) => (c as HTMLInputElement).checked && c.closest('div')?.parentElement?.textContent?.includes(ZERO_OVERLAP))!
    fireEvent.click(box)

    const REASON = 'Triage error; these two issues are genuinely unrelated defects.'
    fireEvent.change(justifyBoxFor(ZERO_OVERLAP, 'unlink'), { target: { value: REASON } })
    fireEvent.click(btn(J.apply))
    fireEvent.click(btn('Save changes'))

    expect(captured!.getIssue(ANCHOR)!.linkedIssueIds ?? []).not.toContain(ZERO_OVERLAP)
    const entry = captured!.auditFor(ANCHOR).find((e) => e.action === 'Issue unlinked' && e.detail?.includes(ZERO_OVERLAP))
    expect(entry, 'no audit row for the unlink').toBeTruthy()
    expect(entry!.detail).toContain(REASON)
  })

  it('can be WITHDRAWN — re-checking restores the link and drops the reason', () => {
    renderWithManualLink()
    const find = () =>
      screen.getAllByRole('checkbox').find((c) => c.closest('div')?.parentElement?.textContent?.includes(ZERO_OVERLAP))!

    fireEvent.click(find()) // uncheck → pending unlink
    fireEvent.change(justifyBoxFor(ZERO_OVERLAP, 'unlink'), { target: { value: AT_FLOOR } })
    expect(valueOf(justifyBoxFor(ZERO_OVERLAP, 'unlink'))).toBe(AT_FLOOR) // negative control

    fireEvent.click(find()) // re-check → withdrawn
    // No pending change remains, so Save has nothing to block on.
    expect(body()).not.toContain(J.saveBlocked)

    fireEvent.click(find()) // uncheck again → the reason must be gone
    expect(valueOf(justifyBoxFor(ZERO_OVERLAP, 'unlink'))).toBe('')
  })
})

describe('LinkJustifyBox — the boundary and the two lengths', () => {
  const setup = (text: string) => {
    const onApply = () => {}
    render(
      <LinkJustifyBox
        text={text}
        error=""
        onText={() => {}}
        onApply={onApply}
        onCancel={() => {}}
        label="Justification for unlinking X-1"
        inputLabel="Justification for unlinking X-1"
      />,
      { wrapper: Wrapped },
    )
  }

  it('counts the RAW text in the counter, including whitespace', () => {
    // The counter tracks the CAP, so it counts keystrokes — while the floor
    // counts trimmed characters. Two different measurements on purpose; see
    // `@/data/linkJustification`.
    setup('   ')
    expect(screen.getByText(exact('3 / 500 characters'))).toBeTruthy()
    // Negative control: it must not have rendered the TRIMMED count instead.
    expect(screen.queryByText(exact('0 / 500 characters'))).toBeNull()
  })

  it('renders the verbose counter form, not Issue Entry compact one', () => {
    // The per-surface difference the shared rule deliberately preserves.
    setup(AT_FLOOR)
    expect(screen.getByText(exact(`${JUSTIFICATION_MIN} / 500 characters`))).toBeTruthy()
    expect(screen.queryByText(exact(`${JUSTIFICATION_MIN}/500`))).toBeNull()
  })

  it('labels its own control so two pending rows cannot be confused', () => {
    setup('')
    expect(screen.getByRole('textbox', { name: 'Justification for unlinking X-1' })).toBeTruthy()
    expect(btn(J.apply)).toBeTruthy()
    // CASE-SENSITIVE: the `cancel` key bug shipped because /cancel/i matched the
    // broken lowercase render of an undeclared key.
    expect(btn(J.cancel)).toBeTruthy()
    expect(queryBtn('cancel')).toBeNull()
  })
})

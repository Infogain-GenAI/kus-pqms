// Manage Related Issues as the GROUP editor — the add path and its validation.
//
// The removal path and its gate are covered in `linkJustificationGate.test.tsx`.
// This covers what the repurposing ADDED: linking by Issue ID, with the
// canonical's own refusal messages, and a pending addition that must be justified
// before Save will commit it.
//
// ⚠️ THERE IS NO CANDIDATE LIST TO TEST, and its absence is asserted rather than
// assumed. The modal used to suggest `store.correlations()` matches; the design
// offers only the ID box. A test suite that simply stopped mentioning candidates
// would leave nobody able to tell whether the list was removed on purpose.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'
import { ManageLinksModal } from '@/features/issues/workspace/modals'
import detailMessages from '@/features/issues/workspace/IssueDetail.i18n'
import justifyMessages from '@/features/issues/linking/LinkJustify.i18n'
import { JUSTIFICATION_MIN } from '@/data/linkJustification'

const M = detailMessages.en
const J = justifyMessages.en
const AT_FLOOR = 'x'.repeat(JUSTIFICATION_MIN)

/** A seeded four-member group. */
const GROUPED = 'EE-260023'

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)

let captured: ReturnType<typeof useStore> | null = null

function openModal(anchor = GROUPED) {
  captured = null
  const Harness = () => {
    const store = useStore()
    captured = store
    const issue = store.getIssue(anchor)
    return issue ? <ManageLinksModal open issue={issue} onClose={() => {}} /> : null
  }
  render(<Harness />, { wrapper: Wrapped })
  return { store: () => captured! }
}

const idBox = () => screen.getByRole('textbox', { name: M.linksModalSearchLabel })
const linkBtn = () => screen.getAllByRole('button', { name: new RegExp(`^${M.linksModalLink}$`) })[0]
const body = () => document.body.textContent ?? ''

const tryId = (value: string) => {
  fireEvent.change(idBox(), { target: { value } })
  fireEvent.click(linkBtn())
}

describe('the candidate list is gone, deliberately', () => {
  it('offers an Issue-ID box and no suggested candidates', () => {
    openModal()
    expect(idBox()).toBeTruthy()
    // The old empty-state copy is gone with the list it belonged to — asserted so
    // that reinstating a candidate list is a visible change, not a silent one.
    expect(body()).not.toContain('No classification-matched candidates')
  })
})

describe("⚠️ ID validation uses the canonical's own refusals", () => {
  it('refuses an empty box', () => {
    openModal()
    tryId('   ')
    expect(body()).toContain(M.linksModalErrEmpty)
  })

  it('distinguishes a MALFORMED id from a well-formed one that does not exist', () => {
    // The design says these differently, and the distinction is useful: one is a
    // typo, the other is a real-looking id for a record that is not there.
    openModal()
    tryId('not an id')
    expect(body()).toContain(M.linksModalErrInvalid)

    tryId('ZZ-999999')
    expect(body()).toContain('No issue found with ID')
    expect(body()).not.toContain(M.linksModalErrInvalid)
  })

  it('refuses the issue itself', () => {
    openModal()
    tryId(GROUPED)
    expect(body()).toContain(M.linksModalErrSelf)
  })

  it('refuses an issue already in the group', () => {
    const { store } = openModal()
    const member = store().groupMembers(GROUPED).find((m) => m.id !== GROUPED)!
    tryId(member.id)
    expect(body()).toContain('already related to this issue')
  })

  it('refuses a duplicate pending addition', () => {
    const { store } = openModal()
    const outsider = store().issues.find((i) => !i.groupId)!.id
    tryId(outsider)
    // First one is accepted...
    expect(body()).toContain(M.linksModalPendingLink)
    // ...the second is not.
    tryId(outsider)
    expect(body()).toContain('already pending link')
  })

  it('is case-insensitive on the id, as the design is', () => {
    const { store } = openModal()
    const outsider = store().issues.find((i) => !i.groupId)!.id
    tryId(outsider.toLowerCase())
    expect(body()).toContain(M.linksModalPendingLink)
  })
})

describe('a pending addition must be justified before Save', () => {
  const addOutsider = () => {
    const { store } = openModal()
    const outsider = store().issues.find((i) => !i.groupId)!.id
    tryId(outsider)
    return { store, outsider }
  }

  it('blocks Save until the addition is applied', () => {
    addOutsider()
    const save = screen.getByRole('button', { name: new RegExp(`^${M.linksModalSave}$`) }) as HTMLButtonElement
    expect(save.disabled, 'Save offered with an unjustified addition').toBe(true)
    expect(body()).toContain(J.saveBlocked)
  })

  it('JOINS THE GROUP on Save, with the reason audited', () => {
    const { store, outsider } = addOutsider()
    const REASON = 'Same failure mode; folding into the existing cohort.'

    fireEvent.change(screen.getByRole('textbox', { name: `Justification for linking ${outsider}` }), {
      target: { value: REASON },
    })
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${J.apply}$`) }))
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${M.linksModalSave}$`) }))

    // ⚠️ GROUP membership, not the symmetric link array.
    const groupId = store().getIssue(GROUPED)!.groupId
    expect(store().getIssue(outsider)!.groupId, 'did not join the group').toBe(groupId)
    expect(store().getIssue(outsider)!.linkedIssueIds ?? [], 'must not touch symmetric links').not.toContain(GROUPED)

    const rows = store().auditFor(outsider).filter((a) => a.action === 'Issue Linked')
    expect(rows.length).toBe(1)
    expect(rows[0].detail).toContain(REASON)
  })

  it('withdrawing the addition discards its reason', () => {
    const { outsider } = addOutsider()
    fireEvent.change(screen.getByRole('textbox', { name: `Justification for linking ${outsider}` }), {
      target: { value: AT_FLOOR },
    })
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${M.linksModalUndo}$`) }))
    expect(body()).not.toContain(M.linksModalPendingLink)

    // Re-added, it starts blank.
    fireEvent.change(idBox(), { target: { value: outsider } })
    fireEvent.click(linkBtn())
    const again = screen.getByRole('textbox', { name: `Justification for linking ${outsider}` }) as HTMLTextAreaElement
    expect(again.value).toBe('')
  })
})

describe('Parent and Child roles are shown and derived', () => {
  it('marks the earliest member Parent and the rest Child', () => {
    const { store } = openModal()
    const all = store().groupMembers(GROUPED)
    expect(all.length, 'expected a multi-member group').toBeGreaterThan(2)
    // The anchor is excluded from the list, so the badges shown belong to the others.
    expect(body()).toContain(M.linksModalChild)
    // Whether Parent appears depends on whether the anchor IS the parent —
    // asserted through the store rather than guessed.
    if (all[0].id !== GROUPED) expect(body()).toContain(M.linksModalParent)
  })
})

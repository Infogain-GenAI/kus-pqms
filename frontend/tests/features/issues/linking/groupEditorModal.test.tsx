// Manage Related Issues as the GROUP editor — the add path.
//
// The removal path and its gate are covered in `linkJustificationGate.test.tsx`;
// the impact copy and Parent projection in `relatedIssues.test.ts`. This covers
// how an issue GETS INTO the group.
//
// ─── ⚠️ THE ADD PATH CHANGED SHAPE, AND SO DID WHAT IS WORTH TESTING ────────
//
// It used to be an Issue-ID box that ACCEPTED anything and then refused it with
// one of five messages — "cannot link an issue to itself", "already related",
// "already pending link". The prototype's design does not refuse: it EXCLUDES.
// The search pool drops the issue itself, every current group member and every
// pending addition, so none of those three mistakes is reachable.
//
// That makes exclusion the property under test. A refusal message can be
// verified by reading the screen; an absence cannot, and an exclusion that
// silently stops excluding looks exactly like a search that found nothing —
// which is why each case below names a specific id and asserts it is missing
// while proving the search itself still works.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
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

const body = () => document.body.textContent ?? ''
const btn = (name: string) => screen.getByRole('button', { name })

/** The search panel is closed until asked for — that is the design. */
const openSearch = () => fireEvent.click(btn(M.linksModalSearchToggle as string))
const searchFor = (q: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: M.linksModalSearchLabel as string }), { target: { value: q } })

/** The results region, so "is this id on screen" cannot be answered by a row elsewhere. */
const results = () => screen.queryAllByRole('button', { name: M.linksModalLink as string })
const resultCardFor = (id: string) =>
  results()
    .map((b) => b.closest('div')?.parentElement)
    .find((card) => card?.textContent?.includes(id))

const linkFromSearch = (id: string) => {
  searchFor(id)
    const card = resultCardFor(id)
  if (!card) throw new Error(`${id} was not offered by the search`)
  fireEvent.click(within(card as HTMLElement).getByRole('button', { name: M.linksModalLink as string }))
}

describe('the search panel — closed until asked for', () => {
  it('offers a toggle rather than a permanently open search', () => {
    openModal()
    expect(btn(M.linksModalSearchToggle as string)).toBeTruthy()
    expect(screen.queryByRole('textbox', { name: M.linksModalSearchLabel as string })).toBeNull()
  })

  it('opens to an idle prompt, not to an empty result list', () => {
    openModal()
    openSearch()
    expect(screen.getByRole('textbox', { name: M.linksModalSearchLabel as string })).toBeTruthy()
    expect(body()).toContain(M.linksModalSearchIdle)
    expect(results()).toHaveLength(0)
  })

  it('says so when nothing matches, quoting what was searched for', () => {
    openModal()
    openSearch()
    searchFor('ZZ-999999')
    expect(body()).toContain('No issues match')
    expect(body()).toContain('ZZ-999999')
    expect(results()).toHaveLength(0)
  })

  it('finds an outsider by id and reports how many matched', () => {
    const { store } = openModal()
    const outsider = store().issues.find((i) => !i.groupId && i.id !== GROUPED)!.id
    openSearch()
    searchFor(outsider)
    expect(resultCardFor(outsider), 'the outsider was not offered').toBeTruthy()
    expect(body()).toContain(M.linksModalResultsHeading)
  })
})

describe('⚠️ EXCLUSION replaces refusal — three mistakes made unreachable', () => {
  it('never offers the issue being managed', () => {
    openModal()
    openSearch()
    searchFor(GROUPED)
    expect(resultCardFor(GROUPED), 'the anchor issue offered itself for linking').toBeFalsy()
  })

  it('never offers an issue already in the group', () => {
    const { store } = openModal()
    const member = store().groupMembers(GROUPED).find((m) => m.id !== GROUPED)!
    openSearch()
    searchFor(member.id)
    expect(resultCardFor(member.id), 'an existing group member was offered again').toBeFalsy()
  })

  it('never offers an issue that is already a pending addition', () => {
    const { store } = openModal()
    const outsider = store().issues.find((i) => !i.groupId && i.id !== GROUPED)!.id
    openSearch()
    linkFromSearch(outsider)
    // The row is now in the pending list; searching for it again must find nothing
    // to link, or the same issue could be queued twice.
    searchFor(outsider)
    expect(resultCardFor(outsider), 'a pending addition was offered a second time').toBeFalsy()
  })

  it('matches on title as well as id, so the pool is genuinely searched', () => {
    const { store } = openModal()
    const outsider = store().issues.find((i) => !i.groupId && i.id !== GROUPED && i.title.length > 8)!
    openSearch()
    searchFor(outsider.title.slice(0, 8))
    expect(resultCardFor(outsider.id)).toBeTruthy()
  })
})

describe('a pending addition must be justified before Save', () => {
  const addOutsider = () => {
    const { store } = openModal()
    const outsider = store().issues.find((i) => !i.groupId && i.id !== GROUPED)!.id
    openSearch()
    linkFromSearch(outsider)
    return { store, outsider }
  }

  it('blocks Save until the addition is applied', () => {
    addOutsider()
    const save = btn(M.linksModalSave as string) as HTMLButtonElement
    expect(save.disabled, 'Save offered with an unjustified addition').toBe(true)
  })

  it('shows no Pending Link badge until the reason is accepted', () => {
    const { outsider } = addOutsider()
    // The row exists — its justification box has to live somewhere...
    expect(body()).toContain(outsider)
    // ...but it is not yet a pending change.
    expect(body()).not.toContain(M.linksModalPendingLink)

    fireEvent.change(screen.getByRole('textbox', { name: `Justification for linking ${outsider}` }), {
      target: { value: AT_FLOOR },
    })
    fireEvent.click(btn(J.apply as string))
    expect(body()).toContain(M.linksModalPendingLink)
  })

  it('JOINS THE GROUP on Save, with the reason audited', () => {
    const { store, outsider } = addOutsider()
    const REASON = 'Same failure mode; folding into the existing cohort.'

    fireEvent.change(screen.getByRole('textbox', { name: `Justification for linking ${outsider}` }), {
      target: { value: REASON },
    })
    fireEvent.click(btn(J.apply as string))
    fireEvent.click(btn(M.linksModalSave as string))

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
    fireEvent.click(btn(`${M.linksModalRemove} ${outsider}`))
    expect(body()).not.toContain(M.linksModalPendingLink)

    // Re-added, it starts blank — a reason the user withdrew must not come back.
    linkFromSearch(outsider)
    const again = screen.getByRole('textbox', { name: `Justification for linking ${outsider}` }) as HTMLTextAreaElement
    expect(again.value).toBe('')
  })
})

describe('the impact band — what Save will actually do', () => {
  it('stays hidden until a change is applied, then states the count', () => {
    const { store } = openModal()
    const outsider = store().issues.find((i) => !i.groupId && i.id !== GROUPED)!.id
    expect(body()).not.toContain('Pending')

    openSearch()
    linkFromSearch(outsider)
    // Toggled but unjustified is not yet a pending CHANGE.
    expect(body()).not.toContain('1 Change Pending')

    fireEvent.change(screen.getByRole('textbox', { name: `Justification for linking ${outsider}` }), {
      target: { value: AT_FLOOR },
    })
    fireEvent.click(btn(J.apply as string))
    expect(body()).toContain('1 Change Pending')
    expect(body()).toContain('will become part of the same issue group')
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

  it('names the group size, so the user knows what they are editing', () => {
    const { store } = openModal()
    expect(body()).toContain(`Issue Group · ${store().groupMembers(GROUPED).length} Issues`)
  })
})

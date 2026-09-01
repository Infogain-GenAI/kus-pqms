// The existing-issue popup, tested as itself.
//
// ⚠️ WHY THIS FILE EXISTS. `ExistingIssueModal` has two production callers — the
// workspace's linked-issues rail and, until now, Issue Entry's search results —
// and it had never been tested as a component. Its behaviour was covered
// incidentally, inside `CreateIssueScreen.test.tsx`, because Issue Entry's "View"
// button happened to be how a test could reach it. When that button was removed
// to match the canonical, seven tests of a component we are KEEPING were sitting
// behind it.
//
// So these are not a consolation for a deleted block. They fix the fact that a
// shared component was only ever observed through whichever screen opened it.
//
// ⚠️ AND THE OBSERVATION POINT MOVED, WHICH IS THE RISK IN THE MIGRATION. Three
// of the originals asserted "this did not link" by checking Issue Entry's DRAFT
// counter — the "N linked" text in its section header. Rendered directly there is
// no draft and no counter, so a copy-paste would have asserted the absence of
// something that could never have appeared: a green that cannot go red. Every
// such assertion is re-expressed as "the callback did not fire", and every test
// here was mutation-checked by making the modal link when it should not.
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'
import { ExistingIssueModal } from '@/features/issues/ExistingIssueModal'
import existingMessages from '@/features/issues/ExistingIssueModal.i18n'

const M = existingMessages.en

/** Seeded, with an investigation and actions — so the sections have content. */
const SUBJECT = 'EE-260023'

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)

const body = () => document.body.textContent ?? ''

function open({ linked = false, id = SUBJECT }: { linked?: boolean; id?: string | null } = {}) {
  const spies = {
    onClose: vi.fn(),
    onLink: vi.fn(),
    onUnlink: vi.fn(),
    onOpenIssue: vi.fn(),
  }
  const Harness = () => {
    const store = useStore()
    return (
      <ExistingIssueModal
        issue={id ? (store.getIssue(id) ?? null) : null}
        linked={linked}
        onClose={spies.onClose}
        onLink={spies.onLink}
        onUnlink={spies.onUnlink}
        onOpenIssue={spies.onOpenIssue}
      />
    )
  }
  render(<Harness />, { wrapper: Wrapped })
  return spies
}

/** Nothing was mutated: the two link callbacks are the only ways this can act. */
const expectNoLinkChange = (s: ReturnType<typeof open>) => {
  expect(s.onLink, 'it linked when it should not have').not.toHaveBeenCalled()
  expect(s.onUnlink, 'it unlinked when it should not have').not.toHaveBeenCalled()
}

describe('the sections the design gives it', () => {
  it('shows classification, description, investigation and actions', () => {
    open()
    expect(body()).toContain('Classification')
    expect(body()).toContain('Issue description')
    expect(body()).toContain('Investigation summary')
    expect(body()).toContain('Actions taken')
  })

  /*
   * ⚠️ INLINE AND ALWAYS SHOWN, NOT AN ACCORDION. The toggling history accordion
   * in the design belongs to communications rows, not here. Pinned because an
   * expander is the obvious "improvement" to make to a long section.
   */
  it('renders Related history inline, with no expander', () => {
    open()
    expect(body()).toContain('Related history')
    expect(screen.queryByRole('button', { name: /show .*history/i })).toBeNull()
  })

  it('renders nothing at all for a null issue', () => {
    // The caller holds "which issue", not a boolean — null is how it closes.
    open({ id: null })
    expect(body()).not.toContain('Investigation summary')
  })
})

describe('it reflects link state rather than assuming it', () => {
  it('offers Link for an unlinked issue', () => {
    open({ linked: false })
    expect(screen.getByRole('button', { name: /^link issue$/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^unlink issue$/i })).toBeNull()
  })

  it('offers Unlink for a linked issue, and NOT Link', () => {
    open({ linked: true })
    expect(screen.getByRole('button', { name: /^unlink issue$/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^link issue$/i })).toBeNull()
  })

  /*
   * The pill in the HEADER, not the footer button. Added because a mutation
   * suppressing it left every other test here passing — the footer and the pill
   * both read `linked` and only the footer was observed, so half the binding was
   * unguarded.
   *
   * ⚠️ ADDRESSED AS AN ELEMENT, NOT AS BODY TEXT, and the first attempt got that
   * wrong. `M.linkedPill` is the word "Linked", which also appears in this
   * fixture's own activity text ("Linked to EE-260023") — so `not.toContain` on
   * the body was unsatisfiable no matter what the component did. Same trap as
   * counting Parent badges by substring.
   */
  const linkedPill = () =>
    Array.from(document.querySelectorAll('span')).filter((el) => el.textContent?.trim() === M.linkedPill)

  it('marks a linked issue in the header too, not only in the footer', () => {
    open({ linked: true })
    expect(linkedPill().length, 'no Linked pill rendered').toBeGreaterThan(0)
  })

  it('and shows no such mark when it is not linked', () => {
    open({ linked: false })
    expect(linkedPill(), 'a Linked pill rendered for an unlinked issue').toHaveLength(0)
  })
})

describe('View Issue leaves for the record, without linking on the way out', () => {
  it('is offered', () => {
    open()
    expect(screen.getByRole('button', { name: /view issue/i })).toBeTruthy()
  })

  it('reports the issue to open', () => {
    const s = open()
    fireEvent.click(screen.getByRole('button', { name: /view issue/i }))
    expect(s.onOpenIssue).toHaveBeenCalledWith(SUBJECT)
  })

  /*
   * The original asserted this through Issue Entry's draft counter. Rendered
   * directly, the honest observation is that neither link callback fired — which
   * is what "did not link it on the way out" actually means.
   */
  it('does not link or unlink', () => {
    const s = open()
    fireEvent.click(screen.getByRole('button', { name: /view issue/i }))
    expectNoLinkChange(s)
  })
})

describe('closing touches nothing', () => {
  it('closes on the Close button', () => {
    const s = open()
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }))
    expect(s.onClose).toHaveBeenCalled()
    expectNoLinkChange(s)
  })

  it('closes on Escape', () => {
    const s = open()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(s.onClose).toHaveBeenCalled()
    expectNoLinkChange(s)
  })
})

describe('⚠️ THE LINK BUTTON HAS NO LIVE CALLER, AND IS TESTED ANYWAY', () => {
  /*
   * Recorded rather than deleted. Issue Entry's search results were the only
   * surface that offered linking from inside this popup, and that entry point is
   * gone — the canonical's search cards carry only View History and the link
   * button on the CARD. The workspace's caller passes `onLink={() => {}}`,
   * because everything reachable from its rail is already linked.
   *
   * So this path is unreachable from any screen today. It is covered because the
   * component still offers it and a future caller would rely on it, and it is
   * flagged because "tested" must not be read as "reachable" — the same
   * distinction recorded for `removeRelated`'s symmetric fallback.
   */
  it('reports a link when pressed', () => {
    const s = open({ linked: false })
    fireEvent.click(screen.getByRole('button', { name: /^link issue$/i }))
    expect(s.onLink).toHaveBeenCalled()
    expect(s.onUnlink).not.toHaveBeenCalled()
  })

  it('reports an unlink when pressed on a linked issue', () => {
    const s = open({ linked: true })
    fireEvent.click(screen.getByRole('button', { name: /^unlink issue$/i }))
    expect(s.onUnlink).toHaveBeenCalled()
    expect(s.onLink).not.toHaveBeenCalled()
  })
})

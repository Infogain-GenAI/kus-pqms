// Search & link — the behaviour of the panel being folded into Issue Edit.
//
// ⚠️ WHY THIS FILE EXISTS, AND WHY IT IS WRITTEN BEFORE THE CHANGE. Issue Edit's
// search block is `LinkIssuesSection`, written by another developer, and it has
// NO tests. It is about to be superseded: the canonical folds search INSIDE the
// Same Existing Issues section, behind that section's own "Search & link another
// issue" toggle, so the standalone card goes.
//
// Replacing an untested component means "I preserved its behaviour" would
// otherwise be one person's reading of another person's code. So these are
// written against the component AS IT STANDS and confirmed passing on it FIRST.
// They then become the acceptance criteria for the folded-in panel: whatever the
// structure ends up being, these must still pass, and a break is visible rather
// than inferred.
//
// ⚠️ ONE BEHAVIOUR IS DELIBERATELY NOT PINNED. The Preview button is being
// removed by ruling — the canonical's search results offer View History and the
// link button, nothing else — so it is not part of what must survive. It is named
// here so its absence later reads as a decision rather than an omission.
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { LinkIssuesSection } from '@/features/issues/LinkIssuesSection'
import { JUSTIFICATION_MIN } from '@/data/linkJustification'

const SUBJECT = 'PT-260005'
const WHY = 'Same valve-body symptom; investigating these together.'
const TOO_SHORT = 'x'.repeat(JUSTIFICATION_MIN - 1)

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)

const body = () => document.body.textContent ?? ''

/*
 * ─── ⚠️ TWO THINGS THAT COST TIME IN THIS CODEBASE ──────────────────────────
 *
 * 1. WHICH ROLE AN INPUT ACTUALLY EXPOSES. `SearchField` renders
 *    `input type="search"`, whose role is `searchbox`, NOT `textbox` — every
 *    other text input in these suites is a textbox, so the mismatch reads as a
 *    wrong NAME rather than a wrong ROLE, and the failure message is identical
 *    either way. Related, from the other direction: the title and description
 *    inputs on the edit form have visual labels that are not associated with
 *    them, so they expose NO accessible name at all and must be reached by
 *    placeholder.
 *
 * 2. NEGATIVE ASSERTIONS MUST TARGET ELEMENTS, NEVER RENDERED TEXT. Ids and
 *    labels recur across audit detail, seeded activity text and empty-state
 *    copy, so searching the body cannot answer "is this OFFERED". Three
 *    assertions were written wrong today before the rule was clear:
 *      · counting "Parent" badges by substring — a group audit row contains
 *        "Parent Issue:";
 *      · `not.toContain('Linked')` — the fixture's activity text reads "Linked
 *        to EE-260023";
 *      · `not.toContain(SUBJECT)` here — the empty state QUOTES THE QUERY, and
 *        the query is the id, so the more correctly self-exclusion works the
 *        more certainly the id is on the page. A correct component guaranteed
 *        that assertion would fail.
 *    Address the control instead: no Link button for that id.
 */
const searchBox = () => screen.getByRole('searchbox', { name: /search issues to link/i })
const search = (q: string) => fireEvent.change(searchBox(), { target: { value: q } })
const btns = (re: RegExp) => screen.queryAllByRole('button', { name: re })

/**
 * Controlled, so `linkedIds` reflects what the callbacks did — an uncontrolled
 * harness would make every multi-step assertion read a value that never changes.
 */
function mount(initial: string[] = []) {
  const spies = { onLink: vi.fn(), onUnlink: vi.fn() }
  const Harness = () => {
    const [ids, setIds] = useState<string[]>(initial)
    return (
      <LinkIssuesSection
        linkedIds={ids}
        excludeId={SUBJECT}
        onLink={(id, why) => {
          spies.onLink(id, why)
          setIds((l) => [...l, id])
        }}
        onUnlink={(id, why) => {
          spies.onUnlink(id, why)
          setIds((l) => l.filter((x) => x !== id))
        }}
      />
    )
  }
  render(<Harness />, { wrapper: Wrapped })
  return spies
}

describe('search offers only issues it would be useful to link', () => {
  it('shows no result list until something is typed', () => {
    mount()
    expect(btns(/^link$/i), 'results appeared with an empty query').toHaveLength(0)
  })

  it('finds issues by id fragment', () => {
    mount()
    search('EE-2600')
    expect(btns(/^link$/i).length).toBeGreaterThan(0)
  })

  it('finds issues by title text, not only by id', () => {
    mount()
    search('vibration')
    expect(body()).toMatch(/EE-2600\d\d/)
  })

  /*
   * ⚠️ SELF-EXCLUSION AND LINKED-EXCLUSION ARE THE POINT OF THE FILTER, and both
   * are silent when broken: the list still renders, it just offers an action that
   * would do nothing or something absurd.
   */
  it('never offers the issue being edited', () => {
    mount()

    /*
     * The positive control comes FIRST, in the same test. Without it this would
     * pass if search were broken outright and no result ever rendered — the
     * assertion below is an absence, and an absence proves nothing unless
     * presence has been demonstrated on the same instance.
     */
    search('EE-2600')
    expect(btns(/^link$/i).length, 'search returned nothing — the check below is vacuous').toBeGreaterThan(0)

    search(SUBJECT)
    expect(btns(/^link$/i), 'the edited issue offered itself').toHaveLength(0)
  })

  it('never offers an issue that is already linked', () => {
    mount(['EE-260023'])
    search('EE-260023')
    // It appears in the linked list below, so the check is that it is not
    // offered as a RESULT — i.e. no Link button for it.
    expect(btns(/^link$/i), 'an already-linked issue was offered again').toHaveLength(0)
  })

  it('says so when nothing matches, quoting what was searched for', () => {
    mount()
    search('zzzz-no-such-issue')
    expect(body()).toContain('zzzz-no-such-issue')
    expect(body()).toMatch(/no unlinked issue matches/i)
  })
})

describe('⚠️ LINKING IS GATED, AND THE CALLER NEVER SEES AN UNJUSTIFIED CHANGE', () => {
  const startLink = () => {
    mount()
    search('EE-2600')
    fireEvent.click(btns(/^link$/i)[0])
  }

  it('asks for a reason instead of linking immediately', () => {
    const spies = mount()
    search('EE-2600')
    fireEvent.click(btns(/^link$/i)[0])
    expect(spies.onLink, 'it linked before asking for a reason').not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: /justification for linking/i })).toBeTruthy()
  })

  it('refuses a reason below the floor, and still does not call through', () => {
    const spies = mount()
    search('EE-2600')
    fireEvent.click(btns(/^link$/i)[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for linking/i }), {
      target: { value: TOO_SHORT },
    })
    fireEvent.click(screen.getByRole('button', { name: /^confirm link$/i }))
    expect(spies.onLink, 'a below-floor reason reached the caller').not.toHaveBeenCalled()
  })

  it('calls through with the TRIMMED reason once it is accepted', () => {
    const spies = mount()
    search('EE-2600')
    fireEvent.click(btns(/^link$/i)[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for linking/i }), {
      target: { value: `   ${WHY}   ` },
    })
    fireEvent.click(screen.getByRole('button', { name: /^confirm link$/i }))
    expect(spies.onLink).toHaveBeenCalledTimes(1)
    expect(spies.onLink.mock.calls[0][1], 'the reason was not trimmed').toBe(WHY)
  })

  it('clears the query after a successful link', () => {
    mount()
    search('EE-2600')
    fireEvent.click(btns(/^link$/i)[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for linking/i }), {
      target: { value: WHY },
    })
    fireEvent.click(screen.getByRole('button', { name: /^confirm link$/i }))
    expect((searchBox() as HTMLInputElement).value).toBe('')
  })

  it('cancels back without linking', () => {
    const spies = mount()
    search('EE-2600')
    fireEvent.click(btns(/^link$/i)[0])
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(spies.onLink).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox', { name: /justification for linking/i })).toBeNull()
  })

  it('exists', () => {
    // Guards the helper above: if the results never render, every gate test in
    // this block would pass by never finding a button to click.
    startLink()
    expect(screen.getByRole('textbox', { name: /justification for linking/i })).toBeTruthy()
  })
})

describe('⚠️ UNLINKING IS GATED THE SAME WAY — both directions, not just link', () => {
  it('asks for a reason instead of unlinking immediately', () => {
    const spies = mount(['EE-260023'])
    fireEvent.click(btns(/^unlink$/i)[0])
    expect(spies.onUnlink, 'it unlinked before asking for a reason').not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: /justification for unlinking/i })).toBeTruthy()
  })

  it('refuses a below-floor reason', () => {
    const spies = mount(['EE-260023'])
    fireEvent.click(btns(/^unlink$/i)[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for unlinking/i }), {
      target: { value: TOO_SHORT },
    })
    fireEvent.click(screen.getByRole('button', { name: /^confirm unlink$/i }))
    expect(spies.onUnlink).not.toHaveBeenCalled()
  })

  it('calls through once accepted', () => {
    const spies = mount(['EE-260023'])
    fireEvent.click(btns(/^unlink$/i)[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for unlinking/i }), {
      target: { value: WHY },
    })
    fireEvent.click(screen.getByRole('button', { name: /^confirm unlink$/i }))
    expect(spies.onUnlink).toHaveBeenCalledWith('EE-260023', WHY)
  })
})

describe('⚠️ ONE PENDING CHANGE, AND AN ABANDONED REASON MUST NOT CARRY OVER', () => {
  /*
   * The component holds a SINGLE pending change rather than a map, because this
   * surface commits per action. Starting a second REPLACES the first and discards
   * its text — a half-typed reason for a change the user walked away from must not
   * be able to attach itself to the next one.
   */
  it('replaces the first pending change rather than queuing it', () => {
    mount()
    search('EE-2600')
    const links = btns(/^link$/i)
    expect(links.length, 'need two results to test replacement').toBeGreaterThan(1)

    fireEvent.click(links[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for linking/i }), {
      target: { value: 'abandoned text that must not carry over' },
    })
    fireEvent.click(btns(/^link$/i)[1])

    // Exactly one justification box, and it is empty.
    const boxes = screen.queryAllByRole('textbox', { name: /justification for linking/i })
    expect(boxes, 'two pending changes were open at once').toHaveLength(1)
    expect((boxes[0] as HTMLTextAreaElement).value, 'the abandoned reason carried over').toBe('')
  })
})

describe('the linked list', () => {
  it('counts what is linked', () => {
    mount(['EE-260023', 'EE-260031'])
    expect(body()).toContain('2 linked')
  })

  it('says so when nothing is linked yet', () => {
    mount()
    expect(body()).toMatch(/no issues linked yet/i)
  })

  /*
   * ⚠️ A LINKED ID CAN OUTLIVE ITS ISSUE in this fixture, and the component says
   * so rather than rendering a blank row. Worth preserving: a blank row reads as a
   * rendering bug, and this is the state the link invariants were written after.
   */
  it('names a dangling linked id instead of rendering an empty row', () => {
    mount(['ZZ-999999'])
    expect(body()).toMatch(/issue not found/i)
    expect(body()).toContain('ZZ-999999')
  })
})

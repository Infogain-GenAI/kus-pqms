// Search & link — now folded INSIDE Same Existing Issues on Issue Edit.
//
// ⚠️ THESE WERE WRITTEN AGAINST `LinkIssuesSection` AND PASSED ON IT FIRST. That
// component was the edit form's separate search card, written by another
// developer and untested. It is now deleted: the canonical renders search inside
// the Same Existing Issues section, behind that section's own toggle, so the
// standalone card had no place to be.
//
// The tests were kept and RETARGETED rather than rewritten, which is the whole
// point — each still checks the behaviour it was written for, so "her behaviour
// survived" is a measurement rather than a reading of her code. They were green
// on the original (commit 4ea50f1) before it was touched.
//
// ─── ⚠️ THREE THINGS CHANGED SHAPE, AND ARE RECORDED RATHER THAN ADJUSTED ────
//
// 1. THE PANEL IS NOW COLLAPSED BY DEFAULT. The old card was always visible;
//    the design opens search from the section header. So every test here opens it
//    first, and `openSearch()` exists for that.
//
// 2. THE UNLINK CONFIRM LABEL DIFFERS. Hers read "Confirm unlink"; this section's
//    is "Confirm removal". Same gate, same floor, different word — asserted as
//    the new copy rather than pretending the old string survived.
//
// 3. THE DANGLING-ID NOTICE IS WORDED DIFFERENTLY. Hers rendered "Issue not
//    found" inside a linked row; there are no linked rows now — linked issues
//    appear as cards, tagged "Manually linked" — so an unresolvable id is named in
//    a notice instead. The CAPABILITY is what mattered and it survives.
//
// ⚠️ ONE BEHAVIOUR IS GONE, DELIBERATELY: her explicit "No issues linked yet."
// empty state. It belonged to a linked LIST, and this section has none — the
// design shows linked issues as cards and conveys "none" by the absence of the
// header's count. Named here so the loss is a decision on the record rather than
// a test that quietly stopped existing.
//
// ⚠️ AND PREVIEW IS NOT PINNED, BY RULING. The canonical's search results carry
// View History and the link button, nothing else.
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'
import { SameExistingIssuesSection } from '@/features/issues/workspace/IssueDetails/IssueEditForm/SameExistingIssuesSection'
import entryMessages from '@/features/issues/issue-entry/IssueEntry.i18n'
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

/* The shared card's labels, hardcoded in the component rather than translated. */
const LINK = /^Link to Issue$/
const UNLINK = /^Unlink from Issue$/

/**
 * Buttons INSIDE the search panel only.
 *
 * ⚠️ SCOPE MATTERS NOW IN A WAY IT DID NOT BEFORE. The old card owned the whole
 * section, so a document-wide query meant "in the search results". This section
 * renders suggestions AND search results from the SAME component, so those
 * labels appear in both — a document-wide count answered 4 where the panel had 0,
 * and read as a broken filter rather than a mis-scoped query. Same lesson as
 * addressing elements instead of body text: name the region you mean.
 */
const panel = () => document.querySelector('[data-testid="same-search-panel"]')
const panelBtns = (re: RegExp) =>
  Array.from(panel()?.querySelectorAll('button') ?? []).filter((b) => re.test((b.textContent ?? '').trim()))

const E = entryMessages.en

/**
 * Controlled, so `linkedIds` reflects what the callbacks did — an uncontrolled
 * harness would make every multi-step assertion read a value that never changes.
 *
 * The subject's classification is passed as the form would pass it: live, from
 * the issue being edited.
 */
function mount(initial: string[] = []) {
  const spies = { onLink: vi.fn(), onUnlink: vi.fn() }
  const Harness = () => {
    const store = useStore()
    const [ids, setIds] = useState<string[]>(initial)
    const subject = store.getIssue(SUBJECT)
    if (!subject) return null
    return (
      <SameExistingIssuesSection
        issue={subject}
        subject={{
          system: subject.system,
          subSystem: subject.subSystem,
          component: subject.component,
          symptom: subject.symptom,
          title: subject.title,
        }}
        linkedIds={ids}
        onLink={(linkIds, why) => {
          for (const id of linkIds) spies.onLink(id, why)
          setIds((l) => [...l, ...linkIds])
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

/** The panel is collapsed until asked for — the design's own affordance. */
const openSearch = () => fireEvent.click(screen.getByRole('button', { name: new RegExp(E.searchLinkAnother, 'i') }))

describe('search offers only issues it would be useful to link', () => {
  it('shows no result list until something is typed', () => {
    mount()
    openSearch()
    // Suggestion cards carry the same label, so this counts buttons INSIDE the
    // panel: with no query there are no results, and the suggestions below are a
    // separate list the panel does not own.
    expect(document.querySelectorAll('[data-testid^="same-suggestion-"]').length).toBeGreaterThan(0)
    expect(screen.queryByText(new RegExp(E.searchResults, 'i')), 'a results heading appeared with no query').toBeNull()
  })

  it('finds issues by id fragment', () => {
    mount()
    openSearch()
    search('EE-2600')
    expect(btns(LINK).length).toBeGreaterThan(0)
  })

  it('finds issues by title text, not only by id', () => {
    mount()
    openSearch()
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
    openSearch()

    /*
     * The positive control comes FIRST, in the same test. Without it this would
     * pass if search were broken outright and no result ever rendered — the
     * assertion below is an absence, and an absence proves nothing unless
     * presence has been demonstrated on the same instance.
     */
    search('EE-2600')
    expect(panelBtns(LINK).length, 'search returned nothing — the check below is vacuous').toBeGreaterThan(0)

    search(SUBJECT)
    expect(panelBtns(LINK), 'the edited issue offered itself').toHaveLength(0)
  })

  it('never offers an issue that is already linked', () => {
    mount(['EE-260023'])
    openSearch()
    search('EE-260023')
    // It appears in the linked list below, so the check is that it is not
    // offered as a RESULT — i.e. no Link button for it.
    expect(panelBtns(LINK), 'an already-linked issue was offered again').toHaveLength(0)
  })

  it('says so when nothing matches, quoting what was searched for', () => {
    mount()
    openSearch()
    search('zzzz-no-such-issue')
    expect(body()).toContain('zzzz-no-such-issue')
    expect(body()).toMatch(/no unlinked issue matches/i)
  })
})

describe('⚠️ LINKING IS GATED, AND THE CALLER NEVER SEES AN UNJUSTIFIED CHANGE', () => {
  const startLink = () => {
    mount()
    openSearch()
    search('EE-2600')
    fireEvent.click(btns(LINK)[0])
  }

  it('asks for a reason instead of linking immediately', () => {
    const spies = mount()
    openSearch()
    search('EE-2600')
    fireEvent.click(btns(LINK)[0])
    expect(spies.onLink, 'it linked before asking for a reason').not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: /justification for linking/i })).toBeTruthy()
  })

  it('refuses a reason below the floor, and still does not call through', () => {
    const spies = mount()
    openSearch()
    search('EE-2600')
    fireEvent.click(btns(LINK)[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for linking/i }), {
      target: { value: TOO_SHORT },
    })
    fireEvent.click(screen.getByRole('button', { name: /^confirm link$/i }))
    expect(spies.onLink, 'a below-floor reason reached the caller').not.toHaveBeenCalled()
  })

  it('calls through with the TRIMMED reason once it is accepted', () => {
    const spies = mount()
    openSearch()
    search('EE-2600')
    fireEvent.click(btns(LINK)[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for linking/i }), {
      target: { value: `   ${WHY}   ` },
    })
    fireEvent.click(screen.getByRole('button', { name: /^confirm link$/i }))
    expect(spies.onLink).toHaveBeenCalledTimes(1)
    expect(spies.onLink.mock.calls[0][1], 'the reason was not trimmed').toBe(WHY)
  })

  it('clears the query after a successful link', () => {
    mount()
    openSearch()
    search('EE-2600')
    fireEvent.click(btns(LINK)[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for linking/i }), {
      target: { value: WHY },
    })
    fireEvent.click(screen.getByRole('button', { name: /^confirm link$/i }))
    expect((searchBox() as HTMLInputElement).value).toBe('')
  })

  it('cancels back without linking', () => {
    const spies = mount()
    openSearch()
    search('EE-2600')
    fireEvent.click(btns(LINK)[0])
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
  /*
   * ⚠️ AN UNGROUPED LINKED ISSUE, DELIBERATELY. The first attempt used
   * `EE-260023`, which belongs to a group — so it renders as a GROUP card whose
   * control reads "Unlink from Issue Group", and whose `linked` is `every(member)`,
   * meaning one linked member shows the whole group as NOT linked.
   *
   * That is faithful: the canonical computes group linkage the same way
   * (`allIds.every(id => _linked.includes(id))`) and injects a manually-linked
   * member into the entry list regardless. But it means a grouped issue is the
   * wrong fixture for testing the standalone unlink control, and using it made a
   * correct component look broken.
   */
  const LINKED = 'ST-260002'

  it('asks for a reason instead of unlinking immediately', () => {
    const spies = mount([LINKED])
    expect(btns(UNLINK).length, 'the linked issue did not surface as a card').toBeGreaterThan(0)
    fireEvent.click(btns(UNLINK)[0])
    expect(spies.onUnlink, 'it unlinked before asking for a reason').not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: /justification for removing/i })).toBeTruthy()
  })

  it('refuses a below-floor reason', () => {
    const spies = mount([LINKED])
    fireEvent.click(btns(UNLINK)[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for removing/i }), {
      target: { value: TOO_SHORT },
    })
    fireEvent.click(screen.getByRole('button', { name: /^confirm removal$/i }))
    expect(spies.onUnlink).not.toHaveBeenCalled()
  })

  it('calls through once accepted', () => {
    const spies = mount([LINKED])
    fireEvent.click(btns(UNLINK)[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for removing/i }), {
      target: { value: WHY },
    })
    fireEvent.click(screen.getByRole('button', { name: /^confirm removal$/i }))
    expect(spies.onUnlink).toHaveBeenCalledWith(LINKED, WHY)
  })

  /*
   * ⚠️ THE MECHANISM THAT MAKES THAT POSSIBLE, pinned because it is the design's
   * and not obvious: a linked issue that does NOT rank is injected into the entry
   * list tagged "Manually linked". Without it, linking an issue with an unrelated
   * classification would make it vanish from this screen — visible in the count,
   * absent from the list, impossible to unlink here.
   */
  it('surfaces a linked issue that does not rank, tagged Manually linked', () => {
    mount([LINKED])
    expect(body()).toContain(LINKED)
    expect(body(), 'an unranked linked issue was not tagged').toContain(E.cardManuallyLinked)
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
    openSearch()
    search('EE-2600')
    const links = btns(LINK)
    expect(links.length, 'need two results to test replacement').toBeGreaterThan(1)

    fireEvent.click(links[0])
    fireEvent.change(screen.getByRole('textbox', { name: /justification for linking/i }), {
      target: { value: 'abandoned text that must not carry over' },
    })
    fireEvent.click(btns(LINK)[1])

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

  /*
   * ⚠️ HER EXPLICIT "No issues linked yet." IS GONE, and this test records the
   * replacement rather than the loss. It belonged to a linked LIST, which this
   * section does not have — linked issues appear as cards. "None" is now conveyed
   * by the header's count being absent, so that is what is asserted.
   */
  it('shows no linked count when nothing is linked', () => {
    mount()
    expect(body(), 'a linked count appeared with nothing linked').not.toMatch(/\d+\s+linked/)
  })

  it('and shows one as soon as something is', () => {
    // The control: without it the assertion above would pass on a section that
    // never renders a count at all.
    mount(['ST-260002'])
    expect(body()).toMatch(/1\s+linked/)
  })

  /*
   * ⚠️ A LINKED ID CAN OUTLIVE ITS ISSUE in this fixture, and the component says
   * so rather than rendering a blank row. Worth preserving: a blank row reads as a
   * rendering bug, and this is the state the link invariants were written after.
   */
  /*
   * ⚠️ SAME CAPABILITY, DIFFERENT WORDING. Hers rendered "Issue not found" inside
   * a linked row; there are no linked rows now, so an unresolvable id is named in
   * a notice instead. The capability is what mattered: the design's own injection
   * skips such ids silently (`const p = _pool.find(...); if (p)`), and this
   * fixture HAS them, so a silent skip would show fewer linked issues than the
   * count claims.
   */
  it('names a dangling linked id rather than dropping it silently', () => {
    mount(['ZZ-999999'])
    expect(body()).toContain('ZZ-999999')
    expect(body(), 'the unresolvable id was dropped without trace').toMatch(/not in this register/i)
  })
})

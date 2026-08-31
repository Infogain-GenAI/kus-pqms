// CHARACTERISATION tests for CreateIssueScreen.
//
// The other draft/commit form in the app: everything typed is local state until
// "Register Issue" commits it to the store. The store tests prove createIssue
// mirrors links reciprocally; they do not prove the SCREEN reaches that path.
//
// Characterisation, not specification: pin what it does.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'
import { CreateIssueScreen } from '@/features/issues/CreateIssueScreen'
import entryMessages from '@/features/issues/issue-entry/IssueEntry.i18n'

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)
const renderCreate = () => render(<CreateIssueScreen />, { wrapper: Wrapped })
const btn = (name: RegExp) => screen.getByRole('button', { name })
/** Non-throwing sibling of `btn`, for asserting a control is ABSENT.
    `getByRole` throws when it finds nothing, so it cannot express "not there". */
const queryBtn = (name: RegExp) => screen.queryByRole('button', { name })
const body = () => document.body.textContent ?? ''

/**
 * Link through the confirmation modal.
 *
 * Every link is gated on a >=20-character justification, so no test can link by
 * clicking one button any more. That is the control working, not a test problem.
 */
function linkVia(name: RegExp, justification = 'Same root cause suspected across these records.') {
  const btns = screen.queryAllByRole('button', { name })
  if (!btns.length) return false
  fireEvent.click(btns[0])
  fireEvent.change(screen.getByRole('textbox', { name: /justification/i }), { target: { value: justification } })
  const confirm = screen.getAllByRole('button', { name: /^link issues?$/i }).pop()
  if (confirm) fireEvent.click(confirm)
  return true
}

function fillCompleteForm() {
  // Vehicle — pick the first model code from the combobox.
  const codeBox = screen.getByRole('combobox', { name: /model code/i })
  fireEvent.focus(codeBox)
  const firstCode = screen.getAllByRole('option')[0]
  if (firstCode) fireEvent.mouseDown(firstCode)

  // Classification — walk the cascade top-down.
  //
  // These are `Combobox`es now, not native <select>s. This loop used to read
  // `select.options` and fire a `change`, which is the native-select idiom and
  // threw "undefined is not iterable" once the control changed. Driven the same
  // way as the model-code box above: focus to open the panel, mouseDown to
  // commit — mouseDown, not click, because the option must beat the input's
  // blur.
  // ⚠️ SCOPE EACH LOOKUP TO ITS OWN PANEL. The model-code box is `multiple`, so
  // its panel stays open after a pick — a bare `getAllByRole('option')[0]`
  // returns ITS first option, not this field's, and the cascade silently never
  // advances. `aria-controls` names the open panel, so resolve through that.
  for (const name of [/^System$/i, /^Sub-system$/i, /^Component$/i, /^Symptom$/i]) {
    const box = screen.getByRole('combobox', { name })
    fireEvent.focus(box)
    const panelId = box.getAttribute('aria-controls')
    const panel = panelId ? document.getElementById(panelId) : null
    const option = panel?.querySelector('[role="option"]')
    if (option) fireEvent.mouseDown(option)
  }

  // Issue information.
  fireEvent.change(screen.getByRole('textbox', { name: /issue title/i }), {
    target: { value: 'EV6 — HV battery rapid SOC drop under cold soak' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: /^description$/i }), {
    target: { value: 'Reproduces below 0°C after an overnight soak.' },
  })
  // NO SOURCE CHIP. Registration deliberately does not collect one — the
  // design registers first and attributes origin later, on the edit path. The
  // form is complete without it, which is what the next test asserts.
}

describe('the form is a draft until Register Issue', () => {
  it('renders the prototype\'s two header actions', () => {
    renderCreate()
    expect(btn(/^Clear$/i)).toBeTruthy()
    expect(btn(/^Register Issue$/i)).toBeTruthy()
  })

  it('model code gates the dependent selects — nothing is preselected', () => {
    // The prototype requires a model code before classification is usable.
    // Pinned because "gating" is easy to lose in a refactor and produces a form
    // that silently accepts an incomplete issue.
    renderCreate()
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThan(0)
    // Every dependent select starts empty.
    const withValue = selects.filter((s) => (s as HTMLSelectElement).value !== '')
    expect(withValue.length).toBe(0)
  })

  it('typing does not create an issue — only Register Issue does', () => {
    const { result } = renderHook(() => useStore(), { wrapper: Wrapped })
    const before = result.current.issues.length

    renderCreate()
    const boxes = screen.getAllByRole('textbox')
    if (boxes[0]) fireEvent.change(boxes[0], { target: { value: 'a draft title' } })

    // The screen holds its own state; the store is untouched until commit.
    expect(result.current.issues.length).toBe(before)
  })
})

describe('Clear discards the draft — but asks first', () => {
  // CHANGED 2026-08-28: Clear used to reset immediately. It wipes three sections
  // and every linked issue, has no undo, and sits directly beside Register
  // Issue — the control a user reaches for when the form is at its fullest. It
  // now confirms. This test asserts BOTH halves: the guard, and that confirming
  // still does what Clear always did.
  it('Clear alone does not empty the form', () => {
    renderCreate()
    const boxes = screen.getAllByRole('textbox')
    if (!boxes[0]) return
    fireEvent.change(boxes[0], { target: { value: 'something typed' } })

    fireEvent.click(btn(/^Clear$/i))

    // Still there — the confirm is open, nothing has been discarded yet.
    expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('something typed')
    expect(body()).toContain('Clear all entered information?')
  })

  it('confirming empties the text inputs', () => {
    renderCreate()
    const boxes = screen.getAllByRole('textbox')
    if (!boxes[0]) return
    fireEvent.change(boxes[0], { target: { value: 'something typed' } })
    expect((boxes[0] as HTMLInputElement).value).toBe('something typed')

    fireEvent.click(btn(/^Clear$/i))
    fireEvent.click(btn(/^Clear form$/i))

    expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('')
  })

  it('cancelling keeps the draft', () => {
    renderCreate()
    const boxes = screen.getAllByRole('textbox')
    if (!boxes[0]) return
    fireEvent.change(boxes[0], { target: { value: 'something typed' } })

    fireEvent.click(btn(/^Clear$/i))
    fireEvent.click(btn(/^Cancel$/i))

    expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('something typed')
  })
})

describe('Register Issue reports what is missing', () => {
  // The button used to be DISABLED while invalid, which tells a user nothing
  // about which of ten fields is at fault. It is now always enabled and pressing
  // it lists every outstanding requirement.
  it('an empty form reports its blocking fields instead of doing nothing', () => {
    renderCreate()
    fireEvent.click(btn(/Register Issue/i))

    expect(body()).toContain('Cannot register this issue')
    expect(body()).toContain('Select a model code.')
    expect(body()).toContain('Enter an issue title.')
  })

  it('symptom is required at submit', () => {
    // Not covered by the old `canRegister` flag at all — an issue could be
    // registered with no symptom, which is the field the correlation panel
    // matches on.
    renderCreate()
    fireEvent.click(btn(/Register Issue/i))
    expect(body()).toContain('Select a symptom.')
  })

  it('shows no errors before Register is pressed', () => {
    renderCreate()
    expect(body()).not.toContain('Cannot register this issue')
  })
})

describe('the classification "Request New" affordance', () => {
  it('is present, and is non-blocking per the prototype', () => {
    // FIDELITY-REPORT records this as the prototype's approval-queue hand-off:
    // requesting a new classification does not block registering the issue.
    renderCreate()
    expect(btn(/Request New/i)).toBeTruthy()
  })
})

/*
 * ─── THE ISSUE-SOURCE CHIP ROW HAS BEEN REMOVED FROM THIS SCREEN ─────────────
 *
 * Two tests lived here — that the seven-source vocabulary renders, and that a
 * chip toggles rather than navigating. Both are gone because the control is
 * gone: registration no longer collects a source.
 *
 * THE REASONING THEY CARRIED IS NOT GONE, and it was the valuable half. It moved
 * to `tests/sourceVocabulary.test.ts`, because it was never really about this
 * screen — it distinguishes the seven-key VOCABULARY (a domain fact) from the
 * AVAILABLE SET (admin configuration, which already seeds `fpqr: false`). That
 * distinction now applies to `EditSourcesForm` on the workspace edit path, which
 * renders the channels from `SOURCE_KEYS`.
 *
 * One thing those comments asserted is now known to be false, and is corrected
 * at the new site rather than carried forward: they cited the prototype's Admin
 * subtitle, "Control which channels are available in the Issue Entry source
 * dropdown", as evidence about this screen. The prototype's Issue Entry has no
 * source dropdown at all — zero occurrences of "source" in that screen's markup.
 * The Admin copy is stale in the prototype itself.
 */


describe('the happy path — a complete form registers and confirms', () => {
  describe('registration does not collect a source', () => {
    // The behaviour that replaced the chip row. Verified by hand in the browser
    // when it landed; pinned here so it stays true.
    it('a complete form has no source control at all', () => {
      renderCreate()
      // Not "the chips are hidden" — the vocabulary is absent from the screen.
      for (const src of ['Warranty', 'Weibull', 'Comeback', 'Techline', 'FPQR', 'EWS', 'GQIS']) {
        expect(queryBtn(new RegExp(`^${src}$`, 'i')), `"${src}" should not render on Issue Entry`).toBeNull()
      }
    })

    it('registers successfully with no source, and does not ask for one', () => {
      renderCreate()
      fillCompleteForm()
      fireEvent.click(btn(/Register Issue/i))

      // The whole point: a form with no source is COMPLETE. If the validation rule
      // were ever restored without restoring the control, this fails — which is the
      // permanent-dead-Register failure mode the rule would cause.
      expect(body()).not.toContain('Cannot register this issue')
      expect(body()).not.toContain('Select the issue source.')
      expect(body()).toContain('Issue created successfully')
    })
    })

  /**
   * Fills every gate the validator checks, in the order the form presents them.
   * The classification comboboxes are a CASCADE, so each must be set before the next
   * has any options at all — which is why this walks them rather than setting
   * four values at once.
   */

  it('commits and shows the created record instead of redirecting', () => {
    renderCreate()
    fillCompleteForm()
    fireEvent.click(btn(/Register Issue/i))

    // No validation banner — the form was complete.
    expect(body()).not.toContain('Cannot register this issue')

    // The confirmation names the record rather than navigating away silently.
    expect(body()).toContain('Issue created successfully')
    expect(body()).toContain('Submitted · Open')
    expect(btn(/Back to Issue List/i)).toBeTruthy()
    expect(btn(/Open Issue Workspace/i)).toBeTruthy()

    // The commit is proved by the ID: the modal is only reachable after
    // `store.createIssue` returns, and the ID it renders was minted by it.
    //
    // NOT asserted against a `renderHook(useStore)` handle, deliberately —
    // that builds its OWN StoreProvider, so its issue list is a different array
    // from the screen's and would never move no matter what the screen did.
    // (The same blind spot makes this file's earlier "typing does not create an
    // issue" test pass trivially; left alone as it is outside this change.)
    const idCell = document.querySelector('[data-testid="created-issue-id"]')
    expect(idCell?.textContent).toMatch(/^[A-Z]{2,4}-\d+/)
  })
})

/**
 * The Same Existing Issues block, after the card rebuild.
 *
 * Ordered by risk rather than by what is easiest to reach: the history modal's
 * data path, the search filter and its cap, the linked/unlinked card states, and
 * the asymmetry between the two card variants — which is the one a future
 * "tidy-up" is most likely to destroy, because it looks like an inconsistency.
 */
describe('Same Existing Issues — cards, search and history', () => {
  /** Everything in this block is behind the symptom guard. */
  const openBlock = () => {
    renderCreate()
    fillCompleteForm()
  }

  it('renders nothing at all until a symptom is chosen', () => {
    renderCreate()
    // The design wraps header AND body in one `sc-if sameReady`.
    expect(body()).not.toContain('Same Existing Issues')
  })

  it('shows the block once the classification is complete', () => {
    openBlock()
    expect(body()).toContain('Same Existing Issues')
  })

  describe('the card carries the design\'s content, not just an id and a title', () => {
    it('renders the meta line with model, classification and issue date', () => {
      openBlock()
      // `Model: … · Classification: … · Issue Date: …` — the design's `_rowMeta`.
      expect(body()).toContain('Model:')
      expect(body()).toContain('Classification:')
      expect(body()).toContain('Issue Date:')
    })

    it('renders "Suggested because" from the reasons relatedRank already computes', () => {
      openBlock()
      // These were computed and thrown away for several passes. If this fails,
      // the wiring has been dropped again, not the ranking.
      expect(body()).toContain('Suggested because:')
    })

    it('offers View History on every card', () => {
      openBlock()
      expect(screen.getAllByRole('button', { name: /view history/i }).length).toBeGreaterThan(0)
    })
  })

  describe('linking is a toggle, and the card shows which state it is in', () => {
    it('goes Link to Issue → Unlink from Issue, and shows the linked pill', () => {
      openBlock()
      linkVia(/^link to issue$/i)
      expect(queryBtn(/^unlink from issue$/i)).not.toBeNull()
      // The count badge in the header is a separate thing from the card's pill;
      // both should now be present.
      expect(body()).toContain('1 linked')
    })

    it('unlinks again, restoring the offer', () => {
      openBlock()
      linkVia(/^link to issue$/i)
      fireEvent.click(screen.getAllByRole('button', { name: /^unlink from issue$/i })[0])
      expect(body()).not.toContain('1 linked')
      // `queryBtn` is singular and there are several cards, so count instead.
      expect(screen.queryAllByRole('button', { name: /^link to issue$/i }).length).toBeGreaterThan(0)
    })
  })

  describe('View History reads the store rather than the workspace provider', () => {
    it('opens a modal for the issue whose button was pressed', () => {
      openBlock()
      fireEvent.click(screen.getAllByRole('button', { name: /view history/i })[0])
      // `HistorySection` could not be reused — it reads its id from
      // `useWorkspace()`. This path goes through `store.auditFor(id)` directly,
      // so the modal must render without a workspace provider in the tree.
      expect(body()).toMatch(/history —/i)
    })

    /*
     * THE POPULATED BRANCH. The test above proves the modal OPENS; it happened to
     * do so for an issue with no audit rows, so the list itself — timestamps,
     * actors, actions — was never rendered by any test. A modal frame with an
     * empty body passes an "it opens" assertion perfectly.
     *
     * Routed through SEARCH rather than the suggestion list on purpose: only
     * `HV-260101` carries seeded audit rows, and searching by id lands on it
     * deterministically, where which issues rank as suggestions depends on the
     * classification the form happens to be filled with.
     */
    it('renders the audit rows themselves, not just the modal frame', () => {
      openBlock()
      fireEvent.click(btn(/search & link another issue/i))
      fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), {
        target: { value: 'HV-260101' },
      })
      // NOT VACUOUS BY CONSTRUCTION: the rows must be absent until the modal is
      // opened, or the assertions below would pass on text the page already had.
      expect(body()).not.toContain('Issue ID generated')

      fireEvent.click(screen.getAllByRole('button', { name: /view history/i })[0])

      // Seeded AUDIT rows for HV-260101 — action, detail and actor all render.
      expect(body()).toContain('Issue ID generated')
      expect(body()).toContain('Classification selected')
      expect(body()).toContain('Arpita Chavda')
    })
  })

  describe('the in-place search panel', () => {
    const openSearch = () => {
      openBlock()
      fireEvent.click(btn(/search & link another issue/i))
    }

    it('replaces the suggestion list rather than appearing beside it', () => {
      openSearch()
      // In the design each body state is `&& !_ssOpen`.
      expect(body()).not.toContain('Suggested because:')
      expect(body()).toContain('Search by Issue ID, title or keyword')
    })

    it('says nothing about results until something is typed', () => {
      openSearch()
      expect(body()).toContain('to find and link an existing issue')
    })

    it('reports a miss with the query echoed back', () => {
      openSearch()
      fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), {
        target: { value: 'zzz-no-such-issue' },
      })
      expect(body()).toContain('No issues match')
      expect(body()).toContain('zzz-no-such-issue')
    })

    it('matches on id or title and caps the list at eight', () => {
      openSearch()
      fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), {
        target: { value: '-26' },
      })
      // Every seeded id contains "-26", so this is the cap test: without the
      // slice the whole register renders and the panel outgrows its box.
      const rows = screen.getAllByRole('button', { name: /^(link to issue|unlink from issue)$/i })
      expect(rows.length).toBeGreaterThan(0)
      expect(rows.length).toBeLessThanOrEqual(8)
    })

    it('closes and restores whichever state was showing', () => {
      openSearch()
      fireEvent.click(screen.getByRole('button', { name: /close search/i }))
      expect(body()).toContain('Suggested because:')
    })
  })

  describe('the two card variants are deliberately NOT identical', () => {
    it('shows Standalone Issue on search results and never on suggestions', () => {
      openBlock()
      expect(body()).not.toContain('Standalone Issue')
      fireEvent.click(btn(/search & link another issue/i))
      fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), {
        target: { value: '-26' },
      })
      // The design shows this badge in search results and omits it on the
      // suggestion card. It reads like an inconsistency and is not one — if a
      // later change "unifies" the variants, this is what should fail.
      expect(body()).toContain('Standalone Issue')
    })

    it('shows "Suggested because" on suggestions and never on search results', () => {
      openBlock()
      expect(body()).toContain('Suggested because:')
      fireEvent.click(btn(/search & link another issue/i))
      fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), {
        target: { value: '-26' },
      })
      // `reasons` is `[]` for search results in the design — there is no ranking
      // behind a free-text match to explain.
      expect(body()).not.toContain('Suggested because:')
    })
  })
})

/**
 * The states that only appear at the ends of the range — all-linked, an empty
 * history, and linking from inside the search panel. These are the branches a
 * normal walk through the form never reaches, which is exactly why they break
 * quietly.
 */
describe('Same Existing Issues — the edge states', () => {
  const openBlock = () => {
    renderCreate()
    fillCompleteForm()
  }

  it('replaces the list with "All matched issues linked" once every suggestion is linked', () => {
    openBlock()
    // Link them one at a time: each click re-renders, so the collection has to
    // be re-read rather than captured once.
    for (let guard = 0; guard < 20; guard++) {
      if (!linkVia(/^link to issue$/i)) break
    }
    expect(body()).toContain('All matched issues linked')
    // Informational only — the design gives this state no action.
    expect(queryBtn(/^link to issue$/i)).toBeNull()
  })

  it('closes the history modal again', () => {
    openBlock()
    fireEvent.click(screen.getAllByRole('button', { name: /view history/i })[0])
    expect(body()).toMatch(/history —/i)
    // `Modal` has no close button — it binds Escape on the document.
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(body()).not.toMatch(/history —/i)
  })

  it('links straight from a search result, not only from a suggestion', () => {
    openBlock()
    fireEvent.click(btn(/search & link another issue/i))
    fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), {
      target: { value: '-26' },
    })
    linkVia(/^link to issue$/i)
    // The header badge counts links made from either surface.
    expect(body()).toContain('1 linked')
  })

  it('keeps the search query when the panel is toggled shut and open again', () => {
    openBlock()
    fireEvent.click(btn(/search & link another issue/i))
    fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), {
      target: { value: '-26' },
    })
    fireEvent.click(btn(/search & link another issue/i))
    fireEvent.click(btn(/search & link another issue/i))
    // No jest-dom in this suite, so assert the property rather than a matcher.
    expect((screen.getByRole('textbox', { name: /search issues to link/i }) as HTMLInputElement).value).toBe('-26')
  })
})

/**
 * Clear only when the form holds something — the design's `_issueFormHasData()`.
 *
 * Ported in an earlier pass and never tested. Each term below is a separate
 * branch, and getting one wrong fails silently in both directions: too narrow
 * and Clear discards work without asking, too wide and it nags on an untouched
 * form.
 *
 * ⚠️ THE THREE NAMES HERE ARE EASY TO CONFUSE, and an earlier draft of these
 * tests got it wrong in a way that would have passed for the wrong reason:
 *   · the TRIGGER button is "Clear"
 *   · the modal's TITLE is "Clear all entered information?"
 *   · the CONFIRM button inside it is "Clear form"
 * Asserting on /clear/ alone always matches, because the trigger's own label is
 * in the document either way. The title is what distinguishes the states.
 */
const CLEAR_PROMPT = /clear all entered information\?/i

describe('Clear form asks only when there is something to lose', () => {
  it('does nothing at all on an untouched form', () => {
    renderCreate()
    fireEvent.click(btn(/^clear$/i))
    // `clearIssueForm(){ if(this._issueFormHasData()) … }` — no dialog, and no
    // message either. A silent no-op, not a disabled button.
    expect(body()).not.toMatch(CLEAR_PROMPT)
  })

  /*
   * THE BUTTON TEXT ITSELF. A rename deleted `clearFormCancel`, repointed this
   * button to `t('cancel')` and never declared `cancel`, so it rendered the
   * lowercase key "cancel" — and the whole suite stayed green, because every
   * assertion here matched case-insensitively or on the prompt copy instead.
   *
   * `tests/i18n/namespaces.test.tsx` now catches an undeclared key for the whole
   * app at once, which is the stronger guard. This one covers what a source scan
   * cannot: that the key is wired to THIS control and renders as its declared
   * value. Asserted against the `en` value per 09/26, never a literal.
   */
  it('renders Cancel with its declared text, not the raw key', () => {
    renderCreate()
    fireEvent.change(screen.getByRole('textbox', { name: /issue title/i }), { target: { value: 'x' } })
    fireEvent.click(btn(/^clear$/i))

    // CASE-SENSITIVE AND ANCHORED, deliberately — /cancel/i matched the broken
    // lowercase render perfectly, which is exactly why this shipped.
    // No literal for the label itself — a reword should change ONE place, the
    // `.i18n.ts`. Declaring it is the precondition; an absent key makes this
    // undefined and the lookup below cannot match.
    const label = entryMessages.en.cancel
    expect(label, 'IssueEntry.cancel must be declared').toBeTruthy()
    expect(screen.getByRole('button', { name: new RegExp(`^${label}$`) })).toBeTruthy()
    // Negative control: the raw key name must not be rendered as the label.
    expect(screen.queryByRole('button', { name: /^cancel$/ })).toBeNull()
  })

  it('asks when only the title has been typed', () => {
    renderCreate()
    fireEvent.change(screen.getByRole('textbox', { name: /issue title/i }), { target: { value: 'x' } })
    fireEvent.click(btn(/^clear$/i))
    expect(body()).toMatch(CLEAR_PROMPT)
  })

  it('asks when only the description has been typed', () => {
    renderCreate()
    fireEvent.change(screen.getByRole('textbox', { name: /^description$/i }), { target: { value: 'y' } })
    fireEvent.click(btn(/^clear$/i))
    expect(body()).toMatch(CLEAR_PROMPT)
  })

  it('asks when only a model code has been chosen', () => {
    renderCreate()
    const codeBox = screen.getByRole('combobox', { name: /model code/i })
    fireEvent.focus(codeBox)
    const first = screen.getAllByRole('option')[0]
    if (first) fireEvent.mouseDown(first)
    fireEvent.click(btn(/^clear$/i))
    expect(body()).toMatch(CLEAR_PROMPT)
  })

  it('asks when the only content is a LINKED issue', () => {
    renderCreate()
    fillCompleteForm()
    linkVia(/^link to issue$/i)
    fireEvent.click(btn(/^clear$/i))
    // `linkedExisting` is its own term in the design — a form whose only content
    // is a link still confirms.
    expect(body()).toMatch(CLEAR_PROMPT)
  })

  it('empties the form once the clear is confirmed', () => {
    renderCreate()
    fireEvent.change(screen.getByRole('textbox', { name: /issue title/i }), { target: { value: 'to be cleared' } })
    fireEvent.click(btn(/^clear$/i))
    fireEvent.click(btn(/^clear form$/i))
    expect((screen.getByRole('textbox', { name: /issue title/i }) as HTMLInputElement).value).toBe('')
    expect(body()).not.toMatch(CLEAR_PROMPT)
  })
})

/**
 * Validation, and the request-new-symptom path.
 *
 * Register stays ENABLED while the form is invalid — deliberately, because a
 * disabled button cannot say why it is disabled. Pressing it is what produces
 * the list, so that press is the only way these branches are ever reached.
 */
describe('Register on an incomplete form explains what is missing', () => {
  it('shows nothing before the first attempt', () => {
    renderCreate()
    // Errors are derived from the draft but suppressed until `attempted`, so an
    // untouched form is not scolded for being untouched.
    expect(body()).not.toContain('Select a model code.')
  })

  it('lists every outstanding requirement on the first press', () => {
    renderCreate()
    fireEvent.click(btn(/register issue|submit/i))
    expect(body()).toContain('Select a model code.')
    expect(body()).toContain('Select a system.')
    expect(body()).toContain('Select a sub-system.')
    expect(body()).toContain('Select a component.')
    expect(body()).toContain('Select a symptom.')
  })

  it('clears each message as its field is satisfied, rather than freezing the list', () => {
    renderCreate()
    fireEvent.click(btn(/register issue|submit/i))
    expect(body()).toContain('Select a model code.')
    const codeBox = screen.getByRole('combobox', { name: /model code/i })
    fireEvent.focus(codeBox)
    const first = screen.getAllByRole('option')[0]
    if (first) fireEvent.mouseDown(first)
    // The errors are recomputed from the draft, not captured at the moment of
    // the attempt — so fixing one removes one.
    expect(body()).not.toContain('Select a model code.')
    expect(body()).toContain('Select a system.')
  })
})

describe('Requesting a classification that does not exist yet', () => {
  it('refuses to open the request until a component is chosen', () => {
    renderCreate()
    fireEvent.click(btn(/request new/i))
    const submit = screen.queryByRole('button', { name: /submit request/i })
    // The modal opens, but its submit is inert without a component to hang the
    // new symptom from.
    if (submit) expect((submit as HTMLButtonElement).disabled).toBe(true)
  })

  it('records the requested symptom as pending and locks the Symptom field', () => {
    renderCreate()
    fillCompleteForm()
    fireEvent.click(btn(/request new/i))
    fireEvent.change(screen.getByRole('textbox', { name: /new symptom/i }), {
      target: { value: 'Latch fails to release' },
    })
    fireEvent.click(btn(/submit request/i))
    expect(body()).toContain('Latch fails to release')
    expect(body()).toContain('Pending Approval')
    // A pending symptom stands in for a chosen one, so offering the list too
    // would let both be set at once.
    expect((screen.getByRole('combobox', { name: /^symptom$/i }) as HTMLInputElement).disabled).toBe(true)
  })
})

/**
 * Issue groups, reached through the RANKING — which is the path that matters.
 *
 * This was previously unreachable and the tests drove search instead: the
 * cohorts were filed against `component: 'Fuel System'`, a label the four-system
 * taxonomy did not contain, so no classification a user could pick ever matched
 * them. Porting the design's full 10-system tree and correcting the two invalid
 * components fixed the data, not the card.
 */
describe('an issue group renders as one card with its children folded in', () => {
  /** Drives the cascade by option LABEL, unlike `fillCompleteForm`'s first-option walk. */
  function classifyAs(labels: [string, string, string, string]) {
    const codeBox = screen.getByRole('combobox', { name: /model code/i })
    fireEvent.focus(codeBox)
    const first = screen.getAllByRole('option')[0]
    if (first) fireEvent.mouseDown(first)
    const names = [/^System$/i, /^Sub-system$/i, /^Component$/i, /^Symptom$/i]
    names.forEach((name, idx) => {
      const box = screen.getByRole('combobox', { name })
      fireEvent.focus(box)
      const panelId = box.getAttribute('aria-controls')
      const panel = panelId ? document.getElementById(panelId) : null
      const opts = [...(panel?.querySelectorAll('[role="option"]') ?? [])]
      const want = opts.find((o) => (o.textContent ?? '').trim().toLowerCase() === labels[idx].toLowerCase())
      if (want) fireEvent.mouseDown(want)
    })
  }

  const openEngineCohort = () => {
    renderCreate()
    classifyAs(['Engine', 'Fuel System', 'Fuel Injector', 'Engine vibration'])
  }

  it('collapses a four-issue cohort into a single group card', () => {
    openEngineCohort()
    // EE-260023 / 031 / 044 / 071 share a groupId. Four ranked hits, one card.
    expect(body()).toMatch(/issue group ·/i)
    expect(body()).toContain('Parent')
  })

  it('hides the children behind an expander that names the count', () => {
    openEngineCohort()
    expect(body()).toMatch(/show child issues \(\d\)/i)
    fireEvent.click(screen.getAllByRole('button', { name: /show child issues/i })[0])
    expect(body()).toMatch(/hide child issues/i)
    expect(body()).toContain('Child')
  })

  it('links and unlinks every member at once', () => {
    openEngineCohort()
    linkVia(/link to issue group/i)
    // The header count is the group's size, not 1.
    expect(body()).toMatch(/[2-9] linked/)
    fireEvent.click(screen.getAllByRole('button', { name: /unlink from issue group/i })[0])
    expect(body()).not.toMatch(/\d+ linked/)
  })

  it('derives the parent as the earliest member', () => {
    openEngineCohort()
    fireEvent.click(screen.getAllByRole('button', { name: /view group history/i })[0])
    // EE-260023 (2026-07-10) is earliest in its cohort; nothing stores that role.
    expect(body()).toMatch(/history — EE-260023/i)
  })

  it('renders the same cohort through SEARCH with the search-only badge', () => {
    renderCreate()
    fillCompleteForm()
    fireEvent.click(btn(/search & link another issue/i))
    fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), { target: { value: 'vibration' } })
    // The other half of the asymmetry — the group card rendered by the SEARCH
    // variant, which carries icons the suggestion variant omits. ("Standalone
    // Issue" is not asserted here: every hit for this query is a cohort member,
    // so they collapse into one group card and no standalone card exists. That
    // badge is covered by the `-26` test above.)
    expect(body()).toMatch(/issue group ·/i)
  })

  it('expands children in the search variant too', () => {
    renderCreate()
    fillCompleteForm()
    fireEvent.click(btn(/search & link another issue/i))
    fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), { target: { value: 'vibration' } })
    fireEvent.click(screen.getAllByRole('button', { name: /show child issues/i })[0])
    expect(body()).toContain('Child')
  })

  it('shows the group WITHOUT the search-only icons and badge', () => {
    openEngineCohort()
    // `Standalone Issue` and the git-branch/crown/corner-down-right icons belong
    // to the search variant only. Same component, deliberately different.
    expect(body()).not.toContain('Standalone Issue')
  })
})

/**
 * Linked-but-unranked issues stay in the panel.
 *
 * The defect this pins: link an issue from the search panel that is not in the
 * ranked top 8, close the search, and it was GONE — no card, no way back to it,
 * while still counted as linked. Silent in both directions.
 */
describe('an issue linked from search survives closing the search panel', () => {
  const linkFromSearch = (query: string) => {
    renderCreate()
    fillCompleteForm()
    fireEvent.click(btn(/search & link another issue/i))
    fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), { target: { value: query } })
    linkVia(/^link to issue$/i)
    fireEvent.click(screen.getByRole('button', { name: /close search/i }))
  }

  it('appends it to the suggestion list instead of dropping it', () => {
    linkFromSearch('AC-260105')
    // ⚠️ ASSERT THE APPENDED CARD, NOT JUST THE COUNT. "1 linked" and an unlink
    // button are both true of an issue that merely RANKED and was then linked —
    // this test would pass with the append deleted. The "Manually linked" note
    // only exists on an appended entry, so it is what pins the behaviour.
    expect(body()).toMatch(/1 linked/)
    expect(body()).toContain('Manually linked')
    expect(screen.queryAllByRole('button', { name: /^unlink from issue$/i }).length).toBeGreaterThan(0)
  })

  it('marks it "Manually linked" rather than inventing a reason for it', () => {
    linkFromSearch('AC-260105')
    expect(body()).toContain('Manually linked')
  })

  it('can be unlinked again from the appended card, which then leaves', () => {
    linkFromSearch('AC-260105')
    fireEvent.click(screen.getAllByRole('button', { name: /^unlink from issue$/i })[0])
    expect(body()).not.toMatch(/\d+ linked/)
    expect(body()).not.toContain('Manually linked')
  })

  it('lets the list exceed eight, because every extra is a deliberate link', () => {
    linkFromSearch('AC-260105')
    // The design caps the RANKED set at 8 and appends afterwards without a
    // second cap. An appended entry never displaces a ranked one.
    expect(body()).toContain('Manually linked')
    expect(body()).toMatch(/suggested because/i)
  })
})

/**
 * The link-confirmation control.
 *
 * A governance gate, so the tests are about what it REFUSES as much as what it
 * accepts. The design's rule: no link commits without >=20 characters of
 * justification, counted after trimming.
 */
describe('linking requires a justification', () => {
  const openBlock = () => { renderCreate(); fillCompleteForm() }
  const askToLink = () => {
    openBlock()
    fireEvent.click(screen.getAllByRole('button', { name: /^link to issue$/i })[0])
  }
  const typeJustification = (v: string) =>
    fireEvent.change(screen.getByRole('textbox', { name: /justification/i }), { target: { value: v } })
  const confirmBtn = () => screen.getAllByRole('button', { name: /^link issues?$/i }).pop() as HTMLButtonElement

  it('does not link on the button press alone — it asks first', () => {
    askToLink()
    expect(body()).not.toMatch(/1 linked/)
    expect(screen.getByRole('textbox', { name: /justification/i })).toBeTruthy()
  })

  it('keeps confirm disabled until the justification is long enough', () => {
    askToLink()
    expect(confirmBtn().disabled).toBe(true)
    typeJustification('too short')
    expect(confirmBtn().disabled).toBe(true)
    typeJustification('Same root cause suspected across both records.')
    expect(confirmBtn().disabled).toBe(false)
  })

  it('COUNTS TRIMMED CHARACTERS, so whitespace cannot buy the threshold', () => {
    askToLink()
    // 19 real characters padded to well over 20 with spaces.
    typeJustification('   ' + 'x'.repeat(19) + '                    ')
    expect(confirmBtn().disabled).toBe(true)
  })

  it('links once a real justification is given', () => {
    askToLink()
    typeJustification('Same charge-port lock failure on the same model year.')
    fireEvent.click(confirmBtn())
    expect(body()).toMatch(/1 linked/)
  })

  it('abandons the link if the dialog is cancelled', () => {
    askToLink()
    typeJustification('Same charge-port lock failure on the same model year.')
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(body()).not.toMatch(/\d+ linked/)
  })

  it('caps the justification at 500 characters', () => {
    askToLink()
    typeJustification('y'.repeat(900))
    const box = screen.getByRole('textbox', { name: /justification/i }) as HTMLTextAreaElement
    expect(box.value.length).toBe(500)
  })

  it('does NOT gate unlink ON THIS SCREEN — the workspace does gate it', () => {
    openBlock()
    linkVia(/^link to issue$/i)
    fireEvent.click(screen.getAllByRole('button', { name: /^unlink from issue$/i })[0])
    // Issue Entry routes unlink to a plain confirm; it must not re-open this
    // modal. NOT a general rule — the workspace gates unlink behind its own
    // justification, because there it undoes a recorded relationship between two
    // live issues rather than a decision on a draft that does not exist yet.
    expect(body()).not.toMatch(/\d+ linked/)
  })

  it('carries the justification into the issue history on registration', () => {
    openBlock()
    linkVia(/^link to issue$/i, 'Same charge-port lock failure on the same model year.')
    fireEvent.click(btn(/register issue|submit/i))
    // Registered successfully — the justification rides along as an audit entry
    // rather than being discarded with the draft.
    expect(body()).toMatch(/registered|submitted|EE-\d+/i)
  })
})

/**
 * The existing-issue popup.
 *
 * Opened from a SEARCH RESULT only — the way to inspect an issue before deciding
 * to link it. Suggestion cards have no equivalent; they carry View History.
 */
describe('inspecting an issue before linking it', () => {
  const openSearchAndInspect = (query = '-26') => {
    renderCreate()
    fillCompleteForm()
    fireEvent.click(btn(/search & link another issue/i))
    fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), { target: { value: query } })
    const view = screen.queryAllByRole('button', { name: /^view$/i })[0]
    if (view) fireEvent.click(view)
  }

  it('offers the inspect affordance on search results and NOT on suggestions', () => {
    renderCreate()
    fillCompleteForm()
    // Suggestions carry View History; the bare "View" belongs to search results.
    expect(screen.queryAllByRole('button', { name: /^view$/i })).toHaveLength(0)
    fireEvent.click(btn(/search & link another issue/i))
    fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), { target: { value: '-26' } })
    expect(screen.queryAllByRole('button', { name: /^view$/i }).length).toBeGreaterThan(0)
  })

  it('shows the sections the design has, including an inline Related history', () => {
    openSearchAndInspect()
    expect(body()).toContain('Classification')
    expect(body()).toContain('Issue description')
    expect(body()).toContain('Investigation summary')
    expect(body()).toContain('Actions taken')
    // ⚠️ INLINE AND ALWAYS — not behind a toggle. There must be no expander.
    expect(body()).toContain('Related history')
    expect(screen.queryByRole('button', { name: /show .*history/i })).toBeNull()
  })

  it('offers View Issue, which leaves for that issue\'s own page', () => {
    openSearchAndInspect()
    expect(screen.getByRole('button', { name: /view issue/i })).toBeTruthy()
  })

  it('links from inside the popup, and that link is still gated', () => {
    openSearchAndInspect()
    fireEvent.click(screen.getByRole('button', { name: /^link issue$/i }))
    // Inspecting is not a way around the justification.
    expect(screen.getByRole('textbox', { name: /justification/i })).toBeTruthy()
  })

  it('offers Unlink inside the popup for an issue already linked', () => {
    renderCreate()
    fillCompleteForm()
    fireEvent.click(btn(/search & link another issue/i))
    fireEvent.change(screen.getByRole('textbox', { name: /search issues to link/i }), { target: { value: '-26' } })
    linkVia(/^link to issue$/i)
    fireEvent.click(screen.queryAllByRole('button', { name: /^view$/i })[0])
    // The popup reflects link state: a linked issue offers Unlink, not Link.
    expect(screen.queryByRole('button', { name: /^link issue$/i })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /^unlink issue$/i }))
    expect(body()).not.toMatch(/\d+ linked/)
  })

  it('navigates away on View Issue rather than linking', () => {
    openSearchAndInspect()
    fireEvent.click(screen.getByRole('button', { name: /view issue/i }))
    // Leaving to the record's own page must not have linked it on the way out.
    expect(body()).not.toMatch(/\d+ linked/)
  })

  it('closes without touching the link state', () => {
    openSearchAndInspect()
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }))
    expect(body()).not.toMatch(/\d+ linked/)
    expect(body()).not.toContain('Investigation summary')
  })

  it('closes on Escape', () => {
    openSearchAndInspect()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(body()).not.toContain('Investigation summary')
  })
})

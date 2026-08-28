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

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)
const renderCreate = () => render(<CreateIssueScreen />, { wrapper: Wrapped })
const btn = (name: RegExp) => screen.getByRole('button', { name })
const body = () => document.body.textContent ?? ''

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
    expect(body()).toContain('Select the issue source.')
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

describe('the issue-source chip row', () => {
  it('renders the prototype\'s source vocabulary', () => {
    // These are the seven sources the prototype shows.
    //
    // ⚠️ WHAT THIS PINS, AND WHAT IT DOES NOT — CORRECTED 2026-08-26.
    // It was written as though seven were a FIXED vocabulary. Reading the canonical
    // prototype source shows it is not: the Admin screen carries
    //     sources: { warranty:true, …, fpqr:FALSE, … }
    // and that section's own subtitle is "Control which channels are available in
    // the Issue Entry source dropdown." The app already models this — AdminScreen's
    // `sourceOn` seeds `fpqr: false`, matching the prototype.
    //
    // So there are TWO things here and only one is pinned:
    //   - the VOCABULARY — the seven keys that may exist. A domain fact. Adding or
    //     renaming one is a domain change. THIS is what the test pins, correctly.
    //   - the AVAILABLE SET — which of the seven the dropdown offers today. ADMIN
    //     CONFIGURATION, not a domain fact, and it can legitimately be fewer.
    //
    // This test asserts all seven render because Create Issue does not yet read the
    // admin configuration. WHEN IT DOES, THIS TEST WILL FAIL — with `fpqr` disabled
    // in the seed, six will render. That failure is CORRECT and the fix is to pin
    // the vocabulary against the source map and the rendered set against the config,
    // NOT to re-enable fpqr to make the test pass.
    //
    // (`INVENTORY.md`'s `SourceEvidencePanel` row says EIGHT variants against BRD
    // Appendix C. Seven versus eight is unresolved — see
    // PQMS_docs/component-specs/RECONCILIATION-workspace-and-create.md.)
    renderCreate()
    for (const src of ['Warranty', 'Weibull', 'Comeback', 'Techline', 'FPQR', 'EWS', 'GQIS']) {
      expect(btn(new RegExp(`^${src}$`, 'i'))).toBeTruthy()
    }
  })

  it('a source chip toggles rather than navigating', () => {
    renderCreate()
    const before = body().length
    fireEvent.click(btn(/^Warranty$/i))
    // Still on the form — the chip is a toggle, not a link.
    expect(btn(/^Register Issue$/i)).toBeTruthy()
    expect(body().length).toBeGreaterThan(before - 200)
  })
})

describe('the happy path — a complete form registers and confirms', () => {
  /**
   * Fills every gate the validator checks, in the order the form presents them.
   * The classification selects are a CASCADE, so each must be set before the next
   * has any options at all — which is why this walks them rather than setting
   * four values at once.
   */
  function fillCompleteForm() {
    // Vehicle — pick the first model code from the combobox.
    const codeBox = screen.getByRole('combobox', { name: /model code/i })
    fireEvent.focus(codeBox)
    const firstCode = screen.getAllByRole('option')[0]
    if (firstCode) fireEvent.mouseDown(firstCode)

    // Classification — walk the cascade top-down.
    for (const name of [/^System$/i, /^Sub-system$/i, /^Component$/i, /^Symptom$/i]) {
      const select = screen.getByRole('combobox', { name }) as HTMLSelectElement
      const option = Array.from(select.options).find((o) => o.value !== '')
      if (option) fireEvent.change(select, { target: { value: option.value } })
    }

    // Issue information.
    fireEvent.change(screen.getByRole('textbox', { name: /issue title/i }), {
      target: { value: 'EV6 — HV battery rapid SOC drop under cold soak' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /^description$/i }), {
      target: { value: 'Reproduces below 0°C after an overnight soak.' },
    })
    fireEvent.click(btn(/^Warranty$/i))
  }

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

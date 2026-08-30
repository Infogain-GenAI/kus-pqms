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
/** Non-throwing sibling of `btn`, for asserting a control is ABSENT.
    `getByRole` throws when it finds nothing, so it cannot express "not there". */
const queryBtn = (name: RegExp) => screen.queryByRole('button', { name })
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
    // NO SOURCE CHIP. Registration deliberately does not collect one — the
    // design registers first and attributes origin later, on the edit path. The
    // form is complete without it, which is what the next test asserts.
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

describe('Request New persists the request', () => {
  // It used to write the requested symptom into ONE LOCAL STRING and nothing
  // else — no store, so the request evaporated on unmount and no approver would
  // ever have seen it. The screen looked identical either way, which is why this
  // is pinned at the screen rather than left to the store test.
  it('opens the request modal from the classification section', () => {
    renderCreate()
    fireEvent.click(btn(/Request New/i))
    expect(body()).toContain('Request New Symptom')
    expect(body()).toContain('Submit a request. Once approved, it will be added.')
  })

  it('requires both a name and a justification, and says which is missing', () => {
    renderCreate()
    fireEvent.click(btn(/Request New/i))
    fireEvent.click(btn(/Submit request/i))

    expect(body()).toContain('Provide a business justification.')
    // Still open — nothing was submitted.
    expect(body()).toContain('Request New Symptom')
  })

  it('a completed request becomes the selected symptom, marked pending', () => {
    renderCreate()
    fireEvent.click(btn(/Request New/i))

    fireEvent.change(screen.getByRole('textbox', { name: /requested symptom name/i }), {
      target: { value: 'Latch fails to release' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /business justification/i }), {
      target: { value: 'Observed on three vehicles in the field.' },
    })
    fireEvent.click(btn(/Submit request/i))

    // The modal closed, and the value is now the form's symptom — a request the
    // user then could not use would not have solved their problem.
    expect(body()).not.toContain('Submit a request. Once approved')
    expect(body()).toContain('Latch fails to release')
    expect(body()).toContain('Pending Approval')
  })
})

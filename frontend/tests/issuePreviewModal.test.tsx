// Tests for the existing-issue preview modal.
//
// ─── THE POINT OF THE FEATURE, AND THEREFORE OF THESE TESTS ──────────────────
//
// Issue Entry's "Same Existing Issues" panel already had a Preview button. It
// called `nav('/issues/' + id)` — it navigated AWAY, unmounting the entry form
// and destroying whatever the user had typed. So the headline test here is not
// "the modal renders": it is that the draft is still there afterwards.
//
// That test is written against the SCREEN, not the modal, because the defect was
// never in a component — it was in what a button did to the screen around it.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { CreateIssueScreen } from '@/features/issues/CreateIssueScreen'
import { IssueExistingPreviewModal } from '@/features/issues/IssueExistingPreviewModal'
import { ISSUES } from '@/data/seed'

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)

/** HV-260101 is the one seeded issue with an audit trail — see seed.ts. */
const WITH_HISTORY = ISSUES.find((i) => i.id === 'HV-260101')!
const ESCALATED = ISSUES.find((i) => i.status === 'escalated')!
const PLAIN = ISSUES.find((i) => i.id !== WITH_HISTORY.id && i.status !== 'escalated')!

const renderModal = (issue = WITH_HISTORY, linked = false, on: Partial<Record<'link' | 'unlink' | 'close', () => void>> = {}) =>
  render(
    <IssueExistingPreviewModal
      issue={issue}
      linked={linked}
      onClose={on.close ?? (() => {})}
      onLink={on.link ?? (() => {})}
      onUnlink={on.unlink ?? (() => {})}
    />,
    { wrapper: Wrapped },
  )

describe('it shows the issue being considered', () => {
  it('renders nothing at all when there is no issue', () => {
    const { container } = render(
      <IssueExistingPreviewModal issue={null} linked={false} onClose={() => {}} onLink={() => {}} onUnlink={() => {}} />,
      { wrapper: Wrapped },
    )
    expect(container.querySelector('[data-testid="issue-preview-modal"]')).toBeNull()
  })

  it('shows the id, title and model so the user can tell the issues apart', () => {
    renderModal()
    const body = document.body.textContent ?? ''
    expect(body).toContain(WITH_HISTORY.id)
    expect(body).toContain(WITH_HISTORY.title)
    expect(body).toContain(WITH_HISTORY.model)
  })

  it('shows the classification path — the field being compared against', () => {
    renderModal()
    const expected = [WITH_HISTORY.system, WITH_HISTORY.subSystem, WITH_HISTORY.component].filter(Boolean).join(' · ')
    expect(document.body.textContent).toContain(expected)
  })

  it('shows the related history from the audit trail', () => {
    renderModal(WITH_HISTORY)
    expect(document.body.textContent).toContain('Issue record created')
  })

  it('says so plainly when there is no history, rather than showing an empty list', () => {
    renderModal(PLAIN)
    expect(document.body.textContent).toContain('Nothing has been recorded against this issue yet.')
  })
})

describe('it does not invent data it does not have', () => {
  // The section this guards is the one where a fabricated value would do the
  // most damage: someone is deciding whether two issues are the same defect.
  it('omits Investigation and Actions when no activity has been recorded', () => {
    renderModal(PLAIN)
    const body = document.body.textContent ?? ''
    expect(body).not.toContain('Investigation summary')
    expect(body).not.toContain('Actions taken')
  })

  it('shows the QIR block only for an escalated issue', () => {
    renderModal(PLAIN)
    expect(document.body.textContent).not.toContain('QIR summary')
  })

  it('shows the QIR block for an escalated issue — WITHOUT a fabricated QIR id', () => {
    // Vue's modal shows a QIR id, status and summary from its fixture. This app
    // has no QIR record for an escalated issue, so the block reports the
    // hand-off and links to QIR Management. A made-up `QIR-xxxxx` printed beside
    // a real issue id would be read as fact.
    renderModal(ESCALATED)
    const body = document.body.textContent ?? ''
    expect(body).toContain('QIR summary')
    expect(body).toContain('QIR hand-off recorded')
    expect(body).not.toMatch(/QIR-\d/)
  })
})

describe('linking from inside the preview', () => {
  it('offers Link for an unlinked issue and reports it to the caller', () => {
    const linked: string[] = []
    renderModal(WITH_HISTORY, false, { link: () => linked.push(WITH_HISTORY.id) })

    expect(screen.getByTestId('preview-toggle-link').textContent).toContain('Link issue')
    fireEvent.click(screen.getByTestId('preview-toggle-link'))
    expect(linked).toEqual([WITH_HISTORY.id])
  })

  it('offers Unlink instead, and says it is Linked, when it already is', () => {
    const unlinked: string[] = []
    renderModal(WITH_HISTORY, true, { unlink: () => unlinked.push(WITH_HISTORY.id) })

    expect(document.body.textContent).toContain('Linked')
    expect(screen.getByTestId('preview-toggle-link').textContent).toContain('Unlink issue')
    fireEvent.click(screen.getByTestId('preview-toggle-link'))
    expect(unlinked).toEqual([WITH_HISTORY.id])
  })

  it('closes after linking — the decision it exists for has been made', () => {
    let closed = false
    renderModal(WITH_HISTORY, false, { close: () => { closed = true } })
    fireEvent.click(screen.getByTestId('preview-toggle-link'))
    expect(closed).toBe(true)
  })

  it('does NOT close when opening the issue in a new tab', () => {
    // Looking something up alongside the decision is not the same as finishing
    // with it. Vue is explicit about this distinction and it is worth pinning.
    let closed = false
    const realOpen = window.open
    window.open = (() => null) as typeof window.open
    try {
      renderModal(WITH_HISTORY, false, { close: () => { closed = true } })
      fireEvent.click(screen.getByTestId('preview-view-issue'))
      expect(closed).toBe(false)
    } finally {
      window.open = realOpen
    }
  })

  it('opens the issue in a NEW tab, never navigating this one', () => {
    const calls: unknown[][] = []
    const realOpen = window.open
    window.open = ((...args: unknown[]) => { calls.push(args); return null }) as unknown as typeof window.open
    try {
      renderModal(WITH_HISTORY)
      fireEvent.click(screen.getByTestId('preview-view-issue'))
      expect(calls).toHaveLength(1)
      expect(String(calls[0][0])).toContain(`/issues/${WITH_HISTORY.id}`)
      expect(calls[0][1]).toBe('_blank')
      // `noopener` matters: without it the opened tab gets a handle back to this
      // one through window.opener.
      expect(calls[0][2]).toBe('noopener')
    } finally {
      window.open = realOpen
    }
  })
})

// ─── The regression the feature exists for ────────────────────────────────────

/**
 * Selects a model code through the real combobox.
 *
 * ⚠️ REQUIRED BEFORE TOUCHING THE CLASSIFICATION SELECTS, and this was learned
 * the hard way: those four selects are `disabled` until a model code is chosen
 * ("Select a Model Code in Vehicle information to enable classification").
 * `fireEvent.change` fires on a disabled `<select>` anyway, so an earlier
 * version of these tests drove controls a real user cannot reach and still went
 * green — the browser is what caught it. Driving the form in the order a user
 * must is the only way these tests describe reachable behaviour.
 */
function pickModelCode() {
  const combo = screen.getAllByRole('combobox')[0]
  fireEvent.focus(combo)
  const option = screen.getAllByRole('option')[0]
  fireEvent.mouseDown(option)
}

describe('REGRESSION — Preview destroyed the draft', () => {
  /** Fills enough of the entry form that suggestions appear, and returns the title used. */
  const fillDraft = () => {
    const title = 'Draft that must survive a preview'
    fireEvent.change(screen.getByLabelText(/^Issue Title/i), { target: { value: title } })
    return title
  }

  it('keeps what the user typed when a preview is opened', async () => {
    render(<CreateIssueScreen />, { wrapper: Wrapped })
    const title = fillDraft()

    // Reach a Preview button. The panel needs a symptom before it lists
    // candidates, so drive the classification cascade the way a user would.
    fireEvent.change(screen.getByLabelText(/^System$/i), {
      target: { value: (screen.getByLabelText(/^System$/i) as HTMLSelectElement).options[1].value },
    })
    fireEvent.change(screen.getByLabelText(/^Sub-system$/i), {
      target: { value: (screen.getByLabelText(/^Sub-system$/i) as HTMLSelectElement).options[1].value },
    })
    fireEvent.change(screen.getByLabelText(/^Component$/i), {
      target: { value: (screen.getByLabelText(/^Component$/i) as HTMLSelectElement).options[1].value },
    })
    fireEvent.change(screen.getByLabelText(/^Symptom$/i), {
      target: { value: (screen.getByLabelText(/^Symptom$/i) as HTMLSelectElement).options[1].value },
    })

    const preview = await waitFor(() => {
      const btns = screen.getAllByRole('button', { name: /^Preview$/ })
      expect(btns.length).toBeGreaterThan(0)
      return btns[0]
    })

    fireEvent.click(preview)

    // The modal is open…
    await waitFor(() => expect(screen.getByTestId('issue-preview-modal')).toBeTruthy())
    // …AND the form is still mounted with the draft intact. This is the whole
    // test: before the fix, navigating away unmounted the screen and this input
    // did not exist to be queried.
    expect((screen.getByLabelText(/^Issue Title/i) as HTMLInputElement).value).toBe(title)
  })
})

describe('the two ways to link agree with each other', () => {
  /** Drives the classification cascade until the suggestions panel has rows. */
  const reachSuggestions = async () => {
    pickModelCode()
    for (const label of [/^System$/i, /^Sub-system$/i, /^Component$/i, /^Symptom$/i]) {
      const sel = screen.getByLabelText(label) as HTMLSelectElement
      fireEvent.change(sel, { target: { value: sel.options[1].value } })
    }
    return await waitFor(() => {
      const btns = screen.getAllByRole('button', { name: /^Preview$/ })
      expect(btns.length).toBeGreaterThan(0)
      return btns[0]
    })
  }

  it('linking inside the modal updates the panel behind it', async () => {
    // The modal and the panel row write to the same `linkedIds`. If they had
    // separate state, the row would still say "Link" after the modal linked it.
    render(<CreateIssueScreen />, { wrapper: Wrapped })
    const preview = await reachSuggestions()

    const linkedBefore = screen.queryAllByRole('button', { name: /^Linked$/ }).length
    fireEvent.click(preview)
    await waitFor(() => expect(screen.getByTestId('issue-preview-modal')).toBeTruthy())

    fireEvent.click(screen.getByTestId('preview-toggle-link'))

    // The modal closed, and the panel row now reports the issue as linked.
    await waitFor(() => expect(screen.queryByTestId('issue-preview-modal')).toBeNull())
    await waitFor(() =>
      expect(screen.queryAllByRole('button', { name: /^Linked$/ }).length).toBe(linkedBefore + 1),
    )
  })

  it('reopening the preview for a linked issue offers Unlink, and unlinking works', async () => {
    render(<CreateIssueScreen />, { wrapper: Wrapped })
    const preview = await reachSuggestions()

    fireEvent.click(preview)
    await waitFor(() => expect(screen.getByTestId('issue-preview-modal')).toBeTruthy())
    fireEvent.click(screen.getByTestId('preview-toggle-link'))
    await waitFor(() => expect(screen.queryByTestId('issue-preview-modal')).toBeNull())

    // Reopen the SAME row — the modal must now know it is linked.
    fireEvent.click(screen.getAllByRole('button', { name: /^Preview$/ })[0])
    await waitFor(() => expect(screen.getByTestId('issue-preview-modal')).toBeTruthy())
    expect(screen.getByTestId('preview-toggle-link').textContent).toContain('Unlink issue')

    fireEvent.click(screen.getByTestId('preview-toggle-link'))
    await waitFor(() => expect(screen.queryAllByRole('button', { name: /^Linked$/ }).length).toBe(0))
  })

  it('closing the preview leaves the link state alone', async () => {
    render(<CreateIssueScreen />, { wrapper: Wrapped })
    const preview = await reachSuggestions()

    fireEvent.click(preview)
    await waitFor(() => expect(screen.getByTestId('issue-preview-modal')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /^Close$/ }))

    await waitFor(() => expect(screen.queryByTestId('issue-preview-modal')).toBeNull())
    expect(screen.queryAllByRole('button', { name: /^Linked$/ }).length).toBe(0)
  })
})

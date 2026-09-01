// The workspace's gated unlink of a SYMMETRIC link.
//
// ─── WHY THIS SURFACE EXISTS ────────────────────────────────────────────────
//
// `ExistingIssueModal` was written with an `unlinkSlot` prop and, until now,
// nothing passed one — a dead extension point. This is it being used: the
// workspace lists an issue's linked issues, and inspecting one offers an unlink
// GATED behind a mandatory justification.
//
// ⚠️ THE ASYMMETRY IS THE POINT. On Issue Entry unlink is immediate — the issue
// does not exist yet, so removing a link discards a draft decision with nothing
// to audit. Here it undoes a recorded relationship between two live issues, so
// it must record why. A test that only proved the popup opens would miss the
// whole governance claim.
//
// ⚠️ TWO LEVELS, DELIBERATELY. The boundary cases drive the modal DIRECTLY,
// because they are about the gate's arithmetic and a route-tree mount for each
// would cost a lazy compile to prove nothing extra. The last block drives the
// REAL ROUTE TREE, because the row → popup wiring is the part that was broken.
//
// That split only became possible with the seed: every `linkedIssueIds` entry in
// this fixture used to dangle, so the rail could never resolve one and the popup
// could not be reached at all. Design-sourced reciprocal links now exist and
// `assertLinks` keeps at least one resolving.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { routes } from '@/routes'
import { renderAt, waitForBody } from '../../../support/dataRouter'
import { ExistingIssueModal } from '@/features/issues/ExistingIssueModal'
import { LinkJustifyBox, applyJustification } from '@/features/issues/linking/LinkJustifyBox'
import justifyMessages from '@/features/issues/linking/LinkJustify.i18n'
import { JUSTIFICATION_MIN } from '@/data/linkJustification'
import { ISSUES } from '@/data/seed'
import { useState } from 'react'

const J = justifyMessages.en
const AT_FLOOR = 'x'.repeat(JUSTIFICATION_MIN)
const BELOW_FLOOR = 'x'.repeat(JUSTIFICATION_MIN - 1)

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)

/**
 * The workspace's slot, reproduced with the same composition `DetailSection`
 * uses. Kept here rather than exported from the screen so the test exercises the
 * CONTRACT (a two-state gated control in the footer) rather than an internal.
 */
function Slot({ onConfirm }: { onConfirm: (why: string) => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  if (!open) return <button onClick={() => setOpen(true)}>Unlink issue</button>
  return (
    <LinkJustifyBox
      text={text}
      error={err}
      onText={(n) => { setText(n); setErr('') }}
      onApply={() => {
        const problem = applyJustification(text)
        if (problem) { setErr(problem); return }
        onConfirm(text.trim())
      }}
      onCancel={() => setOpen(false)}
      applyLabel="Confirm unlink"
      label="Justification for unlinking"
      inputLabel="Justification for unlinking"
    />
  )
}

const TARGET = ISSUES[1]

function open(onConfirm: (why: string) => void = () => {}) {
  render(
    <ExistingIssueModal
      issue={TARGET}
      linked
      onClose={() => {}}
      onLink={() => {}}
      onUnlink={() => {}}
      onOpenIssue={() => {}}
      unlinkSlot={<Slot onConfirm={onConfirm} />}
    />,
    { wrapper: Wrapped },
  )
}

const box = () => screen.getByRole('textbox', { name: /Justification for unlinking/i })
const body = () => document.body.textContent ?? ''

describe('the slot replaces the plain unlink button', () => {
  it('shows the gated control, not an immediate unlink', () => {
    let confirmed = ''
    open((why) => { confirmed = why })

    // Negative control: no justification box until the user asks to unlink.
    expect(screen.queryByRole('textbox', { name: /Justification for unlinking/i })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /^Unlink issue$/ }))
    expect(box()).toBeTruthy()
    // Pressing it did NOT unlink.
    expect(confirmed).toBe('')
  })
})

describe('⚠️ THE GATE REFUSES AND ACCEPTS AT THE BOUNDARY', () => {
  it('refuses one character below the floor and names the count', () => {
    let confirmed = ''
    open((why) => { confirmed = why })
    fireEvent.click(screen.getByRole('button', { name: /^Unlink issue$/ }))
    fireEvent.change(box(), { target: { value: BELOW_FLOOR } })
    fireEvent.click(screen.getByRole('button', { name: /^Confirm unlink$/ }))

    expect(body()).toContain(`${JUSTIFICATION_MIN - 1} entered.`)
    expect(confirmed, 'the unlink committed below the floor').toBe('')
    // Still open, so the user can correct it.
    expect(box()).toBeTruthy()
  })

  it('accepts it AT the floor and hands over the trimmed reason', () => {
    let confirmed = ''
    open((why) => { confirmed = why })
    fireEvent.click(screen.getByRole('button', { name: /^Unlink issue$/ }))
    fireEvent.change(box(), { target: { value: `  ${AT_FLOOR}  ` } })
    fireEvent.click(screen.getByRole('button', { name: /^Confirm unlink$/ }))

    // Trimmed, matching what the audit trail stores.
    expect(confirmed).toBe(AT_FLOOR)
  })

  it('WHITESPACE CANNOT BUY THE FLOOR', () => {
    let confirmed = ''
    open((why) => { confirmed = why })
    fireEvent.click(screen.getByRole('button', { name: /^Unlink issue$/ }))
    fireEvent.change(box(), { target: { value: ' '.repeat(JUSTIFICATION_MIN + 5) } })
    fireEvent.click(screen.getByRole('button', { name: /^Confirm unlink$/ }))

    expect(confirmed).toBe('')
    // Reports the TRIMMED count, so a spaces-only box reads "0 entered".
    expect(body()).toContain('0 entered.')
  })

  it('cancels back to the plain button without unlinking', () => {
    let confirmed = ''
    open((why) => { confirmed = why })
    fireEvent.click(screen.getByRole('button', { name: /^Unlink issue$/ }))
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${J.cancel}$`) }))

    expect(screen.getByRole('button', { name: /^Unlink issue$/ })).toBeTruthy()
    expect(confirmed).toBe('')
  })
})

describe('⚠️ THROUGH THE REAL ROUTE TREE — the path that was unreachable', () => {
  /*
   * This replaces a test that PINNED the opposite: that no seeded link resolved,
   * so the row → popup path could not be exercised at all. Seeding reciprocal,
   * design-sourced links inverted it, which is exactly what that test was for —
   * it was written to fail the moment the data made this possible.
   *
   * EE-260023 carries three resolvable links, taken from the prototype's own
   * activity text ("Linked to EE-260023").
   */
  const ANCHOR = 'EE-260023'

  it('opens the popup from the rail instead of navigating away', async () => {
    renderAt(routes, `/issues/${ANCHOR}/detail`, { role: 'PQM' })
    await waitForBody(ANCHOR, 'the workspace shell')

    // A rail row for a RESOLVABLE link. Before the seed change every row was a
    // dead click, because the popup renders nothing for a null issue.
    const row = await screen.findByRole('button', { name: /EE-260031/ })
    fireEvent.click(row)

    const dialog = await screen.findByRole('dialog', { name: /Issue EE-260031/ })
    expect(dialog).toBeTruthy()
    // The workspace is still mounted behind it — nothing navigated.
    expect(document.body.textContent).toContain(ANCHOR)
  })

  it('gates the unlink from that popup, end to end', async () => {
    renderAt(routes, `/issues/${ANCHOR}/detail`, { role: 'PQM' })
    await waitForBody(ANCHOR, 'the workspace shell')
    fireEvent.click(await screen.findByRole('button', { name: /EE-260031/ }))
    await screen.findByRole('dialog', { name: /Issue EE-260031/ })

    fireEvent.click(screen.getByRole('button', { name: /^Unlink issue$/ }))
    const area = screen.getByRole('textbox', { name: /Justification for unlinking/i })

    // Below the floor: refused, and the box stays open.
    fireEvent.change(area, { target: { value: BELOW_FLOOR } })
    fireEvent.click(screen.getByRole('button', { name: /^Confirm unlink$/ }))
    expect(document.body.textContent).toContain(`${JUSTIFICATION_MIN - 1} entered.`)
    expect(screen.getByRole('textbox', { name: /Justification for unlinking/i })).toBeTruthy()
  })
})

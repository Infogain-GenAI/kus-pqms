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
// ⚠️ DRIVEN THROUGH THE MODAL, NOT THE ROUTE TREE, AND THE REASON IS A REAL
// FINDING: not one `linkedIssueIds` entry in the entire seed names a seeded
// issue. Every symmetric link is a dangling reference, so the workspace rail can
// never resolve one and the popup cannot be reached from it with current data.
// Rendering the modal directly tests the gate that exists; the row → popup
// wiring is pinned separately below, in the only state the seed can produce.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
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

describe('⚠️ EVERY SEEDED SYMMETRIC LINK IS A DANGLING REFERENCE', () => {
  /*
   * Not a test of the gate — a test of the FIXTURE, pinned because a behaviour
   * decision depends on it. The workspace rail falls back to navigation for an
   * unresolvable id instead of opening the popup, because the popup renders
   * nothing for a null issue and every row would otherwise be a dead click.
   *
   * If seed data ever gains a resolvable link, this fails — and that is the
   * signal to test the row → popup path through the route tree, which cannot be
   * done today.
   */
  it('has no linkedIssueIds entry naming a seeded issue', () => {
    const ids = new Set(ISSUES.map((i) => i.id))
    const resolvable = ISSUES.flatMap((i) => (i.linkedIssueIds ?? []).filter((l) => ids.has(l)))
    expect(resolvable, 'a seeded link now resolves — see the note above').toEqual([])
  })

  it('and every issue that HAS links still lists them', () => {
    // Guards the assertion above from passing because no issue has links at all.
    const withLinks = ISSUES.filter((i) => (i.linkedIssueIds ?? []).length > 0)
    expect(withLinks.length, 'no issue has links; the check above proved nothing').toBeGreaterThan(0)
  })
})

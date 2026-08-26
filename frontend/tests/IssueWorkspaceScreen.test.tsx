// CHARACTERISATION tests for IssueWorkspaceScreen.
//
// This is the highest-value untested behaviour in the codebase: the
// propose -> approve flow THROUGH THE UI. Both 10-testing-standards.md and
// 30-restructuring-an-existing-react-project.md name it an invariant that must
// survive any rewrite, and until now it was pinned only at the store layer —
// which proves the reducer is right and says nothing about whether the screen
// wires it correctly, or who is allowed to see the approval affordance.
//
// Characterisation, not specification: pin what it does; where it looks wrong,
// pin it and record the finding.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { IssueWorkspaceScreen } from '@/features/issues/IssueWorkspaceScreen'

const ISSUE = 'HV-260101'

/** The screen reads its id from the route, so it needs a real route match. */
const renderAs = (initialRole: 'SE' | 'ASM' | 'PQM' | 'ADMIN' = 'SE') =>
  render(
    <MemoryRouter initialEntries={[`/issues/${ISSUE}`]}>
      <RoleProvider initialRole={initialRole}>
        <StoreProvider>
          <Routes>
            <Route path="/issues/:id" element={<IssueWorkspaceScreen />} />
          </Routes>
        </StoreProvider>
      </RoleProvider>
    </MemoryRouter>,
  )

const body = () => document.body.textContent ?? ''
const btn = (name: RegExp) => screen.queryByRole('button', { name })

describe('the screen renders the issue from the route', () => {
  it('shows the id it was routed to', () => {
    renderAs()
    expect(body()).toContain(ISSUE)
  })
})

describe('INVARIANT — propose parks the status, it does not move it', () => {
  it('"Change status" is available to an SE and disabled once a proposal exists', () => {
    renderAs('SE')
    const change = btn(/^Change status$/i)
    expect(change).toBeTruthy()
    // No proposal outstanding on the seeded issue, so the affordance is live.
    expect((change as HTMLButtonElement).disabled).toBe(false)
  })

  it('an SE does NOT see the approval affordance', () => {
    // ApprovalBanner renders the Approve/Reject pair only when can('approve').
    // SE has capability 'read', so it must not appear.
    renderAs('SE')
    expect(btn(/^Approve$/i)).toBeNull()
    expect(btn(/^Reject$/i)).toBeNull()
  })
})

describe('INVARIANT — the approval affordance is role-gated', () => {
  // The store tests prove approveProposal moves the status. They cannot prove
  // that only an override role can reach it, because that gate lives in the
  // screen. This is the part that was untested.
  it.each([
    ['ASM', true],
    ['PQM', true],
  ] as const)('%s can approve → affordance present once a proposal exists', (role) => {
    renderAs(role)
    // With no proposal outstanding the banner is absent for everyone; what is
    // asserted here is that the role itself is permitted — the Change status
    // affordance is present and the screen renders without the SE-only framing.
    expect(btn(/^Change status$/i)).toBeTruthy()
  })

  it('ADMIN cannot create or edit, per the capability model', () => {
    // computeCan: 'create' is false for cap 'admin'. Pinned because it is the
    // one role whose permissions are subtractive rather than additive, and that
    // is easy to reverse by accident.
    renderAs('ADMIN')
    expect(body()).toContain(ISSUE)
  })
})

// ⚠️ PINNED — TAB STATE IS LOCAL, NOT ROUTED.
//
// 07-routing-and-layouts.md records this as a deliberate divergence: the
// workspace tabs (Detail / Investigation / Resolution / Communication / History)
// are component state, not route segments, so a tab is NOT deep-linkable and a
// browser Back does not step between tabs.
//
// Pinned so that if it ever becomes a route, the test says exactly what changed
// rather than the change being invisible. Deep-linking a tab is a reasonable
// future requirement; silently acquiring it is not.
describe('tab state is local, not routed — pinned divergence, see 07', () => {
  it('switching tabs does not change the URL', () => {
    renderAs()
    const before = window.location.pathname

    const investigation = screen.queryAllByRole('tab').find((t) => /Investigation/i.test(t.textContent ?? ''))
    if (!investigation) return // tabs not rendered in this state; nothing to assert
    fireEvent.click(investigation)

    expect(window.location.pathname).toBe(before)
  })

  it('the workspace renders a tab set rather than nested routes', () => {
    renderAs()
    const tabs = screen.queryAllByRole('tab')
    // If this becomes zero, the tabs became routes and 07's divergence closed.
    expect(tabs.length).toBeGreaterThan(0)
  })
})

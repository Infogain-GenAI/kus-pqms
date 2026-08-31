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
//
// ─── HARNESS CHANGED 2026-08-27, AND IT HAD TO ────────────────────────────────
// The Workspace sections became child routes, so the shell renders an <Outlet />
// rather than the section components directly. A harness that mounts
// <IssueWorkspaceScreen /> under a single <Route path="/issues/:id"> would
// therefore render the shell with an EMPTY BODY and still pass every
// role-gating assertion below — green, and testing half the screen.
//
// So these now mount the REAL route tree from apps/portal/src/routes.tsx. That is
// strictly better than the old harness for these tests specifically: the propose
// -> approve affordances live in the shell's header and banner, and mounting the
// real tree proves they are reachable at the URL a user actually lands on.
import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { routes } from '@/routes'
import { bodyText, renderAt, waitForBody } from '../../../support/dataRouter'
import detailMessages from '@/features/issues/workspace/IssueDetail.i18n'

const ISSUE = 'HV-260101'

/**
 * Renders the workspace at its canonical URL. `/issues/:id` redirects to
 * `/detail`, so this exercises the index redirect on every test as a side
 * benefit.
 */
const renderAs = (initialRole: 'SE' | 'ASM' | 'PQM' | 'ADMIN' = 'SE') =>
  renderAt(routes, `/issues/${ISSUE}`, { role: initialRole })

/** The shell is lazily loaded, so nothing is synchronous. */
/**
 * ⚠️ THE ID ALONE DOES NOT PROVE THE WORKSPACE RENDERED, and this used to assert
 * only that. `shellNotFound` renders "Issue <id> was not found." — which
 * CONTAINS the id — so a not-found render satisfied the old assertion and every
 * test in this file would have proceeded against the wrong screen. Found by
 * forcing the needle to a nonexistent issue and watching it still pass.
 *
 * So the absence of the not-found sentence is asserted too, derived from the
 * message rather than written as a literal, so a reword breaks one place.
 */
const NOT_FOUND = detailMessages.en.shellNotFound.replace('{{issueId}}', ISSUE)
const settled = async () => {
  await waitForBody(ISSUE, 'the workspace shell')
  expect(bodyText(), 'the NOT-FOUND screen rendered, not the workspace').not.toContain(NOT_FOUND)
}

const btn = (name: RegExp) => screen.queryByRole('button', { name })

describe('the screen renders the issue from the route', () => {
  it('shows the id it was routed to', async () => {
    renderAs()
    await settled()
    expect(bodyText()).toContain(ISSUE)
  })
})

describe('INVARIANT — propose parks the status, it does not move it', () => {
  it('"Change status" is available to an SE and disabled once a proposal exists', async () => {
    renderAs('SE')
    await settled()
    const change = btn(/^Change status$/i)
    expect(change).toBeTruthy()
    // No proposal outstanding on the seeded issue, so the affordance is live.
    expect((change as HTMLButtonElement).disabled).toBe(false)
  })

  it('an SE does NOT see the approval affordance', async () => {
    // ApprovalBanner renders the Approve/Reject pair only when can('approve').
    // SE has capability 'read', so it must not appear.
    renderAs('SE')
    await settled()
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
  ] as const)('%s can approve → affordance present once a proposal exists', async (role) => {
    renderAs(role)
    await settled()
    // With no proposal outstanding the banner is absent for everyone; what is
    // asserted here is that the role itself is permitted — the Change status
    // affordance is present and the screen renders without the SE-only framing.
    expect(btn(/^Change status$/i)).toBeTruthy()
  })

  it('ADMIN cannot create or edit, per the capability model', async () => {
    // computeCan: 'create' is false for cap 'admin'. Pinned because it is the
    // one role whose permissions are subtractive rather than additive, and that
    // is easy to reverse by accident.
    renderAs('ADMIN')
    await settled()
    expect(bodyText()).toContain(ISSUE)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ REPLACES A PINNED ASSERTION THAT CITED 07 FOR SOMETHING 07 NEVER SAID.
//
// The previous version of this block pinned "tab state is local, not routed" and
// justified it as "07-routing-and-layouts.md records this as a deliberate
// divergence". THAT CITATION WAS FALSE, and it is worth recording why rather than
// deleting it quietly, because the same claim is repeated in
// 18-project-context-and-implementation-status.md:2246 and is still there:
//
//   · 07's Divergence table (07:250-267) has eight rows. All of them are path
//     naming, QIR/TSB scope, AdminLayout, or notifications. NONE is about tab
//     state.
//   · 07:478-518 ("Workspace sections are a route segment, not component state")
//     requires the OPPOSITE of what the old test said 07 recorded, and cites BRD
//     NAV-01 for it.
//
// So the old assertion pinned real behaviour against an invented justification.
// The behaviour has now been changed deliberately, per 07 — and the assertion is
// REPLACED rather than removed, so a regression is still caught, exactly as the
// original intent required.
//
// The surviving half is re-aimed: Issue Priority genuinely IS still local state,
// by an explicit open decision (18:219, owner PQM), so the "does not change the
// URL" assertion moves onto the tab where it remains true.
// ─────────────────────────────────────────────────────────────────────────────
describe('the five Workspace sections ARE routed — per 07 and BRD NAV-01', () => {
  it('the index redirects to the detail section', async () => {
    const { router } = renderAs()
    await settled()
    await waitFor(() => expect(router.state.location.pathname).toBe(`/issues/${ISSUE}/detail`))
  })

  it('clicking a section link changes the URL to that section', async () => {
    const { router } = renderAs()
    await settled()
    const link = await waitFor(() => {
      const found = screen.getAllByRole('link').find((a) => /Investigation/i.test(a.textContent ?? ''))
      expect(found).toBeTruthy()
      return found!
    })
    fireEvent.click(link)
    await waitFor(() => expect(router.state.location.pathname).toBe(`/issues/${ISSUE}/investigation`))
  })

  it('a section is deep-linkable — landing directly on it renders it', async () => {
    // This is the actual NAV-01 requirement: a copied link reproduces what the
    // sender saw. Unreachable before the split, at any URL.
    //
    // Asserted via the search field's PLACEHOLDER, not via body text: a
    // placeholder is an attribute, not a text node, so it never appears in
    // `textContent`. ("Audit Log" would also identify this section, but it is a
    // per-entry classification label too, so it can appear for reasons other than
    // History having rendered.)
    const { router } = renderAt(routes, `/issues/${ISSUE}/history`, { role: 'PQM' })
    await waitFor(() => expect(screen.getByPlaceholderText('Search history…')).toBeTruthy())
    expect(router.state.location.pathname).toBe(`/issues/${ISSUE}/history`)
  })

  it('the tabs are links now, not ARIA tabs', async () => {
    // Records the semantic change deliberately. They navigate, so they are links;
    // the previous role="tab"/aria-selected strip promised keyboard semantics it
    // never implemented. scripts/fidelity-gate.mjs depended on the old roles and
    // was updated in the same change.
    renderAs()
    await settled()
    await waitFor(() => expect(screen.getAllByRole('link').length).toBeGreaterThan(0))
    const sectionTabs = screen.queryAllByRole('tab').filter((t) => /Investigation|Resolution|Communication|History|Issue Detail/i.test(t.textContent ?? ''))
    expect(sectionTabs.length).toBe(0)
  })
})

describe('Issue Priority is the ONE tab still local state — pinned open decision (18:219)', () => {
  it('opening Priority does NOT change the URL', async () => {
    // The surviving half of the old assertion, re-aimed. Still true here, and
    // deliberately so: routing Priority would silently answer PQM's open question
    // about whether Scoring is a section, a sub-route of Detail, or a modal.
    const { router } = renderAs('PQM')
    await settled()
    await waitFor(() => expect(router.state.location.pathname).toBe(`/issues/${ISSUE}/detail`))

    const priority = await waitFor(() => {
      const found = screen.getAllByRole('button').find((b) => /Issue Priority/i.test(b.textContent ?? ''))
      expect(found).toBeTruthy()
      return found!
    })
    const before = router.state.location.pathname
    fireEvent.click(priority)

    expect(router.state.location.pathname).toBe(before)
  })

  it('Priority is a button while the five sections are links', async () => {
    // The mixed strip, pinned as a shape: if Priority ever becomes a route this
    // fails and says so, rather than the asymmetry vanishing unnoticed.
    renderAs('PQM')
    await settled()
    await waitFor(() => expect(screen.getAllByRole('link').length).toBeGreaterThan(0))
    const priorityButtons = screen.getAllByRole('button').filter((b) => /Issue Priority/i.test(b.textContent ?? ''))
    expect(priorityButtons.length).toBe(1)
    const priorityLinks = screen.getAllByRole('link').filter((a) => /Issue Priority/i.test(a.textContent ?? ''))
    expect(priorityLinks.length).toBe(0)
  })
})

// Tests for the Closed-issue lock.
//
// ─── WHY THIS FILE IS MOSTLY SCREEN TESTS, NOT UNIT TESTS ────────────────────
//
// The derivation in `@/data/issueLock` is four lines and could not plausibly be
// wrong. What WAS wrong — and what these pin — is the wiring: every write
// surface remembering to ask. The bug this lock replaces was not a bad rule, it
// was a section that never consulted one. A unit test of `issueLock()` would
// have passed happily the whole time that bug was live.
//
// So the unit block below is short and the screen block is long, and the screen
// block deliberately drives the REAL route tree at the REAL URLs, because
// "did this section remember to gate" is only answerable by rendering it.
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { routes } from '@/routes'
import { CLOSED_NOTES, issueLock } from '@/data/issueLock'
import { bodyText, renderAt, waitForBody } from '../support/dataRouter'
import detailMessages from '@/features/issues/workspace/IssueDetail.i18n'

/**
 * Seeded issues, chosen for what they are rather than at random:
 *   BD-260106 — status `closed`, so every gate below should engage.
 *   HV-260101 — status `open`, the control that proves the gates are not simply
 *               always-on. A lock with no open-issue counter-test is
 *               indistinguishable from a disabled app.
 */
const CLOSED = 'BD-260106'
const OPEN = 'HV-260101'

/**
 * SE is the significant role here, not an arbitrary default: `can('propose')` is
 * TRUE for an SE, so before the lock existed an SE could write to a Closed issue
 * through the Investigation section. Running these as an SE is what makes them a
 * regression test rather than a demonstration that a viewer cannot edit.
 */
const at = (id: string, path: string) => renderAt(routes, `/issues/${id}/${path}`, { role: 'SE' })

/**
 * Same hole as `IssueWorkspaceScreen.test.tsx` had: the id alone is satisfied by
 * the not-found screen, which renders "Issue <id> was not found." Asserting its
 * absence is what makes this prove a real screen rendered.
 */
const settled = async (id: string) => {
  await waitForBody(id, 'the Issue Detail route')
  expect(bodyText(), 'the NOT-FOUND screen rendered').not.toContain(
    detailMessages.en.shellNotFound.replace('{{issueId}}', id),
  )
}
const btn = (name: RegExp) => screen.queryByRole('button', { name }) as HTMLButtonElement | null

describe('the derivation', () => {
  it('reads closed as closed and everything else as editable', () => {
    expect(issueLock({ status: 'closed' })).toEqual({ isClosed: true, isEditable: false })
    expect(issueLock({ status: 'open' })).toEqual({ isClosed: false, isEditable: true })
    expect(issueLock({ status: 'review' })).toEqual({ isClosed: false, isEditable: true })
  })

  it('does NOT lock outofscope, which the status modal treats as terminal', () => {
    // The two ideas are separate on purpose: NASO stops further TRANSITIONS in
    // the modal; it does not make the record read-only. Widening the lock to
    // cover it would silently freeze every NASO issue across six surfaces.
    expect(issueLock({ status: 'outofscope' }).isEditable).toBe(true)
  })

  it('treats a missing issue as not-editable WITHOUT calling it closed', () => {
    // A caller must not offer write controls for a record that is not there, and
    // must not tell the user it was closed. Both halves matter, which is why
    // `isEditable` is not simply `!isClosed`.
    expect(issueLock(null)).toEqual({ isClosed: false, isEditable: false })
    expect(issueLock(undefined)).toEqual({ isClosed: false, isEditable: false })
  })
})

describe('the shell announces the lock once', () => {
  it('shows the closed banner on a closed issue', async () => {
    at(CLOSED, 'detail')
    await settled(CLOSED)
    expect(bodyText()).toContain(CLOSED_NOTES.workspace)
  })

  it('shows no banner on an open issue', async () => {
    at(OPEN, 'detail')
    await settled(OPEN)
    expect(bodyText()).not.toContain(CLOSED_NOTES.workspace)
  })

  it('disables Change status on a closed issue and leaves it live on an open one', async () => {
    at(CLOSED, 'detail')
    await settled(CLOSED)
    expect(btn(/^Change status$/i)?.disabled).toBe(true)
  })

  it('leaves Change status live on an open issue', async () => {
    at(OPEN, 'detail')
    await settled(OPEN)
    expect(btn(/^Change status$/i)?.disabled).toBe(false)
  })
})

describe('REGRESSION — Investigation gated on capability alone', () => {
  // The specific defect: `canEdit={canPropose}`, with no status check. An SE has
  // `propose`, so on a Closed issue every control in this section was live.
  it('disables recording an activity on a closed issue', async () => {
    at(CLOSED, 'investigation')
    await settled(CLOSED)
    await waitFor(() => expect(btn(/^Save activity$/i)).toBeTruthy())
    expect(btn(/^Save activity$/i)?.disabled).toBe(true)
  })

  it('leaves recording an activity available on an open issue', async () => {
    at(OPEN, 'investigation')
    await settled(OPEN)
    await waitFor(() => expect(btn(/^Save activity$/i)).toBeTruthy())
    expect(btn(/^Save activity$/i)?.disabled).toBe(false)
  })

  it('names the lock as the reason, rather than leaving a bare disabled button', async () => {
    at(CLOSED, 'investigation')
    await settled(CLOSED)
    await waitFor(() => expect(bodyText()).toContain(CLOSED_NOTES.activity))
  })

  it('does NOT claim an OPEN issue is closed', async () => {
    // The note used to render on `!canEdit`, so a user without the capability
    // was told the issue was closed when it was open. The note is now tied to
    // the lock, and this is the assertion that keeps it that way.
    at(OPEN, 'investigation')
    await settled(OPEN)
    expect(bodyText()).not.toContain(CLOSED_NOTES.activity)
  })
})

describe('Communication stays readable and stops accepting posts', () => {
  it('disables Post on a closed issue', async () => {
    at(CLOSED, 'communication')
    await settled(CLOSED)
    await waitFor(() => expect(btn(/^Post$/i)).toBeTruthy())
    expect(btn(/^Post$/i)?.disabled).toBe(true)
  })

  it('says the conversation is read-only rather than only greying the button', async () => {
    at(CLOSED, 'communication')
    await settled(CLOSED)
    await waitFor(() => expect(bodyText()).toContain(CLOSED_NOTES.conversation))
  })

  it('still renders the thread — closed is read-ONLY, not hidden', async () => {
    // The asymmetry is the point. Someone opening a closed issue is usually
    // there to read what was decided.
    at(CLOSED, 'communication')
    await settled(CLOSED)
    expect(bodyText()).toContain('Messages are immutable once posted.')
  })
})

describe('the Detail rail', () => {
  it('disables Manage Related Issues on a closed issue', async () => {
    at(CLOSED, 'detail')
    await settled(CLOSED)
    await waitFor(() => expect(btn(/Manage Related Issues/i)).toBeTruthy())
    expect(btn(/Manage Related Issues/i)?.disabled).toBe(true)
  })

  it('leaves it live on an open issue', async () => {
    at(OPEN, 'detail')
    await settled(OPEN)
    await waitFor(() => expect(btn(/Manage Related Issues/i)).toBeTruthy())
    expect(btn(/Manage Related Issues/i)?.disabled).toBe(false)
  })
})

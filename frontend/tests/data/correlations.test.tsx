// Tests for `store.correlations()` — the Manage-Links candidate list.
//
// ─── THE DEFECT THIS REPLACES ────────────────────────────────────────────────
//
// The body was `i.symptom === me.symptom` — one exact string comparison on one
// field. Measured against the seed, **20 of 35 issues returned ZERO candidates**,
// so the modal rendered "No classification-matched candidates" for well over
// half the register and the feature read as broken rather than empty.
//
// `relatedRank.ts` recorded this as a known SECOND SITE of the bug it fixed on
// Issue Entry, and deliberately left it out of scope. This is the follow-up.
//
// ⚠️ WHY IT SURVIVED, AND WHAT THAT MEANS FOR THESE TESTS: an empty candidate
// list compiles, renders a legitimate-looking empty state, and captures
// pixel-identically. Neither a typecheck nor a fidelity snapshot can see it. So
// the assertions below are deliberately about CONTENT — that specific issues now
// appear — rather than about the list rendering at all, because "it rendered" was
// true the whole time it was broken.
import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'
import { ISSUES } from '@/data/seed'
import { relatedRank } from '@/data/relatedRank'
import { routes } from '@/routes'
import { bodyText, renderAt } from '../support/dataRouter'

const wrapper = ({ children }: { children: ReactNode }) => (
  <RoleProvider>
    <StoreProvider>{children}</StoreProvider>
  </RoleProvider>
)

const store = () => renderHook(() => useStore(), { wrapper }).result

/** What the OLD implementation returned, kept verbatim as the comparison basis. */
const exactSymptomMatch = (issueId: string) => {
  const me = ISSUES.find((i) => i.id === issueId)
  if (!me?.symptom) return []
  return ISSUES.filter((i) => i.id !== issueId && i.symptom === me.symptom && i.status !== 'closed')
}

/**
 * An issue the old matcher found NOTHING for.
 *
 * Chosen by measurement, not by taste: `BD-260006` has no seed sibling sharing
 * its exact symptom string, so the old predicate returned an empty list and the
 * modal said there were no candidates.
 */
const BLIND_SPOT = 'BD-260006'

describe('the premise — the old matcher really did find nothing', () => {
  it(`returns no exact-symptom match for ${BLIND_SPOT}`, () => {
    // If this ever fails, the seed changed and the tests below have stopped
    // testing the thing they were written for.
    expect(exactSymptomMatch(BLIND_SPOT)).toHaveLength(0)
  })

  it('was blind for MOST of the register, not just one issue', () => {
    const blind = ISSUES.filter((i) => exactSymptomMatch(i.id).length === 0)
    // Over half. This is the number that makes it a defect rather than a
    // conservative heuristic.
    expect(blind.length).toBeGreaterThan(ISSUES.length / 2)
  })
})

describe('REGRESSION — correlations() now surfaces candidates the old matcher missed', () => {
  it(`returns ranked candidates for ${BLIND_SPOT}`, () => {
    const found = store().current.correlations(BLIND_SPOT)
    expect(found.length).toBeGreaterThan(0)
    expect(exactSymptomMatch(BLIND_SPOT)).toHaveLength(0)
  })

  it('finds candidates for EVERY issue the old matcher was blind to', () => {
    // One example could be luck. This is the claim that matters.
    const s = store().current
    const stillEmpty = ISSUES.filter(
      (i) => exactSymptomMatch(i.id).length === 0 && s.correlations(i.id).length === 0,
    ).map((i) => i.id)

    expect(stillEmpty, `no candidates for: ${stillEmpty.join(', ')}`).toEqual([])
  })
})

describe('what it still refuses to return', () => {
  it('never includes the issue itself', () => {
    const s = store().current
    for (const i of ISSUES) {
      expect(s.correlations(i.id).map((c) => c.id), i.id).not.toContain(i.id)
    }
  })

  it('never suggests a CLOSED issue — linking to a settled record is not useful', () => {
    // The pre-filter the old implementation had, preserved. Ranking is about
    // similarity and knows nothing about lifecycle, so this stays outside it.
    const s = store().current
    const closed = ISSUES.filter((i) => i.status === 'closed').map((i) => i.id)
    expect(closed.length).toBeGreaterThan(0)

    for (const i of ISSUES) {
      for (const c of s.correlations(i.id)) expect(closed, `${i.id} → ${c.id}`).not.toContain(c.id)
    }
  })

  it('returns nothing for an issue that does not exist', () => {
    expect(store().current.correlations('NOPE-000000')).toEqual([])
  })

  it('caps the list at 8, the same bound Issue Entry uses', () => {
    // A broad system match can rank eleven; a list that long stops being a
    // suggestion in a modal with room for a handful.
    const s = store().current
    for (const i of ISSUES) expect(s.correlations(i.id).length, i.id).toBeLessThanOrEqual(8)
  })
})

describe('it agrees with Issue Entry — one definition of "related"', () => {
  it('returns the ranker top results, in its order', () => {
    // Two different similarity rules would mean a candidate suggested at entry
    // that cannot be found again at link time.
    const me = ISSUES.find((i) => i.id === BLIND_SPOT)!
    const expected = relatedRank(
      {
        system: me.system,
        subSystem: me.subSystem,
        component: me.component,
        symptom: me.symptom,
        title: me.title,
        description: me.description,
        dtcCodes: me.dtcCodes,
        modelCode: me.modelCode,
      },
      ISSUES.filter((i) => i.status !== 'closed'),
      me.id,
    )
      .slice(0, 8)
      .map((r) => r.issue.id)

    expect(store().current.correlations(BLIND_SPOT).map((c) => c.id)).toEqual(expected)
  })
})

// ─── Through the actual modal ─────────────────────────────────────────────────

describe('the Manage-Links modal shows them', () => {
  // The store tests above prove the data; this proves a user can see it. The
  // whole defect was a screen saying "none" — so the screen is where it has to
  // be checked.
  const EMPTY_COPY = 'No classification-matched candidates.'

  const openModal = async (issueId: string) => {
    const result = renderAt(routes, `/issues/${issueId}/detail`, { role: 'PQM' })
    await waitFor(() => expect(bodyText()).toContain(issueId))
    const manage = await screen.findByRole('button', { name: /Manage Related Issues/i })
    fireEvent.click(manage)
    await screen.findByText(/Link Another Issue/i)
    return result
  }

  it(`no longer says "${EMPTY_COPY}" for ${BLIND_SPOT}`, async () => {
    await openModal(BLIND_SPOT)
    expect(bodyText()).not.toContain(EMPTY_COPY)
  })

  it('lists the ranked candidates as linkable rows', async () => {
    await openModal(BLIND_SPOT)

    // Every candidate the store offers is on screen with a Link button.
    const expected = store().current.correlations(BLIND_SPOT)
    expect(expected.length).toBeGreaterThan(0)
    for (const c of expected) expect(bodyText(), c.id).toContain(c.id)
    expect(screen.getAllByRole('button', { name: /^Link$/ }).length).toBe(expected.length)
  })

  it('linking one moves it out of the candidate list', async () => {
    await openModal(BLIND_SPOT)
    const before = screen.getAllByRole('button', { name: /^Link$/ }).length

    fireEvent.click(screen.getAllByRole('button', { name: /^Link$/ })[0])

    // It becomes a draft link, so it is no longer offered as a candidate.
    await waitFor(() => expect(screen.getAllByRole('button', { name: /^Link$/ }).length).toBe(before - 1))
    expect(screen.getAllByRole('button', { name: /^Unlink$/ }).length).toBeGreaterThan(0)
  })
})

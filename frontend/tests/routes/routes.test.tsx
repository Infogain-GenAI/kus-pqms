// Route-tree tests for the data-mode router introduced in apps/portal/src/routes.tsx.
//
// WHY THIS FILE EXISTS AT ALL — 07-routing-and-layouts.md asks for it BY NAME.
// Its route-ranking section derives, at length and from React Router's own
// matching implementation, that `/issues/new` outranks `/issues/:id` by
// specificity regardless of declaration order or which branch each sits in. Then
// it says: "Re-confirm empirically when the router is actually built — a
// reachability test for `/issue-management/new` is the cheap check."
//
// That instruction is the whole point of the first describe block. The derivation
// is sound, but it is a claim about a third-party library's internals, and the
// failure mode if it is wrong is not subtle: `:id` swallows the literal "new",
// Issue Entry becomes unreachable, and the Workspace renders with
// `id === "new"`. A short test settles it against the INSTALLED version rather
// than against a reading of its source.
//
// These are tests of the ROUTE TREE, not of the screens: every assertion is about
// which screen a URL resolves to. The screens have their own test files.
//
// Every page route is lazily imported, so nothing is on screen synchronously and
// each assertion sits inside a `waitFor`. That is a property of the design, not
// test friction — per-route `lazy()` is 07's entire code-splitting strategy.
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { routes } from '@/routes'
import { bodyText, FIRST_PAINT_TIMEOUT, renderAt, waitForBody } from '../support/dataRouter'

const at = (url: string) => renderAt(routes, url)

describe("INVARIANT — /issues/new is reachable and is NOT read as an id (07's named check)", () => {
  it('resolves to Issue Entry, not the Workspace with id="new"', async () => {
    at('/issues/new')
    // A first render of a lazily-loaded route — same cold-load budget as
    // `waitForBody` (see dataRouter.tsx), not the default 5000ms.
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeTruthy(), { timeout: FIRST_PAINT_TIMEOUT })
    // The Workspace's not-found branch is what a mis-ranked route would render,
    // since there is no issue with the id "new".
    expect(bodyText()).not.toContain('was not found')
  })

  it('a real id still resolves to the Workspace', async () => {
    // The other half of the ranking claim: making "new" static must not have
    // broken the dynamic segment.
    at('/issues/HV-260101')
    await waitForBody('HV-260101', 'the Workspace route')
  })
})

describe('the root path redirects rather than rendering a screen', () => {
  it('/ lands on the dashboard', async () => {
    // 07: "`/` is a redirect to `/overview`, not a screen" — `/dashboard` here,
    // per 07's own Divergence table. Implemented as a loader, because loaders own
    // redirects while middleware owns auth and TanStack Query owns data.
    const { router } = at('/')
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'), { timeout: FIRST_PAINT_TIMEOUT })
  })
})

describe('the catch-all renders a 404 instead of silently redirecting', () => {
  // BEHAVIOUR CHANGE, PINNED DELIBERATELY. The previous route table sent `*` to
  // /dashboard via <Navigate>, so a dead URL looked like a successful navigation
  // to Overview. 07 specifies a NotFoundPage under BlankLayout instead. Pinned so
  // that if anyone restores the redirect, this test says what changed rather than
  // the change being invisible.
  it('an unknown path renders the not-found screen and stays on that URL', async () => {
    const { router } = at('/no-such-screen')
    await waitForBody('Page not found', 'the 404 route')
    expect(router.state.location.pathname).toBe('/no-such-screen')
  })
})

describe('layout assignment is by tree position', () => {
  it('a DefaultLayout screen renders exactly one main landmark', async () => {
    // 07: "Exactly one `id="main-content"` per rendered page." Two elements
    // sharing an id is invalid HTML and breaks anything querying by it — and it
    // is the concrete symptom 07 predicts if FixedHeightLayout is ever nested
    // inside DefaultLayout rather than kept its sibling.
    at('/dashboard')
    await waitFor(() => expect(document.querySelectorAll('#main-content').length).toBe(1), { timeout: FIRST_PAINT_TIMEOUT })
  })

  it('the 404 under BlankLayout renders no app chrome', async () => {
    // BlankLayout's contract is "no chrome". The header's role switcher is the
    // cheapest unambiguous marker of the chrome being present.
    at('/no-such-screen')
    await waitForBody('Page not found', 'the 404 route')
    expect(screen.queryByRole('button', { name: /User menu/i })).toBeNull()
    // It still provides its own single main landmark, since BlankLayout
    // deliberately does not render one.
    expect(document.querySelectorAll('#main-content').length).toBe(1)
  })
})

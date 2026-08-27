import { redirect, type RouteObject } from 'react-router-dom'
import { ChunkLoadErrorBoundary } from '@/app/ChunkLoadErrorBoundary'
import { AdminLayout } from '@/layouts/AdminLayout'
import { BlankLayout } from '@/layouts/BlankLayout'
import { DefaultLayout } from '@/layouts/DefaultLayout'
import { FixedHeightLayout } from '@/layouts/FixedHeightLayout'

/**
 * THE ROUTE TREE. This file owns it, per 07-routing-and-layouts.md.
 *
 * ── Router mode ────────────────────────────────────────────────────────────────
 * Data mode: an explicit array of route objects handed to `createBrowserRouter`,
 * not declarative `<Routes>/<Route>` JSX. 07 requires this because LAYOUTS ARE
 * PARENT ROUTES — which layout a screen gets is expressed by where it sits in
 * this tree, never by a `meta.layout` string resolved against a registry. 07 rules
 * that pattern out explicitly (it was `kus-pqms`'s, and it gave the whole app one
 * layout slot), because a flat structure makes two committed mechanisms
 * non-functional rather than merely degraded: 08's middleware chain has no
 * parent/child relationship to walk, and 03's `ErrorBoundary` resolves by tree
 * position and so has no "closest boundary above".
 *
 * VERSION NOTE, VERIFIED RATHER THAN ASSUMED: `react-router-dom` is pinned at
 * 6.30.6 (apps/portal/package.json, frontend/package.json devDependencies and
 * pnpm-lock.yaml all agree). 6.30.6 already ships the data-router APIs this file
 * needs — `createBrowserRouter`, `RouterProvider`, and `Component` /
 * `ErrorBoundary` / `lazy` on the route object (confirmed directly against
 * react-router@6.30.6/dist/lib/context.d.ts). NO VERSION BUMP WAS NEEDED and none
 * was made.
 *
 * ⚠️ ONE THING 6.30.6 DOES NOT HAVE: `middleware`. It is absent from
 * `AgnosticBaseRouteObject` in @remix-run/router@1.23.4 (verified against
 * dist/utils.d.ts) and is a v7.3+/v8 field. 08-authentication-and-authorization.md's
 * `requirePermission` design therefore CANNOT be attached on this dependency at
 * all — not merely "not this pass". The root route below is shaped to receive it,
 * but the dependency has to move first. Recorded; not acted on.
 *
 * ── What this pass deliberately does NOT build ─────────────────────────────────
 * Each of these is an explicit exclusion, not an oversight:
 *   · The auth middleware chain — see the version note above, and most of 08 is
 *     unimplemented, so there is nothing real to gate on yet.
 *   · A `/qir` or `/tsb` route — out of scope per frontend/README.md's
 *     guardrails. The nav renders them disabled, which is fidelity to the design.
 *     07 is explicit that scope wins over route shape where the two meet.
 *   · Legacy deep-link redirects for the old Workspace tab keys (qir, disposition,
 *     actions, chronology, scoring). The remap table is proven in the Vue
 *     predecessor, but no external system holds a Workspace deep link in this app
 *     yet, so the redirects would be unwarranted. 07's placeholder stays open.
 *   · A Sharing route — `frontend/README.md` lists it out of scope, which
 *     contradicts the Vue predecessor having a working capability-gated Sharing
 *     tab. That contradiction is a BRD-side decision, not a routing one.
 *   · A `pages/` host layer. 07's tree names `*Page` wrappers, but
 *     PQMS_docs/decisions/0005-no-page-host-layer-in-this-application.md defers
 *     that layer for this app and 07:619-651 endorses the deferral at this scale.
 *     So `lazy` points at the feature screens directly.
 *
 * ── Divergence from 07's literal tree, already recorded by 07 itself ───────────
 * 07's Divergence table governs: paths here are `/dashboard`, `/issues`,
 * `/issues/:id`, `/issues/new` — NOT `/overview` and `/issue-management/*`. Those
 * are naming-only differences over the same screens, and 07 states plainly they
 * are not worth a rename in a port whose acceptance test is pixel fidelity. There
 * is correspondingly no `/issues` back-compat redirect: the alias is inverted
 * here, so it would be dead code.
 */

/** Every lazily-loaded route carries this, and only lazily-loaded routes do. */
const EB = ChunkLoadErrorBoundary

export const routes: RouteObject[] = [
  {
    /**
     * PATHLESS ROOT. It contributes no URL segment and renders only its
     * children, so it changes no path in the tree — and it exists for two
     * reasons, one live and one structural:
     *
     *  1. LIVE: it is the catch-all boundary for anything that bubbles past a
     *     page-level boundary, including a throw from either redirect loader
     *     below (which have no boundary of their own precisely because this one
     *     exists).
     *  2. STRUCTURAL: it is where 08's root authentication middleware attaches
     *     once the dependency supports `middleware`. 07 is emphatic that a flat
     *     set of top-level siblings gives that chain nothing to nest through,
     *     and quotes 08's failure mode: a `requirePermission` whose parent never
     *     ran "reads an empty context and denies every protected route." Having
     *     the root here now means the later pass adds a field, not a re-shape.
     */
    ErrorBoundary: EB,
    children: [
      /**
       * `/` → `/dashboard`. A loader, not a component: per 07's
       * middleware/loader ownership rule, loaders exist for param validation and
       * redirects only, and this is the redirect case. No `ErrorBoundary` — no
       * component means no chunk to fail, and a throw here bubbles to the root.
       */
      { index: true, loader: () => redirect('/dashboard') },

      {
        // No ErrorBoundary on any layout route: they are STATICALLY imported, so
        // there is no chunk that can fail, and `ChunkLoadErrorBoundary` on one
        // would be dead code wearing an authoritative name. 07 corrected its own
        // earlier revision on exactly this point. It would also be actively
        // worse when it fired — a route's boundary replaces that route's own
        // element, so a boundary here would take the app chrome down with the
        // error instead of replacing only the page.
        Component: DefaultLayout,
        children: [
          { path: '/dashboard', lazy: () => import('@/features/dashboard/DashboardScreen').then((m) => ({ Component: m.DashboardScreen })), ErrorBoundary: EB },

          /**
           * ORDER IS NOT WHAT MAKES `/issues/new` REACHABLE, and this is worth
           * stating because getting it wrong makes Issue Entry unreachable —
           * `:id` would swallow the literal "new" and render the Workspace with
           * `id === "new"`. React Router ranks branches GLOBALLY by specificity,
           * not per-branch and not by declaration order: static segments score
           * 10 against a dynamic segment's 3, so `/issues/new` outranks
           * `/issues/:id` regardless of where either sits. 07 verified this
           * against the matching implementation; the cheap empirical check it
           * asks for is a reachability test, which is why one exists in
           * tests/routes.test.tsx.
           */
          { path: '/issues', lazy: () => import('@/features/issues/IssueListScreen').then((m) => ({ Component: m.IssueListScreen })), ErrorBoundary: EB },
          { path: '/issues/new', lazy: () => import('@/features/issues/CreateIssueScreen').then((m) => ({ Component: m.CreateIssueScreen })), ErrorBoundary: EB },

          // The Issue Workspace (`/issues/:id`) is NOT here — it is a child of
          // FixedHeightLayout below, so it sits in a different branch from
          // `/issues` and `/issues/new`. Route ranking is global, so splitting the
          // three across branches changes no match.

          { path: '/notifications', lazy: () => import('@/features/notifications/NotificationsScreen').then((m) => ({ Component: m.NotificationsScreen })), ErrorBoundary: EB },
        ],
      },

      {
        /**
         * SIBLING of `DefaultLayout`, never nested inside it — a screen gets one
         * layout, and nesting these two renders both, producing two app headers,
         * two `id="main-content"` elements, and `height: 100vh` inside
         * `min-height: 100vh`, which is the nested-scrollbar regression 07 exists
         * to prevent.
         */
        Component: FixedHeightLayout,
        children: [
          {
            /**
             * ─── WHY THE WORKSPACE IS THE SCREEN THAT GETS THIS LAYOUT ─────────
             * Yogesh's resolved requirement (2026-08-27): "Navigating to a
             * Workspace section resets scroll to the top of the scrolling region.
             * Only the workspace body scrolls; the page itself never does." The
             * shell's crumb, header card, tab strip and approval banner are the
             * pinned region; the section `<Outlet />` is the only scrolling one.
             *
             * NOT THE ISSUE LIST, AND NOT ISSUE ENTRY — 07 contradicts itself on
             * this and both of its answers were wrong for this application. Its
             * normative route tree puts only Issue Entry here, while its
             * layout-count section argues the Issue List needs it. Checked against
             * both screens: `CreateIssueScreen` has no sticky/100vh/overflow
             * behaviour at all, and `IssueListScreen`'s only internal scroll is
             * its filter drawer. Neither has the property 07's own rationale
             * describes, so both stay on `DefaultLayout`. 07 now records the
             * contradiction at both passages.
             *
             * THIS MOVE WAS DEFERRED FROM THE ROUTER MIGRATION ON PURPOSE, and the
             * sequencing bought two clean measurements. Attaching the layout
             * before the sections were split would have put the unsplit screen in
             * a fixed frame with nothing to own the scroll. Instead the migration
             * and the section split each came back pixel-identical across all ten
             * fidelity captures, which means the remaining diff on the five
             * workspace captures is attributable to the scroll container ALONE.
             */
            path: '/issues/:id',
            lazy: () => import('@/features/issues/IssueWorkspaceScreen').then((m) => ({ Component: m.IssueWorkspaceScreen })),
            ErrorBoundary: EB,
            /**
             * ── WORKSPACE SECTIONS ARE A ROUTE SEGMENT, NOT COMPONENT STATE ──
             * BRD NAV-01 requires the active section to be addressable: "a copied
             * link reproduces exactly what the sender saw." 07 implements that as
             * a child route per section with an index route for the default, and
             * gives three reasons beyond addressability — a section is a place
             * rather than a filter; each gets its OWN LAZY CHUNK (so opening an
             * issue does not download what only Communication needs); and each
             * gets its OWN ErrorBoundary, so a failure in History cannot blank
             * the Workspace header and the other four tabs.
             *
             * FIVE SECTIONS, NOT SIX. Issue Priority is deliberately absent: it
             * remains local state in the shell because whether Scoring is a
             * section, a sub-route of Detail, or a modal is an open question
             * owned by PQM (18:219). Adding a sixth route here would answer it
             * silently. See WorkspaceTabStrip for the full record.
             *
             * NO LEGACY REDIRECTS EITHER. Two earlier generations of section keys
             * exist (`LEGACY_TAB_REMAP`: qir, disposition, actions, chronology,
             * scoring), and 07 carries an open placeholder on whether old deep
             * links must keep resolving. Nothing external holds a Workspace deep
             * link in this app yet — the URLs are new as of this change — so the
             * redirects would be speculative. 07's placeholder stays open.
             */
            children: [
              {
                /**
                 * The default section. A loader redirect rather than a
                 * `<Navigate>`: it resolves before anything renders, so there is
                 * no flash of an empty shell, and it keeps `/issues/:id` itself
                 * out of the history as a distinct entry.
                 *
                 * The target is built from `params.id` because `redirect()` does
                 * not resolve relative paths — it takes a location, so a bare
                 * "detail" would resolve against the document root, not the
                 * matched route.
                 */
                index: true,
                loader: ({ params }) => redirect(`/issues/${params.id}/detail`),
              },
              // Relative paths: the parent contributes `/issues/:id`, so these
              // resolve to `/issues/:id/detail` and so on. Each carries its own
              // static ErrorBoundary — a boundary inherited from this parent could
              // not catch a child's own chunk-load failure, because the parent's
              // boundary is only reached after the child's module has already
              // failed to load.
              { path: 'detail', lazy: () => import('@/features/issues/workspace/DetailSection').then((m) => ({ Component: m.DetailSection })), ErrorBoundary: EB },
              { path: 'investigation', lazy: () => import('@/features/issues/workspace/InvestigationSection').then((m) => ({ Component: m.InvestigationSection })), ErrorBoundary: EB },
              { path: 'resolution', lazy: () => import('@/features/issues/workspace/ResolutionSection').then((m) => ({ Component: m.ResolutionSection })), ErrorBoundary: EB },
              { path: 'communication', lazy: () => import('@/features/issues/workspace/CommunicationSection').then((m) => ({ Component: m.CommunicationSection })), ErrorBoundary: EB },
              { path: 'history', lazy: () => import('@/features/issues/workspace/HistorySection').then((m) => ({ Component: m.HistorySection })), ErrorBoundary: EB },
            ],
          },

        ],
      },

      {
        // Third sibling. Admin screens attach HERE, never under DefaultLayout.
        Component: AdminLayout,
        children: [
          { path: '/admin', lazy: () => import('@/features/admin/AdminScreen').then((m) => ({ Component: m.AdminScreen })), ErrorBoundary: EB },
        ],
      },

      {
        // Registered last, and the catch-all lives here. Splat routes rank lowest
        // by specificity, so this cannot shadow anything above regardless of
        // position — the ordering is for readability, not correctness.
        Component: BlankLayout,
        children: [
          { path: '*', lazy: () => import('@/features/notfound/NotFoundScreen').then((m) => ({ Component: m.NotFoundScreen })), ErrorBoundary: EB },
        ],
      },
    ],
  },
]

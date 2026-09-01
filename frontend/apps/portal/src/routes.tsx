import { redirect, type RouteObject } from 'react-router'
import { RouteErrorBoundary } from '@/app/RouteErrorBoundary'
import { redirectPreservingQuery, requireCapability } from '@/app/capabilityGuard'
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
 * VERSION NOTE — SUPERSEDED, AND THE BLOCKER IT RECORDED IS GONE. This note used
 * to read that `react-router-dom` was pinned at 6.30.6, that no bump was needed,
 * and — the part that mattered — that `middleware` was ABSENT from 6.30.6 and is
 * "a v7.3+/v8 field", so 08-authentication-and-authorization.md's
 * `requirePermission` design "CANNOT be attached on this dependency at all".
 *
 * THE DEPENDENCY HAS MOVED. The package is now `react-router` at ^8.3.1 — the
 * v7 `react-router-dom` is a deprecated re-export shim and stopped at 7.18.3, so
 * v8 is only available under the new specifier. Two consequences worth stating
 * where the next reader will look:
 *
 *   1. `middleware` IS NOW AVAILABLE. The condition the old note set for 08's
 *      auth chain — "the dependency has to move first" — is satisfied. The root
 *      route below was deliberately shaped to receive it. It is STILL NOT WIRED,
 *      because most of 08 is unimplemented and there is nothing real to gate on;
 *      what changed is that this is once again a scheduling choice rather than a
 *      hard dependency limit.
 *   2. react-router@8 peers `react >=19.2.7`. It was UNREACHABLE on React 18.3.1
 *      and became installable only as part of the React 19 upgrade. The two moves
 *      are ordered, not independent — anything that rolls React back to 18 rolls
 *      this back too.
 *
 * The v7 `future` flags are not set anywhere: every one of them describes
 * behaviour that is unconditional in v8, so a flag object here would be dead
 * configuration. They were briefly enabled on 6.30.6 to prove the behaviour
 * change in isolation from the API change; the full suite passed under them
 * before the package was swapped.
 *
 * ── What this pass deliberately does NOT build ─────────────────────────────────
 * Each of these is an explicit exclusion, not an oversight:
 *   · The auth middleware chain — see the version note above, and most of 08 is
 *     unimplemented, so there is nothing real to gate on yet.
 *   · ~~A `/qir` or `/tsb` route~~ — WITHDRAWN 2026-08-30. This entry said the
 *     nav "renders them disabled, which is fidelity to the design". It does not:
 *     `AppHeader` renders both as live links, so both primary tabs fell to the
 *     catch-all and showed Not Found. The exclusion was written when the nav
 *     really did disable them and was never revisited when that changed — which
 *     is how a stale guardrail hides a live defect. Both are routed below, to
 *     the stub screens that already existed unrouted in `features/qir` and
 *     `features/tsb`, matching the Vue predecessor's own stub pages.
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

/**
 * Every lazily-loaded route carries this, and only lazily-loaded routes do.
 *
 * ⚠️ CHANGED 2026-08-30, FROM `ChunkLoadErrorBoundary` — WHICH RENDERED NOTHING.
 * That was a React class boundary, but React Router renders the `ErrorBoundary`
 * route property IN PLACE OF the element rather than around it: no children, no
 * error prop, and `useRouteError()` is how the error is read. The class
 * therefore rendered `props.children` — `undefined` — so every route error
 * produced a blank content area, and the chunk-reload in its `componentDidCatch`
 * never ran at all. See `RouteErrorBoundary` for the measurement.
 */
const EB = RouteErrorBoundary

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
      { index: true, loader: redirectPreservingQuery('/dashboard') },

      {
        // No ErrorBoundary on any layout route: they are STATICALLY imported, so
        // there is no chunk that can fail, and `RouteErrorBoundary` on one
        // would be dead code wearing an authoritative name. 07 corrected its own
        // earlier revision on exactly this point. It would also be actively
        // worse when it fired — a route's boundary replaces that route's own
        // element, so a boundary here would take the app chrome down with the
        // error instead of replacing only the page.
        Component: DefaultLayout,
        children: [
          { path: '/dashboard', lazy: () => import('@/features/dashboard/DashboardScreen').then((m) => ({ Component: m.DashboardScreen })), ErrorBoundary: EB },

          // The issue LIST is the only `/issues*` route on this layout. It is a
          // document-scrolling table with no pinned chrome, in the prototype and
          // in the port. Its two siblings — `/issues/new` and `/issues/:id` —
          // both own internal scroll regions and live under FixedHeightLayout
          // below. Route ranking is global, so splitting them across branches
          // changes no match; see the note there.
          { path: '/issues', lazy: () => import('@/features/issues/issue-list/IssueListScreen').then((m) => ({ Component: m.IssueListScreen })), ErrorBoundary: EB },

          { path: '/notifications', lazy: () => import('@/features/notifications/NotificationsScreen').then((m) => ({ Component: m.NotificationsScreen })), ErrorBoundary: EB },

          /*
           * ─── QIR AND TSB — PREVIOUSLY UNROUTED, AND THE NAV LINKED TO THEM ────
           *
           * The header renders "QIR Management" and "TSB Management" as real
           * links to `/qir` and `/tsb`. Neither path existed, so both fell to the
           * catch-all and rendered Not Found — two of the four primary tabs were
           * dead.
           *
           * This file's own header said the nav "renders them disabled, which is
           * fidelity to the design". That was true once and is not true now; the
           * note is corrected below. Routing them is the smaller change and the
           * honest one — the screens exist, the design has the tabs, and a
           * primary tab that 404s is worse than either a disabled tab or a stub.
           *
           * Both screens are stubs, exactly as in the Vue predecessor
           * (`pages/QirManagement.vue`, `pages/TsbManagement.vue`). They say the
           * module is not built rather than pretending otherwise.
           */
          { path: '/qir', lazy: () => import('@/features/qir/QirManagementScreen').then((m) => ({ Component: m.QirManagementScreen })), ErrorBoundary: EB },
          { path: '/tsb', lazy: () => import('@/features/tsb/TsbManagementScreen').then((m) => ({ Component: m.TsbManagementScreen })), ErrorBoundary: EB },
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
          /**
           * ─── WHAT QUALIFIES A SCREEN FOR THIS BRANCH ──────────────────────────
           * One property, and only one: THE SCREEN PINS ITS OWN CHROME AND OWNS AN
           * INTERNAL SCROLL REGION. A screen here must supply that region itself —
           * `FixedHeightLayout`'s `<main>` is the fixed frame and does not scroll,
           * so a child without its own `overflow-y` region is clipped at one
           * viewport.
           *
           * Stated as a property rather than as a list of which screens are in and
           * which are out, deliberately. The list form was here before and went
           * stale the moment a screen changed — and worse, it recorded a fact about
           * the IMPLEMENTATION ("CreateIssueScreen has no sticky/overflow
           * behaviour") as though it settled a question about the DESIGN. It did
           * not: the UX prototype specifies a sticky action row and a scroll port
           * for Issue Entry, so the screen qualified all along and only the code
           * lagged. Ask the property, and check it against the prototype.
           *
           * ORDER AND BRANCH ARE IRRELEVANT TO MATCHING, which is what makes this
           * split safe: React Router ranks branches GLOBALLY by specificity, not
           * per-branch and not by declaration order. Static segments score 10
           * against a dynamic segment's 3, so `/issues/new` outranks `/issues/:id`
           * wherever each sits. Getting that wrong makes Issue Entry unreachable —
           * `:id` swallows the literal "new" and renders the Workspace with
           * `id === "new"` — so `tests/routes.test.tsx` pins it with a reachability
           * test rather than leaving it to this comment.
           */
          {
            /**
             * ISSUE ENTRY. Per the UX prototype: a sticky action row carrying Clear
             * and Register Issue (`position:sticky;top:42px;z-index:38`) above an
             * internal scroll port (`data-createport`, `overflow-y:auto`). The form
             * body scrolls; the actions stay reachable without scrolling back up,
             * which is the whole point of pinning them.
             */
            path: '/issues/new',
            lazy: () => import('@/features/issues/CreateIssueScreen').then((m) => ({ Component: m.CreateIssueScreen })),
            ErrorBoundary: EB,
          },
          {
            /**
             * ─── THE ISSUE WORKSPACE ──────────────────────────────────────────
             * Yogesh's resolved requirement (2026-08-27): "Navigating to a
             * Workspace section resets scroll to the top of the scrolling region.
             * Only the workspace body scrolls; the page itself never does." The
             * shell's crumb, header card, tab strip and approval banner are the
             * pinned region; the section `<Outlet />` is the only scrolling one.
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
              { path: 'sharing', lazy: () => import('@/features/issues/workspace/SharingSection').then((m) => ({ Component: m.SharingSection })), ErrorBoundary: EB },
            ],
          },

        ],
      },

      {
        // Third sibling. Admin screens attach HERE, never under DefaultLayout.
        Component: AdminLayout,
        children: [
          {
            path: '/admin',
            /*
             * GATED BEFORE THE SCREEN MOUNTS. `AdminScreen` also refuses to
             * render for a non-admin, and that check stays as defence in depth —
             * but it runs only after the component has mounted and its hooks have
             * fired. The loader redirects first, so the route is never entered.
             *
             * It does NOT stop the chunk being fetched: React Router runs `lazy`
             * in parallel with `loader`. Verified in a browser, and recorded in
             * `@/app/capabilityGuard` rather than assumed either way.
             */
            ...requireCapability('admin'),
            lazy: () => import('@/features/admin/AdminScreen').then((m) => ({ Component: m.AdminScreen })),
            ErrorBoundary: EB,
          },
        ],
      },

      /*
       * ─── VUE PATH PARITY ─────────────────────────────────────────────────────
       *
       * The Vue predecessor routes the same four primary tabs at `/overview`,
       * `/issue-management`, `/qir` and `/tsb`. Two of those already match; the
       * other two are named `/dashboard` and `/issues` here.
       *
       * THAT NAMING DIFFERENCE IS A RECORDED DECISION, not an oversight — see
       * this file's header and 07's Divergence table, which judge the rename not
       * worth it in a port whose acceptance test is pixel fidelity. So the
       * canonical paths are left alone and the Vue spellings REDIRECT onto them.
       *
       * What that buys: a link written against the Vue app, or typed from muscle
       * memory, resolves here instead of 404ing. What it avoids: two live URLs
       * for one screen, which is what an alias (rather than a redirect) would
       * create, and which makes "what is the address of the issue list?"
       * unanswerable.
       *
       * `/` had no route at all and fell to the catch-all — the bare origin
       * rendered Not Found. It now lands on the first primary tab, as Vue's
       * `{ path: "/", redirect: { name: "overview" } }` does.
       */
      /*
       * `loader: () => redirect(...)`, not an `<element>` rendering `<Navigate>`.
       * A loader redirect resolves BEFORE anything mounts, so the browser never
       * paints the old URL's layout for a frame and no component instance is
       * created only to unmount itself. It is also the idiom this file already
       * uses (`redirect` was imported for it).
       */
      { path: '/', loader: redirectPreservingQuery('/dashboard') },
      { path: '/overview', loader: redirectPreservingQuery('/dashboard') },
      { path: '/issue-management', loader: redirectPreservingQuery('/issues') },
      {
        // The splat carries the rest of the path, so
        // `/issue-management/HV-260101/investigation` keeps its id AND section
        // rather than dropping the user on the list. `/issue-management/new`
        // rides the same rule and needs no separate entry.
        path: '/issue-management/*',
        loader: ({ params }) => redirect(`/issues/${params['*'] ?? ''}`),
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

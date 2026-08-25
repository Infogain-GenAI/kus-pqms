# 07 — Routing and Layouts
**Tier:** 1
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
Router architecture, the middleware/loader division of responsibility,
the layout components and how routes attach to them, the concrete route
tree, and where route-target components live.

**This file owns the route tree**, and three other files depend on it:
08-authentication-and-authorization.md for where its middleware
attaches, 03-react-component-patterns-and-naming.md for where
`ErrorBoundary` is declared, and 12-performance-guidelines.md for the
lazy-loading claim it builds on. A change here is a change to all
three — check them.

## Router: React Router v8, data mode, nested layout routes
**Layouts are parent routes in the tree.** A layout wraps its children
via `<Outlet />`, and which layout a screen gets is expressed by where
that screen sits in the tree — not by a field on the route, and not by
a runtime lookup.

**Do not implement layout selection as a route-metadata field.** A
`meta.layout`-style string resolved against a registry at render time
is flat by construction, and two mechanisms this corpus already commits
to are **non-functional** against a flat structure — not degraded,
non-functional:

- **08's middleware chain nests.** `requirePermission` attaches per
  route and executes root → parent → child, with a child's middleware
  running only after its parent calls `next()`. A flat set of routes
  under one shared slot has no parent/child relationship for that chain
  to walk.
- **03's `ErrorBoundary` resolves by tree position.** It is scoped to
  "the closest such boundary in the route tree above where the error
  occurred". There is no closest-boundary-above when every route sits
  at the same depth.

Provenance for the prohibition rather than the rule: `kus-pqms` did use
a `meta.layout` string looked up in a `layoutRegistry` and rendered by
`App.vue`, giving exactly one layout slot for the whole app. That
worked there because Vue Router offered no per-route middleware chain
and no route-level error boundary — neither mechanism existed to
conflict with it. Both exist here, which is why the pattern is ruled
out rather than carried forward.

## The middleware/loader ownership rule
Neither 05-api-integration-and-data-fetching.md nor
08-authentication-and-authorization.md draws this line, so it is
established here:

**Middleware** — the root middleware and `requirePermission`, per 08 —
handles authentication and authorization only. It decides whether a
navigation is allowed to proceed; it does not fetch or shape any data a
screen displays.

**Loaders**, where a route has one at all, are for route-param
validation and redirects only (e.g. confirming an `:id` segment is
well-formed before the route renders, or performing a redirect like the
`/issues` back-compat case below). A loader is never the place view data
comes from.

**All server state is owned by TanStack Query hooks called from
components**, per 05-api-integration-and-data-fetching.md — never from
a loader. A component's own `useQuery` call is what fetches the issue
record, the notification list, the QIR data, or anything else a screen
displays, regardless of whether that component's route also happens to
have a loader for an unrelated reason.

One direct consequence, stated plainly so it isn't mistaken for a gap:
**most routes in this app have no loader at all.** Given the division
of labour — middleware owns auth, TanStack Query owns data, loaders own
neither — a route needs a loader only when it requires param validation
or a redirect, and most routes in the tree below require neither. A
route with no `loader` is the correct, intended shape of this design,
not something left unfinished.

## The layout components
**These are app-level components in `apps/portal/src/layouts/`,
not `ui-library` components** — so they fall *outside*
01-project-structure-and-architecture.md's component-specification gap,
and this file specifies them. They are also part of the portal shell,
which 01 says starts immediately, so they cannot wait on a later pass.

Three are specified here. Two are not, and that is stated rather than
implied.

### `DefaultLayout` — the standard app chrome
The layout almost every screen uses. Renders the shared app header,
then the page content inside a `<main>` element carrying
`id="main-content"`.

- **`min-height: 100vh`** — the page grows naturally and the window
  scrolls. This is the normal behaviour.
- **Exactly one `id="main-content"` per rendered page.** This is the
  `<main>` landmark's own id.

  **Not what 11's focus hook targets — an earlier revision of this
  passage said it was.** 11-accessibility-standards.md's route-change
  focus management moves focus to **the new route's main heading**
  (e.g. the page's own `<h1>`), not to this id — 11 was read for a
  claim it does not make. A duplicate `id="main-content"` is still
  worth avoiding: two elements sharing an id is invalid HTML and breaks
  any other consumer that queries by it. That is this file's own
  reason, not 11's.

  **What else this id is for — RESOLVED.** It is the **skip-link
  target**. 11-accessibility-standards.md now owns WCAG 2.4.1 Bypass
  Blocks and requires every layout to render a skip-link, visually hidden
  until focused, pointing here. So this id is load-bearing for two things
  — the `<main>` landmark and the skip-link — and for neither of the
  route-change focus behaviours, which target the page's main heading.

  The earlier revision that called this "the target for skip-links" was
  therefore **right about the id and wrong about its sourcing**: no file
  specified a skip-link at the time, so the claim was unsupported when it
  was made. It is supported now.

### `FixedHeightLayout` — viewport-locked, internally scrolling
A screen that pins its own header and action row while its body scrolls
independently. Renders the same app header and the same
`<main id="main-content">`, but:

- **`height: 100vh`**, not `min-height` — the layout is exactly one
  viewport tall.
- **`<main>` scrolls internally.** The window itself does not scroll.

**This is a real UI requirement, not a workaround.** Issue Entry is a
long multi-section form with a persistent action row; that row has to
stay visible while the form body scrolls. Stating it as a requirement
matters because the temptation is to treat it as a variant of
`DefaultLayout` and add a prop.

**Do not do that — keep it a separate layout.** Provenance for why the
warning is this emphatic: in `kus-pqms`, this behaviour was first
applied directly to the shared default layout, and it **broke Issue
List's scrolling** by introducing a nested scrollbar on every screen
that shared that layout. It was reverted and rebuilt as a separate
opt-in layout. The regression has not happened in this repo and cannot,
as long as the two stay separate — which is the entire reason they are
separate.

### `BlankLayout` — no chrome
No header, no `<main>` wrapper beyond what the page provides. Used for
the catch-all 404 route, where app chrome around a "not found" message
is noise.

### `AdminLayout` — specified shape, no routes yet
Exists as a layout route in the tree with **no children yet**. When
admin screens are built they attach here, not under `DefaultLayout`.
Its chrome is **[PLACEHOLDER — whether admin screens need distinct
chrome from `DefaultLayout`, or whether `AdminLayout` is a separate
layout purely for the route-tree branch, is unspecified. Decide when
the first admin screen is specified.]**

### `AuthLayout` — purpose unspecified; this is a real gap
**No route uses this layout, and no route is specified that would.**
This is not "a layout waiting for its screens" — it is a layout whose
reason to exist has never been established, and it should not be built
until it has one.

The reason for doubt is specific: **this app has no login screen.** Per
08 the entire authentication surface is Entra's own hosted sign-in UI,
reached by redirect — and 11 confirms it, stating that this app never
implements its own credential-entry screen. A layout for a login page
has nothing to wrap.

**What would give it a purpose** — and neither is settled:

- **A redirect-callback route.** MSAL's redirect flow returns to a
  configured `redirectUri`, and 08 specifies
  `handleRedirectPromise()` handling it. If that `redirectUri` is a
  dedicated route (`/auth/callback`), it needs a chrome-less layout —
  though `BlankLayout` would serve. If it is the app root, no route is
  needed at all. **08 now records this as a placeholder** — see its
  "`redirectUri` — unspecified, and it gates the callback route"
  section, which also states the hard requirement that whatever the
  target is, it must be reachable without passing the auth middleware.
- **A signed-out or session-expired screen.** Nothing in this corpus
  calls for one.

**[PLACEHOLDER — do not build `AuthLayout` until a route needs it.
Resolving it requires 08 to specify the MSAL `redirectUri` and whether
a callback route exists. That in turn depends on 08's open question
about whether the browser holds a token at all — if authentication
terminates at a gateway, there is no redirect callback to handle.
Trigger: before auth implementation begins, alongside that question.]**

Provenance: `kus-pqms` had five layout components including `AuthLayout`
and `AdminLayout`, both fully built with zero routes pointing at them.
That is why they appear here at all — but "it existed there" is not a
reason to build something, which is why the two unused ones are treated
differently from the three above.

## Route tree
**The route tree to build.** Route-target names are the thin
`src/pages/` wrapper components per the "Route/page folder convention"
section below, hence the uniform `*Page` suffix — the real feature UI
they render lives under `components/<Module>/<Feature>/`.

Provenance: the paths, the module set, the `/issues` back-compat
redirect and the `/` → `/overview` landing all come from `kus-pqms`'s
router. Two things in that router are **deliberately not carried
forward**, recorded so their absence is not read as an oversight:

- **No `/ui-kit` route.** `kus-pqms` had one — an in-app component
  gallery. It is **redundant here**: per
  01-project-structure-and-architecture.md, Storybook is this project's
  component verification surface, and a second gallery route inside the
  app would be a parallel thing to maintain, ship, and keep in sync.
  Build the Storybook builder instead. If a reason for an in-app
  gallery emerges later, it is a new decision and needs one.
- **No landing page component.** `/` is a redirect to `/overview`, not
  a screen. `kus-pqms` retained an unrouted home-page component from an
  earlier navigation structure; there is nothing to carry forward.

```
Root (pathless root route)
  middleware: [authMiddleware]        ← 08's root-level auth middleware
  [EB]

  /                                  → redirect → /overview

  DefaultLayout (layout route)
    /overview                        → OverviewPage                [EB]
    /qir                             → QirManagementPage           [EB]
    /tsb                             → TsbManagementPage           [EB]
    /notifications                   → NotificationsPage           [EB]
    /issue-management                (parent route)
      (index)                        → IssueListPage               [EB]
      /issue-management/:id          → IssueWorkspacePage          [EB]

  FixedHeightLayout (layout route — SIBLING of DefaultLayout)
    /issue-management/new            → IssueEntryPage              [EB]
                                       middleware: [requirePermission("issue:create")]

  /issues                            → redirect → /issue-management (back-compat)

  AdminLayout (layout route — third sibling, no children yet)
    (no routes)                      → admin screens attach HERE when built,
                                        as children of AdminLayout — never
                                        under DefaultLayout

  BlankLayout (layout route, registered last)
    /*  (catch-all)                  → NotFoundPage                [EB]
```

### Divergence — the N-PQMS ISM port's actual routes, 2026-08-25

The tree above is the target. **The shipped application differs, and the
differences are deliberate rather than drift.** Recorded so the gap is visible;
**no route was changed to match this file**, because route paths are behavioural
and scope is governed elsewhere.

| This file specifies | The application has | Why |
|---|---|---|
| `/overview` | `/dashboard` | naming only; same screen |
| `/issue-management`, `/issue-management/:id`, `/issue-management/new` | `/issues`, `/issues/:id`, `/issues/new` | naming only; same three screens, same shapes |
| `/issues` → redirect to `/issue-management` | *(no redirect — `/issues` is canonical here)* | the back-compat alias is inverted, so it is unnecessary |
| `/qir` → `QirManagementPage` | **no route** — nav item rendered and disabled | **out of scope**, per `frontend/README.md` |
| `/tsb` → `TsbManagementPage` | **no route** — nav item rendered and disabled | **out of scope**, per `frontend/README.md` |
| `AdminLayout` with no children | `/admin` under the single layout route | one layout exists, not four |
| `/notifications` | `/notifications` | ✅ matches |
| `/` → redirect, `/*` → catch-all | both present | ✅ matches |

**QIR and TSB are the substantive rows, and they are not omissions.** The
README's guardrails name them explicitly as out of scope alongside issue
scoring/severity, EWS/GQIS ingestion and cross-org sharing. The prototype shows
the nav items, so the port renders them **disabled** — which is fidelity to the
design, not an unfinished route. **The README governs scope; this file governs
route shape.** Where they meet, scope wins, and a route this corpus names does
not become in-scope by being named here.

**The naming rows are cosmetic and are not worth a rename.** `/issues` versus
`/issue-management` changes every link, every `useNavigate` call and every
bookmark, in a port whose acceptance test is pixel-fidelity — for no behavioural
gain. If the names are ever unified, that is a deliberate migration with the
back-compat redirect this file already specifies, not a tidy-up.

`AdminLayout` appears in the tree with no children rather than being
omitted, because leaving it out would force whoever adds the first
admin screen to infer where it goes — and the likely wrong guess is
`DefaultLayout`. It is a **sibling** of `DefaultLayout` and
`FixedHeightLayout`, for the same reason those two are siblings of each
other: a screen gets one layout, not two nested ones.

`AuthLayout` is **absent from the tree entirely**, which is deliberate —
see "The layout components" above for why its purpose is unspecified.
If a route ever needs it, it becomes a fourth sibling, never a nested
route.

`[EB]` = `ErrorBoundary: ChunkLoadErrorBoundary`, declared statically on
that route's own config object.

**`[EB]` marks every lazily-loaded route, and only those.** Only a
route's own static declaration can catch that route's own chunk-load
failure, per 03-react-component-patterns-and-naming.md's
"Chunk-load-failure detection" — a boundary inherited from a parent
cannot, because the parent's boundary is reached only after the child's
module has already failed to load.

Three kinds of route in the tree carry no `[EB]`, all deliberately:

- **The layout routes** (`DefaultLayout`, `FixedHeightLayout`,
  `AdminLayout`, `BlankLayout`). Their components are **statically
  imported**, not lazy — see "Lazy loading" below — so they have no
  chunk to fail. The **root route keeps its boundary**, because it is
  the catch-all for everything that bubbles.
- **The two redirect routes** (`/` and `/issues`). No component, no
  chunk. They do have a loader, and a loader can throw — that throw
  bubbles to the root boundary, which exists. Covered, just not by a
  boundary of their own, which would be dead code.
- **The `/issue-management` parent route.** A pathless-content parent
  that only renders an `<Outlet />`; its children carry their own.

Everything with a lazily-imported page component has one.

**The root route exists so the authentication middleware has somewhere
to attach.** 08-authentication-and-authorization.md's root-level
authentication middleware is attached via a route's `middleware` array,
and its `requirePermission` middleware runs as a nested chain that
executes only after its parent's `next()`. A flat set of top-level
siblings gives neither mechanism anything to attach to or nest through;
per 08's own statement of the failure mode, a `requirePermission`
middleware whose parent never ran "reads an empty context and denies
every protected route." The root route is pathless — it contributes no
URL segment and renders only an `<Outlet />` — so it changes no path in
the tree while giving the chain its required root.

**`FixedHeightLayout` is a sibling of `DefaultLayout`, never nested
inside it.** A screen gets exactly one layout. Nested layout routes do
not work that way — a parent layout route and a child layout route
**both** render, the child inside the parent's `<Outlet />`.

Nesting these two would therefore produce, on every Issue Entry
render: two app headers, two elements carrying `id="main-content"` —
invalid HTML, and a defect for any code that queries by that id (11's
own focus-management hook is not one of them: per its "Focus
management on route navigation" section, it targets the page's main
heading, not this id) — and `FixedHeightLayout`'s `height: 100vh`
inside `DefaultLayout`'s `min-height: 100vh` — which is the
nested-scrollbar failure "The layout components" above exists to
prevent. Siblings, not parent and child.

Because the two layouts are now separate branches,
`/issue-management/new` is written as an absolute path under
`FixedHeightLayout` rather than as a child of the `/issue-management`
parent route. **This does not change match priority, and the reason is
worth recording rather than re-deriving, because getting it wrong makes
Issue Entry unreachable** — `:id` would swallow the literal `"new"` and
render Issue Detail with `id === "new"`.

**Route ranking is global across the whole tree, not per-branch.**
Verified against React Router's matching implementation
(`packages/react-router/lib/router/utils.ts`): `flattenRoutes` first
flattens the config into a flat list of branches, each carrying the
**full** path built by `joinPaths([parentPath, relativePath])` — so a
branch's score is computed from its complete root-to-leaf path, not
from its position among siblings. `rankRouteBranches` then sorts
**every** branch against every other by that score:

```
branches.sort((a, b) =>
  a.score !== b.score
    ? b.score - a.score                    // higher score first, globally
    : compareIndexes(/* sibling order */)  // tie-break only
);
```

Sibling order (`compareIndexes`) is consulted **only when two branches
score equal** — its own source comment scopes it to "routes with
identical paths." Scoring weights static segments far above dynamic
ones (`staticSegmentValue = 10` vs `dynamicSegmentValue = 3`), so
`/issue-management/new` (two static segments) outranks
`/issue-management/:id` (one static, one dynamic) by a wide margin.
Different branches, different parents, and registration order are all
irrelevant to that comparison.

Two things that make this hold for the tree above specifically: the
layout routes are **pathless**, so they contribute no segment to either
joined path (both resolve to exactly the two paths compared above), and
the scores differ, so the sibling tie-breaker never engages. **Net: the
static segment wins on specificity, with no dependence on declaration
order** — which means the two can live in different branches safely.

*(An earlier revision left a dangling `Net` on its own line, an editing
artifact that survived three review rounds. Repaired.)*

Provenance, stated precisely: this is verified against the
**implementation** and against React Router's authored routing-concepts
documentation ("Static segments (highest priority)… Dynamic segments…
Splat routes (lowest priority)"; "**Order matters less** — the router
ranks by specificity automatically"; and its own `/teams/new` before
`/teams/:id` before `/teams/*` example, which is this exact case).
`reactrouter.com`'s `matchRoutes` API page and framework routing guide
do **not** document the ranking algorithm, so neither can be cited for
it. Re-confirm empirically when the router is actually built — a
reachability test for `/issue-management/new` is the cheap check.

**Concrete route config**:
08-authentication-and-authorization.md fully specifies the
requirePermission mechanism itself; this file provides the concrete
route-object instantiation against this app's actual paths, layouts,
and lazy imports, which 08 does not include. Per 08's settled design, attaching
the `requirePermission` middleware to a route's `middleware` array *is*
the declaration of the requirement — there is no separate metadata
field alongside it. Provenance: `kus-pqms` declared the requirement in
a `meta.requiresCapability` value read by a global guard — that
metadata field is **not** carried forward; attachment is the
declaration.

The root route and the two sibling layout routes, with `issue-entry` as
the one route that carries a permission requirement:

```ts
{
  // Pathless root: the attachment point for 08's authentication
  // middleware, and the parent whose next() the child chain runs after.
  middleware: [authMiddleware],
  ErrorBoundary: ChunkLoadErrorBoundary,
  children: [
    {
      // No ErrorBoundary: statically imported, so no chunk to fail.
      Component: DefaultLayout,
      children: [
        /* /overview, /qir, /tsb, /notifications,
           /issue-management (+ index, :id) — each page with its own
           lazy import and its own ErrorBoundary */
      ],
    },
    {
      // Sibling of DefaultLayout, not nested inside it. No
      // ErrorBoundary, for the same reason.
      Component: FixedHeightLayout,
      children: [
        {
          path: "/issue-management/new",
          lazy: () => import("../pages/IssueEntryPage").then((m) => ({
            Component: m.default,
          })),
          middleware: [requirePermission("issue:create")],
          ErrorBoundary: ChunkLoadErrorBoundary,
        },
      ],
    },
  ],
}
```

`ErrorBoundary` is set directly on the route object, alongside
`middleware` — both are known before the lazily-imported module ever
resolves, which is exactly the property this needs per 03's
static-declaration requirement.

**An earlier revision of this config set `ErrorBoundary` on
`DefaultLayout` and `FixedHeightLayout` too, contradicting the `[EB]`
legend above. The config was wrong and has been corrected; the legend
stands.** Recorded because the opposite conclusion is reachable — a
layout route *is* the nearest boundary for render errors in its
subtree, which looks like a reason to give it one. Three things make it
the wrong call here:

- **`ChunkLoadErrorBoundary` is chunk-specific.** A statically imported
  layout has no chunk, so on a layout route it is dead code wearing an
  authoritative name.
- **Every page route already has its own.** Nothing in the subtree is
  unprotected, and the root boundary catches anything that bubbles past
  them.
- **A layout-level boundary is actively worse when it fires.** A
  route's boundary replaces that route's own element, so a boundary on
  `DefaultLayout` takes the app chrome down with the error. The
  page-level boundary keeps the header and nav and replaces only the
  page — which is the better failure mode, and the reason per-page
  boundaries are the rule rather than a redundancy.

## Workspace sections are a route segment, not component state
**The Issue Workspace has five sections and BRD `NAV-01` requires the
active one to be addressable**: "every screen is addressable by URL and
deep-linkable… filter state, active section and pagination are
URL-encoded, so a copied link reproduces exactly what the sender saw."
The tree above has `/issue-management/:id` and no way to say which
section.

**The scheme: a child route per section**, with an index route for the
default.

```
/issue-management/:id                 (parent, renders the Workspace shell)
  (index)          → redirect → detail
  /detail          → DetailSection            [EB]
  /investigation   → InvestigationSection     [EB]
  /resolution      → ResolutionSection        [EB]
  /communication   → CommunicationSection     [EB]
  /history         → HistorySection           [EB]
```

**Child routes rather than a search parameter, for three reasons:**

- **A section is a place, not a filter.** A search parameter is the right
  shape for state that modifies what a screen shows; a section changes
  what screen you are on. Filter state on the Issue List is a search
  parameter for exactly the opposite reason.
- **It gives each section its own lazy chunk**, so opening an issue does
  not download the markdown editor that only Communication needs. That
  matters here specifically —
  12-performance-guidelines.md requires the editor to load when its
  section opens rather than when the route does, and a child route is the
  natural boundary for it.
- **It gives each section its own `ErrorBoundary`**, so a failure in
  History does not blank the Workspace header and the other four tabs.

**The tab strip is navigation, not state.** Each tab is a `NavLink` to
its sibling route, which means `aria-current` is correct for free and
browser Back moves between sections — both of which a component-state tab
strip has to reimplement badly.

**Legacy deep links.** Two earlier generations of section keys exist —
see 17-domain-glossary-and-business-context.md's note on
`LEGACY_TAB_REMAP`. **[PLACEHOLDER — whether old Workspace deep links
must keep resolving. If yes, it is a redirect route per legacy key, added
here. Trigger: before the Workspace shell ships. Owner: PQM.]** Decide it;
do not discover it from a support ticket.

## Lazy loading
**Every route-target page component is lazily imported.** No page
component ships as a static import, regardless of how small it is, and
there are no named chunks and no prefetch hints.

**Layout components are the exception, and they are static.** A layout
wraps every navigation within its branch, so it is needed on the first
render and every render after — lazily loading it buys nothing and adds
a loading state on every entry to that branch. So in the **Concrete route
config** block above, `Component: DefaultLayout` is a static reference
while every page component uses `lazy: () => import(...)`. *(An earlier
revision said "the config below"; that block is above this section.)*

That distinction is why the `[EB]` legend above marks page routes and
not layout routes: only the lazily-imported ones have a chunk that can
fail.

Provenance: `kus-pqms` was 100% consistent on the page-component half —
every route across every route file used
`component: () => import(...)`, with zero named chunks and zero
prefetch hints. That consistency is worth preserving; it is what makes
the chunk-load boundary a uniform rule rather than a per-route
judgement.

### `splitRouteModules` does not apply to this app — settled, do not re-investigate
React Router v8 promotes `future.v8_splitRouteModules` to a default-on
top-level `splitRouteModules` config option. **It has no effect here,
and it changes nothing about the section above or about
12-performance-guidelines.md's splitting strategy.** Recorded once, with
the reason, so this doesn't get re-opened every time someone reads the
v8 promoted-flags list:

- **It is Framework Mode only.** React Router's own "Automatic Code
  Splitting" page marks it ✅ Framework / ❌ Data / ❌ Declarative. This
  app is **data mode** with an explicit route array (see this file's
  router section, and 03-react-component-patterns-and-naming.md's
  "Given this project's routes are configured as an explicit array (not
  framework-mode file-based routing)"). The feature is not available in
  the mode this app uses.
- **What it splits does not exist here.** It splits the Framework Mode
  route-module exports `clientLoader`, `clientAction`,
  `clientMiddleware`, and `HydrateFallback` into chunks separate from
  the component. This app's route objects have none of those — data
  mode uses `loader`, `Component`, `middleware`, and `ErrorBoundary` on
  a route object, and per "The middleware/loader ownership rule" above
  most routes here have no loader at all.
- **It is configured somewhere this app has no file.** The option lives
  in `react-router.config.ts`, the Framework Mode config consumed by
  the `@react-router/dev` plugin. There is no such file and no reason
  to add one.

So per-route `lazy: () => import(...)` remains the whole of this app's
route-level splitting, exactly as stated above. If this app ever adopts
Framework Mode, this becomes live and both this section and 12 need
revisiting — that is the only trigger.

## Chunk-load-failure handling
This file does not restate the reasoning for how a chunk-load failure
is detected or recovered from — that's fully owned by
03-react-component-patterns-and-naming.md's "Chunk-load-failure
detection" section. What this file owns is only that every
component-bearing route in the tree above references that same shared,
statically-declared `ErrorBoundary` component, per the concrete example
above — not a per-route reimplementation, and not a lazily-exported
`ErrorBoundary` from inside any route's own module. (The two redirect
routes are the sole exception, and only because they have no component
and therefore no chunk to fail — see the `[EB]` legend under "Route
tree" above.)

## Route/page folder convention
01-project-structure-and-architecture.md has zero coverage of where
route files or page components live — confirmed by direct read; it
discusses `components/`, `ui-library` category folders, and
`composables`/`hooks`/`services` grouping, but never a routing or page
folder. Rather than reopening 01 for this, the convention is stated
here:

A `src/pages/` folder holds thin route-target wrapper components —
with the real feature UI living under
`components/<Module>/<Feature>/` — so
`pages/IssueListPage.tsx` renders
`components/IssueManagement/IssueList/IssueList.tsx` and contains no
feature logic of its own.

**The split earns its keep by keeping route concerns out of feature
components.** A page wrapper is where route params, redirects and
layout assumptions live; the feature component underneath can then be
rendered anywhere, including in Storybook, without a router.

Provenance: `kus-pqms` used exactly this split — one thin host component
per route target in `pages/`, real screens under
`components/<Module>/<Feature>/`.

### The precondition — hosts alone do not deliver the benefit

**The split delivers its stated benefit only in combination with a
callback-props refactor. Adopt both, or neither. Adding hosts alone is
ceremony.**

The justification above is *testable*: "the feature component can be rendered
anywhere, without a router." A host does not by itself make that true. If the
screen still calls `useNavigate` for its own in-screen actions — a row click, an
"Open" button, a post-submit redirect — **it still depends on the router, and the
host has bought nothing.** Making it true means lifting those calls into the host
and passing them down as callback props (`onSelectIssue`, `onCreated`), which is
a **content refactor of every screen**, not a folder move.

So the check before applying this convention is not "do we have `pages/`" but:
**would the screens actually be router-free afterwards, and is there a consumer
that benefits?** A test suite, Storybook, or a second embedding all count. If
none exists, the split is structure signalling a property the code does not have
— and that is worse than its absence, because the next reader sees `pages/` and
assumes the decoupling is done.

**Worked counter-example — the N-PQMS ISM port** (see
`decisions/0005-no-page-host-layer-in-this-application.md`). Seven routes, no
nested sub-routes, one layout route. **One** `useParams` in the whole
application; both redirects already in the route table where this file wants
them. But **six of seven screens call `useNavigate`**, and there is no Storybook,
no test suite and no second consumer. Seven host files would have delivered
nothing, so the convention is deferred there rather than applied.

**Scale is the variable, and it is worth naming.** This convention's provenance
is `kus-pqms`, a **124-SFC** application. That is the size at which route-concern
leakage is a real cost and the indirection pays for itself. At seven routes it is
overhead. The rule is not wrong; it had an unstated floor.

## Route metadata is typed, and the type is closed
The prior repository does this and it is the single most valuable routing
pattern to carry forward. It augments the router's metadata interface with
exactly two fields:

```ts
declare module "vue-router" {
  interface RouteMeta {
    layout?: AppLayoutName;
    requiresCapability?: Capability;
  }
}
```

Two consequences, both of which this corpus wants:

- **A typo in a capability name is a compile error**, not a route that silently
  admits everyone. Given that 08-authentication-and-authorization.md gates on a
  38-row matrix, an untyped string here is a security defect waiting for a
  rename.
- **The set of legal layouts is closed.** You cannot reference a layout that
  does not exist.

**React Router's `handle` is `unknown` by default.** That is the gap. Declare a
single `RouteHandle` interface in the route module, type every `handle` against
it, and read it through one typed accessor rather than casting at each call
site. The accessor is also where the "no `handle` at all" case is decided once.

Keep the field set **small and closed**. The prior repository has two fields
after a year of development. A metadata object that grows a field per feature
becomes a second, untyped state container hanging off the route tree.

## Layouts: how many, and the registry
The prior repository built **five** layouts — `default`, `auth`, `admin`,
`blank`, `fixed-height` — and its own architecture notes record that **only
`default` is wired to real routes; `auth`/`admin`/`blank` exist but are
unused.** That is the more useful lesson than the count: four of five were
speculative, and 01-project-structure-and-architecture.md's rule against
scaffolding ahead of content applies to layouts too.

**One of the five is genuinely load-bearing and has no counterpart here.**
`fixed-height`: a full-viewport shell where the page itself does not scroll and
a region inside it does. That is what a data table with a sticky header and its
own scroll container needs, and it cannot be retrofitted onto a
document-scrolling layout without moving the scroll container — which changes
focus behaviour, sticky positioning and `scrollIntoView` everywhere at once.

**Decide this before the issue list is built**, because the issue list is the
screen that needs it.

**RESOLVED — a fourth layout, not a variant.**

A prop on `DefaultLayout` looks cheaper and is not, because the two differ in
**where the scroll container lives**, not in styling:

| | `DefaultLayout` | `FixedHeightLayout` |
|---|---|---|
| Scroll container | the document | a region inside `<main>` |
| `<main>` height | content | `100dvh` minus the header |
| Sticky positioning | resolves against the viewport | resolves against the scroll region |
| `scrollIntoView`, focus restoration, virtualisation | operate on the document | operate on the region |

**A boolean prop that relocates the scroll container is not a variant.** Every
child that positions, scrolls or restores focus behaves differently under it,
and the difference is invisible at the call site — which is the failure mode a
separate, named layout prevents.

Use it for the issue list and any other screen with its own scroll region
(a table with a sticky header, a split pane, a chat-style timeline). Everything
else stays on `DefaultLayout`.

**Build it when the issue list is built, not before** — but decide it now,
because retrofitting it means moving the scroll container under components that
already assumed the document.

### The registry, and why it is not a `switch`
Where layouts are selected by metadata rather than by nesting, the mapping is a
single object asserted against the closed name union:

```ts
export const layoutRegistry = { /* ... */ } as const satisfies Record<AppLayoutName, Component>;
```

`satisfies Record<Name, Component>` makes **adding a name without a component a
compile error**, which a `switch` with a `default` branch does not. Use the same
construction for any other closed name-to-component map.

## `pages/` holds hosts; screens are components
This file reserves the `Page` suffix for `src/pages/`. The prior repository
states the rule this reservation comes from, and the rule is the useful half:

> `pages/` holds thin route hosts. `components/` holds all real UI — including
> every feature screen. A feature module has exactly ONE host page; its screens
> live under `components/<Module>/<Feature>/` and are wired as nested child
> routes.

So a screen component **drops** the `Page` suffix — it is a component, not a
page — and a module gets exactly one page file no matter how many screens it
has. That is why `pages/` stays a readable map of the route surface instead of
becoming a second component folder.

Mapped onto this corpus's feature-folder structure: the host is the route-level
element, the screens are its children, and both live in the feature folder
except the one thin host that lives in `pages/`.

## Relaxing this file's own rules — the shape of a permitted exception
The prior repository routes four top-nav modules when only one is built; the
other three render a "coming soon" empty state. Its architecture document does
not hide this — it names it:

> This intentionally relaxes the repo's usual *"no speculative/placeholder
> feature routes before the feature exists"* rule — **for top-nav targets
> only**, so all four nav links resolve cleanly. When a module is built, replace
> its stub page's body — keep the route `name`. Do **not** create speculative
> routes for anything that isn't a visible top-nav destination.

**That is the template for relaxing any rule in this corpus**: name the rule,
scope the exception narrowly, say what it buys, and say what closes it. An
exception written that way is reviewable. "We made an exception" is not.

## Navigation is data
Nav items are a configuration array filtered by capability — not markup, and not
a component that hard-codes four links. It is the same capability model
08-authentication-and-authorization.md defines, applied to visibility, and it is
what makes a fifth module a one-line change. 01-project-structure-and-architecture.md
owns where the array lives.

# 08 — Authentication and Authorization
**Tier:** 1
**Status:** APPROVED — REVISION 12

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Context
**This file is a specification, and most of what it specifies has never
been built.** That is unusual for this corpus and worth stating up
front, because it changes how the citations below should be read.

Four kinds of statement appear here, and they carry different weight:

1. **Implemented and working** in the prior Vue implementation of this
   product (repo `kus-pqms`) — the three-role, two-capability model and
   its four call sites, the `?denied=1` redirect, the dev role
   switcher. Cited as provenance, checkable, but **superseded** as of
   this revision by the BRD's real role and permission model (see
   "Permission model" below) — kept in the text only where it explains
   *why* something looked the way it did, not as current design.
2. **Committed customer requirements** — BRD/NPQMS-ISM-customized-BRD.md
   (C1.0, **draft for ratification**, 2026-08-20), §7.1–§7.4 (roles,
   capability role model, authorization matrix, data-scope rules),
   AR-06/DEC-07 (auth architecture) and FR-SEC-011 (the
   resolved-permissions endpoint). Binding regardless of what was
   built, and treated as the current best source for this file even
   while its ratification is pending — see 18's BRD-version entry for
   the draft-status caveat. This retires the earlier BRD NFR-05/NFR-08
   citations, which pointed at a prior draft's numbering.
3. **Prior decision records** — ADR 0001 (interim vs. target package
   placement, migration triggers) and
   `frontend/docs/architecture/security/authentication.md`
   (token-storage preference order, auth-store responsibilities). These
   are decisions already taken, which this file either applies or
   explicitly departs from.
4. **Specified here for the first time, with no prior implementation** —
   the MSAL configuration, the middleware chain, the fixtures-mode auth
   bypass, and the `hasPermission`/`usePermissions` API. These carry
   **no provenance qualifier**, because there is nothing to carry
   forward. They are designs to build and to verify against reality the
   first time they run.

**No longer out of scope**: a finer-grained permission-string model
(e.g. `"issue:create"`-style permissions) was previously deferred as
target-state, pending a stable backend/IdP contract. The BRD's
FR-SEC-011 resolved-permissions endpoint and its named-permission
gating model (§7.2's "the matrix is authoritative, the capability
ordering is not") **is** that contract, at the level this file needs.
See "Permission model" below.

## Protocol
**OIDC Authorization Code Flow + PKCE**, IdP **Azure AD / Microsoft
Entra ID**. Redirect-based flow, **not popup**. The sequence:

```
Redirect to Enterprise SSO → Authorization Code → PKCE Validation
→ Exchange Code → Access Token + Refresh Token → Load User/Permissions
→ Navigate
```

Never Implicit, Password, or Client-Credentials flows. No client secret
in the frontend, ever.

Provenance: protocol, IdP and this sequence are all from ADR 0001 and
`authentication.md` — decided before any implementation existed, and
unchanged here.

## Library
**`@azure/msal-browser` + `@azure/msal-react`** — the official
Microsoft libraries for Entra ID in a React SPA.

**No provenance: this is a first specification.** The protocol and IdP
were decided long before (see above), but no OIDC library was ever
installed in any implementation of this product — so every MSAL detail
in this file, including the token-storage decision below, is being
specified rather than described. Verify each against MSAL's own
behaviour the first time it runs.

## Token storage
- The target/eventual preference (per `authentication.md`) is an
  HTTP-only secure cookie, but this requires backend cooperation (a
  BFF/proxy pattern) that doesn't exist in this interim, still-no-real-
  backend state.
- `@azure/msal-browser` itself only supports `cacheLocation` values of
  `sessionStorage`, `localStorage`, or `memoryStorage` — it cannot set
  an HTTP-only cookie, since MSAL runs entirely client-side.
- **Real decision for this interim implementation**:
  `cacheLocation: BrowserCacheLocation.SessionStorage`. Use MSAL's own
  typed `BrowserCacheLocation` enum, not the bare string literal
  `"sessionStorage"`.
  - **This reverses an earlier in-memory specification, and the
    reversal is deliberate.** An earlier decision record specified
    in-memory storage for the interim. That was written before a
    library was chosen, and it is not implementable alongside the
    redirect flow this file commits to (see the `memoryStorage`
    ground below). **Yogesh has approved this reversal** on that
    evidence. It is recorded here rather than left implicit so that
    nobody reading this file later mistakes it for an oversight, and
    so the earlier record's in-memory clause is not re-applied.
  - **`authentication.md` classifies Session Storage as "Last Option
    (Only if approved)".** That qualifier is acknowledged, not
    sidestepped: this section is the record of that approval, granted
    on the grounds and conditions stated here. It is not a free choice
    among equals.
  - `sessionStorage` reduces silent-refresh frequency to roughly hourly
    (Entra access token lifetime) rather than eliminating silent
    refresh entirely — the Safari-ITP-blocked hidden-iframe path still
    exists, just less frequent than with `memoryStorage`'s
    every-refresh trigger. Do not claim the iframe path is gone.
  - Per-tab scope: `sessionStorage` is not shared across tabs, and
    there is no cross-tab logout (no storage event fires). State this
    as known, accepted behavior.
  - New-tab cold-start is specifically a Safari-ITP problem, not
    universal: on Chrome/Edge, a new tab can typically re-authenticate
    silently against the still-valid IdP session cookie; on Safari, the
    hidden-iframe silent-auth path is blocked, producing a full-page
    redirect instead.
  - **Accepted cost, stated plainly**: `sessionStorage` exposes the
    **refresh token** to XSS — not merely a short-lived access token.
    This is the real tradeoff versus `memoryStorage` and it is accepted
    knowingly, not overlooked. MSAL's own guidance is explicit that
    session/local storage is secure "as long as your application
    doesn't have cross-site scripting (XSS) and related
    vulnerabilities," and recommends `memoryStorage` for anyone who
    remains concerned — a recommendation this app cannot take without
    abandoning the redirect flow.
  - **Condition 1 — strict CSP is load-bearing, not hygiene.** The CSP
    specified in 13-security-standards.md's "Content Security Policy"
    section is what makes the above tradeoff acceptable. Any
    relaxation of `script-src` — in particular any move to
    `'unsafe-inline'` or `'unsafe-eval'` — **invalidates the basis of
    this decision** and must come back here for re-decision, not be
    treated as an independent CSP tweak.
  - **Condition 2 — interim only.** This decision is scoped to the
    current no-real-backend state and is revisited when a real
    backend/Entra tenant lands, at which point the cookie/BFF option
    becomes available and is preferred.
  - **`memoryStorage` is ruled out on structural grounds, not
    preference.** MSAL's own documentation lists `memoryStorage` as
    **not supporting the redirect flow** — the flow already committed
    to earlier in this file. The cause is structural rather than
    incidental: the redirect flow's ephemeral artifacts (the PKCE code
    verifier, `state`, and `nonce`) must survive the full-page
    navigation out to Entra and back, and `memoryStorage` is cleared
    on exactly that navigation. Both former workarounds — cookie
    storage for temporary artifacts, and the `temporaryCacheLocation`
    override — are **deprecated in MSAL.js v4**, so there is no escape
    hatch that would let in-memory storage coexist with a redirect
    flow. In-memory and redirect are mutually exclusive under v4; one
    of the two had to give, and the redirect flow was kept.
- **Set `cacheRetentionDays: 0` explicitly.** MSAL v4 retains
  superseded cache artifacts for **5 days by default** to permit a
  rollback. A default that keeps auth artifacts around for five days
  contradicts a storage decision justified on minimizing the exposure
  window, so it is set to `0` — old cache is dropped immediately on
  upgrade. This is a deliberate value, not a default to leave unset.
- Never `localStorage`, per both the old doc and 00-core-rules.md's
  general sensitive-data handling principle. **MSAL v4's localStorage
  encryption does not change this**: MSAL states the encryption exists
  "to reduce the persistence of auth artifacts, **not** to provide
  additional security," and that a bad actor with browser-storage
  access would hold the key anyway. The ban stands.
- The HTTP-only-cookie preference **remains the eventual target** once
  a real backend/BFF exists — this is a documented future migration,
  not a rejected idea. **Escalation trigger**: if new-tab or
  Safari-redirect friction proves unacceptable in UAT, that triggers
  prioritizing the cookie/BFF migration — not a fallback to
  `localStorage`.
- `ssoSilent`-on-boot with an explicit redirect fallback is part of the
  `authReady` bootstrap sequence — see Route-level guards' "Cold-start
  handling" below.

## Permission model
**BRD C1.0 §7.2–§7.4 supersedes this file's prior 3-role/2-value
design.** The prior model (`SE`/`ASM`/`PQM`, `"read"`/`"override"`) was
`kus-pqms`'s implemented shape, carried forward without a committed
requirement behind it — the BRD NFR-05/NFR-08 citations that used to
back it pointed at a prior draft's numbering and are retired.

Five system roles:

```ts
type Role = "SE" | "ASM" | "PQM" | "ADMIN" | "VIEWER";
```

Provenance: BRD/NPQMS-ISM-customized-BRD.md (C1.0, draft for
ratification, 2026-08-20) §7.2.

**Option A (decided): the frontend does not reimplement §7.3's
authorization matrix (38 rows).** It consumes a resolved-permissions
object from the FR-SEC-011 endpoint — "the current user's identity,
roles and resolved permissions... the authoritative source for
client-side gating" — and checks named permission flags against it.
§7.2 states this directly: "the matrix is authoritative, the capability
ordering is not." A coarse role-ordering gate (the old `hasCapability`
model) is exactly the kind of client-side reimplementation this
forecloses, so it is dropped rather than adapted.

**Hard rule, not implicit:** client-side permission checks are
UI-affordance hints only. Server-side enforcement at the
application-service layer is the actual boundary. The BRD states this
as an enforcement rule and calls client-only enforcement "a blocking
review finding" (§7.3, §18.3). This file's job is to gate what the UI
*offers*, never what the backend *allows*.

### ASM naming
`ASM` is "After-Sales Manager / Service Engineer Manager" — a
deliberate compound title, not an unresolved ambiguity (BRD Appendix A;
contradiction X-2 in §0.6). The three-way naming conflict this file
previously tracked (BRD stakeholder table vs. HLD role table vs.
`kus-pqms`'s shipped label) is resolved by the BRD's own consolidation:
one capability role model with a normative organisational-role mapping
(Appendix B.1). `ASM` holds override-equivalent authority — in the new
model, the resolved-permissions set the BRD's `override` capability
implies — not a value this file has to re-derive.

## Permission-checking API
Two-tier, serving the same two calling contexts as before, renamed to
match the vocabulary the BRD actually uses:

- **`hasPermission(permissions: ResolvedPermissions, action: string): boolean`**
  — a bare exported function. It takes the resolved-permissions object
  as an argument and **never reaches into a store internally**, which
  is precisely what makes it callable from both contexts below.
- **`usePermissions()`** — a hook that reads the resolved-permissions
  object from the reactive Zustand store and returns `hasPermission`
  bound to the current user, plus named booleans for components that
  need one.
- **`requirePermission`** — the route middleware (see "Route-level
  guards"), which calls `hasPermission()` supplying the resolved
  permissions from the router context, because middleware runs outside
  React and cannot use hooks.

Both check **named permission keys** (e.g. `"issue:create"`), never
enum comparison against a role or a coarse capability value — that
ordering is exactly what §7.2 says is not authoritative.

**[PLACEHOLDER — resolved-permissions response shape.]** FR-SEC-011
commits to the endpoint's existence and its authority, not its exact
TypeScript shape. Do not invent field names as confirmed. A plausible
shape to verify against the real contract once it exists:

```ts
type ResolvedPermissions = {
  role: Role;
  permissions: string[]; // e.g. ["issue:create", "issue:edit:own", ...]
};
```

**Trigger to resolve:** the real FR-SEC-011 API contract landing.
**Owner:** whoever owns backend/API-contract work — the BRD names no
Backend Lead yet (BRD Q7, a G1 blocker).

### Call sites — build these, and no more
**RBAC threading stays shallow and targeted. Do not add permission
checks to components preemptively "just in case."**

| Call site | Permission checked | Matrix row (BRD §7.3) |
|---|---|---|
| Create-issue button / `issue-entry` route | `"issue:create"` | Create issue: SE/ASM/PQM/ADMIN ✓, VIEWER ✗ |
| ~~Sharing tab config (`useWorkspaceTabs`)~~ | — | **See the note below: this call site probably does not exist under C1.0.** |
| Nav-tab visibility filter (`getVisibleNavItems`) | per nav item | — no navigation item currently declares a permission, so it filters nothing |

Do not describe or test a call site as an access control until its
matrix row is confirmed and server-side enforcement exists behind it —
the client check is the affordance hint, never the control.

#### The Sharing tab: a scope question before a matrix question
An earlier revision of the table above carried a Sharing-tab row with a
placeholder asking *which* §7.3 row it enforces. **That asked the second
question first.**

**BRD C1.0 names no Sharing screen and no Sharing row.** Its Issue
Workspace is **five** sections — Detail, Investigation, Resolution,
Communication, History (§1's proposed solution, §8.1's screen inventory) —
and "Sharing" appears nowhere in §7, §8 or the glossary. The sixth tab
this call site assumed is
17-domain-glossary-and-business-context.md's description of the **prior**
`kus-pqms` six-tab model, which 17 is explicit about describing rather
than committing to.

So there are three possible answers and only one of them is "pick a row":

- **Folded into Communication.** Its "Post an external comment" row is
  already ASM/PQM/ADMIN-gated, which is what the old placeholder's own
  guess pointed at. Most likely.
- **Dropped from Phase 1.** Also fine; nothing depends on it.
- **Still in scope and simply unwritten in C1.0.** Then it needs a matrix
  row *added to the BRD*, not inferred here.

**Do not resolve this by choosing a matrix row.** A row chosen for a
screen that may not exist papers over the scope question underneath it.
**[PLACEHOLDER — does a Sharing surface exist in Phase 1 at all?
Trigger: before the Workspace tab set is implemented. Owner: PQM, via the
BRD.]**

## Token refresh
The refresh **strategy** is now decided: `ssoSilent` on boot (see
Route-level guards' "Cold-start handling" below), `acquireTokenSilent`
for per-request token needs, and `InteractionRequiredAuthError` caught
and converted to a login redirect (see "Two distinct redirect targets"
below) — never left as an uncaught throw.

**All of it is unbuilt, including the wiring.** The strategy above
connects to the HTTP client through the `registerAccessTokenGetter`
seam that 05-api-integration-and-data-fetching.md specifies — and
neither the getter nor the `registerUnauthorizedHandler` handler has an
implementation to register yet.

No provenance: token refresh, expiry detection and silent
re-authentication have never existed in any implementation of this
product. `kus-pqms` declared both seams and registered neither. So
treat this section as a design to verify against MSAL's actual
behaviour, not a description of something that works.

## Auth store (Zustand)
Shape already documented in 04-state-management.md (`currentUser`,
derived `role`/`permissions`, `switchRole` dev-tool kept) — not
duplicated here.

What this file adds is the store's **responsibility boundary**, taken
from `authentication.md`'s target responsibilities list — a prior
decision record, and one that holds regardless of framework:

- **The store holds**: User, Login State, Authentication Status, Roles,
  Permissions, Session Status.
- **The store does not**: call the HTTP client, parse JWTs, or handle
  raw HTTP. Those are MSAL's job and the API client's job
  respectively.

That boundary is what keeps `getState().permissions` a plain readable
field — see "Identity source of truth" below, which depends on it.

## Route-level guards
Two middleware functions: a root-level authentication middleware, and a
`requirePermission` factory attached per route. **Not a loader, not a
wrapper component, and not a route-metadata field** — this is a settled
design, not an open choice.

No provenance for the mechanism: `kus-pqms` used a single global
`router.beforeEach` guard (`capabilityGuard`) because Vue Router
offered no per-route middleware chain. The *outcome* carries forward —
a permission checked before a protected route renders — but the
mechanism below is specified here for the first time, so its
execution-order rules matter more than they would if this were a
translation of something already working.

### Middleware is default in v8 — no future flag required
This whole section rests on middleware being stable and available
without opt-in, so it is verified and cited rather than assumed. React
Router's own v8.0.0 changelog, under Major Changes:

> "Remove `future.v8_middleware` flag — middleware is always enabled in
> v8 (#15078)"
> - "The `future.v8_middleware` flag has been removed; middleware is
>   now always enabled"
> - "The `context` parameter passed to `loader`, `action`, and
>   `middleware` functions is always a `RouterContextProvider`
>   instance"
> - "The `MiddlewareEnabled` type (previously exported as
>   `UNSAFE_MiddlewareEnabled`) has been removed since the conditional
>   it gated is now unconditional"
> - "The `Future` module augmentation pattern (`interface Future {
>   v8_middleware: true }`) is no longer needed to type `context` in
>   Data Mode"

Concrete consequences for this app, each the opposite of what a v7-era
example would show:

- **Do not add a `future` flag block for middleware.** No
  `future: { v8_middleware: true }` in the router config —
  the flag no longer exists, and setting a removed flag is at best
  noise. 07-routing-and-layouts.md's route tree correctly shows none.
- **Do not add the `Future` module augmentation** to type `context`.
  It is unnecessary in Data Mode, which is this app's mode.
- **Do not reference `MiddlewareEnabled`/`UNSAFE_MiddlewareEnabled`.**
  Removed.
- `middleware` is a plain array property on a route object, per the
  same docs: `{ path: "/", middleware: [authMiddleware], … }`.

`future.v8_middleware` was one of five v7 flags promoted to default in
v8. Any v7-era snippet enabling any of them should be read as obsolete
rather than copied. Middleware is the only one of the five that bears
on this app; the other four are dispositioned here so the list doesn't
invite four separate investigations:

- **`v8_splitRouteModules`** — no effect on this app. Framework Mode
  only, and it splits route-module exports this app doesn't have. Full
  reasoning in 07-routing-and-layouts.md's "Lazy loading" section; that
  is the single record, don't re-derive it.
- **`v8_passThroughRequests`** — no bearing on this app. It stops
  React Router normalizing `request.url` for server-side
  `loader`/`action`/`middleware` (leaving `.data` suffixes and internal
  `?index`/`?_routes` params in place). Framework Mode only, and the
  concern is server request handling — this app has no server, and its
  middleware runs client-side.
- **`v8_trailingSlashAwareDataRequests`** — no bearing on this app. It
  changes the URL format React Router generates for **Framework mode**
  `.data` requests (`/a/b/c.data` → `/a/b/c/_.data`). Framework Mode
  only; a client-side data-mode SPA issues no `.data` requests at all.
- **`v8_viteEnvironmentApi`** — not a runtime concern; it is why the
  Vite 7+ floor exists (see 00-core-rules.md).

All three of the Framework-Mode-only flags above are marked ❌ Data in
React Router's own docs, and this app is data mode. This was checked
rather than assumed, because "probably irrelevant" was also the first
read on middleware — which turned out to be load-bearing.

### Authentication middleware (root-level)
A root-level React Router v8 middleware function, attached via the
route tree's `middleware` array property, calling MSAL to resolve the
session identity before any child route executes.

### Authorization middleware (`requirePermission`)
A `requirePermission(action: string)` middleware factory, attached only
to the specific protected routes (or a shared protected-layout route)
that need it — **not** a loader, **not** a generic route-metadata
field. The requirement is declared by which middleware is attached to
which route. (Renamed from `requireCapability`/`Capability` — see
"Permission model" above; the mechanism is unchanged, only the value it
checks.)

### Execution order
Middleware runs in a nested chain (per React Router's own docs): root
middleware start → parent → child → loaders/actions → child end →
parent end → root end. A child's `requirePermission` middleware only
executes after its parent's `next()` is called — meaning the root auth
middleware **must** call `context.set()` **before** its own `await
next()`, never after, or the child middleware reads an empty context
and denies every protected route.

### Identity source of truth
Zustand's auth store (per 04-state-management.md) is authoritative.
Root middleware does **not** call MSAL to populate context directly —
it reads `useAuthStore.getState().permissions` (the resolved-permissions
object — see "Permission model" above) and writes that into a typed
router context. This preserves 04's dev-only `switchRole()` working
unchanged, since middleware and the hook both read the same store
instance.

The concrete context API, stated precisely because an earlier revision
of this file described it loosely as "a typed `RouterContext` key":

- **Create** the context object once, at module level, with
  `createContext` imported from `react-router`:
  `export const permissionsContext = createContext<ResolvedPermissions | null>(null)`.
  It is a context *object*, not a string key.
- **Write** it in root middleware: `context.set(permissionsContext, permissions)`.
- **Read** it in `requirePermission`: `context.get(permissionsContext)`.

The `context` parameter handed to `middleware`, `loader`, and `action`
is always a `RouterContextProvider` instance in v8 (per the changelog
quoted above) — middleware receives it, it does not construct one.
Constructing a `RouterContextProvider` directly is for seeding context
in a custom server's `getLoadContext`, which this app has none of.
`context.get()` is the read half that the execution-order rule below
depends on: it is what returns empty if the root middleware has not yet
called `context.set()`.

### Cold-start handling
Export a module-level `authReady: Promise<void>` from the same
auth-bootstrap module that exports the MSAL `PublicClientApplication`
singleton, resolving once MSAL's `initialize()` +
`handleRedirectPromise()` + an initial `ssoSilent` attempt complete and
the Zustand store is populated. Root middleware's first line is `await
authReady;` before reading `getState()` or calling `context.set()` —
otherwise a hard refresh with an expired token races middleware against
async store hydration and denies every route. The router's own
pending-navigation state covers the UX for this wait — no bespoke
spinner needed.

### `redirectUri` — unspecified, and it gates the callback route
This file requires `handleRedirectPromise()`, which processes Entra's
return from the redirect flow. **It never says where Entra redirects
to.** That value — MSAL's `redirectUri` — is unspecified, and it
determines whether this app needs a callback route at all.

**The gateway question this was previously blocked on is resolved (see
"Resolved — the browser does hold a token" below): there is no gateway
terminating auth in front of this app, per BRD AR-06/DEC-07, so the
callback question does not dissolve — it needs an actual answer.**

**[PLACEHOLDER — which of the two options below, still open.** Trigger:
before auth implementation begins. Owner: Yogesh, with the client.]**

The two options, per 07-routing-and-layouts.md's `AuthLayout` section:

- **A dedicated route** (e.g. `/auth/callback`) — needs a chrome-less
  layout, and 07's route tree currently contains no such route. Adding
  one is a change to that tree, not a local addition.
- **The app root** — no route needed; `handleRedirectPromise()` runs
  during the `authReady` bootstrap on whatever route the user landed
  on. Fewer moving parts.

**One hard requirement on whichever option is chosen, which neither
file currently states: the `redirectUri` target must be reachable
WITHOUT passing the authentication middleware.** A callback route
sitting behind the auth guard requires the very session it exists to
establish — the middleware would redirect to Entra, Entra would return
to the callback, the middleware would redirect again. That is an
infinite loop, and it is the single most likely way to get this wrong.

Concretely: if the choice is a dedicated route, it attaches **outside**
the root middleware's protected subtree or is explicitly exempted; if
the choice is the app root, the bootstrap must complete before the
middleware's `await authReady` resolves, which the "Cold-start
handling" sequence above already arranges.

**Also note this is an Entra app-registration value, not only code.**
`redirectUri` must be registered against the app in Entra, and the
values must match exactly. Changing it later is therefore a
configuration request to whoever administers the tenant — not a
code-only change — so the cost of choosing wrong is external and slow.
Decide it once, with the client.

The MSAL `PublicClientApplication` singleton is exported from this one
auth-bootstrap module and is the same instance both the root middleware
and `authReady` consume — never a second instance constructed
elsewhere.

**See also**: 07-routing-and-layouts.md provides the concrete
route-tree instantiation of this file's middleware architecture
(`requirePermission` attachment, execution order) — a change to this
file's middleware design should be checked against 07.

For context: **exactly one route currently declares a permission
requirement** — `issue-entry`, requiring `"issue:create"`. Per BRD §7.3,
that row admits SE, ASM, PQM and ADMIN, and excludes only VIEWER — a
real, if narrow, restriction, unlike the prior model's `"read"` gate
that passed for every authenticated role. This governs which routes get
`requirePermission` attached; it says nothing about how the mechanism
works.

### `issue-entry` requires `"issue:create"` — from the real matrix row
Previously this file argued its way to `"read"` (a gate that restricted
nobody) from BRD NFR-05 prose and an inference about the two-value
capability model. That reasoning is retired along with the model it
supported. The BRD's real authorization matrix (§7.3) states the answer
directly, with no inference needed:

> **Create issue**: SE ✓, ASM ✓, PQM ✓, ADMIN ✓, VIEWER ✗

`VIEWER` is excluded because it is a read-only stakeholder role by
definition (§7.2), not because of any capability-ordering argument. No
other role is excluded — `SE`, the primary Issue Entry user, keeps
access, so this is not a repeat of the old "raising the gate locks out
the primary user" problem; the matrix row itself already reflects that
constraint.

## Fixtures-mode authentication
**This is a blocker on the first screen built, not a documentation
nicety.** The `authReady` bootstrap above gates the root middleware on
MSAL `initialize()` + `handleRedirectPromise()` + an initial
`ssoSilent` attempt, and the root middleware then reads the Zustand
auth store. In fixtures mode there is no Entra tenant to reach, so
without an explicit bypass every authenticated route either hangs on
`await authReady` or resolves to an empty store and denies. That means
**no screen behind a route renders at all** — which is every screen.

### Two layers, one flag — read this with 05
`VITE_USE_FIXTURES` gates **two independent bypasses at two different
layers**, and they were specified in separate passes. They are one
mechanism and should be understood as one:

| Layer | What the flag does | Owner |
|---|---|---|
| **Identity** | MSAL is not constructed; `authReady` resolves immediately against a seeded identity in the Zustand store | **this file**, below |
| **Data** | Each service function returns fixture data instead of calling HTTP | **05-api-integration-and-data-fetching.md**'s "Fixtures mode" |

They are deliberately symmetrical: **each swaps a source at a boundary
and leaves everything above it untouched.** The identity bypass changes
where the user comes from, not how routing or middleware behave. The
data bypass changes where records come from, not how queries, hooks or
components behave. In both cases the layers above run the same code
they run in production — which is the point, because those layers are
where the bugs are.

Two consequences of that symmetry:

- **Neither bypass is allowed to leak upward.** No `isFixtureMode()`
  check in a component, hook, query, or middleware. If you find
  yourself adding one, the bypass is in the wrong layer.
- **A screen in fixtures mode is fully functional**: real routing, real
  middleware, real permission checks against a seeded identity, and
  realistic data. It is not a degraded mode, and that is what makes it
  usable for building and reviewing screens with no backend.

The rest of this section covers the identity layer only. For the data
layer — including what a service returns, and the one query that is
disabled rather than stubbed — see 05.

### 1. Fixtures mode bypasses MSAL entirely
No `initialize()`, no `handleRedirectPromise()`, no `ssoSilent`, no
`PublicClientApplication` interaction of any kind. Do not construct the
singleton at all on this path.

`authReady` instead **resolves immediately**, with a seeded identity
already written into the Zustand auth store. The root middleware then
finds a populated store, its `context.set(permissionsContext, permissions)`
writes a real resolved-permissions object, and the `requirePermission`
chain behaves exactly as it does in real mode.

**The middleware architecture is unchanged — only the source of the
identity differs.** There is no second code path through the router, no
conditional middleware, and no fixtures-specific guard. Everything
under "Route-level guards" above applies verbatim in both modes. This
is deliberate: a fixtures mode that skipped the middleware chain would
mean local development never exercises the thing most likely to be
wrong in production.

### 2. `import.meta.env.PROD` is a hard fuse on the auth bypass
The condition for the fixtures auth path is **both** of:

```ts
isFixtureMode() && import.meta.env.PROD === false
```

**Why the second guard exists**, stated because it looks redundant and
is not: `isFixtureMode()` reads an environment variable, and a
misconfigured environment variable in a production build would
otherwise ship an application **with authentication disabled and a
seeded identity already logged in**. That is the worst failure this
file can produce, and one stray value in a deploy pipeline is enough to
cause it. `import.meta.env.PROD` is not readable from `.env` and cannot
be set by an environment variable — Vite sets it from the build command
itself — so it is a fuse the environment cannot bridge. With both
guards, the fixtures auth path is structurally unreachable in a
production build rather than merely unlikely.

**Only the auth bypass needs this.** The *data* fixtures path does not
take the second guard: shipping fixture data to production is a visible,
recoverable bug, whereas shipping a disabled authentication system is
not. Do not "consistency-fix" the data path to match.

### 3. The seeded identity must be a complete `AuthUser`
Never a partial object, and never assembled field by field. It is
written through **`setUser()`**, per 04-state-management.md's
single-writer rule — which derives `permissions` from a fixtures-only
`ROLE_PERMISSIONS_MAP` (a local dev-mode substitute for the real
FR-SEC-011 endpoint, not a production data source) and sets both
`currentUser` and `permissions` in the same `set()` call.

A fixtures path that seeds only a role, or writes `currentUser`
directly, bypasses `setUser()` and leaves `permissions` unset. That
produces exactly the silent-deny failure 04's single-writer rule exists
to prevent: the store looks populated, `authReady` resolves, the root
middleware reads `undefined`, and every protected route denies with no
error anywhere. Seed through `setUser()` and this cannot happen.

### 4. Which identity is seeded by default
**[PLACEHOLDER — role model is settled (BRD §7.2 defines 5 roles: SE,
ASM, PQM, ADMIN, VIEWER); which role local dev defaults to is a
separate, still-open call.]**

The blocker this placeholder previously cited — "role model unsettled"
— is resolved by the BRD. What remains open is narrower: which of the
five roles a fixtures-mode environment should default to for local
development. That is a dev-workflow convenience decision, not a
spec gap, and it doesn't block anything else in this file. (CE/DM
remain separately open — see 18 — but they are not role questions and
don't gate this placeholder.)

**Trigger**: a dev-workflow decision, not a spec resolution.
**Owner**: Yogesh.

**Do not pick a default now.** Choosing which role local development
sees by default is still a real decision — it is the answer every
developer would then build against, which makes it stickier than a
placeholder. The mechanism above is fully specified and can be built;
only the seeded value waits.

## Two distinct redirect targets — do not conflate
- **Authorization failure** (authenticated, permission check fails) →
  `redirect("/?denied=1")`. **Do not invent a dedicated "access denied"
  page** — the query-param redirect is the specified behaviour, and a
  new page is scope nobody has asked for.
  *Provenance: this is `kus-pqms`'s behaviour, unchanged — its
  `capabilityGuard` returned exactly this redirect. It was a
  placeholder there and remains one here; when a real denied
  experience is wanted, that is a decision, not a gap to fill
  quietly.*
- **Authentication failure** (`InteractionRequiredAuthError` thrown by
  `acquireTokenSilent`, or no valid session) → redirect to the Entra
  login flow — a different target. `InteractionRequiredAuthError` must
  be caught inside middleware and converted to this redirect — never an
  uncaught throw that would reach the route `ErrorBoundary`.

## Interim vs. target package placement
**Auth code lives app-level inside `apps/portal`**, with clean
seams so it can later be lifted into a shared
`packages/infrastructure/auth` package without touching call sites.

**Do not build the shared package now.** Extraction happens when a
migration trigger fires: a second app in the monorepo needing auth, the
real backend and Entra tenant stabilising, or micro-frontend work
beginning.

Provenance: this is ADR 0001's decision — placement and all three
triggers — applied unchanged. Note it predates this repository, so
"interim" refers to the state of the product, not to anything about
this codebase's age.

## Explicitly out of scope
These are deliberate deferrals, not oversights, and come from ADR 0001's
own deferred list:
- Multi-tab session sync.
- Silent-refresh-at-80%-lifetime logic.
- **Multi-IdP abstraction.** Deferred, not dropped. The target
  architecture lists "Multiple Identity Providers" among its required
  capabilities; this interim implementation targets Azure AD / Entra ID
  only, with no abstraction layer over the IdP. Recorded here so the
  deferral has somewhere to live.

**No longer on this list**: a fine-grained permission-string model.
This file previously deferred it as unbuilt target-state; the BRD's
FR-SEC-011 resolved-permissions endpoint and named-permission gating
model **is** that model, at the level this file needs — see "Permission
model" above. What remains genuinely unbuilt is the real backend
contract behind FR-SEC-011, tracked as a `[PLACEHOLDER]` there, not the
frontend's consumption of it.

**Also no longer on this list, and this one was a genuine conflict rather
than a supersession: the idle/session-timeout warning dialog.** It is
**in scope and required**. BRD `FR-SEC-005` commits to it in terms:

> The session shall expire after 30 minutes of inactivity, with a warning
> at 25 minutes and an option to extend.

with the acceptance criterion that unsaved entry drafts survive expiry.

**Why this file was wrong and the correction matters more than the
feature.** The deferral came from ADR 0001, which predates the BRD. Per
00-core-rules.md's Source precedence, **the BRD governs behaviour and
these standards govern code shape** — and whether a user is warned before
losing their session is behaviour. A standard cannot defer a committed
requirement out of existence; it can only say how the requirement is
built. This is the only place in the corpus where a standard was found
directly contradicting a numbered BRD requirement, and it is recorded
rather than quietly edited because the *class* of defect will recur every
time the BRD moves.

**What the requirement needs, so the deferral is not simply reversed into
a vacuum:**

- An inactivity timer measured against **user interaction**, not against
  token lifetime. The two are unrelated: MSAL's `acquireTokenSilent` will
  happily keep a token fresh for a user who walked away.
- A warning surface at 25 minutes offering **Extend** — which is an
  interaction, so it resets the timer — and **Sign out now**.
- Expiry routes to the Entra login flow, per "Two distinct redirect
  targets" above. It is an authentication failure, not an authorization
  one; do not send it to `?denied=1`.
- Entry drafts survive, per BRD `FR-ENT-030`…`034`. They are server-side
  per-user records, so this costs nothing extra — but it must be verified
  rather than assumed, because a draft held only in component state does
  not survive a redirect.
- The 30- and 25-minute values are **configuration**, not literals.

**Multi-tab session sync stays deferred and that is now visibly
awkward**, because `sessionStorage` is per-tab (see "Token storage"): a
user with two tabs open gets two independent inactivity timers. Accepted,
and stated so it is a known behaviour rather than a surprise.

## Resolved — the browser does hold a token
**Previously the highest-consequence open question in this file.**
Everything in this file's "Token storage" section assumes the browser
receives and holds tokens — that is what makes `cacheLocation`, XSS
exposure, and the CSP condition meaningful at all. That assumption
depended on whether Kia's SSO infrastructure terminates authentication
at a gateway or reverse proxy in front of this app; if it did, the
application would never hold a token in browser storage and the entire
token-storage decision above would be void, not merely adjusted.

BRD AR-06/DEC-07 resolve this: authentication is **OIDC Authorization
Code + PKCE against the enterprise identity provider, with the token
validated in-process** — "no separate gateway is needed to validate one
token for one application" (AR-06). There is no gateway terminating
auth in front of this app. The token-storage decision above is
**confirmed valid, not voided** — `cacheLocation`, the accepted XSS
cost, and the CSP condition all stand as specified — and MSAL remains
the right library. Also tracked in
18-project-context-and-implementation-status.md.

## Carry the rule, discard the model
The prior repository enforces exactly the indirection this file specifies, and
states it twice — at the top of the auth store and again at the top of the
permissions hook:

> no `role === 'X'`-style literal role comparison is permitted anywhere in this
> codebase outside `ROLE_CAPABILITY_MAP`

Consumers read named capability booleans, never a role string. **That rule is
proven in shipped code and transfers unchanged.** So does 04-state-management.md's
corollary that `role` is derived rather than independently written.

**The model underneath it does not transfer, and porting it shape-first would be
a mistake:**

| | Prior implementation | BRD C1.0 |
|---|---|---|
| Roles | 3 — `SE`, `ASM`, `PQM` | 5 — adds `ADMIN`, `VIEWER` |
| Capabilities | 2 — `read`, `override` | the 38-row matrix |
| Resolution | a static `Record<Role, Capability>` | IdP claims |

The prior `hasCapability()` reduces to `required === "read" || current ===
"override"`, and all four of its permission booleans are that same test written
four times. **A two-level ladder cannot express a 38-row matrix**, and it will
fail first on `VIEWER` — a role that is not "read" in the prior sense but a
strictly narrower one — and on `ADMIN`, which is not the same override that
`ASM` has.

So: **the permission surface is derived from the matrix, not from a hand-written
list of booleans.** A named permission per matrix row, generated or table-driven,
is the shape that survives; four hand-maintained booleans are the shape that
looks fine until the fifth role.

## Build mode as a fuse — used here, and not only here
The prior repository fuses `switchRole()` to throw under `import.meta.env.PROD`,
describing it in the code as "a prototype-only mechanism". This corpus already
requires the same fuse on the fixtures-mode authentication bypass.

**These are two instances of one pattern, and 13-security-standards.md now owns
it.** Anything that exists for local development and would be a vulnerability in
production does not get a comment saying so — it gets a build-mode assertion
that makes shipping it impossible.

## The HTTP client learns about auth; auth does not import the client
The prior `apiClient` exposes `registerAccessTokenGetter()` and
`registerUnauthorizedHandler()` so the auth layer plugs in without the transport
module importing it.

The recorded reason there was sequencing — auth arrived later. **The durable
reason is different and better:** it keeps the dependency pointing one way, and
it makes the HTTP client testable with no identity provider, no MSAL instance
and no token. Register the token source and the 401 handler at bootstrap; do not
import the auth store from the transport layer.

## The browser does hold a token — the topology question is answered

This file carries an open question about whether authentication terminates at a
gateway, in which case the browser would hold no token and there would be no
redirect callback to handle. 07-routing-and-layouts.md defers its `AuthLayout`
placeholder to that same question.

**`docs/STACK.md` §7 answers it:**

> **Auth:** OAuth2 JWT Bearer (JWKS via `oauth2.jwksUri`); API Gateway JWT
> authorizer.

A JWT **Bearer** scheme means the browser obtains a token and attaches it per
request. The API Gateway authorizer **validates** it; it does not mint it and it
does not terminate the flow. So:

- **The browser holds a token.** Every rule in this file about token storage
  applies — in memory, never `localStorage`.
- **There is a redirect callback**, therefore a callback route, therefore
  `AuthLayout` has a consumer. 07's placeholder can close once the redirect URI
  is registered.
- **The HTTP client's `Authorization` header is real**, which is what makes
  05-api-integration-and-data-fetching.md's `registerAccessTokenGetter` seam
  load-bearing rather than speculative.

**What is still open is the identity provider.** This corpus specifies MSAL /
Microsoft Entra. `STACK.md` names a generic JWKS endpoint and an API Gateway
authorizer without naming an IdP, and the backend loads secrets from AWS Secrets
Manager — which is consistent with Entra, with Cognito, or with neither.

**[PLACEHOLDER — the identity provider, and therefore whether MSAL is the client
library. Trigger: before the auth SPEC is planned. Owner: client architect.]**
The distinction matters more than it looks: MSAL is Entra-specific, and if the
IdP is Cognito or a generic OIDC provider then `oidc-client-ts` or the AWS
Amplify auth module is the equivalent — same protocol, entirely different
package, different bootstrap, different token cache.

**The capability model is unaffected either way.** Claims arrive in a JWT
regardless of who issued it, and the no-literal-role-comparison rule above
governs what happens to them.

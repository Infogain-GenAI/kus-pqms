# 05 — API Integration and Data Fetching
**Tier:** 1
**Status:** APPROVED — REVISION 6

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## HTTP client
One Axios setup at `apps/portal/src/shared/http/apiClient.ts` (paths are
workspace-root-relative, per 00's Path convention).
Build it with all five properties below.

Provenance: this is carried forward nearly 1:1 from the prior Vue
implementation of this product (repo `kus-pqms`, same path), where it
was already framework-agnostic — it is plain Axios plus interceptors,
with nothing Vue-specific to translate. Treat the list below as a
specification rather than a summary.

- **One factory, `createHttpClient(baseURL, envVarName)`, and as many
  named instances as there are backend origins.** `kus-pqms` had two —
  `apiClient` (`VITE_API_BASE_URL`) and `notificationApiClient`
  (`VITE_NOTIFICATION_API_BASE_URL`) — because notifications were a
  separate deployed service.

  **How many instances this app needs is not settled, and the factory is
  what makes that survivable.** BRD `AR-01`/`DEC-08` commit to a **single
  backend deployable behind a single `/api/v1/**` surface**; under that
  topology there is **one** origin and therefore one instance, and a
  second would be a distinction with nothing behind it. The two-instance
  shape above is carried from the prior microservices topology, which
  `DEC-08` replaces.

  **[PLACEHOLDER — the number of origins. Resolved by `DEC-08` being
  signed. Trigger: before the HTTP client is built. Owner: Architect.]**
  Build the factory regardless; instantiate against however many origins
  the answer produces. Do not hard-code two.

  **This is not only a `05` question.** The same assumption is encoded in
  13-security-standards.md's `VITE_*` inventory (three of its seven
  variables are per-service proxy targets) and in
  20-glossary-and-appendix.md's four-path dev-proxy snippet. All three
  move together or none of them does — check the other two when this
  resolves.
- **Request interceptor**: `Authorization: Bearer <token>` attached only
  if a token exists (via a pluggable `getAccessToken` getter), plus an
  always-attached `X-Correlation-ID` (`crypto.randomUUID()`, with a
  manual fallback).
- **Response interceptor**: normalizes all errors into one `ApiError`
  shape — `{ status, code, message, correlationId, details? }`.
  `ECONNABORTED` → `"TIMEOUT"`; no response → `"NETWORK_ERROR"`;
  otherwise the HTTP status as `code` plus an extracted message
  (including a `Blob`-response special case). Includes an
  `isApiError()` type guard, used consistently for error handling (e.g.
  appending `correlationId` to toasts).
- **Auth token wiring**: two pluggable seams,
  `registerAccessTokenGetter` and `registerUnauthorizedHandler`. This
  file owns the **seams**; the Azure AD OIDC+PKCE token source that
  fills them is 08-authentication-and-authorization.md's. Build the
  seams even before there is a token source to register — 08 records
  that wiring as real unbuilt work, and an unregistered seam is the
  correct intermediate state, not a gap.
- **Production HTTPS tripwire**: throw at boot if a production build's
  base URL is not HTTPS. Cheap, and it catches a misconfigured
  environment at startup rather than on the first request.

## Services/mappers layer
**"Service calls → mapper translates → service returns domain shape"**
is the standard pattern. Three rules:

- **A service function returns already-mapped domain data** in the
  general case. Callers do not see backend field names.
- **Three deliberate exceptions return the raw backend envelope**:
  search-, `filterOptions`-, and `columnOptions`-style methods, which
  defer mapping to the caller. **This is by design, not an
  inconsistency to fix** — these endpoints return option lists and
  result envelopes whose shape the caller needs to interpret in
  context, and forcing them through a domain mapper would flatten away
  what the caller is actually deciding on. See the hook layer below for
  where their mapping happens instead.
- **Mapping lives in a separate sibling `.mappers.ts` file**, never
  inline in the service file.

Provenance: all three are carried forward from `kus-pqms`, where the
split and the three raw-envelope exceptions were already established
and deliberate. The pattern is framework-agnostic; nothing about it was
Vue-specific.

## Input validation and schema parsing
**Zod v4** (pin `"zod": "^4.0.0"` explicitly — v3 and v4 have
incompatible generic internals, so this is not a loose `^3 || ^4`
range) is the schema library for validating API responses at the
mapper boundary — the same `.mappers.ts` files established above as
this file's translation layer are where a response schema is parsed,
before the mapper produces the domain shape a hook returns.

**Default: schemas are strict** — an unexpected shape is rejected, not
silently passed through.

This is the point of having Zod here at all. A mapper without schema
validation does not fail when the backend drifts; it produces
`undefined` deep inside a component, far from the cause. A strict
schema fails loudly, at the boundary, naming the field. Provenance:
`kus-pqms`'s mappers did no validation, and that silent-`undefined`
failure mode is what this replaces.

**Named exceptions, and only these three** — each tied to a specific
backend gap, not a general leniency policy.

**These are live constraints on the backend this app talks to, not
history.** Each one exists because the API does not yet do something
the client sends or expects. They are stated as present-tense
requirements deliberately:

- **`ownerUserId`** — marked `.optional()` on the relevant response
  schema, with an inline comment citing the gap: the field is sent in
  the request payload but not yet persisted by the real backend, so a
  strict schema would reject every response that omits it.
- **Vehicle Info / System Classification edit-response fields** (Edit
  Issue) — marked lenient the same way, with an inline comment noting
  there is no matching update-endpoint field yet for these edits to
  round-trip through.
- **Linked-issues batch-response schema** — built loosely throughout,
  with an inline comment noting no real batch endpoint exists yet to
  validate a strict shape against.

Do not generalize leniency beyond these three named cases — a fourth
field discovered to be unreliable gets its own schema fix or its own
explicitly documented exception, not a broadening of an existing one.

**Re-verify each of the three before writing its exception.** They were
identified by investigation against the backend as it behaved during
`kus-pqms`'s development; the backend has continued to exist since, and
any of the three may have been fixed. A lenient schema against a field
the backend now reliably returns is worse than no exception at all — it
permanently hides a working field behind an `.optional()` nobody
revisits. Confirm the gap is still real, then write the exception with
an inline comment citing it. If a gap has closed, delete the exception
rather than leaving it.

**Cross-reference**: 03-react-component-patterns-and-naming.md's "Forms
and validation" section uses this same Zod version for client-side form
schemas. This file owns the version pin and the API-response validation
policy; 03 owns form-level usage — a version bump here must be checked
against 03, and vice versa.

## TanStack Query hook layer — how services connect to components
**This file owns query configuration.** 04-state-management.md decides
*what is server state* and therefore belongs in a query at all; once
that classification is made, how the query is configured is specified
here. 04 cites this section rather than restating it.

- **Each feature gets custom hooks** wrapping `useQuery`/`useMutation`
  around the corresponding service function — e.g. `useIssueList()`,
  `useIssueDetail(id)`, `useMarkNotificationRead()`. Components call
  the hook, never the service directly.
- **For the three raw-envelope exceptions** (search, `filterOptions`,
  `columnOptions`), mapping happens via TanStack Query's **`select`**
  option inside the custom hook. This keeps the caller-does-the-mapping
  convention from the services layer above, with the query hook as the
  caller — and `select` means the mapping is memoized and does not
  re-run on every render.
- Query key conventions: [PLACEHOLDER — to be finalized once the first
  real hooks are written; should follow TanStack Query's recommended
  array-based key structure scoped by feature].

### Polling: the notifications query
The one query in this app that polls. Configuration:

- **`refetchInterval: 60_000`** — a 60-second poll.
- **Leave `refetchIntervalInBackground` at its default (`false`).**
  This is what gives you focus-based pausing: polling stops when the
  tab is not focused and resumes when it is. Do not set it to `true`,
  and do not hand-roll the pausing.
- **`enabled: !isFixtureMode()`** — in fixtures mode the query is
  disabled entirely rather than fetching and discarding. **Call the
  predicate**: `!isFixtureMode` without parens evaluates a function
  reference, which is always truthy, permanently disabling the query
  in every mode with no error and no network call.

**Never hand-roll an interval for this.** Provenance: `kus-pqms` used a
`setInterval` that never stopped, skipping the network call via a
`document.hidden` check on each tick. `refetchInterval` plus the
default background behaviour achieves the same outcome with none of the
lifecycle code — and none of the risk of an interval outliving its
component.

04-state-management.md owns *why* notifications are a query rather than
a store, and the domain values (page sizes, the 60-second cadence as a
product decision). This section owns how that is expressed.

**See also**: 07-routing-and-layouts.md builds directly on this file's
TanStack-Query-owns-server-state architecture to establish that loaders
never fetch view data — a change to this file's data-fetching ownership
should be checked against 07.

## Fixtures mode
**This file owns fixtures-mode data behaviour** — the predicate, where
the switch happens, and what a service returns. The *auth* half is
08-authentication-and-authorization.md's ("Fixtures-mode
authentication"); the `use*` naming rule is
14-code-style-and-linting.md's; the `VITE_USE_FIXTURES` contract across
`.env`, `.env.example` and `env.d.ts` is 13-security-standards.md's.
This section owns everything else about it.

### The predicate
**Fixtures mode is explicit opt-in. Write it as an exact equality:**

```ts
export function isFixtureMode(): boolean {
  return import.meta.env.VITE_USE_FIXTURES === "true";
}
```

**`=== "true"`, not `!== "false"`.** An absent variable, a typo, `"0"`,
`"off"`, `"FALSE"` — every one of those means **real mode**. Fail
closed.

The reason is 08's decision, not tidiness. Default-on is a defensible
convenience while the flag gates only *data*: unset then means "don't
fire HTTP at a backend that may not be running," which is the safe
direction. But the same flag also gates an **authentication bypass**,
and an auth bypass must never be what you get by forgetting to set a
variable. Once one flag governs both, the safe direction inverts.

**Name it `isFixtureMode()`, never `useFixtures()`.** It is not a hook —
it reads `import.meta.env` and returns a boolean. A `use*`-named
non-hook called conditionally, inside a callback, or inside a
query-options object trips `rules-of-hooks` under the lint preset 14
mandates. Provenance: `kus-pqms` named it `useFixtures()` and
implemented it as `!== "false"`, with a source comment arguing the
data-only case above. That reasoning was sound for what the flag gated
there; it is not sound here.

**A fresh clone with no `.env` gets real mode**, and therefore real
auth, and therefore — with no Entra tenant reachable — nothing renders.
That is intended, and it means fixtures mode must be documented where a
new developer will look rather than left to be inferred.

### What a service returns in fixtures mode
**The service layer is the seam. A service function returns fixture
data in fixtures mode and calls HTTP in real mode. Nothing above it
changes.**

That means, concretely:

- **Queries, hooks, and components are identical in both modes.** They
  call the same service function, receive the same domain shape, and
  render the same way. No `isFixtureMode()` checks in a component, a
  hook, or a screen.
- **Fixture data goes through the same mapper and the same schema** as a
  real response. A fixture that would fail the Zod schema is a broken
  fixture, and finding that out in fixtures mode is the point.
- **`isFixtureMode()` is called in exactly one kind of place**: inside a
  service function, choosing its data source. If you are calling it
  anywhere else, the switch is in the wrong layer.

**Why the seam is the service and not the query**: fixtures mode exists
so screens can be built and reviewed with no backend running. If the
switch were at the query layer — disable the query, render an empty
state — then no screen would show anything in fixtures mode and the
mode would have no purpose. Putting it in the service means every
screen renders with realistic data, and the code path above the service
is the same one production uses.

**The one documented exception: a query whose purpose is to observe
change over time.** Polling fixture data is pointless churn — it
re-fetches the same static array every interval forever. For those,
disable the query instead:

- **Notifications** is the instance. Its query takes
  `enabled: !isFixtureMode()` (see "Polling: the notifications query"
  above) and does not fetch at all in fixtures mode.

**The test for a new exception**: does this query exist to *notice
something changing*? If yes, fixture data makes it meaningless — disable
it. If no — it exists to *show* something — return fixture data. Anything
else is a screen-by-screen decision, which is what this section exists
to prevent.

Provenance: `kus-pqms` worked this way. Its `api/*.ts` modules were a
fixture-backed data layer that services read from, with
`VITE_USE_FIXTURES=false` switching them to real endpoints — and its
notifications store was the one full no-op. The convention above is
that behaviour stated as a rule rather than left implicit.

### Where fixture modules live — RESOLVED
**`apps/portal/src/fixtures/`, grouped by feature** — `fixtures/issue-management/`,
`fixtures/notification/` — mirroring the feature grouping this file already
requires of `services/`.

This closes a placeholder that previously deferred to "01's next revision,
or scaffold time". The constraint that produced the deferral is what
decides it: `kus-pqms` used `src/api/`, which **also** held the domain
types that 02-typescript-standards.md now places in `src/types/` and in
per-feature `types/` folders. Copying that folder wholesale would drag two
concerns into one place; a dedicated folder separates them and needs no
exception from any existing rule.

**Decided here rather than in 01**, deliberately: 01 grants the general
permission ("any category folder name may exist at multiple nesting
levels — the path itself disambiguates scope") and stops. Fixture data is
a data-layer concern, and this file owns the data layer — the same
reasoning by which 02 owns the `types/` path and 07 owns the `pages/`
path rather than 01 owning all three.

**Everything 26-test-data-fixtures-and-test-scope.md requires of a fixture
applies to these modules**, including the rule that the *same* modules
serve fixtures mode and the test suite. Two sets drift, and the drift
surfaces as "it works in the app but the test fails".

## Testing note
Mocking these API calls in tests uses MSW, per 10-testing-standards.md.
See that file for the MSW setup — not restated here.

## The transport / domain split, and `.mappers.ts`
This file describes a services-and-mappers layer. The prior repository ships a
sharper version of it, audited in `../analysis/vue-baseline-audit.md`, and the
sharper version is the one to build.

**Two layers, not one:**

| Layer | Responsibility | Knows about |
|---|---|---|
| **Transport** | one module per backend resource; issues the request, returns the wire shape | the HTTP client, URLs, query params |
| **Domain** | `X.service.ts` + `X.mappers.ts`; translates wire to domain and back | domain types only |

**`X.mappers.ts` is a file kind.** Every wire-format-to-domain translation lives
in one, sibling to the service that uses it, and **it is where the tests go** —
a mapper is a pure function over a fixture and is the cheapest meaningful test
in the codebase. In the prior repository `issue-detail.mappers.spec.ts` exists
and the service it serves has no spec of its own, which is the right ratio.

**Status vocabulary gets its own module.** 02-typescript-standards.md ratifies
eight statuses and defers wire-format differences "to mappers". The concrete
form of that deferral is a dedicated `issue-status-vocabulary.ts` — wire values,
display values, and the mapping between them, isolated from both transport and
components, so that a backend renaming a status is a one-file change.

**Folder placement differs from the prior repository on purpose.** It has a flat
`src/api/` beside a flat `src/services/`; 01-project-structure-and-architecture.md
groups both by feature. **Keep the layering, move it inside the feature folder.**

## Fixtures — two details the prior implementation earned

### The predicate is a function, never an exported constant
```ts
export function useFixtures(): boolean { /* reads import.meta.env here */ }
```

**A constant freezes the value at import time and silently ignores a spec's
`vi.stubEnv`** — which makes a live-branch test pass for the wrong reason. That
is a real trap, it costs an afternoon, and it is invisible in review because the
test is green. The predicate must read `import.meta.env` per call.

### It centralises the reading, not the decision
Each consumer still branches locally. That keeps *which call sites have
migrated* visible in the code, and makes each cutover revertible on its own. A
single global switch does the opposite: it looks tidier and makes a partial
migration unobservable.

### The default direction is deliberately the opposite of the prior repository
The prior portal defaults **fixtures ON** — only the literal string `"false"`
opts out, so a missing or misspelled value falls back to the safe path.

**This corpus specifies the opposite: the predicate fails closed.** A fresh
clone with no `.env` gets real mode, therefore real authentication, therefore
nothing rendered.

Both defaults are safe; they are protecting different things. The prior one
protects a developer from a backend that is not running. This one protects
production from an **authentication bypass reached by forgetting a variable** —
because here the same flag gates data *and* identity, which it did not there.

**The direction does not change.** But it means every developer arriving from
the prior repository sees a blank screen and concludes the app is broken, so
19-onboarding-and-dev-workflow.md must say the default *reversed*, not merely
what the default is.

## Binary responses and downloads — owned here
BRD-committed Excel export means the app receives bytes the server produced and
has to put them on disk. That is a transport concern and nothing else claimed
it.

**One helper, app-wide**, taking a `Blob` and a filename. Two rules from the
prior implementation, both learned the hard way:

- **Revoke the object URL immediately after the synthetic click.** The browser
  has taken its reference by then; leaving it alive pins the whole blob in
  memory for the life of the document.
- **It is content-type agnostic.** The prior repository's version was
  xlsx-shaped by name and default filename, and had to be generalised the moment
  a second caller (evidence download) appeared. Write it generic once.

The filename comes from the server's `Content-Disposition` where one is sent;
a client-invented filename is a fallback, not the design.

## The backend is one Spring Boot service — the topology question is closed

`docs/STACK.md` §7 records the runtime path:

```
CloudFront ─┬─ (static SPA) ─→ S3
            └─ (/api/*)     ─→ API Gateway HTTP API → VPC Link → ALB → ECS Fargate (Spring Boot)
```

**One backend, one origin, one base path.** So:

- **One HTTP client, not two.** This file's two-instance design and the
  `notificationApiClient` it names both belong to the three-service topology
  `DEC-08` replaces. Delete the second instance; do not port it.
- **One dev-proxy entry**, not four, and **no ordering hazard** — the prior
  repository's specific-paths-before-`/api` warning has nothing to order.
- **One environment variable.** The target repository already uses
  **`VITE_API_BASE`** (`docs/STACK.md` §3), proxying `/api/*`. That is the name;
  do not introduce `VITE_API_BASE_URL` alongside it. 13-security-standards.md's
  `ImportMetaEnv` inventory records it.

### A live defect the restructure must not inherit
`STACK.md` §8 item 1: **the Vite proxy defaults to `http://localhost:8080` while
the backend runs on `18080`.** So `/api/*` does not reach the backend locally
until one side is aligned.

**This is not ours to fix unilaterally** — it spans both components. But it is
the first thing a developer hits, it looks exactly like a broken frontend, and
19-onboarding-and-dev-workflow.md's troubleshooting table needs it on day one
with the real error text.

### Contract source
The API contract comes from the Spring Boot service, not from this corpus. Zod
schemas at the boundary (this file's rule) become **more** important, not less:
they are what turns a backend field rename into a caught error at one seam
rather than `undefined` rendering three components deep.

**MSW ^2.7.5 is already installed** (`docs/STACK.md` §3), so the mocking layer
10-testing-standards.md and 26-test-data-fixtures-and-test-scope.md specify
needs wiring, not adopting.

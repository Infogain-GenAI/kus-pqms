# Vue Baseline Audit — what the shipped implementation proves

**Status:** REFERENCE. Not a standard, and it authorises nothing.
**Audited:** 2026-08-24, against `kus-pqms/frontend` at `master` (224f99f).
**Owner:** regenerate rather than hand-edit.

---

## Why this file exists, and what it is not

The standards corpus in `../standards/` was written from three sources: the
BRD, the prototype, and the prior repository's written guidelines. It was
**not** written from the prior repository's *code*. That gap matters, because a
written guideline records what a team intended and the code records what the
team actually did — and where the two differ, the code is the more reliable
evidence about what this domain costs.

This file is the fourth source: **an audit of the shipped Vue implementation**,
read file by file, with every claim citable to a path.

**It is not a standard.** Nothing here is a rule for the React repository.
`00-core-rules.md`'s Source precedence still governs: the BRD governs
behaviour, the prototype governs visual structure, the tier files govern code
shape. This file supplies *evidence* that the tier files cite; where a tier
file and this file disagree, **the tier file wins** and this file is the reason
someone should check whether it should.

**Method, and its limit.** Everything below is from reading files in
`kus-pqms/frontend`. No command was run against that repository — no install,
no build, no test, no coverage report. Placement, configuration and code shape
are verified. Behaviour, timings and coverage percentages are not; where a
number appears it is quoted from a comment in the repository, attributed as
such, and is exactly as trustworthy as that comment.

---

## 1. Workspace shape

Three packages under pnpm workspaces + Turborepo, which is the shape the React
corpus already assumes:

| Package | Role |
|---|---|
| `apps/pqms-portal` | The application |
| `packages/ui-library` | Presentational `Base*` components |
| `packages/design-tokens` | Token values only |

**Node 24 via `.nvmrc`, pnpm 11.1.3 via `packageManager`**, with
`engines: { node: ">=22.12.0", pnpm: ">=11.0.0" }` — and, critically,
**`.npmrc` sets `engine-strict=true`**, so the declared range is enforced at
install rather than documented and ignored. The same file sets
`strict-peer-dependencies=false` with a recorded reason: the toolchain runs
TypeScript 6 while several lint plugins declare a narrower peer range.

> **Carry forward.** The `engine-strict` + recorded-exception pattern is worth
> copying verbatim. A version range nothing enforces is a comment.

`pnpm-workspace.yaml` additionally carries a **`minimumReleaseAgeExclude` list
of 28 `@tiptap/*` packages** — a supply-chain control (hold new releases for a
cooling-off period) with a per-package exception list. The corpus's tier 13
does not mention release-age holds at all.

### Turborepo task graph

`build`, `build-storybook` and `test` all declare `dependsOn: ["^build"]`;
`test:unit` and `lint` declare `dependsOn: []` **explicitly**, which is the
detail worth noticing — the empty array is a decision (unit tests must not wait
on upstream builds), not an omission.

---

## 2. The two-layer data access split — `api/` and `services/`

This is the single most transferable structural finding in the repository, and
the corpus's `05-api-integration-and-data-fetching.md` describes only half of
it.

```
src/api/          transport   — one module per backend resource
  classification.ts  comments.ts  investigation.ts  issues.ts
  issue-entry.api.ts  notifications.ts  partRequests.ts
  similar-issues.ts  vehicle-master.ts  fixture-latency.ts

src/services/     domain      — mappers + a service per aggregate
  issue.service.ts        issue.mappers.ts
  classification.service.ts classification.mappers.ts
  master-data.service.ts   master-data.mappers.ts
  notification.service.ts  notification.mappers.ts
  assignee.service.ts      assignee.mappers.ts
  issue-detail.mappers.ts  issue-column-options.mappers.ts
  issue-filter-options.mappers.ts
  issue-status-vocabulary.ts
  index.ts
```

Three conventions fall out of it, all of them load-bearing:

- **`X.mappers.ts` is a file kind**, sibling to `X.service.ts`, and it is where
  every wire-format-to-domain translation lives. It is separately testable —
  `issue-detail.mappers.spec.ts` exists and the service has no spec of its own.
- **`issue-status-vocabulary.ts`** is a dedicated module for status
  vocabulary — the wire values, the display values and the mapping between
  them, isolated from both the transport and the components. Given that
  `02-typescript-standards.md` replaced a ten-value status set with the BRD's
  ratified eight and explicitly deferred wire-format differences "to mappers",
  this file is the shape that deferral takes.
- **`fixture-latency.ts`** sits in the transport layer: fixtures are served
  with an artificial delay so loading states are exercised in development
  rather than discovered in production.

> **Carry forward, with one change.** The two-layer split and the `.mappers.ts`
> file kind should be explicit in tier 05. The *folder* names should not be:
> tier 01 groups `services/` by feature, and a flat `src/api/` alongside a flat
> `src/services/` is the structure tier 01 exists to replace. Keep the layering,
> move it inside the feature folder.

---

## 3. The HTTP client — three seams worth copying

`src/shared/http/apiClient.ts` is more disciplined than its React counterpart
in the corpus, and three specific mechanisms should transfer:

**A production HTTPS tripwire that throws at construction:**

```ts
if (import.meta.env.PROD && !baseURL?.startsWith("https://")) {
  throw new Error(`${envVarName} must be HTTPS in production: ${baseURL}`);
}
```

This is the same *shape* as tier 05's `import.meta.env.PROD` fuse on the
fixtures auth bypass — a build-mode assertion that makes a misconfiguration
impossible to ship rather than merely discouraged. Tier 13 should own it.

**Auth attached through registered hooks, not imported directly:**
`registerAccessTokenGetter()` and `registerUnauthorizedHandler()` let the auth
layer plug in without the HTTP module importing it. The recorded reason is that
auth arrived later than the client; the durable reason is that it keeps the
dependency pointing one way and makes the client testable without an identity
provider.

**A correlation ID minted per request** — `crypto.randomUUID()` with a
non-crypto fallback, set as `X-Correlation-ID`. Tier 21 already specifies the
header; this is the working implementation, fallback included.

**And one thing to change.** The file's own header comment marks it as the
**interim, app-level home** for a client whose target is a shared
`packages/api-client`, per ADR 0001. The consumers import from the
`@/shared/http` barrel precisely so the later extraction does not touch call
sites. That barrel-as-extraction-seam trick is worth keeping; the interim
placement is not something the React repository has to inherit, because it can
decide the destination on day one.

---

## 4. Two backend clients, three origins, four proxy paths

Confirmed in code, and it is the concrete form of the topology `DEC-08`
replaces:

- **Two axios instances** — `apiClient` (`/api/v1`) and `notificationApiClient`
  (`/api/notification/v1`). The second exists **not** because of a different
  port but because of a genuinely different literal base path.
- **Three origins** — `VITE_MASTER_DATA_API_URL` (8086),
  `VITE_ISSUE_MANAGEMENT_API_URL` (9091), `VITE_NOTIFICATION_API_URL` (9095).
- **Four dev-proxy entries**, and `vite.config.ts` carries an explicit ordering
  warning: the specific paths must precede the generic `/api` catch-all or
  notification requests are silently routed to issue-management's port.

Master Data and Issue Management **share the `/api/v1` prefix space** and
differ only at the proxy target — which is why two origins collapse into one
client but three collapse into two.

> **Under a monolith backend (`DEC-08`) this whole structure collapses to one
> origin, one client and no proxy ordering hazard.** Tiers 05, 13 and 20 all
> encode pieces of it and are already annotated to move together; this audit is
> the evidence that they are one change, not three.

---

## 5. Fixtures — and a direct conflict with the React corpus

`src/config/data-source.ts` is the one place `VITE_USE_FIXTURES` is read:

```ts
export function useFixtures(): boolean {
  return import.meta.env.VITE_USE_FIXTURES !== "false";
}
```

Two design notes in that file are worth transferring intact:

- **It is a function, not an exported constant**, because a constant freezes
  the value at import time and silently ignores a spec's `vi.stubEnv` — which
  makes a live-branch test pass for the wrong reason. That is a real trap and
  the React corpus does not warn about it.
- **It centralises the reading, not the decision.** Each consumer still
  branches locally, so which call sites have migrated stays visible and each
  cutover is revertible on its own.

**The conflict.** The Vue default is **fixtures ON** — only the exact string
`"false"` opts out, so a missing or misspelled value falls back to the safe
path. The React corpus specifies the **opposite**: the predicate fails
*closed*, so a fresh clone with no `.env` gets real mode, real authentication,
and — with no reachable tenant — a blank screen.

Both are defensible and they are defending different things. Vue is protecting
a developer from a backend that is not running. React is protecting production
from an auth bypass reached by forgetting a variable, because in the React
design the same flag gates both data and identity.

> **The React position is the right one and should not change.** But it means
> every developer arriving from the Vue repository will hit a blank screen and
> conclude the app is broken. `19-onboarding-and-dev-workflow.md` already
> carries this as its known day-one entry; it should also say that the default
> *reversed*, because "it used to just work" is the actual symptom.

---

## 6. Authorization — the enforced rule, and the model that will not survive

`stores/auth/auth.store.ts` opens with the hard rule, repeated verbatim at the
top of `composables/usePermissions.ts`:

> no `role === 'X'`-style literal role comparison is permitted anywhere in this
> codebase outside `ROLE_CAPABILITY_MAP`

Consumers read named capability booleans (`canApprove`, `canOverrideScore`,
`canAccessSharing`, `canAccessAdmin`), never a role string. **This is exactly
tier 08's model and it is proven in production code** — including tier 04's
point that `role` is derived rather than independently written.

**But the model underneath it is much smaller than the BRD's.** The shipped
implementation has:

| | Vue implementation | BRD C1.0 |
|---|---|---|
| Roles | 3 — `SE`, `ASM`, `PQM` | 5 — adds `ADMIN`, `VIEWER` |
| Capabilities | 2 — `read`, `override` | 38-row authorization matrix |
| Resolution | a static `Record<Role, Capability>` | IdP claims |

`hasCapability()` reduces to `required === "read" || current === "override"`.
Every one of the four permission booleans is the same test.

> **Carry the rule, discard the model.** The no-literal-role-comparison rule and
> the derived-capability indirection are the durable parts. A two-level ladder
> cannot express a 38-row matrix, and four booleans that are all the same
> expression will not survive contact with `ADMIN` and `VIEWER`. Tier 08 should
> say so, so nobody ports `ROLE_CAPABILITY_MAP` shape-first.

**Also present and explicitly production-fused:** `switchRole()` throws under
`import.meta.env.PROD`, described in its own comment as "a prototype-only
mechanism". Same fuse pattern as the HTTPS tripwire and the fixtures bypass —
**three independent uses of build-mode-as-a-fuse in one codebase**, which is
enough to call it a house pattern rather than a one-off.

---

## 7. Routing and layouts — richer than the corpus assumes

### Route files split by domain
`router/routes/` holds `admin.ts`, `dashboard.ts`, `issue-management.ts`,
`notifications.ts`, `qir.ts`, `tsb.ts`, aggregated by `index.ts`, with the
catch-all 404 required to stay **last**. Every route component is lazy-loaded.

### Typed route metadata
`router/route-meta.d.ts` augments the router's `RouteMeta` with exactly two
fields — `layout?: AppLayoutName` and `requiresCapability?: Capability`:

```ts
declare module "vue-router" {
  interface RouteMeta {
    layout?: AppLayoutName;
    requiresCapability?: Capability;
  }
}
```

> **This is the single most valuable routing pattern to carry.** Route metadata
> is *typed*, so a typo in a capability name is a compile error and the set of
> legal layouts is closed. React Router v8's `handle` is untyped by default; the
> React repository should declare the equivalent interface and type `handle`
> against it. Tier 07 does not currently require this.

### Five layouts, chosen by a registry
`layouts/layoutRegistry.ts` maps `meta.layout` to a component with
`satisfies Record<AppLayoutName, Component>` — so adding a layout name without a
component is a compile error. The layouts are `default`, `auth`, `admin`,
`blank`, `fixed-height`, plus `MainLayout.vue` which `DefaultLayout` delegates
to. **`frontend-structure.md` records that only `default` is wired to real
routes; `auth`/`admin`/`blank` exist but are unused.**

> The corpus specifies **three** layouts. The gap is not that three is wrong —
> it is that the Vue repo built five and uses one, which is the more useful
> lesson. `fixed-height` is the one that is genuinely load-bearing and has no
> counterpart in the corpus: a full-height, non-page-scrolling shell, which is
> what a data table with its own scroll region needs.

### The `pages/` vs `components/` rule
`frontend-structure.md` states it as "the one rule that drives everything":

> `pages/` holds thin route hosts. `components/` holds all real UI — including
> every feature screen. A feature module has exactly ONE host page; its screens
> live under `components/<Module>/<Feature>/` and are wired as nested child
> routes.

Screen components deliberately **drop** the `Page` suffix; "Page" is reserved
for the thin hosts. **This is the rule tier 10's path example was corrected
against**, and the correction was right — but the corpus states the reservation
without stating the host/screen split that motivates it.

### Deliberate stub routes — a named exception
Four top-nav modules exist; one is built. Overview, QIR and TSB route to stub
pages rendering an empty state. `frontend-structure.md` calls this out as an
**intentional relaxation** of the repo's own "no speculative routes" rule,
scoped to top-nav targets only, so that all four nav links resolve.

> Worth copying as a *pattern for how to relax a rule*: name the rule, scope the
> exception, say why, say what closes it. That is what tier 30's "a rule that
> cannot be enforced yet is not adopted yet" looks like applied to a route tree.

### Data-driven navigation
`config/navigation.ts` exports `navigationItems` and `getVisibleNavItems`,
filtered by capability. Navigation is data, not markup, and its visibility is
computed from the same capability model as everything else.

---

## 8. `src/config/` — a folder the corpus has no slot for

```
config/data-source.ts                    the fixtures predicate
config/navigation.ts                     nav items + capability filter
config/issue-columns.config.ts           table column definitions
config/issue-kpis.config.ts              KPI strip definitions
config/notification-categories.config.ts notification taxonomy
```

A **declarative configuration layer**: the things that describe *what a screen
shows* rather than *how it renders*, extracted from the components that consume
them. The `.config.ts` suffix is a convention, and `frontend-structure.md`
names it alongside `use<Name>` and `<domain>.constants.ts`.

> **Tier 01's folder-ownership table has no row for this and should.** Column
> definitions in particular are exactly what tier 27's table-review checklist
> assumes exists somewhere. Whether it stays app-level `config/` or moves inside
> the feature folder is a decision; that it exists as a layer is not really
> optional once a table has fifteen columns and three roles see different
> subsets of them.

---

## 9. Empty folders — six of them

```
src/modules/              src/plugins/
src/shared/modules/       src/shared/composables/
src/shared/directives/    src/shared/components/
```

Six directories exist in the working tree with no files. `docs/ai/` flags the
same class of finding in `ui-library` ("what's still an empty placeholder
folder"). Note also that `src/composables/` and `src/shared/composables/` both
exist, one populated and one not — two plausible homes for the same file kind,
which is how a codebase ends up with the same hook in two places.

> **For the restructure this is a direct instruction:** an empty folder is a
> claim about architecture that nothing is honouring. Tier 30's Phase 2 should
> delete them, and tier 01 should forbid creating a folder before something
> lives in it.

---

## 10. Cross-cutting shared modules

| Module | What it does | Corpus owner |
|---|---|---|
| `shared/logger.ts` | transport seam + `createMonitoringTransport` | 21 |
| `shared/monitoring.ts` | DSN-gated remote reporting | 25 |
| `shared/download.ts` | `saveBlob()` | **none** |
| `shared/format/date.ts` | date formatting | 21 |
| `shared/format/file-size.ts` | byte formatting | **not listed** |
| `shared/http/` | the axios clients | 05 |

### The logger is the shape tier 21 and 25 describe

```ts
export interface LoggerTransport {
  error: (err: unknown, context?: LogContext) => void;
  warn:  (message: string, context?: LogContext) => void;
  info:  (message: string, context?: LogContext) => void;
}
```

with `setLoggerTransport()` / `resetLoggerTransport()` documented as a
**test-only seam**, and `createMonitoringTransport()` wrapping a base transport
so that `error` additionally forwards to a vendor-neutral `report` sink —
guarded, so **a throwing sink never breaks logging**. `monitoring.ts` is
**dormant unless `VITE_MONITORING_DSN` is set**, and prefers
`navigator.sendBeacon` over `fetch(keepalive)` so a report survives unload.

> Three things the corpus should adopt outright: the swap-the-transport test
> seam, the try/catch around the sink, and beacon-first delivery. Tier 25
> specifies "the sink behind an interface" abstractly; this is the interface.

### And one genuine conflict
`serializeError()` attaches `url: window.location.href` to every payload.
**Tier 21's prohibition list forbids full URLs in a log line**, on the grounds
that a PQMS URL carries issue identifiers in its path. The Vue implementation
violates the React standard. Whether the React version drops the field or
records a sanitised path is a decision — but it has to be a decision, not an
inherited line.

### `download.ts` is unowned
`saveBlob(blob, filename)` — create object URL, synthetic anchor click, revoke
**immediately** after the click (leaving it alive pins the blob for the life of
the document). It was extracted from an xlsx-shaped export helper when a second
caller appeared. BRD-committed Excel export means the React repository needs
this and no tier file owns it.

---

## 11. The component library — nine categories, and two components outside all of them

Category folders under `ui-library/src/components/`: `base` (12), `composite`
(4), `feedback` (3), `layout` (1), `navigation` (3), `overlay` (2), `pqms` (1).

**And `BaseDataTable/` and `BaseModal/` sit directly under `components/`,
inside no category at all** — the two largest and most-used components in the
library. `ui-package-architecture.md` documents six categories; the code has
seven plus two strays.

> Tier 01 specifies eight categories. The lesson is not the count — it is that
> **the two components that arrived first never got filed**, and nothing failed
> when they didn't. A category structure with no check is a suggestion.

### `pqms/` — the escape hatch that proves the boundary is real
`BaseCommentCard` lives in a `pqms/` category: a component that is
product-specific but still presentational. It is the honest answer to "reusable
primitives only" when a primitive turns out to be domain-shaped, and it is
better than either forcing it into `base/` or duplicating it per feature.

### The component file shape

```
BaseButton/
  BaseButton.vue          BaseButton.types.ts
  BaseButton.constants.ts BaseButton.stories.ts
  BaseButton.spec.ts      index.ts
```

Consistent across all 26 components. **`BaseDateRangePicker` and
`BaseDateSelector` add a sixth kind, `X.utils.ts`** — component-private pure
helpers, separately testable. `BaseDataTable` adds `types.ts` (unprefixed) plus
two cell components (`MultiValueCell`, `TruncatedTextCell`) as private
siblings.

### Shared type vocabulary
`ui-library/src/types/` — `size.types.ts`, `variant.types.ts`, `state.types.ts`,
`icon.types.ts`. One vocabulary, imported by every component, which is what
stops the fourth component inventing a fifth spelling of "size". The React
scaffold's `Pqms*` types are the same idea.

### Two library-level cross-cutting specs
`ui-library/src/a11y.spec.ts` and `ui-library/src/list-markers.spec.ts` — specs
that sweep **every** component rather than testing one. The a11y sweep uses
`vitest-axe`.

> **Carry this.** A per-component a11y assertion is easy to forget on component
> 27; a sweep that enumerates the barrel cannot be forgotten. Tier 10 specifies
> axe in the test run but not the sweep shape.

### Export strategy
Three entry points, and the middle one is the interesting one:

```json
".":                 "./src/index.ts",
"./markdown-editor": "./src/components/composite/BaseMarkdownEditor/index.ts",
"./styles":          "./src/styles/tokens.css"
```

`BaseMarkdownEditor` pulls in eight `@tiptap/*` packages, so it is behind its
own subpath and cannot be dragged into the main bundle by a barrel import. The
corpus already specifies this heavy-dependency subpath; **this is where it came
from.**

---

## 12. Design tokens — nine modules, a spec, and two scales the corpus omits

```
colors.ts  semanticColors.ts  typography.ts  spacing.ts
cornerRadius.ts  elevation.ts  grid.ts  icons.ts  logo.ts
tokens.css  tokens.spec.ts
```

Two observations the token-authoring plan in `06-styling-and-design-tokens.md`
needs:

- **`grid.ts` and `logo.ts` have no row in tier 06's scale-by-scale table.** A
  grid scale (columns, gutters, container widths) and logo dimensions are real
  token categories with real documentation behind them
  (`docs/design-system/grid.md`, `logo.md`).
- **`tokens.spec.ts` exists** — the token values are under test. Tier 06 treats
  tokens as data to author; the Vue repo treats them as data to *assert*. Given
  that tier 06 now makes WCAG SC 2.5.8 a token-authoring gate, that gate is
  exactly the kind of thing a token spec should enforce mechanically rather
  than by review.

**Two `tokens.css` files exist here too** — `design-tokens/src/tokens.css` and
`ui-library/src/styles/tokens.css` — with each package exporting its own as
`"./styles"`. The React scaffold reproduced the arrangement, and tier 18
carries an open placeholder asking what the relationship is. **The Vue repo
does not answer it either**; both files are in `.prettierignore` and the ESLint
`ignores` list as "owned by the token pipeline, not hand-formatted", which
describes a pipeline that does not appear to exist in the repository.

> The placeholder stays open. But it should now record that the ambiguity was
> **inherited, not introduced** — which means resolving it is a prerequisite of
> the restructure rather than a scaffold cleanup.

---

## 13. i18n — the per-component convention, confirmed and dated

`i18n/index.ts` holds the locale and fallback and **no strings**:

```ts
messages: {}, // intentionally empty — strings live in per-component files
```

The convention is recorded in the file as a team decision dated 2026-07-21:
every component owns a sibling `<Name>.i18n.ts`, consumed with
`useI18n({ useScope: "local", messages })`. `SUPPORTED_LOCALES` is `["en"]`
with `AppLocale` derived from it — the same `as const` + indexed-access idiom
tier 02 requires for status.

**It is real and pervasive**: `src/components/shared/` alone has seven
`*.i18n.ts` files, each beside its component and its spec.

> Confirms tier 09 completely. One addition it should absorb: the *fallback*
> discipline. `fallbackLocale` keeps untranslated keys rendering English rather
> than rendering a key, which is what makes adding a second locale incremental
> rather than all-or-nothing.

Note also that `LinkedIssueCard.vue` has a spec but **no** `.i18n.ts` — the
convention is a convention, not a check.

---

## 14. Testing — two placement conventions in one repository

This is the most important testing finding and the corpus states only one side
of it.

| Location | Convention |
|---|---|
| `apps/pqms-portal/src/tests/**` | a **mirrored tree** — `tests/stores/`, `tests/services/`, `tests/components/IssueManagement/…` |
| `apps/pqms-portal/src/components/shared/**` | **colocated** — `DtcTypeahead.spec.ts` beside `DtcTypeahead.vue` |
| `apps/pqms-portal/src/api`, `src/services`, `src/shared/format` | **colocated** — `investigation.spec.ts`, `issue-detail.mappers.spec.ts`, `date.spec.ts` |
| `packages/ui-library/**` | **colocated**, uniformly |

**Both conventions are live in the same package.** `sonar-project.properties`
declares `sonar.tests=apps/pqms-portal/src/tests` — so Sonar classifies only
the mirrored tree as tests, and **every colocated spec is analysed as
production source**. That is a concrete, measurable consequence of the drift,
and it was almost certainly not intended.

> `10-testing-standards.md` specifies the mirrored tree. That is a legitimate
> choice, but the corpus should say why it is choosing against the colocation
> the same repository also practises, and tier 15's Sonar configuration has to
> agree with whichever wins — because if it doesn't, the two disagree silently.

### The coverage gate, and where its number came from
`vite.config.ts` carries the history in a comment:

> The split floors this replaces (85/78/80/85) let branch and function coverage
> drift down while statements looked healthy, and the gate finally failed on a
> PR at 79.82% functions. One number for all four removes the ambiguity.

with a recorded actual as of 2026-08-10: **Stmts 92.1 / Branch 85.9 / Funcs
89.0 / Lines 92.4**, and the observation that branch coverage is the tightest
of the four.

> **This is the origin of the corpus's uniform 85/85/85/85 rule and it is
> stronger than the rule as currently written.** Tier 10 states the number; it
> does not state that split floors were tried and failed, which is the argument
> that survives a reviewer proposing to relax one metric "just for now".

The `exclude` list is concrete and worth adopting: `**/*.stories.ts`,
`**/*.spec.ts`, `src/tests/**`, `**/*.d.ts`, `**/*.config.*`, `src/main.ts`.

### Two test-environment settings the corpus does not have
```ts
env: {
  VITE_USE_FIXTURES: "true",
  TZ: "America/New_York",
}
```

- **Fixtures are forced for the suite**, overriding a developer's local `.env`,
  so a machine set to live-backend testing does not silently run the suite
  against a backend that is not there.
- **The timezone is pinned to a UTC-negative zone**, deliberately, so that
  date-rendering assertions on a bare `YYYY-MM-DD` are deterministic
  everywhere — rather than passing in UTC-and-east and failing only for
  developers west of it.

> **Both belong in `26-test-data-fixtures-and-test-scope.md`.** The TZ pin in
> particular is the kind of thing a team discovers by losing an afternoon.

### E2E
Playwright, `testDir: ./e2e`, chromium only, `forbidOnly` and `retries: 2`
under CI, `trace: "on-first-retry"`, and a `webServer` block that boots
`pnpm dev` with `VITE_USE_FIXTURES=true` — **so E2E needs no backend at all.**
Vitest's `include` is scoped to `src/**/*.spec.ts` specifically so it does not
try to execute the Playwright specs. One spec exists (`issue-list.spec.ts`).

---

## 15. Linting, formatting and the burn-down strategy

`eslint.config.js` is flat config, five positions, `eslint-config-prettier`
last, with `ignores` covering build output, both token CSS files, and the prose
directories. Two things stand out:

**Project-convention rules are `warn`, not `error`, on purpose:**

> Pre-existing issues start as warnings so CI stays green while they are burned
> down incrementally (Phase 3+); tighten to "error" later.

with the a11y rules carrying the same treatment and a named owner for the
re-escalation ("Phase 3, R13, automated a11y gate — kept visible, not
silenced").

> **This is tier 30's third governing rule, discovered independently.** A rule
> that cannot be enforced yet is not adopted yet — but a rule set to `warn` with
> a named phase that flips it to `error` *is* adopted, on a schedule. Tier 30
> should cite it as the mechanism, and tier 14 should require that any `warn`
> carry the reason and the trigger, or it becomes permanent.

**Per-file rule disables carry their evidence.** Two components disable
`no-static-element-interactions` at file level, and the config explains at
length why an inline `eslint-disable-next-line` cannot be used instead: before
a template root element it becomes a second root node, which makes Vue treat
the template as multi-root and stop forwarding `data-testid` — "a real,
observed test breakage, not a style nitpick."

**`tsconfig.base.json` leaves `noUnusedLocals`/`noUnusedParameters` to ESLint**,
with the reason recorded: `vue-tsc` does not count `<script setup>` bindings
used only in the template as reads. **That reason is Vue-specific and does not
transfer** — in React, JSX bindings are ordinary references, so the React
`tsconfig` should turn both compiler flags **on**. This is a case where copying
the config forward would carry a workaround for a problem that no longer
exists.

### The rest of the quality surface
- **`.editorconfig`** — `end_of_line = lf`, final newline, trimmed trailing
  whitespace, with `[*.md]` exempted from trimming (two trailing spaces are a
  Markdown line break).
- **`.prettierrc.json`** — the six settings the React corpus already specifies
  verbatim, `endOfLine: "lf"` included.
- **`.prettierignore`** excludes `**/*.md` entirely: "Docs, planning artifacts,
  and design artifacts are prose/tables — do not reflow."
- **`.lintstagedrc.json`** — three globs, `eslint --fix` then `prettier --write`
  for code, `prettier --write` only for JSON/CSS.
- **`.vscode/extensions.json` + `settings.json`** — recommended extensions,
  format-on-save, `source.fixAll.eslint` explicit, and
  `typescript.tsdk: node_modules/typescript/lib` so the editor uses the
  workspace TypeScript rather than its bundled one.
- **`.git-blame-ignore-revs`** — present, with instructions, holding a slot for
  the one-time Prettier formatting baseline commit.

> **That last file is the one the restructure most needs and the corpus does not
> mention.** A restructure is a large mechanical reformat-and-move; without a
> blame-ignore file, `git blame` on every touched line points at the
> restructure commit and the real history becomes unreachable through the
> tooling everyone actually uses. It costs one line per bulk commit.

---

## 16. Git hooks — and the polyglot-monorepo problem

Three Husky hooks, and all three solve the same non-obvious problem:
`core.hooksPath` is repo-wide and git supports only one, but the pnpm project
lives in `frontend/` inside a polyglot monorepo that also holds `backend/`,
`infrastructure/` and `automation-tests/`.

- **`pre-commit`** — exits early unless something staged lives under
  `frontend/`, then `cd`s there and runs `lint-staged`.
- **`commit-msg`** — resolves `$1` to an absolute path *before* `cd`ing, because
  git passes it relative to the repo root. Then `commitlint --edit`.
- **`pre-push`** — `turbo lint` + `pnpm lint:eslint`. The full Vitest suite is
  **deliberately excluded** ("~80s ... intentionally left to CI to keep push
  latency low"), with a comment telling you how to add it if you want it. Uses
  `@{push}` to detect whether the push includes frontend changes, and **fails
  open** — running the checks — if `@{push}` cannot be resolved, e.g. on the
  first push of a new branch.

`commitlint.config.js` extends `@commitlint/config-conventional` with a comment
confirming its `type-enum` already covers the documented prefixes.

> All three transfer if the React repository is also a sub-directory of a
> polyglot monorepo, and none are needed if it is not. **Tier 23 should say
> which shape it is assuming**, because the hooks are materially different and
> the fail-open and absolute-path details are exactly the kind of thing that
> gets rediscovered painfully.

---

## 17. CI — two workflows, and one guard worth copying

`frontend-ci.yml` — path-filtered to `frontend/**`, `concurrency` with
`cancel-in-progress`, `defaults.run.working-directory: frontend`, pnpm via
`pnpm/action-setup@v4`, Node via `node-version-file: frontend/.nvmrc`.

**`quality` job:** type-check (`vue-tsc`) → ESLint → **Prettier `--check`** →
build → unit tests with coverage → upload coverage artifact `if: always()`.

**`e2e` job:** separate, installs `--with-deps chromium`, uploads the Playwright
report `if: always()`.

`frontend-sonarqube.yml` — a **separate** workflow, `fetch-depth: 0` (Sonar
needs full history for new-code analysis), and a **secret guard**:

```yaml
- name: Detect Sonar secret
  id: guard
  run: echo "enabled=${{ secrets.SONAR_TOKEN != '' }}" >> "$GITHUB_OUTPUT"
```

every subsequent step conditioned on it, and an explicit "Skipped (no
SONAR_TOKEN)" step so the skip is visible rather than silent.

> **Copy the guard pattern.** It is why a fork or a fresh clone does not have a
> permanently red pipeline, and the visible-skip step is what stops "guarded"
> becoming "quietly never runs". Tier 15 specifies the Sonar workflow but not
> the guard.

**Note the Prettier `--check` step**, which is a gate this project's own
operating memory records as unrunnable on Windows because of line endings. The
gate exists in CI and cannot be satisfied locally on every developer machine —
that is a real, inherited friction the React repository should decide about
deliberately (a `.gitattributes` with `* text=auto eol=lf` is the usual answer,
and this repository has no `.gitattributes`).

---

## 18. The documentation set — 45 files, and a structure worth inheriting

```
docs/architecture/       frontend-structure, layouts, security/authentication
docs/architecture/adr/   0001-authentication-and-api-client-placement.md
docs/design-system/      tokens, component-standards, ui-package-architecture,
                         per-component docs (8), templates (2)
docs/engineering/        coding-guidelines, testing-guidelines,
                         performance-guidelines, code-review-checklist,
                         vue-best-practices
docs/artifects/          customer BRD v1.3, DRD v1.0, three HLDs
docs/ai/                 implementation-status, monorepo-tooling-reference,
                         portal-runtime-reference, ui-library-component-reference,
                         business-domain-glossary, SuggestedUpdated
docs/workflows/
```

**Most of this is already absorbed into the tier corpus** — `coding-guidelines`
into 02/14, `testing-guidelines` into 10, `component-standards` and
`ui-package-architecture` into 01/03, `business-domain-glossary` into 17,
`implementation-status` into 18, `monorepo-tooling-reference` into 20. Two
things are not.

### ADRs — a decision format the corpus has no owner for
ADR 0001 is a genuinely good one: numbered, dated, `Status: Accepted (interim)`,
named deciders, cross-links to the target-architecture document *and* the story
that implements it, a Context section that quotes both conflicting documents by
path, a Decision that separates **target** from **interim**, and an explicit
table of which interim file lifts to which target package.

The corpus has decisions everywhere — `DEC-01`…`DEC-13` in the BRD, `N-01`…`N-26`
in `NewReactproject/09`, 32 `[PLACEHOLDER]` markers in tier 18's register — but
**no standard for how a decision gets recorded once it is made.** A placeholder
closes into… a paragraph edit, in whichever tier file happened to carry the
marker, with the reasoning lost.

### The `docs/ai/` sync discipline
Its README states the rule the corpus practises for its own generated document
but never generalises:

> This is a point-in-time snapshot, not a live sync. If the repository changes
> significantly, this folder should be regenerated rather than hand-edited
> piecemeal, to avoid it silently drifting out of sync the same way it
> identified drift in other documents.

and, on precedence:

> Where this folder disagrees with a document under `docs/architecture/`, the
> code was audited directly — but the resolution of any conflict is a project
> decision, not something this folder decides.

That is precisely the stance **this file** takes toward the tier corpus, and it
is the stance tier 18's implementation-status section should take toward the
scaffold. It deserves to be written down once, as a rule about documents,
rather than re-derived in each document's preamble.

---

## 19. What has no owner anywhere

Collected from the sections above — concerns the Vue repository handles, or
visibly fails to handle, that no tier file currently claims:

| Concern | Evidence |
|---|---|
| File download / blob saving | `shared/download.ts` |
| Byte/file-size formatting | `shared/format/file-size.ts` |
| Excel export | `xlsx` dependency, `issue-export.ts` |
| Declarative screen configuration | `src/config/*.config.ts` |
| Grid and logo token scales | `design-tokens/src/grid.ts`, `logo.ts` |
| Token value assertions | `design-tokens/src/tokens.spec.ts` |
| Library-wide a11y sweep spec | `ui-library/src/a11y.spec.ts` |
| Supply-chain release-age holds | `pnpm-workspace.yaml` |
| `.gitattributes` / line-ending policy | **absent, and CI gates on it** |
| Blame-ignore for bulk commits | `.git-blame-ignore-revs` |
| ADR format and lifecycle | `docs/architecture/adr/` |
| Editor configuration | `.vscode/`, `.editorconfig` |
| Rich-text editing | `@tiptap/*`, `BaseMarkdownEditor` |
| Optimistic-lock UX | `composables/useIssueLock.ts` |

---

## 20. Composables — the carry-forward disposition

| Composable | React disposition |
|---|---|
| `useAsyncQuery` | **SUPERSEDED** — a hand-rolled query cache; TanStack Query replaces it entirely |
| `useDebouncedCallback` | **CARRIED** — already named in tiers 03 and 12 |
| `usePermissions` | **CARRIED** — the rule; not the two-capability model |
| `useIssueLock` | **CARRIED** — optimistic concurrency, `409 / ISM-CC-001`; unowned by any tier |
| `useWorkspaceTabs` | **SUPERSEDED** — tier 07 makes workspace sections a route segment, not component state |
| `useExpandAll` | **PARTIAL** — a table concern; belongs to whatever owns the table |
| `useNotificationNavigation` | **CARRIED** — deep-linking from a notification to its target |
| `ui-library/useToast` | **CARRIED** — tier 22 owns the toast rules; this is the hook shape |
| `ui-library/useReasonGatedAction` | **CARRIED** — reason-required transitions are BRD-mandated, and `BaseReasonGate` is the paired component |

`useAsyncQuery`'s existence is itself the argument for TanStack Query: it is
what a team builds when it needs caching, loading state and refetch, and it is
the third-most-likely place for a subtle bug in any codebase that has one.

---

## 21. Summary — the five things this audit changes

1. **The two-layer `api/` + `services/` + `.mappers.ts` split is real,
   load-bearing and under-specified in tier 05.**
2. **Typed route metadata** (`layout`, `requiresCapability`) is the routing
   pattern most worth carrying, and tier 07 does not require it.
3. **Two test-placement conventions coexist**, and `sonar-project.properties`
   silently classifies half the specs as production code. Tier 10 must state
   its choice as a choice, and tier 15 must agree with it.
4. **Build-mode-as-a-fuse is a house pattern**, used three times independently
   (HTTPS tripwire, `switchRole`, fixtures bypass). Tier 13 should name it.
5. **The corpus has no owner for decision records**, while the repository it is
   documenting has a good ADR and a good regenerate-don't-edit rule. That is
   the documentation-standards gap.

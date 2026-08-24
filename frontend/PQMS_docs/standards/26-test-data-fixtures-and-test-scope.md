# 26 — Test Data, Fixtures and Test-Scope Rules
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
Where fixture data lives, how it is built, and the four test-scope questions
`10-testing-standards.md` deliberately leaves open. Resolves `05`'s open
placeholder on fixture-module location.

## Fixture modules — location
**`src/fixtures/`, one module per domain area**, mirroring `services/`'s
feature grouping: `src/fixtures/issue-management/`,
`src/fixtures/notification/`.

Resolves `05`'s placeholder. `05` states the constraint that shaped it:
`kus-pqms` used `src/api/`, which also held the domain types that `02` now
places in `src/types/` — so copying that folder wholesale would drag two
concerns into one place. A dedicated folder separates them. **Decided
here**, with that reasoning, rather than inherited.

## Rules
| ID | Rule |
|---|---|
| F-01 | **A fixture is the domain shape, not the wire shape.** It is returned by a service function *after* mapping, so it is what a component would receive. |
| F-02 | **Every fixture passes the same Zod schema a real response passes** (`05`). A fixture that fails the schema is a broken fixture, and finding that out in fixtures mode is the point. |
| F-03 | Fixtures are **realistic, not minimal**. Long titles that truncate, multi-value source and model cells, an issue with zero links and one with twelve, every one of the eight statuses, every severity tier. A fixture set where everything is tidy tests nothing. |
| F-04 | Fixtures are **deterministic**. No random values, no `Date.now()`. A relative timestamp is expressed as an offset from a fixed base date exported by the fixture module. |
| F-05 | A fixture module exports **both** a collection and named individuals — `issues`, and `issueWithNoLinks`, `issueClosed`, `issueCritical` — so a test can name the case it is exercising instead of indexing into an array. |
| F-06 | **Test fixtures and fixtures-mode fixtures are the same modules.** Not two sets. Two sets drift, and the drift surfaces as "it works in the app but the test fails". |
| F-07 | MSW handlers (`10`) are built **from** the fixture modules, never with inline literals. |

## The four scope questions `10` leaves open
`10` owns runner, placement, query priority, mocking and a11y assertions,
and deliberately does not say *what* to test. Answered here, because a
corpus that never answers it gets answered per-developer.

| Layer | Test | Do not test |
|---|---|---|
| `ui-library` component | Every variant renders; every state renders; every callback fires with the specified payload; keyboard behaviour named in its spec; one axe assertion | Class names (`06` and `10` both forbid it); internal state; visual appearance — that is Storybook's job |
| Hook | Its return shape; each branch of its logic; cleanup on unmount | The library underneath it — never assert TanStack Query's own caching |
| Service + mapper | The mapping, field by field; that the schema rejects a malformed response; each of `05`'s three named lenient fields is genuinely lenient | HTTP itself — MSW covers the boundary |
| Store | Each action's effect on state; the persistence behaviours `04` requires (`partialize`, per-field fallback, corrupted-JSON recovery) — **these three especially, because Zustand supplies none of them and the failure is silent** | Zustand |
| Screen | The user-visible flow: renders, filters, submits, shows its error state, respects role gating | Implementation detail; every permutation of every filter |

## Snapshot testing
**Not used.** A snapshot asserts that output has not changed, which is not
the same as asserting it is correct — and it passes for the wrong reason
after any deliberate change, so it trains people to update snapshots without
reading them. Recorded because a codebase with no stated position acquires
snapshots by default.

## Security-relevant tests
Three assertions that are not optional, because each covers something no
other gate covers:

| ID | Assertion |
|---|---|
| S-01 | For each of the 38 rows in BRD `§7.3`, a test that the denied roles cannot invoke the action. `08`'s hard rule is that client checks are affordance hints only — so these tests assert the affordance is absent, and the server-side equivalents live in the backend suite. |
| S-02 | A test that a `dangerouslySetInnerHTML` path escapes its input, at the call site `13` anticipates (the markdown comment renderer). `13` records that the danger is a **later change** swapping the renderer, so the test is what preserves the property. |
| S-03 | The log-scanning check `21` requires, asserting no prohibited field reaches a logger call. |

## i18n in tests
A component's `.i18n.ts` self-registers its namespace as an **import side
effect** (`09`). A test that renders the component but does not import it —
or imports a mock of it — gets a component whose translations silently fall
back rather than throwing. **Every component test imports the real component
module**, and a test asserting on user-facing text asserts on the `en` value
from that component's own `.i18n.ts`, never a hardcoded string. `09` names
the silent namespace mismatch as a known manual-discipline risk; this is the
check that catches it.

## Two test-environment settings that are not optional
Both are one line, both come from the prior repository, and each represents a
class of failure that is otherwise diagnosed slowly and repeatedly.

### Force fixtures mode for the suite
Set the fixtures flag in the test runner's own environment configuration,
overriding whatever a developer's local `.env` says.

A developer testing against a live backend sets that variable locally and then
forgets. Without the override, their next test run silently attempts real HTTP —
against a backend that is not running in CI and may not be running locally —
and the failures look like application bugs. **The suite's data source is a
property of the suite, not of the machine.**

The same applies to the E2E runner, which sets it in its `webServer` block for
the same reason. 15-devsecops-and-ci-cd.md records the CI half.

### Pin the timezone
Set `TZ` in the test environment to a **UTC-negative** zone.

The prior repository pins `America/New_York` deliberately, and the reasoning is
worth keeping in full: a bare `YYYY-MM-DD` rendered through a local-time
formatter yields a different calendar day west of UTC than at or east of it. Left
unpinned, date assertions pass for everyone in Europe and Asia and fail for
everyone in the Americas — so the bug is found late, by one person, and looks
like a flake.

**Pinning to UTC is the wrong fix**, because UTC is the case that works
accidentally. Pinning to a negative offset means the whole team runs the
timezone that catches the error.

## Testing the logger
21-logging-formatting-and-client-diagnostics.md's rules — stable message keys,
the prohibition list, the correlation ID — are assertable only through the
logger's transport seam: replace the transport, assert on the calls, **reset in
`afterEach`**.

The alternative is spying on the console, which couples the test to the default
transport and breaks the moment monitoring is enabled. The reset is not
optional: a leaked transport turns one failure into a cascade in unrelated
files, and the cascade points at the wrong tests.

## Fixture realism — latency is part of the fixture
The prior repository serves fixtures through a deliberate artificial delay.

That is not decoration. **A fixture that resolves synchronously means loading
states, skeletons, disabled-while-pending buttons and double-submit guards are
never exercised in development** — they are exercised for the first time by a
user on a slow connection. 22-error-handling-and-user-feedback.md requires those
states; this is what makes them visible while they are being built.

Keep the delay **configurable and off in the test suite**, where determinism
matters more and fake timers are the right tool.

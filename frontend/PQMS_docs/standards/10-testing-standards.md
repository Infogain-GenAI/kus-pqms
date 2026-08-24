# 10 — Testing Standards
**Tier:** 1
**Status:** APPROVED — REVISION 5

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
Testing conventions for this app: test runner, coverage gates, file
placement, query priority, API mocking, and automated accessibility
assertions.

## Test runner: Vitest + React Testing Library, Playwright for e2e
Unit and component tests use **Vitest** + **React Testing Library (RTL)**.
End-to-end tests use **Playwright**.

**Jest and Cypress are not used anywhere in this stack**, and neither
is to be introduced. Vitest shares Vite's config and transform pipeline,
so there is one build story rather than two.

Called out because a superseded generic standards draft, at this
exact path, once assumed Jest and Cypress throughout. **That draft no
longer exists at `Frontend-Development-Standards-v1.0.md`, and the
filename is not a reliable pointer to it any more.** Per 00's Precedence
clause, that path now holds this corpus's own generated distribution
document — regenerated, verified, and in agreement with this section,
not in conflict with it. Anyone still holding a cached or linked copy
of the old draft under this filename has stale content regardless of
the path; see 00 for how to tell the two apart. Provenance: `kus-pqms`
used Vitest and Playwright, so the choice here also has a working
precedent rather than being a fresh preference.

## Coverage thresholds
**85 on all four metrics, uniform:**

```
statements: 85
branches:   85
functions:  85
lines:      85
```

**Enabled from the first commit that adds a covered source file — not
ramped.** A ramp sounds prudent and is a trap: a threshold that starts
low has to be raised by someone, at a moment when raising it fails the
build, and that moment never arrives. The number that ships is the
number that was set on day one.

**What makes 85-from-the-start achievable** is the `exclude` list, not
leniency. Config files, story files, spec files, the app entry point and
type declarations are excluded from the denominator (see
20-glossary-and-appendix.md for the block), so scaffolding commits add
no uncovered lines. The first commit that adds real source code is the
first commit that must carry tests — which is the intended discipline,
not a side effect.

**One edge case to handle at scaffold time, not by lowering the
number**: a coverage run with **zero** covered files may report 0% and
fail, or behave oddly, depending on the provider. Verify the behaviour
when the harness is set up and configure around it — for instance by
enabling thresholds alongside the first real source file. **Do not
lower a threshold to get a green build on an empty repo**; that is the
exact move that makes the number permanent.

**Uniform 85 rather than a split floor is deliberate.** Provenance:
`kus-pqms` ran a split floor (85 statements / 78 branches / 80
functions / 85 lines) and it let branch and function coverage drift
downward while statements looked healthy — until a PR failed at 79.82%
functions. It was then raised to uniform 85. Do not reintroduce a split
floor: one number for four metrics removes the ambiguity about which
one is allowed to slip.

**No PR lowers a threshold to pass CI.** If coverage is short, the
missing tests are the work.

## Test file placement: mirrored `src/tests/` tree
Test files live in a **mirrored `src/tests/` tree**, not co-located next
to the component or module they test.

**One convention, no exceptions.** Provenance for why that is stated so
firmly: `kus-pqms` had both patterns running at once — of 125 spec
files, roughly 59% sat in a mirrored `src/tests/` tree, 38% were
co-located beside their component, and 3% beside a non-component source
file. Nobody chose that; it accumulated. The result is that "where is
this component's test?" had no answer you could rely on.

**Expected shape** (extension becomes `.spec.tsx` for a component test,
`.spec.ts` for a non-component module):

```
src/components/IssueManagement/IssueList/IssueList.tsx
src/tests/components/IssueManagement/IssueList/IssueList.spec.tsx

src/pages/IssueListPage.tsx
src/tests/pages/IssueListPage.spec.tsx
```

**Two examples, because there are two kinds of file and an earlier
revision of this section conflated them.** It showed `IssueListPage.tsx`
living under `src/components/…`, which contradicts
07-routing-and-layouts.md's convention: `*Page` is reserved for the thin
route-target wrappers in `src/pages/`, and the real screen underneath
drops the suffix. The mirroring rule is unaffected — whatever the source
path is, the test path mirrors it exactly — but the example was
misleading about which path a screen has.

The path under `src/tests/` mirrors the path under `src/` exactly,
including the full feature-module nesting (e.g. `IssueManagement/
IssueList/...`, `IssueManagement/IssueDetails/tabs/...`).

## Query priority (React Testing Library)
Default preference order, standard RTL guidance — query by what a user
perceives, not by implementation detail:

1. `getByRole`
2. `getByLabelText`
3. `getByText`
4. `getByTestId` (last resort)

### `data-testid`: the priority order applies uniformly. No pinned values.
**Do not add `data-testid` preemptively to anything.** Query by role,
label, or text. A `data-testid` is added only when an element has no
stable accessible name or role to query by — and adding one is a signal
worth a second look, because an element with no accessible name is
often an accessibility defect rather than a testing inconvenience.

**Seven specific `data-testid` values are deliberately not carried
forward.** `kus-pqms` pinned `header-export`, `result-line`,
`scope-tab-all`, `scope-tab-my`, `scope-count-all`, `toolbar-filter`
and `filter-drawer` as non-negotiable, because its Playwright spec
(`e2e/issue-list.spec.ts`) queried them and dropping one would have
broken e2e coverage silently — no unit test would catch it, since only
the e2e spec exercised those hooks end to end.

**That constraint lapses here, and the reasoning is worth recording so
it is not reinstated by reflex:**

- **The consumer does not exist.** That spec is not being carried
  forward. Pinning seven values with nothing querying them is a
  constraint with no consumer — and one that would then be cited as
  binding by whoever found it.
- **It contradicts the priority order above.** Most of those seven mark
  elements that *do* have an accessible name — an export button, filter
  tabs. Those are `getByRole` targets. Pre-attaching a testid to them
  inverts the order this section just established.
- **The values presume markup nobody has designed.** `scope-tab-all`
  and `scope-count-all` assume a specific scope-tab-with-count control.
  Whether Issue List has that shape is a question for the prototype
  (see 17's Prototype register), not something to fix in advance by
  naming test hooks for it.

**What does carry forward is the underlying rule, which is durable and
applies the moment a real e2e spec exists:**

> Once an e2e spec queries a `data-testid`, that attribute is
> **load-bearing**. Renaming or removing it breaks e2e coverage and no
> unit test will catch it, because the component's own tests pass in
> isolation. So a testid an e2e spec depends on is changed only
> together with that spec.

Which means: when the first Playwright spec is written, whoever writes
it chooses selectors following the priority order — role and label
first, testid only where nothing stable exists — and from that point
those specific testids are pinned by the spec that uses them. The
pinning is real; it just has to be earned by an actual consumer rather
than inherited.

## Mocking API calls: MSW
**MSW (Mock Service Worker)** is the standard for mocking network
requests in component/integration tests. MSW intercepts at the network
layer, so it pairs naturally with TanStack Query (the confirmed
server-state library per 04-state-management.md) — the query client
itself is never mocked; the underlying request is.

MSW handler organization pattern: [PLACEHOLDER — to be finalized during
first real test implementation].

## Automated accessibility assertions — axe in the test run
**This file owns the a11y assertion convention** (it owns test
tooling); 11-accessibility-standards.md cites it and does not restate
it.

**The assertion pattern**: mount the component, run axe against the
rendered element, assert no violations —
`expect(await axe(element)).toHaveNoViolations()`. This runs in the
normal test suite, not as a separate job.

Two setup items, both real work rather than boilerplate:

- **An axe-for-Vitest binding is a new dependency to add.**
  **[PLACEHOLDER — which binding. `vitest-axe` is the obvious
  candidate, but at `0.1.0` it had packaging defects worth checking
  before adopting: an empty `extend-expect` entry and a matcher
  declared as a type-only export, which together meant matchers had to
  be registered per-spec with `expect.extend(axeMatchers)` and cast
  past the broken types. Check whether that is still true, or pick a
  maintained alternative. Trigger: React test-harness setup.]**
- **Register the matcher once via `setupFiles`**, not per spec — unless
  the chosen binding makes that impossible, in which case say so in a
  comment at the registration site.

**Storybook's a11y addon is a second, separate surface.** Wire
`@storybook/addon-a11y` into the Storybook config for manual inspection
during component review. It is not part of the test run and does not
substitute for the assertions above.

Provenance: `kus-pqms` had exactly this arrangement — `vitest-axe` as a
`ui-library` devDependency, `@storybook/addon-a11y` in its Storybook
config, and a single axe spec covering one component (`BaseButton`) as
a seed rather than a suite. The packaging workaround above is quoted
from that spec's own comment.

**Axe assertions are not a staging area for lint.** `kus-pqms` planned
to expand axe coverage first and only then escalate its a11y lint rules
from `warn` to `error`. 11 does the opposite here: those rules **start**
at `"error"`, so remediation happens when a component is written rather
than being deferred behind a coverage ramp. Both surfaces are at full
strictness from the beginning, and neither is waiting on the other.

**Which components get axe coverage is deliberately not specified.**
Whether it becomes a per-component convention or a targeted set of the
interactive ones is a judgement to make once there are real components
to assert against. `kus-pqms` had one, as a seed — not enough to
generalise from.

## Test naming and organization
Standard `describe`/`it` blocks. **One spec file per component or
module** — `IssueListPage.tsx` pairs with exactly one
`IssueListPage.spec.tsx`, never split across several spec files. This
follows directly from the mirrored-tree convention above: a mirrored
path has one destination, so two spec files for one source file have
nowhere consistent to live.

Provenance: one-spec-per-component was already the norm in `kus-pqms`,
so this is the established practice rather than a new constraint.

## The mirrored tree is a choice, and here is what it is chosen against
This file specifies a mirrored `src/tests/` tree. The prior repository, audited
in `../analysis/vue-baseline-audit.md`, runs **both conventions at once**:

| Location | Convention |
|---|---|
| `apps/portal/src/tests/**` | mirrored |
| `apps/portal/src/components/shared/**` | colocated |
| the transport, mapper and format modules | colocated |
| the whole component library | colocated |

That is not a tidiness complaint. It has a measurable consequence:
`sonar-project.properties` declares the mirrored tree as `sonar.tests`, so
**every colocated spec is analysed as production source** — inflating the
measured codebase, polluting duplication and complexity metrics, and applying
production rules to test code. Nobody chose that.

**The rule this corpus adopts: one location, and the quality tooling agrees with
it.** 15-devsecops-and-ci-cd.md's Sonar configuration must list exactly the
location named here. If either moves, both move in the same commit — a
disagreement between them is silent by construction.

**And the choice applies per package, not per file.** The prior library
colocates uniformly and the prior app does not; both are internally consistent,
which is why neither ever got fixed.

## Where 85/85/85/85 came from
This file states the number. The argument behind it is stronger than the number
and belongs here, because the number is what a reviewer under deadline proposes
to relax.

The prior repository ran **split floors — 85/78/80/85** — and recorded in its
own config what happened:

> The split floors this replaces let branch and function coverage drift down
> while statements looked healthy, and the gate finally failed on a PR at 79.82%
> functions. One number for all four removes the ambiguity.

with a measured actual (2026-08-10) of Stmts 92.1 / Branch 85.9 / Funcs 89.0 /
Lines 92.4, and the note that **branch coverage is the tightest of the four** —
so a failure against this gate is almost always an untested conditional, not a
missing test file.

**Split floors were tried in this domain, on this product, and failed.** That is
the answer to "can we drop functions to 80 just for this sprint".

### The exclusion list
Concrete, and worth adopting as-is rather than rediscovering: story files, spec
files, the test tree itself, `.d.ts` files, any `*.config.*`, and the app entry
point. Nothing else. **An exclusion is a coverage decision** — adding one is a
change to the gate, and it is reviewed as such.

## One sweep beats twenty-six reminders
The prior component library ships `a11y.spec.ts` at the package root: a single
spec that enumerates the barrel and runs axe against **every** component,
alongside a second cross-cutting spec for a specific rendering rule.

This file already requires axe in the test run. **Require it as a sweep.** A
per-component assertion is easy to forget on component 27 and its absence looks
identical to a component that has no accessible surface; an enumerating sweep
cannot be forgotten, and a new component is covered the moment it is exported.

The same construction is worth reusing for any rule that must hold across a
whole category — token contrast, required display names, story presence.

## The client's coverage gate is 90/90/90/80 — reconciling it

The target repository already enforces, per `docs/STACK.md` and `TEAM-GUIDE.md`
§5: **90% lines, functions and statements; 80% branches** (Vitest v8 provider).
This file specifies a uniform **85/85/85/85**.

**Do not simply adopt one and delete the other.** They disagree in two
independent ways, and only one of them is a real conflict.

### The height is not the conflict — 90 is above 85, and 90 wins
A floor of 90 satisfies everything this file requires. **Adopt the client's 90.**
Lowering a working gate to match a document is the wrong direction, and
15-devsecops-and-ci-cd.md's ratchet only ever moves up.

### The **split** is the conflict, and this corpus has evidence
Branches at 80 while everything else sits at 90 is exactly the shape the prior
repository ran — 85/78/80/85 — and recorded the outcome of:

> The split floors this replaces let branch and function coverage drift down
> while statements looked healthy, and the gate finally failed on a PR at 79.82%
> functions.

Its measured actual after moving to a uniform floor was Stmts 92.1 / **Branch
85.9** / Funcs 89.0 / Lines 92.4 — with branch coverage the tightest of the
four, which is precisely why a lower branch floor is the one that gets
consumed. **A ten-point gap on the metric that binds first is a ten-point
licence to leave conditionals untested**, and untested conditionals are where
role-gated and status-gated behaviour lives in this product.

### The resolution
**Keep 90 on the three; raise branches to 90 on a ratchet, not in one commit.**

| Step | Branch floor | Trigger |
|---|---|---|
| Today | 80 (the client's value, unchanged) | — |
| Measure | record the actual branch percentage in Phase 0 | baseline |
| Ratchet | floor = measured actual, rounded down; fails on any drop | Phase 1 |
| Target | **90, uniform with the other three** | when the ratchet reaches it |

If the measured actual is already above 80, **the client's gate is not
protecting anything today** and raising the floor to the actual costs nothing —
which is the usual case and worth checking before proposing anything harder.

**Record the target and the reasoning in the Vitest config itself**, next to the
numbers, per 14-code-style-and-linting.md. A floor with no recorded destination
is a floor nobody will ever raise.

### Also already present
**MSW ^2.7.5 is an installed dependency.** Testing Library ^16.3.0 and Vitest
^4.1.6 likewise. Nothing in this file needs adopting — it needs wiring.

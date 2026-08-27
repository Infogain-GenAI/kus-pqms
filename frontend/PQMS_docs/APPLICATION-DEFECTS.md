# Application defects — triage

**Date:** 2026-08-26 · **Class:** working register, not a standard.
**For:** Frontend Lead, architect, and whoever owns the ISM domain rules.

**This document is self-contained.** It assumes no prior reading.

---

## Why these are collected here

**Five** defects were found while restructuring the frontend. **None of them is a
restructuring concern** — they are behaviours the application has today and would
have had regardless of any of that work.

They were recorded across a register that is mostly about documentation and
tooling status, and **that is where defects go to be forgotten.** So they are
pulled out into one place with one shape: what it is, how to reproduce it, who it
affects, and who decides.

### The rule that applies to all five

> **Fixing any of these changes rendered or stored behaviour. Each therefore
> belongs in its OWN change with its OWN verification — never folded into a
> conformance slice or a token-conversion batch.**

The reason is specific, not procedural. The frontend's only behavioural check is
a pixel comparison against a captured baseline, and the current token-conversion
work depends on that comparison staying at **threshold zero**: any non-zero pixel
difference is treated as a regression. A defect fix that legitimately changes
what renders would be indistinguishable from a conversion that broke something.

**Three of these are pinned by tests that assert the CURRENT, defective
behaviour** (`tests/store.test.tsx`, `tests/util.test.ts`,
`tests/IssueListScreen.test.tsx`). Those tests are expected to fail
when the defect is fixed — that failure is the signal the fix landed, and the
expectations move in the same change.

---

## D-1 · Dates shift by a day depending on the developer's timezone

**Severity: user-facing. This is the only one with an unambiguous fix.**

### What it is

`apps/portal/src/data/util.ts` formats dates with **local-time getters** applied
to **UTC-anchored** ISO strings:

```ts
export function fmtMDY(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()}`   // local
}
```

`getMonth()`, `getDate()`, `getFullYear()`, `getHours()` and `getMinutes()` all
read the **runtime's** timezone. The data is anchored in UTC.

### Reproduce

The seed anchor `2026-07-09T02:00:00Z` renders as:

| Timezone | `fmtMDY` |
|---|---|
| UTC | `07/09/2026` |
| Asia/Kolkata (+5:30) | `07/09/2026` |
| **America/New_York (−4)** | **`07/08/2026`** ← a day earlier |

### Who it affects

**Users, not only developers.** Any issue raised late in a UTC day displays with
the previous day's date to a viewer west of UTC. In a quality-management system
where dates carry process meaning — target dates, days-open, audit ordering —
that is a reporting error, not a cosmetic one.

It also affects any screenshot comparison, which is why the capture harness pins
`timezoneId: 'UTC'` as a workaround. **That pin hides the defect from the gate; it
does not fix it for users.**

### Proposed fix

Use UTC getters, or `Intl.DateTimeFormat` with an explicit `timeZone`:

```ts
export function fmtMDY(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getUTCMonth() + 1)}/${p(d.getUTCDate())}/${d.getUTCFullYear()}`
}
```

**One question the fix must answer first:** should dates render in **UTC** or in
**the viewer's local zone**? UTC is correct if the dates are process timestamps
that must read identically for every user. Local is correct if they are meant to
be "when it happened, where you are". The current code does **neither
consistently** — it applies a local reading to a UTC value, which is the one
combination that is wrong under both interpretations.

`21-logging-formatting-and-client-diagnostics.md` already requires that no
component format a date inline, so the fix belongs behind a shared formatter.

**Pinned by:** `tests/util.test.ts`, under `TZ=UTC`.
**Owner:** Frontend Lead. **Decision needed first:** UTC or local, from whoever
owns the domain.

---

## D-2 · `addComment` writes no audit entry

**Severity: domain question. No fix proposed.**

### What it is

Every mutation in `apps/portal/src/data/store.tsx` calls `appendAudit()` —
`linkIssue`, `unlinkIssue`, `proposeTransition`, `approveProposal`,
`rejectProposal`, `startInvestigation`, `addActivity`, `setStatus`, and the rest.

**`addComment` does not.** It writes a comment row and, if the body contains an
`@mention`, a notification. Nothing else.

### Reproduce

```
before = auditFor(issueId).length
addComment(issueId, 'Internal', 'body', actor)
after  = auditFor(issueId).length     // after === before
```

Asserted as current behaviour in `tests/store.test.tsx`.

### Who it affects

Anyone auditing an issue's history. A comment is visible in the Communication
tab, **which the UI presents as immutable**, but leaves no trace in the audit
trail that the History tab renders.

### Why no fix is proposed

**It is a domain question, not a coding error.** The runbook states that "a state
change without an audit entry is a bug" — but whether a *comment* is a state
change for audit purposes is a decision about what the audit trail is **for**:

- **If the audit trail records changes to the issue's state** — status, priority,
  links, ownership — then a comment is correctly excluded, and the omission is
  deliberate.
- **If it records who did what and when** — and the Communication tab's
  immutability suggests it is treated as a record — then the omission is a gap.

Adding an audit row is a two-line change. **Deciding whether it should exist is
not, and the code cannot answer it.**

**Owner:** architect, with the domain owner.

---

## D-3 · `approveProposal` with no proposal outstanding is a silent no-op

**Severity: domain question. No fix proposed.**

### What it is

`approveProposal(id, remark, actor)` reads `proposedStatus` and falls back to the
current status when there is none:

```ts
const target = i.proposedStatus ?? i.status
```

So approving an issue that has no proposal outstanding **succeeds, changes
nothing, and writes an audit entry saying a transition was approved.**

### Reproduce

Call `approveProposal` on any issue without first calling `proposeTransition`.
The status is unchanged; an "Approved transition" audit row appears.

### Who it affects

Anyone reading the audit trail. The row records an approval that approved
nothing. Whether a user can reach this state depends on the UI — the approval bar
is only rendered when a proposal exists — so this is currently reachable through
code paths rather than clicks.

### Why no fix is proposed

**Three defensible behaviours and no way to choose from the code:**

1. **Throw** — an approval with nothing to approve is a programming error.
2. **No-op silently** — current behaviour; forgiving under double-submit.
3. **No-op without the audit row** — the state is unchanged, so arguably nothing
   happened worth recording.

The third is probably the smallest correct change, but "probably" is not a basis
for changing an audit trail's contents.

**Pinned by:** `tests/store.test.tsx`.
**Owner:** architect, with the domain owner.

---

## D-4 · `/admin` has no route guard

**Severity: needs a decision on scope, then a fix. No fix proposed here.**

### What it is

`apps/portal/src/App.tsx` declares the admin route with no guard:

```tsx
<Route path="/admin" element={<AdminScreen />} />
```

Only the **navigation item** is conditional on role. The route itself is not.

### Reproduce

As a non-admin role (e.g. SE), type `/admin` into the address bar. The admin
screen renders in full.

### Who it affects

Nobody today, and that is the point — **there is no authentication in this
application at all.** No IdP, no tokens, no server. `can()` and `<Guard>` are
**affordance control** — they decide what to show — and the code says so honestly.

The risk is not present-tense exposure. It is that **the gap is invisible from
the UI and will still be there when auth lands.** The nav item disappearing looks
like access control, so nobody re-checks the route.

### Why no fix is proposed here

A route guard needs something to guard against, and the permission model is an
open decision (which IdP, what the role matrix resolves to). Writing a guard now
means inventing a permission check that the real model would replace.

**What should happen instead:** record it as a hard prerequisite of the
authentication work, so the route table is revisited at the moment the model
exists — not discovered afterwards.

**Owner:** architect — it is blocked on the identity-provider decision.

---

## D-5 · The issue list does not reset to page 1 when the results change

**Severity: user-facing. Unambiguous — a fix is proposed.**

### The finding is the INCONSISTENCY, not the omission

Six interactions change what the list shows. **Three reset the page and three do
not**, in the same component:

| Interaction | Resets to page 1? | Where |
|---|---|---|
| My/All Issues tab | ✅ yes | `IssueListScreen.tsx:362` |
| Rows-per-page | ✅ yes | `:427` |
| Filter drawer → Apply | ✅ yes | `:450` |
| **Sorting a column** | ❌ **no** | `onSort`, `:302` |
| **Typing in search** | ❌ **no** | `setQ`, `:371` |
| **Clear filters** | ❌ **no** | `clearFilters`, `:313` |

**That split is why this survives review.** A reviewer who checks one path finds
`setPage(1)` and moves on. The three that reset make the three that don't look
deliberate — as though someone decided sorting should preserve position. Nothing
in the code says that, and no user would expect it.

### Reproduce

1. Open the issue list, switch to **All Issues** (33 rows, 20 per page).
2. Go to **page 2**.
3. Click the **Status** column header to sort.
4. You are still on page 2 — of a completely different ordering.

Same with typing in the search box, or clearing filters.

### Why it has survived — the masking detail

```ts
const pageClamped = Math.min(page, pageCount)   // IssueListScreen.tsx:219
```

When the new result set is shorter than the current page index, the page is
**clamped to the last page**. So the user **never sees a blank page** and never
gets an error.

**The bug presents as landing on the wrong results, not as a failure.** It looks
like the list "jumped", which reads as a rendering quirk rather than a defect.
That is precisely why nobody has reported it: the symptom is indistinguishable
from confusion, and a user cannot describe what they did well enough to file it.

### Who it affects

Anyone using the list beyond page 1 — which, at 20 rows per page over 33 issues
today and more later, is everyone doing real triage. The rows they were reading
disappear. In a quality-management system that presents as **data loss**.

### Proposed fix

**Any change to the query shape resets the page to 1.** Three call sites already
do exactly this, so the fix is to make the other three consistent, not to invent
a mechanism:

```ts
const onSort = (key: string) => {
  setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))
  setPage(1)
}
// setQ:          onChange={(e) => { setQ(e.target.value); setPage(1) }}
// clearFilters:  add setPage(1)
```

The durable version is to derive the reset rather than remember it at six call
sites — a `useEffect` on `[tab, flt, q, sort, pageSize]` that calls `setPage(1)`,
so a seventh interaction added later cannot forget. Either is correct; the second
is the one that stays correct.

**Keep `pageClamped`.** It is a legitimate safety net for the case where the data
itself shrinks underneath a stable query.

### The characterisation test already exists, and it is waiting to be inverted

`tests/IssueListScreen.test.tsx` pins the current behaviour:

```
✓ SORTING does NOT reset to page 1 — the defect
✓ SEARCHING does NOT reset to page 1 — the defect
✓ scope change DOES reset to page 1 — correct behaviour
```

**This is what characterisation tests are for.** The fix becomes *"invert two
assertions and state why"* — a diff a reviewer can check in a minute, against a
recorded prior behaviour. A behavioural fix with no prior test gives a reviewer
nothing to compare against and no way to tell an intended change from a
side effect.

One caution recorded with the tests: **`Issue ID` is not a sortable column**
(only Model Code, Status, Issue Date, Owner, Days are). Clicking a non-sortable
header is a silent no-op, and an earlier version of these tests passed while
exercising nothing because of it.

**Owner:** Frontend Lead. **Blocked on:** nothing.

---

## D-6 · The result band's denominator changes with scope, so on "My Issues" it reads "7 of 7"

**Severity: user-facing. Unambiguous — a fix is proposed, and it is one branch.**

### What it is

The band above the table renders:

```tsx
Showing <b>{filtered.length}</b> of {tab === 'my' ? myIssues.length : issues.length} issues
//                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                   IssueListScreen.tsx:395 — the denominator follows the scope
```

The canonical prototype does not:

```js
const totalCount = s.issues.length;      // the WHOLE dataset, always
// template: Showing {{ dResultCount }} of {{ totalCount }} issues
```

So on **My Issues** with no filters, the app renders **"Showing 7 of 7 issues"**
where the prototype renders **"Showing 7 of 33 issues"**.

### Why "7 of 7" is worse than it looks

**A ratio whose two halves are always equal carries no information.** The
sentence exists to tell the user *how much of the data they are currently
seeing*, and under the app's denominator it can only ever say "all of it" the
moment no filter is set — including the case where the scope itself is the
narrowing.

The user's actual question on this screen is **"are these 7 all the issues, or a
slice?"** The prototype answers it. The app answers a different question the user
did not ask, using the same words, which is worse than not answering.

### There are TWO "Showing" strings and they have DIFFERENT denominators

This is the mechanism, and it is why the defect is easy to introduce and easy to
miss:

| Where | Prototype string | Denominator | App |
|---|---|---|---|
| **Band, above the table** | `Showing {dResultCount} of {totalCount} issues` | **`s.issues.length`** — the whole dataset | ❌ scope-dependent (`:395`) |
| **Pagination footer** | `Showing {from}–{to} of {dResultCount} issues` | the **result set** | ✅ correct (`:421`) |

The app gets the footer right. The two strings look interchangeable, they sit
about twenty lines apart in the same file, and only one of them is wrong.

### Reproduce

1. Open `/issues`. The **My Issues** tab is selected by default.
2. Band reads **"Showing 7 of 7 issues"**.
3. Switch to **All Issues** — the band reads "Showing 33 of 33 issues".
4. The prototype reads **"Showing 7 of 33"** and "Showing 33 of 33" for the same
   two states.

### Who it affects

Every user on first load, because My Issues is the default tab. It is the first
sentence on the screen that carries a number, and it is the one a triaging SE
uses to decide whether to widen scope.

### Proposed fix

Delete the branch. The denominator is the dataset, not the scope:

```tsx
// IssueListScreen.tsx:395
- Showing <b>{filtered.length}</b> of {tab === 'my' ? myIssues.length : issues.length} issues
+ Showing <b>{filtered.length}</b> of {issues.length} issues
```

**Do not "fix" the footer to match.** The two strings are supposed to differ —
`00`'s source precedence puts copy under the prototype, and the prototype
deliberately uses the result-set count in the footer, where the range
`{from}–{to}` is already relative to the result set.

**One caveat that belongs to whoever applies it.** The prototype's numerator is
`topRows.length` — **grouped top-level rows**, not issues (see
`screen-descriptions/issue-list.md` §4). The app has no grouping today, so
`filtered.length` is currently equivalent. **If grouping is implemented, the
numerator changes with it and this line must be revisited** — that is tracked as
the escalated grouping question in
`component-specs/RECONCILIATION-issue-list.md`, not here.

### Relationship to D-5

**Distinct, and both are about the user's sense of position in a result set.**
D-5 is *which* rows you are shown after the results change; D-6 is *how many
exist*. Neither fix touches the other's code path.

**Owner:** Frontend Lead. **Blocked on:** nothing.

## Summary

| # | Defect | Kind | Owner | Fix proposed? |
|---|---|---|---|---|
| **D-1** | Dates shift a day by timezone | **user-facing bug** | Frontend Lead | **Yes** — needs UTC-vs-local answered first |
| **D-2** | `addComment` writes no audit entry | domain question | architect + domain | No |
| **D-3** | `approveProposal` no-ops silently | domain question | architect + domain | No |
| **D-4** | `/admin` has no route guard | blocked on auth model | architect | No — prerequisite of the auth work |
| **D-5** | list does not reset to page 1 on sort/search/clear | **user-facing bug** | Frontend Lead | **Yes** — three call sites already do it |
| **D-6** | result band reads "7 of 7" — denominator follows scope | **user-facing bug** | Frontend Lead | **Yes** — delete one ternary |

**D-1, D-5 and D-6 are the three to action.** All three are unambiguous and
affect users; D-5 and D-6 are blocked on nothing at all, and D-6 is a one-line
change.

**D-6 is the cheapest defect in this document and the most visible** — it is the
first number on the default view of the default screen.

**D-1**  It is unambiguous, it affects users, and the only
open question is a small one that the domain owner can answer in a sentence.

**D-2 and D-3 need a decision before any code.** Both are about what the audit
trail is for. They are cheap to fix and cannot be fixed correctly without an
answer, which is exactly the case where writing code first is the wrong move.

**D-4 is not a bug to fix now** — it is a note that must survive until the auth
work starts.

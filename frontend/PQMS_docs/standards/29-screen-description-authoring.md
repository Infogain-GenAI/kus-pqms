# 29 — Screen Description Authoring
**Tier:** 2
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
What a screen description contains.
`18-project-context-and-implementation-status.md` closed the "permanent
artifact or working notes" question in favour of **permanent**, named the
location (`PQMS_docs/screen-descriptions/`, one file per screen), and then
deliberately wrote no template — on the grounds that "their shape should
follow from the first prototype read rather than precede it."

**That reasoning was right and this draft respects it.** What follows is not
a template. It is the **minimum set of questions a description must
answer**, derived from what pass 4 actually needs — the same way
`TEMPLATE.md` was derived from `03`'s accumulated `BaseDataTable` questions
rather than invented. Write the first description, then write the template
from it.

## The boundary, restated
A **screen description says what a screen contains and what it does.** A
**component spec says what a component's API is.** The first is an input to
the second: you cannot specify `BaseDataTable`'s API without knowing what
Issue List does with it, and the component inventory is derived the same way
— read a screen, see which controls it contains.

## What every description must answer
Derived from what a component spec needs from it, plus what `01`, `07`, `11`
and `22` need to be satisfiable.

| # | Question | Why pass 4 needs it |
|---|---|---|
| 1 | **Which prototype file, and which reading** produced this description, with the date | `17`'s register warns the prototype is a moving target renamed three or more times. A description that cannot be re-checked forfeits the reason `18` made it permanent. |
| 2 | **Which BRD screen ID and which FRs** the screen implements | Traceability (`TR-02`), and it is what makes a description reviewable against a requirement rather than only against a picture. |
| 3 | **Layout** — which of `07`'s three layouts, and why | Determines whether the screen scrolls the window or an internal region, which `12` names as a question that decides whether the table can be windowed at all. |
| 4 | **Regions**, top to bottom, each named | The unit a component maps onto. |
| 5 | **Every control**, by what it does — not by what component it might be | The inventory. Say "a control that filters by one or more sources", not "a `BaseSelect`" — naming the component is the *output* of pass 4, not its input. |
| 6 | **Every user-facing string**, verbatim from the prototype | `09` requires every string be a keyed message; the keys are derived from here. `06` makes the prototype govern copy. |
| 7 | **Every state** the screen has — content, loading, empty-no-data, empty-no-match, error, stale, permission-denied | `22`'s screen-state contract, and the states are where prototypes are most often silent. |
| 8 | **What differs per role**, against the BRD `§7.3` rows this screen touches | Five roles; a screen that only describes SE's view is a fifth of a description. |
| 9 | **What the prototype does not show** | The honest half. A prototype cannot express an interaction contract (`00` case 2), so keyboard behaviour, focus order and error states are usually absent. Say so per item rather than leaving the reader to assume the screen has none. |
| 10 | **Where the screen navigates to, and what navigates to it** | `07`'s tree plus BRD `§8.2`; catches missing routes early. |

## Two authoring rules
Both inherited from `TEMPLATE.md`, because the same failure mode applies:

- **Describe only what the prototype shows.** Anything else is marked
  `[UNSPECIFIED — <what is missing>. Resolved by: <what would answer it>.]`
  and is not invented, not filled in by analogy with another screen, and not
  extrapolated to a conventional set. This corpus has caught four fabricated
  values; each was plausible.
- **Say what governs each statement** — "per the prototype", "per the BRD",
  "decided here". An unsourced statement is indistinguishable from an
  invented one.

## Currency
A description is current **as of its stated reading**, not permanently. It
records the reading so it can be re-checked; it is not re-validated on a
schedule. Per `18`, a stale screen description does not misdirect
implementation the way a stale component spec does, because nobody builds
from it directly — which is why `01`'s delete-the-spec-with-the- component
rule has no equivalent here.

## A worked description

The ten questions are abstract until you see them answered. This is a partial
description for the issue list, written to the shape this file requires — the
level of specificity is the point, not the content.

> ### ISM-LST — Issue List
>
> **Route:** `/issues` · **Layout:** `FixedHeightLayout` (the table owns the
> scroll region) · **Roles:** all five; the visible column set and the action
> bar differ, see below.
>
> **Purpose.** The working surface for anyone triaging issues. It answers "what
> needs my attention right now", so the default view is scoped and sorted for
> that, not for browsing.
>
> **Entry points.** Primary nav; the post-create redirect; a notification deep
> link (which arrives with a filter pre-applied and must show that it did).
>
> **Default state.** Scope "My Issues", sorted by severity descending then
> created descending, page size 25. **A returning user's scope, filters, sort
> and page come from the URL** — never from a store, so the view is shareable.
>
> **Four states, all required:**
>
> | State | What renders |
> |---|---|
> | Loading | skeleton rows at the current page size — not a spinner, so layout does not jump |
> | Empty (no issues exist) | empty state with the create action |
> | Empty (filters exclude everything) | **a different message** — says the filters are the cause and offers to clear them |
> | Error | the error surface with the code, and a retry that preserves the query |
>
> The two empty states being distinct is the whole point: a user who has
> filtered themselves into nothing and a user with no data need opposite
> advice.
>
> **Per-role differences.** `VIEWER` sees no action bar and no row selection.
> `SE` sees bulk assign but not bulk status change. Full matrix in the BRD;
> **this description does not restate it** — it names which rows apply.
>
> **What this screen does not do.** It does not edit. Every action either
> navigates or opens an overlay. There is no inline-edit affordance, and adding
> one is a change to this description first.

## What that example is demonstrating

- **It is falsifiable.** "Sorted by severity descending then created descending"
  can be wrong. "Sensible default sorting" cannot.
- **It names the layout**, which is a routing decision that has to be made
  before the screen is built and is invisible afterwards.
- **It distinguishes two empty states.** This is the single most common omission
  in screen descriptions, and it produces the single most common bad empty
  state — "No issues found" shown to a user who has filtered them all out.
- **It states a negative.** "This screen does not edit" is what stops the
  fourth feature request quietly turning a list into a spreadsheet.
- **It points at the authorization matrix rather than copying it.** A restated
  matrix is a matrix that will disagree with the BRD within a month.

## The sequence that makes descriptions cheap

Descriptions are written **from the prototype, in this order**, and the order
matters:

1. **List the screens from the prototype**, by file — not from the BRD, which
   groups by requirement rather than by page.
2. **Write the description for each**, answering the ten questions. Where the
   prototype does not answer one, that gap is the finding — record it as a
   `[PLACEHOLDER]` with a trigger, per
   18-project-context-and-implementation-status.md.
3. **Derive the component inventory from the descriptions**, then reconcile
   against `component-specs/INVENTORY.md` — treating disagreement as evidence
   about that candidate list, not about the prototype.
4. **Write the component specs** for whatever the reconciliation confirms.

Doing 4 before 1 is what produces a component nobody needed, and it is the
common failure — because writing a component feels like progress and writing a
description does not.

## Keeping one current

A description is edited when the screen's **contract** changes: a new state, a
different default, a role difference, a new entry point, a removed capability.

It is **not** edited for styling, copy tweaks, or component refactors — those
are owned by the prototype and the component specs respectively. A description
that churns on every commit is describing implementation, and it will be
abandoned within two sprints.

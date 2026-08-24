# 27 — Forms, Tables and Overlays — Review Checks
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review
**Extends:** 16-code-review-checklist.md — adopt by appending these three
sections to it if that reads better than a separate file.

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
Three checklist sections `16` does not have, for the three surfaces this
product is mostly made of. Same format as `16`; adopt by appending these
sections to it rather than as a separate file if that reads better.

## Why these three
Issue Entry is a five-step form with per-step error grouping. Issue List is
a filterable, sortable, selectable, column-configurable, bulk-actionable
table. Four modals are specified in the BRD. The Vue review checklist had a
section for each; `16` has none, and `18` separately records that **no
standard specifies keyboard or disclosure-pattern behaviour for dropdowns
and popovers at all**.

## Forms
- [ ] Validation is a **Zod schema**, not a sequence of `if`-checks (`03`)
- [ ] The schema is co-located with its form (`IssueEntryForm.schema.ts`),
  not in a shared schemas folder (`03`)
- [ ] Field errors are driven from `ZodError.issues`, not a hand-built
  parallel error shape (`03`)
- [ ] For a multi-step form, the **step-grouping adapter** over the flat
  issue array exists — `03` warns Zod does not do this for you
- [ ] Every field with an error state sets `aria-invalid` **and** associates
  the message via `aria-describedby` (`11`)
- [ ] No step asks for a value an earlier step captured (WCAG 3.3.7
  Redundant Entry, live per `11`)
- [ ] Controlled versus uncontrolled is a **per-field** decision based on
  whether something else depends on that keystroke (`12`)
- [ ] Submit is blocked, not merely warned, while any required field is
  invalid, and the message names what to fix (BRD §14, and `22`)
- [ ] Unsaved changes prompt before navigation (`NAV-04`), and **only** on
  the form the BRD names — nothing else prompts
- [ ] A mutation failure never blanks the form (`03`, `22`)

## Tables
- [ ] Sort, page, page size and column visibility are **client state in the
  issue-filters store**, not component state (`04`)
- [ ] Each is a `<name>` / `on<Name>Change` pair, not one generic
  `value`/`onChange` (`03`)
- [ ] Cell rendering is a **per-column render function**; the table does not
  own cell markup (`03`)
- [ ] Every column has a header with an accessible name; a sortable header
  announces its direction
- [ ] Rows are keyboard-navigable: focusable, Enter/Space activates, visible
  focus ring (`11`, BRD `FR-LST-030`)
- [ ] **Sticky headers and columns verified by keyboard against WCAG
  2.4.11** — tab across and down until focus passes under each sticky region
  (`11`, and `11` records that the Vue table was never checked)
- [ ] Selection uses a real checkbox with an accessible name, and the header
  checkbox carries an indeterminate state
- [ ] A multi-value cell renders its primary value inline with the remainder
  behind a `+N` popover that opens on **hover and keyboard focus** (BRD
  `§8.4`)
- [ ] All four states exist — rows, empty, loading, error — and the empty
  state distinguishes no-data from no-match (`22`)
- [ ] No test asserts on a class name (`06`, `10`)

## Overlays — modals, dialogs, dropdowns, popovers, tooltips
- [ ] Modals and dialogs are built on the headless primitive per `06`'s
  table; they are not hand-rolled
- [ ] Focus moves into the overlay on open and **returns to the trigger** on
  close (`11`)
- [ ] Focus is trapped: Tab and Shift+Tab wrap between the first and last
  focusable element (`11`)
- [ ] Escape closes; the trigger regains focus
- [ ] The accessible name comes from `aria-labelledby` pointing at the
  rendered heading — **never** an `aria-label` duplicating the title string
  (`11`, which records this exact defect in the Vue modal)
- [ ] Overlay content is portaled to the document root (`01`'s `overlay/`
  category definition)
- [ ] A disclosure region uses `aria-expanded` + `aria-controls` and **does
  not** claim `aria-haspopup` unless it is a real ARIA menu with roving
  tabindex and arrow-key navigation (round 3 M2, fixed once — do not
  reintroduce)
- [ ] A tooltip binds `aria-describedby` **only while open**, uses
  `role="tooltip"`, and triggers on **both hover and focus** (`11`)
- [ ] Opening an overlay does not scroll the page behind it or shift its
  layout
- [ ] A destructive confirmation states the **consequence**, not just the
  action: "Closed issues are read-only and cannot be reopened." (`06`
  content voice, BRD `LC-05`)

## Three worked reviews

The checklists above say what to look for. These three examples say what it
looks like when it is wrong — which is the part that is hard to teach from a
list, because every one of these passed a review at some point.

### A form: the submit button that lies

```tsx
<BaseButton type="submit" disabled={!isValid}>Create issue</BaseButton>
```

**What is wrong:** disabling submit until valid is the single most common
accessibility and usability defect in enterprise forms.

- A disabled button is **not focusable**, so a keyboard or screen-reader user
  tabbing to the end of the form finds nothing there and no explanation.
- It gives no reason. The user sees a dead button and must guess which of
  fourteen fields is the problem.
- It hides the error summary that WCAG 3.3.1 expects, because the errors never
  get raised.

**What it should be:** the button stays enabled; submitting an invalid form
runs validation, moves focus to the error summary, and links each message to
its field. The user is told what is wrong, not prevented from asking.

**The second defect in the same line:** nothing guards double submission.
`disabled={!isValid}` is not `disabled={isSubmitting}`, and the two get confused
constantly. A slow network plus an impatient user creates two issues, and
optimistic concurrency (`409 / ISM-CC-001`) will not save you — both requests
are valid.

### A table: the sort that silently drops a page

```tsx
const [sort, setSort] = useState<SortState>({ key: "createdAt", dir: "desc" });
const { data } = useIssuesQuery({ page, pageSize, sort });
```

**What is wrong:** `page` is not reset when `sort` changes. The user is on page
7, sorts by severity, and lands on page 7 of a completely different ordering —
which looks like data loss and is unreportable, because nobody can describe what
they did.

The same bug class covers every filter, the search box and the scope switcher.
**Any change to the query shape resets pagination to page 1**, and the review
check is: for each input that feeds the query key, is pagination reset?

**Two more in the same component, both invisible in a screenshot:**

- **Sort state is in `useState`, not the URL.** So the sorted view cannot be
  shared, bookmarked or recovered by back-button — and 07-routing-and-layouts.md
  puts list state in search params for exactly this reason.
- **`aria-sort` is missing on the sorted column header.** The visual chevron
  conveys ordering to sighted users and nothing to anyone else.

### An overlay: the modal that traps nothing

```tsx
{isOpen && <div className="fixed inset-0 …"><ConfirmDisposition /></div>}
```

**What is wrong:** a `div` with fixed positioning is not a dialog. Everything
that makes a modal usable has to be added by hand, and each omission is
independently invisible:

| Missing | Consequence |
|---|---|
| `role="dialog"` + `aria-modal` | announced as ordinary content |
| Focus moved into the overlay on open | keyboard focus stays behind the backdrop |
| Focus trap | Tab walks out of the modal into the page underneath |
| Focus **restored to the trigger** on close | focus resets to `<body>`; the user restarts their tab journey |
| Escape to close | no keyboard exit |
| Inert/hidden background | screen readers read the page behind it |

**This is why 06-styling-and-design-tokens.md mandates a headless primitive for
overlays.** Every row above is solved, tested and maintained upstream. A
hand-rolled overlay does not fail review because it is unfashionable; it fails
because six separate things are missing and five of them are invisible unless
you close the modal and press Tab.

**The one that survives even a good implementation:** a confirmation modal whose
destructive action is the default-focused button. Focus lands on Cancel; the
destructive action is never the target of a reflexive Enter.

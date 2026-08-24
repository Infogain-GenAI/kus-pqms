# 11 — Accessibility Standards
**Tier:** 1
**Status:** APPROVED — REVISION 5

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
The WCAG target and conformance scope for this app, the ARIA and
keyboard behaviour required of the shared components, the lint
configuration that enforces it, and route-change focus management.

## Target: WCAG 2.2 AA
**WCAG 2.2 AA.** Not 2.1 AA — a generic standards draft and some early
internal notes assumed 2.1, and that is the version to correct on sight.

Provenance: 2.2 AA is not a bar this corpus raised. It was already the
stated target in two independent places in `kus-pqms` that agreed with
each other — `frontend/docs/design-system/accessibility.md` ("Target
Compliance: WCAG 2.2 AA") and `frontend/eslint.config.js`'s own comment
above the a11y rules ("WCAG 2.2 AA target,
docs/design-system/accessibility.md").

**Contrast ratios are identical in 2.1 and 2.2** — 4.5:1 normal text,
3:1 large text, 3:1 UI components and graphical objects. The version
number changes nothing about contrast; only the six criteria 2.2 adds
(below) are new obligations.

## Module scope
The modules in scope are **Overview, Issue Management, QIR, TSB,
Notifications, Admin** — the six that 07-routing-and-layouts.md's route
tree defines. That tree is the source; a module added there is in scope
here without this section being edited.

An older accessibility document listed a different set ("QIR, CAPA,
Issue Management, Publication Management, User Management,
Administration, Analytics"). Two of those names are handled
differently, and the difference matters because it is not one defect
class — per
17-domain-glossary-and-business-context.md's investigation:

- **CAPA is unconfirmed — not proven fabricated, and not written
  against.** It appears in a real target-architecture document and has
  zero text match across the BRD, DRD and HLD. 17 explicitly declines
  to call it fabricated, keeping "planned business scope not yet
  captured in these artifact versions" open alongside the
  placeholder reading. An earlier revision of this file overstated 17
  as "confirmed fabricated" and equated CAPA with the superseded draft
  standards document's "Module B (Task Management)" invention — **that
  equation does not hold**, and the correction stands: Module B had no
  source anywhere, CAPA has a source and an open question.
- **Publication Management is not a missing module — it is covered
  under other names.** Its function sits inside TSB and inside Issue
  Detail's Resolution tab, both of which are in scope above. It is not
  grouped with CAPA. Provenance: `kus-pqms` had a real `tsb` route and
  a `RelatedPublicationSection.vue` in the Resolution tab, which is why
  the older list's separate "Publication Management" entry reads as a
  naming difference rather than a gap.

**The rule this section applies**: accessibility requirements are
written against a screen someone can describe. CAPA cannot be
described, so nothing is written against it — and that holds whether it
turns out to be future scope or a placeholder. When it is defined, it
comes into scope through 07's route tree like any other module.

## WCAG 2.2's new criteria beyond 2.1
Six criteria, each stated against this app's own components rather than
listed as a version-bump footnote. Three are live requirements now;
three are standing requirements that attach to a feature the moment it
is introduced.

- **2.4.11 Focus Not Obscured (Minimum)** — **live, and this app has a
  structural reason to fail it.** `BaseDataTable` is expected to have
  sticky headers, and possibly sticky columns (its column API is an
  open specification — see
  03-react-component-patterns-and-naming.md). A sticky header or column
  painted over the cell that currently has focus, as the user tabs
  across a wide table, is precisely the failure this criterion
  describes. **Requirement**: whatever scroll-and-sticky implementation
  `BaseDataTable` ends up with is verified against this criterion by
  keyboard, before the component is considered done — tab across and
  down until focus passes under each sticky region. Provenance:
  `kus-pqms`'s table had sticky headers and columns and was never
  checked against it, which is why this is written as a named
  verification step rather than left to general diligence.
- **2.5.8 Target Size (Minimum, 24×24 CSS px)** — **live, and it is a
  token-authoring requirement, not a component one.** Every
  interactive-control height in `design-tokens` — control heights,
  icon-button sizes, checkbox and radio hit areas — is at least 24 CSS
  px. **Check this while the token scale is being authored.** A height
  token found short after components consume it cannot be fixed in one
  place: raising it changes the layout of every component built on it.
  06-styling-and-design-tokens.md owns the token package; this is the
  a11y floor it has to clear.
- **2.5.7 Dragging Movements** — **no dragging interaction is specified
  anywhere in this corpus**, so nothing is in scope today. **Standing
  requirement for whoever introduces the first one** — column
  reordering, a kanban board, drag-to-upload: a single-pointer,
  non-drag alternative ships in the same change. A move-up/move-down
  pair, a position input, a file-picker button. Not a follow-up ticket;
  the alternative is part of the feature.
- **3.3.8 Accessible Authentication (Minimum)** — satisfied by the
  architecture already committed to in
  08-authentication-and-authorization.md: this app never implements its
  own password, puzzle, or cognitive-test login screen. Entra ID's own
  hosted sign-in UI is the entire authentication surface (per 08's
  OIDC+PKCE redirect flow) — meeting this criterion for that UI is
  Microsoft's compliance responsibility, not something this app's own
  code does or needs to do anything for.
- **3.2.6 Consistent Help** — **standing requirement.** This corpus
  does not specify a help mechanism, so there is nothing to place
  consistently yet. When one is added — a help link, a chat widget, a
  contact-support affordance — it belongs in the shared layout, not in
  individual pages. Putting it in `DefaultLayout` (see 07) satisfies
  this criterion structurally: every screen under that layout gets it
  at the same point in the page order, with no per-screen convention to
  maintain. Provenance and a caution: `kus-pqms`'s header carried a
  Help button (`AppHeader.vue`, `aria-label="Help"`) that did nothing —
  its own comment said the feature was unassigned. A help control that
  is present and inert is its own defect: it is announced to a screen
  reader as an available action. Ship the affordance with its
  destination or not at all.
- **3.3.7 Redundant Entry** — **live.** Issue Entry is a multi-step
  flow (per 03 and 07), and no step may require a user to re-enter a
  value already captured in an earlier one. **Requirement**: whatever
  state carries the form forward between steps (per
  04-state-management.md) makes every earlier step's value readable
  from every later step, not only from the step that captured it. The
  common failure is per-step local state, where step 4 cannot see what
  step 1 collected and asks for it again.

## Two enforcement surfaces, not one
Lint is the surface this file owns. There is a second: **automated axe
assertions in the test run**. **10-testing-standards.md owns that
convention** — the binding, the assertion pattern, and how far coverage
extends. Not restated here.

The two are complementary, not redundant. Lint catches static markup
problems before a component ever runs; axe catches violations that only
exist in rendered output — a computed accessible name, a contrast
result, an ARIA relationship resolved at runtime. Neither subsumes the
other, and neither waits for the other: both are at full strictness
from the first component.

## ESLint a11y enforcement
`eslint-plugin-jsx-a11y` is the a11y plugin.
14-code-style-and-linting.md owns its **position** in the config chain
(position 3, after the framework plugins). This file owns **which rules
are on and at what severity**.

**Use the plugin's `flatConfigs.recommended` preset, plus one explicit
addition.** The five rules this corpus cares about most, verified
against the published package (`eslint-plugin-jsx-a11y@6.10.2`,
`lib/index.js`):

| Rule | In `recommended` | Action |
| --- | --- | --- |
| `click-events-have-key-events` | `"error"` | preset; do not downgrade |
| `interactive-supports-focus` | `"error"` + a `tabbable` role list | preset; do not downgrade |
| `label-has-associated-control` | `"error"` | preset; **pass no options** — see below |
| `no-static-element-interactions` | `"error"` + `allowExpressionValues: true` and a handler list | preset; do not downgrade |
| `control-has-associated-label` | **`"off"`** — in `recommended` *and* `strict` | **enable explicitly** |

**"Error from day one" is mostly the preset, not a decision this file
is making.** Four of the five are already `"error"` in the plugin's own
`recommended`. Saying so keeps the actual decisions visible, because
there are only two:

1. **No a11y rule is set to `"warn"`.** A warning-level a11y rule is
   one nobody fixes: it does not fail a build, so it accumulates until
   someone schedules a remediation pass, and that pass is always
   cheaper to postpone than to run. Provenance for stating it this
   firmly: `kus-pqms` had exactly five a11y rules at `"warn"` with a
   documented plan to escalate them "in Phase 3", and two of the
   defects those rules exist to catch — a modal naming itself with
   `aria-label` and a select with no arrow-key support — were still
   present when that plan was written down. The plan was not the
   problem; the `"warn"` was.
2. **`control-has-associated-label` is turned on explicitly**, because
   neither preset does it. This is the one that silently goes missing:
   adopt `recommended`, assume the a11y rules are covered, and this
   rule is off. Enable it with the preset's own option object
   (`ignoreElements`, `ignoreRoles`, `includeRoles`) rather than bare —
   those defaults exist to keep the rule from firing on composite
   widgets like `grid` and `listbox`, where the label belongs to the
   container rather than the cell.

A related trap worth knowing: if you enable any of these by hand
instead of taking them from the preset, you lose the preset's options.
The `strict` preset does this to `no-static-element-interactions`,
dropping `allowExpressionValues: true`. Take the rule entries from
`recommended` and override deliberately, not by retyping them.

**Two rule-name changes from the Vue plugin, one of which is a trap:**

- `vuejs-accessibility/form-control-has-label` →
  **`jsx-a11y/control-has-associated-label`**
- `vuejs-accessibility/label-has-for` →
  **`jsx-a11y/label-has-associated-control`**

The trap: **`jsx-a11y/label-has-for` also exists.** It is deprecated
(`deprecated: true`, `replacedBy: ['label-has-associated-control']`,
deprecated in v6.1.0) and set to `"off"` in both presets. A config line
that ports the Vue rule name literally therefore parses cleanly, lints
nothing, and looks enabled in review.

### `label-has-associated-control` takes no options
An earlier revision of this file required carrying
`{ required: { some: ["nesting", "id"] } }` across onto
`label-has-associated-control`, and warned that a bare rename "reverts
to both-required and hard-fails lint on **every** `for`/`id`-labelled
control in the app." **That warning is wrong and the requirement is
withdrawn.** The two rules have opposite defaults:

- `vuejs-accessibility/label-has-for` defaults to
  `required = { every: ["nesting", "id"] }` — **both** a nested control
  **and** a `for`/`id` pair (source: `eslint-plugin-vuejs-accessibility`,
  `dist/rules/label-has-for.js`).
- `jsx-a11y/label-has-associated-control` defaults to
  `assert: 'either'` — `var assertType = options.assert || 'either'`
  (source: `eslint-plugin-jsx-a11y@6.10.2`,
  `lib/rules/label-has-associated-control.js`).

So the relaxation was a concession to **the Vue plugin's default**, not
to existing markup. Either-suffices is already what jsx-a11y does.
**Pass no `assert` option.** Any value you could pass is worse than the
default: `'both'` makes it stricter than WCAG requires, `'htmlFor'` and
`'nesting'` each ban a legitimate labelling technique.

One genuine difference in the other direction, worth knowing before the
first lint run: **jsx-a11y's rule checks two things, not one.** Before
it evaluates `assert` at all it requires the label to have accessible
text, reporting "A form label must be associated with a control." and
"A form label must have accessible text." as separate failures (text is
searched to a JSX depth of `2` by default, adjustable via `depth`). The
Vue rule has no equivalent check. The React rule is therefore stricter
than the Vue one even with no options set — a `<label htmlFor="x" />`
whose text arrives some other way will report.

**One anticipated exception, stated as expected rather than
hypothetical**: `no-static-element-interactions` may need a per-file
disable for a wrapper component that handles click or key events
bubbling up from real interactive children inside it. When that
happens, disable it **for that file, with an inline comment naming the
interactive children the wrapper is delegating to** — never as a
project-wide relaxation, and never bare. Provenance: `kus-pqms` had
exactly two such carve-outs (`BaseSelect.vue`, `BaseTooltip.vue`), each
per-file with a written reason. Two files with reasons is the shape to
copy; the failure mode is a third and fourth added without one.

## Component-level accessibility requirements
Per-component obligations for the shared components. These are
requirements, not descriptions — a component that does not meet the one
written against it is not finished.

**`BaseModal`** must provide: a focus trap (Tab and Shift+Tab wrap
between the first and last focusable element inside the dialog),
Escape-to-close, focus moved into the dialog on open, and focus
restored to the triggering element on close.

Its accessible name comes from **`aria-labelledby` pointing at the id
of the rendered heading element** — not from `aria-label` carrying a
copy of the title string. This is a correctness requirement, not a
preference: `aria-labelledby` ties the accessible name to the one
heading a sighted user actually reads, so the two cannot drift.
Provenance: `kus-pqms`'s modal used `aria-label` duplicating the title
text, which is why the prohibition is written out rather than left
implicit.

**`BaseTooltip`** must provide: `aria-describedby` on the trigger bound
to the panel's id **only while the panel is open**, `role="tooltip"` on
the panel, and a trigger that responds to **both hover and focus** —
hover-only makes the tooltip unreachable by keyboard. The panel is
portaled with `ReactDOM.createPortal`.

**`BaseSelect`** must provide full listbox keyboard interaction:
arrow-key roving focus between options, Enter or Space to confirm a
selection, typeahead by typing, Escape to dismiss, and
`aria-activedescendant` on the listbox tracking the active option.
Escape alone is not a keyboard-accessible select. Provenance:
`kus-pqms`'s select implemented Escape and nothing else, which is the
specific shortfall this requirement exists to prevent repeating.

**The primary grounding is contractual, not a standards-level target.**
BRD/NPQMS-ISM-customized-BRD.md (C1.0, draft for ratification,
2026-08-20) **FR-ENT-005** — a numbered, committed requirement — states:
"Classification fields shall be searchable comboboxes with type-ahead,
fully keyboard-operable (arrow keys, Enter, Escape) and screen-reader
accessible." **NFR-U-002** generalises the same obligation across every
screen: "Every function operable by keyboard alone, with a visible
focus indicator that is never suppressed." Together they name the same
key behaviours this section requires. (This retires the prior citation
to BRD v1.3's NFR-08, whose numbering does not carry over to C1.0.) The
WCAG 2.2 AA target (BRD NFR-U-001) is the **secondary** grounding: it
independently requires the same thing, but a committed BRD requirement
outranks a target this corpus set for itself.

**Implementation approach: a headless primitive, not hand-rolled.**
06-styling-and-design-tokens.md's "Scoped exception: headless
primitives for complex keyboard interaction" owns that decision — which
library, which components may use it, and what stays under the
Tailwind-only rule. Not restated here; 06 is the single owner. An
earlier revision of this section deferred to a section of 06 that did
not exist yet; it exists now.

**The consequence to be clear about**: when the a11y lint rules fire on
a component like `BaseSelect`, **that is not a lint fix.** It means the
listbox keyboard interaction above has not been implemented, and lint
is refusing the component until it is. Expect that as an
implementation-sized piece of work, not a warning to triage.

**`BaseSwitch`** uses a real `<button>` with `role="switch"` and
`aria-checked`. **`BaseCheckbox`** uses a real
`<input type="checkbox">` with a `<label htmlFor=...>` association, and
sets the indeterminate state imperatively — HTML has no declarative
attribute for it. Native element plus native ARIA state, in both cases;
do not rebuild either on a `<div>`. Provenance: both were already built
this way in `kus-pqms`, so this is a known-good arrangement rather than
a preference.

**`BaseReasonGate`** gets its focus management from `BaseModal` by
composition and adds none of its own, so `BaseModal`'s requirements
above cover it — nothing further is needed for focus trapping or
restoration specifically.

**`BaseTextarea`** — and every field that can show a validation error —
must set `aria-invalid` while invalid and associate the error message
with the field via `aria-describedby`. A visible error message that is
not programmatically associated is invisible to a screen reader, which
is the whole failure mode. This is stated as a requirement rather than
the verification note an earlier revision carried, because there is no
existing implementation to verify: the underlying obligation (WCAG
3.3.1) does not depend on which component happens to render the
field.

## WCAG 2.4.1 Bypass Blocks — a skip-link is required
**Level A, and until this revision it was addressed nowhere.** The
section above covers the six criteria WCAG 2.2 *adds* to 2.1; 2.4.1 is a
2.1 criterion this corpus never revisited, and
07-routing-and-layouts.md carried a `[PLACEHOLDER]` asking whether a
skip-link was in scope while noting that no file specified one. It was a
real gap in a corpus targeting 2.2 AA, which subsumes every Level-A
criterion.

**Requirement.** Every layout renders a skip-link as the **first**
focusable element in the document, visually hidden until focused, whose
target is the layout's `<main id="main-content">`.

Three details that decide whether it actually works:

- **First in DOM order, not merely first visually.** A skip-link placed
  after the header's nav skips nothing.
- **Visible on focus.** A permanently-hidden skip-link is unreachable and
  a permanently-visible one is design debt nobody accepts. `sr-only` plus
  a `focus:not-sr-only` treatment is the standard shape.
- **It moves focus, not just scroll.** The target needs `tabIndex={-1}`
  so it can receive programmatic focus; without it the browser scrolls
  and the screen reader keeps reading from where it was.

**This settles what `id="main-content"` is for**, which 07 recorded as
unresolved: it is the `<main>` landmark's id **and** the skip-link target.
It is *not* the route-change focus target — that is the page's main
heading, per the section below. Two different mechanisms, two different
targets, and 07 was right to refuse to conflate them.

**One layout, one skip-link.** `DefaultLayout`, `FixedHeightLayout` and
`AdminLayout` each render their own; `BlankLayout` wraps a 404 with no
navigation to bypass and does not need one.

## Focus management on route navigation
**Required, and there is no prior implementation of it to lean on.** A
shared hook or effect moves focus to the new route's main heading on
every navigation. Place it at the layout level: every layout wraps
`<Outlet />` the same way (per 07-routing-and-layouts.md's route tree),
so one implementation there covers every route rather than each page
remembering to do it.

Without this, a screen-reader or keyboard user who navigates to a new
route keeps focus wherever it was on the previous page — usually a nav
link that no longer relates to what is on screen — and gets no signal
that new content loaded at all. It is the most commonly skipped SPA
accessibility requirement, which is why it has its own section here
instead of a line in a checklist.

Provenance, and the reason this is written as new work: `kus-pqms` did
not implement it. There was no programmatic focus-to-heading behaviour
in `App.vue`, `router/index.ts` or any layout. So unlike most of this
file, there is no working pattern to translate — this is built from
scratch, and it will not appear by porting anything.

## Deferred to 18, not drafted here
**Dashboard accessibility** (chart alternatives — a text summary, a
data-table equivalent) and **workflow-timeline accessibility** (text
alternatives for a visual timeline) are deliberately not drafted here.
No charting library has been chosen for this project, and no
workflow-timeline component is specified anywhere in this corpus, so
there is nothing concrete to write requirements against — and inventing
them would produce guidance whoever builds the chart has no reason to
read.

Both are tracked as incoming obligations on
18-project-context-and-implementation-status.md's "Decisions blocked on
React port" list. The trigger for each is the same: the requirement
gets written when the component it constrains is specified, and the
charting-library decision is the gate on the first one.

# Component Inventory — CANDIDATE

**Status:** CANDIDATE. Not a specification, and **not the pass-4
derivation.**
**Owner:** whoever runs pass 4.
**Derived:** 2026-08-24, from BRD C1.0 rather than from the prototype.

---

## Read this before using the table

`../standards/01-project-structure-and-architecture.md` is explicit, and
it is right:

> Components are named here and there — in this file, in 06, in 11 —
> always incidentally, as examples of some other rule. Those mentions are
> **not** an inventory and must not be assembled into one: a list
> stitched together from scattered examples would be missing whatever no
> rule happened to mention, and nobody would know which.

**This is not that.** It is derived from **screens**, which is the method
01 and 18 both prescribe — but from the **wrong source of screens**. The
correct source is the prototype. This was derived from BRD C1.0's screen
inventory (§8.1), its functional requirements, and its presentation
contract (§8.4), cross-checked against the prototype-derived design spec
and the prior repository's per-component design documents.

**So it is a candidate, and every row carries a confidence:**

| Confidence | Meaning |
|---|---|
| **High** | A functional requirement names the control's behaviour explicitly, or the component already exists |
| **Medium** | The screen clearly needs a control of this kind; its shape is inferred |
| **Low** | Plausible from the screen's description; may turn out to be part of another component, or not exist at all |

## What pass 4 does with this file

Read the prototype, write the screen descriptions (`29`), derive the
inventory from those, then **reconcile against this list** — treating any
disagreement as evidence about *this list*, not about the prototype.

It will find components this table does not name.
`../standards/18-project-context-and-implementation-status.md` already
records one such finding: a distinct icon-only square-button pattern,
ten-plus instances at nine different sizes, that is **not** `BaseButton`
at a small size.

**Treat a Low row as a question, and a missing row as expected.**

## What this file does not authorise

**Building anything.** 01's rule stands: a component is built from its
specification in this folder, written against `TEMPLATE.md`. The
conventions can tell you a component is correctly placed, named and
styled; they cannot tell you it is the right component with the right
interface, and neither can a candidate inventory.

**Expect this list to shrink rather than grow.** Eleven rows are Low or
Medium precisely because they may turn out to be a variant of a
neighbour: `BaseLink` may be `BaseButton variant="link"`, which already
exists; `BaseSearchInput` may be `BaseInput` plus `useDebouncedCallback`;
`BaseDivider` is probably a Tailwind border; `BaseIcon` may be
unnecessary now that the icon library renders components directly.
**Resolving each of those is a decision the spec makes — never build both
sides of one.**

---

## Candidate inventory

Organised by `01`'s eight categories. `n` = the number of BRD screens that need it — a rough priority signal.

### `base/` — single-element primitives

| Component | n | Confidence | Driven by |
|---|---|---|---|
| `BaseButton` ✅ | all | High | Built |
| `BaseIconButton` | all | **High** | `18` found 10+ icon-only buttons in the prototype at nine distinct sizes, explicitly **not** instances of the design-system `Button`. `18` calls it "a separate, currently-unspecified component". **Also the WCAG 2.5.8 risk** — its 20px and 22px instances fail the 24px target-size minimum unless padded. |
| `BaseInput` | 6 | High | Title (FR-ENT-006), search (FR-LST-010), part number (FR-INV-010), quantity (VR-21) |
| `BaseTextarea` | 5 | High | Description (FR-ENT-006), every reason gate (LC-01), hypothesis and root cause (FR-INV-009), comments (FR-COM-002). `11` names its `aria-invalid`/`aria-describedby` requirement. |
| `BaseCheckbox` | 3 | High | Row selection (FR-LST-021) with an indeterminate header state; column config (FR-LST-017). `11` requires a real `<input type="checkbox">` with a `<label htmlFor>` and imperative indeterminate. |
| `BaseRadio` | 2 | Medium | Disposition selection (FR-RES-003, six mutually exclusive values) |
| `BaseSwitch` | 2 | High | EWS-only filter toggle; notification opt-outs (FR-NTF-006). `11` requires `role="switch"` + `aria-checked` on a real `<button>`. |
| `BaseLabel` | all | Medium | Referenced by every form control; may be internal to each rather than standalone |
| `BaseIcon` | all | Medium | The Vue `ui-library` had an SVG-based `BaseIcon`. With `lucide-react` rendering components directly, a wrapper may be unnecessary — **decide rather than assume.** |
| `BaseSpinner` | 4 | High | `BaseButton` already inlines one. Async export, save states, scoring's "calculating" state (FR-SCR-001). |
| `BaseAvatar` | 3 | Medium | Owner cell (§8.4 deterministic avatar colour), profile, comment author. The prototype has an `avatar()` method with its own palette — already partially sourced into `tokens.css`. |
| `BaseLink` | all | Low | May be a `BaseButton variant="link"`, which already exists. Resolve when specifying, do not build both. |

### `composite/` — embeddable multi-part input widgets

| Component | n | Confidence | Driven by |
|---|---|---|---|
| `BaseSelect` | 8 | **High — build first** | `06` names it "definite, and first" for the React Aria primitive, because `FR-ENT-005` makes its keyboard behaviour **contractual**: type-ahead, arrow keys, Enter, Escape, screen-reader accessible. `11` adds `aria-activedescendant` roving focus. The Vue version was Escape-only, which is why this is stated so firmly. |
| `BaseMultiSelect` | 5 | High | Filter panel — source, model, tier, status, owner, each multi-select with a count badge (FR-LST-011) |
| `BaseCombobox` | 4 | High | The four-level classification cascade (FR-ENT-004/005), including the **"Add new: {value}"** affordance of FR-ADM-005. May be `BaseSelect` with a creatable mode rather than a separate component — a real API decision. |
| `BaseTypeahead` / `BaseChipInput` | 2 | High | DTC entry (FR-ENT-007): multiple codes, removable chips, ≤20, ≤200ms per keystroke (NFR-P-007). The Vue project had `DtcTypeahead` + `DtcChipValue`. |
| `BaseSearchInput` | 3 | Medium | Debounced at 300ms (FR-LST-010) via `useDebouncedCallback`. May be `BaseInput` + the hook, not a component. |
| `BaseDateRangePicker` | 2 | High | Filter date range (FR-LST-011, VR-14/VR-28); history date filtering (FR-HIS-005). `06` marks its primitive decision **Undecided** — grid keyboard navigation is genuinely complex. |
| `BaseFileDropzone` | 3 | High | FR-DOC-001…008: drag-and-drop, per-file state, 25 MB / 500 MB caps, scan state. Vue had `AttachmentsDropzone` + `SourceFieldAttachments`. `12` defers its performance guidance on this component existing. |
| `BaseMarkdownEditor` | 1 | High | Communication (FR-COM-002). Already has its subpath entry point wired (`14`'s heavy-dependency exclusion). `12` requires `React.lazy` + `Suspense` **scoped narrowly around the editor itself**, never the surrounding form. |

### `data/` — grids and their cell renderers

| Component | n | Confidence | Driven by |
|---|---|---|---|
| `BaseDataTable` | 4 | **High — the largest single item** | Issue List, linked-issues modal, admin taxonomy, user administration. `03` states plainly that its column API "is a specification this corpus does not contain" and lists seven unanswered questions plus three unaccounted-for states. `12` adds five more about virtualization and instructs pass 4 to read them **before** finalising. |
| `MultiValueCell` | 1 | High | `01` names it. Primary value inline, remainder behind a `+N` popover on **hover and keyboard focus**, consecutive years collapsing to a range (§8.4, FR-LST-006). |
| `TruncatedTextCell` | 1 | High | `01` names it. FR-LST-001: complete IDs and titles visible or reachable by hover. |
| `SeverityCell` | 1 | Medium | Bar + numeric, coloured by tier (FR-LST-001, BR-S03) |
| `StatusCell` | 1 | Medium | Pill with a colour dot from the single status map (§8.4) |
| `OwnerCell` | 1 | Medium | Avatar + name |
| `LinkedCountCell` | 1 | Medium | Count chip, or an em dash at zero; opens `ISM-LNK` (FR-LST-001) |
| `BasePagination` | 3 | High | 20/50/100, "Showing X–Y of Z", page controls (FR-LST-023) |
| `BaseColumnConfig` | 1 | High | Show/hide optional columns; Issue ID cannot be hidden; reset to role default (FR-LST-017…019) |

### `feedback/` — non-interactive status communication

| Component | n | Confidence | Driven by |
|---|---|---|---|
| `BaseStatusPill` | 5 | **High** | The single status map (§8.4). Never hand-coloured, never paraphrased. Note the remap in `../standards/06-styling-and-design-tokens.md`. |
| `BaseSeverityIndicator` | 4 | High | Score + tier, consistent everywhere (BR-S03, §8.4) |
| `BaseBadge` | all | High | Count badges on tabs, unread count on the bell, "Pending Admin Approval" on a proposed classification value (FR-ADM-005) |
| `BaseTag` | 3 | Medium | Source channels, DTC chips, match indicators |
| `BaseToast` | all | **High** | `03` routes mutation errors here; `06`'s voice rules describe toast copy; nothing has specified it. See proposed tier `22`. |
| `BaseSkeleton` | all | High | FR-LST-029, FR-OVW-012: skeletons, never a spinner over stale data |
| `BaseEmptyState` | all | High | FR-LST-027 and the **two distinct** empty states of proposed tier `22` — no-data versus no-match |
| `BaseErrorState` | all | High | FR-LST-028: inline, retry, filters preserved |
| `BaseAttentionBanner` | 2 | **High** | FR-LST-008/009 — attention banners above the Issue List. **Named in no corpus file** (G-BRD-06). |
| `BaseStaleDataIndicator` | 3 | Medium | FR-MST-003: cached data served with a visible staleness marker. Easy to forget; it is a fourth state. |
| `BaseProgress` | 1 | Low | Async export progress (FR-JOB-008). May be a toast instead. |

### `layout/` — structural containers

| Component | n | Confidence | Driven by |
|---|---|---|---|
| `BaseCard` | all | High | The dominant surface. §8.4: 14–16px radius, hairline border, the card elevation token. |
| `BasePanel` | 4 | Medium | Filter panel, workspace sections, Overview widgets. May be `BaseCard` with a header — resolve, do not build both. |
| `BaseSectionHeader` | 3 | Medium | Workspace section headings, Overview widget titles |
| `BaseDivider` | all | Low | Probably a Tailwind border, not a component |

### `navigation/` — wayfinding

| Component | n | Confidence | Driven by |
|---|---|---|---|
| `BaseTabs` | 3 | **High** | Workspace's five sections, Overview's action-item filter, History's two views. `03` carries an **open API choice** — config-driven (the Vue incumbent, which shipped and worked) versus a compound `Tabs.List`/`Trigger`/`Panel` API — and `06` notes the primitive only applies if the compound API is chosen. Decide when specifying. |
| `BaseBreadcrumb` | all | High | NAV-06: derived from the route, never hand-maintained per screen |
| `BaseScopeTabs` | 2 | Medium | My/All with count badges (FR-LST-002/003). May be `BaseTabs` with a count slot. |
| `BaseStepRail` | 1 | High | Issue Entry's step progress. Interacts with WCAG 3.3.7 Redundant Entry, which `11` marks **live**. |
| `BaseNavItem` | 1 | Low | Currently internal to `AppHeader`. Promote only if a second consumer appears. |

### `overlay/` — portaled content

| Component | n | Confidence | Driven by |
|---|---|---|---|
| `BaseModal` | 6 | **High** | `06`: **yes** to the primitive — focus trap, initial focus, focus restore are its whole job, and hand-rolling all three is the classic source of a dialog that traps a screen reader. `11` requires `aria-labelledby` at the rendered heading, **never** an `aria-label` duplicating the title. `01` places it in `overlay/`, not `layout/`. |
| `BaseReasonGate` | 5 | **High** | `01` and `11` both name it. Built **on** `BaseModal`, inheriting its focus management. Every status change (LC-01, ≥10 chars), every classification change (VR-14), disposition rationale (VR-16/17), score override (VR-18), gated-transition rejection (VR-13). The most-used modal in the product. |
| `BaseTooltip` | all | High | `06`: **probably not** a primitive — small enough to write correctly. `11`: `aria-describedby` only while open, `role="tooltip"`, **hover and focus** both. |
| `BasePopover` | 3 | **High** | The `+N` multi-value popover (§8.4), and it must open on keyboard focus. `18` records that **no standard specifies dropdown or popover keyboard behaviour at all**. |
| `BaseDropdownMenu` | 3 | High | Bulk-action menu, notification panel, profile menu. `18` records the resolved `aria-haspopup` question here: a disclosure region uses `aria-expanded` + `aria-controls` and **does not** claim `aria-haspopup` unless it is a real menu. |
| `BaseDrawer` | 1 | Low | The filter panel may be a drawer or an inline panel. Prototype question. |

### `pqms/` — domain-specific, non-generic

`01` defines this category and nothing has been placed in it. These are the components that encode domain meaning and
would be nonsense in another product.

| Component | n | Confidence | Driven by |
|---|---|---|---|
| `IssueIdLink` | 5 | Medium | Monospace, format-validated, navigates to the Workspace (§8.4, FR-LST-004) |
| `ClassificationPath` | 4 | High | The four-level path rendered as one value; before→after in audit history (FR-WSP-016) |
| `SourceChannelBadge` | 3 | High | One icon per channel, always the same one, across list, entry, workspace and export (§8.4) |
| `CorrelationSuggestionCard` | 2 | High | Match reason, match indicator, and eight attributes (FR-ENT-011/012). Vue had `SameExistingIssueCard`. |
| `LinkedIssueCard` | 2 | High | ID, title, classification, status, link origin (FR-LNK-001). Vue had exactly this. |
| `LifecycleHealthPanel` | 1 | High | All eight statuses with counts, distinct colours, drill-through (FR-OVW-008) |
| `ActivityTimelineItem` | 2 | High | Oldest-first with **day-gap markers** between non-consecutive days (FR-INV-007) |
| `AuditEntryRow` | 1 | High | Expandable, before→after values, actor, role, timestamp, rationale (FR-HIS-003/006) |
| `ApprovalBar` | 2 | High | Shown to an `override` role when a proposal awaits their decision (FR-WSP-024, FR-RES-007). Named in the prototype's design spec. |
| `ScoreBreakdown` | 1 | High | Factor name, weight, source, value, plus the composite and tier (FR-SCR-003) |
| `PartsRequestCard` | 1 | Medium | Part number, quantity, urgency, purpose, needed-by, approval state (FR-INV-010…013) |
| `SourceEvidencePanel` | 2 | High | One per channel, eight variants, field sets in BRD Appendix C (FR-ENT-008/009) |
| `DispositionSelector` | 1 | High | Exactly six values, with the rationale gate (FR-RES-003/004) |
| `StatusChangeDialog` | 2 | High | Valid targets only per §9.3, mandatory reason, plus the conditional fields for `MONITORING` (frequency, next review) and `OUT_OF_SCOPE` (department) — FR-WSP-020…027 |

**Candidate total: 69 shared components**, of which 6 are cell renderers — 12 `base/`, 8 `composite/`, 9 `data/`, 11 `feedback/`, 4 `layout/`, 5 `navigation/`, 6 `overlay/`, 14 `pqms/`. Two are built.

**Expect this to shrink, not grow.** Eleven rows are marked Low or Medium confidence precisely because they may turn out to be a variant of a neighbour rather than a component — `BaseLink` may be `BaseButton variant="link"`, which already exists; `BaseSearchInput` may be `BaseInput` plus `useDebouncedCallback`; `BaseDivider` is probably a Tailwind border; `BaseIcon` may be unnecessary now that `lucide-react` renders components directly. **Resolving each of those is a decision the spec makes — do not build both sides of one.** A realistic post-pass-4 figure is 55–65.

---

## Build order

Ordered by **what unblocks the most downstream work**, then by risk. The rule from `01` holds throughout: **a spec
before a component, every time.**

### Wave A — the spine (nothing renders without these)
`BaseInput` · `BaseTextarea` · `BaseLabel` · `BaseCheckbox` · `BaseIconButton` · `BaseCard` · `BaseBadge` ·
`BaseSkeleton` · `BaseSpinner`

Low-risk, high-fan-out, no primitive needed. `BaseIconButton` is here rather than later because `18` found it is
already needed and is **not** `BaseButton` at a small size.

### Wave B — the risky primitives (do these early, not late)
`BaseSelect` → `BaseMultiSelect` → `BaseCombobox` · `BaseModal` → `BaseReasonGate` · `BaseTooltip` · `BasePopover`

**`BaseSelect` first**, per `06`. Two reasons to front-load this wave: `FR-ENT-005` makes the keyboard behaviour
contractual, and `11`'s a11y rules are at `"error"` — so a half-correct implementation **fails the build**, which `11`
warns is "an implementation-sized piece of work, not a warning to triage". Finding that out in Wave B is survivable;
finding it out the week before a demo is not.

`BaseReasonGate` immediately after `BaseModal` because it is the most-used modal in the product and it inherits its
focus management by composition.

### Wave C — the table
`BaseDataTable` + `MultiValueCell` + `TruncatedTextCell` + the four typed cells · `BasePagination` ·
`BaseColumnConfig`

**Do not start until its specification is written**, and the specification must answer `03`'s seven open questions,
its three unaccounted-for states, and `12`'s five virtualization questions — **starting with `12`'s Question 0
(maximum page size), which may close the virtualization item outright** since sort, page and page size are already
client state.

### Wave D — feedback and status
`BaseStatusPill` · `BaseSeverityIndicator` · `BaseTag` · `BaseToast` · `BaseEmptyState` · `BaseErrorState` ·
`BaseAttentionBanner` · `BaseStaleDataIndicator`

`BaseStatusPill` depends on the status-colour remap in `../standards/06-styling-and-design-tokens.md` being resolved — two of the BRD's eight
statuses currently have no colour.

### Wave E — navigation and layout
`BaseTabs` (after its config-versus-compound decision) · `BaseBreadcrumb` · `BaseScopeTabs` · `BaseStepRail` ·
`BasePanel` · `BaseSectionHeader`

### Wave F — domain components
The `pqms/` set, built as each screen needs it. These are the cheapest to get wrong late and the cheapest to change,
because each has exactly one or two consumers.

### Wave G — deferred, with named triggers
| Component | Trigger |
|---|---|
| `BaseMarkdownEditor` | The Communication section. `12` requires the narrow `Suspense` + `ErrorBoundary` scoping; `13` requires the escape-before-render property stated at the call site. |
| `BaseFileDropzone` | The first attachment surface. Unblocks `12`'s deferred upload guidance. |
| `BaseDateRangePicker` | The Issue List filter panel. Its primitive decision is still `Undecided` in `06`. |
| `BaseDrawer` | Only if the prototype shows the filter panel as a drawer. |
| Any chart | **Blocked on a library decision nobody has made.** `11` and `12` both defer on it, `18` tracks both. The BRD's Overview specifies no charts, so this may be genuinely out of Phase-1 scope — say so rather than leaving it open. |

---

## Specification-writing order

`01` forbids building without a spec, so **this order gates the build order above** and is the real critical path.

1. **`BaseDataTable`** — first, despite being Wave C. It is the largest, it has the most unanswered questions, it
   deadlocks with `12` if left late, and its answers constrain three other components' APIs.
2. **`BaseSelect`** — contractual keyboard behaviour; its answers shape `BaseMultiSelect` and `BaseCombobox`.
3. **`BaseModal`** — `BaseReasonGate` composes from it, so its focus contract is load-bearing for five surfaces.
4. **Wave A**, as a batch — nine specs that are each short, and writing them together keeps the prop vocabulary
   consistent across the primitives.
5. **`BaseTabs`** — needs its config-versus-compound decision first, which is a real open item in `03`.
6. Everything else, in build order.

**Each spec is written against `component-specs/TEMPLATE.md`**, with its two authoring rules applied literally:
enumerate only what the prototype shows, and say what governs each decision. `TEMPLATE.md`'s review procedure — four
questions, in order, with the prototype open — is what approves it. **A spec is not approved by being written.**

---

---

## The reconciliation procedure — how this list stops being a candidate

Pass 4 is not "read the prototype and rewrite this file". It is a mechanical
comparison whose **output includes a record of what was wrong here**, because
that record is what tells you how much to trust the next candidate list anyone
produces.

**Step 1 — derive independently.** Write the screen descriptions
(`../standards/29-screen-description-authoring.md`) from the prototype files,
then list the components each description implies. **Do not open this file while
doing it.** A candidate list read first becomes the answer you look for, and the
components it omits stay omitted.

**Step 2 — compare, and classify every difference into one of four buckets:**

| Difference | What it means | Action |
|---|---|---|
| In both, same shape | the BRD and the prototype agree | promote to CONFIRMED, spec it |
| In the prototype, not here | this list missed it | add it; **expected, especially for icon-only and layout-adjacent components** |
| Here, not in the prototype | inferred from a requirement with no visual counterpart | delete it, or record why it survives |
| In both, different shape | the interesting case | **stop** — the BRD and the prototype disagree about behaviour, which is a `00` case 4 |

**Step 3 — record the delta count**, not just the corrected list. "Pass 4 added
14 components, deleted 6 and reshaped 3" is the single most useful sentence for
whoever plans the next component effort.

**The fourth bucket is the one that matters.** A shape disagreement between the
BRD and the prototype is not a component question, it is a requirements
question, and resolving it by picking the prettier option is how a build ends up
implementing neither.

## What to do with each confidence level

**High** — spec it. The requirement names the behaviour, or the component
already exists in the scaffold. Pass 4 will confirm it; waiting for that
confirmation costs more than the rare correction.

**Medium** — spec it **after** its screen description exists. The component is
needed; its shape is inferred, and the description is what turns an inference
into an interface. Specing it first means guessing the props and then
discovering the guess.

**Low** — **treat the row as a question, not a work item.** Its most likely
resolutions are that it is a variant of a neighbour, or that it does not exist
at all. A Low row that reaches a sprint board without being resolved becomes a
component somebody builds to close a ticket.

**Absent** — expect it. `../standards/18-project-context-and-implementation-status.md`
already records one component this list does not name: a distinct icon-only
square-button pattern, ten-plus instances at nine different sizes, which is
**not** `BaseButton` at a small size. That was found by reading the prototype,
which is precisely the method this list did not use.

## Resolve the pairs before building either side

Eleven rows are Low or Medium because they may be a neighbour in disguise. Each
of these is **one decision that eliminates one row** — and building both sides
is the failure mode, because two components with overlapping purposes never get
merged afterwards.

| Candidate | Likely resolution | Decide when |
|---|---|---|
| `BaseLink` | `BaseButton variant="link"`, which already exists | before any navigation-styled control is built |
| `BaseSearchInput` | `BaseInput` + `useDebouncedCallback`, unless it owns clear/loading affordances | when the first search field is specified |
| `BaseDivider` | a Tailwind border utility, not a component | immediately — this is not a decision worth deferring |
| `BaseIcon` | probably unnecessary; the icon library renders components directly | when the icon size scale is authored (`06`) |
| `BaseSpinner` | may be `BaseSkeleton`'s job; the two answer different questions (unknown duration vs known layout) | when the first loading state is built |

**The rule:** whichever way each resolves, the losing name never appears in the
codebase — not as a re-export, not as a deprecated alias. An alias is how both
sides end up used.

## Build readiness — what actually blocks each wave

The waves order components by dependency. These are the **external** blockers,
which are the ones that stall a wave that otherwise looks ready:

| Blocker | Blocks | Owner |
|---|---|---|
| Token scales authored whole (`06`) | **every wave** — a component built against provisional tokens is rebuilt | designer + Frontend Lead |
| Hues for `TOP_ISSUE` and `OUT_OF_SCOPE` | `BaseStatusPill` and anything rendering a status | designer, via the prototype |
| Control-height scale clearing 24px (SC 2.5.8) | every interactive component | `06`, at authoring time |
| The headless primitive choice (`06`) | all overlays — modal, dropdown, tooltip, popover | Frontend Lead |
| A screen description | any Medium-confidence row | whoever runs pass 4 |
| The fixed-height layout decision (`07`) | the table, and anything with its own scroll region | **resolved — a fourth layout** |

**The first row is the one that gets skipped.** Building "just the button" against
a provisional token set feels safe and is not: every subsequent component
inherits the provisional values by copying the button.

## What this file is worth, stated plainly

**As a planning instrument: reliable.** The wave ordering, the dependency
structure, the resolution pairs and the blocker list above are derived from
requirements and from architecture, and pass 4 will not change them much.

**As a source for building: it is not one, and no amount of refinement makes it
one.** `../standards/01-project-structure-and-architecture.md`'s rule stands — a
component is built from its specification, written against `TEMPLATE.md`, and
the conventions can tell you a component is correctly placed, named and styled
but never that it is the right component with the right interface.

Use it to plan the effort, sequence the work and name the blockers. Do not use
it to open a file.

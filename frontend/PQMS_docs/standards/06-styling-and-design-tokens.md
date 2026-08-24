# 06 — Styling and Design Tokens
**Tier:** 1
**Status:** APPROVED — REVISION 7

## Purpose
Styling approach and design-token consumption rules for this app.
Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Approach: Tailwind utility classes only
**Every component in both packages — `ui-library` and `portal` —
styles itself with Tailwind utility classes written directly in JSX.**

Ruled out, in all components and both packages:

- **No CSS Modules.**
- **No BEM**, and no class-naming scheme of any kind.
- **No scoped or co-located component stylesheets.**
- **No component library's own CSS**, theme, or preset — see the scoped
  exception below for the one thing that is allowed in, and what it is
  not allowed to bring with it.

**The "both packages" part is the load-bearing half.** The obvious
failure is not someone reaching for CSS Modules; it is someone
reasoning that a shared component library is a different kind of thing
from an app and therefore deserves its own styling approach. It does
not. One system, both packages, no exceptions by package.

Provenance for why that is stated so flatly: `kus-pqms` ran **two
parallel systems in one monorepo** — BEM plus scoped `<style>` blocks
in `ui-library`, Tailwind in `pqms-portal`. Every shared value then had
two possible homes and a reviewer had two places to look. That is the
specific outcome this rule exists to prevent, and it arrived by
drift rather than by anyone choosing it.

## Scoped exception: headless primitives for complex keyboard interaction
**This section owns the headless-primitive decision.** It is a
deliberate, bounded exception to the no-component-library posture
above — recorded explicitly rather than left as a quiet allowance,
because an unbounded version of it would dissolve the Tailwind-only
rule entirely.

### Why an exception exists at all
Three grounds, in order of weight:

- **FR-ENT-005 is a committed contractual requirement, not a WCAG
  inference.** BRD/NPQMS-ISM-customized-BRD.md (C1.0, draft for
  ratification, 2026-08-20), FR-ENT-005, states: "Classification fields
  shall be searchable comboboxes with type-ahead, fully
  keyboard-operable (arrow keys, Enter, Escape) and screen-reader
  accessible." (Retires the prior citation to BRD v1.3's NFR-08.)
- **An accessible listbox is where hand-rolled implementations go
  subtly wrong.** Roving focus, `aria-activedescendant` tracking,
  typeahead, Enter/Space/Escape semantics, and correct screen-reader
  announcement are individually simple and collectively easy to get
  almost-right. Against a contractual requirement, "almost" is the
  wrong risk to accept.
- **Per 11-accessibility-standards.md, the a11y lint rules start at
  `"error"`.** A half-correct hand-rolled implementation therefore
  **fails the build**, not a warning someone triages later — the
  component cannot ship until the keyboard interaction is actually
  complete.

### 1. Which primitive library
**Recommendation: React Aria — `react-aria-components`** (Adobe).
Justified against this project's specific constraints:

- **Explicitly unstyled.** Its own documentation states: "React Aria
  does not include any styles by default." Nothing about visual output
  is imported, so the rule above still governs everything visible.
- **First-class Tailwind support, on the right major version.** Adobe
  ships `tailwindcss-react-aria-components`, a plugin turning state
  data-attributes into short modifiers (`selected:` rather than
  `data-[selected]:`), documented as compatible with Tailwind v3 **and
  v4** — v4 being what this project's `@theme` approach requires.
- **It matches the specific mechanism 11 specifies.** 11 requires
  `aria-activedescendant` tracking for `BaseSelect`; React Aria's
  collection components implement that model rather than moving real
  DOM focus. Choosing a primitive whose focus model differs would put
  06 and 11 in conflict before a line is written.
- **Accessibility is the library's entire premise** — behavior, ARIA
  semantics, internationalization, and keyboard handling across a
  large set of patterns, from a team whose output is the reference
  implementation for several ARIA patterns.

Candidates considered and not chosen: **Radix Primitives** (mature and
widely used, but its stewardship changed hands and per-component update
cadence has reportedly slowed; several React 19 render-loop issues were
reported and fixed during 2026) and **Base UI** (MUI's primitive layer,
actively maintained but younger and less battle-tested for this
purpose). Neither is disqualified. If the verification items below go
badly for React Aria, Base UI is the first fallback to evaluate — do
not silently substitute one without re-running the checks.

**React 19 compatibility — verified, not blocking.** This was checked
because it looked like a blocker and would have invalidated the
recommendation. It is not one. `react-aria-components@1.20.0` (current
`latest`) declares, verbatim from the npm registry:

```
"react": "^16.8.0 || ^17.0.0-rc.1 || ^18.0.0 || ^19.0.0-rc.1"
```

The `^19.0.0-rc.1` comparator looks like it excludes React 19 stable.
It does not. Tested against npm's own bundled `semver` (v7.8.1 — the
resolver npm and pnpm both use), `^19.0.0-rc.1` desugars to
`>=19.0.0-rc.1 <20.0.0-0`, and React **19.2.7 satisfies it** (as do
19.0.0, 19.2.0, and 19.9.9; 20.0.0 does not). A prerelease tag inside a
*range* does not restrict *stable* versions from matching — that rule
applies only when the version being tested carries a prerelease. So the
project's React 19.2.7+ floor installs cleanly, including under pnpm's
strict peer handling, which only objects to peers that are genuinely
unsatisfied.

Two notes rather than open items: third-party claims that React 19
stable fails this range are **wrong** and should not be re-litigated
without running the semver check; and the range's upper bound is
`<20.0.0-0`, so a future React 20 floor bump would need a new peer
range from upstream.

**[PLACEHOLDER — two properties still unverified; confirm at scaffold
time, before the first primitive-backed component is built. Trigger:
React scaffolding begins. Neither is expected to fail, but if one does,
reopen this recommendation rather than working around it.]**
- **Whether any CSS ships.** The documentation's "no styles by default"
  claim is quoted above and is a primary source, but the package's
  `sideEffects` field is `["*.css"]`, which at minimum means CSS files
  exist in the published artifact. These are not necessarily in
  conflict — but confirm no stylesheet import is required, because
  importing one would breach the rule this exception is scoped against.
- **Bundle cost.** Not measured. Relevant to
  12-performance-guidelines.md's budgets (300KB gzipped initial — the
  BRD's `NFR-P-012` figure — and 150KB per-route chunk) and to the barrel question in
  14-code-style-and-linting.md — see "What this changes elsewhere"
  below.

### 2. Which components may use it
**This table is a specification, not an audit.** None of these
components exists yet — see
01-project-structure-and-architecture.md's component-specification gap.
Each row says whether that component, **when it is built**, is built on
a primitive or by hand.

The bar is a documented ARIA pattern requiring focus management — not
"a component that would be convenient to build this way":

| Component | Pattern | Build on a primitive? |
|---|---|---|
| `BaseSelect` | listbox / combobox | **Yes — definite, and first.** FR-ENT-005 makes its keyboard behaviour contractual |
| `BaseModal` | dialog | **Yes.** Focus trap, initial focus, and focus restore on close are the primitive's whole job; hand-rolling all three is the classic source of a dialog that traps a screen reader |
| `BaseTooltip` | tooltip | **Probably not.** The requirement (per 11) is `aria-describedby` bound while open, `role="tooltip"`, and triggering on **both** hover and focus — small enough to write correctly by hand |
| `BaseDateRangePicker` | date picker / grid | **Undecided.** Grid keyboard navigation is genuinely complex; assess when the component is specified |
| `BaseTabs` | tabs | **Only if** 03's open choice lands on the compound-component API. The config-driven form does not need one |

**A component not in this table does not get a primitive.** Adding a
row is a decision, not an implementation detail: it requires naming the
ARIA pattern and why hand-rolling it is a real risk.

**Explicitly out**: `BaseButton`, `BaseBadge`, `BaseInput`,
`BaseTextarea`, `BaseCheckbox`, `BaseSwitch`. For the last two, 11
specifies native elements plus native ARIA — a real `<input
type="checkbox">` with a `<label for=…>`, and `role="switch"` with
`aria-checked` on a real `<button>`. A primitive there would add
dependency weight for no accessibility gain, and would replace a
native control that browsers and assistive technology already handle
correctly.

Provenance for two of these rows: in `kus-pqms`, `BaseSelect`'s
keyboard support was **Escape-only** — no arrow keys, no
Enter-to-select, no typeahead — and `BaseModal` had a hand-rolled focus
trap. The first is why `BaseSelect` is the definite case rather than a
candidate; the second is evidence the work is real rather than
theoretical, since someone had already done it by hand once.

### 3. What remains this file's, unchanged
The primitive supplies **behavior and ARIA wiring only**. Specifically:

- **All styling remains Tailwind utility classes.** No component
  library's own CSS, theme, preset, or styled variants are used — not
  as a starting point, not "just for the dropdown panel."
- **Design tokens still flow through `@theme`**, and the arbitrary-value
  ban below still applies inside primitive-backed components.
- **`cn()` still composes conditional classes** in these components, as
  in every other.
- **The `Base*` naming convention still applies to the wrapper the app
  consumes.** Consumers import `BaseSelect`; they never import the
  primitive directly. The primitive is an implementation detail of the
  wrapper, which means it can be swapped without touching call sites —
  the same seam discipline ADR 0001 applies to auth.

### Why this is not a hole in the Tailwind-only rule
The Tailwind-only rule exists to keep **visual output under one
system**, so that a colour or spacing value has exactly one source and
a reviewer has one place to look. A headless primitive contributes
**no visual output** — it contributes keyboard event handling, focus
management, and ARIA attributes. Nothing it provides competes with
Tailwind for control of appearance, so the rule's purpose is untouched.

The rule that would be breached is a different one — "no component
library" — and *that* is what this exception is scoped against, which
is why it is bounded by an explicit component table rather than stated
as a general permission.

### What this changes elsewhere
Recorded here so the consequences are not discovered piecemeal:

- **11-accessibility-standards.md** cites this section for the
  approach and does not restate which library or which components —
  this file owns both. Same ownership topology as the `Base*`/`Pqms*`
  split below.
- **01-project-structure-and-architecture.md**: no boundary breach.
  01's `ui-library` rule bars feature-specific logic, direct API calls,
  and state-management library usage inside base components; a headless
  a11y primitive is none of those. Nor is it an unusual kind of
  dependency for that package — provenance: `kus-pqms`'s `ui-library`
  carried eight runtime dependencies, including a five-package editor
  stack and an icon library, so a primitive is not a new category.
- **14-code-style-and-linting.md**: the open question is whether the
  primitive is "heavy" enough to trigger 14's heavy-dependency barrel
  exclusion — value export moved to a subpath, types kept in the main
  entry — the treatment 14 specifies for `BaseMarkdownEditor`. React
  Aria is tree-shakeable per component, so the likely answer is no, but
  that depends on the unmeasured bundle cost above. **[PLACEHOLDER —
  decide once bundle cost is measured. Trigger: same scaffold-time
  check.]**
- **12-performance-guidelines.md**: the primitive lands in whichever
  chunk its consuming component lands in, and counts against that
  chunk's budget. No new splitting mechanism is implied.

## Design tokens via `@theme`
**`packages/design-tokens` is the source of truth for every design
value.** Two layers, and the separation between them is deliberate:

1. **`design-tokens` emits plain CSS custom properties** in a generated
   `tokens.css` — e.g. `--color-accent-700: #18468F;`. Nothing in this
   layer knows about Tailwind.
2. **The app's entry stylesheet declares a `@theme` block** that maps
   those custom properties into Tailwind's theme, so Tailwind generates
   real utility classes from them — `bg-accent-700`,
   `text-accent-700` — rather than forcing arbitrary-value syntax like
   `bg-[var(--color-accent-700)]` at every call site.

**Why two layers rather than having `design-tokens` emit the `@theme`
block directly**, since that would be fewer moving parts: it would make
the token package consumable *only* by Tailwind. Keeping layer 1 as
plain custom properties means the tokens stay readable by anything —
Storybook, a future email template, a non-Tailwind consumer, plain CSS
in a one-off — and the Tailwind-specific mapping lives in the one place
that has already committed to Tailwind. **The app owns the Tailwind
mapping; the token package stays tool-agnostic.**

Note on provenance, because an earlier revision framed this as "a
bridge, not a pipeline rewrite": in `kus-pqms` the two-layer shape
existed for a weaker reason — `tokens.css` was already generated and
there was no appetite to rewrite a working generator. **That reason
does not apply here**, since nothing is generated yet. The shape
carries forward anyway, on the tool-agnostic argument above, which is
the stronger one. Same design, different justification.

**Never use arbitrary-value syntax for a value that has a real token
equivalent** (`bg-[#18468F]` or `bg-[var(--color-accent-700)]` when
`bg-accent-700` exists once `@theme` is wired up). Arbitrary values are
only acceptable for genuinely one-off values with no token equivalent —
and per 00-core-rules.md, if you're reaching for an arbitrary value,
stop and check whether a token should exist first, rather than assuming
none does.

## The Vue design-system documents are retired as a value source
**`frontend/docs/design-system/` in the prior repository contains a
complete, internally consistent token system** — a 10-step grayscale, 8
status colours, 4 state colours, a 14-step type scale, a 12-step spacing
scale, a 5-step radius scale, 3 elevations, a 12-column 1440px grid, and
4 icon sizes with 24 semantic mappings. It is real design work and it is
still on disk and still reads as authoritative.

**No value in it may be adopted.** Per 00's Source precedence case 3, the
prototype governs visual values, and that document set **disagrees with
the prototype** in at least four confirmed places:

| Concern | The Vue documents say | The prototype says |
|---|---|---|
| Primary action colour | `#002C5F`, "Hyundai Blue" | `#2A6FDB`, accent-500 |
| Button radius | `radius.md` = 8px | ~9px |
| **`--space-8`** | **8px** | **32px** |
| Card elevation | `0 1px 60px rgb(26 26 26 / 0.05)` | `0 1px 2px rgba(5,20,31,.04)` |

The third row is the one that makes this a rule rather than a note. It is
the confirmed instance 00's case 5 already records: **the names matched
and the values differed by 4×.** Adopting that scale on the strength of
its name would have shipped every spacing value wrong.

**What is retained is the *structure*, not the numbers.** The prototype
exports values; it does not tell you there should be twelve spacing steps
or fourteen type styles. So:

- **The Vue documents may be read for the *shape* of a scale** — how many
  steps, what each step is for, what a semantic layer over a palette
  looks like.
- **Every literal is re-derived from the current prototype**, with a
  sourcing comment, per the checklist in "Every hardcoded value gets
  resolved, not written" below.
- **A value copied from those documents without re-derivation is a
  blocking review finding**, not a shortcut.

**One document in that set is worth more than the others and is treated
differently:** `icons.md` names the icon library (now ratified in 00),
gives a size scale, and maps 16 semantic and 8 status icons. The
**semantic** mappings are adoptable as-is — `Plus` for add, `Trash2` for
delete, and so on carry no visual value to drift. The **size** scale is
not (the prototype uses 13–19px inline and 24px nav at ~1.75px stroke,
not 16/20/24/32 at 1.5px), and the **status** mappings are keyed to the
prototype's status set rather than the BRD's, so four of the eight have
no target and four BRD statuses have no icon.

## Token scales are authored whole, not one component at a time
**Author each *scale* completely, in one pass, the first time any
component needs any step of it.**

The incremental method — add the two colours this component needs, move
on — is correct discipline for a first trial component and wrong for a
screen. A screen needs the whole spacing scale before its first layout
decision, and deriving step 5 while building a card guarantees it will
not relate to steps 4 and 6. The token file's job is to make a value
*findable*; a file containing 40 tokens chosen by whichever component was
built first is a file you cannot find anything in.

**One consequence to plan for.** The app's `@theme` block currently
carries one line per token, added per component. A complete spacing scale
adds twelve lines and a complete type scale fourteen. At that point the
block stops being a readable list of what is in use and becomes a mapping
table — **group it by scale with a comment per group** when that happens,
or it becomes unreviewable.

## What to author, scale by scale
The list below is the **shape** of the token set — how many scales there
are and what each is for. **Every literal in it is re-derived from the
current prototype**, per the checklist below and 00's Source precedence
case 5. Nothing here is a value.

| Scale | Shape | Notes |
|---|---|---|
| Brand | `kia-midnight` plus hover and active | Already authored. Verify unchanged. |
| Neutral | A full ramp | The current file has 0, 25, 50, 100, 200, 400, 600, 800 — a ladder with gaps. **Author whatever ramp the prototype has, whole.** Do not fill the gaps by interpolation. |
| Accent | 50, 500, 600, 700 | |
| Feedback | `danger`, `warning`, `success`, `info` — each a 500 and a 50 tint | |
| Surface and border | surface, hover overlay, subtle border, default border, focus ring, disabled background, page background | |
| **Status** | One per lifecycle status — **eight**, per the ratified set | See the remap below. This is the one scale that cannot be lifted from the prototype directly. |
| **Severity tier** | Five: Critical / High / Medium / Low / Info | The prototype and BRD `BR-S03` agree on both hues and thresholds. Author directly. |
| Spacing | A step scale on a 4px grid | See the naming trap below. |
| Radius | One value per surface class — control, card, modal, pill | |
| Elevation | Card, card-hover, dropdown, modal | The shadow colour derives from the brand hue; encode it as a token rather than repeating the triplet. |
| Typography | Families (display, body, **mono**), a size/weight/line-height scale, and the uppercase-label style | `--font-mono` is **required** and currently absent: BRD §8.4 mandates monospace for every identifier and numeric. |
| Control heights | sm / md / lg | Gated — see below. |
| Motion | Two durations and one easing curve | 11 caps animation at 240ms; the tokens encode the cap. |
| Breakpoints | **Three, and only three** | 1024 (the usability floor), 1280 and 1600 (the optimisation band), per BRD `NFR-U-008`. A breakpoint token no layout uses is an invitation to build a layout nobody asked for. |

### The spacing-name trap
Two naming schemes exist and **they are indistinguishable by name while
differing by 4×**: naming by pixel value (`--space-16` = 16px) and naming
by Tailwind-style ordinal (`--space-8` = 32px). This is the confirmed
drift 00's case 5 records.

**Name by pixel value**, and state the convention at the top of the token
file. It is self-describing, and the ordinal scheme already exists in
Tailwind's own scale, which the app consumes directly for utility classes.

### The status-colour remap — the one place a direct lift is wrong
The prototype's status palette is keyed to the **prototype's** status
set. The ratified set (BRD §9.1) is different. The hues mostly carry
across; the keys do not.

| Ratified status | Nearest prototype status | Confidence |
|---|---|---|
| `OPEN` | Open | High — same name, same meaning |
| `INVESTIGATING` | In Review | Medium — the prior code's own comment labels `review` as "Investigating" |
| `MONITORING` | Monitoring | High |
| `QIR_ESCALATION` | Escalated | Medium — the prior code labels `escalated` as "QIR" |
| `TOP_ISSUE` | *(none)* | **needs a hue** |
| `RESOLVED` | Disposed | Medium — different words, same lifecycle position |
| `OUT_OF_SCOPE` | *(none)* | **needs a hue** |
| `CLOSED` | Closed | High |

Two prototype statuses have **no** ratified counterpart — `Draft` and
`Pending Approval`, both removed by `DEC-01` — and two ratified statuses
have **no** hue.

**Do not reuse Draft's grey for `OUT_OF_SCOPE` and Pending Approval's
amber for `TOP_ISSUE`.** That is exactly the reasoning-by-analogy 00's
case 4 forbids: `TOP_ISSUE` is the highest-urgency state in the
lifecycle, and an amber inherited from an unrelated approval state is not
a decision, it is a leftover. **[PLACEHOLDER — hues for `TOP_ISSUE` and
`OUT_OF_SCOPE`. Trigger: before `BaseStatusPill` is specified. Owner: the
designer, via the prototype.]** Mark both `[UNSPECIFIED]` in the token
file until answered.

### Control heights are gated by WCAG, and the gate is here
11-accessibility-standards.md makes SC 2.5.8 (Target Size, 24×24 CSS px)
**a token-authoring requirement**: every interactive-control height token
clears 24px, checked while the scale is authored. A height token found
short after components consume it cannot be fixed in one place — raising
it changes the layout of everything built on it.

One known conflict to resolve rather than inherit: the prototype's
generic control scale is 28 / 36 / 44px, while `BaseButton`'s md is 40px
(the real design-system Button's own rendered height) and its sm is 36px,
which coincides with the generic **md** step rather than sm.
18-project-context-and-implementation-status.md records the hypothesis
that the 28px step belongs to the icon-only square-button component
rather than to `BaseButton`. **Resolve when that component is specified;
do not renumber `BaseButton` before then.**

**One value fails the gate outright**: the prototype's icon-button
cluster includes 20px and 22px instances. Any interactive control at
those sizes fails SC 2.5.8 unless its hit area is padded to 24px. That is
a requirement on the eventual icon-button component and it is recorded
nowhere else.

### Icons
00 ratifies the library. The **semantic** mappings from the prior
repository's icon standard are adoptable as-is — one icon per meaning,
with no visual value in them to drift. The **size** scale is not: the
prototype uses 13–19px inline and 24px nav at roughly 1.75px stroke, not
the prior 16/20/24/32 at 1.5px. The **status** mappings need the same
remap as the colours above.

**Source-channel icons are not in the prior standard and are in the
prototype** — one per channel, always the same one, across list, entry,
workspace and export (BRD §8.4). The `MANUAL` channel has none specified
and needs one.

## Every hardcoded value gets resolved, not written
**Using Tailwind is not the same as being token-clean.** A component can
be entirely Tailwind utility classes and still bypass the token system
completely — `bg-slate-950` is a Tailwind class and it is not a token.

**Three ways to handle a value, and only three:**
- **A token exists for it** → use the token class (`bg-accent-700`).
- **No token exists, but the value is clearly a design-system value**
  (a spacing step, a semantic colour) → **flag it to Yogesh as a
  missing-token gap.** Do not invent a token name, and do not leave the
  literal in place unremarked.
- **The value is genuinely one-off** (a specific pixel offset with no
  broader meaning) → a literal is acceptable, **but document why** in a
  dated inline comment.

**The two failure modes to watch for**, both of which look fine in
review:
- **Raw Tailwind palette classes standing in for tokens** —
  `bg-slate-950`, `text-slate-950` and friends. These pass any
  "is it Tailwind?" check and silently fork the palette.
- **An undocumented literal.** A hardcoded hex with no comment is
  indistinguishable from an oversight six months later, which is how it
  survives.

Provenance: both failure modes were found throughout `kus-pqms`,
including in the two components that were *already* on Tailwind rather
than BEM — being on the right styling system had not made them
token-clean. Its dated-comment convention (`§23 (2026-08-13)`-style) is
the one worth copying, and it is what the third bullet above asks for.

**A third failure mode, not about which of the three ways above a value
takes, but about whether its literal is still correct**: a token value
copied from a prior citation — an earlier revision of this corpus, or
carried-forward `kus-pqms` code — can drift silently out of date against
a regenerated prototype export even when its name still looks right.
00-core-rules.md's Source precedence, case 5, owns this; not restated
here.

**On test coupling**: a consumer test that asserts against a shared
component's class names creates coupling that makes restyling that
component a multi-package change. 10-testing-standards.md's query
priority already prevents this — query by role and label, never by
class. Provenance: in `kus-pqms` seven `ui-library` components had
consumer specs asserting class names or structure from outside the
package, which is exactly the coupling that priority exists to avoid.

## Component naming
`ui-library` components use `Base*` naming — `BaseButton`,
`BaseSelect`, and so on.

The prototype's own design system names the same components without a
prefix (`Button`, `Select`, `DataTable`): those are design-system
labels, and this file governs code naming per 00's source-precedence
rule. See there, not here, for why.

**`Base*` and `Pqms*` are two live conventions covering two different
things — do not collapse them.** The split:

- **Components → `Base*`.** Note that
  `frontend/docs/design-system/component-standards.md` prescribes
  `Pqms*` for *components* (`PqmsButton`, `PqmsInput`, even
  `PqmsButton.types.ts`). **That document is stale on this point — do
  not follow it.** It is called out because it is a real document
  someone will find, and it contradicts this rule directly.
- **Shared variant/state/size types → `Pqms*`**, in
  `packages/ui-library/src/types/` (`variant.types.ts`,
  `state.types.ts`, `size.types.ts`). This convention is **live**, not
  the stale one.

The two are wired together deliberately: **a `Base*` component's own
types alias the shared `Pqms*` vocabulary rather than redeclaring it.**
So `BaseButton.types.ts` contains
`export type BaseButtonVariant = PqmsButtonVariant;` — the shared type
is the single source of the variant vocabulary, and the
component-facing name stays local to the component. Redeclaring the
union in the component's own file is the thing this prevents.

Provenance: `kus-pqms` had at least 12 of these — `PqmsButtonVariant`,
`PqmsTagVariant`, `PqmsPillVariant`, `PqmsBadgeVariant`,
`PqmsInputType`, `PqmsIconSize`, `PqmsDateSelectorMode`,
`PqmsValidationState`, `PqmsSize`, `PqmsSelectionState`,
`PqmsLoadingState`, `PqmsInteractionState` — consumed by `Base*`
components through exactly that aliasing. The names are worth carrying
forward as-is; a new shared type follows the same prefix.

**Both conventions apply.** Do not treat the `Pqms*` type layer as
though it were the stale component convention and rename it — that
breaks the aliasing relationship above for no benefit.

**This section owns the split.** 14-code-style-and-linting.md states
the two prefixes as checkable naming rules and points here for the
reasoning; 01-project-structure-and-architecture.md points here when
listing `packages/ui-library/src/types/`. Neither restates it, so a
change to the split is a change to this section only.

## Component configuration: enumerated variants, not a theme
**A `ui-library` component declares its visual options as literal
unions — variant, size, state — and a consumer configures it by
choosing from them.** There is no theme layer, no style-override prop,
and no consumer-side customization mechanism. The set of looks a
component can have is the set of values in its unions, and that set is
enumerated in the component's specification.

The `Pqms*` shared types above are the mechanism; this section is the
reasoning behind it. `PqmsButtonVariant`, `PqmsSize`,
`PqmsValidationState` and the rest *are* the configuration surface.

**Three reasons for this shape rather than the alternatives:**

- **A theme layer would be indirection with nothing behind it.**
  Material's model exists because Material serves thousands of
  unrelated applications with different brands, and a theme is how one
  library survives that. This library serves **one** app with **one**
  design system, defined by the prototype. A theme contract here would
  be a configuration surface with exactly one configuration, and every
  component would pay for it in complexity while no consumer ever used
  it for its purpose.
- **Enumerated variants are what Tailwind is natively good at.** Each
  variant maps to a fixed set of utility classes, resolved when the
  component is written. Nothing is computed at runtime, nothing is
  injected, and the classes are readable in the source of the component
  that uses them. A theme system puts a runtime lookup between the
  token and the rendered class — the layer the `@theme` token design
  below exists to avoid.
- **It makes the prototype sufficient as a source.** You can read a
  prototype and enumerate what it shows: three button treatments, two
  input sizes, four tag colours. You cannot read a prototype and derive
  a theme contract, because that requires knowing which of the values
  it shows are meant to be configurable and which are fixed, and a
  prototype does not say. This is the reason that matters most in
  practice — it is what lets a component specification be *derived*
  from the prototype rather than invented alongside it.

**Consequence for specification authoring**: a component's variant set
is what the prototype shows and no more. That is stated as a rule about
spec authoring in `PQMS_docs/component-specs/TEMPLATE.md`, which this
section grounds.

## The `className` boundary
**`className` is not part of any `ui-library` component's public API.**
Consumers do not pass classes into a shared component.

**The rule people will want to break, stated as the thing it is**: a
screen that needs a look the variants do not cover **adds a variant to
the component**. It does not style around the component from the call
site.

That is deliberately the more expensive path. Adding a variant is a
change to the design system and is meant to be visible as one — it
lands in the component, in its spec, and in Storybook, where the next
person building a similar screen finds it. A `className` passed from a
call site is invisible in all three places: the design system acquires
a variation that nothing records, and the second screen needing that
same look either re-derives the override or, more often, derives one
slightly different from it. That is how a library ends up with one
component and six looks nobody chose.

Two things follow.

**`cn()` is internal to a library component, not a consumer-facing
mechanism.** It composes a component's *own* classes. The next section
specifies it and previously left unstated which side of this boundary
it belongs on.

**App-level components in `apps/portal` are not bound by this.**
An app component is not a shared API: it has one consumer — its own
screen — and no unknown second call site whose expectations an incoming
class could break. Accepting a `className` there, or writing
conditional Tailwind directly, is ordinary app code. The rule above
exists because a `ui-library` component's call sites are unbounded and
unknown to it, and that reasoning does not transfer to a component with
exactly one caller. Do not over-apply it and end up with screens that
cannot lay out their own children.

## Conditional class composition

Tailwind utility classes don't compose safely via plain string
concatenation or template literals when conditions conflict on the
same CSS property. Two classes targeting the same property (e.g. a
default `bg-white` and a conditional `bg-accent-700` override) don't
resolve by which one appears later in the className string — they
resolve by which rule appears later in Tailwind's COMPILED stylesheet,
which depends on Tailwind's internal ordering, not source order. A
naive `` `bg-white ${isActive ? 'bg-accent-700' : ''}` `` can silently
lose the override.

Use `clsx` for conditional class inclusion logic, composed with
`tailwind-merge` for resolving Tailwind-specific conflicts (deduplicating
competing utility classes so the last logically-intended one wins,
regardless of Tailwind's internal stylesheet order). Wrap both in a
single shared `cn()` utility — the common pattern:

```ts
cn(...inputs: ClassValue[]) => twMerge(clsx(inputs))
```

**Where `cn()` applies**: inside a component, composing that
component's own classes — its base classes, plus whatever its
`variant`, `size` and `state` props resolve to, plus any conditional
class. For a `ui-library` component that is the whole of it, because
per the `className` boundary above no classes arrive from outside.

**An earlier revision of this section ended by describing `cn()` as
what "lets a consumer safely override a specific utility without
fighting the component's own defaults." That is withdrawn** — it
described a consumer-override mechanism the boundary above rules out
for `ui-library`. Where a component in `apps/portal` does accept a
`className`, merging it through `cn()` rather than concatenating is
still correct, and the conflict-resolution reasoning above is exactly
why.

**Both are new dependencies to add** — `clsx` and `tailwind-merge`.
Neither has an antecedent: `kus-pqms` had no need for either, because
Vue's native `:class` binding handled conditional classes and the
compiled-stylesheet ordering problem above does not arise the same way.
So there is nothing to carry forward here; add both, and write `cn()`
once as a shared utility rather than per-component.

## Two scales the table above omits, and one thing to do with all of them
The prior repository's `design-tokens` package has nine value modules. Seven map
onto rows above. **Two do not, and both have real design documentation behind
them:**

| Scale | Shape | Why it is a token scale |
|---|---|---|
| **Grid** | columns, gutter, container max-widths | A layout grid stated in three components is three grids. It also interacts with the three ratified breakpoints — the grid is what those breakpoints switch between. |
| **Logo** | dimensions per placement | The brand mark appears in the header, on the auth screen and in exports at different sizes. Those are values, they are decided once, and they drift the moment they are inline. |

Author both. Neither is large.

## Token values are asserted, not only authored
The prior `design-tokens` package ships a `tokens.spec.ts` — **the token values
are under test.** This file has so far treated tokens as data to author; they
are also data to *assert*, and two of the rules above are mechanically checkable
rather than review-checkable:

- **Every interactive-control-height token clears 24px** (SC 2.5.8). This is
  stated above as a gate applied while the scale is authored. A review catches
  it once; a spec catches it every time, including on the change six months
  later that shaves 2px off `sm`.
- **Every status in the ratified eight has a colour token**, and no token exists
  for a status outside the set. That single assertion is what stops the removed
  `draft` and `pendingApproval` hues surviving as orphans, and what fails loudly
  while `TOP_ISSUE` and `OUT_OF_SCOPE` are still `[UNSPECIFIED]`.

Contrast-ratio assertions on the feedback and status pairs are worth adding at
the same time — they are arithmetic, and 11-accessibility-standards.md's AA
requirement is otherwise enforced only by someone remembering to check.

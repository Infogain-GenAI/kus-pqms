# Component Specification — Template

This file defines what every component specification in this folder
contains. **It is not itself a specification of anything.** Copy the
template body at the bottom, fill it in for one component, and save it
as `ComponentName.md` in this folder.

No component specs exist yet. Writing them is pass-4 work, derived from
the prototype — see
`../standards/01-project-structure-and-architecture.md`'s
component-specification gap and
`../standards/17-domain-glossary-and-business-context.md`'s Prototype
register.

**`INVENTORY.md`, beside this file, is a candidate list — not a work
queue.** It proposes which components exist and in what order to build
and specify them, derived from the BRD rather than the prototype. Use it
to plan; reconcile it during the derivation; never treat a row in it as
authorisation to build.

**Two companions a finished spec implies**, so they are not discovered
late:
- **Stories.** `../standards/24-storybook-authoring.md` derives the story
  set **mechanically** from this spec's Variants-and-sizes table — one
  story per union value, one per non-default state. A spec with a vague
  variant table produces an unreviewable story set.
- **A screen description.** `../standards/29-screen-description-authoring.md`
  is the *input* to a spec, not its output. If you are writing a spec
  and cannot say which screen uses the component and what for, the screen
  description has not been written yet.

---

## What a spec is, and why it is not a tier file

The standards corpus in `../standards/` is 21 numbered, tiered files
holding **rules that apply across the whole app**. A component spec is a
**contract for one component**. They are different kinds of document
and are kept apart for three reasons:

- **Different lifecycle.** A standards file is revised when a rule
  changes, and a revision there can affect every component. A spec is
  revised when **the prototype changes** for that one component, or
  when a question it left open is answered. Those two clocks are not
  related, and putting per-component churn inside a tiered file would
  make its revision marker meaningless.
- **No precedence.** Tier files have a precedence order and 00 wins
  ties. Specs sit **outside** that hierarchy entirely: **a spec never
  overrides a standard.** If a component genuinely cannot satisfy a
  standard, that is a standards question, raised against the standards
  file — not a local exception written into a spec.
- **Different bar for being right.** A standards file is right when its
  reasoning holds. A spec is right when it **matches the prototype**. It
  is checked by reading the prototype next to it, which is a different
  activity from reviewing a rule.

**Placement and naming are owned by
`../standards/01-project-structure-and-architecture.md`** — see "Where
component specifications live" there. In short: one file per component
named for the component (`BaseSelect.md`), flat in this folder, and a
spec's lifecycle is its component's — renamed with it, **deleted with
it**.

**Specs are for `ui-library` components only.** App-level components in
`apps/portal` do not get specs; 01 states why, and
`../standards/07-routing-and-layouts.md`'s inline layout specifications
are the precedent. If you are about to write a spec for a screen, a page
wrapper or a layout, stop — that is not what this folder is for.

---

## Two rules about authoring a spec

These are the rules most likely to be broken by someone writing a spec
in good faith, so they come before the template rather than after it.

### Rule 1 — Enumerate only what the prototype shows

**A component's variant set is what appears in the prototype. Nothing
is added because it is a common set.**

A component with three button treatments in the prototype has **three**
variants. It does not have `primary | secondary | tertiary | danger |
ghost` because that is what button libraries usually have. It does not
gain a `danger` variant because a destructive action seems likely to
exist somewhere later.

Anything beyond what the prototype shows is marked
**`[UNSPECIFIED]`**, with what would answer it. It is not invented and
it is not filled in by analogy with another component.

Why this is a rule and not a preference: this corpus has caught
fabricated values four separate times — a permission call that did not
exist, a hex colour that was not the brand colour, a status value that
was not in the real set, and a service namespace that was never
implemented. Each was plausible, and each was wrong in a way that would
have been built before anyone checked. An invented variant is the same
failure with a longer fuse: it becomes a prop, then a Storybook story,
then a call site, and the design system has a look the design does not
contain.

`../standards/06-styling-and-design-tokens.md`'s "Component
configuration: enumerated variants, not a theme" is why enumeration
from the prototype is possible at all — a theme contract could not be
derived this way.

### Rule 2 — Say what governs each decision

Every line in a spec comes from somewhere. Name it.

| What | Governed by |
| --- | --- |
| Visual structure, which variants exist, copy, states shown | **The prototype** (17's register) |
| Component name, prop names, callback naming, callback payload shape, controlled/uncontrolled | **03** |
| Type file location, union declaration, strictness | **02** |
| Styling, the variant vocabulary, the `className` boundary, headless primitive | **06** |
| Category folder placement | **01** |
| i18n file, namespace, key style, pluralization | **09** |
| Accessibility requirements, ARIA, keyboard behaviour | **11** |
| Spec file placement and naming, and whether a component gets a spec at all | **01** |

**Where a spec decides something none of them governs, it says so and
gives the reasoning.** That is the same discipline the standards use: an
unsourced decision is indistinguishable from an invented one, so it is
labelled as a decision made here, with the argument for it, rather than
stated flatly as though it came from somewhere.

Three phrases to use literally, so a reader can tell them apart:

- **"Per the prototype"** — observed in the prototype. Cite which
  screen.
- **"Per NN"** — required by a standards file.
- **"Decided here"** — neither governs it; the reasoning follows.

And one more:

- **`[UNSPECIFIED — <what is missing>. Resolved by: <what would answer
  it>.]`** — nothing governs it *and* there is not enough to decide on.
  This is the honest answer far more often than it feels like it should
  be.

---

## Template body — copy from here

```markdown
# <ComponentName>

**Category:** `<base|composite|data|feedback|layout|navigation|overlay|pqms>/` (per 01)
**Prototype source:** <which prototype file and which screen(s)>
**Status:** DRAFT | REVIEWED
**Last checked against the prototype:** <date>

## Purpose
What this component is, in two or three sentences. What it is *not* —
specifically, the neighbouring component someone might reach for
instead.

## Props
Every prop. No prop appears anywhere else in this spec without
appearing here.

| Prop | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| | | | | |

- Types are the real types, not descriptions: `PqmsButtonVariant`, not
  "the variant".
- A prop with no default is stated as having none, not left blank.
- `className` does **not** appear in this table for a `ui-library`
  component — per 06's `className` boundary it is not part of the
  public API.

## Variants and sizes
Every value of every visual union, listed. Per Rule 1, exactly what the
prototype shows.

| Union | Values | Where each is used in the prototype |
| --- | --- | --- |
| | | |

State for each union whether it aliases a shared `Pqms*` type from
`packages/ui-library/src/types/` or is component-local — per 06's
component-naming split, a component's own type **aliases** the shared
vocabulary rather than redeclaring it.

## Controlled or uncontrolled
Which. If controlled, name the pairs: per 03, one `<name>` prop with
its own `on<Name>Change` callback per independent piece of state —
`selected` + `onSelectedChange`, `open` + `onOpenChange` — never a
single generic `value`/`onChange` carrying several.

If a component supports both modes, say what happens when the value
prop is supplied and when it is omitted.

## Callbacks
Every callback, with its exact payload.

| Callback | Payload | Fires when |
| --- | --- | --- |
| | | |

Per 03: more than one meaningful argument collapses into a **single
object parameter** — `onSelect({ row, index, event })`, never
positional. A semantic callback receives the **value**, never the
native DOM event; a raw event is carried by a separately named prop
only if a consumer genuinely needs it.

## `<ComponentName>.types.ts`
What this file declares, per 02's co-located type convention:

- the props interface
- variant/size/state aliases of the shared `Pqms*` types
- any payload interface a callback above uses

Types used by only this component stay here. A type does not move to a
shared location until two features genuinely use it.

## i18n
Per 09: one `<ComponentName>.i18n.ts` beside the component, holding
this component's own keys, self-registering its namespace via
`i18n.addResourceBundle`.

- **Namespace:** `<ComponentName>` — must match the component name and
  the string passed to `addResourceBundle`.
- **Keys:** every user-facing string, with its `en` value.

| Key | `en` value | Where it appears |
| --- | --- | --- |
| | | |

`en` only. Do not add a `ko` key with an empty value.

If the component has no user-facing text of its own — text arrives via
props or children — say so explicitly. That is a real answer, and
`ui-library` components are frequently in that position.

## Accessibility
Per 11.

- **Built on a headless primitive?** Yes / No, matching 06's exception
  table. If this component is not in that table, the answer is No —
  adding a row there is a decision, not something a spec does on its
  own.
- **Semantic element and role.**
- **Accessible name** — where it comes from. Per 11, a name is
  associated (`aria-labelledby`, `<label htmlFor>`), not duplicated
  into an `aria-label` string.
- **Keyboard behaviour** — every key, and what it does. Not "keyboard
  accessible".
- **Focus behaviour** — what receives focus, whether focus is trapped,
  where it returns.
- **ARIA state** — which attributes reflect which props.

## Empty, loading, and error states
For each state the component has: whether it exists, whether the
component renders it or the consumer does, and what it looks like per
the prototype.

| State | Owned by | Appearance |
| --- | --- | --- |
| Empty | component / consumer / N/A | |
| Loading | component / consumer / N/A | |
| Error | component / consumer / N/A | |

**"Owned by" is an API decision, not a detail.** If the consumer owns a
state, every consumer reimplements it; if the component owns it, the
consumer cannot vary it. Pick deliberately and say why.

## Composition
- Does it accept `children`? What is valid there?
- Is it a compound component (`Component.Sub`)? Per 03 that is in scope
  but reserved — justify it.
- Which components does it use internally? Which components use it?

## Open questions
Everything this spec does not answer, in the `[UNSPECIFIED]` form.
An empty section here is a claim that the component is fully buildable;
do not make that claim casually.

## Provenance and decisions
- Anything marked **"Decided here"** above, with its reasoning.
- Anything from the prior Vue implementation (`kus-pqms`) that informed
  this spec, labelled as provenance rather than as a requirement.
- Anything in the prototype that was **not** carried into this spec,
  and why.
```

---

## Reviewing a spec

Four questions, in order:

1. **Does every variant value appear in the prototype?** Rule 1. This
   is the failure to look for first because it is the easiest one to
   commit while being helpful.
2. **Is every prop's type real?** A prop typed as "string" that should
   be a union is a spec that has not been finished.
3. **Is every "Decided here" actually argued?** A decision with no
   reasoning is a preference wearing a spec's clothes.
4. **Is the Open questions section honest?** An empty one on a
   complex component is the least believable part of any spec.

A spec is **not** approved by being written. It is approved by someone
reading it with the prototype open.

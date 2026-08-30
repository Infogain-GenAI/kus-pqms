# Decision request — 353 hard-coded values, and whether the design system grows

**To:** Design-system owner (designer) · Frontend architect
**From:** Frontend restructuring work, N-PQMS ISM portal
**Date:** 2026-08-26
**Decision needed by:** before further token-conversion work; it is blocking.

**This document is self-contained.** It assumes no prior reading. Nothing here
requires opening another file.

---

## In one paragraph

The N-PQMS ISM frontend is being converted from hard-coded values
(`padding: '16px'`) to design-system tokens (`padding: 'var(--space-4)'`). Of 467
such values, **103 have been converted** — every one verified to render
identically. **353 remain, because the design system has no token holding their
value.** **Whether these values ever become tokens is your decision, not ours.**

> ### ⚠️ CORRECTION, 2026-08-30 — THIS DOCUMENT'S ORIGINAL PREMISE WAS FALSE
>
> This paragraph previously read: *"The design system is vendored into this
> project as a byte-for-byte copy with an automated drift check, **so adding a
> token is not an edit this project is able to make.**"*
>
> **That is not true of this repository, and it never was.** The claim was
> inherited rather than tested. It is the foundation of this document's blocking
> question, of its "nothing further is converted until this is answered", and of
> the pause that followed — so it is corrected here rather than quietly amended.
>
> `packages/design-tokens/design-system-manifest.json` is **a committed file in
> this repository**, and both gates check consistency *against that file*, not
> against anything remote. `"source":"spa"` in the manifest records where it was
> extracted from, not where it is fetched from. Confirmed by Yogesh: **this repo
> owns the manifest; nothing upstream re-exports it.**
>
> Proven end-to-end by adding a disposable token, running every gate, and
> reverting. **The procedure — three files, one command, in this order:**
>
> 1. Append to the `tokens` array in `design-system-manifest.json`, e.g.
>    `{"name":"--x","value":"3px","kind":"spacing","definedIn":"tokens/elevation.css"}`
> 2. Add `--x: 3px;` to the `tokens/*.css` file named in that entry's `definedIn`.
>    **The generator does not write CSS** — this step is manual, and it is the
>    non-obvious one.
> 3. `pnpm --filter @pqms/design-tokens tokens:gen`, which rewrites
>    `src/tokens/tokens.generated.ts`.
>
> The typed `TokenName` union and `cssVar()` pick the new token up automatically;
> `ds-gate` is indifferent, as it lints `.ts`/`.tsx` for raw values.
>
> **THREE FAILURE MODES, TWO OF WHICH MISLEAD:**
>
> · *Manifest without CSS* — `tokens:check` fails clearly, naming the token.
>
> · *Manifest + CSS, not regenerated* — `tokens:check` PASSES, then `tokens:drift`
>   prints a line-by-line diff of everything after the insertion point. **It looks
>   like dozens of tokens changed. They did not — the file is offset by one line.**
>   The fix is `tokens:gen`, not a repair.
>
> · **⚠️ *CSS without the manifest* — EVERY GATE PASSES SILENTLY.** `tokens:check`
>   iterates the manifest, so a CSS-only token is invisible to it, and `css-vars`
>   only checks that `var()` references resolve. The token works at runtime and is
>   absent from the typed map. **This is the one trap with no guard.**
>
> **"We can" is not "we should."** A token added here diverges from whatever
> produced the manifest. That would matter if something upstream re-exported it —
> Yogesh has confirmed nothing does, so the question is settled for this repo, but
> the reasoning should be re-tested if that ever changes.

---

## What was done, so the numbers are trustworthy

Each conversion was checked twice before being accepted:

1. **A value proof, without rendering anything.** The token's declared value in
   the design-system manifest must equal the literal it replaces, character for
   character. `16px` → `--space-4` passes because `--space-4` *is* `16px`.
   Nothing that passes this can change a pixel.
2. **A rendered check.** Every screen is screenshotted before and after and
   compared **exactly** — zero tolerance. Same machine, same pinned browser.

**Result: 103 conversions, every screen pixel-identical.** As an independent
confirmation, the app was also compared against the original UX prototype before
and after; that difference was **unchanged to the digit**.

So the numbers below are measured, not estimated.

---

## The three categories

### Category A — values that cluster, and look like real gaps in the system

These repeat, follow a pattern, and sit next to values the design system already
owns. **This is the category that suggests the system is missing something,
rather than the code being sloppy.**

#### A1 · Colour tints — RESOLVED 2026-08-30, seven tokens added

**COUNT CORRECTED: seven tints, 18 uses — not four and ~15.** Re-measured before
acting. The three the original table missed are identical in construction, so the
derivation is more systematic than this document argued, not less.

**⚠️ SCOPE OF THE PRECEDENT — ALL 18 USES ARE IN `AdminScreen.tsx`.** That does
not weaken the justification: an owned hue at 8% is either a real generatable
layer or it is not, and that does not depend on how many screens reach for it.
But it does weaken A1 as a citable precedent. **Cite it as "the system owns this
derivation, demonstrated in Admin" — not as a pattern repeating across the app**,
which the codebase does not currently show.

Every one is **an existing design-system colour at 8% opacity**:

| In the code | Base colour | Base token | Now |
|---|---|---|---|
| `#7C5CDB14` ×5 | `#7C5CDB` | `--status-review` | `--status-review-tint` |
| `#2A6FDB14` ×5 | `#2A6FDB` | `--accent-500` | `--accent-500-tint` |
| `#0E938414` ×3 | `#0E9384` | `--status-disposed` | `--status-disposed-tint` |
| `#D92D2014` ×2 | `#D92D20` | `--danger-500` | `--danger-500-tint` |
| `#E2820B14` ×1 | `#E2820B` | `--warning-500` | `--warning-500-tint` |
| `#1F8A5B14` ×1 | `#1F8A5B` | `--success-500` | `--success-500-tint` |
| `#05141F14` ×1 | `#05141F` | `--kia-midnight` | `--kia-midnight-tint` |

**⚠️ THE `-tint` SUFFIX WAS A JUDGMENT CALL, NOT A DERIVATION.** No alpha-tint
convention existed to follow. The nearest precedent, `--kia-midnight-90/-80/-70`,
is a *lightness* ramp — reusing that shape for an *alpha* tint would actively
mislead. A numeric opacity suffix (`--accent-500-08`) was rejected because it
collides visually with the 50/100/500/600 scale numbers already inside the names.
"Tint" is this document's own word for them. **The next person adding a token
should know which parts of the naming are convention and which were chosen.**

*(`14` in hex is 20/255 ≈ 8% opacity.)*

**The system owns the hue. It does not own the tint.** These are used for soft
badge and chip backgrounds — a real, repeating UI pattern.

**This is a missing layer, not missing values.** The developer had no token to
reach for, so they wrote the hue and appended an opacity. Every instance is
internally consistent with the design system; the vocabulary simply stops one
level short.

#### A2 · A second border width — RESOLVED 2026-08-30, one token added

**⚠️ COUNT CORRECTED: FIVE uses, not 14.** The original figure counted *every*
`2px` in the codebase — `padding: 2px` (4), `margin-top: 2px` (2), `gap: 2px` (2),
`margin`, `margin-left`, `padding-top`, a `borderRadius: '2px'`, and one hit
inside `dist/` build output. Those are spacing and radius, not border width.

The five genuine border widths: `AppHeader.tsx`, `DashboardScreen.tsx`,
`ChangeRequestPanel.module.css`, `PartRequestHistory.module.css`,
`button.module.css` — three of them left-accent stripes rather than borders proper.

**This materially weakened A2's original argument**, which rested on 14 against
the 41 `1px` conversions to claim border width was "the single most repeated value
in this codebase". At five it is not. The decision was re-taken on the corrected
number and stands anyway: five uses with no token covering them is a real gap.

Added as **`--border-width-emphasis`**, named rather than numbered — `-2` invites
a `-3`, and `--border-width` carries no number to pair with.

> ### ⚠️ THIS DOCUMENT'S INVENTORY AND `ds-gate` COUNT DIFFERENT SETS
>
> Converting A1 and A2 moved `ds-gate`'s `values` ceiling **293 → 274**: a drop of
> 19, from **20** conversions in `.ts`/`.tsx`. (The other three are in
> `.module.css`, which `ds-gate` does not lint at all.) The missing one reconciles
> exactly, and the reason generalises:
>
> **`AppHeader.tsx`'s `2px` sat inside a template literal, and the gate never
> counted it.** Its rule matches `Literal` AST nodes; a value inside a
> `` `backtick` `` string is a `TemplateLiteral` and is invisible to it. Proven by
> controls rather than inferred — restoring that literal left the count at 274,
> while restoring `DashboardScreen.tsx`'s plain-string `2px` moved it to 275.
>
> So a conversion can be real and correct and still not move the ceiling. **The
> ceiling is a floor on what is countable, not a census of what exists.** A rough
> scan finds backtick spans containing `px`/hex values across the app — most are
> prose inside comments, but at least one (`IssueListScreen.tsx:238`) is a genuine
> uncounted template literal. **Sizing that blind spot properly needs an AST pass
> and has not been done.**
>
> ### ⚠️ THE REMAINING COUNTS IN THIS DOCUMENT ARE UNVERIFIED
>
> **Two of two figures that were checked before being acted on proved wrong** —
> A1 understated by three tints, A2 overstated by roughly three times. Neither
> error was visible without re-measuring, and A2's would have justified a token on
> an argument that does not hold.
>
> So: **A3's "~14", Category B's "~141" and its per-row counts, and Category C's
> remainder have NOT been re-measured.** Treat them as estimates. Re-count before
> acting on any of them — the base rate in this document is two for two.

#### A3 · Off-grid spacing — ~14 uses (unverified)

`3px`, `5px`, `7px` — sitting between `--space-1` (4px) and `--space-2` (8px).
Fewer, and a weaker case than A1 or A2; possibly just imprecision.

#### A4 · `#fff` — 24 uses, and NOT your problem

Listed only to prevent it being counted against you. `#fff` is `#FFFFFF`, which
**is** `--neutral-0`. Our checking tool compares hex strings literally and misses
the short form. **A defect in our tooling; already logged; not a design-system
gap.**

---

### Category B — prototype constants, ~141 uses

Values that came from the original HTML prototype and follow no system:

| Values | Uses | What they are |
|---|---:|---|
| `12.5px`, `10.5px`, `13.5px`, `11.5px` | **42** | half-pixel font sizes, off the type scale |
| `10px`, `11px`, `9px` | **63** | font sizes below the scale's smallest step |
| `#F0F2F5`, `#F6F8FA`, `#DDE3E9`, `#F4E2C0` | **36** | greys and a tan, close to but not equal to existing neutrals |

**These are not obviously system gaps.** The half-pixel sizes in particular look
like prototype artefacts rather than intended design decisions. **The useful
question for you is narrow: were these deliberate, or incidental?** If incidental,
the honest fix is to snap them to the nearest scale value — but **that changes
what users see**, so it needs your approval, not ours.

---

### Category C — genuinely arbitrary

The remaining long tail: one- and two-use values fitting no pattern and repeating
nowhere. No action proposed.

---

## The constraint that shapes every option

**This project cannot add a token.** `src/styles/design-system/` is a byte-for-byte
copy of the design system's shipped output, and an automated check fails the build
if it differs by one character. That check is deliberate and valuable — it is what
guarantees this app and the design system cannot silently diverge.

It also means **there is no local workaround that produces a real token.**

---

## The three options

### Option 1 — Upstream: add the tokens to the design system

The only route that produces genuine tokens.

| | |
|---|---|
| **Cost here** | ~1 day to adopt, once released |
| **Cost to you** | design review, plus a design-system release |
| **Elapsed** | weeks, and outside this project's control |
| **Covers** | Category A cleanly — especially A1 and A2 |
| **Risk** | **We do not know whether this channel exists.** See the question below |

### Option 2 — An app-local `--proto-*` layer

This app defines its own variables — `--proto-border-emphasis: 2px` — kept
separate from design-system tokens and clearly named as not-a-token.

| | |
|---|---|
| **Cost** | ~1 day, entirely within this project |
| **Covers** | everything, A B and C |
| **Benefit** | values become named, greppable, changeable in one place |
| **Risk** | **a second vocabulary.** Two things that look like tokens, only one of which the design system governs. If A1's tints are later added upstream, the app carries both for a while |

### Option 3 — Accept them permanently

Leave all 353 as literals. **This is a legitimate choice and is not the same as
doing nothing carelessly** — but it has a consequence that should be chosen with
open eyes:

> **The count of hard-coded values stops at roughly 353 and stays there.**
> The automated check that tracks this number was built as a *burn-down* — a
> number that only ever falls, toward zero. Under Option 3 it becomes a **fixed
> regression guard**: it will stop new hard-coded values being added, and it will
> never reach zero.

| | |
|---|---|
| **Cost** | zero |
| **Covers** | nothing |
| **Consequence** | the burn-down ends here, permanently |

---

## No recommendation, and that is deliberate

**The evidence does not support one, and manufacturing one would overreach.**

- **A1's tints** argue for upstream — every instance is an existing token one
  level short, which is a system gap, not a code defect.
- **Category B** argues for a local layer or acceptance — these look like
  prototype artefacts, and promoting them to tokens would enshrine something
  nobody designed.
- **And the deciding fact is one nobody here knows** — see below.

These can also be split: Option 1 for Category A, Option 3 for B and C, is a
coherent answer and possibly the best one.

---

## The one question we need answered explicitly

> ### Does a channel to change the design system exist at all?
>
> Specifically: **is there an owner who can add a token, and a release process
> that would deliver it to this project?**

Everything above depends on it:

- **If yes** — Option 1 becomes viable for Category A, and the first request is
  the ~15 colour tints (A1), which is the smallest and best-evidenced ask.
- **If no** — Option 1 is off the table and the real choice is between Option 2
  and Option 3, which is a decision about this app alone and can be made quickly.

**We could not determine this from inside the project.** The design system arrives
as a vendored copy with no recorded provenance for how it is updated.

---

## Summary

| | |
|---|---|
| Converted so far | **103**, all pixel-identical |
| Remaining | **353** |
| Category A — likely system gaps | ~67 (≈15 tints, 14 × `2px`, ~14 off-grid, 24 tooling defect) |
| Category B — prototype constants | ~141 |
| Category C — arbitrary | remainder |
| **Blocking question** | **Does an upstream channel to the design system exist?** |

**Nothing further is converted until this is answered.** The work is safely
paused: everything done so far is verified, committed, and rendering identically.

### Footnote, 2026-08-29 — six Category B values resolved locally

**This does not answer the blocking question and does not change the analysis
above.** Recorded so the counts here are not read as untouched.

While porting Issue Entry's Model Code panel to the UX prototype, six colours in
`apps/portal/src/features/issues/ModelCodeYearPicker.module.css` were found to
have been **snapped to the nearest token** — during this pause, and without being
written down. The snapping was visible: the selected year chip read bluer than
the design. Per Yogesh's ruling they are now reproduced as literals in that one
component: `#F4F7FB`, `#DDE3E9`, `#E1E7EC`, `#EDF0F3`, `#F7F9FB`, `#FBFCFD`.

`#DDE3E9` is one of the four greys already listed in Category B above (~36 uses),
so this resolves a handful of that row's instances in a single file. **The rest of
Category B, the whole of Category A, and the blocking question are exactly as open
as before.**

**Updated later the same day: eight, not six.** A second pass on the same
component's combobox header added `#6B7681` (the "Clear selection" label) and
`#B4BDC5` (both bulk actions when disabled). `#F0F2F5` was also identified as the
prototype's divider colour but is NOT resolved — see the note below.

Both new values reinforce the first observation rather than adding a new one: the
nearest tokens were `--text-secondary` and `--text-disabled` (#9AA5AE), and using
them had made the panel's primary action — "Select all" — render identically to
its secondary one. **Snapping did not merely shift a shade here; it erased a
distinction the design was drawing.** That is a stronger argument than "the greys
look slightly off", and worth weighing when this request is answered.

Counting the other way is equally instructive: in the same component,
`--accent-600`, `--neutral-50`, `--border-subtle` and `--border-default` were each
found to match the prototype EXACTLY and were kept. The system is right more often
than it is wrong here; the problem is that nothing recorded which was which.

### Second update — a full control-by-control sweep, and a third failure mode

An exhaustive style diff of the whole Issue Entry screen (every declaration, every
state) found **27 differences across 11 controls**, of which **15 needed literals**:
seven in the Model Code panel, four in the shared `Combobox`, four in the PATH bar.

That sweep separated the failures into three kinds, and **the third was not visible
before**:

1. **No token exists** — reproduce as a literal. (e.g. `#F4F7FB`, `#8A97A3`.)
2. **A token exists and matches exactly** — keep it. Eleven such cases were found
   and kept across the screen.
3. **THE WRONG TOKEN WAS USED WHERE A RIGHT ONE EXISTED.** Three cases:
   `--text-secondary` (#4A555F) where the design wanted `--text-muted` (#6B7681);
   `--interactive` (#2A6FDB) where it wanted `--kia-midnight`; `--neutral-100`
   (#ECEFF2) where it wanted the design's general selected surface.

**Category 3 is the one that matters for this request**, because it is invisible to
the "353 hard-coded values" framing entirely: nothing is hard-coded, no count moves,
the gate stays green, and the screen is still wrong. Two of the three were in the
shared `Combobox` and so affected every consumer, not one screen.

It also cuts against reading this request as "the system is too small". At least as
often, the right value was already there and the wrong one was reached for. Whatever
answers the blocking question should probably say something about **how a value is
chosen**, not only about which values exist.

Two things worth carrying into whatever answers this request:

- **Snapping is not a neutral default.** It happened silently here and produced
  visible drift. Whichever way the blocking question is answered, "snap to the
  nearest token" needs to be a recorded decision rather than something that
  happens when nobody chooses.
- **One token stood in for several distinct source values.** In that file
  `--border-subtle` had replaced three different prototype greys — and was
  genuinely correct for two of them. Any future bulk conversion has to map per
  element; a find-and-replace would be individually plausible and collectively
  wrong, and no gate in this repo would catch it.

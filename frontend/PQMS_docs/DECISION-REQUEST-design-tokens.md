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
identically. **353 remain, and they cannot be converted, because the design
system has no token holding their value.** The design system is vendored into
this project as a **byte-for-byte copy with an automated drift check**, so adding
a token is not an edit this project is able to make. **Whether these values ever
become tokens is your decision, not ours.**

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

#### A1 · Colour tints — the clearest case, ~15 uses

Every one of these is **an existing design-system colour at 8% opacity**:

| In the code | Base colour | Design-system token for the base |
|---|---|---|
| `#7C5CDB14` | `#7C5CDB` | `--status-review` ✅ exists |
| `#2A6FDB14` | `#2A6FDB` | `--accent-500` ✅ exists |
| `#0E938414` | `#0E9384` | `--status-disposed` ✅ exists |
| `#D92D2014` | `#D92D20` | `--danger-500` ✅ exists |

*(`14` in hex is 20/255 ≈ 8% opacity.)*

**The system owns the hue. It does not own the tint.** These are used for soft
badge and chip backgrounds — a real, repeating UI pattern.

**This is a missing layer, not missing values.** The developer had no token to
reach for, so they wrote the hue and appended an opacity. Every instance is
internally consistent with the design system; the vocabulary simply stops one
level short.

#### A2 · A second border width — 14 uses of `2px`

The system defines `--border-width: 1px`. The interface uses **2px borders in 14
places** — emphasis states, selected rows, active tabs.

For context on why this matters: **`1px` accounted for 41 of the 103 conversions
already completed.** Border width is the single most repeated value in this
codebase, and the system currently expresses exactly one of the two widths in use.

#### A3 · Off-grid spacing — ~14 uses

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

# UI Fidelity Report — app vs UX prototype

**Date:** 2026-08-26 · **Class:** Reference — regenerated, never hand-edited
(31-documentation-standards-and-decision-records.md).

**This document REPLACES the 2026-08-22 report.** That one was regenerated rather
than patched, per 31's rule for the `analysis/` class. Two of its statements were
known to be false and are corrected here rather than amended in place: it said
`.fidelity/` was gitignored (all 91 files were tracked), and it cited an
eight-status canonical set that a 2026-08-23 directive had already replaced with
the prototype's seven.

---

## Method — and how it differs from the previous report

**Every figure below was produced by running a gate, on this machine, on the date
above.** Nothing is carried forward.

| | 2026-08-22 report | This report |
|---|---|---|
| Verdict | **a human comparing images** | **an automated gate with a non-zero exit** |
| Threshold | none — there was no comparison | **zero** |
| App capture | `vite preview` | `vite preview` |
| Prototype capture | *dev server, on other days* | **same context, same run** |
| Browser | unrecorded | **pinned — `playwright@1.62.1` exactly, chromium 1234** |
| Timezone | unrecorded | **pinned `UTC`** |
| Reproducible | **no** | yes — `pnpm run fidelity:baseline` |

The previous harness had four defects, all now repaired: a prototype path
hardcoded to a `D:` drive that exists on no current machine; a browser revision
mismatch; an `APP_URL` of `127.0.0.1` when `vite preview` binds `[::1]` only; and
**no verdict at all** — it wrapped every screen in `try/catch`, printed a failure
mark, and exited 0 regardless.

---

## Verdict — regression gate

**PASS. 10 screens, pixel-identical to the baseline, at threshold zero.**

```
v fidelity: 10 screens, pixel-identical to the baseline.
```

Screens covered: dashboard, issues list, issue workspace (detail, investigation,
resolution, communication, history), create issue, admin, notifications.

**Threshold is zero and must stay zero.** Same-machine, same-browser, back-to-back
capture is **0.0000% different — byte-identical across all nine screens measured**.
There is no noise floor to clear, so any non-zero count is a real change.

**A tolerance was proposed and rejected on evidence.** Perturbing one declaration
— `gap: 10 → 11`, a single pixel — registers **0.0207–0.0819%** of frame, an
**order of magnitude below** the 0.66–2.14% drift seen when comparing across
machines. A tolerance sized to absorb that drift would miss a one-pixel change
entirely.

---

## Measurement — app versus the UX prototype

**Mean 5.31% across four paired screens.** Both halves captured in one browser
context, one viewport (1280×900), one timezone, back to back.

| Screen | Differing px | % of frame |
|---|---:|---:|
| dashboard | 70,536 | 6.12% |
| issues list | 66,147 | 5.74% |
| workspace detail | 52,926 | 4.59% |
| create issue | 54,969 | 4.77% |

**This is a measurement, not a verdict, and it is not a gate.**

**The data-versus-layout split is inferred and unmeasured.** The app renders its
own deterministic seed while the prototype renders its own sample rows — different
issue IDs, titles and dates — so some share of every figure is text differing
pixel-for-pixel while the structure matches. How large that share is has not been
measured, so "4.59% means the workspace is 95% faithful" is **not** a claim these
numbers support.

**Its value is as a before-number.** The seed is frozen, so a value-preserving
change must leave these figures identical. **Across 274 token conversions they
have not moved by a single pixel** — 70536 / 66147 / 52926 / 54969 on every
re-measurement. That is the strongest end-to-end evidence available that the
conversion pipeline preserves rendering, because it compares against an artefact
the conversion cannot touch.

**This number did not exist before 2026-08-26.** The previous harness captured the
prototype from the dev server and the app from `vite preview`, at different
viewports on different days, so the two families were never mutually comparable.

---

## What this report does NOT establish

- **It is not a human design review.** The 2026-08-22 "Aligned" verdict — reached
  by a person comparing screens against the prototype — remains the last
  human-verified fidelity judgement this project has. This gate detects
  *regression from a captured baseline*; it does not judge whether that baseline
  is faithful.
- **The baseline is machine-specific.** It is valid for the environment that
  produced it and no other. Every machine regenerates its own until CI runs in a
  fixed image.
- **It covers ten screens, not every state.** Modals, empty states, error states
  and the 1920-width layout are not captured.

## The archive

`.fidelity/` holds the 91 captures from 2026-08-22. **Nothing reads them.** They
are retained as the artefacts behind the last human-verified verdict, and they
cannot serve as a gate: the parameters that produced them were never recorded —
seven distinct viewports, including two captures of one screen 4px apart, and 53
files matching no committed code path.

The live baseline is **`.pixel-baseline/`**, gitignored and regenerable. See the
README in each directory.

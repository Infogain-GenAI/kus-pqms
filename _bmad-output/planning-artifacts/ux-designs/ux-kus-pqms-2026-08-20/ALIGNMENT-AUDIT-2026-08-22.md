# UX Artifact Alignment Audit — `DESIGN.md` & `EXPERIENCE.md` vs the Claude Design project

**Date:** 2026-08-22
**Auditor:** automated cross-reference
**Ground truth:** `../../ux/design-source/` — the full mirror of the two claude.ai design projects ("Kia N-PQMS V2-V3", "Kia N-PQMS V4-V5"), independently **byte-verified** against the projects (see `design-source/SYNC.md`).

## Method
Every checkable factual claim in `DESIGN.md` and `EXPERIENCE.md` was cross-referenced against the authoritative sources:
- **Tokens** → `design-system/tokens/*.css` + `design-system/_ds_manifest.json`
- **Principles / voice / visual foundations** → `design-system/readme.md`
- **Screens / interaction rules** → `specs/ISM SE Role - Spec.md`
- **Actual runtime truth** → the prototypes: screen inventory (`data-screen-label`), workspace tab set (`tabDefs`/`_tabAlias`), and the `.ism-mono` font resolution — read from the latest V4-V5 `ISM SE+QIR Role` prototype.

## Verdict
**100% aligned on all in-scope, checkable facts.** 7 genuine drifts were found and corrected; 5 apparent "gaps" were verified to be **intentional scope exclusions** (correct, not misalignments).

---

## A. Drifts found and corrected

| # | Artifact | Was | Now / fix | Evidence |
|---|---|---|---|---|
| 1 | DESIGN.md | Mono = `JetBrains Mono` (front-matter + prose) | `"SF Mono", ui-monospace, Menlo, Consolas, monospace` (the `--font-mono` token) | `.ism-mono { font-family: var(--font-mono) }`; no prototype overrides `--font-mono`; "JetBrains Mono" was inherited from inaccurate SE-spec prose that no CSS backs. |
| 2 | DESIGN.md | `rounded.pill: 9999px` (front-matter + prose) | `999px` | `--radius-pill: 999px` in `elevation.css`. |
| 3 | EXPERIENCE.md | Parts request lives under **Investigation** (pattern table + Flow 2) | under **Resolution** | prototype `_tabAlias` maps `parts → resolution` (also `disposition`, `qir` → resolution). |
| 4 | EXPERIENCE.md | Workspace tab "Detail" | "Issue Detail" | `tabDefs[0] = {k:'overview', l:'Issue Detail'}`. |
| 5 | DESIGN.md | Components list omitted `Logo`/`Avatar`/`Badge`/`Tag`/`IconButton` | added a "Core primitives" bullet | all five are in `_ds_manifest.json`. |
| 6 | EXPERIENCE.md | Dashboard surface unlabeled | annotated **Dashboard (SE Overview)** | latest prototypes label the screen `SE Overview`. |
| 7 | DESIGN.md | Radius `[ASSUMPTION]` note covered only cards | extended to inputs/buttons (~8–9px prototype vs `md` 6px token) | prototype input/button radius; keeps "tokens canonical" stance explicit for all radii. |

## B. Verified aligned — no change needed
- **Colours:** every brand / neutral / accent / status / feedback / semantic-alias hex in DESIGN.md front-matter matches `colors.css` exactly (~60 values).
- **Typography:** full scale Display→Label (family / size / weight / line-height / tracking) matches `typography.css` exactly.
- **Spacing & layout:** 4px scale + sidenav 260/64, header 60, rows 40/48, containers 1280/1600 — exact.
- **Elevation:** `shadow-xs/sm/md/lg`, focus ring `0 0 0 3px rgba(42,111,219,.30)`, scrim `rgba(5,20,31,0.5)` — exact.
- **Shapes:** `sm 4 / md 6 / lg 8 / xl 12 / full 50%` — exact (pill corrected).
- **Status system:** the 8 canonical status names + hues + the Draft→…→Closed/Escalated lifecycle — exact across DESIGN.md, EXPERIENCE.md, readme, and tokens.
- **Source channels:** the 7 channel → Lucide icon mappings match `specs/` exactly.
- **Screen inventory & workspace tabs:** EXPERIENCE.md's surfaces and the 5 base workspace tabs (Issue Detail · Investigation · Resolution · Communication · History) match the prototype `data-screen-label`s and `tabDefs`.
- **Behavioural rules** (reason gates, parts approval 24h/manager, doc upload 25 MB×10 + virus scan, auto-save Draft, correlation-on-Symptom, classification cascade, @mention, immutable comms, default sort Date-Reported-desc) — consistent with `specs/` + PRD addendum.

## C. Confirmed-intentional scope exclusions (correct — NOT misalignments)
The design projects contain more than the ISM rebuild's scope. The artifacts correctly exclude the following, per the standing scope decisions:
- **QIR module screens** (QIR List / Register QIR / QIR Workspace / QIR Analytics) — kept only as the issue → QIR **hand-off**; the module itself is out of scope.
- **TSB Management** surface — out of scope (present in the design as a placeholder screen).
- **`SeverityIndicator` / `SeverityBar` + issue scoring / score-driven severity / severity KPIs / score-driven default sort** — reference-only; DESIGN.md and EXPERIENCE.md both explicitly bar building them.
- **Workspace "Sharing" tab** (`tabDefs` appends it for `ASM`/`PQM` only) — omitted per the recorded out-of-scope decision.
- **Prototype-vs-token divergences** (app bg `#F6F8FA` vs `#FAFBFC`; text `#1A2430` vs `#1A1A1A`; softer prototype radii) — DESIGN.md flags each with an `[ASSUMPTION]` note and takes the **design-system tokens as canonical** ("tokens are the contract"), which is the correct, transparent resolution.

## Notes
- The mirrored `specs/ISM SE Role - Spec.md` still contains the "JetBrains Mono" phrasing; it was left unedited to keep the mirror faithful to the source export. The drift is corrected in the derived `DESIGN.md`, which is the canonical spine.
- No changes were made to the `design-source/` mirror during this audit (read-only reference).

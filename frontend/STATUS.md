# Frontend status — 2026-08-26

**One page, for someone who has not followed any of this.**

The N-PQMS ISM frontend is a React port of an HTML UX prototype. It is being
restructured onto a standards corpus and converted from hard-coded values to
design-system tokens. This is where that stands.

---

## Where the work is

### Done

| | |
|---|---|
| **Workspace split** | one flat `src/` → three packages: `apps/portal`, `packages/ui-library`, `packages/design-tokens` |
| **Enforcement gates** | eight, all machine-managed; see below |
| **Fidelity harness** | repaired and gating at threshold zero |
| **Test framework** | Vitest + RTL, 47 tests, coverage ratchet |

### In progress and blocked

**Token conversion — 274 of ~815 values converted (34%).**

| Family | Start | Now |
|---|---:|---:|
| String values (px, hex, shorthands) | 467 | **333** |
| Numeric dimensions | 348 | **207** |

**Every batch was pixel-identical**, and the app-versus-prototype difference was
**unchanged to the digit across all 274** — 70536 / 66147 / 52926 / 54969 on
every re-measurement. That is the strongest evidence available that the pipeline
preserves rendering, because it compares against an artefact the conversion
cannot touch.

**The remainder is blocked and the blocker is external.** ~353 values have no
matching design-system token. The design system is vendored as a byte-for-byte
copy with a drift check, **so adding a token is not an edit this project can
make.**

---

## What is blocked, on whom, since when

| Blocked | On | Since | Document |
|---|---|---|---|
| **~353 token conversions** | **designer + architect** | 2026-08-26 | `PQMS_docs/DECISION-REQUEST-design-tokens.md` |
| **4 application defects** | **architect + domain owner** | 2026-08-26 | `PQMS_docs/APPLICATION-DEFECTS.md` |

**The token decision has one question under it that everything else depends on:
does a channel to change the design system exist at all?** Nobody inside the
project could determine this. If it exists, ~67 values are a well-evidenced
upstream request. If not, the choice is a local `--proto-*` layer or accepting
that the count stops at ~353 permanently.

**The defect triage has one item that is unambiguous and actionable now** —
dates shift by a day depending on the viewer's timezone. The other three are
domain questions where writing code before deciding would be the wrong move.

---

## The gates, and that each was proven to FAIL

Eight automated gates. **Every one has been broken deliberately and confirmed to
fail** — not merely observed to pass. A gate that has only ever passed is
indistinguishable from a gate that does not run, and this project hit that exact
problem twice before adopting the rule.

| Gate | Checks | Proven to fail by |
|---|---|---|
| `typecheck` | TypeScript across 3 packages | a deliberate `TS2322` |
| `lint:ds:values` | raw px/hex, ceiling **333** | forcing the ceiling below the count |
| `lint:ds:numeric` | numeric dimensions, ceiling **207** | same |
| `lint:ds:imports` | restricted imports, ceiling **0** | a positive control, below |
| `lint:ds:selftest` | **that the import rule still matches anything** | feeding it 3 violating shapes |
| `tokens:check` / `tokens:drift` | vendored CSS and generated map vs the manifest | tampering with one manifest value |
| `lint:css-vars` | every `var(--x)` resolves | injecting `var(--space-41)` |
| `fidelity:check` | **10 screens, pixel-exact** | a one-pixel `gap` change |
| `coverage:gate` | coverage ratchet | raising the floor above the actual |

**Two of these exist because a count cannot detect its own death.** The import
rule reports `0` when clean *and* `0` when its patterns match nothing — identical
from outside. `lint:ds:selftest` feeds it deliberate violations and fails if they
go unreported. The same idea guards the lint globs.

**Ceilings are machine-written.** A count that falls rewrites the file
automatically; a count that rises fails. Lowering is free, raising is a tracked
edit with a name on it. The same mechanism now governs coverage.

---

## What is NOT done

| | |
|---|---|
| **No CI** | none, anywhere in the repository. Every gate above runs on a developer's machine and in local hooks — nothing enforces them on a push or a merge |
| **No route guards** | `/admin` renders for any role if the URL is typed. Harmless today because there is no authentication at all; a prerequisite of the auth work |
| **The component library is untested** | 47 tests cover the data layer (76.83% statements). The 30 components in `packages/ui-library` and the 11 screens have **no tests at all** |
| **`config/` extraction outstanding** | ~12 config-shaped constants still inline in two screens. Unblocked, deliberately deferred behind tests |
| **No backend** | zero fetch, zero auth, zero storage. All data is an in-memory seed |

**The coverage figure is a data-layer figure, not a project figure.** It measures
`apps/portal/src/data/**` and nothing else — 41 component files are outside the
denominator. Widening that scope will drop the percentage sharply and fail the
gate; that is expected, and the floor is re-seeded in the same change.

---

## The one-line summary

**A third of the token conversion is done and provably safe; the rest needs a
decision nobody here can make. The gates are real and have been proven to fail.
The largest remaining risks are that nothing runs in CI, and that everything
outside the data layer is untested.**

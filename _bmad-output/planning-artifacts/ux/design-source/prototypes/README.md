# Prototypes — curated canonical set

The **single authoritative, current prototype per role**, de-duplicated from the raw exports so downstream work references the right file and never an old copy or backup by mistake. Every file here is a **byte-identical copy** (SHA-256 verified) of the source noted below; the complete raw project trees — including every backup and iteration — live under [`../exports/`](../exports/).

> These are Claude-Design **source-format** `.dc.html` files (`<x-dc>` templates + `support.js` runtime + `_ds_bundle.js`). They are the accurate *source*, but are **not click-runnable in isolation** — they resolve `_ds/<ns>/…`, `support.js`, `lucide-local.js` relative to their original export folder. To **run** a screen, open the copy inside `../exports/<project>/` (its `_ds/` sibling is present), or use the fully self-contained bundles in [`../exports/pqms-bundled-page-2026-08-16/`](../exports/pqms-bundled-page-2026-08-16/) (`PQMS_SE.html` / `PQMS_SEM.html`).

## Authoritative set

| File | Role / view | Source (in `../exports/`) | Notes |
|---|---|---|---|
| `ISM SE Role (ISM-only, V2-V3).dc.html` | **Service Engineer — ISM only** | `kia-npqms-v2-v3/ISM SE Role.dc.html` | The on-scope SE reference — ISM workflow **without** QIR. |
| `ISM SE+QIR Role (latest, V4-V5).dc.html` | **Service Engineer — latest** | `kia-npqms-v4-v5/ISM + QIR SE Role - P:C.dc.html` | Newest SE visual iteration; **bundles QIR (out of scope — reference only)**. `P:C`→`P-C` (Windows). |
| `ISM SEM Role (manager, V4-V5).dc.html` | **Manager (SEM ≈ canonical ASM)** | `kia-npqms-v4-v5/ISM SEM Role - P:C.dc.html` | Newest manager/approver view (prototype-to-code). `P:C`→`P-C`. |
| `Admin Module (V4-V5).dc.html` | **Administration** | `kia-npqms-v4-v5/Admin Module Prototype.dc.html` | V4-V5 revision (byte-different from — newer than — the V2-V3 Admin). |
| `SingleDatePicker (V4-V5).dc.html` | **Component** | `kia-npqms-v4-v5/SingleDatePicker.dc.html` | Standalone Kia-DS date-picker design component. |

Role vocabulary: **SE** = Service Engineer · **SEM** (design term) ≈ **ASM** After-Sales Manager (canonical) · **PQM** Product Quality Manager · **Administrator**. See `../design-system/readme.md` and `../specs/`.

## Excluded from this curated set
- **Pruned 2026-08-22** (Tier-1 cleanup — removed from `../exports/` as well; still recoverable from the G: source ZIPs and the claude.ai projects): the backup & "Old copy" prototypes (`ISM SE Role backup 1/2`, `ISM SEM Role backup 1`, `ISM + QIR SE Role backup 3`, `ISM SE Role Old copy V3`, `ISM QE Role Old copy V2`); the `ISM-print-1rndkgq` and `Context Slide` utility pages; and the redundant `ISM-QIR-SE-Role-PC-standalone.html` (self-contained SE+QIR — covered by `../exports/pqms-bundled-page-2026-08-16/`).
- **Still under `../exports/`** (superseded, kept for provenance): `ISM ASM Role.dc.html` (both projects; earlier manager view, replaced here by the V4-V5 SEM P-C) and the older V2-V3 `Admin Module Prototype.dc.html`.

## Scope reminder
**Issue scoring / score-driven severity, QIR, TSB, and EWS/GQIS bulk ingestion are OUT OF SCOPE** for the ISM rebuild. They appear in these prototypes (severity chips, the `ISM SE+QIR` screens, TSB placeholder) as **reference only** — do not build them this release.

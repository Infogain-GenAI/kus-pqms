# Design Sync — Kia N-PQMS design projects → repo

| Field | Value |
|---|---|
| **Source projects** | "Kia N-PQMS V2-V3" (`609c1fe2-ff8d-4456-9ce2-b0f8510a1938`) · "Kia N-PQMS V4-V5" (`6a717b29-4059-4d43-b115-34f7a7936c8e`) — both owned by *Arpita*; shared design-system namespace `kia-n-pqms-e334a01f-8f6a-40ca-aebc-3bc381058422` |
| **Direction** | Pull (remote → local), read-only reference |
| **Status** | ✅ **Complete full mirror** — text **and** binaries (fonts, full untruncated prototypes, screenshots, uploads, compiled bundle) |
| **Placed on** | 2026-08-20 (initial API pull) · 2026-08-22 (refresh) · **2026-08-22 (full manual export)** |
| **Local root** | `_bmad-output/planning-artifacts/ux/design-source/` |

> The earlier API-only sync could not retrieve binaries (fonts, screenshots) and truncated any file >256 KiB. Those gaps are now **closed**: the two projects were exported in full from claude.ai (⋯ → Export/Download) and the archives extracted verbatim under `exports/`.

## Layout

```
design-source/
├─ design-system/     Curated canonical design system (the theming contract)
│    tokens/*.css · styles.css · readme.md   (text, carries our rebuild scope-notes)
│    _ds_bundle.js · _ds_manifest.json        (compiled component bundle + inventory)
│    assets/fonts/KiaSignatureFix-{Light,Regular,Bold}.ttf   ← fonts.css now resolves
├─ specs/            Curated ISM SE Role Spec + KIA N-PQMS V2 BRD (with our out-of-scope notes)
├─ prototypes/       Curated canonical prototypes — ONE authoritative .dc.html per role + README map
│    ISM SE Role (ISM-only, V2-V3) · ISM SE+QIR Role (latest, V4-V5) · ISM SEM Role (manager, V4-V5)
│    · Admin Module (V4-V5) · SingleDatePicker (V4-V5)   (each byte-identical to its exports/ source)
├─ exports/          RAW exports (Tier-1 exact-duplicates & backups pruned 2026-08-22 — see History)
│    ├─ kia-npqms-v2-v3/                 172 files · 23.3 MB  (source: Kia N-PQMS V2-V3.zip)
│    ├─ kia-npqms-v4-v5/                 554 files · 37.4 MB  (source: Kia N-PQMS V4-V5.zip)
│    └─ pqms-bundled-page-2026-08-16/      2 files · 12.1 MB  (source: PQMS.zip — self-contained runtime bundles)
├─ notes/            Annotations (V4-V5 standalone-export prompt, wrapped from CLAUDE.md)
└─ SYNC.md           This file
```
**Total: 750 files · ~86 MB.**

Each `exports/kia-npqms-*/` is the untouched project tree: `_ds/<ns>/` (tokens, styles, `_ds_bundle.js`, `_ds_manifest.json`, `assets/fonts/*.ttf`), full `.dc.html` prototypes, `ISM SE Role - Spec.md`, `KIA N-PQMS V2 - ISM SE Role BRD.md`, `support.js` (+ `lucide-local.js`, `CLAUDE.md`, `exports/` on V4-V5), plus `screenshots/` (132 V2-V3 · 502 V4-V5 = **634**) and `uploads/` (source PDFs / DRD / TSB BRD / pasted images).

### Curated vs raw — which to use
- **The accurate reference to work from** → the curated set: `design-system/` + `specs/` + `prototypes/` (clean, annotated, **de-duplicated**). `prototypes/README.md` maps each role to its one authoritative `.dc.html` and lists what was excluded (backups, old copies, superseded iterations) so you never cite the wrong file.
- **Raw provenance — screenshots, source docs, per-role prototypes, self-contained runnables** → `exports/`. *(Tier-1 exact-duplicate & backup files were pruned 2026-08-22; the originals remain in the G: source ZIPs and the claude.ai projects.)*

> Why a curated `prototypes/` on top of `exports/`: the raw exports carry multiple versions of each screen (`… backup 1/2`, `… Old copy V3`, print/context pages, and cross-project revisions that are **byte-different** — e.g. V4-V5's `Admin`/`ASM` are newer than V2-V3's). The curated set resolves that ambiguity to a single verified-authoritative file per role.

## Provenance (originals live on the shared drive; `*.zip` is `.gitignore`d, not copied in)
- `G:\Shared drives\PQMS Artifacts\Project Planning and Delivery\N-PQMS-2.0-Project-Planning\ui-ux-designs\Kia N-PQMS V2-V3.zip` (16.8 MB)
- `G:\Shared drives\PQMS Artifacts\Project Planning and Delivery\N-PQMS-2.0-Project-Planning\ui-ux-designs\Kia N-PQMS V4-V5.zip` (33.8 MB)
- `G:\...\ui-ux-designs\PQMS.zip` (7.1 MB, 2026-08-16) → the two self-contained "Bundled Page" runtimes now in `exports/pqms-bundled-page-2026-08-16/`

### Windows filename note
Two V4-V5 entries contained a `:` (illegal in Windows filenames) and were extracted with `:` → `-`; **contents unchanged**:
- `ISM + QIR SE Role - P:C.dc.html` → `ISM + QIR SE Role - P-C.dc.html`
- `ISM SEM Role - P:C.dc.html` → `ISM SEM Role - P-C.dc.html`

## Verification — the prior API sync was byte-accurate (2026-08-22)
Diffed every previously API-synced text file against the authoritative export copies:

| File(s) | Result |
|---|---|
| 5 token files + `styles.css` | **byte-identical** |
| `KIA N-PQMS V2 - ISM SE Role BRD.md` | **byte-identical** (58,282 B) |
| `SingleDatePicker.dc.html` | **byte-identical** |
| `readme.md`, `ISM SE Role - Spec.md` | identical **except our own appended out-of-scope notes** (intentional) |
| V2-V3 `_ds` vs V4-V5 `_ds` | **identical** (shared `e334a01f…` namespace) |

⇒ the API sync was faithful; **no text resync was required**. The full export only *added* the binaries the API could not stream.

## Scope reminder (unchanged)
Per the product brief / PRD, **issue scoring & score-driven severity, QIR, TSB, and EWS/GQIS bulk ingestion are OUT OF SCOPE** for the ISM rebuild. They appear throughout these exports (`SeverityIndicator`/`SeverityBar`, "Severity 8.4", QIR screens, `ISM + QIR …` prototypes, TSB placeholder) as **reference only** — do not build them this release. Canonical status vocabulary and lifecycle are as documented in `design-system/readme.md` and `specs/`.

## History
- **2026-08-20** — Initial pull via the Claude Design read API: V2-V3 design-system tokens/styles + specs; V4-V5 additions. Prototypes were capped at 256 KiB (`.PARTIAL` stubs); screenshots + fonts could not be retrieved (binary).
- **2026-08-22 (refresh)** — Re-verified design-system + specs unchanged upstream; captured the new `SingleDatePicker` component and V4-V5 `CLAUDE.md`.
- **2026-08-22 (full export)** — Manual claude.ai exports of both projects placed verbatim under `exports/`; fonts + full untruncated prototypes + screenshots + uploads + compiled bundle now present; curated `design-system/` completed with fonts/bundle/manifest; the truncated `.PARTIAL-256KiB` stubs and the standalone `SingleDatePicker` copy were retired (superseded by full copies in `exports/`); the older self-contained bundles were consolidated from `prototypes/pqms-full-export/` into `exports/pqms-bundled-page-2026-08-16/`. Finally, a **curated canonical `prototypes/`** was rebuilt (5 authoritative `.dc.html`, one per role, SHA-256-verified byte-identical to their `exports/` source) so the accurate current design is referenced without wading through backups/iterations — the raw versions remain in `exports/`.
- **2026-08-22 (Tier-1 prune)** — removed 23 superseded/duplicate files (~16 MB): backup & "Old copy" prototypes, the `ISM-print` / `Context Slide` utility pages, the redundant `ISM-QIR-SE-Role-PC-standalone.html` (covered by `pqms-bundled-page`), and byte-identical `uploads/` duplicates (kept one hash-verified canonical of each: `N-PQMS_ISM_DRD_v1.0.md`, `N-PQMS_TSB_BRD_v1.0.md`, `N-PQMS_Phase1_BRD_v1.2 (By Customer) (1).pdf`, `2026-06-04-infogain-pilot-guide.md`). Nothing unique was lost — every original also remains in the G: source ZIPs and the claude.ai projects. Tree: 773→750 files, ~102→~86 MB. (Tiers 2–3 — cross-copy font/`_ds`/uploads duplication, ~634 screenshots, build artifacts — were left in place as full provenance.)

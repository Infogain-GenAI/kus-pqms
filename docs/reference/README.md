# Reference inputs — N-PQMS ISM (greenfield rebuild)

Source documents brought into the repo as BMAD **`project_knowledge`** (`_bmad/bmm/config.yaml` → `project_knowledge = {project-root}/docs`). These are **reference inputs**, not generated artifacts — they feed the deferred **architecture** work (see `_bmad-output/planning-artifacts/prds/prd-kus-pqms-2026-08-20/addendum.md`, which extracts the technical-how from these for architecture to consume).

## Files

| File | Size | Copied | Source (Google Shared Drive) |
|---|---|---|---|
| `NPQMS-ISM-BRD-v1.5.md` | 85,417 B | 2026-08-22 | `G:\Shared drives\PQMS Artifacts\Project Planning and Delivery\N-PQMS-2.0-Project-Planning\BRD\NPQMS-ISM-BRD-v1.5.md` |
| `NPQMS-ISM-HLD-v1.5.md` | 416,117 B | 2026-08-22 | `…\N-PQMS-2.0-Project-Planning\HLD\NPQMS-ISM-HLD-v1.5.md` (§1 architecture · §2 ISM functional design · §3 data model) |

## How to use these

- **Reference-only** — never copy their prose verbatim into generated BMAD artifacts (brief/PRD/UX/architecture). Re-derive on the new tech stack.
- **On conflict, the design prototype is canonical** over the BRD (role names, lifecycle, module naming). See the reconciliation ledger in the PRD addendum §1.
- The larger `NPQMS-ISM-customized-BRD.md` variant that sits next to the BRD on the shared drive is **intentionally excluded** (per standing project decision); `v1.5` is the maintained reference.

## Related

- UI/UX prototype (full, untruncated SE + SEM bundles): `../../_bmad-output/planning-artifacts/ux/design-source/prototypes/pqms-full-export/`
- Design-system tokens/specs + sync notes: `../../_bmad-output/planning-artifacts/ux/design-source/` (see `SYNC.md`)

# `.fidelity/` — historical archive. NOT the live gate.

**These 91 captures are history, not a baseline.** Nothing reads this directory.

They are the **2026-08-22 fidelity captures** — the artefacts behind
`FIDELITY-REPORT.md`'s "Aligned" verdict, which remains **the last
human-verified fidelity check this project has**. That is why they are kept.

**They cannot serve as a gate**, and the reason is not that they are stale:
**the parameters that produced them were never recorded, so they can be neither
reproduced nor trusted.** Seven distinct viewports across 91 files — including
`1600x2926` and `1600x2922`, the same screen 4px apart — and 53 `dev-*`/`dc-*`
files matching no committed code path. No record of browser revision, timezone,
font state or app commit for any of them.

## The live gate is `../.pixel-baseline/`

| | `.fidelity/` | `.pixel-baseline/` |
|---|---|---|
| Role | 2026-08-22 archive | live baseline |
| Read by | nothing | `scripts/fidelity-gate.mjs` |
| Tracked | yes | no — gitignored, per-machine |
| Reproducible | no | yes, `pnpm run fidelity:baseline` |

**Do not write here.** A `--write` once overwrote seven of these tracked images
because the screen names collided; that is why the two directories are separate.

Status and the open decision on this directory's fate:
`PQMS_docs/standards/18-project-context-and-implementation-status.md`.

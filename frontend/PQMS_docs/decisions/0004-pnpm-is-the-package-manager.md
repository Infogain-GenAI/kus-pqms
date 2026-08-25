# ADR 0004 — pnpm is the package manager

- **Status:** Accepted, 2026-08-25
- **Deciders:** Prisilla Ghadi
- **Related:** `../standards/00-core-rules.md` (the `[PLACEHOLDER — the frontend
  package manager]` this closes), `../standards/14-code-style-and-linting.md`
  ("pnpm 11 moved the configuration file"),
  `0001-frontend-is-always-a-pnpm-workspace.md`,
  `../steps-for-new-repo.md` decision 6 and Step 5.2,
  `../../RESTRUCTURE-BASELINE.md`

---

## Context

`00-core-rules.md` carried this as an open placeholder:

> **[PLACEHOLDER — the frontend package manager.** `frontend/` contains a
> `package-lock.json` (npm) while pnpm is intended. **Two lockfiles in one
> project is not a preference, it is a hazard** — the two resolve different
> trees and CI will install whichever its command picks. **Trigger:** before the
> gates SPEC. **Owner:** Frontend Lead.]

The observed state was one lockfile, not two: `package-lock.json` committed
(181 KB), no `pnpm-lock.yaml`, no `packageManager` field, no `engines`, no
`.nvmrc`. So the hazard was **latent rather than active** — but nothing resolved
it either, because there is no CI and every hook that could have expressed a
preference was a stub.

ADR 0001 already decided that `frontend/` is a pnpm *workspace*, which presumes
pnpm without stating it. This ADR states it.

**The hazard stopped being theoretical during Phase 0.** A single
`pnpm docs:standards:check`, run to answer a read-only question, **never executed
the script**. pnpm's auto-install preflight ran first: it adopted the
npm-installed `node_modules`, moved 12 packages to `node_modules/.ignored`, wrote
`pnpm-lock.yaml` and `pnpm-workspace.yaml`, **re-resolved every `^` range**, and
then aborted on `ERR_PNPM_IGNORED_BUILDS`. Recovering it took deleting both new
files, `rm -rf node_modules`, and `npm ci`.

That is the placeholder's own warning arriving in a form it did not predict: not
"CI installs the wrong tree", but **"one command run by one person silently
re-resolves the tree"** — and every measurement taken afterwards would have come
from a different dependency graph, which is also a fidelity risk because the
screenshot captures are Step 6's acceptance test.

## Decision

**pnpm is the package manager. `package-lock.json` is deleted.**

The migration used **`pnpm import`, not `pnpm install`**:

- `pnpm import` reads `package-lock.json` and writes `pnpm-lock.yaml`
  **preserving every pinned resolution**.
- `pnpm install` re-resolves every `^` and `~` range against the registry and
  silently produces a newer tree.

**Verified zero drift**: 336 `name@version` pairs from `package-lock.json`, 336
from `pnpm-lock.yaml`, sets identical after normalising pnpm's peer-context
suffixes (`pkg@1.0.0(peer@2.0.0)`) and npm's nested paths
(`a/node_modules/b@1.0.0`).

Settings live in **`pnpm-workspace.yaml`, not `.npmrc`**, per `14`: pnpm 11 no
longer reads non-auth settings from `.npmrc`, so a setting written there fails
silently and looks identical to one that works.

| Setting | Value | Why |
|---|---|---|
| `allowBuilds.esbuild` | `true` | esbuild's postinstall fetches its platform binary; **`vite build` fails without it**. A build prerequisite, not hardening |
| `engineStrict` | `true` | `engines` enforced at install rather than documented and ignored |
| `packages` | `['.']` | the three workspace packages arrive in Step 6 |

`engines.node` is **`^20.9.0 || >=21.1.0`** — derived, not chosen: the
intersection of `playwright`'s `>=20` and eslint's
`^18.18.0 || ^20.9.0 || >=21.1.0`. `packageManager` pins `pnpm@11.1.3`.

**`14` says to verify the engine setting takes effect rather than assume it, and
it was verified**: with `engines.node` forced to `>=99.0.0`,
`pnpm install --frozen-lockfile` exits 1 with *"Your Node version is
incompatible"*.

## Consequences

### The npm allow-scripts gap closes as a side effect

`npm ci` was skipping esbuild's postinstall under its own allow-scripts policy
and printing a warning nobody had actioned. `RESTRUCTURE-BASELINE.md` recorded it
as an **unverified clean-clone risk** — the build worked only because the binary
happened to be present already. With `allowBuilds.esbuild: true` the answer is
written down and the postinstall runs (`esbuild postinstall: Done`).

### The runbook needs a warning it did not have

Recorded in `steps-for-new-repo.md` Step 1: **never run a package-manager script
before the package manager is settled.** `node scripts/x.mjs`, not `pnpm run x`.
The window closes here.

### It does not make the tree reproducible on its own

`engines` is a floor, not a pin, and there is still **no `.nvmrc`**. Node
24.19.0 is what these numbers were produced on. `15-devsecops-and-ci-cd.md`
requires an exact `major.minor.patch` pin in `.nvmrc` and CI reading the version
from it — **and there is no CI**, so that half is unbuilt.

### `pnpm run` is now safe, and was not before

Every measurement in `RESTRUCTURE-BASELINE.md` was taken with `node`/`npx`
directly, precisely because the preflight hazard was live. From this ADR forward
`pnpm run` is the normal way to invoke a script here.

## Options rejected

**Stay on npm.** Genuinely defensible: it worked, the lockfile was committed, and
`npm ci` is reproducible. Rejected because ADR 0001 already commits to a pnpm
*workspace* — npm workspaces would be a different mechanism with different
hoisting — and because leaving pnpm intended-but-not-adopted is what created the
preflight trap. **A stated intention that the tooling does not implement is worse
than either choice made properly.**

**Migrate with `pnpm install` and accept a re-resolved tree.** Rejected. It
re-resolves every range, and the screenshot captures that are Step 6's acceptance
test would then be compared across two different dependency graphs — a
difference nobody could attribute afterwards. `pnpm import` costs one command and
removes the question.

**Keep both lockfiles during a transition.** Rejected, and it is the option the
placeholder names explicitly: *"two lockfiles in one project is not a preference,
it is a hazard"*.

**Put `engine-strict` in `.npmrc`.** Rejected — pnpm 11 does not read it there.
This is the failure mode `14` calls out: the setting looks correct, is ignored,
and is indistinguishable from one that works.

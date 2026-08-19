# kus-pqms

N-PQMS (Product Quality Management System) is Kia's enterprise product-quality management platform. This mono repository holds its frontend portal, backend application, QA automation test, infrastructure and the requirements/architecture/planning documentation that drives them.

## Getting started

Run this once per clone, before your first commit:

```bash
sh scripts/setup.sh
```

It sets `core.hooksPath` so the Git hooks activate. **That setting lives in `.git/config` and never travels with a clone** — until you run it, no hooks fire at all, silently, and your commits are not validated.

Hooks are fast local feedback, not enforcement: `git commit --no-verify` bypasses them and commits made in the GitHub web UI never run them. CI is the real gate.

## Commit messages

```
<type>(<optional-scope>): <subject>
```

Types: `feat` `fix` `refactor` `perf` `test` `docs` `build` `ci` `chore` `revert`.
Example: `feat(issue-service): add bulk update endpoint`

Keep each commit to a single component where you can — a commit spanning folders must satisfy every affected folder's rules.

## Repository layout

```
kus-pqms/
├── .githooks/          shared hook routers (do not edit)
├── automation/
├── backend/
├── frontend/
└── infrastructure/
```

**Each folder owns its own Git rules.** Your component's checks live in `<folder>/scripts/pre-commit.sh` and `pre-push.sh`, its commit convention in `<folder>/commit-msg.rules`, and its ignore rules in `<folder>/.gitignore`. Edit those freely — nothing you change there can affect another component. The routers in `.githooks/` run only the folders your commit actually touches.

Those check scripts are currently no-op placeholders. Each team fills in its own linting, formatting and tests once its tooling is chosen; see [docs/gitmodule-seperation.md](docs/gitmodule-seperation.md).

This is a single monorepo — all components live here directly, with no Git submodules, so a plain clone is all that is required:

```bash
git clone https://github.com/Infogain-GenAI/kus-pqms.git
```

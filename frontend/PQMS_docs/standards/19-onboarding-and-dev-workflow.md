# 19 — Onboarding and Dev Workflow
**Tier:** 2
**Status:** SKELETON — the sections and the capture rule are live; the content is written by whoever first runs the setup
**Purpose:** Local setup, editor config, debugging, troubleshooting/FAQ
**Supersedes / absorbs:** draft §13-15
---

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Why this file is a skeleton rather than a draft
**The content cannot be written from theory and it is not being
attempted.** An onboarding document exists to capture the specific
errors, undocumented assumptions and rough edges a setup actually
produces, and none of those are knowable before someone has done it.
Writing them in advance produces a document that describes an imagined
setup and is wrong in exactly the places a reader needs it.

**What changed from the previous revision**, which was marked
`EMPTY — pending draft` and carried two paragraphs: the *shape* is now
fixed and the *capture rule* is stated, so the first person through does
not also have to design the document. Filling it is transcription, not
authorship.

## The capture rule
**Write it down at the moment it costs you, not afterwards.**

Onboarding friction is invisible in retrospect — once you know the dev
server needs a `.env` file, you stop noticing that nothing told you. So
the rule is temporal, not editorial: the entry goes in **while you are
stuck**, in whatever words you would have wanted to read ten minutes
earlier.

Three consequences:

- **A rough entry beats no entry.** Grammar is cheap to fix later; the
  memory of what confused you is not recoverable.
- **An entry that turns out to be wrong is still useful**, because it
  records what a reasonable person assumed. Correct it in place and keep
  the correction visible.
- **Nobody is assigned to "write onboarding".** Whoever hits the friction
  writes the entry. A document owned by everyone who was ever confused is
  the only kind that stays current.

## Sections to fill

### 1. Prerequisites
Node and pnpm versions and where they come from (`.nvmrc`,
`packageManager`), and anything else that must exist before `install`
succeeds. **State the version-manager command that actually worked**, not
the general instruction.

### 2. First run, exactly
The command sequence from clone to a page rendering in a browser. Every
step, including the ones that feel too obvious to write — those are the
ones that break.

**One entry is already known and belongs here on day one.** A fresh clone
with no `.env` gets **real mode**, therefore real authentication,
therefore — with no reachable identity tenant — **nothing renders**. That
is deliberate: 05-api-integration-and-data-fetching.md's fixtures
predicate fails closed, because the same flag also gates an
authentication bypass, and an auth bypass must never be what you get by
forgetting to set a variable. The consequence is that
`VITE_USE_FIXTURES=true` is the first thing a new developer needs and the
first thing nothing tells them. Copy `.env.example` and say so here.

### 3. Fixtures mode
What it is, what it changes, what it does not. 05 owns the data half and
08-authentication-and-authorization.md the identity half; this section is
the practical version — which flag, which file, what you see when it is
on, and how to change who you are signed in as once you are
(`switchRole()`, per 04-state-management.md, which is the **only**
identity mechanism available locally).

### 4. Editor configuration
Extensions, settings, and the one that is not optional: **the IDE's
TypeScript service is not the authority — `pnpm typecheck` is.** Whatever
this repository's IDE type errors turn out to be, CI decides.

### 5. The commands you actually use
A short list, not a duplicate of 20-glossary-and-appendix.md's Commands
Reference. Which three or four get run twenty times a day, and what each
is for.

### 6. Debugging
How to attach a debugger, where the source maps are, how to see what the
HTTP client is actually sending (the `X-Correlation-ID` from 05's request
interceptor is the thread to pull, and
21-logging-formatting-and-client-diagnostics.md attaches the same value
to every log line raised while that request is in flight), and how to
read a failing test's output.

### 7. Troubleshooting / FAQ
**The section that justifies the file.** One entry per real failure, in
this shape:

| Symptom | Cause | Fix |
|---|---|---|

Write the symptom **as it appears** — the actual error text — not as a
description of it. Somebody will search for the error text.

### 8. Getting unstuck
Who to ask, and what to have ready before asking.

## What does not go here
- **Rules.** A rule belongs in the tier file that owns it. This file
  points at rules; it never states them.
- **Architecture.** 01-project-structure-and-architecture.md and
  07-routing-and-layouts.md own it.
- **Anything a script could do instead.** If a setup step can be
  automated, automate it and delete the entry. A troubleshooting entry
  that survives three developers is a defect report about the setup, not
  documentation.

## Trigger
**Fill sections 1–3 the first time anyone runs the setup.** For a
restructure that is Phase 0.2 of
30-restructuring-an-existing-react-project.md, which already requires a
green build from a clean clone — so the friction is being produced
anyway and only needs recording. Sections 4–8 accumulate.

## Two entries that are already known, beyond the one above

### The fixtures default is the *opposite* of the prior repository's
Section 2 records that a fresh clone with no `.env` renders nothing. There is a
second half to that entry, and it is the half that makes it recognisable:

**In the prior repository, fixtures were ON by default** — only the literal
string `"false"` opted out, so a missing variable fell back to the safe path and
the app just worked. **Here the predicate fails closed**, because the same flag
also gates an authentication bypass.

So the symptom for anyone arriving from that codebase is not "the app needs
configuration". It is **"this used to just work and now it is broken."** Write
the entry that way — 05-api-integration-and-data-fetching.md explains why the
direction is deliberate and is not changing.

### The editor must use the workspace TypeScript
Beyond section 4's rule that CI is the type authority: point the editor at the
workspace compiler explicitly (`typescript.tsdk` → the workspace
`typescript/lib`). Otherwise the editor type-checks with its own bundled
version, which is older, and the disagreement between editor and CI is then a
*version* disagreement rather than the known template-analysis one — much harder
to recognise and much easier to argue about.

Two more settings that are one line each and prevent recurring review noise:
format-on-save with the formatter named explicitly, and ESLint's fix-on-save
action listed explicitly rather than left to a default. Ship a recommended
extension list so a new machine gets all three without being told.

## Sections 1–2 have a source — do not re-derive them

`docs/DEVELOPER_GUIDE.md` already documents prerequisites, the one-command
startup (`./scripts/start_local.sh`), ports, environment variables and a
troubleshooting section — for the **whole monorepo**.

**This file does not duplicate it.** It points at it, and holds only what is
frontend-specific and not there. Three entries qualify today:

### The backend port mismatch — the first thing anyone hits
`docs/STACK.md` §8 item 1: the Vite proxy defaults to `http://localhost:8080`;
the backend runs on **`18080`** under `local-mem`. So `/api/*` does not reach it.

The symptom is a frontend that renders and shows no data — indistinguishable
from a frontend bug, and it will be reported as one. **Write the actual error
text in the troubleshooting table**, not a description of it. Somebody will
search for it.

Note the two documents disagree with each other here as well: `STACK.md` §7 puts
local backend on 8080 and `DEVELOPER_GUIDE.md` puts it on 18080 under
`local-mem`, with the frontend dev server on 13000 rather than Vite's default
5173. **Establish the real values by running it**, and record what you saw.

### The fixtures default reversed
Already recorded above. It bites hardest here because
`./scripts/start_local.sh` starts a *real* backend — so a developer arriving
from the prior repository has a working backend, no `.env`, and a blank screen,
which is the most confusing possible combination.

### Node version — two documents, two answers
`DEVELOPER_GUIDE.md` prerequisites say **Node 20+**. `STACK.md` says
**≥ 24.15.0**, and React Router v8 requires 22.22.0+ regardless. A developer
following the prerequisites table installs a runtime the frontend will not build
on.

**`.nvmrc` is the operative answer and `STACK.md` is the authority.** Report the
prerequisites table as a documentation defect to the client rather than fixing
it here — it is not this corpus's file.

## Section 5 — the commands are not the ones this corpus assumed

The frontend has its own scripts, but the ones actually run daily include
monorepo-level entry points: `./scripts/start_local.sh` for the full stack,
`corepack pnpm dev` for frontend-only, and the harness commands
(32-working-within-the-moai-spec-workflow.md). List what you use; do not
transcribe `package.json`.

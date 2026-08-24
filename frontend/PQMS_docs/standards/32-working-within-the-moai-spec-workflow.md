# 32 — Working Within the MoAI-ADK SPEC Workflow
**Tier:** 2
**Status:** DRAFT — written from the client's harness documentation, not from a
completed SPEC cycle in this repository
**Purpose:** How this corpus's rules operate inside the client's spec-driven
harness — what a SPEC must contain, which quality framework governs, and where
the two overlap
**Extends:** 30-restructuring-an-existing-react-project.md (the phase-to-SPEC
mapping), 28-definition-of-done.md
---

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Why this file exists

The target repository ships the **MoAI-ADK harness** (`.claude/`, `.moai/`) — an
orchestrated workflow in which work is planned as a SPEC, implemented against
that SPEC's acceptance criteria, and synced into a merge request, each phase
routed to a manager agent with an independent auditor.

**Nothing in this corpus knows that.** Every tier file assumes a developer edits
files and opens a PR. In the target repository that is not how a change happens,
and the difference is not cosmetic: **the SPEC's acceptance criteria are what
gets verified**, so a rule this corpus states but a SPEC does not restate is a
rule nothing checks.

This file is the bridge. It does not restate the harness's documentation — that
lives in `.claude/rules/moai/workflow/spec-workflow.md` and
`.claude/skills/moai/SKILL.md`, and those win on anything procedural.

## The one rule that matters

> **A standard not written into a SPEC's acceptance criteria will not be
> enforced by the harness.**

The harness verifies the SPEC. The auditors audit against the SPEC. The drift
guard measures against the SPEC's file list. None of them read `PQMS_docs/`
unless the SPEC tells them to.

Two consequences:

- **Every SPEC that touches `frontend/` names the tier files that govern it**,
  by filename, in its own text — not "follow the frontend standards".
- **Rules that are mechanically checkable belong in a gate, not a SPEC.**
  A SPEC criterion is verified once, by an agent, at one moment. A CI gate is
  verified on every commit forever. If a rule can be a lint rule, it should be
  one — this is 30-restructuring-an-existing-react-project.md's
  enforcement-before-conformance rule, applied to the harness itself.

## The three phases, and what this corpus contributes to each

### `/moai plan` — where the standards get named

The plan phase produces `.moai/specs/SPEC-<ID>/spec.md` in GEARS format with
acceptance criteria, after a research pass and an annotation review cycle, then
an independent `plan-auditor` review.

**What a frontend SPEC must carry, beyond the harness's own template:**

| Field | Content |
|---|---|
| Governing standards | the tier files, **by filename**, that constrain this work |
| Open placeholders | any `[PLACEHOLDER]` in those files that this SPEC will hit — from 18's register |
| Source precedence | which of BRD / prototype / standards governs the disputed points, per 00 |
| Scope boundary | explicitly: what is **not** changed |

**The open-placeholder field is the one that earns its place.** A SPEC that
proceeds into an unresolved decision produces an implementation that encodes an
answer nobody made — and the harness will not catch it, because the SPEC did not
say there was a question.

**Point the plan at the file, not the paste.** The harness's research phase reads
the repository. Referencing `PQMS_docs/standards/07-routing-and-layouts.md` by
path is better than pasting an excerpt, which goes stale the moment the file is
revised.

### `/moai run` — where methodology choice is load-bearing

Methodology comes from `quality.yaml` (`constitution.development_mode`), and the
harness's own guidance keys it to coverage: **DDD below 10%, TDD above.**

**That heuristic is about coverage; the question is about the nature of the
change.** The target frontend sits at 90%, which selects TDD by default — and
TDD is wrong for a restructure, because its RED step presumes new behaviour and a
restructure's correctness criterion is that **nothing changed**.

| Work | Methodology | Why |
|---|---|---|
| Moves, renames, gate installation | **DDD** | characterization tests lock in current behaviour — which is exactly this corpus's proof-you-broke-nothing requirement |
| Conformance refactors | **DDD** | behaviour exists and must survive |
| New layers (query client, stores, auth) | **TDD** | genuinely new behaviour |
| New screens and components | **TDD** | the spec is the test |

**State the methodology in the SPEC and say why.** The default will otherwise
choose from the coverage number alone.

### The drift guard, and how to not fight it

Re-planning triggers above **30% drift** between planned and actually-modified
files. Structural work touches far more files than a plan enumerates.

- **Enumerate directories, not files**, for any move-heavy SPEC.
- **State the expected file count** in the acceptance criteria, so a large diff
  is evidence of conformance rather than of drift.
- **A drift trigger on a conformance SPEC is a real signal.** There, the scope
  genuinely was wrong, and re-planning is the correct outcome rather than an
  obstacle.

The re-planning gate also fires on **stagnation** — three iterations with no new
acceptance criterion met. On frontend work that usually means one thing: an
unresolved decision. See the open-placeholder field above.

### `/moai sync` — where the merge request is written

Sync generates API documentation, updates `README.md`, appends to
`CHANGELOG.md`, and prepares the MR, with a `sync-auditor` pass before it opens.

**Three things this corpus requires of that MR**, none of which the harness
knows about:

- **The AI-assistance declaration** (23-git-workflow-hooks-and-commits.md).
- **The `type:*` label matching the commit prefix**
  (`docs/conventions/README.md` §1).
- **Any `[PLACEHOLDER]` closed by this work carries its ADR**, and 18's register
  is updated in the same MR
  (31-documentation-standards-and-decision-records.md's three-edits-or-none
  rule).

The third is the one that will be skipped. It is also the one that determines
whether this corpus stays true a year from now.

## TRUST 5 and this corpus — overlapping, not competing

The harness enforces **TRUST 5** — Tested, Readable, Unified, Secured,
Trackable — on AI-assisted changes, and `TEAM-GUIDE.md` §7 is explicit that
these apply *on top of*, not instead of, the mechanical checks.

The mapping is close enough to be worth stating, and the gaps are the point:

| TRUST | This corpus's owner | Gap |
|---|---|---|
| Tested | 10, 26 | TRUST does not know the coverage **ratchet**, or which of split/uniform floors applies |
| Readable | 03, 14 | TRUST does not know this corpus's naming or file-shape rules |
| Unified | 01, 06 | **the largest gap** — structural conformance is this corpus's whole subject and TRUST has no view on it |
| Secured | 13, 21 | complementary; gitleaks and OWASP cover what 13 states, 21's runtime log rules are covered by neither |
| Trackable | 18, 23, 31 | `@MX` annotations are the harness's trackability mechanism and have no counterpart here |

**Neither framework subsumes the other.** A change can pass TRUST 5 and violate
tier 01 in every file it touches, because "Unified" is about internal
consistency and tier 01 is about a specific target structure.

### `@MX` annotations
The harness expects `@MX` code annotations where warranted, tying code back to
its SPEC. This corpus has no annotation convention and does not need one — but
two rules keep them from becoming noise:

- **Annotate the seam, not every file.** The place where a SPEC's decision is
  encoded — a boundary, a mapper, a fuse — not each file the SPEC touched.
- **An `@MX` on a placeholder-resolving line cites the ADR too.** Otherwise the
  code points at a SPEC that points at a decision nobody recorded.

## Definition of Done, reconciled

28-definition-of-done.md states this corpus's DoD. The harness states its own:
all SPEC requirements implemented, methodology tests passing, 85%+ coverage,
TRUST 5 passed, `@MX` added.

**They are additive, and one number disagrees.** The harness says 85%; the target
repository's Vitest config says 90/90/90/80; 10-testing-standards.md resolves
that conflict and its resolution governs — the higher floor wins, and branches
ratchet toward parity.

**A frontend SPEC is done when both DoDs are met.** Neither is a subset of the
other, and the harness's is the one that will be checked automatically — which
is precisely why this corpus's must be written into the acceptance criteria.

## What this file does not do

**It does not tell you how to run the harness.** Flags, token budgets, worktree
options, agent chains and gate mechanics are the harness's own documentation and
change with it. Anything procedural stated here is a snapshot; if it disagrees
with `.claude/`, `.claude/` is right and this file needs regenerating.

# ─────────────────────────────────────────────────────────────
## Correction: the harness is BMAD, not MoAI-ADK

**Everything above describes MoAI-ADK**, taken from the client's
`project-template-java` template documentation. The repository this corpus
governs ships **BMAD** (`_bmad/`, `_bmad-output/`, and the `bmad-*` skills
under `.claude/skills/`).

**This file's status is therefore DRAFT against the wrong harness for
everything above this line.** It is kept rather than deleted because **the
central rule is harness-independent and is the reason the file exists.**

### The rule survives unchanged

> **A standard not written into the work item's acceptance criteria will not be
> enforced by the harness.**

BMAD verifies the **story**. Its review skill reviews against the story. Neither
reads `PQMS_docs/` unless the story says to. Substitute "story" for "SPEC" and
every consequence above holds.

### Vocabulary mapping

| MoAI-ADK (above) | BMAD (this repository) |
|---|---|
| `/moai plan` | `bmad-create-prd` → `bmad-create-architecture` → `bmad-create-epics-and-stories` → `bmad-create-story` |
| `/moai run` | `bmad-dev-story` (or `bmad-dev-auto`) |
| `/moai sync` | `bmad-code-review`, then the usual commit and MR |
| `SPEC-<ID>` | an epic and its stories |
| Re-planning gate | `bmad-correct-course` |
| `plan-auditor` | `bmad-check-implementation-readiness` |
| — | `bmad-document-project` — no MoAI counterpart |

**Two structural differences, and both matter for a restructure:**

- **BMAD has a PRD and an architecture step above the story.** A restructure has
  no product requirement, so **the architecture document is where this corpus
  attaches** — not the story. Point `bmad-create-architecture` at the tier files
  and let the epics derive from it.
- **BMAD's unit is an epic containing stories**, not a single SPEC. So the
  phase mapping in 30-restructuring-an-existing-react-project.md becomes **one
  epic per phase, one story per commit-sized move** — which fits a restructure
  better than a single SPEC did, because Phase 2's rule is one coherent move per
  commit.

### What does not carry across

- **The 30% drift guard and the stagnation gate are MoAI mechanisms.** Whether
  BMAD has equivalents is unverified. The underlying advice still applies —
  enumerate structural work by directory, state the expected file count — but
  as good practice, not as an accommodation to a specific guard.
- **DDD / TDD selection from `quality.yaml`** is MoAI's. **The reasoning is
  not**, and it is the part worth keeping: a restructure's correctness criterion
  is *nothing changed*, so characterization tests are the instrument and a
  test-first cycle is the wrong shape. State that in the story regardless of
  what the harness calls it.
- **`@MX` annotations** are MoAI's trackability mechanism. BMAD's equivalent is
  the story reference. Same rule: **annotate the seam, not every file.**

### TRUST 5
Unverified for BMAD. **The gap analysis above stands on its own merits**
whatever the quality framework is called — the point was never TRUST's five
letters, it was that a framework about internal consistency cannot check
conformance to a specific target structure. That remains true of any such
framework.

### What to do with this file
**Rewrite it against BMAD once one full cycle has been run**, per
31-documentation-standards-and-decision-records.md's rule that reference
material is regenerated rather than patched. Until then, read the rule at the
top, the mapping table, and treat the MoAI procedure above as an illustration.

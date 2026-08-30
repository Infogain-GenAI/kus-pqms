---
name: bmad
description: 'Entry point for BMad. Use when the user types /bmad with no suffix, says just "bmad", or asks what BMad can do. Routes to the right bmad-* skill, or runs bmad-help when the intent is unclear.'
---

# BMad — entry point

## Why this skill exists

Every BMad capability is installed as `bmad-<something>`. There was no skill named
plainly `bmad`, so typing `/bmad` matched nothing and appeared broken — the prefix
looks like a command but is only a namespace.

This skill is that missing front door. It does no work of its own: it reads what
the user is after and hands off to the skill that does.

## How to respond

### 1. If the user passed an argument

Treat the argument as the intent and go straight to the matching skill.

- Exact suffix match wins: `/bmad build` → `bmad-build`, `/bmad prd` → `bmad-prd`.
- A close or partial match is fine to act on when it is unambiguous:
  `/bmad review code` → `bmad-code-review`, `/bmad retro` → `bmad-retrospective`.
- If two or more skills match equally well, ask which one — do not guess.

Invoke it with the Skill tool. Do not re-implement its behaviour here.

### 2. If the user passed nothing

Do **not** dump the whole catalogue. Two sentences of orientation, then the short
list below, then offer to run the most likely one.

Judge "most likely" from the conversation so far, not from a fixed default:

- Mid-implementation, or a diff on the table → `bmad-build` or `bmad-code-review`
- Planning, nothing built yet → `bmad-prd`, `bmad-architecture`, `bmad-spec`
- Genuinely unclear → invoke `bmad-help`, which inspects project state properly

### 3. If the user is asking a question rather than issuing a command

"What is BMad", "what can this do", "where am I" → invoke `bmad-help`. It reads the
installed catalogue and existing artifacts and answers from real state.

## The short list

Offer these, not all sixty:

| Command | For |
| --- | --- |
| `/bmad-help` | Where am I, what next — inspects real project state |
| `/bmad-build` | Implement a feature, fix or refactor |
| `/bmad-code-review` | Adversarial review of the current diff |
| `/bmad-review` | Multi-lens review of any doc, spec or diff |
| `/bmad-spec` | Distil intent into a machine-readable spec |
| `/bmad-prd` | Create, update or validate a PRD |
| `/bmad-architecture` | Design or update the architecture |
| `/bmad-sprint-planning` | Sprint status, planning readiness |
| `/bmad-retrospective` | Evidence-based epic retrospective |
| `/bmad-agent-dev` · `/bmad-agent-architect` · `/bmad-agent-pm` | Work with a named persona |

Mention that typing `/bmad-` filters the full list of ~59 in the picker.

## Rules

- **Route, never duplicate.** If a `bmad-*` skill covers the request, invoke it.
  Re-doing its job here is how two versions of one workflow start to drift.
- **One hand-off.** Pick a skill and go; do not chain several without being asked.
- **Do not invent skills.** Only the installed `bmad-*` skills exist. If the user
  asks for something with no skill behind it, say so and name the closest fit.
- **Scope.** These skills are directory-scoped to this repository. If the user is
  working outside it, say that rather than letting the command silently do nothing.

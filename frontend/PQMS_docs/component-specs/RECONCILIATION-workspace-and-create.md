# Inventory reconciliation — Issue Workspace and Create Issue

**Method:** `INVENTORY.md`'s three-step procedure, applied to two screens at
once because their findings converge on one question.

**Source:** `docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html`,
md5 `8dca6a22f65b5dda7906a77945c12435` — canonical per `00-core-rules.md`.

**Date:** 2026-08-26. **Scope:** screens 2 and 3 of seven. Derived from
`../screen-descriptions/issue-workspace.md` and `../screen-descriptions/create-issue.md`,
**not** from `INVENTORY.md`.

---

## Issue Workspace

### Step 1 — 19 components implied

status pill · severity indicator · avatar · tab set · tab badge · **priority
scoring matrix** · **priority letter chip** · approval bar · status-change dialog
· reason gate · disposition selector · activity timeline item · audit entry row ·
card · section header · toast · modal · **classification change-request card** ·
linked-issue card

### Step 2 — the buckets

**✅ CONFIRMED (16)** — `BaseStatusPill` (existence), `BaseSeverityIndicator`,
`BaseAvatar`, `BaseTabs`, `BaseBadge`, `ApprovalBar`, `StatusChangeDialog`,
`BaseReasonGate`, `DispositionSelector`, `ActivityTimelineItem`, `AuditEntryRow`,
`BaseCard`, `BaseSectionHeader`, `BaseToast`, `BaseModal`, `LinkedIssueCard`.

Three are worth calling out because the candidate list got their *reason* right,
not just their name:

- **`ApprovalBar`** — the row says *"shown to an `override` role when a proposal
  awaits their decision"*. The source shows exactly that, gated on
  `role === 'ASM' || role === 'PQM'`, both of which carry `cap:'override'`.
- **`BaseReasonGate`** — the row calls it *"the most-used modal in the product"*.
  Confirmed: the disposition rationale, the status-change reason and the
  classification-request justification are three separate instances on this
  screen alone.
- **`AuditEntryRow`** — before→after values, actor, role, timestamp, rationale.
  Every one appears.

**➕ MISSED (3)**

| Missed | Evidence | Why |
|---|---|---|
| **Priority scoring matrix** | 17 items in 3 categories, 1–3 points, letter bands ≥26 → A / ≥11 → B, manual override, draft-until-save | **The candidate list has `ScoreBreakdown` — a different component.** That renders the *automatic* severity score's factors, read-only. This is a manual, interactive scorer. Both exist |
| **Priority letter chip** | header chip, shown only once scored | Not `BaseStatusPill` and not `BaseSeverityIndicator` — a third chip family with its own bands |
| **Classification change-request card** | `cr.*` — proposed value, current value, *"Admin comment:"*, *"Approved by / Approved on"*, rejected and approved variants | No row. It is the requester-side view of the admin approval workflow, and it lives on this screen |

**➖ COULD NOT CONFIRM (0)** — every list row implied by this screen was found.

**⚠️ DIFFERENT SHAPE (1)** — `BaseStatusPill` and, through it,
`StatusChangeDialog` and the filter. **The status vocabulary does not contain the
values the lifecycle writes.** Full statement, evidence and placeholder in
`../screen-descriptions/issue-workspace.md`.

### Step 3 — delta

> **For the Issue Workspace, pass 4 confirmed 16 components, added 3, could not
> confirm 0, and reshaped 1.** — **84%**

---

## Create Issue

### Step 1 — 15 components implied

creatable combobox · input · textarea · label · checkbox · **model-year
sub-panel** · source channel badge · source evidence panel · modal · toast · card
· linked-issue card · justification gate · badge · button

### Step 2 — the buckets

**✅ CONFIRMED (14)** — `BaseCombobox` (including the *"Add new: {value}"*
affordance its row predicts, realised here as **Request New**), `BaseInput`,
`BaseTextarea`, `BaseLabel`, `BaseCheckbox`, `SourceChannelBadge`,
`SourceEvidencePanel`, `BaseModal`, `BaseToast`, `BaseCard`, `LinkedIssueCard`,
`BaseReasonGate`, `BaseBadge`, `BaseButton`.

**`SourceEvidencePanel` carries a count discrepancy, recorded not as a reshape
but as a question:** its row says *eight* variants; the canonical prototype has
**seven** (Warranty, Weibull, Comeback, Techline, FPQR, EWS, GQIS). **Resolved
by:** BRD Appendix C. **Owner:** Frontend Lead.

**➕ MISSED (1)**

| Missed | Evidence | Why |
|---|---|---|
| **Model-year sub-panel** | a bordered sub-panel under the Model Code combobox, offering the **union** of the code's nominal years and any actually-recorded year, pre-checked | A composite of checkbox + panel with a real derivation rule. Layout-adjacent and named by no FR — the predicted failure mode again |

**➖ COULD NOT CONFIRM (3)**

| Row | Claimed for this screen | This reading |
|---|---|---|
| **`BaseStepRail`** — **High** | *"Issue Entry's step progress"* | **The screen is not a stepped flow.** One page, collapsible sections, no step state, no Next/Back. **A High row with no counterpart in the design** |
| `BaseFileDropzone` — High | `FR-DOC-001…008`, the first attachment surface | **No dropzone found in the create form.** The QIR draft has one |
| `CorrelationSuggestionCard` — High | `FR-ENT-011/012` | Linking here is **search-driven**, not suggestion-driven |

**None is deleted.** All three are plausible on a surface this pass did not read.
**All three are marked `not confirmed`, and all three were rated High** — which is
the second and third and fourth instance of the pattern that retired the
confidence rating.

**⚠️ DIFFERENT SHAPE (0 new)** — this screen opened **no new** shape question. It
**amplified** the Issue List's: it is where issue groups are created, and it
carries two rules the list does not express (a new issue can only ever be a
Child; a future-dated linked member blocks registration).

### Step 3 — delta

> **For Create Issue, pass 4 confirmed 14 components, added 1, could not confirm
> 3, and reshaped 0.** — **93%**

---

# Three screens in, what the numbers say

| Screen | Implied | Confirmed | Added | Could not confirm | Reshaped |
|---|---|---|---|---|---|
| Issue List | 15 | **12 (80%)** | 3 | 1 | 2 *(one question)* |
| Issue Workspace | 19 | **16 (84%)** | 3 | 0 | 1 |
| Create Issue | 15 | **14 (93%)** | 1 | 3 | 0 |
| **Total** | **49** | **42 (86%)** | **7** | **4** | **3 *(two questions)*** |

**Four things the three screens establish that one could not:**

1. **Existence prediction is good and improving as screens get less
   structural.** 80% → 84% → 93%. The BRD-derived list is strongest where a
   screen is made of ordinary form and display components, and weakest where a
   screen invents a layout the requirements never describe.
2. **Every miss is layout-adjacent and named by no requirement** — a KPI tile, a
   result band, a group expander, a scoring matrix, a letter chip, a
   change-request card, a model-year sub-panel. **Seven for seven.** This is now
   a reliable rule, not a hypothesis: *the candidate list misses exactly what no
   FR names.*
3. **Shape disagreements cluster on lifecycle, not on components.** Both — the
   list's relationship model and the workspace's status vocabulary — are
   **domain-state questions wearing a component's clothes**. Neither is a props
   argument.
4. **The confidence rating failed four more times.** `BaseStepRail`,
   `BaseFileDropzone` and `CorrelationSuggestionCard` are all **High** and all
   unconfirmed; `BaseDrawer` was **Low** and was answered by one line of source.
   Four screens' worth of counterexamples now sit behind the `Confirmed` field
   that replaced it.

**Revised extrapolation for the remaining four screens.** At 2.3 misses per
screen the earlier 12–20 estimate was too high; **9–14 missed components** is the
better figure, and **at most one further shape disagreement**, for the reason in
the next section.

---

# Do the remaining screens earn a full description?

The earlier read — *"Notifications and Dashboard will confirm far more than they
add"* — holds, but three screens supply a **better predictor than screen size**,
and it reclassifies one of the three.

### The predictor: does the screen own a lifecycle contract?

Every shape disagreement so far came from a screen that **writes domain state
under rules the components cannot hold**:

| Screen | Writes domain state? | New shape question |
|---|---|---|
| Issue List | no — but it **renders** the grouping rule | 1 |
| Issue Workspace | **yes** — propose / approve / reject | 1 |
| Create Issue | **yes** — but into the *same* model | 0 new; amplified one |

Create Issue is the instructive case. It is a large screen with 15 components and
it produced **no new question**, because its rules belong to a contract already
open. **Size did not predict value; ownership of a contract did.**

### Applied to the remaining four

| Screen | Writes domain state? | Recommendation |
|---|---|---|
| **Admin** | **YES, and it is the most consequential writer in the app** | **Full description** |
| **Notifications** | no — `notifRead:{}`, a read-marker map | **Component derivation only** |
| **Dashboard / Overview** | no — aggregation plus `go()` navigation | **Component derivation only** |
| **QIR** *(out of scope)* | n/a — the app ships no QIR screens | **Neither** |

### Why Admin is reclassified upward, and it is not a close call

Admin was in the "probably confirms more than it adds" group. It should not be.
The source shows it holding **configuration that drives the lifecycle every other
screen renders**:

```js
admin: {
  weights:   { claimFreq:35, repairCost:30, claimsCount:20, detect:15 },
  reminders: { agingWarn:30, agingCrit:60, qirDays:14, qirFreq:'Daily', qirOn:true,
               dispDays:7,  dispFreq:'Every 2 days', dispOn:true },
  sources:   { warranty:true, …, fpqr:false, … },
  jobs:      [ … ],
}
```

Three reasons this earns a full description:

1. **The severity score every screen displays is computed from those four
   weights.** They sum to 100 and are editable. A component derivation would
   produce "four number inputs" and lose that.
2. **`sources.fpqr` is `false` in the seed.** A source channel can be **turned
   off**, which means Create Issue's seven channels are a *configured* set, not a
   fixed one — and that reaches back into the seven-versus-eight question above.
3. **`approveCr()` is a second approval workflow**, structurally parallel to the
   disposition flow and with its own quirk: when the acting role is `SE` it
   **substitutes `ASM`** as the approver. That is the same class of finding as the
   workspace's status vocabulary, on a screen nobody planned to read closely.

**Notifications and Dashboard, by contrast, hold no rule.** Notifications tracks
read state; Dashboard aggregates and navigates. A component derivation — list the
components, mark them `Confirmed`, record anything missing — captures what they
have to give. **If either turns out to hold a rule, that is the trigger to
promote it**, exactly as Admin has been promoted here.

### The cost, stated

A full description is roughly a day; a component derivation roughly two hours.
Doing all four in full would spend three extra days to close, on the evidence
above, **at most one further shape question and about a dozen layout-adjacent
components** — and the component derivations find those too. Doing none of them
in full would miss the scoring weights.

**Recommendation: Admin in full, Notifications and Dashboard as derivations, QIR
not at all.** Total remaining effort ≈ 1.5 days rather than 3.5.

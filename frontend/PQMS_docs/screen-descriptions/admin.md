# Screen description — Issue Administration

**Class:** Specification, authored against `29-screen-description-authoring.md`'s
ten questions. **Written from the prototype, not from the implementation.**

---

## 0 · Why this screen got a full description

It was originally grouped with Notifications and Dashboard as *"will confirm more
than it adds"*. **That was wrong, and the reason it was wrong is the reusable
part:** size is not the predictor of a screen's value to a description pass —
**owning a lifecycle contract is.** Create Issue is a 15-component screen that
produced no new question because its rules belonged to a contract already open.
Admin is a configuration screen that **sets the constants every other screen
renders**.

Three specifics, checked directly rather than as part of a general sweep:

1. it holds the **four weights that compute the severity score**;
2. it can **disable a source channel** — `sources.fpqr: false` in the seed;
3. it neighbours a **second approval workflow** with an actor-substitution rule.

All three turned out to matter, and the third turned out not to live here.

---

## 1 · Source and reading

| | |
|---|---|
| **Prototype file** | `docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html` |
| **md5** | `8dca6a22f65b5dda7906a77945c12435` — canonical per `00-core-rules.md` |
| **Reading** | **source read** — `adminVals()`, `classVals()`, the `admin` state slice, and the template |
| **Date of reading** | 2026-08-26 |
| **Role** | the prototype ships SE / ASM / PQM and **no ADMIN role**; see Q8, which is this screen's largest gap |

## 2 · BRD screen ID and FRs

**[UNSPECIFIED — the BRD screen ID and FR list.** `INVENTORY.md` cites
`FR-ADM-005`, `FR-SCR-001/003`, `FR-JOB-008`, `FR-MST-003` against this screen's
controls, second-hand. **Resolved by:** reading BRD C1.0 §8.1 and the scoring
requirements directly. **Owner:** Frontend Lead.]**

`TR-02` is **not yet satisfied** for this screen.

## 3 · Layout

`DefaultLayout`, breadcrumb *"Admin › Issue Administration"*, then a vertical
stack of **numbered section cards**. No tabs and no internal scroll region — each
section is a card, read top to bottom.

## 4 · Regions, top to bottom

| # | Region | Contents |
|---|---|---|
| 1 | Breadcrumb + heading | "Admin › Issue Administration" |
| 2 | **KPI strip** | Scheduled jobs · Running now · Failed (24 h) · Avg duration |
| 3 | **§1 Scheduled batch jobs** | four jobs, each with status pill, last/next run, duration, triggered-by, an **impact** paragraph, plus **Run** and **View history** |
| 4 | **§2 Scoring weights** | four weighted factors with sliders, a live total, and a save gated on the total |
| 5 | **§3 Issue reminder configuration** | aging warning / critical thresholds; QIR and disposition reminder days, frequency and on-off switches |
| 6 | **§4 Issue source configuration** | the seven source channels, each individually **enabled or disabled** |
| 7 | **§5 Configuration audit history** | every administrative change: action, module, actor, when, old → new |
| 8 | **§6 Classification management** | the taxonomy tree with counts, expand/collapse all, add, and the **Pending Admin Approval** queue |

### §2 is the consequential section, and it is a contract

```js
weights: { claimFreq: 35, repairCost: 30, claimsCount: 20, detect: 15 }
```

| Key | Label | Sub-label |
|---|---|---|
| `claimFreq` | **Claim Frequency** | Field claim rate vs. model baseline |
| `repairCost` | **Repair Cost Index** | Average repair and parts cost impact |
| `claimsCount` | **Claims Count** | Absolute number of claims logged |
| `detect` | **Detectability Index** | Ease of detection in the field |

**Three rules, all in the source:**

1. **The four must total exactly 100.** `saveWeights()` refuses otherwise, with a
   danger toast: *"Cannot save configuration — Total weight must equal 100%
   (currently {n}%)."* The save control is **disabled** and greyed while the total
   is off, and a badge reads *"Balanced — ready to save"* or *"Must equal 100% —
   currently {n}%"*.
2. **`resetWeights()` restores 35 / 30 / 20 / 15** — those are the *system
   defaults*, not merely the seeded values.
3. **Weight changes are audited with a rationale.** The section carries its own
   history — *"Claim Frequency 30% → 35%, M. Singh (Admin), Jun 18 2026,
   'Rebalanced toward field claim frequency'"*.

**These four weights are the inputs to `autoScore()`**, which computes the
severity number rendered on the issue list, the workspace header and every issue
card:

```js
autoScore(f){ … const cf = claims/(fleet/1000)   // Claim frequency · per 1,000 VINs
                    rci = avgCost/maxCost*100    // Repair cost index
                    cc  = claims/volThreshold*100 // Claims count
                    wa  = isWeib ? failRate/accThreshold*100 : 0  // Weibull adjustment … }
```

**A number on every screen is configured on this one.**

### §4 — the source channels are configured, not fixed

```js
sources: { warranty:true, weibull:true, comeback:true, techline:true,
           fpqr:false,  ews:true, gqis:true }
```

**`fpqr` is off in the seed**, and the audit history records it being turned off:
*"Disabled source channel · FPQR · Enabled → Disabled · D. Okafor (Admin)"*. The
section's own subtitle says what that means: *"Control which channels are
available in the Issue Entry source dropdown."*

**So Create Issue's seven channels are the *vocabulary*; the *available* set is
whatever this screen last saved.** Those are different things and the difference
is user-visible.

## 5 · Every control, by what it does

| Region | Control | What it does |
|---|---|---|
| 3 | **Run** | `openRunModal(jobId)` — manual trigger, via a confirmation |
| 3 | View history | a run-history surface (a toast stub in the prototype) |
| 4 | Weight slider ×4 | `setWeight(key, v)` — rounds to an integer |
| 4 | **Save configuration** | `saveWeights()` — **refused unless the total is exactly 100** |
| 4 | Reset to defaults | `resetWeights()` → 35 / 30 / 20 / 15, with an info toast |
| 5 | Aging warning / critical | `setReminder('agingWarn'|'agingCrit', v)` — days |
| 5 | QIR / disposition days | `setReminder('qirDays'|'dispDays', v)` |
| 5 | QIR / disposition frequency | one of **Daily · Every 2 days · Weekly** |
| 5 | QIR / disposition switch | `toggleReminder('qirOn'|'dispOn')` — a real on/off track |
| 5 | Save reminders | success toast; **no validation gate** — unlike §2 |
| 6 | Source switch ×7 | enables or disables that channel |
| 8 | Expand all / Collapse all | over the classification tree |
| 8 | Add system | `openAddSystem()` |

### The two save controls behave differently, deliberately

**§2's save is gated and §5's is not.** Weights must sum to 100 because they are
a distribution; reminder thresholds are independent numbers. That is correct, and
it is the kind of asymmetry an implementation flattens by accident into "all
sections save the same way".

## 6 · User-facing strings, verbatim

```
Admin › Issue Administration
Scheduled batch jobs · Monitor and manually trigger ISM data and processing jobs.
Scheduled jobs · Running now · Failed (24h) · Avg duration
Completed · Running · Scheduled · Failed
Claim Frequency · Field claim rate vs. model baseline
Repair Cost Index · Average repair and parts cost impact
Claims Count · Absolute number of claims logged
Detectability Index · Ease of detection in the field
Balanced — ready to save
Must equal 100% — currently {n}%
Cannot save configuration
Total weight must equal 100% (currently {n}%).
Weights reset · Scoring weights restored to system defaults.
Issue reminder configuration · Configure notification thresholds for aging and overdue actions.
Daily · Every 2 days · Weekly
Reminder configuration saved · Notification thresholds updated.
Issue source configuration · Control which channels are available in the Issue Entry source dropdown.
Configuration audit history · A transparent record of all administrative changes.
Classification management
Pending Admin Approval
```

## 7 · Every state

| State | Prototype shows it? |
|---|---|
| **Content** | ✅ yes |
| **Weights unbalanced** | ✅ yes — red badge, disabled save, danger toast on attempt |
| **Job running / failed / scheduled / completed** | ✅ **all four**, with distinct pills and icons |
| **Source disabled** | ✅ yes — `fpqr:false` renders the off state in the seed |
| **Job run confirmation** | ✅ yes — `runModal`, with an **impact** paragraph per job |
| **Loading** | ❌ **[UNSPECIFIED.** **Owner:** UX, with the architect.] |
| **Empty — no data** | ❌ **[UNSPECIFIED** — see below] |
| **Empty — no match** | **n/a** — nothing on this screen filters |
| **Error** | ❌ **[UNSPECIFIED** — a *save* failure. `22` requires one. **Owner:** UX.] |
| **Permission-denied** | ❌ **not shown, and this is the screen where it matters most** |

### The two empty states — answered explicitly, per `29` Q7

**Neither is specified, and here the two are genuinely asymmetric.**

- **Empty — no match does not apply.** Nothing on this screen searches or
  filters. There is no state in which a user has narrowed to nothing.
- **Empty — no data applies to three regions and differs in each.** No batch jobs
  configured; no audit history yet (a **first-run** state — a brand-new
  deployment has made no administrative changes); an empty classification tree.

**[UNSPECIFIED — the no-data states for batch jobs, audit history and the
classification tree.** They are not one state: an empty audit history is a
*normal, healthy* first-run condition and should read as reassurance; an empty
classification tree is a *blocking* condition, because Create Issue's cascade
cannot function without one, and it wants the **Add system** action as its
primary. **Recorded as UNSPECIFIED rather than reasoned by analogy** — the
prototype's seed is fully populated and the case never renders. **Resolved by:** a
UX decision per region. **Owner:** UX. **Trigger:** before any of the three is
implemented against a real service.]**

## 8 · What differs per role — the largest gap on this screen

**The prototype has no ADMIN role.** `USERS` contains exactly three:

```js
USERS = { SE:  { role:'Service Eng.',     cap:'read'     },
          ASM: { role:'Area Service Mgr', cap:'override' },
          PQM: { role:'Product Quality',  cap:'override' } }
```

**Yet every actor on this screen is an administrator.** The audit history is
attributed to *"M. Singh (Admin)"* and *"D. Okafor (Admin)"* — **two people who
exist nowhere in the prototype's user model** — the section is titled *Issue
Administration*, and the seed's `lastBy` is *"M. Singh (Admin)"*.

**So the prototype shows an administrator's screen without modelling an
administrator.** Nothing in it says who may open it, and the three roles it does
model all carry capabilities (`read`, `override`) that are about *issue*
decisions, not configuration.

**[UNSPECIFIED — who may open this screen, and which sections they may write.**
This is not one permission: reading the audit history, running a batch job,
rebalancing the scoring weights and disabling a source channel are four different
levels of authority, and the prototype offers all four to whoever arrives.
**Resolved by:** BRD §7.2–§7.4's authorization matrix, which `08` already treats
as governing and which contains an `ADMIN` role the prototype does not.
**Owner:** architect. **Trigger:** before this screen is exposed on any route
reachable without a guard — `APPLICATION-DEFECTS.md` **D-4** already records that
`/admin` has no route guard today, and this is that defect's requirements
half.]**

## 9 · What the prototype does not show

| Item | Status |
|---|---|
| **What a weight change does to existing issues** | not shown — are scores recomputed, or does the new weighting apply only to new issues? **This is the biggest unstated consequence on the screen** |
| **Whether a running job can be cancelled** | not shown; `JOB-EWS` is `Running` with no stop control |
| **What a failed job's remedy is** | the impact text says *"failed at the notification gateway — no emails were sent"*; no retry control appears |
| **Whether disabling a source hides existing issues** from that channel | not shown |
| **Concurrent administration** | two admins editing weights is unmodelled |
| **Save semantics** | optimistic vs pessimistic is not expressible by a static prototype — `00` case 2 |

## 10 · Navigation

**Into:** the Admin nav item; `/admin` directly, **unguarded** (D-4).

**Out:** nothing. Every control on this screen acts in place or opens a modal.
**That is itself notable** — it is the only screen read so far with no outbound
navigation.

---

# Reconciliation against the implementation

| # | Canonical prototype | Implementation (`AdminScreen.tsx`) | Verdict |
|---|---|---|---|
| 1 | §1 Scheduled batch jobs — four jobs, four status kinds, run + history | present, four jobs, four status kinds | ✅ matches |
| 2 | **§2 Scoring weights — four factors, total-100 gate, reset, own history** | **absent — there is no §2** | ⚠️ **FINDING, and it is the big one** |
| 3 | §3 Reminders — aging 30/60, QIR 14 d, disposition 7 d, frequency, switches | present; `agingWarn:'30'`, `agingCrit:'60'`, `qirDays:'14'`, `dispDays:'7'` — **identical values** | ✅ matches |
| 4 | §4 Sources — seven channels, `fpqr:false` | present; `sourceOn` seeds `fpqr:false` — **identical** | ✅ matches |
| 5 | §5 Configuration audit history | present, five entries including the weight change | ✅ matches — **while the feature it audits does not exist** |
| 6 | §6 Classification management + Pending Admin Approval | present; `ClassificationNode.pendingApproval?: boolean` | ✅ matches |
| 7 | Role gating | **`EmptyState` "Administrator access required — Administration is restricted to the Administrator role."** | ➕ **implementation adds**, and the prototype has no such role |
| 8 | Section numbering §1…§6 | app numbers §1…§4 then classification unnumbered | ✅ consistent with §2 being absent |

### FINDING — the scoring weights are not implemented, and the reason is upstream

**Checked directly, as instructed, rather than as part of the general
reconciliation.** The result is not the expected one:

> **The app's weights do not *differ* from the prototype's. The app has no
> severity scoring at all.**

`apps/portal/src/data/types.ts`, line 2:

```ts
// No severity scoring, no QIR/TSB entities (out of scope). Issue Priority IS in scope:
```

`autoScore` appears nowhere. `claimFreq` appears nowhere. `IssueWorkspaceScreen.tsx`
contains **zero** occurrences of "severity". The only trace is a **string in an
audit-log fixture** — *"Updated scoring weight · Claim Frequency 30% → 35%"* — so
the app **displays a record of a change to a feature it does not have.**

**Why this is not a defect to file:**

Severity scoring was scoped out deliberately, and the exclusion is recorded in
the type file. **The finding is not "the weights are wrong" — it is that the
scope boundary runs through the middle of a screen and nothing says so.** Three
consequences:

1. **`INVENTORY.md`'s `ScoreBreakdown` row** (High confidence, *"Factor name,
   weight, source, value, plus the composite and tier — FR-SCR-003"*) describes a
   component for a subsystem that is out of scope. **Marked `not confirmed`**, not
   deleted — the scope decision may be revisited.
2. **`06`'s severity-tier colours and `BaseSeverityIndicator`** are specified for
   the same absent subsystem. `SeverityBar` / `SeverityIndicator` ship in the
   vendored design system and are consumed by `IssueCard` in the ui-library — so
   the **component library has severity and the application does not**.
3. **The audit fixture is misleading.** It is prototype-fidelity data, and it
   asserts a capability. Left in place — it is what the prototype shows — but
   recorded here so nobody reads it as evidence the feature exists.

**[UNSPECIFIED — is severity scoring in scope, and if not, does §2 render at
all?** The prototype devotes a gated, audited, reset-able section to it; the app
excludes the entire subsystem. A "1:1 port" and "no severity scoring" cannot both
be true of this screen. **Resolved by:** confirming the scope decision with
whoever made it, then either implementing §2 or recording its absence as
deliberate in `18` and marking the `06` / `INVENTORY.md` rows accordingly.
**Owner:** Frontend Lead, with the architect. **Trigger:** before `ScoreBreakdown`
or `BaseSeverityIndicator` is specified — both are currently queued against a
subsystem that does not exist here.]**

### ➕ The implementation adds a role gate the prototype does not have

`AdminScreen.tsx` renders *"Administrator access required — Administration is
restricted to the Administrator role. Switch role to view."* **The app models an
`ADMIN` role (`RoleKey = 'SE' | 'ASM' | 'PQM' | 'ADMIN'`) that the prototype does
not.**

This is the right instinct and it is **not** confirmation of anything. It is a
fourth role set — the Vue code had one, the BRD has five, the prototype has
three, the app has four — and it sits inside the same permission question. Under
`00` case 2, the prototype's silence is not evidence; under `08`, the BRD's
matrix governs. **Recorded as an addition to be validated, not as agreement.**

---

# ⚠️ ESCALATED — a second approval workflow, and it is not on this screen

**A correction first, because it changes where this belongs.** `approveCr()` was
attributed to the Admin screen when this work was scoped. **It is not.** It keys
on `fid` — a *finding* id — mutates `_mutFindings`, and logs to
`crLog[issueId]`. **It is the Investigation tab of the Issue Workspace.** The
Admin screen's own approval surface is the taxonomy queue (*Pending Admin
Approval*), which is a different mechanism.

**So the Issue Workspace has TWO approval workflows with contradictory rules**,
and the second one was missed by that screen's description.

| | **Disposition approval** | **Field change-request approval** |
|---|---|---|
| Where | workspace header / approval bar | workspace → Investigation tab, per finding |
| Who may approve | **ASM or PQM only** — `canApproveTabs = (role==='ASM' \|\| role==='PQM')`; an SE never sees the bar | **anyone, including an SE** — no gate at all |
| Recorded actor | the acting role | **`(role === 'SE') ? 'ASM' : role`** |
| Reject | requires no comment | **requires a non-empty comment** |
| Audit | one entry | **two** — an `approved` entry by the actor, then an `applied` entry by `'N-PQMS'` / role `'System'` at `ts+1` |

### The actor substitution is the finding

```js
approveCr(fid, crId){
  const cr = this._crList(fid).find(c => c.id === crId)
  if (!cr || cr.status !== 'pending') return
  const adminRole = (this.state.role === 'SE') ? 'ASM' : this.state.role   // ← here
  const who = this.USERS[adminRole], role = adminRole
  …
  const upd = { …cr, status:'approved', decidedBy: who.name, decidedByRole: role, … }
```

**When an SE approves a change request, the audit trail records Park Soo-jin
(ASM) as the approver.** The SE is permitted to act — there is no gate — and the
record names somebody else.

**Two reasons this escalates rather than being fixed:**

1. **It contradicts the same file's other approval flow.** Fifty lines away, the
   same prototype refuses to *show* an SE the disposition approval bar. One
   workflow says an SE may not approve; the other lets them approve and
   attributes it to an ASM. **Both cannot be the intended rule.**
2. **An audit trail that names the wrong actor is not a UI defect.** `17` records
   the audit trail as a domain artefact with actor, role, timestamp and
   rationale; BRD `FR-HIS-003/006` commit to it. **Whether a record may name
   someone other than the person who acted is a compliance question**, and in a
   quality-management system feeding TSBs and safety campaigns it is not ours to
   answer.

**The charitable reading is real and does not change the conclusion:** this is
plausibly a *demo affordance* — the prototype has no role switch, so
substituting ASM lets a single-role demo show the approved state. **That is a
prototype-fidelity artefact, not a requirement** — but distinguishing "demo
scaffolding" from "specified behaviour" is precisely the judgement `00` case 2
says the prototype cannot make for us.

**[UNSPECIFIED — may an SE approve a field change request, and may an audit entry
record an actor other than the person who acted?** The canonical prototype gates
disposition approval to `override` roles and leaves change-request approval
ungated, substituting `ASM` in the record when an `SE` acts. **Resolved by:**
reading BRD §7.2–§7.4 and `FR-HIS-003/006` against both flows, with the domain
owner and whoever owns audit compliance. **Owner:** architect, with the domain
owner. **Trigger:** before the Investigation tab's change-request surface is
specified — it is unspecified today, which is the only reason this has cost
nothing yet.]**

**Not recorded as an application defect.** The app implements neither the
Investigation tab's change-request flow nor the substitution, so there is nothing
to file. It is a requirements question that must be answered **before** that
surface is built, not after.

---

## What this pass did NOT establish

- **The classification-management surface in detail.** `classVals()` was read only
  far enough to confirm the tree, the counts, expand/collapse and the pending
  queue.
- **The run-confirmation modal's contents**, beyond its per-job impact paragraph.
- **Whether a weight change recomputes existing scores.** Q9's first row, and the
  screen's largest unstated consequence.
- **BRD §7.2–§7.4's `ADMIN` role**, which governs both open questions above.

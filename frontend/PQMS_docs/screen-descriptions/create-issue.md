# Screen description — Create Issue (Issue Entry)

**Class:** Specification, authored against `29-screen-description-authoring.md`'s
ten questions. **Written from the prototype, not from the implementation.**

---

## 1 · Source and reading

| | |
|---|---|
| **Prototype file** | `docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html` |
| **md5** | `8dca6a22f65b5dda7906a77945c12435` — canonical per `00-core-rules.md` |
| **Reading** | **source read** — template and script, by symbol |
| **Date of reading** | 2026-08-26 |
| **Role** | **SE**. No role conditionality was found on this screen — unlike the other two |

## 2 · BRD screen ID and FRs

**[UNSPECIFIED — the BRD screen ID and FR list.** `INVENTORY.md` cites
`FR-ENT-004…012`, `FR-ADM-005`, `FR-DOC-001…008`, `FR-LNK-001` against this
screen's controls, second-hand. **Resolved by:** reading BRD C1.0 §8.1/§8.4 and
**Appendix C**, which the source-evidence field sets below correspond to.
**Owner:** Frontend Lead.]**

`TR-02` is **not yet satisfied** for this screen.

## 3 · Layout

`DefaultLayout` with a single-column form in collapsible sections
(`secOpen: { vehicle, classification, issue }`, all open initially), a sticky
action row, and modals layered over it. **Not a wizard** — there is no step rail,
no Next/Back, and no `cStep` state. Everything is on one page.

**This matters for `INVENTORY.md`'s `BaseStepRail` row**, which claims "Issue
Entry's step progress". See the reconciliation.

## 4 · Regions, top to bottom

| # | Region | Contents |
|---|---|---|
| 1 | App header + breadcrumb | as elsewhere |
| 2 | **Page heading** | with **Clear** and **Register Issue** |
| 3 | **Vehicle section** | Model Code combobox with a **model-year sub-panel** (`mcYearShow`) offering the union of the code's nominal years and any actually-recorded year |
| 4 | **Classification section** | four cascading comboboxes — **System → Sub-system → Component → Symptom** — each with its own no-match copy, plus **Request New** |
| 5 | **Issue section** | **Issue title** (placeholder *"e.g. EV6 — HV battery rapid SOC drop under cold soak"*), **Description** (4 rows, placeholder naming symptoms, reproduction steps, environmental conditions, frequency and safety implication) |
| 6 | **Source evidence** | a channel picker and **a different required field set per channel** — see below |
| 7 | **Existing-issue linking** | **Search & link existing issue**, then **Search & link another issue**; linked issues appear as a pending set |
| 8 | **Modals** | *Request New Classification*, *Link to Existing Issue Group?*, *Unlink Issue Group*, *Clear All Fields?* |
| 9 | **Post-registration** | **Back to Issue List** and **Open Issue Workspace** |

### Seven source channels, each with its own required fields

```js
SOURCE = { warranty:{label:'Warranty', icon:'file-warning'}, weibull:{label:'Weibull', icon:'activity'},
           comeback:{label:'Comeback', icon:'rotate-ccw'}, techline:{label:'Techline', icon:'headset'},
           fpqr:{label:'FPQR',  icon:'clipboard-list'},     ews:{label:'EWS', icon:'shield-alert'},
           gqis:{label:'GQIS',  icon:'globe'} }
```

| Channel | Required fields (from `cFormErr` keys) |
|---|---|
| Warranty | claim count, IPTV rate, from, to, dealer region |
| Weibull | analysis id, failure rate, confidence interval |
| Comeback | count, window, primary dealer, complaint |
| Techline | case no, case priority, caller name, caller role, technical summary |
| FPQR | reference, field date, location, engineer, defect count |
| EWS | threshold type, trigger value, alert date, category |
| GQIS | category code, market region |

**Seven, not eight.** `INVENTORY.md`'s `SourceEvidencePanel` row says *"eight
variants, field sets in BRD Appendix C"*. See the reconciliation.

**And the seven are a VOCABULARY, not the available set.** The Admin screen
carries `sources: { warranty:true, …, fpqr:false, … }` under the subtitle
*"Control which channels are available in the Issue Entry source dropdown."* —
so **which channels this screen offers is administrator configuration**, and
`fpqr` is off in the seed. Two distinct facts:

| | What it is | Who decides |
|---|---|---|
| the **seven keys** | a domain vocabulary | the BRD / the domain owner |
| **which of them appear here** | runtime configuration | an administrator, on the Admin screen |

**This screen does not yet read that configuration** — it renders all seven. The
consequence for the test suite is recorded in `tests/CreateIssueScreen.test.tsx`:
the pinned seven-source test asserts the *vocabulary* correctly and the
*rendered set* only accidentally, and it will fail — correctly — the day Create
Issue honours the admin toggle.

## 5 · Every control, by what it does

| Region | Control | What it does |
|---|---|---|
| 2 | **Clear** | `clearIssueForm` → opens the **"Clear All Fields?"** confirmation; `confirmClearIssueForm` performs it |
| 2 | **Register Issue** | `submitIssue` — see the gate below |
| 3 | Model Code combobox | type-ahead over `MC_MASTER`; no-match copy *"No matching model code."* |
| 3 | Model-year sub-panel | checkboxes over the **union** of the code's nominal years and years actually recorded, so a real out-of-range year still appears, checked |
| 4 | Classification combobox ×4 | cascading; each with *"No matching {level}."* |
| 4 | **Request New** | `openSysReq` → *Request New Classification* modal → `submitSysReq`. The proposed value carries a **"Pending Admin Approval"** state |
| 6 | Channel picker | selects the source; **changes which fields are required** |
| 7 | Search & link existing issue | `openSameSearch` / `toggleSameSearch` |
| 7 | Link to Group / Link Issue / Link Issues | `confirmLink` — **three labels, one handler**, varying with what is being linked |
| 7 | Unlink | `closeRelUnlink` — *"No Issue Group changes will be made until the current issue is registered."* |
| 9 | Back to Issue List | `submitReturnList` |
| 9 | Open Issue Workspace | `submitViewIssue` |

### The registration gate, stated exactly

`submitIssue()`:

1. `validateForm()`; if anything fails → set `formErr`, set `titleErrMsg` to
   *"Enter an issue title."*, and toast **danger**: *"Cannot submit issue —
   Complete the required fields highlighted in red."* **No partial save.**
2. otherwise: generate the issue number **from the System** (`genIssueNo(f.system)`),
   auto-score (`autoScore`) and derive the tier, then resolve the Issue Group.

### Issue-group resolution happens ONLY at registration, and it has a guard

The source is explicit, and both halves are contracts:

> *Resolve the final Issue Group **ONLY now, at registration**: current issue +
> pending standalones + all members of pending groups.*

> *Parent–Child chronology guard: this issue is registering NOW (its Issue Date is
> always today), so it **can only ever legitimately become a Child**. If a linked
> member's stored Issue Date is somehow later than today, letting sort-by-date
> proceed would wrongly promote this brand-new issue to Parent — **block
> registration instead**.*

Four consequences:

1. **Linking is a pending intent until Register succeeds.** The unlink copy says
   so in user-facing words. Nothing is written to any group before then.
2. **Linking to a member pulls in its whole group**, not just that issue.
3. **A new issue is always a Child**, never a Parent — which ties this screen
   directly to the Issue List's grouping rule.
4. **A future-dated linked issue blocks registration**, with an error rather than
   a silent re-parenting. This is a data-integrity guard, not validation of user
   input, and it is the kind of rule that is invariably lost in a rewrite.

**Link justifications** are collected per link and joined with `' | '` at
registration: *"This is recorded now and applied only if this relationship is
committed at registration."*

## 6 · User-facing strings, verbatim

```
Issue title *  ·  Description *  ·  Sub-system *  ·  Classification Type *
e.g. EV6 — HV battery rapid SOC drop under cold soak
Select a model code. · Select a system. · Select a sub-system. · Select a component. · Select a symptom.
Enter an issue title. · Describe the issue. · Required.
No matching model code. · No matching system.
Cannot submit issue
Complete the required fields highlighted in red.
Clear · Register Issue · Request New · Submit Request
Clear All Fields? · Cancel
Search & link existing issue · Search & link another issue
Link to Existing Issue Group? · Link to Group · Link Issue · Link Issues
Unlink Issue Group
This will remove {ids} from the pending relationship selection. No Issue Group changes will be made until the current issue is registered.
Justification *
This is recorded now and applied only if this relationship is committed at registration.
Back to Issue List · Open Issue Workspace
Pending Admin Approval
```

## 7 · Every state

| State | Prototype shows it? |
|---|---|
| **Empty form** | ✅ yes — this screen's *initial* state is empty by definition |
| **Partially filled + invalid** | ✅ yes — per-field messages, red highlight, a danger toast, **no partial save** |
| **Blocked by the chronology guard** | ✅ yes — a danger notification and registration refused |
| **Submitted** | ✅ yes — two onward actions |
| **Loading** | ❌ **[UNSPECIFIED.** **Owner:** UX, with the architect.] |
| **Empty — no match** | ✅ **yes, per combobox** — *"No matching model code."*, *"No matching system."*, and one per classification level |
| **Empty — no data** | **n/a for the form; see below for its lists** |
| **Error** | ❌ **[UNSPECIFIED** — a *submission* error, as opposed to a validation error, is not shown. `22` requires one. **Owner:** UX.] |
| **Permission-denied** | ❌ not shown |

### The two empty states — answered explicitly, per `29` Q7

**The no-match state is specified, once per combobox. The no-data state is
UNSPECIFIED and the prototype is silent, so nothing is inferred for it.**

- **No-match: specified.** Five comboboxes each carry their own copy, naming
  their own level. That is deliberate and worth preserving — a shared "No
  results" string would lose it.
- **No-data: not specified, and it is a real condition here.** A classification
  level with no children (a System whose Sub-system list is genuinely empty),
  or a Model Code with no recorded years. The prototype's seed always has data,
  so the case never renders.

**[UNSPECIFIED — the no-data state for a cascading level.** *"No matching
system."* is the wrong copy when there is nothing to match; the user has typed
nothing and filtered nothing. It plausibly wants the **Request New** affordance,
which already exists on this screen — **but the prototype does not say so, and
that is an inference, recorded as a question rather than as an answer.**
**Resolved by:** a UX decision. **Owner:** UX. **Trigger:** before the
classification cascade is implemented against a real taxonomy service, where
empty levels become possible.]**

**The linked-issue search** has a third case — a search with no results — which
is a *no-match* state and is likewise not shown, because the modal was not opened
in this pass.

## 8 · What differs per role

**Nothing was found.** No `role ===` branch, no `cap` check and no conditional
region appears on this screen, in contrast to the Issue List (three
role-dependent subtitles) and the Issue Workspace (a role-gated seventh tab).

**This is an observation, not a finding.** Absence in the prototype is absence of
information — `00` case 2 — and the BRD's authorization matrix may well restrict
who may register an issue.

**[UNSPECIFIED — who may create an issue, and whether any field is
role-restricted.** **Resolved by:** BRD §7.2–§7.4. **Owner:** architect.
**Trigger:** before role-gating anything.]**

## 9 · What the prototype does not show

| Item | Status |
|---|---|
| **Attachments** | `FR-DOC-001…008` and `INVENTORY.md`'s `BaseFileDropzone` claim this screen; **no dropzone was found in the create form** — the QIR draft has one (`qirFiles`). Recorded as not-found, not as absent |
| **Draft persistence** | not shown, and `_resetPageState` explicitly **preserves** an in-progress create form when navigating to `create` — implying drafts matter, without specifying them |
| **Duplicate/correlation suggestion** | `FR-ENT-011/012` and `CorrelationSuggestionCard` are claimed for this screen; the linking flow is search-driven here, not suggestion-driven |
| **Field-level async validation** | not expressible by a static prototype — `00` case 2 |
| **Keyboard behaviour of the cascade** | not shown, and `FR-ENT-005` makes it contractual |

## 10 · Navigation

**Into:** **New issue** on the Issue List; an Overview action item
(`on: () => this.go('create')`); *"Create issue first"* from the QIR
consolidation flow, which explicitly redirects here.

**Out:**

| Trigger | Destination |
|---|---|
| Back to Issue List | the list |
| Open Issue Workspace | the new issue's workspace |
| Request New / Link / Unlink / Clear | modals, not routes |

---

# Reconciliation against the implementation

| # | Canonical prototype | Implementation | Verdict |
|---|---|---|---|
| 1 | Single-page sectioned form; **no step rail** | **[not verified in this pass]** | see finding below |
| 2 | **Seven** source channels | **[not verified in this pass]** | ⚠️ **FINDING vs `INVENTORY.md`** |
| 3 | Model-year picker = **union** of nominal and recorded years | **not implemented** | ⚠️ **FINDING — already tracked** |
| 4 | Group resolved only at registration; new issue is always a Child | **not implemented** — the app has no grouping | ⚠️ **ESCALATED — see below** |
| 5 | Chronology guard blocks registration | **not implemented** | ⚠️ **ESCALATED — same question** |
| 6 | Validation copy, per field and per channel | **[not verified in this pass]** | open |

### FINDING — `BaseStepRail` claims a step progress this screen does not have (row 1)

`INVENTORY.md` lists `BaseStepRail` at **High**, driven by *"Issue Entry's step
progress"*, and notes it *"interacts with WCAG 3.3.7 Redundant Entry, which `11`
marks live"*. **The canonical prototype's Issue Entry is not a stepped flow.** No
step rail, no Next/Back, no step state — one page with collapsible sections.

**This is a High-confidence row with no counterpart in the design**, and it is a
second instance of the pattern the `Confirmed` field was introduced for. It is
**not deleted**: a step rail may belong to a flow this pass did not read.
Recorded as **not confirmed**.

### FINDING — seven source channels, not eight (row 2)

`SourceEvidencePanel` is described as *"One per channel, eight variants, field
sets in BRD Appendix C"*. The canonical prototype has **seven**: Warranty,
Weibull, Comeback, Techline, FPQR, EWS, GQIS.

**A count is not a shape disagreement**, and the BRD may name an eighth the
design dropped or has yet to add. It is small, it is cheap to check, and it is
exactly the kind of off-by-one that becomes an unimplemented variant.
**Resolved by:** reading BRD Appendix C. **Owner:** Frontend Lead.

### FINDING — the model-year union (row 3)

`issues/ism-v4-v5-gap-analysis.md` item 6 already records this as **NOT DONE**.
Listed so the two records agree.

### ESCALATED — issue grouping reaches this screen too (rows 4 and 5)

The Issue List's grouping escalation is **not confined to the list**. This screen
*creates* the groups, and it carries two rules that exist nowhere else:

1. **A newly registered issue can only ever be a Child.** That is asserted here,
   and the list's *"the Parent is the earliest-registered member"* depends on it.
2. **A future-dated linked member blocks registration outright.** A guard, not a
   validation message.

Both are unimplementable until the relationship model is decided, and both would
be lost by an implementation that treats linking as "save an array of ids".

**No new placeholder is opened.** This is the **same** question already recorded
in `component-specs/RECONCILIATION-issue-list.md` — *is the relationship model a
link-count column or grouped parent/child rows?* — and it is recorded here to
show its blast radius: **the question spans at least two screens, and the second
one holds rules the first does not express.**

**Owner:** architect, with the domain owner, as recorded there.

---

## What this pass did NOT establish

- **The app's Create Issue implementation**, beyond the model-year gap already
  tracked. Four rows above are marked *not verified*.
- **Whether an attachment surface exists on this screen at all.** None was found;
  that is not the same as none existing.
- **The linked-issue search modal's interior**, including its no-results state.
- **BRD Appendix C's channel list**, which settles the seven-versus-eight
  question.

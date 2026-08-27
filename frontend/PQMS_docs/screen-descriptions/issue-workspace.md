# Screen description — Issue Workspace

**Class:** Specification, authored against `29-screen-description-authoring.md`'s
ten questions. **Written from the prototype, not from the implementation.**

---

## 1 · Source and reading

| | |
|---|---|
| **Prototype file** | `docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html` |
| **md5** | `8dca6a22f65b5dda7906a77945c12435` — canonical per `00-core-rules.md` |
| **Reading** | **source read** — `<x-dc>` template and `<script data-dc-script>`, by symbol |
| **Date of reading** | 2026-08-26 |
| **Role** | **SE** by default; the source carries **three** roles and this screen's structure changes with them — Q8 |

## 2 · BRD screen ID and FRs

**[UNSPECIFIED — the BRD screen ID and FR list.** `INVENTORY.md` cites
`FR-WSP-016`, `FR-WSP-020…027`, `FR-RES-003/004/007`, `FR-INV-007/009` against
this screen's controls, second-hand. **Resolved by:** reading BRD C1.0 §8.1/§8.4
directly. **Owner:** Frontend Lead.]**

`TR-02` is **not yet satisfied** for this screen.

## 3 · Layout

`DefaultLayout` with a **workspace header** (issue identity, status chip,
severity badge, owner and assignee) above a **horizontal tab rail**, and one tab
panel below. The page scrolls as a whole; the Issue Detail tab uses a two-column
workflow layout that is **replaced full-width** while `editMode` is on.

## 4 · Regions, top to bottom

| # | Region | Contents |
|---|---|---|
| 1 | App header + breadcrumb | as the Issue List |
| 2 | **Issue header** | issue id, title, **status chip** (`statusBits`), **severity badge** (62 px tile: value + tier), **EWS marker** when the source is EWS, **owner** and **assignee** blocks with avatars and roles, and a **Priority chip once scored** |
| 3 | **Header actions** | **Edit issue**, **Change status**, **Create QIR** |
| 4 | **Tab rail** | six tabs for SE, **seven for ASM/PQM** — see below |
| 5 | **Tab panel** | the selected tab's content |
| 6 | **Approval bar** | shown when a disposition awaits this role's decision: *"Disposition decision · requested by {owner} · awaiting {role} sign-off"* with **Reject** and **Approve disposition** |

### The tab set is role-conditional

```js
const tabDefs = [
  { k:'overview',      l:'Issue Detail',   i:'layout-panel-left' },
  { k:'investigation', l:'Investigation',  i:'microscope' },
  { k:'priority',      l:'Issue Priority', i:'gauge' },
  { k:'resolution',    l:'Resolution',     i:'git-branch' },
  { k:'communication', l:'Communication',  i:'messages-square', b: commCount||null },
  { k:'activity',      l:'History',        i:'history' },
].concat(canApproveTabs ? [{ k:'sharing', l:'Sharing', i:'building-2' }] : [])

const canApproveTabs = (role === 'ASM' || role === 'PQM')
```

**A seventh tab, `Sharing`, exists only for ASM and PQM.** This is
role-conditional *structure*, not role-conditional copy, and it is the clearest
single refutation of the earlier claim that the prototype ships one role.

**Only Communication carries a badge** — the comment count, hidden at zero.

### Legacy tab keys are aliased, and that is a routing contract

```js
const _tabAlias = { actions:'investigation', parts:'resolution', disposition:'resolution',
                    qir:'resolution', severity:'overview', timeline:'activity',
                    chronology:'activity', history:'activity' }
```

Eight old keys resolve to five current tabs. If tab identity ever reaches a URL,
**these aliases are the redirect table** and dropping them breaks saved links.

## 5 · Every control, by what it does

| Region | Control | What it does |
|---|---|---|
| 3 | Edit issue | `startEdit` — replaces the workflow layout with a full-width edit form |
| 3 | Change status | `openStatusModalWs` — a gated status change |
| 3 | Create QIR | `openCreateQirFromWs` — **refused unless the issue's priority is saved**; it switches to the Priority tab and warns instead |
| 4 | Tab ×6 (×7) | `setTab` |
| 5 | Priority matrix | 17 items in 3 categories, 1–3 points each; total → letter (**≥26 → A, ≥11 → B, else C**); manual override with the calculated letter still shown and a reset; **nothing persists until Save** |
| 5 | Propose disposition | `proposeDisposition` — see the lifecycle below |
| 6 | Approve disposition | `approveDisposition` |
| 6 | Reject | `rejectDisposition` — returns the issue to `open` |
| 5 | Return to Registration | `returnToRegistration` |
| 5 | Raise a Request | `openSysChangeReq` — proposes a classification change for admin approval |

### The propose → approve lifecycle, stated exactly

**Propose** (`proposeDisposition`):

1. no disposition selected → *"Select a disposition option."*
2. disposition is **No Action** and the rationale is **under 30 characters** →
   *"No Action requires a justification of at least 30 characters."*
3. any other disposition with an empty rationale → *"Document the decision
   rationale."*
4. otherwise: status → **`pending`**, `nextAction` → "Disposition approval",
   audit entry *"Disposition proposed ({label}) — {reason}"*, toast **"Disposition
   submitted for approval"** — routed *"to ASM / PQM for sign-off"*, or, for a
   **Safety Campaign**, *"PQM and Director notified."*

**Approve** (`approveDisposition`): status → **`monitoring`** if the disposition
is Monitoring, else **`disposed`**; `nextAction` → "Periodic review" or "Monitor
effectiveness"; records approver and date; drafts a TSB when the disposition is
TSB.

**Reject** (`rejectDisposition`): status → **`open`**.

**Three rules an implementation would otherwise invent:**

- the 30-character floor applies **only to No Action**, not to every rationale;
- Safety Campaign has a **different escalation path** from every other
  disposition;
- approval **branches the target status** on the disposition — this is not one
  transition with a payload.

## 6 · User-facing strings, verbatim

```
Issue Detail · Investigation · Issue Priority · Resolution · Communication · History · Sharing
Edit issue · Change status · Create QIR · Save changes · Cancel
Disposition decision · requested by {owner} · awaiting {role} sign-off
Reject · Approve disposition
Select a disposition option.
No Action requires a justification of at least 30 characters.
Document the decision rationale.
Disposition submitted for approval
Safety Campaign — PQM and Director notified.
Routed to ASM / PQM for sign-off.
Disposition approved
Return to Registration · Raise a Request
Admin comment:
Approved by · Approved on
```

## 7 · Every state

| State | Prototype shows it? |
|---|---|
| **Content** | ✅ yes |
| **Edit mode** | ✅ yes — a distinct full-width layout, with a cancel confirmation (`requestCancelEdit`) |
| **Awaiting approval** | ✅ yes — the approval bar, gated on role |
| **Unscored priority** | ✅ yes — the header chip is **absent**, not defaulted; Create QIR is disabled |
| **Loading** | ❌ **[UNSPECIFIED.** **Owner:** UX, with the architect.] |
| **Empty — no data** | **n/a** — see below |
| **Empty — no match** | ❌ **[UNSPECIFIED** — see below] |
| **Error** | ❌ **[UNSPECIFIED.** `22` requires one. **Owner:** UX.] |
| **Stale** | ❌ not shown |
| **Permission-denied** | ❌ **not shown, and that is a gap with teeth** — see Q8 |

### The two empty states — answered explicitly, per `29` Q7

**Neither is specified, and unlike the Issue List, only one of the two is even
meaningful.**

- **Empty — no data does not apply to the screen.** A workspace always has an
  issue; if it does not, the correct response is **not found**, which is a
  different state entirely and is also unspecified.
- **Empty — no match applies *within tabs*, and each one differs.** History with
  a filter that matches nothing, Communication with no comments, Resolution with
  no parts request, Investigation with no findings. The source shows populated
  seed data for all of them.

**[UNSPECIFIED — the per-tab empty states, and the not-found state.**
**Do not reason by analogy from the Issue List's "No issues match these
filters".** Communication-with-no-comments is a *first-use* state that should
invite the first comment; History-with-a-filter is a *recovery* state that should
offer to clear it. They are the two different empty states again, one level down,
and the prototype specifies neither. **Resolved by:** a UX decision per tab.
**Owner:** UX. **Trigger:** before any tab's empty rendering is written.]**

## 8 · What differs per role

**Three roles exist in the source and the screen changes structurally between
them:**

```js
USERS = {
  SE:  { name:'Arpita Chavda',  role:'Service Eng.',    cap:'read'     },
  ASM: { name:'Park Soo-jin',   role:'Area Service Mgr', cap:'override' },
  PQM: { name:'Seo-yeon Park',  role:'Product Quality',  cap:'override' },
}
```

| Difference | SE | ASM / PQM |
|---|---|---|
| **Sharing tab** | absent | **present** |
| **Approval bar** | not shown | shown when a disposition is pending |
| **`cap`** | `read` | `override` |

**[UNSPECIFIED — two of BRD §7.3's five roles have no representation at all.**
The prototype has SE, ASM and PQM; the BRD has those plus ADMIN and VIEWER; the
app's `RoleKey` has SE, ASM, PQM and ADMIN. **Three different role sets, none a
subset of another in a way that resolves the other two.** **Resolved by:** the
BRD's §7.2–§7.4 authorization matrix, which `08` already treats as governing.
**Owner:** architect. **Trigger:** before role-gating any control on this
screen.]**

**And no permission-denied state is shown.** An SE who reaches a URL for an
ASM-only surface has no specified outcome. `08`'s server-resolved permission
model makes this a real path, not a hypothetical.

## 9 · What the prototype does not show

| Item | Status |
|---|---|
| **Tab identity in the URL** | not shown — tabs are component state, and `_tabAlias` implies they once were addressable |
| **Focus management on tab change** | not shown |
| **Concurrent edit** | not shown — two approvers on one issue is unmodelled |
| **Optimistic vs pessimistic save** | not expressible by a static prototype — `00` case 2 |
| **What Sharing contains** | not read in this pass; it renders only for ASM/PQM |

## 10 · Navigation

**Into:** an Issue ID cell in the list; an Overview action item; a linked-issue
card.

**Out:**

| Trigger | Destination |
|---|---|
| Create QIR | the QIR creation flow — **blocked while priority is unscored** |
| Return to Registration | the registration surface |
| a linked-issue card | that issue's workspace |
| Change status / Raise a Request | modals, not routes |

---

# Reconciliation against the implementation

| # | Canonical prototype | Implementation | Verdict |
|---|---|---|---|
| 1 | Six tabs for SE, labels as listed | Priority tab registered between Investigation and Resolution | ✅ matches |
| 2 | **Seventh `Sharing` tab for ASM/PQM** | **not implemented** | ⚠️ **FINDING** |
| 3 | Priority matrix, bands ≥26 → A / ≥11 → B, draft-until-save | ported verbatim (`data/priorityMatrix.ts`, `PriorityTab.tsx`) | ✅ matches |
| 4 | Create QIR gated on saved priority | `canQir` requires `priority.scored` | ✅ matches |
| 5 | Header priority chip only once scored | implemented | ✅ matches |
| 6 | **Propose writes status `pending`; approve writes `disposed`** | `pendingApproval?: boolean` — a **flag**, not a status | ⚠️ **ESCALATED — see below** |
| 7 | `_tabAlias` — eight legacy keys | not implemented | open — harmless until tabs are addressable |
| 8 | `_resetPageState()` on every navigation | **not implemented** | ⚠️ **FINDING — already tracked** |

### FINDING — the Sharing tab (row 2)

Absent from the app. It renders only for ASM/PQM, and the app ships one role, so
this is downstream of the role question rather than a separate defect. Recorded
so it is not discovered as a surprise when roles land.

### FINDING — navigation state hygiene (row 8)

`issues/ism-v4-v5-gap-analysis.md` item 4 already records `_resetPageState()` as
**NOT DONE** and calls it *"the highest-value remaining item — a bug-class fix,
not cosmetics"*. Nothing changes here; it is listed so the two records agree.

### ESCALATED — the status vocabulary does not contain the lifecycle's own values

**This is the `LinkedCountCell`-class finding for this screen, and it is worse
than the list's, because it is an inconsistency *inside the prototype*.**

The propose→approve flow writes two status values:

| Written by | Status value | In `STATUS` (the pill / KPI / filter map)? | In `issueLifecycle`? |
|---|---|---|---|
| `proposeDisposition` | **`pending`** | ❌ **no** | ❌ **no** |
| `approveDisposition` | **`disposed`** | ❌ **no** | ✅ yes — *"Disposition"* |
| `approveDisposition` (Monitoring) | `monitoring` | ✅ yes | ✅ yes |
| `rejectDisposition` | `open` | ✅ yes | ✅ yes |

**Three vocabularies, three different sets:**

1. `STATUS` — 7 values: `open` · `review` · `monitoring` · `escalated` ·
   `topissue` · `outofscope` · `closed`
2. `issueLifecycle` — 8 keys: the above **minus nothing, plus `disposed`**
3. what the workflow **writes**: `pending`, `disposed`, `monitoring`, `open`

**And the fallback hides it.** `statusBits(st)` is:

```js
statusBits(st){ const m = this.STATUS[st] || this.STATUS.open; ... }
```

So an issue awaiting disposition approval — status `pending` — **renders a blue
pill reading "Open"** in the list, in the workspace header, and everywhere else.
Meanwhile `_stc(k)` counts by exact status match, so that issue is counted by
**no KPI tile at all**. It displays as Open and counts as nothing.

**Why this is a requirements question and not a bug to fix here:**

1. **The 2026-08-23 directive adopted the prototype's status vocabulary
   verbatim — seven values.** That directive was taken from the same file that
   writes two values outside it. Whichever way this resolves, the directive's
   basis needs restating.
2. **The app made a different choice and it may be the right one.**
   `pendingApproval?: boolean` keeps the status vocabulary closed and models
   awaiting-approval as an orthogonal flag. That is arguably better design — and
   it is a *decision*, which is exactly why it must not be made by whoever writes
   the next component.
3. **`disposed` and `closed` may or may not be the same terminal state.** The
   prototype has both. Nothing says how they differ, and the difference between
   "we decided" and "we finished" is a domain fact, not a naming preference.

**[UNSPECIFIED — is `pending` a status, a flag, or neither; and is `disposed`
distinct from `closed`?** The canonical prototype writes both as statuses while
its own status map contains neither, and renders them as "Open" by fallback. The
app models the first as a boolean flag and does not model the second. BRD §9.3
carries the valid-transition table and was not read for this description.
**Resolved by:** reading BRD §9.3 and the disposition requirements
(`FR-RES-003/004/007`) against these four writes, with the domain owner.
**Owner:** architect, with the domain owner. **Trigger:** before **any** status
work — the pill, the KPI tiles, the status-change modal and the filter all read
the same map, so this blocks four components rather than one.]**

**Do not "fix" the prototype's fallback and do not adopt `pending` as an eighth
status.** Either move decides the question by accident.

---

## What this pass did NOT establish

- **The Sharing tab's contents.** It renders only for ASM/PQM.
- **The Investigation, Resolution, Communication and History tab interiors.** This
  pass covered the shell, the role conditionality and the disposition lifecycle.
  Each tab is comparable in size to a screen.
- **BRD §9.3's transition table**, which governs row 6's resolution.
- **Whether the app's `pendingApproval` flag reaches parity** with the
  prototype's routing, notification and audit behaviour.

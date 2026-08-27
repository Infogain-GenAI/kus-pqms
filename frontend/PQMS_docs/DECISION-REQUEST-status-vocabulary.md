# Decision request — the issue status vocabulary, and whether the 2026-08-23 directive survives

**To:** Frontend architect · Domain owner (N-PQMS quality process)
**From:** Frontend restructuring work, N-PQMS ISM portal
**Date:** 2026-08-26
**Decision needed by:** before any further status work. It blocks four components.

**This document is self-contained.** It assumes no prior reading. Nothing here
requires opening another file.

**This is not a code question and must not be resolved in the repository.** Which
states an issue may occupy is a business fact. Every option below is
implementable in a day; picking one by implementing it is the failure mode this
document exists to prevent.

---

## In one paragraph

An issue in this system has a **status** — Open, Investigating, Closed and so on.
That list has been decided **four times in four months, by four different
authorities, and no two of them agree.** The most recent decision took the list
verbatim from the UX prototype. We have now read that prototype's source code and
found that **it contradicts itself on exactly this point**: its own workflow
writes two status values that its own status list does not contain, and the
consequence is visible in the running prototype — an issue awaiting management
sign-off displays as **"Open"** and is counted in **no** dashboard tile. The
question for the architect is short: *was the 2026-08-23 directive taken on a
complete reading of the prototype, and does it survive knowing this?*

---

## The chain, in order

Nobody outside this work can reconstruct this, so it is stated in full.

### 1 · The Vue implementation shipped **ten** statuses

The previous implementation (`kus-pqms`, `src/api/issues.ts`) carried:

> `draft` · `open` · `review` · `pendingApproval` · `monitoring` · `escalated` ·
> `topissue` · `resolved` · `outofscope` · `closed`

Real, shipped code. Its own source comment describes the set as a **deliberate
superset** of a UX mockup's eight statuses, with `draft` and `pendingApproval`
added by the implementation. **A shipped value is evidence of what was built, not
of what was agreed.**

### 2 · BRD `DEC-01` ratified **eight**, removing both — with mitigations

BRD C1.0 §9.1, ratified as `DEC-01`:

> `OPEN` · `INVESTIGATING` · `MONITORING` · `QIR_ESCALATION` · `TOP_ISSUE` ·
> `RESOLVED` · `OUT_OF_SCOPE` · `CLOSED`

The two removals were **deliberate and reasoned**, and the reasoning is the part
that matters here:

- **`draft` is not a status.** An issue exists only once registered. The entry
  form's working copy is a per-user *entry draft* (BRD `FR-ENT-030`…`034`) with no
  Issue ID, invisible in every list, count, export and search, purged at 30 days.
  A different entity.
- **`pendingApproval` is not a status.** **Approval is a property of a
  *transition*, not a state.** A gated transition creates a `PROPOSED` lifecycle
  record; the issue's own status is unchanged until an `override` role approves it
  (BRD `§9.4`). A `PENDING_APPROVAL` member would make the `§9.3` transition
  matrix unrepresentable.

**Remember this mitigation. It reappears twice below, unprompted.**

### 3 · The 2026-08-23 directive superseded that, in favour of the prototype's **seven**

A directive that *every user interface shows the UX prototype's values*, taken
**verbatim**, explicitly superseding the eight-status decision:

> `open` "Open" · `review` "Investigating" · `monitoring` "Monitoring" ·
> `escalated` "QIR" · `topissue` "Top Issue" · `outofscope` "NASO" ·
> `closed` "Closed"

This is what the application implements today. Note what changed beyond the
count: `RESOLVED` **disappeared entirely**, and `OUT_OF_SCOPE` became **"NASO"** —
a user-facing label change, not a rename of an internal key.

### 4 · The prototype is internally inconsistent about exactly this

Read from the canonical prototype source
(`ISM + QIR SE Role - P_C.dc.html`, md5 `8dca6a22…`, synced 2026-08-24).

Its status list is the seven above:

```js
STATUS = { open:{label:'Open'}, review:{label:'Investigating'},
           monitoring:{label:'Monitoring'}, escalated:{label:'QIR'},
           topissue:{label:'Top Issue'}, outofscope:{label:'NASO'},
           closed:{label:'Closed'} }
```

**Its own disposition workflow writes two values that are not in it:**

```js
proposeDisposition(){ … this.updateIssue(id, { status:'pending', … }) }        // ← not in STATUS
approveDisposition(){ … this.updateIssue(id, { status: mon ? 'monitoring'
                                                          : 'disposed', … }) } // ← 'disposed' not in STATUS
rejectDisposition(){  … this.updateIssue(id, { status:'open', … }) }
```

**And the lookup silently hides it:**

```js
statusBits(st){ const m = this.STATUS[st] || this.STATUS.open;  …  }
//                                        ^^^^^^^^^^^^^^^^^^^ unknown status → renders as Open
```

**So, in the running prototype, an issue awaiting management sign-off:**

- **displays a blue pill reading "Open"** — in the issue list, in the workspace
  header, in every place a status appears;
- **is counted by no dashboard tile**, because the tile counts are exact matches
  (`issues.filter(i => i.status === k)`) and no tile counts `pending`;
- **is indistinguishable from an issue nobody has touched.**

There is a third, quieter symptom. A *fourth* status name, `disposed`, exists in
a **separate** lookup used for a different label:

```js
issueLifecycle(st){ return ({ open:'Investigation', review:'Investigating',
    escalated:'QIR', topissue:'Top Issue', outofscope:'NASO',
    disposed:'Disposition', monitoring:'Monitoring', closed:'Closed' })[st] || 'Investigation' }
```

**Eight keys here, seven there, and the two lists are not the same seven.** One
knows `disposed`; the other does not. Neither knows `pending`.

**None of this is visible in a screenshot.** It was found by reading the source.

### 5 · The application arrived independently at `DEC-01`'s mitigation

The React app does not have a `pending` status. It models approval as a property
of the transition:

```ts
proposeTransition(id, target, rationale, actor, outcome) {
  // Proposals never change the visible status (the prototype has no "Pending Approval"
  // status) — the proposal fields drive the ApprovalBar until an override role decides.
  touch(id, { proposedStatus: target, proposalRationale: rationale, proposedBy: actor.name, … })
}
approveProposal(id, remark, actor) { /* status ← proposedStatus, proposal fields cleared */ }
rejectProposal(id, remark, actor)  { /* proposal fields cleared, status untouched */ }
```

**That is `DEC-01`'s mitigation, implemented.** A proposal record; the issue's own
status unchanged until an override role decides. Nobody appears to have set out
to satisfy `DEC-01` — the code's own justification cites the prototype.

**And the code's justification is half true.** *"The prototype has no 'Pending
Approval' status"* is correct about the prototype's `STATUS` map and **wrong about
the prototype's behaviour**, which writes `pending` on every proposal. The right
answer was reached from a wrong reading, which is not a durable place to leave it.

### 6 · There is a **fourth** vocabulary, and nobody has mentioned it

The design system is vendored into this project as a byte-for-byte copy. **Its
colour tokens carry a status list of their own:**

```css
--status-draft:    #6B7681;   /* Gray      — Draft */
--status-open:     #2A6FDB;   /* Blue      — Open */
--status-review:   #7C5CDB;   /* Purple    — In Review */
--status-pending:  #E2820B;   /* Orange    — Pending Approval */
--status-disposed: #0E9384;   /* Teal      — Disposed */
--status-closed:   #344049;   /* Dark Gray — Closed */
--status-monitor:  #D9A60B;   /* Yellow    — Monitoring */
--status-escalated:#D92D20;   /* Red       — Escalated */
```

and the design system's own documentation card is captioned:

> **"The 8 canonical N-PQMS workflow statuses"**

**These are eight — and they are not `DEC-01`'s eight.** They include `draft`,
`pending` and `disposed`; they omit `TOP_ISSUE`, `RESOLVED` and `OUT_OF_SCOPE`.

**The design system has a colour for `Pending Approval` and a colour for
`Disposed`** — precisely the two values the prototype writes and the prototype's
own status map lacks. Whatever the prototype's `STATUS` map says, **something
upstream of it expected those two states to exist and to be shown.**

There is a further hazard in the same list: `--status-escalated` is `#D92D20`
(red), but the prototype colours `escalated` (QIR) **orange** `#D97706` and uses
that red for `topissue`. **The token named for one status holds the hue of
another.** The application works around it — `topissue` binds to `--danger-500`
and QIR orange is left as a literal — which is why the token gate reports two
colours with no token.

---

## Where the four vocabularies actually stand

| Value | Vue (10) | BRD `DEC-01` (8) | Design-system tokens (8) | Prototype `STATUS` (7) | Prototype **writes** | App today |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| draft | ✅ | ❌ removed | ✅ `--status-draft` | ❌ | — | ❌ |
| open | ✅ | ✅ `OPEN` | ✅ | ✅ | ✅ | ✅ |
| review / investigating | ✅ | ✅ `INVESTIGATING` | ✅ | ✅ | — | ✅ |
| **pendingApproval** | ✅ | ❌ **removed, with mitigation** | ✅ **`--status-pending`** | ❌ | ✅ **written** | ❌ *(modelled as a transition)* |
| monitoring | ✅ | ✅ `MONITORING` | ✅ `--status-monitor` | ✅ | ✅ | ✅ |
| escalated / QIR | ✅ | ✅ `QIR_ESCALATION` | ✅ *(wrong hue)* | ✅ | — | ✅ |
| topissue | ✅ | ✅ `TOP_ISSUE` | ❌ **no hue** | ✅ | — | ✅ |
| resolved | ✅ | ✅ `RESOLVED` | ❌ | ❌ | — | ❌ |
| **disposed** | ❌ | ❌ | ✅ **`--status-disposed`** | ❌ | ✅ **written** | ❌ |
| outofscope / NASO | ✅ | ✅ `OUT_OF_SCOPE` | ❌ **no hue** | ✅ | — | ✅ |
| closed | ✅ | ✅ `CLOSED` | ✅ | ✅ | ✅ | ✅ |

**No two columns agree.** Two values (`pending`, `disposed`) are written by the
prototype, have design-system colours, and appear in **neither** the BRD's list
nor the prototype's own. Two values (`topissue`, `outofscope`) are in the BRD and
the prototype and have **no design-system colour at all**.

---

## The question we need answered

> **Was the 2026-08-23 directive — "every user interface shows the UX prototype's
> values", taken verbatim — made on a complete reading of the prototype?**
>
> **And does it survive knowing that the prototype contradicts itself here: that
> its workflow writes `pending` and `disposed`, that its own status map contains
> neither, and that an issue awaiting sign-off therefore renders as "Open" and is
> counted nowhere?**

Two sub-questions follow from whichever way that goes, and both need explicit
answers rather than being inherited:

1. **Is `pending` a status, or is approval a property of a transition?**
   `DEC-01` said the latter, with reasoning. The app implements the latter. The
   prototype writes the former and the design system has a colour for it.
2. **Are `disposed` and `closed` the same terminal state?** The prototype has
   both; `disposed` means *a disposition was decided*, `closed` means
   *the investigation concluded*. Nothing on record says whether an issue passes
   through both, or whether they are alternatives. **The difference between "we
   decided" and "we finished" is a domain fact.**

**No recommendation is offered, and that is deliberate.** Each of the four
authorities is legitimate in its own domain — the BRD governs behaviour, the
prototype governs what users see, the design system governs colour, and the
shipped Vue code is evidence of practice. This is precisely the collision that
cannot be resolved by whoever writes the next component.

---

## Blast radius — why this cannot be deferred quietly

Six places read this vocabulary. Each is currently consistent with a *different*
member of the chain above.

| # | Where | What it holds now | What is at stake |
|---|---|---|---|
| 1 | **`02-typescript-standards.md`** — the `ISSUE_STATUS` union | `DEC-01`'s **eight**, `SCREAMING_SNAKE`, with the removal reasoning written into the standard | The standard and the code **already disagree**. 02 says eight; `statusMap.ts` ships seven, lowercase. One of them is wrong today |
| 2 | **`17-domain-glossary…md`** — the status table | The same **eight**, with a meaning and a terminal flag per value | 02 and 17 carry a stated rule: *"two files must not disagree about the same domain type — if the union changes, 17 changes with it."* Both must move together |
| 3 | **`06-styling-and-design-tokens.md`** — status colour | A mapping table from `DEC-01`'s eight to prototype names, plus an **open placeholder for hues for `TOP_ISSUE` and `OUT_OF_SCOPE`** | **That placeholder asks the designer for hues for two `DEC-01` names this app does not use.** If the seven stand, the request is for `topissue` and `outofscope` and should be reworded; if the eight stand, it is correct and the app is wrong. **The placeholder cannot be actioned until this is decided** |
| 4 | **`packages/ui-library/src/components/core/statusMap.ts`** | The prototype's **seven**, cited to the 2026-08-23 directive; consumed by `StatusBadge`, `StatusPill`, `StatusIndicator` | It is a vendored-design-system-adjacent file with two hard-coded colours (QIR orange, NASO brown) that have no token, *because* the token set is the fourth vocabulary above |
| 5 | **Every KPI tile that filters by status** | Five tiles on the Issue List filter by exact status match | A status outside the map is **counted by no tile**. This is the mechanism by which a `pending` issue disappears from the dashboard |
| 6 | **`StatusChangeDialog`** *(unspecified)* | Its valid-target list is meant to come from BRD `§9.3` | **Cannot be specified at all** while two lifecycle values sit outside the vocabulary. Its transition matrix has no complete domain to range over |

**Add the four design-system colour tokens** — `--status-draft`, `--status-pending`,
`--status-disposed` are shipped and referenced by nothing in the app, while two
statuses the app *does* render have no token. That asymmetry is a symptom of this
decision never having been made, not a separate problem.

---

## What we will do with each answer

Stated so the decision has visible consequences, and so nobody has to guess what
we will infer.

| If the answer is | We will |
|---|---|
| **The directive stands — seven, verbatim** | Keep `statusMap.ts` as is. **Amend `02` and `17`** to seven, recording that `DEC-01` is superseded for this vocabulary and that `RESOLVED` is retired. **Reword `06`'s hue placeholder** to ask for `topissue` and `outofscope`. Keep the app's transition-property model and **remove the prototype's `pending`/`disposed` writes from consideration as design intent** |
| **`DEC-01` stands — eight, ratified** | The app is wrong in a user-visible way: `NASO` becomes `Out of Scope`, `RESOLVED` returns, and every seed row is re-keyed. **A migration, not an edit.** `06`'s placeholder is correct as written |
| **Seven plus a transition model, explicitly** | Nothing changes in code — but `02`, `17` and `06` are amended to *say so*, and the app's `proposeTransition` comment is corrected, because it is currently right for a wrong reason |
| **`disposed` is distinct from `closed`** | An eighth (or ninth) value enters whichever set wins, `§9.3`'s matrix gains a transition, and the design system's `--status-disposed` finally has a consumer |

**We will not choose by implementing.** Until this is answered, no status work is
started, `StatusChangeDialog` is not specified, and `06`'s hue placeholder stays
open.

---

## Summary

- The status list has been decided **four times**, by four authorities, and **no
  two agree**.
- The most recent decision took it verbatim from a prototype that **contradicts
  itself on this exact point** — writing two values its own list does not contain,
  and rendering them as "Open".
- The **design system has colours for exactly those two values**, which suggests
  something upstream expected them to exist.
- The application independently implemented **`DEC-01`'s mitigation** — approval
  as a transition property — for a reason that is half wrong.
- **Six places** depend on the answer, and two corpus files **already disagree
  with the shipped code**.

**The question is one sentence: was the directive taken on a complete reading,
and does it survive this?**

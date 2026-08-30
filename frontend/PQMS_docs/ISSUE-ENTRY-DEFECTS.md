# Issue Entry — open items

**Supersedes the 2026-08-30 morning version of this file.** That one listed the
state before the classification-combobox, invented-element, small-defect,
empty-header and in-block-linking passes. Items closed by those are not repeated
here; this is what is STILL divergent.

**Source:** `docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html`
— the canonical artefact per `00-core-rules.md`, confirmed by content lineage
(`PRI_MATRIX`, `_resetPageState`, `_priorityInherited`). Not `PQMS.html`, which
is a flattening of the superseded 2026-08-22 generation.

Sizes: **XS** minutes · **S** under an hour · **M** half a day · **L** more.

---

## The root cause behind both regions Yogesh flagged

Our `SuggestionRow` is a **single flex row** — id, title, status, one button.
The design's card is a **block card**: an actions row on top, then the title on
its own line, then a meta line, then optional annotations. Every item 1–8 below
is a consequence of that one structural difference, so they are one fix, not
eight. The same row is reused by the search-results list, which is why both
regions are wrong in the same way.

Derived from the canonical's `sc-for` over `sameEntries` — its bindings, in
order: `e.id, e.statusPill, e.statusLabel, e.linked, e.onViewHistory, e.onLink,
e.linkBtnStyle, e.linkIcon, e.linkLabel, e.title, e.metaLine, e.isManualOnly,
e.hasSuggestReasons, e.reasonsText` — then the group branch.

| # | Item | Size |
|---|---|---|
| 1 | Card is a flat row; must become a block card (actions row · title line · meta line) | **M** |
| 2 | **View History** button absent (`history` icon, 34px). **Checked: the data and renderer already exist** — `store.activitiesFor` / `store.auditFor`, rendered by `workspace/HistorySection.tsx`. This is wrapping that in a modal, not building history | **S** |
| 3 | **"Suggested because: {reasons}"** absent, with `sparkles` icon. `relatedRank` already computes `reasons[]` and **confirmed today they are still referenced only in comments** — pure wiring | **S** |
| 4 | **Meta line** absent — `Model: … · Classification: … · Issue Date: …`, two spaces either side of each `·`, each field falling back to `—` | **S** |
| 5 | **"Linked" pill** on the card absent (`link` icon, 10.5px/700, #15724A on #E7F6EF) | **S** |
| 6 | Link button uses our `variant` mapping, not the design's two explicit styles: filled `--kia-midnight` when unlinked, `#F6FCF9`/`#CDE9DC`/`#15724A` outline when linked. Labels and the unconditional `link-2` icon are already correct | **S** |
| 7 | Issue ID typography — design is 11.5px/600 `--accent-700`; ours is `--fs-body-sm` / `--text-secondary` | **XS** |
| 8 | Status uses our `StatusBadge`; design uses an inline pill, 26px tall, `${color}1A` fill with `${color}` text | **S** |

## Group / parent-child cards

| # | Item | Size |
|---|---|---|
| 9 | Group card branch entirely absent — `Issue Group · N Issues` header, parent block with `Parent` badge, `Show/Hide Child Issues (N)` expander, child rows with `Child` badges, and `Link to Issue Group` / `Unlink from Issue Group`. Needs group data in the store, so this is the largest item | **L** |
| 10 | Search-result group variant additionally shows `git-branch`, `crown` and `corner-down-right` icons and a `Standalone Issue` badge that the suggestion card omits — a real asymmetry in the design, not an oversight | **S** on top of 9 |

## Linking behaviour

| # | Item | Size |
|---|---|---|
| 11 | Already-linked issues outside the top 8 are not appended to the list with a **"Manually linked"** note (`e.isManualOnly`). Today, linking an unranked issue makes it vanish from the panel | **M** |
| 12 | **Link confirmation modal** absent — the design requires a justification of **≥20 characters** before any link commits (`Enter a justification of at least 20 characters. N entered.`). A governance control, not decoration | **M** |

## Layout

| # | Item | Size |
|---|---|---|
| 13 | **+22px** residual on the System Classification section, nothing-selected state (app 364 vs design 342). Measured app-minus-design on the section's own `getBoundingClientRect().height`. **Diagnose only after items 1–8**, which change card height and will move it | **S** |
| 14 | Symptom-selected like-for-like measurement **not yet obtained** — driving the design's cascade needs the visible Create Issue screen's model-code input targeted specifically; it has two in the DOM | **S** |

## Decisions, not defects — these need a ruling, not a fix

| # | Item |
|---|---|
| 15 | `sameAllLinkedShow` is **unreachable as the design constructs it** (guard needs `entries===0`; `entries` is never filtered by linked). Ours implements what the copy describes — every suggestion linked — which IS reachable. Intent-faithful, construction-divergent |
| 16 | **`manualLink`** (link-by-Issue-ID box) has **zero `{{ }}` bindings anywhere** in the canonical file. Not built. If wanted, it is ours, not the design's |
| 17 | **`{n} linked` badge** — the design binds `sameLinkedCount`, which is never defined, so it never renders there. Ours renders it. Kept as a deliberate improvement |
| 18 | **Delete icon** — blocked on Yogesh. Ours measures pixel-identical to the design (36px from the row's right edge = a 28px control centred in a 44px column) |
| 19 | PATH step 3 reads `Sub-System` while its field label reads `Sub-system` — faithful to what looks like a design typo |
| 20 | Vehicle Information's grid is `1fr 1fr` with one child, so the right half is empty in the design too |

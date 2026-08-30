import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CopyCheck, Link2, RotateCcw, Search, SearchX, Send, X } from 'lucide-react'
// `SOURCE`, `SOURCE_KEYS` and `SourceKey` went with the source selector, and
// `SourceBadge` has now followed them: the suggestion card rendered one for the
// issues it suggests, but the design's card has no source badge at all.
// `Select` is gone too — the four classification fields are real comboboxes now,
// owned by `SystemClassificationPicker`.
import { Badge, Button, Input, StatusBadge, Textarea } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
// No `SectionCard` and no `CardHead`. The three sections live inside one
// `.formCard` and must not each carry their own border, radius and shadow; and
// the section headings are 15px against `CardHead`'s inline `--fs-h4` (17px),
// which a stylesheet cannot override — so they are local `<h2>`s instead.
import { Modal, PageContainer, PageCrumb, ULabel } from '@/app/chrome'
import { modelNameFor, modelYearsFor } from '@/data/modelCodes'
import { ModelCodeYearPicker, type ModelCodeSelection } from './ModelCodeYearPicker'
import { SystemClassificationPicker, type ClassificationValue } from './SystemClassificationPicker'
import { ClearFormConfirmModal, SubmitConfirmationModal, ValidationBanner } from './issue-entry/modals'
import { errorFor, validateIssueEntry } from './issue-entry/validation'
import { relatedRank } from './issue-entry/relatedRank'
import { DtcChipInput } from './issue-entry/DtcChipInput'
import entryStyles from './issue-entry/issue-entry.module.css'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'

export function CreateIssueScreen() {
  const nav = useNavigate()
  const { user } = useRole()
  const store = useStore()

  const [vehicle, setVehicle] = useState<ModelCodeSelection>({ codes: [], yearsByCode: {} })
  const [linkedIds, setLinkedIds] = useState<string[]>([])
  /**
   * Classification is held as LABELS, not ids, because that is what every
   * consumer already wanted: `validateIssueEntry`, `relatedRank` and
   * `store.createIssue` all take labels, and the four id states existed only to
   * drive the cascade lookups. `SystemClassificationPicker` owns that cascade
   * now, so the ids have no remaining job here.
   */
  const [cls, setCls] = useState<ClassificationValue>({})
  const [pendingSymptom, setPendingSymptom] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestValue, setRequestValue] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dtcCodes, setDtcCodes] = useState<string[]>([])
  const [clearOpen, setClearOpen] = useState(false)
  // The in-place "Search & link" panel inside Same Existing Issues.
  const [sameSearchOpen, setSameSearchOpen] = useState(false)
  const [sameSearchQ, setSameSearchQ] = useState('')
  // Set only once Register has been pressed, so an untouched form shows no
  // errors — and clears field-by-field as each is fixed, because the errors are
  // derived from the draft rather than frozen at the moment of the attempt.
  const [attempted, setAttempted] = useState(false)
  const [created, setCreated] = useState<{ id: string; title: string } | null>(null)

  // The anchor is the first code in master order; it supplies the displayed model name.
  const anchorCode = vehicle.codes[0] ?? ''
  const anchorYears = useMemo(
    () => (anchorCode ? (vehicle.yearsByCode[anchorCode] ?? modelYearsFor(anchorCode)) : []),
    [anchorCode, vehicle.yearsByCode],
  )
  // A pending (unapproved) symptom stands in for a chosen one everywhere
  // downstream — it is what the issue will be registered against.
  const symptomLabel = pendingSymptom || cls.symptom
  const systemLabel = cls.system
  const subSystemLabel = cls.subSystem
  const componentLabel = cls.component

  /**
   * Candidates for "Same Existing Issues", ranked — see `issue-entry/relatedRank.ts`.
   *
   * READINESS IS STILL GATED ON SYMPTOM, and that matches the prototype
   * (`sameReady = !!(f0.symptom && …)`); it was never the defect. What changed is
   * what runs afterwards: this was an exact string comparison against
   * `i.symptom`, which almost never matched, so the panel rendered its empty
   * branch on virtually every entry. It now ranks across the whole draft —
   * classification, model code, DTC codes, title and description — and keeps the
   * top 8, as the prototype does.
   *
   * `reasons` is carried even though nothing renders it yet: the "Suggested
   * because: …" line is a separate, deliberately deferred piece of work, and
   * throwing the reasons away here only to recompute them later is worse than
   * carrying them now.
   */
  const correlated = useMemo(
    () =>
      symptomLabel
        ? relatedRank(
            {
              system: systemLabel,
              subSystem: subSystemLabel,
              component: componentLabel,
              symptom: symptomLabel,
              title,
              description,
              dtcCodes: dtcCodes.length ? dtcCodes : undefined,
              modelCode: anchorCode,
            },
            store.issues,
          ).slice(0, 8)
        : [],
    [symptomLabel, systemLabel, subSystemLabel, componentLabel, title, description, dtcCodes, anchorCode, store.issues],
  )

  /**
   * Results for the in-place search panel — the design's `_ssResults`:
   * case-insensitive SUBSTRING over id, title, system, sub-system, component,
   * symptom, model, description and DTC codes, capped at 8.
   *
   * Note it searches the whole register, not `correlated` — the point of this
   * panel is to reach an issue the ranking did NOT suggest.
   */
  const searchResults = useMemo(() => {
    const q = sameSearchQ.trim().toUpperCase()
    if (!q) return []
    return store.issues
      .filter((i) =>
        [i.id, i.title, i.system, i.subSystem, i.component, i.symptom, i.model, i.description, (i.dtcCodes ?? []).join(' ')]
          .join(' ')
          .toUpperCase()
          .includes(q),
      )
      .slice(0, 8)
  }, [sameSearchQ, store.issues])

  /**
   * ⚠️ DIVERGENCE, DELIBERATE AND FLAGGED — the "all matched issues linked" state.
   *
   * The design guards it on `sameAllLinked = sameReady && _matches.length>0 &&
   * sameEntries.length===0`. That is UNREACHABLE there: `sameEntries` is derived
   * from `_matches` with only group de-duplication and never a linked filter, so
   * matches>0 implies entries>0. The state's markup and copy are fully written
   * and can never render.
   *
   * Implemented here against what the copy plainly describes — every suggestion
   * has been linked — which IS reachable. Faithful to the intent, divergent from
   * the construction, and called out rather than quietly chosen either way.
   */
  const allSuggestionsLinked = correlated.length > 0 && correlated.every(({ issue }) => linkedIds.includes(issue.id))

  /**
   * Every outstanding requirement, always computed — see `issue-entry/validation.ts`
   * for the two rules this adds over the old single `canRegister` flag (symptom
   * is required at submit; every selected model code must keep a year).
   *
   * Register stays ENABLED even while invalid. A disabled button cannot tell you
   * why it is disabled; pressing this one produces the list.
   */
  const errors = validateIssueEntry({
    vehicle,
    system: systemLabel,
    subSystem: subSystemLabel,
    component: componentLabel,
    symptom: symptomLabel,
    title,
    description,
  })
  const shown = attempted ? errors : []
  const err = (key: string) => errorFor(shown, key)

  /**
   * Does the form hold anything worth confirming before it is thrown away?
   *
   * Ported from the design's `_issueFormHasData()`, which is:
   *   form !== blankForm  ||  attachments  ||  linkedExisting  ||
   *   selectedExisting  ||  pendingLinkLogs  ||  dtcDraft  ||  vinDraft
   *
   * Two of those answer questions worth stating, because guessing either way
   * changes whether the dialog nags or silently discards:
   *   · LINKED ISSUES COUNT. `linkedExisting` is its own term, so a form whose
   *     only content is a link still confirms.
   *   · DTC CHIPS COUNT — they live in `form.dtcChips`, so the `changed` term
   *     covers them.
   *
   * `attachments`, `selectedExisting`, `pendingLinkLogs` and `vinDraft` have no
   * equivalent on this screen and are deliberately absent rather than forgotten.
   *
   * ⚠️ `dtcDraft` — uncommitted text still sitting in the DTC input — has no
   * term here because that draft is state INSIDE `DtcChipInput` and this screen
   * cannot see it. In practice it is covered anyway: the input commits on blur,
   * and clicking Clear blurs it first, so the draft has already become a chip in
   * `dtcCodes` by the time this runs. Named rather than left as a silent gap —
   * if that control ever stops committing on blur, this check gets a hole.
   *
   * No `.trim()`, deliberately: the design compares against a blank form, so a
   * title of one space counts as content there and counts as content here.
   */
  const hasData =
    vehicle.codes.length > 0 ||
    !!cls.system || !!cls.subSystem || !!cls.component || !!cls.symptom ||
    !!pendingSymptom ||
    title.length > 0 ||
    description.length > 0 ||
    dtcCodes.length > 0 ||
    linkedIds.length > 0

  const clearAll = () => {
    setVehicle({ codes: [], yearsByCode: {} }); setLinkedIds([]); setCls({}); setPendingSymptom('')
    setTitle(''); setDescription(''); setDtcCodes([])
    setAttempted(false)
  }

  const register = () => {
    setAttempted(true)
    if (errors.length > 0) return
    const created = store.createIssue(
      {
        title: title.trim(),
        description: description.trim(),
        // NO SOURCE. Registration does not capture one — the design attributes
        // origin later, on the edit path. See `Issue['source']`.
        model: modelNameFor(anchorCode) ?? anchorCode,
        modelCode: anchorCode,
        modelCodes: vehicle.codes,
        yearsByCode: vehicle.yearsByCode,
        // The record carries one year; use the earliest selected on the anchor code.
        modelYear: Number(anchorYears[0]) || 2026,
        linkedIssueIds: linkedIds,
        system: systemLabel,
        subSystem: subSystemLabel,
        component: componentLabel,
        symptom: symptomLabel,
        dtcCodes: dtcCodes.length ? dtcCodes : undefined,
        submit: true,
      },
      { name: user.name, role: user.role },
    )
    // Confirm with the record rather than redirecting: the ID was just minted
    // and the user has not seen it, and "carry on with this issue" versus "log
    // the next one" are different jobs a redirect would decide for them.
    setCreated({ id: created.id, title: created.title })
  }

  /*
   * The PATH bar used to be built here. It now lives in
   * `SystemClassificationPicker`, together with the four comboboxes it describes
   * — one component owns the classification block on both screens rather than
   * this screen and the edit form each keeping their own copy.
   *
   * The rule it encodes is unchanged and still worth stating: each segment shows
   * the SELECTED VALUE, falling back to the field's name only while empty (the
   * design's `_seg(val, ph)` → `text: set ? val : ph`), and Model Code joins ALL
   * selected codes rather than just the anchor.
   */

  return (
    /*
     * ─── THE FIXED FRAME ────────────────────────────────────────────────────────
     * This screen renders under `FixedHeightLayout`, whose `<main>` is exactly one
     * viewport tall and does NOT scroll. Per that layout's contract the child
     * screen must supply its own scrolling region, or its content is clipped at one
     * viewport — see the scroll port below.
     *
     * WHY THIS SCREEN AND NOT THE ISSUE LIST: the UX prototype's Issue Entry pins
     * its action row (`position:sticky;top:42px;z-index:38`) above an internal
     * scroll port (`data-createport`, `overflow-y:auto`). This is a long
     * three-section form whose primary actions must stay reachable without
     * scrolling back to the top. The issue list has no such pinned chrome and stays
     * on `DefaultLayout`.
     *
     * `flex: 1` + `minHeight: 0`: in a flex column a child refuses to shrink below
     * its content size without `minHeight: 0`, which would push the frame past the
     * viewport and hand the scroll back to the document — the exact failure the
     * layout exists to prevent.
     *
     * ⚠️ FULL-BLEED ON PURPOSE — `PageContainer` is NOT the outer wrapper here,
     * unlike most screens. The content rail is applied twice below, once in the
     * pinned region and once inside the scroller, so that the scrollbar sits at the
     * window edge rather than inside the padded rail. Read the scroll port's
     * comment before collapsing these back into one container.
     */
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/*
        ─── PINNED REGION ────────────────────────────────────────────────────────
        Crumb, title and the Clear / Register actions stay put while the form body
        scrolls. `flex: 'none'` so it is sized by its content and never shrinks to
        give the scroller room.

        `width: '100%'` IS REQUIRED AND IS NOT COSMETIC. `PageContainer` carries
        `margin: '0 auto'` (chrome.tsx:17), and per the flexbox spec a flex item
        stretches on the cross axis only if its cross size computes to `auto` AND
        NEITHER cross-axis margin is auto. In this column the cross axis is
        horizontal, so `0 auto` disables the stretch and the region shrink-to-fits
        its content, centred — measurably narrower than the rail it should share.
        `alignSelf: 'stretch'` does NOT fix it: stretch is already the inherited
        default, and auto margins defeat it. Giving the cross size a definite value
        is what breaks the `auto` precondition. Safe against overflow because
        `box-sizing: border-box` is global (styles/global.css:5-9), and `maxWidth`
        still clamps and centres above 1800px.
      */}
      <PageContainer style={{ flex: 'none', paddingBottom: 0, width: '100%' }}>
        <PageCrumb backTo="/issues" trail={[{ label: 'Issue Management', to: '/issues' }, { label: 'Issue Entry' }]} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
          <h1 style={{ margin: 0, font: 'var(--fw-bold) 27px/1.15 var(--font-display)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>New issue</h1>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {/* Clear now asks first — it resets three sections and every linked
                issue, with no undo, and sits beside Register.

                ⚠️ DELIBERATE LOCAL OVERRIDE — DO NOT "FIX" THIS BY CHANGING
                `Button`. The design's Issue Entry actions are 40px tall with a
                9px radius; the shared `Button` md is `--control-md` 36px with
                `--radius-md` 6px and backs every screen in the app. Rather than
                move every button everywhere, these two are overridden here.

                The cost is named rather than hidden: THESE TWO BUTTONS NO LONGER
                MATCH THE REST OF THE APPLICATION. That trade — fidelity on this
                screen against consistency across screens — was chosen knowingly.
                If app-wide 40px is ever wanted, the fix is `Button`'s size scale
                and these overrides should be DELETED, not copied to more call
                sites. */}
            <Button
              variant="secondary"
              iconLeft={<Icon icon={RotateCcw} size={15} />}
              // `clearIssueForm(){ if(this._issueFormHasData()) … }` — when there
              // is nothing to clear the design opens no dialog and shows no
              // message. A silent no-op, not a disabled button.
              onClick={() => { if (hasData) setClearOpen(true) }}
              style={{ height: 40, padding: '0 16px', borderRadius: 9, font: 'var(--fw-semibold) 13.5px/1 var(--font-body)' }}
            >
              Clear
            </Button>
            <Button
              iconLeft={<Icon icon={Send} size={15} />}
              onClick={register}
              style={{ height: 40, padding: '0 18px', borderRadius: 9 }}
            >
              Register Issue
            </Button>
          </div>
        </div>

        {/* The validation summary belongs to the PINNED region, not the scroller.
            It names fields the user must go and fix, so it has to stay visible
            while they scroll to them — inside the scroll port it would scroll
            away exactly when it is being acted on. */}
        <ValidationBanner errors={shown} />
      </PageContainer>

      {/*
        ─── THE ONLY SCROLLING REGION ON THIS SCREEN ─────────────────────────────
        The prototype's `data-createport`. Full-bleed so its scrollbar sits at the
        window edge, with the content rail applied by the inner `PageContainer` —
        the same arrangement as the Issue Workspace, and for the same reason: a
        scroller inside the padded rail insets the gutter and makes the region's
        width depend on whether it happens to be scrolling.

        `minHeight: 0` is as load-bearing here as on the frame above: without it
        this flex item grows to its content height instead of scrolling.

        Expect a few pixels of antialiasing difference on the first card's rounded
        corners against any baseline captured before this region existed — the
        scroll origin can land on a fractional offset. Known and accepted; the same
        note is recorded at length on the Workspace's equivalent boundary.
      */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* ── The form card: three sections, one container ──────────────────────
            See `issue-entry.module.css`'s `.formCard`. The sections are plain
            divs rather than `SectionCard`s because each must NOT carry its own
            border, radius and shadow — the card around them owns all three. */}
        <div className={entryStyles.formCard}>
        {/* Vehicle Information */}
        <div className={entryStyles.section}>
          <h2 className={entryStyles.sectionHead}>Vehicle Information</h2>
          <ModelCodeYearPicker value={vehicle} onChange={setVehicle} />
          {err('modelCode') && <p className={entryStyles.fieldError}>{err('modelCode')}</p>}
        </div>

        {/* System Classification */}
        <div className={entryStyles.section}>
          <h2 className={entryStyles.sectionHead}>System Classification</h2>
          {/*
            The PATH bar, the model-code hint, the "Request New" affordance and
            the four cascading comboboxes are one component, shared with
            `IssueEditForm`. This screen previously built all four inline, with
            native `<Select>` dropdowns that could not do what their own
            placeholders promised — see below.
          */}
          <SystemClassificationPicker
            value={cls}
            onChange={setCls}
            modelCodes={vehicle.codes}
            onRequestSystem={() => setRequestOpen(true)}
            errors={{
              system: err('system'),
              subSystem: err('subsystem'),
              component: err('component'),
              symptom: err('symptom'),
            }}
            // Symptom is locked while a requested one awaits approval: the
            // pending value already stands in for a choice, so offering the
            // list too would let both be set at once.
            symptomDisabled={!!pendingSymptom}
            symptomFooter={pendingSymptom ? (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)' }}>{pendingSymptom}</span>
                <Badge tone="warning" size="sm">Pending Approval</Badge>
              </div>
            ) : undefined}
            // Issue Entry's own copy. The component's defaults are Edit's, and
            // BOTH differ from the design — recorded on the prop, not fixed
            // here, because Edit is not this change's scope.
            requestPrompt="Can’t find the required classification?"
            requestLabel="Request New"
          />

          {/*
            ─── SAME EXISTING ISSUES — INSIDE System Classification ──────────────
            Placement is checkable against the prototype rather than a matter of
            taste: in the unpacked template the markers fall in this order —
            `data-createsec="2"` → `sameCardsShow` → `sameEmptyShow` →
            `data-createsec="0"`. So the panel and its empty state belong AFTER
            the classification fields and BEFORE Issue Information, within
            section 2. It reads that way for a reason: the suggestions are a
            consequence of the classification you just chose, and they are most
            useful before you spend effort describing an issue that may already
            exist.

            It is a plain block, NOT a card — a card here would nest inside the
            form card. The prototype renders it as a bare
            `flex-column; gap:10px; margin-top:16px` list.

            ⚠️ THE WHOLE BLOCK IS GUARDED ON SYMPTOM — header included.
            In the design a single `sc-if sameReady` opens BEFORE the header and
            closes AFTER the empty/all-linked states, so nothing in this block
            renders until a symptom is chosen. `sameReady` is
            `!!(f0.symptom && String(f0.symptom).trim())`.

            HOW THAT WAS ESTABLISHED, so you can re-derive it rather than trust
            this comment — twice now a confident claim about this exact block has
            been wrong, in opposite directions:

              Do NOT ask "is there a guard around this element", because the
              nearest wrapper answers a different question. The template is
              flattened with no indentation, so a guard opened far earlier is
              still open at your target. Walk OUTWARD from the header until you
              reach a structural anchor — `data-createsec` — naming every
              `sc-if` you pass whose closing tag has not yet appeared. Here that
              walk crosses exactly one still-open guard, `sc-if sameReady`, so
              the header is inside it. "Unconditional" is earned only when the
              walk reaches the anchor with zero open guards.

            The two earlier errors were both windowed reads: one claimed the
            design has no heading here at all (the header sits well above the
            cards, outside the window that was searched); the other claimed the
            header was unconditional (true of its immediate wrapper, false of the
            enclosing guard) and hardened that into an instruction.

            The cost of the second was measurable, not cosmetic: rendering the
            header unguarded added 70px — the 42px block plus its 16px and 12px
            margins — which was 76% of this screen's total vertical drift against
            the design.
          */}
          {symptomLabel && (
            <>
            <div className={entryStyles.sameHead}>
              <span className={entryStyles.sameHeadIcon} aria-hidden>
                <Icon icon={CopyCheck} size={15} />
              </span>
              <div style={{ flex: 1 }}>
                <div className={entryStyles.sameHeadTitle}>Same Existing Issues</div>
                <div className={entryStyles.sameHeadSub}>
                  We found existing issues with similar system classification. Review the issue or issue group before linking.
                </div>
              </div>
              {/*
                Bound to `linkedIds.length`. The design binds `{{ sameLinkedCount }}`
                here — an identifier that is DANGLING: it appears only in the two
                markup sites and is never defined anywhere in the prototype's
                JavaScript, so the badge never renders there.

                That is a dropped binding, not an abandoned idea. Every visual
                property is fully specified — 11px/700, #15724A on #E7F6EF, 6px
                radius, 4px/9px padding, `flex:none`, and the `{n} linked` text
                template — which is not what an unfinished feature looks like.
                Supplying the count is plumbing, not invention.
              */}
              {linkedIds.length > 0 && (
                <span className={entryStyles.sameLinked}>{linkedIds.length} linked</span>
              )}
              {/* Entry point 1 of 3. `toggleSameSearch` — a toggle, not an open:
                  pressing it again closes the panel and restores whichever body
                  state was showing. */}
              <button
                type="button"
                className={entryStyles.sameAction}
                onClick={() => setSameSearchOpen((o) => !o)}
              >
                <Icon icon={Search} size={15} />
                Search &amp; link another issue
              </button>
            </div>
            {/*
              FOUR BODY STATES, and the search panel REPLACES the others rather
              than sitting alongside them — in the design `sameCardsShow`,
              `sameEmptyShow` and `sameAllLinkedShow` are each `&& !_ssOpen`.
            */}
            {sameSearchOpen ? (
              <div className={entryStyles.searchPanel}>
                <div className={entryStyles.searchHead}>
                  <div className={entryStyles.searchHeadLeft}>
                    <span className={entryStyles.sameHeadIcon} aria-hidden>
                      <Icon icon={Search} size={15} />
                    </span>
                    <div className={entryStyles.searchTitle}>Search &amp; link existing issue</div>
                  </div>
                  <button
                    type="button"
                    className={entryStyles.searchClose}
                    title="Close search"
                    aria-label="Close search"
                    onClick={() => setSameSearchOpen(false)}
                  >
                    <Icon icon={X} size={15} />
                  </button>
                </div>
                <div className={entryStyles.searchField}>
                  <Icon icon={Search} size={16} className={entryStyles.searchFieldIcon} />
                  <input
                    className={entryStyles.searchInput}
                    aria-label="Search issues to link"
                    value={sameSearchQ}
                    onChange={(e) => setSameSearchQ(e.target.value)}
                    placeholder="Search by Issue ID, title or keyword…"
                  />
                </div>
                <div className={entryStyles.searchDivider} />
                {sameSearchQ.trim().length === 0 ? (
                  <div className={entryStyles.searchIdle}>
                    <Icon icon={Search} size={20} className={entryStyles.searchIdleIcon} />
                    <div className={entryStyles.searchIdleText}>
                      Search by Issue ID, title or keyword to find and link an existing issue or issue group.
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className={entryStyles.searchIdle}>
                    <Icon icon={SearchX} size={22} className={entryStyles.searchIdleIcon} />
                    <div className={entryStyles.searchIdleText}>
                      No issues match “{sameSearchQ}”. Try a different Issue ID, title or keyword.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={entryStyles.searchResultsHead}>
                      <span className={entryStyles.searchResultsLabel}>Search results</span>
                      <span className={entryStyles.searchCount}>{searchResults.length} {searchResults.length === 1 ? 'issue' : 'issues'}</span>
                    </div>
                    <div className={entryStyles.sameList}>
                      {searchResults.map((i) => (
                        <SuggestionRow
                          key={i.id}
                          issue={i}
                          linked={linkedIds.includes(i.id)}
                          onLink={() => setLinkedIds((l) => (l.includes(i.id) ? l : [...l, i.id]))}
                          onUnlink={() => setLinkedIds((l) => l.filter((x) => x !== i.id))}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : correlated.length === 0 ? (
              /* Entry point 2 of 3 — the empty state's primary CTA. */
              <div className={entryStyles.emptyPanel}>
                <span className={entryStyles.emptyIcon} aria-hidden>
                  <Icon icon={Search} size={20} />
                </span>
                <div className={entryStyles.emptyTitle}>
                  No similar issues were found based on the current issue information.
                </div>
                <div className={entryStyles.emptySub}>
                  You can still search the full issue register and link any existing issue to this one.
                </div>
                <button type="button" className={entryStyles.emptyCta} onClick={() => setSameSearchOpen(true)}>
                  <Icon icon={Search} size={16} />
                  Search &amp; link existing issue
                </button>
              </div>
            ) : allSuggestionsLinked ? (
              <div className={entryStyles.allLinked}>
                <span className={entryStyles.allLinkedIcon} aria-hidden>
                  <Icon icon={Check} size={16} />
                </span>
                <div>
                  <div className={entryStyles.allLinkedTitle}>All matched issues linked</div>
                  <div className={entryStyles.allLinkedSub}>
                    Linked issues now appear in the panel on the right. Manage them there before submitting.
                  </div>
                </div>
              </div>
            ) : (
              <div className={entryStyles.sameList}>
                {correlated.map(({ issue: i }) => (
                  <SuggestionRow
                    key={i.id}
                    issue={i}
                    linked={linkedIds.includes(i.id)}
                    onLink={() => setLinkedIds((l) => (l.includes(i.id) ? l : [...l, i.id]))}
                    onUnlink={() => setLinkedIds((l) => l.filter((x) => x !== i.id))}
                  />
                ))}
              </div>
            )}
            </>
          )}
        </div>

        {/* Issue Information */}
        <div className={entryStyles.section}>
          <h2 className={entryStyles.sectionHead}>Issue Information</h2>
          <div className={entryStyles.sectionStack}>
            <div>
              <ULabel>Issue title *</ULabel>
              <Input aria-label="Issue title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. EV6 — HV battery rapid SOC drop under cold soak" error={err('title')} />
            </div>
            <div>
              <ULabel>Description *</ULabel>
              <Textarea aria-label="Description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Symptoms, reproduction steps, environmental conditions, frequency, and any safety implications…" error={err('description')} />
            </div>
            <div>
              <ULabel>DTC / trouble code <span style={{ color: 'var(--text-disabled)', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>· optional · comma-separated</span></ULabel>
              {/* "· comma-separated" was dropped when this stopped being a
                  comma-separated STRING and became a chip control. That was the
                  wrong call: comma is still one of the keys that commits a chip
                  (with Enter, Tab and blur), so the design's copy is accurate —
                  it describes what the user may type, not how the value is
                  stored. Restored to the design's wording. */}
              <DtcChipInput aria-label="DTC codes" codes={dtcCodes} onChange={setDtcCodes} />
            </div>
          </div>
        </div>
        </div>

        {/*
          `LinkIssuesSection` USED TO SIT HERE, outside the form card, and it is
          gone — not deleted, because `IssueEditForm` still uses it, but no longer
          rendered on Issue Entry.

          It was ours, not the design's. The design puts every linking affordance
          INSIDE the Same Existing Issues block: a "Search & link another issue"
          button in its header, a "Search & link existing issue" CTA in its empty
          state, and one in-place panel both of them open. There is no separate
          link surface anywhere on this screen.

          A consequence worth stating: this block is now the ONLY way to unlink on
          Issue Entry, which is why `SuggestionRow` carries the toggle rather than
          a disabled "Linked" chip. Removing the old section without that would
          have left linked issues unremovable.
        */}
      </div>
        </PageContainer>
      </div>

      {/* Modals sit OUTSIDE the scroll port. They are fixed-position overlays, so
          nesting them in a scrolling region buys nothing and would tie their
          lifetime to it. */}

      {/* Request-new classification (submits to approval queue; non-blocking) */}
      <Modal open={requestOpen} onClose={() => setRequestOpen(false)} title="Request New Classification" footer={
        <>
          <Button variant="ghost" onClick={() => setRequestOpen(false)}>Cancel</Button>
          <Button disabled={!requestValue.trim() || !cls.component} onClick={() => { setPendingSymptom(requestValue.trim()); setCls((c) => ({ ...c, symptom: undefined })); setRequestValue(''); setRequestOpen(false) }}>Submit Request</Button>
        </>
      }>
        <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>
          Submit a request. Once approved, it will be added.
        </p>
        <ULabel>New symptom value * {cls.component ? '' : '(select a component first)'}</ULabel>
        <Input aria-label="New symptom" value={requestValue} onChange={(e) => setRequestValue(e.target.value)} placeholder="e.g. Latch fails to release" disabled={!cls.component} />
      </Modal>

      <ClearFormConfirmModal open={clearOpen} onClose={() => setClearOpen(false)} onConfirm={clearAll} />

      {created && (
        <SubmitConfirmationModal
          open
          issueId={created.id}
          issueTitle={created.title}
          onBackToList={() => nav('/issues')}
          onOpenWorkspace={() => nav(`/issues/${created.id}`)}
        />
      )}
    </div>
  )
}

/**
 * One issue in the Same Existing Issues block — used by both the ranked
 * suggestions and the search results, because the design renders them the same.
 *
 * ⚠️ THE ICON IS `Link2` IN BOTH STATES. Our earlier treatment used `Link2Off`
 * for unlink; the design does not — its `linkIcon` is `'link-2'`
 * unconditionally, and no `link-2-off` appears anywhere on this screen. The
 * state is carried by the LABEL and the button's colour, not by the glyph.
 *
 * Labels are the design's: `Link to Issue` / `Unlink from Issue`.
 */
function SuggestionRow({
  issue,
  linked,
  onLink,
  onUnlink,
}: {
  issue: { id: string; title: string; status: Parameters<typeof StatusBadge>[0]['status'] }
  linked: boolean
  onLink: () => void
  onUnlink: () => void
}) {
  return (
    <div className={entryStyles.sameCard}>
      <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{issue.id}</span>
      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', font: 'var(--fw-regular) var(--fs-body-sm)/1.2 var(--font-body)' }}>{issue.title}</span>
      <StatusBadge status={issue.status} size="sm" />
      <Button
        variant={linked ? 'ghost' : 'secondary'}
        size="sm"
        iconLeft={<Icon icon={Link2} size={13} />}
        onClick={linked ? onUnlink : onLink}
      >
        {linked ? 'Unlink from Issue' : 'Link to Issue'}
      </Button>
    </div>
  )
}

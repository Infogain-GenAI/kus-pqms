import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Check, ChevronDown, ChevronUp, CopyCheck, CornerDownRight, Crown, Eye, GitBranch, History, Link, Link2, Link2Off, RotateCcw, Search, SearchX, Send, Sparkles, TriangleAlert, X } from 'lucide-react'
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
import { fmtDate } from '@/data/util'
import type { Issue } from '@/data/types'
import { ModelCodeYearPicker, type ModelCodeSelection } from './ModelCodeYearPicker'
import { SystemClassificationPicker, type ClassificationValue } from './SystemClassificationPicker'
import { ExistingIssueModal } from './ExistingIssueModal'
import { ClearFormConfirmModal, SubmitConfirmationModal, ValidationBanner } from './issue-entry/modals'
import { errorFor, validateIssueEntry } from './issue-entry/validation'
import { relatedRank } from '@/data/relatedRank'
import { formIssueGroup } from '@/data/issueGroups'
import { LinkJustifyBox, applyJustification } from './linking/LinkJustifyBox'
import { NS as LINK_JUSTIFY_NS } from './linking/LinkJustify.i18n'
import {
  clampJustification,
  isJustificationValid,
  justificationCounterCompact,
  justificationError,
} from '@/data/linkJustification'
import { DtcChipInput } from './issue-entry/DtcChipInput'
import { GroupHistoryModal, IssueHistoryModal, useHistoryTarget } from './issue-entry/HistoryModals'
import { useTranslation } from 'react-i18next'
import { NS } from './issue-entry/IssueEntry.i18n'
import entryStyles from './issue-entry/issue-entry.module.css'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'

export function CreateIssueScreen() {
  const { t } = useTranslation(NS)
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
  /*
   * ⚠️ CARRIES THE KIND, NOT JUST THE ID. Which history modal opens is decided
   * by what the CARD is — group or standalone — exactly as the canonical's
   * `_buildEntry` decides it. Deriving it from the issue instead would reroute a
   * standalone card the moment its issue joined a group.
   */
  const history = useHistoryTarget()
  /**
   * The issue open in the existing-issue popup, by id.
   *
   * The design opens this from a SEARCH RESULT (`onView → openExistingModal`) —
   * a way to inspect an issue before deciding to link it. Suggestion cards have
   * no such affordance; they carry View History instead.
   */
  const [inspecting, setInspecting] = useState<string | null>(null)
  /**
   * Link confirmation — a governance control, not a courtesy prompt.
   *
   * The design gates EVERY link action behind a justification of at least 20
   * characters: `openLinkConfirm('standalone', id)` from a card, and
   * `openLinkConfirm('group', parentId)` from a group card, which expands to all
   * its members.
   *
   * ⚠️ UNLINK IS UNGATED **ON THIS SCREEN ONLY** — corrected. An earlier version
   * of this note said unlink is never gated and read that as a deliberate design
   * principle ("removing a link is cheaper than making one"). That generalised
   * from one screen: Issue Entry routes unlink to a plain confirm, but the
   * WORKSPACE gates it behind its own justification flow (`unlinkJustify.*` on
   * `wsExistingModal`).
   *
   * The real rule is narrower and has an obvious reason: on Issue Entry the
   * issue does not exist yet, so an unlink discards a draft decision and there
   * is nothing to audit. In the workspace it undoes a recorded relationship
   * between two live issues, which is why that one asks.
   */
  const [linkConfirm, setLinkConfirm] = useState<{ ids: string[]; label: string } | null>(null)
  const [justify, setJustify] = useState('')
  const [justifyErr, setJustifyErr] = useState('')
  /** Accumulated until registration, then written to the audit trail. */
  const [linkLogs, setLinkLogs] = useState<{ ids: string[]; justification: string }[]>([])
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
   * Candidates for "Same Existing Issues", ranked — see `@/data/relatedRank`.
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
  /**
   * The panel's entries: the ranked top 8, then any LINKED issue that did not
   * make that cut, appended.
   *
   * ⚠️ WITHOUT THE APPEND, LINKING AN UNRANKED ISSUE MAKES IT DISAPPEAR — you
   * press Link, the card is not in the top 8, and it silently leaves the panel
   * with no way back to it. That was a live defect, not a missing decoration.
   *
   * Three properties taken verbatim from the design, because each could
   * plausibly have gone the other way:
   *   · THE CAP APPLIES BEFORE THE APPEND. `_relatedRank(...).slice(0, 8)` runs
   *     first; appended entries are pushed onto the result afterwards.
   *   · THEY GO AT THE END, in link order. The design pushes and never re-sorts,
   *     so an appended entry never displaces a ranked one.
   *   · THERE IS NO SECOND CAP. The rendered list can exceed 8, and that is
   *     correct: every extra entry is one the user linked deliberately.
   *
   * They carry `reasons: ['Manually linked']` and score 0, which is what drives
   * the card's "Manually linked" note instead of a "Suggested because" line.
   */
  const correlated = useMemo(() => {
    const ranked = symptomLabel
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
      : []

    const alreadyShown = new Set(ranked.map((r) => r.issue.id))
    const appended = linkedIds
      .filter((id) => !alreadyShown.has(id))
      .map((id) => store.issues.find((i) => i.id === id))
      // A linked id with no matching issue is skipped rather than rendered as a
      // blank card — the design guards the same way (`if(p)`).
      .filter((i): i is Issue => !!i)
      .map((issue) => ({ issue, exact: false, reasons: ['Manually linked'], score: 0 }))

    return [...ranked, ...appended]
  }, [symptomLabel, systemLabel, subSystemLabel, componentLabel, title, description, dtcCodes, anchorCode, linkedIds, store.issues])

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
  /**
   * One card per GROUP, not per issue.
   *
   * A ranked hit that belongs to a group stands for the whole group, so the
   * first member seen wins and the rest are folded into its card — the design
   * does the same (`_seenSameGroup`). Without this a four-issue cohort renders
   * as four near-identical cards and the ranking looks broken.
   */
  const toEntries = useCallback(
    (list: { issue: Issue; reasons?: string[] }[]) => {
      const seen = new Set<string>()
      const out: { key: string; group?: { parent: Issue; children: Issue[] }; issue?: Issue; reasons?: string[] }[] = []
      for (const { issue, reasons } of list) {
        if (!issue.groupId) {
          out.push({ key: issue.id, issue, reasons })
          continue
        }
        if (seen.has(issue.groupId)) continue
        seen.add(issue.groupId)
        const members = store.groupMembers(issue.id)
        // `groupMembers` is parent-first; a tagged issue always has >= 2 members
        // (guarded in `assertSeed`), but fall back rather than crash if it does not.
        if (members.length < 2) { out.push({ key: issue.id, issue, reasons }); continue }
        out.push({ key: issue.groupId, group: { parent: members[0], children: members.slice(1) }, reasons })
      }
      return out
    },
    [store],
  )

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

  const askToLink = (ids: string[], label: string) => {
    setJustify('')
    setJustifyErr('')
    setLinkConfirm({ ids, label })
  }

  /**
   * ⚠️ THE COUNT IS TRIMMED, in the gate AND in the message. The design computes
   * `text = justify.trim()` once and uses it for both, so whitespace never counts
   * toward the 20 and the "N entered" figure agrees with the rule it is
   * explaining. Reporting an untrimmed count next to a trimmed gate would tell a
   * user they have 20 when the button stays disabled.
   */
  // The rule now lives in `@/data/linkJustification`, shared with the three
  // workspace/list surfaces that gate the same mutation. The numbers and the
  // message are unchanged — this screen was one of the two copies.
  const justifyTooShort = !isJustificationValid(justify)

  const commitLink = () => {
    if (!linkConfirm) return
    if (justifyTooShort) {
      setJustifyErr(justificationError(justify) ?? '')
      return
    }
    setLinkedIds((l) => Array.from(new Set([...l, ...linkConfirm.ids])))
    setLinkLogs((g) => [...g, { ids: linkConfirm.ids, justification: justify.trim() }])
    setLinkConfirm(null)
  }

  const clearAll = () => {
    setVehicle({ codes: [], yearsByCode: {} }); setLinkedIds([]); setLinkLogs([]); setCls({}); setPendingSymptom('')
    setTitle(''); setDescription(''); setDtcCodes([])
    setAttempted(false)
  }

  const [groupBlocked, setGroupBlocked] = useState('')

  const register = () => {
    setAttempted(true)
    if (errors.length > 0) return

    /*
     * ─── THE CHRONOLOGY GUARD, CHECKED BEFORE COMMITTING ──────────────────────
     *
     * Group parentage is derived from registration order, so a linked issue dated
     * in the FUTURE would sort ahead of nothing and silently promote this
     * brand-new issue to Parent. The design refuses to register at all rather
     * than produce an inverted hierarchy, with this message.
     *
     * Checked here as well as in the store because only the screen can tell the
     * user. `createIssue` throws on the same condition as a backstop for any
     * other caller. See `formIssueGroup` for why neither fires on today's seed.
     */
    const formation = formIssueGroup({
      newIssueId: 'pending',
      newIssueCreatedAt: new Date().toISOString(),
      linkedIds: linkedIds,
      pool: store.issues,
    })
    if (formation.blockedReason) {
      setGroupBlocked(formation.blockedReason)
      return
    }
    setGroupBlocked('')
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
        linkJustifications: linkLogs,
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
          <h1 style={{ margin: 0, font: 'var(--fw-bold) 27px/1.15 var(--font-display)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{t('title')}</h1>
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
              {t('clear')}
            </Button>
            <Button
              iconLeft={<Icon icon={Send} size={15} />}
              onClick={register}
              style={{ height: 40, padding: '0 18px', borderRadius: 9 }}
            >
              {t('register')}
            </Button>
          </div>
        </div>

        {/* The validation summary belongs to the PINNED region, not the scroller.
            It names fields the user must go and fix, so it has to stay visible
            while they scroll to them — inside the scroll port it would scroll
            away exactly when it is being acted on. */}
        <ValidationBanner errors={shown} />

        {/*
          The chronology refusal. Rendered beside the validation banner rather
          than inside it: that banner counts FIELD errors, and this is not a field
          — nothing the user can correct in the form, only by changing which
          issues are linked.
        */}
        {groupBlocked && (
          <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', border: 'var(--border-width) solid var(--danger-500)', borderRadius: 'var(--radius-md)', background: 'var(--danger-50)', font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-primary)' }}>
            <Icon icon={TriangleAlert} size={15} style={{ color: 'var(--danger-500)', flex: 'none' }} />
            {groupBlocked}
          </div>
        )}
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
          <h2 className={entryStyles.sectionHead}>{t('sectionVehicle')}</h2>
          <ModelCodeYearPicker value={vehicle} onChange={setVehicle} />
          {err('modelCode') && <p className={entryStyles.fieldError}>{err('modelCode')}</p>}
        </div>

        {/* System Classification */}
        <div className={entryStyles.section}>
          <h2 className={entryStyles.sectionHead}>{t('sectionClassification')}</h2>
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
                <Badge tone="warning" size="sm">{t('classificationPendingApproval')}</Badge>
              </div>
            ) : undefined}
            // Issue Entry's own copy, now from the screen's i18n namespace.
            // The component's defaults are Edit's and still differ from the
            // design; not fixed here, because Edit is not this change's scope.
            // These two keys carry the prototype's STRAIGHT apostrophe, which
            // this file previously got wrong as a typographic one.
            requestPrompt={t('classificationCannotFind')}
            requestLabel={t('classificationRequestNew')}
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
                <div className={entryStyles.sameHeadTitle}>{t('sameExistingTitle')}</div>
                <div className={entryStyles.sameHeadSub}>
                  {t('sameExistingSubtitle')}
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
                <span className={entryStyles.sameLinked}>{linkedIds.length} {t('sameExistingLinked')}</span>
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
                {t('searchLinkAnother')}
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
                    <div className={entryStyles.searchTitle}>{t('searchLinkExisting')}</div>
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
                      {t('searchIdle')}
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className={entryStyles.searchIdle}>
                    <Icon icon={SearchX} size={22} className={entryStyles.searchIdleIcon} />
                    <div className={entryStyles.searchIdleText}>
                      {t('searchNoMatch', { query: sameSearchQ })}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={entryStyles.searchResultsHead}>
                      <span className={entryStyles.searchResultsLabel}>{t('searchResults')}</span>
                      <span className={entryStyles.searchCount}>{t('searchCount', { count: searchResults.length })}</span>
                    </div>
                    <div className={entryStyles.sameList}>
                      {toEntries(searchResults.map((i) => ({ issue: i }))).map((e) =>
                        e.group ? (
                          <GroupCard
                            key={e.key}
                            parent={e.group.parent}
                            children={e.group.children}
                            variant="search"
                            
                            linked={[e.group.parent, ...e.group.children].every((m) => linkedIds.includes(m.id))}
                            onLink={() => askToLink([e.group!.parent.id, ...e.group!.children.map((c) => c.id)], `${e.group!.parent.id} + ${e.group!.children.length} child issue(s)`)}
                            onUnlink={() => setLinkedIds((l) => l.filter((x) => x !== e.group!.parent.id && !e.group!.children.some((c) => c.id === x)))}
                            onViewHistory={() => history.openGroup(e.group!.parent.id)}
                            /*
                              Removes ONE member from the group, immediately.
                              `removeRelated` picks group removal or symmetric
                              unlink by inspecting what the target actually is —
                              the branch the design makes in
                              `openGroupUnlinkModal`. The parent is the context
                              issue, which matters only to the fallback.
                            */
                            onRemoveMember={(id, why) => store.removeRelated(e.group!.parent.id, id, why, { name: user.name, role: user.role })}
                          />
                        ) : (
                          <SuggestionCard
                            key={e.key}
                            issue={e.issue!}
                            variant="search"
                            
                            linked={linkedIds.includes(e.issue!.id)}
                            onLink={() => askToLink([e.issue!.id], e.issue!.id)}
                            onUnlink={() => setLinkedIds((l) => l.filter((x) => x !== e.issue!.id))}
                            onViewHistory={() => history.openIssue(e.issue!.id)}
                            onInspect={() => setInspecting(e.issue!.id)}
                          />
                        ),
                      )}
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
                  {t('sameExistingEmpty')}
                </div>
                <div className={entryStyles.emptySub}>
                  {t('emptySub')}
                </div>
                <button type="button" className={entryStyles.emptyCta} onClick={() => setSameSearchOpen(true)}>
                  <Icon icon={Search} size={16} />
                  {t('searchLinkExisting')}
                </button>
              </div>
            ) : allSuggestionsLinked ? (
              <div className={entryStyles.allLinked}>
                <span className={entryStyles.allLinkedIcon} aria-hidden>
                  <Icon icon={Check} size={16} />
                </span>
                <div>
                  <div className={entryStyles.allLinkedTitle}>{t('allLinkedTitle')}</div>
                  <div className={entryStyles.allLinkedSub}>
                    {t('allLinkedSub')}
                  </div>
                </div>
              </div>
            ) : (
              <div className={entryStyles.sameList}>
                {toEntries(correlated).map((e) =>
                        e.group ? (
                          <GroupCard
                            key={e.key}
                            parent={e.group.parent}
                            children={e.group.children}
                            variant="suggestion"
                            reasons={e.reasons}
                            linked={[e.group.parent, ...e.group.children].every((m) => linkedIds.includes(m.id))}
                            onLink={() => askToLink([e.group!.parent.id, ...e.group!.children.map((c) => c.id)], `${e.group!.parent.id} + ${e.group!.children.length} child issue(s)`)}
                            onUnlink={() => setLinkedIds((l) => l.filter((x) => x !== e.group!.parent.id && !e.group!.children.some((c) => c.id === x)))}
                            onViewHistory={() => history.openGroup(e.group!.parent.id)}
                            /*
                              Removes ONE member from the group, immediately.
                              `removeRelated` picks group removal or symmetric
                              unlink by inspecting what the target actually is —
                              the branch the design makes in
                              `openGroupUnlinkModal`. The parent is the context
                              issue, which matters only to the fallback.
                            */
                            onRemoveMember={(id, why) => store.removeRelated(e.group!.parent.id, id, why, { name: user.name, role: user.role })}
                          />
                        ) : (
                          <SuggestionCard
                            key={e.key}
                            issue={e.issue!}
                            variant="suggestion"
                            reasons={e.reasons}
                            linked={linkedIds.includes(e.issue!.id)}
                            onLink={() => askToLink([e.issue!.id], e.issue!.id)}
                            onUnlink={() => setLinkedIds((l) => l.filter((x) => x !== e.issue!.id))}
                            onViewHistory={() => history.openIssue(e.issue!.id)}
                          />
                        ),
                      )}
              </div>
            )}
            </>
          )}
        </div>

        {/* Issue Information */}
        <div className={entryStyles.section}>
          <h2 className={entryStyles.sectionHead}>{t('sectionIssue')}</h2>
          <div className={entryStyles.sectionStack}>
            <div>
              <ULabel>{t('fieldTitle')}</ULabel>
              <Input aria-label="Issue title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. EV6 — HV battery rapid SOC drop under cold soak" error={err('title')} />
            </div>
            <div>
              <ULabel>{t('fieldDescription')}</ULabel>
              <Textarea aria-label="Description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Symptoms, reproduction steps, environmental conditions, frequency, and any safety implications…" error={err('description')} />
            </div>
            <div>
              <ULabel>{t('fieldDtc')} <span style={{ color: 'var(--text-disabled)', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>{t('fieldDtcOptional')}</span></ULabel>
              {/* "· comma-separated" was dropped when this stopped being a
                  comma-separated STRING and became a chip control. That was the
                  wrong call: comma is still one of the keys that commits a chip
                  (with Enter, Tab and blur), so the design's copy is accurate —
                  it describes what the user may type, not how the value is
                  stored. Restored to the design's wording, verified against the
                  canonical's own span. The copy now lives in `fieldDtcOptional`. */}
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
          <Button variant="ghost" onClick={() => setRequestOpen(false)}>{t('cancel')}</Button>
          <Button disabled={!requestValue.trim() || !cls.component} onClick={() => { setPendingSymptom(requestValue.trim()); setCls((c) => ({ ...c, symptom: undefined })); setRequestValue(''); setRequestOpen(false) }}>{t('requestSubmit')}</Button>
        </>
      }>
        <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>
          {t('requestBody')}
        </p>
        <ULabel>{t('requestSymptomLabel')} {cls.component ? '' : t('requestSymptomNeedsComponent')}</ULabel>
        <Input aria-label="New symptom" value={requestValue} onChange={(e) => setRequestValue(e.target.value)} placeholder="e.g. Latch fails to release" disabled={!cls.component} />
      </Modal>

      {/*
        View History — TWO modals, chosen by card type.

        ⚠️ THE OLD COMMENT HERE WAS LOAD-BEARING IN THE WRONG DIRECTION. It said
        `workspace/HistorySection.tsx` "could NOT be reused" because it takes no
        props and reads its issue id from `useWorkspace()`. That is still true of
        the COMPONENT — and it was read as though it applied to the whole history
        vocabulary, which is why this surface rendered raw internal action
        strings ("Initial field values saved", "Issue Unlinked") at users while
        the workspace rendered proper labels.

        `history/history.ts` is pure and provider-free, so `historyLabelFor` and
        `historyIconFor` DO work here. `HistoryModals` uses them.
      */}
      <GroupHistoryModal
        key={`g${history.nonce}`}
        members={history.target?.kind === 'group' ? store.groupMembers(history.target.id) : []}
        entriesFor={(id) => store.auditFor(id)}
        onOpenIssue={(id) => nav(`/issues/${id}`)}
        onClose={history.close}
      />
      <IssueHistoryModal
        key={`i${history.nonce}`}
        issue={history.target?.kind === 'issue' ? (store.getIssue(history.target.id) ?? null) : null}
        entries={history.target?.kind === 'issue' ? store.auditFor(history.target.id) : []}
        onClose={history.close}
      />

      {/*
        Link confirmation. Gates every LINK; unlink is deliberately not gated —
        see `linkConfirm`'s note. The 500-character cap is the design's own
        (`slice(0, 500)` on input), and the confirm stays disabled until the
        TRIMMED text reaches 20 so the button and the message never disagree.
      */}
      <Modal
        open={!!linkConfirm}
        onClose={() => setLinkConfirm(null)}
        title="Link issue"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLinkConfirm(null)}>{t('cancel')}</Button>
            <Button disabled={justifyTooShort} onClick={commitLink}>
              {linkConfirm && linkConfirm.ids.length > 1 ? 'Link Issues' : 'Link Issue'}
            </Button>
          </>
        }
      >
        <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>
          {t('linkConfirmBody', { label: linkConfirm?.label })}
        </p>
        <ULabel>{t('justificationLabel')}</ULabel>
        <textarea
          className={justifyErr ? entryStyles.justifyBoxError : entryStyles.justifyBox}
          aria-label="Justification"
          value={justify}
          maxLength={500}
          onChange={(e) => { setJustify(clampJustification(e.target.value)); setJustifyErr('') }}
          placeholder="e.g. Same charge-port lock failure on the same model year; likely one root cause."
        />
        <div className={entryStyles.justifyFoot}>
          {justifyErr && <span className={entryStyles.justifyError}>{justifyErr}</span>}
          <span className={entryStyles.justifyCount}>{justificationCounterCompact(justify)}</span>
        </div>
      </Modal>

      <ExistingIssueModal
        issue={inspecting ? (store.issues.find((i) => i.id === inspecting) ?? null) : null}
        linked={!!inspecting && linkedIds.includes(inspecting)}
        onClose={() => setInspecting(null)}
        onLink={() => { if (inspecting) { setInspecting(null); askToLink([inspecting], inspecting) } }}
        onUnlink={() => { if (inspecting) setLinkedIds((l) => l.filter((x) => x !== inspecting)) }}
        onOpenIssue={(id) => nav(`/issues/${id}`)}
      />

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
 * One issue in the Same Existing Issues block — the design's BLOCK card:
 * actions row · title line · meta line · annotations.
 *
 * It replaced a single flex row that carried four of the design's fourteen
 * bindings, which is why both the suggestions panel and the search results read
 * as wrong: they share this component.
 *
 * ⚠️ THE TWO VARIANTS ARE DELIBERATELY NOT UNIFIED. The design shows a
 * `Standalone Issue` badge on SEARCH RESULTS and omits it on suggestions, and
 * shows "Suggested because …" on suggestions and never on search results
 * (`reasons` is `[]` there). That asymmetry is in the source, not an oversight.
 *
 * ⚠️ THE ICON IS `Link2` IN BOTH STATES — the design's `linkIcon` is `'link-2'`
 * unconditionally and no `link-2-off` exists on this screen. State is carried by
 * the label and the button's own style, not the glyph.
 *
 * ⚠️ STATUS STILL USES `StatusBadge`, and that is the one item from this pass
 * left open. The design uses an inline pill — 26px, radius 7, `${color}1A` fill
 * with `${color}` text. Reproducing it needs `STATUS` exported from the
 * ui-library barrel, which it is not, and a bespoke pill here would mint a
 * SECOND status rendering alongside the system's. Flagged for a ruling rather
 * than decided unilaterally.
 */
function SuggestionCard({
  issue,
  linked,
  reasons,
  variant,
  onLink,
  onUnlink,
  onViewHistory,
  onInspect,
}: {
  issue: Issue
  linked: boolean
  /** Empty for search results — the design computes no reasons there. */
  reasons?: string[]
  variant: 'suggestion' | 'search'
  onLink: () => void
  onUnlink: () => void
  onViewHistory: () => void
  /**
   * Search results only. The design gives a search hit a way to inspect the
   * issue before linking (`onView → openExistingModal`); suggestion cards have
   * no equivalent, so this is absent there rather than rendered disabled.
   */
  onInspect?: () => void
}) {
  // `Model: … · Classification: … · Issue Date: …` — the design's `_rowMeta`.
  // Note the TWO spaces either side of the outer separators, and that every
  // field falls back to an em dash rather than being omitted.
  const metaLine = metaLineFor(issue)
  // `Manually linked` is not a suggestion reason — it marks an entry that is
  // here because the user linked it, not because it ranked. The design shows the
  // note INSTEAD of a "Suggested because" line, never both.
  const manualOnly = (reasons ?? []).length === 1 && reasons?.[0] === 'Manually linked'
  const suggestReasons = manualOnly ? [] : (reasons ?? [])
  const { t } = useTranslation(NS)

  return (
    <div className={entryStyles.card}>
      <div className={entryStyles.cardTop}>
        <div className={entryStyles.cardIdent}>
          <span className={entryStyles.cardId}>{issue.id}</span>
          {/*
            ITEM 8 — the design draws a dotless tinted chip here. Taken as a
            `dot={false}` variant of `StatusBadge` rather than a bespoke pill:
            the only real differences were the dot and geometry, and the map's
            curated tints already ARE `${color}1A` for the statuses that have no
            token (escalated, outofscope). Geometry left on the system's `md`
            (22px / radius 4) against the design's 26px / radius 7 — a knowing
            normalisation, flagged for a ruling rather than overridden here.
          */}
          <StatusBadge
            status={issue.status}
            size="md"
            dot={false}
            className={entryStyles.cardStatus}
            style={{ height: 'var(--pill-h)', padding: '0 var(--pill-px)', borderRadius: 'var(--pill-r)', fontSize: 'var(--pill-fs)' }}
          />
          {variant === 'search' && <span className={entryStyles.cardStandalone}>{t('cardStandalone')}</span>}
          {linked && (
            <span className={entryStyles.cardLinkedPill}>
              <Icon icon={Link} size={11} />
              {t('cardLinked')}
            </span>
          )}
        </div>
        <div className={entryStyles.cardActions}>
          {onInspect && (
            <button type="button" className={entryStyles.cardHistoryBtn} onClick={onInspect}>
              <Icon icon={Eye} size={14} />
              {t('cardView')}
            </button>
          )}
          <button type="button" className={entryStyles.cardHistoryBtn} onClick={onViewHistory}>
            <Icon icon={History} size={14} />
            {t('cardViewHistory')}
          </button>
          <button
            type="button"
            className={linked ? entryStyles.cardLinkBtnOn : entryStyles.cardLinkBtn}
            onClick={linked ? onUnlink : onLink}
          >
            <Icon icon={Link2} size={14} />
            {linked ? 'Unlink from Issue' : 'Link to Issue'}
          </button>
        </div>
      </div>
      <div className={entryStyles.cardTitle}>{issue.title}</div>
      <div className={entryStyles.cardMeta}>{metaLine}</div>
      {manualOnly && (
        <div className={entryStyles.cardNote}>
          <Icon icon={Link2} size={12} />
          {t('cardManuallyLinked')}
        </div>
      )}
      {suggestReasons.length > 0 && (
        <div className={entryStyles.cardNote}>
          <Icon icon={Sparkles} size={12} style={{ color: 'var(--accent-600)', flex: 'none' }} />
          {t('cardSuggestedBecause', { reasons: suggestReasons.join(' · ') })}
        </div>
      )}
    </div>
  )
}

/** `Model: … · Classification: … · Issue Date: …` — the design's `_rowMeta`. */
function metaLineFor(issue: Issue): string {
  const codes = issue.modelCodes?.length ? issue.modelCodes.join(', ') : (issue.model || '—')
  const classif = [issue.system || '—', issue.subSystem || '—', issue.component || '—', issue.symptom || '—'].join(' · ')
  return `Model: ${codes}  ·  Classification: ${classif}  ·  Issue Date: ${fmtDate(issue.createdAt)}`
}

/**
 * A whole issue group as one card: parent in a tinted well, children behind an
 * expander.
 *
 * ⚠️ THE PARENT IS `members[0]`, NOTHING MORE. `store.groupMembers` sorts by
 * registration and the earliest member IS the parent — no issue stores the role.
 * Pull one out of the group and the next-earliest takes over with nothing to
 * update.
 *
 * ⚠️ THE SEARCH VARIANT CARRIES EXTRA ICONS AND THE SUGGESTION VARIANT DOES NOT
 * — `git-branch` on the header, `crown` on the parent, `corner-down-right` on
 * each child. That is the design's own asymmetry, matching the `Standalone
 * Issue` badge that only search results show. It looks like an inconsistency and
 * is not one; do not unify the variants.
 */
function GroupCard({
  parent,
  children,
  linked,
  reasons,
  variant,
  onLink,
  onUnlink,
  onViewHistory,
  onRemoveMember,
}: {
  parent: Issue
  children: Issue[]
  linked: boolean
  reasons?: string[]
  variant: 'suggestion' | 'search'
  onLink: () => void
  onUnlink: () => void
  onViewHistory: () => void
  /** Removes ONE member from the group. Absent where the card is read-only. */
  onRemoveMember?: (id: string, justification: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const count = children.length + 1
  const suggestReasons = reasons ?? []
  const { t } = useTranslation(NS)
  const { t: tj } = useTranslation(LINK_JUSTIFY_NS)

  /*
   * ─── PER-MEMBER GROUP REMOVAL, IMMEDIATE AND JUSTIFIED ────────────────────
   *
   * Distinct from the card's own link button, which is a SYMMETRIC bulk link
   * over the whole group. These remove ONE member FROM the group — a different
   * relationship type behind a control that sits inches away, which is why each
   * says what it does rather than just "Unlink".
   *
   * Immediate, so there is no Save to gate: the justification is mandatory at
   * the point of action. `LinkJustifyBox` in the same immediate mode
   * `LinkIssuesSection` uses; the draft/commit hook is deliberately not involved.
   */
  const [removing, setRemoving] = useState<string | null>(null)
  const [removeText, setRemoveText] = useState('')
  const [removeErr, setRemoveErr] = useState('')

  const removalBox = (id: string) =>
    removing === id ? (
      <LinkJustifyBox
        text={removeText}
        error={removeErr}
        onText={(next) => { setRemoveText(next); setRemoveErr('') }}
        onApply={() => {
          const problem = applyJustification(removeText)
          if (problem) { setRemoveErr(problem); return }
          onRemoveMember?.(id, removeText.trim())
          setRemoving(null)
        }}
        onCancel={() => setRemoving(null)}
        applyLabel={tj('confirmUnlink')}
        label={`${t('groupRemoveLabel')} ${id}`}
        inputLabel={`${t('groupRemoveLabel')} ${id}`}
      />
    ) : null

  const removalTrigger = (id: string) => (
    <button
      type="button"
      className={entryStyles.cardHistoryBtn}
      aria-label={`${t('groupRemoveMember')} ${id}`}
      onClick={() => { setRemoving(id); setRemoveText(''); setRemoveErr('') }}
    >
      <Icon icon={Link2Off} size={13} />
      {t('groupRemoveMember')}
    </button>
  )

  return (
    <div className={entryStyles.card}>
      <div className={entryStyles.groupHead}>
        <div className={entryStyles.groupHeadLeft}>
          <span className={entryStyles.groupLabel}>
            {variant === 'search' && <Icon icon={GitBranch} size={13} />}
            {t('groupHeader', { count })}
          </span>
          {linked && (
            <span className={entryStyles.cardLinkedPill}>
              <Icon icon={Link} size={11} />
              {t('cardLinked')}
            </span>
          )}
        </div>
        <div className={entryStyles.cardActions}>
          <button type="button" className={entryStyles.cardHistoryBtn} onClick={onViewHistory}>
            <Icon icon={History} size={14} />
            {/* The label differs by variant in the design — "View Group History"
                on a suggestion, "View Linked Issue History" in search results.
                Same asymmetry family as the Standalone badge; not unified. */}
            {variant === 'search' ? 'View Linked Issue History' : 'View Group History'}
          </button>
          <button
            type="button"
            className={linked ? entryStyles.cardLinkBtnOn : entryStyles.cardLinkBtn}
            onClick={linked ? onUnlink : onLink}
          >
            <Icon icon={Link2} size={14} />
            {linked ? 'Unlink from Issue Group' : 'Link to Issue Group'}
          </button>
        </div>
      </div>

      <div className={entryStyles.parentBlock}>
        {variant === 'search' && <Icon icon={Crown} size={14} style={{ color: 'var(--accent-700)', flex: 'none' }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={entryStyles.groupIdent}>
            <span className={entryStyles.cardId}>{parent.id}</span>
            <StatusBadge
              status={parent.status}
              size="md"
              dot={false}
              className={entryStyles.cardStatus}
              style={{ height: 'var(--pill-h)', padding: '0 var(--pill-px)', borderRadius: 'var(--pill-r)', fontSize: 'var(--pill-fs)' }}
            />
            <span className={entryStyles.badgeParent}>{t('badgeParent')}</span>
            {onRemoveMember && <span style={{ marginLeft: 'auto' }}>{removalTrigger(parent.id)}</span>}
          </div>
          <div className={entryStyles.groupTitle}>{parent.title}</div>
          <div className={entryStyles.groupMeta}>{metaLineFor(parent)}</div>
          {/* Removing the PARENT promotes the next-earliest member and logs a
              separate system entry — see `planGroupEdits`. */}
          {removalBox(parent.id)}
        </div>
      </div>

      <button type="button" className={entryStyles.expander} onClick={() => setExpanded((e) => !e)}>
        <Icon icon={expanded ? ChevronUp : ChevronDown} size={14} />
        {expanded ? `Hide Child Issues (${children.length})` : `Show Child Issues (${children.length})`}
      </button>

      {expanded && (
        <div className={entryStyles.childList}>
          {children.map((c) => (
            <div key={c.id} className={entryStyles.childRow}>
              {variant === 'search' && <Icon icon={CornerDownRight} size={13} style={{ color: 'var(--text-disabled)', flex: 'none' }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={entryStyles.groupIdent}>
                  <span className={entryStyles.childId}>{c.id}</span>
                  <StatusBadge
                    status={c.status}
                    size="md"
                    dot={false}
                    className={entryStyles.cardStatus}
                    style={{ height: 'var(--pill-h)', padding: '0 var(--pill-px)', borderRadius: 'var(--pill-r)', fontSize: 'var(--pill-fs)' }}
                  />
                  <span className={entryStyles.badgeChild}>{t('badgeChild')}</span>
                  {onRemoveMember && <span style={{ marginLeft: 'auto' }}>{removalTrigger(c.id)}</span>}
                </div>
                <div className={entryStyles.childTitle}>{c.title}</div>
                <div className={entryStyles.childMeta}>{metaLineFor(c)}</div>
                {removalBox(c.id)}
              </div>
            </div>
          ))}
        </div>
      )}

      {suggestReasons.length > 0 && (
        <div className={entryStyles.cardNote}>
          <Icon icon={Sparkles} size={12} style={{ color: 'var(--accent-600)', flex: 'none' }} />
          {t('cardSuggestedBecause', { reasons: suggestReasons.join(' · ') })}
        </div>
      )}
    </div>
  )
}

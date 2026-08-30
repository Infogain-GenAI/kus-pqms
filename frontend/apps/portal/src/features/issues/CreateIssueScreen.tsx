import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, CopyCheck, Info, Link2, RotateCcw, Send } from 'lucide-react'
// `SOURCE`, `SOURCE_KEYS` and `SourceKey` are gone with the source selector.
// `SourceBadge` STAYS — the suggested-issues list renders it for OTHER issues,
// which is unrelated to whether this form captures a source.
import { Badge, Button, Input, Select, SourceBadge, StatusBadge, Textarea } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
// No `SectionCard` and no `CardHead`. The three sections live inside one
// `.formCard` and must not each carry their own border, radius and shadow; and
// the section headings are 15px against `CardHead`'s inline `--fs-h4` (17px),
// which a stylesheet cannot override — so they are local `<h2>`s instead.
import { Modal, PageContainer, PageCrumb, ULabel } from '@/app/chrome'
import { modelNameFor, modelYearsFor } from '@/data/modelCodes'
import { ModelCodeYearPicker, type ModelCodeSelection } from './ModelCodeYearPicker'
import { LinkIssuesSection } from './LinkIssuesSection'
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
  const [sysId, setSysId] = useState(''); const [subId, setSubId] = useState(''); const [compId, setCompId] = useState(''); const [symId, setSymId] = useState('')
  const [pendingSymptom, setPendingSymptom] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestValue, setRequestValue] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dtcCodes, setDtcCodes] = useState<string[]>([])
  const [clearOpen, setClearOpen] = useState(false)
  // Set only once Register has been pressed, so an untouched form shows no
  // errors — and clears field-by-field as each is fixed, because the errors are
  // derived from the draft rather than frozen at the moment of the attempt.
  const [attempted, setAttempted] = useState(false)
  const [created, setCreated] = useState<{ id: string; title: string } | null>(null)

  const systems = store.classByLevel('system')
  const subs = useMemo(() => (sysId ? store.classChildren(sysId) : []), [sysId, store])
  const comps = useMemo(() => (subId ? store.classChildren(subId) : []), [subId, store])
  const symptoms = useMemo(() => (compId ? store.classChildren(compId) : []), [compId, store])

  // The anchor is the first code in master order; it supplies the displayed model name.
  const anchorCode = vehicle.codes[0] ?? ''
  const anchorYears = useMemo(
    () => (anchorCode ? (vehicle.yearsByCode[anchorCode] ?? modelYearsFor(anchorCode)) : []),
    [anchorCode, vehicle.yearsByCode],
  )
  const label = (list: { id: string; label: string }[], id: string) => list.find((c) => c.id === id)?.label
  const symptomLabel = pendingSymptom || (symId ? label(symptoms, symId) : undefined)
  const systemLabel = sysId ? label(systems, sysId) : undefined
  const subSystemLabel = subId ? label(subs, subId) : undefined
  const componentLabel = compId ? label(comps, compId) : undefined

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

  const clearAll = () => {
    setVehicle({ codes: [], yearsByCode: {} }); setLinkedIds([]); setSysId(''); setSubId(''); setCompId(''); setSymId(''); setPendingSymptom('')
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

  /**
   * The PATH bar's segments.
   *
   * ⚠️ EACH SEGMENT SHOWS THE SELECTED VALUE, falling back to the field's name
   * only while it is empty — the prototype's `_seg(val, ph)` → `text: set ? val : ph`.
   *
   * THIS WAS THE DEFECT, and it was structural rather than a render bug: the old
   * shape was `{ label, done }`, which carried no value at all, so the bar
   * rendered the literal words "Model Code · System · Sub-System · Component ·
   * Symptom" forever and no change to the JSX could have fixed it. A reader
   * comparing against the design saw five static labels where the design shows
   * the classification they had just chosen.
   *
   * Model Code joins ALL selected codes, not just the anchor — a two-code
   * selection reads "KA4, DL3". The anchor is only the code that supplies the
   * model NAME on the issue record; it was never meant to stand in for the
   * selection here.
   */
  const pathSteps: { text: string; set: boolean }[] = [
    { text: vehicle.codes.length > 0 ? vehicle.codes.join(', ') : 'Model Code', set: vehicle.codes.length > 0 },
    { text: systemLabel ?? 'System', set: !!systemLabel },
    { text: subSystemLabel ?? 'Sub-System', set: !!subSystemLabel },
    { text: componentLabel ?? 'Component', set: !!componentLabel },
    { text: symptomLabel ?? 'Symptom', set: !!symptomLabel },
  ]

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
              onClick={() => setClearOpen(true)}
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
          {/* PATH bar */}
          {/* Styles in `issue-entry.module.css` under "PATH bar" — every value is
              the design's own. The separators are siblings of the segments, not
              nested with them, so the container's 7px gap spaces the whole
              sequence evenly rather than clumping each chevron against its
              preceding chip. */}
          <div className={entryStyles.pathBar} style={{ marginBottom: 'var(--space-3)' }}>
            <span className={entryStyles.pathLabel}>PATH</span>
            {pathSteps.map((s, i) => (
              <Fragment key={i}>
                {i > 0 && <Icon icon={ChevronRight} size={13} style={{ color: 'var(--neutral-300)', flex: 'none' }} />}
                <span className={s.set ? entryStyles.pathSegSet : entryStyles.pathSeg}>{s.text}</span>
              </Fragment>
            ))}
          </div>
          {!anchorCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 'var(--space-3)', font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-muted)' }}>
              <Icon icon={Info} size={14} /> Select a Model Code in Vehicle information to enable classification.
            </div>
          )}
          <div style={{ marginBottom: 'var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>
            Can't find the required classification?{' '}
            <button onClick={() => setRequestOpen(true)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-link)' }}>Request New</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <ULabel>System *</ULabel>
              <Select aria-label="System" value={sysId} placeholder={anchorCode ? 'Search system… (e.g. “Bat”, “Electrical”)' : 'Select model code first'} disabled={!anchorCode} options={systems.map((s) => ({ value: s.id, label: s.label }))} onChange={(e) => { setSysId(e.target.value); setSubId(''); setCompId(''); setSymId(''); setPendingSymptom('') }} />
              {err('system') && <p className={entryStyles.fieldError}>{err('system')}</p>}
            </div>
            <div>
              <ULabel>Sub-system *</ULabel>
              <Select aria-label="Sub-system" value={subId} placeholder={sysId ? 'Search sub-system…' : 'Select a system first'} disabled={!sysId} options={subs.map((s) => ({ value: s.id, label: s.label }))} onChange={(e) => { setSubId(e.target.value); setCompId(''); setSymId(''); setPendingSymptom('') }} />
              {err('subsystem') && <p className={entryStyles.fieldError}>{err('subsystem')}</p>}
            </div>
            <div>
              <ULabel>Component *</ULabel>
              <Select aria-label="Component" value={compId} placeholder={subId ? 'Search component…' : 'Select a sub-system first'} disabled={!subId} options={comps.map((s) => ({ value: s.id, label: s.label }))} onChange={(e) => { setCompId(e.target.value); setSymId(''); setPendingSymptom('') }} />
              {err('component') && <p className={entryStyles.fieldError}>{err('component')}</p>}
            </div>
            <div>
              <ULabel>Symptom *</ULabel>
              <Select aria-label="Symptom" value={symId} placeholder={compId ? 'Search symptom…' : 'Select a component first'} disabled={!compId || !!pendingSymptom} options={symptoms.map((s) => ({ value: s.id, label: s.label }))} onChange={(e) => setSymId(e.target.value)} />
              {pendingSymptom && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)' }}>{pendingSymptom}</span>
                  <Badge tone="warning" size="sm">Pending Approval</Badge>
                </div>
              )}
              {err('symptom') && <p className={entryStyles.fieldError}>{err('symptom')}</p>}
            </div>
          </div>

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

            ⚠️ THE HEADER IS UNCONDITIONAL — DO NOT PUT IT BEHIND A GUARD.
            In the design its container has NO `sc-if` wrapper: it sits outside
            the block that gates the cards / empty / all-linked states, so it
            renders on first load, before any symptom is chosen and before any
            search resolves. Only the green "N linked" badge inside it is
            conditional. That is why it is rendered above the `symptomLabel`
            guard here rather than inside it.

            CORRECTING THE RECORD, because this file previously asserted the
            opposite with confidence: an earlier note here claimed the prototype
            has NO heading on this block, and the title and subtitle were removed
            on that basis. THE CLAIM WAS WRONG. The header exists, and its title
            and subtitle are character-for-character what had been there.

            The error was a partial read, not a misreading: the search window was
            the lines around the cards, and the header sits well above them
            because the block opens near the top of the section while the cards
            render further down. Searching a window and reporting an absence is
            the failure; verify by content, not by proximity.
          */}
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
            {linkedIds.length > 0 && (
              <span className={entryStyles.sameLinked}>{linkedIds.length} linked</span>
            )}
          </div>

          {symptomLabel && (
            <div>
              {correlated.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--text-muted)', font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)' }}>No similar issues were found based on the current issue information.</p>
              ) : (
                <div className={entryStyles.sameList}>
                  {correlated.map(({ issue: i }) => (
                    <div key={i.id} className={entryStyles.sameCard}>
                      <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{i.id}</span>
                      <SourceBadge source={i.source} size="sm" />
                      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', font: 'var(--fw-regular) var(--fs-body-sm)/1.2 var(--font-body)' }}>{i.title}</span>
                      <StatusBadge status={i.status} size="sm" />
                      <Button variant="link" size="sm" onClick={() => nav(`/issues/${i.id}`)}>Preview</Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={linkedIds.includes(i.id)}
                        iconLeft={<Icon icon={Link2} size={13} />}
                        onClick={() => setLinkedIds((l) => (l.includes(i.id) ? l : [...l, i.id]))}
                      >
                        {linkedIds.includes(i.id) ? 'Linked' : 'Link'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              <ULabel>DTC / trouble code <span style={{ color: 'var(--text-disabled)', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>· optional</span></ULabel>
              {/* "comma-separated" is gone from the label because the control is
                  no longer a comma-separated string — a comma still commits a
                  chip, but it is one of several keys rather than the format. */}
              <DtcChipInput aria-label="DTC codes" codes={dtcCodes} onChange={setDtcCodes} />
            </div>
          </div>
        </div>
        </div>

        {/* ⚠️ STILL OUTSIDE THE FORM CARD, AND DELIBERATELY SO FOR NOW.
            The prototype's `data-createport` holds the form card and the manual
            "Search & link existing issue" affordance as separate children, so a
            link surface outside the card is not itself wrong — but this component
            is ours, not a direct port of that affordance, and reconciling the two
            is its own piece of work. Named rather than left to look accidental. */}
        <LinkIssuesSection
          linkedIds={linkedIds}
          onLink={(id) => setLinkedIds((l) => (l.includes(id) ? l : [...l, id]))}
          onUnlink={(id) => setLinkedIds((l) => l.filter((x) => x !== id))}
        />
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
          <Button disabled={!requestValue.trim() || !compId} onClick={() => { setPendingSymptom(requestValue.trim()); setSymId(''); setRequestValue(''); setRequestOpen(false) }}>Submit Request</Button>
        </>
      }>
        <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>
          Submit a request. Once approved, it will be added.
        </p>
        <ULabel>New symptom value * {compId ? '' : '(select a component first)'}</ULabel>
        <Input aria-label="New symptom" value={requestValue} onChange={(e) => setRequestValue(e.target.value)} placeholder="e.g. Latch fails to release" disabled={!compId} />
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

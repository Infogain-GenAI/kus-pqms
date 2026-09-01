import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftRight, Calendar, Car, ClipboardPlus, FileText, PenSquare, Settings2 } from 'lucide-react'
import { Avatar, Button, SOURCE, StatusBadge } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { MetaChip, PageContainer, PageCrumb, SectionCard, TagChip } from '@/app/chrome'
import { PriorityTab } from './PriorityTab'
import { ApprovalBanner } from './workspace/ApprovalBanner'
import { ClosedBanner } from './workspace/ClosedBanner'
import { useTranslation } from 'react-i18next'
import { NS } from './workspace/IssueDetail.i18n'
import { WorkspaceTabStrip } from './workspace/WorkspaceTabStrip'
import { ChangeStatusModal, CreateQirModal, ManageLinksModal } from './workspace/modals'
import type { WorkspaceContext, WorkspaceModal } from './workspace/context'
import { PRIORITY_BANDS } from '@/data/priorityMatrix'
import { useIssueLock } from '@/data/issueLock'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import { fmtMDY, modelCodeLabel } from '@/data/util'

/**
 * THE WORKSPACE SHELL — the parent route for `/issues/:id`.
 *
 * It used to be the whole screen: six tab components in one 868-line file,
 * switched by a `useState` tab key. The five real sections are now sibling child
 * routes (`workspace/*Section.tsx`) and this file renders only what is common to
 * all of them plus the `<Outlet />` they fill.
 *
 * ─── WHY THE SECTIONS ARE ROUTES ──────────────────────────────────────────────
 * BRD `NAV-01` requires it: "every screen is addressable by URL and
 * deep-linkable… filter state, active section and pagination are URL-encoded, so
 * a copied link reproduces exactly what the sender saw." 07-routing-and-layouts.md
 * turns that into child routes rather than a search parameter, for three reasons
 * worth keeping visible here: a section is a PLACE not a filter; each section gets
 * its own lazy chunk (so opening an issue does not download what only
 * Communication needs); and each gets its own `ErrorBoundary`, so a failure in
 * History cannot blank the header and the other four tabs.
 *
 * ─── WHAT IS PINNED AND WHAT SCROLLS ──────────────────────────────────────────
 * This screen renders under `FixedHeightLayout`, whose `<main>` is exactly one
 * viewport tall and does not scroll. Per Yogesh's requirement: "Navigating to a
 * Workspace section resets scroll to the top of the scrolling region. Only the
 * workspace body scrolls; the page itself never does."
 *
 * So, as shipped: everything above the Outlet — crumb, header card, tab strip,
 * approval banner — is PINNED, and the Outlet region is the ONE scrolling
 * element on the screen.
 *
 * HISTORY, PAST TENSE, BECAUSE IT EXPLAINS THE SHAPE: the routing change and the
 * layout change landed as two separate batches on purpose. The sections became
 * child routes first, while the screen was still document-scrolling under
 * `DefaultLayout`; the layout flip followed. That ordering made each measurable
 * on its own against the pixel baseline — the routing batch came back
 * pixel-identical on all ten captures, which is what allows the remaining diff on
 * the five workspace captures to be attributed to the scroll container alone.
 *
 * ⚠️ THE PREVIOUS VERSION OF THIS PASSAGE SAID THE MOVE WAS "NOT DONE HERE" AND
 * THAT THE SCREEN "STILL SCROLLS WITH THE DOCUMENT". It was accurate when written
 * and went stale one batch later, while the code below it correctly described the
 * new behaviour — so the file contradicted itself and pointed the next reader at
 * a scroll model that no longer existed. Noted because ACCURATE-WHEN-WRITTEN IS
 * NOT THE SAME AS TRUE, and a comment describing a transitional state is the kind
 * most likely to rot.
 *
 * ─── THE APPROVAL BANNER STAYS HERE ───────────────────────────────────────────
 * It was marked "(all tabs)" before the split, and that is a real constraint: a
 * pending proposal is a fact about the issue, not about a section, so it renders
 * above the Outlet and is visible from all five. The alternative is rendering it
 * five times.
 */
export function IssueWorkspaceScreen() {
  const { t } = useTranslation(NS)
  const { id = '' } = useParams()
  const loc = useLocation()
  const nav = useNavigate()
  const { user, can } = useRole()
  const store = useStore()
  const issue = store.getIssue(id)
  const [modal, setModal] = useState<WorkspaceModal>('')

  /**
   * FULL-PAGE EDIT MODE for the Detail section, held here rather than in the
   * section for the reason recorded on `WorkspaceContext.editing`: it is entered
   * from this header and suppresses this header's own button, so both ends read it.
   *
   * The effect closes it on any navigation away from Detail — the same mechanism,
   * and the same reason, as `priorityOpen` below. Keyed on `pathname` so browser
   * Back and programmatic navigation close it too, which a click handler on the
   * tab strip would miss. Without it, leaving Detail mid-edit and returning would
   * drop the user back into a form holding stale draft state.
   */
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (!loc.pathname.endsWith('/detail')) setEditing(false)
  }, [loc.pathname])

  /**
   * ISSUE PRIORITY IS THE ONE TAB THAT IS STILL LOCAL STATE, by explicit
   * decision — whether Scoring is a section, a sub-route of Detail, or a modal is
   * an open question owned by PQM (18:219), and routing it would answer that
   * question silently. See WorkspaceTabStrip for the full record.
   *
   * The effect below is what makes a mixed strip behave: Priority renders IN PLACE
   * OF the Outlet, so any navigation to a sibling section must close it, or the
   * user would click "Investigation", see the URL change, and still be looking at
   * Priority. Keyed on `pathname` rather than on a click handler so that browser
   * Back/Forward and any programmatic navigation close it too — a handler on the
   * NavLinks would miss all three.
   */
  const [priorityOpen, setPriorityOpen] = useState(false)
  useEffect(() => {
    setPriorityOpen(false)
  }, [loc.pathname])

  /**
   * The Closed-issue lock, computed ONCE for the whole workspace and handed to
   * every section through the Outlet context.
   *
   * ⚠️ CALLED HERE, ABOVE THE NOT-FOUND RETURN, BECAUSE IT IS A HOOK. Moving it
   * down beside the other `issue`-derived values below would put it after an
   * early return and break the rules of hooks on the not-found path. It takes an
   * optional issue precisely so it can live up here.
   */
  const lock = useIssueLock(issue)

  /**
   * ─── SCROLL RESET ON SECTION CHANGE ─────────────────────────────────────────
   * Yogesh's requirement: "Navigating to a Workspace section resets scroll to the
   * top of the scrolling region. Only the workspace body scrolls; the page itself
   * never does."
   *
   * ⚠️ `<ScrollRestoration />` CANNOT DO THIS AND MUST NOT BE REACHED FOR. It
   * operates on the WINDOW, and under `FixedHeightLayout` the window does not
   * scroll at all — so it would appear to be wired up and do exactly nothing. The
   * scrolling element is the div below, so the reset has to address that element
   * directly. 07 now records this too, so the next implementer does not
   * rediscover it.
   *
   * Keyed on `pathname` AND `priorityOpen` because both change what occupies the
   * scroll region: five sections by URL, Priority by state. Without the second
   * dependency, opening Priority from halfway down a long History would drop the
   * user into the middle of the Priority matrix.
   *
   * `scrollTop = 0` rather than `scrollTo({ behavior: 'smooth' })`: this is a
   * place change, not a gesture, and animating it would show the outgoing
   * section's content racing past.
   */
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [loc.pathname, priorityOpen])

  if (!issue) {
    return (
      <PageContainer>
        <PageCrumb backTo="/issues" trail={[{ label: 'Issue Management', to: '/issues' }, { label: id, mono: true }]} />
        <SectionCard>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('shellNotFound', { issueId: id })}</p>
        </SectionCard>
      </PageContainer>
    )
  }

  const actor = { name: user.name, role: user.role }
  const comments = store.commentsFor(id).filter((c) => !c.hidden)
  // Editing is capability-gated only. Neither ownership nor status narrows it: any
  // contributor may correct an issue's details at any point in its life, including
  // after it has been escalated or closed.
  const canEditIssue = can('propose')
  // V4-V5: an issue's priority is the QIR's priority, so it must be scored and saved
  // before a QIR can be raised. Unscored issues route the user to the matrix instead.
  // Status does not narrow this — a QIR can be raised from any status.
  const priority = store.priorityResult(id)
  const canQir = can('propose') && priority.scored

  /** Handed to every section through the Outlet. See workspace/context.ts. */
  const context: WorkspaceContext = {
    issue,
    issueId: id,
    canEditIssue,
    canPropose: can('propose'),
    canQir,
    lock,
    comments,
    openModal: setModal,
    editing,
    onEditingChange: setEditing,
  }

  return (
    /*
     * ─── THE FIXED FRAME ────────────────────────────────────────────────────────
     * This screen renders under `FixedHeightLayout`, whose `<main>` is exactly one
     * viewport tall and does NOT scroll. Per that layout's contract, the child
     * screen must supply its own scrolling region or its content is clipped — so
     * this outer element is a bare flex column that fills the frame, and the single
     * `overflow-y: auto` region is the section body near the bottom of this file.
     *
     * `flex: 1` + `minHeight: 0` rather than `height: 100%`: in a flex column a
     * child refuses to shrink below its content size without `minHeight: 0`, which
     * would push the frame past the viewport and hand the scroll back to the
     * document — the exact failure the layout exists to prevent.
     *
     * ⚠️ THIS ELEMENT IS FULL-BLEED AND CARRIES NO PADDING — `PageContainer` is
     * deliberately NOT the outer wrapper here, unlike every other screen. The
     * content rail is applied TWICE below instead, once inside the pinned region
     * and once inside the scroller. Read the scroll region's comment before
     * "simplifying" this back into a single outer PageContainer: doing so puts the
     * scrollbar inside the padded rail, which is a visible regression, not a
     * cosmetic one.
     */
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/*
        ─── PINNED REGION ────────────────────────────────────────────────────────
        Keeps its own PageContainer, so the crumb, header card, tab strip and
        banner sit on the standard content rail (max-width 1800, side padding).
        `flex: 'none'` so it is sized by its content and never shrinks to give the
        scroller room — the pinned region must be exactly as tall as it needs.

        ⚠️ `width: '100%'` IS REQUIRED HERE AND IS NOT COSMETIC. Removing it
        silently narrows this whole region. `PageContainer` carries
        `margin: '0 auto'` (chrome.tsx:17), and per the flexbox spec a flex item is
        stretched on the cross axis only "if the cross-size property computes to
        auto, and NEITHER of the cross-axis margins are auto". In this column flex
        container the cross axis is horizontal, so `0 auto` disables the stretch:
        the region shrink-to-fits its content and the auto margins centre it.
        Measured cost when it was missing: 1012px wide at x=134 in a 1280 viewport
        instead of 1200px at x=40 — and (1280 − 1012) / 2 = 134 exactly, which is
        the signature of shrink-to-fit plus auto-centring.

        `alignSelf: 'stretch'` DOES NOT FIX THIS — tried, measured, no change.
        Stretch is already the inherited default, and the spec clause above is
        precisely why: auto cross-axis margins DEFEAT stretch, so restating stretch
        cannot override them. Giving the cross size a definite value is what breaks
        the "computes to auto" precondition.

        `width: '100%'` is safe against the obvious objection — overflow from
        adding padding on top of a full width — because `box-sizing: border-box` is
        set globally on `*` (styles/global.css:5-9), so the padding is inside the
        100%. It also preserves wide-viewport behaviour rather than trading it
        away: above 1800px, `maxWidth` clamps the width and the still-present auto
        margins centre the clamped box, which is why this is the fix rather than
        zeroing the margins.

        Because this region is shared by all five sections, that mis-sizing showed
        up as a near-constant ~5% pixel diff on every workspace screen at once,
        independent of section content — including on sections that were otherwise
        pixel-perfect. It reads as uniform "residual noise", which is exactly what
        makes it easy to write off; it is not noise.

        The scroller's inner PageContainer needs NO such override: that div is a
        plain block container, so its child fills normally and `0 auto` computes to
        0. Only flex parents trigger this. Do not "fix" PageContainer itself —
        `margin: '0 auto'` is load-bearing for `maxWidth: 1800` centring on wide
        viewports, and every other screen depends on it.
      */}
      <PageContainer wide style={{ flex: 'none', paddingBottom: 0, width: '100%' }}>
      <PageCrumb backTo="/issues" trail={[{ label: 'Issue Management', to: '/issues' }, { label: issue.id, mono: true }]} />

      {/* Header card */}
      <SectionCard style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{issue.id}</span>
              <StatusBadge status={issue.status} />
              {/* Priority reads out in the header only once scored — an unscored issue
                  shows nothing rather than a misleading default letter. */}
              {priority.scored && (
                <TagChip tint={PRIORITY_BANDS[priority.final].tint} color={PRIORITY_BANDS[priority.final].color}>
                  {t('shellPriority', { letter: priority.final })}
                </TagChip>
              )}
              {issue.isEws && <TagChip tint="var(--danger-50)" color="var(--danger-600)">{t('shellEwsFlagged')}</TagChip>}
            </div>
            <h1 style={{ margin: '0 0 var(--space-3)', font: 'var(--fw-bold) 24px/1.2 var(--font-display)', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{issue.title}</h1>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <MetaChip icon={Car}>{modelCodeLabel(issue)}</MetaChip>
              {issue.system && <MetaChip icon={Settings2}>{issue.system}{issue.component ? ` / ${issue.component}` : issue.subSystem ? ` / ${issue.subSystem}` : ''}</MetaChip>}
              {/* An issue registered through Issue Entry has no source yet —
                  the design attributes origin later, on the edit path. Say so
                  explicitly rather than dropping the chip: a missing chip reads
                  as a rendering bug, whereas "No source assigned" reads as the
                  state it is, and tells the user there is something to do. */}
              <MetaChip icon={FileText}>{issue.source ? SOURCE[issue.source].label : 'No source assigned'}</MetaChip>
              <MetaChip icon={Calendar}>{fmtMDY(issue.reportedDate)}</MetaChip>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-4)', flex: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={issue.owner} size="md" />
              <span>
                <span style={{ display: 'block', font: 'var(--fw-semibold) var(--fs-body-sm)/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{issue.owner}</span>
                <span style={{ display: 'block', font: 'var(--fw-regular) var(--fs-caption)/1.2 var(--font-body)', color: 'var(--text-muted)' }}>{t('shellOwner', { role: issue.ownerRole })}</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {/* Edit is a MODE of the Detail section, not a modal and not a route.
                  So the button navigates to Detail first — editing from any other
                  section would otherwise set a flag nothing on screen reads. */}
              <Button variant="secondary" size="sm" disabled={!canEditIssue || editing} iconLeft={<Icon icon={PenSquare} size={14} />} onClick={() => { nav(`/issues/${id}/detail`); setEditing(true) }}>{t('shellEditIssue')}</Button>
              {/* Closed is terminal, so there is no status to change TO — the
                  lock disables the trigger and the banner below says why. Vue
                  removes this button outright on a Closed issue; see the
                  divergence note in `@/data/issueLock`. `outofscope` is NOT
                  covered here: it stays reachable and the modal keeps its own
                  terminal message for it, exactly as before. */}
              <Button variant="secondary" size="sm" disabled={!!issue.proposedStatus || lock.isClosed} iconLeft={<Icon icon={ArrowLeftRight} size={14} />} onClick={() => setModal('status')}>{t('shellChangeStatus')}</Button>
              <Button variant="secondary" size="sm" disabled={!canQir} iconLeft={<Icon icon={ClipboardPlus} size={14} />} onClick={() => setModal('qir')}>{t('shellCreateQir')}</Button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Pill tab bar — five NavLinks to sibling routes plus the stateful Priority tab. */}
      <SectionCard pad={false} style={{ marginBottom: 'var(--space-4)', padding: '6px 10px' }}>
        <WorkspaceTabStrip
          issueId={id}
          commentCount={comments.length}
          priorityOpen={priorityOpen}
          onOpenPriority={() => setPriorityOpen(true)}
        />
      </SectionCard>

      {/* Closed-issue lock banner (all sections). Sits ABOVE the approval banner
          because it is the stronger statement: if the record is closed, nothing
          below it can be acted on. Both can show at once — an issue can be
          Closed with a proposal still pending — so this is not an else branch. */}
      {lock.isClosed && <ClosedBanner />}

      {/* Pending-approval banner (all sections) */}
      {issue.proposedStatus && (
        <ApprovalBanner issue={issue} canApprove={can('approve')} isProposer={issue.proposedBy === user.name}
          onApprove={(r) => store.approveProposal(id, r, actor)} onReject={(r) => store.rejectProposal(id, r, actor)} />
      )}
      </PageContainer>

      {/*
        ─── THE ONLY SCROLLING REGION ON THIS SCREEN ─────────────────────────────
        Everything above is PINNED: crumb, header card, tab strip, approval banner
        stay put while this region scrolls independently. That is the whole point
        of the layout flip — the workspace body scrolls, the page never does.

        ⚠️ THIS ELEMENT IS FULL-BLEED ON PURPOSE, AND THE PADDING LIVES INSIDE IT.
        The scrolling element spans the full frame width so ITS SCROLLBAR SITS AT
        THE WINDOW EDGE, exactly where the document scrollbar used to be before the
        layout flip. The content rail (`max-width: 1800` + side padding) is applied
        by the inner `PageContainer`, so the pinned region above and the scrolling
        content below resolve to the SAME rail and stay flush.

        AN EARLIER VERSION PUT THIS SCROLLER *INSIDE* `PageContainer`. Do not go
        back to it. Two things went wrong, and the second is the serious one:
          · the scroll gutter was inset ~40px from the window edge, and the
            section body rendered ~15px narrower than the pinned header card
            directly above it, so the two were not flush; and
          · because `overflow-y: auto` only reserves a gutter WHEN it scrolls, the
            section width then depended on section content height — Resolution (no
            scrollbar, full width) and History (scrollbar, narrower) differed, so
            content visibly jumped sideways on every tab switch. That is a UX
            regression, not an inset.
        `scrollbar-gutter: stable` was considered and rejected: it makes the width
        consistent but consistently wrong, and leaves the gutter in the wrong place.

        `minHeight: 0` is as load-bearing here as on the frame above: without it
        this flex item grows to its content height instead of scrolling.

        ─── KNOWN AND ACCEPTED: SUB-PIXEL ORIGIN ON THIS BOUNDARY ────────────────
        READ THIS BEFORE CHANGING ANYTHING IN THE PINNED REGION ABOVE — adding a
        row to the header card, changing the tab strip's height, altering the
        banner. It will move pixels here, and the amount will look inexplicable.

        This region's origin is wherever the pinned region above happens to END, so
        it inherits that region's rendered height. When that height lands on a
        fractional value, everything inside this scroller sits at a sub-pixel
        vertical offset, and the `border-radius` corners of the first `SectionCard`
        re-antialias against any baseline captured at a different offset.

        Measured, not theorised: it costs ~1.5px per rounded corner. Against the
        pre-relocation baseline that was 6px on Resolution (two cards → four
        top corners), 3px on Communication (one card → two corners), and exactly
        0px on Investigation, whose content happened to land on an integer
        boundary. The differing pixels were localised in the diff images to the
        card corners at this boundary (y≈339) and nowhere else. Independent probes
        measured fractional geometry (x=94.27, width=1091.45), which is the same
        sub-pixel layout seen from another angle.

        DELIBERATELY NOT FIXED. Forcing integer heights on the pinned region would
        buy 1.5px per corner that no user can perceive, in exchange for a layout
        that breaks every time the pinned content changes height — brittle against
        exactly the future edits this note is addressed to. If a fidelity capture
        shows a few pixels on card corners here and nothing else, this is what it
        is; it is not a regression. Anything larger, or anywhere else, is.

        Priority renders IN PLACE OF the routed section, inside this same region —
        it is not a sixth route, so there is no URL for it to occupy, but it
        scrolls exactly like the five that are.
      */}
      {/*
        `position: relative` is a GUARD, not layout — nothing here is positioned
        against it.

        An `overflow: auto` box does not become a containing block for
        absolutely-positioned descendants. So any `position: absolute` element
        inside a section — a visually-hidden file input, a dropdown panel, a
        focus sentinel — that lacks a positioned ancestor of its own resolves
        against the INITIAL containing block, and adds its offset to the
        DOCUMENT's scroll height rather than this region's. The page then grows a
        second scrollbar that scrolls nothing visible, which is exactly what the
        Investigation tab's attachment input did (measured: 849px against a 768px
        viewport).

        That component was fixed at its source. This line means the next one
        cannot reintroduce the symptom app-wide while its own bug is found.
      */}
      <div ref={scrollRef} style={{ position: 'relative', flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {/*
          The rail, applied a second time. `PageContainer` keeps its own
          `max-width: 1800` so wide viewports still centre, and its BOTTOM padding
          matters here specifically: it is what stops the last card butting against
          the bottom of the frame. The pinned region above zeroes that same bottom
          padding, since spacing under the tab strip is owned by the strip's own
          margin.
        */}
        <PageContainer wide>
          {priorityOpen ? <PriorityTab issueId={id} canEdit={lock.isEditable} /> : <Outlet context={context} />}
        </PageContainer>
      </div>

      <ChangeStatusModal open={modal === 'status'} issue={issue} canApprove={can('approve')} onClose={() => setModal('')} />
      <CreateQirModal open={modal === 'qir'} issue={issue} onClose={() => setModal('')} />
      <ManageLinksModal open={modal === 'links'} issue={issue} onClose={() => setModal('')} />
    </div>
  )
}

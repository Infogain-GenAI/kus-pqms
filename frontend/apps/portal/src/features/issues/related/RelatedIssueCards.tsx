import { useState } from 'react'
import { ChevronDown, ChevronUp, CornerDownRight, Crown, Eye, GitBranch, History, Link, Link2, Link2Off, Sparkles } from 'lucide-react'
import { Icon, StatusBadge } from '@pqms/ui-library'
import { useTranslation } from 'react-i18next'
import { fmtDate } from '@/data/util'
import type { Issue } from '@/data/types'
import { LinkJustifyBox, applyJustification } from '@/features/issues/linking/LinkJustifyBox'
import { NS } from '@/features/issues/issue-entry/IssueEntry.i18n'
import { NS as LINK_JUSTIFY_NS } from '@/features/issues/linking/LinkJustify.i18n'
import entryStyles from '@/features/issues/issue-entry/issue-entry.module.css'

/**
 * The Same Existing Issues cards, shared by Issue Entry and Issue Edit.
 *
 * ─── ⚠️ WHY THESE ARE SHARED RATHER THAN WRITTEN TWICE ──────────────────────
 *
 * The canonical renders this section TWICE, byte-for-byte apart from a single
 * line: once inside `sc-if showCreate` (Issue Entry) and once inside
 * `sc-if editMode` (Issue Edit). 132 non-blank lines against 133, similarity
 * 0.996. So the design's answer to "how should the edit surface look" is "exactly
 * like the create surface", and two implementations of one design is precisely
 * how they drifted apart — the edit surface was first built in the surrounding
 * page's compact shape and ended up matching neither the design nor Issue Entry.
 *
 * ⚠️ THE STYLES AND COPY STAY IN `issue-entry/`. Imported rather than moved so
 * that this extraction is provably faithful: Issue Entry renders byte-identical
 * markup afterwards, and its existing tests pass untouched. Moving the CSS module
 * and the i18n bundle as well would have made "did the extraction change
 * anything?" unanswerable in the same step.
 *
 * ─── ⚠️ A CARD MUST NEVER KNOW WHICH SURFACE IT IS ON ───────────────────────
 *
 * Everything that differs between the two screens arrives as a PROP. There is no
 * context read, no route sniffing, no `isEditMode`. With two callers that would
 * work and would quietly reintroduce the divergence in a form that is harder to
 * see than two files — a conditional inside a shared component looks like shared
 * behaviour and is not.
 *
 * ─── TWO RECORDED DIVERGENCES FROM THE CANONICAL ────────────────────────────
 *
 * 1. PER-MEMBER REMOVAL (`onRemoveMember`) is offered on the group parent and on
 *    each child. The canonical's own entry model DOES carry a child `onUnlink`,
 *    but this section's markup never renders it — so this surfaces an affordance
 *    the design has and does not show, rather than inventing one. Kept on both
 *    screens because it was asked for directly, and it is gated: every removal
 *    carries an audited justification. Presentation fidelity is not worth losing
 *    a requested capability.
 *
 * 2. ⚠️ THE `onInspect` "View" (Eye) BUTTON IS OURS, with no counterpart in the
 *    design's model, and it now duplicates what View History and the card body
 *    already give the user. A CANDIDATE FOR REMOVAL — left in place deliberately
 *    so the decision is made on purpose rather than as a side effect of a
 *    presentation fix. If you are reading this while wondering why the search
 *    cards have three buttons where the design has two, that is why.
 *
 * The StatusBadge geometry normalisation (the system's `md` at 22px/radius 4
 * against the design's 26px/radius 7) is recorded at its own call site below and
 * is a design-system question, not a fidelity one.
 */

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
export function SuggestionCard({
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
export function GroupCard({
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

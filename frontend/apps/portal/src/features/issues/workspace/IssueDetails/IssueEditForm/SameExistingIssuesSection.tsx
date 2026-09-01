import { useMemo, useState } from 'react'
import { CopyCheck, Search, SearchX, X } from 'lucide-react'
import { Button, Icon, SearchField } from '@pqms/ui-library'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { CardHead, SectionCard } from '@/app/chrome'
import { useStore } from '@/data/store'
import { relatedRank } from '@/data/relatedRank'
import type { Issue } from '@/data/types'
import { LinkJustifyBox, applyJustification } from '@/features/issues/linking/LinkJustifyBox'
import { GroupCard, SuggestionCard } from '@/features/issues/related/RelatedIssueCards'
import {
  GroupHistoryModal,
  IssueHistoryModal,
  useHistoryTarget,
} from '@/features/issues/issue-entry/HistoryModals'
import { NS as ENTRY_NS } from '@/features/issues/issue-entry/IssueEntry.i18n'
import { NS } from '../../IssueDetail.i18n'
import styles from './SameExistingIssuesSection.module.css'

/**
 * Same Existing Issues, on the EDIT surface — suggestions AND search, one section.
 *
 * ─── ⚠️ THE DESIGN RENDERS THIS SECTION TWICE, AND ALMOST IDENTICALLY ───────
 *
 * Once inside `sc-if showCreate` (Issue Entry) and once inside `sc-if editMode`
 * (Issue Edit): 132 non-blank lines against 133, differing by ONE line. So the
 * edit surface is not a smaller variant of the create surface, it is the same
 * section — which is why this renders the shared `RelatedIssueCards` and why
 * search now lives INSIDE here, behind the header's own toggle, rather than in a
 * separate card beside it.
 *
 * ⚠️ IT SUPERSEDES `LinkIssuesSection`, WHICH IS DELETED. That component was the
 * edit form's search block: a separate always-visible card. Its behaviour was
 * pinned first, in `tests/features/issues/linking/linkIssuesSection.test.tsx`,
 * against the unmodified original — so "its behaviour survived" is a measurement
 * rather than a reading. Those tests now target this panel.
 *
 * ─── ⚠️ LINKED ISSUES APPEAR HERE, TAGGED, RATHER THAN IN A SEPARATE LIST ────
 *
 * The old card kept its own list of everything linked. This section has no such
 * list, and does not need one: the design INJECTS every linked issue that did not
 * rank into the entry list with `reasons: ['Manually linked']` and score 0 — which
 * is what its `isManualOnly` annotation exists to render. So a linked issue is
 * always visible and always unlinkable from here, whether it ranked or not.
 *
 * ⚠️ ONE THING THE DESIGN DROPS SILENTLY AND WE DO NOT. Its injection reads
 * `const p = _pool.find(...); if (p)` — so a linked id whose issue is not in the
 * pool is skipped without trace. This fixture HAS such ids (see
 * `UNPORTED_LINK_TARGETS`), and the old card named them "Issue not found" rather
 * than rendering a blank row. Silently showing fewer linked issues than the count
 * claims is the failure class the link invariants were written after, so the
 * unresolvable ones are named below. That is a deliberate divergence.
 *
 * ─── EVERY MUTATION IS PERSISTED, SO EVERY ONE IS GATED ─────────────────────
 *
 * Unchanged by the fold-in, and the reason it is stated again: the issue EXISTS
 * on this surface, so a link or an unlink is an audited mutation. One pending
 * change at a time, replacing rather than queuing, so an abandoned reason cannot
 * attach itself to the next change. Issue Entry's four draft controls are not
 * reused — including the one that collects a justification and then writes only to
 * a local array.
 */
export function SameExistingIssuesSection({
  issue,
  subject,
  linkedIds,
  onLink,
  onUnlink,
  disabled = false,
}: {
  /** The issue being edited — the exclusion target, and the link counterpart. */
  issue: Issue
  /**
   * The form's CURRENT values, not the saved issue's. Ranking follows the edits,
   * as the design's own view-model does: it computes matches unconditionally from
   * form state, and its edit mode repopulates that state from the issue.
   */
  subject: {
    system?: string
    subSystem?: string
    component?: string
    symptom?: string
    title?: string
    description?: string
    dtcCodes?: string[]
    modelCode?: string
  }
  linkedIds: string[]
  onLink: (ids: string[], justification: string) => void
  onUnlink: (id: string, justification: string) => void
  disabled?: boolean
}) {
  const { t } = useTranslation(NS)
  const { t: te } = useTranslation(ENTRY_NS)
  const store = useStore()
  const nav = useNavigate()
  const history = useHistoryTarget()

  /** Collapsed by default, as the design's is — the header button opens it. */
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  /**
   * One pending change at a time, replacing rather than queuing: a half-typed
   * reason for a change the user walked away from must not be able to attach
   * itself to the next one. Carried over from the component this supersedes.
   */
  const [pending, setPending] = useState<{ key: string; ids: string[]; kind: 'link' | 'unlink'; text: string; err: string } | null>(null)

  const start = (key: string, ids: string[], kind: 'link' | 'unlink') =>
    setPending({ key, ids, kind, text: '', err: '' })

  const commit = () => {
    if (!pending) return
    const err = applyJustification(pending.text)
    if (err) return setPending({ ...pending, err })
    const why = pending.text.trim()
    if (pending.kind === 'link') {
      onLink(pending.ids, why)
      // The old card cleared its query on a successful link; a result that is now
      // linked has no business still sitting in a list of things to link.
      setQuery('')
    } else {
      onUnlink(pending.ids[0], why)
    }
    setPending(null)
  }

  type Entry = { key: string; issue: Issue; reasons: string[]; members?: Issue[] }

  /**
   * Collapse a ranked list into cards: a group is represented ONCE by its parent
   * with its children folded in, so a four-issue cohort is one card rather than
   * four. Shared by the suggestions and the search results, because the design
   * renders group cards in both.
   */
  const toEntries = useMemo(
    () => (ranked: { issue: Issue; reasons: string[] }[], limit: number): Entry[] => {
      const out: Entry[] = []
      const seenGroup = new Set<string>()
      for (const r of ranked) {
        const gid = r.issue.groupId
        if (gid) {
          if (seenGroup.has(gid)) continue
          seenGroup.add(gid)
          /*
           * ⚠️ NEVER THE SUBJECT'S OWN GROUP. Offering the group the edited issue
           * already belongs to is not a suggestion, and its controls would be
           * incoherent: a card-level link would call `linkIssue(id, id, …)`, a
           * self-link the seed invariants forbid, and the member list would offer
           * "Remove from group" on the issue being edited. Skipped whole, because
           * a group card missing one member misrepresents the group.
           */
          if (gid === issue.groupId) continue
          const members = store.groupMembers(r.issue.id).filter((m) => m.id !== issue.id)
          if (members.length > 1) {
            out.push({ key: gid, issue: members[0], reasons: r.reasons, members })
            continue
          }
        }
        out.push({ key: r.issue.id, issue: r.issue, reasons: r.reasons })
      }
      return out.slice(0, limit)
    },
    [store, issue.id, issue.groupId],
  )

  /**
   * Ranked suggestions, PLUS every linked issue that did not rank.
   *
   * The injection is the design's: a linked issue absent from the matches is
   * appended with `reasons: ['Manually linked']`, which is why that annotation
   * exists on the card. Without it, linking an issue with an unrelated
   * classification would make it vanish from this screen and become impossible to
   * unlink here.
   */
  const entries = useMemo(() => {
    const ranked = relatedRank(subject, store.issues, issue.id).map((r) => ({ issue: r.issue, reasons: r.reasons }))
    const seen = new Set(ranked.map((r) => r.issue.id))
    for (const id of linkedIds) {
      if (seen.has(id)) continue
      const found = store.getIssue(id)
      if (found) ranked.push({ issue: found, reasons: ['Manually linked'] })
    }
    return toEntries(ranked, 8)
  }, [subject, store, issue.id, linkedIds, toEntries])

  /**
   * Search results — the old card's predicate exactly: id, title, model or
   * symptom, excluding the edited issue and anything already linked, capped at 8.
   * Offering an action that would do nothing is worse than not offering it.
   */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const hits = store.issues
      .filter((i) => i.id !== issue.id && !linkedIds.includes(i.id))
      .filter((i) => `${i.id} ${i.title} ${i.model} ${i.symptom ?? ''}`.toLowerCase().includes(q))
      .map((i) => ({ issue: i, reasons: [] as string[] }))
    return toEntries(hits, 8)
  }, [store, query, linkedIds, issue.id, toEntries])

  /**
   * Linked ids with no issue behind them. The design drops these silently; the
   * component this replaces named them. See the header note — showing fewer
   * linked issues than the count claims is the failure the link invariants exist
   * to catch.
   */
  const dangling = useMemo(() => linkedIds.filter((id) => !store.getIssue(id)), [linkedIds, store])

  const justifyRow = (key: string) =>
    pending && pending.key === key ? (
      <div className={styles.justifyRow}>
        <LinkJustifyBox
          text={pending.text}
          error={pending.err}
          onText={(next) => setPending({ ...pending, text: next, err: '' })}
          onApply={commit}
          onCancel={() => setPending(null)}
          applyLabel={t(pending.kind === 'link' ? 'sameConfirmLink' : 'sameConfirmUnlink')}
          label={`${t(pending.kind === 'link' ? 'sameJustifyLink' : 'sameJustifyUnlink')} ${pending.ids.join(', ')}`}
          inputLabel={`${t(pending.kind === 'link' ? 'sameJustifyLink' : 'sameJustifyUnlink')} ${pending.ids.join(', ')}`}
        />
      </div>
    ) : null

  /**
   * One card, either kind.
   *
   * ⚠️ `showStandaloneBadge` IS PER CARD TYPE, NOT PER SURFACE, and reading it as
   * per-surface is a live trap. The design badges standalone SEARCH-RESULT cards
   * on BOTH screens, and standalone SUGGESTION cards on the EDIT screen only. It
   * is therefore true for every card this section renders — but that is a
   * coincidence of this surface, not the rule, and Issue Entry passes false for
   * its suggestion cards for exactly that reason.
   */
  const card = (e: Entry) => {
    const ids = e.members ? e.members.map((m) => m.id) : [e.issue.id]
    const linked = ids.every((id) => linkedIds.includes(id))
    const gate = (kind: 'link' | 'unlink') => () => start(e.key, ids, kind)
    return (
      <div key={e.key} data-testid={`same-suggestion-${e.key}`}>
        {e.members ? (
          <GroupCard
            parent={e.members[0]}
            children={e.members.slice(1)}
            linked={linked}
            reasons={e.reasons}
            variant="suggestion"
            disabled={disabled}
            onLink={gate('link')}
            onUnlink={gate('unlink')}
            onViewHistory={() => history.openGroup(e.members![0].id)}
            /* Gated inside the card: it captures its own reason and does not
               call through until the reason clears the shared rule. */
            onRemoveMember={(id, why) => onUnlink(id, why)}
          />
        ) : (
          <SuggestionCard
            issue={e.issue}
            linked={linked}
            reasons={e.reasons}
            showStandaloneBadge
            disabled={disabled}
            onLink={gate('link')}
            onUnlink={gate('unlink')}
            onViewHistory={() => history.openIssue(e.issue.id)}
          />
        )}
        {justifyRow(e.key)}
      </div>
    )
  }

  const linkedCount = linkedIds.length

  return (
    <SectionCard>
      <CardHead
        icon={CopyCheck}
        title={te('sameExistingTitle')}
        subtitle={te('sameExistingSubtitle')}
        right={
          <div className={styles.headActions}>
            {linkedCount > 0 && (
              <span className={styles.linkedCount}>
                {linkedCount} {te('sameExistingLinked')}
              </span>
            )}
            {/* The design's own affordance: search is folded into this section
                and opened from here, not a card of its own beside it. */}
            <Button
              variant="secondary"
              size="sm"
              disabled={disabled}
              iconLeft={<Icon icon={Search} size={14} />}
              onClick={() => setSearchOpen((o) => !o)}
            >
              {te('searchLinkAnother')}
            </Button>
          </div>
        }
      />

      {searchOpen && (
        <div className={styles.searchPanel} data-testid="same-search-panel">
          <div className={styles.searchHead}>
            <span className={styles.searchTitle}>
              <Icon icon={Search} size={14} />
              {te('searchLinkExisting')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('sameSearchClose')}
              onClick={() => { setSearchOpen(false); setQuery('') }}
            >
              <Icon icon={X} size={14} />
            </Button>
          </div>

          <SearchField
            aria-label={t('sameSearchLabel')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('sameSearchPlaceholder')}
          />

          {query.trim().length === 0 ? (
            <p className={styles.searchIdle}>
              <Icon icon={Search} size={14} />
              {te('searchIdle')}
            </p>
          ) : results.length === 0 ? (
            <p className={styles.searchIdle}>
              <Icon icon={SearchX} size={14} />
              {t('sameSearchNoMatch', { query: query.trim() })}
            </p>
          ) : (
            <>
              <div className={styles.searchResultsHead}>
                <span>{te('searchResults')}</span>
                <span>{te('searchCount', { count: results.length })}</span>
              </div>
              <div className={styles.list}>{results.map(card)}</div>
            </>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <p className={styles.empty}>{t('sameSuggestEmpty')}</p>
      ) : (
        <div className={styles.list}>{entries.map(card)}</div>
      )}

      {dangling.length > 0 && (
        <p className={styles.dangling}>{t('sameDangling', { ids: dangling.join(', ') })}</p>
      )}

      {/*
        View History, the same two modals Issue Entry opens — chosen by CARD TYPE,
        not by surface: a group card opens the group modal, a standalone card the
        single-issue one. The design's cards carry this button on both screens.
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
    </SectionCard>
  )
}

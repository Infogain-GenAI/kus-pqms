import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Check,
  CircleX,
  GitCompareArrows,
  GitMerge,
  History,
  Link2,
  Search,
  SearchX,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Icon, StatusBadge } from '@pqms/ui-library'
import { Modal } from '@/app/chrome'
import { JUSTIFICATION_MAX, clampJustification } from '@/data/linkJustification'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import type { Issue } from '@/data/types'
import { fmtMDY } from '@/shared/format/date'
import { usePendingJustifications } from '../linking/usePendingJustifications'
import { NS as LINK_JUSTIFY_NS } from '../linking/LinkJustify.i18n'
import { projectParent, relatedImpact } from '../linking/relatedIssues'
import { NS } from './IssueDetail.i18n'
import styles from './manageRelated.module.css'

/**
 * Manage Related Issues — Parent/Child group editing, draft until Save.
 *
 * A 1:1 port of the prototype's own modal (`docs/ux-prototype/PQMS-2.html`,
 * the `wsSameModalOpen` block). See `manageRelated.module.css` for the
 * value-by-value mapping and `../linking/relatedIssues.ts` for the impact and
 * parent-projection rules.
 *
 * ─── WHAT THIS EDITS, AND WHAT IT DOES NOT ──────────────────────────────────
 *
 * This app has TWO relationships and they are not the same thing:
 *   `linkedIssueIds` — symmetric, single-action, edited in `ExistingIssueModal`;
 *   `groupId`        — hierarchical Parent/Child, draft/commit, edited HERE.
 *
 * ─── EVERY PENDING CHANGE CARRIES ITS OWN JUSTIFICATION ─────────────────────
 *
 * Per change, not per Save — the prototype keys its pending map by member id
 * with a separate reason on each, and `saveSameModal` says each change gets its
 * own audit entry. Save stays disabled until every pending change is applied.
 * `planGroupEdits` owns the cascades (dissolve, parent promotion, chaining).
 *
 * ─── THE THREE THINGS THE OLD BUILD DID NOT SAY ─────────────────────────────
 *
 * Restored from the prototype, and each answers a question the user could
 * previously only answer by saving and looking:
 *   · the "Issue Group · N Issues" pill — how big is the group I am editing;
 *   · the impact band — what exactly will Save do;
 *   · the Parent-will-change warning — Parent is derived from Issue Date, so
 *     linking an OLDER issue silently demotes the current Parent. That was
 *     invisible until after the commit.
 */
export function ManageRelatedIssuesModal({
  open,
  issue,
  onClose,
}: {
  open: boolean
  issue: Issue
  onClose: () => void
}) {
  const { t } = useTranslation(NS)
  const { t: tj } = useTranslation(LINK_JUSTIFY_NS)
  const store = useStore()
  const { user } = useRole()

  /** The group as it stands, parent first. */
  const group = useMemo(() => store.groupMembers(issue.id), [store, issue.id])
  const members = useMemo(() => group.filter((m) => m.id !== issue.id), [group, issue.id])
  const parentId = group[0]?.id

  const [removals, setRemovals] = useState<string[]>([])
  const [additions, setAdditions] = useState<string[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return
    setRemovals([])
    setAdditions([])
    setSearchOpen(false)
    setQuery('')
  }, [open])

  const changedIds = [...removals, ...additions]
  const justify = usePendingJustifications(changedIds)
  useEffect(() => { if (open) justify.reset() }, [open])

  /*
   * The search pool. Excludes the issue itself, everything already in the group,
   * and everything already pending — the prototype's `_mlExcludeIds`. Without
   * that last one a result could be linked twice and the second row would have
   * no way to be withdrawn independently.
   */
  const excluded = useMemo(
    () => new Set([issue.id, ...members.map((m) => m.id), ...additions]),
    [issue.id, members, additions],
  )
  const results = useMemo(() => {
    const needle = query.trim().toUpperCase()
    if (!needle) return []
    return store.issues
      .filter((p) => {
        if (excluded.has(p.id)) return false
        const hay = [p.id, p.title, p.system, p.subSystem, p.component, p.symptom, p.model, p.description]
          .join(' ')
          .toUpperCase()
        return hay.includes(needle)
      })
      .slice(0, 8)
  }, [store.issues, query, excluded])

  const addedIssues = useMemo(
    () => additions.map((id) => store.getIssue(id)).filter((i): i is Issue => Boolean(i)),
    [additions, store],
  )

  /* Only APPLIED changes count as pending — a toggled row with no accepted
     reason is not yet a change the impact band should describe. */
  const appliedRemovals = removals.filter((id) => justify.reasons[id]?.applied)
  const appliedAdditions = additions.filter((id) => justify.reasons[id]?.applied)
  const impact = relatedImpact(
    appliedAdditions.map((id) => ({ id, rel: 'Child' as const })),
    appliedRemovals.map((id) => ({ id, rel: id === parentId ? ('Parent' as const) : ('Child' as const) })),
  )
  const hasPending = appliedRemovals.length + appliedAdditions.length > 0

  const projection = projectParent(
    group,
    appliedRemovals,
    addedIssues.filter((i) => appliedAdditions.includes(i.id)),
  )
  const nextParent = projection.nextParentId ? store.getIssue(projection.nextParentId) : null

  const save = () => {
    store.saveGroupEdits(
      {
        activeId: issue.id,
        removals: removals.map((id) => ({ id, justification: justify.reasonFor(id) })),
        additions: additions.map((id) => ({ id, justification: justify.reasonFor(id) })),
      },
      { name: user.name, role: user.role },
    )
    onClose()
  }

  const metaFor = (i: Issue) => [i.modelCode, i.system, i.subSystem].filter(Boolean).join(' · ')

  return (
    <Modal open={open} onClose={onClose} width={720} bare>
      <div className={styles.panel}>
        <header className={styles.header}>
          <span className={styles.headerIcon} aria-hidden>
            <Icon icon={GitCompareArrows} size={19} />
          </span>
          <div className={styles.headerText}>
            <h2 className={styles.headerTitle}>{t('linksModalTitle')}</h2>
            <p className={styles.headerSubtitle}>{t('linksModalSubtitle')}</p>
          </div>
          <button type="button" className={styles.headerClose} onClick={onClose} aria-label={t('linksModalClose')}>
            <Icon icon={X} size={17} />
          </button>
        </header>

        <div className={styles.body}>
          {/* ── Current related issues ─────────────────────────────────────── */}
          <section>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionLabel}>{t('linksModalCurrentHeading')}</h3>
              {members.length > 0 && (
                <span className={styles.groupPill}>
                  <Icon icon={GitMerge} size={13} />
                  {t('linksModalGroupPill', { group: t('linksModalGroupCount', { count: group.length }) })}
                </span>
              )}
            </div>

            {members.length === 0 ? (
              <p className={styles.emptyNote}>{t('linksModalEmpty')}</p>
            ) : (
              <>
                <p className={styles.sectionNote}>{t('linksModalGroupNote')}</p>
                <div className={styles.rows}>
                  {members.map((m) => {
                    const row = justify.reasons[m.id]
                    const pendingApplied = Boolean(row?.applied)
                    const editing = Boolean(row) && !pendingApplied
                    return (
                      <div
                        key={m.id}
                        className={`${styles.row} ${pendingApplied ? styles.rowPending : editing ? styles.rowEditing : ''}`}
                      >
                        <div className={styles.rowMain}>
                          <div className={styles.rowText}>
                            <div className={styles.rowTags}>
                              <span className={styles.rowId}>{m.id}</span>
                              {/* Role is DERIVED from registration order, never stored. */}
                              <span
                                className={`${styles.relBadge} ${m.id === parentId ? styles.relBadgeParent : ''}`}
                              >
                                {m.id === parentId ? t('linksModalParent') : t('linksModalChild')}
                              </span>
                              {pendingApplied && (
                                <span className={`${styles.stateBadge} ${styles.stateUnlink}`}>
                                  {t('linksModalPendingUnlink')}
                                </span>
                              )}
                            </div>
                            <div className={styles.rowTitle}>{m.title}</div>
                            <div className={styles.rowMeta}>{metaFor(m)}</div>
                          </div>
                          {!row && (
                            <button
                              type="button"
                              className={styles.unlinkButton}
                              onClick={() => setRemovals((r) => [...r, m.id])}
                            >
                              {t('linksModalUnlink')}
                            </button>
                          )}
                          {pendingApplied && (
                            <button
                              type="button"
                              className={styles.undoButton}
                              onClick={() => setRemovals((r) => r.filter((x) => x !== m.id))}
                            >
                              {t('linksModalUndo')}
                            </button>
                          )}
                        </div>
                        {editing && (
                          <JustifyEditor
                            kind="unlink"
                            id={m.id}
                            text={row?.text ?? ''}
                            error={row?.err ?? ''}
                            onText={(next) => justify.setText(m.id, next)}
                            onApply={() => justify.apply(m.id)}
                            onDismiss={() => setRemovals((r) => r.filter((x) => x !== m.id))}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </section>

          <div className={styles.divider} aria-hidden />

          {/* ── Link another issue ─────────────────────────────────────────── */}
          <section>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionLabel}>{t('linksModalCandidatesHeading')}</h3>
              <button type="button" className={styles.searchToggle} onClick={() => setSearchOpen((o) => !o)}>
                <Icon icon={Search} size={15} />
                {t('linksModalSearchToggle')}
              </button>
            </div>

            {searchOpen && (
              <div className={styles.searchPanel}>
                <div className={styles.searchHead}>
                  <div className={styles.searchHeadLeft}>
                    <span className={styles.searchChip} aria-hidden>
                      <Icon icon={Search} size={15} />
                    </span>
                    <div className={styles.searchTitle}>{t('linksModalSearchPanelTitle')}</div>
                  </div>
                  <button
                    type="button"
                    className={styles.searchClose}
                    onClick={() => setSearchOpen(false)}
                    aria-label={t('linksModalSearchClose')}
                  >
                    <Icon icon={X} size={15} />
                  </button>
                </div>

                <div className={styles.searchField}>
                  <span className={styles.searchFieldIcon} aria-hidden>
                    <Icon icon={Search} size={16} />
                  </span>
                  <input
                    className={styles.searchInput}
                    aria-label={t('linksModalSearchLabel')}
                    value={query}
                    placeholder={t('linksModalSearchBoxPlaceholder')}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className={styles.searchRule} aria-hidden />

                {query.trim().length === 0 && (
                  <div className={styles.searchState}>
                    <Icon icon={Search} size={20} />
                    <p className={styles.searchStateText}>{t('linksModalSearchIdle')}</p>
                  </div>
                )}

                {query.trim().length > 0 && results.length === 0 && (
                  <div className={styles.searchState}>
                    <Icon icon={SearchX} size={22} />
                    <p className={styles.searchStateText}>{t('linksModalSearchNone', { query: query.trim() })}</p>
                  </div>
                )}

                {results.length > 0 && (
                  <>
                    <div className={styles.resultsHead}>
                      <span className={styles.resultsLabel}>{t('linksModalResultsHeading')}</span>
                      <span className={styles.resultsCount}>
                        {t('linksModalResultCount', { count: results.length })}
                      </span>
                    </div>
                    <div className={styles.rows}>
                      {results.map((r) => (
                        <div key={r.id} className={styles.result}>
                          <div className={styles.rowText}>
                            <div className={styles.resultTags}>
                              <span className={styles.rowId}>{r.id}</span>
                              <StatusBadge status={r.status} size="sm" />
                            </div>
                            <div className={styles.rowTitle}>{r.title}</div>
                            <div className={styles.resultMeta}>
                              {t('linksModalResultMeta', {
                                model: r.modelCode || '—',
                                classification: [r.system, r.subSystem, r.component, r.symptom]
                                  .map((v) => v || '—')
                                  .join(' · '),
                              })}
                            </div>
                          </div>
                          <div className={styles.resultActions}>
                            {/*
                             * A NEW TAB, NOT A SECOND MODAL AND NOT A NAVIGATION.
                             * The prototype opens its history modal on top of this
                             * one; EXPERIENCE.md caps dialogs at depth 1. Navigating
                             * instead would discard every pending change in this
                             * draft — the one outcome worse than the extra tab.
                             */}
                            <a
                              className={styles.resultGhost}
                              href={`/issues/${r.id}/history`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Icon icon={History} size={14} />
                              {t('linksModalViewHistory')}
                            </a>
                            <button
                              type="button"
                              className={styles.resultLink}
                              onClick={() => setAdditions((a) => [...a, r.id])}
                            >
                              <Icon icon={Link2} size={14} />
                              {t('linksModalLink')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {addedIssues.length > 0 && (
              <div className={styles.rows}>
                {addedIssues.map((a) => {
                  const row = justify.reasons[a.id]
                  const applied = Boolean(row?.applied)
                  return (
                    <div key={a.id} className={`${styles.row} ${styles.rowIncoming}`}>
                      <div className={styles.rowMain}>
                        <div className={styles.rowText}>
                          <div className={styles.rowTags}>
                            <span className={styles.rowId}>{a.id}</span>
                            <span className={styles.relBadge}>{t('linksModalChild')}</span>
                            {applied && (
                              <span className={`${styles.stateBadge} ${styles.stateLink}`}>
                                {t('linksModalPendingLink')}
                              </span>
                            )}
                          </div>
                          <div className={styles.rowTitle}>{a.title}</div>
                          <div className={styles.rowMeta}>{metaFor(a)}</div>
                        </div>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => setAdditions((x) => x.filter((id) => id !== a.id))}
                          aria-label={`${t('linksModalRemove')} ${a.id}`}
                        >
                          <Icon icon={X} size={16} />
                        </button>
                      </div>
                      {!applied && (
                        <JustifyEditor
                          kind="link"
                          id={a.id}
                          text={row?.text ?? ''}
                          error={row?.err ?? ''}
                          onText={(next) => justify.setText(a.id, next)}
                          onApply={() => justify.apply(a.id)}
                          onDismiss={() => setAdditions((x) => x.filter((id) => id !== a.id))}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* ── What Save will do ────────────────────────────────────────────── */}
        {hasPending && (
          <div className={styles.impact}>
            <p className={styles.impactCount}>{impact.countLabel}</p>
            {impact.head && <p className={styles.impactHead}>{impact.head}</p>}
            <p className={styles.impactBody}>{impact.body}</p>
            {projection.willChange && nextParent && (
              <div className={styles.parentWarn}>
                <span className={styles.parentWarnIcon} aria-hidden>
                  <Icon icon={AlertTriangle} size={16} />
                </span>
                <div>
                  <p className={styles.parentWarnTitle}>{t('linksModalParentWarnTitle')}</p>
                  <p className={styles.parentWarnBody}>
                    {t('linksModalParentWarnBody', {
                      next: nextParent.id,
                      date: fmtMDY(nextParent.reportedDate),
                      current: projection.currentParentId,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <footer className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            <Icon icon={CircleX} size={16} />
            {t('linksModalCancel')}
          </button>
          {/* Not merely "dirty": a pending change with no accepted reason must
              not be saveable, or the gate is decorative. */}
          <button
            type="button"
            className={styles.saveButton}
            disabled={changedIds.length === 0 || !justify.allApplied}
            onClick={save}
            title={changedIds.length > 0 && !justify.allApplied ? tj('saveBlocked') : undefined}
          >
            <Icon icon={Check} size={16} />
            {t('linksModalSave')}
          </button>
        </footer>
      </div>
    </Modal>
  )
}

/**
 * The inline justification editor that lives INSIDE the row it belongs to.
 *
 * ⚠️ THE ACCESSIBLE NAME IS PART OF THE CONTRACT. `Justification for unlinking
 * CL-260022` is how the justification-gate tests reach a specific row's box, and
 * with five identically-labelled rows on screen nothing else disambiguates them.
 */
function JustifyEditor({
  kind,
  id,
  text,
  error,
  onText,
  onApply,
  onDismiss,
}: {
  kind: 'link' | 'unlink'
  id: string
  text: string
  error: string
  onText: (next: string) => void
  onApply: () => void
  onDismiss: () => void
}) {
  const { t } = useTranslation(NS)
  const { t: tj } = useTranslation(LINK_JUSTIFY_NS)
  const label = kind === 'unlink' ? t('linksModalUnlinkJustification') : t('linksModalLinkJustification')
  const name = `Justification for ${kind === 'unlink' ? 'unlinking' : 'linking'} ${id}`

  return (
    <div className={`${styles.justify} ${kind === 'link' ? styles.justifyIncoming : ''}`}>
      <label className={styles.justifyLabel} htmlFor={`justify-${id}`}>
        {label} <span className={styles.required}>*</span>
      </label>
      <textarea
        id={`justify-${id}`}
        aria-label={name}
        className={`${styles.justifyInput} ${error ? styles.justifyInputError : ''}`}
        rows={3}
        maxLength={JUSTIFICATION_MAX}
        placeholder={t('linksModalJustifyPlaceholder')}
        value={text}
        onChange={(e) => onText(clampJustification(e.target.value))}
      />
      <div className={styles.justifyFoot}>
        {error && <span className={styles.justifyError} role="alert">{error}</span>}
        <span className={styles.counter}>{`${text.length} / ${JUSTIFICATION_MAX} characters`}</span>
      </div>
      <div className={styles.justifyActions}>
        {/*
         * Cancel on an unlink row, Remove on a link row — the prototype's own
         * wording, and it is accurate: withdrawing a pending LINK deletes the
         * row, withdrawing a pending UNLINK returns the member to the group.
         *
         * ⚠️ THE ACCESSIBLE NAME CARRIES THE ID. "Cancel" is also the dialog's
         * footer button, and several rows can be open at once — so by visible
         * text alone a screen-reader user hears "Cancel" three times with no way
         * to tell which one abandons the dialog.
         */}
        <button
          type="button"
          className={styles.ghostButton}
          aria-label={`${kind === 'unlink' ? t('linksModalCancel') : t('linksModalRemove')} ${name.replace(/^Justification for /, '')}`}
          onClick={onDismiss}
        >
          {kind === 'unlink' ? t('linksModalCancel') : t('linksModalRemove')}
        </button>
        <button type="button" className={styles.applyButton} onClick={onApply}>
          {tj('apply')}
        </button>
      </div>
    </div>
  )
}

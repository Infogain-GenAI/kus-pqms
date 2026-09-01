import { useMemo, useState } from 'react'
import { Link2, Sparkles } from 'lucide-react'
import { Button, Icon, StatusBadge } from '@pqms/ui-library'
import { useTranslation } from 'react-i18next'
import { CardHead, SectionCard } from '@/app/chrome'
import { useStore } from '@/data/store'
import { relatedRank } from '@/data/relatedRank'
import type { Issue } from '@/data/types'
import { LinkJustifyBox, applyJustification } from '@/features/issues/linking/LinkJustifyBox'
import { NS } from '../../IssueDetail.i18n'
import styles from './SameExistingIssuesSection.module.css'

/**
 * Same Existing Issues — ranked suggestions, on the EDIT surface.
 *
 * ─── WHAT WAS ACTUALLY MISSING ──────────────────────────────────────────────
 *
 * The edit form already had a section headed "Same existing issues" — but its
 * body was `LinkIssuesSection`, which is the SEARCH block. The ranked half was
 * absent, so the heading promised suggestions the screen never made. This is the
 * ranked half, and it is ADDITIVE: `LinkIssuesSection` is untouched and still
 * owns search and the linked list.
 *
 * ─── ⚠️ EVERY MUTATION HERE IS PERSISTED, SO EVERY ONE IS GATED ─────────────
 *
 * Issue Entry's version of this block edits a DRAFT. Three of its controls write
 * to a local array and one — the card-level link — opens the confirmation modal,
 * collects a justification, and then also writes to the local array. That last
 * one is the dangerous shape to port: a reviewer asking "does linking ask for a
 * reason here?" gets yes, while nothing is persisted and nothing is audited.
 *
 * None of those four are reused. On this surface the issue EXISTS, so a link or
 * an unlink is a persisted relationship mutation and carries an audited reason —
 * committed through the store, never through local state. The tests assert the
 * STORE changed, not that a modal appeared, for exactly that reason.
 *
 * ─── ⚠️ THE RANKING IS LIVE, AND IT SELF-EXCLUDES ───────────────────────────
 *
 * LIVE: the subject is the form's CURRENT classification, not the issue's saved
 * one, so editing the classification re-ranks as you type. That follows the
 * design's own binding — its view-model computes the matches unconditionally
 * from the form state, and its edit mode repopulates that same form state.
 *
 * SELF-EXCLUDES, AND THE DESIGN DOES NOT — a recorded divergence. The design
 * calls its ranker with a hardcoded `null` exclude while, twenty lines later in
 * the same function, its free-text search correctly excludes the issue being
 * edited. So an issue can rank as its own top suggestion while being edited.
 * That is an oversight rather than a specification: the adjacent code visibly
 * cares about this exact case. We pass the issue's own id, as Issue Entry's
 * create path already does.
 *
 * ─── NO SECOND WAY TO JOIN A GROUP ──────────────────────────────────────────
 *
 * A group card here offers a symmetric LINK to the group's members, and per-member
 * removal from the group. It deliberately offers no way to ADD an issue to a
 * group: `ManageRelatedIssuesModal` is the group editor and is reachable from the
 * workspace shell, and a second entry point to the same mutation is how two
 * paths drift apart.
 *
 * ⚠️ PER-MEMBER REMOVAL EDITS A GROUP THE SUBJECT MAY NOT BELONG TO. Removing a
 * member from a SUGGESTED group restructures that group, which is a real
 * mutation reached from a suggestions list. Issue Entry's card already behaves
 * this way, so this is consistent rather than new — but it is worth a reader
 * knowing it is possible from here, because "suggestions" does not sound like a
 * surface that edits other issues' groups.
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
   * The form's CURRENT values, not the saved issue's. Ranking follows the edits.
   * Passed in rather than read from `issue` so this component cannot accidentally
   * rank against stale data.
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
  const store = useStore()

  /**
   * One pending change at a time, replacing rather than queuing — the same rule
   * `LinkIssuesSection` states: a half-typed reason for an abandoned change must
   * not be able to attach itself to the next one.
   */
  const [pending, setPending] = useState<{ key: string; ids: string[]; kind: 'link' | 'unlink'; text: string; err: string } | null>(null)

  const start = (key: string, ids: string[], kind: 'link' | 'unlink') =>
    setPending({ key, ids, kind, text: '', err: '' })

  const commit = () => {
    if (!pending) return
    const err = applyJustification(pending.text)
    if (err) return setPending({ ...pending, err })
    const why = pending.text.trim()
    if (pending.kind === 'link') onLink(pending.ids, why)
    else onUnlink(pending.ids[0], why)
    setPending(null)
  }

  /**
   * Ranked entries, grouped. A group is represented ONCE by its parent row with
   * its children folded in, so a four-issue cohort is one suggestion rather than
   * four — and `groupMembers` decides the parent, which is always the earliest.
   *
   * Already-linked issues are excluded rather than shown with a pill: the linked
   * list belongs to `LinkIssuesSection`, and offering unlink in two places is the
   * duplicate-affordance problem this section is otherwise careful to avoid.
   */
  const entries = useMemo(() => {
    const linked = new Set(linkedIds)
    const ranked = relatedRank(subject, store.issues, issue.id).filter((r) => !linked.has(r.issue.id))

    const out: { key: string; issue: Issue; reasons: string[]; members?: Issue[] }[] = []
    const seenGroup = new Set<string>()
    for (const r of ranked) {
      const gid = r.issue.groupId
      if (gid) {
        if (seenGroup.has(gid)) continue
        seenGroup.add(gid)
        /*
         * ⚠️ NEVER THE SUBJECT'S OWN GROUP. Suggesting the group the edited issue
         * is already in is not a suggestion, and the controls would be incoherent:
         * a card-level link would call `linkIssue(issue.id, issue.id, ...)` — a
         * self-link, which `assertLinks` forbids even in the fixture — and the
         * member list would offer "Remove from group" on the issue being edited.
         * Skipped whole rather than filtered, because a group card that omits one
         * member misrepresents the group.
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
    return out.slice(0, 5)
  }, [subject, store, issue.id, linkedIds])

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

  return (
    <SectionCard>
      <CardHead icon={Sparkles} title={t('sameSuggestTitle')} subtitle={t('sameSuggestSubtitle')} />

      {entries.length === 0 ? (
        <p className={styles.empty}>{t('sameSuggestEmpty')}</p>
      ) : (
        <div className={styles.list}>
          {entries.map((e) => {
            const ids = e.members ? e.members.map((m) => m.id) : [e.issue.id]
            return (
              <div key={e.key} className={styles.card} data-testid={`same-suggestion-${e.key}`}>
                <div className={styles.row}>
                  <span className={styles.id}>{e.issue.id}</span>
                  <span className={styles.title}>{e.issue.title}</span>
                  <StatusBadge status={e.issue.status} size="sm" />
                  {e.members && (
                    <span className={styles.groupPill}>
                      {t('sameGroupOf', { count: e.members.length })}
                    </span>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={disabled}
                    iconLeft={<Icon icon={Link2} size={13} />}
                    onClick={() => start(e.key, ids, 'link')}
                  >
                    {t(e.members ? 'sameLinkGroup' : 'sameLink')}
                  </Button>
                </div>

                {/* Why this was suggested. Without it a ranked list is a mystery. */}
                {e.reasons.length > 0 && <div className={styles.reasons}>{e.reasons.join(' · ')}</div>}

                {/* Members, with the derived Parent/Child roles. */}
                {e.members && (
                  <div className={styles.members}>
                    {e.members.map((m, i) => (
                      <div key={m.id} className={styles.member}>
                        <span className={styles.memberBadge}>
                          {t(i === 0 ? 'linksModalParent' : 'linksModalChild')}
                        </span>
                        <span className={styles.id}>{m.id}</span>
                        <span className={styles.title}>{m.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={disabled}
                          onClick={() => start(`${e.key}:${m.id}`, [m.id], 'unlink')}
                        >
                          {t('sameRemoveMember')}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {justifyRow(e.key)}
                {e.members?.map((m) => <div key={m.id}>{justifyRow(`${e.key}:${m.id}`)}</div>)}
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}

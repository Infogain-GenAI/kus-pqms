/**
 * View History — the TWO modals behind Issue Entry's history controls.
 *
 * ─── ⚠️ TWO MODALS, SPLIT BY CARD TYPE — NOT BY SURFACE ─────────────────────
 *
 * Issue Entry shows history buttons on two surfaces (Same Existing Issues, and
 * Search & Link Existing Issue) and it is tempting to read the difference as a
 * per-surface one. It is not. The canonical builds both surfaces' cards from ONE
 * `_buildEntry`, which switches on what the CARD IS:
 *
 *   a group card      → `openGroupHistory(parent.id)` → Related Issues & History
 *   a standalone card → `openIssueHistory(p.id)`      → View History
 *
 * Both surfaces route a group card to the first and a standalone card to the
 * second. Before this existed, both went to a single flat popup, which is why
 * two controls that are meant to differ looked identical.
 *
 * ⚠️ THE MISSING INFO SUMMARY IS SPECIFIED. The single-issue modal deliberately
 * has no Model Code / Classification / Source / DTC block — the canonical's own
 * comment reads "same timeline UI as View Group History, single issue, no info
 * summary". Adding one here would look like an improvement and would be a
 * divergence.
 *
 * ─── ⚠️ THE LABELS DIFFER BY SURFACE, AND THAT IS FAITHFUL ──────────────────
 *
 * The BUTTONS that open these do carry different text per surface for a group
 * card — "View Group History" in Same Existing Issues, "View Linked Issue
 * History" in Search & Link. Both open THIS group modal. So the two axes cross:
 * the modal is chosen by card type, the label by surface. Anyone comparing the
 * two labels will reasonably suspect one is a mistake; neither is.
 *
 * ─── THE VOCABULARY COMES FROM THE CATALOGUE ────────────────────────────────
 *
 * Rows are rendered through `historyLabelFor` / `historyIconFor`, so a row reads
 * "Removed from issue group" rather than the internal `Issue Unlinked`. Those
 * helpers are pure and provider-free — unlike `HistorySection`, which reads its
 * id from `useWorkspace()` and therefore cannot render here. The distinction
 * matters: the COMPONENT is unreusable, the VOCABULARY is not, and conflating
 * the two is what left this surface rendering internal strings at users.
 *
 * ⚠️ WE RENDER AN HONEST SUBSET. The canonical's timeline shows status
 * transitions (from → to) and a status chip per row. Our `AuditEntry` records no
 * such fields, so those blocks are absent rather than invented — see the empty
 * state note in the stylesheet for the same reasoning about missing data.
 */
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, GitBranch, History } from 'lucide-react'
import { Icon, SOURCE, StatusBadge } from '@pqms/ui-library'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/app/chrome'
import { fmtDate, fmtDateTime } from '@/data/util'
import type { AuditEntry, Issue } from '@/data/types'
import {
  historyIconFor,
  historyLabelFor,
} from '@/features/issues/workspace/history/history'
import { NS } from './IssueEntry.i18n'
import styles from './history-modals.module.css'

/** Rows shown per member before "View complete history" — the canonical's 6. */
const COLLAPSED_EVENTS = 6

/* ── shared timeline ──────────────────────────────────────────────────────── */

function EmptyHistory() {
  const { t } = useTranslation(NS)
  return (
    <div className={styles.empty}>
      <Icon icon={History} size={22} className={styles.emptyIcon} />
      <span className={styles.emptyTitle}>{t('historyEmpty')}</span>
      <span className={styles.emptyHint}>{t('historyEmptyHint')}</span>
    </div>
  )
}

function Timeline({ entries }: { entries: AuditEntry[] }) {
  const { t } = useTranslation(NS)
  if (entries.length === 0) return <EmptyHistory />
  return (
    <div className={styles.timeline}>
      {entries.map((e, i) => (
        <div key={e.id} className={styles.event}>
          <div className={styles.rail}>
            <span className={styles.iconWrap}>
              <Icon icon={historyIconFor(e.action)} size={15} />
            </span>
            {/* No connector after the last row, or the rail runs into nothing. */}
            {i < entries.length - 1 && <span className={styles.connector} />}
          </div>
          <div className={styles.body}>
            <div className={styles.eventHead}>
              {/* Catalogue label, never the raw action string. */}
              <span className={styles.eventName}>{historyLabelFor(e.action)}</span>
              <span className={styles.eventMeta}>
                {t('historyBy', { user: e.actor, role: e.actorRole, when: fmtDateTime(e.timestamp) })}
              </span>
            </div>
            {e.detail && (
              <>
                <div className={styles.reasonLabel}>{t('historyReason')}</div>
                <div className={styles.reasonText}>{e.detail}</div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── the standalone-issue modal ───────────────────────────────────────────── */

export function IssueHistoryModal({
  issue,
  entries,
  onClose,
}: {
  issue: Issue | null
  entries: AuditEntry[]
  onClose: () => void
}) {
  const { t } = useTranslation(NS)
  return (
    <Modal
      open={!!issue}
      onClose={onClose}
      title={
        <>
          {t('issueHistoryTitle')}
          <div className={styles.infoValue}>
            {t('issueHistorySubtitle', { count: entries.length })}
          </div>
        </>
      }
      width={640}
    >
      {issue && (
        <>
          <div className={styles.issueIdRow}>
            <span className={styles.issueId}>{issue.id}</span>
            <StatusBadge status={issue.status} />
          </div>
          <div className={styles.issueTitle}>{issue.title}</div>
          <Timeline entries={entries} />
        </>
      )}
    </Modal>
  )
}

/* ── the group modal ──────────────────────────────────────────────────────── */

function MemberRow({
  issue,
  relation,
  entries,
  onOpenIssue,
}: {
  issue: Issue
  /*
   * NOT `role`. That word is the permission vocabulary in this app (SE/TE/ASM/
   * PQM/DE), and `role-gate` correctly refuses a literal comparison against it —
   * a permission check written as a fact about a person breaks silently when a
   * role is added. This is a POSITION IN A GROUP, derived from registration
   * order, and naming it `relation` keeps the two vocabularies apart.
   */
  relation: 'parent' | 'child'
  entries: AuditEntry[]
  onOpenIssue: () => void
}) {
  const { t } = useTranslation(NS)
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const shown = showAll ? entries : entries.slice(0, COLLAPSED_EVENTS)
  const hidden = entries.length - shown.length

  const classification =
    [issue.system, issue.subSystem, issue.component, issue.symptom].filter(Boolean).join('  ›  ') || '—'
  const dtc = issue.dtcCodes?.length ? issue.dtcCodes.join(', ') : '—'
  const source = issue.source ? SOURCE[issue.source].label : '—'

  const info: { label: string; value: string; mono?: boolean }[] = [
    { label: t('historyInfoModelCode'), value: issue.modelCode || '—', mono: true },
    { label: t('historyInfoClassification'), value: classification },
    { label: t('historyInfoSource'), value: source },
    { label: t('historyInfoDtc'), value: dtc, mono: true },
  ]

  return (
    <div className={`${styles.member} ${open ? styles.memberOpen : ''}`}>
      <button
        type="button"
        className={styles.memberHead}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <div className={styles.memberTopRow}>
          <span className={styles.issueId}>{issue.id}</span>
          <StatusBadge status={issue.status} />
          <span className={styles.infoLabel}>{t(relation === 'parent' ? 'badgeParent' : 'badgeChild')}</span>
          <span className={styles.eventMeta}>{fmtDate(issue.createdAt)}</span>
          <span className={styles.eventMeta}>{issue.owner}</span>
          <span className={styles.memberActions}>
            {/*
              "View Issue" navigates away, so it must not also toggle the
              accordion it sits inside.
            */}
            <span
              role="link"
              tabIndex={0}
              className={styles.linkAction}
              onClick={(ev) => {
                ev.stopPropagation()
                onOpenIssue()
              }}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.stopPropagation()
                  ev.preventDefault()
                  onOpenIssue()
                }
              }}
            >
              {t('historyViewIssue')}
            </span>
            <span className={styles.linkAction}>
              {t('cardViewHistory')}
              <Icon icon={open ? ChevronUp : ChevronDown} size={14} />
            </span>
          </span>
        </div>
        <span className={styles.memberTitle}>{issue.title}</span>
        <span className={styles.infoGrid}>
          {info.map((f) => (
            <span key={f.label} className={styles.infoCell}>
              <span className={styles.infoLabel}>{f.label}</span>
              <span className={`${styles.infoValue} ${f.mono ? styles.infoMono : ''}`}>{f.value}</span>
            </span>
          ))}
        </span>
      </button>

      {open && (
        <div className={styles.memberTimeline}>
          <Timeline entries={shown} />
          {hidden > 0 && (
            <button type="button" className={styles.showAll} onClick={() => setShowAll(true)}>
              <Icon icon={ChevronDown} size={14} />
              {t('historyShowAll', { count: hidden })}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function GroupHistoryModal({
  members,
  entriesFor,
  onOpenIssue,
  onClose,
}: {
  /** Parent first, as `groupMembers` returns them. Empty closes the modal. */
  members: Issue[]
  entriesFor: (id: string) => AuditEntry[]
  onOpenIssue: (id: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation(NS)
  /*
   * Children newest-first, as the canonical sorts them
   * (`b._registeredMs - a._registeredMs`); the parent stays pinned at the top
   * because it is the group's key, not merely its oldest row.
   */
  const ordered = useMemo(() => {
    if (members.length === 0) return []
    const [parent, ...rest] = members
    return [
      parent,
      ...rest.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0)),
    ]
  }, [members])

  return (
    <Modal
      open={members.length > 0}
      onClose={onClose}
      title={
        <>
          <span className={styles.memberTopRow}>
            <Icon icon={GitBranch} size={16} />
            {t('groupHistoryTitle')}
          </span>
          <div className={styles.infoValue}>
            {t('groupHistorySubtitle', { count: members.length })}
          </div>
        </>
      }
      width={720}
    >
      <div className={styles.memberList}>
        {ordered.map((m, i) => (
          <MemberRow
            key={m.id}
            issue={m}
            relation={i === 0 ? 'parent' : 'child'}
            entries={entriesFor(m.id)}
            onOpenIssue={() => onOpenIssue(m.id)}
          />
        ))}
      </div>
    </Modal>
  )
}

/* ── the state both modals share ──────────────────────────────────────────── */

export type HistoryTarget = { kind: 'group' | 'issue'; id: string } | null

/**
 * The one piece of state Issue Entry needs. It carries the KIND alongside the
 * id, because the id alone cannot say which modal was asked for: a grouped
 * issue's id is a valid input to both, and picking by "does it have a group?"
 * would silently reroute a standalone card whose issue later joins a group.
 */
export function useHistoryTarget() {
  const [target, setTarget] = useState<HistoryTarget>(null)
  // Reset the accordion state between openings by remounting on target change.
  const [nonce, setNonce] = useState(0)
  useEffect(() => setNonce((n) => n + 1), [target])
  return {
    target,
    nonce,
    openGroup: (id: string) => setTarget({ kind: 'group', id }),
    openIssue: (id: string) => setTarget({ kind: 'issue', id }),
    close: () => setTarget(null),
  }
}

import { useHref } from 'react-router-dom'
import { CircleCheckBig, ClipboardList, Link, Link2, Link2Off } from 'lucide-react'
import { Button, StatusBadge } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { Modal } from '@/app/chrome'
import { useStore } from '@/data/store'
import { fmtMD } from '@/data/util'
import type { Issue } from '@/data/types'
import styles from './IssueExistingPreviewModal.module.css'

/**
 * PREVIEW AN EXISTING ISSUE BEFORE LINKING IT.
 *
 * Ported from `components/shared/IssueExistingPreviewModal.vue`.
 *
 * ─── THE BUG THIS REPLACES IS WORSE THAN A MISSING FEATURE ───────────────────
 *
 * Issue Entry's "Same Existing Issues" panel already had a Preview button. It
 * called `nav('/issues/' + id)` — it NAVIGATED AWAY from the entry form. A user
 * part-way through registering an issue, who pressed Preview to check whether a
 * suggested match was really the same problem, lost every field they had typed.
 * The draft lives in component state; leaving the route unmounts it.
 *
 * So the control was not merely unhelpful, it was a data-loss path, and it was
 * on the one screen where the user has the most unsaved work. A modal is the
 * whole point: the question "is this the same issue?" is asked WHILE composing,
 * and the answer must not cost the composition.
 *
 * ─── IT SHOWS WHAT THIS APP ACTUALLY KNOWS, NOT WHAT VUE'S FIXTURE HAD ───────
 *
 * Vue's `SimilarIssueMatch` carries `summary`, `investigation`, `actions[]`,
 * `history[]` and a `qir` object — fields its similar-issues FIXTURE invents and
 * which, its own comments record, have no backend equivalent. This app has no
 * such shape, and inventing one to match the layout would put fabricated content
 * in front of someone deciding whether two issues are the same defect. That is
 * the worst possible screen to guess on.
 *
 * Every section is therefore sourced from the real store:
 *   Classification    issue.system / subSystem / component
 *   Description       issue.description
 *   Investigation     the most recent recorded activity
 *   Actions taken     the remaining activities
 *   Related history   the issue's audit trail
 *   QIR               rendered only when the issue is escalated
 *
 * A section with nothing behind it is omitted rather than shown empty, so the
 * modal never implies an investigation that has not happened.
 *
 * ─── ONE THING VUE HAS THAT THIS DELIBERATELY DOES NOT ───────────────────────
 *
 * Vue's QIR block shows a QIR id, status chip and summary. THIS APP HAS NO QIR
 * RECORD — an escalated issue carries no QIR id anywhere in the data, and the
 * Resolution tab says only "QIR hand-off recorded" for exactly that reason. The
 * block here says the same thing and offers the same link to QIR Management.
 * Rendering a fabricated `QIR-xxxxx` beside a real issue id would be read as
 * fact.
 */
export function IssueExistingPreviewModal({
  issue,
  linked,
  onClose,
  onLink,
  onUnlink,
}: {
  /** The issue being previewed, or null when the modal is closed. */
  issue: Issue | null
  /** Whether it is already linked to the issue being composed or edited. */
  linked: boolean
  onClose: () => void
  onLink: (id: string) => void
  onUnlink: (id: string) => void
}) {
  const { activitiesFor, auditFor } = useStore()

  /*
   * Resolved unconditionally, above the null guard, because both are hooks.
   * `useHref` turns a route path into the URL the browser bar would show, which
   * is what a new tab needs — `navigate()` would move THIS tab, which is the
   * behaviour this modal exists to avoid.
   */
  const issueHref = useHref(issue ? `/issues/${issue.id}` : '/issues')
  const qirHref = useHref('/qir')

  if (!issue) return null

  const activities = [...activitiesFor(issue.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const [latest, ...earlier] = activities
  const history = auditFor(issue.id)
  const classification = [issue.system, issue.subSystem, issue.component].filter(Boolean).join(' · ')

  /*
   * Opens a reference tab and leaves this modal OPEN — matching Vue, whose own
   * comment says the same. Looking something up alongside the decision is not
   * the same as finishing with the decision, and closing here would drop the
   * user back into the form having lost their place in the comparison.
   */
  const openInNewTab = (href: string) => window.open(href, '_blank', 'noopener')

  return (
    <Modal
      open
      onClose={onClose}
      width={620}
      align="center"
      title={
        <div className={styles.head}>
          <div className={styles.idRow}>
            <div className={styles.idGroup}>
              <span className={styles.id}>{issue.id}</span>
              <StatusBadge status={issue.status} size="sm" />
              {linked && (
                <span className={styles.linkedBadge}>
                  <Icon icon={Link} size={11} />
                  Linked
                </span>
              )}
            </div>
            <button
              type="button"
              className={styles.linkAction}
              title="Open this issue in a new tab"
              data-testid="preview-view-issue"
              onClick={() => openInNewTab(issueHref)}
            >
              View Issue
            </button>
          </div>
          <h2 className={styles.title}>{issue.title}</h2>
          <p className={styles.subtitle}>
            {issue.model}
            {issue.modelYear ? ` · MY${issue.modelYear}` : ''}
          </p>
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {/*
            Linking closes the modal — the decision this modal exists to support
            has been made, so keeping it open would leave the user staring at a
            comparison they have already acted on. Vue closes here too, and
            deliberately does NOT close on the two "view in a new tab" actions.
          */}
          <Button
            variant={linked ? 'secondary' : 'primary'}
            iconLeft={<Icon icon={linked ? Link2Off : Link2} size={15} />}
            data-testid="preview-toggle-link"
            onClick={() => {
              if (linked) onUnlink(issue.id)
              else onLink(issue.id)
              onClose()
            }}
          >
            {linked ? 'Unlink issue' : 'Link issue'}
          </Button>
        </>
      }
    >
      <div className={styles.body} data-testid="issue-preview-modal">
        {classification && (
          <div className={styles.classCard}>
            <div className={styles.classLabel}>Classification</div>
            <p className={styles.classValue}>{classification}</p>
          </div>
        )}

        {issue.description && (
          <div>
            <div className={styles.label}>Issue description</div>
            <p className={styles.prose}>{issue.description}</p>
          </div>
        )}

        {latest && (
          <div>
            <div className={styles.label}>Investigation summary</div>
            <p className={styles.prose}>{latest.summary}</p>
          </div>
        )}

        {earlier.length > 0 && (
          <div>
            <div className={styles.label}>Actions taken</div>
            <div className={styles.actionList}>
              {earlier.map((a) => (
                <div key={a.id} className={styles.actionRow}>
                  <Icon icon={CircleCheckBig} size={15} className={styles.actionIcon} />
                  <span>{a.summary}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {issue.status === 'escalated' && (
          <div>
            <div className={styles.qirHead}>
              <div className={styles.qirLabelGroup}>
                <span className={styles.label} style={{ marginBottom: 0 }}>
                  QIR summary
                </span>
                <Icon icon={ClipboardList} size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
              <button
                type="button"
                className={styles.qirViewBtn}
                title="Open QIR Management in a new tab"
                data-testid="preview-view-qir"
                onClick={() => openInNewTab(qirHref)}
              >
                View QIR
              </button>
            </div>
            {/* The exact wording the Resolution tab uses. This app records the
                hand-off, not a QIR record — see this file's header. */}
            <p className={styles.prose}>
              QIR hand-off recorded — the reference is held in the QIR module, which owns what happens next.
            </p>
          </div>
        )}

        <div>
          <div className={styles.label}>Related history</div>
          {history.length === 0 ? (
            <p className={styles.empty}>Nothing has been recorded against this issue yet.</p>
          ) : (
            <div>
              {history.map((h) => (
                <div key={h.id} className={styles.historyRow}>
                  <div className={styles.historyDate}>{fmtMD(h.timestamp)}</div>
                  <div className={styles.historyText}>{h.detail ? `${h.action} — ${h.detail}` : h.action}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

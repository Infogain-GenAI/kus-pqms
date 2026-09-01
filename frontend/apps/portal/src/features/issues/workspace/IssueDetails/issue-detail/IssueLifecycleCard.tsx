import { Fragment, useMemo, useState, type CSSProperties } from 'react'
import { Check, Route, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Icon, type StatusKey } from '@pqms/ui-library'
import { useStore } from '@/data/store'
import type { Issue } from '@/data/types'
import { fmtHM, fmtMDY } from '@/shared/format/date'
import { NS } from '../../IssueDetail.i18n'
import { LC_DESC, lifecycleStages, readStatusMoves, type LifecycleStage } from './lifecycle'
import styles from './IssueLifecycleCard.module.css'

/**
 * The compact lifecycle tracker, above Vehicle information on the Issue Detail
 * tab. A 1:1 port of the prototype's own card — see `lifecycle.ts` for the track
 * rules and `IssueLifecycleCard.module.css` for the value-by-value mapping.
 *
 * ─── THE STATIONS ARE BUTTONS, AND ONLY THE VISITED ONES ─────────────────────
 * Clicking a station opens the panel below the track: when it was entered, by
 * whom, and why. The prototype makes EVERY node clickable, but only renders that
 * panel for a visited stage — so clicking "Closed" on an open issue is a click
 * that does nothing. Upcoming stations are therefore plain items here. Nothing
 * is hidden by that: a stage the issue has not reached has no entry to show.
 *
 * ⚠️ A STATION IS NOT A STATUS CONTROL. Every status change in this app captures
 * a reason through the shell's Change-status modal; these buttons only reveal
 * history, and the audit trail is the reason that modal exists.
 */
export function IssueLifecycleCard({ issue }: { issue: Issue }) {
  const { t } = useTranslation(NS)
  const store = useStore()
  const [selected, setSelected] = useState<StatusKey | null>(null)

  const stages = useMemo(
    () => lifecycleStages(issue, readStatusMoves(store.auditFor(issue.id))),
    [issue, store],
  )

  // The selection is held by KEY, not by index or by the stage object: the track
  // rebuilds whenever the status changes, and both of those would silently point
  // at a different station afterwards. A key that is no longer on the track
  // simply finds nothing, which closes the panel.
  const open = stages.find((s) => s.key === selected && s.state !== 'upcoming') ?? null
  const currentStage = stages.find((s) => s.state === 'current')

  return (
    <section className={styles.card} data-testid="issue-lifecycle">
      <header className={styles.head}>
        <div className={styles.heading}>
          <span className={styles.badge} aria-hidden>
            <Icon icon={Route} size={16} />
          </span>
          <h3 className={styles.title}>{t('lifecycleTitle')}</h3>
        </div>
        {currentStage && (
          <div className={styles.current} title={LC_DESC[currentStage.key]}>
            {t('lifecycleCurrent')}{' '}
            <span style={{ color: currentStage.color }}>{currentStage.label}</span>
          </div>
        )}
      </header>

      <ol className={styles.track} aria-label={t('lifecycleTitle')}>
        {stages.map((stage, idx) => (
          <Fragment key={stage.key}>
            <Station
              stage={stage}
              expanded={open?.key === stage.key}
              onToggle={() => setSelected((k) => (k === stage.key ? null : stage.key))}
              stateLabel={t(STATE_KEY[stage.state])}
            />
            {idx < stages.length - 1 && (
              /* The rail's colour is decided by the station on its LEFT: the run
                 goes dark up to the current station and pale after it. */
              <li
                aria-hidden
                className={`${styles.line} ${stage.state === 'completed' ? styles.lineTravelled : ''}`}
              />
            )}
          </Fragment>
        ))}
      </ol>

      {open && <StagePanel stage={open} onClose={() => setSelected(null)} />}
    </section>
  )
}

/** The message key for each station state — see IssueDetail.i18n. */
const STATE_KEY = {
  completed: 'lifecycleStateCompleted',
  current: 'lifecycleStateCurrent',
  upcoming: 'lifecycleStateUpcoming',
} as const

function Station({
  stage,
  expanded,
  onToggle,
  stateLabel,
}: {
  stage: LifecycleStage
  expanded: boolean
  onToggle: () => void
  stateLabel: string
}) {
  const reached = stage.state !== 'upcoming'
  const dot = (
    <span className={styles.dotRow}>
      <span
        className={`${styles.dot} ${reached ? styles.dotReached : ''} ${stage.state === 'current' ? styles.dotCurrent : ''}`}
        style={{ '--stage': stage.color } as CSSProperties}
      >
        {/* A passed station shows a tick at 11px with a heavy 3.4 stroke; the
            current one its own glyph at 14px; an upcoming one the same glyph at
            12px. The three sizes are the prototype's and they are what make the
            track read as a progression rather than five identical dots. */}
        {stage.state === 'completed' ? (
          <Icon icon={Check} size={11} strokeWidth={3.4} />
        ) : (
          <Icon icon={stage.icon} size={stage.state === 'current' ? 14 : 12} strokeWidth={2} />
        )}
      </span>
    </span>
  )
  const label = (
    <span
      className={`${styles.label} ${stage.state === 'current' ? styles.labelCurrent : ''} ${reached ? '' : styles.labelUpcoming}`}
    >
      {stage.label}
    </span>
  )

  const body = (
    <>
      {dot}
      {label}
      <span className={styles.srOnly}>{` — ${stateLabel}`}</span>
    </>
  )

  return (
    <li className={styles.step} aria-current={stage.state === 'current' ? 'step' : undefined}>
      {reached ? (
        <button type="button" className={styles.stepButton} aria-expanded={expanded} onClick={onToggle}>
          {body}
        </button>
      ) : (
        body
      )}
    </li>
  )
}

function StagePanel({ stage, onClose }: { stage: LifecycleStage; onClose: () => void }) {
  const { t } = useTranslation(NS)
  return (
    <div className={styles.panel}>
      <div className={styles.panelBody}>
        <div className={styles.panelHead}>
          <span className={styles.panelDot} style={{ '--stage': stage.color } as CSSProperties} aria-hidden />
          <span className={styles.panelLabel}>{stage.label}</span>
        </div>
        {/*
         * NOTHING IS SYNTHESISED HERE. The prototype fabricates a date and an
         * author for any stage its demo log does not cover; this shows what the
         * audit trail actually holds, and says plainly when it holds nothing —
         * see the note in lifecycle.ts.
         */}
        {stage.move ? (
          <>
            <div className={styles.panelMeta}>
              {`${fmtMDY(stage.move.timestamp)} · ${fmtHM(stage.move.timestamp)} · ${stage.move.by} (${stage.move.role})`}
            </div>
            <p className={styles.panelReason}>{stage.move.reason}</p>
          </>
        ) : (
          <p className={styles.panelReason}>{t('lifecycleNoRecord')}</p>
        )}
      </div>
      <button type="button" className={styles.panelClose} onClick={onClose} aria-label={t('lifecycleClose')}>
        <Icon icon={X} size={12} strokeWidth={2} />
      </button>
    </div>
  )
}

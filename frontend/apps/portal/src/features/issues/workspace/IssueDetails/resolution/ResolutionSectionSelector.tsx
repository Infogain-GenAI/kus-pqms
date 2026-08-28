import { Icon } from '@pqms/ui-library'
import { RESOLUTION_WORKSTREAMS, type ResolutionWorkstream } from './resolution'
import styles from './resolution.module.css'

/**
 * The Resolution workstream selector — a row of cards, one per workstream.
 *
 * Ported from `ResolutionSectionSelector.vue`.
 *
 * WHY CARDS RATHER THAN THE PILL STRIP the Investigation tab uses: each card
 * carries its own state at a glance — "None yet", "Not linked", "None" — so the
 * row answers "where does this issue stand?" before anything is selected. A pill
 * strip can only say which panel is open.
 *
 * `stateLabel` is currently static per card, matching the design. Where a
 * workstream has real state to report, the caller overrides it — see the
 * Disposition card, which reports the recorded outcome instead.
 */
export function ResolutionSectionSelector({
  workstream,
  onChange,
  stateLabels,
}: {
  workstream: ResolutionWorkstream
  onChange: (next: ResolutionWorkstream) => void
  /** Overrides a card's default pill where the workstream knows its real state. */
  stateLabels?: Partial<Record<ResolutionWorkstream, string>>
}) {
  return (
    <div className={styles.selector} role="tablist" aria-label="Resolution workstream" data-testid="resolution-section-selector">
      {RESOLUTION_WORKSTREAMS.map((o) => {
        const active = o.key === workstream
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={active ? `${styles.card} ${styles.cardActive}` : styles.card}
            data-testid={`resolution-workstream-${o.key}`}
            onClick={() => onChange(o.key)}
          >
            <span className={styles.cardTop}>
              <span className={styles.tile} data-tone={o.tone} aria-hidden>
                <Icon icon={o.icon} size={20} />
              </span>
              <span className={styles.state}>{stateLabels?.[o.key] ?? o.stateLabel}</span>
            </span>
            <span className={styles.cardTitle}>{o.title}</span>
            <span className={styles.cardDescription}>{o.description}</span>
          </button>
        )
      })}
    </div>
  )
}

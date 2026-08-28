import { useState } from 'react'
import type { Issue } from '@/data/types'
import { CountermeasuresPanel, RelatedPublicationPanel, RelatedQirPanel } from '../../resolution/panels'
import { ResolutionSectionSelector } from '../../resolution/ResolutionSectionSelector'
import { DEFAULT_RESOLUTION_WORKSTREAM, type ResolutionWorkstream } from '../../resolution/resolution'
import styles from '../../resolution/resolution.module.css'

/**
 * The Resolution tab — a workstream selector above the selected panel.
 *
 * Ported from `ResolutionTab.vue`.
 *
 * A THIN WRAPPER, per `01`'s feature-folder depth rule: the panels live in the
 * sibling `resolution/` folder and this file selects between them.
 *
 * ─── ONLY THE SELECTED PANEL RENDERS ─────────────────────────────────────────
 *
 * This replaces a two-column grid that showed Disposition and Related QIR side
 * by side and had nowhere to put Countermeasures or Publication. The selector is
 * what makes room: each card reports its own state, so the row answers "where
 * does this issue stand?" without opening anything, and the panel below gives
 * one workstream the full width it needs.
 *
 * DISPOSITION IS PARKED, on request — see `resolution.ts` for what that costs
 * and how to restore it. `DispositionPanel` is still built and still correct; it
 * simply has no card in the selector.
 *
 * THE SELECTOR'S STATE PILLS ARE LIVE where the workstream knows its state:
 * Related QIR reports the escalation rather than claiming "Not linked" beside a
 * panel that plainly shows otherwise. Countermeasures and Publication keep their
 * static labels because this app has no store behind either.
 *
 * Workstream selection stays component state, not a route — `07` routes the five
 * workspace sections because a section is a place; this switches what one
 * section shows.
 */
// `onChangeStatus` was this component's fourth prop and went with Disposition —
// it had exactly one consumer. Restoring that panel restores the prop; leaving a
// prop nothing reads would just be a puzzle for whoever reads this next.
export function ResolutionTab({
  issue,
  canQir,
  onCreateQir,
}: {
  issue: Issue
  canQir: boolean
  onCreateQir: () => void
}) {
  const [workstream, setWorkstream] = useState<ResolutionWorkstream>(DEFAULT_RESOLUTION_WORKSTREAM)

  return (
    <div className={styles.tab} data-testid="resolution-tab">
      <ResolutionSectionSelector
        workstream={workstream}
        onChange={setWorkstream}
        stateLabels={{ qir: issue.status === 'escalated' ? 'Escalated' : 'Not linked' }}
      />

      {workstream === 'qir' && <RelatedQirPanel issue={issue} canQir={canQir} onCreateQir={onCreateQir} />}
      {workstream === 'cm' && <CountermeasuresPanel />}
      {workstream === 'pub' && <RelatedPublicationPanel />}
    </div>
  )
}

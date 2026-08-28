import { useMemo, useState } from 'react'
import { FoldVertical, UnfoldVertical } from 'lucide-react'
import { Button, Icon } from '@pqms/ui-library'
import { useStore } from '@/data/store'
import { InvestigationActivities } from '../../investigation/InvestigationActivities'
import { PartRequestsSection } from '../../investigation/PartRequestsSection'
import styles from '../../investigation/investigation.module.css'

export type InvestigationWorkstream = 'activities' | 'parts'

/**
 * The Investigation tab — one card, a full-width header, and whichever
 * workstream is selected beneath it.
 *
 * Ported from `InvestigationTab.vue` and `InvestigationSectionHeader.vue`.
 *
 * A THIN WRAPPER, per `01`'s feature-folder depth rule: the real components live
 * in the sibling `investigation/` folder and this file only orders them and owns
 * the state they share.
 *
 * ─── THE HEADER IS FULL-WIDTH, ABOVE THE SPLIT, AND HAS TO BE ────────────────
 *
 * The pill swaps the WHOLE content below it — for Activities that is the
 * Add-activity rail and the timeline together. A header living inside the
 * timeline column could not host a control that replaces the rail beside it.
 *
 * ─── EXPANSION STATE IS OWNED HERE, NOT IN THE ROWS ──────────────────────────
 *
 * The Expand/Collapse-all toggle's own LABEL is derived from whether everything
 * is currently expanded, over the same set the rows read. Nothing stores
 * "allExpanded" — it is computed, so it cannot drift from the rows it describes.
 * Only EXPANDED ids are tracked, so an activity added later starts collapsed
 * rather than inheriting a stale entry.
 *
 * The toggle is disabled on Part Requests because that workstream has no
 * expandable rows — a control that cannot do anything should say so rather than
 * appear to work.
 *
 * The workstream pill stays COMPONENT STATE, not a route. `07` routes the five
 * workspace sections because a section is a place; this filters what one section
 * shows, which is the converse of that rule rather than an exception to it.
 */
export function InvestigationTab({ issueId, canEdit }: { issueId: string; canEdit: boolean }) {
  const store = useStore()
  const [workstream, setWorkstream] = useState<InvestigationWorkstream>('activities')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const parts = store.partsFor(issueId)

  /** Row ids of the ACTIVE workstream. Part Requests contributes none. */
  const expandableIds = useMemo(
    () => (workstream === 'activities' ? store.activitiesFor(issueId).map((a) => a.id) : []),
    [workstream, issueId, store],
  )

  const allExpanded = expandableIds.length > 0 && expandableIds.every((id) => expanded.has(id))

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () => setExpanded(allExpanded ? new Set() : new Set(expandableIds))

  const options: { key: InvestigationWorkstream; label: string }[] = [
    { key: 'activities', label: 'Investigation Activities' },
    { key: 'parts', label: `Part Requests${parts.length ? ` (${parts.length})` : ''}` },
  ]

  return (
    <div className={styles.card} data-testid="investigation-tab">
      <header className={styles.header} data-testid="investigation-section-header">
        <div className={styles.track} role="tablist" aria-label="Investigation workstream">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              role="tab"
              aria-selected={o.key === workstream}
              className={o.key === workstream ? `${styles.pill} ${styles.pillActive}` : styles.pill}
              data-testid={`workstream-pill-${o.key}`}
              onClick={() => setWorkstream(o.key)}
            >
              {o.label}
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={expandableIds.length === 0}
          iconLeft={<Icon icon={allExpanded ? FoldVertical : UnfoldVertical} size={14} />}
          data-testid="expand-all-toggle"
          onClick={toggleAll}
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </Button>
      </header>

      {workstream === 'activities' ? (
        <InvestigationActivities issueId={issueId} canEdit={canEdit} expanded={expanded} onToggle={toggle} />
      ) : (
        <PartRequestsSection issueId={issueId} canEdit={canEdit} />
      )}
    </div>
  )
}

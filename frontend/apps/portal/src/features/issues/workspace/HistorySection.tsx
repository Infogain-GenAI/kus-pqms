import { useMemo, useState } from 'react'
import { Expand, SearchX } from 'lucide-react'
import { Button, SearchField } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { IconChip, SectionCard, TagChip, ToggleGroup } from '@/app/chrome'
import { useStore } from '@/data/store'
import { fmtHM, fmtMDY } from '@/data/util'
import { NOW } from '@/data/types'

/**
 * "Today", as an ISO `yyyy-mm-dd` day.
 *
 * ⚠️ DERIVED FROM THE FIXED `NOW` ANCHOR, NOT FROM THE CLOCK, and passed to
 * both the filter and the grouping. That is what stops the two disagreeing about
 * what today is — a bucket labelled "Today" over rows a "Last 7 days" filter has
 * just excluded is the shape of bug two independent clock reads produce.
 */
const TODAY = NOW.slice(0, 10)
import { useWorkspace } from './context'
import {
  classifyHistoryAction,
  groupHistoryByDay,
  historyIconFor,
  historyLabelFor,
  matchesHistoryFilters,
  type DateRange,
} from './history/history'
import { HistoryDateFilter } from './history/HistoryDateFilter'

// Moved verbatim from IssueWorkspaceScreen.tsx's `HistoryTab` (2026-08-27).
// Route path: /issues/:id/history.
//
// ⚠️ THE ROUTE PATH IS "history"; THE OLD LOCAL TAB KEY WAS "activity". 07 names
// this section "history" and the visible label was already "History", so the key
// was the odd one out. Checked before renaming: the string 'activity' as a tab key
// appeared ONLY inside IssueWorkspaceScreen.tsx (lines 70 and 164 pre-split) — no
// test, script, or other module read it — so nothing else needed updating.
//
// Not to be confused with `store.activitiesFor()`, which is Investigation's
// activity records and is unrelated to this naming.

export function HistorySection() {
  const { issueId } = useWorkspace()
  const store = useStore()
  const [filter, setFilter] = useState<'all' | 'lifecycle' | 'audit'>('all')
  const [q, setQ] = useState('')
  /**
   * Date range. This control existed but was INERT — a `<Select>` with one
   * option, `value="all"` hard-coded and `onChange={() => undefined}`. It looked
   * like a working filter and could not filter anything.
   *
   * Ranges are measured against the fixed `NOW` anchor, the same one the
   * Today/Yesterday grouping below uses, so the buckets and the filter can never
   * disagree about what "today" is.
   */
  const [range, setRange] = useState<DateRange>({})
  const entries = store.auditFor(issueId)

  /*
   * Filtering and grouping now live in `history/history.ts`, which is pure and
   * takes `today` as an argument. They used to be inline here, which meant
   * neither could be tested without rendering a screen, a store and a router —
   * and an off-by-one on an inclusive date bound looks exactly like a slow day.
   */
  const shown = entries.filter((e) =>
    matchesHistoryFilters(e, {
      segment: filter === 'all' ? undefined : filter,
      search: q,
      dateFrom: range.from,
      dateTo: range.to,
    }),
  )

  const groups = useMemo(() => groupHistoryByDay(shown, TODAY), [shown])

  return (
    <SectionCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <ToggleGroup variant="light" options={[{ key: 'all', label: 'All' }, { key: 'lifecycle', label: 'Lifecycle' }, { key: 'audit', label: 'Audit Log' }]} value={filter} onChange={(k) => setFilter(k as typeof filter)} />
        <span style={{ flex: 1 }} />
        <div style={{ width: 280 }}>
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search history…" size="sm" />
        </div>
        <HistoryDateFilter value={range} onChange={setRange} today={TODAY} />
        <Button variant="secondary" size="sm" disabled iconLeft={<Icon icon={Expand} size={14} />}>Expand all</Button>
      </div>
      {groups.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--space-8) var(--space-6)' }}>
          <IconChip icon={SearchX} tint="var(--neutral-100)" color="var(--neutral-500)" size={48} />
          <div style={{ margin: '14px 0 4px', font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>No activities match</div>
          <div style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-muted)', maxWidth: 360 }}>
            Adjust the filter, date range, or search to see more of the audit trail.
          </div>
        </div>
      )}
      {groups.map((group) => (
        <div key={group.label} style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 6 }}>
            <span style={{ font: 'var(--fw-bold) 10.5px/1 var(--font-body)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{group.label}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 'var(--radius-pill)', background: 'var(--neutral-100)', color: 'var(--text-secondary)', font: 'var(--fw-bold) 10px/1 var(--font-body)' }}>{group.count}</span>
          </div>
          {group.entries.map((e) => {
            const cls = classifyHistoryAction(e.action)
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: '10px 0' }}>
                <IconChip icon={historyIconFor(e.action)} tint={cls === 'lifecycle' ? 'var(--success-50)' : 'var(--neutral-100)'} color={cls === 'lifecycle' ? 'var(--success-600)' : 'var(--neutral-600)'} size={34} iconSize={15} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {/* The catalogue's label where there is one — "Started
                        investigation" is how the store writes it, "Investigation
                        started" is how a reader expects to read it. Falls back
                        to the raw action, so an uncatalogued event still shows
                        something true rather than nothing. */}
                    <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{historyLabelFor(e.action)}</span>
                    <TagChip tint={cls === 'lifecycle' ? 'var(--success-50)' : '#EEEBFB'} color={cls === 'lifecycle' ? 'var(--success-600)' : '#6B4EDB'}>{cls}</TagChip>
                  </div>
                  <div style={{ marginTop: 3, font: 'var(--fw-regular) var(--fs-caption)/1.3 var(--font-body)', color: 'var(--text-muted)' }}>
                    {e.actor} · {e.actorRole}{e.detail ? ` · ${e.detail}` : ''}
                  </div>
                </div>
                <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)', flex: 'none' }}>{fmtMDY(e.timestamp)} · {fmtHM(e.timestamp)}</span>
              </div>
            )
          })}
        </div>
      ))}
    </SectionCard>
  )
}

import { useMemo, useState } from 'react'
import {
  CircleDot,
  Expand,
  FilePlus,
  FilePlus2,
  Flag,
  Hash,
  Link2,
  Microscope,
  Package,
  SearchX,
  SquarePen,
  Tags,
  UserRoundCheck,
  UserRoundCog,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button, SearchField, Select } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { IconChip, SectionCard, TagChip, ToggleGroup } from '@/app/chrome'
import { useStore } from '@/data/store'
import { fmtHM, fmtMDY } from '@/data/util'
import { NOW } from '@/data/types'
import { useWorkspace } from './context'

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

function classify(action: string): 'LIFECYCLE' | 'AUDIT LOG' {
  if (/^issue record created$/i.test(action) || /^status initialized$/i.test(action)) return 'AUDIT LOG'
  if (/^initial owner assigned$/i.test(action)) return 'LIFECYCLE'
  return /status|created|submitted|approved|rejected|escalated|investigation|disposition/i.test(action) ? 'LIFECYCLE' : 'AUDIT LOG'
}
function iconFor(action: string): LucideIcon {
  if (/initial owner assigned/i.test(action)) return UserRoundCheck
  if (/record created/i.test(action)) return FilePlus
  if (/created/i.test(action)) return Flag
  if (/link/i.test(action)) return Link2
  if (/parts/i.test(action)) return Package
  if (/updated|field/i.test(action)) return SquarePen
  if (/classif/i.test(action)) return Tags
  if (/status|approved|rejected|escalat/i.test(action)) return CircleDot
  if (/owner|assign/i.test(action)) return UserRoundCog
  if (/activity/i.test(action)) return Microscope
  if (/id/i.test(action)) return Hash
  return FilePlus2
}

export function HistorySection() {
  const { issueId } = useWorkspace()
  const store = useStore()
  const [filter, setFilter] = useState<'all' | 'lifecycle' | 'audit'>('all')
  const [q, setQ] = useState('')
  const entries = store.auditFor(issueId)
  const shown = entries.filter((e) => {
    const cls = classify(e.action)
    if (filter === 'lifecycle' && cls !== 'LIFECYCLE') return false
    if (filter === 'audit' && cls !== 'AUDIT LOG') return false
    if (q && !`${e.action} ${e.detail ?? ''} ${e.actor}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })
  const groups = useMemo(() => {
    // Proto buckets (Today / Yesterday / Last week / Older), resolved against the fixed NOW anchor.
    const nowDay = Math.floor(new Date(NOW).getTime() / 86400000)
    const m = new Map<string, typeof shown>()
    for (const e of shown) {
      const diff = nowDay - Math.floor(new Date(e.timestamp).getTime() / 86400000)
      const key = diff <= 0 ? 'Today' : diff === 1 ? 'Yesterday' : diff <= 7 ? 'Last week' : 'Older'
      m.set(key, [...(m.get(key) ?? []), e])
    }
    return Array.from(m.entries())
  }, [shown])

  return (
    <SectionCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <ToggleGroup variant="light" options={[{ key: 'all', label: 'All' }, { key: 'lifecycle', label: 'Lifecycle' }, { key: 'audit', label: 'Audit Log' }]} value={filter} onChange={(k) => setFilter(k as typeof filter)} />
        <span style={{ flex: 1 }} />
        <div style={{ width: 280 }}>
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search history…" size="sm" />
        </div>
        <Select aria-label="Date range" size="sm" value="all" options={[{ value: 'all', label: 'Date: All time' }]} onChange={() => undefined} style={{ width: 150 }} />
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
      {groups.map(([day, list]) => (
        <div key={day} style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 6 }}>
            <span style={{ font: 'var(--fw-bold) 10.5px/1 var(--font-body)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{day}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 'var(--radius-pill)', background: 'var(--neutral-100)', color: 'var(--text-secondary)', font: 'var(--fw-bold) 10px/1 var(--font-body)' }}>{list.length}</span>
          </div>
          {list.map((e) => {
            const cls = classify(e.action)
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: '10px 0' }}>
                <IconChip icon={iconFor(e.action)} tint={cls === 'LIFECYCLE' ? 'var(--success-50)' : 'var(--neutral-100)'} color={cls === 'LIFECYCLE' ? 'var(--success-600)' : 'var(--neutral-600)'} size={34} iconSize={15} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{e.action}</span>
                    <TagChip tint={cls === 'LIFECYCLE' ? 'var(--success-50)' : '#EEEBFB'} color={cls === 'LIFECYCLE' ? 'var(--success-600)' : '#6B4EDB'}>{cls}</TagChip>
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

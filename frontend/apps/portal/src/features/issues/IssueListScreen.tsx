import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Car, Check, ChevronDown, ChevronUp, CircleCheck, ClipboardList, Columns3, Download, FileOutput, Flame, FolderOpen, Layers, Link2, Plus, RefreshCw, RotateCcw, Search, SlidersHorizontal, TriangleAlert, UserCog, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Avatar,
  Button,
  Checkbox,
  DataTable,
  EmptyState,
  Pagination,
  SearchField,
  Select,
  SOURCE,
  SOURCE_KEYS,
  SourceBadge,
  STATUS,
  STATUS_KEYS,
  StatusBadge,
  Textarea,
  Tooltip,
  type DataTableColumn,
  type DataTableSort,
  type StatusKey,
} from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { IconChip, Modal, PageContainer, PageCrumb, SectionCard, TagChip, ULabel } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import { daysOpen, fmtMDY, modelCodeLabel } from '@/data/util'
import { PRIORITY_BANDS } from '@/data/priorityMatrix'
import { LinkedIssuesModal } from './LinkedIssuesModal'
import { downloadIssuesCsv, exportFilename } from './issue-list/issue-export'
import type { Issue } from '@/data/types'

const PAGE_SIZES = [20, 50, 100]

// Column model per the Columns drawer: Issue ID / Issue Title are REQUIRED,
// five default columns are toggleable, nine optional columns.
const DEFAULT_COLS = [
  { key: 'modelCode', label: 'Model Code' },
  { key: 'classification', label: 'Classification' },
  { key: 'status', label: 'Status' },
  { key: 'issueDate', label: 'Issue Date' },
  { key: 'linked', label: 'Linked' },
] as const
const OPTIONAL_COLS = [
  { key: 'source', label: 'Source' },
  { key: 'model', label: 'Model' },
  { key: 'modelYear', label: 'Model Year' },
  { key: 'severity', label: 'Severity' },
  { key: 'days', label: 'Days open' },
  { key: 'owner', label: 'Owner' },
  { key: 'component', label: 'Component' },
  { key: 'symptom', label: 'Symptom' },
  { key: 'dtc', label: 'DTC' },
] as const
const DEFAULT_VISIBLE = DEFAULT_COLS.map((c) => c.key as string)

// Filters-drawer draft (the prototype applies the whole draft on Apply, discards on Reset).
interface FilterDraft {
  modelCode: string
  modelYear: string
  system: string
  subSystem: string
  component: string
  symptom: string
  status: string
  source: string
  owner: string
  grouping: string
  dateFrom: string
  dateTo: string
  days: string
  linked: string
  ews: string
}
const EMPTY_FILTERS: FilterDraft = { modelCode: '', modelYear: '', system: '', subSystem: '', component: '', symptom: '', status: '', source: '', owner: '', grouping: '', dateFrom: '', dateTo: '', days: '', linked: '', ews: '' }

/** Default list sort: Issue Date descending (the prototype's 'registered desc'). */
const DEFAULT_SORT: DataTableSort = { key: 'issueDate', dir: 'desc' }

const drawerLabel = { font: 'var(--fw-bold) 11px/1.35 var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)' } as const
const fieldRow = { display: 'grid', gridTemplateColumns: '116px 1fr', gap: 'var(--space-4)', alignItems: 'center', padding: 'var(--space-2) 0' } as const

// Shared "light" tooltip bubble (white card, hairline border) used across the table's
// multi-value cells (Issue Title, Model Code, Source, Model, Model Year) — the
// design-system Tooltip defaults to a dark bubble, which reads as a different
// component; overriding its style keeps every cell tooltip visually consistent.
const lightTooltipStyle = {
  background: 'var(--surface-card)',
  color: 'var(--text-primary)',
  border: 'var(--border-width) solid var(--border-subtle)',
  boxShadow: 'var(--shadow-md)',
  whiteSpace: 'normal',
  padding: '8px 12px',
} as const

/** Tooltip body for a labeled bullet list (e.g. "MODEL CODES" · SP2 · CV1). */
function ListTooltipBody({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ font: 'var(--fw-bold) 10px/1 var(--font-body)', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {items.map((it, i) => (
          <li key={`${it}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--fw-medium) var(--fs-body-sm)/1.2 var(--font-body)', color: 'var(--text-primary)' }}>
            <span aria-hidden style={{ width: 'var(--space-1)', height: 'var(--space-1)', borderRadius: '50%', background: 'var(--text-muted)', flex: 'none' }} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Rounded count pill (e.g. "2 Models") used for a cell whose value collapses multiple items. */
function CountPill({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 'var(--radius-pill)', background: 'var(--neutral-100)', color: 'var(--text-primary)', font: 'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

/** Small "+N" badge appended next to a primary value that has additional hidden values. */
function MorePill({ n }: { n: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 6px', borderRadius: 'var(--radius-pill)', background: 'var(--neutral-100)', color: 'var(--text-secondary)', font: 'var(--fw-semibold) 11px/1 var(--font-body)' }}>
      +{n}
    </span>
  )
}

/** Custom status picker — a colored dot per option, matching the status badges used
 * everywhere else in the list. The native `Select` can't render option content, hence
 * a bespoke dropdown here instead of reusing it.
 *
 * The options panel renders through a portal to `document.body` with `position: fixed`,
 * computed from the trigger's own bounding rect, rather than as an absolutely-positioned
 * child. A modal body scrolls based on its descendants' full painted extent — an absolute
 * panel inside it still pushes that extent outward even with its own `overflow-y: auto`,
 * so the *modal* ends up scrolling to reveal it instead of the panel scrolling in place.
 * Portaling out sidesteps that entirely (same fix as the table-cell Tooltip elsewhere). */
function StatusDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const update = () => setRect(triggerRef.current!.getBoundingClientRect())
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    // The panel is a portal-child of <body>, not a DOM descendant of the trigger, so a click
    // on an option is otherwise indistinguishable from a genuine outside click — closing the
    // menu on mousedown then leaves nothing mounted for the option's own click to land on.
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const selected = value ? STATUS[value as StatusKey] : undefined
  return (
    <div ref={triggerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', height: 'var(--control-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-3)', border: `var(--border-width) solid ${open ? 'var(--accent-500)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', boxShadow: open ? 'var(--shadow-focus)' : 'none', cursor: 'pointer', font: 'var(--fw-regular) var(--fs-body-md)/1 var(--font-body)', color: selected ? 'var(--text-primary)' : 'var(--text-disabled)' }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {selected && <span aria-hidden style={{ width: 'var(--space-2)', height: 'var(--space-2)', borderRadius: '50%', background: selected.color, flex: 'none' }} />}
          {selected ? selected.label : 'Select status…'}
        </span>
        <Icon icon={ChevronDown} size={16} style={{ color: 'var(--text-disabled)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }} />
      </button>
      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
              // Above var(--z-modal) (1200): this panel is a portal-child of <body>, same as
              // the Modal itself, so it needs to outrank the modal's own z-index to paint on
              // top of it — the ordinary --z-dropdown tier (1000) sits below the modal.
              zIndex: 'var(--z-toast)' as unknown as number,
              maxHeight: 220,
              overflowY: 'auto',
              background: 'var(--surface-card)',
              border: 'var(--border-width) solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: 'var(--space-1)',
            }}
          >
            {STATUS_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { onChange(k); setOpen(false) }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', border: 'none', background: value === k ? 'var(--neutral-50)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left', font: 'var(--fw-semibold) var(--fs-body-md)/1 var(--font-body)', color: 'var(--text-primary)' }}
              >
                <span aria-hidden style={{ width: 'var(--space-2)', height: 'var(--space-2)', borderRadius: '50%', background: STATUS[k].color, flex: 'none' }} />
                {STATUS[k].label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}

function SegRow({ options, value, onChange }: { options: { v: string; l: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 7, minWidth: 0 }}>
      {options.map((o) => {
        const active = value === o.v
        return (
          <button key={o.v || 'all'} onClick={() => onChange(o.v)} style={{ height: 34, padding: '0 14px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${active ? 'var(--kia-midnight)' : 'transparent'}`, background: active ? 'var(--surface-card)' : 'var(--neutral-50)', color: active ? 'var(--text-primary)' : 'var(--text-secondary)', font: `${active ? 'var(--fw-semibold)' : 'var(--fw-medium)'} var(--fs-body-sm)/1 var(--font-body)`, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {o.l}
          </button>
        )
      })}
    </div>
  )
}

/** Right-side drawer shell per the prototype (452px sheet, scrim, header icon chip + title/subtitle + close, pinned footer). */
function Drawer({ icon, title, subtitle, onClose, footer, children }: { icon: LucideIcon; title: string; subtitle: string; onClose: () => void; footer: ReactNode; children: ReactNode }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(5,20,31,.34)' }} />
      <div role="dialog" aria-label={title} style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 121, width: 452, maxWidth: '94vw', background: 'var(--surface-card)', boxShadow: '-14px 0 44px rgba(5,20,31,.20)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', padding: '18px 22px', borderBottom: 'var(--border-width) solid var(--border-subtle)', flex: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <IconChip icon={icon} tint="#F1F4F7" color="var(--kia-midnight)" size={34} iconSize={18} />
            <div>
              <div style={{ font: 'var(--fw-bold) 15.5px/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{title}</div>
              <div style={{ marginTop: 1, font: 'var(--fw-regular) 11.5px/1.2 var(--font-body)', color: 'var(--text-disabled)' }}>{subtitle}</div>
            </div>
          </div>
          <button aria-label="Close" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', color: 'var(--text-secondary)', cursor: 'pointer', flex: 'none' }}>
            <Icon icon={X} size={18} />
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '4px 22px 18px' }}>{children}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '14px 22px', borderTop: 'var(--border-width) solid var(--border-subtle)', flex: 'none', background: 'var(--bg-app)' }}>{footer}</div>
      </div>
    </>
  )
}

function DrawerSection({ icon, label, open, onToggle, children }: { icon: LucideIcon; label: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <>
      <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: 'var(--space-4) 0 var(--space-2)', border: 'none', background: 'none', cursor: 'pointer' }}>
        <Icon icon={icon} size={15} style={{ color: 'var(--kia-midnight)', flex: 'none' }} />
        <span style={{ font: 'var(--fw-bold) 12px/1 var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ flex: 1 }} />
        <Icon icon={open ? ChevronUp : ChevronDown} size={16} style={{ color: 'var(--text-disabled)' }} />
      </button>
      {open && <div style={{ paddingBottom: 6 }}>{children}</div>}
      <div style={{ height: 'var(--border-width)', background: 'var(--border-subtle)', margin: '6px 0' }} />
    </>
  )
}

export function IssueListScreen() {
  const nav = useNavigate()
  const { user, scope } = useRole()
  const { issues, bulkStatus, bulkAssignRole, priorityResult } = useStore()

  const [tab, setTab] = useState<'my' | 'all'>(scope === 'own' ? 'my' : 'all')
  const [q, setQ] = useState('')
  const [drawer, setDrawer] = useState<'' | 'filter' | 'cols'>('')
  const [linkedModalFor, setLinkedModalFor] = useState<string | null>(null)
  const [secOpen, setSecOpen] = useState({ vehicle: true, classification: true, issue: true })
  // Applied filters + the drawer's working draft.
  const [flt, setFlt] = useState<FilterDraft>(EMPTY_FILTERS)
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_FILTERS)
  // Visible columns (defaults per the prototype) + the Columns drawer's working draft.
  const [cols, setCols] = useState<string[]>(DEFAULT_VISIBLE)
  const [colsDraft, setColsDraft] = useState<string[]>(DEFAULT_VISIBLE)
  const [sort, setSort] = useState<DataTableSort>(DEFAULT_SORT)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selected, setSelected] = useState<Array<string | number>>([])
  const [bulkTarget, setBulkTarget] = useState('')
  const [bulkReason, setBulkReason] = useState('')
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  const myIssues = useMemo(() => issues.filter((i) => i.assignee === user.name || i.owner === user.name), [issues, user.name])
  const scoped = tab === 'my' ? myIssues : issues

  // Option lists for the Filters drawer, derived from the dataset.
  const opts = useMemo(() => {
    const uniq = (vals: (string | undefined)[]) => Array.from(new Set(vals.filter(Boolean) as string[])).sort()
    return {
      modelCodes: uniq(issues.flatMap((i) => i.modelCodes ?? [i.modelCode])),
      modelYears: uniq(issues.map((i) => String(i.modelYear))),
      systems: uniq(issues.map((i) => (i.system ?? '').split('/')[0].trim())),
      subSystems: uniq(issues.map((i) => i.subSystem)),
      components: uniq(issues.map((i) => i.component)),
      symptoms: uniq(issues.map((i) => i.symptom)),
      owners: uniq(issues.map((i) => i.assignee ?? i.owner)),
    }
  }, [issues])

  const filtered = useMemo(() => {
    const list = scoped.filter((i) => {
      const codes = i.modelCodes ?? [i.modelCode]
      const linkCount = i.linkedIssueIds?.length ?? 0
      const days = daysOpen(i.reportedDate, i.closedAt)
      if (flt.modelCode && !codes.includes(flt.modelCode)) return false
      if (flt.modelYear && String(i.modelYear) !== flt.modelYear) return false
      if (flt.system && (i.system ?? '').split('/')[0].trim() !== flt.system) return false
      if (flt.subSystem && i.subSystem !== flt.subSystem) return false
      if (flt.component && i.component !== flt.component) return false
      if (flt.symptom && i.symptom !== flt.symptom) return false
      if (flt.status && i.status !== flt.status) return false
      if (flt.source && i.source !== flt.source) return false
      if (flt.owner && (i.assignee ?? i.owner) !== flt.owner) return false
      if (flt.grouping === 'grouped' && linkCount === 0) return false
      if (flt.grouping === 'ungrouped' && linkCount > 0) return false
      if (flt.dateFrom && i.reportedDate < flt.dateFrom) return false
      if (flt.dateTo && i.reportedDate > flt.dateTo) return false
      if (flt.days === '0-7' && days > 7) return false
      if (flt.days === '8-21' && (days < 8 || days > 21)) return false
      if (flt.days === '22' && days < 22) return false
      if (flt.linked === 'yes' && linkCount === 0) return false
      if (flt.linked === 'no' && linkCount > 0) return false
      if (flt.ews === 'yes' && !i.isEws) return false
      if (flt.ews === 'no' && i.isEws) return false
      if (q) {
        const hay = `${i.id} ${i.title} ${i.model} ${i.modelCode} ${i.system ?? ''} ${i.owner} ${i.assignee ?? ''}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
    const val = (i: Issue): string | number => {
      switch (sort.key) {
        case 'id': return i.id
        case 'title': return i.title.toLowerCase()
        case 'modelCode': return i.modelCode || i.model
        case 'status': return STATUS_KEYS.indexOf(i.status)
        case 'owner': return (i.assignee ?? i.owner).toLowerCase()
        case 'days': return daysOpen(i.reportedDate, i.closedAt)
        default: return i.reportedDate
      }
    }
    return [...list].sort((a, b) => {
      const av = val(a), bv = val(b)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [scoped, flt, q, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageClamped = Math.min(page, pageCount)
  const pageRows = filtered.slice((pageClamped - 1) * pageSize, pageClamped * pageSize)

  const pct = (n: number) => (scoped.length ? `${Math.round((n / scoped.length) * 100)}%` : '0%')
  const setStatusFilter = (s: string) => setFlt((f) => ({ ...f, status: s }))
  // KPI strip per the prototype's kpiDefs: My/All Issues · Open · Investigating · QIR · Top Issue · Closed.
  const kpiStatus = (k: StatusKey, icon: LucideIcon) => {
    const n = scoped.filter((i) => i.status === k).length
    return { label: STATUS[k].label, count: n, tone: STATUS[k].color, tint: STATUS[k].tint, icon, pct: pct(n), apply: () => setStatusFilter(k) }
  }
  const kpiDefs: { label: string; count: number; tone: string; tint: string; icon: LucideIcon; pct?: string; apply: () => void }[] = [
    // Clears any active status filter and stays on whichever tab (My/All) is already
    // selected — this card represents "everything in the current section," not a tab switch.
    { label: tab === 'my' ? 'My Issues' : 'All Issues', count: scoped.length, tone: 'var(--text-primary)', tint: 'var(--accent-50)', icon: Layers, apply: () => setStatusFilter('') },
    kpiStatus('open', FolderOpen),
    kpiStatus('review', Search),
    kpiStatus('escalated', TriangleAlert),
    kpiStatus('topissue', Flame),
    kpiStatus('closed', CircleCheck),
  ]

  // Toggleable columns, keyed for lookup. Rendered in `cols` order (below) rather
  // than this declaration order, so a newly-checked column lands at the end of
  // the visible set instead of snapping back into a fixed schema position.
  const toggleableColumns: Record<string, DataTableColumn<Issue>> = {
    source: {
      key: 'source', header: 'Source', width: 150, render: (r: Issue) => {
        const extra = (r.sources ?? []).filter((s) => s !== r.source)
        const badge = (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <SourceBadge source={r.source} size="sm" />
            {extra.length > 0 && <MorePill n={extra.length} />}
          </span>
        )
        return extra.length > 0 ? (
          <Tooltip label={<ListTooltipBody label="Sources" items={extra.map((s) => SOURCE[s].label)} />} placement="bottom" style={lightTooltipStyle}>
            {badge}
          </Tooltip>
        ) : badge
      },
    },
    modelCode: {
      key: 'modelCode', header: 'Model Code', width: 130, sortable: true, render: (r: Issue) => {
        const codes = r.modelCodes ?? []
        if (codes.length > 1) {
          return (
            <Tooltip label={<ListTooltipBody label="Model Codes" items={codes} />} placement="bottom" style={lightTooltipStyle}>
              <CountPill>{modelCodeLabel(r)}</CountPill>
            </Tooltip>
          )
        }
        return <span style={{ font: 'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{modelCodeLabel(r)}</span>
      },
    },
    classification: {
      key: 'classification', header: 'Classification', width: 200, render: (r: Issue) => (
        <span style={{ display: 'block' }}>
          <span style={{ display: 'block', font: 'var(--fw-semibold) var(--fs-body-sm)/1.25 var(--font-body)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.system ?? '—'}</span>
          <span style={{ display: 'block', font: 'var(--fw-regular) var(--fs-caption)/1.25 var(--font-body)', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.component ?? r.subSystem ?? ''}</span>
        </span>
      ),
    },
    component: { key: 'component', header: 'Component', width: 160, render: (r: Issue) => <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.25 var(--font-body)', color: 'var(--text-secondary)' }}>{r.component ?? '—'}</span> },
    symptom: { key: 'symptom', header: 'Symptom', width: 180, render: (r: Issue) => <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.25 var(--font-body)', color: 'var(--text-secondary)' }}>{r.symptom ?? '—'}</span> },
    dtc: {
      key: 'dtc', header: 'DTC', width: 170, render: (r: Issue) => (
        <span style={{ font: 'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>
          {r.dtcCodes?.length ? (r.dtcCodes.length > 1 ? `${r.dtcCodes.length} DTC` : r.dtcCodes[0]) : '—'}
        </span>
      ),
    },
    status: { key: 'status', header: 'Status', width: 160, sortable: true, render: (r: Issue) => <StatusBadge status={r.status} /> },
    issueDate: {
      key: 'issueDate', header: 'Issue Date', width: 130, sortable: true, render: (r: Issue) => (
        <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>{fmtMDY(r.reportedDate)}</span>
      ),
    },
    owner: {
      key: 'owner', header: 'Owner', width: 170, sortable: true, render: (r: Issue) => {
        const name = r.assignee ?? r.owner
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Avatar name={name} size="sm" style={{ background: 'var(--kia-midnight)' }} />
            <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
          </span>
        )
      },
    },
    days: { key: 'days', header: 'Days open', width: 100, sortable: true, render: (r: Issue) => <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>{daysOpen(r.reportedDate, r.closedAt)}</span> },
    model: {
      key: 'model', header: 'Model', width: 140, render: (r: Issue) => (
        <Tooltip label={r.model} placement="bottom" style={lightTooltipStyle}>
          <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{r.model}</span>
        </Tooltip>
      ),
    },
    modelYear: {
      key: 'modelYear', header: 'Model Year', width: 110, sortable: true, render: (r: Issue) => (
        <Tooltip label={String(r.modelYear)} placement="bottom" style={lightTooltipStyle}>
          <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{r.modelYear}</span>
        </Tooltip>
      ),
    },
    severity: {
      key: 'severity', header: 'Severity', width: 110, render: (r: Issue) => {
        const p = priorityResult(r.id)
        return p.scored ? <TagChip tint={PRIORITY_BANDS[p.final].tint} color={PRIORITY_BANDS[p.final].color}>{p.final}</TagChip> : <span style={{ color: 'var(--text-disabled)' }}>—</span>
      },
    },
    linked: {
      key: 'linked', header: 'Linked', width: 110, render: (r: Issue) => (
        <button
          onClick={() => setLinkedModalFor(r.id)}
          title="Review correlated issues"
          aria-label={
            r.linkedIssueIds?.length
              ? `${r.linkedIssueIds.length} linked issue${r.linkedIssueIds.length === 1 ? '' : 's'} — review correlated issues for ${r.id}`
              : `No linked issues — review correlated issues for ${r.id}`
          }
          style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, font: 'var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)' }}
        >
          {r.linkedIssueIds?.length ? (
            <>
              <Icon icon={Link2} size={13} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{r.linkedIssueIds.length}</span>
            </>
          ) : <span style={{ color: 'var(--text-disabled)' }}>—</span>}
        </button>
      ),
    },
  }

  const columns: DataTableColumn<Issue>[] = [
    {
      // Issue ID and Issue Title are frozen (DataTable's `sticky`) so they stay
      // visible while the rest of the row scrolls horizontally.
      key: 'id', header: 'Issue ID', width: 108, sticky: true, render: (r) => (
        <button onClick={() => nav(`/issues/${r.id}`)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{r.id}</button>
      ),
    },
    {
      // Narrowed so Issue ID + Issue Title + all five default columns fit without
      // horizontal scroll; every column below also carries an explicit width so
      // the table has a deterministic total width — once toggled-on columns push
      // past the container, DataTable scrolls horizontally instead of squeezing
      // columns, and each column keeps its own width.
      key: 'title', header: 'Issue Title', width: 240, sticky: true, render: (r) => (
        <Tooltip label={r.title} placement="bottom" style={lightTooltipStyle} wrapperStyle={{ display: 'block', minWidth: 0 }}>
          <button onClick={() => nav(`/issues/${r.id}`)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left', font: 'var(--fw-medium) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {r.isEws && <Icon icon={AlertTriangle} size={13} label="EWS-flagged" style={{ color: 'var(--danger-500)', marginRight: 6, verticalAlign: -2 }} />}
            {r.title}
          </button>
        </Tooltip>
      ),
    },
    ...cols.map((key) => toggleableColumns[key]).filter(Boolean),
  ]

  const onToggleAll = (e: ChangeEvent<HTMLInputElement>) => setSelected(e.target.checked ? pageRows.map((r) => r.id) : [])
  const onToggleRow = (id: string | number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const onSort = (key: string) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))

  const applyBulk = () => {
    if (!bulkTarget || !bulkReason.trim()) return
    bulkStatus(selected.map(String), bulkTarget as StatusKey, bulkReason.trim(), { name: user.name, role: user.role })
    setSelected([]); setBulkTarget(''); setBulkReason(''); setBulkModalOpen(false)
  }
  // Clearing filters also restores the default sort, which is what the prototype intends.
  // Its own clearFilters() assigns sortKey twice — 'registered' then 'priority' — so the
  // last write silently re-sorts by priority. That is a bug, not a spec: fixed here rather
  // than ported. Decision recorded in the UX memlog (2026-08-24).
  const clearFilters = () => { setQ(''); setFlt(EMPTY_FILTERS); setDraft(EMPTY_FILTERS); setSort(DEFAULT_SORT) }

  const draftSelect = (key: keyof FilterDraft, label: string, options: string[] | { value: string; label: string }[]) => (
    <div style={fieldRow}>
      <label style={drawerLabel}>{label}</label>
      <Select aria-label={label} size="lg" value={draft[key]} placeholder="All" options={options} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))} />
    </div>
  )

  return (
    <PageContainer wide>
      <PageCrumb backTo="/dashboard" trail={[{ label: 'Issue Management', to: '/issues' }, { label: 'Issue List' }]} />

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <div>
          <h1 style={{ margin: 0, font: 'var(--fw-bold) 30px/1.15 var(--font-display)', letterSpacing: 'var(--ls-h1)', color: 'var(--text-primary)' }}>Issue list</h1>
          <p style={{ margin: 'var(--space-2) 0 0', font: 'var(--fw-regular) var(--fs-body-md)/1 var(--font-body)', color: 'var(--text-secondary)' }}>Monitor, prioritize and manage product quality issues.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {/* Exports the CURRENT VIEW — every row the active tab, search and
              filters produce, not just the page on screen. A user who has
              filtered to 40 of 300 issues means those 40; silently exporting
              the visible 20, or all 300, would both be wrong. */}
          <Button
            variant="secondary"
            iconLeft={<Icon icon={Download} size={16} />}
            disabled={filtered.length === 0}
            onClick={() => downloadIssuesCsv(filtered, exportFilename())}
          >
            Export
          </Button>
          <Button iconLeft={<Icon icon={Plus} size={16} />} onClick={() => nav('/issues/new')}>New issue</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {kpiDefs.map((k) => (
          <button key={k.label} onClick={k.apply} style={{ textAlign: 'left', background: 'var(--surface-card)', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xs)', padding: 'var(--space-4)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <IconChip icon={k.icon} tint={k.tint} color={k.tone === 'var(--text-primary)' ? 'var(--accent-600)' : k.tone} size={36} iconSize={17} />
              {k.pct && (
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 'var(--icon-md)', padding: '0 var(--space-2)', borderRadius: 'var(--radius-pill)', background: k.tint, color: k.tone === 'var(--text-primary)' ? 'var(--accent-700)' : k.tone, font: 'var(--fw-bold) 11px/1 var(--font-body)' }}>{k.pct}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
              <span style={{ font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-display)', color: k.tone }}>{k.count}</span>
              <span style={{ font: 'var(--fw-bold) 10.5px/1.2 var(--font-body)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tabs + search + filter/columns */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 18, alignSelf: 'flex-end' }}>
          {([['my', 'My Issues', myIssues.length], ['all', 'All Issues', issues.length]] as const).map(([k, label, n]) => {
            const active = tab === k
            return (
              <button key={k} onClick={() => { setTab(k); setPage(1) }} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: 'transparent', padding: '6px 2px 10px', cursor: 'pointer', font: `${active ? 'var(--fw-bold)' : 'var(--fw-medium)'} var(--fs-body-md)/1 var(--font-body)`, color: active ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: active ? 'inset 0 -2px 0 0 var(--kia-midnight)' : 'none' }}>
                {label}
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 19, height: 19, padding: '0 6px', borderRadius: 'var(--radius-pill)', background: active ? 'var(--kia-midnight)' : 'var(--neutral-100)', color: active ? '#fff' : 'var(--text-secondary)', font: 'var(--fw-bold) 10.5px/1 var(--font-body)' }}>{n}</span>
              </button>
            )
          })}
        </div>
        <span style={{ flex: 1 }} />
        <div style={{ width: 300 }}>
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search by keyword..." />
        </div>
        <Button variant="secondary" iconLeft={<Icon icon={SlidersHorizontal} size={15} />} onClick={() => { setDraft(flt); setDrawer('filter') }}>Filter</Button>
        <Button variant="secondary" iconLeft={<Icon icon={Columns3} size={15} />} onClick={() => { setColsDraft(cols); setDrawer('cols') }}>Columns</Button>
      </div>

      {/* Bulk-action bar */}
      {selected.length > 0 && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 'var(--space-6)',
            transform: 'translateX(-50%)',
            zIndex: 'var(--z-sticky)' as unknown as number,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-2) var(--space-5)',
            background: 'var(--kia-midnight)',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'var(--control-sm)', height: 'var(--control-sm)', borderRadius: '50%', background: 'var(--neutral-0)', color: 'var(--kia-midnight)', font: 'var(--fw-bold) var(--fs-body-sm)/1 var(--font-body)', flex: 'none' }}>
              {selected.length}
            </span>
            <span style={{ color: 'var(--neutral-0)', font: 'var(--fw-semibold) var(--fs-body-md)/1 var(--font-body)', whiteSpace: 'nowrap' }}>
              {selected.length === 1 ? 'Issue Selected' : 'Issues Selected'}
            </span>
          </span>
          <span aria-hidden style={{ width: 'var(--border-width)', height: 'var(--space-5)', background: 'rgba(255,255,255,0.2)', flex: 'none' }} />
          <button
            onClick={() => setBulkModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', border: 'none', background: 'transparent', padding: 0, color: 'var(--neutral-0)', font: 'var(--fw-semibold) var(--fs-body-md)/1 var(--font-body)', whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            <Icon icon={RefreshCw} size={16} />
            Change Status
          </button>
          <span aria-hidden style={{ width: 'var(--border-width)', height: 'var(--space-5)', background: 'rgba(255,255,255,0.2)', flex: 'none' }} />
          {/* The bulk export is the SELECTION, not the view — that is the whole
              point of having selected rows. */}
          <button
            onClick={() => {
              const chosen = new Set(selected.map(String))
              downloadIssuesCsv(filtered.filter((i) => chosen.has(i.id)), exportFilename('issues-selected'))
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', border: 'none', background: 'transparent', padding: 0, color: 'var(--neutral-0)', font: 'var(--fw-semibold) var(--fs-body-md)/1 var(--font-body)', whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            <Icon icon={FileOutput} size={16} />
            Export
          </button>
          <span aria-hidden style={{ width: 'var(--border-width)', height: 'var(--space-5)', background: 'rgba(255,255,255,0.2)', flex: 'none' }} />
          <button
            onClick={() => setAssignOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', border: 'none', background: 'transparent', padding: 0, color: 'var(--neutral-0)', font: 'var(--fw-semibold) var(--fs-body-md)/1 var(--font-body)', whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            <Icon icon={UserCog} size={16} />
            Assign Role
          </button>
          <span aria-hidden style={{ width: 'var(--border-width)', height: 'var(--space-5)', background: 'rgba(255,255,255,0.2)', flex: 'none' }} />
          <button
            aria-label="Clear selection"
            onClick={() => setSelected([])}
            style={{ display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', padding: 0, color: 'var(--neutral-0)', cursor: 'pointer' }}
          >
            <Icon icon={X} size={18} />
          </button>
        </div>
      )}
      {/* Bulk role assignment. A modal rather than the inline dropdown the Vue
          bar uses: this writes to every selected issue at once, and a menu that
          commits on hover-and-click gives no moment to notice the count is 40
          rather than the 4 you meant. The count is restated in the body. */}
      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign role"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignOpen(false)}>Cancel</Button>
          </>
        }
      >
        <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>
          Reassign <b style={{ color: 'var(--text-primary)' }}>{selected.length}</b> selected issue
          {selected.length === 1 ? '' : 's'} to a role. This changes who the issue is assigned to —
          the original owner is unchanged.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {(['SE', 'ASM', 'PQM'] as const).map((r) => (
            <Button
              key={r}
              variant="secondary"
              onClick={() => {
                bulkAssignRole(selected.map(String), r, { name: user.name, role: user.role })
                setAssignOpen(false)
                setSelected([])
              }}
            >
              {r}
            </Button>
          ))}
        </div>
      </Modal>

      {bulkModalOpen && (
        <Modal
          open={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          width={520}
          title={
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <IconChip icon={RefreshCw} tint="var(--accent-50)" color="var(--accent-600)" size={40} iconSize={18} />
                <div>
                  <div style={{ font: 'var(--fw-bold) var(--fs-h4)/1.25 var(--font-body)', color: 'var(--text-primary)' }}>Change status</div>
                  <div style={{ marginTop: 4, font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
                    This will update {selected.length} selected issue{selected.length === 1 ? '' : 's'}. A valid reason is required for every status change.
                  </div>
                </div>
              </div>
              <button
                aria-label="Close"
                onClick={() => setBulkModalOpen(false)}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', color: 'var(--text-secondary)', cursor: 'pointer', flex: 'none' }}
              >
                <Icon icon={X} size={18} />
              </button>
            </div>
          }
          footer={
            <>
              <Button variant="ghost" onClick={() => setBulkModalOpen(false)}>Cancel</Button>
              <Button iconLeft={<Icon icon={Check} size={15} />} onClick={applyBulk} disabled={!bulkTarget || !bulkReason.trim()}>
                Update status for {selected.length} selected issue{selected.length === 1 ? '' : 's'}
              </Button>
            </>
          }
        >
          <div style={{ borderTop: 'var(--border-width) solid var(--border-subtle)', margin: '0 0 var(--space-4)' }} />
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <ULabel>New status <span style={{ color: 'var(--danger-500)' }}>*</span></ULabel>
            <StatusDropdown value={bulkTarget} onChange={setBulkTarget} />
          </div>
          <div>
            <ULabel>Reason / comment <span style={{ color: 'var(--danger-500)' }}>*</span></ULabel>
            <Textarea aria-label="Reason / comment" value={bulkReason} onChange={(e) => setBulkReason(e.target.value)} rows={3} placeholder="e.g. Bulk triage — moving reviewed issues to the next stage" />
          </div>
        </Modal>
      )}

      {/* Table card */}
      <SectionCard pad={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderBottom: 'var(--border-width) solid var(--border-subtle)' }}>
          <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>
            Showing <b style={{ color: 'var(--text-primary)' }}>{filtered.length}</b> of {tab === 'my' ? myIssues.length : issues.length} issues
          </span>
          <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>Select rows to change status or export</span>
        </div>
        {pageRows.length === 0 ? (
          <div style={{ padding: 'var(--space-6)' }}>
            <EmptyState title="No issues match these filters" message="Clear filters to see all issues in the queue." action={<Button variant="secondary" size="sm" onClick={clearFilters}>Clear filters</Button>} />
          </div>
        ) : (
          <>
            <DataTable<Issue>
              columns={columns}
              rows={pageRows}
              rowKey="id"
              selectable
              selectedIds={selected}
              onToggleRow={onToggleRow}
              onToggleAll={onToggleAll}
              sort={sort}
              onSort={onSort}
              style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}
            />
            {/* Footer band — inside the table card, like the prototype */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: 'var(--border-width) solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>
                  Showing <b style={{ color: 'var(--text-primary)' }}>{(pageClamped - 1) * pageSize + 1} - {Math.min(pageClamped * pageSize, filtered.length)}</b> of <b style={{ color: 'var(--text-primary)' }}>{filtered.length}</b> issues
                </span>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>
                  Rows:
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                    style={{ height: 26, border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-primary)', background: 'var(--surface-card)' }}
                  >
                    {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              </div>
              <Pagination page={pageClamped} pageCount={pageCount} onChange={setPage} />
            </div>
          </>
        )}
      </SectionCard>

      {/* ---- Filters drawer (right-side overlay, per the prototype) ---- */}
      {drawer === 'filter' && (
        <Drawer
          icon={SlidersHorizontal}
          title="Filters"
          subtitle="Refine the issue list"
          onClose={() => setDrawer('')}
          footer={
            <>
              <Button variant="secondary" iconLeft={<Icon icon={RotateCcw} size={16} />} onClick={() => setDraft(EMPTY_FILTERS)}>Reset</Button>
              <Button style={{ flex: 1 }} onClick={() => { setFlt(draft); setPage(1); setDrawer('') }}>Apply</Button>
            </>
          }
        >
          <DrawerSection icon={Car} label="Vehicle" open={secOpen.vehicle} onToggle={() => setSecOpen((s) => ({ ...s, vehicle: !s.vehicle }))}>
            {draftSelect('modelCode', 'Model Code', opts.modelCodes)}
            {draftSelect('modelYear', 'Model Year', opts.modelYears)}
          </DrawerSection>
          <DrawerSection icon={Layers} label="Classification" open={secOpen.classification} onToggle={() => setSecOpen((s) => ({ ...s, classification: !s.classification }))}>
            {draftSelect('system', 'System', opts.systems)}
            {draftSelect('subSystem', 'Sub-System', opts.subSystems)}
            {draftSelect('component', 'Component', opts.components)}
            {draftSelect('symptom', 'Symptom', opts.symptoms)}
          </DrawerSection>
          <DrawerSection icon={ClipboardList} label="Issue" open={secOpen.issue} onToggle={() => setSecOpen((s) => ({ ...s, issue: !s.issue }))}>
            {draftSelect('status', 'Status', STATUS_KEYS.map((k) => ({ value: k, label: STATUS[k].label })))}
            {draftSelect('source', 'Source', SOURCE_KEYS.map((k) => ({ value: k, label: SOURCE[k].label })))}
            {draftSelect('owner', 'Owner', opts.owners)}
            {draftSelect('grouping', 'Issue Grouping', [{ value: 'grouped', label: 'Grouped issues' }, { value: 'ungrouped', label: 'Ungrouped issues' }])}
            <div style={fieldRow}>
              <label style={drawerLabel}>Issue Date</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                <input type="date" aria-label="Start date" value={draft.dateFrom} onChange={(e) => setDraft((d) => ({ ...d, dateFrom: e.target.value }))} style={{ flex: 1, minWidth: 0, height: 42, boxSizing: 'border-box', padding: '0 11px', border: 'var(--border-width) solid var(--border-default)', borderRadius: 10, font: 'var(--fw-medium) 13.5px/1 var(--font-body)', color: draft.dateFrom ? 'var(--text-primary)' : 'var(--text-disabled)', background: 'var(--surface-card)' }} />
                <span style={{ font: 'var(--fw-regular) 12px/1 var(--font-body)', color: 'var(--text-disabled)', flex: 'none' }}>to</span>
                <input type="date" aria-label="End date" value={draft.dateTo} onChange={(e) => setDraft((d) => ({ ...d, dateTo: e.target.value }))} style={{ flex: 1, minWidth: 0, height: 42, boxSizing: 'border-box', padding: '0 11px', border: 'var(--border-width) solid var(--border-default)', borderRadius: 10, font: 'var(--fw-medium) 13.5px/1 var(--font-body)', color: draft.dateTo ? 'var(--text-primary)' : 'var(--text-disabled)', background: 'var(--surface-card)' }} />
              </div>
            </div>
            <div style={fieldRow}>
              <label style={drawerLabel}>Days open</label>
              <SegRow options={[{ v: '', l: 'All' }, { v: '0-7', l: '≤7d' }, { v: '8-21', l: '8–21d' }, { v: '22', l: '>21d' }]} value={draft.days} onChange={(v) => setDraft((d) => ({ ...d, days: v }))} />
            </div>
            <div style={fieldRow}>
              <label style={drawerLabel}>Linked issues</label>
              <SegRow options={[{ v: '', l: 'All' }, { v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }]} value={draft.linked} onChange={(v) => setDraft((d) => ({ ...d, linked: v }))} />
            </div>
            <div style={fieldRow}>
              <label style={drawerLabel}>EWS flag</label>
              <SegRow options={[{ v: '', l: 'All' }, { v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }]} value={draft.ews} onChange={(v) => setDraft((d) => ({ ...d, ews: v }))} />
            </div>
          </DrawerSection>
        </Drawer>
      )}

      {/* ---- Columns drawer (right-side overlay, per the prototype) ---- */}
      {drawer === 'cols' && (
        <Drawer
          icon={Columns3}
          title="Columns"
          subtitle="Show or hide columns in this list"
          onClose={() => setDrawer('')}
          footer={
            <>
              <Button variant="secondary" iconLeft={<Icon icon={RotateCcw} size={16} />} onClick={() => setColsDraft(DEFAULT_VISIBLE)}>Restore default</Button>
              <Button style={{ flex: 1 }} onClick={() => { setCols(colsDraft); setDrawer('') }}>Apply</Button>
            </>
          }
        >
          <div style={{ ...drawerLabel, padding: '16px 0 10px' }}>Default columns</div>
          {[{ key: '_id', label: 'Issue ID', required: true }, { key: '_title', label: 'Issue Title', required: true }, ...DEFAULT_COLS.map((c) => ({ ...c, required: false }))].map((c) => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
              <Checkbox
                disabled={c.required}
                checked={c.required || colsDraft.includes(c.key)}
                onChange={(e) => setColsDraft((s) => (e.target.checked ? [...s, c.key] : s.filter((x) => x !== c.key)))}
                label={c.label}
                style={c.required ? { color: 'var(--text-primary)' } : undefined}
              />
              {c.required && <span style={{ font: 'var(--fw-bold) 9.5px/1 var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-disabled)', background: 'var(--neutral-50)', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '3px 7px' }}>Required</span>}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 10px' }}>
            <span style={drawerLabel}>Optional columns</span>
            <Checkbox
              checked={OPTIONAL_COLS.every((c) => colsDraft.includes(c.key))}
              onChange={(e) => setColsDraft((s) => (e.target.checked ? Array.from(new Set([...s, ...OPTIONAL_COLS.map((c) => c.key as string)])) : s.filter((x) => !OPTIONAL_COLS.some((c) => c.key === x))))}
              label={<span style={{ font: 'var(--fw-bold) 10.5px/1 var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Select all</span>}
            />
          </div>
          {OPTIONAL_COLS.map((c) => (
            <div key={c.key} style={{ padding: 'var(--space-2) 0' }}>
              <Checkbox checked={colsDraft.includes(c.key)} onChange={(e) => setColsDraft((s) => (e.target.checked ? [...s, c.key] : s.filter((x) => x !== c.key)))} label={c.label} />
            </div>
          ))}
        </Drawer>
      )}
      {linkedModalFor && (
        <LinkedIssuesModal open issueId={linkedModalFor} onClose={() => setLinkedModalFor(null)} />
      )}
    </PageContainer>
  )
}

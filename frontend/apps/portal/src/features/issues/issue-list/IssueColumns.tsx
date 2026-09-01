import { AlertTriangle, Link2 } from 'lucide-react'
import {
  Avatar,
  Icon,
  SOURCE,
  SourceBadge,
  StatusBadge,
  Tooltip,
  type DataTableColumn,
  type DataTableSort,
} from '@pqms/ui-library'
import { combinedSources, daysOpen, fmtMDY, modelCodeLabel } from '@/data/util'
import type { Issue } from '@/data/types'
import { CountPill, ListTooltipBody } from './IssueTableCells'

// Column model per the Columns drawer: Issue ID / Issue Title are REQUIRED,
// five default columns are toggleable, seven optional columns.
export const DEFAULT_COLS = [
  { key: 'modelCode', label: 'Model Code' },
  { key: 'classification', label: 'Classification' },
  { key: 'status', label: 'Status' },
  { key: 'issueDate', label: 'Issue Date' },
  { key: 'linked', label: 'Linked' },
] as const
export const OPTIONAL_COLS = [
  { key: 'model', label: 'Model' },
  { key: 'source', label: 'Source' },
  { key: 'component', label: 'Component' },
  { key: 'symptom', label: 'Symptom' },
  { key: 'dtc', label: 'DTC / Trouble Code' },
  { key: 'owner', label: 'Owner' },
  { key: 'days', label: 'Days' },
] as const
export const DEFAULT_VISIBLE = DEFAULT_COLS.map((c) => c.key as string)

/** Default list sort: Issue Date descending (the prototype's 'registered desc'). */
export const DEFAULT_SORT: DataTableSort = { key: 'issueDate', dir: 'desc' }

/**
 * Every column key the table can render — the allow-list the stored view is
 * validated against, so a blob written by an older build cannot name a column
 * that no longer exists. Also bounds the stored SORT key: sorting is by column.
 */
export const ALL_COLUMN_KEYS: readonly string[] = [
  ...DEFAULT_COLS.map((c) => c.key as string),
  ...OPTIONAL_COLS.map((c) => c.key as string),
]

// Shared "light" tooltip bubble (white card, hairline border) used across the table's
// multi-value cells (Issue Title, Model Code, Source, Model) — the design-system
// Tooltip defaults to a dark bubble, which reads as a different component;
// overriding its style keeps every cell tooltip visually consistent.
export const lightTooltipStyle = {
  background: 'var(--surface-card)',
  color: 'var(--text-primary)',
  border: 'var(--border-width) solid var(--border-subtle)',
  boxShadow: 'var(--shadow-md)',
  whiteSpace: 'normal',
  padding: '8px 12px',
} as const

export interface BuildIssueColumnsOptions {
  /** Visible optional/default column keys, in the order to render them. */
  cols: string[]
  nav: (path: string) => void
  onOpenLinked: (id: string) => void
}

/** Builds the full column list (frozen Issue ID + Issue Title, then whichever toggleable columns are visible). */
export function buildIssueColumns({ cols, nav, onOpenLinked }: BuildIssueColumnsOptions): DataTableColumn<Issue>[] {
  // Toggleable columns, keyed for lookup. Rendered in `cols` order (below) rather
  // than this declaration order, so a newly-checked column lands at the end of
  // the visible set instead of snapping back into a fixed schema position.
  const toggleableColumns: Record<string, DataTableColumn<Issue>> = {
    source: {
      key: 'source', header: 'Source', width: 150, render: (r: Issue) => {
        const all = combinedSources(r)
        if (all.length > 1) {
          return (
            <Tooltip label={<ListTooltipBody label="Sources" items={all.map((s) => SOURCE[s].label)} />} placement="bottom" style={lightTooltipStyle}>
              <CountPill>{`${all.length} Sources`}</CountPill>
            </Tooltip>
          )
        }
        return <SourceBadge source={r.source} size="sm" />
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
    days: { key: 'days', header: 'Days', width: 100, sortable: true, render: (r: Issue) => <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>{daysOpen(r.reportedDate, r.closedAt)}d</span> },
    model: {
      key: 'model', header: 'Model', width: 140, render: (r: Issue) => (
        <Tooltip label={r.model} placement="bottom" style={lightTooltipStyle}>
          <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{r.model}</span>
        </Tooltip>
      ),
    },
    linked: {
      key: 'linked', header: 'Linked', width: 110, render: (r: Issue) => (
        <button
          onClick={() => onOpenLinked(r.id)}
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

  return [
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
}

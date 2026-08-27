import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Minus } from 'lucide-react'
import { Icon } from '../../icons/Icon'
import styles from './DataTable.module.css'

/**
 * DataTable — dense enterprise table with sortable columns, row selection,
 * compact/default density, and zebra-free hairline rows. Ported verbatim from the
 * design-system source (_ds_bundle.js → components/pqms/DataTable.jsx).
 *
 * columns: [{ key, header, width?, align?, sortable?, render?(row) }]
 * rows: array of objects keyed by column.key
 *
 * Sort icons are Lucide ArrowUp / ArrowDown / ArrowUpDown; the checkbox
 * check/minus are Lucide Check / Minus (DS used inline paths). Sortable headers are
 * made keyboard-focusable (tabIndex + Enter/Space) so the added focus ring is
 * reachable, and expose aria-sort. All sort/selection/hover logic is preserved.
 */
export type CellAlign = 'left' | 'right' | 'center'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  width?: number | string
  align?: CellAlign
  sortable?: boolean
  /** Freezes this column (and the row-selection checkbox, if any) so it stays put while the rest of the table scrolls horizontally. Sticky columns must be a contiguous run starting at the left edge. */
  sticky?: boolean
  render?: (row: T) => ReactNode
}

export interface DataTableSort {
  key: string
  dir: 'asc' | 'desc'
}

export interface DataTableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  columns?: DataTableColumn<T>[]
  rows?: T[]
  density?: 'default' | 'compact'
  selectable?: boolean
  selectedIds?: Array<string | number>
  onToggleRow?: (id: string | number) => void
  onToggleAll?: (e: ChangeEvent<HTMLInputElement>) => void
  rowKey?: string
  sort?: DataTableSort
  onSort?: (key: string) => void
  style?: CSSProperties
}

// Fallback width for columns that don't declare one, so the table always has a
// deterministic total width -- this is what lets it scroll instead of squeeze
// columns when more are toggled on.
const DEFAULT_COLUMN_WIDTH = 140

function resolvedColumnWidth<T>(c: DataTableColumn<T>): number | string {
  return c.width ?? DEFAULT_COLUMN_WIDTH
}

export function DataTable<T = Record<string, unknown>>({
  columns = [],
  rows = [],
  density = 'default',
  selectable = false,
  selectedIds = [],
  onToggleRow,
  onToggleAll,
  rowKey = 'id',
  sort,
  onSort,
  style,
  ...rest
}: DataTableProps<T>) {
  const cellPadding = density === 'compact' ? 'var(--space-2) var(--space-4)' : 'var(--space-4) var(--space-4)'
  const getId = (r: T) => (r as Record<string, unknown>)[rowKey] as string | number
  const allChecked =
    selectable && rows.length > 0 && rows.every((r) => selectedIds.includes(getId(r)))
  const someChecked = selectable && selectedIds.length > 0 && !allChecked
  const checkboxWidth = selectable ? 44 : 0
  const totalWidth =
    checkboxWidth +
    columns.reduce((sum, c) => {
      const w = resolvedColumnWidth(c)
      return sum + (typeof w === 'number' ? w : DEFAULT_COLUMN_WIDTH)
    }, 0)
  // Sticky columns are a contiguous run from the left edge (after the checkbox
  // column, if any) -- each gets a `left` offset equal to the cumulative width
  // of the sticky columns before it, so they stack into one frozen pane.
  let stickyCursor = checkboxWidth
  const leftOffsets = columns.map((c) => {
    if (!c.sticky) return undefined
    const offset = stickyCursor
    const w = resolvedColumnWidth(c)
    stickyCursor += typeof w === 'number' ? w : DEFAULT_COLUMN_WIDTH
    return offset
  })
  const hasSticky = leftOffsets.some((o) => o !== undefined)
  // Lighter than the card body so the header still reads as its own band.
  const headerBg = 'var(--neutral-25)'
  return (
    <div
      style={{
        border: 'var(--border-width) solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--surface-card)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            minWidth: totalWidth,
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-body)',
          }}
        >
          <thead>
            <tr
              style={{
                background: headerBg,
                borderBottom: 'var(--border-width) solid var(--border-subtle)',
              }}
            >
              {selectable && (
                <th
                  style={{
                    width: 44,
                    padding: '0 0 0 var(--space-4)',
                    textAlign: 'left',
                    ...(hasSticky ? { position: 'sticky', left: 0, zIndex: 2, background: headerBg } : {}),
                  }}
                >
                  <HeaderCheckbox
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={onToggleAll}
                  />
                </th>
              )}
              {columns.map((c, i) => {
                const active = sort?.key === c.key
                const stickyLeft = leftOffsets[i]
                return (
                  <th
                    key={c.key}
                    className={c.sortable ? styles.focusable : undefined}
                    tabIndex={c.sortable ? 0 : undefined}
                    aria-sort={
                      active
                        ? sort?.dir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : c.sortable
                          ? 'none'
                          : undefined
                    }
                    onClick={() => c.sortable && onSort && onSort(c.key)}
                    onKeyDown={
                      c.sortable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onSort && onSort(c.key)
                            }
                          }
                        : undefined
                    }
                    style={{
                      height: 'var(--row-height-compact)',
                      padding: '0 var(--space-4)',
                      textAlign: c.align || 'left',
                      width: resolvedColumnWidth(c),
                      overflow: 'hidden',
                      font: `var(--fw-semibold) var(--fs-caption)/1 var(--font-body)`,
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      cursor: c.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      ...(stickyLeft !== undefined
                        ? { position: 'sticky', left: stickyLeft, zIndex: 2, background: headerBg }
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)',
                        justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start',
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
                      >
                        {c.header}
                      </span>
                      {c.sortable &&
                        (active && sort?.dir === 'asc' ? (
                          <Icon
                            icon={ArrowUp}
                            size={13}
                            strokeWidth={2.2}
                            style={{ color: 'var(--accent-500)', flexShrink: 0 }}
                          />
                        ) : active && sort?.dir === 'desc' ? (
                          <Icon
                            icon={ArrowDown}
                            size={13}
                            strokeWidth={2.2}
                            style={{ color: 'var(--accent-500)', flexShrink: 0 }}
                          />
                        ) : (
                          <Icon
                            icon={ArrowUpDown}
                            size={13}
                            strokeWidth={2.2}
                            style={{ color: active ? 'var(--accent-500)' : 'var(--neutral-400)', flexShrink: 0 }}
                          />
                        ))}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const id = getId(r)
              const checked = selectedIds.includes(id)
              return (
                <Row key={id ?? i} last={i === rows.length - 1} selected={checked}>
                  {selectable && (
                    <td
                      style={{
                        width: 44,
                        padding: '0 0 0 var(--space-4)',
                        ...(hasSticky ? { position: 'sticky', left: 0, zIndex: 1, background: 'inherit' } : {}),
                      }}
                    >
                      <HeaderCheckbox
                        checked={checked}
                        onChange={() => onToggleRow && onToggleRow(id)}
                      />
                    </td>
                  )}
                  {columns.map((c, ci) => {
                    const stickyLeft = leftOffsets[ci]
                    return (
                      <td
                        key={c.key}
                        style={{
                          padding: cellPadding,
                          textAlign: c.align || 'left',
                          font: `var(--fw-regular) var(--fs-body-md)/1.4 var(--font-body)`,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontVariantNumeric: c.align === 'right' ? 'tabular-nums' : 'normal',
                          ...(stickyLeft !== undefined
                            ? { position: 'sticky', left: stickyLeft, zIndex: 1, background: 'inherit' }
                            : {}),
                        }}
                      >
                        {c.render ? c.render(r) : ((r as Record<string, unknown>)[c.key] as ReactNode)}
                      </td>
                    )
                  })}
                </Row>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface RowProps {
  children: ReactNode
  last: boolean
  selected: boolean
}

function Row({ children, last, selected }: RowProps) {
  const [hover, setHover] = useState(false)
  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderBottom: last ? 'none' : 'var(--border-width) solid var(--border-subtle)',
        background: selected
          ? 'var(--selected-bg)'
          : hover
            ? 'var(--hover-overlay)'
            : 'var(--surface-card)',
        transition: 'background var(--dur-fast)',
      }}
    >
      {children}
    </tr>
  )
}

interface HeaderCheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
}

function HeaderCheckbox({ checked, indeterminate, onChange }: HeaderCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate
  }, [indeterminate])
  const on = checked || indeterminate
  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={styles.checkbox}
        style={{
          position: 'absolute',
          opacity: 0,
          width: 'var(--icon-sm)',
          height: 'var(--icon-sm)',
          margin: 0,
          cursor: 'pointer',
        }}
      />
      <span
        aria-hidden={true}
        className={styles.box}
        style={{
          width: 'var(--icon-sm)',
          height: 'var(--icon-sm)',
          borderRadius: 'var(--radius-sm)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: on ? 'var(--accent-500)' : 'var(--surface-card)',
          border: `1.5px solid ${on ? 'var(--accent-500)' : 'var(--border-strong)'}`,
          color: 'var(--neutral-0)',
        }}
      >
        {indeterminate ? (
          <Icon icon={Minus} size={10} strokeWidth={4} />
        ) : checked ? (
          <Icon icon={Check} size={10} strokeWidth={4} />
        ) : null}
      </span>
    </span>
  )
}

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
import { Check, ChevronDown, ChevronsUpDown, ChevronUp, Minus } from 'lucide-react'
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
 * Sort chevrons are Lucide ChevronUp / ChevronDown / ChevronsUpDown; the checkbox
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
  const rowH =
    density === 'compact' ? 'var(--row-height-compact)' : 'var(--row-height-default)'
  const getId = (r: T) => (r as Record<string, unknown>)[rowKey] as string | number
  const allChecked =
    selectable && rows.length > 0 && rows.every((r) => selectedIds.includes(getId(r)))
  const someChecked = selectable && selectedIds.length > 0 && !allChecked
  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--surface-card)',
        ...style,
      }}
      {...rest}
    >
      <table
        style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}
      >
        <thead>
          <tr
            style={{
              background: 'var(--surface-sunken)',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            {selectable && (
              <th style={{ width: 44, padding: '0 0 0 16px', textAlign: 'left' }}>
                <HeaderCheckbox
                  checked={allChecked}
                  indeterminate={someChecked}
                  onChange={onToggleAll}
                />
              </th>
            )}
            {columns.map((c) => {
              const active = sort?.key === c.key
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
                    height: 40,
                    padding: '0 16px',
                    textAlign: c.align || 'left',
                    width: c.width,
                    whiteSpace: 'nowrap',
                    font: `var(--fw-semibold) var(--fs-caption)/1 var(--font-body)`,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    cursor: c.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {c.header}
                    {c.sortable &&
                      (active && sort?.dir === 'asc' ? (
                        <Icon
                          icon={ChevronUp}
                          size={13}
                          strokeWidth={2.2}
                          style={{ color: 'var(--accent-500)' }}
                        />
                      ) : active && sort?.dir === 'desc' ? (
                        <Icon
                          icon={ChevronDown}
                          size={13}
                          strokeWidth={2.2}
                          style={{ color: 'var(--accent-500)' }}
                        />
                      ) : (
                        <Icon
                          icon={ChevronsUpDown}
                          size={13}
                          strokeWidth={2.2}
                          style={{ color: active ? 'var(--accent-500)' : 'var(--neutral-400)' }}
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
              <Row key={id ?? i} rowH={rowH} last={i === rows.length - 1} selected={checked}>
                {selectable && (
                  <td style={{ width: 44, padding: '0 0 0 16px' }}>
                    <HeaderCheckbox
                      checked={checked}
                      onChange={() => onToggleRow && onToggleRow(id)}
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      padding: '0 16px',
                      textAlign: c.align || 'left',
                      font: `var(--fw-regular) var(--fs-body-md)/1.4 var(--font-body)`,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      fontVariantNumeric: c.align === 'right' ? 'tabular-nums' : 'normal',
                    }}
                  >
                    {c.render ? c.render(r) : ((r as Record<string, unknown>)[c.key] as ReactNode)}
                  </td>
                ))}
              </Row>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface RowProps {
  children: ReactNode
  rowH: string
  last: boolean
  selected: boolean
}

function Row({ children, rowH, last, selected }: RowProps) {
  const [hover, setHover] = useState(false)
  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: rowH,
        borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
        background: selected
          ? 'var(--selected-bg)'
          : hover
            ? 'var(--hover-overlay)'
            : 'transparent',
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
          width: 16,
          height: 16,
          margin: 0,
          cursor: 'pointer',
        }}
      />
      <span
        aria-hidden={true}
        className={styles.box}
        style={{
          width: 16,
          height: 16,
          borderRadius: 'var(--radius-sm)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: on ? 'var(--accent-500)' : 'var(--surface-card)',
          border: `1.5px solid ${on ? 'var(--accent-500)' : 'var(--border-strong)'}`,
          color: '#fff',
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

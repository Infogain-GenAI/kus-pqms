import type { ReactNode } from 'react'

export interface FooterProps {
  /** The "Showing X-Y of Z" range text — caller-supplied so i18n copy is not duplicated here. */
  rangeText: ReactNode
  pageSize?: number
  pageSizeOptions?: number[]
  pageSizeLabel?: ReactNode
  onPageSizeChange?: (n: number) => void
  /** Typically a <Pagination /> element. */
  pagination?: ReactNode
}

/** Table-card footer band: range text + optional page-size picker on the left, pagination on the right. */
export function Footer({ rangeText, pageSize, pageSizeOptions, pageSizeLabel, onPageSizeChange, pagination }: FooterProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: 'var(--border-width) solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>{rangeText}</span>
        {pageSizeOptions && onPageSizeChange && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>
            {pageSizeLabel}
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{ height: 26, border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-primary)', background: 'var(--surface-card)' }}
            >
              {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        )}
      </div>
      {pagination}
    </div>
  )
}

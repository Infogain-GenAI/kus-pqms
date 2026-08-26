import {
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Icon } from '../../icons/Icon'
import styles from './Pagination.module.css'

/**
 * Pagination — page controls + range summary. Ported verbatim from the
 * design-system source (_ds_bundle.js → components/navigation/Pagination.jsx).
 * pageWindow logic and the ellipsis/en-dash glyphs are preserved exactly. Prev/next
 * chevrons are Lucide ChevronLeft/ChevronRight. Focus ring added on page buttons.
 */
const ELLIPSIS = '…'

export interface PaginationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'onChange'> {
  page?: number
  pageCount?: number
  pageSize?: number
  total?: number
  onChange?: (page: number) => void
  style?: CSSProperties
}

export function Pagination({
  page = 1,
  pageCount = 1,
  pageSize,
  total,
  onChange,
  style,
  ...rest
}: PaginationProps) {
  const go = (p: number) => onChange && p >= 1 && p <= pageCount && p !== page && onChange(p)
  const pages = pageWindow(page, pageCount)
  const from = pageSize ? (page - 1) * pageSize + 1 : null
  const to = pageSize ? Math.min(page * pageSize, total ?? page * pageSize) : null
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        ...style,
      }}
      {...rest}
    >
      {total != null && (
        <span
          style={{
            font: `var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)`,
            color: 'var(--text-muted)',
          }}
        >
          {from}
          {'–'}
          {to} of {total.toLocaleString()}
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <PageBtn disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
          <Icon icon={ChevronLeft} size={16} strokeWidth={2} />
        </PageBtn>
        {pages.map((p, i) =>
          p === ELLIPSIS ? (
            <span key={`g${i}`} style={{ padding: '0 6px', color: 'var(--text-muted)' }}>
              {ELLIPSIS}
            </span>
          ) : (
            <PageBtn key={p} active={p === page} onClick={() => go(p as number)}>
              {p}
            </PageBtn>
          )
        )}
        <PageBtn disabled={page >= pageCount} onClick={() => go(page + 1)} aria-label="Next page">
          <Icon icon={ChevronRight} size={16} strokeWidth={2} />
        </PageBtn>
      </div>
    </div>
  )
}

interface PageBtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  active?: boolean
  style?: CSSProperties
}

function PageBtn({ children, active, disabled, style, className, ...rest }: PageBtnProps) {
  const [hover, setHover] = useState(false)
  return (
    <button
      disabled={disabled}
      className={[styles.focusable, className].filter(Boolean).join(' ')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        minWidth: 32,
        height: 32,
        padding: '0 var(--space-2)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${active ? 'var(--kia-midnight)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-md)',
        background: active
          ? 'var(--kia-midnight)'
          : disabled
            ? 'var(--disabled-bg)'
            : hover
              ? 'var(--neutral-50)'
              : 'var(--surface-card)',
        color: active ? '#fff' : disabled ? 'var(--text-disabled)' : 'var(--text-secondary)',
        font: `var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-fast)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}

function pageWindow(page: number, count: number): Array<number | string> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, ELLIPSIS, count]
  if (page >= count - 3) return [1, ELLIPSIS, count - 4, count - 3, count - 2, count - 1, count]
  return [1, ELLIPSIS, page - 1, page, page + 1, ELLIPSIS, count]
}

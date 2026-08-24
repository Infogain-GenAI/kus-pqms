import { Fragment, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Icon } from '@/icons/Icon'
import styles from './Breadcrumb.module.css'

/**
 * Breadcrumb — path trail. Ported verbatim from the design-system source
 * (_ds_bundle.js → components/navigation/Breadcrumb.jsx). The last item renders
 * as the current page; earlier items are links. Separator chevron is Lucide
 * ChevronRight (DS used an inline chevron path). Focus ring added on links for a11y.
 */
export interface BreadcrumbItem {
  label: ReactNode
  href?: string
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  items?: BreadcrumbItem[]
  style?: CSSProperties
}

export function Breadcrumb({ items = [], style, ...rest }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{ display: 'flex', alignItems: 'center', gap: 6, ...style }}
      {...rest}
    >
      {items.map((it, i) => {
        const last = i === items.length - 1
        return (
          <Fragment key={i}>
            {last ? (
              <span
                aria-current="page"
                style={{
                  font: `var(--fw-semibold) var(--fs-body-sm)/1 var(--font-body)`,
                  color: 'var(--text-primary)',
                }}
              >
                {it.label}
              </span>
            ) : (
              <a
                href={it.href || '#'}
                className={styles.focusable}
                style={{
                  font: `var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)`,
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
              >
                {it.label}
              </a>
            )}
            {!last && (
              <Icon icon={ChevronRight} size={14} strokeWidth={2} color="var(--neutral-400)" />
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

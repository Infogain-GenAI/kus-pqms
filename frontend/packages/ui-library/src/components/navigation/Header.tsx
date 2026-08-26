import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

/**
 * Header — top app bar (60px). Ported verbatim from the design-system source
 * (_ds_bundle.js → components/navigation/Header.jsx). Left: title / breadcrumb
 * slot. Right: actions slot. No interactive elements of its own (slots carry them).
 */
export interface HeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'title'> {
  title?: ReactNode
  left?: ReactNode
  right?: ReactNode
  children?: ReactNode
  style?: CSSProperties
}

export function Header({ title, left, right, children, style, ...rest }: HeaderProps) {
  return (
    <header
      style={{
        height: 'var(--header-height)',
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        padding: '0 var(--space-6)',
        background: 'var(--surface-card)',
        borderBottom: 'var(--border-width) solid var(--border-subtle)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', minWidth: 0 }}>
        {left}
        {title && (
          <h1
            style={{
              margin: 0,
              font: `var(--fw-semibold) var(--fs-h3)/1.2 var(--font-body)`,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h1>
        )}
        {children}
      </div>
      {right && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>{right}</div>
      )}
    </header>
  )
}

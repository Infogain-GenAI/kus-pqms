import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'

/**
 * CommentCard — a single comment in an issue discussion / audit log.
 * Ported verbatim from the design-system source (_ds_bundle.js → components/pqms/CommentCard.jsx).
 * NOTE: the DS source renders its own inline initials avatar (not the Avatar component) — kept as-is.
 */
export interface CommentCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'role'> {
  author?: string
  role?: ReactNode
  time?: ReactNode
  internal?: boolean
  style?: CSSProperties
}

export function CommentCard({ author, role, time, children, internal = false, style, ...rest }: CommentCardProps) {
  const initials = (author || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          width: 'var(--icon-xl)',
          height: 'var(--icon-xl)',
          borderRadius: '50%',
          background: 'var(--kia-midnight-70)',
          color: 'var(--neutral-0)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
          font: 'var(--fw-semibold) 12px/1 var(--font-body)',
        }}
      >
        {initials}
      </span>
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              font: `var(--fw-semibold) var(--fs-body-md)/1 var(--font-body)`,
              color: 'var(--text-primary)',
            }}
          >
            {author}
          </span>
          {role && (
            <span
              style={{
                font: `var(--fw-medium) var(--fs-caption)/1 var(--font-body)`,
                color: 'var(--text-muted)',
              }}
            >
              {role}
            </span>
          )}
          {internal && (
            <span
              style={{
                font: `var(--fw-semibold) 10px/1 var(--font-body)`,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--warning-600)',
                background: 'var(--warning-50)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Internal
            </span>
          )}
          <span
            style={{
              font: `var(--fw-regular) var(--fs-caption)/1 var(--font-body)`,
              color: 'var(--text-muted)',
              marginLeft: 'auto',
            }}
          >
            {time}
          </span>
        </div>
        <div
          style={{
            marginTop: 6,
            padding: '10px 12px',
            background: internal ? 'var(--warning-50)' : 'var(--surface-sunken)',
            border: `1px solid ${internal ? '#F4E2C0' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            font: `var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)`,
            color: 'var(--text-primary)',
            textWrap: 'pretty',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

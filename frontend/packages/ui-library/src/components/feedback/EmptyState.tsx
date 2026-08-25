import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'

/**
 * EmptyState — no-data / no-results placeholder with optional action.
 * Ported verbatim from the design-system source (_ds_bundle.js → components/feedback/EmptyState.jsx).
 * `icon` is injected as the children of the built-in <svg> (pass raw <path>/<circle> nodes).
 */
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'title'> {
  icon?: ReactNode
  title?: ReactNode
  message?: ReactNode
  action?: ReactNode
  compact?: boolean
  style?: CSSProperties
}

export function EmptyState({ icon, title, message, action, compact = false, style, ...rest }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 6,
        padding: compact ? '28px 24px' : '56px 24px',
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          width: compact ? 40 : 52,
          height: compact ? 40 : 52,
          borderRadius: '50%',
          background: 'var(--neutral-100)',
          color: 'var(--neutral-500)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 6,
        }}
      >
        <svg
          width={compact ? 20 : 24}
          height={compact ? 20 : 24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon || (
            <>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </>
          )}
        </svg>
      </span>
      <div
        style={{
          font: `var(--fw-semibold) var(--fs-body-lg)/1.3 var(--font-body)`,
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </div>
      {message && (
        <div
          style={{
            font: `var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)`,
            color: 'var(--text-muted)',
            maxWidth: 360,
            textWrap: 'pretty',
          }}
        >
          {message}
        </div>
      )}
      {action && (
        <div
          style={{
            marginTop: 10,
          }}
        >
          {action}
        </div>
      )}
    </div>
  )
}

import { type CSSProperties, type HTMLAttributes, type MouseEventHandler, type ReactNode } from 'react'
import styles from './Toast.module.css'

/**
 * Toast — transient notification. tone: info | success | warning | danger.
 * Ported verbatim from the design-system source (_ds_bundle.js → components/feedback/Toast.jsx).
 * The dismiss button gets an always-visible focus ring for a11y (DS source omitted it).
 */
export type ToastTone = 'info' | 'success' | 'warning' | 'danger'

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'title'> {
  tone?: ToastTone
  title?: ReactNode
  message?: ReactNode
  onClose?: MouseEventHandler<HTMLButtonElement>
  style?: CSSProperties
}

export function Toast({ tone = 'info', title, message, onClose, style, ...rest }: ToastProps) {
  const tones: Record<ToastTone, { color: string; icon: ReactNode }> = {
    info: {
      color: 'var(--info-500)',
      icon: <path d="M12 16v-4M12 8h.01" />,
    },
    success: {
      color: 'var(--success-500)',
      icon: <path d="M20 6 9 17l-5-5" />,
    },
    warning: {
      color: 'var(--warning-500)',
      icon: (
        <>
          <path d="M12 9v4M12 17h.01" />
          <path d="m21.7 18-9-15.6a1 1 0 0 0-1.7 0l-9 15.6a1 1 0 0 0 .9 1.5h18a1 1 0 0 0 .9-1.5Z" />
        </>
      ),
    },
    danger: {
      color: 'var(--danger-500)',
      icon: <path d="M18 6 6 18M6 6l12 12" />,
    },
  }
  const map = tones[tone]
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        width: 360,
        maxWidth: '90vw',
        padding: '12px 14px',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderLeft: `3px solid ${map.color}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          color: map.color,
          display: 'inline-flex',
          flex: 'none',
          marginTop: 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {tone === 'info' || tone === 'success' || tone === 'danger' ? <circle cx="12" cy="12" r="10" /> : null}
          {map.icon}
        </svg>
      </span>
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {title && (
          <div
            style={{
              font: `var(--fw-semibold) var(--fs-body-md)/1.35 var(--font-body)`,
              color: 'var(--text-primary)',
            }}
          >
            {title}
          </div>
        )}
        {message && (
          <div
            style={{
              font: `var(--fw-regular) var(--fs-body-sm)/1.45 var(--font-body)`,
              color: 'var(--text-secondary)',
              marginTop: 2,
              textWrap: 'pretty',
            }}
          >
            {message}
          </div>
        )}
      </div>
      {onClose && (
        <button
          aria-label="Dismiss"
          onClick={onClose}
          className={styles.focusable}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 2,
            flex: 'none',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

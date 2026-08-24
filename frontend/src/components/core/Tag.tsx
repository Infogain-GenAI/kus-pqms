import { type CSSProperties, type HTMLAttributes, type MouseEventHandler } from 'react'
import styles from './Tag.module.css'

/**
 * Tag — removable / selectable chip (filters, multi-select values).
 * Ported verbatim from the design-system source (_ds_bundle.js → components/core/Tag.jsx).
 * The remove button gets an always-visible focus ring for a11y (DS source omitted it).
 */
export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  onRemove?: MouseEventHandler<HTMLButtonElement>
  selected?: boolean
  disabled?: boolean
  style?: CSSProperties
}

export function Tag({ children, onRemove, selected = false, disabled = false, style, ...rest }: TagProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 4px 0 10px',
        font: `var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)`,
        color: disabled ? 'var(--text-disabled)' : selected ? 'var(--accent-700)' : 'var(--text-secondary)',
        background: selected ? 'var(--accent-50)' : 'var(--neutral-50)',
        border: `1px solid ${selected ? 'var(--accent-300)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-pill)',
        ...(!onRemove && {
          paddingRight: 10,
        }),
        ...style,
      }}
      {...rest}
    >
      {children}
      {onRemove && (
        <button
          aria-label="Remove"
          onClick={onRemove}
          disabled={disabled}
          className={styles.focusable}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16,
            height: 16,
            padding: 0,
            border: 'none',
            borderRadius: '50%',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            lineHeight: 0,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

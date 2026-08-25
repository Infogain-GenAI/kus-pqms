import { useState, type ChangeEventHandler, type CSSProperties, type InputHTMLAttributes } from 'react'
import styles from './SearchField.module.css'

/** SearchField — search input with leading icon and optional clear. Ported verbatim from the DS source. */
export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'size' | 'onChange' | 'value'> {
  value?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  onClear?: () => void
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  style?: CSSProperties
}

export function SearchField({ value, onChange, onClear, placeholder = 'Search…', size = 'md', disabled = false, style, ...rest }: SearchFieldProps) {
  const h = size === 'sm' ? 'var(--control-sm)' : size === 'lg' ? 'var(--control-lg)' : 'var(--control-md)'
  const [focus, setFocus] = useState(false)
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: h,
        background: disabled ? 'var(--disabled-bg)' : 'var(--surface-card)',
        border: `1px solid ${focus ? 'var(--accent-500)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus ? 'var(--shadow-focus)' : 'none',
        transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
        ...style,
      }}
    >
      <span style={{ position: 'absolute', left: 10, display: 'inline-flex', color: 'var(--text-muted)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: '0 32px 0 32px',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          font: 'var(--fw-regular) var(--fs-body-md)/1 var(--font-body)',
          color: 'var(--text-primary)',
        }}
        {...rest}
      />
      {value && onClear && (
        <button
          aria-label="Clear search"
          onClick={onClear}
          className={styles.clear}
          style={{ position: 'absolute', right: 8, display: 'inline-flex', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

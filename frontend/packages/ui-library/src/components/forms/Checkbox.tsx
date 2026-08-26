import { useEffect, useId, useRef, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Checkbox.module.css'

/** Checkbox — supports checked, indeterminate, disabled. Ported verbatim from the DS source. */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style'> {
  label?: ReactNode
  indeterminate?: boolean
  style?: CSSProperties
}

export function Checkbox({ label, checked = false, indeterminate = false, disabled = false, onChange, id, style, className, ...rest }: CheckboxProps) {
  const autoId = useId()
  const rid = id || autoId
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  const on = checked || indeterminate
  return (
    <label
      htmlFor={rid}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
        ...style,
      }}
    >
      <span style={{ position: 'relative', display: 'inline-flex', flex: 'none' }}>
        <input
          ref={ref}
          id={rid}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className={[styles.input, className].filter(Boolean).join(' ')}
          style={{ position: 'absolute', opacity: 0, width: 18, height: 18, margin: 0, cursor: 'inherit' }}
          {...rest}
        />
        <span
          aria-hidden
          className={styles.box}
          style={{
            width: 18,
            height: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            background: disabled ? 'var(--disabled-bg)' : on ? 'var(--kia-midnight)' : 'var(--surface-card)',
            border: `1.5px solid ${disabled ? 'var(--border-default)' : on ? 'var(--kia-midnight)' : 'var(--border-strong)'}`,
            color: 'var(--neutral-0)',
            transition: 'all var(--dur-fast)',
          }}
        >
          {indeterminate ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
              <path d="M5 12h14" />
            </svg>
          ) : checked ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : null}
        </span>
      </span>
      {label && <span style={{ font: 'var(--fw-regular) var(--fs-body-md)/1.3 var(--font-body)' }}>{label}</span>}
    </label>
  )
}

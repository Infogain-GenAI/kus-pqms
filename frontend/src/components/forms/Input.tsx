import { useId, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react'
import { labelStyle } from './labelStyle'

/**
 * Input — text field with label, helper, and validation states.
 * state: default | error | success | disabled. Ported verbatim from the DS source.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'size'> {
  label?: ReactNode
  helper?: ReactNode
  error?: ReactNode
  success?: ReactNode
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  iconLeft?: ReactNode
  style?: CSSProperties
}

export function Input({ label, helper, error, success, required = false, size = 'md', iconLeft = null, disabled = false, id, style, ...rest }: InputProps) {
  const autoId = useId()
  const rid = id || autoId
  const h = size === 'sm' ? 'var(--control-sm)' : size === 'lg' ? 'var(--control-lg)' : 'var(--control-md)'
  const [focus, setFocus] = useState(false)
  const invalid = !!error
  const valid = !invalid && !!success
  const borderColor = invalid ? 'var(--danger-500)' : valid ? 'var(--success-500)' : focus ? 'var(--accent-500)' : 'var(--border-default)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label htmlFor={rid} style={labelStyle}>
          {label}
          {required && <span style={{ color: 'var(--danger-500)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {iconLeft && (
          <span style={{ position: 'absolute', left: 10, display: 'inline-flex', color: 'var(--text-muted)', pointerEvents: 'none' }}>{iconLeft}</span>
        )}
        <input
          id={rid}
          disabled={disabled}
          aria-invalid={invalid}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: '100%',
            height: h,
            boxSizing: 'border-box',
            padding: iconLeft ? (valid ? '0 34px 0 34px' : '0 12px 0 34px') : valid ? '0 34px 0 12px' : '0 12px',
            font: 'var(--fw-regular) var(--fs-body-md)/1 var(--font-body)',
            color: 'var(--text-primary)',
            background: disabled ? 'var(--disabled-bg)' : 'var(--surface-card)',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            boxShadow: focus && !invalid && !valid ? 'var(--shadow-focus)' : 'none',
            cursor: disabled ? 'not-allowed' : 'text',
            transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
          }}
          {...rest}
        />
        {valid && (
          <span style={{ position: 'absolute', right: 10, display: 'inline-flex', color: 'var(--success-500)', pointerEvents: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        )}
      </div>
      {(error || success || helper) && (
        <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: invalid ? 'var(--danger-500)' : valid ? 'var(--success-600)' : 'var(--text-muted)' }}>
          {error || success || helper}
        </span>
      )}
    </div>
  )
}

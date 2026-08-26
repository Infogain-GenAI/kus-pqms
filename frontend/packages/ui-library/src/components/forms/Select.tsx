import { useId, useState, type CSSProperties, type ReactNode, type SelectHTMLAttributes } from 'react'
import { labelStyle } from './labelStyle'

/** Select — native dropdown styled to the system, with label / helper / error. Ported verbatim from the DS source. */
export type SelectOption = string | { value: string; label: string }

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'style' | 'size'> {
  label?: ReactNode
  helper?: ReactNode
  error?: ReactNode
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  options?: SelectOption[]
  placeholder?: string
  style?: CSSProperties
}

export function Select({ label, helper, error, required = false, size = 'md', options = [], placeholder, disabled = false, id, style, children, ...rest }: SelectProps) {
  const autoId = useId()
  const rid = id || autoId
  const h = size === 'sm' ? 'var(--control-sm)' : size === 'lg' ? 'var(--control-lg)' : 'var(--control-md)'
  const [focus, setFocus] = useState(false)
  const invalid = !!error
  const borderColor = invalid ? 'var(--danger-500)' : focus ? 'var(--accent-500)' : 'var(--border-default)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label htmlFor={rid} style={labelStyle}>
          {label}
          {required && <span style={{ color: 'var(--danger-500)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          id={rid}
          disabled={disabled}
          aria-invalid={invalid}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: '100%',
            height: h,
            boxSizing: 'border-box',
            appearance: 'none',
            padding: '0 34px 0 12px',
            font: 'var(--fw-regular) var(--fs-body-md)/1 var(--font-body)',
            color: 'var(--text-primary)',
            background: disabled ? 'var(--disabled-bg)' : 'var(--surface-card)',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            boxShadow: focus && !invalid ? 'var(--shadow-focus)' : 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
          }}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const val = typeof o === 'string' ? o : o.value
            const lbl = typeof o === 'string' ? o : o.label
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            )
          })}
          {children}
        </select>
        <svg
          style={{ position: 'absolute', right: 'var(--space-3)', pointerEvents: 'none', color: 'var(--text-disabled)' }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {(error || helper) && (
        <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: invalid ? 'var(--danger-500)' : 'var(--text-muted)' }}>
          {error || helper}
        </span>
      )}
    </div>
  )
}

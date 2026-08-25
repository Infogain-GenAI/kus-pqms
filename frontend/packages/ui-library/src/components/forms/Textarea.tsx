import { useId, useState, type CSSProperties, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { labelStyle } from './labelStyle'

/** Textarea — multi-line field with label / helper / error. Ported verbatim from the DS source. */
export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  label?: ReactNode
  helper?: ReactNode
  error?: ReactNode
  required?: boolean
  style?: CSSProperties
}

export function Textarea({ label, helper, error, required = false, rows = 4, disabled = false, id, style, ...rest }: TextareaProps) {
  const autoId = useId()
  const rid = id || autoId
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
      <textarea
        id={rid}
        rows={rows}
        disabled={disabled}
        aria-invalid={invalid}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 12px',
          resize: 'vertical',
          font: 'var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)',
          color: 'var(--text-primary)',
          background: disabled ? 'var(--disabled-bg)' : 'var(--surface-card)',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          boxShadow: focus && !invalid ? 'var(--shadow-focus)' : 'none',
          transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
        }}
        {...rest}
      />
      {(error || helper) && (
        <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: invalid ? 'var(--danger-500)' : 'var(--text-muted)' }}>
          {error || helper}
        </span>
      )}
    </div>
  )
}

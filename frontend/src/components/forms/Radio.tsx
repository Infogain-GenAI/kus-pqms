import { useId, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Radio.module.css'

/** Radio — single selection within a group (share a `name`). Ported verbatim from the DS source. */
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style'> {
  label?: ReactNode
  style?: CSSProperties
}

export function Radio({ label, checked = false, disabled = false, onChange, name, value, id, style, className, ...rest }: RadioProps) {
  const autoId = useId()
  const rid = id || autoId
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
          id={rid}
          type="radio"
          name={name}
          value={value}
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
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: disabled ? 'var(--disabled-bg)' : 'var(--surface-card)',
            border: `1.5px solid ${disabled ? 'var(--border-default)' : checked ? 'var(--kia-midnight)' : 'var(--border-strong)'}`,
            transition: 'all var(--dur-fast)',
          }}
        >
          {checked && (
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: disabled ? 'var(--text-disabled)' : 'var(--kia-midnight)' }} />
          )}
        </span>
      </span>
      {label && <span style={{ font: 'var(--fw-regular) var(--fs-body-md)/1.3 var(--font-body)' }}>{label}</span>}
    </label>
  )
}

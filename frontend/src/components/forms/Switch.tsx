import { useId, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Switch.module.css'

/** Switch — on/off toggle for immediate settings. Ported verbatim from the DS source. */
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'size'> {
  label?: ReactNode
  size?: 'sm' | 'md'
  style?: CSSProperties
}

export function Switch({ label, checked = false, disabled = false, onChange, size = 'md', id, style, className, ...rest }: SwitchProps) {
  const autoId = useId()
  const rid = id || autoId
  const dims = size === 'sm' ? { w: 32, h: 18, k: 14 } : { w: 40, h: 22, k: 18 }
  return (
    <label
      htmlFor={rid}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
        ...style,
      }}
    >
      <span style={{ position: 'relative', display: 'inline-flex', flex: 'none' }}>
        <input
          id={rid}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className={[styles.input, className].filter(Boolean).join(' ')}
          style={{ position: 'absolute', opacity: 0, width: dims.w, height: dims.h, margin: 0, cursor: 'inherit' }}
          {...rest}
        />
        <span
          aria-hidden
          className={styles.track}
          style={{
            width: dims.w,
            height: dims.h,
            borderRadius: 'var(--radius-pill)',
            background: disabled ? 'var(--neutral-200)' : checked ? 'var(--kia-midnight)' : 'var(--neutral-300)',
            transition: 'background var(--dur-base) var(--ease-standard)',
            display: 'inline-block',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: 2,
              width: dims.k,
              height: dims.k,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: 'var(--shadow-xs)',
              transform: checked ? `translateX(${dims.w - dims.k - 4}px)` : 'translateX(0)',
              transition: 'transform var(--dur-base) var(--ease-standard)',
            }}
          />
        </span>
      </span>
      {label && <span style={{ font: 'var(--fw-regular) var(--fs-body-md)/1.3 var(--font-body)' }}>{label}</span>}
    </label>
  )
}

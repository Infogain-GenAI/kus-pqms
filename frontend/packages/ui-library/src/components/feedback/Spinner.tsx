import { type CSSProperties, type HTMLAttributes } from 'react'

/**
 * Spinner — indeterminate loading indicator.
 * Ported verbatim from the design-system source (_ds_bundle.js → components/feedback/Spinner.jsx),
 * including the one-time global `kia-spin` keyframe injection the inline animation relies on.
 */
export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  size?: number
  thickness?: number
  color?: string
  label?: string
  style?: CSSProperties
}

export function Spinner({ size = 20, thickness = 2.5, color = 'var(--accent-500)', label, style, ...rest }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label || 'Loading'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'inline-block',
          border: `${thickness}px solid var(--neutral-200)`,
          borderTopColor: color,
          animation: 'kia-spin 0.7s linear infinite',
        }}
      />
      {label && (
        <span
          style={{
            font: `var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)`,
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </span>
      )}
    </span>
  )
}

if (typeof document !== 'undefined' && !document.getElementById('kia-spin-kf')) {
  const st = document.createElement('style')
  st.id = 'kia-spin-kf'
  st.textContent = '@keyframes kia-spin{to{transform:rotate(360deg)}}'
  document.head.appendChild(st)
}

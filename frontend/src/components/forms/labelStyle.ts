import type { CSSProperties } from 'react'

// Shared field-label style, ported from the design-system source
// (_ds_bundle.js → components/forms/Input.jsx `labelStyle`, reused by Select/Textarea).
export const labelStyle: CSSProperties = {
  font: 'var(--fw-semibold) var(--fs-caption)/1.3 var(--font-body)',
  letterSpacing: '0.02em',
  color: 'var(--text-secondary)',
}

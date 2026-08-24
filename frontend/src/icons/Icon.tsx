import type { LucideIcon, LucideProps } from 'lucide-react'

/**
 * Icon — the single Lucide wrapper for the app.
 * Applies the design-system defaults: 1.75px stroke (--icon-stroke), 16px inline
 * size (--icon-sm), currentColor. Pass a Lucide component via `icon` so bundling
 * stays tree-shaken (never import the whole icon set).
 *
 *   import { AlertTriangle } from 'lucide-react'
 *   <Icon icon={AlertTriangle} size={20} label="Escalated" />
 */
export interface IconProps extends Omit<LucideProps, 'ref'> {
  icon: LucideIcon
  /** Accessible label. When omitted the icon is decorative (aria-hidden). */
  label?: string
}

export function Icon({ icon: LucideGlyph, size = 16, strokeWidth = 1.75, label, ...rest }: IconProps) {
  return (
    <LucideGlyph
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
      {...rest}
    />
  )
}

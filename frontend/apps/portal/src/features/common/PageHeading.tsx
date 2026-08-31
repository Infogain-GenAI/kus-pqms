import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Button, Icon } from '@pqms/ui-library'

export interface PageHeadingAction {
  label: ReactNode
  icon?: LucideIcon
  onClick: () => void
  disabled?: boolean
}

export interface PageHeadingProps {
  title: ReactNode
  subtitle?: ReactNode
  /** Rendered first (left of primaryAction), styled secondary — e.g. "Export". */
  secondaryAction?: PageHeadingAction
  showSecondaryAction?: boolean
  /** Rendered last, styled primary — e.g. "New issue". */
  primaryAction?: PageHeadingAction
  showPrimaryAction?: boolean
}

/** Title + description row with up to two flag-gated action buttons, per the list-screen header. */
export function PageHeading({
  title,
  subtitle,
  secondaryAction,
  showSecondaryAction = true,
  primaryAction,
  showPrimaryAction = true,
}: PageHeadingProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
      <div>
        <h1 style={{ margin: 0, font: 'var(--fw-bold) 30px/1.15 var(--font-display)', letterSpacing: 'var(--ls-h1)', color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p style={{ margin: 'var(--space-2) 0 0', font: 'var(--fw-regular) var(--fs-body-md)/1 var(--font-body)', color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {(showSecondaryAction && secondaryAction) || (showPrimaryAction && primaryAction) ? (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {showSecondaryAction && secondaryAction && (
            <Button
              variant="secondary"
              iconLeft={secondaryAction.icon ? <Icon icon={secondaryAction.icon} size={16} /> : undefined}
              disabled={secondaryAction.disabled}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
          {showPrimaryAction && primaryAction && (
            <Button
              iconLeft={primaryAction.icon ? <Icon icon={primaryAction.icon} size={16} /> : undefined}
              disabled={primaryAction.disabled}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}

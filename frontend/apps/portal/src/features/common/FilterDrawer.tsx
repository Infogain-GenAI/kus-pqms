import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button, Icon } from '@pqms/ui-library'
import { DrawerShell } from './DrawerShell'

export interface FilterDrawerProps {
  icon: LucideIcon
  title: string
  subtitle: string
  onClose: () => void
  onApply: () => void
  onReset: () => void
  resetLabel: ReactNode
  applyLabel: ReactNode
  children: ReactNode
}

/** DrawerShell pre-wired with the Filters drawer's Reset/Apply footer; filter fields are passed as children. */
export function FilterDrawer({ icon, title, subtitle, onClose, onApply, onReset, resetLabel, applyLabel, children }: FilterDrawerProps) {
  return (
    <DrawerShell
      icon={icon}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" iconLeft={<Icon icon={RotateCcw} size={16} />} onClick={onReset}>{resetLabel}</Button>
          <Button style={{ flex: 1 }} onClick={onApply}>{applyLabel}</Button>
        </>
      }
    >
      {children}
    </DrawerShell>
  )
}

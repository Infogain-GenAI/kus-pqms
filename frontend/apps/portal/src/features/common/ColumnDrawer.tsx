import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button, Checkbox, Icon } from '@pqms/ui-library'
import { drawerLabel, DrawerShell } from './DrawerShell'

export interface ColumnDrawerColumn {
  key: string
  label: ReactNode
  required?: boolean
}

export interface ColumnDrawerProps {
  icon: LucideIcon
  title: string
  subtitle: string
  onClose: () => void
  defaultSectionLabel: ReactNode
  defaultSectionColumns: ColumnDrawerColumn[]
  optionalSectionLabel: ReactNode
  optionalColumns: ColumnDrawerColumn[]
  selectAllLabel: ReactNode
  requiredBadgeLabel: ReactNode
  visible: string[]
  onVisibleChange: (next: string[]) => void
  restoreDefaultLabel: ReactNode
  onRestoreDefault: () => void
  applyLabel: ReactNode
  onApply: () => void
}

/** Show/hide-columns drawer: a required default section plus a toggleable optional section with select-all. */
export function ColumnDrawer({
  icon,
  title,
  subtitle,
  onClose,
  defaultSectionLabel,
  defaultSectionColumns,
  optionalSectionLabel,
  optionalColumns,
  selectAllLabel,
  requiredBadgeLabel,
  visible,
  onVisibleChange,
  restoreDefaultLabel,
  onRestoreDefault,
  applyLabel,
  onApply,
}: ColumnDrawerProps) {
  const toggle = (key: string, checked: boolean) => onVisibleChange(checked ? [...visible, key] : visible.filter((x) => x !== key))
  return (
    <DrawerShell
      icon={icon}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" iconLeft={<Icon icon={RotateCcw} size={16} />} onClick={onRestoreDefault}>{restoreDefaultLabel}</Button>
          <Button style={{ flex: 1 }} onClick={onApply}>{applyLabel}</Button>
        </>
      }
    >
      <div style={{ ...drawerLabel, padding: '16px 0 10px' }}>{defaultSectionLabel}</div>
      {defaultSectionColumns.map((c) => (
        <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
          <Checkbox
            disabled={c.required}
            checked={c.required || visible.includes(c.key)}
            onChange={(e) => toggle(c.key, e.target.checked)}
            label={c.label}
            style={c.required ? { color: 'var(--text-primary)' } : undefined}
          />
          {c.required && <span style={{ font: 'var(--fw-bold) 9.5px/1 var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-disabled)', background: 'var(--neutral-50)', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '3px 7px' }}>{requiredBadgeLabel}</span>}
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 10px' }}>
        <span style={drawerLabel}>{optionalSectionLabel}</span>
        <Checkbox
          checked={optionalColumns.every((c) => visible.includes(c.key))}
          onChange={(e) => onVisibleChange(e.target.checked ? Array.from(new Set([...visible, ...optionalColumns.map((c) => c.key)])) : visible.filter((x) => !optionalColumns.some((c) => c.key === x)))}
          label={<span style={{ font: 'var(--fw-bold) 10.5px/1 var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{selectAllLabel}</span>}
        />
      </div>
      {optionalColumns.map((c) => (
        <div key={c.key} style={{ padding: 'var(--space-2) 0' }}>
          <Checkbox checked={visible.includes(c.key)} onChange={(e) => toggle(c.key, e.target.checked)} label={c.label} />
        </div>
      ))}
    </DrawerShell>
  )
}

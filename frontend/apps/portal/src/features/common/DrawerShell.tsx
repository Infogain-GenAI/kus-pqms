import { type ReactNode } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '@pqms/ui-library'
import { IconChip } from '@/app/chrome'

/** Uppercase micro-label style shared by every drawer's field labels and section headings
 * (Filters' field labels, Columns' "Default columns"/"Optional columns" headings) — one
 * declaration so the two drawers' content cannot drift into two near-identical literals. */
export const drawerLabel = { font: 'var(--fw-bold) 11px/1.35 var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)' } as const

/** Right-side drawer shell (452px sheet, scrim, header icon chip + title/subtitle + close, pinned footer). Used by the Filters and Columns drawers. */
export function DrawerShell({ icon, title, subtitle, onClose, footer, children }: { icon: LucideIcon; title: string; subtitle: string; onClose: () => void; footer: ReactNode; children: ReactNode }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(5,20,31,.34)' }} />
      <div role="dialog" aria-label={title} style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 121, width: 452, maxWidth: '94vw', background: 'var(--surface-card)', boxShadow: '-14px 0 44px rgba(5,20,31,.20)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', padding: '18px 22px', borderBottom: 'var(--border-width) solid var(--border-subtle)', flex: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <IconChip icon={icon} tint="#F1F4F7" color="var(--kia-midnight)" size={34} iconSize={18} />
            <div>
              <div style={{ font: 'var(--fw-bold) 15.5px/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{title}</div>
              <div style={{ marginTop: 1, font: 'var(--fw-regular) 11.5px/1.2 var(--font-body)', color: 'var(--text-disabled)' }}>{subtitle}</div>
            </div>
          </div>
          <button aria-label="Close" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', color: 'var(--text-secondary)', cursor: 'pointer', flex: 'none' }}>
            <Icon icon={X} size={18} />
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '4px 22px 18px' }}>{children}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '14px 22px', borderTop: 'var(--border-width) solid var(--border-subtle)', flex: 'none', background: 'var(--bg-app)' }}>{footer}</div>
      </div>
    </>
  )
}

/** Collapsible labeled section inside a DrawerShell (e.g. Vehicle / Classification / Issue). */
export function DrawerSection({ icon, label, open, onToggle, children }: { icon: LucideIcon; label: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <>
      <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: 'var(--space-4) 0 var(--space-2)', border: 'none', background: 'none', cursor: 'pointer' }}>
        <Icon icon={icon} size={15} style={{ color: 'var(--kia-midnight)', flex: 'none' }} />
        <span style={{ font: 'var(--fw-bold) 12px/1 var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ flex: 1 }} />
        <Icon icon={open ? ChevronUp : ChevronDown} size={16} style={{ color: 'var(--text-disabled)' }} />
      </button>
      {open && <div style={{ paddingBottom: 6 }}>{children}</div>}
      <div style={{ height: 'var(--border-width)', background: 'var(--border-subtle)', margin: '6px 0' }} />
    </>
  )
}

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '@pqms/ui-library'
import styles from './IssueDetailSection.module.css'

/**
 * One section of the Issue Detail tab's single card.
 *
 * Ported from `IssueDetailSection.vue`. Deliberately NOT a `SectionCard`
 * variant, for the same reason Vue kept it out of its own `BaseCard`:
 * `SectionCard` is the shared "one card per block" primitive used across every
 * screen, and this "four sections inside one surface" treatment is specific to
 * this tab. Making it a SectionCard mode would push a tab-local layout decision
 * into a shared component that six other screens depend on.
 *
 * `name` is a stable section key. The Vue file notes its section-order test
 * asserts on exactly this, so it is carried over rather than dropped as
 * decoration — it is the hook any equivalent test here would use.
 */
export function IssueDetailSection({
  name,
  title,
  icon,
  subtitle,
  action,
  children,
}: {
  name: string
  title: ReactNode
  icon: LucideIcon
  subtitle?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className={styles.section} data-section={name}>
      <header className={styles.header}>
        <span className={styles.badge} aria-hidden>
          <Icon icon={icon} size={16} />
        </span>
        <div className={styles.heading}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {action && <div className={styles.action}>{action}</div>}
      </header>
      {children}
    </section>
  )
}

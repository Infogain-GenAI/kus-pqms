import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '@pqms/ui-library'
import type { ResolutionTone } from './resolution'
import styles from './resolution.module.css'

/**
 * The chrome every Resolution panel shares: a tinted tile, a title with an
 * optional system-code chip, a description, and a full-bleed rule above the body.
 *
 * Ported from `ResolutionSectionPanel.vue`.
 *
 * ITS TILE IS THE SAME OBJECT AS THE SELECTOR CARD'S — same size, same radius,
 * same tone — which is why both read their tints from one stylesheet rather than
 * each carrying a copy.
 */
export function ResolutionSectionPanel({
  name,
  icon,
  tone,
  title,
  description,
  code,
  children,
}: {
  name: string
  icon: LucideIcon
  tone: ResolutionTone
  title: string
  description: string
  /** System code chip, e.g. ISM0080. Only some panels have one. */
  code?: string
  children: ReactNode
}) {
  return (
    <section className={styles.panel} data-section={name} data-testid={`resolution-panel-${name}`}>
      <header className={styles.panelHeader}>
        <span className={styles.tile} data-tone={tone} aria-hidden>
          <Icon icon={icon} size={20} />
        </span>
        <div className={styles.panelHeading}>
          <div className={styles.panelTitleRow}>
            <h3 className={styles.panelTitle}>{title}</h3>
            {code && <span className={styles.panelCode} data-testid="resolution-panel-code">{code}</span>}
          </div>
          <p className={styles.panelDescription}>{description}</p>
        </div>
      </header>
      <div className={styles.panelBody}>{children}</div>
    </section>
  )
}

/** The centred tile-and-copy empty state three of the four panels use. */
export function ResolutionEmptyState({
  icon,
  title,
  body,
  action,
  testId,
}: {
  icon: LucideIcon
  title: string
  body: string
  action?: ReactNode
  testId?: string
}) {
  return (
    <div className={styles.empty} data-testid={testId}>
      <span className={styles.emptyGlyph} aria-hidden>
        <Icon icon={icon} size={28} />
      </span>
      <div className={styles.emptyTitle}>{title}</div>
      <div className={styles.emptyBody}>{body}</div>
      {action}
    </div>
  )
}

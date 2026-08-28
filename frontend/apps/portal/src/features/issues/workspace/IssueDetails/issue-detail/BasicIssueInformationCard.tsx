import { FileText } from 'lucide-react'
import { ULabel } from '@/app/chrome'
import { dtcCategory, dtcCategoryName } from '@/data/dtcCategory'
import type { Issue } from '@/data/types'
import { IssueDetailSection } from './IssueDetailSection'
import styles from './fields.module.css'

/**
 * Ported from `BasicIssueInformationCard.vue`.
 *
 * TWO THINGS THIS ADDS over the React card it replaces, both from the Vue side:
 *
 *  - The DTC codes are CATEGORY-TINTED CHIPS, not plain neutral pills. The
 *    category comes from each code's own first character (see `dtcCategory`),
 *    and the chip shows the category name beside the code — so "P0301" reads as
 *    Powertrain at a glance instead of as an opaque string.
 *  - The description and DTC blocks are one section of the shared card surface
 *    rather than a standalone card.
 *
 * The empty-state copy and the "DTC / trouble codes" heading are unchanged from
 * the React card — which already matched Vue's verbatim, since both trace to
 * the same prototype.
 */
export function BasicIssueInformationCard({ issue }: { issue: Issue }) {
  const codes = issue.dtcCodes ?? []
  return (
    <IssueDetailSection name="basic-issue-information" title="Basic issue information" icon={FileText}>
      <div className={styles.field}>
        <ULabel>Description</ULabel>
        <p className={styles.description} data-testid="issue-description">{issue.description || '—'}</p>
      </div>

      <div className={styles.field}>
        <ULabel>DTC / trouble codes</ULabel>
        {codes.length > 0 ? (
          <div className={styles.pills} data-testid="dtc-chips">
            {codes.map((code) => {
              const cat = dtcCategory(code)
              return (
                <span key={code} className={styles.dtcChip} data-cat={cat} data-testid="dtc-chip">
                  {code}
                  <span className={styles.dtcChipCat}>{dtcCategoryName(cat)}</span>
                </span>
              )
            })}
          </div>
        ) : (
          <p className={styles.empty} data-testid="dtc-empty">
            No diagnostic trouble codes captured for this issue.
          </p>
        )}
      </div>
    </IssueDetailSection>
  )
}

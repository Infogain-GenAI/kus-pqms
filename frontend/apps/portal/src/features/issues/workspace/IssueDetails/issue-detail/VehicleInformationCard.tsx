import { Car } from 'lucide-react'
import type { Issue } from '@/data/types'
import { IssueDetailSection } from './IssueDetailSection'
import styles from './VehicleInformationCard.module.css'

/**
 * Ported from `VehicleInformationCard.vue`.
 *
 * ONE ROW PER MODEL CODE, each carrying its own model years. The React card
 * this replaces rendered a single row with every code comma-joined into one
 * cell and one shared year — which cannot express the case the Vue version
 * exists for, and which the "Selected model year(s)" column header already
 * promised.
 *
 * `Car`, not `CarFront` — the prototype's badge is `data-lucide="car"`, a
 * distinct glyph. The Vue file records correcting exactly this.
 *
 * Per-code years are not in this app's `Issue` yet (Vue reads
 * `modelYearsByCode`, falling back to the flat list per code). Until that field
 * exists the flat `modelYear` is shown against every code — the same fallback
 * Vue's own `modelYearsForCode` applies, so the table is correct today and
 * gains real per-code years the moment the field lands.
 */
export function VehicleInformationCard({ issue }: { issue: Issue }) {
  const codes = issue.modelCodes?.length ? issue.modelCodes : [issue.modelCode]
  const yearsFor = (_code: string): number[] => (issue.modelYear ? [issue.modelYear] : [])

  return (
    <IssueDetailSection name="vehicle-information" title="Vehicle information" icon={Car}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Model code</th>
            <th scope="col">Selected model year(s)</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((code) => {
            const years = yearsFor(code)
            return (
              <tr key={code} data-testid="model-year-row">
                <td className={styles.code} data-testid="model-year-code">{code}</td>
                <td>
                  {years.length === 0 ? (
                    <span className={styles.noYears}>No model years selected</span>
                  ) : (
                    years.map((year) => (
                      <span key={year} className={styles.year} data-testid="model-year-value">
                        {year}
                      </span>
                    ))
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </IssueDetailSection>
  )
}

import { GitFork } from 'lucide-react'
import { ULabel } from '@/app/chrome'
import type { Issue } from '@/data/types'
import { IssueDetailSection } from './IssueDetailSection'
import styles from './fields.module.css'

/**
 * Ported from `SystemClassificationCard.vue`.
 *
 * `GitFork`, not `Network` — the prototype's badge is `data-lucide="git-fork"`,
 * a distinct glyph. The Vue file records correcting exactly this.
 *
 * The four-column description list is Vue's `BaseDescriptionList
 * :columns="4" uppercase-labels`. Here that is the existing `ULabel` plus a
 * four-column grid, which is what the React card this replaces already did —
 * keeping it avoids adding a description-list primitive to `ui-library` for one
 * call site, and `ULabel` is already the uppercase-label convention on this tab.
 *
 * The em-dash placeholder for an unset level is Vue's own `notSet` message.
 */
export function SystemClassificationCard({ issue }: { issue: Issue }) {
  const fields: [string, string | undefined, string][] = [
    ['System', issue.system, 'classification-system'],
    ['Sub-system', issue.subSystem, 'classification-subsystem'],
    ['Component', issue.component, 'classification-component'],
    ['Symptom', issue.symptom, 'classification-symptom'],
  ]
  return (
    <IssueDetailSection name="system-classification" title="System classification" icon={GitFork}>
      <div className={styles.grid4}>
        {fields.map(([label, value, testId]) => (
          <div key={label}>
            <ULabel>{label}</ULabel>
            <div className={value ? styles.value : styles.valueEmpty} data-testid={testId}>
              {value ?? '—'}
            </div>
          </div>
        ))}
      </div>
    </IssueDetailSection>
  )
}

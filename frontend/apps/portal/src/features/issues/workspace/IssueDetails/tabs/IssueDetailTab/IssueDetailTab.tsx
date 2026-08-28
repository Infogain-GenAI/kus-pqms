import type { SourceChannel } from '@/data/sourceChannels'
import type { Issue } from '@/data/types'
import { BasicIssueInformationCard } from '../../issue-detail/BasicIssueInformationCard'
import { IssueSourceCard } from '../../issue-detail/IssueSourceCard'
import { SystemClassificationCard } from '../../issue-detail/SystemClassificationCard'
import { VehicleInformationCard } from '../../issue-detail/VehicleInformationCard'
import styles from './IssueDetailTab.module.css'

/**
 * The Issue Detail tab — ONE card, exactly four sections, in this order.
 *
 * Ported from `IssueDetailTab.vue`.
 *
 * A THIN WRAPPER, DELIBERATELY. `01-project-structure-and-architecture.md`'s
 * feature-folder depth rule requires it: "if a screen has real tabs, tab folders
 * stay thin wrapper components only — the actual components live in their
 * sub-area folder and get imported by the tab wrapper, never duplicated into the
 * tab folder." That rule cites this exact Vue folder as its provenance, so the
 * cards live in the sibling `issue-detail/` folder and this file only orders
 * them.
 *
 * WHOLE-RECORD EDITING IS NOT HERE. "Edit issue" is a full-page mode owned by
 * the section shell, because it replaces this tab entirely and suppresses the
 * right rail. This tab keeps only the section-scoped Issue-source save — the two
 * are separate save surfaces and the source one has its own button.
 *
 * `IssueSummaryCard` and `EvidenceAttachmentsCard` exist in the Vue folder but
 * are NOT mounted there either; they were dropped from this tab and their files
 * retained pending deletion sign-off. They are not ported, because porting an
 * unmounted component would import that ambiguity rather than resolve it.
 */
export function IssueDetailTab({
  issue,
  channels,
  canEdit,
  onSaveSources,
}: {
  issue: Issue
  channels: SourceChannel[]
  canEdit: boolean
  onSaveSources: (channels: SourceChannel[]) => void
}) {
  return (
    <div className={styles.cards} data-testid="issue-detail-tab">
      <VehicleInformationCard issue={issue} />
      <SystemClassificationCard issue={issue} />
      <BasicIssueInformationCard issue={issue} />
      <IssueSourceCard issue={issue} channels={channels} canEdit={canEdit} onSave={onSaveSources} />
    </div>
  )
}

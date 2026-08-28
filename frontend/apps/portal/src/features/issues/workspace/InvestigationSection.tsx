import { InvestigationTab } from './IssueDetails/tabs/InvestigationTab/InvestigationTab'
import { useWorkspace } from './context'

// Route target for /issues/:id/investigation.
//
// WHAT THIS FILE IS NOW. It was the whole tab — the workstream toggle, the
// Add-activity form, the timeline and the parts panel, all inline. Those moved
// to IssueDetails/investigation/, ported from the Vue implementation, and this
// file is the route boundary: it reads the workspace context and hands the two
// values the tab needs down.
//
// The two kinds of tab strip still coexist deliberately, and the reason is
// unchanged: the workspace SECTIONS are routes because a section is a place;
// the Activities/Parts pill inside this one is component state because it
// filters what a single section shows. 07's rule and this are the same rule.

export function InvestigationSection() {
  const { issueId, canPropose } = useWorkspace()
  return <InvestigationTab issueId={issueId} canEdit={canPropose} />
}

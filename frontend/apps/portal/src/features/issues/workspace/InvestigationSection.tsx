import { CLOSED_NOTES } from '@/data/issueLock'
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
//
// ─── THIS SECTION IS WHY THE LOCK WAS EXTRACTED ──────────────────────────────
//
// It used to read `canEdit={canPropose}` — a capability check with NO status
// check at all. On a Closed issue a proposer could still record activities,
// raise part requests and file change requests against a settled record, and
// nothing on screen said otherwise. That is the failure mode the lock exists to
// make impossible to reproduce by omission: the rule now has one definition, and
// a surface either ANDs it in or visibly does not.

export function InvestigationSection() {
  const { issueId, canPropose, lock } = useWorkspace()

  /*
   * The two halves of the gate, ANDed here rather than folded into one flag
   * upstream — see `@/data/issueLock`. The tab gets a single boolean because it
   * only needs to know whether to accept input; the NOTES below are what tell
   * the user which half stopped them, and they are supplied only for the lock.
   *
   * WHY THE NOTES ARE PASSED IN AND NOT DECIDED BY THE FORMS: both closed-notes
   * already existed in this codebase, rendered on `!canEdit`. Because `canEdit`
   * was a permission flag, a read-only ROLE looking at an OPEN issue was told
   * "this issue is closed" — copy that named the wrong cause entirely. A form
   * cannot fix that on its own: it is handed one boolean and cannot see why it
   * is false. So the section, which can see both halves, hands down the sentence
   * for the case it actually knows to be true, and passes nothing otherwise.
   */
  return (
    <InvestigationTab
      issueId={issueId}
      canEdit={canPropose && lock.isEditable}
      activityNote={lock.isClosed ? CLOSED_NOTES.activity : undefined}
      partRequestNote={lock.isClosed ? CLOSED_NOTES.partRequest : undefined}
    />
  )
}

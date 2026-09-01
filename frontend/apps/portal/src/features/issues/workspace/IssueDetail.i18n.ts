import { registerMessages, type ComponentI18nMessages } from '@/i18n'

/**
 * Issue Detail messages — the workspace shell, its four modals and the edit form.
 *
 * One namespace for the whole workspace surface. The modals in `modals.tsx` are
 * opened only by this shell and hold none of their own state; the edit form is a
 * mode of one section. Giving each its own namespace would mean four files to
 * search for one screen's vocabulary — and it is that vocabulary being scattered
 * that hid the inconsistencies noted below.
 *
 * ─── THREE VOCABULARIES FOR ONE IDEA, PRESERVED VERBATIM ─────────────────────
 *
 * Collecting these surfaced real drift. All of it is carried across unchanged —
 * this migration moves copy, it does not change what users see — and flagged so
 * it can be decided on rather than rediscovered:
 *
 *   · `shellChangeStatus` "Change status" vs the Issue List's "Change Status".
 *   · Three DTC labels: `editModalDtc` (singular, "· optional · comma-separated"),
 *     `editFormDtc` (PLURAL, with a separate hint line), and Issue Entry's
 *     "· optional".
 *   · `editFormSameExisting` "Same existing issues" vs Issue Entry's
 *     "Same Existing Issues".
 *   · `* ` baked into several labels while sibling required fields use a styled
 *     span.
 */

export const NS = 'IssueDetail'

const messages: ComponentI18nMessages = {
  en: {
    /*
     * ONE KEY, NOT A LEAD/TAIL PAIR. This was `"Issue" {id} "was not found."` —
     * two text nodes with the id between them, which a translator cannot reorder
     * and which reads as fragments in the source. Interpolation is what the
     * library is for.
     */
    /*
     * ─── History date filter ─────────────────────────────────────────────────
     *
     * The six quick-range labels live here rather than in the component, so the
     * one place a translator looks for this screen's vocabulary holds all of it.
     *
     * ⚠️ THE KEYS ARE NOT THE LABELS. `historyRangeLast7` rather than
     * `historyRangeLast7Days`: the preset's IDENTITY is "seven days back", and a
     * key that encodes the English wording has to be renamed the moment a locale
     * phrases it differently — which is the rename nobody makes, leaving a key
     * that says one thing and a value that says another.
     */
    historyDateLabel: 'Date:',
    historyQuickRanges: 'Quick ranges',
    historyRangeAll: 'All time',
    historyRangeLast7: 'Last 7 days',
    historyRangeLast30: 'Last 30 days',
    historyRangeLast90: 'Last 90 days',
    historyRangeThisMonth: 'This month',
    historyRangeLastMonth: 'Last month',
    historyDateFrom: 'From',
    historyDateTo: 'To',
    historyDateHint: 'Select a start and end date',
    historyDateClear: 'Clear',
    historyDateApply: 'Apply',
    historyDateRangeDialog: 'Date range',

    shellNotFound: 'Issue {{issueId}} was not found.',
    shellPriority: 'Priority {{letter}}',
    shellEwsFlagged: 'EWS flagged',
    shellOwner: 'Owner · {{role}}',
    shellEditIssue: 'Edit issue',
    shellChangeStatus: 'Change status',
    shellCreateQir: 'Create QIR',

    /*
     * ─── Issue Lifecycle stepper ─────────────────────────────────────────────
     *
     * THE FIVE STAGE NAMES ARE NOT HERE, and that is deliberate. They come from
     * the ui-library's `STATUS` map, which is the one definition of what a
     * status is called; copying them into this namespace would create a second
     * set of words for the same thing that only one surface uses.
     *
     * The three state words are the prototype's own (`statusLabel` in its
     * lifecycle tracker) and are read by screen readers only — the visual card
     * carries the same information in colour, fill and glyph.
     */
    lifecycleTitle: 'Issue Lifecycle',
    lifecycleCurrent: 'Current stage:',
    lifecycleStateCompleted: 'Completed',
    lifecycleStateCurrent: 'Current stage',
    lifecycleStateUpcoming: 'Not yet reached',
    /*
     * The prototype invents a date and an author for a stage its log does not
     * cover. This app shows real issues, so it says this instead — see the
     * "WHAT THIS DOES NOT INVENT" note in `IssueDetails/issue-detail/lifecycle.ts`.
     */
    lifecycleNoRecord: 'The issue passed through this stage, but no transition is recorded in the audit trail.',
    lifecycleClose: 'Close stage details',

    statusModalTitle: 'Change issue status',
    statusModalSubtitle: 'A valid reason is required for every status change.',
    statusModalCancel: 'Cancel',
    statusModalSave: 'Save status change',
    statusModalCurrentStatus: 'Current status',
    /** `<b>` rides in the message, rendered via `<Trans>` — the status was bolded before. */
    statusModalTerminal: 'This issue is <b>{{status}}</b> and its status cannot be changed any further.',
    statusModalNewStatus: 'New status *',
    statusModalReason: 'Reason / comment *',

    qirModalCancel: 'Cancel',
    qirModalCreate: 'Create QIR',
    /** Was four fragments around an id and a `<b>`; one sentence now. */
    qirModalBody:
      'Escalates {{issueId}} to the QIR module. The issue becomes <b>Escalated</b>; the QIR reference will appear read-only in Resolution. The QIR module owns what happens next.',
    qirModalReason: 'Escalation reason * (min 20 characters)',

    editModalCancel: 'Cancel',
    editModalSave: 'Save changes',
    editModalTitle: 'Issue title *',
    editModalDescription: 'Description *',
    editModalDtc: 'DTC / trouble code',
    editModalDtcHint: '· optional · comma-separated',

    linksModalTitle: 'Manage Related Issues',
    linksModalSubtitle: 'Review, unlink, and link Parent/Child issues. All changes apply together on Save.',
    linksModalCancel: 'Cancel',
    linksModalSave: 'Save changes',
    linksModalCurrentHeading: 'Current Related Issues',
    linksModalEmpty: 'This issue has no related Parent/Child issues.',
    linksModalUnlink: 'Unlink',
    linksModalCandidatesHeading: 'Link Another Issue',
    linksModalLink: 'Link',

    /*
     * ─── PARENT/CHILD ROLES ────────────────────────────────────────────────────
     * Derived from registration order, never assigned — see `store.relKind`.
     */
    linksModalParent: 'Parent',
    linksModalChild: 'Child',

    /*
     * ─── LINKING BY ISSUE ID ───────────────────────────────────────────────────
     *
     * ⚠️ THERE IS NO CANDIDATE LIST, AND THAT IS THE DESIGN'S CHOICE. This modal
     * used to offer `store.correlations()` suggestions; the canonical offers only
     * an Issue-ID box (`mlQueryWs` / `mlLink(ws)`). A suggested candidate list
     * invites adding issues to a Parent/Child group on the strength of a
     * classification overlap, which is a weaker basis than a person naming the id.
     *
     * Every message below is the canonical's own wording.
     */
    linksModalSearchLabel: 'Issue ID',
    linksModalSearchPlaceholder: 'e.g. CL-260045',
    linksModalErrEmpty: 'Enter an Issue ID to link.',
    linksModalErrInvalid: 'Enter a valid Issue ID (e.g. CL-260045).',
    linksModalErrNotFound: 'No issue found with ID “{{id}}”.',
    linksModalErrSelf: 'You cannot link an issue to itself.',
    linksModalErrAlready: '{{id}} is already related to this issue.',
    linksModalErrPending: '{{id}} is already pending link.',
    linksModalPendingLink: 'Pending link',
    linksModalPendingUnlink: 'Pending unlink',
    linksModalUndo: 'Undo',

    linksModalFootnote: 'Links notify both owners; unlink is a soft delete recorded in the audit trail.',

    /*
     * ─── The prototype's own vocabulary for this modal ───────────────────────
     *
     * Every string below is lifted verbatim from the "MANAGE RELATED ISSUES
     * MODAL (Issue Workspace)" block in `docs/ux-prototype/PQMS-2.html`.
     *
     * ⚠️ THE IMPACT SENTENCES ARE NOT HERE. They live in
     * `features/issues/linking/relatedIssues.ts`, because CHOOSING between them
     * is a three-way branch over two counts — logic, not copy. A component that
     * merely picks a key would leave that decision spread over two files.
     */
    linksModalClose: 'Close',
    linksModalGroupPill: 'Issue Group · {{group}}',
    linksModalGroupCount_one: '{{count}} Issue',
    linksModalGroupCount_other: '{{count}} Issues',
    linksModalGroupNote:
      'These issues are currently linked as one issue group. Changes made below will update the group when you save.',
    linksModalRemove: 'Remove',
    linksModalUnlinkJustification: 'Unlink justification',
    linksModalLinkJustification: 'Link justification',
    linksModalJustifyPlaceholder: 'Enter justification...',

    linksModalSearchToggle: 'Search & Link Another Issue',
    linksModalSearchPanelTitle: 'Search & link existing issue',
    linksModalSearchClose: 'Close search',
    linksModalSearchBoxPlaceholder: 'Search by Issue ID, title or keyword…',
    linksModalSearchIdle: 'Search by Issue ID, title or keyword to find and link an existing issue.',
    linksModalSearchNone: 'No issues match “{{query}}”. Try a different Issue ID, title or keyword.',
    linksModalResultsHeading: 'Search results',
    linksModalResultCount_one: '{{count}} issue',
    linksModalResultCount_other: '{{count}} issues',
    linksModalResultMeta: 'Model: {{model}}  ·  Classification: {{classification}}',
    linksModalViewHistory: 'View History',

    linksModalParentWarnTitle: 'Parent issue will change',
    linksModalParentWarnBody:
      '{{next}} will become the new Parent because it has the earliest Issue Date ({{date}}). The current Parent, {{current}}, will become a Child.',

    editFormTitle: 'Edit Issue',
    editFormCancel: 'Cancel',
    editFormSave: 'Save changes',
    editFormVehicle: 'Vehicle Information',
    /** ICU variants — the list of codes can be one or several. */
    editFormYearRequired_one: 'Select at least one model year for {{codes}}.',
    editFormYearRequired_other: 'Select at least one model year for {{codes}}.',
    editFormClassification: 'System Classification',
    editFormSameExisting: 'Same existing issues',

    /*
     * ─── SAME EXISTING ISSUES, the RANKED half ───────────────────
     *
     * The section headed `editFormSameExisting` used to contain only
     * the SEARCH block, so the heading promised suggestions the
     * screen never made. These belong to the ranked half.
     *
     * Every one of these labels sits on a PERSISTED mutation: on this
     * surface the issue exists, so a link or unlink is audited and
     * carries a mandatory reason.
     */
    sameSuggestTitle: 'Same existing issues',
    sameSuggestSubtitle:
      'Ranked against the classification as you edit it. Linking and unlinking here are recorded immediately.',
    sameSuggestEmpty: 'No similar issues match the current classification.',
    sameLink: 'Link to issue',
    sameLinkGroup: 'Link to issue group',
    sameGroupOf: 'Issue group · {{count}}',
    sameRemoveMember: 'Remove from group',
    sameConfirmLink: 'Confirm link',
    sameConfirmUnlink: 'Confirm removal',
    sameJustifyLink: 'Justification for linking',
    sameJustifyUnlink: 'Justification for removing',

    editFormIssueInformation: 'Issue Information',
    editFormIssueTitle: 'Issue title *',
    editFormDescription: 'Description *',
    editFormDtc: 'DTC / trouble codes',
    editFormDtcHint: 'Comma-separated. P·Powertrain B·Body C·Chassis U·Network.',
    editFormIssueSource: 'Issue Source',
  },
}

registerMessages(NS, messages)

/** For tests — see 09. */
export default messages

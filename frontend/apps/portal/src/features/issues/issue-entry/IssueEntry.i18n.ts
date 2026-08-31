import { registerMessages, type ComponentI18nMessages } from '@/i18n'

/**
 * Issue Entry messages — the registration screen and its three modals.
 *
 * ⚠️ ONE NAMESPACE FOR THE SCREEN AND ITS MODALS, not one per file. 09 says
 * "one `.i18n.ts` per component", and the modals in `issue-entry/modals.tsx` are
 * not independent components: they exist only to be opened by this screen, hold
 * none of their own state, and share its vocabulary. Splitting them would give
 * three namespaces that can only ever be used together, and three places to look
 * for one screen's words.
 */

export const NS = 'IssueEntry'

const messages: ComponentI18nMessages = {
  en: {
    title: 'New issue',
    clear: 'Clear',
    register: 'Register Issue',

    sectionVehicle: 'Vehicle Information',
    sectionClassification: 'System Classification',
    sectionIssue: 'Issue Information',

    classificationPath: 'PATH',
    classificationModelCodeFirst: 'Select a Model Code in Vehicle information to enable classification.',
    classificationCannotFind: "Can't find the required classification?",
    classificationRequestNew: 'Request New',
    // ⚠️ The ` *` is part of the string here, while other required fields on this
    // screen use a styled span. Preserved from the pre-i18n code, not corrected.
    classificationSystem: 'System *',
    classificationSubSystem: 'Sub-system *',
    classificationComponent: 'Component *',
    classificationSymptom: 'Symptom *',
    classificationPendingApproval: 'Pending Approval',

    sameExistingTitle: 'Same Existing Issues',
    sameExistingSubtitle:
      'We found existing issues with similar system classification. Review the issue or issue group before linking.',
    sameExistingLinked: 'linked',
    sameExistingEmpty: 'No similar issues were found based on the current issue information.',
    sameExistingPreview: 'Preview',

    fieldTitle: 'Issue title *',
    fieldDescription: 'Description *',
    fieldDtc: 'DTC / trouble code',
    // The design's span reads '· optional · comma-separated' — verified against the
    // canonical prototype. 'comma-separated' describes what the user MAY TYPE
    // (comma commits a chip, alongside Enter/Tab/blur), not how the value is
    // stored, so the chip control did not make it inaccurate.
    fieldDtcOptional: '· optional · comma-separated',

    clearFormCancel: 'Cancel',
    clearFormConfirm: 'Clear form',
    clearFormBody:
      'This will reset the entire form back to blank — Issue Information, Vehicle Information, System Classification, and any linked issues. This can’t be undone.',

    submittedTitle: 'Issue created successfully',
    submittedBody: 'Your issue has been successfully created and is now open for processing.',
    submittedIssueId: 'Issue ID',
    submittedIssueTitle: 'Issue title',
    submittedStatus: 'Status',
    submittedStatusValue: 'Submitted · Open',
    submittedBackToList: 'Back to Issue List',
    submittedOpenWorkspace: 'Open Issue Workspace',

    /*
     * ICU variants replacing a hand-rolled plural that was split across two JSX
     * text nodes — `"field" … "need" … "attention."` — where whether it read
     * "field needs" or "fields need" could not be checked without mentally
     * reassembling the markup. One key per variant makes the whole sentence
     * readable, which is the point of 00's ban on hand-rolled pairs.
     */
    validationBanner_one: 'Cannot register this issue — {{count}} field needs attention.',
    validationBanner_other: 'Cannot register this issue — {{count}} fields need attention.',
  },
}

registerMessages(NS, messages)

/** For tests — see 09. Assert against `messages.en.someKey`, never a literal. */
export default messages

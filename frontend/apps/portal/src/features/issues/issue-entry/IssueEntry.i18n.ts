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

    /*
     * SHARED BY ALL THREE Cancel buttons on this screen — the clear-form modal,
     * the request-classification modal and the link confirmation.
     *
     * ⚠️ IT WAS `clearFormCancel`, AND RENAMING IT BROKE ALL THREE. The rename
     * deleted the old key and repointed the call sites in one pass and never
     * added the new one, so `parseMissingKeyHandler: (key) => key` rendered the
     * literal string "cancel" — lowercase — on every one of them. Nothing
     * failed: not the typecheck (t() takes any string), not lint:i18n (it
     * checks NAMESPACES, not keys), not the suite (no test asserted the exact
     * button text). See `tests/i18n/namespaces.test.tsx`, which now checks that
     * every t('key') in the app resolves against the namespace it is read from.
     */
    cancel: 'Cancel',

    sectionVehicle: 'Vehicle Information',
    sectionClassification: 'System Classification',
    sectionIssue: 'Issue Information',

    classificationCannotFind: "Can't find the required classification?",
    classificationRequestNew: 'Request New',
    classificationPendingApproval: 'Pending Approval',

    sameExistingTitle: 'Same Existing Issues',
    sameExistingSubtitle:
      'We found existing issues with similar system classification. Review the issue or issue group before linking.',
    sameExistingLinked: 'linked',
    sameExistingEmpty: 'No similar issues were found based on the current issue information.',

    fieldTitle: 'Issue title *',
    fieldDescription: 'Description *',
    fieldDtc: 'DTC / trouble code',
    // The design's span reads '· optional · comma-separated' — verified against the
    // canonical prototype. 'comma-separated' describes what the user MAY TYPE
    // (comma commits a chip, alongside Enter/Tab/blur), not how the value is
    // stored, so the chip control did not make it inaccurate.
    fieldDtcOptional: '· optional · comma-separated',

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
     * ─── SEARCH & LINK PANEL ────────────────────────────────────────
     *
     * `searchLinkExisting` is used TWICE — the panel's own heading and the
     * empty state's primary button — with the same words in both. One key, not
     * two: the design uses one phrase for one action, and a second key would let
     * the two drift apart silently.
     */
    searchLinkAnother: 'Search & link another issue',
    searchLinkExisting: 'Search & link existing issue',
    searchIdle: 'Search by Issue ID, title or keyword to find and link an existing issue or issue group.',
    searchNoMatch: 'No issues match “{{query}}”. Try a different Issue ID, title or keyword.',
    searchResults: 'Search results',
    /*
     * ICU variants replacing `{n} {n === 1 ? 'issue' : 'issues'}` — a hand-rolled
     * plural of exactly the kind 00 bans and `validationBanner` below already
     * exists to correct. The ds-gate could not see this one: it lives in a
     * ternary rather than JSX text, so it was never in the copy count.
     */
    searchCount_one: '{{count}} issue',
    searchCount_other: '{{count}} issues',

    /*
     * ─── BODY STATES ────────────────────────────────────────────────
     * The empty state's TITLE reuses `sameExistingEmpty` above rather than
     * restating it.
     */
    emptySub: 'You can still search the full issue register and link any existing issue to this one.',
    allLinkedTitle: 'All matched issues linked',
    allLinkedSub: 'Linked issues now appear in the panel on the right. Manage them there before submitting.',

    /* ─── REQUEST-NEW-CLASSIFICATION MODAL ───────────────────────── */
    requestSubmit: 'Submit Request',
    requestBody: 'Submit a request. Once approved, it will be added.',
    requestSymptomLabel: 'New symptom value *',
    requestSymptomNeedsComponent: '(select a component first)',

    /* ─── HISTORY MODAL ─────────────────────────────────────────── */
    historyEmpty: 'No history recorded for this issue yet.',

    /*
     * ─── LINK CONFIRMATION ───────────────────────────────────────
     * One key for a sentence that was split across two JSX text nodes around
     * `{linkConfirm?.label}`. The apostrophe is the STRAIGHT one, which is what
     * the JSX `&apos;` entity rendered and what the canonical uses throughout.
     */
    linkConfirmBody: "Linking {{label}} to this issue. Record why these belong together — it becomes part of the issue's history.",
    justificationLabel: 'Justification *',

    /*
     * ─── SUGGESTION / GROUP CARDS ──────────────────────────────────
     * Both cards live in `CreateIssueScreen.tsx` and are rendered only by it, so
     * they share the screen's namespace on the same reasoning as its modals.
     */
    cardStandalone: 'Standalone Issue',
    cardLinked: 'Linked',
    cardView: 'View',
    cardViewHistory: 'View History',
    /*
     * ⚠️ DISPLAY ONLY. 'Manually linked' is ALSO a sentinel value in
     * `reasons[]`, which `SuggestionCard` compares against to decide whether to
     * show this note INSTEAD of "Suggested because". That comparison is against
     * the untranslated marker in the data, not against this key — translating
     * the sentinel too would silently break the branch and show both lines.
     */
    cardManuallyLinked: 'Manually linked',
    cardSuggestedBecause: 'Suggested because: {{reasons}}',
    groupHeader: 'Issue Group · {{count}} Issues',
    /*
     * ⚠️ NAMES THE RELATIONSHIP, because two controls inches apart edit
     * DIFFERENT ones: the card's own button is a symmetric bulk link over every
     * member ("Link to Issue Group"), while this removes ONE member FROM the
     * group. A bare "Unlink" on both would be the same word for two things.
     */
    groupRemoveMember: 'Remove from group',
    groupRemoveLabel: 'Justification for removing',
    badgeParent: 'Parent',
    badgeChild: 'Child',

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

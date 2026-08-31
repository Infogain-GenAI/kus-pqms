import { registerMessages, type ComponentI18nMessages } from '@/i18n'

/**
 * The existing-issue popup's words.
 *
 * ⚠️ ITS OWN NAMESPACE, for the same reason as
 * `SystemClassificationPicker.i18n.ts`: this modal is SHARED. Issue Entry opens
 * it as `existingModal` and the Issue Workspace as `wsExistingModal`, so putting
 * its strings in `IssueEntry`'s bundle would make the workspace read a namespace
 * named after a screen it has nothing to do with.
 *
 * That is the distinction `IssueEntry.i18n.ts` draws when it keeps the entry
 * modals in the screen's namespace: those exist only to be opened by that one
 * screen. This one does not.
 */

export const NS = 'ExistingIssueModal'

const messages: ComponentI18nMessages = {
  en: {
    linkedPill: 'Linked',
    viewIssue: 'View Issue',

    /*
     * ONE KEY, THREE VALUES — previously four JSX nodes reading
     * `{model}`, ' · MY', `{modelYear}`, ' · Registered ', `{date}`.
     *
     * Split that way the separators were copy no translator could see as a
     * sentence, and the two text fragments counted as two hardcoded strings
     * while conveying nothing on their own. Same reasoning as the
     * `validationBanner` variants: if reassembling the markup in your head is
     * required to read the sentence, it is one string, not several.
     */
    meta: '{{model}} · MY{{year}} · Registered {{date}}',

    sectionClassification: 'Classification',
    sectionDescription: 'Issue description',
    sectionInvestigation: 'Investigation summary',
    sectionActions: 'Actions taken',
    sectionHistory: 'Related history',

    /*
     * Three DISTINCT empty states, deliberately not one shared "Nothing yet".
     * Each names the thing that is missing, which is what tells a reader whether
     * the issue was never investigated or merely never had actions logged.
     */
    investigationEmpty: 'No investigation activity recorded yet.',
    actionsEmpty: 'No actions recorded yet.',
    historyEmpty: 'No history recorded for this issue yet.',

    close: 'Close',
    unlink: 'Unlink issue',
    link: 'Link issue',
  },
}

registerMessages(NS, messages)

/** For tests — see 09. Assert against `messages.en.someKey`, never a literal. */
export default messages

import { registerMessages, type ComponentI18nMessages } from '@/i18n'

/**
 * Issue List messages.
 *
 * Per `09-i18n-and-localization.md`: one `.i18n.ts` per component, registering
 * its own namespace as a side effect of import, `en` only, ICU plural variants
 * rather than hand-rolled singular/plural keys.
 *
 * ⚠️ INTERPOLATION IS DOUBLE-BRACE — `{{count}}`, never `{count}`. Single braces
 * do not interpolate; they render literally, so `{count}` ships as visible
 * braces rather than an error. 09 calls this the most likely defect when
 * transcribing copy from the Vue app, where vue-i18n's single-brace syntax was
 * used throughout.
 */

/** The namespace. Written ONCE and exported, so the component cannot retype it. */
export const NS = 'IssueListScreen'

const messages: ComponentI18nMessages = {
  en: {
    title: 'Issue list',
    subtitle: 'Monitor, prioritize and manage product quality issues.',

    export: 'Export',
    newIssue: 'New issue',
    filter: 'Filter',
    columns: 'Columns',

    // Bulk bar.
    // ⚠️ Title case here, sentence case in `bulkStatusTitle`. Preserved from the
    // pre-i18n code rather than silently corrected — this pass moves copy.
    bulkChangeStatus: 'Change Status',
    bulkExport: 'Export',
    bulkAssignRole: 'Assign Role',
    bulkHint: 'Select rows to change status or export',

    assignRoleCancel: 'Cancel',
    /*
     * ICU plural variants, replacing a hand-rolled `n === 1 ? '' : 's'`.
     * 00-core-rules.md bans the hand-rolled form by name, and 09 gives the
     * reason that matters beyond tidiness: Korean's plural rules do not map onto
     * English's binary split, so a hand-rolled pair would need locale-specific
     * branching that variant selection handles for free.
     */
    /*
     * `<b>` IS PART OF THE MESSAGE, rendered through react-i18next's own `<Trans>`.
     * The count was bolded before this migration and still is; putting the tag in
     * the string is what lets a translator move the emphasis with the words
     * instead of the sentence being reassembled from three JSX fragments.
     */
    assignRoleBody_one:
      'Reassign <b>{{count}}</b> selected issue to a role. This changes who the issue is assigned to — the original owner is unchanged.',
    assignRoleBody_other:
      'Reassign <b>{{count}}</b> selected issues to a role. This changes who the issue is assigned to — the original owner is unchanged.',

    bulkStatusTitle: 'Change status',
    bulkStatusBody_one:
      'This will update {{count}} selected issue. A valid reason is required for every status change.',
    bulkStatusBody_other:
      'This will update {{count}} selected issues. A valid reason is required for every status change.',
    bulkStatusCancel: 'Cancel',
    bulkStatusSubmit_one: 'Update status for {{count}} selected issue',
    bulkStatusSubmit_other: 'Update status for {{count}} selected issues',
    bulkStatusNewStatus: 'New status',
    bulkStatusReason: 'Reason / comment',

    resultsCount: 'Showing <b>{{shown}}</b> of {{total}} issues',
    resultsRange: 'Showing <b>{{from}} - {{to}}</b> of <b>{{total}}</b> issues',
    resultsRows: 'Rows:',
    emptyTitle: 'No issues match these filters',
    emptyBody: 'Clear filters to see all issues in the queue.',
    clearFilters: 'Clear filters',

    filterReset: 'Reset',
    filterApply: 'Apply',
    filterIssueDate: 'Issue Date',
    filterDateSeparator: 'to',
    filterDaysOpen: 'Days open',
    filterLinkedIssues: 'Linked issues',
    filterEwsFlag: 'EWS flag',

    columnsRestoreDefault: 'Restore default',
    columnsApply: 'Apply',
    columnsDefault: 'Default columns',
    columnsOptional: 'Optional columns',
    columnsRequired: 'Required',
    columnsSelectAll: 'Select all',
  },
}

registerMessages(NS, messages)

/**
 * The default export is FOR TESTS, not for the component — 09 is explicit about
 * this. A test asserting on user-facing text asserts against `messages.en.someKey`
 * rather than a hardcoded string, so a reword breaks one place instead of many.
 */
export default messages

import { registerMessages, type ComponentI18nMessages } from '@/i18n'

/**
 * Words for the shared link/unlink justification controls.
 *
 * ⚠️ ONE NAMESPACE FOR THE CONTROLS, NOT ONE PER HOST SCREEN. The justification
 * box and the applied-reason summary are rendered by three different surfaces
 * (Manage Links, the issue-list modal, the edit form). Keys here rather than in
 * each host's namespace, because the alternative is the same English sitting
 * under three names — and the first version of this genuinely did that: the
 * applied-row markup and its "Link justified:" / "Edit" labels were duplicated
 * between two modals, one set as `IssueDetail` keys and the other as literals.
 *
 * Issue Entry does NOT read this namespace. Its justification is a pre-commit
 * modal with its own copy in `IssueEntry.i18n.ts`; it shares the RULE
 * (`@/data/linkJustification`) and nothing else.
 */

export const NS = 'LinkJustify'

const messages: ComponentI18nMessages = {
  en: {
    /*
     * "Apply" commits the JUSTIFICATION, not the relationship — Save does that.
     * The wording matters: the prototype notifies "Add a justification and Apply
     * to confirm <ID> as a pending link", so Apply confirms the reason and leaves
     * the change pending.
     */
    apply: 'Apply',
    cancel: 'Cancel',
    /*
     * The immediate surfaces name the action rather than saying "Apply", because
     * there is no later Save to confirm — pressing it commits.
     */
    confirmUnlink: 'Confirm unlink',

    appliedLink: 'Link justified:',
    appliedUnlink: 'Unlink justified:',
    edit: 'Edit',

    /*
     * Shown instead of leaving a disabled Save button unexplained. A gate the
     * user cannot see the reason for reads as a broken button.
     */
    saveBlocked: 'Every pending change needs a justification before saving.',

    boxPlaceholder:
      "Record why this relationship is being changed — it becomes part of the issue's audit trail.",
  },
}

registerMessages(NS, messages)

/** For tests — see 09. Assert against `messages.en.someKey`, never a literal. */
export default messages

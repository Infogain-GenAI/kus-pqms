import { registerMessages, type ComponentI18nMessages } from '@/i18n'

/**
 * System Classification picker — the PATH breadcrumb, the model-code hint and
 * the four cascading field labels.
 *
 * ⚠️ ITS OWN NAMESPACE, AND NOT `IssueEntry`'s, BECAUSE THIS COMPONENT IS SHARED.
 *
 * `IssueEntry.i18n.ts` argues that a modal existing only to be opened by one
 * screen belongs in that screen's namespace. This component is the other case:
 * Issue Entry AND `IssueEditForm` both render it, so folding its words into
 * either screen's bundle would make the other screen depend on a namespace named
 * for its sibling.
 *
 * ─── THESE KEYS WERE MOVED, NOT INVENTED ────────────────────────────────────
 *
 * `path` and `modelCodeFirst` were `classificationPath` and
 * `classificationModelCodeFirst` in `IssueEntry.i18n.ts`, and the four labels
 * were `classificationSystem` … `classificationSymptom`. They are here because
 * THE MARKUP MOVED HERE: Issue Entry used to build the breadcrumb, the hint and
 * four native `<Select>`s inline, and this component replaced all of it. The keys
 * follow the elements they name. Copying them instead would have left two keys
 * per string with identical English, which is the duplication this convention is
 * most exposed to — a translator changes one and the other silently survives.
 */

export const NS = 'SystemClassificationPicker'

const messages: ComponentI18nMessages = {
  en: {
    path: 'PATH',
    modelCodeFirst: 'Select a Model Code in Vehicle information to enable classification.',

    /*
     * ⚠️ THE ` *` IS PART OF THE STRING, carried over from `IssueEntry.i18n.ts`
     * where the same note stands: other required fields on these screens mark
     * themselves with a styled span instead. Preserved rather than corrected,
     * because the asterisk is load-bearing for the accessible name — the field
     * strips a trailing ` *` to build its `aria-label`, so "System *" is read as
     * "System" rather than "System star".
     */
    labelSystem: 'System *',
    labelSubSystem: 'Sub-system *',
    labelComponent: 'Component *',
    labelSymptom: 'Symptom *',
  },
}

registerMessages(NS, messages)

/** For tests — see 09. Assert against `messages.en.someKey`, never a literal. */
export default messages

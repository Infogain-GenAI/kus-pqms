import type { Issue } from '@/data/types'

/**
 * WHAT SAVING WILL DO — computed before the user commits to it.
 *
 * Ported from the prototype's `stManageRelated` block in
 * `docs/ux-prototype/PQMS-2.html/PQMS.html`: the "N Changes Pending" band, its
 * impact sentences, and the Parent-will-change warning.
 *
 * ⚠️ PURE, AND THAT IS THE POINT. The parent projection below is the only place
 * in the app that answers "who WILL be Parent after these edits" — a question
 * with no visible answer until after Save, when it is too late to reconsider.
 * Logic like that has to be testable without a modal, a store and a router, or
 * it gets verified by clicking and therefore not at all.
 */

export interface RelatedChange {
  id: string
  /** The relationship the change is being made against. */
  rel: 'Parent' | 'Child'
}

/**
 * The impact copy for a pending change set.
 *
 * THE SENTENCES ARE THE PROTOTYPE'S OWN, verbatim including their singular and
 * plural variants. They are here rather than in the i18n namespace because
 * choosing BETWEEN them is logic — three branches over two counts — and a
 * component that picks a message key is doing the same work with the decision
 * spread across two files.
 */
export interface RelatedImpact {
  /** `2 Changes Pending` — the band's own heading. */
  countLabel: string
  /** The bolded lead sentence. Empty when linking and unlinking are mixed. */
  head: string
  body: string
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

export function relatedImpact(toLink: RelatedChange[], toUnlink: RelatedChange[]): RelatedImpact {
  const links = toLink.length
  const unlinks = toUnlink.length
  const total = links + unlinks
  const countLabel = `${total} ${plural(total, 'Change', 'Changes')} Pending`

  if (links > 0 && unlinks === 0) {
    return {
      countLabel,
      head: plural(
        links,
        'Linking this issue will add it to the current issue group.',
        'Linking these issues will add them to the current issue group.',
      ),
      body: plural(
        links,
        'The selected issue will become part of the same issue group as the current related issues. This change will take effect when you click Save Changes.',
        'The selected issues will become part of the same issue group as the current related issues. These changes will take effect when you click Save Changes.',
      ),
    }
  }

  if (unlinks > 0 && links === 0) {
    return {
      countLabel,
      head: plural(
        unlinks,
        'Unlinking this issue will remove it from the issue group.',
        'Unlinking these issues will remove them from the issue group.',
      ),
      body: plural(
        unlinks,
        'The selected issue will no longer be part of this issue group after you save the changes. The remaining related issues will stay grouped together.',
        'The selected issues will no longer be part of this issue group after you save the changes. The remaining related issues will stay grouped together.',
      ),
    }
  }

  /*
   * MIXED: NO LEAD SENTENCE, and that is deliberate in the source. Neither
   * "linking will add" nor "unlinking will remove" is the whole truth when both
   * are pending, so the band states the counts instead of picking a side.
   */
  return {
    countLabel,
    head: '',
    body:
      `${links} ${plural(links, 'issue', 'issues')} will be added to this issue group and ` +
      `${unlinks} ${plural(unlinks, 'issue', 'issues')} will be removed from the issue group. ` +
      'These changes will take effect when you click Save Changes.',
  }
}

/**
 * Who will be Parent once these edits are saved.
 *
 * ─── WHY THIS WARNING EXISTS ─────────────────────────────────────────────────
 *
 * Parent is NOT a stored field and never was — it is the earliest-registered
 * member of the group (`store.groupMembers` orders on that, and `groupEdits.ts`
 * re-derives it after every removal). So linking an OLDER issue silently demotes
 * the current Parent, and unlinking the Parent silently promotes whoever is next.
 * Both happen on Save, both are invisible beforehand, and both change which
 * issue the rest of the app treats as the group's head.
 *
 * Projecting it here is what lets the modal say so BEFORE the user commits.
 *
 * ⚠️ THE ORDERING KEY IS `reportedDate`, matching `store.groupMembers`. The
 * prototype sorts on its own `_registeredMs`; using a different field here would
 * make the warning disagree with the outcome it is warning about — which is
 * worse than no warning, because it would be trusted.
 */
export interface ParentProjection {
  /** The Parent as things stand. */
  currentParentId: string
  /** The Parent after the pending edits, or null when no group survives. */
  nextParentId: string | null
  /** True only when a group of two or more survives AND its head changes. */
  willChange: boolean
}

export function projectParent(
  currentMembers: readonly Issue[],
  removedIds: readonly string[],
  addedMembers: readonly Issue[],
): ParentProjection {
  const currentParentId = currentMembers[0]?.id ?? ''
  const removed = new Set(removedIds)

  const projected = currentMembers.filter((m) => !removed.has(m.id))
  for (const add of addedMembers) {
    if (!projected.some((m) => m.id === add.id)) projected.push(add)
  }
  projected.sort((a, b) => (a.reportedDate < b.reportedDate ? -1 : a.reportedDate > b.reportedDate ? 1 : 0))

  const nextParentId = projected[0]?.id ?? null
  return {
    currentParentId,
    nextParentId,
    // A single survivor is not a group at all — `planGroupEdits` dissolves it —
    // so there is no Parent to warn about.
    willChange: projected.length >= 2 && nextParentId !== null && nextParentId !== currentParentId,
  }
}

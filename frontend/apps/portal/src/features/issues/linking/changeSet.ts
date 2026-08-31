/**
 * What a draft/commit link editor is about to change.
 *
 * ─── WHY THIS IS SHARED AND NOT COMPUTED TWICE ───────────────────────────────
 *
 * Both draft/commit surfaces — Manage Links and the issue-list modal — derived
 * `additions`, `removals` and `changedIds` with identical inline code. That
 * duplication produced a real, reachable defect, so it is worth naming:
 *
 *   Manage Links was fixed to keep a PENDING UNLINK visible (its row is where
 *   the justification lives, so a vanished row is an unfinishable change). The
 *   issue-list modal was not, because it filtered rows through a separate
 *   `visible` predicate that knew about `draft` and match-reasons but had no
 *   concept of "this id is a pending change".
 *
 * The consequence there was not a bypass — the gate held, `allApplied` stayed
 * false and Save stayed disabled. It was the opposite: a committed link with no
 * match-field overlap, once unchecked, lost its checkbox AND its justification
 * box, so the user could neither complete the unlink nor withdraw it, and every
 * other pending change in the session was blocked with it. The only way out was
 * closing the modal, which discarded the lot.
 *
 * ⚠️ SO `changedIds` IS THE ROW-VISIBILITY CONTRACT, not just an audit input. Any
 * surface that hides rows must keep showing anything in this set.
 *
 * Order is removals-then-additions so a batch reads the way the design's own
 * list does: what is going away, then what is arriving.
 */
export interface LinkChangeSet {
  additions: string[]
  removals: string[]
  /** Every id whose relationship state differs between `committed` and `draft`. */
  changedIds: string[]
}

export function linkChangeSet(committed: readonly string[], draft: readonly string[]): LinkChangeSet {
  const additions = draft.filter((id) => !committed.includes(id))
  const removals = committed.filter((id) => !draft.includes(id))
  return { additions, removals, changedIds: [...removals, ...additions] }
}

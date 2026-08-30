import { useMemo } from 'react'
import type { StatusKey } from '@pqms/ui-library'

/**
 * THE CLOSED-ISSUE LOCK — one derivation, one place, every write surface.
 *
 * Ported from `composables/useIssueLock.ts` in the Vue app, where it is the
 * single source that every Epic 4 tab gates its mutating controls on.
 *
 * ─── WHY THIS EXISTS AS A MODULE AND NOT AS A LINE OF CODE PER SCREEN ────────
 *
 * "A Closed issue is read-only" is the most repeated rule in the product and the
 * easiest to get subtly wrong, because getting it wrong is INVISIBLE: a missing
 * gate does not throw, it just quietly lets someone write to a record that is
 * supposed to be settled. Before this file, the rule was re-derived per screen
 * and, measurably, was not applied consistently — the Investigation section
 * passed `canPropose` straight through as its edit gate with no status check at
 * all, so on a Closed issue a proposer could still record activities, raise part
 * requests and file change requests.
 *
 * ─── STATUS ONLY. NO ROLE, NO CAPABILITY. ────────────────────────────────────
 *
 * The lock is a PURE STATUS DERIVATION and deliberately knows nothing about who
 * is looking: Closed is terminal for every role alike. That separation is what
 * makes it composable — a surface asks `can('propose') && lock.isEditable`, and
 * the two halves stay independently correct. Folding a capability check in here
 * would give one flag two reasons to be false and put us straight back to
 * re-deriving the rule at each call site to find out which.
 *
 * It is also why this is NOT an RBAC bypass of Tier 0's "gate on capability,
 * never on role": the lock is not an authorisation check. It answers "is this
 * record still writable at all", which is upstream of "may this person write".
 *
 * ─── `isEditable` IS NOT THE NEGATION OF `isClosed` ──────────────────────────
 *
 * A missing issue is not editable either, and the two are separate questions to
 * a caller: an absent record must not offer write controls, but it also must not
 * be told "this issue is closed" — it is not closed, it is not there. Callers
 * that only ever hold a loaded issue can ignore the distinction; the workspace
 * shell renders its own not-found branch above every section, which is why the
 * sections can treat `issue` as present.
 *
 * ─── ONE DIVERGENCE FROM VUE, RECORDED DELIBERATELY ──────────────────────────
 *
 * Vue REMOVES the status-change trigger on a Closed issue (its header comment
 * calls this "absent, not merely de-emphasized"). This app DISABLES it and
 * states the rule once, in a banner on the shell. The reason is that this app's
 * status modal already carries an explanation for terminal statuses, and hiding
 * the only path to that explanation trades a clear "you cannot, and here is why"
 * for a silent absence the user has to infer. Disabled-with-a-reason is the
 * stronger affordance, and the lock is what makes it consistent.
 *
 * NOTE the two vocabularies are not the same size: this app's status set also has
 * `outofscope` (NASO), which the status modal treats as terminal for the purpose
 * of further transitions. That is the MODAL's own rule and is left exactly as it
 * was. The lock is `closed` and only `closed`, matching Vue — widening it here
 * would silently make NASO issues read-only everywhere, which nothing has asked
 * for and which no screen currently does.
 */

/** The minimum an issue has to be for the lock to read it. */
export interface LockableIssue {
  status: StatusKey
}

export interface IssueLock {
  /** The issue exists and its status is `closed`. */
  isClosed: boolean
  /** The issue exists and is not closed — the gate every write surface ANDs into its own. */
  isEditable: boolean
}

/**
 * Per-surface copy for the Closed state.
 *
 * ─── WHY THE WORDING IS PER SURFACE AND NOT ONE SHARED SENTENCE ──────────────
 *
 * Each note names the action the reader was about to take, because that is the
 * question they are actually asking when they find a disabled button. "This
 * issue is closed" alone leaves them to work out whether the greyed control is
 * the lock or their own permissions. The wording is carried over verbatim from
 * the Vue i18n files so the two apps say the same thing.
 *
 * ⚠️ THESE ARE FOR THE CLOSED LOCK ONLY. Do not reuse them as a generic
 * disabled-note: two of these strings were already in this codebase, rendered
 * on `!canEdit`, which meant a read-only ROLE looking at an OPEN issue was told
 * the issue was closed. The lock is what lets each note fire on the condition it
 * actually describes.
 */
export const CLOSED_NOTES = {
  activity: 'This issue is closed — recording new activities is disabled.',
  partRequest: 'This issue is closed — raising new part requests is disabled.',
  conversation: 'This issue is closed — the conversation is read-only.',
  /** The shell banner: states the rule once for the whole workspace. */
  workspace: 'This issue is closed. It is read-only — no further changes can be recorded.',
} as const

/**
 * The derivation. Pure, so it is testable and usable outside React — the store
 * and any future route guard can read the same rule the screens read.
 */
export function issueLock(issue: LockableIssue | null | undefined): IssueLock {
  const isClosed = issue?.status === 'closed'
  return { isClosed, isEditable: issue != null && !isClosed }
}

/**
 * Hook form, for components.
 *
 * Memoised on the status alone rather than on the issue object: the store hands
 * back a fresh object on every mutation, so keying on identity would produce a
 * new lock on every unrelated edit and re-render every surface that reads it.
 */
export function useIssueLock(issue: LockableIssue | null | undefined): IssueLock {
  const status = issue?.status
  return useMemo(() => issueLock(status ? { status } : null), [status])
}

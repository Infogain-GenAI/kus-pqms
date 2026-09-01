import { useOutletContext } from 'react-router'
import type { IssueLock } from '@/data/issueLock'
import type { Comment, Issue } from '@/data/types'

export type WorkspaceModal = '' | 'status' | 'qir' | 'edit' | 'links'

/**
 * What the Workspace shell passes down to whichever section is routed.
 *
 * WHY OUTLET CONTEXT AND NOT PROPS: the sections are now sibling ROUTES, so the
 * shell no longer renders them directly — it renders an `<Outlet />` and the
 * router decides which one. Outlet context is React Router's own mechanism for
 * exactly this, and it keeps the derivations that all five sections share (the
 * issue lookup, the capability checks, the modal openers) computed ONCE in the
 * shell rather than re-derived per section.
 *
 * THE FIELD SET IS DELIBERATELY SMALL, and stays that way. It holds only what
 * the shell already had to compute for its own header and cannot be re-derived
 * cheaply in a section — `issue` (the shell has already handled the not-found
 * case, so sections can treat it as present), the two capability flags, the
 * filtered comment list the tab badge counts, and `openModal` because the modals
 * are the shell's, mounted above the Outlet.
 *
 * Everything else a section needs it fetches itself via `useStore()` /
 * `useRole()`, exactly as the tab components did before the split. That keeps
 * this from growing into a second, untyped state container hanging off the
 * router — the failure 07 warns about for route metadata, and the same warning
 * applies here.
 */
export interface WorkspaceContext {
  /** The issue. The shell renders its own not-found branch, so this is never undefined here. */
  issue: Issue
  issueId: string
  /** can('propose') — editing an issue's details is not narrowed by ownership or status. */
  canEditIssue: boolean
  /** can('propose') — the broader "may contribute" gate the sections use. */
  canPropose: boolean
  /**
   * The Closed-issue lock. See `@/data/issueLock`.
   *
   * IT IS NOT A THIRD PERMISSION FLAG and does not replace the two above. It is
   * the orthogonal half of every write gate: capability answers "may this person
   * write", the lock answers "is this record still writable at all". A surface
   * ANDs both — `canPropose && lock.isEditable` — and keeping them separate is
   * what lets a disabled control say WHICH of the two stopped it.
   *
   * It is in the context rather than derived per section for the reason the rest
   * of this field set exists: computed once in the shell, so five sections
   * cannot drift. `canEditIssue` deliberately does NOT AND the lock in — editing
   * an issue's own details stays open on a Closed issue — but Investigation,
   * Communication and the linked-issues control all gate on `canPropose &&
   * lock.isEditable`.
   */
  lock: IssueLock
  /** May propose AND the issue is scored — any status. V4-V5: an issue's priority is the QIR's. */
  canQir: boolean
  /** Visible comments only (hidden ones filtered), shared with the tab-strip badge. */
  comments: Comment[]
  openModal: (modal: WorkspaceModal) => void
  /**
   * Whether the Detail section is in full-page edit mode.
   *
   * THIS IS SHELL STATE, NOT SECTION STATE, and that is why it is here rather
   * than a `useState` inside DetailSection. Edit is entered from the shell's own
   * header button, and while it is open the shell suppresses that button — so
   * both ends need to read it. A flag owned by the section could be set by the
   * shell but never read back by it.
   *
   * It is deliberately NOT a route. The five sections are routes because a
   * section is a place; edit is a mode of one section, and giving it a URL would
   * mean a bookmark could land a user in an editor for an issue they may no
   * longer be allowed to edit.
   */
  editing: boolean
  onEditingChange: (editing: boolean) => void
}

/**
 * Typed accessor for the section context. Read it through this, never by casting
 * `useOutletContext()` at the call site — one place to type it, one place for a
 * future "no context" case to be decided.
 */
export function useWorkspace(): WorkspaceContext {
  return useOutletContext<WorkspaceContext>()
}

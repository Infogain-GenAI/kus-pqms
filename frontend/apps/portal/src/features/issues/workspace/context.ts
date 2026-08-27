import { useOutletContext } from 'react-router-dom'
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
  /** can('propose') && owns the issue && status === 'open' — the shell's own gate. */
  canEditIssue: boolean
  /** can('propose') — the broader "may contribute" gate the sections use. */
  canPropose: boolean
  /** Not escalated/closed, may propose, AND the issue is scored. V4-V5: an issue's priority is the QIR's. */
  canQir: boolean
  /** Visible comments only (hidden ones filtered), shared with the tab-strip badge. */
  comments: Comment[]
  openModal: (modal: WorkspaceModal) => void
}

/**
 * Typed accessor for the section context. Read it through this, never by casting
 * `useOutletContext()` at the call site — one place to type it, one place for a
 * future "no context" case to be decided.
 */
export function useWorkspace(): WorkspaceContext {
  return useOutletContext<WorkspaceContext>()
}

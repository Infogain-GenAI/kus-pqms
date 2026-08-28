import { ResolutionTab } from './IssueDetails/tabs/ResolutionTab/ResolutionTab'
import { useWorkspace } from './context'

// Route target for /issues/:id/resolution.
//
// WHAT THIS FILE IS NOW. It was a two-column grid holding Disposition and
// Related QIR inline. Those became panels under IssueDetails/resolution/, ported
// from the Vue implementation, alongside the two workstreams this app had
// nowhere to put — Countermeasures and Related Publication.
//
// The Disposition panel is built but PARKED — it has no card in the selector, on
// request. See resolution.ts for what that costs and how to restore it.
//
// This file is the route boundary: it reads the workspace context and hands the
// issue, the QIR gate and the modal opener down. All three were already shell
// concerns; none of them became section state.

export function ResolutionSection() {
  const { issue, canQir, openModal } = useWorkspace()
  return (
    <ResolutionTab issue={issue} canQir={canQir} onCreateQir={() => openModal('qir')} />
  )
}
